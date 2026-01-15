'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Briefcase, Car, CreditCard, Calendar, FileText, Shield } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Employee {
  id: number;
  name: string;
  iqama_number: string;
  identity_number: string;
  nationality: string;
  phone: string;
  email: string;
  job_title: string;
  basic_salary: number;
  housing_allowance: number;
  vehicle_plate: string;
  iban: string;
  personal_photo: string;
  iqama_expiry: string;
  birth_date: string;
  passport_number: string;
  bank_name: string;
  bank_account: string;
  is_active: number;
  is_frozen: number;
}

function getIqamaStatus(expiryDate: string | null) {
  if (!expiryDate) return { text: 'غير محدد', color: 'gray', days: 0 };
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return { text: 'منتهية', color: 'red', days: diffDays };
  if (diffDays <= 30) return { text: 'على وشك الانتهاء', color: 'orange', days: diffDays };
  return { text: 'سارية', color: 'green', days: diffDays };
}

export default function LiveEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchEmployee = async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && data) {
        setEmployee(data);
        setLastUpdate(new Date());
      }
      setLoading(false);
    };

    fetchEmployee();

    const channel = supabase
      .channel('employee-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees',
          filter: `id=eq.${id}`
        },
        (payload) => {
          if (payload.new) {
            setEmployee(payload.new as Employee);
            setLastUpdate(new Date());
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">الموظف غير موجود</div>
      </div>
    );
  }

  const iqamaStatus = getIqamaStatus(employee.iqama_expiry);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8" dir="rtl">
      <div className="absolute top-4 left-4 flex items-center gap-2 text-white/60 text-sm">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span>تحديث مباشر</span>
        <span className="text-white/40">|</span>
        <span>آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA')}</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
            <div className="flex items-center gap-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative"
              >
                {employee.personal_photo ? (
                  <img
                    src={employee.personal_photo}
                    alt={employee.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white/30 shadow-2xl"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
                    <User size={48} className="text-white/70" />
                  </div>
                )}
                <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white ${
                  employee.is_active === 1 ? 'bg-green-500' : 'bg-red-500'
                } border-2 border-white shadow-lg`}>
                  {employee.is_active === 1 ? '✓' : '✗'}
                </div>
              </motion.div>

              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">{employee.name}</h1>
                <p className="text-white/70 text-xl">{employee.job_title || 'غير محدد'}</p>
                <div className="flex items-center gap-4 mt-4">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${
                    iqamaStatus.color === 'green' ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
                    iqamaStatus.color === 'orange' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50' :
                    iqamaStatus.color === 'red' ? 'bg-red-500/20 text-red-300 border border-red-500/50' :
                    'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                  }`}>
                    {iqamaStatus.text}
                    {iqamaStatus.days !== 0 && ` (${Math.abs(iqamaStatus.days)} يوم)`}
                  </span>
                  {employee.is_frozen === 1 && (
                    <span className="px-4 py-1.5 rounded-full text-sm font-bold bg-blue-500/20 text-blue-300 border border-blue-500/50">
                      مجمد
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoCard icon={FileText} label="رقم الإقامة" value={employee.iqama_number} color="blue" />
            <InfoCard icon={Shield} label="رقم الهوية" value={employee.identity_number} color="purple" />
            <InfoCard icon={User} label="الجنسية" value={employee.nationality} color="emerald" />
            <InfoCard icon={Phone} label="الهاتف" value={employee.phone} color="cyan" />
            <InfoCard icon={Mail} label="البريد الإلكتروني" value={employee.email} color="pink" />
            <InfoCard icon={Car} label="لوحة المركبة" value={employee.vehicle_plate} color="orange" />
            <InfoCard icon={CreditCard} label="IBAN" value={employee.iban} color="indigo" />
            <InfoCard icon={Briefcase} label="البنك" value={employee.bank_name} color="teal" />
            <InfoCard icon={Calendar} label="تاريخ انتهاء الإقامة" value={employee.iqama_expiry} color="red" />
            <InfoCard icon={FileText} label="رقم الجواز" value={employee.passport_number} color="amber" />
            <InfoCard icon={Calendar} label="تاريخ الميلاد" value={employee.birth_date} color="violet" />
            <InfoCard 
              icon={CreditCard} 
              label="الراتب الأساسي" 
              value={employee.basic_salary ? `${employee.basic_salary.toLocaleString()} ريال` : null} 
              color="green" 
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | null; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
    emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400',
    cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400',
    pink: 'from-pink-500/20 to-pink-600/10 border-pink-500/30 text-pink-400',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30 text-orange-400',
    indigo: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400',
    teal: 'from-teal-500/20 to-teal-600/10 border-teal-500/30 text-teal-400',
    red: 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-400',
    amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400',
    violet: 'from-violet-500/20 to-violet-600/10 border-violet-500/30 text-violet-400',
    green: 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-sm rounded-2xl border p-5`}
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon size={20} className={colorClasses[color].split(' ').pop()} />
        <span className="text-white/60 text-sm">{label}</span>
      </div>
      <p className="text-white text-lg font-semibold truncate">
        {value || 'غير محدد'}
      </p>
    </motion.div>
  );
}