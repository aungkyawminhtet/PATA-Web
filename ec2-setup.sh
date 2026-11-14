#!/usr/bin/env bash
#
# ec2-setup.sh
# Run this script on a fresh Amazon Linux 2023 / Ubuntu 22.04+ EC2 instance.
# It installs Docker, pulls the app image, and starts it behind an Nginx
# reverse proxy with automatic HTTPS (optional).
#
# Usage (on the EC2 instance):
#   chmod +x ec2-setup.sh
#   sudo REGISTRY=123456789.dkr.ecr.ap-southeast-1.amazonaws.com \
#        IMAGE_NAME=pata-frontend \
#        IMAGE_TAG=latest \
#        DOMAIN=pata.example.com \        # optional — enables HTTPS via certbot
#        ./ec2-setup.sh
#
set -euo pipefail

# ─── Configuration ───────────────────────────────────────────────────────────
REGISTRY="${REGISTRY:-}"
IMAGE_NAME="${IMAGE_NAME:-pata-frontend}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
CONTAINER_NAME="${CONTAINER_NAME:-pata-frontend}"
APP_PORT="${APP_PORT:-3000}"
HOST_PORT="${HOST_PORT:-3000}"
DOMAIN="${DOMAIN:-}"          # set to enable Nginx + HTTPS
ENV_FILE="${ENV_FILE:-.env}"  # optional env file to pass into the container
# ─────────────────────────────────────────────────────────────────────────────

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

if [[ -z "$REGISTRY" ]]; then
  error "REGISTRY is not set. Export it before running this script."
  exit 1
fi

FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

# ─── Detect OS ───────────────────────────────────────────────────────────────
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS_ID="$ID"
else
  OS_ID="unknown"
fi

info "Detected OS: $OS_ID"

# ─── 1. Install Docker ──────────────────────────────────────────────────────
install_docker() {
  if command -v docker &>/dev/null; then
    info "Docker already installed: $(docker --version)"
    return
  fi

  info "Installing Docker …"
  case "$OS_ID" in
    amzn)
      yum update -y
      yum install -y docker
      ;;
    ubuntu|debian)
      apt-get update -y
      apt-get install -y ca-certificates curl gnupg
      install -m 0755 -d /etc/apt/keyrings
      curl -fsSL https://download.docker.com/linux/$OS_ID/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
      chmod a+r /etc/apt/keyrings/docker.gpg
      echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
        https://download.docker.com/linux/$OS_ID $(lsb_release -cs) stable" \
        > /etc/apt/sources.list.d/docker.list
      apt-get update -y
      apt-get install -y docker-ce docker-ce-cli containerd.io
      ;;
    *)
      error "Unsupported OS for automatic Docker install: $OS_ID"
      exit 1
      ;;
  esac

  systemctl enable --now docker
  usermod -aG docker ec2-user 2>/dev/null || usermod -aG docker ubuntu 2>/dev/null || true
  info "Docker installed: $(docker --version)"
}

# ─── 2. Install AWS CLI (for ECR login) ─────────────────────────────────────
install_awscli() {
  if command -v aws &>/dev/null; then
    info "AWS CLI already installed."
    return
  fi

  info "Installing AWS CLI v2 …"
  curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
  unzip -qo /tmp/awscliv2.zip -d /tmp
  /tmp/aws/install
  rm -rf /tmp/aws /tmp/awscliv2.zip
  info "AWS CLI installed: $(aws --version)"
}

# ─── 3. Authenticate to ECR ─────────────────────────────────────────────────
ecr_login() {
  if [[ "$REGISTRY" == *".dkr.ecr."*".amazonaws.com" ]]; then
    REGION=$(echo "$REGISTRY" | sed -E 's/.*\.dkr\.ecr\.(.+)\.amazonaws\.com/\1/')
    info "Logging in to ECR ($REGION) …"
    install_awscli
    aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$REGISTRY"
  else
    info "Non-ECR registry — make sure you are already logged in."
  fi
}

# ─── 4. Pull & Run the container ────────────────────────────────────────────
deploy_container() {
  info "Pulling $FULL_IMAGE …"
  docker pull "$FULL_IMAGE"

  # Stop old container if running
  if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    info "Stopping existing container: $CONTAINER_NAME"
    docker stop  "$CONTAINER_NAME" 2>/dev/null || true
    docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
  fi

  # Build docker run command
  RUN_ARGS=(
    -d
    --name "$CONTAINER_NAME"
    --restart unless-stopped
    -p "${HOST_PORT}:${APP_PORT}"
  )

  # Pass env file if it exists
  if [[ -f "$ENV_FILE" ]]; then
    info "Loading environment from $ENV_FILE"
    RUN_ARGS+=(--env-file "$ENV_FILE")
  fi

  info "Starting container …"
  docker run "${RUN_ARGS[@]}" "$FULL_IMAGE"

  info "Container '$CONTAINER_NAME' is running on port $HOST_PORT"
}

# ─── 5. (Optional) Nginx reverse proxy + HTTPS ──────────────────────────────
setup_nginx() {
  if [[ -z "$DOMAIN" ]]; then
    warn "DOMAIN not set — skipping Nginx/HTTPS setup."
    warn "App is accessible directly at http://<ec2-public-ip>:${HOST_PORT}"
    return
  fi

  info "Setting up Nginx reverse proxy for $DOMAIN …"

  case "$OS_ID" in
    amzn)  yum install -y nginx ;;
    ubuntu|debian) apt-get install -y nginx ;;
  esac

  # Write Nginx config
  cat > /etc/nginx/conf.d/pata-frontend.conf <<NGINX_EOF
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass         http://127.0.0.1:${HOST_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Upgrade           \$http_upgrade;
        proxy_set_header   Connection        "upgrade";
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX_EOF

  # Remove default site if it exists
  rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

  nginx -t
  systemctl enable --now nginx
  systemctl reload nginx

  info "Nginx is proxying $DOMAIN → localhost:${HOST_PORT}"

  # ── Certbot (Let's Encrypt) ──
  info "Installing Certbot for HTTPS …"
  case "$OS_ID" in
    amzn)
      yum install -y certbot python3-certbot-nginx
      ;;
    ubuntu|debian)
      apt-get install -y certbot python3-certbot-nginx
      ;;
  esac

  info "Requesting TLS certificate for $DOMAIN …"
  certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --redirect \
    --email "admin@${DOMAIN}" || {
    warn "Certbot failed — HTTPS not configured. You can retry manually:"
    warn "  sudo certbot --nginx -d $DOMAIN"
  }

  # Auto-renew cron
  echo "0 3 * * * root certbot renew --quiet" > /etc/cron.d/certbot-renew
  info "HTTPS setup complete. Cert auto-renews daily at 3 AM."
}

# ─── 6. Convenience deploy script for updates ───────────────────────────────
create_redeploy_script() {
  cat > /usr/local/bin/pata-redeploy <<'REDEPLOY_EOF'
#!/usr/bin/env bash
# Quick redeploy: pulls the latest image and restarts the container.
set -euo pipefail

REGISTRY="${REGISTRY:-__REGISTRY__}"
IMAGE_NAME="${IMAGE_NAME:-__IMAGE_NAME__}"
IMAGE_TAG="${IMAGE_TAG:-__IMAGE_TAG__}"
CONTAINER_NAME="${CONTAINER_NAME:-__CONTAINER_NAME__}"
APP_PORT="${APP_PORT:-__APP_PORT__}"
HOST_PORT="${HOST_PORT:-__HOST_PORT__}"
ENV_FILE="${ENV_FILE:-.env}"

FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

# ECR login
if [[ "$REGISTRY" == *".dkr.ecr."*".amazonaws.com" ]]; then
  REGION=$(echo "$REGISTRY" | sed -E 's/.*\.dkr\.ecr\.(.+)\.amazonaws\.com/\1/')
  aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$REGISTRY"
fi

docker pull "$FULL_IMAGE"
docker stop  "$CONTAINER_NAME" 2>/dev/null || true
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

RUN_ARGS=(-d --name "$CONTAINER_NAME" --restart unless-stopped -p "${HOST_PORT}:${APP_PORT}")
[[ -f "$ENV_FILE" ]] && RUN_ARGS+=(--env-file "$ENV_FILE")

docker run "${RUN_ARGS[@]}" "$FULL_IMAGE"
echo "✅ Redeployed $FULL_IMAGE"
REDEPLOY_EOF

  # Substitute actual values
  sed -i \
    -e "s|__REGISTRY__|${REGISTRY}|g" \
    -e "s|__IMAGE_NAME__|${IMAGE_NAME}|g" \
    -e "s|__IMAGE_TAG__|${IMAGE_TAG}|g" \
    -e "s|__CONTAINER_NAME__|${CONTAINER_NAME}|g" \
    -e "s|__APP_PORT__|${APP_PORT}|g" \
    -e "s|__HOST_PORT__|${HOST_PORT}|g" \
    /usr/local/bin/pata-redeploy

  chmod +x /usr/local/bin/pata-redeploy
  info "Created /usr/local/bin/pata-redeploy for quick updates."
}

# ─── Main ────────────────────────────────────────────────────────────────────
main() {
  echo ""
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║        PaTa Frontend — EC2 Deployment Setup             ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo ""
  info "Image: $FULL_IMAGE"
  echo ""

  install_docker
  ecr_login
  deploy_container
  setup_nginx
  create_redeploy_script

  echo ""
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║  ✅  Deployment complete!                                ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo ""
  if [[ -n "$DOMAIN" ]]; then
    info "App is live at https://$DOMAIN"
  else
    info "App is live at http://<ec2-public-ip>:${HOST_PORT}"
  fi
  info "To redeploy after a new image push, run:  sudo pata-redeploy"
  echo ""
}

main "$@"
