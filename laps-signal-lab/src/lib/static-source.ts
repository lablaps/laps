// Frontend data overlay. The API is the source of truth for member + project
// records (see ./api.ts) — this file only adds metadata keyed by slug that
// hasn't been promoted to the database yet (tag chips, research areas).
//
// Photos are NOT overlaid any more. The bundled member portraits were removed
// from src/assets/, so a member's avatar comes from the API alone: an uploaded
// file under /uploads/*, or nothing, in which case the UI falls back to the
// member's initials.

import type { ApiMember } from "./api";
import { resolveMediaUrl } from "./api";
import { team as seedTeam } from "./team-data";

const overlay = new Map(
  seedTeam.map((m) => [
    m.id,
    {
      tags: m.tags ?? [],
      areas: m.areas ?? [],
      primaryArea: m.primaryArea ?? null,
    },
  ]),
);

/** Member photo, resolved from the API only. Null means "render initials". */
export function decoratePhotoUrl(m: ApiMember): string | null {
  if (m.photoUrl && m.photoUrl.length > 0) return resolveMediaUrl(m.photoUrl) ?? null;
  return null;
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
