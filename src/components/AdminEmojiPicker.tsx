'use client';

import React, { useState } from 'react';
import { Smile, X, Search, Sparkles } from 'lucide-react';

export type AdminEmojiCategory =
  | 'all'
  | 'faces'
  | 'nature'
  | 'numbers'
  | 'flags'
  | 'promo'
  | 'medical'
  | 'schedule'
  | 'pets';

export interface AdminEmojiItem {
  icon: string;
  label: string;
  category: AdminEmojiCategory;
  flagCode?: string;
}

export const ADMIN_EMOJIS_LIST: AdminEmojiItem[] = [
  // 1. Mặt cười & Cảm xúc (faces)
  { icon: '😀', label: 'Cười tươi', category: 'faces' },
  { icon: '😃', label: 'Vui vẻ', category: 'faces' },
  { icon: '😄', label: 'Hạnh phúc', category: 'faces' },
  { icon: '😁', label: 'Cười toe toét', category: 'faces' },
  { icon: '😆', label: 'Cười tít mắt', category: 'faces' },
  { icon: '🥰', label: 'Đáng yêu', category: 'faces' },
  { icon: '😍', label: 'Thích mê', category: 'faces' },
  { icon: '🤩', label: 'Ngưỡng mộ', category: 'faces' },
  { icon: '😘', label: 'Hôn gió', category: 'faces' },
  { icon: '😋', label: 'Ngon miệng', category: 'faces' },
  { icon: '😜', label: 'Nháy mắt trêu', category: 'faces' },
  { icon: '😎', label: 'Ngầu ngầu', category: 'faces' },
  { icon: '🥳', label: 'Tiệc tùng ăn mừng', category: 'faces' },
  { icon: '🤗', label: 'Ôm chào', category: 'faces' },
  { icon: '🤔', label: 'Suy nghĩ', category: 'faces' },
  { icon: '🤫', label: 'Suỵt bí mật', category: 'faces' },
  { icon: '🤭', label: 'Bịt miệng cười', category: 'faces' },
  { icon: '😇', label: 'Thiên thần', category: 'faces' },
  { icon: '😺', label: 'Mèo cười', category: 'faces' },
  { icon: '😻', label: 'Mèo yêu', category: 'faces' },
  { icon: '🥺', label: 'Năn nỉ xin xỏ', category: 'faces' },
  { icon: '👍', label: 'Thích (Like)', category: 'faces' },
  { icon: '👏', label: 'Vỗ tay tán thưởng', category: 'faces' },
  { icon: '🙌', label: 'Hoan hô', category: 'faces' },
  { icon: '🤝', label: 'Bắt tay hợp tác', category: 'faces' },
  { icon: '✌️', label: 'Chiến thắng (Peace)', category: 'faces' },
  { icon: '👌', label: 'Tuyệt vời', category: 'faces' },
  { icon: '💪', label: 'Cố lên khỏe khoắn', category: 'faces' },
  { icon: '🙏', label: 'Cảm ơn chân thành', category: 'faces' },
  { icon: '💖', label: 'Trái tim rực rỡ', category: 'faces' },
  { icon: '❤️', label: 'Trái tim đỏ', category: 'faces' },

  // 2. Cây cỏ & Thiên nhiên (nature)
  { icon: '🌿', label: 'Nhánh lá xanh', category: 'nature' },
  { icon: '🍀', label: 'Cỏ 4 lá may mắn', category: 'nature' },
  { icon: '🌱', label: 'Mầm cây non', category: 'nature' },
  { icon: '🍃', label: 'Lá bay trong gió', category: 'nature' },
  { icon: '🌸', label: 'Hoa anh đào', category: 'nature' },
  { icon: '🌺', label: 'Hoa dâm bụt', category: 'nature' },
  { icon: '🌻', label: 'Hoa hướng dương', category: 'nature' },
  { icon: '🌼', label: 'Hoa cúc vàng', category: 'nature' },
  { icon: '🌷', label: 'Hoa tulip', category: 'nature' },
  { icon: '💐', label: 'Bó hoa tươi', category: 'nature' },
  { icon: '🌴', label: 'Cây cọ nhiệt đới', category: 'nature' },
  { icon: '🌲', label: 'Cây thông', category: 'nature' },
  { icon: '🌳', label: 'Cây cổ thụ', category: 'nature' },
  { icon: '🍂', label: 'Lá vàng mùa thu', category: 'nature' },
  { icon: '🍁', label: 'Lá phong đỏ', category: 'nature' },
  { icon: '🌾', label: 'Cành bông lúa', category: 'nature' },
  { icon: '🍄', label: 'Cây nấm nhỏ', category: 'nature' },
  { icon: '☀️', label: 'Mặt trời ấm áp', category: 'nature' },
  { icon: '🌈', label: 'Cầu vồng rực rỡ', category: 'nature' },
  { icon: '🌊', label: 'Sóng biển', category: 'nature' },
  { icon: '💧', label: 'Giọt nước trong lành', category: 'nature' },
  { icon: '🌍', label: 'Trái đất xanh', category: 'nature' },

  // 3. Số & Ký hiệu (numbers)
  { icon: '1️⃣', label: 'Số 1', category: 'numbers' },
  { icon: '2️⃣', label: 'Số 2', category: 'numbers' },
  { icon: '3️⃣', label: 'Số 3', category: 'numbers' },
  { icon: '4️⃣', label: 'Số 4', category: 'numbers' },
  { icon: '5️⃣', label: 'Số 5', category: 'numbers' },
  { icon: '6️⃣', label: 'Số 6', category: 'numbers' },
  { icon: '7️⃣', label: 'Số 7', category: 'numbers' },
  { icon: '8️⃣', label: 'Số 8', category: 'numbers' },
  { icon: '9️⃣', label: 'Số 9', category: 'numbers' },
  { icon: '🔟', label: 'Số 10', category: 'numbers' },
  { icon: '0️⃣', label: 'Số 0', category: 'numbers' },
  { icon: '🔢', label: 'Dãy số', category: 'numbers' },
  { icon: '#️⃣', label: 'Thẻ thăng', category: 'numbers' },
  { icon: '*️⃣', label: 'Dấu hoa thị', category: 'numbers' },
  { icon: '✅', label: 'Dấu tích xanh', category: 'numbers' },
  { icon: '❌', label: 'Dấu chéo đỏ', category: 'numbers' },
  { icon: '✔️', label: 'Dấu kiểm', category: 'numbers' },
  { icon: '⭕', label: 'Vòng tròn đỏ', category: 'numbers' },
  { icon: '❗', label: 'Chấm than đỏ', category: 'numbers' },
  { icon: '‼️', label: 'Hai chấm than', category: 'numbers' },
  { icon: '❓', label: 'Dấu hỏi chấm', category: 'numbers' },
  { icon: '➕', label: 'Dấu cộng', category: 'numbers' },
  { icon: '⭐', label: 'Ngôi sao vàng', category: 'numbers' },
  { icon: '🌟', label: 'Sao lấp lánh', category: 'numbers' },
  { icon: '💫', label: 'Vòng sao xoay', category: 'numbers' },
  { icon: '✨', label: 'Ánh sáng lấp lánh', category: 'numbers' },

  // 4. Lá cờ các quốc gia thực tế (flags)
  { icon: '🇻🇳', label: 'Việt Nam (Cờ đỏ sao vàng)', category: 'flags', flagCode: 'vn' },
  { icon: '🇺🇸', label: 'Hoa Kỳ (USA / Mỹ)', category: 'flags', flagCode: 'us' },
  { icon: '🇬🇧', label: 'Vương Quốc Anh (UK)', category: 'flags', flagCode: 'gb' },
  { icon: '🇯🇵', label: 'Nhật Bản (Japan)', category: 'flags', flagCode: 'jp' },
  { icon: '🇰🇷', label: 'Hàn Quốc (Korea)', category: 'flags', flagCode: 'kr' },
  { icon: '🇫🇷', label: 'Pháp (France)', category: 'flags', flagCode: 'fr' },
  { icon: '🇩🇪', label: 'Đức (Germany)', category: 'flags', flagCode: 'de' },
  { icon: '🇮🇹', label: 'Ý (Italy)', category: 'flags', flagCode: 'it' },
  { icon: '🇪🇸', label: 'Tây Ban Nha (Spain)', category: 'flags', flagCode: 'es' },
  { icon: '🇦🇺', label: 'Úc (Australia)', category: 'flags', flagCode: 'au' },
  { icon: '🇨🇦', label: 'Canada', category: 'flags', flagCode: 'ca' },
  { icon: '🇸🇬', label: 'Singapore', category: 'flags', flagCode: 'sg' },
  { icon: '🇹🇭', label: 'Thái Lan (Thailand)', category: 'flags', flagCode: 'th' },
  { icon: '🇲🇾', label: 'Malaysia', category: 'flags', flagCode: 'my' },
  { icon: '🇮🇩', label: 'Indonesia', category: 'flags', flagCode: 'id' },
  { icon: '🇵🇭', label: 'Philippines', category: 'flags', flagCode: 'ph' },
  { icon: '🇱🇦', label: 'Lào (Laos)', category: 'flags', flagCode: 'la' },
  { icon: '🇰🇭', label: 'Campuchia (Cambodia)', category: 'flags', flagCode: 'kh' },
  { icon: '🇨🇳', label: 'Trung Quốc (China)', category: 'flags', flagCode: 'cn' },
  { icon: '🇹🇼', label: 'Đài Loan (Taiwan)', category: 'flags', flagCode: 'tw' },
  { icon: '🇷🇺', label: 'Nga (Russia)', category: 'flags', flagCode: 'ru' },
  { icon: '🇨🇭', label: 'Thụy Sĩ (Switzerland)', category: 'flags', flagCode: 'ch' },
  { icon: '🇳🇱', label: 'Hà Lan (Netherlands)', category: 'flags', flagCode: 'nl' },
  { icon: '🇸🇪', label: 'Thụy Điển (Sweden)', category: 'flags', flagCode: 'se' },
  { icon: '🇧🇷', label: 'Brazil', category: 'flags', flagCode: 'br' },
  { icon: '🇦🇷', label: 'Argentina', category: 'flags', flagCode: 'ar' },
  { icon: '🇮🇳', label: 'Ấn Độ (India)', category: 'flags', flagCode: 'in' },
  { icon: '🇵🇹', label: 'Bồ Đào Nha (Portugal)', category: 'flags', flagCode: 'pt' },
  { icon: '🇳🇿', label: 'New Zealand', category: 'flags', flagCode: 'nz' },
  { icon: '🚩', label: 'Cờ tam giác đỏ', category: 'flags' },
  { icon: '🏁', label: 'Cờ ca-rô về đích', category: 'flags' },
  { icon: '🎌', label: 'Cờ chéo lễ hội', category: 'flags' },
  { icon: '⛳', label: 'Cờ sân golf', category: 'flags' },
  { icon: '🏳️‍🌈', label: 'Cờ cầu vồng', category: 'flags' },

  // 5. Khuyến mãi & Quà tặng (promo)
  { icon: '🎁', label: 'Hộp quà tặng', category: 'promo' },
  { icon: '🧧', label: 'Bao lì xì đỏ', category: 'promo' },
  { icon: '🏷️', label: 'Thẻ giá giảm giá', category: 'promo' },
  { icon: '🛍️', label: 'Túi mua sắm', category: 'promo' },
  { icon: '🔥', label: 'Đang hot hừng hực', category: 'promo' },
  { icon: '⚡', label: 'Chớp nhoáng chớp deal', category: 'promo' },
  { icon: '💯', label: '100 điểm tuyệt đối', category: 'promo' },
  { icon: '🎉', label: 'Pháo hoa tiệc tùng', category: 'promo' },
  { icon: '🎯', label: 'Trúng đích', category: 'promo' },
  { icon: '🏆', label: 'Cúp vàng danh dự', category: 'promo' },
  { icon: '👑', label: 'Vương miện số 1', category: 'promo' },
  { icon: '💥', label: 'Bùng nổ ưu đãi', category: 'promo' },
  { icon: '💰', label: 'Túi tiền tài lộc', category: 'promo' },
  { icon: '💵', label: 'Tiền mặt', category: 'promo' },
  { icon: '🎫', label: 'Vé voucher ưu đãi', category: 'promo' },

  // 6. Y tế & Phòng khám (medical)
  { icon: '🏥', label: 'Bệnh viện thú y', category: 'medical' },
  { icon: '💉', label: 'Tiêm phòng vaccine', category: 'medical' },
  { icon: '🩺', label: 'Ống nghe khám bệnh', category: 'medical' },
  { icon: '💊', label: 'Thuốc đặc trị', category: 'medical' },
  { icon: '🚑', label: 'Xe cấp cứu khẩn cấp', category: 'medical' },
  { icon: '🩹', label: 'Băng cá nhân', category: 'medical' },
  { icon: '🔬', label: 'Kính hiển vi xét nghiệm', category: 'medical' },
  { icon: '🧬', label: 'Chuỗi ADN gen', category: 'medical' },
  { icon: '🩻', label: 'Ảnh chụp X-Quang', category: 'medical' },
  { icon: '🩸', label: 'Mẫu xét nghiệm máu', category: 'medical' },
  { icon: '⚕️', label: 'Biểu tượng ngành y', category: 'medical' },
  { icon: '🧑‍⚕️', label: 'Bác sĩ chuyên môn', category: 'medical' },

  // 7. Lịch hẹn & Thông báo (schedule)
  { icon: '📅', label: 'Lịch hẹn khám', category: 'schedule' },
  { icon: '🔔', label: 'Chuông thông báo', category: 'schedule' },
  { icon: '⏰', label: 'Đồng hồ báo thức', category: 'schedule' },
  { icon: '📢', label: 'Loa thông báo lớn', category: 'schedule' },
  { icon: '🚨', label: 'Đèn báo động khẩn', category: 'schedule' },
  { icon: '📌', label: 'Ghim lưu ý quan trọng', category: 'schedule' },
  { icon: '💡', label: 'Ý tưởng mẹo chăm sóc', category: 'schedule' },
  { icon: '💬', label: 'Tư vấn trực tuyến', category: 'schedule' },
  { icon: '📣', label: 'Loa cầm tay', category: 'schedule' },
  { icon: '🛎️', label: 'Chuông gọi lễ tân', category: 'schedule' },
  { icon: '📞', label: 'Số hotline gọi ngay', category: 'schedule' },
  { icon: '✉️', label: 'Thư mời gửi khách', category: 'schedule' },

  // 8. Thú cưng & Động vật (pets)
  { icon: '🐶', label: 'Cún cưng đáng yêu', category: 'pets' },
  { icon: '🐱', label: 'Mèo cưng xinh xắn', category: 'pets' },
  { icon: '🐾', label: 'Dấu chân thú cưng', category: 'pets' },
  { icon: '🐰', label: 'Thỏ con ngộ nghĩnh', category: 'pets' },
  { icon: '🐹', label: 'Chuột Hamster', category: 'pets' },
  { icon: '🦜', label: 'Vẹt sặc sỡ', category: 'pets' },
  { icon: '🐟', label: 'Cá cảnh bơi lội', category: 'pets' },
  { icon: '🐢', label: 'Rùa cảnh', category: 'pets' },
  { icon: '🐩', label: 'Cún Poodle', category: 'pets' },
  { icon: '🐕', label: 'Chó giữ nhà', category: 'pets' },
  { icon: '🐈', label: 'Mèo con', category: 'pets' },
  { icon: '💝', label: 'Hộp quà tình yêu', category: 'pets' },
];

export interface AdminEmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEmoji: (emoji: string) => void;
  align?: 'left' | 'right';
  className?: string;
  title?: string;
}

export default function AdminEmojiPicker({
  isOpen,
  onClose,
  onSelectEmoji,
  align = 'right',
  className = '',
  title = 'Biểu tượng cảm xúc & Icon',
}: AdminEmojiPickerProps) {
  const [category, setCategory] = useState<AdminEmojiCategory>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all' as const, label: 'Tất cả' },
    { id: 'faces' as const, label: '😊 Cảm xúc' },
    { id: 'promo' as const, label: '🎁 Quà & Hot' },
    { id: 'nature' as const, label: '🌿 Cây & Lá' },
    { id: 'numbers' as const, label: '🔢 Số & Ký hiệu' },
    { id: 'flags' as const, label: '🚩 Lá cờ' },
    { id: 'medical' as const, label: '🏥 Y tế' },
    { id: 'schedule' as const, label: '📅 Lịch' },
    { id: 'pets' as const, label: '🐾 Thú cưng' },
  ];

  const filteredEmojis = ADMIN_EMOJIS_LIST.filter((emo) => {
    const matchCat = category === 'all' || emo.category === category;
    const matchSearch =
      !searchTerm.trim() ||
      emo.label.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      emo.icon.includes(searchTerm.trim());
    return matchCat && matchSearch;
  });

  return (
    <>
      {/* Backdrop đóng bảng chọn khi click ra ngoài */}
      <div
        className="fixed inset-0 z-40"
        onMouseDown={(e) => {
          e.preventDefault();
          onClose();
        }}
      />

      {/* Khung Popup Bảng Icon Phong Cách FB / Zalo */}
      <div
        className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 z-50 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 space-y-2.5 animate-in fade-in zoom-in-95 duration-150 select-none ${className}`}
      >
        {/* Header với Icon Mặt Cười phong cách FB/Zalo */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Smile className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-800 tracking-wide">{title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Đóng bảng icon"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ô Tìm Kiếm Nhanh */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm icon (mặt cười, lá cờ, cây lá, số, quà...)"
            className="w-full text-xs pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white transition"
          />
        </div>

        {/* Thanh Danh Mục Icon */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setCategory(cat.id)}
              className={`px-2 py-1 rounded-md text-[10px] font-bold whitespace-nowrap transition cursor-pointer ${
                category === cat.id
                  ? 'bg-[#2D5A27] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Lưới Icon Rung Rinh Sống Động */}
        <div className="grid grid-cols-8 gap-1.5 p-1 max-h-52 overflow-y-auto">
          {filteredEmojis.length > 0 ? (
            filteredEmojis.map((emo, idx) => (
              <button
                key={`${emo.icon}-${idx}`}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelectEmoji(emo.icon);
                }}
                className="h-8.5 rounded-lg bg-slate-50 hover:bg-amber-100 hover:border-amber-300 border border-slate-100 flex items-center justify-center text-base shadow-2xs transition-all active:scale-85 cursor-pointer hover:shadow-xs group overflow-hidden"
                title={emo.label}
              >
                {emo.flagCode ? (
                  <span className="flex items-center justify-center w-full h-full p-0.5">
                    <img
                      src={`https://flagcdn.com/w40/${emo.flagCode}.png`}
                      srcSet={`https://flagcdn.com/w80/${emo.flagCode}.png 2x`}
                      alt={emo.label}
                      className="w-6 h-4 object-cover rounded-[3px] shadow-xs border border-slate-200/80 group-hover:scale-125 transition-transform pointer-events-none"
                      loading="lazy"
                    />
                  </span>
                ) : (
                  <span className="petmm-icon-shake inline-block group-hover:scale-110 transition-transform">
                    {emo.icon}
                  </span>
                )}
              </button>
            ))
          ) : (
            <div className="col-span-8 py-6 text-center text-xs text-slate-400">
              Không tìm thấy icon phù hợp với từ khóa
            </div>
          )}
        </div>

        {/* Gợi ý chân bảng */}
        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <span>Nhấp để chèn tại vị trí con trỏ</span>
          <span className="text-amber-600 font-semibold">{filteredEmojis.length} biểu tượng</span>
        </div>
      </div>
    </>
  );
}
