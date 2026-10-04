'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Upload, Check } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats, CameraDevice } from 'html5-qrcode';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
}

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
}: BarcodeScannerModalProps) {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [scanError, setScanError] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [hasScanned, setHasScanned] = useState<boolean>(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerId = 'petmm-barcode-scanner-region';

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setHasScanned(false);
    setScanError('');
    setIsInitializing(true);

    const initScanner = async () => {
      try {
        const scanner = new Html5Qrcode(containerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.CODE_93,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          verbose: false,
        });
        scannerRef.current = scanner;

        // Lấy danh sách camera
        const devices = await Html5Qrcode.getCameras();
        if (!isMounted) return;

        if (!devices || devices.length === 0) {
          setScanError('Không tìm thấy camera trên thiết bị này. Bạn có thể tải ảnh hóa đơn lên.');
          setIsInitializing(false);
          return;
        }

        setCameras(devices);

        // Ưu tiên camera sau (back / environment camera) trên mobile
        const backCamera = devices.find(
          (d) =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('rear') ||
            d.label.toLowerCase().includes('environment')
        );
        const targetCameraId = backCamera ? backCamera.id : devices[0].id;
        setSelectedCameraId(targetCameraId);

        // Bắt đầu quét
        await scanner.start(
          targetCameraId,
          {
            fps: 15,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              return {
                width: Math.floor(viewfinderWidth * 0.85),
                height: Math.floor(minEdge * 0.45),
              };
            },
          },
          (decodedText) => {
            if (!isMounted) return;
            handleDetectedCode(decodedText);
          },
          () => {
            // Đang quét khung hình (không cần log lỗi)
          }
        );

        if (isMounted) {
          setIsInitializing(false);
        }
      } catch (err: any) {
        console.error('Barcode scanner start error:', err);
        if (isMounted) {
          setScanError(
            err.name === 'NotAllowedError'
              ? 'Trình duyệt chưa được cấp quyền truy cập Camera. Vui lòng bật quyền Camera hoặc tải ảnh chụp hóa đơn.'
              : 'Không thể khởi động Camera. Bạn có thể tải ảnh chụp hóa đơn lên.'
          );
          setIsInitializing(false);
        }
      }
    };

    // Chờ DOM render element id container
    const timer = setTimeout(() => {
      initScanner();
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => {
              scannerRef.current?.clear();
              scannerRef.current = null;
            }).catch(() => {
              scannerRef.current = null;
            });
          } else {
            scannerRef.current.clear();
            scannerRef.current = null;
          }
        } catch {
          scannerRef.current = null;
        }
      }
    };
  }, [isOpen]);

  // Xử lý khi quét trúng mã
  const handleDetectedCode = (code: string) => {
    if (hasScanned) return;
    setHasScanned(true);

    // Rung nhẹ trên điện thoại nếu hỗ trợ
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(150);
      } catch {}
    }

    // Dừng quét
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(() => {}).finally(() => {
        onScanSuccess(code.trim());
        onClose();
      });
    } else {
      onScanSuccess(code.trim());
      onClose();
    }
  };

  // Đổi camera (trước/sau)
  const handleSwitchCamera = async () => {
    if (!scannerRef.current || cameras.length < 2) return;
    try {
      setIsInitializing(true);
      const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
      const nextIndex = (currentIndex + 1) % cameras.length;
      const nextCamera = cameras[nextIndex];
      setSelectedCameraId(nextCamera.id);

      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      await scannerRef.current.start(
        nextCamera.id,
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            return {
              width: Math.floor(viewfinderWidth * 0.85),
              height: Math.floor(minEdge * 0.45),
            };
          },
        },
        (decodedText) => handleDetectedCode(decodedText),
        () => {}
      );
      setIsInitializing(false);
    } catch (err: any) {
      console.error('Switch camera error:', err);
      setIsInitializing(false);
    }
  };

  // Quét từ tệp ảnh tải lên
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !scannerRef.current) return;

    try {
      setIsInitializing(true);
      setScanError('');
      const decodedText = await scannerRef.current.scanFile(file, true);
      handleDetectedCode(decodedText);
    } catch (err: any) {
      console.error('Scan file error:', err);
      setScanError('Không nhận diện được mã vạch trong ảnh này. Vui lòng chụp rõ hơn.');
    } finally {
      setIsInitializing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-[#0C1E10] border border-white/20 p-5 sm:p-6 shadow-2xl text-white relative overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Quét Mã Vạch Hóa Đơn</h3>
              <p className="text-[11px] text-slate-300">Hướng camera vào mã vạch (Barcode / QR)</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scanner Container */}
        <div className="relative rounded-2xl overflow-hidden bg-black/60 border border-white/15 min-h-[260px] sm:min-h-[300px] flex items-center justify-center">
          <div id={containerId} className="w-full h-full" />

          {/* Guide laser animation line */}
          {!isInitializing && !scanError && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-[85%] h-[120px] sm:h-[140px] border-2 border-[#FFB800]/70 rounded-xl relative shadow-[0_0_20px_rgba(255,184,0,0.25)]">
                {/* 4 corner brackets */}
                <span className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-[#FFB800]" />
                <span className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-[#FFB800]" />
                <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-[#FFB800]" />
                <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-[#FFB800]" />
                {/* Moving red/gold laser beam */}
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#FFB800] to-transparent animate-pulse top-1/2 -translate-y-1/2 shadow-[0_0_8px_#FFB800]" />
              </div>
              <p className="text-[11px] text-white/80 bg-black/70 px-3 py-1 rounded-full mt-3 font-medium">
                Căn chỉnh mã vạch nằm trọn trong khung
              </p>
            </div>
          )}

          {/* Loading spinner */}
          {isInitializing && (
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2.5 z-20">
              <div className="w-8 h-8 border-3 border-[#FFB800] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-300">Đang bật Camera...</p>
            </div>
          )}

          {/* Error message */}
          {scanError && (
            <div className="absolute inset-0 bg-black/90 p-5 flex flex-col items-center justify-center text-center gap-3 z-20">
              <AlertCircle className="w-10 h-10 text-rose-400" />
              <p className="text-xs sm:text-sm text-slate-200 max-w-xs">{scanError}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Tải ảnh hóa đơn từ máy</span>
              </button>
            </div>
          )}
        </div>

        {/* Bottom controls */}
        <div className="mt-4 flex items-center justify-between gap-2">
          {/* Nút đổi camera nếu có >= 2 camera */}
          {cameras.length > 1 && (
            <button
              type="button"
              onClick={handleSwitchCamera}
              disabled={isInitializing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Đổi Camera</span>
            </button>
          )}

          {/* Nút tải ảnh lên */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-slate-200 transition-colors ml-auto cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Tải ảnh lên</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileScan}
          />
        </div>
      </div>
    </div>
  );
}
