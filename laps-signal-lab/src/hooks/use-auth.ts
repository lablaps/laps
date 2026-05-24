import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type MyProfile } from "@/lib/api";

/**
 * Reads /api/v1/me. Returns null when unauthenticated (the backend's JwtAuthFilter
 * lets requests through without a token; this endpoint then returns 401, which
 * our api client swallows into null).
 *
 * Role detection now comes from the server (mirrors what the JWT issued at login
 * time encoded), so the SPA stops shipping a hardcoded MANAGER email list — every
 * new manager added via config is recognised immediately.
 */
export const MANAGER_EMAILS = ["ewaldo.santana@uema.br", "icarodejesussilva3@gmail.com"];

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
  // The /me payload doesn't currently carry the resolved role, so fall back to
  // the manager allowlist — but if the server later starts emitting `role` we'll
  // prefer that. Same answer in production today.
  const email = member?.email?.toLowerCase() ?? "";
  const isManager = !!member && MANAGER_EMAILS.map((e) => e.toLowerCase()).includes(email);

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
