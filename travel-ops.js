/* Five independent V13 workspaces. Never initialize storage by replacing old data. */
const OPS_MODULES = {
  connectivity: {title:'Connectivity + Payments', key:'marcyJapan2028TravelOpsConnectivityV1', tasks:[
    'Confirm your primary eSIM or Wi-Fi arrangement', 'Save setup instructions offline, without activation secrets',
    'Test mobile data and your backup connection', 'Check Suica setup and a backup transit payment method',
    'Confirm Wise and physical card access', 'Plan accessible cash and a backup payment method',
    'Record where secure account recovery instructions are kept, not their contents']},
  luggage: {title:'Luggage Operations', key:'marcyJapan2028TravelOpsLuggageV1', tasks:[
    'Confirm forwarding availability with the sending and receiving accommodation',
    'Confirm delivery date, acceptance hours and carrier instructions',
    'Pack essentials for every night away from your main suitcase',
    'Record the bag location and receipt storage location', 'Check delivery or collection status']},
  disruptions: {title:'Disruption + Backups', key:'marcyJapan2028TravelOpsDisruptionsV1', tasks:[
    'Write a response plan for a flight or train delay', 'Record where cancellation and rebooking instructions are saved',
    'Save alternatives for closures or weather changes', 'Plan who to contact for a missing bag or lost belongings',
    'Record backup routes and a place to wait', 'Keep useful provider and assistance contacts accessible offline']},
  kix: {title:'KIX Departure', key:'marcyJapan2028TravelOpsKixV1', tasks:[
    'Confirm flight, terminal and airport arrival target', 'Confirm checkout and hotel-to-airport transfer',
    'Confirm checked bags and weigh each suitcase separately', 'Review current instructions for tax-free purchases before packing',
    'Keep documents and essential belongings accessible', 'Arrange connectivity-equipment return if applicable',
    'Check the room, safe and outlets before leaving', 'Save departure booking and transfer details offline']},
  offline: {title:'Offline Access', key:'marcyJapan2028TravelOpsOfflineV1', tasks:[
    'Export a full planner JSON backup', 'Save the Ops text reference on your device',
    'Download useful maps in your map application', 'Save accommodation names and addresses offline',
    'Save booking documents in a private offline folder', 'Save important contact and route references',
    'Test those saved materials with network access disabled', 'Keep a local copy of the planner files if you need offline reopening']}
};
const OPS_RECORD_STATUSES = ['Planned','Handed over','In transit','Delivered','Collected','Needs Attention'];
const OPS_RECORD_FIELDS = ['label','from','to','carrier','location','receiptReference','dispatchDate','expectedDate','notes'];
const opsState = {}, opsRaw = {}, opsLocked = {}, opsDetails = {};
const opsObject = x => !!x && typeof x === 'object' && !Array.isArray(x);
function opsDefault(id) {
  return {version:1,moduleId:id,needsAttention:false,notes:'',updatedAt:'',
    checklist:OPS_MODULES[id].tasks.map((title,i)=>({id:'task'+(i+1),title,done:false,needsAttention:false,notes:''})),records:[]};
}
function validateOpsModule(id, x) {
  const errors=[];
  if(!opsObject(x))return ['Module must be an object.'];
  if(Object.keys(x).some(k=>!['version','moduleId','needsAttention','notes','updatedAt','checklist','records'].includes(k)))errors.push('Unexpected module fields.');
  if(x.version!==1||x.moduleId!==id)errors.push('Unsupported module version or identity.');
  const string=(v,label,max=20000)=>{if(typeof v!=='string'||v.length>max)errors.push(label+' must be text within the allowed size.');};
  const identifier=(v,label)=>{if(typeof v!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(v))errors.push(label+' has an invalid identifier.');};
  string(x.notes,'Notes');string(x.updatedAt,'Timestamp',80);
  if(x.updatedAt&&!Number.isFinite(Date.parse(x.updatedAt)))errors.push('Invalid timestamp.');
  if(typeof x.needsAttention!=='boolean')errors.push('Attention state must be a boolean.');
  if(!Array.isArray(x.checklist)||x.checklist.length>200)errors.push('Checklist must have at most 200 tasks.');
  else {const ids=new Set();x.checklist.forEach((t,i)=>{if(!opsObject(t)){errors.push('Invalid task.');return;}
    if(Object.keys(t).some(k=>!['id','title','done','needsAttention','notes'].includes(k)))errors.push('Unexpected task fields.');
    identifier(t.id,'Task');if(ids.has(t.id))errors.push('Duplicate task identifier.');ids.add(t.id);
    string(t.title,'Task title',240);if(typeof t.title==='string'&&!t.title.trim())errors.push('Task title is required.');string(t.notes,'Task notes');
    if(typeof t.done!=='boolean'||typeof t.needsAttention!=='boolean')errors.push('Task states must be booleans.');});}
  if(!Array.isArray(x.records)||x.records.length>200)errors.push('Records must have at most 200 entries.');
  else {if(id!=='luggage'&&x.records.length)errors.push('Forwarding records belong in Luggage Operations.');
    const ids=new Set();x.records.forEach(r=>{if(!opsObject(r)){errors.push('Invalid forwarding record.');return;}
      if(Object.keys(r).some(k=>!['id','status','updatedAt',...OPS_RECORD_FIELDS].includes(k)))errors.push('Unexpected forwarding fields.');
      identifier(r.id,'Record');if(ids.has(r.id))errors.push('Duplicate record identifier.');ids.add(r.id);
      OPS_RECORD_FIELDS.forEach(k=>string(r[k],k,k==='notes'?20000:1000));string(r.updatedAt,'Record timestamp',80);
      if(!OPS_RECORD_STATUSES.includes(r.status))errors.push('Invalid delivery status.');
      if(r.updatedAt&&!Number.isFinite(Date.parse(r.updatedAt)))errors.push('Invalid record timestamp.');
      if(typeof r.label==='string'&&!r.label.trim())errors.push('A bag or forwarding label is required.');
      ['dispatchDate','expectedDate'].forEach(k=>{if(r[k]&&!/^\d{4}-\d{2}-\d{2}$/.test(r[k]))errors.push('Invalid forwarding date.');});});}
  return errors;
}
function validateTravelOpsBackup(payload) {
  if(!opsObject(payload)||payload.version!==1||!opsObject(payload.modules))return ['Invalid Travel Ops expansion package.'];
  if(Object.keys(payload).some(k=>!['version','modules'].includes(k)))return ['Unexpected Travel Ops package fields.'];
  const errors=[];Object.entries(payload.modules).forEach(([id,value])=>{
    if(!Object.hasOwn(OPS_MODULES,id))errors.push('Unknown Travel Ops module: '+id);
    else errors.push(...validateOpsModule(id,value).map(e=>OPS_MODULES[id].title+': '+e));});return errors;
}
function loadOpsModule(id) {
  opsLocked[id]='';
  try {const raw=localStorage.getItem(OPS_MODULES[id].key);opsRaw[id]=raw;
    if(raw===null){opsState[id]=opsDefault(id);return;}
    const saved=JSON.parse(raw),errors=validateOpsModule(id,saved);if(errors.length)throw Error(errors.join(' '));
    opsState[id]=saved;
  }catch(e){opsState[id]=opsDefault(id);opsLocked[id]='Saved module could not be read. It has not been replaced. '+e.message;}
}
Object.keys(OPS_MODULES).forEach(loadOpsModule);
function opsStatus(x) {
  if(x.needsAttention||x.checklist.some(t=>t.needsAttention)||x.records.some(r=>r.status==='Needs Attention'))return 'Needs Attention';
  const pending=x.records.some(r=>!['Delivered','Collected'].includes(r.status));
  if(x.checklist.length&&x.checklist.every(t=>t.done)&&!pending)return 'Ready';
  const defaults=opsDefault(x.moduleId).checklist;
  const changed=x.checklist.length!==defaults.length||x.checklist.some((t,i)=>t.id!==defaults[i]?.id||t.title!==defaults[i]?.title||t.notes||t.done);
  return x.notes||x.records.length||changed?'In Progress':'Not Started';
}
function opsTime(s){return s?new Date(s).toLocaleString():'Not updated yet';}
function captureOpsDetails(){document.querySelectorAll('[data-ops-detail]').forEach(d=>opsDetails[d.dataset.opsDetail]=d.open);}
function renderOpsExpansion() {
  captureOpsDetails();
  $('#opsExpansionRoot').innerHTML=Object.entries(OPS_MODULES).map(([id,meta])=>{
    const m=opsState[id],status=opsLocked[id]?'Needs Attention':opsStatus(m),done=m.checklist.filter(t=>t.done).length;
    if(opsLocked[id])return `<section class="ops-panel ops-module" data-ops-panel="${id}" ${opsPanel===id?'':'hidden'}><h2>${esc(meta.title)}</h2><p class="ops-module-alert">${esc(opsLocked[id])}</p><div class="ops-module-actions"><button data-ops-raw="${id}">DOWNLOAD STORED COPY</button><button data-ops-reset="${id}">RESET THIS MODULE</button></div></section>`;
    return `<section class="ops-panel ops-module" data-ops-panel="${id}" ${opsPanel===id?'':'hidden'}>
      <div class="ops-module-heading"><div><p>V13 // OPERATIONAL READINESS</p><h2>${esc(meta.title)}</h2></div><span class="ops-module-status ${status==='Ready'?'ready':status==='Needs Attention'?'attention':''}">${status}</span></div>
      <p class="ops-module-updated">Last updated: ${esc(opsTime(m.updatedAt))} · ${done} / ${m.checklist.length} tasks complete</p>
      <div class="privacy-callout">REFERENCE INFORMATION ONLY — no card or account numbers, passwords, passport scans, activation codes, or sensitive medical details.</div>
      ${id==='offline'?`<p class="ops-module-alert" id="opsOfflineNotice">${navigator.onLine?'Browser reports network access.':'Browser reports offline.'} Saved Ops data needs no network while this page is open. This checklist does not cache the hosted planner; offline reopening or reloading is not guaranteed. Keep a downloaded planner folder or the Ops text reference available.</p>`:''}
      <div class="ops-module-actions"><button data-ops-module-edit="${id}">EDIT MODULE NOTES</button><button data-ops-task-add="${id}">＋ ADD TASK</button><button data-ops-download>DOWNLOAD OPS NOTES</button><button data-ops-reset="${id}">RESET THIS MODULE</button></div>
      <details class="ops-module-section" data-ops-detail="${id}:notes" ${opsDetails[id+':notes']===false?'':'open'}><summary>Module notes ${m.needsAttention?'· Needs Attention':''}</summary><p>${esc(m.notes||'No additional notes.')}</p></details>
      <details class="ops-module-section" data-ops-detail="${id}:checklist" ${opsDetails[id+':checklist']===false?'':'open'}><summary>Editable checklist · ${done} / ${m.checklist.length}</summary><div class="ops-module-checklist">${m.checklist.map(t=>`<article class="ops-module-task"><label class="ops-module-check"><input type="checkbox" data-ops-module-task="${id}:${esc(t.id)}" ${t.done?'checked':''}><span>${esc(t.title)}</span></label>${t.needsAttention?'<span class="ops-module-status attention">Needs Attention</span>':''}${t.notes?`<p>${esc(t.notes)}</p>`:''}<div class="mini-actions"><button data-ops-task-edit="${id}:${esc(t.id)}">EDIT</button><button data-ops-task-delete="${id}:${esc(t.id)}">DELETE</button></div></article>`).join('')||'<p>No tasks. Use Add Task to build this checklist.</p>'}</div></details>
      ${id==='luggage'?`<details class="ops-module-section" data-ops-detail="${id}:records" ${opsDetails[id+':records']===false?'':'open'}><summary>Forwarding records · ${m.records.length}</summary><button class="secondary" data-ops-record-add>＋ ADD FORWARDING RECORD</button><div class="ops-forwarding-grid">${m.records.map(r=>`<article class="panel ops-forwarding"><span class="tag">${esc(r.status)}</span><h3>${esc(r.label)}</h3><p><b>From:</b> ${esc(r.from||'Not entered')}<br><b>To:</b> ${esc(r.to||'Not entered')}</p><p><b>Carrier:</b> ${esc(r.carrier||'Not entered')}<br><b>Bag location:</b> ${esc(r.location||'Not entered')}<br><b>Receipt kept at:</b> ${esc(r.receiptReference||'Not entered')}</p><p><b>Dispatch:</b> ${esc(r.dispatchDate||'Not entered')}<br><b>Expected delivery:</b> ${esc(r.expectedDate||'Not entered')}</p><p>${esc(r.notes)}</p><small>Updated: ${esc(opsTime(r.updatedAt))}</small><div class="mini-actions"><button data-ops-record-edit="${esc(r.id)}">EDIT</button><button data-ops-record-delete="${esc(r.id)}">DELETE</button></div></article>`).join('')||'<p>No forwarding arrangements recorded.</p>'}</div></details>`:''}
    </section>`;}).join('');
}
const renderLegacyOps=window.japanPlannerReady&&typeof operationsView==='function'?operationsView:null;
if(renderLegacyOps)operationsView=function(){renderLegacyOps();renderOpsExpansion();$('#opsSectionJump').value=opsPanel;};
if(renderLegacyOps)$('#opsSectionJump').onchange=e=>{opsPanel=e.target.value;operationsView();};
function persistOpsModule(id,next,allowLocked=false) {
  if(!Object.hasOwn(OPS_MODULES,id)||opsLocked[id]&&!allowLocked)return false;
  const errors=validateOpsModule(id,next);if(errors.length){toast('Module not saved: '+errors[0]);return false;}
  try {const current=localStorage.getItem(OPS_MODULES[id].key);
    if(current!==opsRaw[id]&&!allowLocked){loadOpsModule(id);renderOpsExpansion();toast('Module changed in another tab. Latest data loaded; please retry.');return false;}
    const raw=JSON.stringify(next);localStorage.setItem(OPS_MODULES[id].key,raw);opsRaw[id]=raw;opsState[id]=next;opsLocked[id]='';renderOpsExpansion();toast('Travel Ops saved locally');return true;
  }catch(e){renderOpsExpansion();toast('Travel Ops save failed; your previous saved data is retained');return false;}
}
function changeOpsModule(id,change) {if(opsLocked[id])return false;const next=copy(opsState[id]);change(next);next.updatedAt=new Date().toISOString();return persistOpsModule(id,next);}
function opsField(name,label,value='',type='text') {
  return `<label class="${type==='textarea'?'wide':''}">${esc(label)}${type==='textarea'?`<textarea name="${name}" rows="4" maxlength="20000">${esc(value)}</textarea>`:`<input name="${name}" type="${type}" value="${esc(value)}" maxlength="1000" ${name==='title'||name==='label'?'required':''}>`}</label>`;
}
function openOpsExpansionEditor(id,kind,recordId='') {
  if(opsLocked[id])return;
  const m=opsState[id],x=kind==='task'?m.checklist.find(t=>t.id===recordId):kind==='record'?m.records.find(r=>r.id===recordId):m;
  $('#opsExpansionId').value=id;$('#opsExpansionKind').value=kind;$('#opsExpansionRecordId').value=recordId;
  $('#opsExpansionTitle').textContent=(recordId||kind==='module'?'Edit ':'Add ')+(kind==='record'?'forwarding record':kind==='task'?'checklist task':OPS_MODULES[id].title+' notes');
  let fields='';
  if(kind==='task')fields=opsField('title','Task title',x?.title||'')+`<label class="check"><input name="done" type="checkbox" ${x?.done?'checked':''}> Complete</label>`;
  if(kind==='record')fields=opsField('label','Bag / forwarding label',x?.label||'')+opsField('from','Sending location',x?.from||'')+opsField('to','Receiving location',x?.to||'')+opsField('carrier','Carrier / service',x?.carrier||'')+`<label>Delivery status<select name="status">${OPS_RECORD_STATUSES.map(s=>`<option ${x?.status===s?'selected':''}>${s}</option>`).join('')}</select></label>`+opsField('location','Current bag location',x?.location||'')+opsField('receiptReference','Where receipt / tracking reference is kept',x?.receiptReference||'')+opsField('dispatchDate','Dispatch date',x?.dispatchDate||'','date')+opsField('expectedDate','Expected delivery date',x?.expectedDate||'','date');
  else fields+=`<label class="check"><input name="needsAttention" type="checkbox" ${x?.needsAttention?'checked':''}> Needs Attention</label>`;
  fields+=opsField('notes','Optional notes / reference locations',x?.notes||'','textarea');
  $('#opsExpansionFields').innerHTML=fields;modal('opsExpansionModal');
}
if(renderLegacyOps)$('#opsExpansionForm').onsubmit=e=>{
  e.preventDefault();const id=$('#opsExpansionId').value,kind=$('#opsExpansionKind').value,recordId=$('#opsExpansionRecordId').value,f=new FormData(e.target),now=new Date().toISOString();
  const success=changeOpsModule(id,m=>{
    if(kind==='module'){m.notes=f.get('notes');m.needsAttention=f.has('needsAttention');}
    else if(kind==='task'){const task={id:recordId||uid('task'),title:f.get('title').trim(),notes:f.get('notes'),done:f.has('done'),needsAttention:f.has('needsAttention')};m.checklist=recordId?m.checklist.map(t=>t.id===recordId?task:t):[...m.checklist,task];}
    else {const record={id:recordId||uid('bag'),...Object.fromEntries(OPS_RECORD_FIELDS.map(k=>[k,f.get(k)||''])),status:f.get('status'),updatedAt:now};m.records=recordId?m.records.map(r=>r.id===recordId?record:r):[...m.records,record];}
  });if(success)modal('opsExpansionModal',false);
};
function opsDownload(textValue,name,type='text/plain') {const url=URL.createObjectURL(new Blob([textValue],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
function downloadOpsNotes(){const lines=['JAPAN 2028 — TRAVEL OPS REFERENCE','Saved copy: '+new Date().toISOString(),'Reference only. Hosted planner offline reopening is not guaranteed.',''];
  Object.entries(OPS_MODULES).forEach(([id,meta])=>{const m=opsState[id];lines.push(meta.title,opsLocked[id]?'Stored data needs recovery':opsStatus(m),'Updated: '+opsTime(m.updatedAt),m.notes);if(!opsLocked[id]){m.checklist.forEach(t=>lines.push((t.done?'[x] ':'[ ] ')+t.title+(t.needsAttention?' — NEEDS ATTENTION':''),t.notes));m.records.forEach(r=>lines.push(r.label+' — '+r.status,...OPS_RECORD_FIELDS.filter(k=>k!=='label').map(k=>k+': '+r[k])));}lines.push('');});opsDownload(lines.join('\n'),'japan-travel-ops-'+new Date().toISOString().slice(0,10)+'.txt');}
document.addEventListener('click',e=>{if(!renderLegacyOps)return;const b=e.target.closest('button');if(!b)return;
  if(b.dataset.opsModuleEdit)openOpsExpansionEditor(b.dataset.opsModuleEdit,'module');
  if(b.dataset.opsTaskAdd)openOpsExpansionEditor(b.dataset.opsTaskAdd,'task');
  if(b.dataset.opsTaskEdit){const [id,t]=b.dataset.opsTaskEdit.split(':');openOpsExpansionEditor(id,'task',t);}
  if(b.dataset.opsTaskDelete&&confirm('Delete this checklist task?')){const [id,t]=b.dataset.opsTaskDelete.split(':');changeOpsModule(id,m=>m.checklist=m.checklist.filter(x=>x.id!==t));}
  if(b.hasAttribute('data-ops-record-add'))openOpsExpansionEditor('luggage','record');
  if(b.dataset.opsRecordEdit)openOpsExpansionEditor('luggage','record',b.dataset.opsRecordEdit);
  if(b.dataset.opsRecordDelete&&confirm('Delete this forwarding record?'))changeOpsModule('luggage',m=>m.records=m.records.filter(r=>r.id!==b.dataset.opsRecordDelete));
  if(b.hasAttribute('data-ops-download'))downloadOpsNotes();
  if(b.dataset.opsRaw){try{const raw=localStorage.getItem(OPS_MODULES[b.dataset.opsRaw].key);opsDownload(raw??'No stored value.','travel-ops-'+b.dataset.opsRaw+'-stored-copy.txt');}catch{toast('Stored copy could not be read');}}
  if(b.dataset.opsReset&&confirm('Reset only '+OPS_MODULES[b.dataset.opsReset].title+'? Its notes, tasks and records will be replaced with the default checklist. Other modules and your trip data are unaffected.')){const next=opsDefault(b.dataset.opsReset);next.updatedAt=new Date().toISOString();persistOpsModule(b.dataset.opsReset,next,true);}
});
document.addEventListener('change',e=>{if(!renderLegacyOps||!e.target.dataset.opsModuleTask)return;const [id,t]=e.target.dataset.opsModuleTask.split(':'),checked=e.target.checked;changeOpsModule(id,m=>{m.checklist.find(x=>x.id===t).done=checked;});document.querySelector(`[data-ops-module-task="${id}:${t}"]`)?.focus();});
window.addEventListener('storage',e=>{if(!renderLegacyOps)return;const id=Object.keys(OPS_MODULES).find(id=>OPS_MODULES[id].key===e.key);if(id){loadOpsModule(id);renderOpsExpansion();}});
if(renderLegacyOps){window.addEventListener('online',renderOpsExpansion);window.addEventListener('offline',renderOpsExpansion);}
function travelOpsExport(){const modules={};Object.keys(OPS_MODULES).forEach(id=>{loadOpsModule(id);if(opsLocked[id]){renderOpsExpansion();throw Error('Cannot export '+OPS_MODULES[id].title+': recover the unreadable stored module first.');}modules[id]=copy(opsState[id]);});return {version:1,modules};}
function importTripWithOps(backup) {
  const incoming=backup.travelOpsExpansion;
  if(incoming!==undefined){const errors=validateTravelOpsBackup(incoming);if(errors.length)throw Error(errors.join('\n'));}
  const trip=migrateBackup(backup);trip.updatedAt=new Date().toISOString();
  const writes=incoming===undefined?[]:Object.entries(incoming.modules).map(([id,value])=>[OPS_MODULES[id].key,JSON.stringify(value)]);
  writes.push([KEY,JSON.stringify(trip)]);
  const previous=new Map(writes.map(([key])=>[key,localStorage.getItem(key)])),written=[];
  try {for(const [key,value] of writes){localStorage.setItem(key,value);written.push(key);}}
  catch(e){let rollbackFailed=false;for(const key of written.reverse()){try{const value=previous.get(key);if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}catch{rollbackFailed=true;}}
    throw Error(rollbackFailed?'Import failed and some storage could not be restored. Keep your exported backup.':'Import failed; previous stored data was restored. '+e.message);}
  data=trip;Object.keys(OPS_MODULES).forEach(loadOpsModule);render();updateLocalStatus();toast('Backup imported');
}
if(renderLegacyOps)operationsView();
