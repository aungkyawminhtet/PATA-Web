import heroMountains from '../assets/images/hero_maesai_mountains_1794596480894.jpg';
import templeDoiWao from '../assets/images/temple_doi_wao_1794596482449.jpg';
import caveThamLuang from '../assets/images/cave_tham_luang_1794596481083.jpg';
import cafePhaMee from '../assets/images/cafe_phamee_roasters_1794596482631.jpg';
import marketMaeSai from '../assets/images/market_maesai_food_1794596482897.jpg';
import homestayPangHa from '../assets/images/homestay_pang_ha_1794596484294.jpg';

const getImageSrc = (img: any): string => (typeof img === 'object' && img?.src ? img.src : img);

export const MAE_SAI_IMAGES = {
  heroMountains: getImageSrc(heroMountains),
  templeDoiWao: getImageSrc(templeDoiWao),
  caveThamLuang: getImageSrc(caveThamLuang),
  cafePhaMee: getImageSrc(cafePhaMee),
  marketMaeSai: getImageSrc(marketMaeSai),
  homestayPangHa: getImageSrc(homestayPangHa),
};
