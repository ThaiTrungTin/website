'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Search,
  RotateCcw,
  Sparkles,
  Check,
  X,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Users,
  Eye,
  EyeOff,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { supabase, TuyenDungRecord } from '@/lib/supabase';
import AdminImageInput from '@/components/AdminImageInput';
import { VietnamFlag, UKFlag } from '@/components/FlagIcons';

interface Props {
  showNotification?: (type: 'success' | 'error', message: string) => void;
}

function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminCareersManager({ showNotification }: Props) {
  const [jobs, setJobs] = useState<TuyenDungRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');

  // Modal State
  const [editingJob, setEditingJob] = useState<Partial<TuyenDungRecord> | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [modalTab, setModalTab] = useState<'vi' | 'en'>('vi');
  const [isTranslating, setIsTranslating] = useState(false);

  const notify = (type: 'success' | 'error', msg: string) => {
    if (showNotification) {
      showNotification(type, msg);
    } else {
      alert(msg);
    }
  };

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tuyen_dung')
        .select('*')
        .order('thu_tu', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs((data as TuyenDungRecord[]) || []);
    } catch (err: any) {
      console.error('Lỗi tải danh sách tuyển dụng:', err);
      notify('error', `Lỗi tải tuyển dụng: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();

    const channel = supabase
      .channel('admin_careers_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tuyen_dung' },
        () => {
          loadJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadJobs]);

  const handleAddNewJob = () => {
    const nextOrder = jobs.length > 0 ? Math.max(...jobs.map((j) => j.thu_tu || 0)) + 1 : 1;
    setModalTab('vi');
    setEditingJob({
      id: '',
      tieu_de: '',
      tieu_de_en: '',
      phong_ban: 'Y Khoa & Điều Trị',
      phong_ban_en: 'Medical & Clinical Care',
      dia_diem: 'Trụ sở TP. Thủ Đức, TP. Hồ Chí Minh',
      dia_diem_en: 'Thu Duc City Headquarters, Ho Chi Minh City',
      hinh_thuc: 'Toàn thời gian',
      hinh_thuc_en: 'Full-time',
      muc_luong: 'Thỏa thuận theo năng lực',
      muc_luong_en: 'Negotiable based on experience',
      kinh_nghiem: '1 - 2 năm kinh nghiệm',
      kinh_nghiem_en: '1 - 2 years experience',
      so_luong: 1,
      han_nop: '30/11/2026',
      mo_ta: '',
      mo_ta_en: '',
      yeu_cau: '',
      yeu_cau_en: '',
      quyen_loi: '',
      quyen_loi_en: '',
      hinh_anh: '/about_hospital.jpg',
      thu_tu: nextOrder,
      kich_hoat: true,
    });
    setIsCreatingNew(true);
  };

  const handleEditJob = (job: TuyenDungRecord) => {
    setModalTab('vi');
    setEditingJob({ ...job });
    setIsCreatingNew(false);
  };

  const handleToggleJobActive = async (job: TuyenDungRecord) => {
    const newStatus = !job.kich_hoat;
    try {
      const { error } = await supabase
        .from('tuyen_dung')
        .update({ kich_hoat: newStatus, updated_at: new Date().toISOString() })
        .eq('id', job.id);

      if (error) throw error;
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, kich_hoat: newStatus } : j)));
      notify('success', `Đã ${newStatus ? 'kích hoạt' : 'tạm ẩn'} vị trí tuyển dụng`);
    } catch (err: any) {
      notify('error', `Lỗi cập nhật: ${err.message}`);
    }
  };

  const handleDeleteJob = async (job: TuyenDungRecord) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vị trí tuyển dụng "${job.tieu_de}" không?`)) return;

    try {
      const { error } = await supabase.from('tuyen_dung').delete().eq('id', job.id);
      if (error) throw error;
      notify('success', 'Đã xóa vị trí tuyển dụng thành công!');
      setJobs((prev) => prev.filter((j) => j.id !== job.id));
      if (editingJob?.id === job.id) setEditingJob(null);
    } catch (err: any) {
      notify('error', `Lỗi xóa: ${err.message}`);
    }
  };

  const handleTranslateJob = async () => {
    if (!editingJob) return;
    if (!editingJob.tieu_de && !editingJob.mo_ta && !editingJob.yeu_cau && !editingJob.quyen_loi) {
      notify('error', 'Chưa có nội dung tiếng Việt để dịch');
      return;
    }

    setIsTranslating(true);
    try {
      const textsToTranslate = {
        tieu_de: editingJob.tieu_de || '',
        phong_ban: editingJob.phong_ban || '',
        dia_diem: editingJob.dia_diem || '',
        hinh_thuc: editingJob.hinh_thuc || '',
        muc_luong: editingJob.muc_luong || '',
        kinh_nghiem: editingJob.kinh_nghiem || '',
        mo_ta: editingJob.mo_ta || '',
        yeu_cau: editingJob.yeu_cau || '',
        quyen_loi: editingJob.quyen_loi || '',
      };

      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: textsToTranslate, context: 'veterinary job vacancy and recruitment' }),
      });

      if (!res.ok) throw new Error('API dịch thuật gặp sự cố');
      const data = await res.json();

      setEditingJob((prev) => ({
        ...prev,
        tieu_de_en: data.translations?.tieu_de || prev?.tieu_de_en || '',
        phong_ban_en: data.translations?.phong_ban || prev?.phong_ban_en || '',
        dia_diem_en: data.translations?.dia_diem || prev?.dia_diem_en || '',
        hinh_thuc_en: data.translations?.hinh_thuc || prev?.hinh_thuc_en || '',
        muc_luong_en: data.translations?.muc_luong || prev?.muc_luong_en || '',
        kinh_nghiem_en: data.translations?.kinh_nghiem || prev?.kinh_nghiem_en || '',
        mo_ta_en: data.translations?.mo_ta || prev?.mo_ta_en || '',
        yeu_cau_en: data.translations?.yeu_cau || prev?.yeu_cau_en || '',
        quyen_loi_en: data.translations?.quyen_loi || prev?.quyen_loi_en || '',
      }));

      setModalTab('en');
      notify('success', 'Đã dịch tự động sang tiếng Anh chuẩn Fear-Free!');
    } catch (err: any) {
      console.warn('Lỗi AI translate, dùng fallback dịch từ điển:', err);
      // Fallback
      setEditingJob((prev) => ({
        ...prev,
        tieu_de_en: prev?.tieu_de ? `${prev.tieu_de} (English)` : '',
        phong_ban_en: prev?.phong_ban === 'Chăm Sóc & Spa' ? 'Grooming & Spa' : 'Medical & Clinical Care',
        dia_diem_en: 'Thu Duc City Headquarters, Ho Chi Minh City',
        hinh_thuc_en: 'Full-time',
        muc_luong_en: prev?.muc_luong || 'Negotiable',
        kinh_nghiem_en: prev?.kinh_nghiem || 'Experience required',
      }));
      setModalTab('en');
      notify('success', 'Đã chuyển sang tab Tiếng Anh để cập nhật.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    if (!editingJob.tieu_de?.trim()) {
      notify('error', 'Vui lòng nhập tiêu đề vị trí tuyển dụng');
      return;
    }

    // Tự sinh slug ID chuẩn hóa
    const finalId = generateSlug(editingJob.id?.trim() || editingJob.tieu_de);

    setIsSaving(true);
    try {
      const payload: Partial<TuyenDungRecord> = {
        id: finalId,
        tieu_de: editingJob.tieu_de.trim(),
        tieu_de_en: editingJob.tieu_de_en?.trim() || null,
        phong_ban: editingJob.phong_ban?.trim() || 'Y Khoa & Điều Trị',
        phong_ban_en: editingJob.phong_ban_en?.trim() || 'Medical & Clinical Care',
        dia_diem: editingJob.dia_diem?.trim() || 'TP. Thủ Đức, TP. Hồ Chí Minh',
        dia_diem_en: editingJob.dia_diem_en?.trim() || 'Thu Duc City, Ho Chi Minh City',
        hinh_thuc: editingJob.hinh_thuc?.trim() || 'Toàn thời gian',
        hinh_thuc_en: editingJob.hinh_thuc_en?.trim() || 'Full-time',
        muc_luong: editingJob.muc_luong?.trim() || 'Thỏa thuận',
        muc_luong_en: editingJob.muc_luong_en?.trim() || 'Negotiable',
        kinh_nghiem: editingJob.kinh_nghiem?.trim() || 'Có kinh nghiệm',
        kinh_nghiem_en: editingJob.kinh_nghiem_en?.trim() || 'Experience required',
        so_luong: Number(editingJob.so_luong) || 1,
        han_nop: editingJob.han_nop?.trim() || '30/11/2026',
        mo_ta: editingJob.mo_ta?.trim() || '',
        mo_ta_en: editingJob.mo_ta_en?.trim() || '',
        yeu_cau: editingJob.yeu_cau?.trim() || '',
        yeu_cau_en: editingJob.yeu_cau_en?.trim() || '',
        quyen_loi: editingJob.quyen_loi?.trim() || '',
        quyen_loi_en: editingJob.quyen_loi_en?.trim() || '',
        hinh_anh: editingJob.hinh_anh?.trim() || '/about_hospital.jpg',
        thu_tu: Number(editingJob.thu_tu) || 1,
        kich_hoat: editingJob.kich_hoat !== false,
        updated_at: new Date().toISOString(),
      };

      if (isCreatingNew) {
        const { error } = await supabase.from('tuyen_dung').insert([payload]);
        if (error) throw error;
        notify('success', 'Đã thêm vị trí tuyển dụng mới thành công!');
      } else {
        const { error } = await supabase.from('tuyen_dung').update(payload).eq('id', editingJob.id);
        if (error) throw error;
        notify('success', 'Đã cập nhật vị trí tuyển dụng thành công!');
      }

      setEditingJob(null);
      setIsCreatingNew(false);
      await loadJobs();
    } catch (err: any) {
      console.error('Save job error:', err);
      notify('error', `Lỗi lưu tuyển dụng: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered jobs
  const filteredJobs = jobs.filter((j) => {
    if (selectedDept !== 'all') {
      const dept = (j.phong_ban || '').toLowerCase();
      if (!dept.includes(selectedDept.toLowerCase())) return false;
    }
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (j.tieu_de && j.tieu_de.toLowerCase().includes(term)) ||
      (j.phong_ban && j.phong_ban.toLowerCase().includes(term)) ||
      (j.muc_luong && j.muc_luong.toLowerCase().includes(term)) ||
      (j.dia_diem && j.dia_diem.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#2D5A27]" />
            <span>Quản Lý Cơ Hội Tuyển Dụng & Vị Trí Mở</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Hiển thị các vị trí đang tuyển trên Trang chủ (khối Tuyển Dụng) và chuyên trang <strong>/tuyen-dung</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tuyen-dung"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>Xem Trang Tuyển Dụng</span>
          </Link>

          <button
            type="button"
            onClick={handleAddNewJob}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Vị Trí Mới</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'Tất Cả', count: jobs.length },
            { id: 'y khoa', label: 'Y Khoa & Điều Trị', count: jobs.filter((j) => (j.phong_ban || '').toLowerCase().includes('y khoa')).length },
            { id: 'spa', label: 'Chăm Sóc & Spa', count: jobs.filter((j) => (j.phong_ban || '').toLowerCase().includes('spa')).length },
            { id: 'điều dưỡng', label: 'Điều Dưỡng & Nội Trú', count: jobs.filter((j) => (j.phong_ban || '').toLowerCase().includes('điều dưỡng')).length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedDept(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                selectedDept === tab.id
                  ? 'bg-[#2D5A27] text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  selectedDept === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tiêu đề, phòng ban..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
          />
        </div>
      </div>

      {/* Jobs Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-[#2D5A27] border-t-transparent rounded-full animate-spin" />
            <span>Đang tải danh sách tuyển dụng từ Supabase...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
            <p>Chưa có vị trí tuyển dụng nào trong mục này.</p>
            <button
              onClick={handleAddNewJob}
              className="text-[#2D5A27] font-bold hover:underline"
            >
              + Bấm vào đây để tạo vị trí tuyển dụng mới
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">STT</th>
                  <th className="py-3 px-4">Vị Trí Tuyển Dụng</th>
                  <th className="py-3 px-4">Phòng Ban</th>
                  <th className="py-3 px-4">Mức Lương</th>
                  <th className="py-3 px-4">Hạn Nộp</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map((job, idx) => (
                  <tr key={job.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono">
                      {job.thu_tu || idx + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{job.tieu_de}</span>
                        {job.tieu_de_en && (
                          <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded font-semibold border border-blue-200">
                            EN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-slate-500">ID: {job.id}</span>
                        <span>•</span>
                        <span>{job.dia_diem}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold text-[11px]">
                        {job.phong_ban || 'Y Khoa'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-amber-900">
                      {job.muc_luong || 'Thỏa thuận'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {job.han_nop || 'Đang mở'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleJobActive(job)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                          job.kich_hoat
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {job.kich_hoat ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        <span>{job.kich_hoat ? 'Đang tuyển' : 'Tạm ẩn'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          href={`/tuyen-dung/${job.id}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition"
                          title="Xem trên web"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleEditJob(job)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-[#2D5A27] hover:bg-emerald-50 transition cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteJob(job)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Xóa vị trí"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL THÊM / CHỈNH SỬA VỊ TRÍ TUYỂN DỤNG                  */}
      {/* ========================================================= */}
      {editingJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-[#2D5A27]">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-wide uppercase">
                  {isCreatingNew ? 'Thêm Vị Trí Tuyển Dụng Mới' : 'Chỉnh Sửa Vị Trí Tuyển Dụng'}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTranslateJob}
                  disabled={isTranslating}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition cursor-pointer disabled:opacity-50"
                  title="Dịch nội dung sang tiếng Anh"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isTranslating ? 'Đang dịch...' : 'Dịch AI (ENG)'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Language Switcher Tabs */}
            <div className="px-6 pt-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/30">
              <button
                type="button"
                onClick={() => setModalTab('vi')}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 font-bold text-xs transition cursor-pointer ${
                  modalTab === 'vi'
                    ? 'border-[#2D5A27] text-[#2D5A27] bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <VietnamFlag className="w-4 h-3 rounded-xs shadow-2xs" />
                <span>Tiếng Việt</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab('en')}
                className={`flex items-center gap-2 px-4 py-2 border-b-2 font-bold text-xs transition cursor-pointer ${
                  modalTab === 'en'
                    ? 'border-[#2D5A27] text-[#2D5A27] bg-white rounded-t-lg'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <UKFlag className="w-4 h-3 rounded-xs shadow-2xs" />
                <span>English</span>
                {editingJob.tieu_de_en && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveJob} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* Mã định danh / Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">
                      Mã định danh (Slug đường dẫn): *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (editingJob.tieu_de?.trim()) {
                          const newSlug = generateSlug(editingJob.tieu_de);
                          setEditingJob((prev) => ({ ...prev, id: newSlug }));
                          notify('success', 'Đã tự động tạo mã đường dẫn từ tiêu đề');
                        } else {
                          notify('error', 'Vui lòng nhập tiêu đề vị trí trước');
                        }
                      }}
                      className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer transition"
                      title="Tự động sinh mã từ Tiêu đề"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Tự động sinh từ tiêu đề
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={editingJob.id || ''}
                    onChange={(e) => setEditingJob((prev) => ({ ...prev, id: generateSlug(e.target.value) }))}
                    placeholder="Tự động điền theo tiêu đề..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white font-mono focus:border-[#2D5A27] focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Hệ thống tự động điền từ tiêu đề. Đường dẫn: <strong className="text-emerald-800 font-mono">/tuyen-dung/{editingJob.id || 'slug-vi-tri'}</strong>
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Thứ tự sắp xếp:
                  </label>
                  <input
                    type="number"
                    value={editingJob.thu_tu || 1}
                    onChange={(e) => setEditingJob((prev) => ({ ...prev, thu_tu: Number(e.target.value) }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Tiêu đề & Phòng ban */}
              {modalTab === 'vi' ? (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tiêu đề vị trí (Tiếng Việt): *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingJob.tieu_de || ''}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setEditingJob((prev) => {
                          if (!prev) return prev;
                          const shouldUpdateSlug = isCreatingNew || !prev.id || prev.id === generateSlug(prev.tieu_de || '');
                          return {
                            ...prev,
                            tieu_de: newTitle,
                            id: shouldUpdateSlug ? generateSlug(newTitle) : prev.id,
                          };
                        });
                      }}
                      placeholder="VD: Bác Sĩ Thú Y Khám Lâm Sàng & Phẫu Thuật"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white font-semibold focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Phòng ban:
                      </label>
                      <input
                        type="text"
                        value={editingJob.phong_ban || ''}
                        onChange={(e) => setEditingJob((prev) => ({ ...prev, phong_ban: e.target.value }))}
                        placeholder="VD: Y Khoa & Điều Trị"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Hình thức làm việc:
                      </label>
                      <input
                        type="text"
                        value={editingJob.hinh_thuc || ''}
                        onChange={(e) => setEditingJob((prev) => ({ ...prev, hinh_thuc: e.target.value }))}
                        placeholder="VD: Toàn thời gian / Theo ca"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Mức lương:
                      </label>
                      <input
                        type="text"
                        value={editingJob.muc_luong || ''}
                        onChange={(e) => setEditingJob((prev) => ({ ...prev, muc_luong: e.target.value }))}
                        placeholder="VD: 20 – 35 Triệu / Tháng"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white font-bold text-amber-900 focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Kinh nghiệm yêu cầu:
                      </label>
                      <input
                        type="text"
                        value={editingJob.kinh_nghiem || ''}
                        onChange={(e) => setEditingJob((prev) => ({ ...prev, kinh_nghiem: e.target.value }))}
                        placeholder="VD: Tối thiểu 2 năm kinh nghiệm"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Số lượng cần tuyển:
                      </label>
                      <input
                        type="number"
                        value={editingJob.so_luong || 1}
                        onChange={(e) => setEditingJob((prev) => ({ ...prev, so_luong: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Hạn nộp hồ sơ:
                      </label>
                      <input
                        type="text"
                        value={editingJob.han_nop || ''}
                        onChange={(e) => setEditingJob((prev) => ({ ...prev, han_nop: e.target.value }))}
                        placeholder="VD: 30/11/2026"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Địa điểm làm việc:
                    </label>
                    <input
                      type="text"
                      value={editingJob.dia_diem || ''}
                      onChange={(e) => setEditingJob((prev) => ({ ...prev, dia_diem: e.target.value }))}
                      placeholder="VD: 19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức, TP. Hồ Chí Minh"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  {/* Mô tả, Yêu cầu, Quyền lợi */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Mô tả công việc (Xuống dòng hoặc gạch đầu dòng - ):
                    </label>
                    <textarea
                      rows={6}
                      value={editingJob.mo_ta || ''}
                      onChange={(e) => setEditingJob((prev) => ({ ...prev, mo_ta: e.target.value }))}
                      placeholder={`Nhập nội dung mô tả (xuống dòng tự do hoặc gạch đầu dòng -):\n- Trực tiếp thăm khám, chẩn đoán và điều trị bệnh cho thú cưng\n- Thực hiện các ca phẫu thuật ngoại khoa từ cơ bản đến nâng cao\n- Phân tích kết quả xét nghiệm, chẩn đoán hình ảnh`}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white text-sm leading-relaxed focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Yêu cầu ứng viên (Xuống dòng hoặc gạch đầu dòng - ):
                    </label>
                    <textarea
                      rows={5}
                      value={editingJob.yeu_cau || ''}
                      onChange={(e) => setEditingJob((prev) => ({ ...prev, yeu_cau: e.target.value }))}
                      placeholder={`Yêu cầu bằng cấp, kỹ năng, kinh nghiệm:\n- Tốt nghiệp Đại học chuyên ngành Thú Y\n- Có chứng chỉ hành nghề hợp lệ\n- Tối thiểu 2 năm kinh nghiệm lâm sàng`}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white text-sm leading-relaxed focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Quyền lợi & Đãi ngộ (Xuống dòng hoặc gạch đầu dòng - ):
                    </label>
                    <textarea
                      rows={5}
                      value={editingJob.quyen_loi || ''}
                      onChange={(e) => setEditingJob((prev) => ({ ...prev, quyen_loi: e.target.value }))}
                      placeholder={`Chế độ đãi ngộ, bảo hiểm, đào tạo:\n- Mức thu nhập cạnh tranh từ 20 – 35 triệu/tháng + thưởng doanh số\n- Được tài trợ đào tạo y khoa & chứng chỉ Fear-Free quốc tế\n- Chế độ bảo hiểm sức khỏe VIP hàng năm`}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white text-sm leading-relaxed focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Job Title (English):
                    </label>
                    <input
                      type="text"
                      value={editingJob.tieu_de_en || ''}
                      onChange={(e) => setEditingJob((prev) => ({ ...prev, tieu_de_en: e.target.value }))}
                      placeholder="e.g. Veterinary Clinical Care & Surgical Specialist"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white font-semibold focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Department (English):
                      </label>
                      <input
                        type="text"
                        value={editingJob.phong_ban_en || ''}
                        onChange={(e) => setEditingJob((prev) => ({ ...prev, phong_ban_en: e.target.value }))}
                        placeholder="e.g. Medical & Clinical Care"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Work Type (English):
                      </label>
                      <input
                        type="text"
                        value={editingJob.hinh_thuc_en || ''}
                        onChange={(e) => setEditingJob((prev) => ({ ...prev, hinh_thuc_en: e.target.value }))}
                        placeholder="e.g. Full-time"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Salary / Compensation (English):
                      </label>
                      <input
                        type="text"
                        value={editingJob.muc_luong_en || ''}
                        onChange={(e) => setEditingJob((prev) => ({ ...prev, muc_luong_en: e.target.value }))}
                        placeholder="e.g. 20 – 35 Million VND / Month"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white font-bold text-amber-900 focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Experience (English):
                      </label>
                      <input
                        type="text"
                        value={editingJob.kinh_nghiem_en || ''}
                        onChange={(e) => setEditingJob((prev) => ({ ...prev, kinh_nghiem_en: e.target.value }))}
                        placeholder="e.g. Minimum 2 years experience"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Work Location (English):
                    </label>
                    <input
                      type="text"
                      value={editingJob.dia_diem_en || ''}
                      onChange={(e) => setEditingJob((prev) => ({ ...prev, dia_diem_en: e.target.value }))}
                      placeholder="e.g. Thu Duc City Headquarters, Ho Chi Minh City"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Job Description (English - Line breaks or bullet points - ):
                    </label>
                    <textarea
                      rows={6}
                      value={editingJob.mo_ta_en || ''}
                      onChange={(e) => setEditingJob((prev) => ({ ...prev, mo_ta_en: e.target.value }))}
                      placeholder={`Key responsibilities (use line breaks or bullet points -):\n- Directly examine, diagnose, and treat pets\n- Perform routine and advanced surgical procedures\n- Consult pet owners on preventive care protocols`}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white text-sm leading-relaxed focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Candidate Requirements (English - Line breaks or bullet points - ):
                    </label>
                    <textarea
                      rows={5}
                      value={editingJob.yeu_cau_en || ''}
                      onChange={(e) => setEditingJob((prev) => ({ ...prev, yeu_cau_en: e.target.value }))}
                      placeholder={`Candidate qualifications:\n- Degree in Veterinary Medicine\n- Valid veterinary license\n- Minimum 2 years clinical experience`}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white text-sm leading-relaxed focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Benefits & Privileges (English - Line breaks or bullet points - ):
                    </label>
                    <textarea
                      rows={5}
                      value={editingJob.quyen_loi_en || ''}
                      onChange={(e) => setEditingJob((prev) => ({ ...prev, quyen_loi_en: e.target.value }))}
                      placeholder={`Compensation & perks:\n- Competitive salary package 20 - 35 Million VND/month\n- Sponsored ongoing medical training and certifications\n- Full premium health insurance package`}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white text-sm leading-relaxed focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* Ảnh minh họa vị trí */}
              <div className="space-y-1.5 pt-2">
                <label className="block font-semibold text-slate-700">
                  Ảnh bìa vị trí tuyển dụng:
                </label>
                <AdminImageInput
                  folder="general"
                  value={editingJob.hinh_anh || ''}
                  onChange={(url) => setEditingJob((prev) => ({ ...prev, hinh_anh: url }))}
                  onNotification={notify}
                />
              </div>

              {/* Trạng thái kích hoạt */}
              <div className="pt-2 flex items-center gap-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingJob.kich_hoat !== false}
                    onChange={(e) => setEditingJob((prev) => ({ ...prev, kich_hoat: e.target.checked }))}
                    className="w-4 h-4 text-[#2D5A27] rounded focus:ring-0 cursor-pointer"
                  />
                  <span>Kích hoạt hiển thị công khai trên website</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white font-bold shadow transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu Vị Trí Tuyển Dụng'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
