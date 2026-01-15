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
        <footer className="w-full bg-[#0f172a] border-t border-white/5 py-3 px-6 no-print mt-auto relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none" />
          <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">

          
          {/* Left: Branding */}
          <div className="flex items-center gap-2">
            <Truck size={14} className="text-blue-400" />
            <span className="text-[11px] font-black text-white/80 tracking-tight">Logistics Systems Pro</span>
            <div className="w-[1px] h-3 bg-white/10 mx-1" />
            <div className="flex items-center gap-1.5 text-white/30 text-[10px] font-bold">
              <Copyright size={10} />
                <span>Logistics Systems Pro ©️ 2026</span>
            </div>
          </div>

          {/* Center/Right: Quick Contacts */}
          <div className="flex items-center flex-wrap justify-center gap-6">
            <a 
              href="mailto:info@zoolspeed.com"
              className="flex items-center gap-1.5 text-white/40 hover:text-blue-400 transition-colors"
            >
              <Mail size={12} />
              <span className="text-[10px] font-bold">info@zoolspeed.com</span>
            </a>

            <button 
              onClick={() => copyToClipboard("+966534907721", "ksa")}
              className="flex items-center gap-1.5 text-white/40 hover:text-green-400 transition-colors group"
            >
              <Phone size={12} />
              <span className="text-[10px] font-bold" dir="ltr">+966 53 490 7721</span>
              {copiedPhone === "ksa" ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="opacity-0 group-hover:opacity-100" />}
            </button>

            <button 
              onClick={() => copyToClipboard("+249921163000", "sdn")}
              className="flex items-center gap-1.5 text-white/40 hover:text-green-400 transition-colors group"
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
