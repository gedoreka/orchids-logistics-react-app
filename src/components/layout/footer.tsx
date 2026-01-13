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

export function Footer() {
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ""));
    setCopiedPhone(id);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <footer className="w-full bg-white border-t border-gray-100 py-3 px-6 no-print mt-auto">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Branding */}
        <div className="flex items-center gap-2">
          <Truck size={14} className="text-[#3498db]" />
          <span className="text-[11px] font-black text-gray-800 tracking-tight">Logistics Systems Pro</span>
          <div className="w-[1px] h-3 bg-gray-200 mx-1" />
          <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold">
            <Copyright size={10} />
            <span>شركة زول اسبيد للانشطة المتعددة ©️ {new Date().getFullYear()}</span>
          </div>
        </div>

        {/* Center/Right: Quick Contacts */}
        <div className="flex items-center flex-wrap justify-center gap-6">
          <a 
            href="mailto:info@zoolspeed.com"
            className="flex items-center gap-1.5 text-gray-500 hover:text-[#3498db] transition-colors"
          >
            <Mail size={12} />
            <span className="text-[10px] font-bold">info@zoolspeed.com</span>
          </a>

          <button 
            onClick={() => copyToClipboard("+966534907721", "ksa")}
            className="flex items-center gap-1.5 text-gray-500 hover:text-[#2ecc71] transition-colors group"
          >
            <Phone size={12} />
            <span className="text-[10px] font-bold" dir="ltr">+966 53 490 7721</span>
            {copiedPhone === "ksa" ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="opacity-0 group-hover:opacity-100" />}
          </button>

          <button 
            onClick={() => copyToClipboard("+249921163000", "sdn")}
            className="flex items-center gap-1.5 text-gray-500 hover:text-[#2ecc71] transition-colors group"
          >
            <Phone size={12} />
            <span className="text-[10px] font-bold" dir="ltr">+249 92 116 3000</span>
            {copiedPhone === "sdn" ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="opacity-0 group-hover:opacity-100" />}
          </button>
        </div>

      </div>
    </footer>
  );
}
