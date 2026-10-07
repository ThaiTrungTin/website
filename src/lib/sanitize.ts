import DOMPurify from 'isomorphic-dompurify';

/**
 * Làm sạch chuỗi HTML nhằm ngăn chặn triệt để lỗ hổng XSS (Cross-Site Scripting).
 * Loại bỏ các thẻ script, sự kiện on* nguy hiểm (onerror, onclick, onload...)
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ADD_ATTR: ['target', 'rel', 'class', 'style'],
  });
}
