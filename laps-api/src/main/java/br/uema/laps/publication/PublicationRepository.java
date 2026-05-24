package br.uema.laps.publication;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface PublicationRepository
        extends JpaRepository<Publication, UUID>, JpaSpecificationExecutor<Publication> {
}
