# Security Policy

LAPS handles data covered by the **Lei Geral de Proteção de Dados (LGPD)**.
We take vulnerability reports seriously.

## Reporting a vulnerability

**Do not open a public GitHub issue or pull request** to report a security
problem. Public reports give attackers a head start.

Email **`laps@engcomp.uema.br`** with the subject line:

```
[SECURITY] LAPS - <one-line summary>
```

Include in the body:

- a clear description of the issue,
- the steps to reproduce (or a proof-of-concept),
- the impact you believe it has,
- the commit SHA / version you tested against,
- any suggested fix you already have in mind,
- whether you'd like to be credited publicly once a fix ships.

We aim to acknowledge reports within **3 business days** and to ship a fix
or a documented mitigation within **30 days** of confirmation, depending on
severity.

## What is in scope

- The Spring Boot API (`laps-api/`).
- The TanStack Start SPA (`laps-signal-lab/`).
- The Docker Compose deployment (`docker-compose.yml`, `Dockerfile`s,
  `nginx.conf`).
- Database migrations (`laps-api/src/main/resources/db/migration/`).

## What is out of scope

- Issues that require physical access to a deployment host.
- Social-engineering attacks against UEMA staff.
- Denial-of-service via traffic volume against the public endpoint
  (mitigations live at the network layer, not in this codebase).
- Findings in third-party services we link to (e.g. MyMemory translation).

## Supported versions

Only the current `main` branch is supported. Older snapshots may contain
known issues that have been fixed upstream — please test against `main`
before reporting.

## Coordinated disclosure

We follow coordinated disclosure: please give us a reasonable window
(typically 30 days after a fix lands) before any public write-up. If a fix
is taking longer than that, we will tell you and agree a revised date with
you in writing.

Thank you for helping keep LAPS, our team, and our users safe.
