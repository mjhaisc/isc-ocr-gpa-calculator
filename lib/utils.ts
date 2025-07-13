import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getLocalStorageCount = (key: string): number => {
  if (typeof window === "undefined") return 0;
  const value = localStorage.getItem(key);
  return value ? parseInt(value, 10) : 0;
};

export const calculatePercentageChange = (current: number, previous: number): string => {
  if (previous === 0) return "+0%"; // Avoid division by zero
  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(change);
  return (rounded >= 0 ? "+" : "") + rounded + "%";
};