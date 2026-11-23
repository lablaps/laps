package br.uema.laps.area;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "research_area")
@Getter
@Setter
@NoArgsConstructor
public class ResearchArea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Short id;

    @Column(unique = true, nullable = false)
    private String slug;

    @Column(name = "name_pt", nullable = false) private String namePt;
    @Column(name = "name_en", nullable = false) private String nameEn;
    @Column(name = "name_fr", nullable = false) private String nameFr;

    @Column(nullable = false)
    private String color;
}
