// ============================================================
//  app-resa.js — RESA VVA (Réservations Vacances) sans MySQL
// ============================================================

const RESA_DATA = {
    _id: { hebergements:7, reservations:6, comptes:5 },
    hebergements: [
        [1,'Villa Soleil','Villa','Nice',8,220,'Disponible'],
        [2,'Appart Vue Mer','Appartement','Cannes',4,150,'Disponible'],
        [3,'Studio Azur','Studio','Antibes',2,80,'Occupé'],
        [4,'Chalet des Pins','Chalet','Vars',6,190,'Disponible'],
        [5,'Mas Provençal','Maison','Aix-en-Provence',10,280,'Disponible'],
        [6,'Studio Plage','Studio','Menton',2,95,'Occupé'],
    ],
    reservations: [
        [1,3,'Studio Azur','Dupont Marie','2025-04-10','2025-04-17','En cours'],
        [2,6,'Studio Plage','Bernard Paul','2025-04-08','2025-04-15','En cours'],
        [3,1,'Villa Soleil','Martin Sophie','2025-05-01','2025-05-14','Confirmée'],
        [4,2,'Appart Vue Mer','Leclerc Jean','2025-03-20','2025-03-27','Terminée'],
        [5,4,'Chalet des Pins','Petit Claire','2025-04-25','2025-05-02','Confirmée'],
    ],
    comptes: [
        [1,'admin','admin@vva.fr','Administrateur'],
        [2,'gestionnaire1','gest1@vva.fr','Gestionnaire'],
        [3,'gestionnaire2','gest2@vva.fr','Gestionnaire'],
    ],
};

const RC = {
    bg:'#0a1a1a', sidebar:'#0d2020', card:'#1a2e2e', border:'#1e4040',
    cyan:'#06b6d4', teal:'#0d9488', green:'#16a34a', red:'#dc2626',
    blue:'#2563eb', amber:'#d97706', text:'#f0fdfd', sub:'#94a3b8',
    sh:{'Disponible':'#16a34a','Occupé':'#ea580c','Maintenance':'#dc2626'},
    sr:{'En cours':'#ea580c','Confirmée':'#2563eb','Terminée':'#16a34a','Annulée':'#dc2626'},
};
const RC_NAV = [
    {key:'dashboard',      label:'Tableau de bord',  color:RC.cyan},
    {key:'hebergements',   label:'Hébergements',      color:RC.teal},
    {key:'reservations',   label:'Réservations',      color:RC.amber},
    {key:'comptes',        label:'Comptes',            color:RC.blue},
];
let resaPage='dashboard', resaSel=null, resaModalCb=null, resaConfirmCb=null;

function buildResaApp() {
    const nav = RC_NAV.map(n=>`
      <button class="japp-nav ${n.key===resaPage?'active':''}" data-page="${n.key}"
              style="--nc:${n.color}" onclick="resaGo('${n.key}')">
        <span class="jnav-dot" style="background:${n.color}"></span>${n.label}
      </button>`).join('');
    return `<div class="japp" id="resa-root">
      <div class="japp-sidebar" style="background:${RC.sidebar}">
        <div class="japp-logo">
          <div class="japp-logo-icon" style="background:${RC.cyan}">VV</div>
          <div><div class="japp-logo-title">RESA VVA</div>
          <div class="japp-logo-sub">Vacances & Hébergements</div></div>
        </div>
        <div class="japp-nav-list">${nav}</div>
        <div class="japp-footer">v1.0 — Dylan Arezki<br><span style="color:#1e4040;font-size:10px">MODE DÉMO</span></div>
      </div>
      <div class="japp-content" id="resa-content">${resaBuildPage('dashboard')}</div>
    </div>`;
}
function resaGo(page) {
    resaPage=page; resaSel=null;
    document.querySelectorAll('#resa-root .japp-nav').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
    const c=document.getElementById('resa-content');
    c.style.opacity='0';
    setTimeout(()=>{ c.innerHTML=resaBuildPage(page); c.style.opacity='1'; },100);
}
function resaBuildPage(page) {
    switch(page){
        case 'dashboard':    return resaDashboard();
        case 'hebergements': return resaHebergements();
        case 'reservations': return resaReservations();
        case 'comptes':      return resaEntityPanel('comptes','Comptes',['ID','Login','Email','Rôle'],[40,100,180,100],RC.blue);
        default:             return resaDashboard();
    }
}
function resaDashboard() {
    const dispo=RESA_DATA.hebergements.filter(h=>h[6]==='Disponible').length;
    const enCours=RESA_DATA.reservations.filter(r=>r[6]==='En cours').length;
    const cards=[
        {label:'HÉBERGEMENTS',val:RESA_DATA.hebergements.length,color:RC.teal,page:'hebergements'},
        {label:'DISPONIBLES',val:dispo,color:RC.green,page:'hebergements'},
        {label:'RÉSERVATIONS',val:RESA_DATA.reservations.length,color:RC.amber,page:'reservations'},
        {label:'EN COURS',val:enCours,color:RC.cyan,page:'reservations'},
        {label:'COMPTES',val:RESA_DATA.comptes.length,color:RC.blue,page:'comptes'},
    ].map(c=>`<div class="jcard" style="--cc:${c.color};cursor:pointer" onclick="resaGo('${c.page}')">
        <div class="jcard-bar" style="background:${c.color}"></div>
        <div class="jcard-label">${c.label}</div>
        <div class="jcard-val" style="color:${c.color}">${c.val}</div></div>`).join('');
    const rows=RESA_DATA.reservations.slice(-5).reverse().map((r,i)=>{
        const sc=RC.sr[r[6]]||RC.text;
        return `<tr class="${i%2?'alt':''}"><td style="color:#64748b">${r[0]}</td>
            <td>${r[3]}</td><td>${r[2]}</td><td>${r[4]}</td><td>${r[5]}</td>
            <td style="color:${sc};font-weight:700">${r[6]}</td></tr>`;
    }).join('');
    return `<div class="jpanel">
      <div class="jpanel-header"><div><div class="jpanel-title">Tableau de bord</div>
        <div class="jpanel-sub">Gestion hébergements vacances — Mode démo</div></div>
        <button class="jbtn" style="background:${RC.cyan}" onclick="resaGo('dashboard')">↺ Actualiser</button>
      </div>
      <div class="jcards">${cards}</div>
      <div class="jtable-wrap"><div class="jtable-title" style="padding:12px 14px 0">Réservations récentes</div>
        <div class="jtable-scroll"><table class="jtable">
          <thead><tr><th>ID</th><th>Client</th><th>Hébergement</th><th>Arrivée</th><th>Départ</th><th>Statut</th></tr></thead>
          <tbody>${rows}</tbody></table></div></div></div>`;
}
function resaHebergements() {
    const rows=RESA_DATA.hebergements.map((h,i)=>{
        const isSel=resaSel&&resaSel.entity==='hebergements'&&resaSel.idx===i;
        const sc=RC.sh[h[6]]||RC.text;
        return `<tr class="${isSel?'jrow-sel':i%2?'alt':''}" data-idx="${i}"
            onclick="resaSelectRow(this,'hebergements',${i})">
            <td style="color:#64748b">${h[0]}</td><td><strong>${h[1]}</strong></td>
            <td>${h[2]}</td><td>${h[3]}</td><td>${h[4]} pers.</td>
            <td>${h[5]} €/nuit</td><td style="color:${sc};font-weight:700">${h[6]}</td></tr>`;
    }).join('');
    return `<div class="jpanel">
      <div class="jpanel-header"><div><div class="jpanel-title">Hébergements</div>
        <div class="jpanel-sub">${RESA_DATA.hebergements.length} hébergement(s)</div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <input class="jsearch" placeholder="Rechercher..." oninput="resaSearch(this,'resa-tb-hebergements')">
          <button class="jbtn" style="background:${RC.teal}" onclick="resaAdd('hebergements')">+ Ajouter</button>
          <button class="jbtn-out" onclick="resaEdit('hebergements')">Modifier</button>
          <button class="jbtn-out" style="color:${RC.red};border-color:${RC.red}" onclick="resaDelete('hebergements')">Supprimer</button>
        </div>
      </div>
      <div class="jtable-wrap" style="margin-top:0"><div class="jtable-scroll">
        <table class="jtable">
          <thead><tr><th>ID</th><th>Nom</th><th>Type</th><th>Ville</th><th>Capacité</th><th>Prix/nuit</th><th>Statut</th></tr></thead>
          <tbody id="resa-tb-hebergements">${rows}</tbody></table></div></div></div>`;
}
function resaReservations() {
    const statuts=['Tous','Confirmée','En cours','Terminée','Annulée'];
    const rows=RESA_DATA.reservations.map((r,i)=>{
        const isSel=resaSel&&resaSel.entity==='reservations'&&resaSel.idx===i;
        const sc=RC.sr[r[6]]||RC.text;
        return `<tr class="${isSel?'jrow-sel':i%2?'alt':''}" data-idx="${i}" data-statut="${r[6]}"
            onclick="resaSelectRow(this,'reservations',${i})">
            <td style="color:#64748b">${r[0]}</td><td>${r[3]}</td><td>${r[2]}</td>
            <td>${r[4]}</td><td>${r[5]}</td><td style="color:${sc};font-weight:700">${r[6]}</td></tr>`;
    }).join('');
    return `<div class="jpanel">
      <div class="jpanel-header"><div><div class="jpanel-title">Réservations</div>
        <div class="jpanel-sub">${RESA_DATA.reservations.length} réservation(s)</div></div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <select class="jselect" onchange="resaFilterResa(this.value)">${statuts.map(s=>`<option>${s}</option>`).join('')}</select>
          <button class="jbtn" style="background:${RC.amber}" onclick="resaAddResa()">+ Réserver</button>
          <button class="jbtn-out" style="color:${RC.red};border-color:${RC.red}" onclick="resaDelete('reservations')">Annuler</button>
        </div>
      </div>
      <div class="jtable-wrap" style="margin-top:0"><div class="jtable-scroll">
        <table class="jtable">
          <thead><tr><th>ID</th><th>Client</th><th>Hébergement</th><th>Arrivée</th><th>Départ</th><th>Statut</th></tr></thead>
          <tbody id="resa-tb-reservations">${rows}</tbody></table></div></div></div>`;
}
function resaEntityPanel(entity,title,cols,widths,color) {
    const data=RESA_DATA[entity];
    const heads=cols.map((c,i)=>`<th style="min-width:${widths[i]||80}px">${c}</th>`).join('');
    const rows=data.map((row,i)=>{
        const isSel=resaSel&&resaSel.entity===entity&&resaSel.idx===i;
        return `<tr class="${isSel?'jrow-sel':i%2?'alt':''}" data-idx="${i}"
            onclick="resaSelectRow(this,'${entity}',${i})">${row.map(v=>`<td>${v}</td>`).join('')}</tr>`;
    }).join('');
    return `<div class="jpanel">
      <div class="jpanel-header"><div><div class="jpanel-title">${title}</div>
        <div class="jpanel-sub">${data.length} enregistrement(s)</div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <input class="jsearch" placeholder="Rechercher..." oninput="resaSearch(this,'resa-tb-${entity}')">
          <button class="jbtn" style="background:${color}" onclick="resaAdd('${entity}')">+ Ajouter</button>
          <button class="jbtn-out" onclick="resaEdit('${entity}')">Modifier</button>
          <button class="jbtn-out" style="color:${RC.red};border-color:${RC.red}" onclick="resaDelete('${entity}')">Supprimer</button>
        </div>
      </div>
      <div class="jtable-wrap" style="margin-top:0"><div class="jtable-scroll">
        <table class="jtable"><thead><tr>${heads}</tr></thead>
        <tbody id="resa-tb-${entity}">${rows}</tbody></table></div></div></div>`;
}
// ── CRUD fields ───────────────────────────────────────────────
const RESA_FIELDS = {
    hebergements:[{label:'Nom',type:'text',required:true},{label:'Type',type:'select',options:['Appartement','Villa','Studio','Chalet','Maison']},{label:'Ville',type:'text',required:true},{label:'Capacité',type:'number'},{label:'Prix/nuit (€)',type:'number'},{label:'Statut',type:'select',options:['Disponible','Occupé','Maintenance']}],
    comptes:[{label:'Login',type:'text',required:true},{label:'Email',type:'email'},{label:'Rôle',type:'select',options:['Administrateur','Gestionnaire','Consultant']}],
};
function resaSelectRow(tr,entity,idx) {
    if(resaSel&&resaSel.entity===entity&&resaSel.idx===idx){tr.className=idx%2?'alt':'';resaSel=null;return;}
    document.querySelectorAll('#resa-root .jrow-sel').forEach(r=>{r.classList.remove('jrow-sel');r.className=parseInt(r.dataset.idx)%2?'alt':'';});
    tr.classList.add('jrow-sel'); resaSel={entity,idx};
}
function resaAdd(entity) {
    const fields=RESA_FIELDS[entity]; if(!fields) return;
    resaOpenModal('Ajouter — '+entity,fields,[null,...fields.map(()=>'')],row=>{
        row[0]=RESA_DATA._id[entity]++; RESA_DATA[entity].push(row); resaSel=null; resaGo(entity); resaToast('Ajouté avec succès');
    });
}
function resaEdit(entity) {
    if(!resaSel||resaSel.entity!==entity){resaToast("Sélectionnez d'abord une ligne",RC.amber);return;}
    const fields=RESA_FIELDS[entity]; if(!fields) return;
    const row=[...RESA_DATA[entity][resaSel.idx]];
    resaOpenModal('Modifier — '+entity,fields,row,newRow=>{
        newRow[0]=row[0]; RESA_DATA[entity][resaSel.idx]=newRow; const idx=resaSel.idx; resaSel=null; resaGo(entity);
        setTimeout(()=>{const tr=document.querySelector(`#resa-tb-${entity} tr[data-idx="${idx}"]`);if(tr)resaSelectRow(tr,entity,idx);},150);
        resaToast('Modifié avec succès');
    });
}
function resaDelete(entity) {
    if(!resaSel||resaSel.entity!==entity){resaToast("Sélectionnez d'abord une ligne",RC.amber);return;}
    const row=RESA_DATA[entity][resaSel.idx];
    resaConfirm(`Supprimer <strong>${row[1]}${row[2]?' '+row[2]:''}</strong> ?`,()=>{
        RESA_DATA[entity].splice(resaSel.idx,1); resaSel=null; resaGo(entity); resaToast('Supprimé','#dc2626');
    });
}
function resaAddResa() {
    const hOpts=RESA_DATA.hebergements.filter(h=>h[6]==='Disponible').map(h=>h[1]);
    if(!hOpts.length){resaToast('Aucun hébergement disponible',RC.amber);return;}
    const fields=[{label:'Client (Nom Prénom)',type:'text',required:true},{label:'Hébergement',type:'select',options:hOpts,required:true},{label:'Date arrivée',type:'text',placeholder:'AAAA-MM-JJ',required:true},{label:'Date départ',type:'text',placeholder:'AAAA-MM-JJ',required:true},{label:'Statut',type:'select',options:['Confirmée','En cours','Terminée','Annulée']}];
    resaOpenModal('Nouvelle réservation',fields,[null,'','','','','Confirmée'],row=>{
        const id=RESA_DATA._id.reservations++; RESA_DATA.reservations.push([id,0,row[2],row[1],row[3],row[4],row[5]]); resaSel=null; resaGo('reservations'); resaToast('Réservation créée');
    });
}
function resaSearch(input,tbId){const q=input.value.toLowerCase();document.querySelectorAll('#'+tbId+' tr').forEach(tr=>{tr.style.display=tr.textContent.toLowerCase().includes(q)?'':'none';});}
function resaFilterResa(val){document.querySelectorAll('#resa-tb-reservations tr').forEach(tr=>{tr.style.display=(val==='Tous'||tr.dataset.statut===val)?'':'none';});}
function resaOpenModal(title,fields,row,onSave) {
    resaCloseModal(); resaModalCb=onSave;
    const formRows=fields.map((f,fi)=>{
        const val=row[fi+1]!==undefined?row[fi+1]:'';
        const input=f.type==='select'?`<select name="f${fi}" class="jselect jfield">${f.options.map(o=>`<option ${o==val?'selected':''}>${o}</option>`).join('')}</select>`:`<input type="${f.type||'text'}" name="f${fi}" value="${String(val).replace(/"/g,'&quot;')}" class="jsearch jfield" style="width:100%" ${f.required?'required':''} ${f.placeholder?`placeholder="${f.placeholder}"`:''}>`;
        return `<div class="jform-row"><label class="jform-label">${f.label}${f.required?' <span style="color:#dc2626">*</span>':''}</label>${input}</div>`;
    }).join('');
    const m=document.createElement('div'); m.className='jmodal-overlay'; m.id='resa-modal';
    m.innerHTML=`<div class="jmodal" onclick="event.stopPropagation()">
      <div class="jmodal-header"><span>${title}</span><button class="jbtn-close" onclick="resaCloseModal()">✕</button></div>
      <form class="jmodal-form" id="resa-form" onsubmit="resaSubmitModal(event)">
        <div class="jform-grid">${formRows}</div>
        <div class="jmodal-footer">
          <button type="button" class="jbtn-out" onclick="resaCloseModal()">Annuler</button>
          <button type="submit" class="jbtn" style="background:${RC.cyan}">✓ Enregistrer</button>
        </div>
      </form></div>`;
    m.addEventListener('click',resaCloseModal);
    document.getElementById('resa-root').appendChild(m);
    setTimeout(()=>{const f=m.querySelector('.jfield');if(f)f.focus();},50);
}
function resaCloseModal(){const m=document.getElementById('resa-modal');if(m)m.remove();resaModalCb=null;}
function resaSubmitModal(e){
    e.preventDefault(); if(!resaModalCb) return;
    const row=[null]; e.target.querySelectorAll('[name^="f"]').forEach(inp=>row.push(inp.type==='number'?(isNaN(+inp.value)?inp.value:+inp.value):inp.value));
    resaModalCb(row); resaCloseModal();
}
function resaConfirm(msg,onOk){
    resaCloseConfirm(); resaConfirmCb=onOk;
    const d=document.createElement('div'); d.className='jmodal-overlay'; d.id='resa-confirm';
    d.innerHTML=`<div class="jmodal" style="max-width:400px" onclick="event.stopPropagation()">
      <div class="jmodal-header"><span style="color:#dc2626">⚠ Confirmer</span><button class="jbtn-close" onclick="resaCloseConfirm()">✕</button></div>
      <div style="padding:20px 24px;color:#e2e8f0;line-height:1.6">${msg}</div>
      <div class="jmodal-footer"><button class="jbtn-out" onclick="resaCloseConfirm()">Annuler</button>
        <button class="jbtn" style="background:#dc2626" onclick="resaDoConfirm()">Supprimer</button></div></div>`;
    d.addEventListener('click',resaCloseConfirm);
    document.getElementById('resa-root').appendChild(d);
}
function resaCloseConfirm(){const d=document.getElementById('resa-confirm');if(d)d.remove();resaConfirmCb=null;}
function resaDoConfirm(){resaCloseConfirm();if(resaConfirmCb)resaConfirmCb();}
function resaToast(msg,color){
    const old=document.getElementById('resa-toast');if(old)old.remove();
    const t=document.createElement('div'); t.id='resa-toast'; t.className='jtoast';
    t.style.borderLeftColor=color||RC.cyan; t.textContent=msg;
    document.getElementById('resa-root').appendChild(t);
    setTimeout(()=>t.classList.add('jtoast-in'),10);
    setTimeout(()=>{t.classList.remove('jtoast-in');setTimeout(()=>t.remove(),300);},2500);
}
