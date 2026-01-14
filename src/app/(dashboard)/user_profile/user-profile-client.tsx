"use client";

import React, { useState } from "react";
import { 
  UserCircle, 
  Building, 
  University, 
  IdCard, 
  FileContract, 
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
  QrCode
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  updateCompanyProfile, 
  addBankAccount, 
  updateBankAccount, 
  deleteBankAccount 
} from "@/lib/actions/company";

export function UserProfileClient({ user, company, bankAccounts }: any) {
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

  return (
    <div className="container-fluid py-8 bg-gray-50/50 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[1200px] mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100"
      >
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#2c3e50] to-[#3498db] p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-[-20%] left-[-10%] w-80 h-80 bg-white rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-6 border-4 border-white/30 shadow-xl group hover:scale-105 transition-transform duration-500">
              <UserCircle size={80} className="text-white group-hover:rotate-12 transition-transform" />
            </div>
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">بيانات المنشأة</h1>
            <p className="text-white/80 font-medium text-lg">إدارة بيانات الشركة والحسابات البنكية والملفات الرسمية</p>
          </div>
        </div>

        <div className="p-10">
          {/* User Data Card */}
          <SectionCard title="بيانات المستخدم" icon={<User size={24} />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoItem label="الاسم" value={user.name} icon={<User size={18} />} />
              <InfoItem label="البريد الإلكتروني" value={user.email} icon={<Mail size={18} />} />
              <InfoItem label="تاريخ الانضمام" value={user.created_at} icon={<Calendar size={18} />} />
            </div>
          </SectionCard>

          {/* Company Data Card */}
          <SectionCard title="بيانات الشركة" icon={<Building size={24} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StaticField label="اسم الشركة" value={company?.name} icon={<Building size={18} />} />
              <StaticField label="السجل التجاري" value={company?.commercial_number} icon={<FileContract size={18} />} />
              <StaticField label="الرقم الضريبي" value={company?.vat_number} icon={<Hash size={18} />} />
              <StaticField label="الهاتف" value={company?.phone} icon={<Phone size={18} />} />
              <StaticField label="الموقع الإلكتروني" value={company?.website} icon={<Globe size={18} />} />
              <StaticField label="العملة" value={company?.currency} icon={<DollarSign size={18} />} />
              <StaticField label="الدولة" value={company?.country} icon={<Flag size={18} />} />
              <StaticField label="المنطقة" value={company?.region} icon={<MapPin size={18} />} />
              <StaticField label="الحي" value={company?.district} icon={<MapPin size={18} />} />
            </div>
          </SectionCard>

          {/* Bank Accounts Card */}
          <SectionCard title="الحسابات البنكية" icon={<University size={24} />}>
            <div className="space-y-4">
              {bankAccounts.length > 0 ? (
                bankAccounts.map((bank: any) => (
                  <div key={bank.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 group hover:border-[#3498db] transition-all hover:shadow-lg">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#3498db]/10 rounded-xl flex items-center justify-center text-[#3498db]">
                          <Landmark size={20} />
                        </div>
                        <span className="text-xl font-bold text-gray-800">{bank.bank_name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openBankModal(bank)}
                          className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteBank(bank.id)}
                          className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <BankDetail label="المستفيد" value={bank.bank_beneficiary} icon={<User size={16} />} />
                      <BankDetail label="رقم الحساب" value={bank.bank_account} icon={<CreditCard size={16} />} />
                      <BankDetail label="رقم الآيبان" value={bank.bank_iban} icon={<QrCode size={16} />} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <University size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 font-bold">لا يوجد حسابات بنكية مضافة</p>
                </div>
              )}
              <button 
                onClick={() => openBankModal()}
                className="w-full py-4 bg-gradient-to-r from-[#27ae60] to-[#2ecc71] text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
              >
                <PlusCircle size={22} />
                <span>إضافة حساب بنكي جديد</span>
              </button>
            </div>
          </SectionCard>

          {/* Transport License & Official Files */}
          <form onSubmit={handleCompanyUpdate} className="space-y-8">
            <SectionCard title="بيانات ترخيص النقل" icon={<IdCard size={24} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField 
                  label="رقم الترخيص" 
                  value={companyData.transport_license_number}
                  onChange={(v) => setCompanyData({...companyData, transport_license_number: v})}
                  icon={<Hash size={18} />} 
                />
                <InputField 
                  label="نوع الترخيص" 
                  value={companyData.transport_license_type}
                  onChange={(v) => setCompanyData({...companyData, transport_license_type: v})}
                  icon={<Tag size={18} />} 
                />
                <InputField 
                  label="تاريخ البداية" 
                  type="date"
                  value={companyData.license_start}
                  onChange={(v) => setCompanyData({...companyData, license_start: v})}
                  icon={<Calendar size={18} />} 
                />
                <InputField 
                  label="تاريخ الانتهاء" 
                  type="date"
                  value={companyData.license_end}
                  onChange={(v) => setCompanyData({...companyData, license_end: v})}
                  icon={<Calendar size={18} />} 
                />
              </div>
            </SectionCard>

            <SectionCard title="الملفات الرسمية" icon={<FileContract size={24} />}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FileUpload label="شعار الشركة" path={company?.logo_path} />
                <FileUpload label="ختم الشركة" path={company?.stamp_path} />
                <FileUpload label="توقيع المدير" path={company?.digital_seal_path} />
              </div>
            </SectionCard>

            <div className="flex justify-center pt-8">
              <button 
                type="submit"
                className="px-16 py-5 bg-gradient-to-r from-[#2c3e50] to-[#3498db] text-white rounded-full font-black text-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-4"
              >
                <Save size={28} />
                <span>حفظ كافة التغييرات</span>
              </button>
            </div>
          </form>
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
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-gradient-to-r from-[#2c3e50] to-[#3498db] p-8 text-white flex justify-between items-center">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <University size={28} />
                  {editingBank ? "تعديل حساب بنكي" : "إضافة حساب بنكي جديد"}
                </h3>
                <button onClick={() => setIsBankModalOpen(false)} className="hover:rotate-90 transition-transform">
                  <X size={28} />
                </button>
              </div>
              <form onSubmit={handleBankSubmit} className="p-10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField 
                    label="اسم المستفيد" 
                    required 
                    value={bankFormData.bank_beneficiary}
                    onChange={(v) => setBankFormData({...bankFormData, bank_beneficiary: v})}
                  />
                  <InputField 
                    label="اسم البنك" 
                    required 
                    value={bankFormData.bank_name}
                    onChange={(v) => setBankFormData({...bankFormData, bank_name: v})}
                  />
                  <InputField 
                    label="رقم الحساب" 
                    required 
                    value={bankFormData.bank_account}
                    onChange={(v) => setBankFormData({...bankFormData, bank_account: v})}
                  />
                  <InputField 
                    label="رقم الآيبان (IBAN)" 
                    required 
                    value={bankFormData.bank_iban}
                    onChange={(v) => setBankFormData({...bankFormData, bank_iban: v})}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-[#3498db] text-white rounded-2xl font-bold text-lg hover:bg-[#2980b9] transition-all shadow-lg"
                  >
                    {editingBank ? "تحديث الحساب" : "إضافة الحساب"}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsBankModalOpen(false)}
                    className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all"
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

function SectionCard({ title, icon, children }: any) {
  return (
    <div className="mb-10 relative">
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-12 h-12 bg-[#3498db]/10 rounded-2xl flex items-center justify-center text-[#3498db] shadow-inner">
          {icon}
        </div>
        <h3 className="text-2xl font-black text-gray-800 tracking-tight">{title}</h3>
        <div className="flex-1 h-[2px] bg-gradient-to-r from-gray-200 to-transparent mr-4" />
      </div>
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#3498db] to-[#2c3e50] opacity-0 group-hover:opacity-100 transition-opacity" />
        {children}
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon }: any) {
  return (
    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-center gap-4 group hover:bg-white hover:shadow-md transition-all">
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#3498db] shadow-sm group-hover:bg-[#3498db] group-hover:text-white transition-all">
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 mb-1">{label}</p>
        <p className="text-lg font-black text-[#2c3e50]">{value || "---"}</p>
      </div>
    </div>
  );
}

function StaticField({ label, value, icon }: any) {
  return (
    <div className="space-y-2 group">
      <label className="text-sm font-black text-gray-500 flex items-center gap-2 group-hover:text-[#3498db] transition-colors">
        {icon}
        <span>{label}</span>
      </label>
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-gray-800 font-bold group-hover:bg-white group-hover:border-[#3498db]/30 transition-all">
        {value || "---"}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, icon, type = "text", required = false }: any) {
  return (
    <div className="space-y-2 group">
      <label className="text-sm font-black text-gray-500 flex items-center gap-2 group-hover:text-[#3498db] transition-colors">
        {icon}
        <span>{label}</span>
      </label>
      <input 
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 font-bold text-gray-800 focus:outline-none focus:ring-4 focus:ring-[#3498db]/10 focus:border-[#3498db] focus:bg-white transition-all"
      />
    </div>
  );
}

function BankDetail({ label, value, icon }: any) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
        {icon}
        {label}
      </span>
      <span className="text-lg font-black text-[#2c3e50] break-all">{value}</span>
    </div>
  );
}

function FileUpload({ label, path }: any) {
  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 group hover:border-[#3498db] hover:bg-white transition-all">
      <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center border border-gray-200 shadow-sm relative overflow-hidden group-hover:scale-110 transition-transform">
        {path ? (
          <img src={`/uploads/${path}`} alt={label} className="w-full h-full object-contain p-2" />
        ) : (
          <ImageIcon size={40} className="text-gray-300" />
        )}
      </div>
      <div className="text-center">
        <p className="font-black text-gray-700 mb-2">{label}</p>
        <label className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-full text-xs font-black text-[#3498db] cursor-pointer hover:bg-[#3498db] hover:text-white transition-all shadow-sm">
          <Upload size={14} />
          <span>رفع ملف جديد</span>
          <input type="file" className="hidden" />
        </label>
      </div>
    </div>
  );
}
