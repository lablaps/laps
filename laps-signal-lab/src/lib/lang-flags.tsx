import { type ReactNode } from "react";
import { type Lang } from "@/lib/i18n";

/**
 * The three flags for the site language switcher.
 *
 * These lived inline in PublicLayout, so /join — which renders its own
 * switcher outside the public layout — had grown a second, hand-drawn set that
 * was simply wrong at the size it was displayed:
 *
 *   pt  a green rect beside a yellow rect (the flag is a yellow *lozenge* on a
 *       green field, not a split), with an off-centre circle at cx=9 of 20.
 *   en  a Union Jack whose diagonals were `stroke`d at widths 3 and 5 on a
 *       20x15 viewBox — a third of the flag's height — and never clipped to
 *       the rectangle, so at ~20px it rendered as a white asterisk. It was
 *       also the wrong country: every other page uses the US flag for English.
 *   fr  bands of 7/6/7 on a 20-wide box, so the tricolour was uneven.
 *
 * One exported definition instead of two copies is the actual fix: a switcher
 * added on some future page inherits the correct flags rather than a third
 * hand-drawing.
 *
 * Rendered in full colour. Callers grey them out for the inactive state via a
 * `saturate(0)` filter on the parent, so these must stay vivid here.
 * Dimensions are tuned to sit on the same baseline as the PT/EN/FR labels.
 */
export const LANG_FLAGS: Record<Lang, ReactNode> = {
  pt: (
    <svg
      viewBox="0 0 24 16"
      className="h-3.5 w-5 shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
    >
      <rect width="24" height="16" fill="#009C3B" />
      <polygon points="12,2 22,8 12,14 2,8" fill="#FFDF00" />
      <circle cx="12" cy="8" r="3" fill="#002776" />
    </svg>
  ),
  en: (
    <svg
      viewBox="0 0 60 40"
      className="h-3.5 w-5 shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
    >
      <rect width="60" height="40" fill="#FFFFFF" />
      {/* 7 red stripes — stripes 1, 3, 5, 7, 9, 11, 13 of the 13-stripe field. */}
      <rect y="0" width="60" height="3.08" fill="#B22234" />
      <rect y="6.15" width="60" height="3.08" fill="#B22234" />
      <rect y="12.31" width="60" height="3.08" fill="#B22234" />
      <rect y="18.46" width="60" height="3.08" fill="#B22234" />
      <rect y="24.62" width="60" height="3.08" fill="#B22234" />
      <rect y="30.77" width="60" height="3.08" fill="#B22234" />
      <rect y="36.92" width="60" height="3.08" fill="#B22234" />
      {/* Blue canton — sized to overlay the top 7 stripes. */}
      <rect width="24" height="21.54" fill="#3C3B6E" />
    </svg>
  ),
  fr: (
    <svg
      viewBox="0 0 24 16"
      className="h-3.5 w-5 shrink-0 rounded-[2px] shadow-[0_0_0_1px_rgba(0,0,0,0.15)]"
    >
      <rect width="8" height="16" fill="#002776" />
      <rect x="8" width="8" height="16" fill="#FFFFFF" />
      <rect x="16" width="8" height="16" fill="#ED2939" />
    </svg>
  ),
};
