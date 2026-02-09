"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, ChevronRight, Check, Folder, FileText, X } from "lucide-react";
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
  valueKey?: string;
  error?: boolean;
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
  required,
  error
}: HierarchicalSearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Record<string | number, boolean>>({});
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 0 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Initially expand ALL nodes
  useEffect(() => {
    const initialExpanded: Record<string | number, boolean> = {};
    items.forEach(item => {
      initialExpanded[item.id] = true;
    });
    setExpandedNodes(initialExpanded);
  }, [items]);

  // Calculate dropdown position
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 320),
    });
  }, []);

  // Open/close with position update
  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, updatePosition]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Focus search on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

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

  const dropdown = isOpen && typeof document !== "undefined" ? createPortal(
    <div
      ref={dropdownRef}
      className="fixed z-[99999] bg-slate-900 border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.7)] overflow-hidden backdrop-blur-2xl"
      style={{
        top: dropdownPos.top,
        left: dropdownPos.left,
        width: dropdownPos.width,
        maxWidth: "420px",
      }}
    >
      {/* Search */}
      <div className="p-2 border-b border-white/5 bg-slate-900/80 sticky top-0 z-10">
        <div className="relative group">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={12} />
          <input
            ref={searchInputRef}
            type="text"
            className="w-full pr-8 pl-2 py-2 bg-white/5 rounded-lg border border-white/10 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all text-[11px] font-bold text-white placeholder:text-slate-600"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Items List */}
      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{
          maxHeight: '280px',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: '#334155 transparent'
        }}
      >
        <div className="p-1 space-y-0">
          {displayItems.length > 0 ? (
            displayItems.map((item, index) => {
              const isSelected = String(item.id) === String(value);
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedNodes[item.id];
              const isMain = item.type === 'main';

              return (
                <div key={`item-${item.id}-${index}`}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item.id);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={cn(
                      "w-full text-start px-2 py-2 rounded-lg transition-all flex items-center gap-1.5 group relative border border-transparent text-[11px]",
                      isSelected
                        ? "bg-blue-500/20 text-white border-blue-500/30"
                        : "hover:bg-white/5 text-slate-300",
                      isMain && !isSelected && "bg-white/[0.02]"
                    )}
                    style={{
                      paddingRight: `${(item.level * 14) + 8}px`,
                      paddingLeft: `8px`
                    }}
                  >
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      {hasChildren ? (
                        <div
                          onClick={(e) => toggleExpand(item.id, e)}
                          className="p-0.5 hover:bg-white/10 rounded transition-colors cursor-pointer"
                        >
                          <ChevronRight size={12} className={cn("transition-transform text-slate-500", isExpanded && "rotate-90 text-blue-400")} />
                        </div>
                      ) : (
                        <div className="w-4" />
                      )}

                      <div className={cn(
                        "p-1 rounded border text-[9px]",
                        isMain
                          ? "bg-blue-500/20 border-blue-500/30 text-blue-400"
                          : "bg-white/5 border-white/10 text-slate-500",
                        isSelected && "bg-blue-500/30 border-blue-500/40 text-blue-300"
                      )}>
                        {isMain ? <Folder size={10} /> : <FileText size={10} />}
                      </div>

                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0",
                        isMain
                          ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          : "bg-white/5 text-slate-500 border border-white/5",
                        isSelected && "bg-blue-500/20 text-blue-300 border-blue-500/30"
                      )}>
                        {item.code}
                      </span>

                      <div className="flex flex-col min-w-0 flex-1">
                        <span className={cn(
                          "truncate font-bold text-[11px] leading-tight",
                          isSelected ? "text-white" : isMain ? "text-slate-200" : "text-slate-400"
                        )}>
                          {item.name}
                        </span>
                      </div>
                    </div>

                    {isSelected && <Check size={12} className="text-blue-400 shrink-0" />}
                  </button>
                  {isMain && <div className="my-0.5 mx-2 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />}
                </div>
              );
            })
          ) : (
            <div className="px-2 py-6 text-center text-slate-500 flex flex-col items-center gap-2">
              <Search size={16} className="opacity-30" />
              <span className="text-[10px] font-bold">{noResultsText}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-1.5 border-t border-white/5 bg-slate-900/80 text-[9px] text-slate-600 text-center font-bold">
        {displayItems.length} / {items.length}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div className={cn("relative", className)}>
      {label && (
        <label className="flex items-center gap-2.5 text-[14px] font-black text-white mr-1.5 mb-1">
          {icon && <span className="text-emerald-400">{icon}</span>}
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full px-3 py-2.5 rounded-xl border bg-white/5 hover:bg-white/10 outline-none transition-all flex items-center justify-between text-[11px] backdrop-blur-sm",
          isOpen ? "border-blue-500/50 ring-1 ring-blue-500/20 bg-white/10" : "border-white/10",
          error && !value && "border-red-500/50 ring-1 ring-red-500/20",
          selectedItem ? "text-white" : "text-slate-500"
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {selectedItem ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 shrink-0">
                {selectedItem.code}
              </span>
              <span className="block truncate font-bold text-white text-[11px]">
                {selectedItem.name}
              </span>
            </div>
          ) : (
            <span className="block truncate font-bold text-slate-500">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {selectedItem && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onSelect("");
              }}
              className="p-0.5 hover:bg-white/10 rounded transition-colors cursor-pointer"
            >
              <X size={10} className="text-slate-500 hover:text-red-400" />
            </div>
          )}
          <ChevronDown size={12} className={cn("text-slate-500 transition-transform", isOpen && "rotate-180 text-blue-400")} />
        </div>
      </button>

      {dropdown}
    </div>
  );
}
