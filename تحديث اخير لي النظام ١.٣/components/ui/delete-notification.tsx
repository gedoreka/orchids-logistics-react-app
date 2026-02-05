"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Trash2 
} from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType = "success" | "error" | "loading" | "confirm";

export interface DeleteNotificationState {
  show: boolean;
  type: NotificationType;
  title: string;
  message: string;
  onConfirm?: () => void;
  itemId?: number;
  itemName?: string;
  color?: "blue" | "teal" | "rose" | "amber" | "purple" | "emerald" | "cyan" | "indigo";
}

interface DeleteNotificationProps {
  notification: DeleteNotificationState;
  onClose: () => void;
  cancelLabel?: string;
  deleteLabel?: string;
  okLabel?: string;
  isRtl?: boolean;
}

const colorStyles: Record<string, { confirm: string; confirmBg: string; deleteBtn: string }> = {
  blue: {
    confirm: "border-blue-500",
    confirmBg: "bg-blue-100 text-blue-500",
    deleteBtn: "bg-blue-500 hover:bg-blue-600 shadow-blue-200"
  },
  teal: {
    confirm: "border-teal-500",
    confirmBg: "bg-teal-100 text-teal-500",
    deleteBtn: "bg-teal-500 hover:bg-teal-600 shadow-teal-200"
  },
  rose: {
    confirm: "border-rose-500",
    confirmBg: "bg-rose-100 text-rose-500",
    deleteBtn: "bg-rose-500 hover:bg-red-600 shadow-red-200"
  },
  indigo: {
    confirm: "border-indigo-500",
    confirmBg: "bg-indigo-100 text-indigo-500",
    deleteBtn: "bg-indigo-500 hover:bg-indigo-600 shadow-indigo-200"
  },
  amber: {
    confirm: "border-amber-500",
    confirmBg: "bg-amber-100 text-amber-500",
    deleteBtn: "bg-amber-500 hover:bg-amber-600 shadow-amber-200"
  },
  purple: {
    confirm: "border-purple-500",
    confirmBg: "bg-purple-100 text-purple-500",
    deleteBtn: "bg-purple-500 hover:bg-purple-600 shadow-purple-200"
  },
  emerald: {
    confirm: "border-emerald-500",
    confirmBg: "bg-emerald-100 text-emerald-500",
    deleteBtn: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200"
  },
  cyan: {
    confirm: "border-cyan-500",
    confirmBg: "bg-cyan-100 text-cyan-500",
    deleteBtn: "bg-cyan-500 hover:bg-cyan-600 shadow-cyan-200"
  }
};

export function DeleteNotification({
  notification,
  onClose,
  cancelLabel = "إلغاء",
  deleteLabel = "حذف",
  okLabel = "حسناً",
  isRtl = true
}: DeleteNotificationProps) {
  const color = notification.color || "rose";
  const styles = colorStyles[color] || colorStyles.rose;

  return (
    <AnimatePresence>
      {notification.show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
            onClick={() => notification.type !== "loading" && notification.type !== "confirm" && onClose()}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md p-4"
            dir={isRtl ? "rtl" : "ltr"}
          >
            <div className={cn(
              "bg-white rounded-[2rem] p-8 shadow-2xl border-t-4",
              notification.type === "success" ? "border-emerald-500" :
              notification.type === "error" ? "border-red-500" : 
              notification.type === "confirm" ? styles.confirm : "border-blue-500"
            )}>
              <div className="text-center">
                <div className={cn(
                  "h-20 w-20 rounded-full mx-auto mb-6 flex items-center justify-center",
                  notification.type === "success" ? "bg-emerald-100 text-emerald-500" :
                  notification.type === "error" ? "bg-red-100 text-red-500" : 
                  notification.type === "confirm" ? styles.confirmBg : "bg-blue-100 text-blue-500"
                )}>
                  {notification.type === "success" && <CheckCircle size={40} />}
                  {notification.type === "error" && <AlertCircle size={40} />}
                  {notification.type === "loading" && <Loader2 size={40} className="animate-spin" />}
                  {notification.type === "confirm" && <Trash2 size={40} />}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">{notification.title}</h3>
                <p className="text-gray-500 mb-6 font-medium whitespace-pre-line">{notification.message}</p>
                
                {notification.type === "confirm" && (
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200 transition-all"
                    >
                      {cancelLabel}
                    </button>
                    <button
                      onClick={() => notification.onConfirm && notification.onConfirm()}
                      className={cn(
                        "flex-1 py-4 rounded-2xl text-white font-black transition-all shadow-lg flex items-center justify-center gap-2",
                        "bg-red-500 hover:bg-red-600 shadow-red-200"
                      )}
                    >
                      <Trash2 size={18} />
                      {deleteLabel}
                    </button>
                  </div>
                )}
                
                {notification.type !== "loading" && notification.type !== "confirm" && (
                  <button
                    onClick={onClose}
                    className={cn(
                      "w-full py-4 rounded-2xl font-black text-white transition-all shadow-lg active:scale-95",
                      notification.type === "success" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                    )}
                  >
                    {okLabel}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export const useDeleteNotification = (initialColor: DeleteNotificationState["color"] = "rose") => {
  const [notification, setNotification] = React.useState<DeleteNotificationState>({
    show: false,
    type: "success",
    title: "",
    message: "",
    color: initialColor
  });

  const showNotification = (
    type: NotificationType, 
    title: string, 
    message: string, 
    onConfirm?: () => void, 
    itemId?: number, 
    itemName?: string
  ) => {
    setNotification({ 
      show: true, 
      type, 
      title, 
      message, 
      onConfirm, 
      itemId, 
      itemName,
      color: initialColor 
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const showDeleteConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    itemId?: number,
    itemName?: string
  ) => {
    showNotification("confirm", title, message, onConfirm, itemId, itemName);
  };

  const showLoading = (title: string, message: string) => {
    showNotification("loading", title, message);
  };

  const showSuccess = (title: string, message: string, autoHide = true) => {
    showNotification("success", title, message);
    if (autoHide) {
      setTimeout(hideNotification, 2000);
    }
  };

  const showError = (title: string, message: string) => {
    showNotification("error", title, message);
  };

  return {
    notification,
    showNotification,
    hideNotification,
    showDeleteConfirm,
    showLoading,
    showSuccess,
    showError
  };
};
