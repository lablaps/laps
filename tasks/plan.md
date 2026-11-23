# Member Roles / Management Permission Plan

The canonical reviewed implementation plan is:

[`docs/superpowers/plans/2026-08-21-member-roles-management-permission.md`](../docs/superpowers/plans/2026-08-21-member-roles-management-permission.md)

Architecture summary: keep one public membership role, move administrative access into hidden internal capabilities, migrate current `MANAGER`/`COORDINATOR` users without loss of access, add `COLLABORATOR`, and add accurate pending-password/pending-email filters to the protected roster.

Implementation uses the approved hidden `ADVISE_PROJECTS` policy so former coordinators retain advisor eligibility without exposing a management title.

## Current security-hardening plan

The proposed client-asset and JWT response plan is:

[`docs/superpowers/plans/2026-10-06-client-assets-and-jwt-response-hardening.md`](../docs/superpowers/plans/2026-10-06-client-assets-and-jwt-response-hardening.md)

It deliberately keeps real compiled JavaScript bundles public because the SPA requires them, while removing the unused JWT from response JSON, reducing sessions to one hour, and binding each token to a server-side authentication version. A successful self-service password change will rotate the current cookie and revoke every older session; an admin password reset will revoke all target-user sessions. No application implementation begins until this plan is approved.
