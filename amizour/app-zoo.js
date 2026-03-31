// ============================================================
//  app-zoo.js — Gestion du Zoo (sans MySQL)
// ============================================================

const ZOO_DATA = {
    _id: { especes:6, animaux:9, personnels:8, fonctions:5 },
    fonctions: [
        [1,'Soigneur','Soin quotidien des animaux'],
        [2,'Vétérinaire','Suivi médical et soins'],
        [3,'Responsable de zone','Gestion d\'un secteur du zoo'],
        [4,'Accueil','Accueil et information des visiteurs'],
        [5,'Directeur','Direction générale du zoo'],
    ],
    especes: [
        [1,'Lion','Panthera leo','Mammifère','Savane'],
        [2,'Éléphant d\'Afrique','Loxodonta africana','Mammifère','Savane'],
        [3,'Flamant rose','Phoenicopterus roseus','Oiseau','Zone humide'],
        [4,'Python royal','Python regius','Reptile','Forêt tropicale'],
        [5,'Dauphin commun','Delphinus delphis','Mammifère','Océan'],
    ],
    animaux: [
        [1,'Simba','Lion',1,'M','2018-03-12','Excellent'],
        [2,'Nala','Lion',1,'F','2019-07-24','Bon'],
        [3,'Dumbo','Éléphant d\'Afrique',2,'M','2010-11-05','Excellent'],
        [4,'Elsa','Éléphant d\'Afrique',2,'F','2012-04-18','Bon'],
        [5,'Rosa','Flamant rose',3,'F','2017-06-30','Excellent'],
        [6,'Kaa','Python royal',4,'M','2020-02-14','Bon'],
        [7,'Flipper','Dauphin commun',5,'M','2015-09-01','Excellent'],
        [8,'Stella','Dauphin commun',5,'F','2016-12-20','Bon'],
    ],
    personnels: [
        [1,'Moreau','Jacques','Directeur',5,'Directeur','2010-01-15'],
        [2,'Blanc','Isabelle','Vétérinaire chef',2,'Vétérinaire','2012-06-01'],
        [3,'Dupont','Thomas','Soigneur félins',1,'Soigneur','2015-03-22'],
        [4,'Martin','Lucie','Soigneur éléphants',1,'Soigneur','2016-09-10'],
        [5,'Bernard','Éric','Responsable savane',3,'Responsable de zone','2014-04-05'],
        [6,'Petit','Céline','Vétérinaire adjointe',2,'Vétérinaire','2018-07-18'],
        [7,'Leroy','Maxime','Soigneur dauphinarium',1,'Soigneur','2019-11-03'],
    ],
};

const ZC = {
    bg:'#0a160a', sidebar:'#0d200d', card:'#1a2e1a', border:'#1e3e1e',
    lime:'#84cc16', green:'#16a34a', teal:'#0d9488', red:'#dc2626',
    blue:'#2563eb', amber:'#d97706', text:'#f0fdf0', sub:'#86efac',
    sh:{'Excellent':'#16a34a','Bon':'#d97706','Malade':'#dc2626','Décédé':'#64748b'},
};
const ZC_NAV = [
    {key:'dashboard',  label:'Tableau de bord', color:ZC.lime},
    {key:'animaux',    label:'Animaux',          color:ZC.green},
    {key:'especes',    label:'Espèces',          color:ZC.teal},
    {key:'personnels', label:'Personnels',        color:ZC.amber},
    {key:'fonctions',  label:'Fonctions',         color:ZC.blue},
];
let zooPage='dashboard', zooSel=null, zooModalCb=null, zooConfirmCb=null;

function buildZooApp() {
    const nav = ZC_NAV.map(n=>`
      <button class="japp-nav ${n.key===zooPage?'active':''}" data-page="${n.key}"
              style="--nc:${n.color}" onclick="zooGo('${n.key}')">
        <span class="jnav-dot" style="background:${n.color}"></span>${n.label}
      </button>`).join('');
    return `<div class="japp" id="zoo-root">
      <div class="japp-sidebar" style="background:${ZC.sidebar}">
        <div class="japp-logo">
          <div class="japp-logo-icon" style="background:${ZC.lime};color:#0a160a">ZO</div>
          <div><div class="japp-logo-title">Zoo Manager</div>
          <div class="japp-logo-sub">Gestion du parc animalier</div></div>
        </div>
        <div class="japp-nav-list">${nav}</div>
        <div class="japp-footer">v1.0 — Dylan Arezki<br><span style="color:#1e3e1e;font-size:10px">MODE DÉMO</span></div>
      </div>
      <div class="japp-content" id="zoo-content">${zooBuildPage('dashboard')}</div>
    </div>`;
}
function zooGo(page) {
    zooPage=page; zooSel=null;
    document.querySelectorAll('#zoo-root .japp-nav').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
    const c=document.getElementById('zoo-content');
    c.style.opacity='0';
    setTimeout(()=>{ c.innerHTML=zooBuildPage(page); c.style.opacity='1'; },100);
}
function zooBuildPage(page) {
    switch(page){
        case 'dashboard':  return zooDashboard();
        case 'animaux':    return zooAnimaux();
        case 'especes':    return zooEntityPanel('especes','Espèces',['ID','Nom commun','Nom scientifique','Classe','Habitat'],[40,140,180,100,120],ZC.teal);
        case 'personnels': return zooPersonnels();
        case 'fonctions':  return zooEntityPanel('fonctions','Fonctions',['ID','Libellé','Description'],[40,140,280],ZC.blue);
        default:           return zooDashboard();
    }
}
function zooDashboard() {
    const santeOk=ZOO_DATA.animaux.filter(a=>a[6]==='Excellent').length;
    const cards=[
        {label:'ESPÈCES',val:ZOO_DATA.especes.length,color:ZC.teal,page:'especes'},
        {label:'ANIMAUX',val:ZOO_DATA.animaux.length,color:ZC.green,page:'animaux'},
        {label:'EN BONNE SANTÉ',val:santeOk,color:ZC.lime,page:'animaux'},
        {label:'PERSONNELS',val:ZOO_DATA.personnels.length,color:ZC.amber,page:'personnels'},
        {label:'FONCTIONS',val:ZOO_DATA.fonctions.length,color:ZC.blue,page:'fonctions'},
    ].map(c=>`<div class="jcard" style="--cc:${c.color};cursor:pointer" onclick="zooGo('${c.page}')">
        <div class="jcard-bar" style="background:${c.color}"></div>
        <div class="jcard-label">${c.label}</div>
        <div class="jcard-val" style="color:${c.color}">${c.val}</div></div>`).join('');
    const rows=ZOO_DATA.animaux.map((a,i)=>{
        const sc=ZC.sh[a[6]]||ZC.text;
        return `<tr class="${i%2?'alt':''}"><td style="color:#64748b">${a[0]}</td>
            <td><strong>${a[1]}</strong></td><td>${a[2]}</td>
            <td>${a[4]}</td><td>${a[5]}</td>
            <td style="color:${sc};font-weight:700">${a[6]}</td></tr>`;
    }).join('');
    return `<div class="jpanel">
      <div class="jpanel-header"><div><div class="jpanel-title">Tableau de bord</div>
        <div class="jpanel-sub">Gestion du parc animalier — Mode démo</div></div>
        <button class="jbtn" style="background:${ZC.lime};color:#0a160a" onclick="zooGo('dashboard')">↺ Actualiser</button>
      </div>
      <div class="jcards">${cards}</div>
      <div class="jtable-wrap"><div class="jtable-title" style="padding:12px 14px 0">État des animaux</div>
        <div class="jtable-scroll"><table class="jtable">
          <thead><tr><th>ID</th><th>Nom</th><th>Espèce</th><th>Sexe</th><th>Naissance</th><th>Santé</th></tr></thead>
          <tbody>${rows}</tbody></table></div></div></div>`;
}
function zooAnimaux() {
    const rows=ZOO_DATA.animaux.map((a,i)=>{
        const isSel=zooSel&&zooSel.entity==='animaux'&&zooSel.idx===i;
        const sc=ZC.sh[a[6]]||ZC.text;
        return `<tr class="${isSel?'jrow-sel':i%2?'alt':''}" data-idx="${i}"
            onclick="zooSelectRow(this,'animaux',${i})">
            <td style="color:#64748b">${a[0]}</td><td><strong>${a[1]}</strong></td>
            <td>${a[2]}</td><td>${a[4]}</td><td>${a[5]}</td>
            <td style="color:${sc};font-weight:700">${a[6]}</td></tr>`;
    }).join('');
    return `<div class="jpanel">
      <div class="jpanel-header"><div><div class="jpanel-title">Animaux</div>
        <div class="jpanel-sub">${ZOO_DATA.animaux.length} animal/animaux</div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <input class="jsearch" placeholder="Rechercher..." oninput="zooSearch(this,'zoo-tb-animaux')">
          <button class="jbtn" style="background:${ZC.green}" onclick="zooAdd('animaux')">+ Ajouter</button>
          <button class="jbtn-out" onclick="zooEdit('animaux')">Modifier</button>
          <button class="jbtn-out" style="color:${ZC.red};border-color:${ZC.red}" onclick="zooDelete('animaux')">Supprimer</button>
        </div>
      </div>
      <div class="jtable-wrap" style="margin-top:0"><div class="jtable-scroll">
        <table class="jtable">
          <thead><tr><th>ID</th><th>Nom</th><th>Espèce</th><th>Sexe</th><th>Naissance</th><th>Santé</th></tr></thead>
          <tbody id="zoo-tb-animaux">${rows}</tbody></table></div></div></div>`;
}
function zooPersonnels() {
    const rows=ZOO_DATA.personnels.map((p,i)=>{
        const isSel=zooSel&&zooSel.entity==='personnels'&&zooSel.idx===i;
        return `<tr class="${isSel?'jrow-sel':i%2?'alt':''}" data-idx="${i}"
            onclick="zooSelectRow(this,'personnels',${i})">
            <td style="color:#64748b">${p[0]}</td><td><strong>${p[1]}</strong></td>
            <td>${p[2]}</td><td>${p[3]}</td>
            <td style="color:${ZC.amber}">${p[5]}</td><td>${p[6]}</td></tr>`;
    }).join('');
    return `<div class="jpanel">
      <div class="jpanel-header"><div><div class="jpanel-title">Personnels</div>
        <div class="jpanel-sub">${ZOO_DATA.personnels.length} employé(s)</div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <input class="jsearch" placeholder="Rechercher..." oninput="zooSearch(this,'zoo-tb-personnels')">
          <button class="jbtn" style="background:${ZC.amber}" onclick="zooAdd('personnels')">+ Ajouter</button>
          <button class="jbtn-out" onclick="zooEdit('personnels')">Modifier</button>
          <button class="jbtn-out" style="color:${ZC.red};border-color:${ZC.red}" onclick="zooDelete('personnels')">Supprimer</button>
        </div>
      </div>
      <div class="jtable-wrap" style="margin-top:0"><div class="jtable-scroll">
        <table class="jtable">
          <thead><tr><th>ID</th><th>Nom</th><th>Prénom</th><th>Poste</th><th>Fonction</th><th>Embauche</th></tr></thead>
          <tbody id="zoo-tb-personnels">${rows}</tbody></table></div></div></div>`;
}
function zooEntityPanel(entity,title,cols,widths,color) {
    const data=ZOO_DATA[entity];
    const heads=cols.map((c,i)=>`<th style="min-width:${widths[i]||80}px">${c}</th>`).join('');
    const rows=data.map((row,i)=>{
        const isSel=zooSel&&zooSel.entity===entity&&zooSel.idx===i;
        return `<tr class="${isSel?'jrow-sel':i%2?'alt':''}" data-idx="${i}"
            onclick="zooSelectRow(this,'${entity}',${i})">${row.map(v=>`<td>${v}</td>`).join('')}</tr>`;
    }).join('');
    return `<div class="jpanel">
      <div class="jpanel-header"><div><div class="jpanel-title">${title}</div>
        <div class="jpanel-sub">${data.length} enregistrement(s)</div></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <input class="jsearch" placeholder="Rechercher..." oninput="zooSearch(this,'zoo-tb-${entity}')">
          <button class="jbtn" style="background:${color}" onclick="zooAdd('${entity}')">+ Ajouter</button>
          <button class="jbtn-out" onclick="zooEdit('${entity}')">Modifier</button>
          <button class="jbtn-out" style="color:${ZC.red};border-color:${ZC.red}" onclick="zooDelete('${entity}')">Supprimer</button>
        </div>
      </div>
      <div class="jtable-wrap" style="margin-top:0"><div class="jtable-scroll">
        <table class="jtable"><thead><tr>${heads}</tr></thead>
        <tbody id="zoo-tb-${entity}">${rows}</tbody></table></div></div></div>`;
}
// ── CRUD fields ───────────────────────────────────────────────
const ZOO_FIELDS = {
    animaux:[{label:'Nom',type:'text',required:true},{label:'Espèce',type:'select',options:ZOO_DATA.especes.map(e=>e[1]),required:true},{label:'Sexe',type:'select',options:['M','F']},{label:'Date naissance',type:'text',placeholder:'AAAA-MM-JJ'},{label:'État de santé',type:'select',options:['Excellent','Bon','Malade','Décédé']}],
    personnels:[{label:'Nom',type:'text',required:true},{label:'Prénom',type:'text',required:true},{label:'Poste',type:'text'},{label:'Fonction',type:'select',options:ZOO_DATA.fonctions.map(f=>f[1])},{label:'Date embauche',type:'text',placeholder:'AAAA-MM-JJ'}],
    especes:[{label:'Nom commun',type:'text',required:true},{label:'Nom scientifique',type:'text'},{label:'Classe',type:'select',options:['Mammifère','Oiseau','Reptile','Poisson','Insecte','Amphibien']},{label:'Habitat',type:'text'}],
    fonctions:[{label:'Libellé',type:'text',required:true},{label:'Description',type:'text'}],
};
function zooSelectRow(tr,entity,idx) {
    if(zooSel&&zooSel.entity===entity&&zooSel.idx===idx){tr.className=idx%2?'alt':'';zooSel=null;return;}
    document.querySelectorAll('#zoo-root .jrow-sel').forEach(r=>{r.classList.remove('jrow-sel');r.className=parseInt(r.dataset.idx)%2?'alt':'';});
    tr.classList.add('jrow-sel'); zooSel={entity,idx};
}
function zooAdd(entity) {
    const fields=ZOO_FIELDS[entity]; if(!fields) return;
    zooOpenModal('Ajouter — '+entity,fields,[null,...fields.map(()=>'')],row=>{
        row[0]=ZOO_DATA._id[entity]++; ZOO_DATA[entity].push(row); zooSel=null; zooGo(entity); zooToast('Ajouté avec succès');
    });
}
function zooEdit(entity) {
    if(!zooSel||zooSel.entity!==entity){zooToast("Sélectionnez d'abord une ligne",ZC.amber);return;}
    const fields=ZOO_FIELDS[entity]; if(!fields) return;
    const row=[...ZOO_DATA[entity][zooSel.idx]];
    zooOpenModal('Modifier — '+entity,fields,row,newRow=>{
        newRow[0]=row[0]; ZOO_DATA[entity][zooSel.idx]=newRow; const idx=zooSel.idx; zooSel=null; zooGo(entity);
        setTimeout(()=>{const tr=document.querySelector(`#zoo-tb-${entity} tr[data-idx="${idx}"]`);if(tr)zooSelectRow(tr,entity,idx);},150);
        zooToast('Modifié avec succès');
    });
}
function zooDelete(entity) {
    if(!zooSel||zooSel.entity!==entity){zooToast("Sélectionnez d'abord une ligne",ZC.amber);return;}
    const row=ZOO_DATA[entity][zooSel.idx];
    zooConfirm(`Supprimer <strong>${row[1]}${row[2]?' '+row[2]:''}</strong> ?`,()=>{
        ZOO_DATA[entity].splice(zooSel.idx,1); zooSel=null; zooGo(entity); zooToast('Supprimé','#dc2626');
    });
}
function zooSearch(input,tbId){const q=input.value.toLowerCase();document.querySelectorAll('#'+tbId+' tr').forEach(tr=>{tr.style.display=tr.textContent.toLowerCase().includes(q)?'':'none';});}
function zooOpenModal(title,fields,row,onSave) {
    zooCloseModal(); zooModalCb=onSave;
    const formRows=fields.map((f,fi)=>{
        const val=row[fi+1]!==undefined?row[fi+1]:'';
        const input=f.type==='select'?`<select name="f${fi}" class="jselect jfield">${f.options.map(o=>`<option ${o==val?'selected':''}>${o}</option>`).join('')}</select>`:`<input type="${f.type||'text'}" name="f${fi}" value="${String(val).replace(/"/g,'&quot;')}" class="jsearch jfield" style="width:100%" ${f.required?'required':''} ${f.placeholder?`placeholder="${f.placeholder}"`:''}>`;
        return `<div class="jform-row"><label class="jform-label">${f.label}${f.required?' <span style="color:#dc2626">*</span>':''}</label>${input}</div>`;
    }).join('');
    const m=document.createElement('div'); m.className='jmodal-overlay'; m.id='zoo-modal';
    m.innerHTML=`<div class="jmodal" onclick="event.stopPropagation()">
      <div class="jmodal-header"><span>${title}</span><button class="jbtn-close" onclick="zooCloseModal()">✕</button></div>
      <form class="jmodal-form" id="zoo-form" onsubmit="zooSubmitModal(event)">
        <div class="jform-grid">${formRows}</div>
        <div class="jmodal-footer">
          <button type="button" class="jbtn-out" onclick="zooCloseModal()">Annuler</button>
          <button type="submit" class="jbtn" style="background:${ZC.lime};color:#0a160a">✓ Enregistrer</button>
        </div>
      </form></div>`;
    m.addEventListener('click',zooCloseModal);
    document.getElementById('zoo-root').appendChild(m);
    setTimeout(()=>{const f=m.querySelector('.jfield');if(f)f.focus();},50);
}
function zooCloseModal(){const m=document.getElementById('zoo-modal');if(m)m.remove();zooModalCb=null;}
function zooSubmitModal(e){
    e.preventDefault(); if(!zooModalCb) return;
    const row=[null]; e.target.querySelectorAll('[name^="f"]').forEach(inp=>row.push(inp.type==='number'?(isNaN(+inp.value)?inp.value:+inp.value):inp.value));
    zooModalCb(row); zooCloseModal();
}
function zooConfirm(msg,onOk){
    zooCloseConfirm(); zooConfirmCb=onOk;
    const d=document.createElement('div'); d.className='jmodal-overlay'; d.id='zoo-confirm';
    d.innerHTML=`<div class="jmodal" style="max-width:400px" onclick="event.stopPropagation()">
      <div class="jmodal-header"><span style="color:#dc2626">⚠ Confirmer</span><button class="jbtn-close" onclick="zooCloseConfirm()">✕</button></div>
      <div style="padding:20px 24px;color:#e2e8f0;line-height:1.6">${msg}</div>
      <div class="jmodal-footer"><button class="jbtn-out" onclick="zooCloseConfirm()">Annuler</button>
        <button class="jbtn" style="background:#dc2626" onclick="zooDoConfirm()">Supprimer</button></div></div>`;
    d.addEventListener('click',zooCloseConfirm);
    document.getElementById('zoo-root').appendChild(d);
}
function zooCloseConfirm(){const d=document.getElementById('zoo-confirm');if(d)d.remove();zooConfirmCb=null;}
function zooDoConfirm(){zooCloseConfirm();if(zooConfirmCb)zooConfirmCb();}
function zooToast(msg,color){
    const old=document.getElementById('zoo-toast');if(old)old.remove();
    const t=document.createElement('div'); t.id='zoo-toast'; t.className='jtoast';
    t.style.borderLeftColor=color||ZC.lime; t.textContent=msg;
    document.getElementById('zoo-root').appendChild(t);
    setTimeout(()=>t.classList.add('jtoast-in'),10);
    setTimeout(()=>{t.classList.remove('jtoast-in');setTimeout(()=>t.remove(),300);},2500);
}
