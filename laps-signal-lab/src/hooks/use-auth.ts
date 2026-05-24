import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type MyProfile } from "@/lib/api";

/**
 * Reads /api/v1/me. Returns null when unauthenticated (the backend's JwtAuthFilter
 * lets requests through without a token; this endpoint then returns 401, which
 * our api client swallows into null).
 *
 * Role detection now comes from the server's `role` field (mirrors what the JWT
 * issued at login time encoded), so the SPA no longer ships a hardcoded MANAGER
 * email list — every new manager added via config is recognised immediately.
 */

export interface AuthState {
  member: MyProfile | null;
  isManager: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  mustChangePassword: boolean;
  emailVerified: boolean;
}

export function useAuth(): AuthState {
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.me(),
    staleTime: 10_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    retry: false,
  });

  const member = data ?? null;
  // Use the server-provided resolved security role. The backend checks
  // laps.managers.allowed-emails and encodes the result in the JWT — the /me
  // endpoint now surfaces it so we don't duplicate the allowlist here.
  const isManager = member?.role === "MANAGER";

  return {
    member,
    isManager,
    isAuthenticated: !!member,
    isLoading,
    mustChangePassword: !!member?.mustChangePassword,
    emailVerified: !!member?.emailVerified,
  };
}

export function useInvalidateAuth() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["me"] });
}
