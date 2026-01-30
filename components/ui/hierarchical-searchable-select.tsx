"use client";

import React, { useState, useMemo } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Item {
  id: number | string;
  code: string;
  name: string;
  level?: number;
  parent?: string | null;
}

interface HierarchicalSearchableSelectProps {
  items: Item[];
  value: string | number;
  onSelect: (value: any) => void;
  placeholder: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  className?: string;
  valueKey?: 'id' | 'code';
}

export function HierarchicalSearchableSelect({
  items,
  value,
  onSelect,
  placeholder,
  searchPlaceholder = "بحث...",
  noResultsText = "لا توجد نتائج",
  className,
  valueKey = 'code'
}: HierarchicalSearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedItem = useMemo(() => 
    items.find(item => String(item[valueKey]) === String(value)),
    [items, value, valueKey]
  );

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(term) || 
      item.code.toLowerCase().includes(term)
    );
  }, [items, searchTerm]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 bg-white/50 px-3 py-2 text-sm transition-all hover:bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm",
            className
          )}
        >
          <span className={cn("truncate font-bold", !selectedItem && "text-slate-400 font-normal")}>
            {selectedItem ? `${selectedItem.code} - ${selectedItem.name}` : placeholder}
          </span>
          <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", isOpen && "rotate-180 text-blue-500")} />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 w-[350px] bg-white border border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden z-[9999]" 
        align="start"
        sideOffset={5}
      >
        <div className="p-3 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <ScrollArea className="max-h-[320px] overflow-y-auto">
          <div className="p-1">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isSelected = String(item.code) === String(value);
                const level = item.level || 0;
                const isMain = level === 1 || item.code.length <= 2;
                
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelect(item[valueKey]);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={cn(
                      "w-full text-start px-3 py-2.5 rounded-lg transition-all flex items-center justify-between group relative mb-0.5",
                      isSelected ? "bg-blue-600 text-white" : "hover:bg-blue-50 text-slate-700",
                      isMain ? "font-black text-sm mt-1 bg-slate-50/50" : "font-medium text-xs"
                    )}
                    style={{ 
                      paddingRight: `${(level > 1 ? (level - 1) * 20 + 12 : 12)}px` 
                    }}
                  >
                    <div className="flex flex-col">
                      <span className={cn(
                        "truncate",
                        isMain ? "text-[14px] text-slate-900" : "text-[13px]",
                        isSelected && "text-white"
                      )}>
                        {item.code} - {item.name}
                      </span>
                      {isMain && !isSelected && (
                        <div className="h-0.5 w-8 bg-blue-500/30 mt-0.5 rounded-full" />
                      )}
                    </div>
                    {isSelected && <Check className="h-4 w-4 shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm text-slate-400 font-medium">{noResultsText}</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-2 border-t border-slate-100 bg-slate-50/50 text-[10px] text-slate-400 text-center font-bold">
          عرض {Math.min(filteredItems.length, 7)} من أصل {filteredItems.length} بند
        </div>
      </PopoverContent>
    </Popover>
  );
}
