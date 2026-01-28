import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number | string | null | undefined, decimals: number = 2): string {
  const num = Number(value) || 0;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function getPublicUrl(path: string | null | undefined, bucket: string = 'expenses'): string | null {
  if (!path || path === "0" || path === "") return null;
  
  // 1. If it's already a full non-Supabase URL
  if (path.startsWith('http') && !path.includes('supabase.co')) {
    return path;
  }

  // 2. Extract path if it's already a Supabase URL
  let cleanPath = path;
  if (path.includes('supabase.co')) {
    const parts = path.split(`/public/${bucket}/`);
    if (parts.length > 1) {
      cleanPath = decodeURIComponent(parts[1]);
    }
  }

  // 3. Normalize path (remove leading slash)
  cleanPath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
  
  // 4. Determine if it's Supabase or Hostinger
  const isSupabase = cleanPath.includes('uploads/') || /^\d{10}/.test(cleanPath) || path.includes('supabase.co');

  if (isSupabase) {
    const fullPath = cleanPath.startsWith('uploads/') ? cleanPath : 'uploads/' + cleanPath;
    const encodedKey = fullPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    return `https://xaexoopjqkrzhbochbef.supabase.co/storage/v1/object/public/${bucket}/${encodedKey}`;
  }

  // 5. Fallback to Hostinger
  const finalEncodedPath = cleanPath.split('/').map(s => encodeURIComponent(s)).join('/');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  return `${baseUrl}/${finalEncodedPath}`;
}
