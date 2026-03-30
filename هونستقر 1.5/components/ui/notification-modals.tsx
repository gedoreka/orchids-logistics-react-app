"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Trash2,
  X,
  CheckCircle2,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Delete Confirmation Modal ─── */

interface DeleteConfirmModalProps {
  isOpen: boolean;
  itemTitle: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  itemTitle,
  isLoading = false,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.3)] overflow-hidden border-4 border-red-500/20"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-10 text-white text-center overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <AlertTriangle size={48} className="text-white drop-shadow-lg" />
                </motion.div>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-black tracking-tight relative z-10"
              >
                تأكيد الحذف
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/80 font-bold mt-2 relative z-10"
              >
                هذا الإجراء لا يمكن التراجع عنه
              </motion.p>
            </div>

            {/* Content */}
            <div className="p-8 text-center space-y-6">
              <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-6 border-2 border-red-100 dark:border-red-900/50">
                <p className="text-slate-700 dark:text-slate-300 font-bold text-lg leading-relaxed">
                  هل أنت متأكد من حذف
                </p>
                <p className="text-red-600 dark:text-red-400 font-black text-xl mt-2 truncate">
                  &quot;{itemTitle}&quot;
                </p>
              </div>

              <p className="text-slate-500 font-bold text-sm">
                سيتم الحذف نهائياً ولا يمكن التراجع عنه
              </p>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancel}
                  className="flex-1 flex items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={20} />
                  إلغاء
                </motion.button>
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 20px 40px rgba(239, 68, 68, 0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 via-rose-600 to-red-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-red-500/30 disabled:opacity-50 border-b-4 border-red-700/50"
                >
                  {isLoading ? (
                    <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 size={20} />
                      نعم، احذف
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── Success Modal ─── */

export type SuccessModalType = "delete" | "update" | "create" | null;

interface SuccessModalProps {
  isOpen: boolean;
  type?: SuccessModalType;
  title?: string;
  message?: string;
  onClose: () => void;
}

export function SuccessModal({ isOpen, type, title, message, onClose }: SuccessModalProps) {
  const isDelete = type === "delete";
  const isCreate = type === "create";
  const isGeneral = !type;

  const headingText = isGeneral
    ? (title || "تمت العملية بنجاح!")
    : isDelete
    ? "تم الحذف بنجاح!"
    : isCreate
    ? "تمت الإضافة بنجاح!"
    : "تم التحديث بنجاح!";

  const subText = isGeneral
    ? (message || "")
    : isDelete
    ? "تمت الإزالة من النظام"
    : isCreate
    ? "تمت إضافة العنصر للنظام"
    : "تم نشر التعديلات";

  const itemLabel = isGeneral
    ? ""
    : isDelete
    ? "العنصر المحذوف:"
    : isCreate
    ? "العنصر المضاف:"
    : "العنصر المحدّث:";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={cn(
                "relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border-4",
                isGeneral || isDelete || isCreate
                  ? "border-emerald-500/20 shadow-[0_0_100px_rgba(16,185,129,0.3)]"
                  : "border-blue-500/20 shadow-[0_0_100px_rgba(59,130,246,0.3)]"
              )}
          >
            {/* Header */}
            <div
              className={cn(
                "relative p-10 text-white text-center overflow-hidden",
                isGeneral || isDelete || isCreate
                  ? "bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700"
                  : "bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700"
              )}
            >
              {/* Animated particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{
                      y: -100,
                      opacity: [0, 1, 0],
                      x: Math.random() * 100 - 50,
                    }}
                    transition={{
                      delay: i * 0.2,
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 1,
                    }}
                    className="absolute"
                    style={{ left: `${15 + i * 15}%` }}
                  >
                    <Sparkles size={20} className="text-white/40" />
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, type: "spring", damping: 12 }}
                className="relative z-10 mx-auto w-28 h-28 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <CheckCircle2 size={56} className="text-white drop-shadow-lg" />
                </motion.div>
              </motion.div>

              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-black tracking-tight relative z-10"
              >
                {headingText}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-white/80 font-bold mt-2 relative z-10"
              >
                {subText}
              </motion.p>
            </div>

            {/* Content */}
            <div className="p-8 text-center space-y-6">
              {!isGeneral && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={cn(
                  "rounded-2xl p-6 border-2",
                  isDelete || isCreate
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50"
                    : "bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50"
                )}
              >
                <p className="text-slate-500 font-bold text-sm mb-2">
                  {itemLabel}
                </p>
                <p
                  className={cn(
                    "font-black text-xl truncate",
                    isDelete || isCreate
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-blue-600 dark:text-blue-400"
                  )}
                >
                  &quot;{title}&quot;
                </p>
              </motion.div>
              )}

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className={cn(
                  "w-full flex items-center justify-center gap-3 text-white py-5 rounded-2xl font-black text-xl shadow-xl border-b-4",
                  isGeneral || isDelete || isCreate
                    ? "bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 shadow-emerald-500/30 border-emerald-700/50"
                    : "bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-600 shadow-blue-500/30 border-blue-700/50"
                )}
              >
                <CheckCircle2 size={24} />
                حسناً
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── Loading Modal ─── */

interface LoadingModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
}

export function LoadingModal({
  isOpen,
  title = "جاري التحميل",
  message = "يرجى الانتظار...",
}: LoadingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(59,130,246,0.3)] overflow-hidden border-4 border-blue-500/20 p-10 text-center"
          >
            <div className="mx-auto w-24 h-24 bg-blue-50 dark:bg-blue-950/30 rounded-full flex items-center justify-center mb-6 border-4 border-blue-100 dark:border-blue-900/50">
              <Loader2 size={48} className="text-blue-500 animate-spin" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
              {title}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 font-bold">
              {message}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── Warning Modal ─── */

interface WarningModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  missingFields?: string[];
  onClose: () => void;
}

export function WarningModal({
  isOpen,
  title = "تنبيه",
  message = "",
  missingFields = [],
  onClose,
}: WarningModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(245,158,11,0.3)] overflow-hidden border-4 border-amber-500/20"
          >
            <div className="relative bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-10 text-white text-center overflow-hidden">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
              >
                <AlertTriangle size={48} className="text-white drop-shadow-lg" />
              </motion.div>
              <h3 className="text-3xl font-black tracking-tight relative z-10">
                {title}
              </h3>
              {message && (
                <p className="text-amber-100 mt-2 text-sm relative z-10">
                  {message}
                </p>
              )}
            </div>

            <div className="p-8 text-center space-y-6">
              {missingFields.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4 border-2 border-amber-100 dark:border-amber-900/50 text-right max-h-60 overflow-y-auto">
                  {missingFields.map((field, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 py-2 border-b border-amber-100 last:border-0"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {field}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-amber-500/30 border-b-4 border-amber-700/50"
              >
                حسناً
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── Confirm Modal ─── */

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  details?: React.ReactNode;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  isOpen,
  title = "تأكيد",
  message = "",
  details,
  isLoading = false,
  onConfirm,
  onCancel,
  confirmText = "تأكيد",
  cancelText = "إلغاء",
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(99,102,241,0.3)] overflow-hidden border-4 border-indigo-500/20"
          >
            <div className="relative bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 p-10 text-white text-center overflow-hidden">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
              >
                <AlertTriangle size={48} className="text-white drop-shadow-lg" />
              </motion.div>
              <h3 className="text-3xl font-black tracking-tight relative z-10">
                {title}
              </h3>
              {message && (
                <p className="text-indigo-100 mt-2 text-sm relative z-10">
                  {message}
                </p>
              )}
            </div>

            <div className="p-8 text-center space-y-6">
              {details && (
                <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-6 border-2 border-indigo-100 dark:border-indigo-900/50">
                  {details}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancel}
                  className="flex-1 flex items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-2xl font-black text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={20} />
                  {cancelText}
                </motion.button>
                <motion.button
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 20px 40px rgba(99, 102, 241, 0.4)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-500/30 disabled:opacity-50 border-b-4 border-indigo-700/50"
                >
                  {isLoading ? (
                    <div className="h-6 w-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={20} />
                      {confirmText}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── Error Modal ─── */

interface ErrorModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
}

export function ErrorModal({
  isOpen,
  title = "حدث خطأ",
  message = "حدث خطأ غير متوقع",
  onClose,
}: ErrorModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-[0_0_100px_rgba(239,68,68,0.3)] overflow-hidden border-4 border-red-500/20"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-red-500 via-rose-600 to-red-700 p-10 text-white text-center overflow-hidden">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 15 }}
                className="relative z-10 mx-auto w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-white/30"
              >
                <AlertCircle size={48} className="text-white drop-shadow-lg" />
              </motion.div>
              <h3 className="text-3xl font-black tracking-tight relative z-10">
                {title}
              </h3>
            </div>

            {/* Content */}
            <div className="p-8 text-center space-y-6">
              <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-6 border-2 border-red-100 dark:border-red-900/50">
                <p className="text-slate-700 dark:text-slate-300 font-bold text-lg leading-relaxed">
                  {message}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 via-rose-600 to-red-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-red-500/30 border-b-4 border-red-700/50"
              >
                حسناً
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
