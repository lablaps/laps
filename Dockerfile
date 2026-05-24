# LAPS monolith — Render web service build.
#
# Three stages:
#   1. node:20 — build the SPA (laps-signal-lab) → dist/client/
#   2. maven:3.9-eclipse-temurin-21 — copy SPA into src/main/resources/static,
#      run mvn package, produce the runnable jar
#   3. eclipse-temurin:21-jre — minimal runtime, just the jar + uploads volume
#
# Render builds from this Dockerfile and runs the final stage.

# ---------- Stage 1: build the SPA ----------
FROM node:20-bookworm-slim AS spa-build
WORKDIR /spa
COPY laps-signal-lab/package.json laps-signal-lab/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY laps-signal-lab/ ./
RUN npm run build
# `npm run build` already copies _shell.html → index.html for the SPA fallback.

# ---------- Stage 2: build the Java jar ----------
FROM maven:3.9-eclipse-temurin-21 AS api-build
WORKDIR /build

# Cache the Maven dependencies layer separately from sources.
COPY laps-api/pom.xml ./pom.xml
RUN mvn -B -ntp -q dependency:go-offline

# Copy backend sources + the built SPA into Spring Boot's static resource path.
COPY laps-api/src ./src
COPY --from=spa-build /spa/dist/client/ ./src/main/resources/static/

RUN mvn -B -ntp -q -DskipTests package
# Spring Boot fat jar lands at /build/target/laps-api-*.jar; rename for clarity.
RUN cp target/laps-api-*.jar /app.jar

# ---------- Stage 3: runtime ----------
FROM eclipse-temurin:21-jre-noble
WORKDIR /app

# Non-root user. Render lets us pick our own UID and matches it on the
# managed disk if one is mounted.
RUN groupadd --system --gid 1001 laps \
 && useradd --system --uid 1001 --gid laps --home /app --shell /usr/sbin/nologin laps \
 && mkdir -p /app/uploads \
 && chown -R laps:laps /app

COPY --from=api-build --chown=laps:laps /app.jar /app/app.jar

USER laps
EXPOSE 8080

ENV JAVA_OPTS="-XX:MaxRAMPercentage=75 -XX:+UseG1GC -Djava.security.egd=file:/dev/./urandom"
# Render injects PORT; Spring Boot reads SERVER_PORT, so bridge them in the
# entrypoint. The shell exec keeps the JVM as PID 1 for clean SIGTERM handling.
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
