// ============================================================
//  VICE PORTFOLIO — game.js
//  Pure 2D Canvas pixel-art top-down game
//  GTA 2 style / Vice City / Miami atmosphere
// ============================================================

// ── Virtual canvas resolution ────────────────────────────────
const VW     = 960;   // virtual canvas width  (pixels)
const VH     = 540;   // virtual canvas height (pixels)
const WU_PX  = 24;    // virtual pixels per world unit
const SPX    = 2;     // sprite pixels
const S      = 3;     // render scale factor vs legacy 8px/WU base

// ── Speed ────────────────────────────────────────────────────
const WALK_SPEED = 0.10;
const RUN_SPEED  = 0.20;

// ── World limits ─────────────────────────────────────────────
const MAP_LIMIT = 36;

// ── Minimap ──────────────────────────────────────────────────
const MM_PX    = 200;
const MM_WORLD = 80;
const MM_SCALE = MM_PX / MM_WORLD;
const MM_ORIG  = MM_WORLD / 2;

// ============================================================
//  STATE
// ============================================================
let vCanvas, vCtx;          // virtual low-res canvas
let displayCanvas, dCtx;    // display canvas (fills window)
let mmCtx;                   // minimap canvas context

let cam    = { x: 0, z: 6 };
let player = { x: 0, z: 6, facing: 'S', animFrame: 0, animTick: 0 };
let keys   = {};
let isMoving = false, isRunning = false;
let zones  = [];
let currentDlg = null, currentPage = 0;
let gameStarted = false;
let lastTime = 0;
let tick = 0;

// NPC anim phases
let npcPhases = [];

// Ocean wave tick
let waveTime = 0;

// Interaction zone glow pulse
let glowPulse = 0;

// ── Decorative buildings defined inline ──────────────────────
const DECOR_BUILDINGS = [];

// ── Cars defined inline ──────────────────────────────────────
const CARS = [
    { x: -3,  z: -6,  rot: 0,            color: 0xcc2222 },
    { x:  3,  z: -6,  rot: 0,            color: 0x22aacc },
    { x: -3,  z: -19, rot: 0,            color: 0x22cc44 },
    { x:  3,  z: -19, rot: 0,            color: 0xccaa22 },
    { x: -11, z:  2,  rot: Math.PI / 2,  color: 0x8822cc },
    { x: -11, z: -2,  rot: Math.PI / 2,  color: 0xcc5522 },
    { x:  11, z:  2,  rot: Math.PI / 2,  color: 0x2244cc },
    { x:  11, z: -2,  rot: Math.PI / 2,  color: 0xff2d78 },
    { x:  3,  z:  22, rot: 0,            color: 0x44bbcc },
    { x: -3,  z:  22, rot: 0,            color: 0xaa44cc },
];

// ── Palm tree positions ───────────────────────────────────────
const PALMS = [
    { x: -5, z: -5 }, { x: 5, z: -5 }, { x: -5, z: 5 }, { x: 5, z: 5 },
    { x: 29, z:  0 }, { x: 29, z:-12 }, { x: 29, z: 12 },
    { x: 29, z:-24 }, { x: 29, z: 24 },
    { x:-28, z:-24 }, { x:-28, z:  4 }, { x:-28, z: 28 },
    { x:-14, z:-28 }, { x: 14, z:-28 },
    { x:-14, z: 30 }, { x: 14, z: 30 },
    { x:  0, z:-28 }, { x:  0, z: 32 },
];

// ── Streetlamps ───────────────────────────────────────────────
const LAMPS = [
    { x: -5, z: -9,  color: 0xff2d78 }, { x: 5, z: -9,  color: 0x00f0ff },
    { x: -5, z:  5,  color: 0x00f0ff }, { x: 5, z:  5,  color: 0xff2d78 },
    { x: -5, z: -22, color: 0x9b30ff }, { x: 5, z: -22, color: 0xff2d78 },
    { x: -5, z:  21, color: 0x00f0ff }, { x: 5, z:  21, color: 0x9b30ff },
    { x:-12, z: -5,  color: 0x00f0ff }, { x:12, z: -5,  color: 0xff2d78 },
    { x:-12, z:  5,  color: 0xff2d78 }, { x:12, z:  5,  color: 0x00f0ff },
    { x: 27, z:-16,  color: 0x00f0ff }, { x:27, z:  0,  color: 0xff2d78 }, { x:27, z: 16, color: 0x00f0ff },
];

// ── Neon billboards ───────────────────────────────────────────
const BILLBOARDS = [
    { x: -5, z: -22, color: 0xff2d78, w: 6, h: 2 },
    { x:  5, z: -22, color: 0x00f0ff, w: 5, h: 2 },
    { x:  0, z:  30, color: 0x9b30ff, w: 10,h: 2 },
    { x: -5, z:  30, color: 0xffd700, w: 5, h: 2 },
];

// ============================================================
//  HELPERS
// ============================================================
function hexColor(n) {
    return '#' + n.toString(16).padStart(6, '0');
}

function wx2s(wx) { return Math.round((wx - cam.x) * WU_PX + VW / 2); }
function wz2s(wz) { return Math.round((wz - cam.z) * WU_PX + VH / 2); }

function onScreen(sx, sz, margin) {
    margin = margin || S * 20;
    return sx > -margin && sx < VW + margin && sz > -margin && sz < VH + margin;
}

function lerp(a, b, t) { return a + (b - a) * t; }

function dist2D(ax, az, bx, bz) {
    return Math.sqrt((ax - bx) ** 2 + (az - bz) ** 2);
}

// ============================================================
//  INIT
// ============================================================
function init() {
    // Virtual canvas (offscreen, low-res)
    vCanvas = document.createElement('canvas');
    vCanvas.width  = VW;
    vCanvas.height = VH;
    vCtx = vCanvas.getContext('2d');
    vCtx.imageSmoothingEnabled = false;

    // Display canvas (fills screen)
    displayCanvas = document.getElementById('game-canvas');
    displayCanvas.width  = window.innerWidth;
    displayCanvas.height = window.innerHeight;
    dCtx = displayCanvas.getContext('2d');
    dCtx.imageSmoothingEnabled = false;

    // Minimap
    mmCtx = document.getElementById('mm-canvas').getContext('2d');

    // Build interaction zones from BUILDINGS
    window.BUILDINGS.forEach(b => {
        zones.push({
            id: b.id,
            name: b.zoneName,
            x: b.x,
            z: b.z + b.d / 2 + 1.5,
            radius: 5.5,
            data: b.dialogue,
            type: b.type || 'dialogue',
            appId: b.appId || null,
            isBuilding: true
        });
    });

    // Build interaction zones from NPCs
    window.NPCS.forEach((n, i) => {
        npcPhases.push(Math.random() * Math.PI * 2);
        zones.push({
            id: n.id,
            name: n.emoji + ' ' + n.name,
            x: n.pos.x,
            z: n.pos.z,
            radius: 4.5,
            data: n.dialogue,
            isNPC: true
        });
    });

    setupControls();
    setupUI();
    window.addEventListener('resize', onResize);
    requestAnimationFrame(loop);
}

// ============================================================
//  CONTROLS
// ============================================================
function setupControls() {
    document.addEventListener('keydown', e => {
        keys[e.code] = true;
        if (!gameStarted) return;
        if (e.code === 'Numpad5' || e.code === 'Enter') handleInteract();
        if (e.code === 'Numpad0' || e.code === 'Digit0') toggleMenu();
        if (terminalRunning) {
            if (e.code === 'Escape') closeTerminal();
        }
        if (currentDlg) {
            if (e.code === 'Numpad6' || e.code === 'ArrowRight') nextPage();
            if (e.code === 'Numpad4' || e.code === 'ArrowLeft')  prevPage();
            if (e.code === 'Escape') closeDialog();
        }
        const rapportModal = document.getElementById('rapport-modal');
        if (rapportModal && rapportModal.style.display !== 'none') {
            if (e.code === 'Escape') closeRapport();
        }
        const veilleMmaModal = document.getElementById('veille-mma-modal');
        if (veilleMmaModal && veilleMmaModal.style.display !== 'none') {
            if (e.code === 'Escape') closeVeilleMma();
        }
        // Prevent page scroll on arrows
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
            e.preventDefault();
        }
    });
    document.addEventListener('keyup', e => { keys[e.code] = false; });
}

// ============================================================
//  UI SETUP
// ============================================================
function setupUI() {
    document.getElementById('start-btn').addEventListener('click', () => {
        gameStarted = true;
        document.getElementById('intro-screen').classList.add('hidden');
    });
    document.getElementById('dlg-close').addEventListener('click', closeDialog);
    document.getElementById('menu-close').addEventListener('click', () => {
        document.getElementById('main-menu').classList.add('hidden');
    });
    document.getElementById('next-btn').addEventListener('click', nextPage);
    document.getElementById('prev-btn').addEventListener('click', prevPage);
}

// ============================================================
//  GAME LOOP
// ============================================================
function loop(now) {
    requestAnimationFrame(loop);
    const dt = Math.min((now - lastTime) / 16.667, 3); // normalize to 60fps, cap at 3x
    lastTime = now;

    if (gameStarted) {
        updatePlayer(dt);
        updateCamera();
        updateAnimations(dt);
        updateHUD();
    }

    waveTime += 0.016 * dt;
    glowPulse = (Math.sin(now * 0.004) + 1) / 2;
    tick++;

    render();
    drawMinimap();
}

// ============================================================
//  COLLISION
// ============================================================
const PLAYER_R = 0.5; // rayon du joueur

function hitsBuilding(px, pz) {
    for (const b of window.BUILDINGS) {
        if (px > b.x - b.w / 2 - PLAYER_R && px < b.x + b.w / 2 + PLAYER_R &&
            pz > b.z - b.d / 2 - PLAYER_R && pz < b.z + b.d / 2 + PLAYER_R) {
            return true;
        }
    }
    return false;
}

// ============================================================
//  PLAYER UPDATE
// ============================================================
function updatePlayer(dt) {
    if (currentDlg) { isMoving = false; return; }
    if (!document.getElementById('main-menu').classList.contains('hidden')) {
        isMoving = false; return;
    }

    isRunning = keys['ShiftLeft'] || keys['ShiftRight'];

    let dx = 0, dz = 0;
    if (keys['Numpad8'] || keys['ArrowUp'])    dz -= 1;
    if (keys['Numpad2'] || keys['ArrowDown'])  dz += 1;
    if (keys['Numpad4'] || keys['ArrowLeft'])  dx -= 1;
    if (keys['Numpad6'] || keys['ArrowRight']) dx += 1;

    isMoving = (dx !== 0 || dz !== 0);
    if (!isMoving) return;

    // Normalize diagonal
    const len = Math.sqrt(dx * dx + dz * dz);
    dx /= len; dz /= len;

    const speed = (isRunning ? RUN_SPEED : WALK_SPEED) * dt;
    const nx = player.x + dx * speed;
    const nz = player.z + dz * speed;

    if (Math.abs(nx) < MAP_LIMIT && !hitsBuilding(nx, player.z)) player.x = nx;
    if (Math.abs(nz) < MAP_LIMIT && !hitsBuilding(player.x, nz)) player.z = nz;

    // Facing direction
    if (Math.abs(dz) >= Math.abs(dx)) {
        player.facing = dz < 0 ? 'N' : 'S';
    } else {
        player.facing = dx < 0 ? 'W' : 'E';
    }
}

// ============================================================
//  CAMERA
// ============================================================
function updateCamera() {
    cam.x = lerp(cam.x, player.x, 0.08);
    cam.z = lerp(cam.z, player.z, 0.08);
}

// ============================================================
//  ANIMATION TICKS
// ============================================================
function updateAnimations(dt) {
    if (isMoving) {
        const rate = isRunning ? 4 : 8;
        player.animTick += dt;
        if (player.animTick >= rate) {
            player.animTick = 0;
            player.animFrame = 1 - player.animFrame;
        }
    } else {
        player.animFrame = 0;
        player.animTick = 0;
    }
}

// ============================================================
//  HUD
// ============================================================
function updateHUD() {
    const z = nearestZone();
    const prompt = document.getElementById('interact-prompt');
    const label  = document.getElementById('zone-label');
    if (z && !currentDlg) {
        prompt.classList.remove('hidden');
        label.textContent = z.name;
    } else {
        prompt.classList.add('hidden');
        if (!currentDlg) label.textContent = isRunning ? 'COURSE' : '';
    }
}

// ============================================================
//  INTERACTION
// ============================================================
function nearestZone() {
    let best = null, bestDist = Infinity;
    zones.forEach(z => {
        const d = dist2D(player.x, player.z, z.x, z.z);
        if (d <= z.radius && d < bestDist) {
            bestDist = d;
            best = z;
        }
    });
    return best;
}

function handleInteract() {
    if (currentDlg) { closeDialog(); return; }
    const z = nearestZone();
    console.log('[Interact] zone:', z ? z.id + ' type=' + z.type : 'null');
    if (!z) return;
    if (z.type === 'terminal')   { openTerminal(z);   return; }
    if (z.type === 'rapport')    { openRapport();     return; }
    if (z.type === 'veille_mma') { openVeilleMma();   return; }
    openDialog(z);
}

function openDialog(zone) {
    currentDlg  = zone.data;
    currentPage = 0;
    renderDlg();
    document.getElementById('dialog-box').classList.remove('hidden');
    document.getElementById('interact-prompt').classList.add('hidden');
}

function closeDialog() {
    currentDlg = null;
    document.getElementById('dialog-box').classList.add('hidden');
}

function openAppFromDialog(appId) {
    closeDialog();
    openTerminal({ appId: appId });
}

// ============================================================
//  RAPPORT DE STAGE — Visionneuse PDF
// ============================================================
function openRapport() {
    document.getElementById('interact-prompt').classList.add('hidden');
    let modal = document.getElementById('rapport-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'rapport-modal';
        modal.style.cssText = `
            position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,0.92);
            display:flex;flex-direction:column;pointer-events:all;
        `;
        modal.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;
                        padding:10px 18px;background:#1a1000;border-bottom:2px solid #ffd700;flex-shrink:0">
                <span style="color:#ffd700;font-family:monospace;font-weight:700;font-size:14px;letter-spacing:2px">
                    📄 RAPPORT DE STAGE — BTS SIO SLAM — Dylan Arezki
                </span>
                <div style="display:flex;gap:10px;align-items:center">
                    <a href="rapport-stage.pdf" target="_blank"
                       style="color:#ffd700;font-size:12px;text-decoration:none;border:1px solid #ffd700;
                              padding:4px 10px;border-radius:4px;pointer-events:all">
                        ↗ Ouvrir / Télécharger
                    </a>
                    <button onclick="closeRapport()"
                            style="background:transparent;border:1px solid #ffd700;color:#ffd700;
                                   cursor:pointer;font-size:16px;padding:2px 10px;border-radius:4px">✕</button>
                </div>
            </div>
            <iframe src="rapport-stage.pdf" style="flex:1;border:none;width:100%;background:#fff"></iframe>
        `;
        document.getElementById('ui').appendChild(modal);
    } else {
        modal.style.display = 'flex';
    }
}
function closeRapport() {
    const m = document.getElementById('rapport-modal');
    if (m) m.style.display = 'none';
}

// ============================================================
//  VEILLE MMA — Visionneuse HTML
// ============================================================
function openVeilleMma() {
    console.log('[VeilleMMA] openVeilleMma() appelé');
    document.getElementById('interact-prompt').classList.add('hidden');
    let modal = document.getElementById('veille-mma-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'veille-mma-modal';
        modal.style.cssText = `
            position:fixed;inset:0;z-index:3000;background:rgba(0,0,0,0.92);
            display:flex;flex-direction:column;pointer-events:all;
        `;
        modal.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;
                        padding:10px 18px;background:#1a0000;border-bottom:2px solid #e63946;flex-shrink:0">
                <span style="color:#e63946;font-family:monospace;font-weight:700;font-size:14px;letter-spacing:2px">
                    🥊 VEILLE TECHNOLOGIQUE — Technologies dans le MMA — Dylan Arezki
                </span>
                <div style="display:flex;gap:10px;align-items:center">
                    <a href="veille_mma.html" target="_blank"
                       style="color:#e63946;font-size:12px;text-decoration:none;border:1px solid #e63946;
                              padding:4px 10px;border-radius:4px;pointer-events:all">
                        ↗ Ouvrir dans un onglet
                    </a>
                    <button onclick="closeVeilleMma()"
                            style="background:transparent;border:1px solid #e63946;color:#e63946;
                                   cursor:pointer;font-size:16px;padding:2px 10px;border-radius:4px">✕</button>
                </div>
            </div>
            <iframe src="veille_mma.html" style="flex:1;border:none;width:100%;background:#0f0f13"></iframe>
        `;
        document.getElementById('ui').appendChild(modal);
    } else {
        modal.style.display = 'flex';
    }
}
function closeVeilleMma() {
    const m = document.getElementById('veille-mma-modal');
    if (m) m.style.display = 'none';
}

// ============================================================
//  TERMINAUX APPLICATIFS — Multi-app (Java + PHP web)
// ============================================================
let terminalRunning = false;
let terminalInterval = null;
let cheerpjReady = false;
let cheerpjLoading = false;
let currentAppId = null;

const APP_BOOT_SCRIPTS = {
    gestion_stages: [
        { delay: 0,    text: 'C:\\GestionStages> java -jar GestionStages.jar', cls: 'term-cmd' },
        { delay: 300,  text: '' },
        { delay: 400,  text: '╔══════════════════════════════════════════════════╗', cls: 'term-border' },
        { delay: 450,  text: '║     SYSTÈME DE GESTION DES STAGES - BTS SIO     ║', cls: 'term-title' },
        { delay: 500,  text: '║              Dylan Arezki  —  v1.0               ║', cls: 'term-sub' },
        { delay: 550,  text: '╚══════════════════════════════════════════════════╝', cls: 'term-border' },
        { delay: 700,  text: '' },
        { delay: 800,  text: '[INFO] Initialisation du runtime Java WebAssembly...', cls: 'term-info' },
        { delay: 1000, text: '[INFO] Chargement de GestionStages.jar (2.7 MB)...', cls: 'term-info' },
        { delay: 1400, text: '[OK]   Bytecode Java compilé → WebAssembly', cls: 'term-ok' },
        { delay: 1600, text: '' },
        { delay: 1700, text: '══════════  ARCHITECTURE MVC + DAO  ══════════', cls: 'term-section' },
        { delay: 1900, text: '  Model    →  Personne, Etudiant, Stage, Entreprise', cls: 'term-arch' },
        { delay: 2100, text: '  DAO      →  JDBC / MySQL (Singleton Pattern)', cls: 'term-arch' },
        { delay: 2300, text: '  Ctrl     →  EtudiantCtrl, StageCtrl, ...', cls: 'term-arch' },
        { delay: 2500, text: '  View     →  Java Swing (GUI client lourd)', cls: 'term-arch' },
        { delay: 2700, text: '' },
        { delay: 2900, text: '[OK]   Lancement de l\'interface Swing...', cls: 'term-ok' },
        { delay: 3100, text: '' },
        { delay: 3200, text: '> Patientez — démarrage en cours...', cls: 'term-hint' },
    ],
    location: [
        { delay: 0,    text: '$ php artisan serve --app=LocationVoitures', cls: 'term-cmd' },
        { delay: 300,  text: '' },
        { delay: 400,  text: '╔══════════════════════════════════════════════════╗', cls: 'term-border' },
        { delay: 450,  text: '║         LOCATION DE VOITURES - BTS SIO          ║', cls: 'term-title' },
        { delay: 500,  text: '║              Dylan Arezki  —  v1.0               ║', cls: 'term-sub' },
        { delay: 550,  text: '╚══════════════════════════════════════════════════╝', cls: 'term-border' },
        { delay: 700,  text: '' },
        { delay: 800,  text: '[INFO] Chargement de l\'application PHP...', cls: 'term-info' },
        { delay: 1100, text: '[INFO] PDO/MySQL → Mode démo (données en mémoire)', cls: 'term-info' },
        { delay: 1500, text: '[OK]   Application prête', cls: 'term-ok' },
        { delay: 1700, text: '' },
        { delay: 1900, text: '> Lancement de l\'interface...', cls: 'term-hint' },
    ],
    resa: [
        { delay: 0,    text: '$ php -S localhost:8000 -t resa_vva/', cls: 'term-cmd' },
        { delay: 300,  text: '' },
        { delay: 400,  text: '╔══════════════════════════════════════════════════╗', cls: 'term-border' },
        { delay: 450,  text: '║      RESA VVA - RÉSERVATIONS VACANCES           ║', cls: 'term-title' },
        { delay: 500,  text: '║              Dylan Arezki  —  v1.0               ║', cls: 'term-sub' },
        { delay: 550,  text: '╚══════════════════════════════════════════════════╝', cls: 'term-border' },
        { delay: 700,  text: '' },
        { delay: 800,  text: '[INFO] Chargement de l\'application PHP...', cls: 'term-info' },
        { delay: 1100, text: '[INFO] Base RESA → Mode démo (données en mémoire)', cls: 'term-info' },
        { delay: 1500, text: '[OK]   Application prête', cls: 'term-ok' },
        { delay: 1700, text: '' },
        { delay: 1900, text: '> Lancement de l\'interface...', cls: 'term-hint' },
    ],
    zoo: [
        { delay: 0,    text: '$ php -S localhost:8000 -t zoo_site/', cls: 'term-cmd' },
        { delay: 300,  text: '' },
        { delay: 400,  text: '╔══════════════════════════════════════════════════╗', cls: 'term-border' },
        { delay: 450,  text: '║        ZOO MANAGER - GESTION DU ZOO             ║', cls: 'term-title' },
        { delay: 500,  text: '║              Dylan Arezki  —  v1.0               ║', cls: 'term-sub' },
        { delay: 550,  text: '╚══════════════════════════════════════════════════╝', cls: 'term-border' },
        { delay: 700,  text: '' },
        { delay: 800,  text: '[INFO] Chargement de l\'application PHP...', cls: 'term-info' },
        { delay: 1100, text: '[INFO] Base zoo_vf → Mode démo (données en mémoire)', cls: 'term-info' },
        { delay: 1500, text: '[OK]   Application prête', cls: 'term-ok' },
        { delay: 1700, text: '' },
        { delay: 1900, text: '> Lancement de l\'interface...', cls: 'term-hint' },
    ],
};

function getAppBuilder(appId) {
    switch (appId) {
        case 'gestion_stages': return () => { jappPage = 'dashboard'; return buildJavaApp(); };
        case 'location':       return () => { locPage  = 'dashboard'; return buildLocationApp(); };
        case 'resa':           return () => { resaPage = 'dashboard'; return buildResaApp(); };
        case 'zoo':            return () => { zooPage  = 'dashboard'; return buildZooApp(); };
        default:               return () => { jappPage = 'dashboard'; return buildJavaApp(); };
    }
}

function openTerminal(zone) {
    if (terminalRunning) return;
    terminalRunning = true;
    currentAppId = (zone && zone.appId) ? zone.appId : 'gestion_stages';
    document.getElementById('interact-prompt').classList.add('hidden');

    const modal       = document.getElementById('terminal-modal');
    const body        = document.getElementById('terminal-body');
    const javaDisplay = document.getElementById('java-display');
    const titleLabels = {
        gestion_stages: 'GestionStages.jar — CheerpJ 4 — Java WebAssembly',
        location:       'Location Voitures — PHP · PDO · MySQL',
        resa:           'RESA VVA — PHP · PDO · MySQL',
        zoo:            'Zoo Manager — PHP · MySQLi',
    };
    document.getElementById('terminal-title').textContent =
        titleLabels[currentAppId] || 'Terminal — Vice Portfolio';
    modal.classList.remove('hidden');
    body.innerHTML = '';
    javaDisplay.innerHTML = '';
    body.classList.remove('hidden');
    javaDisplay.classList.add('hidden');

    const script = APP_BOOT_SCRIPTS[currentAppId] || APP_BOOT_SCRIPTS['gestion_stages'];
    let i = 0;
    function printNext() {
        if (!terminalRunning) return;
        if (i >= script.length) {
            terminalInterval = setTimeout(launchApp, 400);
            return;
        }
        const line = script[i++];
        const div = document.createElement('div');
        div.className = 'term-line ' + (line.cls || '');
        div.textContent = line.text;
        body.appendChild(div);
        body.scrollTop = body.scrollHeight;
        const nextDelay = i < script.length
            ? script[i].delay - line.delay
            : 0;
        terminalInterval = setTimeout(printNext, nextDelay);
    }
    printNext();
}

// ── Lancement app (CheerpJ pour Java, HTML direct pour les autres) ──
async function launchApp() {
    if (!terminalRunning) return;
    const body        = document.getElementById('terminal-body');
    const javaDisplay = document.getElementById('java-display');
    const appId       = currentAppId || 'gestion_stages';

    function addLine(text, cls) {
        const d = document.createElement('div');
        d.className = 'term-line ' + (cls || '');
        d.textContent = text;
        body.appendChild(d);
        body.scrollTop = body.scrollHeight;
    }

    function fadeToDisplay(fillFn) {
        return new Promise(resolve => {
            body.style.transition = 'opacity .35s';
            body.style.opacity = '0';
            setTimeout(() => {
                body.classList.add('hidden');
                body.style.opacity = '';
                javaDisplay.classList.remove('hidden');
                if (fillFn) fillFn();
                resolve();
            }, 350);
        });
    }

    // ── CheerpJ uniquement pour GestionStages ────────────────
    if (appId === 'gestion_stages' && typeof cheerpjInit !== 'undefined') {
        try {
            addLine('[INFO] Runtime CheerpJ détecté — démarrage Java réel...', 'term-ok');
            await cheerpjInit({ display: javaDisplay });
            await fadeToDisplay(null);
            await cheerpjRunJar('/app/GestionStages.jar');
            return;
        } catch (e) {
            console.warn('[CheerpJ]', e);
            javaDisplay.innerHTML = '';
            javaDisplay.classList.add('hidden');
            body.classList.remove('hidden');
            body.style.opacity = '1';
            addLine('', '');
            addLine('[WARN]  Connexion MySQL indisponible en mode web.', 'term-info');
            addLine('[INFO]  Activation du mode démo interactif...', 'term-info');
            await new Promise(r => setTimeout(r, 900));
        }
    } else {
        addLine('[INFO]  Mode démo interactif activé.', 'term-info');
        await new Promise(r => setTimeout(r, 500));
    }

    // ── Lancement HTML interactif ────────────────────────────
    const builder = getAppBuilder(appId);
    await fadeToDisplay(() => {
        javaDisplay.innerHTML = builder();
    });
}

function closeTerminal() {
    terminalRunning = false;
    if (terminalInterval) { clearTimeout(terminalInterval); terminalInterval = null; }
    document.getElementById('terminal-modal').classList.add('hidden');
    document.getElementById('terminal-body').classList.remove('hidden');
    document.getElementById('java-display').classList.add('hidden');
    document.getElementById('terminal-body').innerHTML = '';
    document.getElementById('java-display').innerHTML = '';
}

function renderDlg() {
    if (!currentDlg) return;
    const p = currentDlg.pages[currentPage];
    document.getElementById('dlg-portrait').textContent = p.portrait || '💬';
    document.getElementById('dlg-speaker').textContent  = p.speaker  || '';
    document.getElementById('dlg-title').textContent    = p.title    || '';
    document.getElementById('dlg-content').innerHTML    = p.body     || '';
    const nav = document.getElementById('dlg-nav');
    const n   = currentDlg.pages.length;
    if (n > 1) {
        nav.classList.remove('hidden');
        document.getElementById('page-ind').textContent = `${currentPage + 1} / ${n}`;
        document.getElementById('prev-btn').disabled    = (currentPage === 0);
        document.getElementById('next-btn').disabled    = (currentPage === n - 1);
    } else {
        nav.classList.add('hidden');
    }
}

function nextPage() {
    if (currentDlg && currentPage < currentDlg.pages.length - 1) {
        currentPage++;
        renderDlg();
    }
}

function prevPage() {
    if (currentDlg && currentPage > 0) {
        currentPage--;
        renderDlg();
    }
}

function toggleMenu() {
    const m = document.getElementById('main-menu');
    if (m.classList.contains('hidden')) {
        closeDialog();
        m.classList.remove('hidden');
    } else {
        m.classList.add('hidden');
    }
}

// ============================================================
//  RENDER PIPELINE
// ============================================================
function render() {
    // 1. Clear virtual canvas
    vCtx.fillStyle = '#0a1208';
    vCtx.fillRect(0, 0, VW, VH);

    // 2. Ground
    renderGround();

    // 3. Collect all drawable objects (z-sorted painter's algorithm)
    const objects = [];

    // Decorative buildings
    DECOR_BUILDINGS.forEach(b => {
        objects.push({ sortZ: b.z + b.d / 2, draw: () => renderBuilding(b, false) });
    });

    // Interactive buildings
    window.BUILDINGS.forEach(b => {
        objects.push({ sortZ: b.z + b.d / 2, draw: () => renderBuilding(b, true) });
    });

    // Cars
    CARS.forEach(c => {
        objects.push({ sortZ: c.z + 1.5, draw: () => renderCar(c) });
    });

    // Palm trees
    PALMS.forEach(p => {
        objects.push({ sortZ: p.z + 1, draw: () => renderPalm(p.x, p.z) });
    });

    // Streetlamps
    LAMPS.forEach(l => {
        objects.push({ sortZ: l.z + 0.5, draw: () => renderLamp(l) });
    });

    // Billboards
    BILLBOARDS.forEach(b => {
        objects.push({ sortZ: b.z + 0.5, draw: () => renderBillboard(b) });
    });

    // NPCs
    window.NPCS.forEach((n, i) => {
        objects.push({ sortZ: n.pos.z + 0.5, draw: () => renderNPC(n, i) });
    });

    // Player
    objects.push({ sortZ: player.z + 0.5, draw: () => renderPlayer() });

    // Sort back-to-front
    objects.sort((a, b) => a.sortZ - b.sortZ);

    // Draw all
    objects.forEach(o => o.draw());

    // Interaction zone glow (drawn on top)
    renderZoneGlows();

    // 4. Scale virtual canvas to display canvas
    const scaleX = window.innerWidth  / VW;
    const scaleY = window.innerHeight / VH;
    const scale  = Math.min(scaleX, scaleY);
    const offX   = (window.innerWidth  - VW * scale) / 2;
    const offY   = (window.innerHeight - VH * scale) / 2;

    dCtx.fillStyle = '#000';
    dCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    dCtx.imageSmoothingEnabled = false;
    dCtx.drawImage(vCanvas, offX, offY, VW * scale, VH * scale);
}

// ============================================================
//  GROUND RENDERING
// ============================================================
function renderGround() {
    const ctx = vCtx;

    // ── Base: smooth dark urban ground ───────────────────────
    const bgGrad = ctx.createLinearGradient(0, 0, VW, VH);
    bgGrad.addColorStop(0, '#0d1a0a');
    bgGrad.addColorStop(1, '#0a1208');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, VW, VH);

    // Subtle tile grid — very faint, not Game Boy checkerboard
    const tileSize = WU_PX;
    for (let gx = 0; gx < VW; gx += tileSize) {
        for (let gz = 0; gz < VH; gz += tileSize) {
            const even = (Math.floor(gx / tileSize) + Math.floor(gz / tileSize)) % 2 === 0;
            ctx.fillStyle = even ? 'rgba(255,255,255,0.012)' : 'rgba(0,0,0,0.012)';
            ctx.fillRect(gx, gz, tileSize, tileSize);
        }
    }

    // ── Ocean (x > 30 WU) ───────────────────────────────────
    const oceanStartX = wx2s(30);
    if (oceanStartX < VW) {
        const ox1 = Math.max(0, oceanStartX);
        const oceanGrad = ctx.createLinearGradient(ox1, 0, VW, 0);
        oceanGrad.addColorStop(0, '#052258');
        oceanGrad.addColorStop(1, '#031540');
        ctx.fillStyle = oceanGrad;
        ctx.fillRect(ox1, 0, VW - ox1, VH);

        // Animated wave bands
        const wt = (waveTime * 20) % (S * 8);
        for (let row = 0; row < VH; row += S * 4) {
            const shifted = (row + wt) % (S * 8);
            ctx.fillStyle = shifted < S * 4 ? 'rgba(0,100,200,0.07)' : 'rgba(0,50,120,0.04)';
            ctx.fillRect(ox1, row, VW - ox1, S * 4);
        }
        // Foam at edge
        ctx.fillStyle = 'rgba(0,200,255,0.3)';
        ctx.fillRect(ox1, 0, S * 2, VH);
        ctx.fillStyle = 'rgba(0,200,255,0.1)';
        ctx.fillRect(ox1 + S * 2, 0, S * 4, VH);
    }

    // ── Beach (x 24–30 WU) ──────────────────────────────────
    const beachStartX = wx2s(24);
    const beachEndX   = wx2s(30);
    if (beachStartX < VW && beachEndX > 0) {
        const bx1 = Math.max(0, beachStartX);
        const bx2 = Math.min(VW, beachEndX);
        const beachGrad = ctx.createLinearGradient(bx1, 0, bx2, 0);
        beachGrad.addColorStop(0, '#c8a86b');
        beachGrad.addColorStop(1, '#dfc07a');
        ctx.fillStyle = beachGrad;
        ctx.fillRect(bx1, 0, bx2 - bx1, VH);
        // Subtle sand grain dots
        ctx.fillStyle = 'rgba(160,120,60,0.35)';
        for (let bi = bx1; bi < bx2; bi += S * 4) {
            for (let bj = 0; bj < VH; bj += S * 5) {
                if ((Math.floor(bi / S) + Math.floor(bj / S)) % 7 < 2)
                    ctx.fillRect(bi, bj, S * 2, S);
            }
        }
    }

    // ── Helper to draw one road ──────────────────────────────
    function drawRoadH(rz) {
        const roadW = 5;
        const top    = wz2s(rz - roadW / 2);
        const bottom = wz2s(rz + roadW / 2);
        const h = bottom - top;

        // Asphalt gradient
        const rGrad = ctx.createLinearGradient(0, top, 0, bottom);
        rGrad.addColorStop(0,   '#1c1230');
        rGrad.addColorStop(0.5, '#211538');
        rGrad.addColorStop(1,   '#1c1230');
        ctx.fillStyle = rGrad;
        ctx.fillRect(0, top, VW, h);

        // Sidewalks
        const swTop    = wz2s(rz - 3.2);
        const swTopH   = wz2s(rz - 2.5) - swTop + S;
        const swBot    = wz2s(rz + 2.5);
        const swBotH   = wz2s(rz + 3.2) - swBot + S;
        ctx.fillStyle = '#2a2244';
        ctx.fillRect(0, swTop, VW, swTopH);
        ctx.fillRect(0, swBot, VW, swBotH);
        // Curb highlight
        ctx.fillStyle = '#3d3460';
        ctx.fillRect(0, wz2s(rz - 2.5), VW, S);
        ctx.fillRect(0, wz2s(rz + 2.5), VW, S);

        // Center yellow dash
        const cy = wz2s(rz);
        ctx.fillStyle = '#e8c000';
        for (let lx = 0; lx < VW; lx += S * 14) {
            ctx.fillRect(lx, cy - S, S * 8, S * 2);
        }
        // White lane dashes
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        const laneOff = Math.round(h * 0.28);
        for (let lx = 0; lx < VW; lx += S * 20) {
            ctx.fillRect(lx, top + laneOff, S * 10, S);
            ctx.fillRect(lx, bottom - laneOff - S, S * 10, S);
        }
    }

    function drawRoadV(rx) {
        const roadW = 5;
        const left  = wx2s(rx - roadW / 2);
        const right = wx2s(rx + roadW / 2);
        const w = right - left;

        const rGrad = ctx.createLinearGradient(left, 0, right, 0);
        rGrad.addColorStop(0,   '#1c1230');
        rGrad.addColorStop(0.5, '#211538');
        rGrad.addColorStop(1,   '#1c1230');
        ctx.fillStyle = rGrad;
        ctx.fillRect(left, 0, w, VH);

        // Sidewalks
        ctx.fillStyle = '#2a2244';
        ctx.fillRect(wx2s(rx - 3.2), 0, wx2s(rx - 2.5) - wx2s(rx - 3.2) + S, VH);
        ctx.fillRect(wx2s(rx + 2.5), 0, wx2s(rx + 3.2) - wx2s(rx + 2.5) + S, VH);
        // Curb
        ctx.fillStyle = '#3d3460';
        ctx.fillRect(wx2s(rx - 2.5), 0, S, VH);
        ctx.fillRect(wx2s(rx + 2.5), 0, S, VH);

        // Center yellow dash
        const cx = wx2s(rx);
        ctx.fillStyle = '#e8c000';
        for (let lz = 0; lz < VH; lz += S * 14) {
            ctx.fillRect(cx - S, lz, S * 2, S * 8);
        }
        // White lane dashes
        ctx.fillStyle = 'rgba(255,255,255,0.45)';
        const laneOff = Math.round(w * 0.28);
        for (let lz = 0; lz < VH; lz += S * 20) {
            ctx.fillRect(left + laneOff, lz, S, S * 10);
            ctx.fillRect(right - laneOff - S, lz, S, S * 10);
        }
    }

    [-14, 0, 17].forEach(drawRoadH);
    [-10, 0, 10].forEach(drawRoadV);
}

// ============================================================
//  BUILDING RENDERING
// ============================================================
function renderBuilding(b, interactive) {
    const ctx = vCtx;

    const sx = wx2s(b.x);
    const sz = wz2s(b.z);
    const pw = Math.round(b.w * WU_PX);
    const pd = Math.round(b.d * WU_PX);

    if (!onScreen(sx, sz, pw + pd + 60)) return;

    const fx = sx - pw / 2;
    const fz = sz - pd / 2;

    const mainColor = hexColor(b.color);
    const roofColor = hexColor(b.roofColor);
    const neonColor = hexColor(b.neonColor || b.roofColor);

    // Pseudo-3D wall height (south + east visible faces)
    const wallH = Math.min(Math.round(b.h * S * 2.2), S * 28);
    const eastW = Math.round(S * 4.5);

    // ── Soft drop shadow ─────────────────────────────────────
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.ellipse(sx + eastW / 2, sz + pd / 2 + wallH * 0.6, pw / 2 + S, S * 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // ── East face (right side wall) ──────────────────────────
    const eastGrad = ctx.createLinearGradient(sx + pw / 2, 0, sx + pw / 2 + eastW, 0);
    eastGrad.addColorStop(0, darkenHex(mainColor, 0.55));
    eastGrad.addColorStop(1, darkenHex(mainColor, 0.28));
    ctx.fillStyle = eastGrad;
    ctx.fillRect(Math.round(sx + pw / 2), Math.round(fz + S), eastW, pd + wallH - S);

    // ── South face (front wall) ───────────────────────────────
    const southGrad = ctx.createLinearGradient(0, sz + pd / 2, 0, sz + pd / 2 + wallH);
    southGrad.addColorStop(0, darkenHex(mainColor, 0.68));
    southGrad.addColorStop(1, darkenHex(mainColor, 0.32));
    ctx.fillStyle = southGrad;
    ctx.fillRect(fx, Math.round(sz + pd / 2), pw, wallH);

    // Windows on south face
    const sfWinW = Math.max(S * 4, Math.floor(pw * 0.14));
    const sfWinH = Math.max(S * 3, Math.floor(wallH * 0.42));
    const sfWinCount = Math.max(1, Math.floor(pw / (sfWinW + S * 4)));
    const sfGap = (pw - sfWinCount * sfWinW) / (sfWinCount + 1);
    const sfWinY = Math.round(sz + pd / 2 + wallH * 0.22);
    for (let wi = 0; wi < sfWinCount; wi++) {
        const wwx = Math.round(fx + sfGap + wi * (sfWinW + sfGap));
        ctx.fillStyle = '#1e3355';
        ctx.fillRect(wwx, sfWinY, sfWinW, sfWinH);
        ctx.fillStyle = 'rgba(0,220,255,0.32)';
        ctx.fillRect(wwx + S, sfWinY + S, Math.round(sfWinW * 0.4), sfWinH - S * 2);
        ctx.fillStyle = neonColor;
        ctx.globalAlpha = 0.35;
        ctx.fillRect(wwx - 1, sfWinY - 1, sfWinW + 2, 1);
        ctx.fillRect(wwx - 1, sfWinY - 1, 1, sfWinH + 2);
        ctx.globalAlpha = 1;
    }

    // ── Roof top face ─────────────────────────────────────────
    const roofGrad = ctx.createLinearGradient(fx, fz, fx + pw, fz + pd);
    roofGrad.addColorStop(0, lightenHex(mainColor, 1.55));
    roofGrad.addColorStop(0.55, mainColor);
    roofGrad.addColorStop(1, darkenHex(mainColor, 0.8));
    ctx.fillStyle = roofGrad;
    ctx.fillRect(fx, fz, pw, pd);

    // Roof trim band
    ctx.fillStyle = roofColor;
    ctx.fillRect(fx, fz, pw, S * 2);
    ctx.fillRect(fx, fz, S * 2, pd);
    ctx.fillRect(fx + pw - S * 2, fz, S * 2, pd);

    // Rooftop detail (AC units / structure)
    if (pw > S * 14 && pd > S * 10) {
        ctx.fillStyle = darkenHex(roofColor, 0.55);
        ctx.fillRect(fx + S * 4, fz + S * 4, S * 5, S * 4);
        ctx.fillRect(fx + pw - S * 9, fz + S * 4, S * 5, S * 4);
        ctx.fillStyle = darkenHex(roofColor, 0.35);
        ctx.fillRect(fx + S * 4 + S, fz + S * 4 + S, S * 3, S * 2);
    }

    // Top-view windows on roof
    const winRows = Math.max(1, Math.floor(pd / (S * 8)));
    const winCols = Math.max(1, Math.floor(pw / (S * 8)));
    const winW2 = Math.max(S * 3, Math.floor(pw / (winCols * 2.5)));
    const winH2 = Math.max(S * 2, Math.floor(pd / (winRows * 2.5)));
    for (let wr = 0; wr < winRows; wr++) {
        for (let wc = 0; wc < winCols; wc++) {
            const wx2 = Math.round(fx + (pw / (winCols + 1)) * (wc + 1) - winW2 / 2);
            const wz2 = Math.round(fz + (pd / (winRows + 1)) * (wr + 1) - winH2 / 2);
            ctx.fillStyle = '#203050';
            ctx.fillRect(wx2, wz2, winW2, winH2);
            ctx.fillStyle = 'rgba(0,200,255,0.28)';
            ctx.fillRect(wx2 + 1, wz2 + 1, Math.round(winW2 * 0.45), winH2 - 2);
        }
    }

    // ── Neon trim ─────────────────────────────────────────────
    ctx.fillStyle = neonColor;
    ctx.globalAlpha = 0.65 + glowPulse * 0.25;
    ctx.fillRect(fx, fz + pd - S, pw, S);         // south roof edge
    ctx.fillRect(fx + pw - S, fz, S, pd);          // east roof edge
    ctx.fillRect(fx, Math.round(sz + pd / 2), pw, S); // south wall top
    ctx.globalAlpha = 1;

    // ── Label ─────────────────────────────────────────────────
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.85;
    ctx.font = `bold ${S * 5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText((b.label || '').slice(0, 8), sx, sz);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';

    // ── Interactive pulsing border ────────────────────────────
    if (interactive) {
        ctx.strokeStyle = neonColor;
        ctx.globalAlpha = 0.18 + glowPulse * 0.3;
        ctx.lineWidth = S;
        ctx.strokeRect(fx - S, fz - S, pw + S * 2, pd + S * 2);
        ctx.globalAlpha = 1;
    }
}

// Color utilities
function darkenHex(hex, factor) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.round(r * factor);
    g = Math.round(g * factor);
    b = Math.round(b * factor);
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

function lightenHex(hex, factor) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = Math.round(Math.min(255, r * factor));
    g = Math.round(Math.min(255, g * factor));
    b = Math.round(Math.min(255, b * factor));
    return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

// ============================================================
//  CAR RENDERING (top-down)
// ============================================================
function renderCar(car) {
    const ctx = vCtx;
    const sx = wx2s(car.x);
    const sz = wz2s(car.z);

    if (!onScreen(sx, sz, S * 20)) return;

    const color = hexColor(car.color);
    const carL = S * 12; // 36px
    const carW = S * 7;  // 21px

    ctx.save();
    ctx.translate(sx, sz);
    ctx.rotate(car.rot);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    ctx.beginPath();
    ctx.ellipse(S * 2, S * 2, carL / 2 + S, carW / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle underglow
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, carL / 2 + S * 2, carW / 2 + S, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Body with gradient
    const bodyGrad = ctx.createLinearGradient(-carL / 2, -carW / 2, carL / 2, carW / 2);
    bodyGrad.addColorStop(0, lightenHex(color, 1.35));
    bodyGrad.addColorStop(0.5, color);
    bodyGrad.addColorStop(1, darkenHex(color, 0.65));
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(-carL / 2, -carW / 2, carL, carW);

    // Cabin / windshield
    ctx.fillStyle = '#182840';
    ctx.fillRect(-carL / 2 + S * 3, -carW / 2 + S, S * 6, carW - S * 2);
    // Windshield reflection
    ctx.fillStyle = 'rgba(80,180,255,0.28)';
    ctx.fillRect(-carL / 2 + S * 3 + S, -carW / 2 + S * 2, S * 2, carW - S * 4);

    // Door line / panel seam
    ctx.fillStyle = darkenHex(color, 0.68);
    ctx.fillRect(-carL / 2 + S * 2, -carW / 2 + S, S, carW - S * 2);
    ctx.fillRect( carL / 2 - S * 3, -carW / 2 + S, S, carW - S * 2);

    // Headlights
    ctx.fillStyle = '#ffee88';
    ctx.fillRect(-carL / 2, -carW / 2, S * 3, S * 3);
    ctx.fillRect(-carL / 2, carW / 2 - S * 3, S * 3, S * 3);
    ctx.fillStyle = 'rgba(255,238,100,0.4)';
    ctx.fillRect(-carL / 2 - S, -carW / 2 - S, S * 4, S * 5);

    // Taillights
    ctx.fillStyle = '#dd2222';
    ctx.fillRect(carL / 2 - S * 3, -carW / 2, S * 3, S * 3);
    ctx.fillRect(carL / 2 - S * 3, carW / 2 - S * 3, S * 3, S * 3);

    // Wheels
    ctx.fillStyle = '#1a1a1a';
    const wWid = S * 3, wHei = S * 4;
    const axle = carL / 2 - S * 2;
    ctx.fillRect(-axle - wWid / 2, -carW / 2 - S * 2, wWid, S * 2); // FL
    ctx.fillRect( axle - wWid / 2, -carW / 2 - S * 2, wWid, S * 2); // FR
    ctx.fillRect(-axle - wWid / 2,  carW / 2, wWid, S * 2);          // RL
    ctx.fillRect( axle - wWid / 2,  carW / 2, wWid, S * 2);          // RR
    // Rim highlights
    ctx.fillStyle = '#555';
    ctx.fillRect(-axle - wWid / 2 + 1, -carW / 2 - S * 2 + 1, wWid - 2, S * 2 - 2);
    ctx.fillRect( axle - wWid / 2 + 1, -carW / 2 - S * 2 + 1, wWid - 2, S * 2 - 2);

    ctx.restore();
}

// ============================================================
//  PALM TREE RENDERING (top-down)
// ============================================================
function renderPalm(wx, wz) {
    const ctx = vCtx;
    const sx = wx2s(wx);
    const sz = wz2s(wz);

    if (!onScreen(sx, sz, S * 15)) return;

    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(sx + S, sz + S, S * 5, S * 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk
    ctx.fillStyle = '#5a3318';
    ctx.fillRect(sx - S, sz - S, S * 2, S * 2);
    ctx.fillStyle = '#7a4a28';
    ctx.fillRect(sx - 1, sz - S, 1, S * 2);

    // Leaf clusters in 8 directions — larger and more detailed
    const leafColors = ['#1a6b14', '#1e7a18', '#166010', '#237520'];
    const dirs = [
        [0, -S * 5], [0, S * 5], [-S * 5, 0], [S * 5, 0],
        [-S * 4, -S * 4], [S * 4, -S * 4], [-S * 4, S * 4], [S * 4, S * 4]
    ];
    dirs.forEach(([dx, dz], i) => {
        ctx.fillStyle = leafColors[i % leafColors.length];
        ctx.fillRect(sx + dx - S * 2, sz + dz - S, S * 4, S * 2);
        ctx.fillRect(sx + dx - S, sz + dz - S * 2, S * 2, S * 4);
        // Lighter tip
        ctx.fillStyle = 'rgba(80,200,60,0.3)';
        ctx.fillRect(sx + dx - S, sz + dz - S, S * 2, S * 2);
    });

    // Trunk center dot
    ctx.fillStyle = '#8a5530';
    ctx.fillRect(sx - 1, sz - 1, S * 2, S * 2);

    // Coconuts
    ctx.fillStyle = '#3d2008';
    ctx.fillRect(sx + S, sz - S, S, S);
    ctx.fillRect(sx - S * 2, sz + S, S, S);
}

// ============================================================
//  STREETLAMP RENDERING
// ============================================================
function renderLamp(lamp) {
    const ctx = vCtx;
    const sx = wx2s(lamp.x);
    const sz = wz2s(lamp.z);

    if (!onScreen(sx, sz, S * 30)) return;

    const color = hexColor(lamp.color);
    const poolR = S * 22;

    // Light pool on ground
    const gradient = ctx.createRadialGradient(sx, sz, 0, sx, sz, poolR);
    gradient.addColorStop(0, color + '22');
    gradient.addColorStop(0.5, color + '0a');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sx, sz, poolR, 0, Math.PI * 2);
    ctx.fill();

    // Post (taller, thicker)
    ctx.fillStyle = '#333355';
    ctx.fillRect(sx - 1, sz, S * 2, S * 7);
    ctx.fillStyle = '#444466';
    ctx.fillRect(sx - 1, sz, 1, S * 7);

    // Arm
    ctx.fillStyle = '#333355';
    ctx.fillRect(sx - S * 3, sz - S, S * 3, S);

    // Bulb housing
    ctx.fillStyle = '#222233';
    ctx.fillRect(sx - S * 3, sz - S * 3, S * 4, S * 2);

    // Bulb glow
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.5 + glowPulse * 0.3;
    ctx.fillRect(sx - S * 3 + S, sz - S * 2, S * 2, S);
    ctx.globalAlpha = 1;

    // Inner bright point
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.8;
    ctx.fillRect(sx - S * 2, sz - S * 2, S, S);
    ctx.globalAlpha = 1;

    // Halo bloom
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.15 + glowPulse * 0.12;
    ctx.beginPath();
    ctx.arc(sx - S * 2, sz - S * 2, S * 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}

// ============================================================
//  BILLBOARD RENDERING
// ============================================================
function renderBillboard(bill) {
    const ctx = vCtx;
    const sx = wx2s(bill.x);
    const sz = wz2s(bill.z);

    if (!onScreen(sx, sz, S * 20)) return;

    const color = hexColor(bill.color);
    const pw = bill.w * WU_PX;
    const ph = bill.h * WU_PX;
    const postH = S * 8;

    // Post
    ctx.fillStyle = '#333355';
    ctx.fillRect(sx - S, sz, S * 2, postH);

    // Board background
    ctx.fillStyle = darkenHex(color, 0.28);
    ctx.fillRect(sx - pw / 2, sz - postH - ph, pw, ph);

    // Gradient overlay
    const bGrad = ctx.createLinearGradient(sx - pw / 2, sz - postH - ph, sx + pw / 2, sz - postH);
    bGrad.addColorStop(0, color + '55');
    bGrad.addColorStop(1, color + '11');
    ctx.fillStyle = bGrad;
    ctx.fillRect(sx - pw / 2, sz - postH - ph, pw, ph);

    // Neon border (glowing)
    ctx.strokeStyle = color;
    ctx.globalAlpha = 0.75 + glowPulse * 0.25;
    ctx.lineWidth = S;
    ctx.strokeRect(sx - pw / 2, sz - postH - ph, pw, ph);
    ctx.globalAlpha = 1;

    // Inner bright line at top
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(sx - pw / 2 + S, sz - postH - ph + S, pw - S * 2, S);
    ctx.globalAlpha = 1;
}

// ============================================================
//  NPC RENDERING
// ============================================================
function renderNPC(npc, index) {
    const ctx = vCtx;
    const sx = wx2s(npc.pos.x);
    const sz = wz2s(npc.pos.z);

    if (!onScreen(sx, sz, S * 15)) return;

    const bodyColor = hexColor(npc.color);
    const hatColor  = hexColor(npc.hatColor);

    const phase = npcPhases[index] || 0;
    const bob   = Math.floor(Math.sin(tick * 0.04 + phase) * 0.5 + 0.5);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(sx, sz + S * 2, S * 4, S * 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neon glow ring
    ctx.fillStyle = '#ff2d78';
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(sx, sz + S * 2, S * 5, S * 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Legs
    ctx.fillStyle = '#220855';
    ctx.fillRect(sx - S * 2, sz,           S * 2, S * 2 + bob * S);
    ctx.fillRect(sx,          sz,           S * 2, S * 2 + (1 - bob) * S);
    // Shoes
    ctx.fillStyle = '#111111';
    ctx.fillRect(sx - S * 2 - S, sz + S * 2 + bob * S,         S * 3, S);
    ctx.fillRect(sx - S,          sz + S * 2 + (1 - bob) * S,  S * 3, S);

    // Body with gradient
    const bodyGrad = ctx.createLinearGradient(sx - S * 2, sz - S * 4, sx + S * 4, sz - S * 4);
    bodyGrad.addColorStop(0, lightenHex(bodyColor, 1.3));
    bodyGrad.addColorStop(1, bodyColor);
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(sx - S * 2, sz - S * 4, S * 6, S * 3);

    // Shoulder bumps
    ctx.fillStyle = lightenHex(bodyColor, 1.5);
    ctx.fillRect(sx - S * 3, sz - S * 4, S, S * 2);
    ctx.fillRect(sx + S * 4, sz - S * 4, S, S * 2);

    // Head
    ctx.fillStyle = '#ffcc99';
    ctx.fillRect(sx - S, sz - S * 6, S * 4, S * 2);
    // Ear
    ctx.fillStyle = '#eebb88';
    ctx.fillRect(sx - S, sz - S * 5, S, S);

    // Hat brim
    ctx.fillStyle = hatColor;
    ctx.fillRect(sx - S * 2, sz - S * 7, S * 6, S);
    // Hat crown
    ctx.fillStyle = darkenHex(hatColor, 0.82);
    ctx.fillRect(sx - S, sz - S * 9, S * 4, S * 2);
    // Hat highlight
    ctx.fillStyle = lightenHex(hatColor, 1.3);
    ctx.fillRect(sx - S, sz - S * 9, S, S);
}

// ============================================================
//  PLAYER RENDERING
// ============================================================
function renderPlayer() {
    const ctx = vCtx;
    const sx = wx2s(player.x);
    const sz = wz2s(player.z);
    const f  = player.facing;
    const af = player.animFrame;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.32)';
    ctx.beginPath();
    ctx.ellipse(sx, sz + S * 4, S * 5, S * 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pink aura on ground
    ctx.fillStyle = '#ff2d78';
    ctx.globalAlpha = 0.4 + glowPulse * 0.25;
    ctx.beginPath();
    ctx.ellipse(sx, sz + S * 5, S * 4, S * 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    const lean = isRunning ? S : 0;
    const legLoffY = af === 0 ? -S : S;
    const legRoffY = af === 0 ? S : -S;
    const armLoffZ = af === 0 ? S : -S;
    const armRoffZ = af === 0 ? -S : S;

    // Shirt gradient helper
    function drawShirt(x, y, w, h) {
        const sg = ctx.createLinearGradient(x, y, x + w, y);
        sg.addColorStop(0, '#ff4d90');
        sg.addColorStop(0.5, '#ff2d78');
        sg.addColorStop(1, '#cc2060');
        ctx.fillStyle = sg;
        ctx.fillRect(x, y, w, h);
    }

    if (f === 'S') {
        const lz = lean;
        // Shoes
        ctx.fillStyle = '#111';
        ctx.fillRect(sx - S * 3, sz + S * 4 + lz + legLoffY, S * 3, S * 2);
        ctx.fillRect(sx + S,     sz + S * 4 + lz + legRoffY, S * 3, S * 2);
        // Pants
        ctx.fillStyle = '#220855';
        ctx.fillRect(sx - S * 3, sz + S * 2 + lz + legLoffY, S * 2, S * 3);
        ctx.fillRect(sx + S,     sz + S * 2 + lz + legRoffY, S * 2, S * 3);
        // Belt
        ctx.fillStyle = '#330a66';
        ctx.fillRect(sx - S * 3, sz + S * 2 + lz, S * 6, S);
        // Arms
        ctx.fillStyle = '#ff2d78';
        ctx.fillRect(sx - S * 4, sz - S * 2 + armLoffZ + lz, S, S * 4);
        ctx.fillRect(sx + S * 3, sz - S * 2 + armRoffZ + lz, S, S * 4);
        // Shirt
        drawShirt(sx - S * 3, sz - S * 2 + lz, S * 6, S * 4);
        // Shoulders
        ctx.fillStyle = '#ff4d90';
        ctx.fillRect(sx - S * 4, sz - S * 2 + lz, S, S * 2);
        ctx.fillRect(sx + S * 3, sz - S * 2 + lz, S, S * 2);
        // Neck
        ctx.fillStyle = '#ffbb88';
        ctx.fillRect(sx - S, sz - S * 2 + lz, S * 2, S);
        // Head
        ctx.fillStyle = '#ffcc99';
        ctx.fillRect(sx - S * 2, sz - S * 4 + lz, S * 4, S * 3);
        // Ear
        ctx.fillStyle = '#eebb88';
        ctx.fillRect(sx - S * 2 - S, sz - S * 4 + lz + S, S, S);
        ctx.fillRect(sx + S * 2, sz - S * 4 + lz + S, S, S);
        // Hair
        ctx.fillStyle = '#332211';
        ctx.fillRect(sx - S * 2, sz - S * 5 + lz, S * 4, S);
        // Eyes
        ctx.fillStyle = '#221100';
        ctx.fillRect(sx - S, sz - S * 3 + lz, S, S);
        ctx.fillRect(sx + S, sz - S * 3 + lz, S, S);
        // Mouth
        ctx.fillStyle = '#cc8866';
        ctx.fillRect(sx - S, sz - S * 2 + lz + S - 1, S * 2, S - 1);

    } else if (f === 'N') {
        const lz = -lean;
        // Shoes
        ctx.fillStyle = '#111';
        ctx.fillRect(sx - S * 3, sz + S * 4 + lz + legLoffY, S * 3, S * 2);
        ctx.fillRect(sx + S,     sz + S * 4 + lz + legRoffY, S * 3, S * 2);
        // Pants
        ctx.fillStyle = '#220855';
        ctx.fillRect(sx - S * 3, sz + S * 2 + lz + legLoffY, S * 2, S * 3);
        ctx.fillRect(sx + S,     sz + S * 2 + lz + legRoffY, S * 2, S * 3);
        ctx.fillStyle = '#330a66';
        ctx.fillRect(sx - S * 3, sz + S * 2 + lz, S * 6, S);
        // Arms
        ctx.fillStyle = '#ff2d78';
        ctx.fillRect(sx - S * 4, sz - S * 2 + armLoffZ + lz, S, S * 4);
        ctx.fillRect(sx + S * 3, sz - S * 2 + armRoffZ + lz, S, S * 4);
        // Shirt back
        drawShirt(sx - S * 3, sz - S * 2 + lz, S * 6, S * 4);
        ctx.fillStyle = '#ff4d90';
        ctx.fillRect(sx - S * 4, sz - S * 2 + lz, S, S * 2);
        ctx.fillRect(sx + S * 3, sz - S * 2 + lz, S, S * 2);
        // Back of head (just hair)
        ctx.fillStyle = '#332211';
        ctx.fillRect(sx - S * 2, sz - S * 4 + lz, S * 4, S * 4);
        ctx.fillStyle = '#443322';
        ctx.fillRect(sx - S * 2 + 1, sz - S * 4 + lz + S, S * 4 - 2, S * 2);

    } else if (f === 'E') {
        const lo = lean;
        // Shoes
        ctx.fillStyle = '#111';
        ctx.fillRect(sx + S + lo,  sz + S * 4 + legLoffY, S * 3, S * 2);
        ctx.fillRect(sx + lo,      sz + S * 4 + legRoffY, S * 2, S * 2);
        // Pants
        ctx.fillStyle = '#220855';
        ctx.fillRect(sx + S + lo,  sz + S * 2 + legLoffY, S * 2, S * 3);
        ctx.fillRect(sx + lo,      sz + S * 2 + legRoffY, S * 2, S * 3);
        ctx.fillStyle = '#330a66';
        ctx.fillRect(sx - S + lo, sz + S * 2, S * 5, S);
        // Front arm (swings)
        ctx.fillStyle = '#dd2265';
        ctx.fillRect(sx + S * 2 + lo, sz - S * 2 + armLoffZ, S, S * 4);
        // Shirt profile
        const sg2 = ctx.createLinearGradient(sx - S + lo, 0, sx + S * 4 + lo, 0);
        sg2.addColorStop(0, '#cc2060');
        sg2.addColorStop(1, '#ff2d78');
        ctx.fillStyle = sg2;
        ctx.fillRect(sx - S + lo, sz - S * 2, S * 5, S * 4);
        ctx.fillStyle = '#ff4d90';
        ctx.fillRect(sx - S * 2 + lo, sz - S, S, S * 2);
        // Head profile
        ctx.fillStyle = '#ffcc99';
        ctx.fillRect(sx + lo, sz - S * 5, S * 4, S * 3);
        ctx.fillStyle = '#332211';
        ctx.fillRect(sx + lo, sz - S * 5, S * 4, S);
        // Eye
        ctx.fillStyle = '#221100';
        ctx.fillRect(sx + S * 3 + lo, sz - S * 4, S, S);
        // Nose
        ctx.fillStyle = '#ddaa88';
        ctx.fillRect(sx + S * 4 + lo, sz - S * 3, S, S);

    } else if (f === 'W') {
        const lo = -lean;
        // Shoes
        ctx.fillStyle = '#111';
        ctx.fillRect(sx - S * 4 + lo, sz + S * 4 + legLoffY, S * 3, S * 2);
        ctx.fillRect(sx - S * 2 + lo, sz + S * 4 + legRoffY, S * 2, S * 2);
        // Pants
        ctx.fillStyle = '#220855';
        ctx.fillRect(sx - S * 3 + lo, sz + S * 2 + legLoffY, S * 2, S * 3);
        ctx.fillRect(sx - S * 2 + lo, sz + S * 2 + legRoffY, S * 2, S * 3);
        ctx.fillStyle = '#330a66';
        ctx.fillRect(sx - S * 4 + lo, sz + S * 2, S * 5, S);
        // Front arm
        ctx.fillStyle = '#dd2265';
        ctx.fillRect(sx - S * 3 + lo, sz - S * 2 + armLoffZ, S, S * 4);
        // Shirt profile
        const sg3 = ctx.createLinearGradient(sx - S * 4 + lo, 0, sx + lo, 0);
        sg3.addColorStop(0, '#ff2d78');
        sg3.addColorStop(1, '#cc2060');
        ctx.fillStyle = sg3;
        ctx.fillRect(sx - S * 4 + lo, sz - S * 2, S * 5, S * 4);
        ctx.fillStyle = '#ff4d90';
        ctx.fillRect(sx + S + lo, sz - S, S, S * 2);
        // Head profile
        ctx.fillStyle = '#ffcc99';
        ctx.fillRect(sx - S * 4 + lo, sz - S * 5, S * 4, S * 3);
        ctx.fillStyle = '#332211';
        ctx.fillRect(sx - S * 4 + lo, sz - S * 5, S * 4, S);
        // Eye
        ctx.fillStyle = '#221100';
        ctx.fillRect(sx - S * 4 + lo, sz - S * 4, S, S);
        // Nose
        ctx.fillStyle = '#ddaa88';
        ctx.fillRect(sx - S * 5 + lo, sz - S * 3, S, S);
    }
}

// ============================================================
//  ZONE INTERACTION GLOW
// ============================================================
function renderZoneGlows() {
    const ctx = vCtx;
    const near = nearestZone();
    if (!near) return;

    const sx = wx2s(near.x);
    const sz = wz2s(near.z);
    const radius = near.radius * WU_PX;

    ctx.strokeStyle = '#ff2d78';
    ctx.globalAlpha = 0.15 + glowPulse * 0.2;
    ctx.lineWidth = S;
    ctx.beginPath();
    ctx.arc(sx, sz, radius * (0.8 + glowPulse * 0.2), 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
}

// ============================================================
//  MINIMAP
// ============================================================
function drawMinimap() {
    const ctx = mmCtx;
    const S   = MM_SCALE;

    // Background
    ctx.fillStyle = 'rgba(13,8,24,0.95)';
    ctx.fillRect(0, 0, MM_PX, MM_PX);

    // Ocean
    ctx.fillStyle = 'rgba(4,24,64,0.65)';
    ctx.fillRect((30 + MM_ORIG) * S, 0, MM_PX, MM_PX);

    // Beach
    ctx.fillStyle = 'rgba(200,168,107,0.5)';
    ctx.fillRect((24 + MM_ORIG) * S, 0, (30 - 24) * S, MM_PX);

    // Road grid
    ctx.fillStyle = 'rgba(24,16,44,0.9)';
    [-14, 0, 17].forEach(rz => {
        const py = (rz + MM_ORIG) * S;
        ctx.fillRect(0, py - 2.5 * S, MM_PX, 5 * S);
    });
    [-10, 0, 10].forEach(rx => {
        const px = (rx + MM_ORIG) * S;
        ctx.fillRect(px - 2.5 * S, 0, 5 * S, MM_PX);
    });

    // Decorative buildings
    DECOR_BUILDINGS.forEach(b => {
        const bx = (b.x - b.w / 2 + MM_ORIG) * S;
        const by = (b.z - b.d / 2 + MM_ORIG) * S;
        const bw = b.w * S;
        const bh = b.d * S;
        const col = hexColor(b.roofColor);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = col;
        ctx.fillRect(bx, by, bw, bh);
        ctx.globalAlpha = 1;
    });

    // Interactive buildings
    window.BUILDINGS.forEach(b => {
        const bx = (b.x - b.w / 2 + MM_ORIG) * S;
        const by = (b.z - b.d / 2 + MM_ORIG) * S;
        const bw = b.w * S;
        const bh = b.d * S;
        const col = hexColor(b.neonColor || b.roofColor);

        ctx.globalAlpha = 0.8;
        ctx.fillStyle = col;
        ctx.fillRect(bx, by, bw, bh);
        ctx.globalAlpha = 1;

        // Neon border
        ctx.strokeStyle = col;
        ctx.lineWidth   = 0.8;
        ctx.strokeRect(bx, by, bw, bh);

        // Label
        if (bw > 6) {
            ctx.fillStyle    = '#ffffff';
            ctx.font         = `bold ${Math.max(5, Math.min(6, bw / 3))}px "Courier New"`;
            ctx.textAlign    = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha  = 0.9;
            const short = (b.label || '').slice(0, 7);
            ctx.fillText(short, bx + bw / 2, by + bh / 2);
            ctx.globalAlpha = 1;
        }
    });

    // NPC positions (blinking pink dots)
    window.NPCS.forEach((n, i) => {
        const mx = (n.pos.x + MM_ORIG) * S;
        const mz = (n.pos.z + MM_ORIG) * S;
        const pulse = 0.5 + Math.sin(tick * 0.05 + (npcPhases[i] || 0)) * 0.5;

        ctx.globalAlpha = 0.4 + pulse * 0.6;
        ctx.fillStyle   = '#ff2d78';
        ctx.beginPath();
        ctx.arc(mx, mz, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // PROF label
        ctx.fillStyle    = '#ff9dbb';
        ctx.font         = '5px "Courier New"';
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('PROF', mx, mz - 3);
    });

    // Player dot
    const px = (player.x + MM_ORIG) * S;
    const pz = (player.z + MM_ORIG) * S;

    // Aura
    ctx.globalAlpha = 0.25;
    ctx.fillStyle   = '#ff2d78';
    ctx.beginPath();
    ctx.arc(px, pz, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Player dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, pz, 3, 0, Math.PI * 2);
    ctx.fill();

    // Direction triangle
    const facingAngle = { N: -Math.PI / 2, S: Math.PI / 2, E: 0, W: Math.PI };
    const ang  = facingAngle[player.facing] || 0;
    const tlen = 6;
    ctx.fillStyle = '#ff2d78';
    ctx.beginPath();
    ctx.moveTo(px + Math.cos(ang) * tlen,           pz + Math.sin(ang) * tlen);
    ctx.lineTo(px + Math.cos(ang + 2.4) * 3,        pz + Math.sin(ang + 2.4) * 3);
    ctx.lineTo(px + Math.cos(ang - 2.4) * 3,        pz + Math.sin(ang - 2.4) * 3);
    ctx.closePath();
    ctx.fill();

    // Legend
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle    = '#ff2d78';
    ctx.font         = 'bold 6px "Courier New"';
    ctx.fillText('● PROF', 4, MM_PX - 8);
    ctx.fillStyle    = '#ffffff';
    ctx.fillText('▲ VOUS', 4, MM_PX - 2);

    // Border
    ctx.strokeStyle = '#ff2d78';
    ctx.lineWidth   = 1;
    ctx.strokeRect(0, 0, MM_PX, MM_PX);

    // Reset textAlign
    ctx.textAlign = 'left';
}

// ============================================================
//  RESIZE
// ============================================================
function onResize() {
    displayCanvas.width  = window.innerWidth;
    displayCanvas.height = window.innerHeight;
    dCtx.imageSmoothingEnabled = false;
}

// ============================================================
//  START
// ============================================================
init();
