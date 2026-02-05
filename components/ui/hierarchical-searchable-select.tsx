"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, ChevronDown, ChevronRight, Check, Folder, FileText } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const scrollRef = useRef<HTMLDivElement>(null);

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
      initialExpanded[item.id] = true; // Expand all by default
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
      <div className={cn("", className)}>
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
                "w-full px-2 py-1.5 rounded border border-gray-200 bg-white hover:border-blue-300 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all flex items-center justify-between text-[11px]",
                isOpen && "border-blue-500 ring-1 ring-blue-500/20"
              )}
            >
              <div className="flex items-center gap-1 overflow-hidden flex-1">
                <span className={cn("block truncate font-bold", !selectedItem ? "text-gray-400" : "text-gray-900")}>
                  {selectedItem ? selectedItem.name : placeholder}
                </span>
              </div>
              <ChevronDown size={12} className={cn("shrink-0 text-gray-400 transition-transform", isOpen && "rotate-180 text-blue-500")} />
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="p-0 w-[280px] bg-white backdrop-blur-2xl rounded-lg shadow-lg border border-gray-200 z-[9999]" 
            align="start"
            sideOffset={4}
            onOpenAutoFocus={(e) => e.preventDefault()}
            style={{ overflow: 'visible' }}
          >
            <div className="p-2 border-b border-gray-100 bg-gray-50 sticky top-0 z-10">
              <div className="relative group">
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={12} />
                <input
                  type="text"
                  className="w-full pr-8 pl-2 py-1.5 bg-white rounded border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all text-[11px] font-bold text-gray-900 placeholder:text-gray-400"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            
            <div 
              ref={scrollRef}
              className="overflow-y-auto"
              style={{ 
                maxHeight: '280px',
                overflowY: 'auto',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'thin',
                scrollbarColor: '#94a3b8 transparent'
              }}
              onWheel={(e) => {
                e.stopPropagation();
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
                            "w-full text-start px-2 py-1.5 rounded transition-all flex items-center gap-1.5 group relative border border-transparent hover:border-blue-200 text-[11px]",
                            isSelected ? "bg-blue-100 text-gray-900 shadow-sm border-blue-300" : "hover:bg-gray-50 text-gray-700",
                            isMain && "bg-gradient-to-r from-blue-50 to-indigo-50 font-bold text-gray-800"
                          )}
                          style={{ 
                            paddingRight: `${(item.level * 12) + 6}px`,
                            paddingLeft: `6px` 
                          }}
                        >
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          {hasChildren ? (
                            <div 
                              onClick={(e) => toggleExpand(item.id, e)}
                              className="p-0.5 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                            >
                              <ChevronRight size={12} className={cn("transition-transform text-gray-400", isExpanded && "rotate-90 text-blue-500")} />
                            </div>
                          ) : (
                            <div className="w-4" />
                          )}
                          
                          <div className={cn(
                            "p-1 rounded border text-[9px]",
                            isMain ? "bg-blue-100 border-blue-300 text-blue-600" : "bg-gray-100 border-gray-200 text-gray-600",
                            isSelected && "bg-blue-200 border-blue-300 text-blue-700"
                          )}>
                            {isMain ? <Folder size={10} /> : <FileText size={10} />}
                          </div>

                          <div className="flex flex-col min-w-0 flex-1">
                            <span className={cn(
                              "truncate font-bold text-[11px] leading-tight",
                              isSelected ? "text-gray-900" : isMain ? "text-gray-900" : "text-gray-700"
                            )}>
                              {item.name}
                            </span>
                          </div>
                        </div>
                        
                        {isSelected && <Check size={12} className="text-blue-700 shrink-0" />}
                        </button>
                        {isMain && <div className="my-1 mx-2 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />}
                      </div>
                    );
                  })
                ) : (
                  <div className="px-2 py-4 text-center text-gray-400 flex flex-col items-center gap-1">
                    <Search size={16} className="opacity-30" />
                    <span className="text-[10px] font-bold">{noResultsText}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-1.5 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 text-[9px] text-gray-500 text-center font-bold">
              {displayItems.length} / {items.length}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    );
  }
