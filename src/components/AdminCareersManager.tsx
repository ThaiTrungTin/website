'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
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
  ChevronDown,
  ChevronUp,
  PhoneCall,
  Mail,
  CalendarCheck,
  XCircle,
  Send,
  Maximize2,
  Minimize2,
  Settings,
  Filter,
} from 'lucide-react';
import { supabase, TuyenDungRecord, HoSoTuyenDungRecord } from '@/lib/supabase';
import AdminImageInput from '@/components/AdminImageInput';
import { VietnamFlag, UKFlag } from '@/components/FlagIcons';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

interface Props {
  showNotification?: (type: 'success' | 'error', message: string) => void;
  applications?: HoSoTuyenDungRecord[];
  onUpdateApplicantStatus?: (appId: string, newStatus: string) => Promise<void>;
  highlightedId?: string | null;
  onOpenTitleModal?: () => void;
  defaultView?: 'jobs' | 'applicants';
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

export default function AdminCareersManager({
  showNotification,
  applications: propApplications,
  onUpdateApplicantStatus,
  highlightedId,
  onOpenTitleModal,
  defaultView,
}: Props) {
  const [jobs, setJobs] = useState<TuyenDungRecord[]>([]);
  const [localApplications, setLocalApplications] = useState<HoSoTuyenDungRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [mainView, setMainView] = useState<'jobs' | 'applicants'>(defaultView || 'jobs');
  const [applicantStatusFilter, setApplicantStatusFilter] = useState<string>('all');
  const [applicantJobFilter, setApplicantJobFilter] = useState<string>('all');

  // Accordion state
  const [expandedJobIds, setExpandedJobIds] = useState<Set<string>>(new Set());
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);

  // Modal Soạn Thư Phỏng Vấn (Gửi qua Gmail)
  const [interviewModalData, setInterviewModalData] = useState<{
    isOpen: boolean;
    app: HoSoTuyenDungRecord | null;
    jobTitle: string;
    subject: string;
    interviewDate: string;
    interviewLocation: string;
    contactPerson: string;
    contactPhone: string;
    content: string;
    isSending: boolean;
  } | null>(null);

  // Kéo dãn / Phóng to cửa sổ soạn thư PV
  const [isModalMaximized, setIsModalMaximized] = useState(false);
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);
  const [modalSize, setModalSize] = useState<{ width: number; height: number }>({
    width: 860,
    height: 720,
  });
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const resizeRef = React.useRef<{
    edge: string;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  // Tự động khởi tạo kích thước modal phù hợp với màn hình khi mở
  useEffect(() => {
    if (interviewModalData?.isOpen && typeof window !== 'undefined') {
      const initialW = Math.min(880, window.innerWidth - 32);
      const initialH = Math.min(740, window.innerHeight - 32);
      setModalSize({ width: Math.max(520, initialW), height: Math.max(480, initialH) });
      setIsModalMaximized(false);
      setIsDetailsCollapsed(false);
    }
  }, [interviewModalData?.isOpen]);

  // Kéo dãn các cạnh ngang (trái, phải) và dọc (trên, dưới) và 4 góc
  const startResize = (edge: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(edge);
    resizeRef.current = {
      edge,
      startX: e.clientX,
      startY: e.clientY,
      startW: modalSize.width,
      startH: modalSize.height,
    };
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const { edge, startX, startY, startW, startH } = resizeRef.current;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const minW = 480;
      const maxW = window.innerWidth - 24;
      const minH = 440;
      const maxH = window.innerHeight - 24;

      let newW = startW;
      let newH = startH;

      if (edge.includes('right')) {
        newW = Math.min(maxW, Math.max(minW, startW + deltaX * 2));
      }
      if (edge.includes('left')) {
        newW = Math.min(maxW, Math.max(minW, startW - deltaX * 2));
      }
      if (edge.includes('bottom')) {
        newH = Math.min(maxH, Math.max(minH, startH + deltaY * 2));
      }
      if (edge.includes('top')) {
        newH = Math.min(maxH, Math.max(minH, startH - deltaY * 2));
      }

      setModalSize({ width: Math.round(newW), height: Math.round(newH) });
    };

    const handleMouseUp = () => {
      setIsResizing(null);
      resizeRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

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
      const res = await fetch('/api/admin/jobs');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setJobs(json.data as TuyenDungRecord[]);
          return;
        }
      }

      // Fallback
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

  const currentApplications = propApplications ?? localApplications;

  const loadLocalApplications = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/applications');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setLocalApplications(json.data as HoSoTuyenDungRecord[]);
        }
      }
    } catch (e) {
      console.error('Error loading job applications:', e);
    }
  }, []);

  useEffect(() => {
    if (!propApplications) {
      loadLocalApplications();
      const appChannel = supabase
        .channel('admin_careers_applications_changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'ho_so_tuyen_dung' },
          () => {
            loadLocalApplications();
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(appChannel);
      };
    }
  }, [propApplications, loadLocalApplications]);

  // Gom ứng viên theo từng vị trí đang tuyển
  const appsGroupedByJob = useMemo(() => {
    const map: Record<string, HoSoTuyenDungRecord[]> = {};
    currentApplications.forEach((app) => {
      const jId = app.tuyen_dung_id || 'other';
      if (!map[jId]) map[jId] = [];
      map[jId].push(app);
    });
    return map;
  }, [currentApplications]);

  // Tổng số hồ sơ khả dụng (KHÔNG tính hồ sơ đã ấn 'bo_qua')
  const totalActiveAppsCount = useMemo(() => {
    return currentApplications.filter((a) => a.trang_thai !== 'bo_qua').length;
  }, [currentApplications]);

  // Mở/đóng nhánh con của vị trí
  const toggleJobExpand = (jobId: string) => {
    setExpandedJobIds((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });
  };

  // Tự động mở rộng nhánh vị trí tuyển dụng nếu có hồ sơ ứng viên được chọn/highlight
  useEffect(() => {
    if (!highlightedId || !currentApplications.length) return;
    const targetApp = currentApplications.find((a) => a.id === highlightedId);
    if (targetApp) {
      const jobId = targetApp.tuyen_dung_id || 'other';
      setExpandedJobIds((prev) => {
        const next = new Set(prev);
        next.add(jobId);
        return next;
      });
      setTimeout(() => {
        const el = document.getElementById(`applicant-row-${highlightedId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
    }
  }, [highlightedId, currentApplications]);

  useEffect(() => {
    if (defaultView) {
      setMainView(defaultView);
    }
  }, [defaultView]);

  const handleToggleExpandAll = () => {
    if (expandedJobIds.size > 0) {
      setExpandedJobIds(new Set());
    } else {
      const allIds = new Set(jobs.map((j) => j.id));
      if (appsGroupedByJob['other'] && appsGroupedByJob['other'].length > 0) {
        allIds.add('other');
      }
      setExpandedJobIds(allIds);
    }
  };

  const handleActionClick = async (appId: string, newStatus: string) => {
    setUpdatingAppId(appId);
    // Cập nhật lạc quan (optimistic update) ngay lập tức
    setLocalApplications((prev) =>
      prev.map((item) => (item.id === appId ? { ...item, trang_thai: newStatus } : item))
    );
    try {
      if (onUpdateApplicantStatus) {
        await onUpdateApplicantStatus(appId, newStatus);
      } else {
        const res = await fetch('/api/admin/applications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: appId, trang_thai: newStatus }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Lỗi hệ thống');
        notify('success', 'Đã cập nhật trạng thái ứng viên thành công!');
        loadLocalApplications();
      }
    } catch (err: any) {
      notify('error', `Lỗi khi cập nhật trạng thái: ${err?.message || 'Lỗi hệ thống'}`);
    } finally {
      setUpdatingAppId(null);
    }
  };

  const handleOpenInterviewModal = (app: HoSoTuyenDungRecord, jobTitle: string) => {
    const defaultDate = '09:30 - Thứ Năm, 15/10/2026';
    const defaultLocation = 'Bệnh viện Thú Y PetM&M (Trụ sở TP. Thủ Đức, TP. Hồ Chí Minh)';
    const defaultContact = 'Bộ phận Nhân sự PetM&M';
    const defaultPhone = '0987 654 321';
    const defaultSubject = `[PetM&M] Thư Mời Phỏng Vấn Vị Trí ${jobTitle}`;

    const defaultContent = `<p>Kính gửi bạn <strong>${app.ho_ten}</strong>,</p>
<p>Bộ phận Tuyển dụng <strong>Bệnh viện Thú Y PetM&amp;M</strong> xin chân thành cảm ơn bạn đã quan tâm và nộp hồ sơ ứng tuyển cho vị trí <strong>${jobTitle}</strong>.</p>
<p>Sau khi xem xét hồ sơ và CV của bạn, Ban Giám đốc cùng Hội đồng chuyên môn rất ấn tượng với năng lực và kinh nghiệm của bạn. Chúng tôi trân trọng kính mời bạn đến tham gia buổi phỏng vấn trực tiếp với thông tin chi tiết như sau:</p>
<ul>
  <li><strong>Vị trí phỏng vấn:</strong> ${jobTitle}</li>
  <li><strong>Thời gian phỏng vấn:</strong> ${defaultDate}</li>
  <li><strong>Địa điểm phỏng vấn:</strong> ${defaultLocation}</li>
  <li><strong>Người liên hệ:</strong> ${defaultContact} (Hotline: <strong>${defaultPhone}</strong>)</li>
  <li><strong>Lưu ý:</strong> Bạn vui lòng mang theo CV bản in và các chứng chỉ / bằng cấp chuyên môn liên quan.</li>
</ul>
<p>Nếu thời gian trên có sự thay đổi hoặc bạn cần hỗ trợ thêm thông tin, vui lòng phản hồi lại email này để được sắp xếp lịch phù hợp.</p>
<p>Chúc bạn có một buổi phỏng vấn thành công tốt đẹp!</p>
<p>Trân trọng,<br/><strong>Hội Đồng Tuyển Dụng Bệnh Viện Thú Y PetM&amp;M</strong></p>`;

    setIsModalMaximized(false);
    setInterviewModalData({
      isOpen: true,
      app,
      jobTitle,
      subject: defaultSubject,
      interviewDate: defaultDate,
      interviewLocation: defaultLocation,
      contactPerson: defaultContact,
      contactPhone: defaultPhone,
      content: defaultContent,
      isSending: false,
    });
  };

  const handleSendInterviewEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewModalData || !interviewModalData.app) return;
    const { app, jobTitle, subject, interviewDate, interviewLocation, contactPerson, contactPhone, content } = interviewModalData;

    if (!app.email || !app.email.trim()) {
      notify('error', 'Ứng viên không có địa chỉ email để gửi!');
      return;
    }

    // Đóng cửa sổ ngay lập tức và cập nhật giao diện trước (Optimistic UI)
    setInterviewModalData(null);
    setLocalApplications((prev) =>
      prev.map((item) => (item.id === app.id ? { ...item, trang_thai: 'hen_phong_van' } : item))
    );
    notify('success', `Đang gửi thư mời phỏng vấn tới ${app.email} qua Gmail...`);

    // Thực hiện gửi ngầm trong nền
    (async () => {
      try {
        const res = await fetch('/api/admin/send-interview-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            applicantId: app.id,
            applicantEmail: app.email,
            applicantName: app.ho_ten,
            jobTitle,
            subject,
            interviewDate,
            interviewLocation,
            contactPerson,
            contactPhone,
            emailContent: content,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.message || 'Không thể gửi email phỏng vấn');
        }

        const updatedCount = data.so_lan_gui_email ?? ((app.so_lan_gui_email || 0) + 1);
        setLocalApplications((prev) =>
          prev.map((item) =>
            item.id === app.id
              ? {
                  ...item,
                  trang_thai: 'hen_phong_van',
                  so_lan_gui_email: updatedCount,
                  trang_thai_email: 'thanh_cong',
                }
              : item
          )
        );

        if (onUpdateApplicantStatus) {
          await onUpdateApplicantStatus(app.id, 'hen_phong_van');
        }

        notify('success', `Đã gửi thành công thư mời phỏng vấn tới ${app.email}!`);
      } catch (err: any) {
        notify('error', `Lỗi khi gửi thư tới ${app.email}: ${err.message || 'Lỗi hệ thống'}`);
        // Cập nhật trạng thái lỗi để hiển thị chấm than đỏ
        setLocalApplications((prev) =>
          prev.map((item) =>
            item.id === app.id
              ? {
                  ...item,
                  trang_thai: app.trang_thai,
                  trang_thai_email: 'that_bai',
                }
              : item
          )
        );
        if (onUpdateApplicantStatus) {
          await onUpdateApplicantStatus(app.id, app.trang_thai || 'moi');
        }
      }
    })();
  };

  const renderAppStatusBadge = (status?: string | null) => {
    switch (status) {
      case 'hen_phong_van':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Đã hẹn PV
          </span>
        );
      case 'da_lien_he':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            Đã liên hệ
          </span>
        );
      case 'bo_qua':
      case 'tu_choi':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Từ chối (Bỏ qua)
          </span>
        );
      case 'moi':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Mới nộp
          </span>
        );
    }
  };

  const formatAppDate = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} - ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

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
      const res = await fetch('/api/admin/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: job.id, kich_hoat: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Lỗi cập nhật');

      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, kich_hoat: newStatus } : j)));
      notify('success', `Đã ${newStatus ? 'kích hoạt' : 'tạm ẩn'} vị trí tuyển dụng`);
    } catch (err: any) {
      notify('error', `Lỗi cập nhật: ${err.message}`);
    }
  };

  const handleDeleteJob = async (job: TuyenDungRecord) => {
    if (!window.confirm(`Bạn có chắc muốn xóa vị trí tuyển dụng "${job.tieu_de}" không?`)) return;

    try {
      const res = await fetch(`/api/admin/jobs?id=${encodeURIComponent(job.id)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message || 'Lỗi xóa');

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
        const res = await fetch('/api/admin/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Lỗi thêm bài tuyển dụng');
        notify('success', 'Đã thêm vị trí tuyển dụng mới thành công!');
      } else {
        const res = await fetch('/api/admin/jobs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingJob.id, ...payload }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.message || 'Lỗi cập nhật');
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

  const getJobTitle = useCallback(
    (jobId?: string | null) => {
      if (!jobId || jobId === 'other') return 'Ứng tuyển tự do / Khác';
      const found = jobs.find((j) => j.id === jobId);
      return found ? found.tieu_de : 'Vị trí khác';
    },
    [jobs]
  );

  // Filtered applications cho chế độ xem phẳng toàn bộ ứng viên
  const filteredApplications = useMemo(() => {
    return currentApplications.filter((app) => {
      if (applicantStatusFilter !== 'all') {
        const appStatus = app.trang_thai || 'moi';
        if (applicantStatusFilter === 'moi' && appStatus !== 'moi') return false;
        if (applicantStatusFilter === 'hen_phong_van' && appStatus !== 'hen_phong_van') return false;
        if (applicantStatusFilter === 'da_lien_he' && appStatus !== 'da_lien_he') return false;
        if (applicantStatusFilter === 'bo_qua' && appStatus !== 'bo_qua' && appStatus !== 'tu_choi') return false;
      }
      if (applicantJobFilter !== 'all') {
        const jId = app.tuyen_dung_id || 'other';
        if (jId !== applicantJobFilter) return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = (app.ho_ten || '').toLowerCase().includes(term);
        const matchPhone = (app.so_dien_thoai || '').toLowerCase().includes(term);
        const matchEmail = (app.email || '').toLowerCase().includes(term);
        const matchIntro = (app.gioi_thieu || '').toLowerCase().includes(term);
        if (!matchName && !matchPhone && !matchEmail && !matchIntro) return false;
      }
      return true;
    });
  }, [currentApplications, applicantStatusFilter, applicantJobFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* ── KHỐI DUY NHẤT: VỊ TRÍ TUYỂN DỤNG & ỨNG VIÊN NỘP CV ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-[#2D5A27] shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                Quản Lý Tuyển Dụng &amp; Ứng Viên Nộp CV
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                {totalActiveAppsCount} hồ sơ cần xử lý
              </span>
            </div>

            {/* 2 Tab chuyển đổi chế độ xem rõ ràng: Vị Trí Tuyển Dụng & Danh Sách Ứng Viên Nộp CV */}
            <div className="flex items-center gap-2 mt-3 sm:ml-10.5">
              <div className="inline-flex p-1 bg-slate-200/70 rounded-xl border border-slate-300/80 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setMainView('jobs')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    mainView === 'jobs'
                      ? 'bg-[#2D5A27] text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Vị Trí Tuyển Dụng ({jobs.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMainView('applicants')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    mainView === 'applicants'
                      ? 'bg-[#2D5A27] text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Danh Sách Ứng Viên ({currentApplications.length})</span>
                  {totalActiveAppsCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                      {totalActiveAppsCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 sm:ml-10.5 md:ml-0 flex-wrap">
            {onOpenTitleModal && (
              <button
                type="button"
                onClick={onOpenTitleModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold shadow-xs transition shrink-0 cursor-pointer"
                title="Cài đặt Tiêu đề & Chú thích hiển thị trên Trang chủ"
              >
                <Settings className="w-4 h-4 text-amber-700" />
                <span>Cài Đặt Tiêu Đề Mục</span>
              </button>
            )}

            {mainView === 'jobs' && (
              <button
                type="button"
                onClick={handleToggleExpandAll}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold shadow-2xs transition shrink-0 cursor-pointer"
                title={expandedJobIds.size > 0 ? 'Thu gọn tất cả hồ sơ' : 'Mở rộng hiển thị tất cả hồ sơ ứng viên'}
              >
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>{expandedJobIds.size > 0 ? 'Thu Gọn Tất Cả' : 'Mở Rộng Tất Cả'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleAddNewJob}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm vị trí mới</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        {mainView === 'jobs' ? (
          <>
            <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    selectedDept === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
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
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
            />
          </div>
        </div>

        {/* Jobs Table with Direct Dropdown for Applicants */}
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
              className="text-[#2D5A27] font-bold hover:underline cursor-pointer"
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
                {filteredJobs.map((job, idx) => {
                  const jobApps: HoSoTuyenDungRecord[] = appsGroupedByJob[job.id] || [];
                  // CHỈ ĐẾM NHỮNG NGƯỜI KHÔNG BỊ BỎ QUA (NẾU ẤN BỎ QUA SẼ TRỪ RA)
                  const activeAppsCount = jobApps.filter((a) => a.trang_thai !== 'bo_qua').length;
                  const isExpanded = expandedJobIds.has(job.id);
                  const hasHighlightedChild = jobApps.some((a) => a.id === highlightedId);

                  return (
                    <React.Fragment key={job.id}>
                      <tr
                        className={`transition ${
                          hasHighlightedChild
                            ? 'bg-emerald-50/80 ring-1 ring-emerald-400'
                            : isExpanded
                            ? 'bg-slate-50/90'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center text-slate-400 font-mono align-top">
                          {job.thu_tu || idx + 1}
                        </td>

                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                            <span>{job.tieu_de}</span>
                            {job.tieu_de_en && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded font-semibold border border-blue-200">
                                EN
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              Chỉ tiêu: {job.so_luong || 1} nhân sự
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-slate-500">ID: {job.id}</span>
                            <span>•</span>
                            <span>{job.dia_diem}</span>
                          </div>

                          {/* Nút đổ thẳng danh sách ứng viên nộp CV (chỉ đếm người không bị bỏ qua) */}
                          <div className="mt-2">
                            <button
                              type="button"
                              onClick={() => toggleJobExpand(job.id)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                                isExpanded
                                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300 font-bold shadow-2xs'
                                  : activeAppsCount > 0
                                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200 hover:border-blue-300'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>
                                {activeAppsCount > 0
                                  ? `${activeAppsCount} hồ sơ nộp CV`
                                  : '0 hồ sơ ứng tuyển'}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-emerald-700" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-top">
                          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/60 font-semibold text-[11px]">
                            {job.phong_ban || 'Y Khoa'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-amber-900 align-top">
                          {job.muc_luong || 'Thỏa thuận'}
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 align-top">
                          {job.han_nop || 'Đang mở'}
                        </td>

                        <td className="py-3.5 px-4 text-center align-top">
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

                        <td className="py-3.5 px-4 text-right align-top">
                          <div className="inline-flex items-center gap-1">
                            {/* Nút đếm số lượng người khả dụng trên icon con người */}
                            <button
                              type="button"
                              onClick={() => toggleJobExpand(job.id)}
                              className={`p-1.5 rounded-lg transition cursor-pointer relative ${
                                isExpanded
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'text-slate-500 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                              title={isExpanded ? 'Thu gọn danh sách ứng viên' : 'Xem danh sách ứng viên nộp CV'}
                            >
                              <Users className="w-3.5 h-3.5" />
                              {jobApps.length > 0 && (
                                <span
                                  className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center transition-all ${
                                    activeAppsCount > 0
                                      ? 'bg-blue-600 text-white shadow-2xs'
                                      : 'bg-slate-300 text-slate-600'
                                  }`}
                                  title={`${activeAppsCount} hồ sơ khả dụng (không tính bỏ qua)`}
                                >
                                  {activeAppsCount}
                                </span>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEditJob(job)}
                              className="p-1.5 rounded-lg text-slate-600 hover:text-[#2D5A27] hover:bg-emerald-50 transition cursor-pointer"
                              title="Chỉnh sửa vị trí"
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

                      {/* DÒNG ĐỔ THẲNG ỨNG VIÊN KHI BẤM XEM */}
                      {isExpanded && (
                        <tr key={`apps-${job.id}`} className="bg-slate-50/90 border-b border-slate-200">
                          <td colSpan={7} className="p-4 sm:p-5">
                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-[#2D5A27]" />
                                  <h4 className="text-xs font-bold text-slate-900">
                                    Danh Sách Ứng Viên Nộp Hồ Sơ — {job.tieu_de}
                                  </h4>
                                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                    {activeAppsCount} hồ sơ khả dụng / {jobApps.length} tổng
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleJobExpand(job.id)}
                                  className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-semibold cursor-pointer"
                                >
                                  <span>Thu gọn</span>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {jobApps.length === 0 ? (
                                <div className="py-6 text-center text-xs font-medium text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                                  Chưa có ứng viên nào nộp hồ sơ cho vị trí này.
                                </div>
                              ) : (
                                <div className="space-y-2.5">
                                  {jobApps.map((app: HoSoTuyenDungRecord) => {
                                    const isHighlighted = highlightedId === app.id;
                                    const isUpdating = updatingAppId === app.id;
                                    const isIgnored = app.trang_thai === 'bo_qua';
                                    const isContacted = app.trang_thai === 'da_lien_he';
                                    const isInterviewed = app.trang_thai === 'hen_phong_van';

                                    return (
                                      <div
                                        key={app.id}
                                        id={`applicant-row-${app.id}`}
                                        className={`bg-white rounded-xl border p-3.5 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs ${
                                          isIgnored
                                            ? 'opacity-60 bg-slate-100/80 border-slate-300'
                                            : isHighlighted
                                            ? 'border-emerald-400 bg-emerald-50/80 ring-2 ring-emerald-500 shadow-md'
                                            : 'border-slate-200 hover:border-slate-300'
                                        }`}
                                      >
                                        {/* Thông tin ứng viên */}
                                        <div className="space-y-1 min-w-0 flex-1">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`text-xs font-bold ${isIgnored ? 'text-slate-500 line-through' : 'text-slate-950'}`}>
                                              {app.ho_ten}
                                            </span>
                                            {renderAppStatusBadge(app.trang_thai)}
                                            <span className="text-[11px] text-slate-400 font-mono">
                                              {formatAppDate(app.ngay_tao)}
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-3 text-xs font-medium text-slate-600 flex-wrap">
                                            <a
                                              href={`tel:${app.so_dien_thoai}`}
                                              className="font-mono font-bold text-emerald-800 hover:underline inline-flex items-center gap-1"
                                            >
                                              <PhoneCall className="w-3 h-3 text-emerald-600" />
                                              <span>{app.so_dien_thoai}</span>
                                            </a>
                                            <a
                                              href={`mailto:${app.email}`}
                                              className="text-blue-800 hover:underline inline-flex items-center gap-1 truncate"
                                            >
                                              <Mail className="w-3 h-3 text-blue-600" />
                                              <span>{app.email}</span>
                                            </a>
                                          </div>

                                          {app.gioi_thieu && (
                                            <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200/80 italic mt-1 leading-relaxed">
                                              &ldquo;{app.gioi_thieu}&rdquo;
                                            </p>
                                          )}
                                        </div>

                                        {/* Nút xem CV & Các nút Action */}
                                        <div className="flex items-center gap-2 flex-wrap shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                                          {app.link_cv ? (
                                            <a
                                              href={app.link_cv}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200 transition"
                                            >
                                              <ExternalLink className="w-3 h-3" />
                                              <span>Xem CV</span>
                                            </a>
                                          ) : (
                                            <span className="text-xs text-slate-400 italic px-2">Không CV</span>
                                          )}

                                          {/* Bộ chọn trạng thái nhanh: Mới nộp, Đã hẹn PV, Đã liên hệ, Từ chối (Bỏ qua) */}
                                          <div className="flex items-center gap-1.5">
                                            <select
                                              disabled={isUpdating}
                                              value={app.trang_thai === 'tu_choi' ? 'bo_qua' : (app.trang_thai || 'moi')}
                                              onChange={(e) => handleActionClick(app.id, e.target.value)}
                                              aria-label="Cập nhật trạng thái ứng viên"
                                              className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2D5A27] cursor-pointer shadow-2xs"
                                            >
                                              <option value="moi">🟠 Mới nộp</option>
                                              <option value="hen_phong_van">🟢 Đã hẹn PV</option>
                                              <option value="da_lien_he">🔵 Đã liên hệ</option>
                                              <option value="bo_qua">⚪ Từ chối (Bỏ qua)</option>
                                            </select>
                                          </div>

                                          {/* Nút soạn & gửi thư mời PV qua Gmail */}
                                          <div className="relative inline-block">
                                            <button
                                              type="button"
                                              disabled={isUpdating}
                                              onClick={() => handleOpenInterviewModal(app, job.tieu_de)}
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border shadow-2xs bg-[#2D5A27] hover:bg-[#234A1E] text-white border-[#2D5A27]"
                                              title={`Soạn thư mời phỏng vấn và gửi qua Gmail${app.so_lan_gui_email ? ` - Đã gửi ${app.so_lan_gui_email} lần` : ''}`}
                                            >
                                              <Mail className="w-3.5 h-3.5" />
                                              <span>Thư mời PV</span>
                                            </button>
                                            {/* Badge Email: Lỗi (!) hoặc số lần gửi màu xanh lá cây */}
                                            {app.trang_thai_email === 'that_bai' ? (
                                              <span
                                                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xs ring-2 ring-white animate-pulse pointer-events-none"
                                                title="Lần gửi thư mời gần nhất bị lỗi"
                                              >
                                                !
                                              </span>
                                            ) : (app.so_lan_gui_email || 0) > 0 ? (
                                              <span
                                                className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ring-2 ring-white pointer-events-none"
                                                title={`Đã gửi thư mời phỏng vấn ${app.so_lan_gui_email} lần`}
                                              >
                                                {app.so_lan_gui_email}
                                              </span>
                                            ) : null}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {/* HÀNG BỔ SUNG CHO HỒ SƠ ỨNG TUYỂN TỰ DO / VỊ TRÍ KHÁC (NẾU CÓ) */}
                {appsGroupedByJob['other'] && appsGroupedByJob['other'].length > 0 && (
                  <React.Fragment key="job-other">
                    {(() => {
                      const otherApps = appsGroupedByJob['other'] || [];
                      const activeOtherAppsCount = otherApps.filter((a) => a.trang_thai !== 'bo_qua').length;
                      return (
                        <>
                          <tr className="hover:bg-amber-50/50 bg-amber-50/20 transition">
                            <td className="py-3.5 px-4 text-center text-slate-400 font-mono align-top">—</td>
                            <td className="py-3.5 px-4 align-top">
                              <div className="font-bold text-amber-950 flex items-center gap-1.5">
                                <span>Hồ Sơ Ứng Tuyển Tự Do / Vị Trí Khác</span>
                              </div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                Ứng viên gửi CV chung hoặc vị trí không còn trong danh mục
                              </div>
                              <div className="mt-2">
                                <button
                                  type="button"
                                  onClick={() => toggleJobExpand('other')}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                                    expandedJobIds.has('other')
                                      ? 'bg-amber-200 text-amber-950 border-amber-300 font-bold'
                                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-200'
                                  }`}
                                >
                                  <Users className="w-3.5 h-3.5" />
                                  <span>{activeOtherAppsCount} hồ sơ nộp CV</span>
                                  {expandedJobIds.has('other') ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-amber-800" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-amber-700" />
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 align-top">
                              <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 border border-amber-200 font-semibold text-[11px]">
                                Chung / Tự do
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-400 align-top">—</td>
                            <td className="py-3.5 px-4 text-slate-400 align-top">—</td>
                            <td className="py-3.5 px-4 text-center align-top">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                Chờ xem xét
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right align-top">
                              <button
                                type="button"
                                onClick={() => toggleJobExpand('other')}
                                className={`p-1.5 rounded-lg transition cursor-pointer relative ${
                                  expandedJobIds.has('other')
                                    ? 'bg-amber-200 text-amber-900'
                                    : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100'
                                }`}
                                title="Xem danh sách hồ sơ tự do"
                              >
                                <Users className="w-3.5 h-3.5" />
                                {otherApps.length > 0 && (
                                  <span
                                    className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center transition-all ${
                                      activeOtherAppsCount > 0
                                        ? 'bg-amber-700 text-white shadow-2xs'
                                        : 'bg-slate-300 text-slate-600'
                                    }`}
                                    title={`${activeOtherAppsCount} hồ sơ tự do khả dụng`}
                                  >
                                    {activeOtherAppsCount}
                                  </span>
                                )}
                              </button>
                            </td>
                          </tr>
                          {expandedJobIds.has('other') && (
                            <tr key="apps-other-expanded" className="bg-amber-50/60 border-b border-amber-200">
                              <td colSpan={7} className="p-4 sm:p-5">
                                <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-xs space-y-3">
                                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                    <div className="flex items-center gap-2">
                                      <Users className="w-4 h-4 text-amber-800" />
                                      <h4 className="text-xs font-bold text-slate-900">
                                        Danh Sách Ứng Viên Ứng Tuyển Tự Do
                                      </h4>
                                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                        {activeOtherAppsCount} hồ sơ khả dụng
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => toggleJobExpand('other')}
                                      className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 font-semibold cursor-pointer"
                                    >
                                      <span>Thu gọn</span>
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <div className="space-y-2.5">
                                    {otherApps.map((app: HoSoTuyenDungRecord) => {
                                      const isHighlighted = highlightedId === app.id;
                                      const isUpdating = updatingAppId === app.id;
                                      const isIgnored = app.trang_thai === 'bo_qua';
                                      const isContacted = app.trang_thai === 'da_lien_he';
                                      const isInterviewed = app.trang_thai === 'hen_phong_van';

                                      return (
                                        <div
                                          key={app.id}
                                          id={`applicant-row-${app.id}`}
                                          className={`bg-white rounded-xl border p-3.5 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs ${
                                            isIgnored
                                              ? 'opacity-60 bg-slate-100/80 border-slate-300'
                                              : isHighlighted
                                              ? 'border-emerald-400 bg-emerald-50/80 ring-2 ring-emerald-500 shadow-md'
                                              : 'border-slate-200 hover:border-slate-300'
                                          }`}
                                        >
                                          <div className="space-y-1 min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                              <span className={`text-xs font-bold ${isIgnored ? 'text-slate-500 line-through' : 'text-slate-950'}`}>
                                                {app.ho_ten}
                                              </span>
                                              {renderAppStatusBadge(app.trang_thai)}
                                              <span className="text-[11px] text-slate-400 font-mono">{formatAppDate(app.ngay_tao)}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs font-medium text-slate-600 flex-wrap">
                                              <a href={`tel:${app.so_dien_thoai}`} className="font-mono font-bold text-emerald-800 hover:underline inline-flex items-center gap-1">
                                                <PhoneCall className="w-3 h-3 text-emerald-600" />
                                                <span>{app.so_dien_thoai}</span>
                                              </a>
                                              <a href={`mailto:${app.email}`} className="text-blue-800 hover:underline inline-flex items-center gap-1 truncate">
                                                <Mail className="w-3 h-3 text-blue-600" />
                                                <span>{app.email}</span>
                                              </a>
                                            </div>
                                            {app.gioi_thieu && (
                                              <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200/80 italic mt-1 leading-relaxed">
                                                &ldquo;{app.gioi_thieu}&rdquo;
                                              </p>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2 flex-wrap shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                                            {app.link_cv ? (
                                              <a href={app.link_cv} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200 transition">
                                                <ExternalLink className="w-3 h-3" />
                                                <span>Xem CV</span>
                                              </a>
                                            ) : (
                                              <span className="text-xs text-slate-400 italic px-2">Không CV</span>
                                            )}
                                            {/* Bộ chọn trạng thái nhanh: Mới nộp, Đã hẹn PV, Đã liên hệ, Từ chối (Bỏ qua) */}
                                            <div className="flex items-center gap-1.5">
                                              <select
                                                disabled={isUpdating}
                                                value={app.trang_thai === 'tu_choi' ? 'bo_qua' : (app.trang_thai || 'moi')}
                                                onChange={(e) => handleActionClick(app.id, e.target.value)}
                                                aria-label="Cập nhật trạng thái ứng viên"
                                                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2D5A27] cursor-pointer shadow-2xs"
                                              >
                                                <option value="moi">🟠 Mới nộp</option>
                                                <option value="hen_phong_van">🟢 Đã hẹn PV</option>
                                                <option value="da_lien_he">🔵 Đã liên hệ</option>
                                                <option value="bo_qua">⚪ Từ chối (Bỏ qua)</option>
                                              </select>
                                            </div>

                                            {/* Nút soạn & gửi thư mời PV qua Gmail */}
                                            <button
                                              type="button"
                                              disabled={isUpdating}
                                              onClick={() => handleOpenInterviewModal(app, 'Ứng tuyển tự do')}
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border shadow-2xs bg-[#2D5A27] hover:bg-[#234A1E] text-white border-[#2D5A27]"
                                              title="Soạn thư mời phỏng vấn và gửi qua Gmail"
                                            >
                                              <Mail className="w-3.5 h-3.5" />
                                              <span>Thư mời PV</span>
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })()}
                  </React.Fragment>
                )}
              </tbody>
            </table>
          </div>
        )}
      </>
    ) : (
      /* ========================================================= */
      /* CHẾ ĐỘ XEM 2: DANH SÁCH TẤT CẢ ỨNG VIÊN NỘP CV (PHẲNG)   */
      /* ========================================================= */
      <div className="p-4 sm:p-5 space-y-4">
        {/* Thanh bộ lọc trạng thái, vị trí & tìm kiếm */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          {/* Lọc trạng thái nhanh */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'Tất Cả', count: currentApplications.length },
              { id: 'moi', label: 'Mới Nộp', count: currentApplications.filter((a) => a.trang_thai === 'moi' || !a.trang_thai).length },
              { id: 'hen_phong_van', label: 'Đã Hẹn PV', count: currentApplications.filter((a) => a.trang_thai === 'hen_phong_van').length },
              { id: 'da_lien_he', label: 'Đã Liên Hệ', count: currentApplications.filter((a) => a.trang_thai === 'da_lien_he').length },
              { id: 'bo_qua', label: 'Từ Chối / Bỏ Qua', count: currentApplications.filter((a) => a.trang_thai === 'bo_qua' || a.trang_thai === 'tu_choi').length },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setApplicantStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  applicantStatusFilter === st.id
                    ? 'bg-[#2D5A27] text-white shadow-2xs font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{st.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    applicantStatusFilter === st.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {st.count}
                </span>
              </button>
            ))}
          </div>

          {/* Lọc vị trí & Tìm kiếm */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <select
              value={applicantJobFilter}
              onChange={(e) => setApplicantJobFilter(e.target.value)}
              className="text-xs font-medium px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2D5A27] cursor-pointer shadow-2xs"
            >
              <option value="all">Tất cả vị trí ({jobs.length})</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.tieu_de}
                </option>
              ))}
              <option value="other">Hồ sơ tự do / Vị trí khác</option>
            </select>

            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên, SĐT, email..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#2D5A27]"
              />
            </div>
          </div>
        </div>

        {/* Danh sách thẻ ứng viên nộp CV */}
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-semibold text-slate-600">Không tìm thấy hồ sơ ứng viên nào phù hợp.</p>
            <p className="text-[11px] text-slate-400">Thử thay đổi bộ lọc trạng thái, chọn vị trí hoặc xóa từ khóa tìm kiếm.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApplications.map((app) => {
              const jobTitle = getJobTitle(app.tuyen_dung_id);
              const isHighlighted = app.id === highlightedId;
              const isUpdating = updatingAppId === app.id;
              const isIgnored = app.trang_thai === 'bo_qua' || app.trang_thai === 'tu_choi';

              return (
                <div
                  key={app.id}
                  id={`applicant-flat-${app.id}`}
                  className={`bg-white rounded-xl border p-4 transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-2xs hover:shadow-xs ${
                    isIgnored
                      ? 'opacity-60 bg-slate-100/70 border-slate-300'
                      : isHighlighted
                      ? 'border-emerald-400 bg-emerald-50/80 ring-2 ring-emerald-500 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`text-sm font-bold ${isIgnored ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                        {app.ho_ten}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-[#2D5A27] border border-emerald-200">
                        {jobTitle}
                      </span>
                      {renderAppStatusBadge(app.trang_thai)}
                      <span className="text-[11px] text-slate-400 font-mono">
                        {formatAppDate(app.ngay_tao)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-medium text-slate-600 flex-wrap">
                      <a
                        href={`tel:${app.so_dien_thoai}`}
                        className="font-mono font-bold text-emerald-800 hover:underline inline-flex items-center gap-1"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{app.so_dien_thoai}</span>
                      </a>
                      <a
                        href={`mailto:${app.email}`}
                        className="text-blue-800 hover:underline inline-flex items-center gap-1 truncate"
                      >
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        <span>{app.email}</span>
                      </a>
                    </div>

                    {app.gioi_thieu && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 italic mt-1 leading-relaxed">
                        &ldquo;{app.gioi_thieu}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {app.link_cv ? (
                      <a
                        href={app.link_cv}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs border border-blue-200 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Xem CV</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic px-2">Không CV</span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <select
                        disabled={isUpdating}
                        value={app.trang_thai === 'tu_choi' ? 'bo_qua' : (app.trang_thai || 'moi')}
                        onChange={(e) => handleActionClick(app.id, e.target.value)}
                        aria-label="Cập nhật trạng thái ứng viên"
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2D5A27] cursor-pointer shadow-2xs"
                      >
                        <option value="moi">🟠 Mới nộp</option>
                        <option value="hen_phong_van">🟢 Đã hẹn PV</option>
                        <option value="da_lien_he">🔵 Đã liên hệ</option>
                        <option value="bo_qua">⚪ Từ chối (Bỏ qua)</option>
                      </select>
                    </div>

                    <div className="relative inline-block">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleOpenInterviewModal(app, jobTitle)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border shadow-2xs bg-[#2D5A27] hover:bg-[#234A1E] text-white border-[#2D5A27]"
                        title={`Soạn thư mời phỏng vấn và gửi qua Gmail${app.so_lan_gui_email ? ` - Đã gửi ${app.so_lan_gui_email} lần` : ''}`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Thư mời PV</span>
                      </button>
                      {app.trang_thai_email === 'that_bai' ? (
                        <span
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xs ring-2 ring-white animate-pulse pointer-events-none"
                          title="Lần gửi thư mời gần nhất bị lỗi"
                        >
                          !
                        </span>
                      ) : (app.so_lan_gui_email || 0) > 0 ? (
                        <span
                          className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ring-2 ring-white pointer-events-none"
                          title={`Đã gửi thư mời phỏng vấn ${app.so_lan_gui_email} lần`}
                        >
                          {app.so_lan_gui_email}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    )}
  </div>

      {/* ========================================================= */}
      {/* MODAL SOẠN THƯ MỜI PHỎNG VẤN & GỬI QUA GMAIL              */}
      {/* ========================================================= */}
      {interviewModalData && interviewModalData.isOpen && interviewModalData.app && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 select-none animate-in fade-in duration-150">
          <div
            style={
              isModalMaximized
                ? { width: '98vw', height: '96vh' }
                : { width: `${modalSize.width}px`, height: `${modalSize.height}px` }
            }
            className={`bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 relative transition-[width,height] ${
              isResizing ? 'transition-none select-none' : ''
            }`}
          >
            {/* ========================================================= */}
            {/* TAY NẮM KÉO DÃN CẠNH NGANG, CẠNH DỌC VÀ CÁC GÓC            */}
            {/* ========================================================= */}
            {!isModalMaximized && (
              <>
                {/* 1. Cạnh phải: Kéo dãn ngang */}
                <div
                  onMouseDown={(e) => startResize('right', e)}
                  title="Kéo sang hai bên để thay đổi chiều rộng cửa sổ"
                  className="absolute right-0 top-6 bottom-6 w-3.5 cursor-ew-resize hover:bg-emerald-500/20 active:bg-emerald-500/40 z-40 transition-colors group flex items-center justify-end pr-0.5"
                >
                  <span className="w-1.5 h-16 rounded-full bg-slate-300 group-hover:bg-emerald-600 transition" />
                </div>

                {/* 2. Cạnh trái: Kéo dãn ngang */}
                <div
                  onMouseDown={(e) => startResize('left', e)}
                  title="Kéo sang hai bên để thay đổi chiều rộng cửa sổ"
                  className="absolute left-0 top-6 bottom-6 w-3.5 cursor-ew-resize hover:bg-emerald-500/20 active:bg-emerald-500/40 z-40 transition-colors group flex items-center justify-start pl-0.5"
                >
                  <span className="w-1.5 h-16 rounded-full bg-slate-300 group-hover:bg-emerald-600 transition" />
                </div>

                {/* 3. Cạnh dưới: Kéo dãn dọc */}
                <div
                  onMouseDown={(e) => startResize('bottom', e)}
                  title="Kéo lên / xuống để thay đổi chiều cao cửa sổ"
                  className="absolute bottom-0 left-6 right-6 h-3.5 cursor-ns-resize hover:bg-emerald-500/20 active:bg-emerald-500/40 z-40 transition-colors group flex items-end justify-center pb-0.5"
                >
                  <span className="h-1.5 w-20 rounded-full bg-slate-300 group-hover:bg-emerald-600 transition" />
                </div>

                {/* 4. Cạnh trên: Kéo dãn dọc */}
                <div
                  onMouseDown={(e) => startResize('top', e)}
                  title="Kéo lên / xuống để thay đổi chiều cao cửa sổ"
                  className="absolute top-0 left-12 right-24 h-3 cursor-ns-resize hover:bg-emerald-500/20 active:bg-emerald-500/40 z-40 transition-colors group flex items-start justify-center pt-0.5"
                >
                  <span className="h-1.5 w-20 rounded-full bg-slate-300 group-hover:bg-emerald-600 transition" />
                </div>

                {/* 5. Góc dưới - phải (Kéo cả ngang & dọc) */}
                <div
                  onMouseDown={(e) => startResize('bottom right', e)}
                  title="Kéo góc để thay đổi cả 2 chiều"
                  className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize z-50 flex items-end justify-end p-1 text-slate-400 hover:text-emerald-700"
                >
                  <svg width="12" height="12" viewBox="0 0 10 10" fill="currentColor">
                    <circle cx="8" cy="8" r="1.2" />
                    <circle cx="4" cy="8" r="1.2" />
                    <circle cx="8" cy="4" r="1.2" />
                  </svg>
                </div>

                {/* 6. Góc dưới - trái */}
                <div
                  onMouseDown={(e) => startResize('bottom left', e)}
                  title="Kéo góc để thay đổi cả 2 chiều"
                  className="absolute bottom-0 left-0 w-5 h-5 cursor-nesw-resize z-50"
                />

                {/* 7. Góc trên - phải */}
                <div
                  onMouseDown={(e) => startResize('top right', e)}
                  title="Kéo góc để thay đổi cả 2 chiều"
                  className="absolute top-0 right-0 w-4 h-4 cursor-nesw-resize z-30"
                />

                {/* 8. Góc trên - trái */}
                <div
                  onMouseDown={(e) => startResize('top left', e)}
                  title="Kéo góc để thay đổi cả 2 chiều"
                  className="absolute top-0 left-0 w-5 h-5 cursor-nwse-resize z-50"
                />
              </>
            )}

            {/* Lớp phủ chặn bôi đen văn bản khi đang kéo dãn cửa sổ */}
            {isResizing && (
              <div
                className={`fixed inset-0 z-[9999] select-none ${
                  isResizing === 'left' || isResizing === 'right'
                    ? 'cursor-ew-resize'
                    : isResizing === 'top' || isResizing === 'bottom'
                    ? 'cursor-ns-resize'
                    : isResizing.includes('nwse') || isResizing.includes('right')
                    ? 'cursor-nwse-resize'
                    : 'cursor-nesw-resize'
                }`}
              />
            )}

            {/* Modal Header */}
            <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 shrink-0 select-none">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-[#2D5A27] shrink-0">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                    Soạn Thư Mời Phỏng Vấn (Gửi qua Gmail)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Ứng viên: <strong className="text-slate-800">{interviewModalData.app.ho_ten}</strong> · Email: <span className="font-mono text-blue-700 font-semibold">{interviewModalData.app.email}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Nút Phóng to / Thu nhỏ */}
                <button
                  type="button"
                  onClick={() => setIsModalMaximized(!isModalMaximized)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
                  title={isModalMaximized ? 'Thu nhỏ kích thước' : 'Phóng to toàn màn hình'}
                >
                  {isModalMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Nút Đóng */}
                <button
                  type="button"
                  onClick={() => setInterviewModalData(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
                  title="Đóng cửa sổ"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSendInterviewEmail} className="flex-1 flex flex-col min-h-0 overflow-hidden text-xs">
              {/* KHU VỰC THÔNG TIN LỊCH PHỎNG VẤN (Cố định ở trên, có thể thu gọn nếu muốn dành toàn bộ không gian viết thư) */}
              {isDetailsCollapsed ? (
                <div className="px-5 py-2 border-b border-slate-200 bg-slate-50/90 shrink-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 sm:gap-3 overflow-hidden text-slate-700">
                    <span className="font-semibold text-slate-900 truncate">
                      Tiêu đề: {interviewModalData.subject}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="truncate">Thời gian: <strong className="text-slate-800">{interviewModalData.interviewDate}</strong></span>
                    <span className="text-slate-300 hidden sm:inline">|</span>
                    <span className="truncate hidden sm:inline">Địa điểm: {interviewModalData.interviewLocation}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDetailsCollapsed(false)}
                    className="ml-2 px-2.5 py-1 rounded-lg text-[11px] text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 font-bold shrink-0 flex items-center gap-1 cursor-pointer transition border border-emerald-200"
                  >
                    <span>Sửa thông tin lịch</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 shrink-0 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Thông tin buổi phỏng vấn
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsDetailsCollapsed(true)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition hover:bg-slate-200/60 px-2 py-0.5 rounded-lg"
                      title="Thu gọn để dành thêm không gian soạn thảo thư"
                    >
                      <span>Thu gọn thông tin</span>
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Dòng 1: Tiêu đề email & Vị trí ứng tuyển */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Tiêu đề email thư mời:
                      </label>
                      <input
                        type="text"
                        required
                        value={interviewModalData.subject}
                        onChange={(e) =>
                          setInterviewModalData((prev) => (prev ? { ...prev, subject: e.target.value } : null))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#2D5A27] bg-white font-medium text-slate-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Vị trí ứng tuyển:
                      </label>
                      <div className="px-2.5 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 font-bold border border-emerald-200 truncate">
                        {interviewModalData.jobTitle}
                      </div>
                    </div>
                  </div>

                  {/* Dòng 2: Thời gian, Địa điểm, Người liên hệ, Hotline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Thời gian PV:
                      </label>
                      <input
                        type="text"
                        required
                        value={interviewModalData.interviewDate}
                        onChange={(e) =>
                          setInterviewModalData((prev) => (prev ? { ...prev, interviewDate: e.target.value } : null))
                        }
                        placeholder="09:30 - Thứ Năm, 15/10/2026"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#2D5A27] bg-white font-medium text-slate-900 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Địa điểm PV:
                      </label>
                      <input
                        type="text"
                        required
                        value={interviewModalData.interviewLocation}
                        onChange={(e) =>
                          setInterviewModalData((prev) => (prev ? { ...prev, interviewLocation: e.target.value } : null))
                        }
                        placeholder="Trụ sở PetM&M Thủ Đức"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#2D5A27] bg-white font-medium text-slate-900 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Người liên hệ:
                      </label>
                      <input
                        type="text"
                        value={interviewModalData.contactPerson}
                        onChange={(e) =>
                          setInterviewModalData((prev) => (prev ? { ...prev, contactPerson: e.target.value } : null))
                        }
                        placeholder="Ban Tuyển Dụng"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#2D5A27] bg-white font-medium text-slate-900 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        Hotline hỗ trợ:
                      </label>
                      <input
                        type="text"
                        value={interviewModalData.contactPhone}
                        onChange={(e) =>
                          setInterviewModalData((prev) => (prev ? { ...prev, contactPhone: e.target.value } : null))
                        }
                        placeholder="0987 654 321"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-[#2D5A27] bg-white font-medium text-slate-900 text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* KHU VỰC SOẠN THẢO THƯ WORD (Toolbar cố định ở đỉnh editor KHÔNG BAO GIỜ BỊ HỞ KHE, nội dung cuộn bên dưới) */}
              <div className="flex-1 flex flex-col min-h-0 px-5 py-3 overflow-hidden bg-white">
                <div className="flex items-center justify-between mb-1.5 shrink-0">
                  <label className="text-xs font-bold text-slate-900">
                    Nội dung thư mời phỏng vấn:
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Dùng thanh công cụ Word bên dưới để in đậm (<strong>B</strong>), đổi cỡ chữ, danh sách...
                  </span>
                </div>

                <RichTextEditor
                  value={interviewModalData.content}
                  onChange={(html) =>
                    setInterviewModalData((prev) => (prev ? { ...prev, content: html } : null))
                  }
                  containerClassName="flex-1 flex flex-col min-h-0 border border-slate-300 rounded-xl overflow-hidden shadow-2xs"
                  contentClassName="flex-1 overflow-y-auto min-h-0"
                  stickyTopClass=""
                  minHeight={180}
                />
              </div>

              {/* MODAL ACTIONS (Fixed at bottom) */}
              <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/90 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="hidden sm:inline">↔ Kéo cạnh ngang hoặc ↕ cạnh dọc để kéo dãn cửa sổ</span>
                </div>

                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => setInterviewModalData(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>

                  <button
                    type="submit"
                    disabled={interviewModalData.isSending}
                    className="px-5 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white font-bold shadow transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {interviewModalData.isSending ? 'Đang gửi qua Gmail...' : 'Gửi Thư Mời PV (Qua Gmail)'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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

              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Language Switcher Tabs & Auto-Translate (Theo Ảnh 2) */}
            <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
              {/* Tab Ngôn ngữ */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalTab('vi')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    modalTab === 'vi'
                      ? 'bg-[#2D5A27] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                  <span>Bản Tiếng Việt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setModalTab('en')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    modalTab === 'en'
                      ? 'bg-[#2D5A27] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UKFlag className="w-4 h-3 rounded-[2px]" />
                  <span>Bản English</span>
                </button>
              </div>

              {/* Nút Chuyển đổi ENG */}
              <button
                type="button"
                onClick={handleTranslateJob}
                disabled={isTranslating}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs hover:shadow transition disabled:opacity-50 cursor-pointer"
                title="Tự động dịch sang tiếng Anh bằng AI"
              >
                {isTranslating ? (
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>{isTranslating ? 'Đang chuyển đổi...' : 'Chuyển đổi ENG'}</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveJob} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* 1. Ảnh bìa vị trí tuyển dụng đưa lên đầu */}
              <div className="space-y-1.5 pb-1">
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

              {/* Thứ tự sắp xếp & Trạng thái hiển thị (Mã định danh đã được ẩn) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2 items-center">
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

                <div className="pt-2 sm:pt-5">
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
              </div>

              {/* Tiêu đề & Phòng ban */}
              {modalTab === 'vi' ? (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Tiêu đề vị trí: *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingJob.tieu_de || ''}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setEditingJob((prev) => {
                          if (!prev) return prev;
                          return {
                            ...prev,
                            tieu_de: newTitle,
                            id: isCreatingNew || !prev.id ? generateSlug(newTitle) : prev.id,
                          };
                        });
                      }}
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
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  {/* Mô tả, Yêu cầu, Quyền lợi */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Mô tả công việc:
                    </label>
                    <textarea
                      rows={6}
                      value={editingJob.mo_ta || ''}
                      onChange={(e) => setEditingJob((prev) => ({ ...prev, mo_ta: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white text-sm leading-relaxed focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Yêu cầu ứng viên:
                    </label>
                    <textarea
                      rows={5}
                      value={editingJob.yeu_cau || ''}
                      onChange={(e) => setEditingJob((prev) => ({ ...prev, yeu_cau: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white text-sm leading-relaxed focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Quyền lợi & Đãi ngộ:
                    </label>
                    <textarea
                      rows={5}
                      value={editingJob.quyen_loi || ''}
                      onChange={(e) => setEditingJob((prev) => ({ ...prev, quyen_loi: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white text-sm leading-relaxed focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Job Title:
                    </label>
                    <input
                      type="text"
                      value={editingJob.tieu_de_en || ''}
                      onChange={(e) => setEditingJob((prev) => ({ ...prev, tieu_de_en: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white font-semibold focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Department:
                      </label>
                      <input
                        type="text"
                        value={editingJob.phong_ban_en || ''}
                        onChange={(e) => setEditingJob((prev) => ({ ...prev, phong_ban_en: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Work Type:
                      </label>
                      <input
                        type="text"
                        value={editingJob.hinh_thuc_en || ''}
                        onChange={(e) => setEditingJob((prev) => ({ ...prev, hinh_thuc_en: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Salary / Compensation:
                      </label>
                      <input
                        type="text"
                        value={editingJob.muc_luong_en || ''}
                        onChange={(e) => setEditingJob((prev) => ({ ...prev, muc_luong_en: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white font-bold text-amber-900 focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Experience:
                      </label>
                      <input
                        type="text"
                        value={editingJob.kinh_nghiem_en || ''}
                        onChange={(e) => setEditingJob((prev) => ({ ...prev, kinh_nghiem_en: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Work Location:
                    </label>
                    <input
                      type="text"
                      value={editingJob.dia_diem_en || ''}
                      onChange={(e) => setEditingJob((prev) => ({ ...prev, dia_diem_en: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Job Description:
                    </label>
                    <textarea
                      rows={6}
                      value={editingJob.mo_ta_en || ''}
                      onChange={(e) => setEditingJob((prev) => ({ ...prev, mo_ta_en: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white text-sm leading-relaxed focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Requirements:
                    </label>
                    <textarea
                      rows={5}
                      value={editingJob.yeu_cau_en || ''}
                      onChange={(e) => setEditingJob((prev) => ({ ...prev, yeu_cau_en: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white text-sm leading-relaxed focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Benefits & Privileges:
                    </label>
                    <textarea
                      rows={5}
                      value={editingJob.quyen_loi_en || ''}
                      onChange={(e) => setEditingJob((prev) => ({ ...prev, quyen_loi_en: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white text-sm leading-relaxed focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>
                </>
              )}

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
