import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const currencyFormatter = (currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  });

export const kmFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1
});

// Remote image allowlist should mirror next.config.mjs images.remotePatterns hostnames
export const allowedImageHosts = new Set<string>([
  "images.unsplash.com",
  "maps.gstatic.com"
]);

export function isAllowedRemoteImage(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return allowedImageHosts.has(parsed.hostname);
  } catch {
    return false;
  }
}
