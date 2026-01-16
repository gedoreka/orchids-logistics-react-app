"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  label: string;
  description: string;
}

const AVAILABLE_PERMISSIONS: Permission[] = [
  { key: "employees_module", label: "إدارة الموظفين", description: "الوصول لصفحة الموظفين" },
  { key: "clients_module", label: "العملاء", description: "إدارة العملاء" },
  { key: "receipts_module", label: "السندات المالية", description: "سندات القبض والصرف" },
  { key: "salary_payrolls_module", label: "كشوف الرواتب", description: "إدارة الرواتب" },
  { key: "sales_module", label: "المبيعات", description: "الفواتير والمبيعات" },
  { key: "credit_notes_module", label: "إشعارات الائتمان", description: "إشعارات دائنة ومدينة" },
  { key: "expenses_module", label: "المصروفات", description: "إدارة المصروفات" },
  { key: "journal_entries_module", label: "القيود اليومية", description: "القيود المحاسبية" },
  { key: "income_report_module", label: "تقارير الأرباح", description: "الأرباح والخسائر" },
  { key: "accounts_module", label: "الحسابات", description: "شجرة الحسابات" },
  { key: "cost_centers_module", label: "مراكز التكلفة", description: "إدارة مراكز التكلفة" },
  { key: "ledger_module", label: "الأستاذ العام", description: "دفتر الأستاذ" },
  { key: "trial_balance_module", label: "ميزان المراجعة", description: "ميزان المراجعة" },
  { key: "income_statement_module", label: "قائمة الدخل", description: "قائمة الدخل" },
  { key: "balance_sheet_module", label: "الميزانية العمومية", description: "الميزانية العمومية" },
  { key: "quotations_module", label: "عروض الأسعار", description: "إدارة عروض الأسعار" },
];

export default function SubUsersPage() {
  const [subUsers, setSubUsers] = useState<SubUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SubUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyPermissions, setCompanyPermissions] = useState<string[]>([]);

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
      alert("كلمات المرور غير متطابقة");
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
      } else {
        alert(data.error || "حدث خطأ");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("حدث خطأ في إنشاء المستخدم");
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
      } else {
        alert(data.error || "حدث خطأ");
      }
    } catch (error) {
      console.error("Error updating user:", error);
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
      }
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const handleDeleteUser = async (user: SubUser) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟`)) return;

    try {
      const res = await fetch(`/api/sub-users/${user.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchSubUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl">
                <Users size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">إدارة المستخدمين</h1>
                <p className="text-slate-400">إضافة وإدارة المستخدمين الفرعيين للشركة</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFormData({ name: "", email: "", password: "", confirmPassword: "", permissions: [] });
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              <UserPlus size={20} />
              إضافة مستخدم جديد
            </button>
          </div>
        </motion.div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="البحث عن مستخدم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="animate-spin text-blue-500" size={40} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Users className="mx-auto text-slate-600 mb-4" size={64} />
            <h3 className="text-xl font-bold text-slate-400">لا يوجد مستخدمين</h3>
            <p className="text-slate-500 mt-2">ابدأ بإضافة مستخدم جديد</p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
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

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">{user.permissions?.length || 0}</div>
                      <div className="text-xs text-slate-400">صلاحيات</div>
                    </div>

                    <div className={cn(
                      "px-4 py-2 rounded-lg text-sm font-bold",
                      user.status === "active" 
                        ? "bg-emerald-500/20 text-emerald-400" 
                        : "bg-red-500/20 text-red-400"
                    )}>
                      {user.status === "active" ? "نشط" : "موقوف"}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                        title="تعديل"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={cn(
                          "p-2 rounded-lg transition-colors",
                          user.status === "active"
                            ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                        )}
                        title={user.status === "active" ? "تجميد" : "تفعيل"}
                      >
                        {user.status === "active" ? <Lock size={18} /> : <Unlock size={18} />}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowActivityModal(true);
                        }}
                        className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                        title="سجل النشاط"
                      >
                        <Activity size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        title="حذف"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {user.last_login_at && (
                  <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-2 text-sm text-slate-400">
                    <Clock size={14} />
                    آخر دخول: {new Date(user.last_login_at).toLocaleString("ar-SA")}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

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
                className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              >
                <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    {showAddModal ? "إضافة مستخدم جديد" : "تعديل المستخدم"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">
                        الاسم الكامل *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                        placeholder="أدخل الاسم"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-300 mb-2">
                        البريد الإلكتروني *
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

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">
                          كلمة المرور {showAddModal ? "*" : "(اختياري)"}
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
                          تأكيد كلمة المرور
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
                      توليد كلمة مرور تلقائية
                    </button>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-bold text-slate-300">
                          الصلاحيات
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={selectAllPermissions}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            تحديد الكل
                          </button>
                          <span className="text-slate-600">|</span>
                          <button
                            type="button"
                            onClick={deselectAllPermissions}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            إلغاء الكل
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                        {AVAILABLE_PERMISSIONS.filter(p => companyPermissions.includes(p.key)).map((perm) => (
                          <button
                            key={perm.key}
                            type="button"
                            onClick={() => togglePermission(perm.key)}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border transition-all text-right",
                              formData.permissions.includes(perm.key)
                                ? "bg-blue-500/20 border-blue-500 text-blue-300"
                                : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                            )}
                          >
                            <div className={cn(
                              "w-5 h-5 rounded flex items-center justify-center",
                              formData.permissions.includes(perm.key)
                                ? "bg-blue-500"
                                : "bg-slate-700"
                            )}>
                              {formData.permissions.includes(perm.key) && (
                                <Check size={14} className="text-white" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-sm">{perm.label}</div>
                              <div className="text-xs opacity-60">{perm.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
                    className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={showAddModal ? handleCreateUser : handleUpdateUser}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold hover:shadow-lg transition-all"
                  >
                    {showAddModal ? "إنشاء المستخدم" : "حفظ التغييرات"}
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
        </AnimatePresence>
      </div>
    </div>
  );
}

function ActivityLogModal({ user, onClose }: { user: SubUser; onClose: () => void }) {
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
            <h2 className="text-xl font-bold text-white">سجل النشاط</h2>
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
            الجلسات النشطة
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
            سجل العمليات
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="animate-spin text-blue-500" size={32} />
            </div>
          ) : activeTab === "sessions" ? (
            sessions.length === 0 ? (
              <div className="text-center py-8 text-slate-400">لا توجد جلسات</div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 bg-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="text-white font-bold">{session.ip_address || "غير معروف"}</div>
                      <div className="text-slate-400 text-sm">
                        {new Date(session.login_at).toLocaleString("ar-SA")}
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded-lg text-sm font-bold",
                      session.is_active
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-slate-700 text-slate-400"
                    )}>
                      {session.is_active ? "نشط" : "منتهي"}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            activities.length === 0 ? (
              <div className="text-center py-8 text-slate-400">لا توجد عمليات مسجلة</div>
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
                      {new Date(activity.created_at).toLocaleString("ar-SA")}
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
