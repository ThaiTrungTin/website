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

export default function TuyenDungDetailClient({ job, otherJobs }: Props) {
  const { language, isEn } = useLanguage();
  const { config } = useSystemConfig();

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
  const [emailDuplicateWarning, setEmailDuplicateWarning] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
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
  const emailContact = config.email || 'tuyendung@petmm.vn';

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

  // Kiểm tra live xem email này đã từng ứng tuyển vị trí này chưa
  const checkEmailDuplicate = async (emailVal: string) => {
    if (!emailVal || !emailVal.includes('@') || !job?.id) {
      setEmailDuplicateWarning('');
      return;
    }
    setIsCheckingEmail(true);
    try {
      const res = await fetch(
        `/api/recruitment/apply?email=${encodeURIComponent(emailVal.trim())}&jobId=${encodeURIComponent(job.id)}&lang=${language}`
      );
      const data = await res.json();
      if (data?.hasApplied) {
        setEmailDuplicateWarning(
          data.message ||
            (isEn
              ? 'This email has already applied for this position. Our HR team is reviewing your profile!'
              : 'Email này đã ứng tuyển vị trí này rồi. Ban nhân sự đang xét duyệt hồ sơ của bạn!')
        );
      } else {
        setEmailDuplicateWarning('');
      }
    } catch (err) {
      console.warn('Lỗi kiểm tra email trùng:', err);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Gửi hồ sơ ứng tuyển trực tiếp về nhà tuyển dụng (tương tự đặt lịch khám)
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

    if (emailDuplicateWarning) {
      setSubmitError(emailDuplicateWarning);
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
          setEmailDuplicateWarning(data.message);
        }
        throw new Error(data.message || (isEn ? 'Failed to submit application.' : 'Không thể gửi hồ sơ ứng tuyển.'));
      }

      setSubmittedData({
        fullName: fullName.trim(),
        phoneNumber: cleanPhone,
        email: email.trim(),
        jobTitle: jobTitle,
        appliedAt: new Intl.DateTimeFormat('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh',
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }).format(new Date()),
        cvName: pdfFile?.name || (cvLink ? 'Đường link CV trực tuyến' : undefined),
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

        {/* 3. Main Content: 2 Columns Layout (8 / 4) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* CỘT TRÁI: CHI TIẾT CÔNG VIỆC & FORM ỨNG TUYỂN (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-8">
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

              {/* Box 2: Mô tả công việc */}
              {jobDesc && (
                <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      {isEn ? 'Job Responsibilities' : 'Mô Tả Công Việc'}
                    </h2>
                  </div>

                  <FormattedLongText content={jobDesc} />
                </div>
              )}

              {/* Box 3: Yêu cầu ứng viên */}
              {jobReq && (
                <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      {isEn ? 'Candidate Requirements' : 'Yêu Cầu Ứng Viên'}
                    </h2>
                  </div>

                  <FormattedLongText content={jobReq} />
                </div>
              )}

              {/* Box 4: Quyền lợi & Chế độ đãi ngộ */}
              {jobBenefits && (
                <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      {isEn ? 'Privileges & Benefits' : 'Quyền Lợi & Đãi Ngộ Vượt Trội'}
                    </h2>
                  </div>

                  <FormattedLongText content={jobBenefits} />
                </div>
              )}

              {/* Box 5: Form Ứng Tuyển Nhanh */}
              <div id="apply" className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-white to-[#F2F7F1] border-2 border-emerald-600/30 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2D5A27] text-white flex items-center justify-center shrink-0">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-slate-900">
                      {isEn ? 'Quick Application Form' : 'Ứng Tuyển Vị Trí Này'}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600">
                      {isEn
                        ? 'Submit your application directly to our HR team via Email with attached PDF CV or link.'
                        : 'Gửi hồ sơ ứng tuyển trực tiếp đến Ban Nhân Sự PetM&M qua Email kèm file CV (PDF) hoặc đường link.'}
                    </p>
                  </div>
                </div>

                {formSubmitted && submittedData ? (
                  <div className="p-6 sm:p-8 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 text-center my-6 space-y-5 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                      <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>

                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-emerald-200/60 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
                        {isEn ? 'Application Received' : 'Tiếp Nhận Thành Công'}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-emerald-950">
                        {isEn ? 'Your Application Has Been Sent Directly to HR!' : 'Đã Nộp Hồ Sơ Ứng Tuyển Thành Công!'}
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-800 max-w-lg mx-auto mt-2 leading-relaxed font-light">
                        {isEn
                          ? `Your application for the position of "${jobTitle}" has been securely forwarded to PetM&M HR. A confirmation receipt has also been sent to your email.`
                          : `Hồ sơ ứng tuyển vị trí "${jobTitle}" của bạn đã được chuyển thẳng đến Ban Nhân Sự & Tuyển Dụng PetM&M. Một email xác nhận cũng đã được gửi đến ${submittedData.email}.`}
                      </p>
                    </div>

                    {/* Bảng tóm tắt thông tin hồ sơ */}
                    <div className="bg-white rounded-xl p-4 sm:p-5 border border-emerald-200/70 text-left text-xs sm:text-sm space-y-2.5 max-w-lg mx-auto shadow-2xs">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-slate-500">{isEn ? 'Applicant:' : 'Họ và tên:'}</span>
                        <strong className="text-slate-900">{submittedData.fullName}</strong>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-slate-500">{isEn ? 'Phone number:' : 'Số điện thoại:'}</span>
                        <strong className="text-slate-900 font-mono">{submittedData.phoneNumber}</strong>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-slate-500">Email:</span>
                        <strong className="text-slate-900 font-mono">{submittedData.email}</strong>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                        <span className="text-slate-500">{isEn ? 'Position:' : 'Vị trí:'}</span>
                        <strong className="text-[#2D5A27]">{submittedData.jobTitle}</strong>
                      </div>
                      {submittedData.cvName && (
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <span className="text-slate-500">{isEn ? 'Attached CV:' : 'Hồ sơ CV:'}</span>
                          <strong className="text-slate-900 truncate max-w-[200px]">{submittedData.cvName}</strong>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">{isEn ? 'Submitted at:' : 'Thời gian nộp:'}</span>
                        <span className="text-slate-600 font-mono text-xs">{submittedData.appliedAt}</span>
                      </div>
                    </div>

                    <div className="bg-emerald-100/60 rounded-xl p-3.5 text-xs text-emerald-900 max-w-lg mx-auto leading-relaxed">
                      💡 {isEn
                        ? 'Our HR department will carefully review your credentials and contact you within 24 – 48 business hours via phone or Zalo.'
                        : 'Ban Nhân Sự PetM&M sẽ liên hệ trực tiếp với bạn trong vòng 24 – 48 giờ làm việc qua điện thoại hoặc Zalo.'}
                    </div>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <Link
                        href="/tuyen-dung"
                        className="px-5 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#1E3F1A] text-white text-xs font-bold transition shadow-sm"
                      >
                        {isEn ? 'Explore Other Positions' : 'Xem Các Vị Trí Tuyển Dụng Khác'}
                      </Link>

                      <Link
                        href="/"
                        className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200 transition"
                      >
                        {isEn ? 'Back to Home' : 'Về Trang Chủ'}
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitApplication} className="mt-6 space-y-4">
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
                          placeholder={isEn ? 'e.g. Dr. Nguyen Van A' : 'Ví dụ: Nguyễn Văn An'}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
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
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder={isEn ? 'e.g. 0903 xxx xxx' : 'Ví dụ: 0903 599 339'}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
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
                          if (emailDuplicateWarning) setEmailDuplicateWarning('');
                        }}
                        onBlur={(e) => checkEmailDuplicate(e.target.value)}
                        placeholder="email@example.com"
                        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                          emailDuplicateWarning
                            ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/20'
                            : 'border-slate-300 focus:ring-[#2D5A27]'
                        }`}
                      />

                      {isCheckingEmail && (
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                          <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                          <span>{isEn ? 'Checking email...' : 'Đang kiểm tra tình trạng ứng tuyển của email...'}</span>
                        </p>
                      )}

                      {emailDuplicateWarning && (
                        <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1.5 bg-rose-50 border border-rose-200/80 px-3 py-1.5 rounded-lg">
                          <span>⚠️ {emailDuplicateWarning}</span>
                        </p>
                      )}
                    </div>

                    {/* VÙNG ĐÍNH KÈM FILE PDF / WORD TRỰC TIẾP HOẶC DÁN LINK CV */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Paperclip className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{isEn ? 'Attach CV File (PDF / Word) or Paste Link' : 'Hồ Sơ CV (Gắn file PDF hoặc Dán link CV)'}</span>
                        </label>
                        <span className="text-[11px] text-slate-400">PDF, DOC, DOCX (tối đa 15MB)</span>
                      </div>

                      {/* File upload trực tiếp */}
                      {pdfUrl ? (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs text-emerald-950 font-medium">
                          <div className="flex items-center gap-2 truncate">
                            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span className="truncate">{pdfFile?.name || 'File_CV_Ung_Tuyen.pdf'}</span>
                            <span className="text-[11px] text-emerald-600 shrink-0 font-mono">(Đã sẵn sàng)</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-emerald-800 underline hover:text-emerald-950"
                            >
                              {isEn ? 'View file' : 'Xem file'}
                            </a>
                            <button
                              type="button"
                              onClick={handleRemovePdf}
                              className="p-1 rounded-md text-rose-600 hover:bg-rose-100 transition"
                              title="Xóa file và chọn lại"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-2.5">
                          <label className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white border border-emerald-300 hover:border-emerald-600 text-emerald-800 text-xs font-bold cursor-pointer transition shadow-2xs hover:bg-emerald-50">
                            {isUploadingPdf ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>{isEn ? 'Uploading...' : 'Đang tải file lên...'}</span>
                              </>
                            ) : (
                              <>
                                <UploadCloud className="w-3.5 h-3.5" />
                                <span>{isEn ? 'Attach PDF CV File' : 'Chọn File PDF CV từ máy'}</span>
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

                          <span className="text-xs text-slate-400 font-medium">
                            {isEn ? 'or paste link:' : 'hoặc dán đường link:'}
                          </span>

                          <input
                            type="url"
                            value={cvLink}
                            onChange={(e) => setCvLink(e.target.value)}
                            placeholder="https://drive.google.com/..."
                            className="w-full sm:flex-1 px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
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
                        placeholder={
                          isEn
                            ? 'Share your current clinical experience, special skills, or questions for PetM&M...'
                            : 'Chia sẻ ngắn về số năm kinh nghiệm, thế mạnh lâm sàng hoặc câu hỏi dành cho PetM&M...'
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2D5A27]"
                      />
                    </div>

                    {submitError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                        <span>⚠️ {submitError}</span>
                      </div>
                    )}

                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                      <button
                        type="submit"
                        disabled={isUploadingPdf || isSubmitting || !!emailDuplicateWarning}
                        className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-800 to-[#122A10] hover:from-emerald-900 hover:to-black text-white font-bold text-sm shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                            <span>{isEn ? 'Submitting Application...' : 'Đang Gửi Hồ Sơ Trực Tiếp...'}</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 text-amber-300" />
                            <span>{isEn ? 'Submit Application' : 'Gửi Hồ Sơ Ứng Tuyển Ngay'}</span>
                          </>
                        )}
                      </button>

                      <a
                        href={`tel:${hotlineRaw}`}
                        className="w-full sm:w-auto py-3.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition flex items-center justify-center gap-2"
                      >
                        <PhoneCall className="w-4 h-4 text-rose-600" />
                        <span>Hotline: {hotlineDisplay}</span>
                      </a>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* CỘT PHẢI: SIDEBAR HỖ TRỢ & CÁC VỊ TRÍ KHÁC (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Sidebar Box 1: Hộp liên hệ Phòng Nhân Sự */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <Building className="w-5 h-5 text-emerald-800" />
                  <h3 className="font-bold text-slate-900 text-base">
                    {isEn ? 'HR Department' : 'Phòng Tuyển Dụng PetM&M'}
                  </h3>
                </div>

                <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <PhoneCall className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[11px] text-slate-400">
                        {isEn ? 'Recruitment Hotline' : 'Hotline Tuyển Dụng'}
                      </span>
                      <a href={`tel:${hotlineRaw}`} className="font-bold text-slate-900 hover:text-emerald-800 transition font-mono">
                        {hotlineDisplay}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MessageSquare className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[11px] text-slate-400">
                        {isEn ? 'Direct Zalo HR' : 'Zalo Nhân Sự Tiếp Nhận CV'}
                      </span>
                      <a
                        href={zaloUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-blue-600 hover:underline"
                      >
                        Chat Zalo Phòng Nhân Sự
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Mail className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[11px] text-slate-400">
                        {isEn ? 'Email Application' : 'Email Tiếp Nhận Hồ Sơ'}
                      </span>
                      <a href={`mailto:${emailContact}`} className="font-bold text-slate-900 hover:text-emerald-800 transition">
                        {emailContact}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[11px] text-slate-400">
                        {isEn ? 'Headquarters Office' : 'Trụ sở tiếp nhận trực tiếp'}
                      </span>
                      <span className="text-slate-700 text-xs">
                        19 Đ. Số 1, Phường Phước Long, TP. Thủ Đức, TP. Hồ Chí Minh
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="#apply"
                    className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow transition"
                  >
                    <span>{isEn ? 'Apply for this Job' : 'Nộp Hồ Sơ Vị Trí Này'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Sidebar Box 2: Cam kết văn hóa Fear-Free */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#183B16] to-[#0E260D] text-white shadow-sm space-y-3.5">
                <div className="flex items-center gap-2 text-amber-300">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <h3 className="font-bold text-sm sm:text-base">
                    {isEn ? 'Fear-Free Workplace' : 'Cam Kết Môi Trường Fear-Free'}
                  </h3>
                </div>
                <p className="text-xs text-emerald-100/90 leading-relaxed font-light">
                  {isEn
                    ? 'At PetM&M, veterinarians and staff work in an empathetic, calm environment without coercion or stress. We respect your medical judgement and wellbeing.'
                    : 'Tại PetM&M, y bác sĩ và kỹ thuật viên được làm việc trong bầu không khí trân trọng, không gượng ép và không stress. Chúng tôi tôn trọng độc lập phán đoán y khoa của bạn.'}
                </p>
                <div className="pt-1">
                  <Link
                    href="/#about"
                    className="text-xs text-amber-300 hover:text-amber-200 font-semibold inline-flex items-center gap-1"
                  >
                    <span>{isEn ? 'Discover PetM&M Culture' : 'Tìm hiểu văn hóa PetM&M'}</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Sidebar Box 3: Các vị trí khác đang tuyển */}
              {otherJobs && otherJobs.length > 0 && (
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base pb-2 border-b border-slate-100">
                    {isEn ? 'Other Career Openings' : 'Vị Trí Tuyển Dụng Khác'}
                  </h3>

                  <div className="space-y-3">
                    {otherJobs.map((oj) => {
                      const ojTitle = (isEn && oj.tieu_de_en) ? oj.tieu_de_en : oj.tieu_de;
                      const ojSalary = (isEn && oj.muc_luong_en) ? oj.muc_luong_en : oj.muc_luong;
                      return (
                        <Link
                          key={oj.id}
                          href={`/tuyen-dung/${oj.id}`}
                          className="block p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-100 hover:border-emerald-200 transition group"
                        >
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition line-clamp-1">
                            {ojTitle}
                          </h4>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                            <span className="text-emerald-700 font-semibold font-mono">{ojSalary}</span>
                            <span className="text-slate-400 group-hover:text-emerald-700 transition">
                              {isEn ? 'Details →' : 'Chi tiết →'}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="pt-2 text-center">
                    <Link
                      href="/tuyen-dung"
                      className="text-xs text-emerald-800 hover:text-emerald-950 font-bold underline"
                    >
                      {isEn ? 'View all openings' : 'Xem toàn bộ vị trí đang tuyển'}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 4. Footer & Widgets */}
      <Footer />
      <FloatingContactWidgets />
      <ScrollNavigationButtons />
    </div>
  );
}
