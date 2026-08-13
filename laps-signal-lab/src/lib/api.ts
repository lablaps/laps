// Thin typed fetch client for the LAPS Spring Boot backend.
// JWT travels in an HttpOnly cookie set by /api/v1/auth/login → every request uses credentials:"include".

/**
 * Resolve the API base URL.
 *
 * Priority:
 *   1. VITE_API_BASE — explicit override (production split-host setups).
 *   2. Same-origin ("") — when the monolith serves the SPA and /api/v1/* from
 *      the same host (Render web service, docker-compose laps-app).
 *   3. http://<host>:8080 — when the SPA is loaded from a Vite dev server
 *      (port 5173) and the backend is on :8080. Detected at runtime.
 */
function resolveApiBase(): string {
  const fromEnv = import.meta.env.VITE_API_BASE as string | undefined;
  if (fromEnv !== undefined && fromEnv !== "") return fromEnv;
  if (typeof window !== "undefined" && window.location) {
    const port = window.location.port;
    // Vite dev server runs on :5173 by default; lovable sandbox uses other
    // ports too but the backend pairing is always :8080. Same-origin in every
    // other case — that's the monolith deploy.
    if (port && port !== "8080" && port !== "" && port !== "80" && port !== "443") {
      const proto = window.location.protocol === "https:" ? "https" : "http";
      return `${proto}://${window.location.hostname}:8080`;
    }
  }
  return "";
}

export const API_BASE = resolveApiBase();

/**
 * Convert a server-returned URL to one the browser can load.
 * The backend stores relative paths like "/uploads/uuid.jpg" — prepend
 * API_BASE so the request always hits the right host (avoids localhost:8080
 * hardcoded in the DB). Absolute URLs (external avatars, old data) pass through.
 */
export function resolveMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url}`;
}

export class ApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly body?: unknown) {
    super(message);
  }
}

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface RequestOpts {
  method?: Method;
  body?: unknown;
  signal?: AbortSignal;
  /** When true, 401 responses just return null instead of throwing. Useful for /me probes. */
  swallow401?: boolean;
}

async function request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const { method = "GET", body, signal, swallow401 = false } = opts;
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  if (res.status === 204) return undefined as T;
  if (res.status === 401 && swallow401) return null as T;

  const text = await res.text();
  let parsed: unknown = undefined;
  if (text.length > 0) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!res.ok) {
    const message =
      (parsed && typeof parsed === "object" && "message" in parsed && typeof parsed.message === "string"
        ? parsed.message
        : res.statusText) || `Request failed: ${res.status}`;
    throw new ApiError(res.status, message, parsed);
  }

  return parsed as T;
}

// ───── Types (mirror Spring DTOs) ─────

export type MemberRole =
  | "UNDERGRAD"
  | "MASTER"
  | "DOCTORATE"
  | "MANAGER"
  | "COORDINATOR"
  | "HEAD";
export type MemberStatusEnum = "ACTIVE" | "COMPLETED" | "INACTIVE";

export interface ApiMember {
  id: string;
  slug: string;
  fullName: string;
  email: string | null;
  currentRole: MemberRole;
  currentRoleStartedAt: string | null;
  status: MemberStatusEnum;
  bioPt: string | null;
  bioEn: string | null;
  bioFr: string | null;
  photoUrl: string | null;
  linkedinUrl: string | null;
  lattesUrl: string | null;
  githubUrl: string | null;
  contactEmail: string | null;
  /** Member-curated link (personal site, ORCID, ResearchGate…). */
  customUrl: string | null;
  /** Link text for customUrl; UI falls back to a generic caption when null. */
  customUrlLabel: string | null;
  /**
   * Per-field public visibility. Enforced server-side — when a flag is false the
   * matching value arrives as null for anonymous callers, so absence of the value
   * is the real signal. These flags exist so the owner (and managers) can render
   * the toggle state, not so the SPA can decide what to hide.
   */
  showEmail: boolean;
  showContactEmail: boolean;
  showLinkedin: boolean;
  showLattes: boolean;
  showGithub: boolean;
  showCustomUrl: boolean;
  roadmap: string | null;
  areas: string | null;
  interests: string | null;
  bannerColor: string | null;
  bannerImageUrl: string | null;
  exchangeCountry: string | null;
  /** Enum name from UndergradProgram; see lib/undergrad-programs.ts. Null when unknown. */
  undergradProgram: string | null;
  /** Academic period the member joined LAPS, "YYYY.1" | "YYYY.2". */
  joinedSemester: string | null;
  /** Month the member joined LAPS, ISO "YYYY-MM". No day component by design. */
  joinedMonth: string | null;
  languages: string | null;
  deletedAt: string | null;
}

export interface ApiResearchArea {
  id: number;
  slug: string;
  namePt: string;
  nameEn: string;
  nameFr: string;
  color: string;
}

export interface ApiGraphNode {
  id: string;
  kind: "member" | "area";
  label: string;
  slug: string;
  data: Record<string, unknown>;
}
export interface ApiGraphEdge {
  source: string;
  target: string;
  kind: "primary-area" | "area" | "co-area";
  weight: number;
}
export interface ApiGraph {
  nodes: ApiGraphNode[];
  edges: ApiGraphEdge[];
}

export interface LoginResponse {
  token: string;
  memberId: string;
  username: string;
  email: string | null;
  role: "MEMBER" | "MANAGER";
  mustChangePassword: boolean;
  emailVerified: boolean;
}

export interface MyProfile extends ApiMember {
  username: string;
  role?: "MEMBER" | "MANAGER";
  mustChangePassword: boolean;
  emailVerified: boolean;
}

export interface ApiMemberProjectLink {
  memberId: string;
  projectId: string;
  role: string;
}

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export type ProjectStatus = "ACTIVE" | "COMPLETED";

export interface ApiMemberProject {
  projectId: string;
  memberId: string;
  role: string; // "LEAD" | "CO_LEAD" | "RESEARCHER"
  member?: ApiMember;
}

export interface ApiProject {
  id: string;
  slug: string;
  status: ProjectStatus;
  /** Year the project was published / completed. Optional. */
  year?: number | null;
  /** Optional external link to the article / dataset / project page. */
  articleUrl?: string | null;
  tags: string[];
  titlePt: string;
  descriptionPt: string;
  titleEn: string;
  descriptionEn: string;
  titleFr: string;
  descriptionFr: string;
  areas?: ApiResearchArea[];
  leaders?: ApiMemberProject[];
  createdAt: string;
  updatedAt: string;
}

// ───── Endpoints ─────

export const api = {
  // Auth — `identifier` is either the username (slug) or the member's email.
  login: (identifier: string, password: string) =>
    request<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      body: { username: identifier, password },
    }),
  logout: () => request<void>("/api/v1/auth/logout", { method: "POST" }),

  // Me — extended payload with auth-flow flags (mustChangePassword, emailVerified).
  me: () => request<MyProfile | null>("/api/v1/me", { swallow401: true }),
  meUpdate: (body: Partial<MyProfile> & { email?: string; areas?: string; interests?: string; bannerColor?: string; bannerImageUrl?: string; languages?: string }) =>
    request<ApiMember>("/api/v1/me", { method: "PUT", body }),
  meChangePassword: (currentPassword: string, newPassword: string) =>
    request<{ message: string }>("/api/v1/me/password", {
      method: "PUT",
      body: { currentPassword, newPassword },
    }),
  meRequestEmailVerification: () =>
    request<{ message: string; token?: string; expiresAt?: string; alreadyVerified?: boolean }>(
      "/api/v1/me/email/request-verification",
      { method: "POST" }
    ),
  meVerifyEmail: (token: string) =>
    request<{ message: string }>("/api/v1/me/email/verify", { method: "POST", body: { token } }),
  myProjects: () => request<ApiMemberProjectLink[]>("/api/v1/me/projects"),
  updateMyProjects: (links: { projectId: string; role: string }[]) =>
    request<void>("/api/v1/me/projects", { method: "PUT", body: links }),
  meCreateProject: (body: {
    titlePt: string;
    descriptionPt?: string;
    status?: string;
    year?: number | null;
    articleUrl?: string;
    tags?: string[];
    advisorId?: string | null;
    participantIds?: string[];
  }) => request<ApiProject>("/api/v1/me/projects/new", { method: "POST", body }),
  /** Member photo upload — multipart to /me/media/photo. */
  meUploadPhoto: async (file: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/api/v1/me/media/photo`, {
      method: "POST",
      credentials: "include",
      body: form,
    });
    const text = await res.text();
    const parsed = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const message =
        parsed && typeof parsed === "object" && "message" in parsed && typeof parsed.message === "string"
          ? parsed.message
          : res.statusText || `Upload failed: ${res.status}`;
      throw new ApiError(res.status, message, parsed);
    }
    // Store the relative path (/uploads/uuid.jpg) in the DB — display code uses
    // resolveMediaUrl() to prepend API_BASE at render time, so the URL stays
    // correct even if the backend host changes.
    return { url: (parsed as { url: string }).url };
  },

  /** Banner image upload — multipart to /me/media/banner. */
  meUploadBanner: async (file: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/api/v1/me/media/banner`, {
      method: "POST",
      credentials: "include",
      body: form,
    });
    const text = await res.text();
    const parsed = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const message =
        parsed && typeof parsed === "object" && "message" in parsed && typeof parsed.message === "string"
          ? parsed.message
          : res.statusText || `Upload failed: ${res.status}`;
      throw new ApiError(res.status, message, parsed);
    }
    return { url: (parsed as { url: string }).url };
  },

  // Public reads
  members: () => request<Page<ApiMember>>("/api/v1/members?size=200"),
  member: (slugOrId: string) => request<ApiMember>(`/api/v1/members/${slugOrId}`),
  areas: () => request<ApiResearchArea[]>("/api/v1/areas"),
  projects: () => request<ApiProject[]>("/api/v1/projects"),
  project: (slugOrId: string) => request<ApiProject>(`/api/v1/projects/${slugOrId}`),
  graph: () => request<ApiGraph>("/api/v1/graph"),

  // Invites (public + admin)
  inviteInfo: (token: string) =>
    request<{ role: MemberRole; expiresAt: string }>(`/api/v1/invites/${token}`),

  inviteRegister: (
    token: string,
    body: {
      fullName: string;
      email: string;
      password: string;
      photoUrl?: string | null;
      bio?: string;
      bioLang?: string;
      linkedinUrl?: string;
      lattesUrl?: string;
      githubUrl?: string;
    }
  ) =>
    request<LoginResponse>(`/api/v1/invites/${token}/register`, {
      method: "POST",
      body,
    }),

  // Admin (MANAGER)
  admin: {
    createMember: (body: {
      slug: string;
      fullName: string;
      email?: string | null;
      currentRole: MemberRole;
      currentRoleStartedAt?: string;
      status?: MemberStatusEnum;
    }) =>
      request<{ member: ApiMember; tempPassword: string | null }>(
        "/api/v1/admin/members",
        { method: "POST", body }
      ),

    updateMember: (
      id: string,
      body: Partial<Omit<ApiMember, "id" | "slug" | "currentRole">> & {
        exchangeCountry?: string | null;
        /** Enum name, or "" to clear. Null is a no-op server-side. */
        undergradProgram?: string | null;
        joinedSemester?: string | null;
        joinedMonth?: string | null;
      },
    ) =>
      request<ApiMember>(`/api/v1/admin/members/${id}`, { method: "PUT", body }),

    deleteMember: (id: string) =>
      request<void>(`/api/v1/admin/members/${id}`, { method: "DELETE" }),

    promote: (id: string, body: { toRole: MemberRole; effectiveDate?: string; reason?: string; force?: boolean }) =>
      request<ApiMember>(`/api/v1/admin/members/${id}/promote`, { method: "POST", body }),

    createProject: (body: Record<string, unknown>) =>
      request<ApiProject>("/api/v1/admin/projects", { method: "POST", body }),

    updateProject: (id: string, body: Record<string, unknown>) =>
      request<ApiProject>(`/api/v1/admin/projects/${id}`, { method: "PUT", body }),

    deleteProject: (id: string) =>
      request<void>(`/api/v1/admin/projects/${id}`, { method: "DELETE" }),

    updateMemberProjects: (id: string, projects: { projectId: string; role: string }[]) =>
      request<void>(`/api/v1/admin/members/${id}/projects`, { method: "PUT", body: projects }),

    updateProjectMembers: (id: string, members: { memberId: string; role: string }[]) =>
      request<void>(`/api/v1/admin/projects/${id}/members`, { method: "PUT", body: members }),

    /** Per-member auth flags (must-change-password, email verified). Admin only. */
    authStatus: () =>
      request<
        Array<{
          memberId: string;
          slug: string;
          mustChangePassword: boolean;
          emailVerified: boolean;
        }>
      >("/api/v1/admin/auth-status"),

    /**
     * Issues a NEW random temp password and returns it once.
     *
     * Replaces the old `tempPassword` GET, which recomputed a deterministic
     * value. Random passwords are unrecoverable, so there is no "show it
     * again" — calling this always changes the member's credential. POST for
     * that reason: it must never be prefetched or cached.
     */
    resetPassword: (id: string) =>
      request<{ username: string; tempPassword: string }>(
        `/api/v1/admin/members/${id}/reset-password`,
        { method: "POST" }
      ),

    createInvite: (body: { role: MemberRole; validityDays: number }) =>
      request<{ id: string; token: string; role: MemberRole; expiresAt: string }>(
        "/api/v1/admin/invites",
        { method: "POST", body }
      ),

    /**
     * Upload a member photo via multipart. Returns `{ url }` — the SPA stores
     * `url` in member.photoUrl on the next updateMember call.
     */
    uploadMemberPhoto: async (file: File): Promise<{ url: string }> => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/api/v1/admin/media/photo`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const text = await res.text();
      const parsed = text ? JSON.parse(text) : null;
      if (!res.ok) {
        const message =
          parsed && typeof parsed === "object" && "message" in parsed && typeof parsed.message === "string"
            ? parsed.message
            : res.statusText || `Upload failed: ${res.status}`;
        throw new ApiError(res.status, message, parsed);
      }
      return { url: (parsed as { url: string }).url };
    },
  },
};

// ───── Named helpers used by the public team / projects routes ─────
// Thin shims so route files don't have to know about the `api.x()` wrapper.

export async function fetchMembers(): Promise<ApiMember[]> {
  const page = await api.members();
  return page.content;
}

export async function fetchMember(slugOrId: string): Promise<ApiMember> {
  return api.member(slugOrId);
}

export async function fetchProjects(): Promise<ApiProject[]> {
  return api.projects();
}

export async function fetchProject(slugOrId: string): Promise<ApiProject> {
  return api.project(slugOrId);
}
