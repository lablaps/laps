package br.uema.laps.news;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface NewsRepository extends JpaRepository<News, UUID>, JpaSpecificationExecutor<News> {
}
