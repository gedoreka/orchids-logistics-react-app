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

export function getIslamicEvent(date: Date = new Date()): string | null {
  const hijri = new Intl.DateTimeFormat('en-u-ca-islamic-nu-latn', {
    day: 'numeric',
    month: 'numeric'
  }).format(date);
  
  const [day, month] = hijri.split('/').map(Number);
  
  // Basic Eid detection (1st Shawwal, 10th Dhu al-Hijjah)
  // Month 10 = Shawwal, Month 12 = Dhu al-Hijjah
  if (month === 10 && day === 1) return "Eid al-Fitr";
  if (month === 12 && day === 10) return "Eid al-Adha";
  
  return null;
}
