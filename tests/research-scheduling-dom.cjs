const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),script=fs.readFileSync(path.join(root,'app.js'),'utf8');
function create(state){let dom=new JSDOM(html,{url:'http://localhost',runScripts:'outside-only',pretendToBeVisual:true});dom.window.scrollTo=()=>{};dom.window.confirm=()=>true;if(state)dom.window.localStorage.setItem('marcyJapan2028PlannerV1',JSON.stringify(state));dom.window.eval(script);return dom}
let dom=create(),w=dom.window,d=w.document;
const read=()=>JSON.parse(w.localStorage.getItem('marcyJapan2028PlannerV1'));
w.save('fixture',false);let fixture=read();fixture.research=[
{id:'verified',title:'Kyoto museum',city:'Kyoto',neighborhood:'Gion',category:'Culture',tags:['rain'],notes:'Use the west entrance.',url:'https://example.com/museum',verified:true,type:'Official site'},
{id:'unverified',title:'Rumor',city:'Osaka',verified:false,url:'https://example.com/rumor'},
{id:'map',title:'Station map',city:'Tokyo',verified:true,type:'Map',url:'https://example.com/map'},
{id:'multi',title:'Regional idea',city:'Tokyo, Kyoto',verified:true,url:'javascript:alert(1)'}];
dom.window.close();dom=create(fixture);w=dom.window;d=w.document;
assert.equal(d.querySelector('[data-schedule-research="unverified"]').disabled,true);
w.scheduleResearch('unverified');assert.equal(d.querySelector('#itineraryModal').hidden,true);
d.querySelector('[data-schedule-research="verified"]').click();
assert.equal(d.querySelector('#planTitle').value,'Kyoto museum');assert.equal(d.querySelector('#planCity').value,'Kyoto');assert.match(d.querySelector('#planNeighborhood').value,/Gion/);
assert.match(d.querySelector('#planNotes').value,/west entrance/);assert.match(d.querySelector('#planNotes').value,/Culture/);assert.match(d.querySelector('#planNotes').value,/rain/);
assert.equal(d.querySelector('#planSourceUrl').value,'https://example.com/museum');assert.equal(d.querySelector('#planAddress').value,'');assert.equal(d.querySelector('#planCost').value,'');
d.querySelector('#planDate').value='2028-03-17';d.querySelector('#planDate').dispatchEvent(new w.Event('change'));assert.equal(d.querySelector('#planCity').value,'Kyoto');
d.querySelector('#itineraryForm').dispatchEvent(new w.Event('submit',{cancelable:true,bubbles:true}));
let record=read().itinerary[0];assert.equal(record.sourceResearchId,'verified');assert.equal(record.sourceUrl,'https://example.com/museum');assert.equal(read().research.length,4);assert.equal(read().research[0].status,'Inbox');
assert(d.querySelector('#itineraryDays a[href="https://example.com/museum"]'));
w.openItinerary(record.id);assert.equal(d.querySelector('#planSourceResearch').value,'verified');assert.equal(d.querySelector('#planSourceUrl').value,record.sourceUrl);
d.querySelector('#planTitle').value='Edited title';d.querySelector('#itineraryForm').dispatchEvent(new w.Event('submit',{cancelable:true,bubbles:true}));
assert.equal(read().itinerary[0].sourceResearchId,'verified');
const migrated=w.migrateBackup(JSON.parse(JSON.stringify(read())));assert.equal(migrated.itinerary[0].sourceUrl,record.sourceUrl);assert.equal(migrated.itinerary[0].sourceResearchId,'verified');
const saved=read();dom.window.close();dom=create(saved);w=dom.window;d=w.document;w.save('reload test',false);assert.equal(read().itinerary[0].sourceResearchId,'verified');assert.equal(read().itinerary[0].sourceUrl,record.sourceUrl);
w.scheduleResearch('map');assert.equal(d.querySelector('#planMapUrl').value,'https://example.com/map');
w.scheduleResearch('multi');assert.equal(d.querySelector('#planCity').value,'Other');assert.match(d.querySelector('#planNotes').value,/Tokyo, Kyoto/);assert.equal(d.querySelector('#planSourceUrl').value,'');assert.equal(d.querySelector('#planSourceInfo').hidden,true);
w.schedulePlace('p1');assert.equal(d.querySelector('#planSourcePlace').value,'p1');assert.equal(d.querySelector('#planSourceResearch').value,'');assert.equal(d.querySelector('#planSourceUrl').value,'');
assert.equal(w.validateBackup(read()).length,0);dom.window.close();
console.log('PASS: verification gate, direct Research scheduling, copied details, source links, retained source city, edit/backup persistence, multi-city handling and existing Place scheduling.');
