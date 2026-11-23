package br.uema.laps.member;

/**
 * The 27 federative units, for members on national rather than international
 * mobility.
 *
 * <p>Stored as the two-letter UF string on {@code member.exchange_state} rather
 * than as a mapped enum column, because the DB already constrains the value
 * (see V26) and the column has to stay nullable and free of an enum type for
 * the CHECK that ties it to {@code exchange_country = 'BR'}. This enum is the
 * application-side half of that same rule: it exists so an unknown UF is a 400
 * naming the bad value, not a constraint violation surfacing as a 500.
 */
public enum BrazilianState {
    AC, AL, AP, AM, BA, CE, DF, ES, GO, MA, MT, MS, MG,
    PA, PB, PR, PE, PI, RJ, RN, RS, RO, RR, SC, SP, SE, TO;

    /** True when {@code raw} names a UF exactly (already upper-cased by the caller). */
    public static boolean isValid(String raw) {
        if (raw == null) return false;
        for (BrazilianState s : values()) {
            if (s.name().equals(raw)) return true;
        }
        return false;
    }
}
