import { Country, State, City } from 'country-state-city';

export interface LocationData {
  countries: { code: string; name: string; nativeName: string }[];
  getRegions: (countryCode: string) => { code: string; name: string }[];
  getCities: (countryCode: string, stateCode: string) => { name: string }[];
  getDistricts: (cityName: string) => string[];
}

// Special data for neighborhoods/districts in the requested countries
const districtsData: Record<string, string[]> = {
  // Saudi Arabia - Riyadh
  "Riyadh": ["الربيع", "الندى", "الصحافة", "النرجس", "العارض", "النفل", "العقيق", "الوادي", "الغدير", "الياسمين", "الفلاح", "بنبان", "القيروان", "حطين", "الملقا", "الروضة"],
  "الرياض": ["الربيع", "الندى", "الصحافة", "النرجس", "العارض", "النفل", "العقيق", "الوادي", "الغدير", "الياسمين", "الفلاح", "بنبان", "القيروان", "حطين", "الملقا", "الروضة"],
  "Jeddah": ["الخالدية", "الروضة", "الشاطئ", "النهضة", "الزهراء", "السلامة", "النعيم", "البوادي", "المحمدية", "المرجان"],
  "جدة": ["الخالدية", "الروضة", "الشاطئ", "النهضة", "الزهراء", "السلامة", "النعيم", "البوادي", "المحمدية", "المرجان"],
  "Mecca": ["التنعيم", "الخالدية", "الرصيفة", "الزاهر", "الزهراء", "السليمانية", "الشامية"],
  "مكة المكرمة": ["التنعيم", "الخالدية", "الرصيفة", "الزاهر", "الزهراء", "السليمانية", "الشامية"],
  
  // Sudan - Khartoum
  "Khartoum": ["كافوري", "الصحافة", "جبرة", "اللاماب", "المنشية", "المعمورة", "الرياض", "العمارات", "الخرطوم 2", "الخرطوم 3"],
  "الخرطوم": ["كافوري", "الصحافة", "جبرة", "اللاماب", "المنشية", "المعمورة", "الرياض", "العمارات", "الخرطوم 2", "الخرطوم 3"],
  "Bahri": ["شمبات", "الدناقلة", "الختمية", "الصافية", "المزاد", "الشعبية"],
  "الخرطوم بحري": ["شمبات", "الدناقلة", "الختمية", "الصافية", "المزاد", "الشعبية"],
  "Omdurman": ["الثورة", "أبو سعد", "الصالحة", "الفتيحاب", "الموردة", "العرضة"],
  "أم درمان": ["الثورة", "أبو سعد", "الصالحة", "الفتيحاب", "الموردة", "العرضة"],

  // UAE
  "Dubai": ["Deira", "Bur Dubai", "Jumeirah", "Downtown Dubai", "Business Bay", "Dubai Marina", "Al Barsha"],
  "دبي": ["ديرة", "بر دبي", "جميرا", "وسط مدينة دبي", "الخليج التجاري", "دبي مارينا", "البرشاء"],
  "Abu Dhabi": ["Khalidiya", "Al Reem Island", "Yas Island", "Saadiyat Island", "Al Maryah Island", "Al Mushrif"],
  "أبو ظبي": ["الخالدية", "جزيرة الريم", "جزيرة ياس", "جزيرة السعديات", "جزيرة المارية", "المشرف"],

  // Bahrain
  "Manama": ["Adliya", "Juffair", "Seef", "Hoora", "Gudaibiya", "Diplomatic Area"],
  "المنامة": ["العدلية", "الجفير", "السيف", "الحورة", "القضيبية", "المنطقة الدبلوماسية"],

  // Kuwait
  "Kuwait City": ["Sharq", "Mirqab", "Jibla", "Dasman", "Bneid Al-Gar"],
  "مدينة الكويت": ["شرق", "المرقاب", "جبلة", "دسمان", "بنيد القار"]
};

const countryNamesAr: Record<string, string> = {
  "SA": "السعودية",
  "SD": "السودان",
  "AE": "الإمارات",
  "BH": "البحرين",
  "KW": "الكويت"
};

export const locationLibrary = {
  countries: [
    { code: "SA", name: "Saudi Arabia", nativeName: "السعودية" },
    { code: "SD", name: "Sudan", nativeName: "السودان" },
    { code: "AE", name: "United Arab Emirates", nativeName: "الإمارات" },
    { code: "BH", name: "Bahrain", nativeName: "البحرين" },
    { code: "KW", name: "Kuwait", nativeName: "الكويت" }
  ],
  getRegions: (countryCode: string) => {
    return State.getStatesOfCountry(countryCode).map(s => ({
      code: s.isoCode,
      name: s.name
    }));
  },
  getCities: (countryCode: string, stateCode: string) => {
    return City.getCitiesOfState(countryCode, stateCode).map(c => ({
      name: c.name
    }));
  },
  getDistricts: (cityName: string) => {
    return districtsData[cityName] || [];
  }
};
