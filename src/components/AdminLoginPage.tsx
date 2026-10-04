'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  Mail,
  CheckCircle2,
  RefreshCw,
  Hash,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import PetLogo from './PetLogo';
import { supabase } from '@/lib/supabase';

interface AdminLoginPageProps {
  onLoginSuccess: (user: { username: string; ho_ten: string; vai_tro: string; email?: string }) => void;
}

export default function AdminLoginPage({ onLoginSuccess }: AdminLoginPageProps) {
  // Chế độ giao diện: 'login' | 'forgot' | 'otp_reset' | 'reset_link'
  const [viewMode, setViewMode] = useState<'login' | 'forgot' | 'otp_reset' | 'reset_link'>('login');

  // Form đăng nhập
  const [username, setUsername] = useState('thaitrtin@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form quên mật khẩu (Nhận mã OTP)
  const [forgotEmail, setForgotEmail] = useState('thaitrtin@gmail.com');
  const [isForgotLoading, setIsForgotLoading] = useState(false);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState('');

  // Form nhập mã OTP 6 số và mật khẩu mới
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isOtpResetLoading, setIsOtpResetLoading] = useState(false);
  const [otpResetSuccessMessage, setOtpResetSuccessMessage] = useState('');
  const [copiedPwd, setCopiedPwd] = useState(false);
  const [autoFillNotice, setAutoFillNotice] = useState('');

  // Tự động phát hiện nếu người dùng nhấp vào link từ email
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      if (hash.includes('type=recovery') || search.includes('reset=true')) {
        setViewMode('reset_link');
      }

      // Tự động điền email & mật khẩu từ link khởi tạo gửi qua email
      try {
        const params = new URLSearchParams(window.location.search);
        const emailParam = params.get('email');
        const pwdParam = params.get('pwd');
        if (emailParam) {
          setUsername(decodeURIComponent(emailParam));
        }
        if (pwdParam) {
          const decodedPwd = decodeURIComponent(pwdParam);
          setPassword(decodedPwd);
          try {
            navigator.clipboard.writeText(decodedPwd).catch(() => {});
          } catch (_) {}
          setAutoFillNotice('Đã tự động điền tài khoản và sao chép mật khẩu vào bộ nhớ tạm!');
        }
      } catch (_) {}
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setViewMode('reset_link');
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // XỬ LÝ ĐĂNG NHẬP
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMessage('Vui lòng điền đầy đủ tên đăng nhập và mật khẩu!');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Tên đăng nhập hoặc mật khẩu không chính xác!');
        return;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('petmm_admin_user', JSON.stringify(data.user));
      }

      // Tài khoản User (chỉ tạo đánh giá) tuyệt đối không được vào trang Admin -> chuyển ngay sang /taodanhgia
      if (data.user?.vai_tro === 'user' || data.redirectUrl === '/taodanhgia') {
        if (typeof window !== 'undefined') {
          window.location.replace('/taodanhgia');
        }
        return;
      }

      onLoginSuccess(data.user);
    } catch {
      setErrorMessage('Không thể kết nối máy chủ xác thực. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  // XỬ LÝ GỬI MÃ OTP VỀ EMAIL
  const handleSendOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email quản trị!');
      return;
    }

    setIsForgotLoading(true);
    setErrorMessage('');
    setForgotSuccessMessage('');

    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Không thể tạo mã xác thực. Vui lòng thử lại.');
        return;
      }

      setForgotSuccessMessage(data.message || `Đã gửi mã xác thực về hòm thư ${forgotEmail}! Vui lòng kiểm tra Gmail.`);
      setOtpCodeInput('');

      // Tự động chuyển qua màn hình nhập mã OTP sau 1.2 giây
      setTimeout(() => {
        setViewMode('otp_reset');
      }, 1200);
    } catch {
      setErrorMessage('Lỗi kết nối khi gửi yêu cầu mã xác thực.');
    } finally {
      setIsForgotLoading(false);
    }
  };

  // XỬ LÝ XÁC THỰC MÃ OTP VÀ ĐỔI MẬT KHẨU
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCodeInput.trim()) {
      setErrorMessage('Vui lòng nhập mã xác thực OTP 6 số!');
      return;
    }

    if (!newPassword || !confirmNewPassword) {
      setErrorMessage('Vui lòng nhập mật khẩu mới và xác nhận mật khẩu!');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Mật khẩu mới phải có ít nhất 6 ký tự theo tiêu chuẩn Supabase!');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Mật khẩu mới và xác nhận mật khẩu không trùng khớp!');
      return;
    }

    setIsOtpResetLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/admin/verify-otp-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otpCode: otpCodeInput.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn!');
        return;
      }

      setOtpResetSuccessMessage('Đổi mật khẩu thành công! Đang tự động đăng nhập...');

      if (typeof window !== 'undefined') {
        localStorage.setItem('petmm_admin_user', JSON.stringify(data.user));
      }

      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 1200);
    } catch {
      setErrorMessage('Lỗi kết nối máy chủ xác thực OTP.');
    } finally {
      setIsOtpResetLoading(false);
    }
  };

  // XỬ LÝ ĐẶT LẠI MẬT KHẨU TỪ LINK CŨ (NẾU CÓ)
  const handleResetLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword) {
      setErrorMessage('Vui lòng nhập đầy đủ mật khẩu mới và xác nhận mật khẩu!');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Mật khẩu mới phải có ít nhất 6 ký tự theo tiêu chuẩn bảo mật Supabase!');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Mật khẩu mới và xác nhận mật khẩu không trùng khớp nhau!');
      return;
    }

    setIsOtpResetLoading(true);
    setErrorMessage('');

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setOtpResetSuccessMessage('Đã đặt lại mật khẩu mới thành công! Đang chuyển hướng...');

      const user = {
        username: data.user?.email?.split('@')[0] || 'admin',
        ho_ten: data.user?.user_metadata?.ho_ten || 'Thái Trung Tín (Admin)',
        vai_tro: data.user?.user_metadata?.vai_tro || 'super_admin',
        email: data.user?.email,
      };

      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('petmm_admin_user', JSON.stringify(user));
        }
        onLoginSuccess(user);
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Không thể cập nhật mật khẩu mới. Vui lòng thử lại!');
    } finally {
      setIsOtpResetLoading(false);
    }
  };

  // Điền nhanh thông tin thử nghiệm
  const handleFillDemo = () => {
    setUsername('thaitrtin@gmail.com');
    setPassword('admin123');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B150A] via-[#122310] to-[#0A1608] flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2D5A27]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#FFB800]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl border border-white/40 shadow-2xl p-7 sm:p-9 text-slate-800 animate-slogan-desc">
        {/* Header Logo & Crest */}
        <div className="text-center mb-6">
          <div className="inline-flex justify-center mb-3">
            <PetLogo size="default" showSubline={false} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D5A27]/10 text-[#2D5A27] text-xs font-bold border border-[#2D5A27]/20 mt-1 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2D5A27]" />
            <span>Cổng Quản Trị Hệ Thống</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold font-editorial text-slate-900">
            {viewMode === 'login' && 'Đăng Nhập Quản Trị Viên'}
            {viewMode === 'forgot' && 'Khôi Phục Mật Khẩu (Mã OTP)'}
            {viewMode === 'otp_reset' && 'Nhập Mã OTP & Đổi Mật Khẩu'}
            {viewMode === 'reset_link' && 'Thiết Lập Mật Khẩu Mới'}
          </h1>
          {viewMode !== 'login' && (
            <p className="text-xs text-slate-500 mt-1">
              {viewMode === 'forgot' && 'Nhận mã OTP 6 số tiện lợi về Gmail để đổi mật khẩu ngay.'}
              {viewMode === 'otp_reset' && 'Nhập mã xác thực 6 số và thiết lập mật khẩu mới cho tài khoản.'}
              {viewMode === 'reset_link' && 'Nhập mật khẩu mới cho tài khoản quản trị của bạn.'}
            </p>
          )}
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span className="font-semibold leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Auto-fill Alert */}
        {autoFillNotice && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2.5 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{autoFillNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setAutoFillNotice('')}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold px-1.5 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Success Alert */}
        {forgotSuccessMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{forgotSuccessMessage}</span>
          </div>
        )}

        {otpResetSuccessMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{otpResetSuccessMessage}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 1: ĐĂNG NHẬP (LOGIN) */}
        {/* ========================================================= */}
        {viewMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>Tên đăng nhập hoặc Email quản trị: *</span>
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-3 rounded-xl border border-slate-300 text-slate-900 bg-white focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 focus:outline-none transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>Mật khẩu: *</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setForgotSuccessMessage('');
                    setViewMode('forgot');
                  }}
                  className="text-[11px] font-bold text-[#2D5A27] hover:underline cursor-pointer"
                >
                  Quên mật khẩu? (Nhận mã OTP)
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-3 pr-16 rounded-xl border border-slate-300 text-slate-900 bg-white focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 focus:outline-none transition"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                  {password && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(password);
                        setCopiedPwd(true);
                        setTimeout(() => setCopiedPwd(false), 2000);
                      }}
                      className="p-1 hover:text-[#2D5A27] transition rounded cursor-pointer"
                      title={copiedPwd ? 'Đã sao chép mật khẩu!' : 'Sao chép mật khẩu'}
                    >
                      {copiedPwd ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:text-slate-700 cursor-pointer"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#2D5A27] to-[#1E4D1A] hover:from-[#234A1E] hover:to-[#173F14] text-white text-xs font-bold shadow-lg shadow-[#2D5A27]/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang xác thực Supabase...</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập Quản Trị</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: GỬI MÃ XÁC THỰC OTP */}
        {/* ========================================================= */}
        {viewMode === 'forgot' && (
          <form onSubmit={handleSendOtpSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>Email quản trị nhận mã OTP: *</span>
              </label>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-3 rounded-xl border border-slate-300 text-slate-900 bg-white focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isForgotLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#2D5A27] hover:bg-[#234A1E] text-white text-xs font-bold shadow-md shadow-[#2D5A27]/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {isForgotLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang tạo mã OTP...</span>
                </>
              ) : (
                <>
                  <Hash className="w-4 h-4" />
                  <span>Lấy Mã Xác Thực OTP (6 Số)</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setViewMode('otp_reset');
                }}
                className="text-[11px] font-bold text-[#2D5A27] hover:underline cursor-pointer"
              >
                Đã có mã OTP? Nhập mã ngay ➔
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setForgotSuccessMessage('');
                  setViewMode('login');
                }}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Quay lại đăng nhập</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: NHẬP MÃ OTP VÀ THIẾT LẬP MẬT KHẨU MỚI */}
        {/* ========================================================= */}
        {viewMode === 'otp_reset' && (
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
            {/* Ô nhập mã OTP 6 số */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>Mã xác thực OTP (6 chữ số): *</span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCodeInput}
                onChange={(e) => setOtpCodeInput(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-lg font-extrabold tracking-widest px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 focus:outline-none transition"
              />
              <p className="text-[10px] text-slate-500 mt-1 text-center">
                Mã xác thực có hiệu lực trong 15 phút.
              </p>
            </div>

            {/* Mật khẩu mới */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>Mật khẩu mới (Tối thiểu 6 ký tự): *</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-slate-900 bg-white focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>Xác nhận mật khẩu mới: *</span>
              </label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 bg-white focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isOtpResetLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#2D5A27] hover:bg-[#234A1E] text-white text-xs font-bold shadow-md shadow-[#2D5A27]/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {isOtpResetLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực mã OTP...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác Nhận &amp; Đổi Mật Khẩu</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setViewMode('forgot');
                }}
                className="text-[11px] font-bold text-[#2D5A27] hover:underline cursor-pointer"
              >
                Gửi lại mã OTP
              </button>

              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setForgotSuccessMessage('');
                  setViewMode('login');
                }}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Quay lại đăng nhập</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: THIẾT LẬP TỪ LINK EMAIL CŨ */}
        {/* ========================================================= */}
        {viewMode === 'reset_link' && (
          <form onSubmit={handleResetLinkSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>Mật khẩu mới (Tối thiểu 6 ký tự): *</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-3 pr-10 rounded-xl border border-slate-300 text-slate-900 bg-white focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 focus:outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#2D5A27]" />
                <span>Xác nhận lại mật khẩu mới: *</span>
              </label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full text-xs font-semibold px-3.5 py-3 rounded-xl border border-slate-300 text-slate-900 bg-white focus:border-[#2D5A27] focus:ring-2 focus:ring-[#2D5A27]/20 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isOtpResetLoading}
              className="w-full py-3 px-4 rounded-xl bg-[#2D5A27] hover:bg-[#234A1E] text-white text-xs font-bold shadow-md shadow-[#2D5A27]/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              {isOtpResetLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang lưu mật khẩu...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lưu Mật Khẩu &amp; Vào Quản Trị</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Back to Home Link */}
        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#2D5A27] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại trang chủ PetM&amp;M</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
