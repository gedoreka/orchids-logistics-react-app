"use client";

import React, { useState } from "react";
import { 
  Building, 
  University, 
  IdCard, 
  FileText, 
  Save, 
  PlusCircle, 
  Edit, 
  Trash, 
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
  CreditCard,
  QrCode,
  Briefcase,
  Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  updateCompanyProfile, 
  addBankAccount, 
  updateBankAccount, 
  deleteBankAccount 
} from "@/lib/actions/company";

type TabType = "overview" | "bank" | "license" | "files";

export function UserProfileClient({ user, company, bankAccounts }: any) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<any>(null);
  const [bankFormData, setBankFormData] = useState({
    bank_beneficiary: "",
    bank_name: "",
    bank_account: "",
    bank_iban: ""
  });

  const [companyData, setCompanyData] = useState({
    transport_license_number: company?.transport_license_number || "",
    transport_license_type: company?.transport_license_type || "",
    license_start: company?.license_start || "",
    license_end: company?.license_end || ""
  });

  const handleCompanyUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateCompanyProfile(company.id, companyData);
    if (res.success) {
      toast.success("تم تحديث البيانات بنجاح");
    } else {
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let res;
    if (editingBank) {
      res = await updateBankAccount(editingBank.id, company.id, bankFormData);
    } else {
      res = await addBankAccount(company.id, bankFormData);
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
      if (res.success) toast.success("تم الحذف بنجاح");
      else toast.error("حدث خطأ");
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

  const tabs = [
    { id: "overview" as TabType, label: "نظرة عامة", icon: <Building size={14} /> },
    { id: "bank" as TabType, label: "الحسابات البنكية", icon: <University size={14} /> },
    { id: "license" as TabType, label: "الترخيص", icon: <IdCard size={14} /> },
    { id: "files" as TabType, label: "الملفات", icon: <FileText size={14} /> },
  ];

  return (
    <div className="h-[calc(100vh-5rem)] p-3 overflow-hidden">
      <div className="h-full flex gap-3">
        {/* Sidebar */}
        <div className="w-56 shrink-0 flex flex-col gap-3">
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/10">
                {company?.logo_path ? (
                  <img src={`/uploads/${company.logo_path}`} alt="logo" className="w-full h-full object-contain rounded-xl" />
                ) : (
                  <Building size={20} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-black truncate">{company?.name || "الشركة"}</h2>
                <p className="text-[10px] text-white/50">{user?.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <span className="text-white/50">السجل</span>
                <p className="font-black text-xs mt-0.5">{company?.commercial_number || "---"}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center">
                <span className="text-white/50">الضريبي</span>
                <p className="font-black text-xs mt-0.5 truncate">{company?.vat_number?.slice(-6) || "---"}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-2 flex flex-col gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-right w-full ${
                  activeTab === tab.id
                    ? "bg-gradient-to-l from-blue-500 to-blue-600 text-white shadow-sm shadow-blue-200"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={12} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-gray-400">حالة الحساب</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-black text-gray-700">نشط</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <TabContent key="overview">
                <div className="p-4 space-y-4 overflow-y-auto h-full">
                  {/* User Info */}
                  <Section title="بيانات المستخدم" icon={<User size={14} />}>
                    <div className="grid grid-cols-3 gap-2">
                      <MiniCard icon={<User size={12} />} label="الاسم" value={user?.name} />
                      <MiniCard icon={<Mail size={12} />} label="البريد" value={user?.email} />
                      <MiniCard icon={<Calendar size={12} />} label="الانضمام" value={user?.created_at?.split('T')[0]} />
                    </div>
                  </Section>

                  {/* Company Info */}
                  <Section title="بيانات الشركة" icon={<Building size={14} />}>
                    <div className="grid grid-cols-4 gap-2">
                      <MiniCard icon={<Briefcase size={12} />} label="الاسم" value={company?.name} />
                      <MiniCard icon={<FileText size={12} />} label="السجل" value={company?.commercial_number} />
                      <MiniCard icon={<Hash size={12} />} label="الضريبي" value={company?.vat_number} />
                      <MiniCard icon={<Phone size={12} />} label="الهاتف" value={company?.phone} />
                      <MiniCard icon={<Globe size={12} />} label="الموقع" value={company?.website} />
                      <MiniCard icon={<DollarSign size={12} />} label="العملة" value={company?.currency} />
                      <MiniCard icon={<Flag size={12} />} label="الدولة" value={company?.country} />
                      <MiniCard icon={<MapPin size={12} />} label="المنطقة" value={company?.region} />
                    </div>
                  </Section>

                  {/* Address */}
                  <Section title="العنوان" icon={<MapPin size={14} />}>
                    <div className="grid grid-cols-4 gap-2">
                      <MiniCard icon={<MapPin size={12} />} label="المدينة" value={company?.city} />
                      <MiniCard icon={<MapPin size={12} />} label="الحي" value={company?.district} />
                      <MiniCard icon={<Hash size={12} />} label="الشارع" value={company?.street} />
                      <MiniCard icon={<Hash size={12} />} label="الرمز البريدي" value={company?.postal_code} />
                    </div>
                  </Section>
                </div>
              </TabContent>
            )}

            {activeTab === "bank" && (
              <TabContent key="bank">
                <div className="p-4 space-y-3 overflow-y-auto h-full">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                      <University size={16} className="text-blue-500" />
                      الحسابات البنكية
                    </h3>
                    <button 
                      onClick={() => openBankModal()}
                      className="px-3 py-1.5 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-lg text-[10px] font-black flex items-center gap-1 hover:shadow-lg transition-all"
                    >
                      <PlusCircle size={12} />
                      إضافة
                    </button>
                  </div>

                  {bankAccounts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {bankAccounts.map((bank: any) => (
                        <div key={bank.id} className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-3 border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                                <Landmark size={14} />
                              </div>
                              <span className="text-xs font-black text-gray-800">{bank.bank_name}</span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openBankModal(bank)} className="p-1 bg-blue-50 text-blue-500 rounded hover:bg-blue-500 hover:text-white transition-all">
                                <Edit size={10} />
                              </button>
                              <button onClick={() => handleDeleteBank(bank.id)} className="p-1 bg-red-50 text-red-500 rounded hover:bg-red-500 hover:text-white transition-all">
                                <Trash size={10} />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1.5 text-[10px]">
                            <div className="flex justify-between">
                              <span className="text-gray-400">المستفيد</span>
                              <span className="font-bold text-gray-700">{bank.bank_beneficiary}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">رقم الحساب</span>
                              <span className="font-bold text-gray-700">{bank.bank_account}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">IBAN</span>
                              <span className="font-bold text-gray-700 text-[9px]">{bank.bank_iban}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <University size={28} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-400 font-bold text-xs">لا يوجد حسابات بنكية</p>
                    </div>
                  )}
                </div>
              </TabContent>
            )}

            {activeTab === "license" && (
              <TabContent key="license">
                <div className="p-4 overflow-y-auto h-full">
                  <h3 className="text-sm font-black text-gray-800 flex items-center gap-2 mb-4">
                    <IdCard size={16} className="text-blue-500" />
                    بيانات الترخيص
                  </h3>
                  <form onSubmit={handleCompanyUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <InputField 
                        label="رقم الترخيص" 
                        icon={<Hash size={12} />}
                        value={companyData.transport_license_number}
                        onChange={(v) => setCompanyData({...companyData, transport_license_number: v})}
                      />
                      <InputField 
                        label="نوع الترخيص" 
                        icon={<Tag size={12} />}
                        value={companyData.transport_license_type}
                        onChange={(v) => setCompanyData({...companyData, transport_license_type: v})}
                      />
                      <InputField 
                        label="تاريخ البداية" 
                        type="date"
                        icon={<Calendar size={12} />}
                        value={companyData.license_start}
                        onChange={(v) => setCompanyData({...companyData, license_start: v})}
                      />
                      <InputField 
                        label="تاريخ الانتهاء" 
                        type="date"
                        icon={<Calendar size={12} />}
                        value={companyData.license_end}
                        onChange={(v) => setCompanyData({...companyData, license_end: v})}
                      />
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-l from-slate-700 to-slate-800 text-white rounded-xl font-black text-xs hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Save size={14} />
                      حفظ التغييرات
                    </button>
                  </form>
                </div>
              </TabContent>
            )}

            {activeTab === "files" && (
              <TabContent key="files">
                <div className="p-4 overflow-y-auto h-full">
                  <h3 className="text-sm font-black text-gray-800 flex items-center gap-2 mb-4">
                    <FileText size={16} className="text-blue-500" />
                    ملفات الشركة
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <FileCard label="شعار الشركة" path={company?.logo_path} />
                    <FileCard label="ختم الشركة" path={company?.stamp_path} />
                    <FileCard label="توقيع المدير" path={company?.digital_seal_path} />
                  </div>
                </div>
              </TabContent>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bank Modal */}
      <AnimatePresence>
        {isBankModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBankModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-l from-slate-700 to-slate-800 px-4 py-3 text-white flex justify-between items-center">
                <h3 className="text-xs font-black flex items-center gap-2">
                  <University size={14} />
                  {editingBank ? "تعديل حساب" : "إضافة حساب"}
                </h3>
                <button onClick={() => setIsBankModalOpen(false)} className="hover:rotate-90 transition-transform">
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleBankSubmit} className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <InputField label="اسم المستفيد" required value={bankFormData.bank_beneficiary} onChange={(v) => setBankFormData({...bankFormData, bank_beneficiary: v})} />
                  <InputField label="اسم البنك" required value={bankFormData.bank_name} onChange={(v) => setBankFormData({...bankFormData, bank_name: v})} />
                  <InputField label="رقم الحساب" required value={bankFormData.bank_account} onChange={(v) => setBankFormData({...bankFormData, bank_account: v})} />
                  <InputField label="الآيبان" required value={bankFormData.bank_iban} onChange={(v) => setBankFormData({...bankFormData, bank_iban: v})} />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-black text-[10px] hover:bg-blue-600 transition-all">
                    {editingBank ? "تحديث" : "إضافة"}
                  </button>
                  <button type="button" onClick={() => setIsBankModalOpen(false)} className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-lg font-black text-[10px] hover:bg-gray-200 transition-all">
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TabContent({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.15 }}
      className="flex-1 overflow-hidden"
    >
      {children}
    </motion.div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-gradient-to-br from-slate-50/50 to-white rounded-xl border border-gray-100 p-3">
      <h4 className="text-xs font-black text-gray-700 flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
        <span className="text-blue-500">{icon}</span>
        {title}
      </h4>
      {children}
    </div>
  );
}

function MiniCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg p-2 border border-gray-50 hover:border-blue-100 hover:shadow-sm transition-all">
      <div className="flex items-center gap-1 text-gray-400 mb-0.5">
        {icon}
        <span className="text-[9px] font-bold">{label}</span>
      </div>
      <p className="text-[11px] font-black text-gray-800 truncate">{value || "---"}</p>
    </div>
  );
}

function InputField({ label, value, onChange, icon, type = "text", required = false }: any) {
  return (
    <div>
      <label className="text-[9px] font-bold text-gray-400 flex items-center gap-1 mb-1">
        {icon}
        {label}
      </label>
      <input 
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500/30 focus:border-blue-500 focus:bg-white transition-all"
      />
    </div>
  );
}

function FileCard({ label, path }: { label: string; path: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-dashed border-gray-200 hover:border-blue-300 hover:shadow-md transition-all group cursor-pointer">
      <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
        {path ? (
          <img src={`/uploads/${path}`} alt={label} className="w-full h-full object-contain p-1" />
        ) : (
          <ImageIcon size={20} className="text-gray-300" />
        )}
      </div>
      <p className="font-black text-gray-700 text-[10px]">{label}</p>
      <label className="flex items-center gap-1 px-2.5 py-1 bg-blue-500 text-white rounded-lg text-[9px] font-black cursor-pointer hover:bg-blue-600 transition-all">
        <Upload size={10} />
        رفع
        <input type="file" className="hidden" />
      </label>
    </div>
  );
}
