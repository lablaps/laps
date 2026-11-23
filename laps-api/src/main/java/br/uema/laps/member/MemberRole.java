package br.uema.laps.member;

// Public membership taxonomy. MANAGER and COORDINATOR remain readable for one
// migration window because historical role_history rows still contain them;
// every write boundary rejects those legacy values.
public enum MemberRole {
    UNDERGRAD,
    MASTER,
    DOCTORATE,
    COLLABORATOR,
    HEAD,
    @Deprecated
    MANAGER,
    @Deprecated
    COORDINATOR;

    public boolean isAssignable() {
        return this != MANAGER && this != COORDINATOR;
    }
}
