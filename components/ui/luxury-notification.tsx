"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Loader2, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Success Modal ───────────────────────────────────────────────────────────

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  autoClose?: number; // ms
}

export function SuccessModal({ open, onClose, title, message, autoClose = 2500 }: SuccessModalProps) {
  useEffect(() => {
    if (open && autoClose > 0) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [open, autoClose, onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-[380px] rounded-[2.5rem] bg-slate-900 p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-10 text-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10 }}>
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] mx-auto flex items-center justify-center mb-6 border border-white/30 shadow-2xl">
              <CheckCircle2 size={48} className="text-white" />
            </div>
          </motion.div>
          <h2 className="text-2xl font-black mb-2 tracking-tight">{title}</h2>
          {message && <p className="text-emerald-100 font-medium text-sm leading-relaxed">{message}</p>}
        </div>
        <div className="p-6 bg-slate-900 flex justify-center">
          <div className="h-1 w-24 bg-emerald-500/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-400 rounded-full"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: autoClose / 1000, ease: "linear" }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Error Modal ─────────────────────────────────────────────────────────────

interface ErrorModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message?: string;
}

export function ErrorModal({ open, onClose, title, message }: ErrorModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-[380px] rounded-[2.5rem] bg-slate-900 p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-rose-600 to-rose-700 p-10 text-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10 }}>
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] mx-auto flex items-center justify-center mb-6 border border-white/30 shadow-2xl">
              <XCircle size={48} className="text-white" />
            </div>
          </motion.div>
          <h2 className="text-2xl font-black mb-2 tracking-tight">{title}</h2>
          {message && <p className="text-rose-100 font-medium text-sm leading-relaxed">{message}</p>}
        </div>
        <div className="p-6 bg-slate-900">
          <Button
            onClick={onClose}
            className="w-full h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black text-sm"
          >
            <X size={16} className="mr-2" />
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
  loading?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
  confirmLabel = "حذف",
  cancelLabel = "إلغاء",
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="sm:max-w-[400px] rounded-[2.5rem] bg-slate-900 p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-rose-600 to-rose-700 p-10 text-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10 }}>
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] mx-auto flex items-center justify-center mb-6 border border-white/30 shadow-2xl">
              <AlertTriangle size={48} className="text-white animate-pulse" />
            </div>
          </motion.div>
          <h2 className="text-3xl font-black mb-3 tracking-tight">{title}</h2>
          {message && <p className="text-rose-100 font-medium text-sm leading-relaxed">{message}</p>}
        </div>
        <div className="p-10 bg-slate-900 flex flex-col gap-4">
          <Button
            className="h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xl shadow-xl shadow-rose-900/50 transition-all active:scale-95"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Loader2 size={20} className="animate-spin mr-2" /> : null}
            {confirmLabel}
          </Button>
          <Button
            variant="ghost"
            className="h-14 rounded-2xl font-black text-slate-400 hover:bg-white/5 text-lg"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Loading Modal ───────────────────────────────────────────────────────────

interface LoadingModalProps {
  open: boolean;
  title?: string;
}

export function LoadingModal({ open, title = "جاري التحميل..." }: LoadingModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="sm:max-w-[300px] rounded-[2.5rem] bg-slate-900 p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 text-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2rem] mx-auto flex items-center justify-center mb-6 border border-white/30 shadow-2xl">
              <Loader2 size={40} className="text-white" />
            </div>
          </motion.div>
          <h2 className="text-xl font-black tracking-tight">{title}</h2>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── In-App Notification Banner ──────────────────────────────────────────────

interface NotificationBannerProps {
  show: boolean;
  onClose: () => void;
  onAction?: () => void;
  title: string;
  message: string;
  actionLabel?: string;
  type?: "success" | "warning" | "info";
}

export function NotificationBanner({
  show,
  onClose,
  onAction,
  title,
  message,
  actionLabel,
  type = "success",
}: NotificationBannerProps) {
  const colorMap = {
    success: "from-emerald-600 to-emerald-700 border-emerald-500/30",
    warning: "from-amber-600 to-amber-700 border-amber-500/30",
    info: "from-blue-600 to-indigo-700 border-blue-500/30",
  };

  const iconMap = {
    success: <CheckCircle2 size={24} className="text-white" />,
    warning: <AlertTriangle size={24} className="text-white" />,
    info: <Loader2 size={24} className="text-white" />,
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className={cn(
            "fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-lg",
          )}
        >
          <div className={cn(
            "bg-gradient-to-r rounded-2xl border p-5 shadow-2xl backdrop-blur-xl flex items-center gap-4",
            colorMap[type]
          )}>
            <div className="p-2 bg-white/20 rounded-xl shrink-0">
              {iconMap[type]}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-black text-sm">{title}</h4>
              <p className="text-white/80 text-xs font-medium truncate">{message}</p>
            </div>
            {onAction && actionLabel && (
              <Button
                onClick={onAction}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white font-black text-xs rounded-xl border border-white/20 shrink-0"
              >
                {actionLabel}
              </Button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-all shrink-0"
            >
              <X size={14} className="text-white" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
