'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  Search,
  X,
  Stethoscope,
  BookOpen,
  UserCheck,
  MapPin,
  HelpCircle,
  Briefcase,
  Loader2,
} from 'lucide-react';
import type { SearchItem, SearchResponse } from '@/app/api/search/route';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchResponse | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch search results
  const performSearch = useCallback(
    async (searchTerm: string) => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(searchTerm)}&lang=${language}`
        );
        if (!res.ok) throw new Error('Search failed');
        const json: SearchResponse = await res.json();
        setData(json);
        setSelectedIndex(-1);
      } catch (err) {
        console.error('Error fetching search results:', err);
      } finally {
        setLoading(false);
      }
    },
    [language]
  );

  // Debounced search on input change
  useEffect(() => {
    if (!isOpen) return;

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 180);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, isOpen, performSearch]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    } else {
      setQuery('');
      setData(null);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Flattened all search results for keyboard navigation
  const allItems: SearchItem[] = React.useMemo(() => {
    if (!data) return [];
    return [
      ...data.results.services,
      ...data.results.articles,
      ...data.results.doctors,
      ...data.results.branches,
      ...data.results.faqs,
      ...data.results.jobs,
    ];
  }, [data]);

  // Handle item navigation
  const handleSelectItem = useCallback(
    (item: SearchItem) => {
      onClose();

      if (item.type === 'service') {
        if (typeof window !== 'undefined') {
          if (window.location.pathname === '/' || window.location.pathname === '') {
            window.dispatchEvent(
              new CustomEvent('select-service', { detail: { id: item.id } })
            );
            const el = document.getElementById('services');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
              return;
            }
          }
        }
      }

      router.push(item.url);
    },
    [router, onClose]
  );

  // Global keydown listeners for arrow navigation & escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (allItems.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && selectedIndex < allItems.length) {
          e.preventDefault();
          handleSelectItem(allItems[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allItems, selectedIndex, handleSelectItem, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-4 bg-slate-950/70 backdrop-blur-md transition-all duration-300 animate-fadeIn"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[82vh] sm:max-h-[85vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Search Input */}
        <div className="relative flex items-center px-4 sm:px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2D5A27] flex items-center justify-center shrink-0 mr-3 border border-emerald-100">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#2D5A27]" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-900 focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
            placeholder={
              isEn
                ? 'What do you need today...'
                : 'Bạn cần gì hôm nay...'
            }
          />

          {query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition mr-1"
              title={isEn ? 'Clear' : 'Xóa'}
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 transition cursor-pointer"
            title={isEn ? 'Close' : 'Đóng'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-4 space-y-4">
          {/* 1. Empty Query State - Tiêu đề 'Bạn cần gì hôm nay...' */}
          {!query.trim() && (
            <div className="py-12 sm:py-16 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-[#2D5A27] flex items-center justify-center border border-emerald-100 shadow-xs">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                {isEn ? 'What do you need today...' : 'Bạn cần gì hôm nay...'}
              </h3>
            </div>
          )}

          {/* 2. Loading State */}
          {loading && !data && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#2D5A27]" />
              <p className="text-xs">{isEn ? 'Searching...' : 'Đang tìm kiếm...'}</p>
            </div>
          )}

          {/* 3. Has Query & No Results */}
          {query.trim() && !loading && data && data.total === 0 && (
            <div className="py-10 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {isEn
                  ? `No results found for "${query}"`
                  : `Không tìm thấy kết quả phù hợp với "${query}"`}
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {isEn
                  ? 'Try searching with different keywords like checkup, vaccine, surgery, cat, dog...'
                  : 'Hãy thử tìm kiếm với các từ khóa khác như khám, tiêm phòng, phẫu thuật, spa, mèo, chó...'}
              </p>
            </div>
          )}

          {/* 4. Results List by Category */}
          {query.trim() && data && data.total > 0 && (
            <div className="space-y-4">
              {/* Category: Services */}
              {data.results.services.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-[#2D5A27]">
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Services' : 'Dịch Vụ Thú Y'}</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      ({data.results.services.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {data.results.services.map((item) => {
                      const itemIdx = allItems.findIndex((x) => x.id === item.id);
                      const isSelected = itemIdx === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectItem(item)}
                          className={`group flex items-center gap-3 p-2.5 rounded-xl transition cursor-pointer border ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-300 text-[#2D5A27]'
                              : 'hover:bg-slate-50 border-slate-100 text-slate-800'
                          }`}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-emerald-100 text-[#2D5A27] flex items-center justify-center shrink-0">
                              <Stethoscope className="w-5 h-5" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-bold truncate group-hover:text-[#2D5A27]">
                              {item.title}
                            </p>
                            {item.subtitle && (
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full shrink-0">
                            {item.badge}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category: Articles */}
              {data.results.articles.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-blue-700">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Knowledge & Guides' : 'Cẩm Nang Y Khoa'}</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      ({data.results.articles.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {data.results.articles.map((item) => {
                      const itemIdx = allItems.findIndex((x) => x.id === item.id);
                      const isSelected = itemIdx === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectItem(item)}
                          className={`group flex items-center gap-3 p-2.5 rounded-xl transition cursor-pointer border ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300 text-blue-900'
                              : 'hover:bg-slate-50 border-slate-100 text-slate-800'
                          }`}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                              <BookOpen className="w-5 h-5" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-bold truncate group-hover:text-blue-700">
                              {item.title}
                            </p>
                            {item.subtitle && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full shrink-0">
                            {item.badge}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category: Doctors */}
              {data.results.doctors.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-purple-700">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Doctors & Medical Team' : 'Đội Ngũ Bác Sĩ'}</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      ({data.results.doctors.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {data.results.doctors.map((item) => {
                      const itemIdx = allItems.findIndex((x) => x.id === item.id);
                      const isSelected = itemIdx === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectItem(item)}
                          className={`group flex items-center gap-3 p-2.5 rounded-xl transition cursor-pointer border ${
                            isSelected
                              ? 'bg-purple-50 border-purple-300 text-purple-900'
                              : 'hover:bg-slate-50 border-slate-100 text-slate-800'
                          }`}
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-10 h-10 rounded-full object-cover border border-purple-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                              <UserCheck className="w-5 h-5" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-bold truncate group-hover:text-purple-700">
                              {item.title}
                            </p>
                            {item.subtitle && (
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full shrink-0">
                            {item.badge}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category: Branches */}
              {data.results.branches.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-amber-700">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Clinic Branches' : 'Hệ Thống Chi Nhánh'}</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      ({data.results.branches.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {data.results.branches.map((item) => {
                      const itemIdx = allItems.findIndex((x) => x.id === item.id);
                      const isSelected = itemIdx === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectItem(item)}
                          className={`group flex items-center gap-3 p-2.5 rounded-xl transition cursor-pointer border ${
                            isSelected
                              ? 'bg-amber-50 border-amber-300 text-amber-900'
                              : 'hover:bg-slate-50 border-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-bold truncate group-hover:text-amber-800">
                              {item.title}
                            </p>
                            {item.subtitle && (
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full shrink-0">
                            {item.badge}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category: FAQs */}
              {data.results.faqs.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-teal-700">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Frequently Asked Questions' : 'Câu Hỏi Thường Gặp (FAQ)'}</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      ({data.results.faqs.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {data.results.faqs.map((item) => {
                      const itemIdx = allItems.findIndex((x) => x.id === item.id);
                      const isSelected = itemIdx === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectItem(item)}
                          className={`group flex items-center gap-3 p-2.5 rounded-xl transition cursor-pointer border ${
                            isSelected
                              ? 'bg-teal-50 border-teal-300 text-teal-900'
                              : 'hover:bg-slate-50 border-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                            <HelpCircle className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-bold truncate group-hover:text-teal-700">
                              {item.title}
                            </p>
                            {item.subtitle && (
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-teal-700 bg-teal-100/70 px-2 py-0.5 rounded-full shrink-0">
                            {item.badge}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category: Jobs */}
              {data.results.jobs.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 px-1 text-xs font-bold uppercase tracking-wider text-rose-700">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Careers & Recruitment' : 'Tuyển Dụng & Việc Làm'}</span>
                    <span className="text-[10px] font-normal text-slate-400">
                      ({data.results.jobs.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {data.results.jobs.map((item) => {
                      const itemIdx = allItems.findIndex((x) => x.id === item.id);
                      const isSelected = itemIdx === selectedIndex;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectItem(item)}
                          className={`group flex items-center gap-3 p-2.5 rounded-xl transition cursor-pointer border ${
                            isSelected
                              ? 'bg-rose-50 border-rose-300 text-rose-900'
                              : 'hover:bg-slate-50 border-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-bold truncate group-hover:text-rose-700">
                              {item.title}
                            </p>
                            {item.subtitle && (
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] font-semibold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full shrink-0">
                            {item.badge}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
