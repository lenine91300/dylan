-- ============================================================
-- BASE DE DONNÉES : Gestion des Stages Étudiants BTS SIO
-- Auteur : Dylan Arezki
-- Date : 2026-03-19
-- SGBD : MySQL 8+
-- Méthode : MERISE (MCD → MLD → MPD)
-- ============================================================

DROP DATABASE IF EXISTS gestion_stages;
CREATE DATABASE gestion_stages CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestion_stages;

-- ============================================================
-- ENTITÉ MÈRE : PERSONNE (héritage XT)
-- ============================================================
CREATE TABLE PERSONNE (
    id_personne     INT             AUTO_INCREMENT,
    nom             VARCHAR(100)    NOT NULL,
    prenom          VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    telephone       VARCHAR(15),
    mot_de_passe    VARCHAR(255)    NOT NULL COMMENT 'Hash bcrypt',
    role            ENUM('etudiant', 'professeur', 'tuteur', 'administrateur') NOT NULL,
    date_creation   DATETIME        DEFAULT CURRENT_TIMESTAMP,
    actif           BOOLEAN         DEFAULT TRUE,
    PRIMARY KEY (id_personne)
) ENGINE=InnoDB;

-- ============================================================
-- ENTITÉS FILLES (Héritage XT - Exclusif Total)
-- ============================================================

-- ETUDIANT
CREATE TABLE ETUDIANT (
    id_personne         INT,
    classe              VARCHAR(50)     NOT NULL COMMENT 'Ex: BTS SIO 1, BTS SIO 2',
    annee_formation     TINYINT         NOT NULL COMMENT '1 ou 2',
    numero_etudiant     VARCHAR(20)     NOT NULL UNIQUE,
    PRIMARY KEY (id_personne),
    CONSTRAINT fk_etudiant_personne
        FOREIGN KEY (id_personne) REFERENCES PERSONNE(id_personne)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- PROFESSEUR
CREATE TABLE PROFESSEUR (
    id_personne     INT,
    matiere         VARCHAR(100)    NOT NULL,
    departement     VARCHAR(100),
    PRIMARY KEY (id_personne),
    CONSTRAINT fk_professeur_personne
        FOREIGN KEY (id_personne) REFERENCES PERSONNE(id_personne)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- TUTEUR_ENTREPRISE
CREATE TABLE TUTEUR_ENTREPRISE (
    id_personne     INT,
    fonction        VARCHAR(100)    NOT NULL,
    service         VARCHAR(100),
    id_entreprise   INT             NOT NULL COMMENT 'Association TRAVAILLER (1,1)',
    PRIMARY KEY (id_personne),
    CONSTRAINT fk_tuteur_personne
        FOREIGN KEY (id_personne) REFERENCES PERSONNE(id_personne)
        ON DELETE CASCADE ON UPDATE CASCADE
    -- FK vers ENTREPRISE ajoutée après création de la table ENTREPRISE
) ENGINE=InnoDB;

-- ============================================================
-- ENTITÉ : ENTREPRISE
-- ============================================================
CREATE TABLE ENTREPRISE (
    id_entreprise       INT             AUTO_INCREMENT,
    nom_entreprise      VARCHAR(200)    NOT NULL,
    adresse             VARCHAR(255),
    ville               VARCHAR(100)    NOT NULL,
    code_postal         VARCHAR(5)      NOT NULL,
    telephone           VARCHAR(15),
    email               VARCHAR(255),
    secteur_activite    VARCHAR(150),
    siret               VARCHAR(14)     UNIQUE COMMENT '14 chiffres',
    date_creation       DATETIME        DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_entreprise)
) ENGINE=InnoDB;

-- Ajout FK TRAVAILLER : TUTEUR_ENTREPRISE (1,1) → ENTREPRISE (1,N)
ALTER TABLE TUTEUR_ENTREPRISE
    ADD CONSTRAINT fk_tuteur_entreprise
        FOREIGN KEY (id_entreprise) REFERENCES ENTREPRISE(id_entreprise)
        ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- ENTITÉ : STAGE
-- Absorbe les associations côté 1,1 :
--   EFFECTUER  (ETUDIANT 0,N ↔ STAGE 1,1)
--   SUIVRE     (PROFESSEUR 0,N ↔ STAGE 1,1)
--   ENCADRER   (TUTEUR 0,N ↔ STAGE 1,1)
--   ACCUEILLIR (ENTREPRISE 0,N ↔ STAGE 1,1)
-- ============================================================
CREATE TABLE STAGE (
    id_stage            INT             AUTO_INCREMENT,
    date_debut          DATE            NOT NULL,
    date_fin            DATE            NOT NULL,
    missions            TEXT,
    statut              ENUM('en_recherche', 'convention_signee', 'en_cours', 'termine', 'evalue')
                                        NOT NULL DEFAULT 'en_recherche',
    appreciation        TEXT,
    note                DECIMAL(4,2)    CHECK (note >= 0 AND note <= 20),
    nb_heures           INT,
    date_creation       DATETIME        DEFAULT CURRENT_TIMESTAMP,

    -- FK : EFFECTUER (1 étudiant effectue ce stage)
    id_etudiant         INT             NOT NULL,
    -- FK : SUIVRE (1 professeur suit ce stage)
    id_professeur       INT,
    -- FK : ENCADRER (1 tuteur encadre ce stage)
    id_tuteur           INT,
    -- FK : ACCUEILLIR (1 entreprise accueille ce stage)
    id_entreprise       INT             NOT NULL,

    PRIMARY KEY (id_stage),

    CONSTRAINT fk_stage_etudiant
        FOREIGN KEY (id_etudiant) REFERENCES ETUDIANT(id_personne)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_stage_professeur
        FOREIGN KEY (id_professeur) REFERENCES PROFESSEUR(id_personne)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_stage_tuteur
        FOREIGN KEY (id_tuteur) REFERENCES TUTEUR_ENTREPRISE(id_personne)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_stage_entreprise
        FOREIGN KEY (id_entreprise) REFERENCES ENTREPRISE(id_entreprise)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    CONSTRAINT chk_dates CHECK (date_fin > date_debut)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : CONVENTION (DCU : Valider les conventions)
-- ============================================================
CREATE TABLE CONVENTION (
    id_convention       INT             AUTO_INCREMENT,
    id_stage            INT             NOT NULL UNIQUE,
    date_generation     DATETIME        DEFAULT CURRENT_TIMESTAMP,
    date_validation     DATETIME,
    statut              ENUM('generee', 'en_attente', 'validee', 'refusee')
                                        NOT NULL DEFAULT 'generee',
    validee_par         INT             COMMENT 'ID administrateur',
    document_path       VARCHAR(500)    COMMENT 'Chemin du fichier PDF',

    PRIMARY KEY (id_convention),

    CONSTRAINT fk_convention_stage
        FOREIGN KEY (id_stage) REFERENCES STAGE(id_stage)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_convention_admin
        FOREIGN KEY (validee_par) REFERENCES PERSONNE(id_personne)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : RAPPORT_STAGE (DCU : Rédiger / Consulter rapports)
-- ============================================================
CREATE TABLE RAPPORT_STAGE (
    id_rapport          INT             AUTO_INCREMENT,
    id_stage            INT             NOT NULL,
    date_depot          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    titre               VARCHAR(255)    NOT NULL,
    fichier_path        VARCHAR(500)    NOT NULL COMMENT 'Chemin du fichier',
    commentaire         TEXT,

    PRIMARY KEY (id_rapport),

    CONSTRAINT fk_rapport_stage
        FOREIGN KEY (id_stage) REFERENCES STAGE(id_stage)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : EVALUATION (DCU : Évaluer un stage / stagiaire)
-- ============================================================
CREATE TABLE EVALUATION (
    id_evaluation       INT             AUTO_INCREMENT,
    id_stage            INT             NOT NULL,
    id_evaluateur       INT             NOT NULL COMMENT 'Professeur ou Tuteur',
    type_evaluateur     ENUM('professeur', 'tuteur') NOT NULL,
    date_evaluation     DATETIME        DEFAULT CURRENT_TIMESTAMP,
    note                DECIMAL(4,2)    CHECK (note >= 0 AND note <= 20),
    appreciation        TEXT,
    competences         TEXT            COMMENT 'Grille de compétences JSON',

    PRIMARY KEY (id_evaluation),

    CONSTRAINT fk_evaluation_stage
        FOREIGN KEY (id_stage) REFERENCES STAGE(id_stage)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_evaluation_evaluateur
        FOREIGN KEY (id_evaluateur) REFERENCES PERSONNE(id_personne)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    UNIQUE KEY uk_eval_unique (id_stage, id_evaluateur)
) ENGINE=InnoDB;

-- ============================================================
-- TABLE : NOTIFICATION (DCU : Envoyer notification)
-- ============================================================
CREATE TABLE NOTIFICATION (
    id_notification     INT             AUTO_INCREMENT,
    id_destinataire     INT             NOT NULL,
    type_notification   ENUM('convention', 'rappel', 'evaluation', 'affectation', 'autre')
                                        NOT NULL,
    titre               VARCHAR(255)    NOT NULL,
    message             TEXT            NOT NULL,
    lu                  BOOLEAN         DEFAULT FALSE,
    date_envoi          DATETIME        DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id_notification),

    CONSTRAINT fk_notif_destinataire
        FOREIGN KEY (id_destinataire) REFERENCES PERSONNE(id_personne)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- INDEX pour optimisation des requêtes
-- ============================================================
CREATE INDEX idx_stage_etudiant      ON STAGE(id_etudiant);
CREATE INDEX idx_stage_professeur    ON STAGE(id_professeur);
CREATE INDEX idx_stage_tuteur        ON STAGE(id_tuteur);
CREATE INDEX idx_stage_entreprise    ON STAGE(id_entreprise);
CREATE INDEX idx_stage_statut        ON STAGE(statut);
CREATE INDEX idx_convention_statut   ON CONVENTION(statut);
CREATE INDEX idx_notif_destinataire  ON NOTIFICATION(id_destinataire, lu);
CREATE INDEX idx_personne_role       ON PERSONNE(role);
CREATE INDEX idx_entreprise_ville    ON ENTREPRISE(ville);

-- ============================================================
-- VUES UTILES
-- ============================================================

-- Vue complète des stages avec tous les intervenants
CREATE VIEW v_stages_complet AS
SELECT
    s.id_stage,
    s.date_debut,
    s.date_fin,
    s.missions,
    s.statut,
    s.note,
    s.nb_heures,
    -- Étudiant
    e_p.id_personne     AS id_etudiant,
    e_p.nom             AS etudiant_nom,
    e_p.prenom          AS etudiant_prenom,
    et.classe,
    et.numero_etudiant,
    -- Professeur
    pr_p.id_personne    AS id_professeur,
    pr_p.nom            AS professeur_nom,
    pr_p.prenom         AS professeur_prenom,
    -- Tuteur
    tu_p.id_personne    AS id_tuteur,
    tu_p.nom            AS tuteur_nom,
    tu_p.prenom         AS tuteur_prenom,
    -- Entreprise
    ent.id_entreprise,
    ent.nom_entreprise,
    ent.ville           AS entreprise_ville
FROM STAGE s
    JOIN ETUDIANT et            ON s.id_etudiant = et.id_personne
    JOIN PERSONNE e_p           ON et.id_personne = e_p.id_personne
    LEFT JOIN PERSONNE pr_p     ON s.id_professeur = pr_p.id_personne
    LEFT JOIN PERSONNE tu_p     ON s.id_tuteur = tu_p.id_personne
    JOIN ENTREPRISE ent         ON s.id_entreprise = ent.id_entreprise;

-- Vue statistiques par entreprise
CREATE VIEW v_stats_entreprise AS
SELECT
    ent.id_entreprise,
    ent.nom_entreprise,
    ent.ville,
    ent.secteur_activite,
    COUNT(s.id_stage)           AS nb_stages,
    ROUND(AVG(s.note), 2)      AS note_moyenne,
    MIN(s.date_debut)           AS premier_stage,
    MAX(s.date_fin)             AS dernier_stage
FROM ENTREPRISE ent
    LEFT JOIN STAGE s ON ent.id_entreprise = s.id_entreprise
GROUP BY ent.id_entreprise, ent.nom_entreprise, ent.ville, ent.secteur_activite;

-- ============================================================
-- JEU DE DONNÉES DE TEST
-- ============================================================

-- Entreprises
INSERT INTO ENTREPRISE (nom_entreprise, adresse, ville, code_postal, telephone, email, secteur_activite, siret) VALUES
('Tech Solutions Lyon',   '15 rue de la République',  'Lyon',         '69001', '0472000001', 'contact@techsolutions.fr',   'Informatique',         '12345678901234'),
('Digital Factory',       '8 avenue Jean Jaurès',     'Villeurbanne', '69100', '0472000002', 'rh@digitalfactory.fr',       'Développement web',    '98765432109876'),
('CyberSec Corp',         '22 boulevard Vivier Merle','Lyon',         '69003', '0472000003', 'stages@cybersec-corp.fr',    'Cybersécurité',        '11223344556677');

-- Personnes (mot de passe = hash bcrypt fictif de "password123")
INSERT INTO PERSONNE (nom, prenom, email, telephone, mot_de_passe, role) VALUES
-- Étudiants
('Arezki',    'Dylan',    'dylan.arezki@etudiant.fr',     '0600000001', '$2b$12$LJ3m5Zq5xUQ1Vn5Kx5K5a.EXAMPLE_HASH_1', 'etudiant'),
('Martin',    'Sophie',   'sophie.martin@etudiant.fr',    '0600000002', '$2b$12$LJ3m5Zq5xUQ1Vn5Kx5K5a.EXAMPLE_HASH_2', 'etudiant'),
('Durand',    'Lucas',    'lucas.durand@etudiant.fr',     '0600000003', '$2b$12$LJ3m5Zq5xUQ1Vn5Kx5K5a.EXAMPLE_HASH_3', 'etudiant'),
-- Professeurs
('Bernard',   'Marie',    'marie.bernard@prof.fr',        '0600000004', '$2b$12$LJ3m5Zq5xUQ1Vn5Kx5K5a.EXAMPLE_HASH_4', 'professeur'),
('Petit',     'Jean',     'jean.petit@prof.fr',           '0600000005', '$2b$12$LJ3m5Zq5xUQ1Vn5Kx5K5a.EXAMPLE_HASH_5', 'professeur'),
-- Tuteurs
('Moreau',    'Pierre',   'pierre.moreau@techsolutions.fr','0600000006','$2b$12$LJ3m5Zq5xUQ1Vn5Kx5K5a.EXAMPLE_HASH_6', 'tuteur'),
('Lefebvre',  'Claire',   'claire.lefebvre@digitalfactory.fr','0600000007','$2b$12$LJ3m5Zq5xUQ1Vn5Kx5K5a.EXAMPLE_HASH_7', 'tuteur'),
-- Administrateur
('Dupont',    'Alice',    'alice.dupont@admin.fr',        '0600000008', '$2b$12$LJ3m5Zq5xUQ1Vn5Kx5K5a.EXAMPLE_HASH_8', 'administrateur');

-- Étudiants
INSERT INTO ETUDIANT (id_personne, classe, annee_formation, numero_etudiant) VALUES
(1, 'BTS SIO SLAM 2', 2, 'ETU2024001'),
(2, 'BTS SIO SLAM 2', 2, 'ETU2024002'),
(3, 'BTS SIO SISR 1', 1, 'ETU2025001');

-- Professeurs
INSERT INTO PROFESSEUR (id_personne, matiere, departement) VALUES
(4, 'Développement',    'Informatique'),
(5, 'Réseaux',          'Informatique');

-- Tuteurs entreprise
INSERT INTO TUTEUR_ENTREPRISE (id_personne, fonction, service, id_entreprise) VALUES
(6, 'Chef de projet',           'DSI',              1),
(7, 'Responsable développement','Pôle technique',   2);

-- Stages
INSERT INTO STAGE (date_debut, date_fin, missions, statut, note, nb_heures, id_etudiant, id_professeur, id_tuteur, id_entreprise) VALUES
('2026-05-19', '2026-06-27', 'Développement d''une application web de gestion interne en PHP/MySQL', 'en_cours', NULL, 280, 1, 4, 6, 1),
('2026-05-19', '2026-06-27', 'Refonte du site vitrine et intégration CMS', 'convention_signee', NULL, 280, 2, 4, 7, 2),
('2026-01-06', '2026-02-14', 'Maintenance parc informatique et support utilisateur', 'evalue', 15.50, 280, 3, 5, 6, 1);

-- Conventions
INSERT INTO CONVENTION (id_stage, statut, validee_par, date_validation) VALUES
(1, 'validee',    8, '2026-04-15 10:30:00'),
(2, 'validee',    8, '2026-04-20 14:00:00'),
(3, 'validee',    8, '2025-12-10 09:00:00');

-- Évaluations
INSERT INTO EVALUATION (id_stage, id_evaluateur, type_evaluateur, note, appreciation) VALUES
(3, 5, 'professeur', 15.50, 'Bon travail, étudiant sérieux et impliqué.'),
(3, 6, 'tuteur',     16.00, 'Très bonne intégration dans l''équipe, autonome.');

-- Notifications
INSERT INTO NOTIFICATION (id_destinataire, type_notification, titre, message) VALUES
(1, 'convention',   'Convention validée',           'Votre convention de stage chez Tech Solutions Lyon a été validée.'),
(2, 'affectation',  'Professeur référent affecté',  'Mme Bernard a été désignée comme votre professeur référent de stage.'),
(4, 'evaluation',   'Évaluation en attente',        'Le stage de Lucas Durand est terminé et en attente de votre évaluation.');

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
