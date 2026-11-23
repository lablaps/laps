package br.uema.laps.professor;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "professor")
@Getter
@Setter
@NoArgsConstructor
public class Professor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private String institution;
    private String lab;
    private String program;

    @Column(name = "bio_pt", columnDefinition = "text")
    private String bioPt;
    @Column(name = "bio_en", columnDefinition = "text")
    private String bioEn;
    @Column(name = "bio_fr", columnDefinition = "text")
    private String bioFr;

    @Column(name = "linkedin_url")
    private String linkedinUrl;
    @Column(name = "lattes_url")
    private String lattesUrl;
    @Column(name = "photo_url")
    private String photoUrl;
}
