import type { ReactNode } from "react";
import type { CountryCode } from "./exchange-data";

export const FLAGS: Record<CountryCode, ReactNode> = {
  FR: (
    <svg viewBox="0 0 60 40" className="h-full w-full">
      <rect width="20" height="40" x="0" fill="#0055A4" />
      <rect width="20" height="40" x="20" fill="#FFFFFF" />
      <rect width="20" height="40" x="40" fill="#EF4135" />
    </svg>
  ),
  CA: (
    <svg viewBox="0 0 60 40" className="h-full w-full">
      <rect width="15" height="40" x="0" fill="#D52B1E" />
      <rect width="30" height="40" x="15" fill="#FFFFFF" />
      <rect width="15" height="40" x="45" fill="#D52B1E" />
      <path
        d="M30 11 L31.7 14.2 L35 13.5 L33.6 16.4 L36 18.5 L33 19.3 L33.6 22 L30 21 L26.4 22 L27 19.3 L24 18.5 L26.4 16.4 L25 13.5 L28.3 14.2 Z"
        fill="#D52B1E"
      />
    </svg>
  ),
  PT: (
    <svg viewBox="0 0 60 40" className="h-full w-full">
      <rect width="24" height="40" x="0" fill="#006600" />
      <rect width="36" height="40" x="24" fill="#FF0000" />
      <circle cx="24" cy="20" r="6.5" fill="#FFFF00" stroke="#000" strokeWidth="0.6" />
      <circle cx="24" cy="20" r="3.2" fill="#FFFFFF" stroke="#000" strokeWidth="0.4" />
    </svg>
  ),
  IT: (
    <svg viewBox="0 0 60 40" className="h-full w-full">
      <rect width="20" height="40" x="0" fill="#009246" />
      <rect width="20" height="40" x="20" fill="#FFFFFF" />
      <rect width="20" height="40" x="40" fill="#CE2B37" />
    </svg>
  ),
};
