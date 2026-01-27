"use client";

import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: `
            group relative flex items-center gap-4 p-5 rounded-2xl min-w-[380px] max-w-[500px]
            bg-white/95 backdrop-blur-xl border border-white/40
            shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2),0_10px_30px_-15px_rgba(0,0,0,0.1)]
            data-[type=success]:border-emerald-200/60 data-[type=success]:shadow-emerald-500/10
            data-[type=error]:border-rose-200/60 data-[type=error]:shadow-rose-500/10
            data-[type=warning]:border-amber-200/60 data-[type=warning]:shadow-amber-500/10
            data-[type=info]:border-sky-200/60 data-[type=info]:shadow-sky-500/10
            overflow-hidden
          `,
          title: "text-base font-bold text-slate-800",
          description: "text-sm text-slate-500 mt-0.5",
          actionButton: "bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all",
          cancelButton: "bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all",
          closeButton: "absolute top-3 left-3 p-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200 transition-all text-slate-500 hover:text-slate-700",
        },
      }}
      icons={{
        success: (
          <div className="flex-shrink-0 p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        ),
        info: (
          <div className="flex-shrink-0 p-2.5 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl shadow-lg shadow-sky-500/30">
            <Info className="w-5 h-5 text-white" />
          </div>
        ),
        warning: (
          <div className="flex-shrink-0 p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg shadow-amber-500/30">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
        ),
        error: (
          <div className="flex-shrink-0 p-2.5 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl shadow-lg shadow-rose-500/30">
            <XCircle className="w-5 h-5 text-white" />
          </div>
        ),
        loading: (
          <div className="flex-shrink-0 p-2.5 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl shadow-lg shadow-slate-500/30">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        ),
      }}
      closeButton
      richColors={false}
      expand={false}
      visibleToasts={5}
      gap={12}
      {...props}
    />
  );
};

export { Toaster };
