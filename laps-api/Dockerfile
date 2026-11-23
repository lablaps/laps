FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /workspace

COPY mvnw mvnw
COPY .mvn .mvn
COPY pom.xml pom.xml
RUN chmod +x mvnw && ./mvnw -B -q -DskipTests dependency:go-offline


COPY src src

RUN ./mvnw -B -q -DskipTests package \
    && mkdir -p target/extracted \
    && (cd target && java -Djarmode=layertools -jar laps-api-*.jar extract --destination extracted)


FROM eclipse-temurin:21-jre-jammy AS runtime
WORKDIR /app

# Hardening: non-root user, no shell on the user account, predictable UID/GID
# so volume mounts work with a host user we control. UID 10001 is well above
# any system-account range to avoid collisions with the base image's users.
RUN groupadd --system --gid 10001 laps \
    && useradd --system --uid 10001 --gid laps --no-create-home --shell /sbin/nologin laps \
    && apt-get update \
    && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Persist uploads under /app/uploads — compose mounts a named volume here.
RUN mkdir -p /app/uploads && chown -R laps:laps /app

# Pull the four Spring Boot layers in dependency-stability order.
COPY --from=build --chown=laps:laps /workspace/target/extracted/dependencies/ ./
COPY --from=build --chown=laps:laps /workspace/target/extracted/spring-boot-loader/ ./
COPY --from=build --chown=laps:laps /workspace/target/extracted/snapshot-dependencies/ ./
COPY --from=build --chown=laps:laps /workspace/target/extracted/application/ ./

USER laps:laps

# JVM defaults tuned for a containerised single replica. UseContainerSupport
# lets the JVM honor the container's memory limit; MaxRAMPercentage caps heap
# at 75% of cgroup memory so the OS still has working room.
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75 -Djava.security.egd=file:/dev/urandom"
ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080

EXPOSE 8080

# Healthcheck hits the actuator endpoint, which is the only public actuator
# route (see application.yml). Spring's HealthIndicator includes the
# datasource so an unreachable MySQL flips the container to "unhealthy".
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
    CMD curl --fail --silent http://127.0.0.1:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher \"$@\"", "--"]
