# ─── Build stage ────────────────────────────────────────────────────────────
# node:lts-alpine is small and gives us npm + the toolchain. The build runs as
# root because Vite needs to write to node_modules' bin scripts; only the
# runtime stage drops privileges.
FROM node:lts-alpine AS build
WORKDIR /workspace

# Install deps with the lock file honored — fail the build if the lockfile
# would need to be rewritten, so reproducibility holds.
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# The SPA reads its API base from VITE_API_BASE at build time. The default
# falls back to same-origin, which is what we want when the SPA is served
# from the same domain as the API behind a reverse proxy.
ARG VITE_API_BASE=""
ENV VITE_API_BASE=$VITE_API_BASE

COPY . .

# vinxi/TanStack-Start produces .output/ with both a server bundle (for
# Cloudflare Workers) and the static client assets we need. For UEMA's
# Docker deploy we ignore the worker entry and ship only the static layer —
# every route resolves through nginx's SPA fallback to index.html and the
# TanStack router does client-side routing from there.
RUN npm run build

# Some builds emit assets to .output/public, others to dist. Pick whichever
# exists, fail loudly if neither did.
RUN set -e; \
    if [ -d .output/public ]; then ln -s .output/public /workspace/_static; \
    elif [ -d dist ]; then ln -s dist /workspace/_static; \
    else echo "no build output found"; exit 1; \
    fi; \
    ls -la /workspace/_static/ | head -10

# ─── Runtime stage ──────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Replace the default config with one that has SPA fallback + security headers.
RUN rm -rf /etc/nginx/conf.d/*
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static assets. nginx already runs worker processes as nginx:nginx
# (UID 101) on alpine; the only thing that needs to be root-owned is the
# config + the master process binding to :8080.
COPY --from=build /workspace/_static/ /usr/share/nginx/html/

# Bind to an unprivileged port so the container doesn't need CAP_NET_BIND.
# The compose file maps host:80 → container:8080.
EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --spider --quiet http://127.0.0.1:8080/ || exit 1
