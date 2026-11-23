package br.uema.laps.member;

/**
 * Undergraduate course a member is enrolled in (or graduated from).
 *
 * Separate from {@link MemberRole}: the role is the member's seniority in the
 * lab (UNDERGRAD → MASTER → DOCTORATE …), while this is which bachelor's degree
 * they came through. A doctoral student still has an originating course, so the
 * column is not restricted to UNDERGRAD members — it is simply null when unknown.
 *
 * UEMA opened the AI bachelor alongside the long-running Computer Engineering
 * course, and the lab now recruits from both.
 */
public enum UndergradProgram {
    /** Bacharelado em Engenharia de Computação. */
    COMPUTER_ENGINEERING,
    /** Bacharelado em Inteligência Artificial. */
    ARTIFICIAL_INTELLIGENCE
}
