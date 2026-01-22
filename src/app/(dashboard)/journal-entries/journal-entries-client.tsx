"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  PlusCircle, Save, Trash2, Edit, Book, Calendar, 
  Building, User, ArrowDown, ArrowUp, Info, List, 
  CheckCircle, AlertCircle, Eye, EyeOff, Search,
  ChevronDown, ChevronUp, FileText, Landmark, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useTranslations } from "@/lib/locale-context";

interface Account {
  id: number;
  account_code: string;
  account_name: string;
}

interface JournalLine {
  id?: number;
  account_id: string;
  description: string;
  debit: string;
  credit: string;
}

interface Entry {
  id: number;
  entry_number: string;
  entry_date: string;
  account_id: number;
  description: string;
  debit: number;
  credit: number;
  created_by: string;
  accounts: {
    account_name: string;
    account_code: string;
  };
}

function JournalEntriesContent() {
  const t = useTranslations("journalEntries");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [entryNumber, setEntryNumber] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [lines, setLines] = useState<JournalLine[]>([
    { account_id: "", description: "", debit: "0", credit: "0" },
    { account_id: "", description: "", debit: "0", credit: "0" }
  ]);
  const [loading, setLoading] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});
  const [showModal, setShowModal] = useState(false);

  const companyId = "1";

  const formatDateGregorian = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getTodayGregorian = () => {
    return new Date().toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const fetchMetadata = async () => {
    try {
      const res = await fetch(`/api/journal-entries/metadata?company_id=${companyId}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAccounts(data.accounts);
      setEntries(data.entries);
      if (!isEdit) setEntryNumber(data.entryNumber);
    } catch (error) {
      console.error(error);
      toast.error(t("fetchError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetadata();
  }, [isEdit]);

  const totals = useMemo(() => {
    let debit = 0;
    let credit = 0;
    lines.forEach(l => {
      debit += parseFloat(l.debit) || 0;
      credit += parseFloat(l.credit) || 0;
    });
    return { debit, credit, diff: Math.abs(debit - credit) };
  }, [lines]);

  const groupedEntries = useMemo(() => {
    const groups: Record<string, Entry[]> = {};
    entries.forEach(e => {
      if (!groups[e.entry_number]) groups[e.entry_number] = [];
      groups[e.entry_number].push(e);
    });
    return groups;
  }, [entries]);

  const filteredGroups = useMemo(() => {
    if (!searchTerm) return groupedEntries;
    const lowerSearch = searchTerm.toLowerCase();
    const filtered: Record<string, Entry[]> = {};
    Object.entries(groupedEntries).forEach(([num, lines]) => {
      const match = num.toLowerCase().includes(lowerSearch) || 
                   lines.some(l => l.description.toLowerCase().includes(lowerSearch) || 
                                  l.accounts.account_name.toLowerCase().includes(lowerSearch));
      if (match) filtered[num] = lines;
    });
    return filtered;
  }, [groupedEntries, searchTerm]);

  const addRow = () => {
    setLines([...lines, { account_id: "", description: "", debit: "0", credit: "0" }]);
  };

  const removeRow = (index: number) => {
    if (lines.length <= 2) return toast.error(t("minLinesError"));
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totals.diff > 0.01) return toast.error(t("balanceError"));
    
    const validLines = lines.filter(l => (parseFloat(l.debit) > 0 || parseFloat(l.credit) > 0) && l.account_id);
    if (validLines.length < 2) return toast.error(t("minLinesError"));

    try {
      const res = await fetch("/api/journal-entries/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_number: entryNumber,
          entry_date: entryDate,
          lines: validLines,
          company_id: companyId,
          created_by: "المدير",
          is_edit: isEdit
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success(isEdit ? t("updateSuccess") : t("saveSuccess"));
      resetForm();
      setShowModal(false);
      fetchMetadata();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const resetForm = () => {
    setLines([{ account_id: "", description: "", debit: "0", credit: "0" }, { account_id: "", description: "", debit: "0", credit: "0" }]);
    setEntryDate(new Date().toISOString().split("T")[0]);
    setIsEdit(false);
    fetchMetadata();
  };

  const handleEdit = (num: string, entries: Entry[]) => {
    setEntryNumber(num);
    setEntryDate(entries[0].entry_date);
    setLines(entries.map(e => ({
      account_id: String(e.account_id),
      description: e.description,
      debit: String(e.debit),
      credit: String(e.credit)
    })));
    setIsEdit(true);
    setShowModal(true);
  };

  const handleDelete = async (num: string) => {
    if (!confirm(t("deleteConfirm"))) return;
    try {
      const res = await fetch(`/api/journal-entries/delete?entry_number=${num}&company_id=${companyId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        toast.success(t("deleteSuccess"));
        fetchMetadata();
      }
    } catch (error) {
      toast.error(t("fetchError"));
    }
  };

  const toggleExpand = (num: string) => {
    setExpandedEntries(prev => ({ ...prev, [num]: !prev[num] }));
  };

  const openNewEntryModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">{t("fetchError")}</div>;

  return (
    <div className="max-w-[1600px] mx-auto p-4 animate-in fade-in duration-700" dir="rtl">
      <div className="bg-[#1a2234] rounded-[30px] p-8 shadow-2xl border border-white/5 space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#2c3e50] to-[#34495e] rounded-[30px] p-8 md:p-12 shadow-2xl border border-white/10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-green-400 to-red-400 animate-gradient-x" />
          <div className="relative z-10 flex flex-col items-center text-center space-y-6">
            <motion.h1 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl md:text-5xl font-extrabold text-white flex items-center gap-4 drop-shadow-lg"
            >
              <Book className="w-12 h-12 text-yellow-400" />
              {t("title")}
            </motion.h1>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-inner">
              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                {entryNumber}
              </h2>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <span className="flex items-center gap-2 px-6 py-2 bg-blue-500/20 backdrop-blur-sm rounded-full border border-blue-400/30 text-blue-100 font-semibold">
                <User className="w-5 h-5" />
                {t("createdBy")}: المدير
              </span>
              <span className="flex items-center gap-2 px-6 py-2 bg-green-500/20 backdrop-blur-sm rounded-full border border-green-400/30 text-green-100 font-semibold">
                <Calendar className="w-5 h-5" />
                {t("entryDate")}: {getTodayGregorian()}
              </span>
            </div>

            {/* Add New Entry Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openNewEntryModal}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all mt-4"
            >
              <PlusCircle className="w-6 h-6" />
              {t("createEntry")}
            </motion.button>
          </div>
        </div>

        {/* Saved Entries List */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[25px] shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-[#2c3e50] to-[#2ecc71] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <List className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold">{t("journalLog")}</h3>
                <p className="text-white/70 font-medium">{t("subtitle")}</p>
              </div>
            </div>
            <div className="relative w-full md:w-96 group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder={t("searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-4 pr-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-white/50 focus:bg-white focus:text-gray-800 outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-4">
              {Object.keys(filteredGroups).length > 0 ? (
                Object.entries(filteredGroups).map(([num, lines]) => (
                  <div key={num} className="border-2 border-gray-100 rounded-[20px] overflow-hidden hover:border-blue-200 transition-all group">
                    <div 
                      onClick={() => toggleExpand(num)}
                      className="p-6 bg-gray-50/50 flex justify-between items-center cursor-pointer hover:bg-blue-50/50 transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="px-5 py-2 bg-white border-2 border-blue-100 rounded-xl font-black text-blue-700 shadow-sm">
                          {num}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500 font-bold flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDateGregorian(lines[0].entry_date)}
                          </span>
                          <span className="text-gray-700 font-bold line-clamp-1">{lines[0].description}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-400 font-bold uppercase">{t("total")}</span>
                            <span className="text-xl font-black text-blue-600">
                              {lines.reduce((sum, l) => sum + l.debit, 0).toLocaleString()} <small className="text-[10px] opacity-70">SAR</small>
                            </span>
                          </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEdit(num, lines); }}
                            className="p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(num); }}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        {expandedEntries[num] ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedEntries[num] && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-6 bg-white border-t border-gray-100">
                              <table className="w-full">
                                <thead>
                                  <tr className="text-gray-400 text-sm font-bold border-b border-gray-50">
                                    <th className="pb-3 text-right">{t("account")}</th>
                                    <th className="pb-3 text-right">{t("description")}</th>
                                    <th className="pb-3 text-center">{t("debit")}</th>
                                    <th className="pb-3 text-center">{t("credit")}</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                  {lines.map((l, i) => (
                                    <tr key={i} className="text-sm font-medium">
                                      <td className="py-4 text-blue-800 font-bold">
                                        <div className="flex items-center gap-2">
                                          <Landmark className="w-3 h-3 opacity-30" />
                                          {l.accounts.account_code} - {l.accounts.account_name}
                                        </div>
                                      </td>
                                      <td className="py-4 text-gray-600 italic">{l.description || "---"}</td>
                                      <td className="py-4 text-center font-black text-red-500">{l.debit > 0 ? l.debit.toLocaleString() : "-"}</td>
                                      <td className="py-4 text-center font-black text-green-500">{l.credit > 0 ? l.credit.toLocaleString() : "-"}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between text-xs font-bold text-gray-400">
                                <span>{t("createdBy")}: {lines[0].created_by}</span>
                                <span>{t("operationNumber")}: {lines[0].id}</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                    <Book className="w-20 h-20 text-gray-200 mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-gray-400">{t("noEntries")}</h4>
                    <p className="text-gray-300">{t("noEntriesDesc")}</p>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Creating/Editing Entry */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-[25px] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-[#2c3e50] to-[#3498db] p-6 text-white flex justify-between items-center">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    <PlusCircle className="w-6 h-6" />
                    {isEdit ? t("editEntry") : t("createEntry")}
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-medium border border-white/10">
                      {lines.length} {t("lines")}
                    </span>
                    <button 
                      onClick={() => setShowModal(false)}
                      className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-80px)]">
                  <form onSubmit={handleSave} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500" />
                          {t("entryNumber")}
                        </label>
                        <input 
                          type="text" 
                          value={entryNumber} 
                          readOnly 
                          className="w-full p-4 bg-gray-50 border-2 border-blue-100 rounded-xl font-bold text-blue-800"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          {t("entryDate")}
                        </label>
                        <input 
                          type="date" 
                          value={entryDate} 
                          onChange={(e) => setEntryDate(e.target.value)}
                          className="w-full p-4 border-2 border-blue-100 rounded-xl focus:border-blue-500 transition-colors bg-white outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-green-500" />
                          {t("selectedDate")}
                        </label>
                        <div className="w-full p-4 bg-green-50 border-2 border-green-100 rounded-xl font-bold text-green-800">
                          {formatDateGregorian(entryDate)}
                        </div>
                      </div>
                    </div>

                    {/* Entry Lines Table */}
                    <div className="border-2 border-blue-50 rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full border-collapse">
                        <thead className="bg-gradient-to-r from-gray-50 to-blue-50 text-gray-700 font-bold border-b-2 border-blue-100">
                          <tr>
                            <th className="p-4 text-right w-1/4">{t("account")}</th>
                            <th className="p-4 text-right w-1/4">{t("description")}</th>
                            <th className="p-4 text-center w-1/6">{t("debit")}</th>
                            <th className="p-4 text-center w-1/6">{t("credit")}</th>
                            <th className="p-4 text-center w-20"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-50">
                          <AnimatePresence>
                            {lines.map((line, index) => (
                              <motion.tr 
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="hover:bg-blue-50/30 transition-colors"
                              >
                                <td className="p-2">
                                  <select 
                                    value={line.account_id}
                                    onChange={(e) => handleLineChange(index, "account_id", e.target.value)}
                                    className="w-full p-3 border-2 border-gray-100 rounded-lg focus:border-blue-400 outline-none bg-white transition-all"
                                    required
                                  >
                                    <option value="">{t("selectAccount")}</option>
                                    {accounts.map(acc => (
                                      <option key={acc.id} value={acc.id}>
                                        {acc.account_code} - {acc.account_name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="p-2">
                                  <input 
                                    type="text"
                                    value={line.description}
                                    onChange={(e) => handleLineChange(index, "description", e.target.value)}
                                    placeholder={t("descriptionPlaceholder")}
                                    className="w-full p-3 border-2 border-gray-100 rounded-lg focus:border-blue-400 outline-none transition-all"
                                  />
                                </td>
                                <td className="p-2">
                                  <div className="relative">
                                    <ArrowDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                                    <input 
                                      type="number"
                                      step="0.01"
                                      value={line.debit}
                                      onChange={(e) => handleLineChange(index, "debit", e.target.value)}
                                      className="w-full p-3 pl-10 text-center font-bold text-red-600 border-2 border-gray-100 rounded-lg focus:border-red-200 outline-none bg-white"
                                    />
                                  </div>
                                </td>
                                <td className="p-2">
                                  <div className="relative">
                                    <ArrowUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                                    <input 
                                      type="number"
                                      step="0.01"
                                      value={line.credit}
                                      onChange={(e) => handleLineChange(index, "credit", e.target.value)}
                                      className="w-full p-3 pl-10 text-center font-bold text-green-600 border-2 border-gray-100 rounded-lg focus:border-green-200 outline-none bg-white"
                                    />
                                  </div>
                                </td>
                                <td className="p-2 text-center">
                                  <button 
                                    type="button" 
                                    onClick={() => removeRow(index)}
                                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </td>
                              </motion.tr>
                            ))}
                          </AnimatePresence>
                        </tbody>
                        <tfoot className="bg-gray-50/50">
                          <tr className="font-bold text-lg">
                            <td colSpan={2} className="p-6 text-left text-gray-600">{t("total")}:</td>
                            <td className="p-6 text-center text-red-600">{totals.debit.toFixed(2)}</td>
                            <td className="p-6 text-center text-green-600">{totals.credit.toFixed(2)}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Validation Alerts */}
                    <div className="flex flex-col gap-4">
                      {totals.diff > 0.01 ? (
                        <div className="flex items-center gap-3 p-5 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 animate-pulse">
                          <AlertCircle className="w-6 h-6 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-lg">{t("unbalanced")}!</p>
                            <p className="text-sm font-medium opacity-80">{t("difference")}: {totals.diff.toFixed(2)} ريال</p>
                          </div>
                        </div>
                      ) : totals.debit > 0 ? (
                        <div className="flex items-center gap-3 p-5 bg-green-50 border-2 border-green-200 rounded-2xl text-green-700">
                          <CheckCircle className="w-6 h-6 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-lg">{t("balanced")}</p>
                            <p className="text-sm font-medium opacity-80">{t("balancedDesc")}</p>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex justify-between items-center gap-4 pt-6 border-t border-gray-100">
                      <button 
                        type="button" 
                        onClick={addRow}
                        className="flex items-center gap-2 px-8 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1 active:scale-95"
                      >
                        <PlusCircle className="w-5 h-5" />
                        {t("addRow")}
                      </button>

                      <div className="flex gap-4">
                        <button 
                          type="button" 
                          onClick={() => { resetForm(); setShowModal(false); }}
                          className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold transition-all"
                        >
                          {t("cancel")}
                        </button>
                        <button 
                          type="submit"
                          disabled={totals.diff > 0.01 || totals.debit === 0}
                          className="flex items-center gap-2 px-12 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-xl shadow-green-200 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          <Save className="w-5 h-5" />
                          {isEdit ? t("saveChanges") : t("postEntry")}
                        </button>
                      </div>
                    </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function JournalEntriesClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JournalEntriesContent />
    </Suspense>
  );
}
