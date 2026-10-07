'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  ClipboardPaste,
  Crop,
  RotateCw,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Check,
  X,
  Move,
  Maximize2,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AdminInteractiveCropperProps {
  value: string; // URL ảnh sau cắt (áp dụng để hiển thị)
  originalUrl?: string; // URL ảnh gốc nguyên bản
  onChange: (url: string) => void; // Cập nhật ảnh hiển thị
  onOriginalChange?: (url: string) => void; // Cập nhật ảnh gốc
  onPreviewChange?: (previewUrl: string) => void;
  folder: 'banners' | 'branches' | 'services' | 'general' | 'articles' | 'careers';
  aspectRatio?: number; // e.g. 16/10 for about slides
  onNotification?: (type: 'success' | 'error', message: string) => void;
  className?: string;
  label?: string;
}

interface CropRect {
  x: number; // 0 to 1 (fraction of image display width)
  y: number; // 0 to 1
  width: number; // 0 to 1
  height: number; // 0 to 1
}

type DragMode = 'move' | 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | null;

export default function AdminInteractiveCropper({
  value,
  originalUrl,
  onChange,
  onOriginalChange,
  onPreviewChange,
  folder,
  aspectRatio = 16 / 10,
  onNotification,
  className = '',
  label,
}: AdminInteractiveCropperProps) {
  // Source image state: prefer originalUrl if provided, else value
  const [sourceUrl, setSourceUrl] = useState<string>(originalUrl || value || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [hasAppliedCrop, setHasAppliedCrop] = useState(false);

  // Zoom & Rotation
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Crop rectangle state (percentages: 0 to 1)
  const [crop, setCrop] = useState<CropRect>({
    x: 0.05,
    y: 0.05,
    width: 0.9,
    height: 0.9 / aspectRatio,
  });

  // Dragging state
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; crop: CropRect } | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Đồng bộ ảnh gốc khi mở modal chỉnh sửa đối tượng mới hoặc cập nhật từ bên ngoài
  useEffect(() => {
    if (originalUrl) {
      setSourceUrl(originalUrl);
    } else if (value && !sourceUrl) {
      setSourceUrl(value);
    }
  }, [originalUrl]);

  // Adjust default crop rect once image is loaded to fit aspect ratio
  const handleImageLoad = () => {
    const img = imageRef.current;
    if (!img) return;
    const imgAspect = img.naturalWidth / img.naturalHeight;

    let w = 0.9;
    let h = 0.9;
    if (aspectRatio) {
      if (imgAspect > aspectRatio) {
        // Image is wider than desired aspect
        h = 0.88;
        w = Math.min(0.95, (h * aspectRatio) / imgAspect);
      } else {
        // Image is taller than desired aspect
        w = 0.88;
        h = Math.min(0.95, (w * imgAspect) / aspectRatio);
      }
    }

    setCrop({
      x: (1 - w) / 2,
      y: (1 - h) / 2,
      width: w,
      height: h,
    });
    setHasAppliedCrop(false);
  };

  // Upload a file or blob to Supabase Storage
  const uploadBlob = async (blob: Blob, prefix = 'cropped'): Promise<string> => {
    const cleanFileName = `${folder}_${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.jpg`;
    const filePath = `${folder}/${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from('hinh_anh')
      .upload(filePath, blob, { contentType: 'image/jpeg', cacheControl: '3600', upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from('hinh_anh').getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  };

  // Handle file chosen from disk
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onNotification?.('error', 'Chỉ chấp nhận tệp hình ảnh (JPG, PNG, WebP)!');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setSourceUrl(objectUrl);
    setZoom(1);
    setRotation(0);
    setHasAppliedCrop(false);

    try {
      setIsUploading(true);
      const permUrl = await uploadBlob(file, 'original');
      setSourceUrl(permUrl);
      onOriginalChange?.(permUrl);
      onChange(permUrl);
      onPreviewChange?.(permUrl);
      onNotification?.('success', 'Đã tải ảnh lên! Hãy kéo khung ô vuông để cắt vùng hiển thị ưng ý.');
    } catch (err: any) {
      console.error(err);
      onNotification?.('error', 'Lỗi tải ảnh lên đám mây: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Ctrl+V paste
  const handlePaste = useCallback(
    async (e: React.ClipboardEvent | ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            const objectUrl = URL.createObjectURL(file);
            setSourceUrl(objectUrl);
            setZoom(1);
            setRotation(0);
            setHasAppliedCrop(false);

            try {
              setIsUploading(true);
              const permUrl = await uploadBlob(file, 'pasted');
              setSourceUrl(permUrl);
              onOriginalChange?.(permUrl);
              onChange(permUrl);
              onPreviewChange?.(permUrl);
              onNotification?.('success', 'Đã dán ảnh thành công! Bạn có thể kéo ô vuông để căn chỉnh vùng hiển thị.');
            } catch (err: any) {
              onNotification?.('error', 'Lỗi lưu ảnh dán: ' + err.message);
            } finally {
              setIsUploading(false);
            }
            return;
          }
        }
      }
    },
    [folder, onChange, onOriginalChange, onPreviewChange, onNotification]
  );

  // Button: Dán ảnh từ clipboard
  const handlePasteButtonClick = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.read) {
      try {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
          const imageType = item.types.find((t) => t.startsWith('image/'));
          if (imageType) {
            const blob = await item.getType(imageType);
            const objectUrl = URL.createObjectURL(blob);
            setSourceUrl(objectUrl);
            setZoom(1);
            setRotation(0);
            setHasAppliedCrop(false);

            setIsUploading(true);
            try {
              const permUrl = await uploadBlob(blob, 'pasted');
              setSourceUrl(permUrl);
              onOriginalChange?.(permUrl);
              onChange(permUrl);
              onPreviewChange?.(permUrl);
              onNotification?.('success', 'Đã dán ảnh từ clipboard! Hãy chỉnh các ô vuông để cắt ảnh.');
            } catch (err: any) {
              onNotification?.('error', 'Lỗi lưu ảnh: ' + err.message);
            } finally {
              setIsUploading(false);
            }
            return;
          }
        }
      } catch (err) {
        console.warn('Clipboard read error:', err);
      }
    }
    onNotification?.('error', 'Hãy bấm vào đây và nhấn phím Ctrl+V để dán ảnh!');
  };

  // Nút: Xóa ảnh
  const handleClearImage = () => {
    setSourceUrl('');
    setZoom(1);
    setRotation(0);
    setHasAppliedCrop(false);
    onChange('');
    onOriginalChange?.('');
    onPreviewChange?.('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onNotification?.('success', 'Đã xóa ảnh.');
  };

  // Real-time Live Preview Generator: khi cắt ở bên trái thì bên phải hiển thị ảnh cắt trực quan
  const generateLivePreview = useCallback(() => {
    const img = imageRef.current;
    if (!img || !sourceUrl || !onPreviewChange) return;

    try {
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;
      if (!naturalW || !naturalH) return;

      const isRotated = rotation % 180 !== 0;
      const srcW = isRotated ? naturalH : naturalW;
      const srcH = isRotated ? naturalW : naturalH;

      const cropX = Math.max(0, Math.min(srcW, crop.x * srcW));
      const cropY = Math.max(0, Math.min(srcH, crop.y * srcH));
      const cropW = Math.max(10, Math.min(srcW - cropX, crop.width * srcW));
      const cropH = Math.max(10, Math.min(srcH - cropY, crop.height * srcH));

      const previewCanvas = document.createElement('canvas');
      const targetW = 640;
      const targetH = Math.round(targetW / aspectRatio);
      previewCanvas.width = targetW;
      previewCanvas.height = targetH;
      const ctx = previewCanvas.getContext('2d');
      if (!ctx) return;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'medium';

      if (rotation !== 0) {
        const rotCanvas = document.createElement('canvas');
        rotCanvas.width = srcW;
        rotCanvas.height = srcH;
        const rotCtx = rotCanvas.getContext('2d');
        if (rotCtx) {
          rotCtx.translate(srcW / 2, srcH / 2);
          rotCtx.rotate((rotation * Math.PI) / 180);
          rotCtx.drawImage(img, -naturalW / 2, -naturalH / 2);
          ctx.drawImage(rotCanvas, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);
        }
      } else {
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);
      }

      const dataUrl = previewCanvas.toDataURL('image/jpeg', 0.85);
      onPreviewChange(dataUrl);
    } catch {
      // Ignore cross-origin canvas security errors
    }
  }, [crop, rotation, aspectRatio, onPreviewChange, sourceUrl]);

  useEffect(() => {
    if (sourceUrl) {
      const animId = requestAnimationFrame(generateLivePreview);
      return () => cancelAnimationFrame(animId);
    }
  }, [crop, zoom, rotation, sourceUrl, generateLivePreview]);

  // Perform client-side canvas crop & upload
  const handleApplyCrop = async () => {
    const img = imageRef.current;
    if (!img) return;

    setIsCropping(true);
    try {
      // Calculate crop box in natural image pixel coordinates
      const naturalW = img.naturalWidth;
      const naturalH = img.naturalHeight;

      // When rotation is 90 or 270 deg, dimensions swap
      const isRotated = rotation % 180 !== 0;
      const srcW = isRotated ? naturalH : naturalW;
      const srcH = isRotated ? naturalW : naturalH;

      const cropX = Math.max(0, Math.min(srcW, crop.x * srcW));
      const cropY = Math.max(0, Math.min(srcH, crop.y * srcH));
      const cropW = Math.max(10, Math.min(srcW - cropX, crop.width * srcW));
      const cropH = Math.max(10, Math.min(srcH - cropY, crop.height * srcH));

      // Target high quality output canvas
      const targetW = 1280;
      const targetH = Math.round(targetW / aspectRatio);

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Không thể tạo canvas context 2D');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // If rotation applied, transform canvas
      if (rotation !== 0) {
        // Draw rotated image onto intermediate canvas first
        const rotCanvas = document.createElement('canvas');
        rotCanvas.width = srcW;
        rotCanvas.height = srcH;
        const rotCtx = rotCanvas.getContext('2d');
        if (rotCtx) {
          rotCtx.translate(srcW / 2, srcH / 2);
          rotCtx.rotate((rotation * Math.PI) / 180);
          rotCtx.drawImage(img, -naturalW / 2, -naturalH / 2);

          // Now crop from rotated canvas
          ctx.drawImage(rotCanvas, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);
        }
      } else {
        // Direct crop
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);
      }

      // Convert to blob
      const croppedBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('Canvas toBlob failed'));
          },
          'image/jpeg',
          0.92
        );
      });

      // Upload to Supabase Storage
      const croppedPublicUrl = await uploadBlob(croppedBlob, 'cropped');
      // ĐẶC BIỆT: GIỮ NGUYÊN sourceUrl (ảnh gốc bên trái) để sau này muốn chỉnh quay lại chỉnh!
      onChange(croppedPublicUrl);
      onPreviewChange?.(croppedPublicUrl);
      setHasAppliedCrop(true);
      onNotification?.('success', 'Đã lưu và áp dụng ảnh sau cắt! Ảnh gốc bên trái vẫn được giữ nguyên vẹn để căn chỉnh lại.');
    } catch (err: any) {
      console.error('Crop error:', err);
      onNotification?.('error', `Lỗi cắt ảnh: ${err.message || 'Lỗi không xác định'}`);
    } finally {
      setIsCropping(false);
    }
  };

  // Khôi phục về ảnh gốc nếu muốn hủy bỏ bản cắt
  const handleRevertToOriginal = () => {
    if (sourceUrl) {
      onChange(sourceUrl);
      onPreviewChange?.(sourceUrl);
      setHasAppliedCrop(false);
      onNotification?.('success', 'Đã khôi phục ảnh hiển thị về ảnh gốc ban đầu!');
    }
  };

  // Mouse & Touch Dragging Handlers
  const handleMouseDown = (mode: DragMode, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragMode(mode);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      crop: { ...crop },
    };
  };

  useEffect(() => {
    if (!dragMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const dx = (e.clientX - dragStartRef.current.clientX) / rect.width;
      const dy = (e.clientY - dragStartRef.current.clientY) / rect.height;
      const initial = dragStartRef.current.crop;

      setCrop((prev) => {
        let { x, y, width, height } = { ...initial };

        if (dragMode === 'move') {
          // Pan the crop box
          x = Math.max(0, Math.min(1 - width, initial.x + dx));
          y = Math.max(0, Math.min(1 - height, initial.y + dy));
        } else {
          // Resize handles
          if (dragMode.includes('e')) {
            width = Math.max(0.15, Math.min(1 - x, initial.width + dx));
          }
          if (dragMode.includes('s')) {
            height = Math.max(0.15, Math.min(1 - y, initial.height + dy));
          }
          if (dragMode.includes('w')) {
            const newW = Math.max(0.15, Math.min(initial.x + initial.width, initial.width - dx));
            x = initial.x + (initial.width - newW);
            width = newW;
          }
          if (dragMode.includes('n')) {
            const newH = Math.max(0.15, Math.min(initial.y + initial.height, initial.height - dy));
            y = initial.y + (initial.height - newH);
            height = newH;
          }

          // Optional: maintain aspect ratio while resizing corners
          if (aspectRatio && (dragMode === 'se' || dragMode === 'nw' || dragMode === 'ne' || dragMode === 'sw')) {
            const currentImgAspect = imageRef.current
              ? imageRef.current.naturalWidth / imageRef.current.naturalHeight
              : 1;
            const targetH = (width * currentImgAspect) / aspectRatio;
            if (y + targetH <= 1) {
              height = targetH;
            }
          }
        }

        return { x, y, width, height };
      });
    };

    const handleMouseUp = () => {
      setDragMode(null);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragMode, aspectRatio]);

  return (
    <div className={`space-y-3 ${className}`} onPaste={handlePaste}>
      {/* Tiêu đề khu vực cắt ảnh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
            <Crop className="w-3.5 h-3.5 text-[#2D5A27]" />
            <span>{label || 'Căn Chỉnh & Cắt Ảnh Hiển Thị'}</span>
          </label>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
            <span>📷 Khung Cắt Ảnh Gốc</span>
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-medium bg-white px-2 py-0.5 rounded-md border border-slate-200">
          Tỉ lệ {Math.abs(aspectRatio - 16 / 9) < 0.05 ? '16:9' : Math.abs(aspectRatio - 16 / 10) < 0.05 ? '16:10' : Math.abs(aspectRatio - 4 / 3) < 0.05 ? '4:3' : Math.abs(aspectRatio - 3 / 4) < 0.05 ? '3:4' : Math.abs(aspectRatio - 1) < 0.05 ? '1:1' : 'Tùy chỉnh'}
        </span>
      </div>

      {/* KHUNG HIỂN THỊ ẢNH & Ô VUÔNG CẮT CHỈNH (CỘT BÊN TRÁI) */}
      <div
        ref={containerRef}
        style={{ aspectRatio: `${aspectRatio}` }}
        className="relative w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-300 shadow-inner flex items-center justify-center select-none group max-h-[380px]"
      >
        {sourceUrl ? (
          <>
            {/* Ảnh nguồn */}
            <img
              ref={imageRef}
              src={sourceUrl}
              alt="Source crop"
              crossOrigin="anonymous"
              onLoad={handleImageLoad}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: dragMode ? 'none' : 'transform 0.15s ease',
              }}
              className="max-w-full max-h-full object-contain pointer-events-none"
            />

            {/* Lớp phủ mờ ngoài vùng cắt (Backdrop shadow) */}
            <div
              style={{
                left: `${crop.x * 100}%`,
                top: `${crop.y * 100}%`,
                width: `${crop.width * 100}%`,
                height: `${crop.height * 100}%`,
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.65)',
              }}
              onMouseDown={(e) => handleMouseDown('move', e)}
              className="absolute border-2 border-emerald-400 cursor-move z-20 transition-colors"
            >
              {/* LƯỚI 9 Ô VUÔNG (QUY TẮC 1/3) */}
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                <div className="border-r border-b border-white/30"></div>
                <div className="border-r border-b border-white/30"></div>
                <div className="border-b border-white/30"></div>
                <div className="border-r border-b border-white/30"></div>
                <div className="border-r border-b border-white/30"></div>
                <div className="border-b border-white/30"></div>
                <div className="border-r border-white/30"></div>
                <div className="border-r border-white/30"></div>
                <div></div>
              </div>

              {/* TÂM CĂN KÉO VỊ TRÍ */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-60 transition pointer-events-none">
                <div className="p-1 rounded-full bg-black/60 text-white">
                  <Move className="w-4 h-4" />
                </div>
              </div>

              {/* 8 Ô VUÔNG CĂN CHỈNH Ở 4 GÓC & 4 CẠNH */}
              {/* 4 góc */}
              <div
                onMouseDown={(e) => handleMouseDown('nw', e)}
                className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-[#2D5A27] rounded-[2px] shadow-md cursor-nwse-resize z-30 hover:scale-125 transition-transform"
                title="Kéo góc trên trái"
              />
              <div
                onMouseDown={(e) => handleMouseDown('ne', e)}
                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-[#2D5A27] rounded-[2px] shadow-md cursor-nesw-resize z-30 hover:scale-125 transition-transform"
                title="Kéo góc trên phải"
              />
              <div
                onMouseDown={(e) => handleMouseDown('sw', e)}
                className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-[#2D5A27] rounded-[2px] shadow-md cursor-nesw-resize z-30 hover:scale-125 transition-transform"
                title="Kéo góc dưới trái"
              />
              <div
                onMouseDown={(e) => handleMouseDown('se', e)}
                className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-[#2D5A27] rounded-[2px] shadow-md cursor-nwse-resize z-30 hover:scale-125 transition-transform"
                title="Kéo góc dưới phải"
              />

              {/* 4 cạnh */}
              <div
                onMouseDown={(e) => handleMouseDown('n', e)}
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-[#2D5A27] rounded-[2px] shadow-md cursor-ns-resize z-30 hover:scale-125 transition-transform"
                title="Kéo mép trên"
              />
              <div
                onMouseDown={(e) => handleMouseDown('s', e)}
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-[#2D5A27] rounded-[2px] shadow-md cursor-ns-resize z-30 hover:scale-125 transition-transform"
                title="Kéo mép dưới"
              />
              <div
                onMouseDown={(e) => handleMouseDown('w', e)}
                className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-[#2D5A27] rounded-[2px] shadow-md cursor-ew-resize z-30 hover:scale-125 transition-transform"
                title="Kéo mép trái"
              />
              <div
                onMouseDown={(e) => handleMouseDown('e', e)}
                className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-[#2D5A27] rounded-[2px] shadow-md cursor-ew-resize z-30 hover:scale-125 transition-transform"
                title="Kéo mép phải"
              />
            </div>
          </>
        ) : (
          /* TRƯỜNG HỢP CHƯA CÓ ẢNH */
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-slate-900 transition w-full h-full text-slate-400 space-y-2"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-amber-400 flex items-center justify-center border border-slate-700">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-300">
              Nhấp để tải ảnh hoặc nhấn <span className="text-amber-400 font-bold">Ctrl+V</span> để dán ảnh
            </p>
            <p className="text-[11px] text-slate-500">Hỗ trợ JPG, PNG, WebP (Tối đa 25MB)</p>
          </div>
        )}

        {/* Trạng thái đang tải lên hoặc đang cắt */}
        {(isUploading || isCropping) && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center z-40 text-white gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs font-bold">{isCropping ? 'Đang cắt ảnh chuẩn tỉ lệ...' : 'Đang tải ảnh lên...'}</span>
          </div>
        )}
      </div>

      {/* THANH CÔNG CỤ ĐIỀU KHIỂN & CẮT ẢNH */}
      <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
        {/* Hàng 1: Nút Tải file + Dán ảnh + Zoom + Xoay */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Cụm Nạp ảnh */}
          <div className="flex items-center gap-1.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isCropping}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2D5A27] hover:bg-[#23481e] text-white text-xs font-bold shadow-2xs transition cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Tải Ảnh</span>
            </button>

            <button
              type="button"
              onClick={handlePasteButtonClick}
              disabled={isUploading || isCropping}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition cursor-pointer disabled:opacity-50"
              title="Dán ảnh từ bộ nhớ tạm"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-amber-700" />
              <span>Dán</span>
            </button>

            {sourceUrl && (
              <button
                type="button"
                onClick={handleClearImage}
                disabled={isUploading || isCropping}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                title="Xóa bỏ ảnh hiện tại"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Xóa Ảnh</span>
              </button>
            )}
          </div>

          {/* Cụm Zoom & Xoay */}
          {sourceUrl && (
            <div className="flex items-center gap-2">
              {/* Nút Xoay 90 độ */}
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer"
                title="Xoay ảnh 90 độ"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>

              {/* Zoom slider */}
              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
                  className="text-slate-500 hover:text-slate-800 cursor-pointer"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-slate-700 w-9 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.1).toFixed(1))))}
                  className="text-slate-500 hover:text-slate-800 cursor-pointer"
                  title="Phóng to"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hàng 2: Trạng thái & Nút ÁP DỤNG */}
        {sourceUrl && (
          <div className="pt-2.5 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-slate-500">
                Kéo <strong>các ô vuông</strong> để chỉnh khung cắt, ảnh bên phải cập nhật xem trước trực tiếp.
              </span>
              {value && sourceUrl && value !== sourceUrl && (
                <button
                  type="button"
                  onClick={handleRevertToOriginal}
                  className="text-[10px] font-bold text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-md border border-amber-300 transition cursor-pointer"
                  title="Dùng lại ảnh gốc nguyên bản làm ảnh hiển thị"
                >
                  Khôi phục ảnh gốc
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleApplyCrop}
              disabled={isCropping || isUploading}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50 ${
                hasAppliedCrop
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              {isCropping ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : hasAppliedCrop ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                <Crop className="w-3.5 h-3.5" />
              )}
              <span>{isCropping ? 'Đang xử lý...' : hasAppliedCrop ? 'Đã áp dụng cắt' : 'Áp Dụng Cắt'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
