#!/usr/bin/env bash
#
# docker-build-push.sh
# Builds the Docker image and pushes it to a container registry.
#
# Usage:
#   ./docker-build-push.sh                         # uses defaults
#   REGISTRY=123456789.dkr.ecr.ap-southeast-1.amazonaws.com IMAGE_NAME=pata-frontend IMAGE_TAG=v1.2.0 ./docker-build-push.sh
#
# Supported registries:
#   - Amazon ECR  (set REGISTRY to your ECR URI)
#   - Docker Hub  (set REGISTRY to your Docker Hub username, e.g. "myuser")
#   - Any OCI-compatible registry
#
set -euo pipefail

# ─── Configuration ───────────────────────────────────────────────────────────
REGISTRY="${REGISTRY:-}"            # e.g. 123456789.dkr.ecr.ap-southeast-1.amazonaws.com  or  docker-hub-username
IMAGE_NAME="${IMAGE_NAME:-pata-frontend}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
PLATFORM="${PLATFORM:-linux/amd64}" # EC2 runs x86_64 by default
DOCKERFILE="${DOCKERFILE:-Dockerfile}"
# ─────────────────────────────────────────────────────────────────────────────

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# ─── Preflight checks ───────────────────────────────────────────────────────
if [[ -z "$REGISTRY" ]]; then
  error "REGISTRY is not set."
  echo "  Export it before running this script, for example:"
  echo "    export REGISTRY=123456789.dkr.ecr.ap-southeast-1.amazonaws.com"
  echo "    export REGISTRY=mydockerhubuser"
  exit 1
fi

command -v docker >/dev/null 2>&1 || { error "docker is not installed."; exit 1; }

FULL_IMAGE="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

info "Registry   : $REGISTRY"
info "Image      : $FULL_IMAGE"
info "Platform   : $PLATFORM"
info "Dockerfile : $DOCKERFILE"
echo ""

# ─── Authenticate to ECR (if the registry looks like an ECR URI) ─────────────
if [[ "$REGISTRY" == *".dkr.ecr."*".amazonaws.com" ]]; then
  REGION=$(echo "$REGISTRY" | sed -E 's/.*\.dkr\.ecr\.(.+)\.amazonaws\.com/\1/')
  info "Detected ECR registry in region: $REGION — logging in …"
  aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$REGISTRY"
  echo ""
fi

# ─── Build ───────────────────────────────────────────────────────────────────
info "Building image …"
docker build \
  --platform "$PLATFORM" \
  -f "$DOCKERFILE" \
  -t "$FULL_IMAGE" \
  .

# ─── Push ────────────────────────────────────────────────────────────────────
info "Pushing image …"
docker push "$FULL_IMAGE"

echo ""
info "✅ Done!  Image pushed → $FULL_IMAGE"
