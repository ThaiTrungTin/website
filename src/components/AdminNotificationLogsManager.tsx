'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Mail,
  PhoneCall,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Trash2,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import { NhatKyGuiTinRecord } from '@/lib/notificationLogger';
import { supabase } from '@/lib/supabase';

interface NotificationStats {
  email_thanh_cong: number;
  email_that_bai: number;
  zalo_thanh_cong: number;
  zalo_that_bai: number;
  tong_so: number;
}

export default function AdminNotificationLogsManager() {
  const [stats, setStats] = useState<NotificationStats>({
    email_thanh_cong: 0,
    email_that_bai: 0,
    zalo_thanh_cong: 0,
    zalo_that_bai: 0,
    tong_so: 0,
  });

  const [logs, setLogs] = useState<NhatKyGuiTinRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterKenh, setFilterKenh] = useState<string>('all');
  const [filterTrangThai, setFilterTrangThai] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedLogDetail, setSelectedLogDetail] = useState<NhatKyGuiTinRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '20',
        kenh: filterKenh,
        trang_thai: filterTrangThai,
        search: searchTerm,
      });

      const res = await fetch(`/api/admin/notification-logs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setLogs(data.logs || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Lỗi tải nhật ký thông báo:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, filterKenh, filterTrangThai, searchTerm]);

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel('admin_notification_logs_rt')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'nhat_ky_gui_tin' },
        () => {
          fetchLogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLogs]);

  const handleClearAll = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ nhật ký gửi tin và reset lại bộ đếm về 0 không?')) {
      return;
    }
    setIsDeleting(true);
    try {
      const res = await fetch('/api/admin/notification-logs?clearAll=true', {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchLogs();
      } else {
        alert(data.message || 'Không thể xóa');
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa nhật ký');
    } finally {
      setIsDeleting(false);
    }
  };

  const getPurposeLabel = (type: string) => {
    switch (type) {
      case 'dat_lich':
        return 'Đặt lịch khám';
      case 'danh_gia':
        return 'Đánh giá dịch vụ';
      case 'tuyen_dung':
        return 'Tuyển dụng & CV';
      case 'xac_thuc':
        return 'Mã OTP / Xác thực';
      case 'test':
        return 'Thử nghiệm hệ thống';
      default:
        return 'Thông báo chung';
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. CÁC THẺ BỘ ĐẾM THỐNG KÊ (STAT CARDS) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Email Thành công */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Email Thành Công
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {stats.email_thanh_cong.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Gửi tốt
            </span>
          </div>
          <div className="w-full bg-emerald-100 h-1 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${
                  stats.email_thanh_cong + stats.email_that_bai > 0
                    ? (stats.email_thanh_cong / (stats.email_thanh_cong + stats.email_that_bai)) * 100
                    : 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Email Thất bại */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-xs relative overflow-hidden group hover:border-rose-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">
              Email Thất Bại
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 font-mono">
              {stats.email_that_bai.toLocaleString('vi-VN')}
            </span>
            {stats.email_that_bai > 0 && (
              <span className="text-xs text-rose-600 font-medium flex items-center gap-0.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Cần kiểm tra
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Lỗi do SMTP hoặc sai địa chỉ hòm thư</p>
        </div>

        {/* Zalo OA Thành công */}
        <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs relative overflow-hidden group hover:border-blue-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
              Zalo OA Thành Công
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0068FF] flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {stats.zalo_thanh_cong.toLocaleString('vi-VN')}
            </span>
            <span className="text-xs text-[#0068FF] font-medium flex items-center gap-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> ZNS đã gửi
            </span>
          </div>
          <div className="w-full bg-blue-100 h-1 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#0068FF] h-full rounded-full transition-all duration-500"
              style={{
                width: `${
                  stats.zalo_thanh_cong + stats.zalo_that_bai > 0
                    ? (stats.zalo_thanh_cong / (stats.zalo_thanh_cong + stats.zalo_that_bai)) * 100
                    : 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Zalo OA Thất bại */}
        <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-xs relative overflow-hidden group hover:border-amber-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              Zalo OA Thất Bại
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 font-mono">
              {stats.zalo_that_bai.toLocaleString('vi-VN')}
            </span>
            {stats.zalo_that_bai > 0 && (
              <span className="text-xs text-amber-600 font-medium">Từ chối / Thiếu cấu hình</span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Mẫu chưa duyệt, thiếu token hoặc sai định dạng</p>
        </div>
      </div>

      {/* ── 2. BỘ LỌC VÀ TÌM KIẾM NHẬT KÝ ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Nhật Ký Gửi Tin Nhắn (Zalo OA &amp; Email)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi chi tiết từng thông báo được gửi đi, mã lỗi và thời gian thực hiện
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchLogs}
              disabled={isLoading}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Làm mới</span>
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              disabled={isDeleting || stats.tong_so === 0}
              className="px-3 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Xóa toàn bộ lịch sử và đưa bộ đếm về 0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa nhật ký</span>
            </button>
          </div>
        </div>

        {/* Filter controls */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Tìm theo SĐT, Email, Tên khách..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 text-slate-800"
            />
          </div>

          {/* Lọc Kênh */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {[
              { id: 'all', label: 'Tất cả kênh' },
              { id: 'email', label: '✉️ Email' },
              { id: 'zalo', label: '💬 Zalo OA' },
            ].map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => {
                  setFilterKenh(k.id);
                  setPage(1);
                }}
                className={`flex-1 py-1.5 text-center font-semibold rounded-lg transition cursor-pointer ${
                  filterKenh === k.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>

          {/* Lọc Trạng thái */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {[
              { id: 'all', label: 'Mọi trạng thái' },
              { id: 'thanh_cong', label: '🟢 Thành công' },
              { id: 'that_bai', label: '🔴 Thất bại' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setFilterTrangThai(s.id);
                  setPage(1);
                }}
                className={`flex-1 py-1.5 text-center font-semibold rounded-lg transition cursor-pointer ${
                  filterTrangThai === s.id
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── 3. BẢNG DỮ LIỆU NHẬT KÝ ── */}
        <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5">Kênh</th>
                  <th className="py-3 px-3.5">Mục đích</th>
                  <th className="py-3 px-3.5">Người nhận</th>
                  <th className="py-3 px-3.5">Trạng thái</th>
                  <th className="py-3 px-3.5">Lý do / Kết quả</th>
                  <th className="py-3 px-3.5 text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-400" />
                      Đang tải dữ liệu nhật ký...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Chưa có bản ghi nhật ký gửi tin nào phù hợp với bộ lọc
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const isZalo = log.kenh === 'zalo';
                    const isSuccess = log.trang_thai === 'thanh_cong';
                    const date = new Date(log.ngay_tao);
                    const timeFormatted = `${String(date.getHours()).padStart(2, '0')}:${String(
                      date.getMinutes()
                    ).padStart(2, '0')} · ${String(date.getDate()).padStart(2, '0')}/${String(
                      date.getMonth() + 1
                    ).padStart(2, '0')}/${date.getFullYear()}`;

                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLogDetail(log)}
                        className="hover:bg-slate-50/80 transition cursor-pointer"
                      >
                        {/* Kênh */}
                        <td className="py-3 px-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isZalo
                                ? 'bg-blue-50 text-[#0068FF] border border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isZalo ? <PhoneCall className="w-3 h-3" /> : <Mail className="w-3 h-3" />}
                            {isZalo ? 'Zalo OA' : 'Email'}
                          </span>
                        </td>

                        {/* Mục đích */}
                        <td className="py-3 px-3.5">
                          <span className="font-semibold text-slate-800">
                            {getPurposeLabel(log.loai_tin)}
                          </span>
                          {log.tieu_de && (
                            <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                              {log.tieu_de}
                            </p>
                          )}
                        </td>

                        {/* Người nhận */}
                        <td className="py-3 px-3.5">
                          <span className="font-mono text-slate-900 font-medium block">
                            {log.nguoi_nhan}
                          </span>
                          {log.ten_nguoi_nhan && (
                            <span className="text-[11px] text-slate-500">
                              {log.ten_nguoi_nhan}
                            </span>
                          )}
                        </td>

                        {/* Trạng thái */}
                        <td className="py-3 px-3.5">
                          {isSuccess ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Thành công
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 font-bold text-[11px]">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" /> Thất bại
                            </span>
                          )}
                        </td>

                        {/* Chi tiết lỗi / phản hồi */}
                        <td className="py-3 px-3.5 max-w-[250px]">
                          {isSuccess ? (
                            <span className="text-slate-400 text-[11px]">Đã chuyển giao tin</span>
                          ) : (
                            <span
                              className="text-rose-600 text-[11px] font-mono truncate block"
                              title={log.chi_tiet_loi || ''}
                            >
                              {log.chi_tiet_loi || log.ma_loi || 'Lỗi không xác định'}
                            </span>
                          )}
                        </td>

                        {/* Thời gian */}
                        <td className="py-3 px-3.5 text-right font-mono text-[11px] text-slate-500">
                          {timeFormatted}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          {totalPages > 1 && (
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
              <span>
                Tổng cộng <strong>{totalCount}</strong> thông báo
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span>
                  Trang {page} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. MODAL XEM CHI TIẾT 1 BẢN GHI NHẬT KÝ (GỌN GÀNG, THÂN THIỆN) ── */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <span className="font-bold text-slate-800 text-sm">
                Chi tiết tin nhắn
              </span>
              <button
                type="button"
                onClick={() => setSelectedLogDetail(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Nội dung */}
            <div className="p-5 space-y-4 text-xs">
              {/* Tóm tắt Người nhận & Trạng thái */}
              <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Kênh gửi</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                      selectedLogDetail.kenh === 'zalo'
                        ? 'bg-blue-100 text-[#0068FF]'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selectedLogDetail.kenh === 'zalo' ? 'Zalo OA (ZNS)' : 'Email'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Trạng thái</span>
                  <span
                    className={`font-bold text-[11px] flex items-center gap-1 ${
                      selectedLogDetail.trang_thai === 'thanh_cong'
                        ? 'text-emerald-700'
                        : 'text-rose-600'
                    }`}
                  >
                    {selectedLogDetail.trang_thai === 'thanh_cong' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Gửi thành công
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" /> Gửi thất bại
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500">Người nhận</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {selectedLogDetail.nguoi_nhan}
                    {selectedLogDetail.ten_nguoi_nhan ? ` (${selectedLogDetail.ten_nguoi_nhan})` : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Mục đích</span>
                  <span className="font-medium text-slate-800">
                    {getPurposeLabel(selectedLogDetail.loai_tin)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                  <span>Thời gian</span>
                  <span>{new Date(selectedLogDetail.ngay_tao).toLocaleString('vi-VN')}</span>
                </div>
              </div>

              {/* Hộp giải thích nguyên nhân lỗi (nếu thất bại) */}
              {selectedLogDetail.trang_thai === 'that_bai' && (
                <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 space-y-1">
                  <span className="text-rose-700 font-bold block text-[11px]">
                    Lý do không gửi được:
                  </span>
                  <p className="text-rose-900 text-xs font-medium leading-relaxed">
                    {selectedLogDetail.chi_tiet_loi?.toLowerCase().includes('phone number invalid')
                      ? 'Số điện thoại này không hợp lệ hoặc chưa đăng ký tài khoản Zalo.'
                      : selectedLogDetail.chi_tiet_loi?.toLowerCase().includes('schedule_time')
                      ? 'Mẫu tin Zalo đang bị thiếu thời gian hẹn.'
                      : selectedLogDetail.chi_tiet_loi || selectedLogDetail.ma_loi || 'Hệ thống từ chối chuyển tiếp tin nhắn.'}
                  </p>
                  {(selectedLogDetail.ma_loi || selectedLogDetail.chi_tiet_loi) && (
                    <span className="text-[10px] text-rose-500/80 font-mono block pt-0.5">
                      Mã lỗi: {selectedLogDetail.ma_loi ? `[${selectedLogDetail.ma_loi}] ` : ''}
                      {selectedLogDetail.chi_tiet_loi}
                    </span>
                  )}
                </div>
              )}

              {/* Dữ liệu nội dung gửi đi (trình bày danh sách dễ đọc) */}
              {selectedLogDetail.du_lieu_gui && typeof selectedLogDetail.du_lieu_gui === 'object' && (
                <div className="border border-slate-200 rounded-xl p-3 space-y-1.5">
                  <span className="text-slate-700 font-bold block text-[11px]">
                    Nội dung thông tin gửi:
                  </span>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                    {Object.entries(selectedLogDetail.du_lieu_gui).map(([k, v]) => (
                      <div key={k} className="truncate">
                        <span className="text-slate-400 capitalize">{k.replace(/_/g, ' ')}: </span>
                        <strong className="text-slate-800">{String(v || '—')}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Nút đóng gọn gàng */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedLogDetail(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
