import type { ApiMember } from "@/lib/api";

/**
 * Fuzzy roster search.
 *
 * Roster size is ~50 today and won't grow past ~200, so a deps-free weighted
 * score beats pulling in Fuse.js (~10 KB). Each candidate gets a score from
 * the sum of:
 *   - +120 if any token of the query is a *prefix* of fullName
 *   - +60  if any token is a *substring* of fullName
 *   - +30  if the query matches the member's initials (e.g. "es" → Ewaldo Santana)
 *   - +20  if the query is a substring of slug
 *   - +10  if the query is a substring of email
 * We then filter score > 0 and sort descending. The single full-scan pass is
 * O(N · |q|) per keystroke — well under a millisecond at this scale.
 *
 * For larger rosters: switch to Fuse.js or build a Trie over (fullName +
 * initials) at mount time and do a prefix walk on each keystroke.
 */
export interface RankedMember {
  member: ApiMember;
  score: number;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    // Strip diacritics so "joao" matches "João" and "andre" matches "André".
    .replace(/[̀-ͯ]/g, "");

function memberInitials(fullName: string): string {
  const parts = fullName
    .replace(/^(Ph\.?D|Dr\.?|Prof\.?)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]![0]!.toLowerCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toLowerCase();
}

export function scoreMember(member: ApiMember, query: string): number {
  const q = norm(query.trim());
  if (!q) return 1; // empty query = include everyone, no ordering signal
  const name = norm(member.fullName);
  const slug = norm(member.slug);
  const email = norm(member.email ?? "");
  const init = memberInitials(member.fullName);

  let score = 0;
  // Word-prefix hits weigh strongest — "ewa" should rank Ewaldo above
  // any name that merely contains "ewa".
  for (const word of name.split(/\s+/)) {
    if (word.startsWith(q)) score += 120;
  }
  if (name.includes(q)) score += 60;
  if (q.length <= 4 && init === q) score += 30;
  if (slug.includes(q)) score += 20;
  if (email && email.includes(q)) score += 10;
  return score;
}

export function searchMembers(members: readonly ApiMember[], query: string, limit = 50): RankedMember[] {
  const ranked = members
    .map((m) => ({ member: m, score: scoreMember(m, query) }))
    .filter((r) => r.score > 0);
  ranked.sort((a, b) => b.score - a.score || a.member.fullName.localeCompare(b.member.fullName));
  return ranked.slice(0, limit);
}
