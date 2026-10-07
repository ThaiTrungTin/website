'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  ChevronDown,
  X,
  Download,
  Search,
  Pencil,
} from 'lucide-react';
import QRCode from 'qrcode';
import PetLogo from '@/components/PetLogo';
import BarcodeScannerModal from '@/components/BarcodeScannerModal';
import ZaloIcon from '@/components/ZaloIcon';
import { supabase, YeuCauDanhGiaRecord } from '@/lib/supabase';
import { usePresenceHeartbeat } from '@/lib/usePresenceHeartbeat';
import AdminNotificationFailureToast, {
  NotificationFailureItem,
} from '@/components/AdminNotificationFailureToast';

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
  const [copiedLoginPwd, setCopiedLoginPwd] = useState(false);
  const [autoFillLoginNotice, setAutoFillLoginNotice] = useState('');

  // Gửi heartbeat theo dõi trạng thái online / chuyển tab của nhân viên
  usePresenceHeartbeat(Boolean(currentUser));

  // Cố định tiêu đề tab trình duyệt cho trang Tạo Liên Kết Đánh Giá
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const targetTitle = 'PetM&M - Tạo liên kết đánh giá';
    const apply = () => {
      if (document.title !== targetTitle) {
        document.title = targetTitle;
      }
    };
    apply();
    const timers = [
      setTimeout(apply, 100),
      setTimeout(apply, 500),
      setTimeout(apply, 1000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Kiểm tra phiên đăng nhập & URL params khi tải trang
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

    // Nhận thông tin tự điền & chép mật khẩu từ email gửi đến
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const emailParam = params.get('email');
        const pwdParam = params.get('pwd');
        if (emailParam) {
          setLoginUsername(decodeURIComponent(emailParam));
        }
        if (pwdParam) {
          const decodedPwd = decodeURIComponent(pwdParam);
          setLoginPassword(decodedPwd);
          try {
            navigator.clipboard.writeText(decodedPwd).catch(() => {});
          } catch (_) {}
          setAutoFillLoginNotice('Đã tự động điền tài khoản và sao chép mật khẩu vào bộ nhớ tạm!');
        }
      } catch (_) {}
    }

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
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState<boolean>(false);
  const branchDropdownRef = React.useRef<HTMLDivElement>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      setCurrentTimeStr(
        `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(e.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [createdRecord, setCreatedRecord] = useState<YeuCauDanhGiaRecord | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState<string>('');

  const [historyList, setHistoryList] = useState<YeuCauDanhGiaRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredHistoryList = React.useMemo(() => {
    if (!searchTerm.trim()) return historyList;
    const q = searchTerm.trim().toLowerCase();
    return historyList.filter((item) => {
      return (
        item.ten_khach_hang?.toLowerCase().includes(q) ||
        item.so_dien_thoai?.toLowerCase().includes(q) ||
        item.ma_danh_gia?.toLowerCase().includes(q) ||
        item.ma_hoa_don?.toLowerCase().includes(q) ||
        item.co_so?.toLowerCase().includes(q) ||
        item.nguoi_tao?.toLowerCase().includes(q)
      );
    });
  }, [historyList, searchTerm]);

  // Modal hiển thị mã QR & sao chép link từ bảng lịch sử
  const [qrModalData, setQrModalData] = useState<{
    item: YeuCauDanhGiaRecord;
    link: string;
    qrDataUrl: string;
  } | null>(null);
  const [qrModalCopied, setQrModalCopied] = useState<boolean>(false);

  const handleOpenQrModal = async (item: YeuCauDanhGiaRecord) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://petmm.vn';
    const link = `${origin}/danhgiadichvu/${encodeURIComponent(item.ma_danh_gia)}`;
    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(link, {
        width: 320,
        margin: 2,
        color: { dark: '#111827', light: '#ffffff' },
      });
    } catch {}
    setQrModalData({ item, link, qrDataUrl });
    setQrModalCopied(false);
  };

  const handleCopyQrModalLink = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setQrModalCopied(true);
      setTimeout(() => setQrModalCopied(false), 2500);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setQrModalCopied(true);
      setTimeout(() => setQrModalCopied(false), 2500);
    }
  };

  // Trạng thái gửi Zalo OA ZNS
  const [zaloSending, setZaloSending] = useState(false);
  const [zaloSendStatus, setZaloSendStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [failureNotification, setFailureNotification] = useState<NotificationFailureItem | null>(null);

  // Chế độ chỉnh sửa thông tin yêu cầu đánh giá (chỉ khi trạng thái chờ đánh giá)
  const [editingRecord, setEditingRecord] = useState<YeuCauDanhGiaRecord | null>(null);

  const handleStartEdit = (item: YeuCauDanhGiaRecord) => {
    setCreatedRecord(null);
    setEditingRecord(item);
    setTenKhachHang(item.ten_khach_hang || '');
    setSoDienThoai(item.so_dien_thoai || '');
    setEmail(item.email || '');
    setCoSo(item.co_so || '');
    setMaHoaDon(item.ma_hoa_don || '');
    setErrorMessage('');
    setPhoneError('');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
    handleResetForm();
  };

  const handleSendZaloOa = async (targetRecord: YeuCauDanhGiaRecord) => {
    if (!targetRecord.so_dien_thoai) {
      alert('Hồ sơ này không có số điện thoại của khách để gửi Zalo!');
      return;
    }
    setZaloSending(true);
    setZaloSendStatus(null);
    try {
      const res = await fetch('/api/admin/zalo/send-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: targetRecord.so_dien_thoai,
          customerName: targetRecord.ten_khach_hang,
          orderId: targetRecord.ma_hoa_don || targetRecord.ma_danh_gia,
          reviewCode: targetRecord.ma_danh_gia,
          coSo: targetRecord.co_so,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setZaloSendStatus({ success: true, message: data.message || 'Đã gửi qua Zalo OA thành công!' });
      } else {
        const errorMsg = data.message || 'Không thể gửi qua Zalo OA.';
        setZaloSendStatus({ success: false, message: errorMsg });
        setFailureNotification({
          id: 'fail_' + Date.now(),
          kenh: 'zalo',
          loai_tin: 'danh_gia',
          nguoi_nhan: targetRecord.so_dien_thoai,
          ten_nguoi_nhan: targetRecord.ten_khach_hang,
          tieu_de: 'Mẫu Đánh Giá Dịch Vụ',
          chi_tiet_loi: errorMsg,
          ma_loi: data.error,
        });
      }
      // Cập nhật lại lịch sử để làm mới số lần gửi & trạng thái Zalo ngay lập tức
      fetchHistory();
    } catch (err: any) {
      const errorMsg = err.message || 'Lỗi kết nối khi gửi Zalo OA.';
      setZaloSendStatus({ success: false, message: errorMsg });
      setFailureNotification({
        id: 'fail_' + Date.now(),
        kenh: 'zalo',
        loai_tin: 'danh_gia',
        nguoi_nhan: targetRecord.so_dien_thoai,
        ten_nguoi_nhan: targetRecord.ten_khach_hang,
        tieu_de: 'Mẫu Đánh Giá Dịch Vụ',
        chi_tiet_loi: errorMsg,
      });
      fetchHistory();
    } finally {
      setZaloSending(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/[^\d]/.test(val)) {
      setPhoneError('Chỉ được nhập số điện thoại, không nhập chữ hay ký tự khác!');
      const digitsOnly = val.replace(/\D/g, '').slice(0, 10);
      setSoDienThoai(digitsOnly);
      return;
    }

    if (val.length > 10) {
      setPhoneError('Số điện thoại chỉ có tối đa 10 chữ số (bạn đang nhập quá số lượng)!');
      setSoDienThoai(val.slice(0, 10));
      return;
    }

    setSoDienThoai(val);

    if (val.length > 0 && !val.startsWith('0')) {
      setPhoneError('Số điện thoại phải bắt đầu bằng số 0!');
    } else if (val.length > 0 && val.length < 10) {
      setPhoneError(`Số điện thoại chưa đủ 10 chữ số (${val.length}/10)`);
    } else if (val.length === 10 && !/^(0[35789])[0-9]{8}$/.test(val)) {
      setPhoneError('Đầu số điện thoại không hợp lệ (hợp lệ: 03, 05, 07, 08, 09)');
    } else {
      setPhoneError('');
    }
  };

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

  const fetchHistory = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoadingHistory(true);
      const res = await fetch('/api/review-requests?limit=50');
      const json = await res.json();
      if (res.ok && json.success) setHistoryList(json.data || []);
    } catch {}
    finally {
      if (!isSilent) setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    fetchHistory(false);

    const channel = supabase
      .channel('taodanhgia_yeu_cau_danh_gia_rt')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'yeu_cau_danh_gia' },
        () => {
          fetchHistory(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, fetchHistory]);

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanTenKH = tenKhachHang.trim();
    if (!cleanTenKH) { setErrorMessage('Vui lòng nhập tên khách hàng'); return; }

    const cleanSDT = soDienThoai.trim();
    if (cleanSDT) {
      if (!/^\d+$/.test(cleanSDT)) {
        setErrorMessage('Số điện thoại chỉ được chứa các chữ số, không chứa chữ hay ký tự khác!');
        return;
      }
      if (cleanSDT.length !== 10) {
        setErrorMessage(`Số điện thoại phải gồm đúng 10 chữ số (hiện tại: ${cleanSDT.length} số)!`);
        return;
      }
      if (!cleanSDT.startsWith('0')) {
        setErrorMessage('Số điện thoại phải bắt đầu bằng số 0!');
        return;
      }
      if (!/^(0[35789])[0-9]{8}$/.test(cleanSDT)) {
        setErrorMessage('Đầu số điện thoại không hợp lệ (hợp lệ: 03x, 05x, 07x, 08x, 09x)!');
        return;
      }
    }
    try {
      setIsSubmitting(true);

      // Nếu đang trong chế độ chỉnh sửa -> Gọi PUT
      if (editingRecord) {
        const res = await fetch('/api/review-requests', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingRecord.id,
            ten_khach_hang: cleanTenKH,
            so_dien_thoai: cleanSDT || null,
            email: email.trim() || null,
            co_so: coSo.trim() || null,
            ma_hoa_don: maHoaDon.trim() || null,
          }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || 'Có lỗi xảy ra khi cập nhật');
        const record: YeuCauDanhGiaRecord = json.data;
        setCreatedRecord(record);
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://petmm.vn';
        const link = `${origin}/danhgiadichvu/${encodeURIComponent(record.ma_danh_gia)}`;
        setGeneratedLink(link);
        try {
          const qrUrl = await QRCode.toDataURL(link, { width: 280, margin: 2, color: { dark: '#111827', light: '#ffffff' } });
          setQrCodeDataUrl(qrUrl);
        } catch {}
        setEditingRecord(null);
        fetchHistory();
        return;
      }

      // Tạo mới yêu cầu đánh giá -> Gọi POST
      const res = await fetch('/api/review-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ten_khach_hang: cleanTenKH,
          so_dien_thoai: soDienThoai.trim(),
          email: email.trim(),
          co_so: coSo.trim(),
          ma_hoa_don: maHoaDon.trim(),
          nguoi_tao: currentUser?.ho_ten || currentUser?.username || 'Nhân viên lễ tân',
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Có lỗi xảy ra');
      const record: YeuCauDanhGiaRecord = json.data;
      setCreatedRecord(record);
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://petmm.vn';
      const link = `${origin}/danhgiadichvu/${encodeURIComponent(record.ma_danh_gia)}`;
      setGeneratedLink(link);
      try {
        const qrUrl = await QRCode.toDataURL(link, { width: 280, margin: 2, color: { dark: '#111827', light: '#ffffff' } });
        setQrCodeDataUrl(qrUrl);
      } catch {}
      fetchHistory();
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể tạo/cập nhật mã đánh giá, vui lòng thử lại.');
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
    setEditingRecord(null);
    setCreatedRecord(null);
    setGeneratedLink('');
    setQrCodeDataUrl('');
    setTenKhachHang('');
    setSoDienThoai('');
    setEmail('');
    setMaHoaDon('');
    setErrorMessage('');
    setPhoneError('');
    setZaloSendStatus(null);
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

          {autoFillLoginNotice && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{autoFillLoginNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setAutoFillLoginNotice('')}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-bold px-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

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
                  className="w-full pl-10 pr-16 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-emerald-600 focus:outline-none transition shadow-xs"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                  {loginPassword && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(loginPassword);
                        setCopiedLoginPwd(true);
                        setTimeout(() => setCopiedLoginPwd(false), 2000);
                      }}
                      className="p-1 hover:text-emerald-700 transition rounded cursor-pointer"
                      title={copiedLoginPwd ? 'Đã sao chép mật khẩu!' : 'Sao chép mật khẩu'}
                    >
                      {copiedLoginPwd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((p) => !p)}
                    className="p-1 hover:text-slate-600 cursor-pointer"
                    title={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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
            <div className="flex items-center gap-2 cursor-default select-none pointer-events-none">
              <PetLogo size="sm" showSubline={false} />
            </div>
            <div className="hidden sm:block h-5 w-px bg-slate-200" />
            <span className="hidden sm:inline text-sm font-semibold text-emerald-700 select-none cursor-default">
              Hệ Thống Đánh Giá Dịch Vụ
            </span>
          </div>

          {/* User info & Navigation */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Đang trực tuyến" />
              <span className="text-xs font-bold text-slate-800">
                {(currentUser.ho_ten || currentUser.username).replace(/\s*\((Admin|User|Quản trị viên|Nhân viên)\)/gi, '').trim()}
              </span>
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

                <div className="space-y-2.5">
                  {/* Nút gửi Zalo OA (ZNS Template vừa tạo) */}
                  <button
                    type="button"
                    onClick={() => handleSendZaloOa(createdRecord)}
                    disabled={zaloSending}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0068FF] to-[#0055d4] hover:from-[#0055d4] hover:to-[#0047b3] text-white text-xs font-bold transition text-center flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    {zaloSending ? (
                      <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                    ) : (
                      <ZaloIcon className="w-4 h-4 rounded-xs shrink-0" />
                    )}
                    <span>{zaloSending ? 'Đang gửi qua Zalo OA...' : 'Gửi qua Zalo OA (Template ZNS)'}</span>
                  </button>

                  {/* Thông báo trạng thái gửi Zalo OA */}
                  {zaloSendStatus && (
                    <div className={`p-2.5 rounded-xl text-xs flex items-start gap-2 ${zaloSendStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      {zaloSendStatus.success ? <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
                      <span className="leading-tight">{zaloSendStatus.message}</span>
                    </div>
                  )}

                  {/* Hoặc mở Zalo cá nhân */}
                  <a
                    href={`https://zalo.me/${createdRecord.so_dien_thoai ? createdRecord.so_dien_thoai.replace(/\D/g, '') : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Hoặc mở Zalo cá nhân gửi tin nhắn (zalo.me)</span>
                  </a>

                  <div className="flex gap-2">
                    <a
                      href={generatedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition text-center flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Mở xem thử</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="flex-1 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition text-center flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Tạo tiếp</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`bg-white rounded-2xl border shadow-sm p-6 transition-all ${editingRecord ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200'}`}>
                {editingRecord ? (
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-100">
                    <div>
                      <h3 className="font-bold text-amber-950 text-base flex items-center gap-2">
                        <Pencil className="w-4 h-4 text-amber-600" /> Sửa Phiếu Đánh Giá
                      </h3>
                      <p className="text-xs text-amber-700/80 mt-0.5">
                        Mã phiếu: <span className="font-mono font-bold text-amber-900">#{editingRecord.ma_danh_gia}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                    >
                      Hủy sửa
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-bold text-slate-900 text-base mb-1">Thông Tin Khách Hàng</h3>
                    <p className="text-xs text-slate-500 mb-5">Nhập thông tin lượt thăm khám để tạo mã</p>
                  </>
                )}

                {errorMessage && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleCreateReview} className="space-y-4" autoComplete="off">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Tên khách hàng <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={tenKhachHang}
                        onChange={(e) => setTenKhachHang(e.target.value)}
                        className={inputCls}
                        required
                        autoComplete="off"
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
                        inputMode="numeric"
                        maxLength={10}
                        value={soDienThoai}
                        onChange={handlePhoneChange}
                        className={`${inputCls} ${phoneError ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
                        autoComplete="off"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                    {phoneError && (
                      <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1 animate-in fade-in duration-150">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{phoneError}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email khách hàng
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputCls}
                        autoComplete="off"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Cơ sở khám (Custom Web Dropdown của web, không dùng dropdown trình duyệt) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Cơ sở khám
                    </label>
                    <div className="relative" ref={branchDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                        className="w-full rounded-xl bg-white border border-slate-200 pl-10 pr-10 py-3 text-sm text-left focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm flex items-center justify-between cursor-pointer"
                      >
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <span className={coSo ? 'text-slate-800 font-medium truncate' : 'text-slate-400'}>
                          {coSo || '-- Chọn cơ sở / chi nhánh --'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 transition-transform duration-200 ${isBranchDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                      </button>

                      {isBranchDropdownOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setCoSo('');
                              setIsBranchDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                              !coSo ? 'text-emerald-700 bg-emerald-50/60 font-bold' : 'text-slate-500'
                            }`}
                          >
                            <span>-- Chọn cơ sở / chi nhánh --</span>
                            {!coSo && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                          </button>

                          {branches.map((b) => {
                            const isSelected = coSo === b.ten_chi_nhanh;
                            return (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => {
                                  setCoSo(b.ten_chi_nhanh);
                                  setIsBranchDropdownOpen(false);
                                }}
                                className={`w-full px-4 py-2.5 text-left text-xs flex items-center justify-between hover:bg-emerald-50 transition cursor-pointer ${
                                  isSelected ? 'text-[#2D5A27] bg-emerald-50 font-bold' : 'text-slate-700 font-medium'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate pr-2">
                                  <Building2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                                  <span className="truncate">{b.ten_chi_nhanh}</span>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
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
                        value={maHoaDon}
                        onChange={(e) => setMaHoaDon(e.target.value)}
                        className={inputCls}
                        autoComplete="off"
                      />
                      <Receipt className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {editingRecord ? (
                    <div className="flex gap-2.5 mt-2">
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-md shadow-amber-600/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Đang lưu cập nhật...</span>
                          </>
                        ) : (
                          <>
                            <Pencil className="w-4 h-4" />
                            <span>Lưu Cập Nhật Phiếu</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
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
                  )}
                </form>
              </div>
            )}
          </div>

          {/* RIGHT: History List */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base whitespace-nowrap">Lịch Sử Tạo Đánh Giá Gần Đây</h3>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                    {filteredHistoryList.length}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Ô tìm kiếm đa năng */}
                  <div className="relative flex-1 sm:w-56">
                    <input
                      type="text"
                      placeholder="Tìm kiếm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none transition shadow-2xs"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        title="Xóa tìm kiếm"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Nút Làm mới */}
                  <button
                    type="button"
                    onClick={() => fetchHistory()}
                    disabled={isLoadingHistory}
                    className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 transition cursor-pointer px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 shrink-0"
                    title="Làm mới danh sách"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Làm mới</span>
                  </button>
                </div>
              </div>

              {isLoadingHistory ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Đang tải lịch sử...
                </div>
              ) : historyList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">Chưa có lượt tạo đánh giá nào</div>
              ) : filteredHistoryList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Không tìm thấy kết quả nào khớp với &quot;{searchTerm}&quot;
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  {/* Mobile scroll hint */}
                  <div className="sm:hidden px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>← Vuốt ngang xem đầy đủ cột →</span>
                    <span className="font-semibold text-emerald-600">Cuộn dọc &amp; ngang</span>
                  </div>

                  <div className="max-h-[520px] overflow-y-auto overflow-x-auto">
                    <table className="w-full text-xs text-left whitespace-nowrap min-w-[650px]">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold sticky top-0 z-10 shadow-2xs">
                        <tr>
                          <th className="py-2.5 px-3.5">Khách hàng</th>
                          <th className="py-2.5 px-3 text-center">TT</th>
                          <th className="py-2.5 px-3 text-center">Thao tác</th>
                          <th className="py-2.5 px-3">User</th>
                          <th className="py-2.5 px-3.5">Cơ sở</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredHistoryList.map((item) => {
                          const origin = typeof window !== 'undefined' ? window.location.origin : 'https://petmm.vn';
                          const link = `${origin}/danhgiadichvu/${encodeURIComponent(item.ma_danh_gia)}`;
                          const d = item.ngay_tao ? new Date(item.ngay_tao) : new Date();
                          const pad = (n: number) => String(n).padStart(2, '0');
                          const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} - ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
                          const rawCreator = item.nguoi_tao || 'Nhân viên';
                          const creator = rawCreator.replace(/\s*\((Admin|User|Quản trị viên|Nhân viên)\)/gi, '').trim();

                          return (
                            <tr
                              key={item.id}
                              className={`transition ${
                                editingRecord?.id === item.id
                                  ? 'bg-amber-50/70 border-l-4 border-l-amber-500'
                                  : 'hover:bg-slate-50/70'
                              }`}
                            >
                              {/* 1. Khách hàng */}
                              <td className="py-3 px-3.5">
                                <div>
                                  <span className="font-bold text-slate-900 text-sm block">
                                    {item.ten_khach_hang}
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {item.so_dien_thoai ? (
                                      <span className="text-[11px] text-slate-500 font-mono">
                                        {item.so_dien_thoai}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 italic">Không có SĐT</span>
                                    )}
                                    {item.ma_hoa_don && item.ma_hoa_don !== item.ma_danh_gia && (
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        • HĐ: {item.ma_hoa_don}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* 2. TT: Chỉ để lại icon thôi */}
                              <td className="py-3 px-3 text-center">
                                {item.trang_thai === 'da_danh_gia' ? (
                                  <div
                                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs"
                                    title={`Đã gửi đánh giá ${item.so_sao ? `(${item.so_sao}★)` : ''} - Mã: ${item.ma_danh_gia}`}
                                  >
                                    <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
                                    {item.so_sao && <span className="text-amber-500 font-bold text-xs">{item.so_sao}★</span>}
                                  </div>
                                ) : (
                                  <div
                                    className="inline-flex items-center justify-center p-1.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 shadow-2xs"
                                    title={`Đang chờ khách gửi đánh giá - Mã: ${item.ma_danh_gia}`}
                                  >
                                    <Clock className="w-4 h-4 text-amber-600 shrink-0 stroke-[2.5]" />
                                  </div>
                                )}
                              </td>

                              {/* 3. Thao tác: Zalo OA (badge số/lỗi), Sửa (chỉ khi chờ), Mã QR, Mở link */}
                              <td className="py-3 px-3 text-center">
                                <div className="inline-flex items-center justify-center gap-1.5">
                                  {/* Nút gửi Zalo OA */}
                                  {item.so_dien_thoai && (
                                    <div className="relative inline-block">
                                      <button
                                        type="button"
                                        onClick={() => handleSendZaloOa(item)}
                                        disabled={zaloSending}
                                        className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0068FF] border border-blue-200 flex items-center justify-center transition shadow-2xs hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                                        title={`Gửi qua Zalo OA (ZNS)${item.so_lan_gui_zalo ? ` - Đã gửi ${item.so_lan_gui_zalo} lần` : ''}`}
                                      >
                                        <ZaloIcon className="w-4.5 h-4.5 rounded-xs" />
                                      </button>
                                      {/* Badge Zalo: Lỗi (!) hoặc số lần gửi (1, 2...) */}
                                      {item.trang_thai_zalo === 'that_bai' ? (
                                        <span
                                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xs ring-2 ring-white animate-pulse pointer-events-none"
                                          title="Lần gửi Zalo gần nhất bị lỗi"
                                        >
                                          !
                                        </span>
                                      ) : (item.so_lan_gui_zalo || 0) > 0 ? (
                                        <span
                                          className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ring-2 ring-white pointer-events-none"
                                          title={`Đã gửi Zalo thành công ${item.so_lan_gui_zalo} lần`}
                                        >
                                          {item.so_lan_gui_zalo}
                                        </span>
                                      ) : null}
                                    </div>
                                  )}

                                  {/* Nút Sửa: Chỉ hiển thị khi trạng thái chờ đánh giá, đã đánh giá thì ẩn */}
                                  {item.trang_thai === 'cho_danh_gia' && (
                                    <button
                                      type="button"
                                      onClick={() => handleStartEdit(item)}
                                      className={`w-8 h-8 rounded-lg border flex items-center justify-center transition shadow-2xs hover:scale-105 active:scale-95 cursor-pointer ${
                                        editingRecord?.id === item.id
                                          ? 'bg-amber-500 text-white border-amber-600'
                                          : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                                      }`}
                                      title="Chỉnh sửa thông tin phiếu đánh giá"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* Nút Xem QR */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenQrModal(item)}
                                    className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                                    title="Xem mã QR &amp; Sao chép link"
                                  >
                                    <QrCode className="w-4 h-4" />
                                  </button>

                                  {/* Nút Đi tới trang đánh giá */}
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center transition shadow-2xs hover:scale-105 active:scale-95"
                                    title="Đi tới link đánh giá"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </div>
                              </td>

                              {/* 4. User: Tên + thời gian */}
                              <td className="py-3 px-3 text-slate-700 text-xs">
                                <div>
                                  <span className="font-bold text-slate-900 block text-xs">
                                    {creator}
                                  </span>
                                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                    {timeStr}
                                  </div>
                                </div>
                              </td>

                              {/* 5. Cơ sở */}
                              <td className="py-3 px-3.5 text-slate-700">
                                <div className="flex items-center gap-1.5">
                                  <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span className="font-medium text-xs text-slate-800">{item.co_so || 'Chưa chọn'}</span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
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

      {/* MODAL HIỂN THỊ MÃ QR & SAO CHÉP LINK */}
      {qrModalData && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setQrModalData(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nút đóng */}
            <button
              type="button"
              onClick={() => setQrModalData(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Modal */}
            <div className="text-center mb-4 pr-6">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
                <QrCode className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Mã QR Đánh Giá</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Khách hàng: <span className="font-bold text-slate-800">{qrModalData.item.ten_khach_hang}</span>
              </p>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-200">
                  {qrModalData.item.ma_danh_gia}
                </span>
                {qrModalData.item.co_so && (
                  <span className="text-[11px] text-emerald-700 font-semibold truncate max-w-[160px]">
                    • {qrModalData.item.co_so}
                  </span>
                )}
              </div>
            </div>

            {/* Khung ảnh QR Code */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center mb-4">
              {qrModalData.qrDataUrl ? (
                <img
                  src={qrModalData.qrDataUrl}
                  alt="Mã QR đánh giá"
                  className="w-56 h-56 rounded-xl shadow-xs bg-white p-2.5"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <p className="text-[11px] text-slate-500 text-center mt-2.5 font-medium">
                Dùng camera điện thoại hoặc Zalo quét mã để mở đánh giá
              </p>
            </div>

            {/* Link & Nút sao chép */}
            <div className="space-y-2 mb-4">
              <label className="text-[11px] font-bold text-slate-700 block">Link đánh giá trực tiếp:</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  readOnly
                  value={qrModalData.link}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCopyQrModalLink(qrModalData.link)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                    qrModalCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  }`}
                  title="Sao chép link"
                >
                  {qrModalCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{qrModalCopied ? 'Đã chép' : 'Sao chép link'}</span>
                </button>
              </div>
            </div>

            {/* Các nút hành động */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={qrModalData.link}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Đi tới link</span>
              </a>
              <a
                href={qrModalData.qrDataUrl}
                download={`QR_${qrModalData.item.ma_danh_gia}.png`}
                className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải ảnh QR</span>
              </a>
            </div>
          </div>
        </div>
      )}

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
      {/* THÔNG BÁO NỔI CẢNH BÁO KHI GỬI ZALO THẤT BẠI */}
      <AdminNotificationFailureToast
        failure={failureNotification}
        playSound={true}
        onClose={() => setFailureNotification(null)}
      />
    </div>
  );
}
