"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { useTranslations } from "@/lib/locale-context";
import { notify } from "@/lib/notifications";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Eye,
  Search,
  X,
  Check,
  Shield,
  Mail,
  Clock,
  Activity,
  Copy,
  RefreshCw,
  UserPlus,
  Settings,
  LogOut,
  Building2,
  PlusCircle,
  Key,
  Bell,
  MessageSquare,
  Coins,
  BadgeDollarSign,
  Receipt,
  FileText,
  Car,
  Truck,
  Package,
  Calendar,
  HandCoins,
  BarChart3,
  FileEdit,
  CreditCard,
  Landmark,
  Calculator,
  BookOpen,
  Scale,
  PieChart,
  Store,
  FileSpreadsheet,
  Home,
  CheckCircle,
  Sparkles,
  AlertTriangle
} from "lucide-react";

interface SubUser {
  id: number;
  name: string;
  email: string;
  profile_image?: string;
  status: "active" | "suspended" | "deleted";
  created_at: string;
  last_login_at?: string;
  permissions: string[];
  active_sessions?: number;
}

interface Permission {
  key: string;
  icon: any;
  category: string;
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  { key: 'employees_module', icon: Users, category: 'hr' },
  { key: 'salary_payrolls_module', icon: BadgeDollarSign, category: 'hr' },
  { key: 'clients_module', icon: Users, category: 'sales' },
  { key: 'receipts_module', icon: Receipt, category: 'financial' },
  { key: 'quotations_module', icon: FileText, category: 'financial' },
  { key: 'sales_module', icon: FileText, category: 'financial' },
  { key: 'income_module', icon: Coins, category: 'financial' },
  { key: 'credit_notes_module', icon: CreditCard, category: 'financial' },
  { key: 'receipt_vouchers_module', icon: FileSpreadsheet, category: 'financial' },
  { key: 'vehicles_list', icon: Car, category: 'fleet' },
  { key: 'ecommerce_orders_module', icon: Store, category: 'ecommerce' },
  { key: 'daily_orders_module', icon: Calendar, category: 'ecommerce' },
  { key: 'ecommerce_stores_module', icon: Store, category: 'ecommerce' },
  { key: 'personal_shipments_module', icon: Truck, category: 'shipping' },
  { key: 'manage_shipments_module', icon: Package, category: 'shipping' },
  { key: 'monthly_commissions_module', icon: HandCoins, category: 'commissions' },
  { key: 'commissions_summary_module', icon: FileSpreadsheet, category: 'commissions' },
  { key: 'expenses_module', icon: BarChart3, category: 'accounting' },
  { key: 'journal_entries_module', icon: FileEdit, category: 'accounting' },
  { key: 'income_report_module', icon: PieChart, category: 'accounting' },
  { key: 'expenses_report_module', icon: BarChart3, category: 'accounting' },
  { key: 'accounts_module', icon: BookOpen, category: 'accounts' },
  { key: 'cost_centers_module', icon: Landmark, category: 'accounts' },
  { key: 'ledger_module', icon: BookOpen, category: 'accounts' },
  { key: 'trial_balance_module', icon: Scale, category: 'accounts' },
  { key: 'income_statement_module', icon: BarChart3, category: 'accounts' },
  { key: 'balance_sheet_module', icon: FileText, category: 'accounts' },
  { key: 'tax_settings_module', icon: Calculator, category: 'accounts' },
  { key: 'letters_templates_module', icon: Mail, category: 'others' },
  { key: 'sub_users_module', icon: Users, category: 'admin' },
];

export default function SubUsersPage() {
  const t = useTranslations("subUsers");
  const commonT = useTranslations("common");
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SubUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyPermissions, setCompanyPermissions] = useState<string[]>([]);
  const [companyName, setCompanyName] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    permissions: [] as string[],
  });

  useEffect(() => {
    fetchSubUsers();
    fetchCompanyPermissions();
  }, []);

  const fetchSubUsers = async () => {
    try {
      const res = await fetch("/api/sub-users");
      const data = await res.json();
      if (data.subUsers) {
        setSubUsers(data.subUsers);
      }
    } catch (error) {
      console.error("Error fetching sub-users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyPermissions = async () => {
    try {
      const res = await fetch("/api/company-info");
      const data = await res.json();
      if (data.companyName) setCompanyName(data.companyName);
      if (data.permissions) {
        const enabledPerms = Object.entries(data.permissions)
          .filter(([, value]) => value === 1)
          .map(([key]) => key);
        setCompanyPermissions(enabledPerms);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const handleCreateUser = async () => {
    if (formData.password !== formData.confirmPassword) {
      alert(t("passwordMismatch"));
      return;
    }

    try {
      const res = await fetch("/api/sub-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          permissions: formData.permissions,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setFormData({ name: "", email: "", password: "", confirmPassword: "", permissions: [] });
        fetchSubUsers();
        notify.success(t("createUserSuccess") || "تم إنشاء المستخدم بنجاح");
      } else {
        notify.error(data.error || commonT("error"));
      }
    } catch (error) {
      console.error("Error creating user:", error);
      notify.error(t("errorCreating"));
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/sub-users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined,
          permissions: formData.permissions,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowEditModal(false);
        setSelectedUser(null);
        fetchSubUsers();
        notify.success(t("saveChangesSuccess") || "تم حفظ التعديلات بنجاح");
      } else {
        notify.error(data.error || commonT("error"));
      }
    } catch (error) {
      console.error("Error updating user:", error);
      notify.error(commonT("error"));
    }
  };

  const handleToggleStatus = async (user: SubUser) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    try {
      const res = await fetch(`/api/sub-users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchSubUsers();
        notify.success({
          title: t("statusChangeTitle"),
          description: newStatus === "active" ? t("statusActive") : t("statusSuspended")
        });
      }
    } catch (error) {
      console.error("Error toggling status:", error);
      notify.error(commonT("error"));
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/sub-users/${selectedUser.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchSubUsers();
        notify.success(t("deleteSuccess") || "تم حذف المستخدم بنجاح");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      notify.error(commonT("error"));
    }
  };

  const openEditModal = (user: SubUser) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      confirmPassword: "",
      permissions: user.permissions || [],
    });
    setShowEditModal(true);
  };

  const togglePermission = (permKey: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permKey)
        ? prev.permissions.filter((p) => p !== permKey)
        : [...prev.permissions, permKey],
    }));
  };

  const selectAllPermissions = () => {
    const availablePerms = AVAILABLE_PERMISSIONS.filter(p => companyPermissions.includes(p.key)).map(p => p.key);
    setFormData((prev) => ({ ...prev, permissions: availablePerms }));
  };

  const deselectAllPermissions = () => {
    setFormData((prev) => ({ ...prev, permissions: [] }));
  };

  const filteredUsers = subUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password, confirmPassword: password }));
  };

  return (
    <div className="p-4 md:p-6" dir="rtl">
      <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-[#1a2234] p-4 md:p-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white shadow-2xl border border-white/10 p-6 md:p-8"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
                <Users size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
                  {t("title")}
                </h1>
                <p className="text-white/60 font-medium mt-1 text-sm md:text-base">{t("subtitle")}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFormData({ name: "", email: "", password: "", confirmPassword: "", permissions: [] });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all w-full md:w-auto justify-center"
            >
              <UserPlus size={20} />
              {t("addNewUser")}
            </button>
          </div>
        </motion.div>

        <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/10 backdrop-blur-xl p-4">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="animate-spin text-blue-500" size={40} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white/5 rounded-[2rem] border border-white/10"
          >
            <Users className="mx-auto text-slate-600 mb-4" size={64} />
            <h3 className="text-xl font-bold text-slate-400">{t("noUsers")}</h3>
            <p className="text-slate-500 mt-2">{t("startAdding")}</p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all group"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{user.name}</h3>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Mail size={14} />
                        {user.email}
                      </div>
                    </div>
                  </div>

                      <div className="flex flex-wrap items-center justify-center gap-3 w-full md:w-auto">
                        <div className="text-center px-4">
                          <div className="text-2xl font-bold text-white">{user.permissions?.length || 0}</div>
                          <div className="text-xs text-slate-400">{t("permissions")}</div>
                        </div>

                        <div className={cn(
                          "px-4 py-2 rounded-lg text-sm font-bold",
                          user.status === "active" 
                            ? "bg-emerald-500/20 text-emerald-400" 
                            : "bg-red-500/20 text-red-400"
                        )}>
                          {t(user.status)}
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all border border-blue-500/20"
                          >
                            <Edit size={16} />
                            <span className="text-xs font-bold">{t("editUser")}</span>
                          </button>
                          
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg transition-all border",
                              user.status === "active"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            )}
                          >
                            {user.status === "active" ? (
                              <>
                                <Lock size={16} />
                                <span className="text-xs font-bold">{t("suspended")}</span>
                              </>
                            ) : (
                              <>
                                <Unlock size={16} />
                                <span className="text-xs font-bold">{t("active")}</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowActivityModal(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 transition-all border border-purple-500/20"
                          >
                            <Activity size={16} />
                            <span className="text-xs font-bold">{t("operations")}</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDeleteModal(true);
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all border border-red-500/20"
                          >
                            <Trash2 size={16} />
                            <span className="text-xs font-bold">{commonT("delete")}</span>
                          </button>
                        </div>
                      </div>

                </div>

                {user.last_login_at && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-sm text-slate-400">
                      <Clock size={14} />
                      {t("lastLogin")}: {new Date(user.last_login_at).toLocaleString("en-GB")}
                    </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowAddModal(false);
              setShowEditModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900">
                <h2 className="text-xl font-bold text-white">
                  {showAddModal ? t("addNewUser") : t("editUser")}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/60"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">
                      {t("fullName")}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      placeholder={commonT("name")}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-300 mb-2">
                      {t("email")}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      placeholder="example@company.com"
                      dir="ltr"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">
                        {t("password")} {showEditModal && t("passwordOptional")}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                          placeholder="••••••••"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">
                        {t("confirmPassword")}
                      </label>
                      <input
                        type="text"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                        placeholder="••••••••"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={generatePassword}
                    className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    <RefreshCw size={14} />
                    {t("generatePassword")}
                  </button>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-bold text-slate-300">
                          {t("availablePermissions")}
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={selectAllPermissions}
                            className="text-xs text-blue-400 hover:text-blue-300 font-bold"
                          >
                            {t("selectAll")}
                          </button>
                          <span className="text-slate-600">|</span>
                          <button
                            type="button"
                            onClick={deselectAllPermissions}
                            className="text-xs text-red-400 hover:text-red-300 font-bold"
                          >
                            {t("deselectAll")}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {Array.from(new Set(AVAILABLE_PERMISSIONS.filter(p => companyPermissions.includes(p.key)).map(p => p.category))).map((category) => (
                          <div key={category} className="space-y-3">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                              <div className="w-1 h-3 bg-blue-500 rounded-full" />
                              {t("categories." + category)}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {AVAILABLE_PERMISSIONS.filter(p => p.category === category && companyPermissions.includes(p.key)).map((perm) => (
                                <button
                                  key={perm.key}
                                  type="button"
                                  onClick={() => togglePermission(perm.key)}
                                  className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl border transition-all text-right group",
                                    formData.permissions.includes(perm.key)
                                      ? "bg-blue-500/10 border-blue-500/50 text-blue-100 shadow-lg shadow-blue-500/5"
                                      : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800"
                                  )}
                                >
                                  <div className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                                    formData.permissions.includes(perm.key)
                                      ? "bg-blue-500 text-white shadow-lg"
                                      : "bg-slate-700 text-slate-400 group-hover:bg-slate-600"
                                  )}>
                                    <perm.icon size={20} />
                                  </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-bold text-sm truncate">{t("permissionsList." + perm.key)}</div>
                                      <div className="text-[10px] opacity-50 truncate leading-tight">{t("accessToData")} {t("permissionsList." + perm.key)}</div>
                                    </div>
                                  <div className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                    formData.permissions.includes(perm.key)
                                      ? "border-blue-500 bg-blue-500"
                                      : "border-slate-600"
                                  )}>
                                    {formData.permissions.includes(perm.key) && (
                                      <Check size={12} className="text-white" />
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-700 flex justify-end gap-3 bg-slate-800/50">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={showAddModal ? handleCreateUser : handleUpdateUser}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold hover:shadow-lg transition-all shadow-blue-500/20"
                >
                  {showAddModal ? t("createUser") : t("saveChanges")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showActivityModal && selectedUser && (
          <ActivityLogModal
            user={selectedUser}
            onClose={() => {
              setShowActivityModal(false);
              setSelectedUser(null);
            }}
          />
        )}
        {showDeleteModal && selectedUser && (
          <DeleteConfirmModal
            user={selectedUser}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedUser(null);
            }}
            onConfirm={handleDeleteUser}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function DeleteConfirmModal({ user, onClose, onConfirm }: { user: SubUser; onClose: () => void; onConfirm: () => void }) {
  const t = useTranslations("subUsers");
  const commonT = useTranslations("common");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1a2234] border border-white/10 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl"
      >
        <div className="relative p-8 md:p-12 text-center">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
          
          <div className="mb-8 relative inline-block">
            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
            <div className="relative w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-3xl flex items-center justify-center border border-red-500/30 shadow-xl">
              <AlertTriangle size={48} className="text-red-500 animate-pulse" />
            </div>
          </div>

          <h2 className="text-3xl font-black text-white mb-4 tracking-tight">
            {t("deleteConfirmTitle")}
          </h2>
          
          <p className="text-slate-400 text-lg leading-relaxed mb-10 font-medium">
            {t("deleteConfirmMessage")}
            <br />
            <span className="text-white font-bold mt-2 block px-4 py-2 bg-white/5 rounded-xl border border-white/10 inline-block">
              {user.name} ({user.email})
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onClose}
              className="px-8 py-4 rounded-2xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all border border-slate-700 order-2 sm:order-1"
            >
              {t("cancel")}
            </button>
            <button
              onClick={onConfirm}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 text-white font-black hover:shadow-lg hover:shadow-red-500/30 transition-all transform hover:-translate-y-1 active:scale-95 order-1 sm:order-2 flex items-center justify-center gap-2"
            >
              <Trash2 size={20} />
              {commonT("delete")}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ActivityLogModal({ user, onClose }: { user: SubUser; onClose: () => void }) {
  const t = useTranslations("subUsers");
  const commonT = useTranslations("common");
  const [sessions, setSessions] = useState<Array<{ id: number; ip_address: string; login_at: string; is_active: boolean }>>([]);
  const [activities, setActivities] = useState<Array<{ id: number; action_type: string; action_description: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"sessions" | "activities">("sessions");

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      const res = await fetch(`/api/sub-users/${user.id}`);
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
      if (data.activityLogs) setActivities(data.activityLogs);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
      >
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{t("activityLog")}</h2>
            <p className="text-slate-400 text-sm">{user.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-700 flex gap-2">
          <button
            onClick={() => setActiveTab("sessions")}
            className={cn(
              "px-4 py-2 rounded-lg font-bold transition-colors",
              activeTab === "sessions"
                ? "bg-blue-500 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            )}
          >
            {t("sessions")}
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={cn(
              "px-4 py-2 rounded-lg font-bold transition-colors",
              activeTab === "activities"
                ? "bg-blue-500 text-white"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700"
            )}
          >
            {t("operations")}
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="animate-spin text-blue-500" size={32} />
            </div>
          ) : activeTab === "sessions" ? (
            sessions.length === 0 ? (
              <div className="text-center py-8 text-slate-400">{t("noSessions")}</div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 bg-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-white font-bold">{session.ip_address || commonT("notSpecified")}</div>
                      <div className="text-slate-400 text-sm">
                        {new Date(session.login_at).toLocaleString("en-GB")}
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-lg text-sm font-bold",
                      session.is_active
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-slate-700 text-slate-400"
                    )}>
                      {session.is_active ? t("active") : commonT("completed")}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            activities.length === 0 ? (
              <div className="text-center py-8 text-slate-400">{t("noOperations")}</div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-4 bg-slate-800 rounded-xl"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Activity size={16} className="text-purple-400" />
                      <span className="text-white font-bold">{activity.action_description}</span>
                    </div>
                    <div className="text-slate-400 text-sm">
                      {new Date(activity.created_at).toLocaleString("en-GB")}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
