'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useNavDatabase, ServiceTier1Group, KnowledgeCategoryGroup } from '@/hooks/useNavDatabase';
import PetMMBrand from './PetMMBrand';

interface NavDesktopMenuProps {
  /** Variant determines minor spacing or pill text styles */
  variant?: 'pill' | 'header';
  onItemClick?: () => void;
}

export default function NavDesktopMenu({ variant = 'header', onItemClick }: NavDesktopMenuProps) {
  const { t, isEn } = useLanguage();
  const { branches, serviceGroups, knowledgeGroups } = useNavDatabase();
  const [hoveredServiceGroup, setHoveredServiceGroup] = useState<string | null>(null);
  const [hoveredKnowledgeGroup, setHoveredKnowledgeGroup] = useState<string | null>(null);

  const linkClass =
    variant === 'pill'
      ? 'inline-flex items-center gap-1 text-xs font-semibold text-slate-800 hover:text-[#2D5A27] transition-colors py-1 cursor-pointer'
      : 'inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-[#2D5A27] transition-colors px-3 py-1.5 rounded-full hover:bg-slate-50 cursor-pointer';

  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      {/* 1. VỀ PETM&M (KHÔNG ĐỔ XUỐNG) */}
      <a href="/#about" onClick={onItemClick} className={linkClass}>
        <span>
          {isEn ? 'About ' : 'Về '}
          <PetMMBrand />
        </span>
      </a>

      {variant === 'pill' && <span className="text-slate-300 select-none">•</span>}

      {/* 2. DỊCH VỤ (ĐỔ XUỐNG 2 TẦNG: 2 NHÓM & DANH SÁCH GÓI DỊCH VỤ CON) */}
      <div
        className="relative group/services"
        onMouseLeave={() => setHoveredServiceGroup(null)}
      >
        <a href="/#services" onClick={onItemClick} className={linkClass}>
          <span>{t('nav_services', 'Dịch Vụ')}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover/services:text-[#2D5A27] group-hover/services:rotate-180 transition-transform duration-200" />
        </a>

        {/* Bridge to prevent closing on mouse move */}
        <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-1.5 pointer-events-none group-hover/services:opacity-100 group-hover/services:translate-y-0 group-hover/services:pointer-events-auto transition-all duration-200 z-50">
          <div className="relative flex">
            {/* TẦNG 1: 2 Nhóm Dịch Vụ (Thú Y & Y Tế / Chăm Sóc & Lưu Trú) */}
            <div className="w-[210px] sm:w-[230px] bg-[#FAF8F5] border border-stone-200/90 shadow-xl rounded-md py-1.5 text-stone-800">
              {serviceGroups.map((group: ServiceTier1Group) => {
                const hasChildren = Boolean(group.children && group.children.length > 0);
                const isHovered = hoveredServiceGroup === group.id;

                return (
                  <div
                    key={group.id}
                    className="relative group/tier1"
                    onMouseEnter={() => setHoveredServiceGroup(group.id)}
                  >
                    <a
                      href={group.href}
                      onClick={onItemClick}
                      className={`flex items-center justify-between px-4 py-2.5 text-[13px] sm:text-sm transition-colors duration-150 cursor-pointer ${
                        isHovered
                          ? 'bg-[#00897b] text-white font-medium'
                          : 'text-stone-700 hover:bg-[#00897b] hover:text-white'
                      }`}
                    >
                      <span className="truncate">{group.name}</span>
                      {hasChildren && (
                        <ChevronRight
                          className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                            isHovered ? 'text-white' : 'text-stone-400'
                          }`}
                        />
                      )}
                    </a>

                    {/* TẦNG 2: Danh sách dịch vụ con thực tế từ DB bay ra bên phải */}
                    {hasChildren && (
                      <div
                        className={`absolute left-full top-0 -ml-0.5 pt-0 transition-all duration-150 z-50 ${
                          isHovered
                            ? 'opacity-100 pointer-events-auto translate-x-0'
                            : 'opacity-0 pointer-events-none -translate-x-1'
                        }`}
                      >
                        <div className="min-w-[270px] max-w-[340px] bg-[#FAF8F5] border border-stone-200/90 shadow-xl rounded-md py-1.5 text-stone-800">
                          {group.children.map((service) => (
                            <a
                              key={service.id}
                              href={service.href}
                              onClick={(e) => {
                                if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '')) {
                                  e.preventDefault();
                                  window.dispatchEvent(
                                    new CustomEvent('select-service', { detail: { id: service.id } })
                                  );
                                  const el = document.getElementById('services');
                                  if (el) {
                                    el.scrollIntoView({ behavior: 'smooth' });
                                  }
                                }
                                if (onItemClick) onItemClick();
                              }}
                              className="block px-4 py-2 text-[13px] text-stone-700 hover:bg-[#00897b] hover:text-white transition-colors duration-150 leading-relaxed cursor-pointer"
                            >
                              {service.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {variant === 'pill' && <span className="text-slate-300 select-none">•</span>}

      {/* 3. CHI NHÁNH / HỆ THỐNG CƠ SỞ (ĐỔ XUỐNG 1 TẦNG - CHUYỂN THẲNG ĐẾN VIEW CON /chi-nhanh/:id) */}
      <div className="relative group/branches">
        <a href="/#branches" onClick={onItemClick} className={linkClass}>
          <span>{t('nav_branches', 'Hệ Thống Cơ Sở')}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover/branches:text-[#2D5A27] group-hover/branches:rotate-180 transition-transform duration-200" />
        </a>

        {/* Dropdown 1 tầng hiển thị danh sách cơ sở từ ảnh 2, click chuyển thẳng vào view con */}
        <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-1.5 pointer-events-none group-hover/branches:opacity-100 group-hover/branches:translate-y-0 group-hover/branches:pointer-events-auto transition-all duration-200 z-50">
          <div className="min-w-[200px] max-w-[280px] bg-[#FAF8F5] border border-stone-200/90 shadow-xl rounded-md py-1.5 text-stone-800">
            {branches.map((branch) => (
              <Link
                key={branch.id}
                href={branch.href}
                prefetch={true}
                onClick={onItemClick}
                className="block px-4 py-2.5 text-[13px] sm:text-sm text-stone-700 hover:bg-[#00897b] hover:text-white transition-colors duration-150 cursor-pointer truncate"
              >
                {branch.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {variant === 'pill' && <span className="text-slate-300 select-none">•</span>}

      {/* 4. CẨM NANG (2 TẦNG: TẦNG 1 LÀ CHUYÊN MỤC CÓ BÀI VIẾT, TẦNG 2 LÀ TIÊU ĐỀ BÀI VIẾT CHUYỂN ĐẾN VIEW CON /kien-thuc/:id) */}
      <div
        className="relative group/knowledge"
        onMouseLeave={() => setHoveredKnowledgeGroup(null)}
      >
        <a href="/#knowledge" onClick={onItemClick} className={linkClass}>
          <span>{t('nav_knowledge', 'Cẩm Nang')}</span>
          <ChevronDown className="w-3 h-3 text-slate-400 group-hover/knowledge:text-[#2D5A27] group-hover/knowledge:rotate-180 transition-transform duration-200" />
        </a>

        {/* Dropdown 2 tầng cẩm nang theo chuyên mục và tiêu đề bài viết */}
        <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-1.5 pointer-events-none group-hover/knowledge:opacity-100 group-hover/knowledge:translate-y-0 group-hover/knowledge:pointer-events-auto transition-all duration-200 z-50">
          <div className="relative flex">
            {/* TẦNG 1: Các chuyên mục thực tế có bài viết con */}
            <div className="w-[190px] sm:w-[210px] bg-[#FAF8F5] border border-stone-200/90 shadow-xl rounded-md py-1.5 text-stone-800">
              {knowledgeGroups.map((kg: KnowledgeCategoryGroup) => {
                const hasArticles = kg.articles && kg.articles.length > 0;
                const isHovered = hoveredKnowledgeGroup === kg.category;

                return (
                  <div
                    key={kg.category}
                    className="relative group/cat"
                    onMouseEnter={() => setHoveredKnowledgeGroup(kg.category)}
                  >
                    <a
                      href={kg.href}
                      onClick={onItemClick}
                      className={`flex items-center justify-between px-4 py-2.5 text-[13px] sm:text-sm transition-colors duration-150 cursor-pointer ${
                        isHovered
                          ? 'bg-[#00897b] text-white font-medium'
                          : 'text-stone-700 hover:bg-[#00897b] hover:text-white'
                      }`}
                    >
                      <span className="truncate">{kg.category}</span>
                      {hasArticles && (
                        <ChevronRight
                          className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                            isHovered ? 'text-white' : 'text-stone-400'
                          }`}
                        />
                      )}
                    </a>

                    {/* TẦNG 2: Tiêu đề bài viết con thực tế từ DB, click chuyển thẳng đến view con /kien-thuc/:id */}
                    {hasArticles && (
                      <div
                        className={`absolute left-full top-0 -ml-0.5 pt-0 transition-all duration-150 z-50 ${
                          isHovered
                            ? 'opacity-100 pointer-events-auto translate-x-0'
                            : 'opacity-0 pointer-events-none -translate-x-1'
                        }`}
                      >
                        <div className="min-w-[280px] max-w-[360px] bg-[#FAF8F5] border border-stone-200/90 shadow-xl rounded-md py-1.5 text-stone-800">
                          {kg.articles.map((article) => (
                            <Link
                              key={article.id}
                              href={article.href}
                              prefetch={true}
                              onClick={onItemClick}
                              className="block px-4 py-2 text-[13px] text-stone-700 hover:bg-[#00897b] hover:text-white transition-colors duration-150 leading-relaxed cursor-pointer"
                            >
                              {article.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {variant === 'pill' && <span className="text-slate-300 select-none">•</span>}

      {/* 5. FAQ (KHÔNG ĐỔ XUỐNG) */}
      <a href="/#faq" onClick={onItemClick} className={linkClass}>
        <span>{t('nav_faq', 'FAQ')}</span>
      </a>

      {variant === 'pill' && <span className="text-slate-300 select-none">•</span>}

      {/* 6. ĐÁNH GIÁ (KHÔNG ĐỔ XUỐNG) */}
      <a href="/#reviews" onClick={onItemClick} className={linkClass}>
        <span>{t('nav_reviews', 'Đánh Giá')}</span>
      </a>

      {variant === 'pill' && <span className="text-slate-300 select-none">•</span>}

      {/* 7. TUYỂN DỤNG (KHÔNG ĐỔ XUỐNG) */}
      <Link href="/tuyen-dung" onClick={onItemClick} className={linkClass}>
        <span>{t('nav_careers', 'Tuyển Dụng')}</span>
      </Link>

      {variant === 'pill' && <span className="text-slate-300 select-none">•</span>}

      {/* 8. LIÊN HỆ (KHÔNG ĐỔ XUỐNG) */}
      <a href="/#contact" onClick={onItemClick} className={linkClass}>
        <span>{t('nav_contact', 'Liên Hệ')}</span>
      </a>
    </nav>
  );
}
