// ============================================================
//  java-app.js — GestionStages (HTML reconstruction — CRUD complet)
//  Sélection, Ajouter, Modifier, Supprimer, Recherche, Filtres
// ============================================================

// ── Données (modifiables en runtime) ─────────────────────────
const DEMO = {
    _id: { etudiants:16, professeurs:109, entreprises:11, tuteurs:207, stages:16 },
    etudiants: [
        [1,'Martin','Lucas','l.martin@etudiant.fr','0612345001','BTS SIO SLAM 2',2,'SIO2-001'],
        [2,'Petit','Emma','e.petit@etudiant.fr','0612345002','BTS SIO SLAM 2',2,'SIO2-002'],
        [3,'Dupont','Nathan','n.dupont@etudiant.fr','0612345003','BTS SIO SLAM 2',2,'SIO2-003'],
        [4,'Bernard','Léa','l.bernard@etudiant.fr','0612345004','BTS SIO SISR 2',2,'SIO2-004'],
        [5,'Moreau','Tom','t.moreau@etudiant.fr','0612345005','BTS SIO SLAM 2',2,'SIO2-005'],
        [6,'Laurent','Chloé','c.laurent@etudiant.fr','0612345006','BTS SIO SISR 2',2,'SIO2-006'],
        [7,'Simon','Alexis','a.simon@etudiant.fr','0612345007','BTS SIO SLAM 1',1,'SIO1-007'],
        [8,'Michel','Sarah','s.michel@etudiant.fr','0612345008','BTS SIO SLAM 1',1,'SIO1-008'],
        [9,'Garcia','Hugo','h.garcia@etudiant.fr','0612345009','BTS SIO SISR 1',1,'SIO1-009'],
        [10,'Martinez','Inès','i.martinez@etudiant.fr','0612345010','BTS SIO SLAM 2',2,'SIO2-010'],
        [11,'Roux','Antoine','a.roux@etudiant.fr','0612345011','BTS SIO SISR 2',2,'SIO2-011'],
        [12,'Leroy','Camille','c.leroy@etudiant.fr','0612345012','BTS SIO SLAM 2',2,'SIO2-012'],
        [13,'Fontaine','Julien','j.fontaine@etudiant.fr','0612345013','BTS SIO SLAM 1',1,'SIO1-013'],
        [14,'Girard','Clara','c.girard@etudiant.fr','0612345014','BTS SIO SISR 1',1,'SIO1-014'],
        [15,'Bonnet','Pierre','p.bonnet@etudiant.fr','0612345015','BTS SIO SLAM 2',2,'SIO2-015'],
    ],
    professeurs: [
        [101,'Arezki','Karim','k.arezki@lycee.fr','0400000101','Développement Java','Informatique'],
        [102,'Leclerc','Sophie','s.leclerc@lycee.fr','0400000102','Bases de données SQL','Informatique'],
        [103,'Rousseau','Marc','m.rousseau@lycee.fr','0400000103','Réseaux & Sécurité','SISR'],
        [104,'Blanc','Julie','j.blanc@lycee.fr','0400000104','Développement Web PHP','Informatique'],
        [105,'Chevalier','Olivier','o.chevalier@lycee.fr','0400000105','Mathématiques / Algo','Sciences'],
        [106,'Morel','Isabelle','i.morel@lycee.fr','0400000106','Anglais technique','Langues'],
        [107,'Renard','Paul','p.renard@lycee.fr','0400000107','Management de projet','Gestion'],
        [108,'Giraud','Anne','a.giraud@lycee.fr','0400000108','Cybersécurité','SISR'],
    ],
    entreprises: [
        [1,'Capgemini France','1 Rue de Tilsitt','Paris','75008','0155621500','contact@capgemini.fr','Conseil IT / ESN'],
        [2,'Orange Business','1 Av. Nelson Mandela','Nanterre','92000','0155801234','info@orange-bs.fr','Télécommunications'],
        [3,'Thales Group','45 Rue de Villiers','Meudon','92360','0146294060','contact@thales.fr','Défense / Aérospatial'],
        [4,'Société Générale','29 Bd Haussmann','Paris','75009','0142148000','recrutement@sg.fr','Finance / Banque'],
        [5,'Airbus Defence','31 Rue des Cosmonautes','Toulouse','31402','0561936222','emploi@airbus.fr','Aérospatial'],
        [6,'Atos SE','80 Quai Voltaire','Bezons','95870','0134222222','carriere@atos.net','Informatique / Cloud'],
        [7,'Dassault Systèmes','10 Rue Marcel Dassault','Vélizy','78140','0161623111','stages@3ds.com','Logiciel / 3D'],
        [8,'Sopra Steria','9 Bis Quai Sadi Carnot','Suresnes','92150','0155945500','contact@sopra.com','ESN / Conseil'],
        [9,'SNCF Connect','2 Place de la Défense','Nanterre','92400','0153251000','tech@sncf.fr','Transport'],
        [10,'Engie Digital','1 Place S. de Champlain','Courbevoie','92400','0144222200','stages@engie.com','Énergie'],
    ],
    tuteurs: [
        [201,'Durand','François','Chef de projet','DSI','Capgemini France'],
        [202,'Lefebvre','Marie','Lead développeur','R&D','Orange Business'],
        [203,'Morin','Jean','Architecte SI','Technique','Thales Group'],
        [204,'Fournier','Claire','DBA','Données','Société Générale'],
        [205,'Lambert','Sébastien','DevOps','Infra','Airbus Defence'],
        [206,'Legrand','Nathalie','Responsable SI','DSI','Atos SE'],
    ],
    stages: [
        [1,'Martin Lucas','Capgemini France','Arezki Karim','01/04/2025','30/06/2025',490,'En cours','—'],
        [2,'Petit Emma','Orange Business','Leclerc Sophie','06/01/2025','28/03/2025',420,'Évalué','14.5'],
        [3,'Dupont Nathan','Thales Group','Rousseau Marc','13/01/2025','04/04/2025',490,'Terminé','—'],
        [4,'Bernard Léa','Société Générale','Arezki Karim','07/04/2025','27/06/2025',490,'En cours','—'],
        [5,'Moreau Tom','Airbus Defence','Blanc Julie','06/01/2025','28/03/2025',490,'Évalué','16.0'],
        [6,'Laurent Chloé','Atos SE','Leclerc Sophie','13/01/2025','04/04/2025',490,'Évalué','12.5'],
        [7,'Simon Alexis','Dassault Systèmes','Arezki Karim','02/06/2025','22/08/2025',490,'Conv. signée','—'],
        [8,'Michel Sarah','Sopra Steria','Blanc Julie','06/01/2025','28/03/2025',420,'Évalué','17.5'],
        [9,'Garcia Hugo','SNCF Connect','Rousseau Marc','13/01/2025','04/04/2025',490,'Terminé','—'],
        [10,'Martinez Inès','Engie Digital','Leclerc Sophie','06/01/2025','28/03/2025',490,'Évalué','15.0'],
        [11,'Roux Antoine','Capgemini France','Arezki Karim','07/04/2025','27/06/2025',490,'En cours','—'],
        [12,'Leroy Camille','Orange Business','Blanc Julie','01/06/2025','29/08/2025',490,'En recherche','—'],
        [13,'Fontaine Julien','Thales Group','Leclerc Sophie','01/06/2025','22/08/2025',490,'En recherche','—'],
        [14,'Girard Clara','Société Générale','Rousseau Marc','02/06/2025','29/08/2025',490,'Conv. signée','—'],
        [15,'Bonnet Pierre','Airbus Defence','Arezki Karim','01/04/2025','30/06/2025',490,'En cours','—'],
    ],
};

// ── Couleurs UITheme.java ─────────────────────────────────────
const C = {
    bg:'#0f172a', sidebar:'#0f172a', card:'#1e293b', border:'#334155',
    blue:'#2563eb', green:'#16a34a', purple:'#7c3aed', teal:'#0d9488',
    orange:'#ea580c', red:'#dc2626', text:'#f1f5f9', sub:'#94a3b8',
    statut:{'En cours':'#ea580c','Évalué':'#16a34a','Terminé':'#16a34a','En recherche':'#dc2626','Conv. signée':'#7c3aed'}
};

const NAV = [
    {key:'dashboard',   label:'Tableau de bord', color:C.blue  },
    {key:'etudiants',   label:'Etudiants',        color:C.green },
    {key:'professeurs', label:'Professeurs',       color:C.teal  },
    {key:'entreprises', label:'Entreprises',       color:C.purple},
    {key:'tuteurs',     label:'Tuteurs',           color:C.orange},
    {key:'stages',      label:'Stages',            color:C.red   },
];

// ── Configs champs de formulaire par entité ───────────────────
// Index 0 = ID (automatique), index 1..N = champs éditables
const FIELDS = {
    etudiants: [
        {label:'Nom',              type:'text',   required:true},
        {label:'Prénom',           type:'text',   required:true},
        {label:'Email',            type:'email'},
        {label:'Téléphone',        type:'text'},
        {label:'Classe',           type:'select', options:['BTS SIO SLAM 1','BTS SIO SLAM 2','BTS SIO SISR 1','BTS SIO SISR 2']},
        {label:'Année formation',  type:'number', min:1, max:2},
        {label:'N° Etudiant',      type:'text'},
    ],
    professeurs: [
        {label:'Nom',         type:'text', required:true},
        {label:'Prénom',      type:'text', required:true},
        {label:'Email',       type:'email'},
        {label:'Téléphone',   type:'text'},
        {label:'Matière',     type:'text'},
        {label:'Département', type:'text'},
    ],
    entreprises: [
        {label:'Nom',      type:'text', required:true},
        {label:'Adresse',  type:'text'},
        {label:'Ville',    type:'text'},
        {label:'CP',       type:'text'},
        {label:'Téléphone',type:'text'},
        {label:'Email',    type:'email'},
        {label:'Secteur',  type:'text'},
    ],
    tuteurs: [
        {label:'Nom',        type:'text', required:true},
        {label:'Prénom',     type:'text', required:true},
        {label:'Fonction',   type:'text'},
        {label:'Service',    type:'text'},
        {label:'Entreprise', type:'dynselect', src:'entreprises', display: r => r[1]},
    ],
    stages: [
        {label:'Etudiant',   type:'dynselect', src:'etudiants',   display: r => r[1]+' '+r[2]},
        {label:'Entreprise', type:'dynselect', src:'entreprises',  display: r => r[1]},
        {label:'Professeur', type:'dynselect', src:'professeurs',  display: r => r[1]+' '+r[2]},
        {label:'Début',      type:'text',  placeholder:'JJ/MM/AAAA'},
        {label:'Fin',        type:'text',  placeholder:'JJ/MM/AAAA'},
        {label:'Heures',     type:'number', min:0},
        {label:'Statut',     type:'select', options:['En recherche','Conv. signée','En cours','Terminé','Évalué']},
        {label:'Note /20',   type:'text',  placeholder:'— ou ex: 14.5'},
    ],
};

// ── État global ───────────────────────────────────────────────
let jappPage = 'dashboard';
let jappSel  = null; // { page, idx } ligne sélectionnée
let jappModalCb = null;
let jappConfirmCb = null;

// ── Entrée principale ─────────────────────────────────────────
function buildJavaApp() {
    return `<div class="japp" id="japp-root">
      ${buildSidebar()}
      <div class="japp-content" id="japp-content">
        ${buildDashboard()}
      </div>
    </div>`;
}

// ── Sidebar ───────────────────────────────────────────────────
function buildSidebar() {
    const items = NAV.map(n => `
      <button class="japp-nav ${n.key===jappPage?'active':''}"
              data-page="${n.key}" style="--nc:${n.color}"
              onclick="jappGo('${n.key}')">
        <span class="jnav-dot" style="background:${n.color}"></span>
        ${n.label}
      </button>`).join('');
    return `<div class="japp-sidebar">
      <div class="japp-logo">
        <div class="japp-logo-icon">GS</div>
        <div>
          <div class="japp-logo-title">GestionStages</div>
          <div class="japp-logo-sub">BTS SIO SLAM</div>
        </div>
      </div>
      <div class="japp-nav-list">${items}</div>
      <div class="japp-footer">v1.0 — Dylan Arezki<br><span style="color:#374151;font-size:10px">MODE DEMO</span></div>
    </div>`;
}

// ── Navigation ────────────────────────────────────────────────
function jappGo(page) {
    jappPage = page;
    jappSel  = null;
    document.querySelectorAll('.japp-nav').forEach(b =>
        b.classList.toggle('active', b.dataset.page === page));
    const content = document.getElementById('japp-content');
    content.style.opacity = '0';
    setTimeout(() => {
        content.innerHTML = jappBuildPage(page);
        content.style.opacity = '1';
    }, 100);
}

function jappBuildPage(page) {
    switch(page) {
        case 'dashboard':   return buildDashboard();
        case 'etudiants':   return buildEntityPanel('etudiants',   'Etudiants',
            ['ID','Nom','Prénom','Email','Téléphone','Classe','Année','N° Etudiant'],
            [40,80,80,180,110,140,55,105], C.green);
        case 'professeurs': return buildEntityPanel('professeurs', 'Professeurs',
            ['ID','Nom','Prénom','Email','Téléphone','Matière','Département'],
            [40,80,80,180,110,180,100], C.teal);
        case 'entreprises': return buildEntityPanel('entreprises', 'Entreprises',
            ['ID','Nom','Adresse','Ville','CP','Téléphone','Email','Secteur'],
            [40,140,150,90,55,110,160,120], C.purple);
        case 'tuteurs':     return buildEntityPanel('tuteurs',     'Tuteurs',
            ['ID','Nom','Prénom','Fonction','Service','Entreprise'],
            [40,90,90,130,100,160], C.orange);
        case 'stages':      return buildStages();
        default: return buildDashboard();
    }
}

// ── Dashboard ─────────────────────────────────────────────────
function buildDashboard() {
    const enCours = DEMO.stages.filter(s=>s[7]==='En cours').length;
    const termines = DEMO.stages.filter(s=>s[7]==='Terminé'||s[7]==='Évalué').length;
    const noted   = DEMO.stages.filter(s=>s[8]!=='—'&&s[8]!=='');
    const moy     = noted.length ? (noted.reduce((a,s)=>a+parseFloat(s[8]),0)/noted.length).toFixed(1) : '—';
    const stageEtIds = new Set(DEMO.stages.map(s=>s[1]));
    const sansStage  = DEMO.etudiants.filter(e=>!stageEtIds.has(e[1]+' '+e[2])).length;

    const cards = [
        {label:'ETUDIANTS',   val:DEMO.etudiants.length,   color:C.blue,   page:'etudiants'},
        {label:'PROFESSEURS', val:DEMO.professeurs.length,  color:C.green,  page:'professeurs'},
        {label:'ENTREPRISES', val:DEMO.entreprises.length,  color:C.purple, page:'entreprises'},
        {label:'STAGES',      val:DEMO.stages.length,       color:C.teal,   page:'stages'},
        {label:'EN COURS',    val:enCours,                  color:C.orange, page:'stages'},
        {label:'TERMINÉS',    val:termines,                 color:C.green,  page:'stages'},
        {label:'MOYENNE /20', val:moy,                      color:C.purple, page:'stages'},
        {label:'SANS STAGE',  val:sansStage,                color:C.red,    page:'etudiants'},
    ].map(c=>`
      <div class="jcard" style="--cc:${c.color};cursor:pointer" onclick="jappGo('${c.page}')">
        <div class="jcard-bar" style="background:${c.color}"></div>
        <div class="jcard-label">${c.label}</div>
        <div class="jcard-val" style="color:${c.color}">${c.val}</div>
      </div>`).join('');

    const recentRows = DEMO.stages.slice(-8).reverse().map((s,i)=>{
        const sc = C.statut[s[7]]||C.text;
        return `<tr class="${i%2===0?'':'alt'}">
          <td style="color:#64748b">${s[0]}</td><td>${s[1]}</td><td>${s[2]}</td>
          <td>${s[3]}</td><td>${s[4]}</td><td>${s[5]}</td><td>${s[6]}h</td>
          <td style="color:${sc};font-weight:700">${s[7]}</td>
          <td style="color:${C.teal}">${s[8]}</td>
        </tr>`;
    }).join('');

    return `<div class="jpanel">
      <div class="jpanel-header">
        <div>
          <div class="jpanel-title">Tableau de bord</div>
          <div class="jpanel-sub">Vue d'ensemble — Mode démo</div>
        </div>
        <button class="jbtn" style="background:${C.blue}" onclick="jappGo('dashboard')">↺ Actualiser</button>
      </div>
      <div class="jcards">${cards}</div>
      <div class="jtable-wrap">
        <div class="jtable-title" style="padding:12px 14px 0">Stages récents</div>
        <div class="jtable-scroll">
          <table class="jtable">
            <thead><tr><th>ID</th><th>Etudiant</th><th>Entreprise</th><th>Professeur</th>
            <th>Début</th><th>Fin</th><th>Heures</th><th>Statut</th><th>Note</th></tr></thead>
            <tbody>${recentRows}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}

// ── Panel générique avec CRUD ─────────────────────────────────
function buildEntityPanel(page, title, cols, widths, color) {
    const data = DEMO[page];
    const heads = cols.map((c,i)=>`<th style="min-width:${widths[i]||80}px">${c}</th>`).join('');
    const rows  = data.map((row,i)=>buildRow(row,i,page)).join('');

    return `<div class="jpanel">
      <div class="jpanel-header">
        <div>
          <div class="jpanel-title">${title}</div>
          <div class="jpanel-sub" id="sub-${page}">${data.length} enregistrement(s) — Mode démo</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
          <input class="jsearch" id="search-${page}" placeholder="Rechercher..."
                 oninput="jappSearch(this,'tbody-${page}')">
          <button class="jbtn" style="background:${color}" onclick="jappAdd('${page}')">+ Ajouter</button>
          <button class="jbtn-out" onclick="jappEdit('${page}')">Modifier</button>
          <button class="jbtn-out" style="color:${C.red};border-color:${C.red}" onclick="jappDelete('${page}')">Supprimer</button>
        </div>
      </div>
      <div class="jtable-wrap" style="margin-top:0">
        <div class="jtable-scroll">
          <table class="jtable">
            <thead><tr>${heads}</tr></thead>
            <tbody id="tbody-${page}">${rows}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}

function buildRow(row, idx, page) {
    const isSel = jappSel && jappSel.page===page && jappSel.idx===idx;
    const cells = row.map(v=>`<td>${v}</td>`).join('');
    const base  = idx%2===0?'':'alt';
    return `<tr class="${isSel?'jrow-sel':base}" data-idx="${idx}"
              onclick="jappSelectRow(this,'${page}',${idx})">${cells}</tr>`;
}

// ── Stages (panel spécial) ────────────────────────────────────
function buildStages() {
    const statuts = ['Tous','En recherche','Conv. signée','En cours','Terminé','Évalué'];
    const opts = statuts.map(s=>`<option>${s}</option>`).join('');
    const rows = DEMO.stages.map((s,i)=>{
        const sc = C.statut[s[7]]||C.text;
        const isSel = jappSel && jappSel.page==='stages' && jappSel.idx===i;
        const base  = i%2===0?'':'alt';
        return `<tr class="${isSel?'jrow-sel':base}" data-idx="${i}" data-statut="${s[7]}"
                  onclick="jappSelectRow(this,'stages',${i})">
          <td style="color:#64748b">${s[0]}</td><td>${s[1]}</td><td>${s[2]}</td>
          <td>${s[3]}</td><td>${s[4]}</td><td>${s[5]}</td><td>${s[6]}h</td>
          <td style="color:${sc};font-weight:700">${s[7]}</td>
          <td style="color:${C.teal}">${s[8]}</td>
        </tr>`;
    }).join('');

    return `<div class="jpanel">
      <div class="jpanel-header">
        <div>
          <div class="jpanel-title">Stages</div>
          <div class="jpanel-sub" id="sub-stages">${DEMO.stages.length} stage(s) — Mode démo</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <select class="jselect" onchange="jappFilterStatut(this.value)">${opts}</select>
          <button class="jbtn" style="background:${C.red}" onclick="jappAdd('stages')">+ Créer</button>
          <button class="jbtn-out" onclick="jappEdit('stages')">Modifier</button>
          <button class="jbtn-out" style="color:${C.red};border-color:${C.red}" onclick="jappDelete('stages')">Supprimer</button>
        </div>
      </div>
      <div class="jtable-wrap" style="margin-top:0">
        <div class="jtable-scroll">
          <table class="jtable">
            <thead><tr><th>ID</th><th>Etudiant</th><th>Entreprise</th><th>Professeur</th>
            <th>Début</th><th>Fin</th><th>Heures</th><th>Statut</th><th>Note</th></tr></thead>
            <tbody id="tbody-stages">${rows}</tbody>
          </table>
        </div>
      </div>
    </div>`;
}

// ── Sélection de ligne ────────────────────────────────────────
function jappSelectRow(tr, page, idx) {
    // Désélectionner si même ligne
    if (jappSel && jappSel.page===page && jappSel.idx===idx) {
        tr.classList.remove('jrow-sel');
        tr.className = idx%2===0 ? '' : 'alt';
        jappSel = null;
        return;
    }
    // Désélectionner l'ancienne
    document.querySelectorAll('.jrow-sel').forEach(r => {
        const i = parseInt(r.dataset.idx);
        r.classList.remove('jrow-sel');
        r.className = i%2===0 ? '' : 'alt';
    });
    tr.classList.add('jrow-sel');
    jappSel = { page, idx };
}

// ── CRUD : Ajouter ────────────────────────────────────────────
function jappAdd(page) {
    const fields = FIELDS[page];
    const empty  = [null, ...fields.map(()=>'')];
    jappOpenModal('Ajouter — ' + jappTitleOf(page), fields, empty, (row) => {
        const nextId = DEMO._id[page]++;
        row[0] = nextId;
        DEMO[page].push(row);
        jappSel = null;
        jappGo(page);
        jappToast('Enregistrement ajouté avec succès');
    });
}

// ── CRUD : Modifier ───────────────────────────────────────────
function jappEdit(page) {
    if (!jappSel || jappSel.page !== page) {
        jappToast('Sélectionnez d\'abord une ligne', C.orange);
        return;
    }
    const fields = FIELDS[page];
    const row    = [...DEMO[page][jappSel.idx]];
    jappOpenModal('Modifier — ' + jappTitleOf(page), fields, row, (newRow) => {
        newRow[0] = row[0]; // conserver l'ID
        DEMO[page][jappSel.idx] = newRow;
        const oldIdx = jappSel.idx;
        jappSel = null;
        jappGo(page);
        // Restaurer la sélection après re-render
        setTimeout(() => {
            const tr = document.querySelector(`#tbody-${page} tr[data-idx="${oldIdx}"]`);
            if (tr) jappSelectRow(tr, page, oldIdx);
        }, 150);
        jappToast('Enregistrement modifié avec succès');
    });
}

// ── CRUD : Supprimer ──────────────────────────────────────────
function jappDelete(page) {
    if (!jappSel || jappSel.page !== page) {
        jappToast('Sélectionnez d\'abord une ligne', C.orange);
        return;
    }
    const row = DEMO[page][jappSel.idx];
    const nom = page==='stages' ? `Stage #${row[0]} — ${row[1]}` : `${row[1]} ${row[2]||''}`.trim();
    jappConfirm(
        `Supprimer <strong>${nom}</strong> ?<br><span style="color:#94a3b8;font-size:11px">Cette action est irréversible.</span>`,
        () => {
            DEMO[page].splice(jappSel.idx, 1);
            jappSel = null;
            jappGo(page);
            jappToast('Enregistrement supprimé', C.red);
        }
    );
}

// ── Modal formulaire ──────────────────────────────────────────
function jappOpenModal(title, fields, row, onSave) {
    jappCloseModal();
    jappModalCb = onSave;

    const formRows = fields.map((f, fi) => {
        const val = row[fi+1] !== undefined ? row[fi+1] : '';
        let input = '';
        if (f.type === 'select') {
            const opts = f.options.map(o=>`<option ${o==val?'selected':''}>${o}</option>`).join('');
            input = `<select name="f${fi}" class="jselect jfield">${opts}</select>`;
        } else if (f.type === 'dynselect') {
            const options = DEMO[f.src].map(r => f.display(r));
            const opts = options.map(o=>`<option ${o==val?'selected':''}>${o}</option>`).join('');
            input = `<select name="f${fi}" class="jselect jfield">${opts}</select>`;
        } else {
            input = `<input type="${f.type||'text'}" name="f${fi}" value="${String(val).replace(/"/g,'&quot;')}"
                       class="jsearch jfield" style="width:100%" ${f.required?'required':''}
                       ${f.placeholder?`placeholder="${f.placeholder}"`:''}
                       ${f.min!==undefined?`min="${f.min}"`:''}
                       ${f.max!==undefined?`max="${f.max}"`:''}>`;
        }
        return `<div class="jform-row">
          <label class="jform-label">${f.label}${f.required?' <span style="color:#dc2626">*</span>':''}</label>
          ${input}
        </div>`;
    }).join('');

    const modal = document.createElement('div');
    modal.className = 'jmodal-overlay';
    modal.id = 'japp-modal';
    modal.innerHTML = `
      <div class="jmodal" onclick="event.stopPropagation()">
        <div class="jmodal-header">
          <span>${title}</span>
          <button class="jbtn-close" onclick="jappCloseModal()">✕</button>
        </div>
        <form class="jmodal-form" id="jmodal-form" onsubmit="jappSubmitModal(event)">
          <div class="jform-grid">${formRows}</div>
          <div class="jmodal-footer">
            <button type="button" class="jbtn-out" onclick="jappCloseModal()">Annuler</button>
            <button type="submit" class="jbtn" style="background:${C.blue}">✓ Enregistrer</button>
          </div>
        </form>
      </div>`;
    modal.addEventListener('click', jappCloseModal);
    document.getElementById('japp-root').appendChild(modal);
    // Focus premier champ
    setTimeout(() => { const f = modal.querySelector('.jfield'); if(f) f.focus(); }, 50);
}

function jappCloseModal() {
    const m = document.getElementById('japp-modal');
    if (m) m.remove();
    jappModalCb = null;
}

function jappSubmitModal(e) {
    e.preventDefault();
    if (!jappModalCb) return;
    const form = e.target;
    const inputs = form.querySelectorAll('[name^="f"]');
    const row = [null]; // index 0 = ID (sera rempli après)
    inputs.forEach(inp => {
        const v = inp.value;
        const n = parseFloat(v);
        row.push(inp.type === 'number' ? (isNaN(n) ? v : n) : v);
    });
    jappModalCb(row);
    jappCloseModal();
}

// ── Dialogue de confirmation ──────────────────────────────────
function jappConfirm(msg, onOk) {
    jappCloseConfirm();
    jappConfirmCb = onOk;
    const d = document.createElement('div');
    d.className = 'jmodal-overlay';
    d.id = 'japp-confirm';
    d.innerHTML = `
      <div class="jmodal" style="max-width:400px" onclick="event.stopPropagation()">
        <div class="jmodal-header">
          <span style="color:${C.red}">⚠ Confirmer la suppression</span>
          <button class="jbtn-close" onclick="jappCloseConfirm()">✕</button>
        </div>
        <div style="padding:20px 24px;color:#e2e8f0;line-height:1.6">${msg}</div>
        <div class="jmodal-footer">
          <button class="jbtn-out" onclick="jappCloseConfirm()">Annuler</button>
          <button class="jbtn" style="background:${C.red}" onclick="jappDoConfirm()">Supprimer</button>
        </div>
      </div>`;
    d.addEventListener('click', jappCloseConfirm);
    document.getElementById('japp-root').appendChild(d);
}
function jappCloseConfirm() {
    const d = document.getElementById('japp-confirm');
    if (d) d.remove();
    jappConfirmCb = null;
}
function jappDoConfirm() {
    jappCloseConfirm();
    if (jappConfirmCb) jappConfirmCb();
}

// ── Toast notification ────────────────────────────────────────
function jappToast(msg, color) {
    const old = document.getElementById('japp-toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.id = 'japp-toast';
    t.className = 'jtoast';
    t.style.borderLeftColor = color || C.green;
    t.textContent = msg;
    document.getElementById('japp-root').appendChild(t);
    setTimeout(() => t.classList.add('jtoast-in'), 10);
    setTimeout(() => { t.classList.remove('jtoast-in'); setTimeout(()=>t.remove(), 300); }, 2500);
}

// ── Recherche & filtres ───────────────────────────────────────
function jappSearch(input, tbodyId) {
    const q = input.value.toLowerCase();
    document.querySelectorAll('#' + tbodyId + ' tr').forEach(tr => {
        tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

function jappFilterStatut(val) {
    document.querySelectorAll('#tbody-stages tr').forEach(tr => {
        tr.style.display = (val==='Tous' || tr.dataset.statut===val) ? '' : 'none';
    });
}

// ── Utilitaires ───────────────────────────────────────────────
function jappTitleOf(page) {
    return NAV.find(n=>n.key===page)?.label || page;
}
