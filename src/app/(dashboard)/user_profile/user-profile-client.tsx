"use client";

import React, { useState, useRef } from "react";
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
  Loader2
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
      
      const updateRes = await updateCompanyFile(company.id, field, data.url);
      
      if (updateRes.success) {
        setCompanyState((prev: any) => ({ ...prev, [field]: data.url }));
        toast.success("تم رفع الملف بنجاح");
      } else {
        toast.error("فشل في حفظ الملف");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("حدث خطأ أثناء رفع الملف");
    } finally {
      setUploadingField(null);
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
      toast.success("تم رفع الملف");
    } catch (error) {
      toast.error("فشل رفع الملف");
    }
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let res;
    if (editingBank) {
      res = await updateBankAccount(editingBank.id, company.id, bankFormData);
      if (res.success) {
        setBankAccounts(prev => prev.map(b => b.id === editingBank.id ? { ...b, ...bankFormData } : b));
      }
    } else {
      res = await addBankAccount(company.id, bankFormData);
      if (res.success) {
        window.location.reload();
      }
    }

    if (res.success) {
      toast.success(editingBank ? "تم تحديث الحساب البنكي" : "تم إضافة الحساب البنكي");
      setIsBankModalOpen(false);
      setEditingBank(null);
      setBankFormData({ bank_beneficiary: "", bank_name: "", bank_account: "", bank_iban: "" });
    } else {
      toast.error("حدث خطأ");
    }
  };

  const handleDeleteBank = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الحساب؟")) {
      const res = await deleteBankAccount(id, company.id);
      if (res.success) {
        setBankAccounts(prev => prev.filter(b => b.id !== id));
        toast.success("تم الحذف بنجاح");
      } else {
        toast.error("حدث خطأ");
      }
    }
  };

  const handleLicenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let res;
    if (editingLicense) {
      res = await updateLicense(editingLicense.id, company.id, licenseFormData);
      if (res.success) {
        setLicenses(prev => prev.map(l => l.id === editingLicense.id ? { ...l, ...licenseFormData } : l));
      }
    } else {
      res = await addLicense(company.id, licenseFormData);
      if (res.success) {
        window.location.reload();
      }
    }

    if (res.success) {
      toast.success(editingLicense ? "تم تحديث الترخيص" : "تم إضافة الترخيص");
      setIsLicenseModalOpen(false);
      setEditingLicense(null);
      setLicenseFormData({ license_number: "", license_type: "", start_date: "", end_date: "", license_image: "" });
    } else {
      toast.error("حدث خطأ");
    }
  };

  const handleDeleteLicense = async (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الترخيص؟")) {
      const res = await deleteLicense(id, company.id);
      if (res.success) {
        setLicenses(prev => prev.filter(l => l.id !== id));
        toast.success("تم الحذف بنجاح");
      } else {
        toast.error("حدث خطأ");
      }
    }
  };

  const openBankModal = (bank: any = null) => {
    if (bank) {
      setEditingBank(bank);
      setBankFormData({
        bank_beneficiary: bank.bank_beneficiary,
        bank_name: bank.bank_name,
        bank_account: bank.bank_account,
        bank_iban: bank.bank_iban
      });
    } else {
      setEditingBank(null);
      setBankFormData({ bank_beneficiary: "", bank_name: "", bank_account: "", bank_iban: "" });
    }
    setIsBankModalOpen(true);
  };

  const openLicenseModal = (license: any = null) => {
    if (license) {
      setEditingLicense(license);
      setLicenseFormData({
        license_number: license.license_number || "",
        license_type: license.license_type || "",
        start_date: license.start_date || "",
        end_date: license.end_date || "",
        license_image: license.license_image || ""
      });
    } else {
      setEditingLicense(null);
      setLicenseFormData({ license_number: "", license_type: "", start_date: "", end_date: "", license_image: "" });
    }
    setIsLicenseModalOpen(true);
  };

  const tabs = [
    { id: "overview" as TabType, label: "نظرة عامة", icon: <Building size={16} /> },
    { id: "bank" as TabType, label: "الحسابات البنكية", icon: <University size={16} /> },
    { id: "license" as TabType, label: "التراخيص", icon: <IdCard size={16} /> },
    { id: "files" as TabType, label: "الملفات والوثائق", icon: <FileText size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 rounded-[2rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-gradient-to-br from-[#1e293b] via-[#334155] to-[#1e293b] rounded-[2rem] p-6 text-white shadow-2xl overflow-hidden border border-white/10">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Building size={200} />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 overflow-hidden">
                {companyState?.logo_path ? (
                  <img src={companyState.logo_path} alt="logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <Building size={36} className="text-white/60" />
                )}
              </div>
              
              <div className="flex-1 text-center md:text-right">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full border border-white/20 text-xs font-bold mb-2">
                  <Zap size={12} className="text-amber-400 fill-amber-400" />
                  <span>بيانات المنشأة</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black">{companyState?.name || "اسم الشركة"}</h1>
                <p className="text-white/50 text-sm mt-1">{user?.email}</p>
              </div>

              <div className="flex gap-3">
                <div className="bg-white/10 rounded-xl p-4 text-center min-w-[100px]">
                  <p className="text-white/50 text-xs">السجل التجاري</p>
                  <p className="font-black text-lg">{companyState?.commercial_number || "---"}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center min-w-[100px]">
                  <p className="text-white/50 text-xs">الرقم الضريبي</p>
                  <p className="font-black text-lg">{companyState?.vat_number?.slice(-6) || "---"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-lg border border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === tab.id
                  ? "bg-gradient-to-l from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <Section title="بيانات المستخدم" icon={<User size={18} />}>
                <div className="grid grid-cols-2 gap-4">
                  <InfoCard icon={<User size={16} />} label="الاسم" value={user?.name} />
                  <InfoCard icon={<Mail size={16} />} label="البريد الإلكتروني" value={user?.email} />
                  <InfoCard icon={<Calendar size={16} />} label="تاريخ الانضمام" value={user?.created_at?.split('T')[0]} />
                  <InfoCard icon={<Shield size={16} />} label="حالة الحساب" value="نشط" highlight />
                </div>
              </Section>

              <Section title="بيانات الشركة" icon={<Building size={18} />}>
                <div className="grid grid-cols-2 gap-4">
                  <InfoCard icon={<Briefcase size={16} />} label="اسم الشركة" value={companyState?.name} />
                  <InfoCard icon={<FileText size={16} />} label="السجل التجاري" value={companyState?.commercial_number} />
                  <InfoCard icon={<Hash size={16} />} label="الرقم الضريبي" value={companyState?.vat_number} />
                  <InfoCard icon={<Phone size={16} />} label="الهاتف" value={companyState?.phone} />
                  <InfoCard icon={<Globe size={16} />} label="الموقع الإلكتروني" value={companyState?.website} />
                  <InfoCard icon={<DollarSign size={16} />} label="العملة" value={companyState?.currency} />
                </div>
              </Section>

              <Section title="العنوان" icon={<MapPin size={18} />} className="lg:col-span-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InfoCard icon={<Flag size={16} />} label="الدولة" value={companyState?.country} />
                  <InfoCard icon={<MapPin size={16} />} label="المنطقة" value={companyState?.region} />
                  <InfoCard icon={<MapPin size={16} />} label="الحي" value={companyState?.district} />
                  <InfoCard icon={<Hash size={16} />} label="الشارع" value={companyState?.street} />
                </div>
              </Section>
            </motion.div>
          )}

          {activeTab === "bank" && (
            <motion.div
              key="bank"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Section 
                title="الحسابات البنكية" 
                icon={<University size={18} />}
                action={
                  <button
                    onClick={() => openBankModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all"
                  >
                    <PlusCircle size={16} />
                    إضافة حساب
                  </button>
                }
              >
                {bankAccounts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bankAccounts.map((bank) => (
                      <div key={bank.id} className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                              <Landmark size={20} />
                            </div>
                            <div>
                              <h4 className="font-black text-slate-800 dark:text-white">{bank.bank_name}</h4>
                              <p className="text-xs text-slate-400">{bank.bank_beneficiary}</p>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openBankModal(bank)} className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteBank(bank.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                            <span className="text-slate-400">رقم الحساب</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{bank.bank_account}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-slate-400">IBAN</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">{bank.bank_iban}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<University size={48} />} message="لا يوجد حسابات بنكية" />
                )}
              </Section>
            </motion.div>
          )}

          {activeTab === "license" && (
            <motion.div
              key="license"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Section 
                title="التراخيص" 
                icon={<IdCard size={18} />}
                action={
                  <button
                    onClick={() => openLicenseModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-l from-purple-500 to-purple-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all"
                  >
                    <PlusCircle size={16} />
                    إضافة ترخيص
                  </button>
                }
              >
                {licenses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {licenses.map((license) => (
                      <div key={license.id} className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                              <FileCheck size={20} />
                            </div>
                            <div>
                              <h4 className="font-black text-slate-800 dark:text-white">{license.license_type || "ترخيص"}</h4>
                              <p className="text-xs text-slate-400">رقم: {license.license_number || "---"}</p>
                            </div>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openLicenseModal(license)} className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteLicense(license.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                            <span className="text-slate-400">تاريخ البداية</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{license.start_date || "---"}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                            <span className="text-slate-400">تاريخ الانتهاء</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{license.end_date || "---"}</span>
                          </div>
                          {license.license_image && (
                            <div className="flex gap-2 pt-2">
                              <a 
                                href={license.license_image} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all"
                              >
                                <Eye size={14} />
                                عرض
                              </a>
                              <a 
                                href={license.license_image} 
                                download
                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-all"
                              >
                                <Download size={14} />
                                تحميل
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState icon={<IdCard size={48} />} message="لا يوجد تراخيص" />
                )}
              </Section>
            </motion.div>
          )}

          {activeTab === "files" && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <Section title="ملفات الشركة الأساسية" icon={<FileText size={18} />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FileUploadCard
                    label="شعار الشركة"
                    field="logo_path"
                    currentFile={companyState?.logo_path}
                    onUpload={handleFileUpload}
                    isUploading={uploadingField === "logo_path"}
                    icon={<ImageIcon size={24} />}
                  />
                  <FileUploadCard
                    label="ختم الشركة"
                    field="stamp_path"
                    currentFile={companyState?.stamp_path}
                    onUpload={handleFileUpload}
                    isUploading={uploadingField === "stamp_path"}
                    icon={<FileCheck size={24} />}
                  />
                  <FileUploadCard
                    label="توقيع المدير"
                    field="digital_seal_path"
                    currentFile={companyState?.digital_seal_path}
                    onUpload={handleFileUpload}
                    isUploading={uploadingField === "digital_seal_path"}
                    icon={<Edit size={24} />}
                  />
                </div>
              </Section>

              <Section title="الوثائق الرسمية" icon={<Receipt size={18} />}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FileUploadCard
                    label="صورة السجل التجاري"
                    field="commercial_register_image"
                    currentFile={companyState?.commercial_register_image}
                    onUpload={handleFileUpload}
                    isUploading={uploadingField === "commercial_register_image"}
                    icon={<FileText size={24} />}
                  />
                  <FileUploadCard
                    label="شهادة ضريبة القيمة المضافة"
                    field="vat_certificate_image"
                    currentFile={companyState?.vat_certificate_image}
                    onUpload={handleFileUpload}
                    isUploading={uploadingField === "vat_certificate_image"}
                    icon={<Receipt size={24} />}
                  />
                  <FileUploadCard
                    label="صورة الحساب البنكي (IBAN)"
                    field="bank_account_image"
                    currentFile={companyState?.bank_account_image}
                    onUpload={handleFileUpload}
                    isUploading={uploadingField === "bank_account_image"}
                    icon={<CreditCard size={24} />}
                  />
                </div>
              </Section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bank Modal */}
      <AnimatePresence>
        {isBankModalOpen && (
          <Modal onClose={() => setIsBankModalOpen(false)} title={editingBank ? "تعديل حساب بنكي" : "إضافة حساب بنكي"}>
            <form onSubmit={handleBankSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="اسم المستفيد" required value={bankFormData.bank_beneficiary} onChange={(v) => setBankFormData({...bankFormData, bank_beneficiary: v})} />
                <InputField label="اسم البنك" required value={bankFormData.bank_name} onChange={(v) => setBankFormData({...bankFormData, bank_name: v})} />
                <InputField label="رقم الحساب" required value={bankFormData.bank_account} onChange={(v) => setBankFormData({...bankFormData, bank_account: v})} />
                <InputField label="الآيبان (IBAN)" required value={bankFormData.bank_iban} onChange={(v) => setBankFormData({...bankFormData, bank_iban: v})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 py-3 bg-gradient-to-l from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                  {editingBank ? "تحديث" : "إضافة"}
                </button>
                <button type="button" onClick={() => setIsBankModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">
                  إلغاء
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* License Modal */}
      <AnimatePresence>
        {isLicenseModalOpen && (
          <Modal onClose={() => setIsLicenseModalOpen(false)} title={editingLicense ? "تعديل ترخيص" : "إضافة ترخيص جديد"}>
            <form onSubmit={handleLicenseSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="رقم الترخيص" value={licenseFormData.license_number} onChange={(v) => setLicenseFormData({...licenseFormData, license_number: v})} />
                <InputField label="نوع الترخيص" value={licenseFormData.license_type} onChange={(v) => setLicenseFormData({...licenseFormData, license_type: v})} />
                <InputField label="تاريخ البداية" type="date" value={licenseFormData.start_date} onChange={(v) => setLicenseFormData({...licenseFormData, start_date: v})} />
                <InputField label="تاريخ الانتهاء" type="date" value={licenseFormData.end_date} onChange={(v) => setLicenseFormData({...licenseFormData, end_date: v})} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">صورة الترخيص</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
                  {licenseFormData.license_image ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-emerald-600">
                        <CheckCircle2 size={20} />
                        <span className="text-sm font-bold">تم رفع الملف</span>
                      </div>
                      <a href={licenseFormData.license_image} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs hover:underline">
                        عرض الملف
                      </a>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Upload size={24} />
                        <span className="text-sm">اضغط لرفع صورة أو ملف PDF</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleLicenseFileUpload} />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 py-3 bg-gradient-to-l from-purple-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                  {editingLicense ? "تحديث" : "إضافة"}
                </button>
                <button type="button" onClick={() => setIsLicenseModalOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all">
                  إلغاء
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ title, icon, children, action, className }: { title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg overflow-hidden", className)}>
      <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-3">
          <span className="text-blue-500">{icon}</span>
          {title}
        </h3>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoCard({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 hover:shadow-md transition-all">
      <div className="flex items-center gap-2 text-slate-400 mb-2">
        {icon}
        <span className="text-xs font-bold">{label}</span>
      </div>
      <p className={cn("font-black truncate", highlight ? "text-emerald-600" : "text-slate-800 dark:text-white")}>
        {value || "---"}
      </p>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", required = false }: any) {
  return (
    <div>
      <label className="text-sm font-bold text-slate-600 mb-1 block">{label}</label>
      <input 
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
      />
    </div>
  );
}

function FileUploadCard({ label, field, currentFile, onUpload, isUploading, icon }: { label: string; field: string; currentFile: string; onUpload: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void; isUploading: boolean; icon: React.ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-all text-center group">
      <div className="w-20 h-20 mx-auto bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-lg mb-4 overflow-hidden group-hover:scale-105 transition-transform">
        {currentFile ? (
          <img src={currentFile} alt={label} className="w-full h-full object-contain p-2" />
        ) : (
          <span className="text-slate-300">{icon}</span>
        )}
      </div>
      
      <h4 className="font-black text-slate-700 dark:text-white mb-3">{label}</h4>
      
      {currentFile && (
        <a href={currentFile} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-500 text-xs mb-3 hover:underline">
          <Eye size={12} />
          عرض الملف الحالي
        </a>
      )}
      
      <input 
        ref={inputRef}
        type="file" 
        className="hidden" 
        accept="image/*,.pdf"
        onChange={(e) => onUpload(e, field)}
      />
      
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-l from-blue-500 to-blue-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all disabled:opacity-50"
      >
        {isUploading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Upload size={16} />
        )}
        {currentFile ? "استبدال" : "رفع"}
      </button>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
      <div className="text-slate-300 mb-4">{icon}</div>
      <p className="text-slate-400 font-bold">{message}</p>
    </div>
  );
}

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-l from-slate-700 to-slate-800 px-6 py-4 text-white flex justify-between items-center">
          <h3 className="text-lg font-black">{title}</h3>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}
