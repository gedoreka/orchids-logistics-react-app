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
  Settings,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/locale-context";
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
  const t = useTranslations("userProfile");
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

      setCompanyState((prev: any) => ({ ...prev, [field]: data.url }));
      setHasChanges(true);
      toast.success(t("messages.uploadSuccess"));
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(t("messages.uploadError"));
    } finally {
      setUploadingField(null);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const res = await updateCompanyProfile(company.id, companyState);
      if (res.success) {
        toast.success(t("messages.saveSuccess"));
        setHasChanges(false);
      } else {
        toast.error(t("messages.saveError") + ": " + res.error);
      }
    } catch (error) {
      toast.error(t("messages.unexpectedError"));
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
      toast.success(t("messages.licenseUploadSuccess"));
    } catch (error) {
      toast.error(t("messages.licenseUploadError"));
    }
  };

  const tabs = [
    { id: "overview" as TabType, label: t("tabs.overview"), icon: Building, gradient: "from-blue-500 to-indigo-600", shadowColor: "shadow-blue-500/40", iconColor: "text-blue-400", iconBg: "bg-blue-500/20" },
    { id: "bank" as TabType, label: t("tabs.bank"), icon: University, gradient: "from-emerald-500 to-teal-600", shadowColor: "shadow-emerald-500/40", iconColor: "text-emerald-400", iconBg: "bg-emerald-500/20" },
    { id: "license" as TabType, label: t("tabs.license"), icon: IdCard, gradient: "from-purple-500 to-violet-600", shadowColor: "shadow-purple-500/40", iconColor: "text-purple-400", iconBg: "bg-purple-500/20" },
    { id: "files" as TabType, label: t("tabs.files"), icon: FileText, gradient: "from-amber-500 to-orange-600", shadowColor: "shadow-amber-500/40", iconColor: "text-amber-400", iconBg: "bg-amber-500/20" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 p-4 md:p-6 pb-32" style={{ zoom: "0.9" }}>
      {/* Rainbow bar */}
      <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 via-purple-500 via-emerald-500 to-blue-500 mb-6 max-w-[90%] mx-auto" />

      <div className="max-w-[90%] mx-auto space-y-6">

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/10 backdrop-blur-xl border border-white/15 p-8 rounded-[2.5rem] overflow-hidden relative group transition-all duration-500 shadow-2xl"
        >
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-transparent rounded-full -mr-40 -mt-40 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-transparent rounded-full -ml-32 -mb-32 blur-3xl" />

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="relative">
              <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl overflow-hidden group/logo">
                {companyState?.logo_path ? (
                  <img src={companyState.logo_path} alt="logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <Building size={32} className="text-white/50" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload size={18} className="text-white" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg border-2 border-slate-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <CheckCircle2 size={12} />
              </div>
            </div>

            <div className="text-center md:text-right">
              <h1 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight drop-shadow-lg">
                {companyState?.name || t("header.companyName")}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <span className="flex items-center gap-2 text-white/60 text-sm font-medium">
                  <Mail size={14} className="text-blue-400" />
                  {user?.email}
                </span>
                <span className="w-1 h-1 bg-white/30 rounded-full" />
                <span className="flex items-center gap-2 text-white/60 text-sm font-medium">
                  <Phone size={14} className="text-emerald-400" />
                  {companyState?.phone || t("header.noPhone")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 relative z-10">
            <div className="bg-white/10 backdrop-blur px-6 py-4 rounded-2xl border border-white/10 text-center min-w-[130px]">
              <p className="text-white/40 text-[10px] font-black uppercase tracking-wider mb-1">{t("header.commercialNumber")}</p>
              <p className="font-black text-white text-lg">{companyState?.commercial_number || "---"}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur px-6 py-4 rounded-2xl border border-blue-500/20 text-center min-w-[130px]">
              <p className="text-blue-300/70 text-[10px] font-black uppercase tracking-wider mb-1">{t("header.taxNumber")}</p>
              <p className="font-black text-blue-300 text-lg">{companyState?.vat_number || "---"}</p>
            </div>
          </div>
        </motion.div>

        {/* Centered Modern Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex bg-white/10 backdrop-blur-xl border border-white/10 p-3 rounded-[2rem] shadow-2xl gap-3">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center w-28 h-28 rounded-[1.8rem] transition-all duration-500 group",
                    isActive
                      ? `bg-gradient-to-br ${tab.gradient} text-white shadow-xl ${tab.shadowColor} -translate-y-2 scale-105`
                      : "bg-white/5 hover:bg-white/10 hover:scale-105"
                  )}
                >
                  <div className={cn(
                    "mb-2 transition-all duration-500 p-2.5 rounded-xl",
                    isActive
                      ? "bg-white/20 scale-110 drop-shadow-lg"
                      : `${tab.iconBg} group-hover:scale-110 group-hover:drop-shadow-md`
                  )}>
                    <IconComponent className={cn(
                      "w-8 h-8 transition-colors duration-300",
                      isActive ? "text-white" : tab.iconColor
                    )} />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-tighter transition-colors duration-300",
                    isActive ? "text-white" : tab.iconColor
                  )}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1.5 w-10 h-1.5 bg-white rounded-full shadow-lg shadow-white/50"
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CardSection title={t("overview.ownerInfo")} icon={<User className="w-5 h-5" />} gradient="from-cyan-500 to-blue-600">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoTile label={t("overview.fullName")} value={user?.name} icon={<User />} />
                    <InfoTile label={t("overview.email")} value={user?.email} icon={<Mail />} />
                    <InfoTile label={t("overview.registrationDate")} value={user?.created_at?.split('T')[0]} icon={<Calendar />} />
                    <InfoTile label={t("overview.membershipStatus")} value={t("overview.premiumMember")} icon={<Shield />} color="text-emerald-400" />
                  </div>
                </CardSection>

                <CardSection title={t("overview.facilityInfo")} icon={<Building className="w-5 h-5" />} gradient="from-violet-500 to-purple-600">
                  <div className="grid grid-cols-2 gap-4">
                    <InfoTile label={t("overview.commercialName")} value={companyState?.name} icon={<Briefcase />} />
                    <InfoTile label={t("overview.crNumber")} value={companyState?.commercial_number} icon={<FileText />} />
                    <InfoTile label={t("overview.vatNumber")} value={companyState?.vat_number} icon={<Hash />} />
                    <InfoTile label={t("overview.baseCurrency")} value={companyState?.currency === "SAR" ? t("overview.sar") : companyState?.currency} icon={<DollarSign />} />
                  </div>
                </CardSection>

                <CardSection title={t("overview.addressAndContact")} icon={<MapPin className="w-5 h-5" />} gradient="from-emerald-500 to-teal-600" className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <InfoTile label={t("overview.country")} value={companyState?.country} icon={<Flag />} />
                    <InfoTile label={t("overview.cityRegion")} value={companyState?.region} icon={<MapPin />} />
                    <InfoTile label={t("overview.district")} value={companyState?.district} icon={<MapPin />} />
                    <InfoTile label={t("overview.website")} value={companyState?.website} icon={<Globe />} />
                  </div>
                </CardSection>
              </div>
            )}

            {activeTab === "bank" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black text-white flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl">
                      <Landmark className="text-white" size={20} />
                    </div>
                    {t("bank.title")}
                  </h3>
                  <button
                    onClick={() => {
                      setEditingBank(null);
                      setBankFormData({ bank_beneficiary: "", bank_name: "", bank_account: "", bank_iban: "" });
                      setIsBankModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-emerald-500/30 transition-all active:scale-95"
                  >
                    <PlusCircle size={18} />
                    {t("bank.addNewAccount")}
                  </button>
                </div>

                {bankAccounts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bankAccounts.map((bank) => (
                      <motion.div
                        layout
                        key={bank.id}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-[2rem] p-6 group relative overflow-hidden transition-all duration-500 shadow-xl hover:shadow-2xl"
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-emerald-500 via-teal-500 to-emerald-600 rounded-l-[2rem]" />
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                              <University size={24} />
                            </div>
                            <div>
                              <h4 className="font-black text-lg text-white">{bank.bank_name}</h4>
                              <p className="text-sm text-white/50 font-medium">{bank.bank_beneficiary}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingBank(bank);
                                setBankFormData({ ...bank });
                                setIsBankModalOpen(true);
                              }}
                              className="p-2.5 bg-white/5 text-white/40 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all border border-white/10"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={async () => {
                                if(confirm(t("bank.deleteConfirm"))) {
                                  const res = await deleteBankAccount(bank.id, company.id);
                                  if(res.success) {
                                    setBankAccounts(prev => prev.filter(b => b.id !== bank.id));
                                    toast.success(t("bank.deleteSuccess"));
                                  }
                                }
                              }}
                              className="p-2.5 bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-white/10"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white/5 backdrop-blur p-4 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{t("bank.accountNumber")}</p>
                            <p className="font-black text-white">{bank.bank_account}</p>
                          </div>
                          <div className="bg-white/5 backdrop-blur p-4 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{t("bank.iban")}</p>
                            <p className="font-black text-white text-xs truncate">{bank.bank_iban}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <EmptyContent message={t("bank.noAccounts")} icon={<Landmark className="w-12 h-12" />} />
                )}
              </div>
            )}

            {activeTab === "license" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black text-white flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl">
                      <Shield className="text-white" size={20} />
                    </div>
                    {t("licenses.title")}
                  </h3>
                  <button
                    onClick={() => {
                      setEditingLicense(null);
                      setLicenseFormData({ license_number: "", license_type: "", start_date: "", end_date: "", license_image: "" });
                      setIsLicenseModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-purple-500/30 transition-all active:scale-95"
                  >
                    <PlusCircle size={18} />
                    {t("licenses.addLicense")}
                  </button>
                </div>

                {licenses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {licenses.map((license) => (
                      <motion.div
                        layout
                        key={license.id}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-[2rem] p-6 group relative overflow-hidden transition-all duration-500 shadow-xl hover:shadow-2xl"
                      >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 via-violet-500 to-purple-600 rounded-l-[2rem]" />
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-violet-500/20 rounded-2xl flex items-center justify-center text-purple-400 border border-purple-500/20">
                              <IdCard size={24} />
                            </div>
                            <div>
                              <h4 className="font-black text-lg text-white">{license.license_type}</h4>
                              <p className="text-sm text-white/50 font-medium">{t("licenses.numberPrefix")} {license.license_number}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingLicense(license);
                                setLicenseFormData({ ...license });
                                setIsLicenseModalOpen(true);
                              }}
                              className="p-2.5 bg-white/5 text-white/40 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all border border-white/10"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={async () => {
                                if(confirm(t("licenses.deleteConfirm"))) {
                                  const res = await deleteLicense(license.id, company.id);
                                  if(res.success) {
                                    setLicenses(prev => prev.filter(l => l.id !== license.id));
                                    toast.success(t("bank.deleteSuccess"));
                                  }
                                }
                              }}
                              className="p-2.5 bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-white/10"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-white/5 backdrop-blur p-4 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{t("licenses.issueDate")}</p>
                            <p className="font-black text-white">{license.start_date || "---"}</p>
                          </div>
                          <div className="bg-white/5 backdrop-blur p-4 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{t("licenses.expiryDate")}</p>
                            <p className="font-black text-white">{license.end_date || "---"}</p>
                          </div>
                        </div>
                        {license.license_image && (
                          <div className="flex gap-2">
                            <a href={license.license_image} target="_blank" className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500/10 text-blue-400 rounded-xl text-xs font-black hover:bg-blue-500/20 transition-all border border-blue-500/20">
                              <Eye size={14} /> {t("licenses.viewFile")}
                            </a>
                            <a href={license.license_image} download className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-black hover:bg-emerald-500/20 transition-all border border-emerald-500/20">
                              <Download size={14} /> {t("licenses.download")}
                            </a>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <EmptyContent message={t("licenses.noLicenses")} icon={<Shield className="w-12 h-12" />} />
                )}
              </div>
            )}

            {activeTab === "files" && (
              <div className="space-y-6">
                <CardSection title={t("files.facilityIdentity")} icon={<ImageIcon className="w-5 h-5" />} gradient="from-amber-500 to-orange-600">
                  <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
                    <SmallFileUploader
                      label={t("files.facilityLogo")}
                      field="logo_path"
                      value={companyState?.logo_path}
                      onUpload={handleFileUpload}
                      isUploading={uploadingField === "logo_path"}
                      t={t}
                    />
                    <SmallFileUploader
                      label={t("files.companyStamp")}
                      field="stamp_path"
                      value={companyState?.stamp_path}
                      onUpload={handleFileUpload}
                      isUploading={uploadingField === "stamp_path"}
                      t={t}
                    />
                    <SmallFileUploader
                      label={t("files.managerSignature")}
                      field="digital_seal_path"
                      value={companyState?.digital_seal_path}
                      onUpload={handleFileUpload}
                      isUploading={uploadingField === "digital_seal_path"}
                      t={t}
                    />
                  </div>
                </CardSection>

                <CardSection title={t("files.officialDocuments")} icon={<FileCheck className="w-5 h-5" />} gradient="from-rose-500 to-red-600">
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    <SmallFileUploader
                      label={t("files.commercialRegister")}
                      field="commercial_register_image"
                      value={companyState?.commercial_register_image}
                      onUpload={handleFileUpload}
                      isUploading={uploadingField === "commercial_register_image"}
                      t={t}
                    />
                    <SmallFileUploader
                      label={t("files.vatCertificate")}
                      field="vat_certificate_image"
                      value={companyState?.vat_certificate_image}
                      onUpload={handleFileUpload}
                      isUploading={uploadingField === "vat_certificate_image"}
                      t={t}
                    />
                    <SmallFileUploader
                      label={t("files.ibanCard")}
                      field="bank_account_image"
                      value={companyState?.bank_account_image}
                      onUpload={handleFileUpload}
                      isUploading={uploadingField === "bank_account_image"}
                      t={t}
                    />
                    <SmallFileUploader
                      label={t("files.nationalAddress")}
                      field="national_address_image"
                      value={companyState?.national_address_image}
                      onUpload={handleFileUpload}
                      isUploading={uploadingField === "national_address_image"}
                      t={t}
                    />
                    <SmallFileUploader
                      label={t("files.ownerId")}
                      field="owner_id_image"
                      value={companyState?.owner_id_image}
                      onUpload={handleFileUpload}
                      isUploading={uploadingField === "owner_id_image"}
                      t={t}
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
              className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 text-white py-5 rounded-[2rem] shadow-2xl shadow-purple-500/40 flex items-center justify-center gap-4 font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 border border-white/10"
            >
              {isSaving ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Save className="w-6 h-6" />
              )}
              {isSaving ? t("actions.saving") : t("actions.saveAll")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <Modal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} title={editingBank ? t("actions.editAccount") : t("bank.addNewAccount")}>
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          let res;
          if (editingBank) {
            res = await updateBankAccount(editingBank.id, company.id, bankFormData);
            if (res.success) {
              setBankAccounts(prev => prev.map(b => b.id === editingBank.id ? { ...b, ...bankFormData } : b));
              setIsBankModalOpen(false);
              setEditingBank(null);
              setBankFormData({ bank_beneficiary: "", bank_name: "", bank_account: "", bank_iban: "" });
              toast.success(t("messages.saveSuccess"));
            }
          } else {
            res = await addBankAccount(company.id, bankFormData);
            if (res.success) {
              const newBank = { id: (res as any).id, company_id: company.id, ...bankFormData };
              setBankAccounts(prev => [...prev, newBank]);
              setIsBankModalOpen(false);
              setBankFormData({ bank_beneficiary: "", bank_name: "", bank_account: "", bank_iban: "" });
              toast.success(t("messages.saveSuccess"));
            }
          }
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label={t("bank.bankName")} value={bankFormData.bank_name} onChange={(v: string) => setBankFormData({...bankFormData, bank_name: v})} required />
            <FormInput label={t("bank.beneficiary")} value={bankFormData.bank_beneficiary} onChange={(v: string) => setBankFormData({...bankFormData, bank_beneficiary: v})} required />
            <FormInput label={t("bank.accountNumber")} value={bankFormData.bank_account} onChange={(v: string) => setBankFormData({...bankFormData, bank_account: v})} required />
            <FormInput label={t("bank.iban")} value={bankFormData.bank_iban} onChange={(v: string) => setBankFormData({...bankFormData, bank_iban: v})} required />
          </div>
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black mt-4 hover:shadow-lg hover:shadow-emerald-500/30 transition-all">{t("actions.save")}</button>
        </form>
      </Modal>

      <Modal isOpen={isLicenseModalOpen} onClose={() => setIsLicenseModalOpen(false)} title={editingLicense ? t("actions.editLicense") : t("licenses.addLicense")}>
        <form className="space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          let res;
          if (editingLicense) {
            res = await updateLicense(editingLicense.id, company.id, licenseFormData);
            if (res.success) {
              setLicenses(prev => prev.map(l => l.id === editingLicense.id ? { ...l, ...licenseFormData } : l));
              setIsLicenseModalOpen(false);
              setEditingLicense(null);
              setLicenseFormData({ license_type: "", license_number: "", start_date: "", end_date: "", license_image: "" });
              toast.success(t("messages.saveSuccess"));
            }
          } else {
            res = await addLicense(company.id, licenseFormData);
            if (res.success) {
              const newLicense = { id: (res as any).id, company_id: company.id, ...licenseFormData };
              setLicenses(prev => [...prev, newLicense]);
              setIsLicenseModalOpen(false);
              setLicenseFormData({ license_type: "", license_number: "", start_date: "", end_date: "", license_image: "" });
              toast.success(t("messages.saveSuccess"));
            }
          }
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label={t("forms.licenseType")} value={licenseFormData.license_type} onChange={(v: string) => setLicenseFormData({...licenseFormData, license_type: v})} required />
            <FormInput label={t("forms.licenseNumber")} value={licenseFormData.license_number} onChange={(v: string) => setLicenseFormData({...licenseFormData, license_number: v})} required />
            <FormInput label={t("forms.startDate")} type="date" value={licenseFormData.start_date} onChange={(v: string) => setLicenseFormData({...licenseFormData, start_date: v})} />
            <FormInput label={t("forms.endDate")} type="date" value={licenseFormData.end_date} onChange={(v: string) => setLicenseFormData({...licenseFormData, end_date: v})} />
          </div>
          <div className="mt-4">
            <label className="text-sm font-black text-white/50 mb-2 block">{t("forms.licenseFile")}</label>
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center bg-white/5">
              {licenseFormData.license_image ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="text-emerald-400 w-10 h-10" />
                  <p className="text-sm font-black text-white">{t("forms.fileUploaded")}</p>
                  <button type="button" onClick={() => setLicenseFormData({...licenseFormData, license_image: ""})} className="text-red-400 text-xs font-bold">{t("forms.deleteAndReplace")}</button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="mx-auto text-white/30 w-10 h-10 mb-2" />
                  <p className="text-sm text-white/40 font-bold">{t("forms.clickToUpload")}</p>
                  <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleLicenseFileUpload} />
                </label>
              )}
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-2xl font-black mt-4 hover:shadow-lg hover:shadow-purple-500/30 transition-all">{t("forms.saveLicense")}</button>
        </form>
      </Modal>

    </div>
  );
}

// Components
function CardSection({ title, icon, children, className, gradient = "from-blue-500 to-cyan-500" }: any) {
  return (
    <div className={cn("bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden transition-all duration-500 shadow-xl hover:shadow-2xl hover:border-white/15", className)}>
      <div className={cn("px-6 py-4 border-b border-white/5 flex items-center gap-4 relative overflow-hidden bg-gradient-to-r to-transparent from-white/5")}>
        <div className={cn("p-3 bg-gradient-to-br rounded-2xl text-white shadow-lg relative z-10", gradient)}>
          {icon}
        </div>
        <h3 className="text-lg font-black text-white tracking-tight relative z-10">{title}</h3>
        <Sparkles size={14} className="text-amber-400/40 absolute top-4 left-4" />
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InfoTile({ label, value, icon, color, description }: any) {
  return (
    <div className="group bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/8 p-4 rounded-2xl transition-all hover:shadow-lg">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-white/30 group-hover:text-white/60 transition-colors">
          {React.cloneElement(icon, { size: 14 })}
        </div>
        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{label}</span>
      </div>
      <p className={cn("text-sm font-black truncate", color || "text-white")}>
        {value || "---"}
      </p>
      {description && <p className="text-[10px] text-white/30 mt-1 font-medium">{description}</p>}
    </div>
  );
}

function SmallFileUploader({ label, field, value, onUpload, isUploading, t }: any) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isPdf = value?.toLowerCase()?.endsWith('.pdf');

  return (
    <div className="flex flex-col gap-2">
      {/* Preview / Upload area */}
      <div
        className={cn(
          "w-full rounded-2xl border-2 border-dashed relative overflow-hidden transition-all duration-300 cursor-pointer group/upload",
          value
            ? "border-emerald-500/40 bg-slate-900/50 h-36"
            : "border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 h-28 flex flex-col items-center justify-center"
        )}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-2 h-full">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            <span className="text-[10px] font-bold text-blue-400">{t("forms.uploading")}</span>
          </div>
        ) : value ? (
          /* Image/PDF Preview */
          <>
            {isPdf ? (
              <div className="flex flex-col items-center justify-center gap-2 h-full">
                <FileText size={36} className="text-red-400" />
                <span className="text-[10px] font-black text-white/60">PDF</span>
              </div>
            ) : (
              <img
                src={value}
                alt={label}
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.querySelector('.img-error')?.classList.remove('hidden');
                }}
              />
            )}
            <div className="img-error hidden absolute inset-0 flex flex-col items-center justify-center gap-2">
              <ImageIcon size={24} className="text-white/30" />
              <span className="text-[9px] text-white/30 font-bold">{t("forms.fileUploaded")}</span>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center gap-2">
            <Upload size={20} className="text-white/30 group-hover/upload:text-white/60 transition-colors" />
            <span className="text-[10px] text-white/30 group-hover/upload:text-white/50 font-bold text-center px-2 transition-colors">{label}</span>
          </div>
        )}
        <input ref={inputRef} type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => onUpload(e, field)} />
      </div>

      {/* Label + actions row */}
      <div className="flex items-center justify-between gap-1 px-0.5">
        <span className="text-[10px] font-black text-white/60 truncate flex-1">{label}</span>
        {value && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black hover:bg-amber-500/30 transition-all"
            >
              {t("forms.replace")}
            </button>
            <a
              href={value}
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="px-2 py-1 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black hover:bg-blue-500/30 transition-all"
            >
              {t("forms.view")}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text", required = false }: any) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black text-white/50 uppercase tracking-widest mr-2">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm font-black text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/40 transition-all placeholder:text-white/20"
      />
    </div>
  );
}

function EmptyContent({ message, icon }: any) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white/5 backdrop-blur rounded-[3rem] border-2 border-dashed border-white/10">
      <div className="text-white/20 mb-6">{icon}</div>
      <p className="text-white/40 font-black tracking-tight">{message}</p>
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
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-[3rem] shadow-2xl overflow-hidden border border-white/10"
      >
        {/* Rainbow bar on modal */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
        <div className="px-10 py-7 border-b border-white/5 flex justify-between items-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-transparent" />
          <h3 className="text-xl font-black text-white tracking-tight relative z-10">{title}</h3>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors relative z-10 border border-white/10">
            <X size={20} className="text-white/50" />
          </button>
        </div>
        <div className="p-8">{children}</div>
      </motion.div>
    </div>
  );
}
