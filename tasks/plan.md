# Member Roles / Management Permission Plan

The canonical reviewed implementation plan is:

[`docs/superpowers/plans/2026-08-21-member-roles-management-permission.md`](../docs/superpowers/plans/2026-08-21-member-roles-management-permission.md)

Architecture summary: keep one public membership role, move administrative access into hidden internal capabilities, migrate current `MANAGER`/`COORDINATOR` users without loss of access, add `COLLABORATOR`, and add accurate pending-password/pending-email filters to the protected roster.

Implementation uses the approved hidden `ADVISE_PROJECTS` policy so former coordinators retain advisor eligibility without exposing a management title.
