"use client";

import React, { useState } from "react";
import { 
  UserCircle, 
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
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  updateCompanyProfile, 
  addBankAccount, 
  updateBankAccount, 
  deleteBankAccount 
} from "@/lib/actions/company";

type TabType = "user" | "company" | "bank" | "license" | "files";

export function UserProfileClient({ user, company, bankAccounts }: any) {
  const [activeTab, setActiveTab] = useState<TabType>("user");
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
    { id: "user" as TabType, label: "المستخدم", icon: <User size={16} /> },
    { id: "company" as TabType, label: "الشركة", icon: <Building size={16} /> },
    { id: "bank" as TabType, label: "الحسابات البنكية", icon: <University size={16} /> },
    { id: "license" as TabType, label: "الترخيص", icon: <IdCard size={16} /> },
    { id: "files" as TabType, label: "الملفات", icon: <FileText size={16} /> },
  ];

  const tabIndex = tabs.findIndex(t => t.id === activeTab);
  const prevTab = tabIndex > 0 ? tabs[tabIndex - 1] : null;
  const nextTab = tabIndex < tabs.length - 1 ? tabs[tabIndex + 1] : null;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        {/* Compact Header */}
        <div className="bg-gradient-to-l from-[#2c3e50] to-[#34495e] px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center text-white border border-white/10">
              <UserCircle size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">بيانات المنشأة</h1>
              <p className="text-[10px] text-white/60 font-bold">إدارة بيانات الشركة والحسابات</p>
            </div>
          </div>
          
          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            {nextTab && (
              <button 
                onClick={() => setActiveTab(nextTab.id)}
                className="h-8 px-3 rounded-lg bg-white/10 border border-white/10 text-[10px] font-black text-white hover:bg-white/20 transition-all flex items-center gap-1"
              >
                {nextTab.label}
                <ChevronLeft size={12} />
              </button>
            )}
            {prevTab && (
              <button 
                onClick={() => setActiveTab(prevTab.id)}
                className="h-8 px-3 rounded-lg bg-white/10 border border-white/10 text-[10px] font-black text-white hover:bg-white/20 transition-all flex items-center gap-1"
              >
                <ChevronRight size={12} />
                {prevTab.label}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-gray-50 border-b border-gray-100 shrink-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-[#3498db] text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5">
          <AnimatePresence mode="wait">
            {activeTab === "user" && (
              <TabContent key="user">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoCard label="الاسم" value={user.name} icon={<User size={16} />} />
                  <InfoCard label="البريد الإلكتروني" value={user.email} icon={<Mail size={16} />} />
                  <InfoCard label="تاريخ الانضمام" value={user.created_at} icon={<Calendar size={16} />} />
                </div>
              </TabContent>
            )}

            {activeTab === "company" && (
              <TabContent key="company">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <CompactField label="اسم الشركة" value={company?.name} icon={<Building size={14} />} />
                  <CompactField label="السجل التجاري" value={company?.commercial_number} icon={<FileText size={14} />} />
                  <CompactField label="الرقم الضريبي" value={company?.vat_number} icon={<Hash size={14} />} />
                  <CompactField label="الهاتف" value={company?.phone} icon={<Phone size={14} />} />
                  <CompactField label="الموقع الإلكتروني" value={company?.website} icon={<Globe size={14} />} />
                  <CompactField label="العملة" value={company?.currency} icon={<DollarSign size={14} />} />
                  <CompactField label="الدولة" value={company?.country} icon={<Flag size={14} />} />
                  <CompactField label="المنطقة" value={company?.region} icon={<MapPin size={14} />} />
                  <CompactField label="الحي" value={company?.district} icon={<MapPin size={14} />} />
                </div>
              </TabContent>
            )}

            {activeTab === "bank" && (
              <TabContent key="bank">
                <div className="space-y-3">
                  {bankAccounts.length > 0 ? (
                    bankAccounts.map((bank: any) => (
                      <div key={bank.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-[#3498db]/30 transition-all group">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#3498db]/10 rounded-lg flex items-center justify-center text-[#3498db]">
                              <Landmark size={16} />
                            </div>
                            <span className="text-sm font-black text-gray-800">{bank.bank_name}</span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => openBankModal(bank)}
                              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-xs"
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDeleteBank(bank.id)}
                              className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all text-xs"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-gray-400 font-bold flex items-center gap-1"><User size={10} />المستفيد</span>
                            <p className="font-black text-gray-800 mt-0.5">{bank.bank_beneficiary}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 font-bold flex items-center gap-1"><CreditCard size={10} />رقم الحساب</span>
                            <p className="font-black text-gray-800 mt-0.5">{bank.bank_account}</p>
                          </div>
                          <div>
                            <span className="text-gray-400 font-bold flex items-center gap-1"><QrCode size={10} />الآيبان</span>
                            <p className="font-black text-gray-800 mt-0.5 text-[10px]">{bank.bank_iban}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <University size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-400 font-bold text-sm">لا يوجد حسابات بنكية</p>
                    </div>
                  )}
                  <button 
                    onClick={() => openBankModal()}
                    className="w-full py-3 bg-gradient-to-l from-[#27ae60] to-[#2ecc71] text-white rounded-xl font-black text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <PlusCircle size={16} />
                    إضافة حساب بنكي
                  </button>
                </div>
              </TabContent>
            )}

            {activeTab === "license" && (
              <TabContent key="license">
                <form onSubmit={handleCompanyUpdate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <CompactInput 
                      label="رقم الترخيص" 
                      value={companyData.transport_license_number}
                      onChange={(v) => setCompanyData({...companyData, transport_license_number: v})}
                      icon={<Hash size={14} />} 
                    />
                    <CompactInput 
                      label="نوع الترخيص" 
                      value={companyData.transport_license_type}
                      onChange={(v) => setCompanyData({...companyData, transport_license_type: v})}
                      icon={<Tag size={14} />} 
                    />
                    <CompactInput 
                      label="تاريخ البداية" 
                      type="date"
                      value={companyData.license_start}
                      onChange={(v) => setCompanyData({...companyData, license_start: v})}
                      icon={<Calendar size={14} />} 
                    />
                    <CompactInput 
                      label="تاريخ الانتهاء" 
                      type="date"
                      value={companyData.license_end}
                      onChange={(v) => setCompanyData({...companyData, license_end: v})}
                      icon={<Calendar size={14} />} 
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-3 bg-gradient-to-l from-[#2c3e50] to-[#3498db] text-white rounded-xl font-black text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={16} />
                    حفظ التغييرات
                  </button>
                </form>
              </TabContent>
            )}

            {activeTab === "files" && (
              <TabContent key="files">
                <div className="grid grid-cols-3 gap-4">
                  <CompactFileUpload label="شعار الشركة" path={company?.logo_path} />
                  <CompactFileUpload label="ختم الشركة" path={company?.stamp_path} />
                  <CompactFileUpload label="توقيع المدير" path={company?.digital_seal_path} />
                </div>
              </TabContent>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Bank Modal */}
      <AnimatePresence>
        {isBankModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBankModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-l from-[#2c3e50] to-[#34495e] px-5 py-4 text-white flex justify-between items-center">
                <h3 className="text-sm font-black flex items-center gap-2">
                  <University size={18} />
                  {editingBank ? "تعديل حساب بنكي" : "إضافة حساب بنكي"}
                </h3>
                <button onClick={() => setIsBankModalOpen(false)} className="hover:rotate-90 transition-transform">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleBankSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <CompactInput 
                    label="اسم المستفيد" 
                    required 
                    value={bankFormData.bank_beneficiary}
                    onChange={(v) => setBankFormData({...bankFormData, bank_beneficiary: v})}
                  />
                  <CompactInput 
                    label="اسم البنك" 
                    required 
                    value={bankFormData.bank_name}
                    onChange={(v) => setBankFormData({...bankFormData, bank_name: v})}
                  />
                  <CompactInput 
                    label="رقم الحساب" 
                    required 
                    value={bankFormData.bank_account}
                    onChange={(v) => setBankFormData({...bankFormData, bank_account: v})}
                  />
                  <CompactInput 
                    label="الآيبان (IBAN)" 
                    required 
                    value={bankFormData.bank_iban}
                    onChange={(v) => setBankFormData({...bankFormData, bank_iban: v})}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    type="submit"
                    className="flex-1 py-2.5 bg-[#3498db] text-white rounded-xl font-black text-xs hover:bg-[#2980b9] transition-all"
                  >
                    {editingBank ? "تحديث" : "إضافة"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsBankModalOpen(false)}
                    className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-black text-xs hover:bg-gray-200 transition-all"
                  >
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
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function InfoCard({ label, value, icon }: any) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100 flex items-center gap-3 hover:shadow-md transition-all group">
      <div className="w-10 h-10 bg-[#3498db]/10 rounded-xl flex items-center justify-center text-[#3498db] group-hover:bg-[#3498db] group-hover:text-white transition-all">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-black text-gray-800">{value || "---"}</p>
      </div>
    </div>
  );
}

function CompactField({ label, value, icon }: any) {
  return (
    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 hover:border-[#3498db]/30 transition-all group">
      <label className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mb-1">
        {icon}
        {label}
      </label>
      <p className="text-sm font-black text-gray-800 truncate">{value || "---"}</p>
    </div>
  );
}

function CompactInput({ label, value, onChange, icon, type = "text", required = false }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
        {icon}
        {label}
      </label>
      <input 
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3498db]/20 focus:border-[#3498db] focus:bg-white transition-all"
      />
    </div>
  );
}

function CompactFileUpload({ label, path }: any) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 hover:border-[#3498db] hover:bg-white transition-all group">
      <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
        {path ? (
          <img src={`/uploads/${path}`} alt={label} className="w-full h-full object-contain p-1" />
        ) : (
          <ImageIcon size={24} className="text-gray-300" />
        )}
      </div>
      <div className="text-center">
        <p className="font-black text-gray-700 text-xs mb-2">{label}</p>
        <label className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-black text-[#3498db] cursor-pointer hover:bg-[#3498db] hover:text-white transition-all">
          <Upload size={10} />
          رفع
          <input type="file" className="hidden" />
        </label>
      </div>
    </div>
  );
}
