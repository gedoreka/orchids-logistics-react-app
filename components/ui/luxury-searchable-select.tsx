"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Check, X } from "lucide-react";

interface Option {
  value: string | number;
  label: string;
  subLabel?: string;
}

interface LuxurySearchableSelectProps {
  options: Option[];
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder: string;
  label?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function LuxurySearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  label,
  icon,
  disabled,
  required,
  className = ""
}: LuxurySearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase()) || 
    (opt.subLabel && opt.subLabel.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.ref.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-1.5">
          {icon && <span className="text-gray-400">{icon}</span>}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div
        onClick={toggleDropdown}
        className={`
          relative w-full px-4 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between
          ${disabled ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-white text-gray-900 border-gray-200 hover:border-blue-400 hover:shadow-md"}
          ${isOpen ? "ring-2 ring-blue-500/20 border-blue-500 shadow-lg" : "shadow-sm"}
        `}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span className={`block truncate ${!selectedOption ? "text-gray-400" : "font-semibold"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          size={18} 
          className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-500" : ""}`} 
        />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-[100] w-full mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            <div className="p-3 border-b border-gray-50 bg-gray-50/50">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث هنا..."
                  className="w-full pr-10 pl-4 py-2 bg-white rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                {search && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSearch(""); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-[250px] overflow-auto custom-scrollbar p-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`
                      flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all mb-1
                      ${String(option.value) === String(value) ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700"}
                    `}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{option.label}</span>
                      {option.subLabel && <span className="text-[10px] opacity-60">{option.subLabel}</span>}
                    </div>
                    {String(option.value) === String(value) && (
                      <Check size={16} className="text-blue-600" />
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-400 text-sm italic">
                  لا توجد نتائج مطابقة
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
