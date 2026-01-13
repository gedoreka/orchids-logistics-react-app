"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Building, 
  Hash, 
  IdCard, 
  Globe, 
  Package, 
  Phone, 
  Mail, 
  Car, 
  Calendar,
  AlertTriangle,
  LayoutDashboard,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Printer,
  Home,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface DigitalIdClientProps {
  employee: any;
  allEmployees: any[];
}

export function DigitalIdClient({ employee, allEmployees }: DigitalIdClientProps) {
  const currentIndex = allEmployees.findIndex(e => e.id === employee.id);
  const prevEmployee = currentIndex > 0 ? allEmployees[currentIndex - 1] : null;
  const nextEmployee = currentIndex < allEmployees.length - 1 ? allEmployees[currentIndex + 1] : null;

  const handlePrint = () => {
    window.print();
  };

  const getExpiryDays = (date: string) => {
    if (!date) return null;
    return Math.round((new Date(date).getTime() - new Date().getTime()) / 86400000);
  };

  const expiryDays = getExpiryDays(employee.iqama_expiry);

  return (
    <div className="space-y-6 pb-20 max-w-[1600px] mx-auto px-4 print:p-0 print:max-w-full">
      
      {/* Navigation - Hidden on print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-400">
          <Link href="/hr" className="hover:text-[#9b59b6] transition-colors flex items-center gap-1">
            <LayoutDashboard size={14} />
            شؤون الموظفين
          </Link>
          <ArrowRight size={14} />
          <span className="text-[#9b59b6]">الهوية الرقمية</span>
        </div>

        <div className="flex items-center gap-2">
          {prevEmployee && (
            <Link href={`/hr/digital-id/${prevEmployee.id}`}>
              <button className="h-10 px-4 rounded-xl bg-white border border-gray-100 text-xs font-black text-gray-500 hover:border-[#9b59b6] hover:text-[#9b59b6] transition-all flex items-center gap-2 shadow-sm">
                <ChevronRight size={16} />
                الموظف السابق
              </button>
            </Link>
          )}
          <button 
            onClick={handlePrint}
            className="h-10 px-5 rounded-xl bg-gray-900 text-white text-xs font-black shadow-lg shadow-gray-900/20 hover:bg-black transition-all flex items-center gap-2"
          >
            <Printer size={16} />
            طباعة البطاقة
          </button>
          {nextEmployee && (
            <Link href={`/hr/digital-id/${nextEmployee.id}`}>
              <button className="h-10 px-4 rounded-xl bg-white border border-gray-100 text-xs font-black text-gray-500 hover:border-[#9b59b6] hover:text-[#9b59b6] transition-all flex items-center gap-2 shadow-sm">
                الموظف التالي
                <ChevronLeft size={16} />
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* ID Card Wrapper */}
      <div className="id-card-print-container relative">
        
        {/* Main ID Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2.5rem] shadow-2xl border-8 border-white overflow-hidden relative"
        >
          {/* Card Header Background Decor */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-br from-[#2c3e50] to-[#34495e]" />
          
          {/* Gold Top Bar */}
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-400 z-20" />

          <div className="relative z-10 p-8 space-y-8">
            {/* Company Info */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="h-20 w-24 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 flex items-center justify-center">
                {employee.company_logo ? (
                  <img src={employee.company_logo} alt={employee.company_name} className="h-full w-full object-contain" />
                ) : (
                  <Building size={32} className="text-white/50" />
                )}
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-white tracking-tight uppercase">{employee.company_name}</h2>
                <p className="text-blue-300/70 text-[10px] font-black uppercase tracking-[0.3em]">Employee Identification Card</p>
              </div>
            </div>

            {/* Employee Main Info Row */}
            <div className="flex flex-col md:flex-row items-center gap-10 bg-gray-50/50 rounded-[2rem] p-8 border border-gray-100/50">
              {/* Photo */}
              <div className="relative group">
                <div className="h-56 w-48 rounded-[2rem] bg-white p-1 shadow-2xl border-2 border-yellow-400/30 overflow-hidden relative z-10">
                  <img 
                    src={employee.personal_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.name)}&background=2c3e50&color=fff&size=256`} 
                    alt={employee.name}
                    className="h-full w-full object-cover rounded-[1.75rem]"
                  />
                </div>
                <div className="absolute -inset-4 bg-yellow-400/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Basic Details */}
              <div className="flex-1 space-y-6 text-center md:text-right">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-gray-900 tracking-tight">{employee.name}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-wider">
                      {employee.job_title || 'موظف'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      employee.is_active === 1 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {employee.is_active === 1 ? 'نشط' : 'في إجازة'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <IDDetail icon={<IdCard size={14} />} label="رقم الإقامة" value={employee.iqama_number} />
                  <IDDetail icon={<Hash size={14} />} label="الرقم الوظيفي" value={employee.user_code} />
                  <IDDetail icon={<Globe size={14} />} label="الجنسية" value={employee.nationality} />
                  <IDDetail icon={<Package size={14} />} label="الباقة" value={employee.group_name} />
                </div>
              </div>
            </div>

            {/* Additional Contact/Status Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ContactPill icon={<Phone size={14} />} label="الجوال" value={employee.phone} />
              <ContactPill icon={<Mail size={14} />} label="البريد" value={employee.email} />
              <ContactPill icon={<Car size={14} />} label="المركبة" value={employee.vehicle_plate} />
            </div>

            {/* Expiry Alert */}
            {expiryDays !== null && expiryDays <= 30 && (
              <div className={`p-4 rounded-2xl border flex items-center gap-4 animate-pulse ${
                expiryDays <= 0 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-orange-50 border-orange-100 text-orange-600'
              }`}>
                <AlertTriangle size={24} />
                <div className="text-right">
                  <p className="text-xs font-black uppercase tracking-tight">تنبيه صلاحية الإقامة</p>
                  <p className="text-sm font-bold">
                    {expiryDays <= 0 
                      ? `منتهية منذ ${Math.abs(expiryDays)} يوم` 
                      : `ستنتهي خلال ${expiryDays} يوم`}
                  </p>
                </div>
              </div>
            )}

            {/* Back Button - Hidden on print */}
            <div className="pt-4 flex justify-between items-center print:hidden">
              <Link href="/hr">
                <button className="h-12 px-6 rounded-2xl bg-gray-50 text-gray-400 text-xs font-black hover:bg-gray-100 transition-all flex items-center gap-2">
                  <Home size={16} />
                  الرئيسية
                </button>
              </Link>
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                <CheckCircle2 size={12} />
                Verified Digital Identity
              </div>
            </div>
          </div>

          {/* Bottom Branding */}
          <div className="h-4 bg-gradient-to-r from-[#2c3e50] via-[#3498db] to-[#2c3e50]" />
        </motion.div>

        {/* Floating QR Code Placeholder (Future) */}
        <div className="absolute top-4 right-4 z-20 opacity-10">
          <div className="h-16 w-16 bg-black rounded-lg" />
        </div>
      </div>

      {/* Printing Styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; margin: 0; padding: 0; }
          .id-card-print-container { transform: scale(0.9); transform-origin: top center; }
          header, footer, nav, .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function IDDetail({ icon, label, value }: any) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex items-center gap-3">
      <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
        {icon}
      </div>
      <div className="text-right">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-tight">{label}</p>
        <p className="text-xs font-black text-gray-900">{value || '---'}</p>
      </div>
    </div>
  );
}

function ContactPill({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100 group hover:bg-white hover:border-[#3498db]/30 transition-all">
      <div className="text-gray-300 group-hover:text-[#3498db] transition-colors">
        {icon}
      </div>
      <div className="text-right truncate">
        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-[10px] font-black text-gray-900 truncate">{value || '---'}</p>
      </div>
    </div>
  );
}
