import React from 'react';

export default function ChiNhanhLoading() {
  return (
    <div className="min-h-screen bg-[#f8faf7] animate-pulse">
      {/* 1. Hero Skeleton */}
      <div className="w-full h-56 sm:h-72 md:h-96 lg:h-[460px] bg-slate-300 relative flex flex-col justify-end p-6 sm:p-10">
        <div className="w-24 h-6 rounded-full bg-white/40 mb-3" />
        <div className="w-3/4 max-w-md h-9 rounded-xl bg-white/50 mb-3" />
        <div className="w-1/2 max-w-sm h-5 rounded-lg bg-white/40" />
      </div>

      {/* 2. Breadcrumb Skeleton */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-10 py-3.5 flex items-center gap-2">
        <div className="w-16 h-4 bg-slate-200 rounded" />
        <div className="w-3 h-4 bg-slate-100 rounded" />
        <div className="w-24 h-4 bg-slate-200 rounded" />
        <div className="w-3 h-4 bg-slate-100 rounded" />
        <div className="w-32 h-4 bg-slate-200 rounded" />
      </div>

      {/* 3. Main Content Skeleton */}
      <div className="w-full px-3 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column */}
          <div className="lg:col-span-8 space-y-5">
            {/* Quick info strip */}
            <div className="bg-white rounded-xl border border-slate-100 p-4 flex gap-4">
              <div className="w-36 h-6 bg-slate-200 rounded-lg" />
              <div className="w-44 h-6 bg-slate-200 rounded-lg" />
              <div className="w-28 h-6 bg-slate-200 rounded-lg ml-auto" />
            </div>

            {/* Article Skeleton */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 md:p-10 space-y-4">
              <div className="w-2/3 h-7 bg-slate-200 rounded-lg" />
              <div className="w-full h-4 bg-slate-100 rounded" />
              <div className="w-5/6 h-4 bg-slate-100 rounded" />
              <div className="w-4/5 h-4 bg-slate-100 rounded" />

              <div className="w-full h-64 bg-slate-200 rounded-2xl my-6" />

              <div className="w-1/2 h-6 bg-slate-200 rounded-lg mt-6" />
              <div className="w-full h-4 bg-slate-100 rounded" />
              <div className="w-11/12 h-4 bg-slate-100 rounded" />
              <div className="w-3/4 h-4 bg-slate-100 rounded" />
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-xs">
              <div className="w-1/2 h-5 bg-slate-200 rounded" />
              <div className="w-full h-10 bg-slate-100 rounded-xl" />
              <div className="w-full h-10 bg-slate-100 rounded-xl" />
              <div className="w-full h-10 bg-slate-100 rounded-xl" />
              <div className="w-full h-11 bg-[#2D5A27]/20 rounded-xl mt-4" />
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
              <div className="w-2/3 h-5 bg-slate-200 rounded" />
              <div className="w-full h-8 bg-slate-100 rounded-lg" />
              <div className="w-full h-8 bg-slate-100 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
