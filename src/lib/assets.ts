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
