import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Removes Cloudflare CDN image optimization parameters from image URLs
 * @param url - The image URL that may contain CDN transformation parameters
 * @returns The cleaned URL without CDN transformation parameters
 */
export function cleanImageUrl(url: string | null | undefined): string | null | undefined {
  if (!url) return url;
  
  // Remove Cloudflare CDN transformation parameters
  return url.replace(/\/cdn-cgi\/image\/[^\/]+/, '');
}
