'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { sanitizeHtml } from '@/lib/sanitize';
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  Calendar,
  Users,
  CheckCircle2,
  PhoneCall,
  Mail,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Share2,
  FileText,
  Send,
  Building,
  Paperclip,
  UploadCloud,
  Loader2,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { supabase, TuyenDungRecord } from '@/lib/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { useSystemConfig } from '@/context/SystemConfigContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FloatingContactWidgets from '@/components/FloatingContactWidgets';
import ScrollNavigationButtons from '@/components/ScrollNavigationButtons';
import PetMMBrand from '@/components/PetMMBrand';
import { getAssetUrl } from '@/lib/assets';

interface Props {
  job: TuyenDungRecord;
  otherJobs: TuyenDungRecord[];
}

function FormattedLongText({ content }: { content: string }) {
  if (!content) return null;

  // Kiểm tra nếu nội dung chứa thẻ HTML cũ (<p>, <ul>, <li>, <br>, <div>)
  const hasHtml = /<[a-z][\s\S]*>/i.test(content);
  if (hasHtml) {
    return (
      <div
        className="prose prose-sm sm:prose max-w-none text-slate-700 leading-relaxed space-y-3 font-normal prose-p:my-2 prose-ul:my-2 prose-li:my-1"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
      />
    );
  }

  // Tách dòng văn bản thuần túy theo dấu xuống dòng
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  return (
    <div className="space-y-2.5 text-slate-700 text-sm sm:text-base leading-relaxed">
      {lines.map((line, idx) => {
        // Nhận diện gạch đầu dòng: "- ", "• ", "* ", "+ " hoặc bắt đầu bằng "-"
        const bulletMatch = line.match(/^[-•*+]\s*(.*)$/);
        if (bulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-3">
              <span className="inline-block w-2 h-2 rounded-full bg-[#2D5A27] mt-2 shrink-0" />
              <span className="flex-1 text-slate-800 leading-relaxed">{bulletMatch[1]}</span>
            </div>
          );
        }

        // Đoạn văn bản thông thường
        return (
          <p key={idx} className="text-slate-800 leading-relaxed">
            {line}
          </p>
        );
      })}
    </div>
  );
}

export default function TuyenDungDetailClient({ job: initialJob, otherJobs }: Props) {
  const [job, setJob] = useState<TuyenDungRecord>(initialJob);
  const { language, isEn } = useLanguage();
  const { config } = useSystemConfig();

  useEffect(() => {
    setJob(initialJob);
  }, [initialJob]);

  useEffect(() => {
    if (!initialJob?.id) return;

    const refetchJob = async () => {
      try {
        const { data } = await supabase
          .from('tuyen_dung')
          .select('*')
          .eq('id', initialJob.id)
          .maybeSingle();
        if (data) setJob(data as TuyenDungRecord);
      } catch {}
    };

    const handleFocus = () => { refetchJob(); };
    window.addEventListener('focus', handleFocus);

    const channel = supabase
      .channel(`realtime_job_detail_${initialJob.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tuyen_dung', filter: `id=eq.${initialJob.id}` },
        (payload) => {
          if (payload.new) {
            setJob(payload.new as TuyenDungRecord);
          } else {
            refetchJob();
          }
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('focus', handleFocus);
      supabase.removeChannel(channel);
    };
  }, [initialJob?.id]);

  // Form ứng tuyển state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [cvLink, setCvLink] = useState('');
  const [notes, setNotes] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState('');
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [cvMode, setCvMode] = useState<'file' | 'link'>('file');
  const [hpWebsite, setHpWebsite] = useState('');
  const [submittedData, setSubmittedData] = useState<{
    fullName: string;
    phoneNumber: string;
    email: string;
    jobTitle: string;
    appliedAt: string;
    cvName?: string;
  } | null>(null);

  // State upload file PDF trực tiếp
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [isUploadingPdf, setIsUploadingPdf] = useState<boolean>(false);
  const [pdfUploadError, setPdfUploadError] = useState<string>('');

  const hotlineRaw = (config.hotline || '0903 599 339').replace(/\s+/g, '');
  const hotlineDisplay = config.hotline_hien_thi || config.hotline || '0903 599 339';
  const zaloUrl = config.link_zalo || 'https://zalo.me/0903599339';
  const emailContact = config.smtp_notify_recruitment_email || config.smtp_email || config.email || 'tuyendung@petmm.vn';

  const jobTitle = (isEn && job.tieu_de_en) ? job.tieu_de_en : job.tieu_de;
  const jobDept = (isEn && job.phong_ban_en) ? job.phong_ban_en : (job.phong_ban || 'Y Khoa & Điều Trị');
  const jobSalary = (isEn && job.muc_luong_en) ? job.muc_luong_en : (job.muc_luong || 'Thỏa thuận theo năng lực');
  const jobLocation = (isEn && job.dia_diem_en) ? job.dia_diem_en : (job.dia_diem || 'TP. Thủ Đức, TP. Hồ Chí Minh');
  const jobWorkType = (isEn && job.hinh_thuc_en) ? job.hinh_thuc_en : (job.hinh_thuc || 'Toàn thời gian');
  const jobExp = (isEn && job.kinh_nghiem_en) ? job.kinh_nghiem_en : (job.kinh_nghiem || 'Có kinh nghiệm');
  const jobDesc = (isEn && job.mo_ta_en) ? job.mo_ta_en : (job.mo_ta || '');
  const jobReq = (isEn && job.yeu_cau_en) ? job.yeu_cau_en : (job.yeu_cau || '');
  const jobBenefits = (isEn && job.quyen_loi_en) ? job.quyen_loi_en : (job.quyen_loi || '');

  // Cập nhật Document Title
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const title = `${jobTitle} | Tuyển Dụng PetM&M`;
    document.title = title;
  }, [jobTitle]);

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: jobTitle,
        text: `Cơ hội nghề nghiệp tại PetM&M: ${jobTitle}`,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert(isEn ? 'File size must be under 15MB.' : 'Kích thước file tối đa 15MB.');
      return;
    }

    setPdfFile(file);
    setIsUploadingPdf(true);
    setPdfUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/recruitment/upload-cv', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || (isEn ? 'Failed to upload CV file.' : 'Không thể tải file CV lên hệ thống.'));
      }

      setPdfUrl(data.url);
    } catch (err: any) {
      console.error('Lỗi tải file CV:', err);
      setPdfUploadError(err.message || (isEn ? 'Error uploading CV file.' : 'Lỗi khi tải file CV.'));
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleRemovePdf = () => {
    setPdfFile(null);
    setPdfUrl('');
    setPdfUploadError('');
  };

  // Kiểm tra live xem email hoặc số điện thoại này đã từng ứng tuyển vị trí này chưa
  const checkDuplicate = async (emailVal: string, phoneVal: string) => {
    const cleanE = (emailVal || '').trim().toLowerCase();
    const cleanP = (phoneVal || '').replace(/\D/g, '');
    if ((!cleanE || !cleanE.includes('@')) && (!cleanP || cleanP.length < 8)) {
      setDuplicateWarning('');
      return;
    }
    if (!job?.id) return;

    setIsCheckingDuplicate(true);
    try {
      const params = new URLSearchParams();
      if (cleanE && cleanE.includes('@')) params.set('email', cleanE);
      if (cleanP && cleanP.length >= 8) params.set('phone', cleanP);
      params.set('jobId', job.id);
      params.set('lang', language);

      const res = await fetch(`/api/recruitment/apply?${params.toString()}`);
      const data = await res.json();
      if (data?.hasApplied) {
        setDuplicateWarning(
          data.message ||
            (isEn
              ? 'This email or phone number has already applied for this position. Our HR team is reviewing your profile!'
              : 'Email hoặc số điện thoại này đã ứng tuyển vị trí này rồi. Ban nhân sự đang xét duyệt hồ sơ của bạn!')
        );
      } else {
        setDuplicateWarning('');
      }
    } catch (err) {
      console.warn('Lỗi kiểm tra trùng ứng tuyển:', err);
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  // Tự động kiểm tra live khi ứng viên nhập Email hoặc Số điện thoại (chống spam/nộp trùng)
  useEffect(() => {
    const cleanE = email.trim().toLowerCase();
    const cleanP = phoneNumber.replace(/\D/g, '');
    if ((!cleanE || !cleanE.includes('@')) && (!cleanP || cleanP.length < 9)) {
      return;
    }

    const timer = setTimeout(() => {
      checkDuplicate(cleanE, cleanP);
    }, 400);

    return () => clearTimeout(timer);
  }, [email, phoneNumber, job?.id]);

  // Gửi hồ sơ ứng tuyển: Xác thực và chống trùng lặp / spam 100%
  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!fullName.trim() || !phoneNumber.trim()) {
      setSubmitError(isEn ? 'Please fill in your full name and phone number.' : 'Vui lòng nhập họ tên và số điện thoại.');
      return;
    }

    const cleanPhone = (phoneNumber || '').replace(/\D/g, '');
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      setSubmitError(isEn ? 'Please enter a valid phone number (8-15 digits).' : 'Vui lòng nhập số điện thoại hợp lệ (8 - 15 chữ số).');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setSubmitError(isEn ? 'Please enter a valid email address.' : 'Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    // Bắt buộc đính kèm CV (File hoặc Link)
    const finalCvLink = pdfUrl || cvLink.trim();
    if (!finalCvLink && !pdfFile) {
      setSubmitError(
        isEn
          ? 'Please attach a CV file (PDF) or paste your CV link.'
          : 'Vui lòng tải file CV (PDF) hoặc dán đường link CV của bạn.'
      );
      return;
    }

    if (duplicateWarning) {
      setSubmitError(duplicateWarning);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/recruitment/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: jobTitle,
          fullName: fullName.trim(),
          phoneNumber: cleanPhone,
          email: email.trim(),
          pdfUrl: pdfUrl || '',
          pdfFileName: pdfFile?.name || '',
          cvLink: cvLink.trim(),
          notes: notes.trim(),
          isEn,
          hp_website: hpWebsite,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.code === 'ALREADY_APPLIED') {
          setDuplicateWarning(data.message);
        }
        throw new Error(data.message || (isEn ? 'Failed to submit application.' : 'Không thể gửi hồ sơ ứng tuyển.'));
      }

      // NỘP THÀNH CÔNG: Chuyển sang màn hình kết quả ngay lập tức
      const nowFormatted = new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }).format(new Date());

      const currentCvDisplay = pdfFile?.name
        ? pdfFile.name
        : (cvLink.trim() ? cvLink.trim() : (isEn ? 'Attached CV' : 'Đã đính kèm'));

      setSubmittedData({
        fullName: fullName.trim(),
        phoneNumber: cleanPhone,
        email: email.trim(),
        jobTitle: jobTitle,
        appliedAt: nowFormatted,
        cvName: currentCvDisplay,
      });

      setFormSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || (isEn ? 'An error occurred. Please try again!' : 'Đã có lỗi xảy ra. Vui lòng thử lại!'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF7] text-slate-900 selection:bg-[#FFB800] selection:text-slate-900">
      {/* 0. Header cố định */}
      <Header alwaysVisible />

      <main className="flex-1 pt-[64px] sm:pt-[72px]">
        {/* 1. Hero Banner Tuyển Dụng */}
        <div className="relative py-12 sm:py-16 bg-gradient-to-b from-[#183B16] via-[#102B0F] to-[#0B1E0A] text-white overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
            <Image
              src={getAssetUrl(job.hinh_anh || '/about_hospital.jpg')}
              alt={jobTitle}
              fill
              className="object-cover object-center"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,184,0,0.12),transparent_70%)] pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top Badges & Share Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                  {jobDept}
                </span>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/10 text-white/90">
                  {jobWorkType}
                </span>
              </div>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-sm transition border border-white/10 cursor-pointer"
                title="Chia sẻ tin tuyển dụng"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copySuccess ? (isEn ? 'Link copied!' : 'Đã sao chép link!') : (isEn ? 'Share Job' : 'Chia sẻ')}</span>
              </button>
            </div>

            {/* Main Job Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {jobTitle}
            </h1>

            {/* Key Information Badges Row */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-emerald-100/90">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-black shadow-sm">
                <DollarSign className="w-4 h-4 shrink-0" />
                <span>{jobSalary}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl">
                <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>{jobLocation}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl">
                <Clock className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>
                  {isEn ? 'Exp: ' : 'Kinh nghiệm: '}
                  {jobExp}
                </span>
              </div>

              {job.han_nop && (
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-xl">
                  <Calendar className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>
                    {isEn ? 'Deadline: ' : 'Hạn nộp: '}
                    <strong className="text-amber-300">{job.han_nop}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Sticky Breadcrumb Bar */}
        <div className="sticky top-[64px] sm:top-[72px] z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs py-2.5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 overflow-hidden whitespace-nowrap text-ellipsis">
              <Link href="/" className="hover:text-emerald-800 transition">
                {isEn ? 'Home' : 'Trang chủ'}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <Link href="/tuyen-dung" className="hover:text-emerald-800 transition">
                {isEn ? 'Careers' : 'Tuyển dụng'}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <span className="text-slate-900 font-semibold truncate">{jobTitle}</span>
            </div>

            <a
              href="#apply"
              className="shrink-0 px-4 py-1.5 rounded-lg bg-[#2D5A27] hover:bg-[#1E3F1A] text-white font-bold transition shadow-xs"
            >
              {isEn ? 'Apply Now' : 'Ứng Tuyển Ngay'}
            </a>
          </div>
        </div>

        {/* 3. Main Content: Căn giữa nguyên khối, mở rộng chiều ngang */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
          {/* Box 1: Tổng quan nhanh thông số */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">
                    {isEn ? 'Compensation' : 'Mức thu nhập'}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-emerald-800 font-mono">
                    {jobSalary}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-1">
                    {isEn ? 'Job Type' : 'Hình thức làm việc'}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {jobWorkType}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-1">
                    {isEn ? 'Experience Required' : 'Kinh nghiệm yêu cầu'}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {jobExp}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-1">
                    {isEn ? 'Open Slots' : 'Số lượng cần tuyển'}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-900">
                    {job.so_luong ? `${job.so_luong} ${isEn ? 'persons' : 'nhân sự'}` : (isEn ? 'Open' : 'Đang tuyển')}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-1">
                    {isEn ? 'Application Deadline' : 'Hạn nộp hồ sơ'}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-rose-600">
                    {job.han_nop || (isEn ? 'Until filled' : 'Đến khi đủ')}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-1">
                    {isEn ? 'Work Location' : 'Địa điểm làm việc'}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 truncate block">
                    {jobLocation}
                  </span>
                </div>
              </div>

              {/* Bài viết chi tiết công việc: Gom Mô tả, Yêu cầu & Quyền lợi vào 1 bài viết liền mạch */}
              {(jobDesc || jobReq || jobBenefits) && (
                <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-8">
                  {jobDesc && (
                    <div className="space-y-3">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-[#2D5A27] pl-3">
                        {isEn ? 'Job Responsibilities' : 'Mô Tả Công Việc'}
                      </h2>
                      <div className="pt-1">
                        <FormattedLongText content={jobDesc} />
                      </div>
                    </div>
                  )}

                  {jobReq && (
                    <div className="space-y-3 pt-6 border-t border-slate-100">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-[#2D5A27] pl-3">
                        {isEn ? 'Candidate Requirements' : 'Yêu Cầu Ứng Viên'}
                      </h2>
                      <div className="pt-1">
                        <FormattedLongText content={jobReq} />
                      </div>
                    </div>
                  )}

                  {jobBenefits && (
                    <div className="space-y-3 pt-6 border-t border-slate-100">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 border-l-4 border-[#2D5A27] pl-3">
                        {isEn ? 'Privileges & Benefits' : 'Quyền Lợi & Đãi Ngộ Vượt Trội'}
                      </h2>
                      <div className="pt-1">
                        <FormattedLongText content={jobBenefits} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Box 5: Form Ứng Tuyển Nhanh */}
              <div id="apply" className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center shrink-0">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      {isEn ? 'Job Application Form' : 'Ứng Tuyển Vị Trí Này'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600">
                      {isEn
                        ? 'Submit your application directly to PetM&M HR.'
                        : 'Gửi hồ sơ ứng tuyển trực tiếp đến Ban Nhân Sự PetM&M.'}
                    </p>
                  </div>
                </div>

                {formSubmitted && submittedData ? (
                  <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 text-center my-4 space-y-5">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-200">
                      <CheckCircle2 className="w-6 h-6 text-[#2D5A27]" />
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                        {isEn ? 'Application Submitted Successfully' : 'Đã Nộp Hồ Sơ Ứng Tuyển Thành Công'}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                        {isEn
                          ? `Your application for "${jobTitle}" has been received by PetM&M HR.`
                          : `Hồ sơ ứng tuyển vị trí "${jobTitle}" của bạn đã được chuyển đến Ban Nhân Sự PetM&M.`}
                      </p>
                    </div>

                    {/* Bảng tóm tắt thông tin hồ sơ */}
                    <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200 text-left text-xs sm:text-sm space-y-2.5 max-w-md mx-auto">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                        <span className="text-slate-500">{isEn ? 'Applicant:' : 'Họ và tên:'}</span>
                        <strong className="text-slate-900">{submittedData.fullName}</strong>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                        <span className="text-slate-500">{isEn ? 'Phone number:' : 'Số điện thoại:'}</span>
                        <strong className="text-slate-900 font-mono">{submittedData.phoneNumber}</strong>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                        <span className="text-slate-500">Email:</span>
                        <strong className="text-slate-900 font-mono">{submittedData.email}</strong>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                        <span className="text-slate-500">{isEn ? 'Position:' : 'Vị trí:'}</span>
                        <strong className="text-[#2D5A27]">{submittedData.jobTitle}</strong>
                      </div>
                      {submittedData.cvName && (
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                          <span className="text-slate-500">{isEn ? 'CV Resume:' : 'Hồ sơ CV:'}</span>
                          <strong className="text-slate-900 truncate max-w-[200px]">{submittedData.cvName}</strong>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">{isEn ? 'Submitted at:' : 'Thời gian nộp:'}</span>
                        <span className="text-slate-600 font-mono text-xs">{submittedData.appliedAt}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      {isEn
                        ? 'Our HR department will review your profile and contact you within 24 – 48 business hours via phone or Zalo.'
                        : 'Ban Nhân Sự PetM&M sẽ xem xét hồ sơ và liên hệ với bạn trong vòng 24 – 48 giờ làm việc qua điện thoại hoặc Zalo.'}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <Link
                        href="/tuyen-dung"
                        className="px-5 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#1E3F1A] text-white text-xs font-semibold transition"
                      >
                        {isEn ? 'Explore Other Openings' : 'Xem Các Vị Trí Khác'}
                      </Link>

                      <Link
                        href="/"
                        className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition"
                      >
                        {isEn ? 'Back to Home' : 'Về Trang Chủ'}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitApplication} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {isEn ? 'Full Name *' : 'Họ và tên của bạn *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          {isEn ? 'Phone Number *' : 'Số điện thoại liên hệ *'}
                        </label>
                        <input
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            if (duplicateWarning) setDuplicateWarning('');
                          }}
                          onBlur={(e) => checkDuplicate(email, e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {isEn ? 'Email Address *' : 'Địa chỉ Email của bạn *'}
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (duplicateWarning) setDuplicateWarning('');
                        }}
                        onBlur={(e) => checkDuplicate(e.target.value, phoneNumber)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 ${
                          duplicateWarning
                            ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                            : 'border-slate-300 focus:ring-[#2D5A27]'
                        }`}
                      />

                      {isCheckingDuplicate && (
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                          <span>{isEn ? 'Checking application history...' : 'Đang kiểm tra tình trạng ứng tuyển...'}</span>
                        </p>
                      )}

                      {duplicateWarning && (
                        <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1.5 bg-rose-50 border border-rose-200/80 px-3 py-1.5 rounded-lg">
                          <span>⚠️ {duplicateWarning}</span>
                        </p>
                      )}
                    </div>

                    {/* VÙNG ĐÍNH KÈM FILE HOẶC DÁN LINK CV */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-emerald-700" />
                          <span>
                            {isEn
                              ? 'Resume / CV (Attach PDF file or paste link) *'
                              : 'Hồ Sơ CV (Gắn file PDF hoặc Dán link CV) *'}
                          </span>
                        </label>
                        <span className="text-[11px] text-slate-400">PDF, DOC, DOCX (tối đa 15MB)</span>
                      </div>

                      {/* 2 nút lựa chọn gọn gàng: Tải File & Link */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCvMode('file')}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            cvMode === 'file'
                              ? 'bg-[#2D5A27] text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>{isEn ? 'Upload File' : 'Tải File'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setCvMode('link')}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            cvMode === 'link'
                              ? 'bg-[#2D5A27] text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>Link</span>
                        </button>
                      </div>

                      {/* Nội dung tương ứng với chế độ */}
                      {cvMode === 'file' ? (
                        pdfUrl ? (
                          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs text-slate-900 font-medium">
                            <div className="flex items-center gap-2 truncate">
                              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="truncate">{pdfFile?.name || 'File_CV_Ung_Tuyen.pdf'}</span>
                              <span className="text-[11px] text-emerald-600 shrink-0 font-medium">(Đã sẵn sàng)</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-emerald-800 underline hover:text-emerald-950"
                              >
                                {isEn ? 'View' : 'Xem file'}
                              </a>
                              <button
                                type="button"
                                onClick={handleRemovePdf}
                                className="p-1 rounded-md text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Xóa file và chọn lại"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-emerald-600 text-slate-800 text-xs font-semibold cursor-pointer transition hover:bg-slate-50">
                              {isUploadingPdf ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                                  <span>{isEn ? 'Uploading...' : 'Đang tải file lên...'}</span>
                                </>
                              ) : (
                                <>
                                  <UploadCloud className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>{isEn ? 'Upload CV File' : 'Tải File CV'}</span>
                                </>
                              )}
                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                disabled={isUploadingPdf}
                                onChange={handleFileChange}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )
                      ) : (
                        <div>
                          <input
                            type="url"
                            value={cvLink}
                            onChange={(e) => setCvLink(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
                          />
                        </div>
                      )}

                      {pdfUploadError && (
                        <p className="text-[11px] text-rose-600">{pdfUploadError}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {isEn ? 'Self Introduction / Highlights' : 'Giới thiệu ngắn về kinh nghiệm & mong muốn'}
                      </label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
                      />
                    </div>

                    {submitError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                        <span>⚠️ {submitError}</span>
                      </div>
                    )}

                    {/* Nút gửi và Hotline + Email nhà tuyển dụng ngay cạnh */}
                    <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <button
                        type="submit"
                        disabled={isUploadingPdf || isSubmitting || !!duplicateWarning}
                        className="py-3 px-6 rounded-xl bg-[#2D5A27] hover:bg-[#1E3F1A] text-white font-bold text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>{isEn ? 'Submitting...' : 'Đang xử lý hồ sơ...'}</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 text-white" />
                            <span>{isEn ? 'Submit Application' : 'Gửi Hồ Sơ Ứng Tuyển Ngay'}</span>
                          </>
                        )}
                      </button>

                      {emailContact && (
                        <a
                          href={`mailto:${emailContact}`}
                          className="py-2.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition flex items-center gap-1.5"
                        >
                          <Mail className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="font-mono">{emailContact}</span>
                        </a>
                      )}
                    </div>
                  </form>
                )}
              </div>

            {/* Các vị trí tuyển dụng khác: Căn giữa ở cuối trang theo hàng ngang */}
            {otherJobs && otherJobs.length > 0 && (
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    {isEn ? 'Other Career Openings' : 'Các Vị Trí Tuyển Dụng Khác'}
                  </h3>
                  <Link
                    href="/tuyen-dung"
                    className="text-xs text-emerald-800 hover:text-emerald-950 font-bold underline"
                  >
                    {isEn ? 'View all openings' : 'Xem toàn bộ vị trí đang tuyển'}
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                  {otherJobs.map((oj) => {
                    const ojTitle = (isEn && oj.tieu_de_en) ? oj.tieu_de_en : oj.tieu_de;
                    const ojSalary = (isEn && oj.muc_luong_en) ? oj.muc_luong_en : oj.muc_luong;
                    return (
                      <Link
                        key={oj.id}
                        href={`/tuyen-dung/${oj.id}`}
                        className="block p-4 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-300 transition group"
                      >
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition line-clamp-1">
                          {ojTitle}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                          <span className="text-emerald-700 font-semibold font-mono">{ojSalary}</span>
                          <span className="text-slate-400 group-hover:text-emerald-700 transition">
                            {isEn ? 'Details →' : 'Chi tiết →'}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      </main>

      {/* 4. Footer & Widgets */}
      <Footer />
      <FloatingContactWidgets />
      <ScrollNavigationButtons />
    </div>
  );
}
