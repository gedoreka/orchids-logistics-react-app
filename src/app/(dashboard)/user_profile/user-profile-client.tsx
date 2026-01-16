"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Building, 
  University, 
  IdCard, 
  FileText, 
  Save, 
  PlusCircle, 
  Edit, 
  Trash2, 
  X,
  User,
  Mail,
  Calendar,
  Phone,
  Globe,
  DollarSign,
  Flag,
  MapPin,
  Hash,
  Tag,
  Upload,
  Image as ImageIcon,
  Landmark,
  Briefcase,
  Shield,
  CheckCircle2,
  Zap,
  Eye,
  Download,
  FileCheck,
  Receipt,
  CreditCard,
  Loader2,
  ArrowLeft,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  updateCompanyProfile,
  updateCompanyFile,
  addBankAccount, 
  updateBankAccount, 
  deleteBankAccount,
  addLicense,
  updateLicense,
  deleteLicense
} from "@/lib/actions/company";

type TabType = "overview" | "bank" | "license" | "files";

interface Props {
  user: any;
  company: any;
  bankAccounts: any[];
  licenses: any[];
}

export function UserProfileClient({ user, company, bankAccounts: initialBankAccounts, licenses: initialLicenses }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isLicenseModalOpen, setIsLicenseModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<any>(null);
  const [editingLicense, setEditingLicense] = useState<any>(null);
  const [bankAccounts, setBankAccounts] = useState(initialBankAccounts);
  const [licenses, setLicenses] = useState(initialLicenses);
  const [companyState, setCompanyState] = useState(company);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [bankFormData, setBankFormData] = useState({
    bank_beneficiary: "",
    bank_name: "",
    bank_account: "",
    bank_iban: ""
  });

  const [licenseFormData, setLicenseFormData] = useState({
    license_number: "",
    license_type: "",
    start_date: "",
    end_date: "",
    license_image: ""
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "company-documents");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      
      // Update local state immediately for instant preview
      setCompanyState((prev: any) => ({ ...prev, [field]: data.url }));
      setHasChanges(true);
      toast.success("تم رفع الملف بنجاح");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("حدث خطأ أثناء رفع الملف");
    } finally {
      setUploadingField(null);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const res = await updateCompanyProfile(company.id, companyState);
      if (res.success) {
        toast.success("تم حفظ جميع التغييرات بنجاح");
        setHasChanges(false);
      } else {
        toast.error("فشل حفظ التغييرات: " + res.error);
      }
    } catch (error) {
      toast.error("حدث خطأ غير متوقع");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLicenseFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "company-documents");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setLicenseFormData(prev => ({ ...prev, license_image: data.url }));
      toast.success("تم رفع ملف الترخيص");
    } catch (error) {
      toast.error("فشل رفع الملف");
    }
  };

  const tabs = [
    { id: "overview" as TabType, label: "نظرة عامة", icon: <Building className="w-6 h-6" /> },
    { id: "bank" as TabType, label: "الحسابات البنكية", icon: <University className="w-6 h-6" /> },
    { id: "license" as TabType, label: "التراخيص", icon: <IdCard className="w-6 h-6" /> },
    { id: "files" as TabType, label: "الملفات والوثائق", icon: <FileText className="w-6 h-6" /> },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-4 md:p-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-blue-500/10 transition-colors duration-700"></div>
          
          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-3xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden group/logo">
                {companyState?.logo_path ? (
                  <img src={companyState.logo_path} alt="logo" className="w-full h-full object-contain p-3" />
                ) : (
                  <Building size={40} className="text-blue-500/40" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload size={20} className="text-white" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-xl border-4 border-white dark:border-slate-900 flex items-center justify-center text-white">
                <CheckCircle2 size={14} />
              </div>
            </div>

            <div className="text-center md:text-right">
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                {companyState?.name || "اسم الشركة"}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                  <Mail size={14} className="text-blue-500" />
                  {user?.email}
                </span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                  <Phone size={14} className="text-blue-500" />
                  {companyState?.phone || "لا يوجد هاتف"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 relative z-10">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 rounded-3xl border border-slate-100 dark:border-slate-800 text-center min-w-[140px]">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">السجل التجاري</p>
              <p className="font-black text-slate-900 dark:text-white text-lg">{companyState?.commercial_number || "---"}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-4 rounded-3xl border border-blue-100 dark:border-blue-900/30 text-center min-w-[140px]">
              <p className="text-blue-400 text-[10px] font-black uppercase tracking-wider mb-1">الرقم الضريبي</p>
              <p className="font-black text-blue-600 dark:text-blue-400 text-lg">{companyState?.vat_number?.slice(-6) || "---"}</p>
            </div>
          </div>
        </div>

        {/* Centered Modern Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex bg-white dark:bg-slate-900 p-2 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800 gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center w-24 h-24 rounded-[1.8rem] transition-all duration-500 group",
                    isActive 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 -translate-y-2" 
                      : "text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <div className={cn(
                    "mb-2 transition-transform duration-500",
                    isActive ? "scale-110" : "group-hover:scale-110"
                  )}>
                    {tab.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute -bottom-1 w-8 h-1 bg-white rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <CardSection title="بيانات المالك" icon={<User className="w-5 h-5" />}>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoTile label="الاسم الكامل" value={user?.name} icon={<User />} />
                    <InfoTile label="البريد الإلكتروني" value={user?.email} icon={<Mail />} />
                    <InfoTile label="تاريخ التسجيل" value={user?.created_at?.split('T')[0]} icon={<Calendar />} />
                    <InfoTile label="حالة العضوية" value="عضو متميز" icon={<Shield />} color="text-emerald-500" />
                  </div>
                </CardSection>

                <CardSection title="بيانات المنشأة" icon={<Building className="w-5 h-5" />}>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoTile label="الاسم التجاري" value={companyState?.name} icon={<Briefcase />} />
                    <InfoTile label="رقم السجل" value={companyState?.commercial_number} icon={<FileText />} />
                    <InfoTile label="الرقم الضريبي" value={companyState?.vat_number} icon={<Hash />} />
                    <InfoTile label="العملة الأساسية" value={companyState?.currency} icon={<DollarSign />} />
                  </div>
                </CardSection>

                <CardSection title="العناوين والتواصل" icon={<MapPin className="w-5 h-5" />} className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <InfoTile label="الدولة" value={companyState?.country} icon={<Flag />} />
                    <InfoTile label="المدينة/المنطقة" value={companyState?.region} icon={<MapPin />} />
                    <InfoTile label="الحي" value={companyState?.district} icon={<MapPin />} />
                    <InfoTile label="الموقع الإلكتروني" value={companyState?.website} icon={<Globe />} />
                  </div>
                </CardSection>
              </div>
            )}

            {activeTab === "bank" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                    <Landmark className="text-blue-500" />
                    إدارة الحسابات البنكية
                  </h3>
                  <button
                    onClick={() => {
                      setEditingBank(null);
                      setBankFormData({ bank_beneficiary: "", bank_name: "", bank_account: "", bank_iban: "" });
                      setIsBankModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95"
                  >
                    <PlusCircle size={18} />
                    إضافة حساب جديد
                  </button>
                </div>
                
                {bankAccounts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bankAccounts.map((bank) => (
                      <motion.div 
                        layout
                        key={bank.id} 
                        className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-lg group relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600">
                              <University size={24} />
                            </div>
                            <div>
                              <h4 className="font-black text-lg text-slate-900 dark:text-white">{bank.bank_name}</h4>
                              <p className="text-sm text-slate-400 font-medium">{bank.bank_beneficiary}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setEditingBank(bank);
                                setBankFormData({ ...bank });
                                setIsBankModalOpen(true);
                              }} 
                              className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={async () => {
                                if(confirm("هل تريد حذف هذا الحساب؟")) {
                                  const res = await deleteBankAccount(bank.id, company.id);
                                  if(res.success) {
                                    setBankAccounts(prev => prev.filter(b => b.id !== bank.id));
                                    toast.success("تم الحذف");
                                  }
                                }
                              }}
                              className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">رقم الحساب</p>
                            <p className="font-black text-slate-800 dark:text-slate-200">{bank.bank_account}</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">IBAN</p>
                            <p className="font-black text-slate-800 dark:text-slate-200 text-xs truncate">{bank.bank_iban}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <EmptyContent message="لا توجد حسابات بنكية مضافة حالياً" icon={<Landmark className="w-12 h-12" />} />
                )}
              </div>
            )}

            {activeTab === "license" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                    <Shield className="text-purple-500" />
                    التراخيص والشهادات
                  </h3>
                  <button
                    onClick={() => {
                      setEditingLicense(null);
                      setLicenseFormData({ license_number: "", license_type: "", start_date: "", end_date: "", license_image: "" });
                      setIsLicenseModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-purple-500/20 transition-all active:scale-95"
                  >
                    <PlusCircle size={18} />
                    إضافة ترخيص
                  </button>
                </div>

                {licenses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {licenses.map((license) => (
                      <motion.div 
                        layout
                        key={license.id} 
                        className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-lg group relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-2 h-full bg-purple-500"></div>
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600">
                              <IdCard size={24} />
                            </div>
                            <div>
                              <h4 className="font-black text-lg text-slate-900 dark:text-white">{license.license_type}</h4>
                              <p className="text-sm text-slate-400 font-medium">رقم: {license.license_number}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                setEditingLicense(license);
                                setLicenseFormData({ ...license });
                                setIsLicenseModalOpen(true);
                              }}
                              className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-all"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={async () => {
                                if(confirm("هل تريد حذف هذا الترخيص؟")) {
                                  const res = await deleteLicense(license.id, company.id);
                                  if(res.success) {
                                    setLicenses(prev => prev.filter(l => l.id !== license.id));
                                    toast.success("تم الحذف");
                                  }
                                }
                              }}
                              className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">تاريخ الإصدار</p>
                            <p className="font-black text-slate-800 dark:text-slate-200">{license.start_date || "---"}</p>
                          </div>
                          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">تاريخ الانتهاء</p>
                            <p className="font-black text-slate-800 dark:text-slate-200">{license.end_date || "---"}</p>
                          </div>
                        </div>
                        {license.license_image && (
                          <div className="flex gap-2">
                            <a href={license.license_image} target="_blank" className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-black hover:bg-blue-100 transition-all">
                              <Eye size={14} /> عرض الملف
                            </a>
                            <a href={license.license_image} download className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-black hover:bg-emerald-100 transition-all">
                              <Download size={14} /> تحميل
                            </a>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <EmptyContent message="لا توجد تراخيص مضافة" icon={<Shield className="w-12 h-12" />} />
                )}
              </div>
            )}

            {activeTab === "files" && (
              <div className="space-y-12">
                <CardSection title="هوية المنشأة" icon={<ImageIcon className="w-5 h-5" />}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FileUploader 
                      label="شعار المنشأة" 
                      field="logo_path" 
                      value={companyState?.logo_path} 
                      onUpload={handleFileUpload} 
                      isUploading={uploadingField === "logo_path"}
                      description="يفضل أن يكون بخلفية شفافة PNG"
                    />
                    <FileUploader 
                      label="ختم الشركة" 
                      field="stamp_path" 
                      value={companyState?.stamp_path} 
                      onUpload={handleFileUpload} 
                      isUploading={uploadingField === "stamp_path"}
                    />
                    <FileUploader 
                      label="توقيع المدير" 
                      field="digital_seal_path" 
                      value={companyState?.digital_seal_path} 
                      onUpload={handleFileUpload} 
                      isUploading={uploadingField === "digital_seal_path"}
                    />
                  </div>
                </CardSection>

                <CardSection title="الوثائق الرسمية" icon={<FileCheck className="w-5 h-5" />}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FileUploader 
                      label="السجل التجاري" 
                      field="commercial_register_image" 
                      value={companyState?.commercial_register_image} 
                      onUpload={handleFileUpload} 
                      isUploading={uploadingField === "commercial_register_image"}
                    />
                    <FileUploader 
                      label="شهادة الضريبة" 
                      field="vat_certificate_image" 
                      value={companyState?.vat_certificate_image} 
                      onUpload={handleFileUpload} 
                      isUploading={uploadingField === "vat_certificate_image"}
                    />
                    <FileUploader 
                      label="بطاقة الآيبان" 
                      field="bank_account_image" 
                      value={companyState?.bank_account_image} 
                      onUpload={handleFileUpload} 
                      isUploading={uploadingField === "bank_account_image"}
                    />
                  </div>
                </CardSection>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating Save All Button */}
      <AnimatePresence>
        {hasChanges && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] w-full max-w-md px-4"
          >
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white py-5 rounded-[2rem] shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-4 font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save className="w-6 h-6" />
              )}
              {isSaving ? "جاري الحفظ..." : "حفظ كافة التغييرات"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <Modal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} title={editingBank ? "تعديل حساب" : "إضافة حساب"}>
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          let res;
          if(editingBank) res = await updateBankAccount(editingBank.id, company.id, bankFormData);
          else res = await addBankAccount(company.id, bankFormData);
          
          if(res.success) {
            toast.success("تم الحفظ");
            window.location.reload();
          }
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="اسم البنك" value={bankFormData.bank_name} onChange={v => setBankFormData({...bankFormData, bank_name: v})} required />
            <FormInput label="المستفيد" value={bankFormData.bank_beneficiary} onChange={v => setBankFormData({...bankFormData, bank_beneficiary: v})} required />
            <FormInput label="رقم الحساب" value={bankFormData.bank_account} onChange={v => setBankFormData({...bankFormData, bank_account: v})} required />
            <FormInput label="IBAN" value={bankFormData.bank_iban} onChange={v => setBankFormData({...bankFormData, bank_iban: v})} required />
          </div>
          <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black mt-4">حفظ</button>
        </form>
      </Modal>

      <Modal isOpen={isLicenseModalOpen} onClose={() => setIsLicenseModalOpen(false)} title={editingLicense ? "تعديل ترخيص" : "إضافة ترخيص"}>
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          let res;
          if(editingLicense) res = await updateLicense(editingLicense.id, company.id, licenseFormData);
          else res = await addLicense(company.id, licenseFormData);
          
          if(res.success) {
            toast.success("تم الحفظ");
            window.location.reload();
          }
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="نوع الترخيص" value={licenseFormData.license_type} onChange={v => setLicenseFormData({...licenseFormData, license_type: v})} required />
            <FormInput label="رقم الترخيص" value={licenseFormData.license_number} onChange={v => setLicenseFormData({...licenseFormData, license_number: v})} required />
            <FormInput label="تاريخ البداية" type="date" value={licenseFormData.start_date} onChange={v => setLicenseFormData({...licenseFormData, start_date: v})} />
            <FormInput label="تاريخ الانتهاء" type="date" value={licenseFormData.end_date} onChange={v => setLicenseFormData({...licenseFormData, end_date: v})} />
          </div>
          <div className="mt-4">
            <label className="text-sm font-black text-slate-500 mb-2 block">ملف الترخيص</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
              {licenseFormData.license_image ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="text-emerald-500 w-10 h-10" />
                  <p className="text-sm font-black text-slate-700">تم رفع الملف</p>
                  <button type="button" onClick={() => setLicenseFormData({...licenseFormData, license_image: ""})} className="text-red-500 text-xs font-bold">حذف واستبدال</button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="mx-auto text-slate-300 w-10 h-10 mb-2" />
                  <p className="text-sm text-slate-400 font-bold">اضغط هنا لرفع صورة الترخيص</p>
                  <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleLicenseFileUpload} />
                </label>
              )}
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-purple-600 text-white rounded-2xl font-black mt-4">حفظ الترخيص</button>
        </form>
      </Modal>
    </div>
  );
}

// Components
function CardSection({ title, icon, children, className }: any) {
  return (
    <div className={cn("bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden", className)}>
      <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
          {icon}
        </div>
        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{title}</h3>
      </div>
      <div className="p-8">{children}</div>
    </div>
  );
}

function InfoTile({ label, value, icon, color, description }: any) {
  return (
    <div className="group bg-slate-50 dark:bg-slate-800/40 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-blue-500/50 group-hover:text-blue-500 transition-colors">
          {React.cloneElement(icon, { size: 16 })}
        </div>
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
      </div>
      <p className={cn("text-base font-black truncate", color || "text-slate-800 dark:text-white")}>
        {value || "---"}
      </p>
      {description && <p className="text-[10px] text-slate-400 mt-1 font-medium">{description}</p>}
    </div>
  );
}

function FileUploader({ label, field, value, onUpload, isUploading, description }: any) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div className="flex flex-col items-center">
      <div 
        className={cn(
          "w-full aspect-square rounded-[3rem] border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 group/upload",
          value ? "border-emerald-500/30 bg-emerald-50/10" : "border-slate-200 hover:border-blue-400 bg-slate-50/50"
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <span className="text-xs font-black text-blue-500 animate-pulse">جاري الرفع...</span>
          </div>
        ) : value ? (
          <div className="w-full h-full p-6 flex flex-col items-center justify-center gap-4 relative">
            <img src={value} alt={label} className="max-w-full max-h-[140px] object-contain drop-shadow-2xl" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/upload:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
              <button 
                onClick={() => inputRef.current?.click()}
                className="bg-white text-black px-6 py-2 rounded-full text-xs font-black flex items-center gap-2 hover:scale-110 transition-transform"
              >
                <Edit size={14} /> استبدال
              </button>
              <a href={value} target="_blank" className="text-white text-[10px] font-bold hover:underline">عرض الملف الحالي</a>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl shadow-lg flex items-center justify-center text-slate-300 group-hover/upload:text-blue-500 group-hover/upload:scale-110 transition-all">
              <Upload size={32} />
            </div>
            <div className="text-center">
              <span className="text-sm font-black text-slate-700 dark:text-slate-300 block mb-1">اضغط للرفع</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</span>
            </div>
          </button>
        )}
        <input ref={inputRef} type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => onUpload(e, field)} />
      </div>
      {description && <p className="text-[10px] text-slate-400 mt-3 font-bold">{description}</p>}
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text", required = false }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">{label}</label>
      <input 
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm font-black text-slate-800 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
      />
    </div>
  );
}

function EmptyContent({ message, icon }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-800/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
      <div className="text-slate-200 dark:text-slate-700 mb-6">{icon}</div>
      <p className="text-slate-400 font-black tracking-tight">{message}</p>
    </div>
  );
}

function Modal({ isOpen, onClose, title, children }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden"
      >
        <div className="px-10 py-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-10">{children}</div>
      </motion.div>
    </div>
  );
}
