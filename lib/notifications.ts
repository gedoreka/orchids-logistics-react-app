import { toast } from "sonner";

export type NotificationType = "success" | "error" | "warning" | "info";

interface NotifyOptions {
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const notify = {
  success: (options: NotifyOptions | string) => {
    const opts = typeof options === "string" ? { title: options } : options;
    toast.success(opts.title, {
      description: opts.description,
      duration: opts.duration || 4000,
      action: opts.action ? { label: opts.action.label, onClick: opts.action.onClick } : undefined,
    });
  },

  error: (options: NotifyOptions | string) => {
    const opts = typeof options === "string" ? { title: options } : options;
    toast.error(opts.title, {
      description: opts.description,
      duration: opts.duration || 5000,
      action: opts.action ? { label: opts.action.label, onClick: opts.action.onClick } : undefined,
    });
  },

  warning: (options: NotifyOptions | string) => {
    const opts = typeof options === "string" ? { title: options } : options;
    toast.warning(opts.title, {
      description: opts.description,
      duration: opts.duration || 4500,
      action: opts.action ? { label: opts.action.label, onClick: opts.action.onClick } : undefined,
    });
  },

  info: (options: NotifyOptions | string) => {
    const opts = typeof options === "string" ? { title: options } : options;
    toast.info(opts.title, {
      description: opts.description,
      duration: opts.duration || 4000,
      action: opts.action ? { label: opts.action.label, onClick: opts.action.onClick } : undefined,
    });
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (toastId?: string | number) => {
    toast.dismiss(toastId);
  },

  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, options);
  },

  login: {
    success: (userName?: string) => {
      toast.success("تم تسجيل الدخول بنجاح", {
        description: userName ? `مرحباً ${userName}` : "مرحباً بك مجدداً",
        duration: 4000,
      });
    },
    error: (message?: string) => {
      toast.error("فشل تسجيل الدخول", {
        description: message || "تحقق من بيانات الدخول وحاول مرة أخرى",
        duration: 5000,
      });
    },
    sessionExpired: () => {
      toast.warning("انتهت الجلسة", {
        description: "يرجى تسجيل الدخول مرة أخرى",
        duration: 5000,
      });
    },
  },

  form: {
    success: (message?: string) => {
      toast.success("تم الحفظ بنجاح", {
        description: message || "تم حفظ البيانات بنجاح",
        duration: 4000,
      });
    },
    error: (message?: string) => {
      toast.error("خطأ في الحفظ", {
        description: message || "تحقق من البيانات المدخلة",
        duration: 5000,
      });
    },
    validation: (message: string) => {
      toast.warning("تنبيه", {
        description: message,
        duration: 4500,
      });
    },
  },

  data: {
    saved: (entity?: string) => {
      toast.success("تم الحفظ", {
        description: entity ? `تم حفظ ${entity} بنجاح` : "تم حفظ البيانات بنجاح",
        duration: 4000,
      });
    },
    updated: (entity?: string) => {
      toast.success("تم التحديث", {
        description: entity ? `تم تحديث ${entity} بنجاح` : "تم تحديث البيانات بنجاح",
        duration: 4000,
      });
    },
    deleted: (entity?: string) => {
      toast.success("تم الحذف", {
        description: entity ? `تم حذف ${entity} بنجاح` : "تم حذف البيانات بنجاح",
        duration: 4000,
      });
    },
    loadError: (message?: string) => {
      toast.error("خطأ في التحميل", {
        description: message || "تعذر تحميل البيانات",
        duration: 5000,
      });
    },
  },

  invoice: {
    created: (invoiceNumber?: string) => {
      toast.success("تم إنشاء الفاتورة", {
        description: invoiceNumber ? `رقم الفاتورة: ${invoiceNumber}` : "تم إنشاء الفاتورة بنجاح",
        duration: 4000,
      });
    },
    sent: () => {
      toast.success("تم الإرسال", {
        description: "تم إرسال الفاتورة بنجاح",
        duration: 4000,
      });
    },
    printed: () => {
      toast.success("تمت الطباعة", {
        description: "تم إرسال الفاتورة للطباعة",
        duration: 3000,
      });
    },
  },

  payment: {
    success: (amount?: string) => {
      toast.success("تمت العملية بنجاح", {
        description: amount ? `تم تسجيل مبلغ ${amount}` : "تم تسجيل العملية المالية",
        duration: 4000,
      });
    },
    error: (message?: string) => {
      toast.error("فشلت العملية", {
        description: message || "تعذر إتمام العملية المالية",
        duration: 5000,
      });
    },
  },

  system: {
    networkError: () => {
      toast.error("خطأ في الاتصال", {
        description: "تحقق من اتصالك بالإنترنت",
        duration: 5000,
      });
    },
    serverError: () => {
      toast.error("خطأ في الخادم", {
        description: "حدث خطأ، حاول مرة أخرى لاحقاً",
        duration: 5000,
      });
    },
    maintenance: () => {
      toast.info("صيانة النظام", {
        description: "النظام تحت الصيانة، يرجى المحاولة لاحقاً",
        duration: 6000,
      });
    },
  },
};

export { toast };
