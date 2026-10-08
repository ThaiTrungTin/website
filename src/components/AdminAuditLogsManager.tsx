'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Activity,
  Search,
  Filter,
  Calendar,
  RefreshCw,
  User,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  Settings,
  KeyRound,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Clock,
  Laptop,
  Layers,
  Eye,
  X,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AuditLogRecord } from '@/lib/auditLogger';

interface AdminAuditLogsManagerProps {
  currentUser?: { username: string; ho_ten: string; vai_tro: string } | null;
  showNotification?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export default function AdminAuditLogsManager({
  currentUser,
  showNotification,
}: AdminAuditLogsManagerProps) {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [distinctUsers, setDistinctUsers] = useState<string[]>([]);

  // Bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');

  // Modal xem chi tiết JSON
  const [selectedLogDetail, setSelectedLogDetail] = useState<AuditLogRecord | null>(null);

  // Tải dữ liệu nhật ký
  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '25',
        search: searchTerm,
        user: selectedUser,
        category: selectedCategory,
        action: selectedAction,
        date_range: selectedDateRange,
      });

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setLogs(data.logs || []);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);
        if (data.stats) setStats(data.stats);
        if (data.distinctUsers) setDistinctUsers(data.distinctUsers);
      } else {
        if (showNotification) {
          showNotification('error', data.message || 'Không thể tải nhật ký hoạt động');
        }
      }
    } catch (err: any) {
      console.error('Lỗi fetchLogs:', err);
      if (showNotification) {
        showNotification('error', 'Không thể kết nối đến máy chủ lấy nhật ký hoạt động');
      }
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm, selectedUser, selectedCategory, selectedAction, selectedDateRange, showNotification]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Lắng nghe thay đổi thời gian thực qua Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel('nhat_ky_hoat_dong_live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'nhat_ky_hoat_dong' },
        (payload) => {
          if (payload.new) {
            setLogs((prev) => [payload.new as AuditLogRecord, ...prev.slice(0, 24)]);
            setTotalCount((c) => c + 1);
            setStats((s) => ({ ...s, total: s.total + 1, today: s.today + 1 }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Xóa bộ lọc
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedUser('all');
    setSelectedCategory('all');
    setSelectedAction('all');
    setSelectedDateRange('all');
    setPage(1);
  };

  // Định dạng ngày giờ
  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return {
        date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
    } catch {
      return { date: isoString, time: '' };
    }
  };

  // Badge hành động
  const getActionBadge = (action: string) => {
    switch (action) {
      case 'THEM':
        return {
          label: 'Thêm mới',
          icon: Plus,
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'SUA':
        return {
          label: 'Chỉnh sửa',
          icon: Edit3,
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'XOA':
        return {
          label: 'Xóa bỏ',
          icon: Trash2,
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'XU_LY':
        return {
          label: 'Xử lý đơn',
          icon: CheckCircle2,
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'CAU_HINH':
        return {
          label: 'Cài đặt',
          icon: Settings,
          bg: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'DANG_NHAP':
        return {
          label: 'Đăng nhập',
          icon: KeyRound,
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        };
      default:
        return {
          label: action,
          icon: Activity,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Thống kê */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Nhật Ký Hoạt Động (Audit Logs)</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Theo dõi &amp; kiểm soát toàn bộ thao tác vận hành của các tài khoản Quản trị theo thời gian thực
              </p>
            </div>
          </div>
        </div>

        {/* Nút làm mới */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLogs}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#2D5A27]' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* 2. Thẻ số liệu thống kê */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Tổng hoạt động</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{stats.total.toLocaleString('vi-VN')}</div>
          <span className="text-[11px] text-slate-400">Ghi nhận toàn hệ thống</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Hôm nay</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-600">{stats.today.toLocaleString('vi-VN')}</div>
          <span className="text-[11px] text-slate-400">Thao tác trong ngày</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Nhân sự thao tác</span>
            <User className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-blue-600">{distinctUsers.length}</div>
          <span className="text-[11px] text-slate-400">Tài khoản ghi nhận gần đây</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Trạng thái bảo mật</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-2 text-sm font-bold text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Tự động 24/7</span>
          </div>
          <span className="text-[11px] text-slate-400">Lưu độc lập vào CSDL</span>
        </div>
      </div>

      {/* 3. Thanh tìm kiếm và bộ lọc */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Ô tìm kiếm */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên nhân viên, nội dung..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#2D5A27] transition bg-slate-50/50"
            />
          </div>

          {/* Lọc theo Nhân viên */}
          <div>
            <select
              value={selectedUser}
              onChange={(e) => {
                setSelectedUser(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#2D5A27] transition bg-slate-50/50 text-slate-700"
            >
              <option value="all">Tất cả nhân viên</option>
              {distinctUsers.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Lọc theo Chuyên mục */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#2D5A27] transition bg-slate-50/50 text-slate-700"
            >
              <option value="all">Tất cả phân hệ</option>
              <option value="Lịch hẹn">Lịch hẹn</option>
              <option value="Chi nhánh">Chi nhánh</option>
              <option value="Dịch vụ">Dịch vụ</option>
              <option value="Cấu hình">Cấu hình hệ thống</option>
              <option value="Đánh giá">Đánh giá</option>
              <option value="Tuyển dụng">Tuyển dụng &amp; Ứng viên</option>
              <option value="Cẩm nang">Cẩm nang</option>
              <option value="Hỏi đáp">Hỏi đáp FAQ</option>
              <option value="Đội ngũ">Đội ngũ bác sĩ</option>
              <option value="Tài khoản">Tài khoản &amp; Nhân sự</option>
            </select>
          </div>

          {/* Lọc theo Hành động */}
          <div>
            <select
              value={selectedAction}
              onChange={(e) => {
                setSelectedAction(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#2D5A27] transition bg-slate-50/50 text-slate-700"
            >
              <option value="all">Tất cả hành động</option>
              <option value="THEM">Thêm mới</option>
              <option value="SUA">Chỉnh sửa</option>
              <option value="XOA">Xóa bỏ</option>
              <option value="XU_LY">Xử lý đơn</option>
              <option value="CAU_HINH">Cài đặt cấu hình</option>
              <option value="DANG_NHAP">Đăng nhập</option>
            </select>
          </div>
        </div>

        {/* Lọc theo thời gian & Nút đặt lại */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mr-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Thời gian:</span>
            </span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'today', label: 'Hôm nay' },
              { id: '7d', label: '7 ngày qua' },
              { id: '30d', label: '30 ngày qua' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => {
                  setSelectedDateRange(btn.id);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  selectedDateRange === btn.id
                    ? 'bg-[#2D5A27] text-white shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {(searchTerm || selectedUser !== 'all' || selectedCategory !== 'all' || selectedAction !== 'all' || selectedDateRange !== 'all') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa bộ lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Bảng danh sách nhật ký */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading && logs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-[#2D5A27] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500">Đang tải nhật ký hoạt động...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">Không có hoạt động nào</h4>
            <p className="text-xs text-slate-500 mt-1">Không tìm thấy bản ghi phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 w-44">Thời gian</th>
                  <th className="py-3 px-4 w-52">Người thực hiện</th>
                  <th className="py-3 px-4 w-32">Hành động</th>
                  <th className="py-3 px-4 w-36">Phân hệ</th>
                  <th className="py-3 px-4">Nội dung chi tiết</th>
                  <th className="py-3 px-4 w-28 text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((item) => {
                  const { date, time } = formatDateTime(item.ngay_tao);
                  const badge = getActionBadge(item.hanh_dong);
                  const BadgeIcon = badge.icon;
                  const initial = (item.nguoi_thuc_hien || 'A').charAt(0).toUpperCase();

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition group"
                    >
                      {/* Thời gian */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{time}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 ml-5">{date}</div>
                      </td>

                      {/* Người thực hiện */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#2D5A27] font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">{item.nguoi_thuc_hien}</div>
                            <span className="inline-block text-[10px] font-semibold text-slate-500 uppercase">
                              {item.vai_tro || 'admin'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Hành động */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bg}`}
                        >
                          <BadgeIcon className="w-3 h-3" />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Phân hệ */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/60">
                          <Layers className="w-3 h-3 text-slate-400" />
                          <span>{item.chuyen_muc}</span>
                        </span>
                      </td>

                      {/* Chi tiết */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium leading-relaxed max-w-xl">
                          {item.chi_tiet}
                        </div>
                        {item.ip_address && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                            <Laptop className="w-3 h-3" />
                            <span>IP: {item.ip_address}</span>
                          </div>
                        )}
                      </td>

                      {/* Xem chi tiết JSON nếu có */}
                      <td className="py-3 px-4 text-center">
                        {item.du_lieu_thay_doi ? (
                          <button
                            type="button"
                            onClick={() => setSelectedLogDetail(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#2D5A27] font-semibold text-[11px] transition cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Xem data</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Phân trang */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-600">
          <div>
            Hiển thị <strong>{logs.length}</strong> / <strong>{totalCount}</strong> hoạt động (Trang{' '}
            <strong>{page}</strong> / <strong>{totalPages}</strong>)
          </div>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button
              type="button"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-bold text-slate-800">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Modal xem chi tiết thay đổi (JSON Viewer) */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#2D5A27]" />
                <h3 className="font-bold text-slate-900 text-sm">Chi Tiết Dữ Liệu Thay Đổi</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLogDetail(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Hành động:</span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">{selectedLogDetail.chi_tiet}</p>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Dữ liệu thô (JSON):</span>
                <pre className="mt-1 p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-60 leading-relaxed">
                  {JSON.stringify(selectedLogDetail.du_lieu_thay_doi, null, 2)}
                </pre>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLogDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2D5A27] text-white hover:bg-[#23481e] transition cursor-pointer"
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
