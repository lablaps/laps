import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, type ApiMember } from "@/lib/api";

/**
 * The full member roster as the console sees it (unredacted, manager-only).
 *
 * One query function for the ["admin", "members"] key. The console page caches
 * GET /api/v1/admin/members there — rows shaped { member, flags } — while the
 * project researcher picker and the publication author picker used the same
 * key with GET /api/v1/members, which returns a page ({ content }). React Query
 * serves whichever response is already cached, and the page's always is, so
 * both pickers read `.content` off an array, got an empty roster, and every
 * search came back with no results. A key must have exactly one fetcher and
 * one shape; this hook is it.
 */
export function useAdminRoster() {
  const query = useQuery({
    queryKey: ["admin", "members"],
    queryFn: () => api.admin.members(),
    staleTime: 30_000,
  });
  const members: ApiMember[] = useMemo(
    () => (query.data ?? []).map((row) => row.member),
    [query.data],
  );
  return { ...query, members };
}
