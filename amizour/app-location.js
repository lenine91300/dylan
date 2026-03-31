// ============================================================
//  app-location.js — Location de Voitures (sans MySQL)
// ============================================================

const LOC = {
    _id: { clients:6, voitures:9, reservations:6, users:4 },
    clients: [
        [1,'Dupont','Jean','j.dupont@email.fr','0612345001','12 rue de la Paix, Paris','1985-03-15'],
        [2,'Martin','Sophie','s.martin@email.fr','0612345002','45 av. Victor Hugo, Lyon','1990-07-22'],
        [3,'Bernard','Pierre','p.bernard@email.fr','0612345003','8 bd Haussmann, Paris','1978-11-30'],
        [4,'Petit','Marie','m.petit@email.fr','0612345004','23 rue du Commerce, Marseille','1995-04-12'],
        [5,'Leclerc','Antoine','a.leclerc@email.fr','0612345005','17 place Bellecour, Lyon','1988-09-08'],
    ],
    voitures: [
        [1,'Renault','Clio',2022,'Gris','AA-001-BB',35,'Disponible'],
        [2,'Peugeot','308',2023,'Blanc','AB-002-CD',45,'En location'],
        [3,'Citroën','C3',2021,'Bleu','AC-003-EF',38,'Disponible'],
        [4,'Volkswagen','Golf',2022,'Noir','AD-004-GH',55,'Disponible'],
        [5,'BMW','Série 3',2023,'Argent','AE-005-IJ',90,'En location'],
        [6,'Toyota','Yaris',2021,'Rouge','AF-006-KL',32,'Disponible'],
        [7,'Mercedes','Classe A',2022,'Blanc','AG-007-MN',75,'Disponible'],
        [8,'Audi','A3',2023,'Gris','AH-008-OP',70,'Disponible'],
    ],
    reservations: [
        [1,2,2,'Martin Sophie','Peugeot 308','2025-04-01','2025-04-07','En cours'],
        [2,5,5,'Leclerc Antoine','BMW Série 3','2025-04-10','2025-04-15','En cours'],
        [3,1,6,'Dupont Jean','Toyota Yaris','2025-03-20','2025-03-25','Terminée'],
        [4,3,4,'Bernard Pierre','Volkswagen Golf','2025-03-28','2025-04-02','Terminée'],
        [5,4,1,'Petit Marie','Renault Clio','2025-04-12','2025-04-14','Confirmée'],
    ],
    users: [
        [1,'admin','admin@loc.fr','admin'],
        [2,'agent1','agent1@loc.fr','agent'],
        [3,'agent2','agent2@loc.fr','agent'],
    ],
};

const LC = {
    bg:'#0f172a', sidebar:'#0d1b2e', card:'#1e293b', border:'#334155',
    blue:'#1d4ed8', orange:'#ea580c', green:'#16a34a', red:'#dc2626',
    purple:'#8b5cf6', indigo:'#6366f1', text:'#f1f5f9', sub:'#94a3b8',
    sv:{'Disponible':'#16a34a','En location':'#ea580c','Maintenance':'#dc2626'},
    sr:{'En cours':'#ea580c','Confirmée':'#2563eb','Terminée':'#16a34a','Annulée':'#dc2626'},
};
const LC_NAV = [
    {key:'dashboard',    label:'Tableau de bord', color:LC.blue},
    {key:'clients',      label:'Clients',          color:LC.purple},
    {key:'voitures',     label:'Voitures',         color:LC.orange},
    {key:'reservations', label:'Réservations',     color:LC.green},
    {key:'users',        label:'Utilisateurs',     color:LC.indigo},
];
let locPage='dashboard', locSel=null, locModalCb=null, locConfirmCb=null;

function buildLocationApp() {
    const nav = LC_NAV.map(n=>`
      <button class="japp-nav ${n.key===locPage?'active':''}" data-page="${n.key}"
              style="--nc:${n.color}" onclick="locGo('${n.key}')">
        <span class="jnav-dot" style="background:${n.color}"></span>${n.label}
      </button>`).join('');
    return `<div class="japp" id="loc-root">
      <div class="japp-sidebar" style="background:${LC.sidebar}">
        <div class="japp-logo">
          <div class="japp-logo-icon" style="background:${LC.orange}">LC</div>
          <div><div class="japp-logo-title">Location Voitures</div>
          <div class="japp-logo-sub">Gestion du parc auto</div></div>
        </div>
        <div class="japp-nav-list">${nav}</div>
        <div class="japp-footer">v1.0 — Dylan Arezki<br><span style="color:#374151;font-size:10px">MODE DÉMO</span></div>
      </div>
      <div class="japp-content" id="loc-content">${locBuildPage('dashboard')}</div>
    </div>`;
}
function locGo(page) {
    locPage=page; locSel=null;
    document.querySelectorAll('#loc-root .japp-nav').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
    const c=document.getElementById('loc-content');
    c.style.opacity='0';
    setTimeout(()=>{ c.innerHTML=locBuildPage(page); c.style.opacity='1'; },100);
}
function locBuildPage(page) {
    switch(page){
        case 'dashboard':    return locDashboard();
        case 'clients':      return locEntityPanel('clients','Clients',['ID','Nom','Prénom','Email','Téléphone','Adresse','Naissance'],[40,80,80,160,100,180,100],LC.purple);
        case 'voitures':     return locVoitures();
        case 'reservations': return locReservations();
        case 'users':        return locEntityPanel('users','Utilisateurs',['ID','Login','Email','Rôle'],[40,100,180,80],LC.indigo);
        default:             return locDashboard();
    }
}
function locDashboard() {
    const dispo=LOC.voitures.filter(v=>v[7]==='Disponible').length;
    const enCours=LOC.reservations.filter(r=>r[7]==='En cours').length;
    const cards=[
        {label:'CLIENTS',val:LOC.clients.length,color:LC.purple,page:'clients'},
        {label:'VOITURES',val:LOC.voitures.length,color:LC.orange,page:'voitures'},
        {label:'DISPONIBLES',val:dispo,color:LC.green,page:'voitures'},
        {label:'RÉSERVATIONS',val:LOC.reservations.length,color:LC.blue,page:'reservations'},
        {label:'EN COURS',val:enCours,color:LC.orange,page:'reservations'},
        {label:'UTILISATEURS',val:LOC.users.length,color:LC.indigo,page:'users'},
    ].map(c=>`<div class="jcard" style="--cc:${c.color};cursor:pointer" onclick="locGo('${c.page}')">
        <div class="jcard-bar" style="background:${c.color}"></div>
        <div class="jcard-label">${c.label}</div>
        <div class="jcard-val" style="color:${c.color}">${c.val}</div></div>`).join('');
    const rows=LOC.reservations.slice(-5).reverse().map((r,i)=>{
        const sc=LC.sr[r[7]]||LC.text;
        return `<tr class="${i%2?'alt':''}"><td style="color:#64748b">${r[0]}</td>
            <td>${r[3]}</td><td>${r[4]}</td><td>${r[5]}</td><td>${r[6]}</td>
            <td style="color:${sc};font-weight:700">${r[7]}</td></tr>`;
    }).join('');
    return `<div class="jpanel">
      <div class="jpanel-header"><div><div class="jpanel-title">Tableau de bord</div>
        <div class="jpanel-sub">Parc automobile — Mode démo</div></div>
        <button class="jbtn" style="background:${LC.blue}" onclick="locGo('dashboard')">↺ Actualiser</button>
      </div>
      <div class="jcards">${cards}</div>
      <div class="jtable-wrap"><div class="jtable-title" style="padding:12px 14px 0">Réservations récentes</div>
        <div class="jtable-scroll"><table class="jtable">
          <thead><tr><th>ID</th><th>Client</th><th>Voiture</th><th>Début</th><th>Fin</th><th>Statut</th></tr></thead>
          <tbody>${rows}</tbody></table></div></div></div>`;
}
function locEntityPanel(entity,title,cols,widths,color) {
    const data=LOC[entity];
    const heads=cols.map((c,i)=>`<th style="min-width:${widths[i]||80}px">${c}</th>`).join('');
    const rows=data.map((row,i)=>{
        const isSel=locSel&&locSel.entity===entity&&locSel.idx===i;
        return `<tr class="${isSel?'jrow-sel':i%2?'alt':''}" data-idx="${i}"
            onclick="locSelectRow(this,'${entity}',${i})">${row.map(v=>`<td>${v}</td>`).join('')}</tr>`;
    }).join('');
    return `<div class="jpanel">
      <div class="jpanel-header"><div><div class="jpanel-title">${title}</div>
        <div class="jpanel-sub">${data.length} enregistrement(s)</div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <input class="jsearch" placeholder="Rechercher..." oninput="locSearch(this,'loc-tb-${entity}')">
          <button class="jbtn" style="background:${color}" onclick="locAdd('${entity}')">+ Ajouter</button>
          <button class="jbtn-out" onclick="locEdit('${entity}')">Modifier</button>
          <button class="jbtn-out" style="color:${LC.red};border-color:${LC.red}" onclick="locDelete('${entity}')">Supprimer</button>
        </div>
      </div>
      <div class="jtable-wrap" style="margin-top:0"><div class="jtable-scroll">
        <table class="jtable"><thead><tr>${heads}</tr></thead>
        <tbody id="loc-tb-${entity}">${rows}</tbody></table></div></div></div>`;
}
function locVoitures() {
    const rows=LOC.voitures.map((v,i)=>{
        const isSel=locSel&&locSel.entity==='voitures'&&locSel.idx===i;
        const sc=LC.sv[v[7]]||LC.text;
        return `<tr class="${isSel?'jrow-sel':i%2?'alt':''}" data-idx="${i}"
            onclick="locSelectRow(this,'voitures',${i})">
            <td style="color:#64748b">${v[0]}</td><td><strong>${v[1]}</strong></td>
            <td>${v[2]}</td><td>${v[3]}</td><td>${v[4]}</td><td>${v[5]}</td>
            <td>${v[6]} €/j</td><td style="color:${sc};font-weight:700">${v[7]}</td></tr>`;
    }).join('');
    return `<div class="jpanel">
      <div class="jpanel-header"><div><div class="jpanel-title">Voitures</div>
        <div class="jpanel-sub">${LOC.voitures.length} véhicule(s)</div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <input class="jsearch" placeholder="Rechercher..." oninput="locSearch(this,'loc-tb-voitures')">
          <button class="jbtn" style="background:${LC.orange}" onclick="locAdd('voitures')">+ Ajouter</button>
          <button class="jbtn-out" onclick="locEdit('voitures')">Modifier</button>
          <button class="jbtn-out" style="color:${LC.red};border-color:${LC.red}" onclick="locDelete('voitures')">Supprimer</button>
        </div>
      </div>
      <div class="jtable-wrap" style="margin-top:0"><div class="jtable-scroll">
        <table class="jtable">
          <thead><tr><th>ID</th><th>Marque</th><th>Modèle</th><th>Année</th><th>Couleur</th><th>Immat.</th><th>Prix/j</th><th>Statut</th></tr></thead>
          <tbody id="loc-tb-voitures">${rows}</tbody></table></div></div></div>`;
}
function locReservations() {
    const statuts=['Tous','Confirmée','En cours','Terminée','Annulée'];
    const rows=LOC.reservations.map((r,i)=>{
        const isSel=locSel&&locSel.entity==='reservations'&&locSel.idx===i;
        const sc=LC.sr[r[7]]||LC.text;
        return `<tr class="${isSel?'jrow-sel':i%2?'alt':''}" data-idx="${i}" data-statut="${r[7]}"
            onclick="locSelectRow(this,'reservations',${i})">
            <td style="color:#64748b">${r[0]}</td><td>${r[3]}</td><td>${r[4]}</td>
            <td>${r[5]}</td><td>${r[6]}</td><td style="color:${sc};font-weight:700">${r[7]}</td></tr>`;
    }).join('');
    return `<div class="jpanel">
      <div class="jpanel-header"><div><div class="jpanel-title">Réservations</div>
        <div class="jpanel-sub">${LOC.reservations.length} réservation(s)</div></div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <select class="jselect" onchange="locFilterResa(this.value)">${statuts.map(s=>`<option>${s}</option>`).join('')}</select>
          <button class="jbtn" style="background:${LC.green}" onclick="locAddResa()">+ Réserver</button>
          <button class="jbtn-out" style="color:${LC.red};border-color:${LC.red}" onclick="locDelete('reservations')">Annuler</button>
        </div>
      </div>
      <div class="jtable-wrap" style="margin-top:0"><div class="jtable-scroll">
        <table class="jtable">
          <thead><tr><th>ID</th><th>Client</th><th>Voiture</th><th>Début</th><th>Fin</th><th>Statut</th></tr></thead>
          <tbody id="loc-tb-reservations">${rows}</tbody></table></div></div></div>`;
}
// ── CRUD fields ───────────────────────────────────────────────
const LOC_FIELDS = {
    clients:[{label:'Nom',type:'text',required:true},{label:'Prénom',type:'text',required:true},{label:'Email',type:'email'},{label:'Téléphone',type:'text'},{label:'Adresse',type:'text'},{label:'Date naissance',type:'text',placeholder:'AAAA-MM-JJ'}],
    voitures:[{label:'Marque',type:'text',required:true},{label:'Modèle',type:'text',required:true},{label:'Année',type:'number'},{label:'Couleur',type:'text'},{label:'Immatriculation',type:'text',required:true},{label:'Prix/jour (€)',type:'number'},{label:'Statut',type:'select',options:['Disponible','En location','Maintenance']}],
    users:[{label:'Login',type:'text',required:true},{label:'Email',type:'email'},{label:'Rôle',type:'select',options:['admin','agent']}],
};
function locSelectRow(tr,entity,idx) {
    if(locSel&&locSel.entity===entity&&locSel.idx===idx){tr.className=idx%2?'alt':'';locSel=null;return;}
    document.querySelectorAll('#loc-root .jrow-sel').forEach(r=>{r.classList.remove('jrow-sel');r.className=parseInt(r.dataset.idx)%2?'alt':'';});
    tr.classList.add('jrow-sel'); locSel={entity,idx};
}
function locAdd(entity) {
    const fields=LOC_FIELDS[entity]; if(!fields) return;
    locOpenModal('Ajouter — '+entity,fields,[null,...fields.map(()=>'')],row=>{
        row[0]=LOC._id[entity]++; LOC[entity].push(row); locSel=null; locGo(entity); locToast('Ajouté avec succès');
    });
}
function locEdit(entity) {
    if(!locSel||locSel.entity!==entity){locToast("Sélectionnez d'abord une ligne",LC.orange);return;}
    const fields=LOC_FIELDS[entity]; if(!fields) return;
    const row=[...LOC[entity][locSel.idx]];
    locOpenModal('Modifier — '+entity,fields,row,newRow=>{
        newRow[0]=row[0]; LOC[entity][locSel.idx]=newRow; const idx=locSel.idx; locSel=null; locGo(entity);
        setTimeout(()=>{const tr=document.querySelector(`#loc-tb-${entity} tr[data-idx="${idx}"]`);if(tr)locSelectRow(tr,entity,idx);},150);
        locToast('Modifié avec succès');
    });
}
function locDelete(entity) {
    if(!locSel||locSel.entity!==entity){locToast("Sélectionnez d'abord une ligne",LC.orange);return;}
    const row=LOC[entity][locSel.idx];
    locConfirm(`Supprimer <strong>${row[1]}${row[2]?' '+row[2]:''}</strong> ?`,()=>{
        LOC[entity].splice(locSel.idx,1); locSel=null; locGo(entity); locToast('Supprimé','#dc2626');
    });
}
function locAddResa() {
    const cOpts=LOC.clients.map(c=>`${c[1]} ${c[2]}`);
    const vOpts=LOC.voitures.filter(v=>v[7]==='Disponible').map(v=>`${v[1]} ${v[2]}`);
    if(!vOpts.length){locToast('Aucune voiture disponible',LC.orange);return;}
    const fields=[{label:'Client',type:'select',options:cOpts,required:true},{label:'Voiture',type:'select',options:vOpts,required:true},{label:'Date début',type:'text',placeholder:'AAAA-MM-JJ',required:true},{label:'Date fin',type:'text',placeholder:'AAAA-MM-JJ',required:true},{label:'Statut',type:'select',options:['Confirmée','En cours','Terminée','Annulée']}];
    locOpenModal('Nouvelle réservation',fields,[null,'','','','','Confirmée'],row=>{
        const id=LOC._id.reservations++; LOC.reservations.push([id,0,0,row[1],row[2],row[3],row[4],row[5]]); locSel=null; locGo('reservations'); locToast('Réservation créée');
    });
}
function locSearch(input,tbId){const q=input.value.toLowerCase();document.querySelectorAll('#'+tbId+' tr').forEach(tr=>{tr.style.display=tr.textContent.toLowerCase().includes(q)?'':'none';});}
function locFilterResa(val){document.querySelectorAll('#loc-tb-reservations tr').forEach(tr=>{tr.style.display=(val==='Tous'||tr.dataset.statut===val)?'':'none';});}
function locOpenModal(title,fields,row,onSave) {
    locCloseModal(); locModalCb=onSave;
    const formRows=fields.map((f,fi)=>{
        const val=row[fi+1]!==undefined?row[fi+1]:'';
        const input=f.type==='select'?`<select name="f${fi}" class="jselect jfield">${f.options.map(o=>`<option ${o==val?'selected':''}>${o}</option>`).join('')}</select>`:`<input type="${f.type||'text'}" name="f${fi}" value="${String(val).replace(/"/g,'&quot;')}" class="jsearch jfield" style="width:100%" ${f.required?'required':''} ${f.placeholder?`placeholder="${f.placeholder}"`:''}>`;
        return `<div class="jform-row"><label class="jform-label">${f.label}${f.required?' <span style="color:#dc2626">*</span>':''}</label>${input}</div>`;
    }).join('');
    const m=document.createElement('div'); m.className='jmodal-overlay'; m.id='loc-modal';
    m.innerHTML=`<div class="jmodal" onclick="event.stopPropagation()">
      <div class="jmodal-header"><span>${title}</span><button class="jbtn-close" onclick="locCloseModal()">✕</button></div>
      <form class="jmodal-form" id="loc-form" onsubmit="locSubmitModal(event)">
        <div class="jform-grid">${formRows}</div>
        <div class="jmodal-footer">
          <button type="button" class="jbtn-out" onclick="locCloseModal()">Annuler</button>
          <button type="submit" class="jbtn" style="background:${LC.blue}">✓ Enregistrer</button>
        </div>
      </form></div>`;
    m.addEventListener('click',locCloseModal);
    document.getElementById('loc-root').appendChild(m);
    setTimeout(()=>{const f=m.querySelector('.jfield');if(f)f.focus();},50);
}
function locCloseModal(){const m=document.getElementById('loc-modal');if(m)m.remove();locModalCb=null;}
function locSubmitModal(e){
    e.preventDefault(); if(!locModalCb) return;
    const row=[null]; e.target.querySelectorAll('[name^="f"]').forEach(inp=>row.push(inp.type==='number'?(isNaN(+inp.value)?inp.value:+inp.value):inp.value));
    locModalCb(row); locCloseModal();
}
function locConfirm(msg,onOk){
    locCloseConfirm(); locConfirmCb=onOk;
    const d=document.createElement('div'); d.className='jmodal-overlay'; d.id='loc-confirm';
    d.innerHTML=`<div class="jmodal" style="max-width:400px" onclick="event.stopPropagation()">
      <div class="jmodal-header"><span style="color:#dc2626">⚠ Confirmer</span><button class="jbtn-close" onclick="locCloseConfirm()">✕</button></div>
      <div style="padding:20px 24px;color:#e2e8f0;line-height:1.6">${msg}</div>
      <div class="jmodal-footer"><button class="jbtn-out" onclick="locCloseConfirm()">Annuler</button>
        <button class="jbtn" style="background:#dc2626" onclick="locDoConfirm()">Supprimer</button></div></div>`;
    d.addEventListener('click',locCloseConfirm);
    document.getElementById('loc-root').appendChild(d);
}
function locCloseConfirm(){const d=document.getElementById('loc-confirm');if(d)d.remove();locConfirmCb=null;}
function locDoConfirm(){locCloseConfirm();if(locConfirmCb)locConfirmCb();}
function locToast(msg,color){
    const old=document.getElementById('loc-toast');if(old)old.remove();
    const t=document.createElement('div'); t.id='loc-toast'; t.className='jtoast';
    t.style.borderLeftColor=color||LC.green; t.textContent=msg;
    document.getElementById('loc-root').appendChild(t);
    setTimeout(()=>t.classList.add('jtoast-in'),10);
    setTimeout(()=>{t.classList.remove('jtoast-in');setTimeout(()=>t.remove(),300);},2500);
}
