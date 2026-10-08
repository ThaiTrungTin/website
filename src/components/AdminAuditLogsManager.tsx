'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
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
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [distinctUsers, setDistinctUsers] = useState<string[]>([]);

  // Bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');

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

  // Gọi fetchLogs khi các điều kiện thay đổi
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Đăng ký Supabase Realtime để nhận bản ghi mới ngay tức thì
  useEffect(() => {
    const channel = supabase
      .channel('realtime_nhat_ky_hoat_dong')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'nhat_ky_hoat_dong' },
        (payload) => {
          const newRecord = payload.new as AuditLogRecord;
          if (newRecord && page === 1 && selectedDateRange === 'all') {
            setLogs((prev) => [newRecord, ...prev.slice(0, 24)]);
            setTotalCount((c) => c + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [page, selectedDateRange]);

  // Xóa bộ lọc về mặc định
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedUser('all');
    setSelectedCategory('all');
    setSelectedAction('all');
    setSelectedDateRange('all');
    setPage(1);
  };

  // Định dạng ngày giờ
  const formatDateTime = (isoString?: string) => {
    if (!isoString) return { date: '—', time: '—' };
    try {
      const d = new Date(isoString);
      const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      return { date, time };
    } catch {
      return { date: isoString, time: '' };
    }
  };

  // Nhãn hành động (không màu nền, không icon)
  const getActionLabel = (action: string) => {
    switch (action?.toUpperCase()) {
      case 'THEM':
        return 'Thêm mới';
      case 'SUA':
        return 'Chỉnh sửa';
      case 'XOA':
        return 'Xóa bỏ';
      case 'XU_LY':
        return 'Xử lý đơn';
      case 'GUI_TIN':
        return 'Gửi Zalo';
      case 'GUI_EMAIL':
        return 'Gửi Email';
      case 'XAC_NHAN':
        return 'Xác nhận lịch';
      case 'CAU_HINH':
        return 'Cài đặt';
      case 'DANG_NHAP':
        return 'Đăng nhập';
      default:
        return action || 'Thao tác';
    }
  };

  return (
    <div className="space-y-4">
      {/* KHỐI CỐ ĐỊNH: BỘ LỌC VÀ CÔNG CỤ */}
      <div className="sticky top-[56px] sm:top-[61px] z-20 bg-[#F8FAFC]/95 backdrop-blur-md pt-1 pb-2 space-y-3 -mt-2">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
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

            {/* Lọc theo Phân hệ */}
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

          {/* Lọc theo thời gian & Nút làm mới */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] font-semibold text-slate-500 mr-1">
                Thời gian:
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

            <div className="flex items-center gap-2.5">
              <span className="text-[11px] text-slate-400">
                (Tự động xóa nhật ký sau 30 ngày)
              </span>

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

              <button
                type="button"
                onClick={fetchLogs}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#2D5A27]' : ''}`} />
                <span>Làm mới</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BẢNG DANH SÁCH NHẬT KÝ */}
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
          <div className="overflow-x-auto max-h-[calc(100vh-220px)] min-h-[350px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 z-10 bg-slate-50 shadow-2xs">
                <tr className="bg-slate-50 border-b border-slate-200/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="sticky top-0 bg-slate-50 py-3 px-4 w-40 z-10 shadow-2xs">Thời gian</th>
                  <th className="sticky top-0 bg-slate-50 py-3 px-4 w-48 z-10 shadow-2xs">Người thực hiện</th>
                  <th className="sticky top-0 bg-slate-50 py-3 px-4 w-32 z-10 shadow-2xs">Hành động</th>
                  <th className="sticky top-0 bg-slate-50 py-3 px-4 w-36 z-10 shadow-2xs">Phân hệ</th>
                  <th className="sticky top-0 bg-slate-50 py-3 px-4 z-10 shadow-2xs">Nội dung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((item) => {
                  const { date, time } = formatDateTime(item.ngay_tao);
                  const actionLabel = getActionLabel(item.hanh_dong);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition"
                    >
                      {/* Thời gian */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-900 font-semibold">{time}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{date}</div>
                      </td>

                      {/* Người thực hiện */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 truncate">{item.nguoi_thuc_hien}</div>
                        <div className="text-[11px] text-slate-500 uppercase mt-0.5">
                          {item.vai_tro || 'admin'}
                        </div>
                      </td>

                      {/* Hành động */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {actionLabel}
                        </span>
                      </td>

                      {/* Phân hệ */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-slate-700 font-medium">{item.chuyen_muc}</span>
                      </td>

                      {/* Nội dung */}
                      <td className="py-3 px-4">
                        <div className="text-slate-800 font-medium leading-relaxed">
                          {item.chi_tiet}
                        </div>
                        {item.ip_address && (
                          <div className="mt-0.5 text-[11px] text-slate-500">
                            IP: {item.ip_address}
                          </div>
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
    </div>
  );
}
