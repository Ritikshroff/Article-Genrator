"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
  icon,
  searchable = false,
  searchPlaceholder = "Search...",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable) {
      setSearchTerm("");
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, searchable]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredOptions = searchable && searchTerm.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase().trim())
      )
    : options;

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2 text-[13px] font-bold bg-white dark:bg-[#111] text-zinc-900 dark:text-zinc-100 border transition-all rounded-xs focus:outline-none cursor-pointer ${
          isOpen
            ? "border-[#e30613] ring-1 ring-[#e30613]/20 shadow-sm"
            : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500"
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-zinc-400 flex-shrink-0">{icon}</span>}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180 text-[#e30613]" : ""
          }`}
        />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 min-w-full sm:min-w-[210px] mt-1 z-[999] bg-white dark:bg-[#161616] border border-zinc-200 dark:border-zinc-700 shadow-xl rounded-xs py-1 max-h-64 overflow-y-auto scroller animate-in fade-in zoom-in-95 duration-100">
          {searchable && (
            <div className="p-1.5 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 bg-white dark:bg-[#161616] z-10">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-8 pr-7 py-1.5 text-xs bg-zinc-50 dark:bg-[#111] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xs focus:outline-none focus:border-[#e30613] placeholder:text-zinc-400"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      if (searchTerm) {
                        e.stopPropagation();
                        setSearchTerm("");
                      }
                    }
                  }}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchTerm("");
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div className="py-4 text-center text-xs text-zinc-400 font-medium">
              No matching options
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-[12px] font-semibold text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#e30613]/10 text-[#e30613] font-bold"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#e30613] flex-shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
