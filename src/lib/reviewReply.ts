/**
 * Utility quản lý phản hồi đánh giá của bệnh viện thú y PetM&M
 * Hỗ trợ lưu trữ và đồng bộ phản hồi trực tiếp vào bảng danh_gia (bao gồm song ngữ VI/EN)
 */

export interface ReviewReplyData {
  reply: string;
  reply_en?: string;
  replier: string;
  date?: string;
}

const REPLY_TAG_REGEX = /\[PETMM_REPLY:([\s\S]*?)\]/;

/**
 * Trích xuất dữ liệu phản hồi từ bản ghi đánh giá
 */
export function parseReviewReply(
  rev?: { noi_dung_en?: string | null; phan_hoi?: string | null } | null
): ReviewReplyData | null {
  if (!rev) return null;

  // 1. Kiểm tra nếu trong tương lai Supabase có cột phan_hoi riêng
  if (rev.phan_hoi && typeof rev.phan_hoi === 'string' && rev.phan_hoi.trim()) {
    try {
      const parsed = JSON.parse(rev.phan_hoi);
      if (parsed && typeof parsed.reply === 'string' && parsed.reply.trim()) {
        return {
          reply: parsed.reply.trim(),
          reply_en: parsed.reply_en ? String(parsed.reply_en).trim() : undefined,
          replier: parsed.replier?.trim() || 'PetM&M',
          date: parsed.date || '',
        };
      }
    } catch {
      return {
        reply: rev.phan_hoi.trim(),
        replier: 'PetM&M',
        date: '',
      };
    }
  }

  // 2. Trích xuất từ tag [PETMM_REPLY:{...}] được nhúng trong noi_dung_en
  if (rev.noi_dung_en && typeof rev.noi_dung_en === 'string') {
    const match = rev.noi_dung_en.match(REPLY_TAG_REGEX);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1]);
        if (parsed && typeof parsed.reply === 'string' && parsed.reply.trim()) {
          return {
            reply: parsed.reply.trim(),
            reply_en: parsed.reply_en ? String(parsed.reply_en).trim() : undefined,
            replier: parsed.replier?.trim() || 'PetM&M',
            date: parsed.date || '',
          };
        }
      } catch (e) {
        console.warn('Lỗi phân tích tag PETMM_REPLY:', e);
      }
    }
  }

  return null;
}

/**
 * Loại bỏ tag [PETMM_REPLY:...] khỏi chuỗi để hiển thị nội dung nguyên bản
 */
export function stripReplyTag(text?: string | null): string {
  if (!text) return '';
  return text.replace(REPLY_TAG_REGEX, '').trim();
}

/**
 * Gắn hoặc xóa tag [PETMM_REPLY:...] trong noi_dung_en
 */
export function attachReplyTag(
  existingNoiDungEn: string | null | undefined,
  replyData: { reply: string; reply_en?: string; replier?: string; date?: string } | null
): string | null {
  const cleanBase = stripReplyTag(existingNoiDungEn);

  if (!replyData || !replyData.reply || !replyData.reply.trim()) {
    return cleanBase || null;
  }

  const payload: ReviewReplyData = {
    reply: replyData.reply.trim(),
    reply_en: replyData.reply_en?.trim() || undefined,
    replier: replyData.replier?.trim() || 'PetM&M',
    date: replyData.date?.trim() || new Date().toISOString().split('T')[0],
  };

  const tag = `[PETMM_REPLY:${JSON.stringify(payload)}]`;
  return cleanBase ? `${cleanBase}\n\n${tag}` : tag;
}
