package br.uema.laps.news;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Hibernate runs with ddl-auto=validate against the Flyway schema, and the
 * smoke test builds its schema from the entities instead — so nothing else
 * notices when the migration and the mapping drift apart until a real
 * Postgres refuses to start. These pin the names both sides must agree on.
 */
class NewsMigrationContractTest {

    @Test
    @DisplayName("V34 creates news, its categories and its ordered people, removed with the news")
    void migrationShape() throws Exception {
        String sql = resource("/db/migration/V34__news.sql");

        assertThat(sql)
                .contains("CREATE TABLE news (")
                .contains("CREATE TABLE news_category (")
                .contains("CREATE TABLE news_member (")
                .contains("REFERENCES news(id) ON DELETE CASCADE")
                .contains("REFERENCES member(id)")
                // The order column is INTEGER because that is what @OrderColumn
                // maps to; SMALLINT fails ddl-auto=validate on boot.
                .contains("position INTEGER NOT NULL")
                .contains("CHECK (category IN ('AWARD', 'SCHOLARSHIP', 'NATIONAL', 'INTERNATIONAL'))");
    }

    @Test
    @DisplayName("the entity maps to the tables and columns the migration creates")
    void entityMapping() throws Exception {
        assertThat(News.class.getAnnotation(Table.class).name()).isEqualTo("news");

        var categories = News.class.getDeclaredField("categories");
        assertThat(categories.getAnnotation(CollectionTable.class).name()).isEqualTo("news_category");
        assertThat(categories.getAnnotation(Column.class).name()).isEqualTo("category");

        var people = News.class.getDeclaredField("memberIds");
        assertThat(people.getAnnotation(CollectionTable.class).name()).isEqualTo("news_member");
        assertThat(people.getAnnotation(Column.class).name()).isEqualTo("member_id");
        assertThat(people.getAnnotation(OrderColumn.class).name()).isEqualTo("position");

        for (NewsCategory category : NewsCategory.values()) {
            assertThat(resource("/db/migration/V34__news.sql")).contains("'" + category.name() + "'");
        }
    }

    private static String resource(String path) throws IOException {
        try (var input = NewsMigrationContractTest.class.getResourceAsStream(path)) {
            assertThat(input).as("classpath resource %s", path).isNotNull();
            return new String(input.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
