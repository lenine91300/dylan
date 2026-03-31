// ============================================================
//  VICE PORTFOLIO — data.js
//  Tous les dialogues, projets et CDC des professeurs
// ============================================================

// Helper pour générer le bloc image + fallback
function imgBlock(src, alt) {
    return `
    <div class="proj-img-wrap">
      <img src="img/${src}" class="proj-img" alt="${alt}"
           onerror="this.parentElement.innerHTML='<div class=img-ph><span>📸</span><small>Ajouter img/${src}</small></div>'">
    </div>`;
}

// ============================================================
//  PROFESSEURS / NPCS
// ============================================================
window.NPCS = [

    // --- Monsieur Caffort — Contact / Réseau pro (Malibu Club) ---
    {
        id: 'prof_chen',
        name: 'Monsieur Caffort',
        emoji: '👩‍💼',
        color: 0x119944,
        hatColor: 0x0a6630,
        pos: { x: 20, z: 22 },
        dialogue: {
            pages: [
                {
                    speaker: 'Monsieur Caffort',
                    portrait: '👩‍💼',
                    title: 'Contact Professionnel',
                    body: `
                        <h3>Prendre contact avec Dylan</h3>
                        <p>Monsieur Caffort, référente stage et insertion professionnelle.
                        Dylan est disponible pour des stages, alternances ou opportunités
                        d'emploi en développement web et logiciel.</p>
                        <br>
                        <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px;">
                            <a href="https://github.com/" target="_blank"
                               style="color:#00f0ff;text-decoration:none;display:flex;align-items:center;
                                      gap:10px;padding:10px;border:1px solid #00f0ff;border-radius:6px;
                                      background:rgba(0,240,255,0.05);pointer-events:all;">
                                <span style="font-size:20px">🐙</span>
                                <span><strong>GitHub</strong><br>
                                <small style="color:rgba(240,216,255,0.5)">Voir les projets en ligne</small></span>
                            </a>
                            <a href="https://linkedin.com/in/" target="_blank"
                               style="color:#9b30ff;text-decoration:none;display:flex;align-items:center;
                                      gap:10px;padding:10px;border:1px solid #9b30ff;border-radius:6px;
                                      background:rgba(155,48,255,0.05);pointer-events:all;">
                                <span style="font-size:20px">💼</span>
                                <span><strong>LinkedIn</strong><br>
                                <small style="color:rgba(240,216,255,0.5)">Profil professionnel</small></span>
                            </a>
                            <a href="mailto:dylan.arezki@email.com"
                               style="color:#ffd700;text-decoration:none;display:flex;align-items:center;
                                      gap:10px;padding:10px;border:1px solid #ffd700;border-radius:6px;
                                      background:rgba(255,215,0,0.05);pointer-events:all;">
                                <span style="font-size:20px">📧</span>
                                <span><strong>Email</strong><br>
                                <small style="color:rgba(240,216,255,0.5)">dylan.arezki@email.com</small></span>
                            </a>
                        </div>
                    `
                },
                {
                    speaker: 'Monsieur Caffort',
                    portrait: '👩‍💼',
                    title: 'Recommandation professeur',
                    body: `
                        <h3>Lettre de recommandation</h3>
                        <p>"J'ai encadré Dylan tout au long de sa formation BTS SIO SLAM.
                        C'est un étudiant sérieux, curieux et très impliqué dans ses projets."</p>
                        <br>
                        <h3>Qualités professionnelles</h3>
                        <p>✅ Autonomie et prise d'initiative<br>
                        ✅ Capacité à apprendre rapidement de nouvelles technologies<br>
                        ✅ Rigueur dans la documentation et la qualité du code<br>
                        ✅ Esprit d'équipe et communication<br>
                        ✅ Bonne gestion du temps et des priorités</p>
                        <br>
                        <p>"Je recommande Dylan sans réserve pour tout poste en
                        développement logiciel ou web." — Monsieur Caffort</p>
                    `
                }
            ]
        }
    }
];

// ============================================================
//  BÂTIMENTS (zones interactives)
// ============================================================
window.BUILDINGS = [

    {
        id: 'profil',
        label: 'PROFIL',
        x: -20, z: 8,
        w: 10, d: 8, h: 5,
        color: 0xd4427a,      // Rose Vice City
        roofColor: 0xff2d78,
        neonColor: 0xff2d78,
        zoneName: '🏠 Maison — Profil de Dylan',
        dialogue: {
            pages: [
                {
                    speaker: 'Dylan Arezki',
                    portrait: '👨‍💻',
                    title: 'Sites Web PHP — Accès direct',
                    body: `
                        <h3>Projets web PHP</h3>
                        <p>Clique sur un projet pour ouvrir le vrai site !</p>
                        <br>
                        <div style="display:flex;flex-direction:column;gap:10px;margin-top:4px;">
                            <a href="https://autorefund.fr/location_voitures/" target="_blank"
                               style="color:#ea580c;background:rgba(234,88,12,0.08);border:1px solid #ea580c;
                                      border-radius:6px;padding:11px 14px;cursor:pointer;text-align:left;
                                      display:flex;align-items:center;gap:10px;pointer-events:all;text-decoration:none">
                                <span style="font-size:20px">🚗</span>
                                <span><strong style="color:#f1f5f9">Location de Voitures</strong><br>
                                <small style="color:#94a3b8">PHP · PDO · MySQL — Gestion du parc auto</small></span>
                            </a>
                            <a href="https://autorefund.fr/sitedylan/" target="_blank"
                               style="color:#06b6d4;background:rgba(6,182,212,0.08);border:1px solid #06b6d4;
                                      border-radius:6px;padding:11px 14px;cursor:pointer;text-align:left;
                                      display:flex;align-items:center;gap:10px;pointer-events:all;text-decoration:none">
                                <span style="font-size:20px">🏖</span>
                                <span><strong style="color:#f1f5f9">RESA VVA — Vacances</strong><br>
                                <small style="color:#94a3b8">PHP · PDO · MySQL — Réservations hébergements</small></span>
                            </a>
                            <a href="https://autorefund.fr/zoo-site1/page%20d%27accueil/" target="_blank"
                               style="color:#84cc16;background:rgba(132,204,22,0.08);border:1px solid #84cc16;
                                      border-radius:6px;padding:11px 14px;cursor:pointer;text-align:left;
                                      display:flex;align-items:center;gap:10px;pointer-events:all;text-decoration:none">
                                <span style="font-size:20px">🦁</span>
                                <span><strong style="color:#f1f5f9">Zoo Manager</strong><br>
                                <small style="color:#94a3b8">PHP · MySQLi — Gestion du parc animalier</small></span>
                            </a>
                        </div>
                        <br>
                        <p style="color:#64748b;font-size:12px">↗ S'ouvre dans un nouvel onglet</p>
                    `
                }
            ]
        }
    },

    {
        id: 'veille',
        label: 'TECH TOWER',
        x: 19, z: -23,
        w: 8, d: 8, h: 13,
        color: 0x440088,
        roofColor: 0x9b30ff,
        neonColor: 0x9b30ff,
        zoneName: '🗼 Tech Tower — Veille Technologique',
        dialogue: {
            pages: [
                {
                    speaker: 'Dylan Arezki',
                    portrait: '👨‍💻',
                    title: '🌐 Dev Web Moderne',
                    body: `
                        <h3>Développement Web Moderne</h3>
                        <p>Le web évolue vers des architectures plus modulaires et performantes.</p>
                        <h4>Tendances actuelles</h4>
                        <p>• Progressive Web Apps (PWA)<br>
                        • API REST et microservices<br>
                        • DevOps et CI/CD (GitHub Actions)<br>
                        • Containerisation Docker</p>
                        <span class="tag tag-tech">React</span>
                        <span class="tag tag-tech">Node.js</span>
                        <span class="tag tag-tech">Docker</span>
                        <span class="tag tag-tech">API REST</span>
                    `
                }
            ]
        }
    },

    {
        id: 'projo_java',
        label: 'PROJO JAVA',
        type: 'terminal',
        appId: 'gestion_stages',
        x: -21, z: -23,
        w: 12, d: 10, h: 9,
        color: 0x0a2a0a,
        roofColor: 0x00ff41,
        neonColor: 0x00ff41,
        zoneName: '💻 Projo Java — GestionStages',
        dialogue: { pages: [] }
    },


    {
        id: 'contact',
        label: 'MALIBU CLUB',
        x: 20, z: 26,
        w: 11, d: 9, h: 4,
        color: 0x0a5534,
        roofColor: 0x00ff88,
        neonColor: 0x00f0ff,
        zoneName: '🌴 Malibu Club — Contact',
        dialogue: {
            pages: [
                {
                    speaker: 'Dylan Arezki',
                    portrait: '👨‍💻',
                    title: 'Bienvenue au Malibu Club !',
                    body: `
                        <h3>Prenons contact !</h3>
                        <p>Disponible pour un stage, une alternance ou un premier emploi
                        en développement web et logiciel.</p>
                        <br>
                        <div style="display:flex;flex-direction:column;gap:10px;margin-top:8px;">
                            <a href="https://github.com/" target="_blank"
                               style="color:#00f0ff;text-decoration:none;display:flex;align-items:center;
                                      gap:10px;padding:10px;border:1px solid #00f0ff;border-radius:6px;
                                      background:rgba(0,240,255,0.05);pointer-events:all;">
                                <span style="font-size:20px">🐙</span>
                                <strong>GitHub</strong>
                            </a>
                            <a href="https://linkedin.com/in/" target="_blank"
                               style="color:#9b30ff;text-decoration:none;display:flex;align-items:center;
                                      gap:10px;padding:10px;border:1px solid #9b30ff;border-radius:6px;
                                      background:rgba(155,48,255,0.05);pointer-events:all;">
                                <span style="font-size:20px">💼</span>
                                <strong>LinkedIn</strong>
                            </a>
                            <a href="mailto:dylan.arezki@email.com"
                               style="color:#ffd700;text-decoration:none;display:flex;align-items:center;
                                      gap:10px;padding:10px;border:1px solid #ffd700;border-radius:6px;
                                      background:rgba(255,215,0,0.05);pointer-events:all;">
                                <span style="font-size:20px">📧</span>
                                <strong>dylan.arezki@email.com</strong>
                            </a>
                        </div>
                    `
                }
            ]
        }
    },

    {
        id: 'veille_mma',
        label: 'VEILLE MMA',
        type: 'veille_mma',
        x: 19, z: 8,
        w: 6, d: 6, h: 8,
        color: 0x8b0000,
        roofColor: 0xe63946,
        neonColor: 0xe63946,
        zoneName: '🥊 Veille MMA — Technologies dans le MMA',
        dialogue: { pages: [] }
    },

    {
        id: 'rapport_stage',
        label: 'RAPPORT',
        type: 'rapport',
        x: -20, z: 25,
        w: 9, d: 8, h: 6,
        color: 0x1a1000,
        roofColor: 0xffd700,
        neonColor: 0xffd700,
        zoneName: '📄 Rapport de Stage — BTS SIO SLAM',
        dialogue: { pages: [] }
    }
];
