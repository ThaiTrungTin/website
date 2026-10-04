'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  LogOut,
  KeyRound,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import QRCode from 'qrcode';
import PetLogo from '@/components/PetLogo';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';
import { supabase, YeuCauDanhGiaRecord } from '@/lib/supabase';
import { usePresenceHeartbeat } from '@/lib/usePresenceHeartbeat';

export default function TaoDanhGiaPage() {
  // XÁC THỰC NGƯỜI DÙNG TẠO ĐÁNH GIÁ (USER / ADMIN AUTHENTICATION)
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    ho_ten: string;
    vai_tro: string;
    email?: string;
  } | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Form đăng nhập
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Gửi heartbeat theo dõi trạng thái online / chuyển tab của nhân viên
  usePresenceHeartbeat(Boolean(currentUser));

  // Kiểm tra phiên đăng nhập khi tải trang
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/me');
        const data = await res.json();
        if (isMounted) {
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
          } else {
            setCurrentUser(null);
          }
        }
      } catch {
        if (isMounted) setCurrentUser(null);
      } finally {
        if (isMounted) setIsAuthChecking(false);
      }
    };
    checkAuth();
    return () => { isMounted = false; };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginUsername.trim() || !loginPassword) {
      setLoginError('Vui lòng nhập tên đăng nhập hoặc email và mật khẩu!');
      return;
    }
    setLoginLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername.trim(), password: loginPassword }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        setLoginPassword('');
      } else {
        setLoginError(data.message || 'Tài khoản hoặc mật khẩu không chính xác!');
      }
    } catch {
      setLoginError('Lỗi kết nối máy chủ, vui lòng thử lại sau!');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {}
    setCurrentUser(null);
  };

  // DỮ LIỆU TẠO ĐÁNH GIÁ
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

  useEffect(() => {
    if (currentUser) {
      fetchHistory();
    }
  }, [currentUser]);

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

  // MÀN HÌNH ĐANG KIỂM TRA PHIÊN
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // MÀN HÌNH ĐĂNG NHẬP DÀNH CHO NHÂN VIÊN TẠO ĐÁNH GIÁ
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-emerald-100 p-8">
          <div className="text-center mb-6">
            <div className="inline-block mb-3">
              <PetLogo size="default" showSubline={false} />
            </div>
            <h1 className="text-lg font-bold text-slate-900">Cổng Nhân Viên Tạo Đánh Giá</h1>
            <p className="text-xs text-slate-500 mt-1">
              Đăng nhập tài khoản nhân sự được cấp để tạo link khảo sát dịch vụ
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700 animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tên đăng nhập hoặc Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="nhansu@petmm.vn"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-emerald-600 focus:outline-none transition shadow-xs"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-emerald-600 focus:outline-none transition shadow-xs"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 disabled:opacity-60"
            >
              {loginLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <span>Đăng Nhập Vào Hệ Thống</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link href="/" className="text-xs text-emerald-700 hover:underline font-medium">
              ← Quay về trang chủ PetM&amp;M
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // MÀN HÌNH CHÍNH KHI ĐÃ ĐĂNG NHẬP
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <header className="sticky top-0 z-20 w-full bg-white border-b border-slate-200 shadow-xs">
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

          {/* User info & Navigation */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Đang trực tuyến" />
              <div className="text-left">
                <span className="text-xs font-bold text-slate-800 block leading-tight">
                  {currentUser.ho_ten}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {currentUser.vai_tro === 'admin' ? 'Quản trị viên' : 'Nhân viên (User)'}
                </span>
              </div>
            </div>

            {currentUser.vai_tro === 'admin' && (
              <Link
                href="/admin"
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Trang Admin</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition cursor-pointer border border-slate-200"
              title="Đăng xuất khỏi phiên làm việc"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Tạo Liên Kết Đánh Giá</h1>
          <p className="text-sm text-slate-500 mt-1">Tạo nhanh link khảo sát để gửi cho khách hàng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Form / Result */}
          <div className="lg:col-span-5">
            {createdRecord && generatedLink ? (
              <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-4 text-emerald-600">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Check className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Đã tạo mã đánh giá!</h3>
                    <p className="text-xs text-slate-500">Mã: {createdRecord.ma_danh_gia}</p>
                  </div>
                </div>

                {qrCodeDataUrl && (
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl mb-4">
                    <img src={qrCodeDataUrl} alt="QR Code Đánh Giá" className="w-48 h-48 rounded-lg shadow-xs" />
                    <span className="text-[11px] text-slate-500 mt-2 font-medium">Khách hàng quét mã này để mở đánh giá</span>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <label className="text-xs font-semibold text-slate-700">Link đánh giá:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedLink}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 font-mono select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyLink()}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Đã chép' : 'Chép'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <a
                    href={generatedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition text-center flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở xem thử</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Tạo tiếp</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 text-base mb-1">Thông Tin Khách Hàng</h3>
                <p className="text-xs text-slate-500 mb-5">Nhập thông tin lượt thăm khám để tạo mã</p>

                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleCreateReview} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tên khách hàng <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ví dụ: Nguyễn Văn A"
                        value={tenKhachHang}
                        onChange={(e) => setTenKhachHang(e.target.value)}
                        className={inputCls}
                        required
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="Ví dụ: 0903 599 339"
                        value={soDienThoai}
                        onChange={(e) => setSoDienThoai(e.target.value)}
                        className={inputCls}
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email khách hàng
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="khachhang@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputCls}
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Cơ sở khám
                    </label>
                    <div className="relative">
                      <select
                        value={coSo}
                        onChange={(e) => setCoSo(e.target.value)}
                        className="w-full rounded-xl bg-white border border-slate-200 pl-10 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm cursor-pointer"
                      >
                        <option value="">-- Chọn cơ sở / chi nhánh --</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.ten_chi_nhanh}>
                            {b.ten_chi_nhanh}
                          </option>
                        ))}
                      </select>
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700">Mã hóa đơn / Mã phiếu</label>
                      <button
                        type="button"
                        onClick={() => setIsScannerOpen(true)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Quét mã vạch
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ví dụ: HD-12345"
                        value={maHoaDon}
                        onChange={(e) => setMaHoaDon(e.target.value)}
                        className={inputCls}
                      />
                      <Receipt className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang tạo mã...</span>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4" />
                        <span>Tạo Link &amp; Mã QR Đánh Giá</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* RIGHT: History List */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">Lịch Sử Tạo Đánh Giá Gần Đây</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                    {historyList.length}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={fetchHistory}
                  disabled={isLoadingHistory}
                  className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                  Làm mới
                </button>
              </div>

              {isLoadingHistory ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Đang tải lịch sử...
                </div>
              ) : historyList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">Chưa có lượt tạo đánh giá nào</div>
              ) : (
                <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto pr-1">
                  {historyList.map((item) => {
                    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://petsmm.vercel.app';
                    const link = `${origin}/danhgiadichvu/${encodeURIComponent(item.ma_danh_gia)}`;
                    return (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition rounded-lg px-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 text-sm truncate">
                              {item.ten_khach_hang}
                            </span>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              {item.ma_danh_gia}
                            </span>
                            {item.trang_thai === 'da_danh_gia' && (
                              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Check className="w-3 h-3" /> Đã gửi đánh giá
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                            {item.so_dien_thoai && <span>📞 {item.so_dien_thoai}</span>}
                            {item.co_so && <span>🏥 {item.co_so}</span>}
                            {item.ngay_tao && (
                              <span>🕒 {new Date(item.ngay_tao).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                          </div>
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
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(code) => setMaHoaDon(code)}
      />

      {/* CỬA SỔ XÁC NHẬN ĐĂNG XUẤT */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100">
            <div className="p-6 text-center border-b border-slate-100 bg-slate-50">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-700">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Xác nhận đăng xuất</h3>
              <p className="text-xs text-slate-500 mt-2">
                Bạn có chắc chắn muốn đăng xuất khỏi Cổng Tạo Đánh Giá không?
              </p>
            </div>
            <div className="p-4 flex gap-3 bg-white">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
              >
                Ở lại
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition cursor-pointer shadow-xs"
              >
                Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
