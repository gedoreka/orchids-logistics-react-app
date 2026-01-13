"use client";

import React, { useState } from "react";
import { 
  Truck, 
  Mail, 
  Phone, 
  Copy, 
  Check, 
  Copyright 
} from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ""));
    setCopiedPhone(id);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <footer className="w-full bg-[#2c3e50] text-white py-10 px-6 mt-auto border-t border-white/5 no-print">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
        
        {/* Left Section: Logo & Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#1abc9c] p-2 rounded-xl">
              <Truck size={24} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">Logistics Systems Pro</span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm font-medium">
            نظام متكامل لإدارة الموظفين والشحن اللوجستي بتقنيات متطورة تضمن كفاءة التشغيل ودقة البيانات.
          </p>
        </div>

        {/* Right Section: Contact */}
        <div className="flex-1 w-full md:w-auto space-y-6">
          <h4 className="text-sm font-black uppercase tracking-widest text-[#1abc9c]">تواصل معنا</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a 
              href="mailto:info@zoolspeed.com"
              className="group flex items-center gap-3 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5"
            >
                <div className="p-2 bg-[#3498db]/20 rounded-lg text-[#3498db] group-hover:scale-110 transition-transform">
                  <Mail size={18} />
                </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 font-bold uppercase">البريد الإلكتروني</span>
                <span className="text-xs font-bold">info@zoolspeed.com</span>
              </div>
            </a>

            <button 
              onClick={() => copyToClipboard("+966534907721", "ksa")}
              className="group flex items-center gap-3 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 text-right"
            >
              <div className="p-2 bg-[#2ecc71]/20 rounded-lg text-[#2ecc71] group-hover:scale-110 transition-transform">
                <Phone size={18} />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[10px] text-white/40 font-bold uppercase">المملكة العربية السعودية</span>
                <span className="text-xs font-bold" dir="ltr">+966 53 490 7721</span>
              </div>
              {copiedPhone === "ksa" ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-white/20 group-hover:text-white" />}
            </button>

            <button 
              onClick={() => copyToClipboard("+249921163000", "sdn")}
              className="group flex items-center gap-3 p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/5 text-right"
            >
              <div className="p-2 bg-[#2ecc71]/20 rounded-lg text-[#2ecc71] group-hover:scale-110 transition-transform">
                <Phone size={18} />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[10px] text-white/40 font-bold uppercase">جمهورية السودان</span>
                <span className="text-xs font-bold" dir="ltr">+249 92 116 3000</span>
              </div>
              {copiedPhone === "sdn" ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-white/20 group-hover:text-white" />}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-white/40 text-xs font-bold">
          <Copyright size={14} />
          <span>جميع الحقوق محفوظة لصالح : شركة زول اسبيد للانشطة المتعددة المحدودة ©️ {new Date().getFullYear()}</span>
        </div>
        
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-black text-[#1abc9c] uppercase tracking-tighter">Logistics Systems Pro</span>
          </div>
      </div>
    </footer>
  );
}
