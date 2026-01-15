'use client';
import { useEffect, useState, use } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Briefcase, Car, CreditCard, Calendar, FileText, Shield } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

interface Employee {
  id: number; name: string; iqama_number: string; identity_number: string; nationality: string;
  phone: string; email: string; job_title: string; basic_salary: number; vehicle_plate: string;
  iban: string; personal_photo: string; iqama_expiry: string; birth_date: string;
  passport_number: string; bank_name: string; is_active: number; is_frozen: number;
}

function getIqamaStatus(d: string | null) {
  if (!d) return { text: 'غير محدد', color: 'gray', days: 0 };
  const days = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  if (days < 0) return { text: 'منتهية', color: 'red', days };
  if (days <= 30) return { text: 'على وشك', color: 'orange', days };
  return { text: 'سارية', color: 'green', days };
}

function Card({ icon: I, label, value, c }: any) {
  const cls: any = { blue: 'from-blue-500/20 border-blue-500/30 text-blue-400', purple: 'from-purple-500/20 border-purple-500/30 text-purple-400', emerald: 'from-emerald-500/20 border-emerald-500/30 text-emerald-400', cyan: 'from-cyan-500/20 border-cyan-500/30 text-cyan-400', pink: 'from-pink-500/20 border-pink-500/30 text-pink-400', orange: 'from-orange-500/20 border-orange-500/30 text-orange-400', indigo: 'from-indigo-500/20 border-indigo-500/30 text-indigo-400', teal: 'from-teal-500/20 border-teal-500/30 text-teal-400', red: 'from-red-500/20 border-red-500/30 text-red-400', amber: 'from-amber-500/20 border-amber-500/30 text-amber-400', violet: 'from-violet-500/20 border-violet-500/30 text-violet-400', green: 'from-green-500/20 border-green-500/30 text-green-400' };
  return <motion.div initial={{opacity:0}} animate={{opacity:1}} className={`bg-gradient-to-br ${cls[c]} rounded-2xl border p-5`}><div className="flex items-center gap-3 mb-2"><I size={20}/><span className="text-white/60 text-sm">{label}</span></div><p className="text-white text-lg font-semibold truncate">{value||'غير محدد'}</p></motion.div>;
}

export default function P({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [e, setE] = useState<Employee|null>(null);
  const [l, setL] = useState(true);
  const [t, setT] = useState(new Date());

  useEffect(() => {
    supabase.from('employees').select('*').eq('id',id).single().then(({data})=>{if(data){setE(data);setT(new Date());}setL(false);});
    const ch = supabase.channel('emp').on('postgres_changes',{event:'*',schema:'public',table:'employees',filter:`id=eq.${id}`},(p)=>{if(p.new){setE(p.new as Employee);setT(new Date());}}).subscribe();
    return()=>{supabase.removeChannel(ch);};
  }, [id]);

  if(l) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full"/></div>;
  if(!e) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-2xl">الموظف غير موجود</div>;

  const s = getIqamaStatus(e.iqama_expiry);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8" dir="rtl">
      <div className="absolute top-4 left-4 flex items-center gap-2 text-white/60 text-sm"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/><span>Live</span><span>|</span><span>{t.toLocaleTimeString('ar-SA')}</span></div>
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
            <div className="flex items-center gap-8">
              <div className="relative">{e.personal_photo?<img src={e.personal_photo} className="w-32 h-32 rounded-full object-cover border-4 border-white/30"/>:<div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30"><User size={48} className="text-white/70"/></div>}<div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-white ${e.is_active?'bg-green-500':'bg-red-500'} border-2 border-white`}>{e.is_active?'✓':'✗'}</div></div>
              <div className="flex-1"><h1 className="text-4xl font-bold text-white mb-2">{e.name}</h1><p className="text-white/70 text-xl">{e.job_title||'غير محدد'}</p><div className="flex gap-4 mt-4"><span className={`px-4 py-1.5 rounded-full text-sm font-bold ${s.color==='green'?'bg-green-500/20 text-green-300 border border-green-500/50':s.color==='orange'?'bg-orange-500/20 text-orange-300 border border-orange-500/50':s.color==='red'?'bg-red-500/20 text-red-300 border border-red-500/50':'bg-gray-500/20 text-gray-300'}`}>{s.text}{s.days!==0&&` (${Math.abs(s.days)} يوم)`}</span>{e.is_frozen===1&&<span className="px-4 py-1.5 rounded-full text-sm font-bold bg-blue-500/20 text-blue-300 border border-blue-500/50">مجمد</span>}</div></div>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card icon={FileText} label="رقم الإقامة" value={e.iqama_number} c="blue"/>
            <Card icon={Shield} label="رقم الهوية" value={e.identity_number} c="purple"/>
            <Card icon={User} label="الجنسية" value={e.nationality} c="emerald"/>
            <Card icon={Phone} label="الهاتف" value={e.phone} c="cyan"/>
            <Card icon={Mail} label="البريد" value={e.email} c="pink"/>
            <Card icon={Car} label="لوحة المركبة" value={e.vehicle_plate} c="orange"/>
            <Card icon={CreditCard} label="IBAN" value={e.iban} c="indigo"/>
            <Card icon={Briefcase} label="البنك" value={e.bank_name} c="teal"/>
            <Card icon={Calendar} label="انتهاء الإقامة" value={e.iqama_expiry} c="red"/>
            <Card icon={FileText} label="رقم الجواز" value={e.passport_number} c="amber"/>
            <Card icon={Calendar} label="تاريخ الميلاد" value={e.birth_date} c="violet"/>
            <Card icon={CreditCard} label="الراتب" value={e.basic_salary?`${e.basic_salary.toLocaleString()} ريال`:null} c="green"/>
          </div>
        </div>
      </motion.div>
    </div>
  );
}