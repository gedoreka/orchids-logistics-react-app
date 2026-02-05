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
              "w-full px-3 py-2 rounded-lg border-2 border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5 focus:ring-[4px] focus:ring-blue-500/5 outline-none transition-all flex items-center justify-between shadow-sm shadow-gray-50",
              isOpen && "border-blue-500 ring-[4px] ring-blue-500/5"
            )}
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className={cn("block truncate text-[13px] font-bold", !selectedItem ? "text-gray-400" : "text-gray-900")}>
                {selectedItem ? `${selectedItem.code} - ${selectedItem.name}` : placeholder}
              </span>
            </div>
            <div className={cn("flex items-center justify-center w-6 h-6 rounded-full transition-all duration-300 bg-gray-100 text-gray-400 shrink-0 ml-2", isOpen && "bg-blue-500 text-white rotate-180")}>
              <ChevronDown size={14} strokeWidth={3} />
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 w-[var(--radix-popover-trigger-width)] bg-white backdrop-blur-2xl rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-gray-200 overflow-hidden z-[9999]" 
          align="start"
          sideOffset={5}
        >
          <div className="p-2.5 border-b border-gray-100 bg-gray-50">
            <div className="relative group">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={14} />
              <input
                type="text"
                className="w-full pr-10 pl-3 py-2 bg-white rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/5 outline-none transition-all text-xs font-bold text-gray-900 placeholder:text-gray-400"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <ScrollArea className="max-h-[220px] overflow-y-auto">
            <div className="p-1.5 space-y-0">
              {displayItems.length > 0 ? (
                displayItems.map((item, idx) => {
                  const isSelected = String(item.id) === String(value);
                  const hasChildren = item.children && item.children.length > 0;
                  const isExpanded = expandedNodes[item.id];
                  const isMain = item.type === 'main';

                  return (
                    <div key={item.id}>
                      <button
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
                          "w-full text-start px-2 py-1.5 rounded-md transition-all flex items-center gap-2 group relative border border-transparent hover:border-blue-200 text-xs",
                          isSelected ? "bg-blue-100 text-gray-900 shadow-sm shadow-blue-600/20 border-blue-300" : "hover:bg-gray-50 text-gray-700",
                          isMain && "bg-gray-50 font-bold text-gray-800"
                        )}
                        style={{ 
                          paddingLeft: `${(item.level * 16) + 8}px`,
                          paddingRight: `${8}px` 
                        }}
                      >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {hasChildren ? (
                          <div 
                            onClick={(e) => toggleExpand(item.id, e)}
                            className="p-0.5 hover:bg-gray-200 rounded-md transition-colors"
                          >
                            <ChevronRight size={12} className={cn("transition-transform text-gray-400", isExpanded && "rotate-90 text-blue-500")} />
                          </div>
                        ) : (
                          <div className="w-4" />
                        )}
                        
                        <div className={cn(
                          "p-1 rounded-md border text-[11px]",
                          isMain ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-gray-100 border-gray-200 text-gray-600",
                          isSelected && "bg-blue-200 border-blue-300 text-blue-700"
                        )}>
                          {isMain ? <Folder size={11} /> : <FileText size={11} />}
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                          <span className={cn(
                            "truncate font-bold text-[12px] leading-tight",
                            isSelected ? "text-gray-900" : isMain ? "text-gray-900" : "text-gray-700"
                          )}>
                            {item.name}
                          </span>
                          <span className={cn(
                            "text-[9px] font-bold mt-0 opacity-60",
                            isSelected ? "text-blue-700" : "text-gray-500"
                          )}>
                            {item.code}
                          </span>
                        </div>
                      </div>
                      
                      {isSelected && <Check size={14} className="text-blue-700 shrink-0" />}
                      </button>
                      {isMain && <div className="my-1 mx-2 h-px bg-gray-200" />}
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-8 text-center text-gray-400 flex flex-col items-center gap-2">
                  <Search size={24} className="opacity-30" />
                  <span className="text-xs font-bold">{noResultsText}</span>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-2 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-500 text-center font-bold">
            عرض {displayItems.length} بند من أصل {items.length}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
