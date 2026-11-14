import { CategoryId, LanguageCode, VerificationStatus } from '../types/tourism';

export interface TranslationBundle {
  brandTitle: string;
  nav: {
    home: string;
    explore: string;
    map: string;
    planner: string;
    insights: string;
    businesses: string;
    routes: string;
    about: string;
    contact: string;
    saved: string;
    dataset: string;
  };
  hero: {
    kicker: string;
    headline: string;
    subheadline: string;
    searchPlaceholder: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  sections: {
    popularDestinations: string;
    popularSub: string;
    categoriesTitle: string;
    categoriesSub: string;
    featuredFoodCafe: string;
    featuredFoodCafeSub: string;
    localBusinessesTitle: string;
    localBusinessesSub: string;
    mapPreviewTitle: string;
    mapPreviewSub: string;
    suggestedRoutesTitle: string;
    suggestedRoutesSub: string;
  };
  categories: Record<CategoryId, string>;
  verification: Record<VerificationStatus, string>;
  common: {
    all: string;
    viewDetails: string;
    addToTrip: string;
    savePlace: string;
    savedPlace: string;
    getDirections: string;
    openMap: string;
    sampleNotice: string;
    estimatedPrice: string;
    freeEntry: string;
    nearbyPlaces: string;
    calculateTrip: string;
    saveItinerary: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, TranslationBundle> = {
  en: {
    brandTitle: "Mae Sai Discovery",
    nav: {
      home: "Home",
      explore: "Explore",
      map: "Interactive Map",
      planner: "Trip Planner",
      insights: "Insights",
      businesses: "Local Businesses",
      routes: "Suggested Routes",
      about: "About",
      contact: "Contact & Help",
      saved: "Saved",
      dataset: "provinces",
    },
    hero: {
      kicker: "Mae Sai District · Chiang Rai, Northern Thailand",
      headline: "Discover Mae Sai Beyond the Border",
      subheadline:
        "Explore mountain temples, karst caves, highland coffee villages, local border markets, and community crafts with transparent place profiles and real route planning.",
      searchPlaceholder: "Where would you like to explore in Mae Sai?",
      ctaPrimary: "Explore Mae Sai",
      ctaSecondary: "Plan Your Trip",
    },
    sections: {
      popularDestinations: "Popular Destinations in Mae Sai",
      popularSub:
        "Real landmarks, viewpoints, and heritage sites across Mae Sai subdistricts.",
      categoriesTitle: "Explore by Category",
      categoriesSub:
        "Browse listed attractions, coffee roasters, restaurants, accommodation, and visitor facilities.",
      featuredFoodCafe: "Featured Coffee Shops & Restaurants",
      featuredFoodCafeSub:
        "Highland Arabica roasters, northern Thai kitchens, and border culinary stops.",
      localBusinessesTitle: "Local Businesses & Community Experiences",
      localBusinessesSub:
        "Support small community workshops, handmade saa paper artisans, and family homestays.",
      mapPreviewTitle: "Explore Mae Sai Geographically",
      mapPreviewSub:
        "See how border town landmarks, Tham Luang forest trails, and Doi Pha Mee coffee hills connect.",
      suggestedRoutesTitle: "Suggested Mae Sai Travel Routes",
      suggestedRoutesSub:
        "Ready-to-customize itineraries you can load directly into the Trip Planner.",
    },
    categories: {
      attractions: "Attractions & Heritage",
      cafes: "Cafés & Roasters",
      restaurants: "Restaurants & Food",
      accommodation: "Hotels & Homestays",
      local_experiences: "Community Experiences",
      shopping: "Markets & Crafts",
      transportation: "Transport & Rentals",
      facilities: "Visitor Facilities",
    },
    verification: {
      verified: "Verified Record",
      partially_verified: "Partially Verified",
      not_yet_verified: "Sample · Not Yet Verified",
      needs_updating: "Needs Updating",
    },
    common: {
      all: "All Places",
      viewDetails: "View Details",
      addToTrip: "Add to Trip",
      savePlace: "Save Place",
      savedPlace: "Saved",
      getDirections: "Get Directions",
      openMap: "Open Full Map",
      sampleNotice: "Prototype sample record · Verify hours and fees locally",
      estimatedPrice: "Est. range",
      freeEntry: "Free entry",
      nearbyPlaces: "Nearby Places",
      calculateTrip: "Calculate My Trip",
      saveItinerary: "Save Itinerary",
    },
  },
  th: {
    brandTitle: "แม่สาย ดิสคัฟเวอรี",
    nav: {
      home: "หน้าแรก",
      explore: "สำรวจสถานที่",
      map: "แผนที่ท่องเที่ยว",
      planner: "วางแผนการเดินทาง",
      insights: "ข้อมูลเชิงพื้นที่",
      businesses: "ธุรกิจท้องถิ่น",
      routes: "เส้นทางแนะนำ",
      about: "เกี่ยวกับโครงการ",
      contact: "ติดต่อและช่วยเหลือ",
      saved: "รายการที่บันทึก",
      dataset: "วิเคราะห์ชุดข้อมูล",
    },
    hero: {
      kicker: "อำเภอแม่สาย · จังหวัดเชียงราย ประเทศไทย",
      headline: "ค้นพบแม่สาย เหนือสุดแดนสยามและวิถีชุมชน",
      subheadline:
        "สำรวจวัดบนยอดดอย ถ้ำหลวง แหล่งกาแฟดอยผาหมี–ผาฮี้ ตลาดชายแดน และงานหัตถกรรมชุมชน พร้อมแผนที่แบบโต้ตอบและเครื่องมือประมาณการค่าใช้จ่าย",
      searchPlaceholder: "คุณอยากไปสำรวจที่ไหนในแม่สาย?",
      ctaPrimary: "สำรวจแม่สาย",
      ctaSecondary: "วางแผนทริป",
    },
    sections: {
      popularDestinations: "สถานที่ท่องเที่ยวยอดนิยมในแม่สาย",
      popularSub:
        "วัดสำคัญ จุดชมวิวภูเขา และแหล่งธรรมชาติจริงในพื้นที่อำเภอแม่สาย",
      categoriesTitle: "หมวดหมู่การท่องเที่ยว",
      categoriesSub:
        "เลือกดูสถานที่ท่องเที่ยว ร้านกาแฟ ร้านอาหาร ที่พัก และการเดินทาง",
      featuredFoodCafe: "ร้านกาแฟและร้านอาหารแนะนำ",
      featuredFoodCafeSub:
        "โรงคั่วกาแฟอาราบิก้าบนดอย อาหารพื้นเมือง และอาหารท้องถิ่น",
      localBusinessesTitle: "ธุรกิจท้องถิ่นและการท่องเที่ยวโดยชุมชน",
      localBusinessesSub:
        "สนับสนุนวิสาหกิจชุมชน กระดาษสาบ้านปางห้า และโฮมสเตย์ท้องถิ่น",
      mapPreviewTitle: "สำรวจแม่สายผ่านแผนที่เชิงพื้นที่",
      mapPreviewSub:
        "ดูความเชื่อมโยงระหว่างตัวเมืองแม่สาย อุทยานแห่งชาติถ้ำหลวง และดอยผาหมี",
      suggestedRoutesTitle: "เส้นทางท่องเที่ยวแม่สายแนะนำ",
      suggestedRoutesSub:
        "เส้นทางตัวอย่างที่สามารถโหลดเข้าสู่เครื่องมือวางแผนทริปได้ทันที",
    },
    categories: {
      attractions: "สถานที่ท่องเที่ยวและวัด",
      cafes: "คาเฟ่และโรงคั่วกาแฟ",
      restaurants: "ร้านอาหารท้องถิ่น",
      accommodation: "โรงแรมและโฮมสเตย์",
      local_experiences: "วิถีชุมชนและเวิร์กช็อป",
      shopping: "ตลาดและสินค้าท้องถิ่น",
      transportation: "รถเช่าและการเดินทาง",
      facilities: "สิ่งอำนวยความสะดวก",
    },
    verification: {
      verified: "ตรวจสอบข้อมูลแล้ว",
      partially_verified: "ตรวจสอบบางส่วนแล้ว",
      not_yet_verified: "ข้อมูลตัวอย่าง · รอตรวจสอบ",
      needs_updating: "ควรอัปเดตข้อมูล",
    },
    common: {
      all: "ทั้งหมด",
      viewDetails: "ดูรายละเอียด",
      addToTrip: "เพิ่มลงทริป",
      savePlace: "บันทึกสถานที่",
      savedPlace: "บันทึกแล้ว",
      getDirections: "นำทาง",
      openMap: "เปิดแผนที่เต็ม",
      sampleNotice:
        "ข้อมูลตัวอย่างในระบบต้นแบบ · โปรดตรวจสอบเวลาเปิด-ปิดหน้างานอีกครั้ง",
      estimatedPrice: "ราคาประมาณการ",
      freeEntry: "เข้าชมฟรี",
      nearbyPlaces: "สถานที่ใกล้เคียง",
      calculateTrip: "คำนวณทริปของฉัน",
      saveItinerary: "บันทึกแผนการเดินทาง",
    },
  },
  my: {
    brandTitle: "မယ်ဆိုင် ခရီးသွားလမ်းညွှန်",
    nav: {
      home: "ပင်မစာမျက်နှာ",
      explore: "ရှာဖွေရန်",
      map: "ခရီးသွားမြေပုံ",
      planner: "ခရီးစဉ်စီစဉ်သူ",
      insights: "ဒေသဆိုင်ရာအချက်အလက်",
      businesses: "ဒေသခံလုပ်ငန်းများ",
      routes: "အကြံပြုလမ်းကြောင်းများ",
      about: "စီမံကိန်းအကြောင်း",
      contact: "ဆက်သွယ်ရန်",
      saved: "သိမ်းဆည်းထားသော",
      dataset: "ဒေတာခွဲခြမ်းစိတ်ဖြာမှု",
    },
    hero: {
      kicker: "မယ်ဆိုင်ခရိုင် · ချင်းရိုင်၊ ထိုင်းနိုင်ငံမြောက်ပိုင်း",
      headline: "နယ်စပ်မြို့မယ်ဆိုင်၏ အလှအပနှင့် ဒေသယဉ်ကျေးမှုကို ရှာဖွေပါ",
      subheadline:
        "တောင်ပေါ်စေတီများ၊ ထမ်လွမ်ဂူ၊ ဒွိုင်ဖာမီး ကော်ဖီတောင်တန်းများ၊ နယ်စပ်ဈေးနှင့် ဒေသခံလက်မှုပညာများကို မြေပုံနှင့် ခရီးစရိတ်တွက်ချက်မှုဖြင့် လေ့လာပါ။",
      searchPlaceholder: "မယ်ဆိုင်တွင် မည်သည့်နေရာသို့ သွားရောက်လိုပါသနည်း?",
      ctaPrimary: "မယ်ဆိုင်ကို ရှာဖွေပါ",
      ctaSecondary: "ခရီးစဉ်စီစဉ်ပါ",
    },
    sections: {
      popularDestinations: "မယ်ဆိုင်ရှိ ထင်ရှားသောနေရာများ",
      popularSub:
        "မယ်ဆိုင်ဒေသအတွင်းရှိ သမိုင်းဝင်ဘုရားကျောင်းများနှင့် သဘာဝရှုခင်းများ",
      categoriesTitle: "ခရီးသွားကဏ္ဍအလိုက် ကြည့်ရှုရန်",
      categoriesSub:
        "ဆွဲဆောင်မှုနေရာများ၊ ကော်ဖီဆိုင်များ၊ စားသောက်ဆိုင်များနှင့် တည်းခိုခန်းများ",
      featuredFoodCafe: "အကြံပြု ကော်ဖီဆိုင်နှင့် စားသောက်ဆိုင်များ",
      featuredFoodCafeSub:
        "တောင်ပေါ်ကော်ဖီဆိုင်များနှင့် ထိုင်းမြောက်ပိုင်းဒေသအစားအစာများ",
      localBusinessesTitle: "ဒေသခံလုပ်ငန်းများနှင့် ရပ်ရွာအတွေ့အကြုံများ",
      localBusinessesSub:
        "ပန်ဟားကျေးရွာ စက္ကူလက်မှုလုပ်ငန်းနှင့် ဒေသခံတည်းခိုခန်းများ",
      mapPreviewTitle: "မယ်ဆိုင်ခရီးသွားမြေပုံ",
      mapPreviewSub:
        "နယ်စပ်မြို့၊ ထမ်လွမ်သစ်တောနှင့် ဒွိုင်ဖာမီးတောင်တန်း ဆက်စပ်မှုကို ကြည့်ရှုပါ",
      suggestedRoutesTitle: "အကြံပြု မယ်ဆိုင်ခရီးသွားလမ်းကြောင်းများ",
      suggestedRoutesSub:
        "ခရီးစဉ်စီစဉ်သူထဲသို့ တိုက်ရိုက်ထည့်သွင်းနိုင်သော လမ်းကြောင်းများ",
    },
    categories: {
      attractions: "လည်ပတ်စရာနေရာများ",
      cafes: "ကော်ဖီဆိုင်များ",
      restaurants: "စားသောက်ဆိုင်များ",
      accommodation: "ဟိုတယ်နှင့် တည်းခိုခန်းများ",
      local_experiences: "ရပ်ရွာအတွေ့အကြုံများ",
      shopping: "ဈေးနှင့် လက်မှုပစ္စည်းများ",
      transportation: "သယ်ယူပို့ဆောင်ရေး",
      facilities: "ခရီးသွားဝန်ဆောင်မှုများ",
    },
    verification: {
      verified: "အတည်ပြုပြီး",
      partially_verified: "တစ်စိတ်တစ်ပိုင်း အတည်ပြုပြီး",
      not_yet_verified: "နမူနာ · မစစ်ဆေးရသေး",
      needs_updating: "အချက်အလက်ပြင်ဆင်ရန်လို",
    },
    common: {
      all: "အားလုံး",
      viewDetails: "အသေးစိတ်ကြည့်ရန်",
      addToTrip: "ခရီးစဉ်သို့ထည့်ရန်",
      savePlace: "သိမ်းဆည်းရန်",
      savedPlace: "သိမ်းဆည်းပြီး",
      getDirections: "လမ်းညွှန်ကြည့်ရန်",
      openMap: "မြေပုံအပြည့်ဖွင့်ရန်",
      sampleNotice:
        "နမူနာအချက်အလက်ဖြစ်ပါသည် · ဖွင့်ချိန်နှင့် ဈေးနှုန်းများကို ထပ်မံစစ်ဆေးပါ",
      estimatedPrice: "ခန့်မှန်းဈေး",
      freeEntry: "အခမဲ့",
      nearbyPlaces: "အနီးအနားရှိနေရာများ",
      calculateTrip: "ခရီးစဉ်တွက်ချက်ပါ",
      saveItinerary: "ခရီးစဉ်သိမ်းဆည်းပါ",
    },
  },
};
