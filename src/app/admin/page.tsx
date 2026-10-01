'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Upload,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  Move,
  Layers,
  AlertCircle,
  ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  X,
  MapPin,
  PhoneCall,
  Settings,
  Clock,
  ExternalLink,
  FileText,
  Search,
  Menu,
  ChevronRight,
  Sparkles,
  Globe,
  Save,
  ShieldCheck,
  Send,
  KeyRound,
  Mail,
  Eye,
  EyeOff,
  Building2,
  SlidersHorizontal,
  Stethoscope,
  Scissors,
  Flame,
  HelpCircle,
  Tag,
  Heart,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  UserCheck,
  CheckCheck,
  Star,
  BarChart3,
  BookOpen,
  LogOut,
} from 'lucide-react';
import { supabase, HeroBannerItem, ChiNhanhRecord, CauHinhRecord, DichVuRecord, CauHoiThuongGapRecord, LichHenRecord, DanhGiaRecord, DoiNguRecord, BaiVietRecord } from '@/lib/supabase';
import { useSystemConfig } from '@/context/SystemConfigContext';
import AdminImageInput from '@/components/AdminImageInput';
import { VietnamFlag, UKFlag } from '@/components/FlagIcons';
import AdminLoginPage from '@/components/AdminLoginPage';
import PetLogo from '@/components/PetLogo';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

type AdminTab = 'banners' | 'branches' | 'services' | 'appointments' | 'faqs' | 'reviews' | 'team' | 'articles' | 'config';
export type ConfigSubTab = 'contact' | 'email' | 'about' | 'slides' | 'stats' | 'slogans';

export default function AdminDashboardPage() {
  // XÁC THỰC QUẢN TRỊ VIÊN (ADMIN AUTHENTICATION)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<{ username: string; ho_ten: string; vai_tro: string } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/me');
        const data = await res.json();
        if (isMounted) {
          if (data.authenticated && data.user) {
            setIsAuthenticated(true);
            setCurrentUser(data.user);
          } else {
            const local = typeof window !== 'undefined' ? localStorage.getItem('petmm_admin_user') : null;
            if (local) {
              setIsAuthenticated(true);
              setCurrentUser(JSON.parse(local));
            } else {
              setIsAuthenticated(false);
            }
          }
        }
      } catch {
        if (isMounted) {
          const local = typeof window !== 'undefined' ? localStorage.getItem('petmm_admin_user') : null;
          if (local) {
            setIsAuthenticated(true);
            setCurrentUser(JSON.parse(local));
          } else {
            setIsAuthenticated(false);
          }
        }
      }
    };
    checkAuth();
    return () => { isMounted = false; };
  }, []);

  const handleLogout = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi cổng quản trị Pet M&M?')) return;
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('petmm_admin_user');
      }
      setCurrentUser(null);
      setIsAuthenticated(false);
      setIsLoggingOut(false);
    }
  };

  const [activeTab, setActiveTab] = useState<AdminTab>('banners');
  const [configSubTab, setConfigSubTab] = useState<ConfigSubTab>('contact');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // -------------------------------------------------------------
  // TAB 1: QUẢN LÝ ẢNH NỀN HERO BANNER
  // -------------------------------------------------------------
  const [banners, setBanners] = useState<HeroBannerItem[]>([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [isBannerSaving, setIsBannerSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Partial<HeroBannerItem> | null>(null);
  const [isCreatingNewBanner, setIsCreatingNewBanner] = useState(false);

  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [zoomLevel, setZoomLevel] = useState(1.05);
  const [isDragging, setIsDragging] = useState(false);
  const [bannerCropPreviewMode, setBannerCropPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const dragStartRef = useRef<{ x: number; y: number; startCropX: number; startCropY: number }>({
    x: 0,
    y: 0,
    startCropX: 50,
    startCropY: 50,
  });
  const cropBoxRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const branchImgFileInputRef = useRef<HTMLInputElement>(null);
  const [isBranchImgUploading, setIsBranchImgUploading] = useState(false);

  const loadBanners = async () => {
    setBannersLoading(true);
    try {
      const { data, error } = await supabase
        .from('hinh_anh')
        .select('*')
        .eq('chuyen_muc', 'hero_banner')
        .order('thu_tu', { ascending: true });

      if (error) throw error;
      setBanners((data as HeroBannerItem[]) || []);
    } catch (err: any) {
      console.error('Lỗi tải banner:', err);
      showNotification('error', `Không thể tải ảnh: ${err.message || 'Lỗi kết nối'}`);
    } finally {
      setBannersLoading(false);
    }
  };

  const handleAddNewBanner = () => {
    const nextOrder = banners.length > 0 ? Math.max(...banners.map((b) => b.thu_tu || 0)) + 1 : 1;
    setEditingBanner({
      duong_dan_anh: '',
      tieu_de: 'Ảnh nền Pet M&M',
      alt_text: 'Ảnh nền Pet M&M 5 sao',
      chuyen_muc: 'hero_banner',
      can_chinh: '50% 50%',
      ti_le_phong: 1.05,
      hieu_ung: 'ken_burns',
      thu_tu: nextOrder,
      kich_hoat: true,
      thoi_gian_hien_thi: 4000,
    });
    setCropX(50);
    setCropY(50);
    setZoomLevel(1.05);
    setBannerCropPreviewMode('desktop');
    setIsCreatingNewBanner(true);
  };

  const handleEditBanner = (banner: HeroBannerItem) => {
    setEditingBanner({ ...banner });
    setIsCreatingNewBanner(false);
    setBannerCropPreviewMode('desktop');

    const pos = banner.can_chinh || '50% 50%';
    const percentMatch = pos.match(/(\d+)%\s+(\d+)%/);
    if (percentMatch) {
      setCropX(parseInt(percentMatch[1], 10));
      setCropY(parseInt(percentMatch[2], 10));
    } else if (pos.includes('top')) {
      setCropX(50);
      setCropY(20);
    } else if (pos.includes('bottom')) {
      setCropX(50);
      setCropY(80);
    } else {
      setCropX(50);
      setCropY(50);
    }
    setZoomLevel(banner.ti_le_phong || 1.05);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      showNotification('error', 'Dung lượng ảnh vượt quá 25MB!');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanFileName = `hero_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `banners/${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hinh_anh')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('hinh_anh').getPublicUrl(filePath);

      setEditingBanner((prev) => ({
        ...prev,
        duong_dan_anh: publicUrlData.publicUrl,
        tieu_de: 'Ảnh nền Pet M&M',
        alt_text: 'Ảnh nền Pet M&M 5 sao',
      }));

      showNotification('success', 'Đã tải ảnh lên Supabase thành công!');
    } catch (err: any) {
      console.error('Upload error:', err);
      showNotification('error', `Lỗi tải ảnh: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBranchImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      showNotification('error', 'Ảnh vượt quá 25MB!');
      return;
    }
    setIsBranchImgUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `branches/cover_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('hinh_anh')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('hinh_anh').getPublicUrl(filePath);
      setEditingBranch((prev) => ({ ...prev, anh_dai_dien: urlData.publicUrl }));
      showNotification('success', 'Đã tải ảnh bìa lên thành công!');
    } catch (err: any) {
      showNotification('error', `Lỗi tải ảnh: ${err.message}`);
    } finally {
      setIsBranchImgUploading(false);
      if (branchImgFileInputRef.current) branchImgFileInputRef.current.value = '';
    }
  };

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startCropX: cropX,
      startCropY: cropY,
    };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !cropBoxRef.current) return;
      const rect = cropBoxRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      const percentDeltaX = (deltaX / rect.width) * 80;
      const percentDeltaY = (deltaY / rect.height) * 80;
      setCropX(Math.max(0, Math.min(100, Math.round(dragStartRef.current.startCropX - percentDeltaX))));
      setCropY(Math.max(0, Math.min(100, Math.round(dragStartRef.current.startCropY - percentDeltaY))));
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      startCropX: cropX,
      startCropY: cropY,
    };
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !cropBoxRef.current || e.touches.length !== 1) return;
      const rect = cropBoxRef.current.getBoundingClientRect();
      const deltaX = e.touches[0].clientX - dragStartRef.current.x;
      const deltaY = e.touches[0].clientY - dragStartRef.current.y;
      const percentDeltaX = (deltaX / rect.width) * 80;
      const percentDeltaY = (deltaY / rect.height) * 80;
      setCropX(Math.max(0, Math.min(100, Math.round(dragStartRef.current.startCropX - percentDeltaX))));
      setCropY(Math.max(0, Math.min(100, Math.round(dragStartRef.current.startCropY - percentDeltaY))));
    },
    [isDragging]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const handleSaveBanner = async () => {
    if (!editingBanner?.duong_dan_anh) {
      showNotification('error', 'Vui lòng chọn hoặc tải ảnh lên trước!');
      return;
    }

    setIsBannerSaving(true);
    try {
      const finalPosition = `${cropX}% ${cropY}%`;
      const payload = {
        tieu_de: editingBanner.tieu_de || 'Ảnh nền Pet M&M',
        duong_dan_anh: editingBanner.duong_dan_anh,
        alt_text: editingBanner.alt_text || 'Ảnh nền Pet M&M 5 sao',
        chuyen_muc: 'hero_banner',
        can_chinh: finalPosition,
        ti_le_phong: Number(zoomLevel) || 1.05,
        hieu_ung: editingBanner.hieu_ung || 'ken_burns',
        thu_tu: Number(editingBanner.thu_tu) || 1,
        kich_hoat: editingBanner.kich_hoat !== false,
        thoi_gian_hien_thi: Number(editingBanner.thoi_gian_hien_thi) || 4000,
        ngay_cap_nhat: new Date().toISOString(),
      };

      if (isCreatingNewBanner || !editingBanner.id) {
        const { error } = await supabase.from('hinh_anh').insert([payload]);
        if (error) throw error;
        showNotification('success', 'Đã thêm ảnh nền mới thành công!');
      } else {
        const { error } = await supabase.from('hinh_anh').update(payload).eq('id', editingBanner.id);
        if (error) throw error;
        showNotification('success', 'Đã lưu vị trí ảnh nền thành công!');
      }

      setEditingBanner(null);
      setIsCreatingNewBanner(false);
      await loadBanners();
    } catch (err: any) {
      console.error('Save error:', err);
      showNotification('error', `Lỗi lưu ảnh: ${err.message}`);
    } finally {
      setIsBannerSaving(false);
    }
  };

  const handleToggleBannerActive = async (banner: HeroBannerItem) => {
    try {
      const { error } = await supabase
        .from('hinh_anh')
        .update({ kich_hoat: !banner.kich_hoat, ngay_cap_nhat: new Date().toISOString() })
        .eq('id', banner.id);

      if (error) throw error;
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? { ...b, kich_hoat: !b.kich_hoat } : b)));
      showNotification('success', `Đã ${!banner.kich_hoat ? 'bật' : 'tắt'} hiển thị ảnh này`);
    } catch (err: any) {
      showNotification('error', `Lỗi cập nhật: ${err.message}`);
    }
  };

  const handleDeleteBanner = async (banner: HeroBannerItem) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh nền này?')) return;
    try {
      const { error } = await supabase.from('hinh_anh').delete().eq('id', banner.id);
      if (error) throw error;
      showNotification('success', 'Đã xóa ảnh thành công!');
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
      if (editingBanner?.id === banner.id) setEditingBanner(null);
    } catch (err: any) {
      showNotification('error', `Lỗi xóa ảnh: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // TAB 2: QUẢN LÝ CHI NHÁNH BỆNH VIỆN
  // -------------------------------------------------------------
  const [branches, setBranches] = useState<ChiNhanhRecord[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [isBranchSaving, setIsBranchSaving] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Partial<ChiNhanhRecord> | null>(null);
  const [isCreatingNewBranch, setIsCreatingNewBranch] = useState(false);
  const [featuresInput, setFeaturesInput] = useState('');
  const [featuresEnInput, setFeaturesEnInput] = useState('');
  const [branchLangTab, setBranchLangTab] = useState<'vi' | 'en'>('vi');
  const [isTranslatingBranch, setIsTranslatingBranch] = useState(false);

  const loadBranches = async () => {
    setBranchesLoading(true);
    try {
      const { data, error } = await supabase
        .from('chi_nhanh')
        .select('*')
        .order('thu_tu', { ascending: true });

      if (error) throw error;
      setBranches((data as ChiNhanhRecord[]) || []);
    } catch (err: any) {
      console.error('Lỗi tải chi nhánh:', err);
      showNotification('error', `Lỗi tải chi nhánh: ${err.message}`);
    } finally {
      setBranchesLoading(false);
    }
  };

  const handleAddNewBranch = () => {
    const nextOrder = branches.length > 0 ? Math.max(...branches.map((b) => b.thu_tu || 0)) + 1 : 1;
    setEditingBranch({
      ten_chi_nhanh: '',
      ten_ngan: '',
      khu_vuc: '',
      khau_hieu: '',
      dia_chi: '',
      so_dien_thoai: '',
      gio_hoat_dong: '',
      bac_si_phu_trach: '',
      bang_cap_bac_si: '',
      thong_tin_do_xe: '',
      link_ggmap_embed: '',
      link_ggmap_app: '',
      tien_ich: [],
      thu_tu: nextOrder,
      kich_hoat: true,
    });
    setFeaturesInput('');
    setFeaturesEnInput('');
    setBranchLangTab('vi');
    setIsCreatingNewBranch(true);
  };

  const handleEditBranch = (branch: ChiNhanhRecord) => {
    setEditingBranch({ ...branch });
    setIsCreatingNewBranch(false);
    const feats = Array.isArray(branch.tien_ich)
      ? branch.tien_ich
      : typeof branch.tien_ich === 'string'
      ? JSON.parse(branch.tien_ich)
      : [];
    setFeaturesInput(feats.join('\n'));
    const featsEn = Array.isArray((branch as any).tien_ich_en) ? (branch as any).tien_ich_en : [];
    setFeaturesEnInput(featsEn.join('\n'));
    setBranchLangTab('vi');
  };

  const handleAutoTranslateBranch = async () => {
    if (!editingBranch?.ten_chi_nhanh) {
      showNotification('error', 'Vui lòng nhập Tên chi nhánh Tiếng Việt trước khi dịch!');
      return;
    }
    setIsTranslatingBranch(true);
    try {
      const fieldsToTranslate: Record<string, string> = {
        ten_chi_nhanh: editingBranch.ten_chi_nhanh || '',
        ten_ngan: editingBranch.ten_ngan || '',
        khu_vuc: editingBranch.khu_vuc || '',
        khau_hieu: editingBranch.khau_hieu || '',
        dia_chi: editingBranch.dia_chi || '',
        bac_si_phu_trach: editingBranch.bac_si_phu_trach || '',
        bang_cap_bac_si: editingBranch.bang_cap_bac_si || '',
        gio_hoat_dong: editingBranch.gio_hoat_dong || '',
        thong_tin_do_xe: editingBranch.thong_tin_do_xe || '',
        tien_ich: featuresInput || '',
        bai_viet_chi_tiet: editingBranch.bai_viet_chi_tiet || '',
      };
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fieldsToTranslate }),
      });
      const data = await res.json();
      if (data.success && data.translations) {
        setEditingBranch((prev) => (prev ? {
          ...prev,
          ten_chi_nhanh_en: data.translations.ten_chi_nhanh || (prev as any).ten_chi_nhanh_en,
          ten_ngan_en: data.translations.ten_ngan || (prev as any).ten_ngan_en,
          khu_vuc_en: data.translations.khu_vuc || (prev as any).khu_vuc_en,
          khau_hieu_en: data.translations.khau_hieu || (prev as any).khau_hieu_en,
          dia_chi_en: data.translations.dia_chi || (prev as any).dia_chi_en,
          bac_si_phu_trach_en: data.translations.bac_si_phu_trach || (prev as any).bac_si_phu_trach_en,
          bang_cap_bac_si_en: data.translations.bang_cap_bac_si || (prev as any).bang_cap_bac_si_en,
          gio_hoat_dong_en: data.translations.gio_hoat_dong || (prev as any).gio_hoat_dong_en,
          thong_tin_do_xe_en: data.translations.thong_tin_do_xe || (prev as any).thong_tin_do_xe_en,
          bai_viet_chi_tiet_en: data.translations.bai_viet_chi_tiet || (prev as any).bai_viet_chi_tiet_en,
        } as any : null));
        if (data.translations.tien_ich) setFeaturesEnInput(data.translations.tien_ich);
        setBranchLangTab('en');
        showNotification('success', 'Đã chuyển đổi sang Tiếng Anh (kèm toàn bộ bài viết chi tiết) thành công!');
      } else throw new Error(data.error || 'Dịch thất bại');
    } catch (err: any) {
      showNotification('error', `Lỗi dịch: ${err.message}`);
    } finally {
      setIsTranslatingBranch(false);
    }
  };


  const handleSaveBranch = async () => {
    if (!editingBranch?.ten_chi_nhanh || !editingBranch?.dia_chi) {
      showNotification('error', 'Vui lòng nhập Tên chi nhánh và Địa chỉ!');
      return;
    }

    setIsBranchSaving(true);
    try {
      const parsedFeatures = featuresInput
        .split('\n')
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      const payload = {
        ten_chi_nhanh: editingBranch.ten_chi_nhanh,
        ten_ngan: editingBranch.ten_ngan || editingBranch.ten_chi_nhanh,
        khu_vuc: editingBranch.khu_vuc || '',
        khau_hieu: editingBranch.khau_hieu || '',
        dia_chi: editingBranch.dia_chi,
        so_dien_thoai: editingBranch.so_dien_thoai || '',
        gio_hoat_dong: editingBranch.gio_hoat_dong || '',
        bac_si_phu_trach: editingBranch.bac_si_phu_trach || '',
        bang_cap_bac_si: editingBranch.bang_cap_bac_si || '',
        thong_tin_do_xe: editingBranch.thong_tin_do_xe || '',
        link_ggmap_embed: editingBranch.link_ggmap_embed || '',
        link_ggmap_app: editingBranch.link_ggmap_app || '',
        ten_chi_nhanh_en: (editingBranch as any).ten_chi_nhanh_en || '',
        ten_ngan_en: (editingBranch as any).ten_ngan_en || '',
        khu_vuc_en: (editingBranch as any).khu_vuc_en || '',
        khau_hieu_en: (editingBranch as any).khau_hieu_en || '',
        dia_chi_en: (editingBranch as any).dia_chi_en || '',
        bac_si_phu_trach_en: (editingBranch as any).bac_si_phu_trach_en || '',
        bang_cap_bac_si_en: (editingBranch as any).bang_cap_bac_si_en || '',
        gio_hoat_dong_en: (editingBranch as any).gio_hoat_dong_en || '',
        thong_tin_do_xe_en: (editingBranch as any).thong_tin_do_xe_en || '',
        tien_ich_en: featuresEnInput.split('\n').map((f) => f.trim()).filter((f) => f.length > 0),
        bai_viet_chi_tiet_en: (editingBranch as any).bai_viet_chi_tiet_en || '',
        tien_ich: parsedFeatures,
        bai_viet_chi_tiet: editingBranch.bai_viet_chi_tiet || '',
        anh_dai_dien: editingBranch.anh_dai_dien || '',
        can_chinh_anh: editingBranch.can_chinh_anh || '50% 50%',
        thu_tu: Number(editingBranch.thu_tu) || 1,
        kich_hoat: editingBranch.kich_hoat !== false,
        ngay_cap_nhat: new Date().toISOString(),
      };

      if (isCreatingNewBranch || !editingBranch.id) {
        const { error } = await supabase.from('chi_nhanh').insert([payload]);
        if (error) throw error;
        showNotification('success', 'Đã thêm chi nhánh mới thành công!');
      } else {
        const { error } = await supabase.from('chi_nhanh').update(payload).eq('id', editingBranch.id);
        if (error) throw error;
        showNotification('success', 'Đã cập nhật chi nhánh thành công!');
      }

      setEditingBranch(null);
      setIsCreatingNewBranch(false);
      await loadBranches();
    } catch (err: any) {
      console.error('Lỗi lưu chi nhánh:', err);
      showNotification('error', `Lỗi lưu chi nhánh: ${err.message}`);
    } finally {
      setIsBranchSaving(false);
    }
  };

  const handleToggleBranchActive = async (branch: ChiNhanhRecord) => {
    try {
      const { error } = await supabase
        .from('chi_nhanh')
        .update({ kich_hoat: !branch.kich_hoat, ngay_cap_nhat: new Date().toISOString() })
        .eq('id', branch.id);

      if (error) throw error;
      setBranches((prev) => prev.map((b) => (b.id === branch.id ? { ...b, kich_hoat: !b.kich_hoat } : b)));
      showNotification('success', `Đã ${!branch.kich_hoat ? 'bật' : 'tắt'} chi nhánh này`);
    } catch (err: any) {
      showNotification('error', `Lỗi cập nhật: ${err.message}`);
    }
  };

  const handleDeleteBranch = async (branch: ChiNhanhRecord) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa chi nhánh "${branch.ten_chi_nhanh}"?`)) return;
    try {
      const { error } = await supabase.from('chi_nhanh').delete().eq('id', branch.id);
      if (error) throw error;
      showNotification('success', 'Đã xóa chi nhánh thành công!');
      setBranches((prev) => prev.filter((b) => b.id !== branch.id));
      if (editingBranch?.id === branch.id) setEditingBranch(null);
    } catch (err: any) {
      showNotification('error', `Lỗi xóa chi nhánh: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // TAB 3: CẤU HÌNH LIÊN HỆ & MẠNG XÃ HỘI
  // -------------------------------------------------------------
  const { config: globalConfig, refreshConfig } = useSystemConfig();
  const [configForm, setConfigForm] = useState<CauHinhRecord>(globalConfig);
  const [isConfigSaving, setIsConfigSaving] = useState(false);
  const [aboutSubLang, setAboutSubLang] = useState<'vi' | 'en'>('vi');
  const [sloganSubLang, setSloganSubLang] = useState<'vi' | 'en'>('vi');
  const [aboutSlideLang, setAboutSlideLang] = useState<'vi' | 'en'>('vi');
  const [isTranslatingAbout, setIsTranslatingAbout] = useState(false);
  const [isTranslatingSlogans, setIsTranslatingSlogans] = useState(false);
  const [isTranslatingAboutSlide, setIsTranslatingAboutSlide] = useState(false);

  const handleAutoTranslateAbout = async () => {
    setIsTranslatingAbout(true);
    try {
      const fieldsToTranslate: Record<string, string> = {
        gioi_thieu_huy_hieu: configForm.gioi_thieu_huy_hieu || '',
        gioi_thieu_tieu_de_1: configForm.gioi_thieu_tieu_de_1 || '',
        gioi_thieu_tieu_de_2: configForm.gioi_thieu_tieu_de_2 || '',
        gioi_thieu_mo_ta: configForm.gioi_thieu_mo_ta || '',
        gioi_thieu_cam_ket_tieu_de: configForm.gioi_thieu_cam_ket_tieu_de || '',
        gioi_thieu_cam_ket_phu: configForm.gioi_thieu_cam_ket_phu || '',
        gioi_thieu_trich_dan: configForm.gioi_thieu_trich_dan || '',
        gioi_thieu_bac_si_ten: configForm.gioi_thieu_bac_si_ten || '',
        gioi_thieu_bac_si_chuc_danh: configForm.gioi_thieu_bac_si_chuc_danh || '',
      };
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fieldsToTranslate }),
      });
      const data = await res.json();
      if (data.success && data.translations) {
        setConfigForm((prev) => ({
          ...prev,
          gioi_thieu_huy_hieu_en: data.translations.gioi_thieu_huy_hieu ?? prev.gioi_thieu_huy_hieu_en,
          gioi_thieu_tieu_de_1_en: data.translations.gioi_thieu_tieu_de_1 ?? prev.gioi_thieu_tieu_de_1_en,
          gioi_thieu_tieu_de_2_en: data.translations.gioi_thieu_tieu_de_2 ?? prev.gioi_thieu_tieu_de_2_en,
          gioi_thieu_mo_ta_en: data.translations.gioi_thieu_mo_ta ?? prev.gioi_thieu_mo_ta_en,
          gioi_thieu_cam_ket_tieu_de_en: data.translations.gioi_thieu_cam_ket_tieu_de ?? prev.gioi_thieu_cam_ket_tieu_de_en,
          gioi_thieu_cam_ket_phu_en: data.translations.gioi_thieu_cam_ket_phu ?? prev.gioi_thieu_cam_ket_phu_en,
          gioi_thieu_trich_dan_en: data.translations.gioi_thieu_trich_dan ?? prev.gioi_thieu_trich_dan_en,
          gioi_thieu_bac_si_ten_en: data.translations.gioi_thieu_bac_si_ten ?? prev.gioi_thieu_bac_si_ten_en,
          gioi_thieu_bac_si_chuc_danh_en: data.translations.gioi_thieu_bac_si_chuc_danh ?? prev.gioi_thieu_bac_si_chuc_danh_en,
        }));
        setAboutSubLang('en');
        showNotification('success', 'Đã chuyển đổi Giới thiệu sang Tiếng Anh thành công!');
      } else throw new Error(data.error || 'Dịch thất bại');
    } catch (err: any) {
      showNotification('error', `Lỗi dịch: ${err.message}`);
    } finally {
      setIsTranslatingAbout(false);
    }
  };

  const [isFaviconUploading, setIsFaviconUploading] = useState(false);
  const faviconFileInputRef = useRef<HTMLInputElement>(null);

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'Dung lượng logo không được vượt quá 5MB!');
      return;
    }

    setIsFaviconUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
      const cleanFileName = `favicon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `logos/${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hinh_anh')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('hinh_anh').getPublicUrl(filePath);

      setConfigForm((prev) => ({
        ...prev,
        logo_favicon: publicUrlData.publicUrl,
      }));

      showNotification('success', 'Đã tải Logo Favicon lên thành công!');
    } catch (err: any) {
      console.error('Upload favicon error:', err);
      showNotification('error', `Lỗi tải logo: ${err.message}`);
    } finally {
      setIsFaviconUploading(false);
      if (faviconFileInputRef.current) faviconFileInputRef.current.value = '';
    }
  };

  const handleAutoTranslateSlogans = async () => {
    setIsTranslatingSlogans(true);
    try {
      const fieldsToTranslate: Record<string, string> = {
        tieu_de_trang: configForm.tieu_de_trang || '',
        slogan_dau_trang_tieu_de: configForm.slogan_dau_trang_tieu_de || '',
        slogan_dau_trang_noi_dung: configForm.slogan_dau_trang_noi_dung || '',
        slogan_cuoi_trang_tieu_de: configForm.slogan_cuoi_trang_tieu_de || '',
        slogan_cuoi_trang_noi_dung: configForm.slogan_cuoi_trang_noi_dung || '',
      };
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fieldsToTranslate }),
      });
      const data = await res.json();
      if (data.success && data.translations) {
        setConfigForm((prev) => ({
          ...prev,
          tieu_de_trang_en: data.translations.tieu_de_trang ?? prev.tieu_de_trang_en,
          slogan_dau_trang_tieu_de_en: data.translations.slogan_dau_trang_tieu_de ?? prev.slogan_dau_trang_tieu_de_en,
          slogan_dau_trang_noi_dung_en: data.translations.slogan_dau_trang_noi_dung ?? prev.slogan_dau_trang_noi_dung_en,
          slogan_cuoi_trang_tieu_de_en: data.translations.slogan_cuoi_trang_tieu_de ?? prev.slogan_cuoi_trang_tieu_de_en,
          slogan_cuoi_trang_noi_dung_en: data.translations.slogan_cuoi_trang_noi_dung ?? prev.slogan_cuoi_trang_noi_dung_en,
        }));
        setSloganSubLang('en');
        showNotification('success', 'Đã chuyển đổi Slogan & Tiêu đề trang sang Tiếng Anh thành công!');
      } else throw new Error(data.error || 'Dịch thất bại');
    } catch (err: any) {
      showNotification('error', `Lỗi dịch: ${err.message}`);
    } finally {
      setIsTranslatingSlogans(false);
    }
  };

  useEffect(() => {
    setConfigForm(globalConfig);
  }, [globalConfig]);

  const handleSaveConfig = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsConfigSaving(true);
    try {
      // Whitelist các cột thực tế tồn tại trong bảng cau_hinh trên Supabase
      const VALID_CAU_HINH_COLUMNS = [
        'id',
        'hotline',
        'hotline_hien_thi',
        'link_zalo',
        'link_facebook',
        'link_messenger',
        'email',
        'dia_chi_chinh',
        'ngay_cap_nhat',
        'slogan_dau_trang_tieu_de',
        'slogan_dau_trang_noi_dung',
        'slogan_cuoi_trang_tieu_de',
        'slogan_cuoi_trang_noi_dung',
        'giay_phep',
        'gioi_thieu_huy_hieu',
        'gioi_thieu_tieu_de_1',
        'gioi_thieu_tieu_de_2',
        'gioi_thieu_mo_ta',
        'gioi_thieu_cam_ket_tieu_de',
        'gioi_thieu_cam_ket_phu',
        'gioi_thieu_trich_dan',
        'gioi_thieu_bac_si_ten',
        'gioi_thieu_bac_si_chuc_danh',
        'thong_ke_nam_thanh_lap',
        'thong_ke_nam_thanh_lap_nhan',
        'thong_ke_khach_hang',
        'thong_ke_khach_hang_nhan',
        'link_tiktok',
        'logo_favicon',
        'gioi_thieu_huy_hieu_en',
        'gioi_thieu_tieu_de_1_en',
        'gioi_thieu_tieu_de_2_en',
        'gioi_thieu_mo_ta_en',
        'gioi_thieu_cam_ket_tieu_de_en',
        'gioi_thieu_cam_ket_phu_en',
        'gioi_thieu_trich_dan_en',
        'gioi_thieu_bac_si_ten_en',
        'gioi_thieu_bac_si_chuc_danh_en',
        'thong_ke_nam_thanh_lap_nhan_en',
        'thong_ke_khach_hang_nhan_en',
        'slogan_cuoi_trang_tieu_de_en',
        'slogan_cuoi_trang_noi_dung_en',
        'tieu_de_trang',
        'tieu_de_trang_en',
        'slogan_dau_trang_tieu_de_en',
        'slogan_dau_trang_noi_dung_en',
      ];

      const payload: Record<string, any> = {
        id: 'system',
        ngay_cap_nhat: new Date().toISOString(),
      };

      for (const col of VALID_CAU_HINH_COLUMNS) {
        if (col in configForm && (configForm as any)[col] !== undefined) {
          payload[col] = (configForm as any)[col];
        }
      }

      const { error } = await supabase.from('cau_hinh').upsert([payload]);
      if (error) throw error;

      await refreshConfig();
      const tabNames: Record<ConfigSubTab, string> = {
        contact: 'Hotline & Mạng xã hội',
        email: 'Email & Máy Chủ Gửi Thư (SMTP)',
        about: 'Giới thiệu & Triết lý',
        slides: 'Slide ảnh giới thiệu',
        stats: 'Thông số thống kê',
        slogans: 'Khẩu hiệu & Slogan',
      };
      showNotification('success', `Đã lưu cài đặt ${tabNames[configSubTab] || 'hệ thống'} thành công!`);
    } catch (err: any) {
      console.error('Lỗi lưu cấu hình:', err);
      showNotification('error', `Lỗi lưu cấu hình: ${err.message}`);
    } finally {
      setIsConfigSaving(false);
    }
  };

  // -------------------------------------------------------------
  // CẤU HÌNH EMAIL GỬI THƯ (GMAIL SMTP)
  // -------------------------------------------------------------
  const [smtpForm, setSmtpForm] = useState({
    smtp_email: 'thaitrtin@gmail.com',
    smtp_password: '',
    smtp_sender_name: 'Bệnh Viện Thú Y Pet M&M 5★',
    smtp_notify_email: 'thaitrtin@gmail.com',
    hasPassword: false,
  });
  const [isSmtpLoading, setIsSmtpLoading] = useState(false);
  const [isSmtpSaving, setIsSmtpSaving] = useState(false);
  const [isSmtpTesting, setIsSmtpTesting] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);

  const loadSmtpConfig = useCallback(async () => {
    setIsSmtpLoading(true);
    try {
      const res = await fetch('/api/admin/email-config');
      const data = await res.json();
      if (data.success && data.config) {
        setSmtpForm((prev) => ({
          ...prev,
          smtp_email: data.config.smtp_email || 'thaitrtin@gmail.com',
          smtp_sender_name: data.config.smtp_sender_name || 'Bệnh Viện Thú Y Pet M&M 5★',
          smtp_notify_email: data.config.smtp_notify_email || 'thaitrtin@gmail.com',
          hasPassword: Boolean(data.config.hasPassword),
        }));
      }
    } catch (err: any) {
      console.error('Lỗi tải cấu hình SMTP:', err);
    } finally {
      setIsSmtpLoading(false);
    }
  }, []);

  useEffect(() => {
    if (configSubTab === 'email') {
      loadSmtpConfig();
    }
  }, [configSubTab, loadSmtpConfig]);

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smtpForm.smtp_email) {
      showNotification('error', 'Vui lòng nhập địa chỉ Gmail gửi thư!');
      return;
    }
    setIsSmtpSaving(true);
    try {
      const res = await fetch('/api/admin/email-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showNotification('error', data.message || 'Không thể lưu cấu hình email!');
        return;
      }
      showNotification('success', 'Đã lưu cấu hình máy chủ gửi thư Gmail thành công!');
      loadSmtpConfig();
    } catch (err: any) {
      showNotification('error', 'Lỗi: ' + (err.message || 'Không thể lưu'));
    } finally {
      setIsSmtpSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    setIsSmtpTesting(true);
    try {
      const res = await fetch('/api/admin/email-config/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(smtpForm),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showNotification('error', data.message || 'Gửi thư thử nghiệm thất bại!');
        return;
      }
      showNotification('success', data.message || 'Đã gửi thư thử nghiệm thành công! Vui lòng kiểm tra Gmail.');
    } catch (err: any) {
      showNotification('error', 'Lỗi: ' + (err.message || 'Gửi thử thất bại'));
    } finally {
      setIsSmtpTesting(false);
    }
  };


  // -------------------------------------------------------------
  // TAB 4: QUẢN LÝ DỊCH VỤ CHUẨN 5 SAO
  // -------------------------------------------------------------
  const [services, setServices] = useState<DichVuRecord[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [editingService, setEditingService] = useState<Partial<DichVuRecord> | null>(null);
  const [isCreatingNewService, setIsCreatingNewService] = useState(false);
  const [isServiceSaving, setIsServiceSaving] = useState(false);
  const [isServiceImgUploading, setIsServiceImgUploading] = useState(false);
  const serviceImgFileInputRef = useRef<HTMLInputElement>(null);
  const [serviceFeaturesInput, setServiceFeaturesInput] = useState('');
  const [serviceWorkflowInput, setServiceWorkflowInput] = useState('');
  const [serviceFeaturesEnInput, setServiceFeaturesEnInput] = useState('');
  const [serviceWorkflowEnInput, setServiceWorkflowEnInput] = useState('');
  const [serviceLangTab, setServiceLangTab] = useState<'vi' | 'en'>('vi');
  const [isTranslatingService, setIsTranslatingService] = useState(false);

  const loadServices = async () => {
    setServicesLoading(true);
    try {
      const { data, error } = await supabase
        .from('dich_vu')
        .select('*')
        .order('thu_tu', { ascending: true });

      if (error) throw error;
      setServices((data as DichVuRecord[]) || []);
    } catch (err: any) {
      console.error('Lỗi tải dịch vụ:', err);
      showNotification('error', `Lỗi tải dịch vụ: ${err.message}`);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleAddNewService = () => {
    const nextOrder = services.length > 0 ? Math.max(...services.map((s) => s.thu_tu || 0)) + 1 : 1;
    setEditingService({
      id: `service-${Date.now()}`,
      ten_dich_vu: '',
      ten_dich_vu_en: '',
      phu_de: '',
      phu_de_en: '',
      nhom_dich_vu: 'medical',
      huy_hieu: '',
      huy_hieu_en: '',
      mo_ta: '',
      mo_ta_en: '',
      hinh_anh: '/services_bg.jpg',
      can_chinh_anh: '50% 50%',
      gia_tham_khao: '',
      gia_tham_khao_en: '',
      thoi_luong: '',
      thoi_luong_en: '',
      tien_ich: [],
      tien_ich_en: [],
      quy_trinh: [],
      quy_trinh_en: [],
      noi_bat: false,
      thu_tu: nextOrder,
      kich_hoat: true,
    } as any);
    setServiceFeaturesInput('');
    setServiceWorkflowInput('');
    setServiceFeaturesEnInput('');
    setServiceWorkflowEnInput('');
    setServiceLangTab('vi');
    setIsCreatingNewService(true);
  };

  const handleEditService = (service: DichVuRecord) => {
    setEditingService({ ...service });
    setIsCreatingNewService(false);
    const feats = Array.isArray(service.tien_ich) ? service.tien_ich : [];
    const workflow = Array.isArray(service.quy_trinh) ? service.quy_trinh : [];
    setServiceFeaturesInput(feats.join('\n'));
    setServiceWorkflowInput(workflow.join('\n'));
    const featsEn = Array.isArray((service as any).tien_ich_en) ? (service as any).tien_ich_en : [];
    const workflowEn = Array.isArray((service as any).quy_trinh_en) ? (service as any).quy_trinh_en : [];
    setServiceFeaturesEnInput(featsEn.join('\n'));
    setServiceWorkflowEnInput(workflowEn.join('\n'));
    setServiceLangTab('vi');
  };

  const handleAutoTranslateService = async () => {
    if (!editingService?.ten_dich_vu) {
      showNotification('error', 'Vui lòng nhập Tên gói dịch vụ Tiếng Việt trước khi dịch!');
      return;
    }
    setIsTranslatingService(true);
    try {
      const featureLines = serviceFeaturesInput
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const workflowLines = serviceWorkflowInput
        .split('\n')
        .map((w) => w.trim())
        .filter(Boolean);

      const fieldsToTranslate: Record<string, string> = {
        ten_dich_vu: editingService.ten_dich_vu || '',
        phu_de: editingService.phu_de || '',
        huy_hieu: editingService.huy_hieu || '',
        gia_tham_khao: editingService.gia_tham_khao || '',
        thoi_luong: editingService.thoi_luong || '',
        mo_ta: editingService.mo_ta || '',
      };

      const [fieldsRes, featsRes, workRes] = await Promise.all([
        fetch('/api/admin/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: fieldsToTranslate }),
        }).then((r) => r.json()),
        featureLines.length > 0
          ? fetch('/api/admin/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ texts: featureLines }),
            }).then((r) => r.json())
          : Promise.resolve({ success: true, translations: [] }),
        workflowLines.length > 0
          ? fetch('/api/admin/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ texts: workflowLines }),
            }).then((r) => r.json())
          : Promise.resolve({ success: true, translations: [] }),
      ]);

      if (fieldsRes.success && fieldsRes.translations) {
        setEditingService((prev) =>
          prev
            ? ({
                ...prev,
                ten_dich_vu_en: fieldsRes.translations.ten_dich_vu || (prev as any).ten_dich_vu_en || '',
                phu_de_en: fieldsRes.translations.phu_de || (prev as any).phu_de_en || '',
                huy_hieu_en: fieldsRes.translations.huy_hieu || (prev as any).huy_hieu_en || '',
                gia_tham_khao_en: fieldsRes.translations.gia_tham_khao || (prev as any).gia_tham_khao_en || '',
                thoi_luong_en: fieldsRes.translations.thoi_luong || (prev as any).thoi_luong_en || '',
                mo_ta_en: fieldsRes.translations.mo_ta || (prev as any).mo_ta_en || '',
              } as any)
            : null
        );
      }

      if (featsRes.success && Array.isArray(featsRes.translations) && featsRes.translations.length > 0) {
        setServiceFeaturesEnInput(featsRes.translations.join('\n'));
      }

      if (workRes.success && Array.isArray(workRes.translations) && workRes.translations.length > 0) {
        setServiceWorkflowEnInput(workRes.translations.join('\n'));
      }

      setServiceLangTab('en');
      showNotification('success', 'Đã chuyển đổi toàn bộ thông tin dịch vụ sang Tiếng Anh thành công!');
    } catch (err: any) {
      console.error('Lỗi dịch dịch vụ:', err);
      showNotification('error', `Lỗi chuyển đổi ngôn ngữ: ${err.message}`);
    } finally {
      setIsTranslatingService(false);
    }
  };

  const handleServiceImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification('error', 'Chỉ chấp nhận tệp định dạng hình ảnh!');
      return;
    }

    setIsServiceImgUploading(true);
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `service_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `services/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('hinh_anh')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('hinh_anh')
        .getPublicUrl(filePath);

      setEditingService((prev) => (prev ? { ...prev, hinh_anh: publicUrlData.publicUrl } : null));
      showNotification('success', 'Đã tải ảnh dịch vụ lên thành công!');
    } catch (err: any) {
      console.error('Lỗi upload ảnh:', err);
      showNotification('error', `Lỗi tải ảnh: ${err.message}`);
    } finally {
      setIsServiceImgUploading(false);
      if (serviceImgFileInputRef.current) serviceImgFileInputRef.current.value = '';
    }
  };

  const handleSaveService = async () => {
    if (!editingService?.ten_dich_vu) {
      showNotification('error', 'Vui lòng nhập Tên dịch vụ!');
      return;
    }

    setIsServiceSaving(true);
    try {
      const parsedFeatures = serviceFeaturesInput
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const parsedWorkflow = serviceWorkflowInput
        .split('\n')
        .map((w) => w.trim())
        .filter(Boolean);

      const parsedFeaturesEn = serviceFeaturesEnInput
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const parsedWorkflowEn = serviceWorkflowEnInput
        .split('\n')
        .map((w) => w.trim())
        .filter(Boolean);

      const payload: Partial<DichVuRecord> = {
        ten_dich_vu: editingService.ten_dich_vu,
        ten_dich_vu_en: (editingService as any).ten_dich_vu_en || null,
        phu_de: editingService.phu_de || null,
        phu_de_en: (editingService as any).phu_de_en || null,
        nhom_dich_vu: editingService.nhom_dich_vu || 'medical',
        huy_hieu: editingService.huy_hieu || null,
        huy_hieu_en: (editingService as any).huy_hieu_en || null,
        mo_ta: editingService.mo_ta || null,
        mo_ta_en: (editingService as any).mo_ta_en || null,
        hinh_anh: editingService.hinh_anh || '/services_bg.jpg',
        can_chinh_anh: editingService.can_chinh_anh || '50% 50%',
        gia_tham_khao: editingService.gia_tham_khao || null,
        gia_tham_khao_en: (editingService as any).gia_tham_khao_en || null,
        thoi_luong: editingService.thoi_luong || null,
        thoi_luong_en: (editingService as any).thoi_luong_en || null,
        tien_ich: parsedFeatures,
        tien_ich_en: parsedFeaturesEn,
        quy_trinh: parsedWorkflow,
        quy_trinh_en: parsedWorkflowEn,
        noi_bat: !!editingService.noi_bat,
        thu_tu: Number(editingService.thu_tu) || 0,
        kich_hoat: editingService.kich_hoat !== undefined ? editingService.kich_hoat : true,
        ngay_cap_nhat: new Date().toISOString(),
      };

      if (isCreatingNewService) {
        const customId = editingService.id || `service-${Date.now()}`;
        const { error } = await supabase.from('dich_vu').insert([{ ...payload, id: customId }]);
        if (error) throw error;
        showNotification('success', 'Đã thêm dịch vụ mới thành công!');
      } else {
        const { error } = await supabase.from('dich_vu').update(payload).eq('id', editingService.id);
        if (error) throw error;
        showNotification('success', 'Đã cập nhật dịch vụ thành công!');
      }

      setEditingService(null);
      setIsCreatingNewService(false);
      await loadServices();
    } catch (err: any) {
      console.error('Lỗi lưu dịch vụ:', err);
      showNotification('error', `Lỗi lưu dịch vụ: ${err.message}`);
    } finally {
      setIsServiceSaving(false);
    }
  };

  const handleToggleServiceActive = async (service: DichVuRecord) => {
    try {
      const { error } = await supabase
        .from('dich_vu')
        .update({ kich_hoat: !service.kich_hoat, ngay_cap_nhat: new Date().toISOString() })
        .eq('id', service.id);

      if (error) throw error;
      setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, kich_hoat: !s.kich_hoat } : s)));
      showNotification('success', `Đã ${!service.kich_hoat ? 'bật' : 'tắt'} dịch vụ này`);
    } catch (err: any) {
      showNotification('error', `Lỗi cập nhật: ${err.message}`);
    }
  };

  const handleDeleteService = async (service: DichVuRecord) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa dịch vụ "${service.ten_dich_vu}"?`)) return;
    try {
      const { error } = await supabase.from('dich_vu').delete().eq('id', service.id);
      if (error) throw error;
      showNotification('success', 'Đã xóa dịch vụ thành công!');
      setServices((prev) => prev.filter((s) => s.id !== service.id));
      if (editingService?.id === service.id) setEditingService(null);
    } catch (err: any) {
      showNotification('error', `Lỗi xóa dịch vụ: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // TAB 5: QUẢN LÝ CÂU HỎI THƯỜNG GẶP (FAQ)
  // -------------------------------------------------------------
  const [faqs, setFaqs] = useState<CauHoiThuongGapRecord[]>([]);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [isFaqSaving, setIsFaqSaving] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Partial<CauHoiThuongGapRecord> | null>(null);
  const [isCreatingNewFaq, setIsCreatingNewFaq] = useState(false);
  const [faqModalTab, setFaqModalTab] = useState<'vi' | 'en'>('vi');
  const [isTranslatingFaq, setIsTranslatingFaq] = useState(false);

  const loadFaqs = async () => {
    try {
      setFaqsLoading(true);
      const { data, error } = await supabase
        .from('cau_hoi_thuong_gap')
        .select('*')
        .order('thu_tu', { ascending: true });

      if (error) throw error;
      setFaqs((data as CauHoiThuongGapRecord[]) || []);
    } catch (err: any) {
      console.error('Lỗi tải FAQ:', err);
      showNotification('error', `Lỗi tải câu hỏi thường gặp: ${err.message}`);
    } finally {
      setFaqsLoading(false);
    }
  };

  const handleAddNewFaq = () => {
    const nextOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => f.thu_tu || 0)) + 1 : 1;
    setEditingFaq({
      cau_hoi: '',
      cau_hoi_en: '',
      cau_tra_loi: '',
      cau_tra_loi_en: '',
      chuyen_muc: 'Chung',
      chuyen_muc_en: 'General',
      thu_tu: nextOrder,
      kich_hoat: true,
    });
    setFaqModalTab('vi');
    setIsCreatingNewFaq(true);
  };

  const handleEditFaq = (faq: CauHoiThuongGapRecord) => {
    setEditingFaq({ ...faq });
    setFaqModalTab('vi');
    setIsCreatingNewFaq(false);
  };

  const handleAutoTranslateFaq = async () => {
    if (!editingFaq?.cau_hoi?.trim()) {
      showNotification('error', 'Vui lòng nhập Câu hỏi Tiếng Việt trước khi dịch!');
      return;
    }
    setIsTranslatingFaq(true);
    try {
      const fieldsToTranslate: Record<string, string> = {
        cau_hoi: editingFaq.cau_hoi || '',
        cau_tra_loi: editingFaq.cau_tra_loi || '',
        chuyen_muc: editingFaq.chuyen_muc || '',
      };
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fieldsToTranslate }),
      });
      const data = await res.json();
      if (data.success && data.translations) {
        setEditingFaq((prev) => (prev ? {
          ...prev,
          cau_hoi_en: data.translations.cau_hoi || prev.cau_hoi_en,
          cau_tra_loi_en: data.translations.cau_tra_loi || prev.cau_tra_loi_en,
          chuyen_muc_en: data.translations.chuyen_muc || prev.chuyen_muc_en,
        } : null));
        setFaqModalTab('en');
        showNotification('success', 'Đã chuyển đổi sang Tiếng Anh y khoa thành công!');
      } else {
        throw new Error(data.error || 'Dịch tự động thất bại');
      }
    } catch (err: any) {
      console.error('Lỗi dịch FAQ:', err);
      showNotification('error', `Lỗi dịch tự động: ${err.message}`);
    } finally {
      setIsTranslatingFaq(false);
    }
  };

  const handleSaveFaq = async () => {
    if (!editingFaq?.cau_hoi?.trim() || !editingFaq?.cau_tra_loi?.trim()) {
      showNotification('error', 'Vui lòng nhập cả Câu hỏi và Câu trả lời (Tiếng Việt)!');
      return;
    }

    setIsFaqSaving(true);
    try {
      const payload: Partial<CauHoiThuongGapRecord> = {
        cau_hoi: editingFaq.cau_hoi.trim(),
        cau_hoi_en: editingFaq.cau_hoi_en?.trim() || null,
        cau_tra_loi: editingFaq.cau_tra_loi.trim(),
        cau_tra_loi_en: editingFaq.cau_tra_loi_en?.trim() || null,
        chuyen_muc: editingFaq.chuyen_muc?.trim() || 'Chung',
        chuyen_muc_en: editingFaq.chuyen_muc_en?.trim() || null,
        thu_tu: Number(editingFaq.thu_tu) || 0,
        kich_hoat: editingFaq.kich_hoat !== undefined ? editingFaq.kich_hoat : true,
        ngay_cap_nhat: new Date().toISOString(),
      };

      if (isCreatingNewFaq) {
        const { error } = await supabase.from('cau_hoi_thuong_gap').insert([payload]);
        if (error) throw error;
        showNotification('success', 'Đã thêm câu hỏi mới thành công!');
      } else {
        const { error } = await supabase
          .from('cau_hoi_thuong_gap')
          .update(payload)
          .eq('id', editingFaq.id);
        if (error) throw error;
        showNotification('success', 'Đã cập nhật câu hỏi thành công!');
      }

      setEditingFaq(null);
      setIsCreatingNewFaq(false);
      await loadFaqs();
    } catch (err: any) {
      console.error('Lỗi lưu FAQ:', err);
      showNotification('error', `Lỗi lưu câu hỏi: ${err.message}`);
    } finally {
      setIsFaqSaving(false);
    }
  };

  const handleToggleFaqActive = async (faq: CauHoiThuongGapRecord) => {
    try {
      const newStatus = !faq.kich_hoat;
      const { error } = await supabase
        .from('cau_hoi_thuong_gap')
        .update({ kich_hoat: newStatus, ngay_cap_nhat: new Date().toISOString() })
        .eq('id', faq.id);

      if (error) throw error;
      setFaqs((prev) => prev.map((f) => (f.id === faq.id ? { ...f, kich_hoat: newStatus } : f)));
      showNotification('success', `Đã ${newStatus ? 'bật' : 'tắt'} câu hỏi`);
    } catch (err: any) {
      showNotification('error', `Lỗi cập nhật trạng thái: ${err.message}`);
    }
  };

  const handleDeleteFaq = async (faq: CauHoiThuongGapRecord) => {
    if (!window.confirm(`Bạn có chắc muốn xóa câu hỏi "${faq.cau_hoi}" không?`)) return;

    try {
      const { error } = await supabase.from('cau_hoi_thuong_gap').delete().eq('id', faq.id);
      if (error) throw error;
      showNotification('success', 'Đã xóa câu hỏi thành công!');
      setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
      if (editingFaq?.id === faq.id) setEditingFaq(null);
    } catch (err: any) {
      showNotification('error', `Lỗi xóa câu hỏi: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // TAB 5: QUẢN LÝ LỊCH HẸN KHÁCH HÀNG (APPOINTMENTS)
  // -------------------------------------------------------------
  const [appointments, setAppointments] = useState<LichHenRecord[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'cho_xac_nhan' | 'da_xac_nhan' | 'da_kham' | 'da_huy'>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<LichHenRecord | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [bookingCoverImage, setBookingCoverImage] = useState(
    'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=1200'
  );
  const [isSavingBookingCover, setIsSavingBookingCover] = useState(false);
  const [isSendingConfirmEmail, setIsSendingConfirmEmail] = useState(false);

  const loadBookingCover = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('cau_hinh')
        .select('logo_favicon')
        .eq('id', 'booking_config')
        .maybeSingle();
      if (data?.logo_favicon && data.logo_favicon.trim()) {
        setBookingCoverImage(data.logo_favicon.trim());
      }
    } catch (err) {
      console.warn('Lỗi tải ảnh bìa lịch hẹn:', err);
    }
  }, []);

  const handleSaveBookingCover = async () => {
    setIsSavingBookingCover(true);
    try {
      const { error } = await supabase.from('cau_hinh').upsert([
        {
          id: 'booking_config',
          logo_favicon: bookingCoverImage.trim(),
          ngay_cap_nhat: new Date().toISOString(),
        },
      ]);
      if (error) throw error;
      showNotification('success', 'Đã lưu ảnh bìa form đặt lịch thành công!');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('petmm_booking_cover_updated', {
            detail: { url: bookingCoverImage.trim() },
          })
        );
      }
    } catch (err: any) {
      showNotification('error', `Lỗi lưu ảnh bìa: ${err.message}`);
    } finally {
      setIsSavingBookingCover(false);
    }
  };

  const extractEmailAndNote = (ghiChu?: string | null) => {
    if (!ghiChu) return { email: null, cleanNote: '' };
    const match = ghiChu.match(/\[Email:\s*([^\]]+)\]/i);
    if (match) {
      const email = match[1].trim();
      const cleanNote = ghiChu.replace(match[0], '').trim();
      return { email, cleanNote };
    }
    return { email: null, cleanNote: ghiChu.trim() };
  };

  const handleResendConfirmEmail = async (app: LichHenRecord) => {
    const { email, cleanNote } = extractEmailAndNote(app.ghi_chu);
    if (!email) {
      showNotification('error', 'Khách hàng này không cung cấp email khi đặt lịch!');
      return;
    }
    setIsSendingConfirmEmail(true);
    try {
      const res = await fetch('/api/booking/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: email,
          bookingCode: app.ma_lich_hen,
          ownerName: app.ho_ten_chu,
          petName: app.ten_thu_cung,
          petType: app.loai_thu_cung,
          branchName: app.ten_chi_nhanh || 'Hệ Thống Pet M&M',
          service: app.dich_vu,
          dateTime: `${app.gio_hen}, ngày ${app.ngay_hen}`,
          note: cleanNote,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Lỗi gửi mail');
      showNotification('success', `Đã gửi lại thư xác nhận thành công tới ${email}!`);
    } catch (err: any) {
      showNotification('error', `Không thể gửi mail: ${err.message}`);
    } finally {
      setIsSendingConfirmEmail(false);
    }
  };

  const loadAppointments = useCallback(async () => {
    setAppointmentsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lich_hen')
        .select('*')
        .order('ngay_tao', { ascending: false });

      if (error) throw error;
      setAppointments((data as LichHenRecord[]) || []);
    } catch (err: any) {
      console.error('Lỗi tải lịch hẹn:', err);
      showNotification('error', `Lỗi tải lịch hẹn: ${err.message}`);
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  const handleUpdateAppointmentStatus = async (
    id: string,
    newStatus: 'cho_xac_nhan' | 'da_xac_nhan' | 'da_kham' | 'da_huy'
  ) => {
    setIsUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('lich_hen')
        .update({ trang_thai: newStatus, ngay_cap_nhat: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      setAppointments((prev) =>
        prev.map((app) => (app.id === id ? { ...app, trang_thai: newStatus } : app))
      );
      if (selectedAppointment && selectedAppointment.id === id) {
        setSelectedAppointment((prev) => (prev ? { ...prev, trang_thai: newStatus } : null));
      }
      showNotification('success', 'Đã cập nhật trạng thái lịch hẹn thành công!');
    } catch (err: any) {
      console.error('Lỗi cập nhật trạng thái:', err);
      showNotification('error', `Không thể cập nhật: ${err.message}`);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteAppointment = async (app: LichHenRecord) => {
    if (!window.confirm(`Bạn có chắc muốn xóa lịch hẹn [${app.ma_lich_hen}] của ${app.ho_ten_chu}?`)) return;

    try {
      const { error } = await supabase.from('lich_hen').delete().eq('id', app.id);
      if (error) throw error;
      showNotification('success', 'Đã xóa lịch hẹn thành công!');
      setAppointments((prev) => prev.filter((a) => a.id !== app.id));
      if (selectedAppointment?.id === app.id) setSelectedAppointment(null);
    } catch (err: any) {
      showNotification('error', `Lỗi xóa lịch hẹn: ${err.message}`);
    }
  };

  // -------------------------------------------------------------
  // TAB 6: QUẢN LÝ ĐÁNH GIÁ KHÁCH HÀNG (REVIEWS)
  // -------------------------------------------------------------
  const [reviews, setReviews] = useState<DanhGiaRecord[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Partial<DanhGiaRecord> | null>(null);
  const [isCreatingNewReview, setIsCreatingNewReview] = useState(false);
  const [isReviewSaving, setIsReviewSaving] = useState(false);

  const loadReviews = useCallback(async () => {
    setReviewsLoading(true);
    try {
      const { data, error } = await supabase
        .from('danh_gia')
        .select('*')
        .order('thu_tu', { ascending: true });

      if (error) throw error;
      setReviews((data as DanhGiaRecord[]) || []);
    } catch (err: any) {
      console.error('Lỗi tải đánh giá:', err);
      showNotification('error', `Lỗi tải đánh giá: ${err.message}`);
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  const handleAddNewReview = () => {
    const nextOrder = reviews.length > 0 ? Math.max(...reviews.map((r) => r.thu_tu || 0)) + 1 : 1;
    setEditingReview({
      ten_khach_hang: '',
      so_dien_thoai: '0908 234 ***',
      so_sao: 5,
      noi_dung: '',
      hinh_anh_thu_cung: '/pet_golden_spa.jpg',
      ngay_danh_gia: 'Gần đây',
      da_xac_thuc: true,
      thu_tu: nextOrder,
      kich_hoat: true,
    });
    setIsCreatingNewReview(true);
  };

  const handleEditReview = (review: DanhGiaRecord) => {
    setEditingReview({ ...review });
    setIsCreatingNewReview(false);
  };

  const handleToggleReviewActive = async (review: DanhGiaRecord) => {
    const newStatus = !review.kich_hoat;
    try {
      const { error } = await supabase
        .from('danh_gia')
        .update({ kich_hoat: newStatus, ngay_cap_nhat: new Date().toISOString() })
        .eq('id', review.id);

      if (error) throw error;
      setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, kich_hoat: newStatus } : r)));
      showNotification('success', `Đã ${newStatus ? 'hiển thị' : 'ẩn'} đánh giá`);
    } catch (err: any) {
      showNotification('error', `Lỗi cập nhật: ${err.message}`);
    }
  };

  const handleDeleteReview = async (review: DanhGiaRecord) => {
    if (!window.confirm(`Bạn có chắc muốn xóa đánh giá của "${review.ten_khach_hang}" không?`)) return;

    try {
      const { error } = await supabase.from('danh_gia').delete().eq('id', review.id);
      if (error) throw error;
      showNotification('success', 'Đã xóa đánh giá thành công!');
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
      if (editingReview?.id === review.id) setEditingReview(null);
    } catch (err: any) {
      showNotification('error', `Lỗi xóa: ${err.message}`);
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    if (!editingReview.ten_khach_hang?.trim()) {
      showNotification('error', 'Vui lòng nhập tên khách hàng');
      return;
    }
    if (!editingReview.noi_dung?.trim()) {
      showNotification('error', 'Vui lòng nhập nội dung đánh giá');
      return;
    }

    setIsReviewSaving(true);
    try {
      const payload = {
        ten_khach_hang: editingReview.ten_khach_hang.trim(),
        so_dien_thoai: editingReview.so_dien_thoai?.trim() || '0908 234 ***',
        so_sao: Number(editingReview.so_sao) || 5,
        noi_dung: editingReview.noi_dung.trim(),
        dich_vu_su_dung: editingReview.dich_vu_su_dung?.trim() || '',
        chi_nhanh: editingReview.chi_nhanh?.trim() || '',
        hinh_anh_thu_cung: editingReview.hinh_anh_thu_cung?.trim() || '/pet_golden_spa.jpg',
        ngay_danh_gia: editingReview.ngay_danh_gia?.trim() || 'Gần đây',
        da_xac_thuc: editingReview.da_xac_thuc ?? true,
        thu_tu: Number(editingReview.thu_tu) || 0,
        kich_hoat: editingReview.kich_hoat !== false,
        ngay_cap_nhat: new Date().toISOString(),
      };

      if (isCreatingNewReview || !editingReview.id) {
        const { error } = await supabase.from('danh_gia').insert([payload]);
        if (error) throw error;
        showNotification('success', 'Đã thêm đánh giá mới thành công!');
      } else {
        const { error } = await supabase.from('danh_gia').update(payload).eq('id', editingReview.id);
        if (error) throw error;
        showNotification('success', 'Đã cập nhật đánh giá thành công!');
      }

      setEditingReview(null);
      setIsCreatingNewReview(false);
      await loadReviews();
    } catch (err: any) {
      console.error('Save review error:', err);
      showNotification('error', `Lỗi lưu đánh giá: ${err.message}`);
    } finally {
      setIsReviewSaving(false);
    }
  };

  // -------------------------------------------------------------
  // TAB 7: QUẢN LÝ ĐỘI NGŨ Y TẾ (TEAM MEMBERS)
  // -------------------------------------------------------------
  const [teamMembers, setTeamMembers] = useState<DoiNguRecord[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<Partial<DoiNguRecord> | null>(null);
  const [isCreatingNewMember, setIsCreatingNewMember] = useState(false);
  const [isMemberSaving, setIsMemberSaving] = useState(false);
  const [memberModalTab, setMemberModalTab] = useState<'vi' | 'en'>('vi');
  const [isTranslatingMember, setIsTranslatingMember] = useState(false);
  const [teamCategoryFilter, setTeamCategoryFilter] = useState<'all' | 'lanh_dao' | 'chuyen_gia' | 'bac_si' | 'dieu_duong'>('all');

  const loadTeamMembers = useCallback(async () => {
    setTeamLoading(true);
    try {
      const { data, error } = await supabase
        .from('doi_ngu_y_te')
        .select('*')
        .order('thu_tu', { ascending: true });

      if (error) throw error;
      setTeamMembers((data as DoiNguRecord[]) || []);
    } catch (err: any) {
      console.error('Lỗi tải đội ngũ y tế:', err);
      showNotification('error', `Lỗi tải đội ngũ: ${err.message}`);
    } finally {
      setTeamLoading(false);
    }
  }, []);

  const handleAddNewMember = () => {
    const nextOrder = teamMembers.length > 0 ? Math.max(...teamMembers.map((m) => m.thu_tu || 0)) + 1 : 1;
    setMemberModalTab('vi');
    setEditingMember({
      ho_ten: '',
      ho_ten_en: '',
      chuc_danh: teamCategoryFilter === 'dieu_duong' ? 'ĐIỀU DƯỠNG' : teamCategoryFilter === 'chuyen_gia' ? 'CHUYÊN GIA TƯ VẤN' : teamCategoryFilter === 'lanh_dao' ? 'NHÀ SÁNG LẬP · PET M&M' : 'BÁC SĨ THÚ Y',
      chuc_danh_en: '',
      hoc_vi_chuc_vu: '',
      hoc_vi_chuc_vu_en: '',
      phan_loai: teamCategoryFilter !== 'all' ? teamCategoryFilter : 'bac_si',
      hinh_anh: '',
      mo_ta: '',
      mo_ta_en: '',
      thu_tu: nextOrder,
      kich_hoat: true,
    });
    setIsCreatingNewMember(true);
  };

  const handleEditMember = (member: DoiNguRecord) => {
    setMemberModalTab('vi');
    setEditingMember({ ...member });
    setIsCreatingNewMember(false);
  };

  const handleToggleMemberActive = async (member: DoiNguRecord) => {
    const newStatus = !member.kich_hoat;
    try {
      const { error } = await supabase
        .from('doi_ngu_y_te')
        .update({ kich_hoat: newStatus, ngay_cap_nhat: new Date().toISOString() })
        .eq('id', member.id);

      if (error) throw error;
      setTeamMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, kich_hoat: newStatus } : m)));
      showNotification('success', `Đã ${newStatus ? 'kích hoạt' : 'tạm ẩn'} nhân sự`);
    } catch (err: any) {
      showNotification('error', `Lỗi cập nhật: ${err.message}`);
    }
  };

  const handleDeleteMember = async (member: DoiNguRecord) => {
    if (!window.confirm(`Bạn có chắc muốn xóa nhân sự "${member.ho_ten}" không?`)) return;

    try {
      const { error } = await supabase.from('doi_ngu_y_te').delete().eq('id', member.id);
      if (error) throw error;
      showNotification('success', 'Đã xóa nhân sự thành công!');
      setTeamMembers((prev) => prev.filter((m) => m.id !== member.id));
      if (editingMember?.id === member.id) setEditingMember(null);
    } catch (err: any) {
      showNotification('error', `Lỗi xóa: ${err.message}`);
    }
  };

  const handleTranslateMember = async () => {
    if (!editingMember) return;
    if (!editingMember.ho_ten && !editingMember.chuc_danh && !editingMember.hoc_vi_chuc_vu && !editingMember.mo_ta) {
      showNotification('error', 'Chưa có nội dung tiếng Việt để dịch');
      return;
    }
    setIsTranslatingMember(true);
    try {
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            ho_ten: editingMember.ho_ten || '',
            chuc_danh: editingMember.chuc_danh || '',
            hoc_vi_chuc_vu: editingMember.hoc_vi_chuc_vu || '',
            mo_ta: editingMember.mo_ta || '',
          },
          context: 'veterinary doctor, medical specialist, clinic team member profile',
        }),
      });
      const data = await res.json();
      if (data.success && data.translations) {
        setEditingMember((prev: any) => ({
          ...prev,
          ho_ten_en: data.translations.ho_ten || prev?.ho_ten_en || prev?.ho_ten,
          chuc_danh_en: data.translations.chuc_danh || prev?.chuc_danh_en || '',
          hoc_vi_chuc_vu_en: data.translations.hoc_vi_chuc_vu || prev?.hoc_vi_chuc_vu_en || '',
          mo_ta_en: data.translations.mo_ta || prev?.mo_ta_en || '',
        }));
        setMemberModalTab('en');
        showNotification('success', 'Đã tự động dịch thông tin nhân sự sang Tiếng Anh!');
      } else {
        throw new Error(data.error || 'Dịch tự động thất bại');
      }
    } catch (err: any) {
      showNotification('error', `Lỗi dịch tự động: ${err.message}`);
    } finally {
      setIsTranslatingMember(false);
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!editingMember.ho_ten?.trim()) {
      showNotification('error', 'Vui lòng nhập họ và tên');
      return;
    }

    setIsMemberSaving(true);
    try {
      const payload = {
        ho_ten: editingMember.ho_ten.trim(),
        ho_ten_en: editingMember.ho_ten_en?.trim() || null,
        chuc_danh: editingMember.chuc_danh?.trim() || 'BÁC SĨ THÚ Y',
        chuc_danh_en: editingMember.chuc_danh_en?.trim() || null,
        hoc_vi_chuc_vu: editingMember.hoc_vi_chuc_vu?.trim() || '',
        hoc_vi_chuc_vu_en: editingMember.hoc_vi_chuc_vu_en?.trim() || null,
        phan_loai: editingMember.phan_loai || 'bac_si',
        hinh_anh: editingMember.hinh_anh?.trim() || '',
        mo_ta: editingMember.mo_ta?.trim() || '',
        mo_ta_en: editingMember.mo_ta_en?.trim() || null,
        thu_tu: Number(editingMember.thu_tu) || 0,
        kich_hoat: editingMember.kich_hoat !== false,
        ngay_cap_nhat: new Date().toISOString(),
      };

      if (isCreatingNewMember || !editingMember.id) {
        const { error } = await supabase.from('doi_ngu_y_te').insert([payload]);
        if (error) throw error;
        showNotification('success', 'Đã thêm nhân sự mới thành công!');
      } else {
        const { error } = await supabase.from('doi_ngu_y_te').update(payload).eq('id', editingMember.id);
        if (error) throw error;
        showNotification('success', 'Đã cập nhật thông tin nhân sự!');
      }

      setEditingMember(null);
      setIsCreatingNewMember(false);
      await loadTeamMembers();
    } catch (err: any) {
      console.error('Save member error:', err);
      showNotification('error', `Lỗi lưu nhân sự: ${err.message}`);
    } finally {
      setIsMemberSaving(false);
    }
  };

  // -------------------------------------------------------------
  // TAB 8: QUẢN LÝ BÀI VIẾT & CẨM NANG KIẾN THỨC (ARTICLES)
  // -------------------------------------------------------------
  const [articles, setArticles] = useState<BaiVietRecord[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<Partial<BaiVietRecord> | null>(null);
  const [isCreatingNewArticle, setIsCreatingNewArticle] = useState(false);
  const [isArticleSaving, setIsArticleSaving] = useState(false);
  const [articleCategoryFilter, setArticleCategoryFilter] = useState<string>('all');
  const [articleLangTab, setArticleLangTab] = useState<'vi' | 'en'>('vi');
  const [isTranslatingArticle, setIsTranslatingArticle] = useState(false);

  const loadArticles = useCallback(async () => {
    setArticlesLoading(true);
    try {
      const { data, error } = await supabase
        .from('bai_viet')
        .select('*')
        .order('thu_tu', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles((data as BaiVietRecord[]) || []);
    } catch (err: any) {
      console.error('Lỗi tải danh sách bài viết:', err);
      showNotification('error', `Lỗi tải bài viết: ${err.message}`);
    } finally {
      setArticlesLoading(false);
    }
  }, []);

  const handleAddNewArticle = () => {
    const nextOrder = articles.length > 0 ? Math.max(...articles.map((a) => a.thu_tu || 0)) + 1 : 1;
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const dateFormatted = `${day}/${month}/${year}`;

    setEditingArticle({
      tieu_de: '',
      slug: '',
      chuyen_muc: articleCategoryFilter !== 'all' ? articleCategoryFilter : 'Y Khoa Dự Phòng',
      mo_ta_ngan: '',
      noi_dung: '',
      hinh_anh: '',
      thoi_gian_doc: '4 phút đọc',
      tac_gia: 'Hội Đồng Y Khoa Pet M&M',
      ngay_dang: dateFormatted,
      thu_tu: nextOrder,
      kich_hoat: true,
      luot_xem: 0,
    });
    setIsCreatingNewArticle(true);
  };

  const handleEditArticle = (article: BaiVietRecord) => {
    setEditingArticle({ ...article });
    setIsCreatingNewArticle(false);
    setArticleLangTab('vi');
  };

  const handleAutoTranslateArticle = async () => {
    if (!editingArticle?.tieu_de) {
      showNotification('error', 'Vui lòng nhập Tiêu đề Tiếng Việt trước khi dịch!');
      return;
    }
    setIsTranslatingArticle(true);
    try {
      const fieldsToTranslate: Record<string, string> = {
        tieu_de: editingArticle.tieu_de || '',
        mo_ta_ngan: editingArticle.mo_ta_ngan || '',
        noi_dung: editingArticle.noi_dung || '',
        chuyen_muc: editingArticle.chuyen_muc || '',
        tac_gia: editingArticle.tac_gia || '',
      };
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fieldsToTranslate }),
      });
      const data = await res.json();
      if (data.success && data.translations) {
        setEditingArticle((prev) => (prev ? {
          ...prev,
          tieu_de_en: data.translations.tieu_de || (prev as any).tieu_de_en,
          mo_ta_ngan_en: data.translations.mo_ta_ngan || (prev as any).mo_ta_ngan_en,
          noi_dung_en: data.translations.noi_dung || (prev as any).noi_dung_en,
          chuyen_muc_en: data.translations.chuyen_muc || (prev as any).chuyen_muc_en,
          tac_gia_en: data.translations.tac_gia || (prev as any).tac_gia_en,
        } as any : null));
        setArticleLangTab('en');
        showNotification('success', 'Đã chuyển đổi sang Tiếng Anh thành công!');
      } else throw new Error(data.error || 'Dịch thất bại');
    } catch (err: any) {
      showNotification('error', `Lỗi dịch: ${err.message}`);
    } finally {
      setIsTranslatingArticle(false);
    }
  };

  const handleToggleArticleActive = async (article: BaiVietRecord) => {
    const newStatus = !article.kich_hoat;
    try {
      const { error } = await supabase
        .from('bai_viet')
        .update({ kich_hoat: newStatus, updated_at: new Date().toISOString() })
        .eq('id', article.id);

      if (error) throw error;
      setArticles((prev) => prev.map((a) => (a.id === article.id ? { ...a, kich_hoat: newStatus } : a)));
      showNotification('success', `Đã ${newStatus ? 'hiển thị' : 'tạm ẩn'} bài viết`);
    } catch (err: any) {
      showNotification('error', `Lỗi cập nhật: ${err.message}`);
    }
  };

  const handleDeleteArticle = async (article: BaiVietRecord) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bài viết "${article.tieu_de}" không?`)) return;

    try {
      const { error } = await supabase.from('bai_viet').delete().eq('id', article.id);
      if (error) throw error;
      showNotification('success', 'Đã xóa bài viết thành công!');
      setArticles((prev) => prev.filter((a) => a.id !== article.id));
      if (editingArticle?.id === article.id) setEditingArticle(null);
    } catch (err: any) {
      showNotification('error', `Lỗi xóa: ${err.message}`);
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    if (!editingArticle.tieu_de?.trim()) {
      showNotification('error', 'Vui lòng nhập tiêu đề bài viết');
      return;
    }

    setIsArticleSaving(true);
    try {
      const payload = {
        tieu_de: editingArticle.tieu_de.trim(),
        slug:
          editingArticle.slug?.trim() ||
          editingArticle.tieu_de
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, ''),
        chuyen_muc: editingArticle.chuyen_muc?.trim() || 'Y Khoa Dự Phòng',
        tieu_de_en: (editingArticle as any).tieu_de_en?.trim() || '',
        mo_ta_ngan_en: (editingArticle as any).mo_ta_ngan_en?.trim() || '',
        noi_dung_en: (editingArticle as any).noi_dung_en?.trim() || '',
        chuyen_muc_en: (editingArticle as any).chuyen_muc_en?.trim() || '',
        tac_gia_en: (editingArticle as any).tac_gia_en?.trim() || '',
        mo_ta_ngan: editingArticle.mo_ta_ngan?.trim() || '',
        noi_dung: editingArticle.noi_dung?.trim() || '',
        hinh_anh: editingArticle.hinh_anh?.trim() || '',
        thoi_gian_doc: editingArticle.thoi_gian_doc?.trim() || '4 phút đọc',
        tac_gia: editingArticle.tac_gia?.trim() || 'Hội Đồng Y Khoa Pet M&M',
        ngay_dang: editingArticle.ngay_dang?.trim() || '',
        thu_tu: Number(editingArticle.thu_tu) || 0,
        kich_hoat: editingArticle.kich_hoat !== false,
        updated_at: new Date().toISOString(),
      };

      if (isCreatingNewArticle || !editingArticle.id) {
        const { error } = await supabase.from('bai_viet').insert([payload]);
        if (error) throw error;
        showNotification('success', 'Đã thêm bài viết mới thành công!');
      } else {
        const { error } = await supabase.from('bai_viet').update(payload).eq('id', editingArticle.id);
        if (error) throw error;
        showNotification('success', 'Đã cập nhật bài viết thành công!');
      }

      setEditingArticle(null);
      setIsCreatingNewArticle(false);
      await loadArticles();
    } catch (err: any) {
      console.error('Save article error:', err);
      showNotification('error', `Lỗi lưu bài viết: ${err.message}`);
    } finally {
      setIsArticleSaving(false);
    }
  };

  // -------------------------------------------------------------
  // SLIDES ẢNH GIỚI THIỆU & ĐỘI NGŨ (ABOUT SLIDES)
  // -------------------------------------------------------------
  const [aboutSlides, setAboutSlides] = useState<HeroBannerItem[]>([]);
  const [aboutSlidesLoading, setAboutSlidesLoading] = useState(true);
  const [editingAboutSlide, setEditingAboutSlide] = useState<Partial<HeroBannerItem> | null>(null);
  const [isCreatingNewAboutSlide, setIsCreatingNewAboutSlide] = useState(false);
  const [isAboutSlideSaving, setIsAboutSlideSaving] = useState(false);

  const loadAboutSlides = useCallback(async () => {
    setAboutSlidesLoading(true);
    try {
      const { data, error } = await supabase
        .from('hinh_anh')
        .select('*')
        .eq('chuyen_muc', 'gioi_thieu')
        .order('thu_tu', { ascending: true });

      if (error) throw error;
      setAboutSlides((data as HeroBannerItem[]) || []);
    } catch (err: any) {
      console.error('Lỗi tải slide giới thiệu:', err);
    } finally {
      setAboutSlidesLoading(false);
    }
  }, []);

  const handleAutoTranslateAboutSlide = async () => {
    if (!editingAboutSlide?.tieu_de) {
      showNotification('error', 'Vui lòng nhập Tiêu đề Tiếng Việt trước khi dịch!');
      return;
    }
    setIsTranslatingAboutSlide(true);
    try {
      const res = await fetch('/api/admin/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            tieu_de: editingAboutSlide.tieu_de || '',
            alt_text: editingAboutSlide.alt_text || '',
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.translations) {
        setEditingAboutSlide((prev) => (prev ? {
          ...prev,
          tieu_de_en: data.translations.tieu_de || (prev as any).tieu_de_en,
          alt_text_en: data.translations.alt_text || (prev as any).alt_text_en,
        } : null));
        setAboutSlideLang('en');
        showNotification('success', 'Đã chuyển đổi Slide sang Tiếng Anh thành công!');
      } else throw new Error(data.error || 'Dịch thất bại');
    } catch (err: any) {
      showNotification('error', 'Lỗi dịch: ' + err.message);
    } finally {
      setIsTranslatingAboutSlide(false);
    }
  };

  const handleAddNewAboutSlide = () => {
    const nextOrder = aboutSlides.length > 0 ? Math.max(...aboutSlides.map((s) => s.thu_tu || 0)) + 1 : 1;
    setEditingAboutSlide({
      duong_dan_anh: '',
      tieu_de: '',
      alt_text: 'Đội ngũ chuyên môn',
      chuyen_muc: 'gioi_thieu',
      thu_tu: nextOrder,
      kich_hoat: true,
    });
    setIsCreatingNewAboutSlide(true);
  };

  const handleEditAboutSlide = (slide: HeroBannerItem) => {
    setEditingAboutSlide({ ...slide });
    setIsCreatingNewAboutSlide(false);
  };

  const handleToggleAboutSlideActive = async (slide: HeroBannerItem) => {
    const newStatus = !slide.kich_hoat;
    try {
      const { error } = await supabase
        .from('hinh_anh')
        .update({ kich_hoat: newStatus, ngay_cap_nhat: new Date().toISOString() })
        .eq('id', slide.id);

      if (error) throw error;
      setAboutSlides((prev) => prev.map((s) => (s.id === slide.id ? { ...s, kich_hoat: newStatus } : s)));
      showNotification('success', `Đã ${newStatus ? 'hiển thị' : 'ẩn'} slide ảnh`);
    } catch (err: any) {
      showNotification('error', `Lỗi cập nhật: ${err.message}`);
    }
  };

  const handleDeleteAboutSlide = async (slide: HeroBannerItem) => {
    if (!window.confirm(`Bạn có chắc muốn xóa ảnh slide "${slide.tieu_de || 'này'}" không?`)) return;

    try {
      const { error } = await supabase.from('hinh_anh').delete().eq('id', slide.id);
      if (error) throw error;
      showNotification('success', 'Đã xóa slide ảnh thành công!');
      setAboutSlides((prev) => prev.filter((s) => s.id !== slide.id));
      if (editingAboutSlide?.id === slide.id) setEditingAboutSlide(null);
    } catch (err: any) {
      showNotification('error', `Lỗi xóa: ${err.message}`);
    }
  };

  const handleSaveAboutSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAboutSlide) return;
    if (!editingAboutSlide.duong_dan_anh?.trim()) {
      showNotification('error', 'Vui lòng tải hoặc dán đường dẫn ảnh');
      return;
    }

    setIsAboutSlideSaving(true);
    try {
      const payload = {
        duong_dan_anh: editingAboutSlide.duong_dan_anh.trim(),
        tieu_de: editingAboutSlide.tieu_de?.trim() || 'Hình ảnh Bệnh viện Pet M&M',
        alt_text: editingAboutSlide.alt_text?.trim() || 'Đội ngũ chuyên môn',
        tieu_de_en: (editingAboutSlide as any).tieu_de_en?.trim() || '',
        alt_text_en: (editingAboutSlide as any).alt_text_en?.trim() || '',
        chuyen_muc: 'gioi_thieu',
        thu_tu: Number(editingAboutSlide.thu_tu) || 0,
        kich_hoat: editingAboutSlide.kich_hoat !== false,
        ngay_cap_nhat: new Date().toISOString(),
      };

      if (isCreatingNewAboutSlide || !editingAboutSlide.id) {
        const { error } = await supabase.from('hinh_anh').insert([payload]);
        if (error) throw error;
        showNotification('success', 'Đã thêm slide ảnh giới thiệu mới!');
      } else {
        const { error } = await supabase.from('hinh_anh').update(payload).eq('id', editingAboutSlide.id);
        if (error) throw error;
        showNotification('success', 'Đã cập nhật slide ảnh giới thiệu!');
      }

      setEditingAboutSlide(null);
      setIsCreatingNewAboutSlide(false);
      await loadAboutSlides();
    } catch (err: any) {
      console.error('Save about slide error:', err);
      showNotification('error', `Lỗi lưu ảnh: ${err.message}`);
    } finally {
      setIsAboutSlideSaving(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadBanners();
    loadBranches();
    loadServices();
    loadFaqs();
    loadAppointments();
    loadBookingCover();
    loadReviews();
    loadTeamMembers();
    loadAboutSlides();
    loadArticles();

    // Lắng nghe Realtime lịch hẹn mới khi khách đặt trên website
    const channel = supabase
      .channel('lich_hen_admin_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lich_hen' },
        () => {
          loadAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAppointments]);

  // Filtered data for tables
  const filteredBanners = banners.filter((b) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (b.tieu_de && b.tieu_de.toLowerCase().includes(term)) ||
      (b.duong_dan_anh && b.duong_dan_anh.toLowerCase().includes(term)) ||
      (b.can_chinh && b.can_chinh.toLowerCase().includes(term))
    );
  });

  const filteredBranches = branches.filter((b) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (b.ten_chi_nhanh && b.ten_chi_nhanh.toLowerCase().includes(term)) ||
      (b.dia_chi && b.dia_chi.toLowerCase().includes(term)) ||
      (b.khu_vuc && b.khu_vuc.toLowerCase().includes(term)) ||
      (b.so_dien_thoai && b.so_dien_thoai.toLowerCase().includes(term)) ||
      (b.bac_si_phu_trach && b.bac_si_phu_trach.toLowerCase().includes(term))
    );
  });

  const filteredServices = services.filter((s) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (s.ten_dich_vu && s.ten_dich_vu.toLowerCase().includes(term)) ||
      (s.phu_de && s.phu_de.toLowerCase().includes(term)) ||
      (s.nhom_dich_vu && s.nhom_dich_vu.toLowerCase().includes(term)) ||
      (s.huy_hieu && s.huy_hieu.toLowerCase().includes(term)) ||
      (s.gia_tham_khao && s.gia_tham_khao.toLowerCase().includes(term))
    );
  });

  const filteredFaqs = faqs.filter((f) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (f.cau_hoi && f.cau_hoi.toLowerCase().includes(term)) ||
      (f.cau_hoi_en && f.cau_hoi_en.toLowerCase().includes(term)) ||
      (f.cau_tra_loi && f.cau_tra_loi.toLowerCase().includes(term)) ||
      (f.cau_tra_loi_en && f.cau_tra_loi_en.toLowerCase().includes(term)) ||
      (f.chuyen_muc && f.chuyen_muc.toLowerCase().includes(term)) ||
      (f.chuyen_muc_en && f.chuyen_muc_en.toLowerCase().includes(term))
    );
  });

  const filteredAppointments = appointments.filter((app) => {
    if (statusFilter !== 'all' && app.trang_thai !== statusFilter) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (app.ma_lich_hen && app.ma_lich_hen.toLowerCase().includes(term)) ||
      (app.ho_ten_chu && app.ho_ten_chu.toLowerCase().includes(term)) ||
      (app.so_dien_thoai && app.so_dien_thoai.toLowerCase().includes(term)) ||
      (app.ten_thu_cung && app.ten_thu_cung.toLowerCase().includes(term)) ||
      (app.ten_chi_nhanh && app.ten_chi_nhanh.toLowerCase().includes(term)) ||
      (app.dich_vu && app.dich_vu.toLowerCase().includes(term))
    );
  });

  const filteredReviews = reviews.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.ten_khach_hang && r.ten_khach_hang.toLowerCase().includes(term)) ||
      (r.noi_dung && r.noi_dung.toLowerCase().includes(term)) ||
      (r.dich_vu_su_dung && r.dich_vu_su_dung.toLowerCase().includes(term)) ||
      (r.chi_nhanh && r.chi_nhanh.toLowerCase().includes(term)) ||
      (r.so_dien_thoai && r.so_dien_thoai.toLowerCase().includes(term))
    );
  });

  const filteredTeamMembers = teamMembers.filter((m) => {
    if (teamCategoryFilter !== 'all' && m.phan_loai !== teamCategoryFilter) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (m.ho_ten && m.ho_ten.toLowerCase().includes(term)) ||
      (m.chuc_danh && m.chuc_danh.toLowerCase().includes(term)) ||
      (m.hoc_vi_chuc_vu && m.hoc_vi_chuc_vu.toLowerCase().includes(term)) ||
      (m.mo_ta && m.mo_ta.toLowerCase().includes(term))
    );
  });

  const filteredArticles = articles.filter((a) => {
    if (articleCategoryFilter !== 'all' && a.chuyen_muc !== articleCategoryFilter) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (a.tieu_de && a.tieu_de.toLowerCase().includes(term)) ||
      (a.mo_ta_ngan && a.mo_ta_ngan.toLowerCase().includes(term)) ||
      (a.chuyen_muc && a.chuyen_muc.toLowerCase().includes(term)) ||
      (a.tac_gia && a.tac_gia.toLowerCase().includes(term)) ||
      (a.noi_dung && a.noi_dung.toLowerCase().includes(term))
    );
  });

  const pendingAppointmentsCount = appointments.filter((a) => a.trang_thai === 'cho_xac_nhan').length;

  // Current tab metadata for Breadcrumbs
  const tabTitles: Record<AdminTab, { title: string; category: string; icon: any }> = {
    banners: { title: 'Quản Lý Ảnh Nền Hero', category: 'Nội Dung Giao Diện', icon: ImageIcon },
    branches: { title: 'Quản Lý Hệ Thống Chi Nhánh', category: 'Cơ Sở Bệnh Viện', icon: MapPin },
    services: { title: 'Quản Lý Dịch Vụ Chuẩn 5 Sao', category: 'Dịch Vụ & Bảng Giá', icon: Stethoscope },
    appointments: { title: 'Quản Lý Lịch Hẹn Khách Hàng', category: 'Khách Hàng & Đặt Lịch', icon: CalendarDays },
    faqs: { title: 'Quản Lý Câu Hỏi Thường Gặp', category: 'Hỗ Trợ & Giải Đáp', icon: HelpCircle },
    reviews: { title: 'Quản Lý Đánh Giá Khách Hàng', category: 'Phản Hồi & Đánh Giá', icon: Star },
    team: { title: 'Quản Lý Đội Ngũ Y Tế', category: 'Chuyên Môn & Nhân Sự', icon: UserCheck },
    articles: { title: 'Quản Lý Cẩm Nang & Bài Viết', category: 'Tin Tức & Kiến Thức', icon: BookOpen },
    config: { title: 'Cài Đặt Hệ Thống', category: 'Cài Đặt', icon: Settings },
  };

  const subTabTitles: Record<ConfigSubTab, string> = {
    contact: 'Hotline & Mạng Xã Hội',
    email: 'Email & Máy Chủ Gửi Thư (SMTP)',
    about: 'Giới Thiệu & Triết Lý',
    slides: 'Slide Ảnh Giới Thiệu',
    stats: 'Thông Số Thống Kê',
    slogans: 'Khẩu Hiệu & Slogan',
  };

  // AUTH GATE
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0B150A] flex flex-col items-center justify-center p-4 select-none">
        <PetLogo size="lg" />
        <div className="mt-6 flex items-center gap-2.5 text-slate-300 text-xs font-semibold">
          <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>Đang kiểm tra quyền truy cập quản trị...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLoginPage
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex antialiased">
      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR MENU (CỐ ĐỊNH PHONG CÁCH ERP / SAAS B2B) */}
      {/* ========================================================= */}

      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand / Logo Top */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2D5A27] to-[#1E4D1A] flex items-center justify-center text-amber-300 shadow-md ring-1 ring-amber-400/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-wide text-white">Pet M&M</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  ERP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-light">Quản Trị Hệ Thống 5★</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Quản Lý Dữ Liệu
            </div>
            <nav className="space-y-1">
              {/* Menu 1: Banners */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('banners');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'banners'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ImageIcon
                    className={`w-4 h-4 transition ${
                      activeTab === 'banners' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Ảnh Nền Hero</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'banners' ? 'bg-black/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {banners.length}
                </span>
              </button>

              {/* Menu 2: Branches */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('branches');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'branches'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin
                    className={`w-4 h-4 transition ${
                      activeTab === 'branches' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Hệ Thống Chi Nhánh</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'branches' ? 'bg-black/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {branches.length}
                </span>
              </button>

              {/* Menu 3: Services */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('services');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'services'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Stethoscope
                    className={`w-4 h-4 transition ${
                      activeTab === 'services' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Dịch Vụ Chuẩn 5★</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'services' ? 'bg-black/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {services.length}
                </span>
              </button>

              {/* Menu 4: Appointments */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('appointments');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'appointments'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CalendarDays
                    className={`w-4 h-4 transition ${
                      activeTab === 'appointments' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Lịch Hẹn Khách</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {pendingAppointmentsCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Có lịch hẹn mới chờ xác nhận" />
                  )}
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      activeTab === 'appointments'
                        ? 'bg-black/30 text-amber-300'
                        : pendingAppointmentsCount > 0
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {appointments.length}
                  </span>
                </div>
              </button>

              {/* Menu 5: FAQs */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('faqs');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'faqs'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <HelpCircle
                    className={`w-4 h-4 transition ${
                      activeTab === 'faqs' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Câu Hỏi Thường Gặp</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'faqs' ? 'bg-black/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {faqs.length}
                </span>
              </button>

              {/* Menu 6: Reviews */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('reviews');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'reviews'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Star
                    className={`w-4 h-4 transition ${
                      activeTab === 'reviews' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Đánh Giá Khách Hàng</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'reviews' ? 'bg-black/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {reviews.length}
                </span>
              </button>

              {/* Menu 7: Team */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('team');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'team'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck
                    className={`w-4 h-4 transition ${
                      activeTab === 'team' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Đội Ngũ Y Tế</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'team' ? 'bg-black/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {teamMembers.length}
                </span>
              </button>

              {/* Menu 8: Articles / Cẩm Nang */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('articles');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'articles'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen
                    className={`w-4 h-4 transition ${
                      activeTab === 'articles' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Cẩm Nang &amp; Bài Viết</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'articles' ? 'bg-black/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {articles.length}
                </span>
              </button>
            </nav>
          </div>

          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Cài Đặt Hệ Thống
            </div>
            <nav className="space-y-1">
              {/* 1. Hotline & Mạng xã hội */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('config');
                  setConfigSubTab('contact');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'config' && configSubTab === 'contact'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PhoneCall
                    className={`w-3.5 h-3.5 transition ${
                      activeTab === 'config' && configSubTab === 'contact' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Hotline &amp; Mạng Xã Hội</span>
                </div>
              </button>

              
              {/* Cấu hình Email & SMTP */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('config');
                  setConfigSubTab('email');
                  setIsMobileSidebarOpen(false);
                }}
                className={'w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition group ' + (
                  activeTab === 'config' && configSubTab === 'email'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Mail
                    className={'w-3.5 h-3.5 transition ' + (
                      activeTab === 'config' && configSubTab === 'email' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    )}
                  />
                  <span>Email &amp; Máy Chủ Gửi Thư</span>
                </div>
              </button>

              {/* 2. Giới thiệu & Triết lý */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('config');
                  setConfigSubTab('about');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'config' && configSubTab === 'about'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Heart
                    className={`w-3.5 h-3.5 transition ${
                      activeTab === 'config' && configSubTab === 'about' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Giới Thiệu &amp; Triết Lý</span>
                </div>
              </button>

              {/* 3. Slide ảnh giới thiệu */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('config');
                  setConfigSubTab('slides');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'config' && configSubTab === 'slides'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon
                    className={`w-3.5 h-3.5 transition ${
                      activeTab === 'config' && configSubTab === 'slides' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Slide Ảnh Giới Thiệu</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeTab === 'config' && configSubTab === 'slides' ? 'bg-black/30 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {aboutSlides.length}
                </span>
              </button>

              {/* 4. Thông số thống kê */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('config');
                  setConfigSubTab('stats');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'config' && configSubTab === 'stats'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3
                    className={`w-3.5 h-3.5 transition ${
                      activeTab === 'config' && configSubTab === 'stats' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Thông Số Thống Kê</span>
                </div>
              </button>

              {/* 5. Khẩu hiệu & Slogan */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('config');
                  setConfigSubTab('slogans');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition group ${
                  activeTab === 'config' && configSubTab === 'slogans'
                    ? 'bg-[#2D5A27] text-white shadow-sm shadow-[#2D5A27]/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles
                    className={`w-3.5 h-3.5 transition ${
                      activeTab === 'config' && configSubTab === 'slogans' ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span>Khẩu Hiệu &amp; Slogan</span>
                </div>
              </button>
            </nav>
          </div>

          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Liên Kết Ngoài
            </div>
            <nav className="space-y-1">
              <Link
                href="/"
                target="_blank"
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition group"
              >
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white" />
                  <span>Xem Trang Chủ Web</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </nav>
          </div>
        </div>

        {/* Sidebar Bottom / Profile & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold text-xs shrink-0">
                {(currentUser?.username || 'AD').substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser?.ho_ten || currentUser?.username || 'Quản Trị Viên'}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="capitalize">{currentUser?.vai_tro || 'super_admin'}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer shrink-0"
              title="Đăng xuất khỏi hệ thống"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN WORKSPACE CONTAINER (BÊN PHẢI SIDEBAR) */}
      {/* ========================================================= */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 min-h-screen">
        {/* TOP BAR / HEADER (BREADCRUMB & THAO TÁC NHANH) */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger button on Mobile */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 hover:text-slate-600 transition">Trang chủ</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-400">{tabTitles[activeTab].category}</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-slate-900">
                {activeTab === 'config' ? subTabTitles[configSubTab] : tabTitles[activeTab].title}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'banners') loadBanners();
                if (activeTab === 'branches') loadBranches();
                if (activeTab === 'services') loadServices();
                if (activeTab === 'appointments') loadAppointments();
                if (activeTab === 'faqs') loadFaqs();
                if (activeTab === 'reviews') loadReviews();
                if (activeTab === 'team') loadTeamMembers();
                if (activeTab === 'config') {
                  refreshConfig();
                  loadAboutSlides();
                }
                showNotification('success', 'Đã làm mới dữ liệu');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Làm Mới</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xem Website</span>
            </Link>
          </div>
        </header>

        {/* NOTIFICATION TOAST */}
        {notification && (
          <div
            className={`fixed top-16 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl text-xs font-semibold animate-in slide-in-from-top-2 duration-200 ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* WORKSPACE BODY */}
        <main className="flex-1 p-4 sm:p-8 max-w-[1720px] w-full mx-auto">
          {/* ===================================================== */}
          {/* TAB 1: BẢNG DỮ LIỆU QUẢN LÝ ẢNH NỀN HERO BANNER */}
          {/* ===================================================== */}
          {activeTab === 'banners' && (
            <div className="space-y-4">
              {/* Header Card với ô tìm kiếm & Nút "+ Thêm ảnh" (Y hệt mẫu ảnh) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#2D5A27]" />
                    <span>Quản Lý Ảnh Nền Hero</span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Danh sách các slide điện ảnh tự động chuyển cảnh ngoài trang chủ ({banners.length} ảnh)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Ô tìm kiếm */}
                  <div className="relative min-w-[200px] sm:min-w-[260px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#2D5A27] bg-slate-50/50"
                    />
                  </div>

                  {/* Nút "+ Thêm ảnh" (Y hệt nút "+ Thêm sản phẩm" trong ảnh mẫu) */}
                  <button
                    type="button"
                    onClick={handleAddNewBanner}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Ảnh Nền</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {bannersLoading ? (
                  <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#2D5A27]" />
                    <span className="text-xs font-medium">Đang nạp danh sách ảnh nền từ Supabase...</span>
                  </div>
                ) : filteredBanners.length === 0 ? (
                  <div className="p-16 text-center text-slate-500">
                    <ImageIcon className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Chưa có ảnh nền nào</p>
                    <p className="text-xs text-slate-400 mt-1">Bấm nút "Thêm Ảnh Nền" ở góc phải để thêm ảnh mới.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                          <th className="py-3 px-4 w-16 text-center">STT</th>
                          <th className="py-3 px-4 min-w-[140px]">Ảnh Xem Trước</th>
                          <th className="py-3 px-4 min-w-[220px]">Thông Tin &amp; Tọa Độ Căn Chỉnh</th>
                          <th className="py-3 px-4 min-w-[120px]">Thời Gian</th>
                          <th className="py-3 px-4 min-w-[130px] text-center">Trạng Thái</th>
                          <th className="py-3 px-4 min-w-[140px] text-center">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBanners.map((banner, index) => {
                          return (
                            <tr key={banner.id} className="hover:bg-slate-50/60 transition group">
                              <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                                {index + 1}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="relative w-24 h-15 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform duration-200">
                                  <img
                                    src={banner.duong_dan_anh}
                                    alt="Ảnh nền"
                                    className="w-full h-full object-cover"
                                    style={{ objectPosition: banner.can_chinh || 'center' }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/hero_cinematic.jpg';
                                    }}
                                  />
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-900">
                                  {banner.tieu_de || 'Ảnh Nền Hero Pet M&M'}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                    Vị trí: {banner.can_chinh || '50% 50%'}
                                  </span>
                                  <span>•</span>
                                  <span>Thu phóng: {banner.ti_le_phong || 1.05}x</span>
                                </div>
                                <p className="text-[10px] text-slate-400 truncate max-w-xs mt-1 font-mono">
                                  {banner.duong_dan_anh}
                                </p>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{((banner.thoi_gian_hien_thi || 4000) / 1000).toFixed(0)} giây</span>
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleBannerActive(banner)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                                    banner.kich_hoat
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      banner.kich_hoat ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`}
                                  />
                                  <span>{banner.kich_hoat ? 'Hoạt động' : 'Tắt'}</span>
                                </button>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleEditBanner(banner)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-[#2D5A27] hover:text-white hover:border-[#2D5A27] text-slate-600 transition shadow-2xs cursor-pointer"
                                    title="Căn chỉnh vị trí &amp; sửa ảnh"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBanner(banner)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition shadow-2xs cursor-pointer"
                                    title="Xóa ảnh này"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 2: BẢNG DỮ LIỆU QUẢN LÝ CHI NHÁNH BỆNH VIỆN */}
          {/* ===================================================== */}
          {activeTab === 'branches' && (
            <div className="space-y-4">
              {/* Header Card với ô tìm kiếm & Nút "+ Thêm chi nhánh" (Y hệt mẫu ảnh) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#2D5A27]" />
                    <span>Quản Lý Hệ Thống Chi Nhánh</span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hệ thống phòng khám thú y &amp; resort trên toàn thành phố ({branches.length} cơ sở)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Ô tìm kiếm */}
                  <div className="relative min-w-[200px] sm:min-w-[260px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#2D5A27] bg-slate-50/50"
                    />
                  </div>

                  {/* Nút "+ Thêm chi nhánh" (Y hệt nút "+ Thêm sản phẩm" trong ảnh mẫu) */}
                  <button
                    type="button"
                    onClick={handleAddNewBranch}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Chi Nhánh</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {branchesLoading ? (
                  <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#2D5A27]" />
                    <span className="text-xs font-medium">Đang tải danh sách cơ sở từ Supabase...</span>
                  </div>
                ) : filteredBranches.length === 0 ? (
                  <div className="p-16 text-center text-slate-500">
                    <MapPin className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Chưa có chi nhánh nào</p>
                    <p className="text-xs text-slate-400 mt-1">Bấm nút "Thêm Chi Nhánh" ở góc phải để thêm cơ sở mới.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                          <th className="py-3 px-4 w-16 text-center">STT</th>
                          <th className="py-3 px-4 min-w-[200px]">Chi Nhánh</th>
                          <th className="py-3 px-4 min-w-[260px]">Địa Chỉ &amp; Hotline</th>
                          <th className="py-3 px-4 min-w-[160px]">Bác Sĩ Phụ Trách</th>
                          <th className="py-3 px-4 min-w-[130px] text-center">Trạng Thái</th>
                          <th className="py-3 px-4 min-w-[150px] text-center">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBranches.map((branch, index) => {
                          return (
                            <tr key={branch.id} className="hover:bg-slate-50/60 transition group">
                              <td className="py-3.5 px-4 text-center font-bold text-slate-500">
                                {index + 1}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  {branch.anh_dai_dien ? (
                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                                      <img
                                        src={branch.anh_dai_dien}
                                        alt="Cơ sở"
                                        className="w-full h-full object-cover"
                                        style={{ objectPosition: branch.can_chinh_anh || 'center' }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                                      <Building2 className="w-6 h-6" />
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-bold text-slate-900">{branch.ten_chi_nhanh}</div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-slate-100 text-slate-700">
                                        {branch.khu_vuc || 'Khu vực'}
                                      </span>
                                      <span className="text-[11px] text-slate-400">
                                        Thứ tự: {branch.thu_tu || 1}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="text-slate-700 flex items-start gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-[#2D5A27] shrink-0 mt-0.5" />
                                  <span className="line-clamp-2">{branch.dia_chi}</span>
                                </div>
                                <div className="mt-1 text-[11px] text-slate-500 font-medium">
                                  Hotline: <strong className="text-slate-800">{branch.so_dien_thoai}</strong>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-800">
                                  {branch.bac_si_phu_trach || 'Chưa cập nhật'}
                                </div>
                                {branch.bang_cap_bac_si && (
                                  <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-xs">
                                    {branch.bang_cap_bac_si}
                                  </p>
                                )}
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleBranchActive(branch)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                                    branch.kich_hoat
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      branch.kich_hoat ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`}
                                  />
                                  <span>{branch.kich_hoat ? 'Hoạt động' : 'Tắt'}</span>
                                </button>
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <div className="inline-flex items-center gap-1.5">
                                  <Link
                                    href={`/chi-nhanh/${branch.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition shadow-2xs"
                                    title="Xem bài viết chi nhánh ngoài website"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                  </Link>

                                  <button
                                    type="button"
                                    onClick={() => handleEditBranch(branch)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-[#2D5A27] hover:text-white hover:border-[#2D5A27] text-slate-600 transition shadow-2xs cursor-pointer"
                                    title="Chỉnh sửa thông tin chi nhánh"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBranch(branch)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition shadow-2xs cursor-pointer"
                                    title="Xóa chi nhánh"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 3: CẤU HÌNH LIÊN HỆ & MẠNG XÃ HỘI */}
          {/* ===================================================== */}
          {/* ===================================================== */}
          {/* TAB 3: CÀI ĐẶT HỆ THỐNG & SLOGAN TRANG WEB */}
          {/* ===================================================== */}
          {activeTab === 'config' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* THANH ĐIỀU HƯỚNG NHÁNH CON (SUB-TABS) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setConfigSubTab('contact')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    configSubTab === 'contact'
                      ? 'bg-[#2D5A27] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Hotline &amp; Mạng Xã Hội</span>
                </button>

                
                <button
                  type="button"
                  onClick={() => setConfigSubTab('email')}
                  className={'inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ' + (
                    configSubTab === 'email'
                      ? 'bg-[#2D5A27] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email &amp; Máy Chủ Gửi Thư</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfigSubTab('about')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    configSubTab === 'about'
                      ? 'bg-[#2D5A27] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Giới Thiệu &amp; Triết Lý</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfigSubTab('slides')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    configSubTab === 'slides'
                      ? 'bg-[#2D5A27] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Slide Ảnh Giới Thiệu ({aboutSlides.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfigSubTab('stats')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    configSubTab === 'stats'
                      ? 'bg-[#2D5A27] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Thông Số Thống Kê</span>
                </button>

                <button
                  type="button"
                  onClick={() => setConfigSubTab('slogans')}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    configSubTab === 'slogans'
                      ? 'bg-[#2D5A27] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Khẩu Hiệu &amp; Slogan</span>
                </button>
              </div>

              {/* NHÁNH 1: HOTLINE & MẠNG XÃ HỘI */}
              {configSubTab === 'contact' && (
                <form onSubmit={handleSaveConfig} className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                          <PhoneCall className="w-4 h-4 text-[#2D5A27]" />
                          <span>Hotline Cấp Cứu &amp; Kênh Mạng Xã Hội</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Cấu hình số tổng đài 24/7 và các liên kết mạng xã hội chính thức của hệ thống bệnh viện.
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Kênh Liên Lạc
                      </span>
                    </div>

                    {/* Hướng dẫn ẩn icon khi để trống */}
                    <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1 text-[11px] leading-relaxed">
                        <p className="font-semibold text-amber-900">Quy tắc tự động ẩn icon khi không có thông tin:</p>
                        <p className="text-amber-800">
                          Nếu để trống bất kỳ kênh nào dưới đây, toàn bộ biểu tượng (icon) của kênh đó sẽ <strong>tự động ẩn hoàn toàn</strong> trên thanh nổi liên hệ, chân trang Footer và các khu vực khác trên website.
                        </p>
                        <p className="text-amber-800">
                          Đối với ô <strong>Gmail</strong>, khi khách hàng bấm vào biểu tượng Gmail trên web sẽ tự động mở ứng dụng gửi thư (mailto:) tới email này.
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Hotline 24/7 (Gọi trực tiếp & Hiển thị trên web): *
                      </label>
                      <input
                        type="text"
                        required
                        value={configForm.hotline_hien_thi || configForm.hotline || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setConfigForm((prev) => ({
                            ...prev,
                            hotline: val,
                            hotline_hien_thi: val,
                          }));
                        }}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Liên kết Chat Zalo (Zalo OA hoặc Zalo cá nhân):
                        </label>
                        <input
                          type="text"
                          value={configForm.link_zalo || ''}
                          onChange={(e) => setConfigForm((prev) => ({ ...prev, link_zalo: e.target.value }))}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Liên kết Fanpage Facebook (FB):
                        </label>
                        <input
                          type="text"
                          value={configForm.link_facebook || ''}
                          onChange={(e) => setConfigForm((prev) => ({ ...prev, link_facebook: e.target.value }))}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Liên kết Facebook Messenger:
                        </label>
                        <input
                          type="text"
                          value={configForm.link_messenger || ''}
                          onChange={(e) => setConfigForm((prev) => ({ ...prev, link_messenger: e.target.value }))}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Liên kết Kênh TikTok:
                        </label>
                        <input
                          type="text"
                          value={configForm.link_tiktok || ''}
                          onChange={(e) => setConfigForm((prev) => ({ ...prev, link_tiktok: e.target.value }))}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Gmail / Email tiếp nhận liên hệ:
                        </label>
                        <input
                          type="email"
                          value={configForm.email || ''}
                          onChange={(e) => setConfigForm((prev) => ({ ...prev, email: e.target.value }))}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Địa chỉ trụ sở chính (Hiển thị chân trang Footer):
                        </label>
                        <input
                          type="text"
                          value={configForm.dia_chi_chinh || ''}
                          onChange={(e) => setConfigForm((prev) => ({ ...prev, dia_chi_chinh: e.target.value }))}
                          placeholder="123 Nguyễn Văn Cừ, Quận 5, TP.HCM"
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nút Submit lưu nhánh Hotline */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      Các kênh liên hệ và mạng xã hội sẽ được cập nhật ngay lập tức trên toàn hệ thống.
                    </p>
                    <button
                      type="submit"
                      disabled={isConfigSaving}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                      {isConfigSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>{isConfigSaving ? 'Đang lưu...' : 'Lưu Hotline & Mạng Xã Hội'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* NHÁNH: CẤU HÌNH GMAIL SMTP & EMAIL TIẾP NHẬN */}
              {configSubTab === 'email' && (
                <form onSubmit={handleSaveSmtp} className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
                    {/* Header Thẻ */}
                    <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#2D5A27] flex items-center justify-center border border-emerald-200 shrink-0">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                            <span>Máy Chủ Gửi Thư &amp; Email Tiếp Nhận (Gmail SMTP)</span>
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Cấu hình máy chủ gửi thư tự động và hộp thư tiếp nhận thông báo đặt lịch khám bệnh.
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 self-start sm:self-auto">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Gmail SSL (Cổng 465)
                      </span>
                    </div>

                    {isSmtpLoading ? (
                      <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#2D5A27]" />
                        <span>Đang tải thông tin cấu hình email...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* CỘT TRÁI: HƯỚNG DẪN 3 BƯỚC LẤY KEY (MẬT KHẨU ỨNG DỤNG GOOGLE) */}
                        <div className="lg:col-span-5 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-50/80 border border-amber-200/90 rounded-2xl p-5 space-y-4">
                          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                            <KeyRound className="w-4 h-4 text-amber-600" />
                            <span>HƯỚNG DẪN 3 BƯỚC LẤY KEY (MẬT KHẨU ỨNG DỤNG)</span>
                          </div>

                          <div className="space-y-3.5 text-xs text-slate-700">
                            {/* Bước 1 */}
                            <div className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                1
                              </span>
                              <div className="leading-relaxed">
                                <strong className="text-slate-900">Bật Xác minh 2 bước:</strong> Đăng nhập tài khoản Google tại{' '}
                                <a
                                  href="https://myaccount.google.com/security"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-700 font-semibold underline hover:text-blue-900 inline-flex items-center gap-0.5"
                                >
                                  myaccount.google.com <ExternalLink className="w-3 h-3 inline" />
                                </a>
                                , vào mục <strong>Bảo mật</strong> và kích hoạt <strong>Xác minh 2 bước</strong> (bắt buộc).
                              </div>
                            </div>

                            {/* Bước 2 */}
                            <div className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                2
                              </span>
                              <div className="leading-relaxed">
                                <strong className="text-slate-900">Truy cập Mật khẩu ứng dụng:</strong> Nhấp vào link trực tiếp{' '}
                                <a
                                  href="https://myaccount.google.com/apppasswords"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-700 font-semibold underline hover:text-blue-900 inline-flex items-center gap-0.5"
                                >
                                  myaccount.google.com/apppasswords <ExternalLink className="w-3 h-3 inline" />
                                </a>{' '}
                                (hoặc tìm kiếm từ khóa <em>&ldquo;Mật khẩu ứng dụng&rdquo;</em> trong tài khoản Google).
                              </div>
                            </div>

                            {/* Bước 3 */}
                            <div className="flex items-start gap-2.5">
                              <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                                3
                              </span>
                              <div className="leading-relaxed">
                                <strong className="text-slate-900">Tạo mã Key 16 chữ cái:</strong> Đặt tên ứng dụng là <em>PetMM Website</em> và bấm <strong>Tạo</strong>. Google sẽ cấp cho bạn một chuỗi <strong>16 chữ cái</strong> (Key). Hãy sao chép chuỗi này và dán vào ô <strong>Khóa bí mật / Key</strong> bên cạnh rồi bấm <strong>Lưu</strong>!
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* CỘT PHẢI: FORM CẤU HÌNH GỒM MAIL NHẬN + KEY + GMAIL GỬI */}
                        <div className="lg:col-span-7 space-y-4">
                          {/* 1. Mail nhận thông báo */}
                          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-1.5">
                            <label className="block text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                              <Mail className="w-4 h-4 text-[#2D5A27]" />
                              <span>Email Tiếp Nhận Thông Báo Đặt Lịch (Mail nhận): *</span>
                            </label>
                            <input
                              type="email"
                              required
                              value={smtpForm.smtp_notify_email}
                              onChange={(e) => setSmtpForm((prev) => ({ ...prev, smtp_notify_email: e.target.value }))}
                              placeholder="thaitrtin@gmail.com"
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-bold focus:border-[#2D5A27] focus:outline-none bg-white shadow-2xs"
                            />
                            <p className="text-[11px] text-emerald-800">
                              Mỗi khi khách hàng gửi form đặt lịch hẹn, hệ thống sẽ tự động gửi thư báo chi tiết ca khám tới hòm thư này.
                            </p>
                          </div>

                          {/* 2. Tài khoản Gmail gửi thư */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Tài khoản Gmail gửi thư (Sender Email): *
                            </label>
                            <input
                              type="email"
                              required
                              value={smtpForm.smtp_email}
                              onChange={(e) => setSmtpForm((prev) => ({ ...prev, smtp_email: e.target.value }))}
                              placeholder="thaitrtin@gmail.com"
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                              Địa chỉ Gmail dùng để đăng nhập máy chủ SMTP và gửi thư đi.
                            </p>
                          </div>

                          {/* 3. Mật khẩu ứng dụng 16 chữ cái (Key) */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-semibold text-slate-700">
                                Khóa Bí Mật / Mật Khẩu Ứng Dụng Google (Key 16 chữ cái): *
                              </label>
                              {smtpForm.hasPassword && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3" />
                                  <span>Đã cấu hình mã khóa</span>
                                </span>
                              )}
                            </div>
                            <div className="relative">
                              <input
                                type={showSmtpPassword ? 'text' : 'password'}
                                value={smtpForm.smtp_password}
                                onChange={(e) => setSmtpForm((prev) => ({ ...prev, smtp_password: e.target.value }))}
                                placeholder={smtpForm.hasPassword ? '•••• •••• •••• •••• (Đã lưu, nhập mới nếu muốn đổi)' : 'Nhập mã khóa 16 chữ cái (ví dụ: abcd efgh ijkl mnop)'}
                                className="w-full text-xs px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 text-slate-800 font-mono tracking-wider focus:border-[#2D5A27] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                title={showSmtpPassword ? 'Ẩn mã khóa' : 'Hiện mã khóa'}
                              >
                                {showSmtpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Mã 16 chữ cái do Google cấp (xem hướng dẫn 3 bước ở khung bên trái).
                            </p>
                          </div>

                          {/* 4. Tên người gửi hiển thị */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Tên người gửi hiển thị (Sender Display Name):
                            </label>
                            <input
                              type="text"
                              value={smtpForm.smtp_sender_name}
                              onChange={(e) => setSmtpForm((prev) => ({ ...prev, smtp_sender_name: e.target.value }))}
                              placeholder="Bệnh Viện Thú Y Pet M&M 5★"
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                            />
                            <p className="text-[11px] text-slate-400 mt-1">
                              Tên phòng khám sẽ hiển thị trong hộp thư đến của khách hàng.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nút Submit Lưu & Nút Gửi Thử Nghiệm */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      Mật khẩu được lưu trữ an toàn trong database và sử dụng giao thức mã hóa SSL khi gửi.
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleTestSmtp}
                        disabled={isSmtpTesting || isSmtpSaving}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                        title="Gửi 1 email thử nghiệm đến địa chỉ Email nhận thông báo để kiểm tra kết nối"
                      >
                        {isSmtpTesting ? <RefreshCw className="w-4 h-4 animate-spin text-[#2D5A27]" /> : <Send className="w-4 h-4 text-blue-600" />}
                        <span>{isSmtpTesting ? 'Đang gửi thư thử...' : 'Gửi Thư Thử Nghiệm'}</span>
                      </button>

                      <button
                        type="submit"
                        disabled={isSmtpSaving || isSmtpTesting}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                      >
                        {isSmtpSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>{isSmtpSaving ? 'Đang lưu...' : 'Lưu Cấu Hình Email'}</span>
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* NHÁNH 2: GIỚI THIỆU & TRIẾT LÝ */}
              {/* NHÁNH 2: GIỚI THIỆU & TRIẾT LÝ (SONG NGỮ VIỆT - ANH & AI DỊCH THUẬT) */}
              {configSubTab === 'about' && (
                <form onSubmit={handleSaveConfig} className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
                    {/* Header Thẻ: Tiêu đề + Chuyển Ngôn Ngữ + Nút Dịch AI nằm chung hàng */}
                    <div className="pb-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2D5A27] flex items-center justify-center border border-emerald-200 shrink-0">
                          <Heart className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 leading-tight">
                            Sứ Mệnh &amp; Triết Lý Y Khoa (Giới Thiệu Pet M&amp;M)
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Lựa chọn Tiếng Việt hoặc English để chỉnh sửa.
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Tab Ngôn ngữ */}
                        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setAboutSubLang('vi')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              aboutSubLang === 'vi'
                                ? 'bg-[#2D5A27] text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                            <span>Tiếng Việt</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAboutSubLang('en')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              aboutSubLang === 'en'
                                ? 'bg-[#2D5A27] text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <UKFlag className="w-4 h-3 rounded-[2px]" />
                            <span>English</span>
                          </button>
                        </div>

                        {/* Nút Chuyển đổi ENG */}
                        <button
                          type="button"
                          onClick={handleAutoTranslateAbout}
                          disabled={isTranslatingAbout}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs hover:shadow transition disabled:opacity-50 cursor-pointer"
                          title="Tự động dịch toàn bộ nội dung Giới thiệu Tiếng Việt sang Tiếng Anh bằng AI"
                        >
                          {isTranslatingAbout ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          <span>{isTranslatingAbout ? 'Đang chuyển đổi...' : 'Chuyển đổi ENG'}</span>
                        </button>
                      </div>
                    </div>

                    {/* CÁC TRƯỜNG DỮ LIỆU TIẾNG VIỆT */}
                    {aboutSubLang === 'vi' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Huy hiệu trên tiêu đề:
                            </label>
                            <input
                              type="text"
                              value={configForm.gioi_thieu_huy_hieu || ''}
                              onChange={(e) =>
                                setConfigForm((prev) => ({ ...prev, gioi_thieu_huy_hieu: e.target.value }))
                              }
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">VD: SỨ MỆNH &amp; TRIẾT LÝ PET M&amp;M</p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Dòng tiêu đề chính 1:
                            </label>
                            <input
                              type="text"
                              value={configForm.gioi_thieu_tieu_de_1 || ''}
                              onChange={(e) =>
                                setConfigForm((prev) => ({ ...prev, gioi_thieu_tieu_de_1: e.target.value }))
                              }
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">VD: Nâng Tầm Chăm Sóc Y Khoa</p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Dòng tiêu đề 2 (Màu xanh rêu):
                            </label>
                            <input
                              type="text"
                              value={configForm.gioi_thieu_tieu_de_2 || ''}
                              onChange={(e) =>
                                setConfigForm((prev) => ({ ...prev, gioi_thieu_tieu_de_2: e.target.value }))
                              }
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold text-[#2D5A27] focus:border-[#2D5A27] focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">VD: Bằng Trái Tim &amp; Y Đức</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Nội dung đoạn văn sứ mệnh:
                          </label>
                          <textarea
                            rows={4}
                            value={configForm.gioi_thieu_mo_ta || ''}
                            onChange={(e) =>
                              setConfigForm((prev) => ({ ...prev, gioi_thieu_mo_ta: e.target.value }))
                            }
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-y leading-relaxed"
                          />
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-3">
                          <h3 className="text-xs font-bold text-slate-800">
                            Khối &ldquo;Cam Kết Vàng Y Khoa&rdquo; &amp; Bác Sĩ Đại Diện:
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Tiêu đề khối cam kết:
                              </label>
                              <input
                                type="text"
                                value={configForm.gioi_thieu_cam_ket_tieu_de || ''}
                                onChange={(e) =>
                                  setConfigForm((prev) => ({ ...prev, gioi_thieu_cam_ket_tieu_de: e.target.value }))
                                }
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Phụ đề khối cam kết:
                              </label>
                              <input
                                type="text"
                                value={configForm.gioi_thieu_cam_ket_phu || ''}
                                onChange={(e) =>
                                  setConfigForm((prev) => ({ ...prev, gioi_thieu_cam_ket_phu: e.target.value }))
                                }
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Câu trích dẫn tâm niệm y đức:
                            </label>
                            <input
                              type="text"
                              value={configForm.gioi_thieu_trich_dan || ''}
                              onChange={(e) =>
                                setConfigForm((prev) => ({ ...prev, gioi_thieu_trich_dan: e.target.value }))
                              }
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 italic focus:border-[#2D5A27] focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Họ tên bác sĩ đại diện:
                              </label>
                              <input
                                type="text"
                                value={configForm.gioi_thieu_bac_si_ten || ''}
                                onChange={(e) =>
                                  setConfigForm((prev) => ({ ...prev, gioi_thieu_bac_si_ten: e.target.value }))
                                }
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-bold text-[#2D5A27] focus:border-[#2D5A27] focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Chức danh bác sĩ:
                              </label>
                              <input
                                type="text"
                                value={configForm.gioi_thieu_bac_si_chuc_danh || ''}
                                onChange={(e) =>
                                  setConfigForm((prev) => ({ ...prev, gioi_thieu_bac_si_chuc_danh: e.target.value }))
                                }
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CÁC TRƯỜNG DỮ LIỆU TIẾNG ANH (ENGLISH / DATABASE) */}
                    {aboutSubLang === 'en' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                              <span>Badge on title (EN):</span>
                              <span className="text-[10px] text-blue-600 font-normal">gioi_thieu_huy_hieu_en</span>
                            </label>
                            <input
                              type="text"
                              value={configForm.gioi_thieu_huy_hieu_en || ''}
                              onChange={(e) =>
                                setConfigForm((prev) => ({ ...prev, gioi_thieu_huy_hieu_en: e.target.value }))
                              }
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Ex: MISSION &amp; PHILOSOPHY</p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                              <span>Main title line 1 (EN):</span>
                              <span className="text-[10px] text-blue-600 font-normal">gioi_thieu_tieu_de_1_en</span>
                            </label>
                            <input
                              type="text"
                              value={configForm.gioi_thieu_tieu_de_1_en || ''}
                              onChange={(e) =>
                                setConfigForm((prev) => ({ ...prev, gioi_thieu_tieu_de_1_en: e.target.value }))
                              }
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Ex: Elevating Veterinary Medicine</p>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                              <span>Main title line 2 (EN):</span>
                              <span className="text-[10px] text-blue-600 font-normal">gioi_thieu_tieu_de_2_en</span>
                            </label>
                            <input
                              type="text"
                              value={configForm.gioi_thieu_tieu_de_2_en || ''}
                              onChange={(e) =>
                                setConfigForm((prev) => ({ ...prev, gioi_thieu_tieu_de_2_en: e.target.value }))
                              }
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold text-[#2D5A27] focus:border-[#2D5A27] focus:outline-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Ex: With Integrity &amp; Compassion</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                            <span>Mission description (EN):</span>
                            <span className="text-[10px] text-blue-600 font-normal">gioi_thieu_mo_ta_en</span>
                          </label>
                          <textarea
                            rows={4}
                            value={configForm.gioi_thieu_mo_ta_en || ''}
                            onChange={(e) =>
                              setConfigForm((prev) => ({ ...prev, gioi_thieu_mo_ta_en: e.target.value }))
                            }
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-y leading-relaxed"
                          />
                        </div>

                        <div className="pt-3 border-t border-slate-100 space-y-3">
                          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                            <span>Commitment &amp; Doctor Representative (English):</span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Commitment title (EN):
                              </label>
                              <input
                                type="text"
                                value={configForm.gioi_thieu_cam_ket_tieu_de_en || ''}
                                onChange={(e) =>
                                  setConfigForm((prev) => ({ ...prev, gioi_thieu_cam_ket_tieu_de_en: e.target.value }))
                                }
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Commitment subtitle (EN):
                              </label>
                              <input
                                type="text"
                                value={configForm.gioi_thieu_cam_ket_phu_en || ''}
                                onChange={(e) =>
                                  setConfigForm((prev) => ({ ...prev, gioi_thieu_cam_ket_phu_en: e.target.value }))
                                }
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Veterinary medical quote (EN):
                            </label>
                            <input
                              type="text"
                              value={configForm.gioi_thieu_trich_dan_en || ''}
                              onChange={(e) =>
                                setConfigForm((prev) => ({ ...prev, gioi_thieu_trich_dan_en: e.target.value }))
                              }
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 italic focus:border-[#2D5A27] focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Doctor representative name (EN):
                              </label>
                              <input
                                type="text"
                                value={configForm.gioi_thieu_bac_si_ten_en || ''}
                                onChange={(e) =>
                                  setConfigForm((prev) => ({ ...prev, gioi_thieu_bac_si_ten_en: e.target.value }))
                                }
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-bold text-[#2D5A27] focus:border-[#2D5A27] focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Doctor title / position (EN):
                              </label>
                              <input
                                type="text"
                                value={configForm.gioi_thieu_bac_si_chuc_danh_en || ''}
                                onChange={(e) =>
                                  setConfigForm((prev) => ({ ...prev, gioi_thieu_bac_si_chuc_danh_en: e.target.value }))
                                }
                                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nút Submit lưu nhánh Giới thiệu */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      Nội dung song ngữ Việt &amp; Anh sẽ được lưu trực tiếp vào bảng <code className="text-emerald-700 font-semibold">cau_hinh</code> trên Supabase.
                    </p>
                    <button
                      type="submit"
                      disabled={isConfigSaving}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                      {isConfigSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>{isConfigSaving ? 'Đang lưu...' : 'Lưu Giới Thiệu & Triết Lý (Cả Việt & Anh)'}</span>
                    </button>
                  </div>
                </form>
              )}

              {configSubTab === 'slides' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-[#2D5A27]" />
                          <span>Slide Ảnh Khung Giới Thiệu &amp; Đội Ngũ</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Hình ảnh trình chiếu trong khung trượt đa phương tiện tại trang chủ và trang Đội ngũ y tế ({aboutSlides.length} ảnh).
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddNewAboutSlide}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-2xs transition cursor-pointer shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Thêm Ảnh Slide</span>
                      </button>
                    </div>

                    {aboutSlidesLoading ? (
                      <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#2D5A27]" />
                        <span>Đang tải danh sách slide ảnh...</span>
                      </div>
                    ) : aboutSlides.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl space-y-2">
                        <p>Chưa có ảnh slide nào trong danh sách.</p>
                        <button
                          type="button"
                          onClick={handleAddNewAboutSlide}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2D5A27] text-white text-xs font-semibold cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Thêm ảnh slide đầu tiên</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {aboutSlides.map((slide, idx) => (
                          <div
                            key={slide.id || idx}
                            className="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-sm transition flex flex-col justify-between"
                          >
                            <div>
                              <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-200 mb-2.5">
                                <img
                                  src={slide.duong_dan_anh}
                                  alt={slide.tieu_de || 'Ảnh slide'}
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                                  {slide.alt_text || 'Đội ngũ'}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-800 truncate" title={slide.tieu_de}>
                                {slide.tieu_de}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-200">
                              <button
                                type="button"
                                onClick={() => handleToggleAboutSlideActive(slide)}
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition ${
                                  slide.kich_hoat !== false
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                }`}
                              >
                                {slide.kich_hoat !== false ? 'Hiển thị' : 'Đang ẩn'}
                              </button>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditAboutSlide(slide)}
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-[#2D5A27] hover:bg-slate-100 cursor-pointer transition"
                                  title="Chỉnh sửa ảnh"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAboutSlide(slide)}
                                  className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition"
                                  title="Xóa ảnh slide"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* NHÁNH 4: THÔNG SỐ THỐNG KÊ */}
              {configSubTab === 'stats' && (
                <form onSubmit={handleSaveConfig} className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-[#2D5A27]" />
                          <span>Thông Số Thống Kê Giới Thiệu (Thành Lập &amp; Khách Hàng)</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Tùy chỉnh 2 chỉ số cố định dưới chân thẻ Sứ Mệnh &amp; Triết Lý trên trang chủ.
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Chỉ Số Hoạt Động
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs">
                      ℹ️ <strong>Cơ chế hiển thị:</strong> Khối chân thẻ giới thiệu gồm 4 thông số:
                      <ul className="list-disc ml-5 mt-1.5 space-y-1 text-[11px] text-slate-500">
                        <li><strong>Năm thành lập:</strong> Cấu hình thủ công tại đây (ví dụ: 2018).</li>
                        <li><strong>Cơ sở đa khoa:</strong> Tự động đếm số lượng chi nhánh kích hoạt trong hệ thống.</li>
                        <li><strong>Khách hàng:</strong> Cấu hình thủ công tại đây (ví dụ: 30k+).</li>
                        <li><strong>Đội ngũ y tế:</strong> Tự động đếm số lượng bác sĩ và nhân sự trong danh sách nhân sự.</li>
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <label className="block text-xs font-semibold text-slate-700">
                          Năm thành lập (Con số):
                        </label>
                        <input
                          type="text"
                          value={configForm.thong_ke_nam_thanh_lap || ''}
                          onChange={(e) =>
                            setConfigForm((prev) => ({ ...prev, thong_ke_nam_thanh_lap: e.target.value }))
                          }
                          placeholder="2018"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-bold focus:border-[#2D5A27] focus:outline-none bg-white"
                        />
                        <label className="block text-[11px] font-semibold text-slate-600 mt-2">
                          Nhãn hiển thị bên dưới:
                        </label>
                        <input
                          type="text"
                          value={configForm.thong_ke_nam_thanh_lap_nhan || ''}
                          onChange={(e) =>
                            setConfigForm((prev) => ({ ...prev, thong_ke_nam_thanh_lap_nhan: e.target.value }))
                          }
                          placeholder="Năm thành lập"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none bg-white"
                        />
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                        <label className="block text-xs font-semibold text-slate-700">
                          Khách hàng (Con số):
                        </label>
                        <input
                          type="text"
                          value={configForm.thong_ke_khach_hang || ''}
                          onChange={(e) =>
                            setConfigForm((prev) => ({ ...prev, thong_ke_khach_hang: e.target.value }))
                          }
                          placeholder="30k+"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 text-slate-800 font-bold focus:border-[#2D5A27] focus:outline-none bg-white"
                        />
                        <label className="block text-[11px] font-semibold text-slate-600 mt-2">
                          Nhãn hiển thị bên dưới:
                        </label>
                        <input
                          type="text"
                          value={configForm.thong_ke_khach_hang_nhan || ''}
                          onChange={(e) =>
                            setConfigForm((prev) => ({ ...prev, thong_ke_khach_hang_nhan: e.target.value }))
                          }
                          placeholder="Khách hàng"
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Nút Submit lưu nhánh Thống kê */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-slate-500">
                      Thông số sẽ được cập nhật đồng bộ ngay trên thẻ Sứ Mệnh trang chủ.
                    </p>
                    <button
                      type="submit"
                      disabled={isConfigSaving}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                      {isConfigSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>{isConfigSaving ? 'Đang lưu...' : 'Lưu Thông Số Thống Kê'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* NHÁNH 5: KHẨU HIỆU & SLOGAN */}
              {configSubTab === 'slogans' && (
                <form onSubmit={handleSaveConfig} className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="pb-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#2D5A27] flex items-center justify-center border border-emerald-200 shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 leading-tight">
                            Khẩu Hiệu &amp; Slogan Hệ Thống
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Lựa chọn Tiếng Việt hoặc English để chỉnh sửa.
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Tab Ngôn ngữ */}
                        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setSloganSubLang('vi')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              sloganSubLang === 'vi'
                                ? 'bg-[#2D5A27] text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                            <span>Tiếng Việt</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSloganSubLang('en')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              sloganSubLang === 'en'
                                ? 'bg-[#2D5A27] text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <UKFlag className="w-4 h-3 rounded-[2px]" />
                            <span>English</span>
                          </button>
                        </div>

                        {/* Nút Chuyển đổi ENG */}
                        <button
                          type="button"
                          onClick={handleAutoTranslateSlogans}
                          disabled={isTranslatingSlogans}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs hover:shadow transition disabled:opacity-50 cursor-pointer"
                          title="Tự động dịch toàn bộ khẩu hiệu Tiếng Việt sang Tiếng Anh bằng AI"
                        >
                          {isTranslatingSlogans ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                          <span>{isTranslatingSlogans ? 'Đang chuyển đổi...' : 'Chuyển đổi ENG'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* CẤU HÌNH LOGO & TÊN TRÊN THANH ĐỊA CHỈ (TAB TRÌNH DUYỆT) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
                    <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            Logo &amp; Tên Trên Thanh Địa Chỉ (Tab Trình Duyệt / Favicon)
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Tùy chỉnh Logo biểu tượng và tiêu đề trang hiển thị trên tab trình duyệt (hỗ trợ Tiếng Việt &amp; English).
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        Browser Tab
                      </span>
                    </div>

                    {/* MÔ PHỎNG TAB TRÌNH DUYỆT THỰC TẾ (LIVE PREVIEW) */}
                    <div className="p-3.5 bg-slate-100/70 rounded-xl border border-slate-200 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>Xem trước hiển thị trên thanh địa chỉ tab trình duyệt:</span>
                      </div>
                      <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-t-xl bg-white border border-slate-200 shadow-xs max-w-md">
                        <img
                          src={configForm.logo_favicon || '/logo-favicon.png'}
                          alt="Logo Favicon"
                          className="w-4 h-4 object-contain shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/logo-favicon.png';
                          }}
                        />
                        <span className="text-xs font-medium text-slate-800 truncate">
                          {sloganSubLang === 'vi'
                            ? configForm.tieu_de_trang || 'PetM&M — Phòng Khám Thuộc Bệnh Viện Thú Cưng'
                            : configForm.tieu_de_trang_en || 'PetM&M - Homepage'}
                        </span>
                        <X className="w-3 h-3 text-slate-400 shrink-0 ml-1" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                      {/* PHẦN 1: LOGO TRÊN THANH ĐỊA CHỈ (FAVICON ICON) */}
                      <div className="md:col-span-5 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                        <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                          <span>Logo Icon (Favicon):</span>
                          <span className="text-[10px] text-slate-500 font-normal">PNG, ICO, SVG, WEBP</span>
                        </label>

                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
                            <img
                              src={configForm.logo_favicon || '/logo-favicon.png'}
                              alt="Favicon"
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/logo-favicon.png';
                              }}
                            />
                          </div>

                          <div className="space-y-1.5 flex-1 min-w-0">
                            <input
                              type="file"
                              ref={faviconFileInputRef}
                              onChange={handleFaviconUpload}
                              accept="image/png,image/x-icon,image/svg+xml,image/jpeg,image/webp"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => faviconFileInputRef.current?.click()}
                              disabled={isFaviconUploading}
                              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-2xs transition disabled:opacity-50 cursor-pointer"
                            >
                              {isFaviconUploading ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#2D5A27]" />
                              ) : (
                                <Upload className="w-3.5 h-3.5 text-[#2D5A27]" />
                              )}
                              <span>{isFaviconUploading ? 'Đang tải lên...' : 'Tải Logo Mới'}</span>
                            </button>
                            <p className="text-[10px] text-slate-400">
                              Khuyên dùng kích thước vuông (32x32, 64x64 hoặc 128x128 px)
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Hoặc đường dẫn logo trực tiếp:
                          </label>
                          <input
                            type="text"
                            value={configForm.logo_favicon || ''}
                            onChange={(e) => setConfigForm((prev) => ({ ...prev, logo_favicon: e.target.value }))}
                            placeholder="/logo-favicon.png"
                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* PHẦN 2: TÊN TRÊN THANH ĐỊA CHỈ (THEO NGÔN NGỮ ĐANG CHỌN) */}
                      <div className="md:col-span-7 space-y-3.5">
                        {sloganSubLang === 'vi' ? (
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                              <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                              <span>Tên website trên thanh địa chỉ (Tiếng Việt):</span>
                            </label>
                            <input
                              type="text"
                              value={configForm.tieu_de_trang || ''}
                              onChange={(e) => setConfigForm((prev) => ({ ...prev, tieu_de_trang: e.target.value }))}
                              placeholder="PetM&M — Phòng Khám Thuộc Bệnh Viện Thú Cưng"
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none bg-white shadow-2xs"
                            />
                            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                              Xuất hiện trên tiêu đề tab trình duyệt khi người xem chọn Tiếng Việt. Tiêu chuẩn SEO tốt nhất cho Google và nhận diện thương hiệu.
                            </p>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs font-bold text-blue-700 mb-1.5 flex items-center gap-1.5">
                              <UKFlag className="w-4 h-3 rounded-[2px]" />
                              <span>Tên website trên thanh địa chỉ (English):</span>
                            </label>
                            <input
                              type="text"
                              value={configForm.tieu_de_trang_en || ''}
                              onChange={(e) => setConfigForm((prev) => ({ ...prev, tieu_de_trang_en: e.target.value }))}
                              placeholder="PetM&M - Homepage (hoặc PetM&M — Veterinary Hospital & Clinic)"
                              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none bg-white shadow-2xs"
                            />
                            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                              Xuất hiện trên tab trình duyệt khi khách quốc tế chọn 🇬🇧 English trên website. Có thể dùng nút <strong>✨ Chuyển đổi ENG</strong> ở trên để AI tự động dịch.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Slogan Đầu Trang */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#2D5A27]" />
                          <span>1. Khẩu Hiệu Đầu Trang (Hero Banner Slogan)</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Xuất hiện ở phần đầu trang chủ trên nền các hình ảnh chuyển động nghệ thuật.
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Đầu Trang
                      </span>
                    </div>

                    {sloganSubLang === 'vi' ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                            <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                            <span>Tiêu đề khẩu hiệu đầu trang (Tiếng Việt):</span>
                          </label>
                          <input
                            type="text"
                            value={configForm.slogan_dau_trang_tieu_de || ''}
                            onChange={(e) =>
                              setConfigForm((prev) => ({ ...prev, slogan_dau_trang_tieu_de: e.target.value }))
                            }
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none"
                          />
                          <p className="text-[11px] text-slate-400 mt-1">
                            Mẹo: Có thể dùng dấu phẩy &ldquo;,&rdquo; để ngắt câu xuống dòng và làm nổi bật nửa sau in nghiêng màu xanh rêu.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                            <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                            <span>Nội dung chạy slide chân banner (Tiếng Việt):</span>
                          </label>
                          <textarea
                            rows={3}
                            value={configForm.slogan_dau_trang_noi_dung || ''}
                            onChange={(e) =>
                              setConfigForm((prev) => ({ ...prev, slogan_dau_trang_noi_dung: e.target.value }))
                            }
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-y"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1.5">
                            <UKFlag className="w-4 h-3 rounded-[2px]" />
                            <span>Tiêu đề khẩu hiệu đầu trang (English):</span>
                          </label>
                          <input
                            type="text"
                            value={configForm.slogan_dau_trang_tieu_de_en || ''}
                            onChange={(e) =>
                              setConfigForm((prev) => ({ ...prev, slogan_dau_trang_tieu_de_en: e.target.value }))
                            }
                            placeholder="Cherishing Every Breath, Embracing Life with Peace."
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none"
                          />
                          <p className="text-[11px] text-slate-400 mt-1">
                            Tip: Use a comma &ldquo;,&rdquo; to split into two animated lines.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1.5">
                            <UKFlag className="w-4 h-3 rounded-[2px]" />
                            <span>Nội dung chạy slide chân banner (English):</span>
                          </label>
                          <textarea
                            rows={3}
                            value={configForm.slogan_dau_trang_noi_dung_en || ''}
                            onChange={(e) =>
                              setConfigForm((prev) => ({ ...prev, slogan_dau_trang_noi_dung_en: e.target.value }))
                            }
                            placeholder="Standardized veterinary medicine combined with natural recovery therapies..."
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-y"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Slogan Cuối Trang & Giấy Phép */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
                    <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#2D5A27]" />
                          <span>2. Khẩu Hiệu Cuối Trang &amp; Giấy Phép (Footer)</span>
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Xuất hiện ở thanh đáy thương hiệu và bản đồ tại trang chủ cũng như các trang chi nhánh.
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        Chân Trang
                      </span>
                    </div>

                    {sloganSubLang === 'vi' ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                            <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                            <span>Tiêu đề khẩu hiệu cuối trang (Tiếng Việt):</span>
                          </label>
                          <input
                            type="text"
                            value={configForm.slogan_cuoi_trang_tieu_de || ''}
                            onChange={(e) =>
                              setConfigForm((prev) => ({ ...prev, slogan_cuoi_trang_tieu_de: e.target.value }))
                            }
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                            <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                            <span>Nội dung mô tả sứ mệnh cuối trang (Tiếng Việt):</span>
                          </label>
                          <textarea
                            rows={3}
                            value={configForm.slogan_cuoi_trang_noi_dung || ''}
                            onChange={(e) =>
                              setConfigForm((prev) => ({ ...prev, slogan_cuoi_trang_noi_dung: e.target.value }))
                            }
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-y"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1.5">
                            <UKFlag className="w-4 h-3 rounded-[2px]" />
                            <span>Tiêu đề khẩu hiệu cuối trang (English):</span>
                          </label>
                          <input
                            type="text"
                            value={configForm.slogan_cuoi_trang_tieu_de_en || ''}
                            onChange={(e) =>
                              setConfigForm((prev) => ({ ...prev, slogan_cuoi_trang_tieu_de_en: e.target.value }))
                            }
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 font-semibold focus:border-[#2D5A27] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1.5">
                            <UKFlag className="w-4 h-3 rounded-[2px]" />
                            <span>Nội dung mô tả sứ mệnh cuối trang (English):</span>
                          </label>
                          <textarea
                            rows={3}
                            value={configForm.slogan_cuoi_trang_noi_dung_en || ''}
                            onChange={(e) =>
                              setConfigForm((prev) => ({ ...prev, slogan_cuoi_trang_noi_dung_en: e.target.value }))
                            }
                            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-y"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isConfigSaving}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                    >
                      {isConfigSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>{isConfigSaving ? 'Đang lưu...' : 'Lưu Khẩu Hiệu & Slogan'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 4: BẢNG DỮ LIỆU QUẢN LÝ DỊCH VỤ CHUẨN 5 SAO     */}
          {/* ===================================================== */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              {/* Header Card với ô tìm kiếm & Nút "+ Thêm Dịch Vụ" */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-[#2D5A27]" />
                    <span>Quản Lý Danh Mục Dịch Vụ</span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hệ thống các gói dịch vụ Y Tế &amp; Chăm Sóc 5 sao hiển thị dạng Master-Detail trên website ({services.length} dịch vụ)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative min-w-[200px] sm:min-w-[260px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:bg-white focus:border-[#2D5A27] focus:outline-none transition shadow-2xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddNewService}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-sm shadow-[#2D5A27]/25 transition cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Dịch Vụ</span>
                  </button>
                </div>
              </div>

              {/* Bảng Dữ Liệu Dịch Vụ */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {servicesLoading ? (
                  <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#2D5A27]" />
                    <span>Đang tải danh mục dịch vụ từ Supabase...</span>
                  </div>
                ) : filteredServices.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    {searchTerm ? 'Không tìm thấy dịch vụ nào khớp với từ khóa tìm kiếm.' : 'Chưa có dịch vụ nào trong hệ thống.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="py-3.5 px-4 w-12 text-center">STT</th>
                          <th className="py-3.5 px-4 w-20">Ảnh</th>
                          <th className="py-3.5 px-4 min-w-[220px]">Tên Dịch Vụ &amp; Phụ Đề</th>
                          <th className="py-3.5 px-4 min-w-[130px]">Phân Nhóm</th>
                          <th className="py-3.5 px-4 min-w-[140px]">Giá &amp; Thời Lượng</th>
                          <th className="py-3.5 px-4 min-w-[130px]">Huy Hiệu</th>
                          <th className="py-3.5 px-4 w-28 text-center">Trạng Thái</th>
                          <th className="py-3.5 px-4 w-28 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredServices.map((service, index) => (
                          <tr key={service.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-[11px]">
                              {service.thu_tu || index + 1}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-2xs shrink-0">
                                <img
                                  src={service.hinh_anh}
                                  alt={service.ten_dich_vu}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                  style={{ objectPosition: service.can_chinh_anh || '50% 50%' }}
                                />
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900 leading-snug group-hover:text-[#2D5A27] transition-colors">
                                {service.ten_dich_vu}
                              </div>
                              {service.phu_de && (
                                <p className="text-[11px] text-slate-500 font-light mt-0.5 line-clamp-1">
                                  {service.phu_de}
                                </p>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              {service.nhom_dich_vu === 'medical' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-[#2D5A27] border border-emerald-200">
                                  <Stethoscope className="w-3 h-3 text-[#2D5A27]" />
                                  Y Tế Chuyên Sâu
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  <Scissors className="w-3 h-3 text-amber-700" />
                                  Chăm Sóc &amp; Lưu Trú
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="font-bold font-mono text-slate-800 text-xs">
                                {service.gia_tham_khao || 'Chưa định giá'}
                              </div>
                              {service.thoi_luong && (
                                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  <span>{service.thoi_luong}</span>
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              {service.huy_hieu ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/15 text-amber-800 border border-amber-300">
                                  <Flame className="w-3 h-3 fill-amber-500 text-amber-600" />
                                  {service.huy_hieu}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[11px]">—</span>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleServiceActive(service)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition cursor-pointer ${
                                  service.kich_hoat
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                {service.kich_hoat ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                <span>{service.kich_hoat ? 'Hiển thị' : 'Đang ẩn'}</span>
                              </button>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleEditService(service)}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:border-[#2D5A27] hover:bg-emerald-50 text-slate-600 hover:text-[#2D5A27] transition"
                                  title="Chỉnh sửa dịch vụ"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteService(service)}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition"
                                  title="Xóa dịch vụ"
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
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 4: BẢNG DỮ LIỆU QUẢN LÝ LỊCH HẸN (APPOINTMENTS)  */}
          {/* ===================================================== */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              {/* Header Card với ô tìm kiếm & Bộ lọc trạng thái */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-[#2D5A27]" />
                    <span>Quản Lý Lịch Hẹn Khách Hàng</span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hệ thống tiếp nhận và theo dõi khách đặt lịch hẹn khám, spa từ website ({appointments.length} lịch hẹn)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative min-w-[200px] sm:min-w-[260px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Tìm mã lịch, tên khách, SĐT, thú cưng..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 placeholder:text-slate-400 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Cấu Hình Ảnh Bìa Form Đặt Lịch Hẹn (Modal & Trang Chủ) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#2D5A27] border border-emerald-200 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>Ảnh Bìa Form Đặt Lịch Hẹn (Modal &amp; Trang Chủ)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-[#2D5A27] font-semibold">Cột Phải</span>
                      </h2>
                      <p className="text-xs text-slate-500 font-light mt-0.5">
                        Ảnh hiển thị ở nửa bên phải của form đặt lịch trực tuyến. Thay đổi sẽ lưu vào Database và cập nhật ngay lập tức.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full md:w-auto">
                    <button
                      type="button"
                      disabled={isSavingBookingCover}
                      onClick={handleSaveBookingCover}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#2D5A27] hover:bg-emerald-800 transition shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSavingBookingCover ? 'Đang lưu...' : 'Lưu Ảnh Bìa'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBookingCoverImage('https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=1200');
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                      title="Dùng ảnh mặc định của hệ thống"
                    >
                      Mặc Định
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4 items-center">
                  <div className="md:col-span-8">
                    <AdminImageInput
                      value={bookingCoverImage}
                      onChange={(url) => setBookingCoverImage(url)}
                      folder="banners"
                      label="Đường dẫn hoặc tải ảnh bìa mới (hỗ trợ JPG, PNG, WEBP, dán từ clipboard)"
                      uploadButtonLabel="Tải Ảnh Lên"
                      pasteButtonLabel="Dán Ảnh (Ctrl+V)"
                      onNotification={showNotification}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <div className="relative h-28 sm:h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner group">
                      {bookingCoverImage ? (
                        <>
                          <img
                            src={bookingCoverImage}
                            alt="Preview Ảnh Bìa Lịch Hẹn"
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent flex items-end p-2.5">
                            <span className="text-[10px] text-white font-medium">Xem trước ảnh bìa thực tế</span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                          <ImageIcon className="w-6 h-6 mb-1" />
                          <span>Chưa có ảnh bìa</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Quick Filter Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { key: 'all', label: 'Tất Cả Lịch Hẹn', count: appointments.length, color: 'text-slate-700 bg-slate-100 border-slate-200' },
                  { key: 'cho_xac_nhan', label: 'Chờ Tiếp Nhận', count: appointments.filter((a) => a.trang_thai === 'cho_xac_nhan').length, color: 'text-amber-800 bg-amber-50 border-amber-200' },
                  { key: 'da_xac_nhan', label: 'Đã Xác Nhận', count: appointments.filter((a) => a.trang_thai === 'da_xac_nhan').length, color: 'text-blue-800 bg-blue-50 border-blue-200' },
                  { key: 'da_kham', label: 'Đã Hoàn Thành', count: appointments.filter((a) => a.trang_thai === 'da_kham').length, color: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
                  { key: 'da_huy', label: 'Đã Hủy Lịch', count: appointments.filter((a) => a.trang_thai === 'da_huy').length, color: 'text-rose-800 bg-rose-50 border-rose-200' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setStatusFilter(item.key as any)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      statusFilter === item.key
                        ? 'ring-2 ring-[#2D5A27] shadow-sm bg-white border-[#2D5A27]'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="text-[11px] font-medium text-slate-500">{item.label}</div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-lg font-black text-slate-900">{item.count}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.color}`}>
                        {item.count > 0 && item.key === 'cho_xac_nhan' ? 'Cần xử lý' : 'Mục'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Bảng Dữ Liệu Lịch Hẹn */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {appointmentsLoading ? (
                  <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#2D5A27]" />
                    <span>Đang tải danh sách lịch hẹn từ Supabase...</span>
                  </div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">Không tìm thấy lịch hẹn nào</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {searchTerm || statusFilter !== 'all'
                        ? 'Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.'
                        : 'Hiện chưa có khách hàng nào đặt lịch hẹn qua website.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          <th className="py-3 px-4">Mã &amp; Thời Gian Đặt</th>
                          <th className="py-3 px-4">Khách Hàng &amp; Liên Hệ</th>
                          <th className="py-3 px-4">Bé Thú Cưng</th>
                          <th className="py-3 px-4">Cơ Sở &amp; Dịch Vụ</th>
                          <th className="py-3 px-4">Thời Gian Khám</th>
                          <th className="py-3 px-4 text-center">Trạng Thái</th>
                          <th className="py-3 px-4 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredAppointments.map((app) => {
                          const { email, cleanNote } = extractEmailAndNote(app.ghi_chu);
                          const statusBadges: Record<string, { label: string; class: string }> = {
                            cho_xac_nhan: { label: 'Chờ xác nhận', class: 'bg-amber-50 text-amber-800 border-amber-200' },
                            da_xac_nhan: { label: 'Đã xác nhận', class: 'bg-blue-50 text-blue-800 border-blue-200' },
                            da_kham: { label: 'Đã hoàn thành', class: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                            da_huy: { label: 'Đã hủy', class: 'bg-slate-100 text-slate-600 border-slate-200 line-through' },
                          };
                          const currentBadge = statusBadges[app.trang_thai] || statusBadges.cho_xac_nhan;

                          return (
                            <tr key={app.id} className="hover:bg-slate-50/80 transition group">
                              <td className="py-3 px-4 font-mono">
                                <span className="font-bold text-[#2D5A27] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  {app.ma_lich_hen}
                                </span>
                                <div className="text-[10px] text-slate-400 mt-1">
                                  {app.ngay_tao ? new Date(app.ngay_tao).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : ''}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900">{app.ho_ten_chu}</div>
                                <div className="flex flex-col gap-0.5 mt-0.5">
                                  <a
                                    href={`tel:${app.so_dien_thoai}`}
                                    className="text-[11px] text-emerald-700 hover:underline font-mono inline-flex items-center gap-1"
                                    title="Bấm để gọi nhanh"
                                  >
                                    <PhoneCall className="w-3 h-3" />
                                    <span>{app.so_dien_thoai}</span>
                                  </a>
                                  {email && (
                                    <a
                                      href={`mailto:${email}`}
                                      className="text-[10px] text-blue-600 hover:underline font-mono inline-flex items-center gap-1"
                                      title="Bấm để gửi email cho khách"
                                    >
                                      <Mail className="w-2.5 h-2.5 text-blue-500" />
                                      <span className="truncate max-w-[140px]">{email}</span>
                                    </a>
                                  )}
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                  <span>{app.loai_thu_cung === 'dog' ? '🐶' : app.loai_thu_cung === 'cat' ? '🐱' : '🐰'}</span>
                                  <span>{app.ten_thu_cung}</span>
                                </div>
                                {cleanNote && (
                                  <div className="text-[11px] text-slate-500 italic max-w-xs truncate mt-0.5" title={cleanNote}>
                                    &ldquo;{cleanNote}&rdquo;
                                  </div>
                                )}
                              </td>

                              <td className="py-3 px-4 max-w-xs">
                                <div className="font-bold text-slate-900 truncate" title={app.dich_vu}>
                                  {app.dich_vu}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                  {app.ten_chi_nhanh || 'Chưa chọn'}
                                </div>
                              </td>

                              <td className="py-3 px-4 whitespace-nowrap">
                                <div className="font-bold text-[#2D5A27]">{app.gio_hen}</div>
                                <div className="text-[11px] text-slate-600 mt-0.5">
                                  {app.ngay_hen}
                                </div>
                              </td>

                              <td className="py-3 px-4 text-center whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${currentBadge.class}`}>
                                  {app.trang_thai === 'cho_xac_nhan' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />}
                                  {currentBadge.label}
                                </span>
                              </td>

                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setSelectedAppointment(app)}
                                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-[#2D5A27] hover:bg-emerald-50 text-slate-700 hover:text-[#2D5A27] font-semibold text-xs transition cursor-pointer"
                                  >
                                    Xem &amp; Xử Lý
                                  </button>

                                  {app.trang_thai === 'cho_xac_nhan' && (
                                    <button
                                      type="button"
                                      disabled={isUpdatingStatus}
                                      onClick={() => handleUpdateAppointmentStatus(app.id, 'da_xac_nhan')}
                                      className="p-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 text-blue-700 transition cursor-pointer"
                                      title="Duyệt xác nhận lịch hẹn"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {app.trang_thai === 'da_xac_nhan' && (
                                    <button
                                      type="button"
                                      disabled={isUpdatingStatus}
                                      onClick={() => handleUpdateAppointmentStatus(app.id, 'da_kham')}
                                      className="p-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 text-emerald-700 transition cursor-pointer"
                                      title="Đánh dấu đã hoàn thành khám"
                                    >
                                      <CheckCheck className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteAppointment(app)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                                    title="Xóa lịch hẹn"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 5: BẢNG DỮ LIỆU QUẢN LÝ CÂU HỎI THƯỜNG GẶP (FAQ)  */}
          {/* ===================================================== */}
          {activeTab === 'faqs' && (
            <div className="space-y-4">
              {/* Header Card với ô tìm kiếm & Nút "+ Thêm Câu Hỏi" */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-[#2D5A27]" />
                    <span>Quản Lý Câu Hỏi Thường Gặp (FAQ)</span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Hệ thống câu hỏi &amp; giải đáp y khoa hiển thị dạng Accordion ngoài trang chủ ({faqs.length} câu hỏi)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative min-w-[200px] sm:min-w-[260px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm câu hỏi, nội dung, danh mục..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2D5A27] focus:ring-1 focus:ring-[#2D5A27]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddNewFaq}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Câu Hỏi</span>
                  </button>
                </div>
              </div>

              {/* Table Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                {faqsLoading ? (
                  <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#2D5A27]" />
                    <span>Đang tải danh sách câu hỏi...</span>
                  </div>
                ) : filteredFaqs.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-xs">
                    <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-700">Không tìm thấy câu hỏi nào</p>
                    <p className="mt-1 text-slate-400">Thử tìm kiếm với từ khóa khác hoặc bấm "+ Thêm Câu Hỏi" ở trên</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-3 px-4 w-12 text-center">#</th>
                          <th className="py-3 px-4 w-44">Danh Mục</th>
                          <th className="py-3 px-4 min-w-[240px]">Câu Hỏi</th>
                          <th className="py-3 px-4 min-w-[320px]">Câu Trả Lời</th>
                          <th className="py-3 px-4 w-28 text-center">Trạng Thái</th>
                          <th className="py-3 px-4 w-28 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredFaqs.map((faq, index) => (
                          <tr key={faq.id} className="hover:bg-slate-50/60 transition">
                            <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-medium">
                              {faq.thu_tu || index + 1}
                            </td>

                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                                <Tag className="w-3 h-3 text-[#2D5A27]" />
                                <span>{faq.chuyen_muc || 'Chung'}</span>
                              </span>
                              {faq.chuyen_muc_en && (
                                <p className="text-[10px] text-slate-400 italic mt-1">
                                  EN: {faq.chuyen_muc_en}
                                </p>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <p className="font-bold text-slate-900 leading-snug">
                                {faq.cau_hoi}
                              </p>
                              {faq.cau_hoi_en ? (
                                <p className="text-[11px] text-[#2D5A27] font-medium italic mt-1 line-clamp-1">
                                  EN: {faq.cau_hoi_en}
                                </p>
                              ) : (
                                <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-200">
                                  Chưa có tiếng Anh
                                </span>
                              )}
                            </td>

                            <td className="py-3.5 px-4">
                              <p className="text-slate-600 line-clamp-2 leading-relaxed whitespace-pre-line">
                                {faq.cau_tra_loi}
                              </p>
                              {faq.cau_tra_loi_en && (
                                <p className="text-[11px] text-slate-400 italic mt-1 line-clamp-2">
                                  EN: {faq.cau_tra_loi_en}
                                </p>
                              )}
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleFaqActive(faq)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                  faq.kich_hoat !== false
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                                }`}
                              >
                                {faq.kich_hoat !== false ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Hiển thị</span>
                                  </>
                                ) : (
                                  <>
                                    <X className="w-3 h-3 text-slate-400" />
                                    <span>Đang ẩn</span>
                                  </>
                                )}
                              </button>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleEditFaq(faq)}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:border-[#2D5A27] hover:bg-emerald-50 text-slate-600 hover:text-[#2D5A27] transition cursor-pointer"
                                  title="Chỉnh sửa câu hỏi"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFaq(faq)}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition cursor-pointer"
                                  title="Xóa câu hỏi"
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
            </div>
          )}

          {/* ===================================================== */}
          {/* TAB 6: QUẢN LÝ ĐÁNH GIÁ KHÁCH HÀNG (REVIEWS)         */}
          {/* ===================================================== */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {/* Header Card với ô tìm kiếm & Nút "+ Thêm đánh giá" */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span>Quản Lý Đánh Giá Khách Hàng</span>
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Đánh giá trải nghiệm 5 sao từ các ba mẹ thú cưng ({reviews.length} đánh giá)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Ô tìm kiếm */}
                  <div className="relative min-w-[200px] sm:min-w-[260px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Tìm tên, SĐT, dịch vụ, nội dung..."
                      className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#2D5A27] bg-slate-50/50"
                    />
                  </div>

                  {/* Nút "+ Thêm đánh giá" */}
                  <button
                    type="button"
                    onClick={handleAddNewReview}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Đánh Giá</span>
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {reviewsLoading ? (
                  <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#2D5A27]" />
                    <span className="text-xs font-medium">Đang tải danh sách đánh giá từ Supabase...</span>
                  </div>
                ) : filteredReviews.length === 0 ? (
                  <div className="p-16 text-center text-slate-500">
                    <Star className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Chưa có đánh giá nào</p>
                    <p className="text-xs text-slate-400 mt-1">Bấm nút "Thêm Đánh Giá" ở góc phải để thêm đánh giá mới.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                          <th className="py-3 px-4 w-12 text-center">STT</th>
                          <th className="py-3 px-4 min-w-[180px]">Khách Hàng (Chủ Nuôi)</th>
                          <th className="py-3 px-4 min-w-[120px]">Số Điện Thoại</th>
                          <th className="py-3 px-4 min-w-[110px] text-center">Đánh Giá</th>
                          <th className="py-3 px-4 min-w-[320px]">Nội Dung Nhận Xét</th>
                          <th className="py-3 px-4 min-w-[100px] text-center">Thời Gian</th>
                          <th className="py-3 px-4 min-w-[100px] text-center">Trạng Thái</th>
                          <th className="py-3 px-4 min-w-[100px] text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredReviews.map((rev, index) => (
                          <tr key={rev.id} className="hover:bg-slate-50/60 transition group">
                            <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                              {index + 1}
                            </td>

                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                  <img
                                    src={rev.hinh_anh_thu_cung || '/pet_golden_spa.jpg'}
                                    alt={rev.ten_khach_hang}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900 truncate">
                                    {rev.ten_khach_hang}
                                  </p>
                                  {rev.da_xac_thuc && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>Đã xác thực</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                                {rev.so_dien_thoai}
                              </span>
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <div className="inline-flex items-center gap-0.5 text-amber-500">
                                {[...Array(rev.so_sao || 5)].map((_, i) => (
                                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                ))}
                              </div>
                            </td>

                            <td className="py-3.5 px-4">
                              <p className="text-slate-600 line-clamp-2 leading-relaxed text-[11px] italic">
                                &ldquo;{rev.noi_dung}&rdquo;
                              </p>
                            </td>

                            <td className="py-3.5 px-4 text-center text-slate-500 text-[11px]">
                              {rev.ngay_danh_gia || 'Gần đây'}
                            </td>

                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleReviewActive(rev)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                  rev.kich_hoat !== false
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                                }`}
                              >
                                {rev.kich_hoat !== false ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Hiển thị</span>
                                  </>
                                ) : (
                                  <>
                                    <X className="w-3 h-3 text-slate-400" />
                                    <span>Đang ẩn</span>
                                  </>
                                )}
                              </button>
                            </td>

                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleEditReview(rev)}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:border-[#2D5A27] hover:bg-emerald-50 text-slate-600 hover:text-[#2D5A27] transition cursor-pointer"
                                  title="Chỉnh sửa đánh giá"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReview(rev)}
                                  className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition cursor-pointer"
                                  title="Xóa đánh giá"
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
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: QUẢN LÝ ĐỘI NGŨ Y TẾ (4 HẠN MỤC)                   */}
          {/* ========================================================= */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-[#2D5A27]" />
                    <span>Đội Ngũ Chuyên Gia, Bác Sĩ &amp; Điều Dưỡng</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Cấu trúc 4 nhóm chuẩn mực y khoa: Lãnh đạo chuyên môn, Chuyên gia tư vấn, Bác sĩ thú y, Điều dưỡng &amp; Chăm sóc.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/doi-ngu"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    <span>Xem Trang Đội Ngũ</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleAddNewMember}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Nhân Sự Mới</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: 'Tất Cả', count: teamMembers.length },
                    { id: 'lanh_dao', label: 'Lãnh Đạo Chuyên Môn', count: teamMembers.filter((m) => m.phan_loai === 'lanh_dao').length },
                    { id: 'chuyen_gia', label: 'Chuyên Gia Tư Vấn', count: teamMembers.filter((m) => m.phan_loai === 'chuyen_gia').length },
                    { id: 'bac_si', label: 'Bác Sĩ Thú Y', count: teamMembers.filter((m) => m.phan_loai === 'bac_si').length },
                    { id: 'dieu_duong', label: 'Điều Dưỡng & Chăm Sóc', count: teamMembers.filter((m) => m.phan_loai === 'dieu_duong').length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setTeamCategoryFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        teamCategoryFilter === tab.id
                          ? 'bg-[#2D5A27] text-white shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          teamCategoryFilter === tab.id
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[200px] sm:min-w-[260px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm tên, chức danh, bằng cấp..."
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#2D5A27] bg-white shadow-2xs"
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {teamLoading ? (
                  <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#2D5A27]" />
                    <span className="text-xs font-medium">Đang tải danh sách đội ngũ từ Supabase...</span>
                  </div>
                ) : filteredTeamMembers.length === 0 ? (
                  <div className="p-16 text-center text-slate-500">
                    <UserCheck className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Chưa có nhân sự nào trong mục này</p>
                    <p className="text-xs text-slate-400 mt-1">Bấm nút &ldquo;Thêm Nhân Sự Mới&rdquo; ở góc phải để thêm hồ sơ bác sĩ / điều dưỡng.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                          <th className="py-3 px-4 w-12 text-center">STT</th>
                          <th className="py-3 px-4 min-w-[220px]">Bác Sĩ / Nhân Sự</th>
                          <th className="py-3 px-4 min-w-[170px]">Hạn Mục Phân Loại</th>
                          <th className="py-3 px-4 min-w-[150px]">Học Vị / Chức Vụ</th>
                          <th className="py-3 px-4 min-w-[260px]">Giới Thiệu Tóm Tắt</th>
                          <th className="py-3 px-4 w-16 text-center">Thứ Tự</th>
                          <th className="py-3 px-4 min-w-[100px] text-center">Trạng Thái</th>
                          <th className="py-3 px-4 min-w-[100px] text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredTeamMembers.map((member, index) => {
                          const badgeColor =
                            member.phan_loai === 'lanh_dao'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : member.phan_loai === 'chuyen_gia'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : member.phan_loai === 'bac_si'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200';

                          const categoryName =
                            member.phan_loai === 'lanh_dao'
                              ? 'Lãnh Đạo Chuyên Môn'
                              : member.phan_loai === 'chuyen_gia'
                              ? 'Chuyên Gia Tư Vấn'
                              : member.phan_loai === 'bac_si'
                              ? 'Bác Sĩ Thú Y'
                              : 'Điều Dưỡng & Chăm Sóc';

                          return (
                            <tr key={member.id} className="hover:bg-slate-50/60 transition group">
                              <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                                {index + 1}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-200 border border-slate-200 shrink-0 relative flex items-center justify-center">
                                    {member.hinh_anh ? (
                                      <img
                                        src={member.hinh_anh}
                                        alt={member.ho_ten}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-[#D6D0C7]">
                                        <div className="w-7 h-7 rounded-full bg-[#E5DFD7] flex items-center justify-center overflow-hidden">
                                          <svg viewBox="0 0 100 100" className="w-full h-full text-[#B8B0A5]" fill="currentColor">
                                            <circle cx="50" cy="38" r="18" />
                                            <path d="M18 90c0-17.67 14.33-32 32-32s32 14.33 32 32v10H18V90z" />
                                          </svg>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-[10px] font-bold text-[#8B1E1E] uppercase tracking-wider">
                                      {member.chuc_danh || 'BÁC SĨ THÚ Y'}
                                    </div>
                                    <p className="font-bold text-slate-900 text-sm truncate">
                                      {member.ho_ten}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badgeColor}`}>
                                  {categoryName}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="text-slate-700 font-medium text-xs line-clamp-2">
                                  {member.hoc_vi_chuc_vu || '—'}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <p className="text-slate-600 line-clamp-2 leading-relaxed text-[11px]">
                                  {member.mo_ta || '—'}
                                </p>
                              </td>

                              <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-500">
                                {member.thu_tu ?? 0}
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleMemberActive(member)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                    member.kich_hoat !== false
                                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                                  }`}
                                >
                                  {member.kich_hoat !== false ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>Hiển thị</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-3 h-3 text-slate-400" />
                                      <span>Đang ẩn</span>
                                    </>
                                  )}
                                </button>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleEditMember(member)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:border-[#2D5A27] hover:bg-emerald-50 text-slate-600 hover:text-[#2D5A27] transition cursor-pointer"
                                    title="Chỉnh sửa hồ sơ"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMember(member)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition cursor-pointer"
                                    title="Xóa nhân sự"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 8: QUẢN LÝ BÀI VIẾT & CẨM NANG KIẾN THỨC             */}
          {/* ========================================================= */}
          {activeTab === 'articles' && (
            <div className="space-y-6">
              {/* Header Card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#2D5A27]" />
                    <span>Cẩm Nang Kiến Thức &amp; Kinh Nghiệm Nuôi Thú Cưng</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Quản lý toàn bộ bài viết chia sẻ y khoa, hướng dẫn sơ cứu khẩn cấp, dinh dưỡng và kinh nghiệm chăm sóc thú cưng.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href="/#kien-thuc"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    <span>Xem Ngoài Trang Chủ</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleAddNewArticle}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Bài Viết Mới</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: 'Tất Cả', count: articles.length },
                    { id: 'Y Khoa Dự Phòng', label: 'Y Khoa Dự Phòng', count: articles.filter((a) => a.chuyen_muc === 'Y Khoa Dự Phòng').length },
                    { id: 'Sơ Cứu Thú Cưng', label: 'Sơ Cứu Thú Cưng', count: articles.filter((a) => a.chuyen_muc === 'Sơ Cứu Thú Cưng').length },
                    { id: 'Chăm Sóc & Spa', label: 'Chăm Sóc & Spa', count: articles.filter((a) => a.chuyen_muc === 'Chăm Sóc & Spa').length },
                    { id: 'Dinh Dưỡng Thú Cưng', label: 'Dinh Dưỡng', count: articles.filter((a) => a.chuyen_muc === 'Dinh Dưỡng Thú Cưng').length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setArticleCategoryFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        articleCategoryFilter === tab.id
                          ? 'bg-[#2D5A27] text-white shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          articleCategoryFilter === tab.id
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="relative min-w-[200px] sm:min-w-[260px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Tìm kiếm bài viết"
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#2D5A27] bg-white shadow-2xs"
                  />
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {articlesLoading ? (
                  <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#2D5A27]" />
                    <span className="text-xs font-medium">Đang tải danh sách bài viết từ cơ sở dữ liệu...</span>
                  </div>
                ) : filteredArticles.length === 0 ? (
                  <div className="p-16 text-center text-slate-500">
                    <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-semibold text-slate-700">Chưa có bài viết nào</p>
                    <p className="text-xs text-slate-400 mt-1">Bấm nút &ldquo;Thêm Bài Viết Mới&rdquo; ở góc phải để tạo bài viết đầu tiên.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                          <th className="py-3 px-4 w-12 text-center">STT</th>
                          <th className="py-3 px-4 min-w-[280px]">Bài Viết &amp; Ảnh Bìa</th>
                          <th className="py-3 px-4 min-w-[150px]">Chuyên Mục</th>
                          <th className="py-3 px-4 min-w-[160px]">Tác Giả / Ngày Đăng</th>
                          <th className="py-3 px-4 min-w-[120px]">Thời Gian Đọc</th>
                          <th className="py-3 px-4 w-16 text-center">Thứ Tự</th>
                          <th className="py-3 px-4 min-w-[100px] text-center">Trạng Thái</th>
                          <th className="py-3 px-4 min-w-[110px] text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredArticles.map((art, index) => {
                          const badgeColor =
                            art.chuyen_muc === 'Y Khoa Dự Phòng'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : art.chuyen_muc === 'Sơ Cứu Thú Cưng'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : art.chuyen_muc === 'Chăm Sóc & Spa'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200';

                          return (
                            <tr key={art.id} className="hover:bg-slate-50/60 transition group">
                              <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                                {index + 1}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 relative flex items-center justify-center">
                                    {art.hinh_anh ? (
                                      <img
                                        src={art.hinh_anh}
                                        alt={art.tieu_de}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <ImageIcon className="w-5 h-5 text-slate-300" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <Link
                                      href={`/kien-thuc/${art.id}`}
                                      target="_blank"
                                      className="font-bold text-slate-900 text-xs sm:text-sm hover:text-[#2D5A27] transition line-clamp-1 flex items-center gap-1"
                                      title={art.tieu_de}
                                    >
                                      <span>{art.tieu_de}</span>
                                      <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                    </Link>
                                    <p className="text-slate-500 text-[11px] line-clamp-1 mt-0.5">
                                      {art.mo_ta_ngan || 'Chưa có mô tả tóm tắt'}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badgeColor}`}>
                                  {art.chuyen_muc || 'Y Khoa Dự Phòng'}
                                </span>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="text-slate-800 font-medium text-xs">
                                  {art.tac_gia || 'Hội Đồng Y Khoa'}
                                </div>
                                <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                                  <CalendarDays className="w-3 h-3" />
                                  <span>{art.ngay_dang || 'Mới cập nhật'}</span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4">
                                <span className="inline-flex items-center gap-1 text-slate-600 font-medium text-xs">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{art.thoi_gian_doc || '4 phút đọc'}</span>
                                </span>
                              </td>

                              <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-500">
                                {art.thu_tu ?? 0}
                              </td>

                              <td className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleArticleActive(art)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                                    art.kich_hoat !== false
                                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                                  }`}
                                >
                                  {art.kich_hoat !== false ? (
                                    <>
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>Hiển thị</span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="w-3 h-3 text-slate-400" />
                                      <span>Đang ẩn</span>
                                    </>
                                  )}
                                </button>
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Link
                                    href={`/kien-thuc/${art.id}`}
                                    target="_blank"
                                    className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-600 transition"
                                    title="Xem bài viết ngoài website"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </Link>
                                  <button
                                    type="button"
                                    onClick={() => handleEditArticle(art)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:border-[#2D5A27] hover:bg-emerald-50 text-slate-600 hover:text-[#2D5A27] transition cursor-pointer"
                                    title="Chỉnh sửa bài viết"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteArticle(art)}
                                    className="p-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition cursor-pointer"
                                    title="Xóa bài viết"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* 3. MODAL POPUP FORM: THÊM / CĂN CHỈNH ẢNH NỀN HERO       */}
      {/*    (BẬT NỔI Ở GIỮA MÀN HÌNH ĐÚNG NHƯ ẢNH MẪU YÊU CẦU)     */}
      {/* ========================================================= */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27]">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-wide uppercase">
                  {isCreatingNewBanner ? 'Thêm Ảnh Nền Hero Mới' : 'Căn Chỉnh Vị Trí Ảnh Nền'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Tải ảnh / dán URL */}
              <div>
                <AdminImageInput
                  value={editingBanner.duong_dan_anh || ''}
                  onChange={(url) =>
                    setEditingBanner((prev) => ({ ...prev, duong_dan_anh: url }))
                  }
                  folder="banners"
                  label="Đường dẫn ảnh nền hoặc tải tệp từ máy tính:"
                  uploadButtonLabel="Tải File"
                  pasteButtonLabel="Dán Ảnh"
                  onNotification={showNotification}
                />
              </div>

              {/* Khung kéo thả căn chỉnh Facebook style */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-[#2D5A27]" />
                    <span>Kéo chuột hoặc ngón tay để căn chỉnh góc hiển thị:</span>
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Chuyển đổi xem trước Desktop / Mobile */}
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setBannerCropPreviewMode('desktop')}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                          bannerCropPreviewMode === 'desktop'
                            ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        🖥️ Máy tính
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerCropPreviewMode('mobile')}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                          bannerCropPreviewMode === 'mobile'
                            ? 'bg-white text-[#2D5A27] font-semibold shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        📱 Điện thoại
                      </button>
                    </div>

                    <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      {cropX}% {cropY}%
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setCropX(50);
                        setCropY(50);
                      }}
                      className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-[#2D5A27] transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Căn giữa</span>
                    </button>
                  </div>
                </div>

                <div
                  ref={cropBoxRef}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  className={`relative overflow-hidden border-2 bg-slate-950 select-none transition-all duration-200 ${
                    bannerCropPreviewMode === 'mobile'
                      ? 'w-full max-w-[240px] aspect-[9/16] mx-auto rounded-3xl shadow-xl'
                      : 'w-full aspect-[21/9] sm:aspect-[2.4/1] rounded-2xl shadow-sm'
                  } ${
                    isDragging
                      ? 'cursor-grabbing border-[#2D5A27] shadow-lg'
                      : 'cursor-grab border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {editingBanner.duong_dan_anh ? (
                    <>
                      <img
                        src={editingBanner.duong_dan_anh}
                        alt="Cắt ảnh"
                        draggable={false}
                        className="w-full h-full object-cover pointer-events-none transition-transform duration-75"
                        style={{
                          objectPosition: `${cropX}% ${cropY}%`,
                          transform: `scale(${zoomLevel})`,
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/hero_cinematic.jpg';
                        }}
                      />

                      {/* Lưới 3x3 */}
                      <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                        <div className="border-r border-b border-white/20" />
                        <div className="border-r border-b border-white/20" />
                        <div className="border-b border-white/20" />
                        <div className="border-r border-b border-white/20" />
                        <div className="border-r border-b border-white/20" />
                        <div className="border-b border-white/20" />
                        <div className="border-r border-b border-white/20" />
                        <div className="border-r border-b border-white/20" />
                        <div />
                      </div>

                      <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5 shadow-sm">
                        <Move className="w-3.5 h-3.5 text-amber-300" />
                        <span>{isDragging ? 'Đang kéo ảnh...' : 'Nhấp giữ và kéo ảnh để căn chỉnh'}</span>
                      </div>

                      <div className="absolute bottom-3 left-4 pointer-events-none max-w-[65%]">
                        <p className="text-[10px] uppercase font-bold text-amber-300">
                          Vị trí hiển thị chữ ngoài web:
                        </p>
                        <p className="text-xs font-semibold text-white line-clamp-1">
                          Nâng niu từng nhịp thở, an yên trọn một đời.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                      <ImageIcon className="w-8 h-8 mb-1.5 opacity-50" />
                      <span>Vui lòng dán liên kết hoặc tải ảnh lên để căn chỉnh</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-medium">Căn nhanh:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCropX(50);
                        setCropY(15);
                      }}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                    >
                      Đỉnh (Trên)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCropX(50);
                        setCropY(50);
                      }}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                    >
                      Chính giữa
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCropX(50);
                        setCropY(85);
                      }}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition cursor-pointer"
                    >
                      Đáy (Dưới)
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-400">Tỷ lệ xem trước chuẩn Hero ngoài trang chủ</span>
                </div>
              </div>

              {/* Thu phóng & Thời gian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Thu phóng ảnh (Zoom):</span>
                    <span className="font-mono text-[#2D5A27]">{zoomLevel.toFixed(2)}x</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ZoomOut className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="range"
                      min="1.0"
                      max="1.8"
                      step="0.01"
                      value={zoomLevel}
                      onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                      className="w-full accent-[#2D5A27] cursor-pointer"
                    />
                    <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span>Thời gian hiển thị ảnh:</span>
                    <span className="font-mono text-[#2D5A27]">
                      {((editingBanner.thoi_gian_hien_thi || 4000) / 1000).toFixed(0)} giây
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="3000"
                      max="12000"
                      step="1000"
                      value={editingBanner.thoi_gian_hien_thi || 4000}
                      onChange={(e) =>
                        setEditingBanner((prev) => ({
                          ...prev,
                          thoi_gian_hien_thi: parseInt(e.target.value, 10),
                        }))
                      }
                      className="w-full accent-[#2D5A27] cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Thứ tự & Trạng thái */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thứ tự hiển thị:
                  </label>
                  <input
                    type="number"
                    value={editingBanner.thu_tu || 1}
                    onChange={(e) =>
                      setEditingBanner((prev) => ({ ...prev, thu_tu: parseInt(e.target.value, 10) || 1 }))
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:outline-none focus:border-[#2D5A27]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trạng thái phát hành:
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingBanner((prev) => ({ ...prev, kich_hoat: !prev?.kich_hoat }))
                    }
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      editingBanner.kich_hoat !== false
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-slate-100 border-slate-300 text-slate-600'
                    }`}
                  >
                    {editingBanner.kich_hoat !== false ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Đang bật hiển thị trên Website</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4 text-slate-400" />
                        <span>Đang tắt (Tạm ẩn)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setEditingBanner(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                Hủy Bỏ
              </button>

              <button
                type="button"
                disabled={isBannerSaving}
                onClick={handleSaveBanner}
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                {isBannerSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isBannerSaving ? 'Đang lưu vào Supabase...' : 'Lưu Ảnh Nền'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. MODAL POPUP FORM: THÊM / CHỈNH SỬA CHI NHÁNH BỆNH VIỆN */}
      {/*    (BẬT NỔI Ở GIỮA MÀN HÌNH ĐÚNG NHƯ ẢNH MẪU YÊU CẦU)     */}
      {/* ========================================================= */}
            {editingBranch && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27]">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-wide uppercase">
                  {isCreatingNewBranch ? 'Thêm Chi Nhánh Mới' : 'Chỉnh Sửa Chi Nhánh Bệnh Viện'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingBranch(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Thanh Chuyển Ngôn Ngữ & Nút Dịch AI */}
              <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setBranchLangTab('vi')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        branchLangTab === 'vi'
                          ? 'bg-[#2D5A27] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                      <span>Bản Tiếng Việt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBranchLangTab('en')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        branchLangTab === 'en'
                          ? 'bg-[#2D5A27] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UKFlag className="w-4 h-3 rounded-[2px]" />
                      <span>Bản English</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAutoTranslateBranch}
                  disabled={isTranslatingBranch}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
                  title="Dịch tự động toàn bộ thông tin chi nhánh và bài viết sang Tiếng Anh bằng AI"
                >
                  {isTranslatingBranch ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{isTranslatingBranch ? 'Đang chuyển đổi toàn bộ...' : 'Chuyển đổi ENG'}</span>
                </button>
              </div>

              {branchLangTab === 'vi' ? (
                /* TAB 1: BẢN TIẾNG VIỆT */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tên chi nhánh đầy đủ (Tiếng Việt): <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingBranch.ten_chi_nhanh || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, ten_chi_nhanh: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="Ví dụ: Bệnh Viện Thú Y Pet M&M - Chi Nhánh Quận 7"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tên ngắn hiển thị trên thẻ (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingBranch.ten_ngan || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, ten_ngan: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="Ví dụ: Cơ Sở Quận 7"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Khu vực / Quận huyện (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingBranch.khu_vuc || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, khu_vuc: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="Ví dụ: Quận 7, TP. Hồ Chí Minh"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Khẩu hiệu chi nhánh (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingBranch.khau_hieu || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, khau_hieu: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="Ví dụ: Trung tâm Cấp Cứu 24/7 & Hồi Sức Tích Cực"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Địa chỉ chi nhánh (Tiếng Việt): <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingBranch.dia_chi || ''}
                      onChange={(e) => setEditingBranch((prev) => ({ ...prev, dia_chi: e.target.value }))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      placeholder="Số nhà, tên đường, phường, quận..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bác sĩ phụ trách (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingBranch.bac_si_phu_trach || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, bac_si_phu_trach: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="Ví dụ: ThS. BS. Nguyễn Văn A"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bằng cấp / Chuyên khoa (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingBranch.bang_cap_bac_si || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, bang_cap_bac_si: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="Ví dụ: Chuyên gia Phẫu thuật Ngoại khoa"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Giờ hoạt động (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingBranch.gio_hoat_dong || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, gio_hoat_dong: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="Ví dụ: 08:00 - 21:00 (Cấp cứu 24/7)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Thông tin đỗ xe (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingBranch.thong_tin_do_xe || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, thong_tin_do_xe: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="Ví dụ: Có bãi đỗ xe ô tô & xe máy rộng rãi"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Danh sách tiện ích / dịch vụ nổi bật (Tiếng Việt, mỗi dòng một ý):
                    </label>
                    <textarea
                      value={featuresInput}
                      onChange={(e) => setFeaturesInput(e.target.value)}
                      rows={3}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none font-mono"
                      placeholder={"Phòng cấp cứu 24/7 trang bị hiện đại\nKhu lưu chuồng riêng cho chó và mèo\nPhòng phẫu thuật vô trùng chuẩn quốc tế"}
                    />
                  </div>

                  {/* Bài viết chi tiết (TipTap RichTextEditor) */}
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#2D5A27]" />
                        <span>Bài viết giới thiệu chi tiết chi nhánh (Tiếng Việt):</span>
                      </label>
                      {editingBranch.id && (
                        <Link
                          href={`/chi-nhanh/${editingBranch.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 transition"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Xem trang ngoài web</span>
                        </Link>
                      )}
                    </div>
                    <RichTextEditor
                      key={`branch-editor-vi-${editingBranch.id || 'new'}`}
                      value={editingBranch.bai_viet_chi_tiet || ''}
                      onChange={(html) => setEditingBranch((prev) => ({ ...prev, bai_viet_chi_tiet: html }))}
                      minHeight={340}
                      onUploadImage={async (file) => {
                        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
                        const filePath = `branches/article_${Date.now()}_${Math.random()
                          .toString(36)
                          .substring(2, 6)}.${fileExt}`;
                        const { error } = await supabase.storage
                          .from('hinh_anh')
                          .upload(filePath, file, { cacheControl: '3600', upsert: true });
                        if (error) throw error;
                        const { data: urlData } = supabase.storage.from('hinh_anh').getPublicUrl(filePath);
                        return urlData.publicUrl;
                      }}
                    />
                  </div>
                </div>
              ) : (
                /* TAB 2: BẢN TIẾNG ANH (ENGLISH) - BỐ CỤC ĐỒNG BỘ Y CHANG TIẾNG VIỆT */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tên chi nhánh đầy đủ (English): <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={(editingBranch as any).ten_chi_nhanh_en || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, ten_chi_nhanh_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. Pet M&M Veterinary Hospital - District 7 Branch"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tên ngắn hiển thị trên thẻ (English):
                      </label>
                      <input
                        type="text"
                        value={(editingBranch as any).ten_ngan_en || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, ten_ngan_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. District 7 Branch"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Khu vực / Quận huyện (English):
                      </label>
                      <input
                        type="text"
                        value={(editingBranch as any).khu_vuc_en || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, khu_vuc_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. District 7, Ho Chi Minh City"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Khẩu hiệu chi nhánh (English):
                      </label>
                      <input
                        type="text"
                        value={(editingBranch as any).khau_hieu_en || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, khau_hieu_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. 24/7 Emergency & Critical Care Center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Địa chỉ chi nhánh (English): <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={(editingBranch as any).dia_chi_en || ''}
                      onChange={(e) => setEditingBranch((prev) => ({ ...prev, dia_chi_en: e.target.value } as any))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      placeholder="e.g. 123 Nguyen Thi Thap St, District 7..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bác sĩ phụ trách (English):
                      </label>
                      <input
                        type="text"
                        value={(editingBranch as any).bac_si_phu_trach_en || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, bac_si_phu_trach_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. Dr. Nguyen Van A, DVM"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bằng cấp / Chuyên khoa (English):
                      </label>
                      <input
                        type="text"
                        value={(editingBranch as any).bang_cap_bac_si_en || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, bang_cap_bac_si_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. Surgical Specialist"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Giờ hoạt động (English):
                      </label>
                      <input
                        type="text"
                        value={(editingBranch as any).gio_hoat_dong_en || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, gio_hoat_dong_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. 08:00 - 21:00 (24/7 Emergency)"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Thông tin đỗ xe (English):
                      </label>
                      <input
                        type="text"
                        value={(editingBranch as any).thong_tin_do_xe_en || ''}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, thong_tin_do_xe_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. Spacious car & motorbike parking available"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Danh sách tiện ích / dịch vụ nổi bật (English, mỗi dòng một ý):
                    </label>
                    <textarea
                      value={featuresEnInput}
                      onChange={(e) => setFeaturesEnInput(e.target.value)}
                      rows={3}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none font-mono"
                      placeholder={"24/7 Emergency ICU with advanced monitors\nSeparate dog & cat hospitalization suites\nSterile laminar-flow surgical theater"}
                    />
                  </div>

                  {/* Bài viết chi tiết EN (TipTap RichTextEditor) */}
                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#2D5A27]" />
                        <span>Bài viết giới thiệu chi tiết chi nhánh (English):</span>
                      </label>
                      {editingBranch.id && (
                        <Link
                          href={`/chi-nhanh/${editingBranch.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 transition"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Xem trang ngoài web</span>
                        </Link>
                      )}
                    </div>
                    <RichTextEditor
                      key={`branch-editor-en-${editingBranch.id || 'new'}`}
                      value={(editingBranch as any).bai_viet_chi_tiet_en || ''}
                      onChange={(html) => setEditingBranch((prev) => ({ ...prev, bai_viet_chi_tiet_en: html } as any))}
                      minHeight={340}
                      onUploadImage={async (file) => {
                        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
                        const filePath = `branches/article_${Date.now()}_${Math.random()
                          .toString(36)
                          .substring(2, 6)}.${fileExt}`;
                        const { error } = await supabase.storage
                          .from('hinh_anh')
                          .upload(filePath, file, { cacheControl: '3600', upsert: true });
                        if (error) throw error;
                        const { data: urlData } = supabase.storage.from('hinh_anh').getPublicUrl(filePath);
                        return urlData.publicUrl;
                      }}
                    />
                  </div>
                </div>
              )}

              {/* COMMON FIELDS (HOTLINE, MAPS, IMAGE, ETC.) */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Số điện thoại hotline chi nhánh:
                    </label>
                    <input
                      type="text"
                      value={editingBranch.so_dien_thoai || ''}
                      onChange={(e) => setEditingBranch((prev) => ({ ...prev, so_dien_thoai: e.target.value }))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      placeholder="Ví dụ: 090 123 4567"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Link Google Maps App (Chỉ đường trực tiếp):
                    </label>
                    <input
                      type="text"
                      value={editingBranch.link_ggmap_app || ''}
                      onChange={(e) => setEditingBranch((prev) => ({ ...prev, link_ggmap_app: e.target.value }))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      placeholder="https://maps.app.goo.gl/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Link Google Maps Embed (iframe bản đồ nhúng):
                  </label>
                  <input
                    type="text"
                    value={editingBranch.link_ggmap_embed || ''}
                    onChange={(e) => setEditingBranch((prev) => ({ ...prev, link_ggmap_embed: e.target.value }))}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none font-mono text-[11px]"
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ảnh đại diện chi nhánh:
                  </label>
                  <AdminImageInput
                    value={editingBranch.anh_dai_dien || ''}
                    onChange={(url) => setEditingBranch((prev) => ({ ...prev, anh_dai_dien: url }))}
                    folder="branches"
                    label=""
                    uploadButtonLabel="Tải Ảnh Cơ Sở"
                    pasteButtonLabel="Dán Link Ảnh"
                    onNotification={showNotification}
                  />
                  {editingBranch.anh_dai_dien && (
                    <div className="mt-2 flex items-center gap-3">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Vị trí ảnh:</label>
                      <select
                        value={editingBranch.can_chinh_anh || '50% 50%'}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, can_chinh_anh: e.target.value }))}
                        className="text-xs px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 bg-white"
                      >
                        <option value="50% 50%">Giữa (Mặc định)</option>
                        <option value="50% 20%">Phía Trên</option>
                        <option value="50% 80%">Phía Dưới</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thứ tự hiển thị:
                    </label>
                    <input
                      type="number"
                      value={editingBranch.thu_tu || 1}
                      onChange={(e) =>
                        setEditingBranch((prev) => ({
                          ...prev,
                          thu_tu: parseInt(e.target.value, 10) || 1,
                        }))
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div className="pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingBranch.kich_hoat !== false}
                        onChange={(e) => setEditingBranch((prev) => ({ ...prev, kich_hoat: e.target.checked }))}
                        className="w-4 h-4 rounded text-[#2D5A27] focus:ring-[#2D5A27]"
                      />
                      <span className="text-xs font-semibold text-slate-700">Kích hoạt chi nhánh ngoài website</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setEditingBranch(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleSaveBranch}
                disabled={isBranchSaving}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isBranchSaving ? 'Đang lưu...' : 'Lưu Chi Nhánh'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

{editingService && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27]">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-wide uppercase">
                  {isCreatingNewService ? 'Thêm Gói Dịch Vụ Mới' : 'Chỉnh Sửa Gói Dịch Vụ'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Thanh Chuyển Ngôn Ngữ & Nút Dịch AI */}
              <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <button type="button" onClick={() => setServiceLangTab('vi')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${serviceLangTab === 'vi' ? 'bg-[#2D5A27] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
                      <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                      <span>Bản Tiếng Việt</span>
                    </button>
                    <button type="button" onClick={() => setServiceLangTab('en')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${serviceLangTab === 'en' ? 'bg-[#2D5A27] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
                      <UKFlag className="w-4 h-3 rounded-[2px]" />
                      <span>Bản English</span>
                    </button>
                  </div>
                </div>
                <button type="button" onClick={handleAutoTranslateService} disabled={isTranslatingService}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
                  title="Dịch tự động sang Tiếng Anh y khoa bằng AI">
                  {isTranslatingService ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isTranslatingService ? 'Đang chuyển đổi...' : 'Chuyển đổi ENG'}</span>
                </button>
              </div>

              {serviceLangTab === 'vi' ? (
                /* TAB TIẾNG VIỆT */
                <div className="space-y-4">
                  {/* Hàng 1: Tên gói dịch vụ & Phụ đề */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tên gói dịch vụ (Tiếng Việt): <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingService.ten_dich_vu || ''}
                        onChange={(e) => setEditingService((prev) => (prev ? { ...prev, ten_dich_vu: e.target.value } : null))}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="VD: Phẫu Thuật Ngoại Khoa & Triệt Sản An Toàn..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phụ đề / Thông điệp ngắn (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingService.phu_de || ''}
                        onChange={(e) => setEditingService((prev) => (prev ? { ...prev, phu_de: e.target.value } : null))}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="VD: Phòng phẫu thuật áp lực dương vô trùng 100%..."
                      />
                    </div>
                  </div>

                  {/* Hàng 2: Huy hiệu nổi bật & Chi phí tham khảo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Huy hiệu nổi bật (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingService.huy_hieu || ''}
                        onChange={(e) => setEditingService((prev) => (prev ? { ...prev, huy_hieu: e.target.value } : null))}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="VD: Vô Trùng Chuẩn Y Khoa..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Chi phí tham khảo (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingService.gia_tham_khao || ''}
                        onChange={(e) => setEditingService((prev) => (prev ? { ...prev, gia_tham_khao: e.target.value } : null))}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="VD: Từ 500.000đ hoặc Liên hệ..."
                      />
                    </div>
                  </div>

                  {/* Hàng 3: Thời lượng ước tính */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thời lượng ước tính (Tiếng Việt):
                    </label>
                    <input
                      type="text"
                      value={editingService.thoi_luong || ''}
                      onChange={(e) => setEditingService((prev) => (prev ? { ...prev, thoi_luong: e.target.value } : null))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      placeholder="VD: 45 - 60 phút hoặc Theo ca phẫu thuật..."
                    />
                  </div>

                  {/* Hàng 4: Mô tả chi tiết nội dung dịch vụ */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mô tả chi tiết nội dung dịch vụ (Tiếng Việt):
                    </label>
                    <textarea
                      rows={3}
                      value={editingService.mo_ta || ''}
                      onChange={(e) => setEditingService((prev) => (prev ? { ...prev, mo_ta: e.target.value } : null))}
                      className="w-full text-xs p-3.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-none"
                      placeholder="Mô tả tóm tắt giải pháp y khoa và giá trị gói dịch vụ mang lại cho thú cưng..."
                    />
                  </div>

                  {/* Hàng 5: Tiện ích & Quy trình (2 cột song song) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tiện ích &amp; Cam kết chuẩn mực y khoa (Tiếng Việt, mỗi dòng một mục):
                      </label>
                      <textarea
                        rows={4}
                        value={serviceFeaturesInput}
                        onChange={(e) => setServiceFeaturesInput(e.target.value)}
                        className="w-full text-xs p-3.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none font-mono resize-none"
                        placeholder="VD:&#10;Hệ thống máy thở gây mê Isoflurane tự động&#10;Giám sát nhịp tim và SpO2 liên tục&#10;Hậu phẫu phòng chăm sóc tích cực 24/7"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Xuống dòng để phân tách các tiện ích.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Quy trình thực hiện (Tiếng Việt, mỗi dòng một bước):
                      </label>
                      <textarea
                        rows={4}
                        value={serviceWorkflowInput}
                        onChange={(e) => setServiceWorkflowInput(e.target.value)}
                        className="w-full text-xs p-3.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none font-mono resize-none"
                        placeholder="VD:&#10;Bước 1: Khám tiền mê & xét nghiệm đông máu&#10;Bước 2: Tiến hành phẫu thuật vô trùng tuyệt đối&#10;Bước 3: Hồi sức và theo dõi tại phòng ICU"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Xuống dòng để phân tách từng bước 1, 2, 3...</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* TAB TIẾNG ANH (BỐ CỤC Y CHANG 100% BẢN TIẾNG VIỆT) */
                <div className="space-y-4">
                  {/* Hàng 1: Tên gói dịch vụ & Phụ đề */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tên gói dịch vụ (English): <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={(editingService as any).ten_dich_vu_en || ''}
                        onChange={(e) => setEditingService((prev) => (prev ? { ...prev, ten_dich_vu_en: e.target.value } as any : null))}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. Surgical Care & Safe Neutering Procedures..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phụ đề / Thông điệp ngắn (English):
                      </label>
                      <input
                        type="text"
                        value={(editingService as any).phu_de_en || ''}
                        onChange={(e) => setEditingService((prev) => (prev ? { ...prev, phu_de_en: e.target.value } as any : null))}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. 100% Sterile positive pressure operating suites..."
                      />
                    </div>
                  </div>

                  {/* Hàng 2: Huy hiệu nổi bật & Chi phí tham khảo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Huy hiệu nổi bật (English):
                      </label>
                      <input
                        type="text"
                        value={(editingService as any).huy_hieu_en || ''}
                        onChange={(e) => setEditingService((prev) => (prev ? { ...prev, huy_hieu_en: e.target.value } as any : null))}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. Hospital Grade Sterile..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Chi phí tham khảo (English):
                      </label>
                      <input
                        type="text"
                        value={(editingService as any).gia_tham_khao_en || ''}
                        onChange={(e) => setEditingService((prev) => (prev ? { ...prev, gia_tham_khao_en: e.target.value } as any : null))}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. From 500,000 VND or Contact us..."
                      />
                    </div>
                  </div>

                  {/* Hàng 3: Thời lượng ước tính */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thời lượng ước tính (English):
                    </label>
                    <input
                      type="text"
                      value={(editingService as any).thoi_luong_en || ''}
                      onChange={(e) => setEditingService((prev) => (prev ? { ...prev, thoi_luong_en: e.target.value } as any : null))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      placeholder="e.g. 45 - 60 minutes or Upon surgery case..."
                    />
                  </div>

                  {/* Hàng 4: Mô tả chi tiết nội dung dịch vụ */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mô tả chi tiết nội dung dịch vụ (English):
                    </label>
                    <textarea
                      rows={3}
                      value={(editingService as any).mo_ta_en || ''}
                      onChange={(e) => setEditingService((prev) => (prev ? { ...prev, mo_ta_en: e.target.value } as any : null))}
                      className="w-full text-xs p-3.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-none"
                      placeholder="Describe the medical solution and 5-star value delivered to pets..."
                    />
                  </div>

                  {/* Hàng 5: Tiện ích & Quy trình (2 cột song song) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tiện ích &amp; Cam kết chuẩn mực y khoa (English, mỗi dòng một mục):
                      </label>
                      <textarea
                        rows={4}
                        value={serviceFeaturesEnInput}
                        onChange={(e) => setServiceFeaturesEnInput(e.target.value)}
                        className="w-full text-xs p-3.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none font-mono resize-none"
                        placeholder="e.g.&#10;Automated Isoflurane inhalation anesthesia system&#10;Continuous vital sign and SpO2 monitoring&#10;24/7 specialized postoperative ICU recovery"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Xuống dòng để phân tách các tiện ích (One per line).</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Quy trình thực hiện (English, mỗi dòng một bước):
                      </label>
                      <textarea
                        rows={4}
                        value={serviceWorkflowEnInput}
                        onChange={(e) => setServiceWorkflowEnInput(e.target.value)}
                        className="w-full text-xs p-3.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none font-mono resize-none"
                        placeholder="e.g.&#10;Step 1: Pre-anesthetic evaluation & blood coagulation profile&#10;Step 2: Strict aseptic surgical procedure&#10;Step 3: ICU post-operative recovery and monitoring"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Xuống dòng để phân tách từng bước 1, 2, 3... (One per line).</p>
                    </div>
                  </div>
                </div>
              )}

              {/* KHỐI CÀI ĐẶT DÙNG CHUNG (KHÔNG PHỤ THUỘC NGÔN NGỮ) */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Stethoscope className="w-3.5 h-3.5 text-[#2D5A27]" />
                  <span>Cài đặt phân loại &amp; Hình ảnh dịch vụ (Dùng chung cho cả 2 ngôn ngữ)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nhóm phân loại dịch vụ: <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={editingService.nhom_dich_vu || 'medical'}
                      onChange={(e) => setEditingService((prev) => (prev ? { ...prev, nhom_dich_vu: e.target.value as any } : null))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                    >
                      <option value="medical">Nhóm 1: Thú Y &amp; Y Tế Chuyên Sâu</option>
                      <option value="care">Nhóm 2: Chăm Sóc &amp; Lưu Trú 5 Sao</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thứ tự sắp xếp:
                    </label>
                    <input
                      type="number"
                      value={editingService.thu_tu || 0}
                      onChange={(e) => setEditingService((prev) => (prev ? { ...prev, thu_tu: parseInt(e.target.value) || 0 } : null))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Hình ảnh dịch vụ (Dùng chung cho cả list và khung chi tiết) */}
                <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <AdminImageInput
                    value={editingService.hinh_anh || ''}
                    onChange={(url) => setEditingService((prev) => (prev ? { ...prev, hinh_anh: url } : null))}
                    folder="services"
                    label="Hình ảnh dịch vụ (Dùng chung cho ảnh nhỏ ở danh sách và ảnh lớn ở khung chi tiết):"
                    uploadButtonLabel="Tải File"
                    pasteButtonLabel="Dán Ảnh"
                    onNotification={showNotification}
                  />

                  {editingService.hinh_anh && (
                    <div className="pt-2 flex items-center gap-4">
                      <div className="text-center">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-300 bg-slate-100 shadow-2xs">
                          <img
                            src={editingService.hinh_anh}
                            alt="Thumbnail preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">Ảnh ở danh sách</span>
                      </div>

                      <div className="flex-1">
                        <div className="w-full h-24 rounded-xl overflow-hidden border border-slate-300 bg-slate-100 shadow-2xs relative">
                          <img
                            src={editingService.hinh_anh}
                            alt="Hero preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">Ảnh ở khung chi tiết lớn</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Checkboxes trạng thái */}
                <div className="flex flex-wrap items-center gap-6 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="service_noi_bat"
                      checked={editingService.noi_bat || false}
                      onChange={(e) => setEditingService((prev) => (prev ? { ...prev, noi_bat: e.target.checked } : null))}
                      className="w-4 h-4 text-[#2D5A27] rounded border-slate-300 focus:ring-[#2D5A27]"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Đánh dấu là gói nổi bật 5★
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="service_kich_hoat"
                      checked={editingService.kich_hoat !== undefined && editingService.kich_hoat !== null ? Boolean(editingService.kich_hoat) : true}
                      onChange={(e) => setEditingService((prev) => (prev ? { ...prev, kich_hoat: e.target.checked } : null))}
                      className="w-4 h-4 text-[#2D5A27] rounded border-slate-300 focus:ring-[#2D5A27]"
                    />
                    <span className="text-xs font-semibold text-slate-800">
                      Kích hoạt hiển thị trên web
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                Hủy Bỏ
              </button>

              <button
                type="button"
                disabled={isServiceSaving}
                onClick={handleSaveService}
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                {isServiceSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isServiceSaving ? 'Đang lưu vào Supabase...' : 'Lưu Dịch Vụ'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MODAL POPUP FORM: THÊM / CHỈNH SỬA CÂU HỎI THƯỜNG GẶP  */}
      {/* ========================================================= */}
      {editingFaq && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27]">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900">
                    {isCreatingNewFaq ? 'Thêm Câu Hỏi Thường Gặp Mới' : 'Chỉnh Sửa Câu Hỏi Thường Gặp'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Nội dung sẽ hiển thị ngay lập tức trong mục FAQ ngoài trang chủ
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingFaq(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Thanh Chuyển Ngôn Ngữ & Nút Dịch AI */}
              <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setFaqModalTab('vi')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        faqModalTab === 'vi'
                          ? 'bg-[#2D5A27] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                      <span>Bản Tiếng Việt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFaqModalTab('en')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        faqModalTab === 'en'
                          ? 'bg-[#2D5A27] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UKFlag className="w-4 h-3 rounded-[2px]" />
                      <span>Bản English</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAutoTranslateFaq}
                  disabled={isTranslatingFaq}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs hover:shadow transition disabled:opacity-50 cursor-pointer"
                  title="Dịch tự động toàn bộ nội dung câu hỏi sang Tiếng Anh y khoa bằng AI"
                >
                  {isTranslatingFaq ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{isTranslatingFaq ? 'Đang chuyển đổi...' : 'Chuyển đổi ENG'}</span>
                </button>
              </div>

              {faqModalTab === 'vi' ? (
                <>
                  {/* Câu hỏi VI */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Câu hỏi (Tiếng Việt): <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingFaq.cau_hoi || ''}
                      onChange={(e) => setEditingFaq((prev) => ({ ...prev, cau_hoi: e.target.value }))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  {/* Câu trả lời VI */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Câu trả lời giải đáp (Tiếng Việt): <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={editingFaq.cau_tra_loi || ''}
                      onChange={(e) => setEditingFaq((prev) => ({ ...prev, cau_tra_loi: e.target.value }))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* Danh mục VI */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Danh mục phân loại (Tiếng Việt):
                    </label>
                    <input
                      type="text"
                      list="faq_categories_list_vi"
                      value={editingFaq.chuyen_muc || ''}
                      onChange={(e) => setEditingFaq((prev) => ({ ...prev, chuyen_muc: e.target.value }))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                    <datalist id="faq_categories_list_vi">
                      <option value="Cấp cứu & Hotline" />
                      <option value="Chuẩn bị thăm khám" />
                      <option value="Lưu trú & Resort" />
                      <option value="Vận chuyển Pet Taxi" />
                      <option value="Tư vấn & Lựa chọn dịch vụ" />
                      <option value="Kiểm soát nhiễm khuẩn" />
                      <option value="Chung" />
                    </datalist>
                  </div>
                </>
              ) : (
                <>
                  {/* Câu hỏi EN */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Câu hỏi (Tiếng Anh - English):
                    </label>
                    <input
                      type="text"
                      value={editingFaq.cau_hoi_en || ''}
                      onChange={(e) => setEditingFaq((prev) => ({ ...prev, cau_hoi_en: e.target.value }))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  {/* Câu trả lời EN */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Câu trả lời giải đáp (Tiếng Anh - English):
                    </label>
                    <textarea
                      rows={5}
                      value={editingFaq.cau_tra_loi_en || ''}
                      onChange={(e) => setEditingFaq((prev) => ({ ...prev, cau_tra_loi_en: e.target.value }))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none leading-relaxed"
                    />
                  </div>

                  {/* Danh mục EN */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Danh mục phân loại (Tiếng Anh - English):
                    </label>
                    <input
                      type="text"
                      list="faq_categories_list_en"
                      value={editingFaq.chuyen_muc_en || ''}
                      onChange={(e) => setEditingFaq((prev) => ({ ...prev, chuyen_muc_en: e.target.value }))}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                    <datalist id="faq_categories_list_en">
                      <option value="Emergency & Hotline" />
                      <option value="Visit Preparation" />
                      <option value="Boarding & Resort" />
                      <option value="Pet Taxi & Relocation" />
                      <option value="Consultation & Guidance" />
                      <option value="Infection Control" />
                      <option value="General" />
                    </datalist>
                  </div>
                </>
              )}

              {/* Cài đặt chung: Thứ tự & Kích hoạt */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thứ tự sắp xếp:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={editingFaq.thu_tu || 1}
                    onChange={(e) => setEditingFaq((prev) => ({ ...prev, thu_tu: parseInt(e.target.value, 10) || 1 }))}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="faq_kich_hoat"
                    checked={editingFaq.kich_hoat !== false}
                    onChange={(e) => setEditingFaq((prev) => ({ ...prev, kich_hoat: e.target.checked }))}
                    className="w-4 h-4 text-[#2D5A27] rounded border-slate-300 focus:ring-[#2D5A27]"
                  />
                  <label htmlFor="faq_kich_hoat" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    Kích hoạt hiển thị ngoài website
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setEditingFaq(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                Hủy Bỏ
              </button>

              <button
                type="button"
                disabled={isFaqSaving}
                onClick={handleSaveFaq}
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                {isFaqSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>{isFaqSaving ? 'Đang lưu vào Supabase...' : 'Lưu Câu Hỏi'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODAL CHI TIẾT & XỬ LÝ LỊCH HẸN                       */}
      {/* ========================================================= */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27]">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">
                      Chi Tiết Lịch Hẹn
                    </h3>
                    <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#2D5A27] border border-emerald-200">
                      {selectedAppointment.ma_lich_hen}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Đặt lúc: {selectedAppointment.ngay_tao ? new Date(selectedAppointment.ngay_tao).toLocaleString('vi-VN') : 'Không rõ'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {/* Card 1: Khách hàng & Liên hệ */}
              {(() => {
                const { email: customerEmail, cleanNote } = extractEmailAndNote(selectedAppointment.ghi_chu);
                return (
                  <>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Thông tin chủ nuôi &amp; Liên hệ
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500">Họ và tên:</span>
                          <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedAppointment.ho_ten_chu}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Số điện thoại:</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="font-mono font-bold text-slate-900 text-sm">{selectedAppointment.so_dien_thoai}</p>
                            <a
                              href={`tel:${selectedAppointment.so_dien_thoai}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition shadow-xs"
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>Gọi Ngay</span>
                            </a>
                          </div>
                        </div>

                        {customerEmail && (
                          <div className="sm:col-span-2 pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <span className="text-slate-500">Gmail / Email xác nhận:</span>
                              <div className="flex items-center gap-1.5 mt-0.5 font-mono text-blue-700 font-bold text-xs">
                                <Mail className="w-3.5 h-3.5 text-blue-600" />
                                <a href={`mailto:${customerEmail}`} className="hover:underline">{customerEmail}</a>
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={isSendingConfirmEmail}
                              onClick={() => handleResendConfirmEmail(selectedAppointment)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
                            >
                              <Send className="w-3 h-3" />
                              <span>{isSendingConfirmEmail ? 'Đang gửi...' : 'Gửi Lại Email Xác Nhận'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card 2: Thú cưng & Dịch vụ */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Thông tin thú cưng &amp; Dịch vụ đăng ký
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500">Tên thú cưng:</span>
                          <p className="font-bold text-slate-900 text-sm mt-0.5 flex items-center gap-1.5">
                            <span>{selectedAppointment.loai_thu_cung === 'dog' ? '🐶' : selectedAppointment.loai_thu_cung === 'cat' ? '🐱' : '🐰'}</span>
                            <span>{selectedAppointment.ten_thu_cung}</span>
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500">Dịch vụ yêu cầu:</span>
                          <p className="font-bold text-[#2D5A27] text-sm mt-0.5">{selectedAppointment.dich_vu}</p>
                        </div>
                        <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                          <span className="text-slate-500">Cơ sở đăng ký:</span>
                          <p className="font-semibold text-slate-800 mt-0.5">{selectedAppointment.ten_chi_nhanh || 'Chưa xác định cơ sở'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Card 3: Thời gian khám & Ghi chú */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Thời gian khám &amp; Yêu cầu đặc thù
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                        <div>
                          <span className="text-slate-500">Khung giờ:</span>
                          <p className="font-bold text-[#2D5A27] text-base mt-0.5">{selectedAppointment.gio_hen}</p>
                        </div>
                        <div>
                          <span className="text-slate-500">Ngày hẹn:</span>
                          <p className="font-bold text-slate-900 text-base mt-0.5">{selectedAppointment.ngay_hen}</p>
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-500 text-xs">Ghi chú của khách hàng:</span>
                        <div className="mt-1 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 leading-relaxed font-light">
                          {cleanNote || '(Không có ghi chú thêm)'}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Card 4: Điều hướng trạng thái 1-Click */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Chuyển Trạng Thái Lịch Hẹn Nhanh:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateAppointmentStatus(selectedAppointment.id, 'cho_xac_nhan')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                      selectedAppointment.trang_thai === 'cho_xac_nhan'
                        ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/30'
                        : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    ⏳ Chờ xác nhận
                  </button>

                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateAppointmentStatus(selectedAppointment.id, 'da_xac_nhan')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                      selectedAppointment.trang_thai === 'da_xac_nhan'
                        ? 'bg-blue-100 text-blue-900 border-blue-300 ring-2 ring-blue-400/30'
                        : 'bg-white hover:bg-blue-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    ✓ Đã xác nhận
                  </button>

                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateAppointmentStatus(selectedAppointment.id, 'da_kham')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                      selectedAppointment.trang_thai === 'da_kham'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 ring-2 ring-emerald-400/30'
                        : 'bg-white hover:bg-emerald-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    ✓✓ Đã hoàn thành
                  </button>

                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => handleUpdateAppointmentStatus(selectedAppointment.id, 'da_huy')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                      selectedAppointment.trang_thai === 'da_huy'
                        ? 'bg-rose-100 text-rose-900 border-rose-300 ring-2 ring-rose-400/30'
                        : 'bg-white hover:bg-rose-50 text-slate-700 border-slate-300'
                    }`}
                  >
                    ✕ Hủy lịch
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/70">
              <button
                type="button"
                onClick={() => handleDeleteAppointment(selectedAppointment)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa Lịch Hẹn</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAppointment(null)}
                className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. MODAL THÊM / CHỈNH SỬA ĐÁNH GIÁ KHÁCH HÀNG             */}
      {/* ========================================================= */}
      {editingReview && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-wide uppercase">
                  {isCreatingNewReview ? 'Thêm Đánh Giá Khách Hàng' : 'Chỉnh Sửa Đánh Giá'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveReview} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên chủ nuôi: *
                  </label>
                  <input
                    type="text"
                    value={editingReview.ten_khach_hang || ''}
                    onChange={(e) => setEditingReview((prev) => ({ ...prev, ten_khach_hang: e.target.value }))}
                    placeholder="VD: Chị Minh Thư"
                    required
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số điện thoại (ẩn 4 số cuối): *
                  </label>
                  <input
                    type="text"
                    value={editingReview.so_dien_thoai || ''}
                    onChange={(e) => setEditingReview((prev) => ({ ...prev, so_dien_thoai: e.target.value }))}
                    placeholder="VD: 0908 234 ***"
                    required
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số sao đánh giá (1 - 5 sao):
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setEditingReview((prev) => ({ ...prev, so_sao: star }))}
                        className="p-1 hover:scale-110 transition cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            (editingReview.so_sao || 5) >= star
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 font-bold text-xs text-slate-700 font-mono">
                      {editingReview.so_sao || 5} Sao
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thời gian hiển thị:
                  </label>
                  <input
                    type="text"
                    value={editingReview.ngay_danh_gia || ''}
                    onChange={(e) => setEditingReview((prev) => ({ ...prev, ngay_danh_gia: e.target.value }))}
                    placeholder="VD: Hôm qua, 3 ngày trước, 1 tuần trước..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung nhận xét chi tiết: *
                </label>
                <textarea
                  rows={4}
                  value={editingReview.noi_dung || ''}
                  onChange={(e) => setEditingReview((prev) => ({ ...prev, noi_dung: e.target.value }))}
                  placeholder="Nhập cảm nhận của chủ nuôi về dịch vụ, bác sĩ, điều dưỡng..."
                  required
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Ảnh đại diện thú cưng: tự thêm hoặc dán vào */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Ảnh đại diện thú cưng (dán URL hoặc tự thêm):
                </label>
                <AdminImageInput
                  value={editingReview.hinh_anh_thu_cung || ''}
                  onChange={(url) =>
                    setEditingReview((prev) => ({ ...prev, hinh_anh_thu_cung: url }))
                  }
                  folder="general"
                  label=""
                  uploadButtonLabel="Tải File"
                  pasteButtonLabel="Dán Ảnh"
                  onNotification={showNotification}
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400">Chọn mẫu nhanh:</span>
                  {[
                    { label: 'Bé Golden', url: '/pet_golden_spa.jpg' },
                    { label: 'Bé Corgi', url: '/pet_corgi_park.jpg' },
                    { label: 'Bé Mèo Anh', url: '/pet_cat_resort.jpg' },
                    { label: 'Bé Cún con', url: '/pet_puppy_play.jpg' },
                    { label: 'Bé Miu', url: '/pet_kitten_eyes.jpg' },
                  ].map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() =>
                        setEditingReview((prev) => ({ ...prev, hinh_anh_thu_cung: preset.url }))
                      }
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition cursor-pointer ${
                        editingReview.hinh_anh_thu_cung === preset.url
                          ? 'bg-[#2D5A27] text-white border-[#2D5A27]'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thứ tự hiển thị:
                </label>
                <input
                  type="number"
                  value={editingReview.thu_tu ?? 0}
                  onChange={(e) =>
                    setEditingReview((prev) => ({
                      ...prev,
                      thu_tu: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingReview.da_xac_thuc ?? true}
                    onChange={(e) => setEditingReview((prev) => ({ ...prev, da_xac_thuc: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#2D5A27] focus:ring-[#2D5A27]"
                  />
                  <span className="text-xs font-semibold text-slate-700">Đã xác thực thăm khám</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingReview.kich_hoat !== false}
                    onChange={(e) => setEditingReview((prev) => ({ ...prev, kich_hoat: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#2D5A27] focus:ring-[#2D5A27]"
                  />
                  <span className="text-xs font-semibold text-slate-700">Kích hoạt hiển thị</span>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isReviewSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isReviewSaving ? 'Đang lưu...' : 'Lưu Đánh Giá'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 9. MODAL THÊM / CHỈNH SỬA HỒ SƠ ĐỘI NGŨ Y TẾ              */}
      {/* ========================================================= */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-[#2D5A27]">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-wide uppercase">
                  {isCreatingNewMember ? 'Thêm Nhân Sự Đội Ngũ Mới' : 'Chỉnh Sửa Hồ Sơ Nhân Sự'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveMember} className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Phân loại hạn mục */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hạn mục phân loại: *
                </label>
                <select
                  value={editingMember.phan_loai || 'bac_si'}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setEditingMember((prev) => ({
                      ...prev,
                      phan_loai: val,
                      chuc_danh:
                        prev?.chuc_danh && prev.chuc_danh !== 'BÁC SĨ THÚ Y' && prev.chuc_danh !== 'ĐIỀU DƯỠNG' && prev.chuc_danh !== 'CHUYÊN GIA TƯ VẤN'
                          ? prev.chuc_danh
                          : val === 'lanh_dao'
                          ? 'NHÀ SÁNG LẬP · PET M&M'
                          : val === 'chuyen_gia'
                          ? 'CHUYÊN GIA TƯ VẤN'
                          : val === 'dieu_duong'
                          ? 'ĐIỀU DƯỠNG'
                          : 'BÁC SĨ THÚ Y',
                    }));
                  }}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 bg-white focus:border-[#2D5A27] focus:outline-none"
                >
                  <option value="lanh_dao">1. Đội ngũ Lãnh đạo chuyên môn</option>
                  <option value="chuyen_gia">2. Đội ngũ Chuyên gia Tư vấn</option>
                  <option value="bac_si">3. Đội ngũ Bác sĩ Thú y</option>
                  <option value="dieu_duong">4. Đội ngũ Điều dưỡng &amp; Chăm sóc</option>
                </select>
              </div>

              {/* Hình ảnh chân dung bác sĩ / nhân sự */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Ảnh chân dung:
                </label>
                <AdminImageInput
                  value={editingMember.hinh_anh || ''}
                  onChange={(url) => setEditingMember((prev) => ({ ...prev, hinh_anh: url }))}
                  folder="general"
                  label=""
                  uploadButtonLabel="Tải Ảnh"
                  pasteButtonLabel="Dán Ảnh"
                  onNotification={showNotification}
                />
              </div>

              {/* Language Switch Tabs & AI Translate Button */}
              <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-100/80 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1">
                  <div className="flex bg-white rounded-lg p-0.5 shadow-2xs border border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => setMemberModalTab('vi')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        memberModalTab === 'vi'
                          ? 'bg-[#2D5A27] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                      <span>Bản Tiếng Việt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberModalTab('en')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        memberModalTab === 'en'
                          ? 'bg-[#2D5A27] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UKFlag className="w-4 h-3 rounded-[2px]" />
                      <span>Bản English</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTranslateMember}
                  disabled={isTranslatingMember}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs hover:shadow transition disabled:opacity-50 cursor-pointer"
                  title="Dịch tự động toàn bộ thông tin nhân sự sang Tiếng Anh y khoa bằng AI"
                >
                  {isTranslatingMember ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{isTranslatingMember ? 'Đang chuyển đổi...' : 'Chuyển đổi ENG'}</span>
                </button>
              </div>

              {memberModalTab === 'vi' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Họ và tên (Tiếng Việt): <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editingMember.ho_ten || ''}
                        onChange={(e) => setEditingMember((prev) => ({ ...prev, ho_ten: e.target.value }))}
                        placeholder="Nhập họ và tên"
                        required
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Thẻ chức danh (Tiếng Việt):
                      </label>
                      <input
                        type="text"
                        value={editingMember.chuc_danh || ''}
                        onChange={(e) => setEditingMember((prev) => ({ ...prev, chuc_danh: e.target.value }))}
                        placeholder="BÁC SĨ THÚ Y"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Học vị / Chức vụ (Tiếng Việt):
                    </label>
                    <input
                      type="text"
                      value={editingMember.hoc_vi_chuc_vu || ''}
                      onChange={(e) => setEditingMember((prev) => ({ ...prev, hoc_vi_chuc_vu: e.target.value }))}
                      placeholder="Học vị, chức danh công tác"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Giới thiệu tóm tắt (Tiếng Việt):
                    </label>
                    <textarea
                      rows={4}
                      value={editingMember.mo_ta || ''}
                      onChange={(e) => setEditingMember((prev) => ({ ...prev, mo_ta: e.target.value }))}
                      placeholder="Nội dung giới thiệu năng lực chuyên môn"
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name (English):
                      </label>
                      <input
                        type="text"
                        value={editingMember.ho_ten_en || ''}
                        onChange={(e) => setEditingMember((prev) => ({ ...prev, ho_ten_en: e.target.value }))}
                        placeholder="e.g. Dr. Nguyen Minh Tuan, DVM"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Title Badge (English):
                      </label>
                      <input
                        type="text"
                        value={editingMember.chuc_danh_en || ''}
                        onChange={(e) => setEditingMember((prev) => ({ ...prev, chuc_danh_en: e.target.value }))}
                        placeholder="e.g. VETERINARY DOCTOR"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none uppercase"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Degree / Position (English):
                    </label>
                    <input
                      type="text"
                      value={editingMember.hoc_vi_chuc_vu_en || ''}
                      onChange={(e) => setEditingMember((prev) => ({ ...prev, hoc_vi_chuc_vu_en: e.target.value }))}
                      placeholder="e.g. Specialist Level I · Surgery & Orthopedics"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Summary Bio (English):
                    </label>
                    <textarea
                      rows={4}
                      value={editingMember.mo_ta_en || ''}
                      onChange={(e) => setEditingMember((prev) => ({ ...prev, mo_ta_en: e.target.value }))}
                      placeholder="Professional experience and clinical competence summary in English..."
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-none leading-relaxed"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thứ tự sắp xếp:
                  </label>
                  <input
                    type="number"
                    value={editingMember.thu_tu ?? 0}
                    onChange={(e) =>
                      setEditingMember((prev) => ({
                        ...prev,
                        thu_tu: parseInt(e.target.value, 10) || 0,
                      }))
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingMember.kich_hoat !== false}
                      onChange={(e) => setEditingMember((prev) => ({ ...prev, kich_hoat: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#2D5A27] focus:ring-[#2D5A27]"
                    />
                    <span className="text-xs font-semibold text-slate-700">Kích hoạt hiển thị</span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isMemberSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isMemberSaving ? 'Đang lưu...' : 'Lưu Nhân Sự'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 10. MODAL THÊM / CHỈNH SỬA SLIDE ẢNH KHUNG GIỚI THIỆU     */}
      {/* ========================================================= */}
            {editingAboutSlide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-wide uppercase">
                {isCreatingNewAboutSlide ? 'Thêm Ảnh Khung Giới Thiệu' : 'Chỉnh Sửa Ảnh Khung Giới Thiệu'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingAboutSlide(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* THANH CHUYỂN ĐỔI NGÔN NGỮ (TIẾNG VIỆT & ENGLISH) */}
            <div className="px-6 pt-4 pb-0">
              <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                {/* Tab Ngôn ngữ */}
                <div className="inline-flex p-1 bg-slate-200/80 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setAboutSlideLang('vi')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      aboutSlideLang === 'vi'
                        ? 'bg-[#2D5A27] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                    <span>Tiếng Việt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAboutSlideLang('en')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      aboutSlideLang === 'en'
                        ? 'bg-[#2D5A27] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UKFlag className="w-4 h-3 rounded-[2px]" />
                    <span>English</span>
                  </button>
                </div>

                {/* Nút Chuyển đổi ENG */}
                <button
                  type="button"
                  onClick={handleAutoTranslateAboutSlide}
                  disabled={isTranslatingAboutSlide}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs hover:shadow transition disabled:opacity-50 cursor-pointer"
                  title="Tự động dịch Tiêu đề chú thích & Huy hiệu sang Tiếng Anh chuyên ngành Thú y bằng AI"
                >
                  {isTranslatingAboutSlide ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{isTranslatingAboutSlide ? 'Đang chuyển đổi...' : 'Chuyển đổi ENG'}</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveAboutSlide} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đường dẫn ảnh: *
                </label>
                <AdminImageInput
                  value={editingAboutSlide.duong_dan_anh || ''}
                  onChange={(url) => setEditingAboutSlide((prev) => ({ ...prev, duong_dan_anh: url }))}
                  folder="banners"
                  label=""
                  uploadButtonLabel="Tải Ảnh"
                  pasteButtonLabel="Dán Ảnh"
                  onNotification={showNotification}
                />
              </div>

              {/* NỘI DUNG TIẾNG VIỆT */}
              {aboutSlideLang === 'vi' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tiêu đề chú thích ảnh: *
                    </label>
                    <input
                      type="text"
                      value={editingAboutSlide.tieu_de || ''}
                      onChange={(e) => setEditingAboutSlide((prev) => ({ ...prev, tieu_de: e.target.value }))}
                      required
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Huy hiệu góc ảnh:
                    </label>
                    <input
                      type="text"
                      value={editingAboutSlide.alt_text || ''}
                      onChange={(e) => setEditingAboutSlide((prev) => ({ ...prev, alt_text: e.target.value }))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* NỘI DUNG ENGLISH */}
              {aboutSlideLang === 'en' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tiêu đề chú thích ảnh (English):
                    </label>
                    <input
                      type="text"
                      value={editingAboutSlide.tieu_de_en || ''}
                      onChange={(e) => setEditingAboutSlide((prev) => ({ ...prev, tieu_de_en: e.target.value }))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Huy hiệu góc ảnh (English):
                    </label>
                    <input
                      type="text"
                      value={editingAboutSlide.alt_text_en || ''}
                      onChange={(e) => setEditingAboutSlide((prev) => ({ ...prev, alt_text_en: e.target.value }))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thứ tự hiển thị:
                  </label>
                  <input
                    type="number"
                    value={editingAboutSlide.thu_tu ?? 0}
                    onChange={(e) =>
                      setEditingAboutSlide((prev) => ({ ...prev, thu_tu: parseInt(e.target.value, 10) || 0 }))
                    }
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                  />
                </div>

                <div className="pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingAboutSlide.kich_hoat !== false}
                      onChange={(e) => setEditingAboutSlide((prev) => ({ ...prev, kich_hoat: e.target.checked }))}
                      className="w-4 h-4 rounded text-[#2D5A27] focus:ring-[#2D5A27]"
                    />
                    <span className="text-xs font-semibold text-slate-700">Kích hoạt hiển thị</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingAboutSlide(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isAboutSlideSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isAboutSlideSaving ? 'Đang lưu...' : 'Lưu Slide'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 11. MODAL THÊM / CHỈNH SỬA BÀI VIẾT CẨM NANG             */}
      {/* ========================================================= */}
            {editingArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#2D5A27]/10 flex items-center justify-center text-[#2D5A27]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 tracking-wide uppercase">
                  {isCreatingNewArticle ? 'Thêm Bài Viết Cẩm Nang Mới' : 'Chỉnh Sửa Bài Viết Cẩm Nang'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingArticle(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveArticle} className="p-6 overflow-y-auto space-y-5">
              {/* Thanh Chuyển Ngôn Ngữ & Nút Dịch AI */}
              <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setArticleLangTab('vi')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        articleLangTab === 'vi'
                          ? 'bg-[#2D5A27] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <VietnamFlag className="w-4 h-3 rounded-[2px]" />
                      <span>Bản Tiếng Việt</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setArticleLangTab('en')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        articleLangTab === 'en'
                          ? 'bg-[#2D5A27] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <UKFlag className="w-4 h-3 rounded-[2px]" />
                      <span>Bản English</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAutoTranslateArticle}
                  disabled={isTranslatingArticle}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
                  title="Dịch tự động sang Tiếng Anh bằng AI"
                >
                  {isTranslatingArticle ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{isTranslatingArticle ? 'Đang chuyển đổi...' : 'Chuyển đổi ENG'}</span>
                </button>
              </div>

              {articleLangTab === 'vi' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tiêu đề bài viết: *
                    </label>
                    <input
                      type="text"
                      value={editingArticle.tieu_de || ''}
                      onChange={(e) => setEditingArticle((prev) => ({ ...prev, tieu_de: e.target.value }))}
                      required
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      placeholder="Ví dụ: Lịch tiêm phòng đầy đủ cho chó mèo năm 2026..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Chuyên mục bài viết:
                      </label>
                      <select
                        value={editingArticle.chuyen_muc || 'Y Khoa Dự Phòng'}
                        onChange={(e) => setEditingArticle((prev) => ({ ...prev, chuyen_muc: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none bg-white"
                      >
                        <option value="Y Khoa Dự Phòng">Y Khoa Dự Phòng</option>
                        <option value="Sơ Cứu Thú Cưng">Sơ Cứu Thú Cưng</option>
                        <option value="Chăm Sóc & Spa">Chăm Sóc &amp; Spa</option>
                        <option value="Dinh Dưỡng Thú Cưng">Dinh Dưỡng Thú Cưng</option>
                        <option value="Hành Vi & Huấn Luyện">Hành Vi &amp; Huấn Luyện</option>
                        <option value="Cẩm Nang Tổng Hợp">Cẩm Nang Tổng Hợp</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tác giả / Bác sĩ phụ trách:
                      </label>
                      <input
                        type="text"
                        value={editingArticle.tac_gia || ''}
                        onChange={(e) => setEditingArticle((prev) => ({ ...prev, tac_gia: e.target.value }))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="Ví dụ: Hội Đồng Y Khoa Pet M&M"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tóm tắt ngắn (hiển thị ngoài danh sách thẻ card):
                    </label>
                    <textarea
                      rows={2}
                      value={editingArticle.mo_ta_ngan || ''}
                      onChange={(e) => setEditingArticle((prev) => ({ ...prev, mo_ta_ngan: e.target.value }))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-none leading-relaxed"
                      placeholder="Tóm tắt ngắn gọn 1-2 câu về nội dung bài viết..."
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#2D5A27]" />
                        <span>Nội dung chi tiết bài viết (Tiếng Việt):</span>
                      </label>
                      {editingArticle.id && (
                        <Link
                          href={`/kien-thuc/${editingArticle.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 transition"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Xem trang ngoài web</span>
                        </Link>
                      )}
                    </div>
                    <RichTextEditor
                      key={`article-editor-vi-${editingArticle.id || 'new'}`}
                      value={editingArticle.noi_dung || ''}
                      onChange={(html) => setEditingArticle((prev) => ({ ...prev, noi_dung: html }))}
                      minHeight={340}
                      onUploadImage={async (file) => {
                        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
                        const filePath = `articles/content_${Date.now()}_${Math.random()
                          .toString(36)
                          .substring(2, 6)}.${fileExt}`;
                        const { error } = await supabase.storage
                          .from('hinh_anh')
                          .upload(filePath, file, { cacheControl: '3600', upsert: true });
                        if (error) throw error;
                        const { data: urlData } = supabase.storage.from('hinh_anh').getPublicUrl(filePath);
                        return urlData.publicUrl;
                      }}
                    />
                  </div>
                </div>
              ) : (
                /* TAB TIẾNG ANH */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Article Title (English): <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={(editingArticle as any).tieu_de_en || ''}
                      onChange={(e) => setEditingArticle((prev) => ({ ...prev, tieu_de_en: e.target.value } as any))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                      placeholder="e.g. Comprehensive Vaccination Schedule for Dogs and Cats 2026..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Category (English):
                      </label>
                      <input
                        type="text"
                        value={(editingArticle as any).chuyen_muc_en || ''}
                        onChange={(e) => setEditingArticle((prev) => ({ ...prev, chuyen_muc_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. Preventive Medicine"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Author / Medical Team (English):
                      </label>
                      <input
                        type="text"
                        value={(editingArticle as any).tac_gia_en || ''}
                        onChange={(e) => setEditingArticle((prev) => ({ ...prev, tac_gia_en: e.target.value } as any))}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                        placeholder="e.g. Pet M&M Medical Board"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Short Excerpt (English):
                    </label>
                    <textarea
                      rows={2}
                      value={(editingArticle as any).mo_ta_ngan_en || ''}
                      onChange={(e) => setEditingArticle((prev) => ({ ...prev, mo_ta_ngan_en: e.target.value } as any))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none resize-none leading-relaxed"
                      placeholder="Brief 1-2 sentence overview in English..."
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#2D5A27]" />
                        <span>Detailed Article Content (English):</span>
                      </label>
                    </div>
                    <RichTextEditor
                      key={`article-editor-en-${editingArticle.id || 'new'}`}
                      value={(editingArticle as any).noi_dung_en || ''}
                      onChange={(html) => setEditingArticle((prev) => ({ ...prev, noi_dung_en: html } as any))}
                      minHeight={340}
                      onUploadImage={async (file) => {
                        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
                        const filePath = `articles/content_${Date.now()}_${Math.random()
                          .toString(36)
                          .substring(2, 6)}.${fileExt}`;
                        const { error } = await supabase.storage
                          .from('hinh_anh')
                          .upload(filePath, file, { cacheControl: '3600', upsert: true });
                        if (error) throw error;
                        const { data: urlData } = supabase.storage.from('hinh_anh').getPublicUrl(filePath);
                        return urlData.publicUrl;
                      }}
                    />
                  </div>
                </div>
              )}

              {/* COMMON FIELDS */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ảnh bìa bài viết:
                  </label>
                  <AdminImageInput
                    value={editingArticle.hinh_anh || ''}
                    onChange={(url) => setEditingArticle((prev) => ({ ...prev, hinh_anh: url }))}
                    folder="articles"
                    label=""
                    uploadButtonLabel="Tải Ảnh Bìa"
                    pasteButtonLabel="Dán Link Ảnh"
                    onNotification={showNotification}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thời gian đọc dự kiến:
                    </label>
                    <input
                      type="text"
                      value={editingArticle.thoi_gian_doc || ''}
                      onChange={(e) => setEditingArticle((prev) => ({ ...prev, thoi_gian_doc: e.target.value }))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ngày đăng bài:
                    </label>
                    <input
                      type="text"
                      value={editingArticle.ngay_dang || ''}
                      onChange={(e) => setEditingArticle((prev) => ({ ...prev, ngay_dang: e.target.value }))}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Thứ tự hiển thị:
                    </label>
                    <input
                      type="number"
                      value={editingArticle.thu_tu ?? 0}
                      onChange={(e) =>
                        setEditingArticle((prev) => ({
                          ...prev,
                          thu_tu: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 text-slate-800 focus:border-[#2D5A27] focus:outline-none"
                    />
                  </div>

                  <div className="pt-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingArticle.kich_hoat !== false}
                        onChange={(e) => setEditingArticle((prev) => ({ ...prev, kich_hoat: e.target.checked }))}
                        className="w-4 h-4 rounded text-[#2D5A27] focus:ring-[#2D5A27]"
                      />
                      <span className="text-xs font-semibold text-slate-700">Kích hoạt hiển thị ngoài website</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingArticle(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isArticleSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isArticleSaving ? 'Đang lưu...' : 'Lưu Bài Viết'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}