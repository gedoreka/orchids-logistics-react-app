"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Search, ChevronDown, ChevronRight, Check, Folder, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Item {
  id: number | string;
  code: string;
  name: string;
  type?: 'main' | 'sub';
  parent_id?: number | string | null;
}

interface HierarchicalSearchableSelectProps {
  items: Item[];
  value: string | number;
  onSelect: (value: any) => void;
  placeholder: string;
  label?: string;
  icon?: React.ReactNode;
  searchPlaceholder?: string;
  noResultsText?: string;
  className?: string;
  required?: boolean;
}

export function HierarchicalSearchableSelect({
  items,
  value,
  onSelect,
  placeholder,
  label,
  icon,
  searchPlaceholder = "بحث بالاسم أو الكود...",
  noResultsText = "لا توجد نتائج تطابق بحثك",
  className,
  required
}: HierarchicalSearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Record<string | number, boolean>>({});

  // Build tree from flat items
  const tree = useMemo(() => {
    const map: Record<string | number, any> = {};
    const roots: any[] = [];

    items.forEach(item => {
      map[item.id] = { ...item, children: [] };
    });

    items.forEach(item => {
      if (item.parent_id && map[item.parent_id]) {
        map[item.parent_id].children.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    });

    return roots;
  }, [items]);

  // Initially expand all parent nodes
  useEffect(() => {
    const initialExpanded: Record<string | number, boolean> = {};
    items.forEach(item => {
      if (item.type === 'main' || items.some(i => i.parent_id === item.id)) {
        initialExpanded[item.id] = true;
      }
    });
    setExpandedNodes(initialExpanded);
  }, [items]);

  const toggleExpand = (id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const selectedItem = useMemo(() => 
    items.find(item => String(item.id) === String(value)),
    [items, value]
  );

  const flattenTree = (nodes: any[], level = 0): any[] => {
    const result: any[] = [];
    nodes.forEach(node => {
      const isMatch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      node.code.toLowerCase().includes(searchTerm.toLowerCase());
      
      const children = flattenTree(node.children, level + 1);
      const hasMatchingChildren = children.length > 0;

      if (searchTerm) {
        if (isMatch || hasMatchingChildren) {
          result.push({ ...node, level });
          result.push(...children);
        }
      } else {
        result.push({ ...node, level });
        if (expandedNodes[node.id]) {
          result.push(...children);
        }
      }
    });
    return result;
  };

  const displayItems = useMemo(() => flattenTree(tree), [tree, expandedNodes, searchTerm]);

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="flex items-center gap-2.5 text-[14px] font-black text-white mr-1.5">
          {icon && <span className="text-emerald-400">{icon}</span>}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "w-full px-6 py-4.5 rounded-[1.25rem] border-2 border-white/10 bg-white/5 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 focus:ring-[6px] focus:ring-emerald-500/5 outline-none transition-all flex items-center justify-between shadow-sm shadow-black/20",
              isOpen && "border-emerald-500 ring-[6px] ring-emerald-500/5"
            )}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <span className={cn("block truncate text-[16px] font-black", !selectedItem ? "text-white/30" : "text-white")}>
                {selectedItem ? `${selectedItem.code} - ${selectedItem.name}` : placeholder}
              </span>
            </div>
            <div className={cn("flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 bg-white/10 text-white/40", isOpen && "bg-emerald-500 text-white rotate-180")}>
              <ChevronDown size={18} strokeWidth={3} />
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 w-[var(--radix-popover-trigger-width)] bg-[#1a2333]/95 backdrop-blur-2xl rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden z-[9999]" 
          align="start"
          sideOffset={5}
        >
          <div className="p-4 border-b border-white/5 bg-white/5">
            <div className="relative group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input
                type="text"
                className="w-full pr-12 pl-4 py-3 bg-white/5 rounded-xl border border-white/10 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all text-sm font-bold text-white placeholder:text-white/20"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <ScrollArea className="max-h-[350px] overflow-y-auto">
            <div className="p-2">
              {displayItems.length > 0 ? (
                displayItems.map((item) => {
                  const isSelected = String(item.id) === String(value);
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedNodes[item.id];
                  const isMain = item.type === 'main';

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (isMain && hasChildren) {
                          setExpandedNodes(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                        } else {
                          onSelect(item.id);
                          setIsOpen(false);
                          setSearchTerm("");
                        }
                      }}
                      className={cn(
                        "w-full text-start px-4 py-3.5 rounded-[1rem] transition-all flex items-center gap-3 group relative mb-1",
                        isSelected ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "hover:bg-white/5 text-white/70",
                        isMain && "bg-white/5"
                      )}
                      style={{ 
                        paddingRight: `${(item.level * 24) + 16}px` 
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {hasChildren ? (
                          <div 
                            onClick={(e) => toggleExpand(item.id, e)}
                            className="p-1 hover:bg-white/10 rounded-md transition-colors"
                          >
                            <ChevronRight size={14} className={cn("transition-transform text-white/40", isExpanded && "rotate-90 text-emerald-500")} />
                          </div>
                        ) : (
                          <div className="w-6" />
                        )}
                        
                        <div className={cn(
                          "p-1.5 rounded-lg border",
                          isMain ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-slate-500/10 border-slate-500/20 text-slate-400",
                          isSelected && "bg-white/20 border-white/30 text-white"
                        )}>
                          {isMain ? <Folder size={14} /> : <FileText size={14} />}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className={cn(
                            "truncate font-black text-sm leading-tight",
                            isMain ? "text-[15px]" : "text-[13px]",
                            isSelected ? "text-white" : isMain ? "text-white" : "text-white/70"
                          )}>
                            {item.name}
                          </span>
                          <span className={cn(
                            "text-[10px] font-bold mt-0.5 opacity-50",
                            isSelected ? "text-emerald-100" : "text-white/40"
                          )}>
                            {item.code}
                          </span>
                        </div>
                      </div>
                      
                      {isSelected && <Check size={18} className="text-white shrink-0" />}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-12 text-center text-white/30 flex flex-col items-center gap-3">
                  <Search size={32} className="opacity-20" />
                  <span className="text-sm font-bold">{noResultsText}</span>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-3 border-t border-white/5 bg-white/5 text-[11px] text-white/30 text-center font-bold">
            عرض {displayItems.length} بند من أصل {items.length}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
