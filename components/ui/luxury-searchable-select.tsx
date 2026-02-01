"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
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
  icon?: React.Node;
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
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [isMounted, setIsMounted] = useState(false);
  const [openUp, setOpenUp] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 400; // estimated max height
      
      const spaceBelow = viewportHeight - rect.bottom;
      const shouldOpenUp = spaceBelow < dropdownHeight && rect.top > spaceBelow;

      setCoords({
        top: shouldOpenUp ? rect.top - 5 : rect.bottom + 5,
        left: rect.left,
        width: rect.width
      });
      setOpenUp(shouldOpenUp);
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      updateCoords();
      const handleScroll = () => updateCoords();
      const handleResize = () => updateCoords();
      
      window.addEventListener("scroll", handleScroll, true);
      window.addEventListener("resize", handleResize);
      
      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase()) || 
    (opt.subLabel && opt.subLabel.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Also check if clicking inside the portal
        if (dropdownRef.current && dropdownRef.current.contains(event.target as Node)) return;
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setActiveIndex(-1);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredOptions[activeIndex].value);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
  };

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: openUp ? 10 : -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: openUp ? 10 : -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "circOut" }}
          style={{
            position: "fixed",
            top: openUp ? undefined : coords.top,
            bottom: openUp ? (window.innerHeight - coords.top) : undefined,
            left: coords.left,
            width: coords.width,
            zIndex: 99999,
            pointerEvents: "auto"
          }}
          className="bg-white/95 backdrop-blur-2xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/40 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <div className="relative group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              <input
                ref={inputRef}
                autoFocus
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                placeholder="ابحث هنا..."
                className="w-full pr-12 pl-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all text-sm font-bold"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[350px] overflow-y-auto overflow-x-hidden custom-scrollbar p-2">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div
                  key={option.value}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    flex items-center justify-between px-4 py-3.5 rounded-[1rem] cursor-pointer transition-all mb-1
                    ${String(option.value) === String(value) ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : 
                      index === activeIndex ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50 text-gray-700"}
                  `}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-[14px] leading-tight">{option.label}</span>
                    {option.subLabel && (
                      <span className={`text-[11px] font-medium mt-0.5 opacity-70 ${String(option.value) === String(value) ? "text-blue-100" : "text-gray-500"}`}>
                        {option.subLabel}
                      </span>
                    )}
                  </div>
                  {String(option.value) === String(value) && (
                    <Check size={18} className="text-white" />
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-12 text-center text-gray-400 flex flex-col items-center gap-3">
                <Search size={32} className="opacity-20" />
                <span className="text-sm font-bold">لا توجد نتائج تطابق بحثك</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="flex items-center gap-2 text-[14px] font-bold text-slate-700 mb-2 mr-1">
          {icon && <span className="text-blue-500/70">{icon}</span>}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div
        onClick={toggleDropdown}
        className={`
          relative w-full px-5 py-4 rounded-[1.25rem] border-2 transition-all cursor-pointer flex items-center justify-between
          ${disabled ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed" : "bg-white text-slate-900 border-slate-50 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5"}
          ${isOpen ? "ring-4 ring-blue-500/5 border-blue-600 shadow-2xl" : "shadow-sm shadow-slate-200/50"}
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <span className={`block truncate ${!selectedOption ? "text-slate-300 font-bold" : "font-bold text-slate-800"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${isOpen ? "bg-blue-50 text-blue-600 rotate-180" : "bg-slate-50 text-slate-400"}`}>
          <ChevronDown size={18} strokeWidth={3} />
        </div>
      </div>

      {isMounted && createPortal(
        <div className="fixed inset-0 pointer-events-none z-[99999]">
          {dropdownContent}
        </div>,
        document.body
      )}
    </div>
  );
}
