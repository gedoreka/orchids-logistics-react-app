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
        className="fixed z-[99999] bg-white border border-gray-200 rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.15)] overflow-hidden backdrop-blur-2xl"
        style={{
          top: dropdownPos.top,
          left: dropdownPos.left,
          width: dropdownPos.width,
          maxWidth: "480px",
        }}
      >
        {/* Search */}
        <div className="p-3 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10">
          <div className="relative group">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cyan-500 transition-colors" size={14} />
            <input
              ref={searchInputRef}
              type="text"
              className="w-full pr-9 pl-3 py-2.5 bg-gray-100 rounded-xl border border-gray-200 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 outline-none transition-all text-sm font-bold text-gray-900 placeholder:text-gray-400"
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
          scrollbarColor: '#d1d5db transparent'
        }}
      >
          <div className="p-1.5 space-y-0">
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
                        "w-full text-start px-3 py-2.5 rounded-xl transition-all flex items-center gap-2 group relative border border-transparent text-sm",
                        isSelected
                          ? "bg-cyan-500/10 text-gray-900 border-cyan-500/30"
                          : "hover:bg-gray-50 text-gray-600",
                        isMain && !isSelected && "bg-gray-50/50"
                      )}
                      style={{
                        paddingRight: `${(item.level * 16) + 12}px`,
                        paddingLeft: `12px`
                      }}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {hasChildren ? (
                          <div
                            onClick={(e) => toggleExpand(item.id, e)}
                            className="p-0.5 hover:bg-white/10 rounded transition-colors cursor-pointer"
                          >
                            <ChevronRight size={14} className={cn("transition-transform text-gray-400", isExpanded && "rotate-90 text-cyan-500")} />
                          </div>
                        ) : (
                          <div className="w-5" />
                        )}

                        <div className={cn(
                          "p-1.5 rounded-lg border text-[10px]",
                          isMain
                            ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-600"
                            : "bg-gray-100 border-gray-200 text-gray-400",
                          isSelected && "bg-cyan-500/20 border-cyan-500/30 text-cyan-600"
                        )}>
                          {isMain ? <Folder size={12} /> : <FileText size={12} />}
                        </div>

                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0",
                          isMain
                            ? "bg-indigo-500/10 text-indigo-600 border border-indigo-500/20"
                            : "bg-gray-100 text-gray-500 border border-gray-200",
                          isSelected && "bg-cyan-500/10 text-cyan-600 border-cyan-500/20"
                        )}>
                          {item.code}
                        </span>

                        <div className="flex flex-col min-w-0 flex-1">
                          <span className={cn(
                            "truncate font-bold text-sm leading-tight",
                            isSelected ? "text-gray-900" : isMain ? "text-gray-800" : "text-gray-500"
                          )}>
                            {item.name}
                          </span>
                        </div>
                      </div>

                      {isSelected && <Check size={14} className="text-cyan-400 shrink-0" />}
                    </button>
                  {isMain && <div className="my-0.5 mx-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />}
                </div>
              );
            })
          ) : (
            <div className="px-3 py-8 text-center text-gray-400 flex flex-col items-center gap-2">
                <Search size={20} className="opacity-30" />
                <span className="text-xs font-bold">{noResultsText}</span>
              </div>
          )}
        </div>
      </div>

      {/* Footer */}
        <div className="p-2 border-t border-gray-100 bg-gray-50/50 text-[10px] text-gray-400 text-center font-bold">
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
            "w-full px-4 py-3.5 rounded-2xl border bg-white/5 hover:bg-white/10 outline-none transition-all flex items-center justify-between text-sm backdrop-blur-sm",
            isOpen ? "border-cyan-500/50 ring-2 ring-cyan-500/20 bg-white/10" : "border-white/10",
            error && !value && "border-red-500/50 ring-2 ring-red-500/20",
            selectedItem ? "text-white" : "text-slate-500"
          )}
        >
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            {selectedItem ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/20 shrink-0">
                  {selectedItem.code}
                </span>
                <span className="block truncate font-bold text-white text-sm">
                  {selectedItem.name}
                </span>
              </div>
            ) : (
              <span className="block truncate font-bold text-slate-500 text-sm">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {selectedItem && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect("");
                }}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X size={12} className="text-slate-500 hover:text-red-400" />
              </div>
            )}
            <ChevronDown size={14} className={cn("text-slate-500 transition-transform", isOpen && "rotate-180 text-cyan-400")} />
        </div>
      </button>

      {dropdown}
    </div>
  );
}
