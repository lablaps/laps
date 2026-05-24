// Frontend asset overlay. The API is now the source of truth for member +
// project records (see ./api.ts) — this file only adds bundled assets keyed
// by slug:
//   - hashed asset URLs for member photos (Vite import → /assets/<hash>.jpg)
//   - tag chips that we haven't promoted to the database yet
//
// Keeping photos in the bundle avoids the "Render free-tier disk doesn't
// persist" problem for the seeded roster. Anything uploaded later via the
// admin UI lives at /uploads/* and the API photoUrl wins over this overlay.

import type { ApiMember } from "./api";
import { resolveMediaUrl } from "./api";
import { team as seedTeam } from "./team-data";

const overlay = new Map(
  seedTeam.map((m) => [
    m.id,
    {
      photoUrl: m.photo ?? null,
      tags: m.tags ?? [],
      areas: m.areas ?? [],
      primaryArea: m.primaryArea ?? null,
    },
  ]),
);

/** Photo from team-data.ts, if the API photoUrl is empty. */
export function decoratePhotoUrl(m: ApiMember): string | null {
  if (m.photoUrl && m.photoUrl.length > 0) return resolveMediaUrl(m.photoUrl) ?? null;
  return overlay.get(m.slug)?.photoUrl ?? null;
}

/** Tags from team-data.ts (the API doesn't carry them yet). */
export function decorateTags(m: ApiMember): string[] {
  return overlay.get(m.slug)?.tags ?? [];
}

/** Secondary research areas + primary area, keyed by slug. */
export function decorateAreas(m: ApiMember) {
  const o = overlay.get(m.slug);
  return {
    primaryArea: o?.primaryArea ?? null,
    areas: o?.areas ?? [],
  };
}

/** Apply photo overlay to a full roster in one pass. */
export function applyOverlay(members: ApiMember[]): ApiMember[] {
  return members.map((m) => ({ ...m, photoUrl: decoratePhotoUrl(m) }));
}
