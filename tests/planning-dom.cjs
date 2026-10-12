const {JSDOM}=require('jsdom');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const script=fs.readFileSync(path.join(root,'app.js'),'utf8');
function create(state){let dom=new JSDOM(html,{url:'http://localhost',runScripts:'outside-only',pretendToBeVisual:true});if(state)dom.window.localStorage.setItem('marcyJapan2028PlannerV1',JSON.stringify(state));dom.window.scrollTo=()=>{};dom.window.confirm=()=>true;dom.window.eval(script);return dom}
let dom=create(),w=dom.window,d=w.document;
const state=()=>JSON.parse(w.localStorage.getItem('marcyJapan2028PlannerV1'));
const submit=id=>d.querySelector('#'+id).dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
const fill=values=>{for(let [id,value] of Object.entries(values))d.querySelector('#'+id).value=value};
assert.equal(w.japanDate(new w.Date('2028-03-20T15:30:00Z')),'2028-03-21');
assert.equal(w.japanDate(new w.Date('2028-03-20T14:30:00Z')),'2028-03-20');
for(const [date,name] of [['2028-03-20','Asakusa'],['2028-03-21','Kadensho'],['2028-03-22','Shichijo'],['2028-03-25','Shichijo'],['2028-03-26','Namba'],['2028-03-30','Namba'],['2028-03-31','Departure day']]){d.querySelector('#todayDate').value=date;w.todayView();assert.match(d.querySelector('#todayHotel').textContent,new RegExp(name))}
assert.match(d.querySelector('#todayTransfer').textContent,/KIX/);
assert.match(d.querySelector('#todayMode').textContent,/preview/);
d.querySelector('#todayDate').value='2028-03-21';
w.schedulePlace('p1');
assert.equal(d.querySelector('#planDate').value,'2028-03-21');
assert.equal(d.querySelector('#planTitle').value,'Azabu-Juban Shopping District');
assert(d.querySelector('#planNotes').value.length>0);
fill({planFlexibility:'Fixed',planReservationTime:'10:30',planCost:'1500',planCurrency:'JPY',planConfirmation:'PRIMARY-ONLY'});
w.fillBackupFields({title:'Indoor museum',city:'Tokyo',notes:'Rain alternative',reason:'Rain / closure',cost:5,currency:'USD',mapUrl:'javascript:alert(1)'});
submit('itineraryForm');let itinerary=state().itinerary[0];
assert.equal(itinerary.sourcePlaceId,'p1');assert.equal(state().places.length,31);
assert.match(d.querySelector('#todayPlans').textContent,/PRIMARY-ONLY/);
d.querySelector(`[data-toggle-backup="${itinerary.id}"]`).click();
assert.equal(state().itinerary[0].title,'Azabu-Juban Shopping District');
assert.equal(state().itinerary[0].backupActive,true);
assert.equal(w.activePlan(state().itinerary[0]).title,'Indoor museum');
assert.equal(w.activePlan(state().itinerary[0]).confirmation,'');
assert.equal(d.querySelectorAll('#todayPlans a').length,0);
assert.match(d.querySelector('#itineraryTotal').textContent,/5/);
assert(!d.querySelector('#todayPlans').textContent.includes('PRIMARY-ONLY'));
d.querySelector(`[data-toggle-backup="${itinerary.id}"]`).click();
assert.equal(state().itinerary[0].backupActive,false);
assert.match(d.querySelector('#itineraryTotal').textContent,/10/);
// Booking links aggregate once, convert JPY, and respect actual/payment statuses.
w.save('fixture',false);let fixture=state();const expenseId=fixture.expenses[0].id;
fixture.expenses[0].actual=10;fixture.expenses[0].paid=false;
fixture.bookings=[];dom.window.close();dom=create(fixture);w=dom.window;d=w.document;
function booking(id,values){w.openBooking(id);fill(values);submit('bookingForm')}
booking('',{bookingTitle:'Hotel A',bookingType:'Hotel',bookingStatus:'Paid',bookingPrice:'9000',bookingCurrency:'JPY',bookingExpenseId:expenseId,bookingTravelDate:'2028-03-21'});
let first=state().bookings[0].id;
booking('',{bookingTitle:'Hotel B',bookingType:'Hotel',bookingStatus:'Reserved',bookingPrice:'20',bookingCurrency:'USD',bookingExpenseId:expenseId});
let second=state().bookings[1].id;
assert.equal(w.effectiveExpenses()[0].actual,80);assert.equal(w.effectiveExpenses()[0].paidValue,60);
assert.match(d.querySelector('#budgetPaid').textContent,/60/);
assert.match(d.querySelector('#bookingTotal').textContent,/80/);
w.openExpense(expenseId);assert.equal(d.querySelector('#expenseActual').disabled,true);
fill({expenseEstimated:'150'});submit('expenseForm');assert.equal(state().expenses[0].actual,10);
// Exchange-rate change recomputes all derived costs.
d.querySelector('#yenRate').value='100';d.querySelector('#yenRate').dispatchEvent(new w.Event('change'));
assert.equal(w.effectiveExpenses()[0].actual,110);assert.equal(w.effectiveExpenses()[0].paidValue,90);
booking(first,{bookingStatus:'Cancelled'});assert.equal(w.effectiveExpenses()[0].actual,20);assert.equal(w.effectiveExpenses()[0].paidValue,0);
booking(second,{bookingStatus:'Planned'});assert.equal(w.effectiveExpenses()[0].actual,0);
booking(first,{bookingExpenseId:''});booking(second,{bookingExpenseId:''});assert.equal(w.effectiveExpenses()[0].actual,10);
booking(first,{bookingExpenseId:expenseId,bookingStatus:'Paid'});
const backup=state();const migrated=w.migrateBackup(JSON.parse(JSON.stringify(backup)));
assert.equal(migrated.bookings[0].expenseId,expenseId);assert.equal(migrated.itinerary[0].backup.title,'Indoor museum');assert.equal(migrated.itinerary[0].sourcePlaceId,'p1');
dom.window.close();dom=create(backup);w=dom.window;d=w.document;assert.equal(w.effectiveExpenses()[0].actual,90);
d.querySelector(`[data-delete-expense="${expenseId}"]`).click();assert.equal(state().bookings[0].expenseId,'');
// One booking deletion removes only its contribution.
const another=state().expenses[0].id;booking(first,{bookingExpenseId:another});
d.querySelector(`[data-delete-booking="${first}"]`).click();assert(!state().bookings.some(x=>x.id===first));
assert.equal(w.validateBackup(state()).length,0);
dom.window.close();
console.log('PASS: Japan date boundaries, daily hotel/transfer preview, Place scheduling, primary/backup switching, active costs, booking links, JPY conversion, partial payments, cancellation, unlink/delete and V13 backup migration.');
