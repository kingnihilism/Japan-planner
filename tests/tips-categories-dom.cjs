const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'http://localhost',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,d=w.document;w.confirm=()=>true;w.scrollTo=()=>{};w.eval(fs.readFileSync(path.join(root,'app.js'),'utf8'));
const read=()=>JSON.parse(w.localStorage.getItem('marcyJapan2028PlannerV1'));
const expected=['Transit','Money','Dining','Shopping','Hotels','Onsen','Temples & Shrines','Etiquette','Language','Connectivity','Airports','Reservations','Luggage','Packing','Weather','Solo Travel','Safety','Emergencies','Accessibility','Health','Customs','Other'];
w.openItem('tip');assert.deepEqual(Array.from(d.querySelector('#fCategory').options,x=>x.value),expected);
for(const category of expected){w.openItem('tip');d.querySelector('#fName').value='Tip for '+category;d.querySelector('#fContent').value='Example note';d.querySelector('#fCategory').value=category;d.querySelector('#itemForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));let x=read().tips.find(x=>x.title==='Tip for '+category);assert(x);assert.equal(x.category,category);w.openItem('tip',x.id);assert.equal(d.querySelector('#fCategory').value,category)}
const backup=read();assert.equal(w.validateBackup(backup).length,0);assert.equal(w.migrateBackup(backup).tips.length,backup.tips.length);
let legacy=backup;legacy.tips.push({id:'legacy',title:'Legacy custom category',category:'My old category',content:'Keep this label'});w.localStorage.setItem('marcyJapan2028PlannerV1',JSON.stringify(legacy));dom.window.close();
const restored=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'http://localhost',runScripts:'outside-only',pretendToBeVisual:true});const rw=restored.window;rw.scrollTo=()=>{};rw.localStorage.setItem('marcyJapan2028PlannerV1',JSON.stringify(legacy));rw.eval(fs.readFileSync(path.join(root,'app.js'),'utf8'));rw.openItem('tip','legacy');assert.equal(rw.document.querySelector('#fCategory').value,'My old category');restored.window.close();
console.log('PASS: all 22 category options, create/edit persistence, backup migration and legacy custom category preservation.');
