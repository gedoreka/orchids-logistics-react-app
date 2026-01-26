      </div>

      {/* Email Input Dialog */}
      <AnimatePresence>
        {emailDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-500" />
              <button 
                onClick={() => setEmailDialog(null)}
                className="absolute top-6 left-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>

              <div className="mb-8">
                <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                  <Mail size={32} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">إرسال سند السداد</h3>
                <p className="text-sm text-gray-500 font-medium">يرجى إدخال البريد الإلكتروني للموظف <span className="text-blue-600 font-black">{emailDialog.comm.name}</span> لإرسال السند.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">البريد الإلكتروني</label>
                  <div className="relative group">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      type="email" 
                      value={emailDialog.email}
                      onChange={(e) => setEmailDialog({ ...emailDialog, email: e.target.value })}
                      placeholder="example@mail.com"
                      className="w-full pl-4 pr-10 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 outline-none font-bold text-sm transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setEmailDialog(null)}
                    className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-700 font-black text-sm hover:bg-gray-200 transition-all"
                  >
                    إلغاء
                  </button>
                  <button 
                    onClick={() => sendEmailReceipt(emailDialog.comm, emailDialog.email)}
                    disabled={!emailDialog.email || sendingEmail === emailDialog.comm.id}
                    className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black text-sm hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sendingEmail === emailDialog.comm.id ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    <span>إرسال الآن</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon, color, isRtl, suffix }: { label: string; value: string; icon: React.ReactNode; color: "blue" | "emerald" | "amber"; isRtl: boolean; suffix?: string }) {
  const colors = {
    blue: "bg-blue-500 text-blue-600 shadow-blue-100 border-blue-100",
    emerald: "bg-emerald-500 text-emerald-600 shadow-emerald-100 border-emerald-100",
    amber: "bg-amber-500 text-amber-600 shadow-amber-100 border-amber-100"
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
      <div className={cn(
        "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110",
        colors[color].replace("text-", "bg-").replace("shadow-", "shadow-").split(" ")[0] + "/10",
        colors[color].split(" ")[1]
      )}>
        {icon}
      </div>
      <div className="flex flex-col gap-1 overflow-hidden">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] truncate">{label}</span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-gray-900 tracking-tighter">{value}</span>
          {suffix && <span className="text-xs font-bold text-gray-400">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}
