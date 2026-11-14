package br.uema.laps.news;

/**
 * The fixed, filterable tags on a news item. Free-form tags exist too
 * ({@link News#getTags()}), but only these drive navigation: "Prêmios e Bolsas"
 * is the feed filtered to AWARD or SCHOLARSHIP, and NATIONAL / INTERNATIONAL
 * say where a prize or grant came from.
 *
 * <p>Names are stored as text and checked by V34; adding one needs a migration
 * that widens that CHECK, or inserts fail.
 */
public enum NewsCategory {
    AWARD,
    SCHOLARSHIP,
    NATIONAL,
    INTERNATIONAL
}
