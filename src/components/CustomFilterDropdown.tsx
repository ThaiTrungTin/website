'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, Check, Star } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  count?: number;
  stars?: number;
  icon?: ReactNode;
}

interface CustomFilterDropdownProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  icon?: ReactNode;
  placeholder?: string;
  align?: 'left' | 'right';
  size?: 'sm' | 'md';
  className?: string;
  ariaLabel?: string;
}

export default function CustomFilterDropdown({
  id,
  value,
  onChange,
  options,
  icon,
  placeholder,
  align = 'left',
  size = 'md',
  className = '',
  ariaLabel,
}: CustomFilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('pointerdown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const isSmall = size === 'sm';

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className}`}
    >
      {/* Nút bấm kích hoạt Dropdown (Nằm hoàn toàn trong giao diện website) */}
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel || selectedOption?.label}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`group relative flex items-center justify-between gap-2 bg-white hover:bg-slate-50/80 active:bg-slate-100 border text-slate-800 font-semibold shadow-2xs transition-all cursor-pointer select-none ${
          isOpen
            ? 'border-[#2D5A27] ring-2 ring-[#2D5A27]/20 shadow-xs'
            : 'border-slate-300 hover:border-[#2D5A27]'
        } ${
          isSmall
            ? 'rounded-lg px-2.5 py-1.5 text-xs'
            : 'rounded-2xl pl-3.5 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm min-w-[180px] sm:min-w-[210px]'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 pr-1">
          {icon && <span className="shrink-0 flex items-center">{icon}</span>}
          <span className="truncate">
            {selectedOption ? (
              <>
                {selectedOption.stars ? (
                  <span className="inline-flex items-center gap-1">
                    <span>{selectedOption.stars}</span>
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500 -mt-0.5" />
                  </span>
                ) : (
                  selectedOption.label
                )}
                {typeof selectedOption.count === 'number' && (
                  <span className="ml-1 text-slate-500 font-normal">
                    ({selectedOption.count})
                  </span>
                )}
              </>
            ) : (
              placeholder || ''
            )}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[#2D5A27] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Menu đổ xuống tùy chỉnh: 100% trong DOM, không bao giờ tràn ra ngoài khung điện thoại */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-xl py-1.5 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150 max-h-64 sm:max-h-72 overflow-y-auto overscroll-contain ${
            align === 'right' ? 'right-0' : 'left-0'
          } min-w-[190px] max-w-[calc(100vw-2rem)] sm:max-w-xs`}
          style={{ width: 'max-content' }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;

            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none ${
                  isSmall ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm'
                } ${
                  isSelected
                    ? 'bg-emerald-50 text-[#2D5A27] font-semibold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}

                  {opt.stars ? (
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{opt.stars}</span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(opt.stars)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-3 h-3 text-amber-500 fill-amber-500"
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="truncate">{opt.label}</span>
                  )}

                  {typeof opt.count === 'number' && (
                    <span
                      className={`text-[11px] px-1.5 py-0.2 rounded-full font-medium ${
                        isSelected
                          ? 'bg-emerald-100/70 text-[#2D5A27]'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {opt.count}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-[#2D5A27] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
