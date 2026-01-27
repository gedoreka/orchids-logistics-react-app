"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface InstructionItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface PageInstructionsProps {
  title: string;
  instructions: InstructionItem[];
  triggerText?: string;
  className?: string;
}

export function PageInstructions({
  title,
  instructions,
  triggerText = "عرض تعليمات الصفحة",
  className,
}: PageInstructionsProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-300 group shadow-lg backdrop-blur-md",
            className
          )}
        >
          <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/40 transition-colors">
            <HelpCircle size={18} className="text-blue-400 group-hover:text-blue-300" />
          </div>
          <span className="text-sm font-black tracking-tight">{triggerText}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-[#f8fafc] p-0 border-none rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-[#1e293b] to-[#334155] p-8 text-white relative">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-2">
              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shadow-inner">
                <Sparkles size={24} className="text-amber-400" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-white">{title}</DialogTitle>
                <p className="text-blue-200/60 text-xs font-bold uppercase tracking-widest mt-1">دليل الاستخدام والمميزات</p>
              </div>
            </div>
          </DialogHeader>
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 gap-4">
            {instructions.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                key={index}
                className="group p-6 rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 flex items-start gap-5"
              >
                <div className="h-14 w-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-inner">
                  {item.icon}
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-black text-gray-900 flex items-center gap-2">
                    {item.title}
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </h4>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="p-6 bg-white border-t border-gray-50 flex justify-center">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Logistics Systems Pro • الذكاء في إدارة اللوجستيات</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
