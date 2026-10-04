'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Link as LinkIcon,
  Copy,
  ExternalLink,
  Check,
  Camera,
  PlusCircle,
  RefreshCw,
  Building2,
  Clock,
  ShieldCheck,
  Receipt,
  User,
  Phone,
  Mail,
  QrCode,
  Star,
} from 'lucide-react';
import QRCode from 'qrcode';
import PetLogo from '@/components/PetLogo';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';
import { supabase, YeuCauDanhGiaRecord } from '@/lib/supabase';

export default function TaoDanhGiaPage() {
  const [branches, setBranches] = useState<{ id: string; ten_chi_nhanh: string }[]>([]);

  const [tenKhachHang, setTenKhachHang] = useState<string>('');
  const [soDienThoai, setSoDienThoai] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [coSo, setCoSo] = useState<string>('');
  const [maHoaDon, setMaHoaDon] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [createdRecord, setCreatedRecord] = useState<YeuCauDanhGiaRecord | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  const [historyList, setHistoryList] = useState<YeuCauDanhGiaRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);

  useEffect(() => {
    async function loadBranches() {
      try {
        const { data, error } = await supabase
          .from('chi_nhanh')
          .select('id, ten_chi_nhanh')
          .eq('kich_hoat', true)
          .order('thu_tu', { ascending: true });
        if (!error && data && data.length > 0) setBranches(data);
      } catch {}
    }
    loadBranches();
  }, []);

  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const res = await fetch('/api/review-requests?limit=50');
      const json = await res.json();
      if (res.ok && json.success) setHistoryList(json.data || []);
    } catch {}
    finally { setIsLoadingHistory(false); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanTenKH = tenKhachHang.trim();
    if (!cleanTenKH) { setErrorMessage('Vui lòng nhập tên khách hàng'); return; }
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/review-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ten_khach_hang: cleanTenKH,
          so_dien_thoai: soDienThoai.trim(),
          email: email.trim(),
          co_so: coSo.trim(),
          ma_hoa_don: maHoaDon.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Có lỗi xảy ra');
      const record: YeuCauDanhGiaRecord = json.data;
      setCreatedRecord(record);
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://petsmm.vercel.app';
      const link = `${origin}/danhgiadichvu/${encodeURIComponent(record.ma_danh_gia)}`;
      setGeneratedLink(link);
      try {
        const qrUrl = await QRCode.toDataURL(link, { width: 280, margin: 2, color: { dark: '#111827', light: '#ffffff' } });
        setQrCodeDataUrl(qrUrl);
      } catch {}
      fetchHistory();
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể tạo mã đánh giá, vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async (textToCopy?: string) => {
    const text = textToCopy || generatedLink;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleResetForm = () => {
    setCreatedRecord(null);
    setGeneratedLink('');
    setQrCodeDataUrl('');
    setTenKhachHang('');
    setSoDienThoai('');
    setEmail('');
    setMaHoaDon('');
    setErrorMessage('');
  };

  const inputCls = "w-full rounded-xl bg-white border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">

      {/* Header */}
      <header className="sticky top-0 z-20 w-full bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <PetLogo size="sm" showSubline={false} />
            </Link>
            <div className="hidden sm:block h-5 w-px bg-slate-200" />
            <span className="hidden sm:inline text-sm font-semibold text-emerald-700">
              Hệ Thống Đánh Giá Dịch Vụ
            </span>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-600 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Trang Admin
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Tạo Liên Kết Đánh Giá</h1>
          <p className="text-sm text-slate-500 mt-1">Tạo nhanh link khảo sát để gửi cho khách hàng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT: Form / Result */}
          <div className="lg:col-span-5">
            {createdRecord && generatedLink ? (
              /* SUCCESS CARD */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600" />
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">Tạo link thành công!</p>
                      <p className="text-xs text-slate-500">Khách hàng: <strong>{createdRecord.ten_khach_hang}</strong></p>
                    </div>
                  </div>

                  {/* QR Code */}
                  {qrCodeDataUrl && (
                    <div className="mb-5 flex justify-center">
                      <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm inline-block">
                        <Image src={qrCodeDataUrl} alt="QR Code đánh giá" width={180} height={180} className="rounded" />
                      </div>
                    </div>
                  )}

                  {/* Info */}
                  <div className="mb-4 space-y-2 text-sm">
                    {createdRecord.co_so && (
                      <div className="flex justify-between text-slate-600">
                        <span>Cơ sở</span>
                        <span className="font-medium text-slate-800">{createdRecord.co_so}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Mã đánh giá</span>
                      <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{createdRecord.ma_danh_gia}</span>
                    </div>
                  </div>

                  {/* Link copy */}
                  <div className="mb-5">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Đường link đánh giá</label>
                    <div className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50">
                      <input
                        type="text"
                        readOnly
                        value={generatedLink}
                        className="flex-1 bg-transparent text-xs text-slate-600 px-2 focus:outline-none font-mono truncate"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopyLink()}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                          copied ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Đã chép' : 'Chép'}
                      </button>
                      <a
                        href={generatedLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-sm font-medium text-slate-600 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Tạo đánh giá mới
                  </button>
                </div>
              </div>
            ) : (
              /* CREATE FORM */
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-800">Thông tin khách hàng</h2>
                </div>
                <form onSubmit={handleCreateReview} className="p-5 sm:p-6 space-y-4">

                  {/* Tên KH */}
                  <div>
                    <label htmlFor="customer-name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Tên khách hàng <span className="text-red-500 normal-case">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="customer-name"
                        type="text"
                        required
                        value={tenKhachHang}
                        onChange={(e) => setTenKhachHang(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* SĐT */}
                  <div>
                    <label htmlFor="customer-phone" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input id="customer-phone" type="tel" value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} className={inputCls} />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="customer-email" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input id="customer-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
                    </div>
                  </div>

                  {/* Cơ sở */}
                  <div>
                    <label htmlFor="branch-select" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                      Cơ sở phòng khám
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                      <select
                        id="branch-select"
                        value={coSo}
                        onChange={(e) => setCoSo(e.target.value)}
                        className="w-full rounded-xl bg-white border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm appearance-none cursor-pointer"
                      >
                        <option value="">-- Chọn cơ sở --</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.ten_chi_nhanh}>{b.ten_chi_nhanh}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Mã hóa đơn */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="receipt-code" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Mã hóa đơn
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsScannerOpen(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-600 transition-colors cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Quét mã vạch
                      </button>
                    </div>
                    <div className="relative">
                      <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input id="receipt-code" type="text" value={maHoaDon} onChange={(e) => setMaHoaDon(e.target.value)} className={`${inputCls} font-mono`} />
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang tạo...</span>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4" />
                        <span>Tạo Link & Mã QR</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT: History */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <h2 className="font-semibold text-slate-800 text-sm">Lịch Sử Tạo Đánh Giá</h2>
                </div>
                <button
                  type="button"
                  onClick={fetchHistory}
                  disabled={isLoadingHistory}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {isLoadingHistory ? (
                  <div className="py-12 text-center text-slate-400 text-sm flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
                    <span>Đang tải...</span>
                  </div>
                ) : historyList.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-sm">Chưa có mã đánh giá nào</div>
                ) : (
                  historyList.map((item) => {
                    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://petsmm.vercel.app';
                    const link = `${origin}/danhgiadichvu/${encodeURIComponent(item.ma_danh_gia)}`;
                    const isDone = item.trang_thai === 'da_danh_gia';
                    return (
                      <div key={item.id} className="flex items-start sm:items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2 mb-1">
                            <span className="font-semibold text-slate-800 text-sm truncate">{item.ten_khach_hang}</span>
                            {isDone ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
                                <Check className="w-3 h-3" />
                                Đã đánh giá
                                {item.so_sao ? (
                                  <span className="flex items-center gap-0.5 ml-0.5">
                                    {[1,2,3,4,5].map(s => (
                                      <Star key={s} className={`w-2.5 h-2.5 ${s <= (item.so_sao||0) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                                    ))}
                                  </span>
                                ) : null}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold">
                                <Clock className="w-3 h-3" />
                                Chờ đánh giá
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
                            <span>Mã: <strong className="text-slate-700 font-mono">{item.ma_danh_gia}</strong></span>
                            {item.so_dien_thoai && <span>SĐT: {item.so_dien_thoai}</span>}
                            {item.co_so && <span>{item.co_so}</span>}
                            {item.ma_hoa_don && <span>HĐ: <span className="font-mono">{item.ma_hoa_don}</span></span>}
                          </div>
                          {item.noi_dung_danh_gia && (
                            <p className="text-xs text-slate-500 italic mt-1 line-clamp-1">"{item.noi_dung_danh_gia}"</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopyLink(link)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-600 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            Chép
                          </button>
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(code) => setMaHoaDon(code)}
      />
    </div>
  );
}
