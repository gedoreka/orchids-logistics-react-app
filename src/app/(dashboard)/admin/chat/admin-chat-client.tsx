"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MessageSquare, 
  Building2, 
  ChevronRight,
  Clock,
  Circle
} from "lucide-react";
import { ChatClient } from "@/app/(dashboard)/chat/chat-client";
import { cn } from "@/lib/utils";

interface AdminChatClientProps {
  initialCompanies: any[];
}

export function AdminChatClient({ initialCompanies }: AdminChatClientProps) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCompanies = initialCompanies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCompany = initialCompanies.find(c => c.id === selectedCompanyId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-12rem)]">
      {/* Sidebar - Chat List */}
      <div className="lg:col-span-4 flex flex-col gap-6 h-full">
        <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border-2 border-gray-100 p-6 shadow-xl flex flex-col gap-6 overflow-hidden h-full">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">المحادثات</h2>
            <div className="h-10 w-10 rounded-xl bg-[#3498db]/10 flex items-center justify-center text-[#3498db]">
              <MessageSquare size={20} />
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#3498db] transition-colors" size={18} />
            <input
              type="text"
              placeholder="ابحث عن شركة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-3.5 pr-12 pl-4 font-bold text-gray-700 focus:border-[#3498db]/30 focus:ring-4 focus:ring-[#3498db]/5 outline-none transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
            {filteredCompanies.map((company) => (
              <motion.button
                key={company.id}
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCompanyId(company.id)}
                className={cn(
                  "w-full text-right p-5 rounded-3xl border-2 transition-all duration-300 flex items-start gap-4 group relative overflow-hidden",
                  selectedCompanyId === company.id 
                    ? "bg-[#3498db] border-[#3498db] text-white shadow-lg shadow-[#3498db]/20" 
                    : "bg-white border-gray-50 text-gray-600 hover:border-[#3498db]/30 hover:bg-[#3498db]/5"
                )}
              >
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                  selectedCompanyId === company.id ? "bg-white/20" : "bg-gray-100"
                )}>
                  <Building2 size={24} className={selectedCompanyId === company.id ? "text-white" : "text-gray-400"} />
                </div>

                <div className="flex-1 min-width-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-black text-sm truncate">{company.name}</span>
                    <span className={cn(
                      "text-[10px] font-bold",
                      selectedCompanyId === company.id ? "text-white/60" : "text-gray-400"
                    )}>
                      {new Date(company.last_message_date).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={cn(
                    "text-xs font-bold truncate",
                    selectedCompanyId === company.id ? "text-white/80" : "text-gray-400"
                  )}>
                    {company.last_message}
                  </p>
                </div>

                {company.unread_count > 0 && selectedCompanyId !== company.id && (
                  <div className="absolute top-4 left-4 h-5 w-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg animate-bounce">
                    {company.unread_count}
                  </div>
                )}

                <div className={cn(
                  "absolute left-0 top-0 h-full w-1 transition-all",
                  selectedCompanyId === company.id ? "bg-white/40" : "bg-transparent group-hover:bg-[#3498db]/40"
                )} />
              </motion.button>
            ))}

            {filteredCompanies.length === 0 && (
              <div className="py-12 text-center opacity-30">
                <Search size={40} className="mx-auto mb-2" />
                <p className="font-black text-sm">لا توجد نتائج</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="lg:col-span-8 h-full">
        {selectedCompanyId ? (
          <ChatClient 
            key={selectedCompanyId}
            initialMessages={[]} // Will be fetched inside if we use a different structure, but here we can just pass id
            companyId={selectedCompanyId}
            senderRole="admin"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm rounded-[3rem] border-4 border-dashed border-gray-200/50 text-gray-400">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="h-32 w-32 rounded-[2.5rem] bg-gray-100 flex items-center justify-center text-gray-300">
                <MessageSquare size={64} />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-gray-500 tracking-tight">بانتظار اختيار محادثة</h3>
                <p className="font-bold text-gray-400 italic">اختر شركة من القائمة الجانبية لبدء الدعم المباشر</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
