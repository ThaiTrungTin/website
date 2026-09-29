/**
 * Utility to resolve asset URLs correctly across Localhost, Vercel (root domain),
 * and GitHub Pages (hosted under /website subdirectory).
 */
export function getAssetUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  const isGithubPages =
    process.env.GITHUB_ACTIONS === 'true' ||
    (typeof window !== 'undefined' && (
      window.location.pathname.startsWith('/website') ||
      window.location.hostname.includes('github.io')
    ));

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  if (!isGithubPages) {
    // If not GitHub Pages (e.g. localhost or Vercel root domain), remove /website prefix if present
    return cleanPath.startsWith('/website/') ? cleanPath.replace(/^\/website/, '') : cleanPath;
  }

  // On GitHub Pages, ensure it starts with /website
  if (cleanPath.startsWith('/website/')) {
    return cleanPath;
  }
  return `/website${cleanPath}`;
}

/**
 * Chuyển đổi mọi định dạng link Google Maps (Place link, địa chỉ) thành
 * link Universal Directions chỉ đường thực tế (tương tự bấm icon mũi tên xanh chỉ đường).
 */
export function getDirectionsUrl(
  url?: string | null,
  address?: string | null,
  name?: string | null
): string {
  if (url) {
    const trimmed = url.trim();
    // Nếu đã là link chỉ đường (chứa /dir/ hoặc daddr=)
    if (trimmed.includes('/maps/dir/') || trimmed.includes('daddr=')) {
      return trimmed;
    }

    // Nếu là link xem địa điểm /maps/place/... -> chuyển thành link chỉ đường
    if (trimmed.includes('/maps/place/')) {
      const parts = trimmed.split('/maps/place/')[1];
      if (parts) {
        const placePart = parts.split('/')[0];
        const decodedPlace = decodeURIComponent(placePart).replace(/\+/g, ' ');
        const dest = address ? `${decodedPlace}, ${address}` : decodedPlace;
        return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
      }
    }
  }

  // Fallback từ Tên chi nhánh + Địa chỉ
  const dest = [name, address].filter(Boolean).join(', ');
  if (dest) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
  }

  return url || '';
}
