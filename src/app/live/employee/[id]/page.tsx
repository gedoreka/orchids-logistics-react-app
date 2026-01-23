'use client';
import { useEffect, useState, use } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User } from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function LivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [e, setE] = useState<any>(null);
  const [t, setT] = useState(new Date());

  useEffect(() => {
    supabase.from('employees').select('*').eq('id', id).single().then(({ data }) => { if (data) { setE(data); setT(new Date()); } });
    const ch = supabase.channel('emp').on('postgres_changes', { event: '*', schema: 'public', table: 'employees', filter: `id=eq.${id}` }, (p) => { if (p.new) { setE(p.new); setT(new Date()); } }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id]);

  if (!e) return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-spin h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  const days = e.iqama_expiry ? Math.ceil((new Date(e.iqama_expiry).getTime() - Date.now()) / 86400000) : 0;
  const st = days < 0 ? 'red' : days <= 30 ? 'orange' : 'green';
  const stT = days < 0 ? 'منتهية' : days <= 30 ? 'على وشك' : 'سارية';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8" dir="rtl">
      <div className="absolute top-4 left-4 flex items-center gap-2 text-white/60 text-sm"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /><span>Live | {t.toLocaleTimeString( 'en-US' )}</span></div>
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 flex items-center gap-8">
          <div className="relative">{e.personal_photo ? <img src={e.personal_photo} alt="" className="w-32 h-32 rounded-full object-cover border-4 border-white/30" /> : <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30"><User size={48} className="text-white/70" /></div>}</div>
          <div><h1 className="text-4xl font-bold text-white mb-2">{e.name}</h1><p className="text-white/70 text-xl">{e.job_title || 'غير محدد'}</p><span className={`mt-4 inline-block px-4 py-1.5 rounded-full text-sm font-bold ${st === 'green' ? 'bg-green-500/20 text-green-300' : st === 'orange' ? 'bg-orange-500/20 text-orange-300' : 'bg-red-500/20 text-red-300'}`}>{stT} ({Math.abs(days)} يوم)</span></div>
        </div>
        <div className="p-8 grid grid-cols-2 gap-4 text-white">
          <div className="bg-white/5 rounded-xl p-4"><span className="text-white/60 text-sm">رقم الإقامة</span><p className="font-bold">{e.iqama_number || '-'}</p></div>
          <div className="bg-white/5 rounded-xl p-4"><span className="text-white/60 text-sm">الجنسية</span><p className="font-bold">{e.nationality || '-'}</p></div>
          <div className="bg-white/5 rounded-xl p-4"><span className="text-white/60 text-sm">الهاتف</span><p className="font-bold">{e.phone || '-'}</p></div>
          <div className="bg-white/5 rounded-xl p-4"><span className="text-white/60 text-sm">البريد</span><p className="font-bold truncate">{e.email || '-'}</p></div>
          <div className="bg-white/5 rounded-xl p-4"><span className="text-white/60 text-sm">لوحة المركبة</span><p className="font-bold">{e.vehicle_plate || '-'}</p></div>
          <div className="bg-white/5 rounded-xl p-4"><span className="text-white/60 text-sm">انتهاء الإقامة</span><p className="font-bold">{e.iqama_expiry || '-'}</p></div>
        </div>
      </div>
    </div>
  );
}