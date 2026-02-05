import { Coordinates, CalculationMethod, PrayerTimes, SunnahTimes, Prayer, Madhab } from 'adhan';

export interface PrayerTimesData {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  current: string | null;
  next: string | null;
  nextTime: Date | null;
}

export function getPrayerTimesLocal(
  lat: number,
  lng: number,
  date: Date = new Date(),
  method: keyof typeof CalculationMethod = 'UmmAlQura'
): PrayerTimesData {
  const coords = new Coordinates(lat, lng);
  const params = CalculationMethod[method]();
  params.madhab = Madhab.Shafi; // Default to Shafi/Others, can be changed to Hanafi if needed
  
  const prayerTimes = new PrayerTimes(coords, date, params);
  
  return {
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
    current: prayerTimes.currentPrayer(),
    next: prayerTimes.nextPrayer(),
    nextTime: prayerTimes.timeForPrayer(prayerTimes.nextPrayer()),
  };
}

export function getHijriDate(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch (error) {
    return "";
  }
}

export function isFriday(date: Date = new Date()): boolean {
  return date.getDay() === 5;
}

export function getIslamicEvent(date: Date = new Date(), locale: 'ar' | 'en' = 'ar'): string | null {
  try {
    // Use a reliable way to get hijri day/month
    const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-nu-latn', { day: 'numeric', month: 'numeric' });
    const formattedParts = formatter.formatToParts(date);
    const hDay = parseInt(formattedParts.find(p => p.type === 'day')?.value || '0');
    const hMonth = parseInt(formattedParts.find(p => p.type === 'month')?.value || '0');

    if (hMonth === 10 && hDay === 1) return locale === 'ar' ? "عيد الفطر المبارك" : "Eid al-Fitr";
    if (hMonth === 12 && hDay === 10) return locale === 'ar' ? "عيد الأضحى المبارك" : "Eid al-Adha";
    if (hMonth === 12 && hDay === 9) return locale === 'ar' ? "يوم عرفة" : "Day of Arafah";
    if (hMonth === 9 && hDay === 1) return locale === 'ar' ? "بداية شهر رمضان" : "Ramadan Start";
    if (hMonth === 1 && hDay === 1) return locale === 'ar' ? "رأس السنة الهجرية" : "Islamic New Year";
    
    return null;
  } catch (e) {
    return null;
  }
}
