package br.uema.laps.member;

// Ordered from junior to senior — used directly by RoleTransitionService as
// the canonical hierarchy. Coordinator/Manager sit immediately below Head
// (lab leadership without the Head title); the doctorate/master/undergrad
// triplet covers research trainees.
public enum MemberRole {
    UNDERGRAD,
    MASTER,
    DOCTORATE,
    MANAGER,
    COORDINATOR,
    HEAD
}
