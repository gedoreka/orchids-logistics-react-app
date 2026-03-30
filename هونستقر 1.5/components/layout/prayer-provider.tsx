"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getPrayerTimesLocal, getHijriDate, isFriday, getIslamicEvent, PrayerTimesData } from '@/lib/prayer-service';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Volume2, X } from 'lucide-react';

interface PrayerContextType {
  times: PrayerTimesData | null;
  nextPrayer: { name: string; time: Date; remaining: string } | null;
  currentTime: Date;
  locationName: string;
  isFriday: boolean;
  islamicEvent: string | null;
  hijriDate: string;
  triggerTestAlert: () => void;
}

const PrayerContext = createContext<PrayerContextType | null>(null);

const PRAYER_NAMES_AR: Record<string, string> = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
  none: 'لا يوجد'
};

const IQAMA_OFFSETS: Record<string, number> = {
  fajr: 20,
  dhuhr: 15,
  asr: 15,
  maghrib: 10,
  isha: 15
};

// Default placeholder value for SSR - will be replaced on client
const DEFAULT_PRAYER_VALUE: PrayerContextType = {
  times: null,
  nextPrayer: null,
  currentTime: new Date(0),
  locationName: 'الرياض، السعودية',
  isFriday: false,
  islamicEvent: null,
  hijriDate: '',
  triggerTestAlert: () => {}
};

export function PrayerProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [times, setTimes] = useState<PrayerTimesData | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [locationName, setLocationName] = useState('الرياض، السعودية');
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 24.7136, lng: 46.6753 });
  const [alert, setAlert] = useState<{ type: 'adhan' | 'iqama'; prayer: string } | null>(null);
  const [lastAlerted, setLastAlerted] = useState<{ prayer: string; type: string; date: string } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Set mounted on client
  useEffect(() => {
    setMounted(true);
    setCurrentTime(new Date());
    setTimes(getPrayerTimesLocal(24.7136, 46.6753));
  }, []);

  const stopAdhan = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleCloseAlert = () => {
    if (alert) {
      setLastAlerted({
        prayer: alert.prayer,
        type: alert.type,
        date: new Date().toLocaleDateString()
      });
    }
    setAlert(null);
    stopAdhan();
  };

  const fetchLocationName = useCallback(async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
      );
      const data = await response.json();
      const addr = data.address;
      const city = addr.city || addr.town || addr.village || addr.state || "";
      const country = addr.country || "السعودية";
      setLocationName(`${city}، ${country}`);
    } catch {
      setLocationName("الرياض، السعودية");
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoords({ lat, lng });
          fetchLocationName(lat, lng);
        },
        () => {
          setCoords({ lat: 24.7136, lng: 46.6753 }); // Riyadh
        }
      );
    } else {
      setCoords({ lat: 24.7136, lng: 46.6753 });
    }
  }, [fetchLocationName, mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      if (coords) {
        const newTimes = getPrayerTimesLocal(coords.lat, coords.lng, now);
        setTimes(newTimes);

        // Check for Adhan and Iqama alerts
        const checkAlerts = () => {
          const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
          for (const p of prayers) {
            const prayerTime = newTimes[p as keyof PrayerTimesData] as Date;
            if (!prayerTime) continue;

            const diffSeconds = Math.floor((now.getTime() - prayerTime.getTime()) / 1000);
            
            // Adhan: within the same minute
            if (diffSeconds >= 0 && diffSeconds < 60) {
              const isHandled = lastAlerted?.prayer === p && 
                              lastAlerted?.type === 'adhan' && 
                              lastAlerted?.date === now.toLocaleDateString();

              if (!isHandled && (alert?.prayer !== p || alert?.type !== 'adhan')) {
                setAlert({ type: 'adhan', prayer: p });
                playAdhan();
              }
            }

            // Iqama: exactly at the offset
            const iqamaTime = new Date(prayerTime.getTime() + IQAMA_OFFSETS[p] * 60000);
            const iqamaDiffSeconds = Math.floor((now.getTime() - iqamaTime.getTime()) / 1000);
            if (iqamaDiffSeconds >= 0 && iqamaDiffSeconds < 60) {
               const isHandled = lastAlerted?.prayer === p && 
                               lastAlerted?.type === 'iqama' && 
                               lastAlerted?.date === now.toLocaleDateString();

               if (!isHandled && (alert?.prayer !== p || alert?.type !== 'iqama')) {
                setAlert({ type: 'iqama', prayer: p });
              }
            }
          }
        };
        checkAlerts();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [coords, alert, mounted, lastAlerted]);

  const playAdhan = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play blocked", e));
    }
  };

  const nextPrayerData = useCallback(() => {
    if (!times || !currentTime) return null;
    const prayers = [
      { id: 'fajr', name: 'الفجر', time: times.fajr },
      { id: 'sunrise', name: 'الشروق', time: times.sunrise },
      { id: 'dhuhr', name: 'الظهر', time: times.dhuhr },
      { id: 'asr', name: 'العصر', time: times.asr },
      { id: 'maghrib', name: 'المغرب', time: times.maghrib },
      { id: 'isha', name: 'العشاء', time: times.isha },
    ];

    for (const p of prayers) {
      if (p.time > currentTime) {
        const diff = p.time.getTime() - currentTime.getTime();
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        return {
          name: p.name,
          time: p.time,
          remaining: h > 0 ? `${h}س ${m}د` : `${m}د`
        };
      }
    }
    // Tomorrow's Fajr
    return { name: 'الفجر', time: times.fajr, remaining: 'غداً' };
  }, [times, currentTime]);

  const value: PrayerContextType = mounted && currentTime ? {
    times,
    nextPrayer: nextPrayerData(),
    currentTime,
    locationName,
    isFriday: isFriday(currentTime),
    islamicEvent: getIslamicEvent(currentTime),
    hijriDate: getHijriDate(currentTime),
    triggerTestAlert: () => {
      setAlert({ type: 'adhan', prayer: 'fajr' });
      playAdhan();
      setTimeout(() => {
        setAlert(prev => (prev?.type === 'adhan' ? { type: 'iqama', prayer: 'fajr' } : prev));
      }, 5000);
    }
  } : DEFAULT_PRAYER_VALUE;

  return (
    <PrayerContext.Provider value={value}>
      {children}
      {/* Only render audio on client to avoid hydration mismatch */}
      {mounted && (
        <>
          <audio 
            ref={audioRef} 
            src="https://www.islamcan.com/audio/adhan/azan1.mp3" 
            preload="auto"
          />
          <PrayerAlert alert={alert} onClose={handleCloseAlert} />
        </>
      )}
    </PrayerContext.Provider>
  );
}

function PrayerAlert({ alert, onClose }: { alert: { type: 'adhan' | 'iqama'; prayer: string } | null; onClose: () => void }) {
  if (!alert) return null;

  const prayerName = PRAYER_NAMES_AR[alert.prayer];
  const isAdhan = alert.type === 'adhan';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/30 dark:bg-black/80 backdrop-blur-xl"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
            className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white border-2 border-violet-200/60 shadow-[0_0_50px_rgba(139,92,246,0.15)] dark:bg-slate-950 dark:border-emerald-500/30 dark:shadow-[0_0_50px_rgba(16,185,129,0.2)]"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-violet-500/10 to-transparent dark:from-emerald-500/10 blur-3xl opacity-50"
            />
            {/* Decorative circles - light mode only */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full -translate-y-16 -translate-x-16 dark:hidden" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -translate-y-16 translate-x-16 dark:hidden" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full translate-y-12 -translate-x-12 dark:hidden" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tr from-amber-500/10 to-orange-500/10 rounded-full translate-y-12 translate-x-12 dark:hidden" />
          </div>

          {/* Light mode gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-violet-50/80 via-purple-50/50 to-indigo-50/80 dark:hidden pointer-events-none" />

          <div className="relative p-8 md:p-12 text-center">
             <button 
              onClick={onClose}
              className="absolute top-6 left-6 p-2 text-black/30 hover:text-black hover:bg-black/5 dark:text-white/20 dark:hover:text-white dark:hover:bg-white/10 rounded-full transition-all"
            >
              <X size={24} />
            </button>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 inline-flex items-center justify-center"
            >
               <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-violet-500 dark:bg-emerald-500 rounded-full blur-2xl"
                  />
                  <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 dark:from-emerald-400 dark:to-teal-600 flex items-center justify-center shadow-2xl">
                    <Bell size={48} className="text-white animate-bounce" />
                  </div>
               </div>
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-black text-black dark:text-white mb-4 tracking-tight"
            >
              {isAdhan ? 'حان الآن موعد الأذان' : 'حان وقت الإقامة'}
            </motion.h2>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-4 mb-8"
            >
              <div className="px-8 py-4 bg-violet-500/10 border border-violet-500/20 dark:bg-emerald-500/10 dark:border-emerald-500/20 rounded-3xl backdrop-blur-sm">
                  <span className="text-3xl md:text-4xl font-black text-violet-600 dark:text-emerald-400">صلاة {prayerName}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <p className="text-black/60 dark:text-white/60 text-lg leading-relaxed max-w-xs mx-auto">
                {isAdhan ? 'حي على الصلاة.. حي على الفلاح' : 'أقم الصلاة يرحمك الله'}
              </p>

              <button
                onClick={onClose}
                className="group relative inline-flex items-center justify-center px-12 py-5 bg-gradient-to-r from-violet-500 to-purple-600 dark:from-emerald-500 dark:to-teal-600 rounded-2xl text-white font-black text-xl shadow-xl shadow-violet-500/20 dark:shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                   تم الاستماع <Volume2 size={24} />
                </span>
                <motion.div
                  className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"
                />
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export function usePrayer() {
  const context = useContext(PrayerContext);
  if (!context) throw new Error('usePrayer must be used within PrayerProvider');
  return context;
}
