import React from 'react';

export interface SloganTickerItem {
  id: string;
  textVi: string;
  textEn?: string;
  startDate?: string; // Định dạng YYYY-MM-DD
  endDate?: string;   // Định dạng YYYY-MM-DD
  isActive?: boolean;
}

export const DEFAULT_SLOGAN_ITEMS: SloganTickerItem[] = [
  {
    id: 'slogan-default-1',
    textVi: 'Không gian y khoa chuẩn mực hòa cùng liệu pháp phục hồi thiên nhiên.',
    textEn: 'Standardized veterinary medicine combined with natural recovery therapies.',
    startDate: '',
    endDate: '',
    isActive: true,
  },
  {
    id: 'slogan-default-2',
    textVi: 'Nơi tình thương thuần khiết hòa quyện cùng công nghệ điều trị tiên tiến nhất thế giới, cho bé cưng hồi phục thể chất và an yên tâm trí.',
    textEn: 'Where pure love blends with state-of-the-art medical technology to restore physical vitality and soothe peace of mind.',
    startDate: '',
    endDate: '',
    isActive: true,
  },
];

/**
 * Phân tích chuỗi lưu trong database thành danh sách thông điệp
 */
export function parseSloganList(val?: string, valEn?: string): SloganTickerItem[] {
  if (!val || !val.trim()) {
    return DEFAULT_SLOGAN_ITEMS;
  }
  const str = val.trim();
  if (str.startsWith('[')) {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item, idx) => ({
          id: item.id || `slogan-${idx + 1}`,
          textVi: item.textVi || '',
          textEn: item.textEn || '',
          startDate: item.startDate || '',
          endDate: item.endDate || '',
          isActive: item.isActive !== false,
        }));
      }
    } catch {}
  }

  // Dữ liệu text cũ
  return [
    {
      id: 'slogan-legacy-1',
      textVi: str,
      textEn: valEn || '',
      startDate: '',
      endDate: '',
      isActive: true,
    },
  ];
}

/**
 * Kiểm tra xem thông điệp có đang hoạt động trong ngày hôm nay không
 */
export function isSloganActive(item: SloganTickerItem, now: Date = new Date()): boolean {
  if (item.isActive === false) return false;
  if (!item.startDate && !item.endDate) return true;

  // Lấy ngày hiện tại theo giờ Việt Nam UTC+7
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(now);

  if (item.startDate && today < item.startDate) return false;
  if (item.endDate && today > item.endDate) return false;

  return true;
}

/**
 * Tách chuỗi và bọc các icon / emoji (🎁, 📅, 🔔, 🧧, ⭐, 🏥, 💉, 🩺...)
 * vào span với class .petmm-icon-shake để tạo hiệu ứng rung rung lắc lư sinh động.
 */
export function renderWithShakingIcons(text: string): React.ReactNode {
  if (!text) return null;

  const emojiRegex = /(\p{Extended_Pictographic}|\p{Emoji_Presentation}|[\u2600-\u27BF])/gu;
  const parts = text.split(emojiRegex);

  if (parts.length <= 1) {
    return text;
  }

  return parts.map((part, index) => {
    if (emojiRegex.test(part)) {
      return (
        <span
          key={index}
          className="petmm-icon-shake inline-block select-none mx-1 text-base sm:text-lg align-middle"
          style={{ transformOrigin: 'center center' }}
        >
          {part}
        </span>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
