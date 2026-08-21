import { useQuery } from "@tanstack/react-query";
import { fetchMembers, type ApiMember } from "@/lib/api";
import { applyOverlay } from "@/lib/static-source";
import type { Tier, MemberStatus } from "@/lib/team-data";

const ROLE_TO_TIER: Record<string, Tier> = {
  HEAD: "head",
  COLLABORATOR: "collaborator",
  DOCTORATE: "doctorate",
  MASTER: "master",
  UNDERGRAD: "undergrad",
};

/**
 * Roster row shaped for the team page. Carries both API field names
 * (id, fullName, photoUrl, currentRole) and the legacy TeamMember names
 * (uuid, photo, tier, status) so the existing JSX in /team keeps compiling
 * without a coordinated rename.
 */
export interface RosterMember {
  // API
  id: string;
  slug: string;
  fullName: string;
  currentRole: ApiMember["currentRole"];
  photoUrl: string | null;
  status: ApiMember["status"];
  // Legacy aliases used by /team views
  uuid: string;
  tier: Tier;
  photo: string | null;
}

/**
 * Roster pulled from the API and decorated with bundled photos from
 * static-source.ts. The roster is small (~50 members) so the whole list is
 * fetched in one round trip and cached for 5 minutes.
 */
export function useTeamRoster() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
    staleTime: 5 * 60 * 1000,
  });

  const decorated = data ? applyOverlay(data) : [];
  const members: RosterMember[] = decorated.map((m) => ({
    id: m.id,
    slug: m.slug,
    fullName: m.fullName,
    currentRole: m.currentRole,
    photoUrl: m.photoUrl,
    status: m.status as MemberStatus,
    uuid: m.id,
    tier: ROLE_TO_TIER[m.currentRole] ?? "undergrad",
    photo: m.photoUrl,
  }));

  const tierCounts: Record<Tier, number> = {
    head:        members.filter((m) => m.tier === "head").length,
    collaborator: members.filter((m) => m.tier === "collaborator").length,
    doctorate:   members.filter((m) => m.tier === "doctorate").length,
    master:      members.filter((m) => m.tier === "master").length,
    undergrad:   members.filter((m) => m.tier === "undergrad").length,
  };

  return {
    members,
    tierCounts,
    isLoading,
    error,
    fromApi: true,
  };
}
