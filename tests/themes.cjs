const {chromium}=require('playwright');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{const pathname=req.url.split('?')[0],file=path.join(root,pathname==='/'?'index.html':pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return}try{res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(file))}catch{res.writeHead(404).end()}});
const luminance=rgb=>rgb.map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4).reduce((n,x,i)=>n+x*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{let x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox']}:{})});try{
const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));const url=`http://127.0.0.1:${server.address().port}`;await page.goto(url);
assert.equal(await page.locator('html').getAttribute('data-theme'),'p5r');
const tripBefore=await page.evaluate(()=>{save('Theme fixture',false);return localStorage.getItem('marcyJapan2028PlannerV1')});
for(const theme of ['p5r','p4revival','p3r']){
await page.locator('#themeSelect').selectOption(theme);assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
assert.equal(await page.evaluate(()=>localStorage.getItem('marcyJapan2028PlannerV1')),tripBefore);
await page.reload();assert.equal(await page.locator('#themeSelect').inputValue(),theme);
const samples=await page.evaluate(()=>['.nav.active','button.primary','.theme-picker select','.count','.red','.black','.yellow','.tag','.intro>span','.lodge .night','.pack-warning','.no','.ops-tabs button.active'].map(selector=>{let el=document.querySelector(selector);if(!el)return null;let style=getComputedStyle(el),bgEl=el,bg=getComputedStyle(bgEl).backgroundColor;while((bg==='rgba(0, 0, 0, 0)'||bg==='transparent')&&bgEl.parentElement){bgEl=bgEl.parentElement;bg=getComputedStyle(bgEl).backgroundColor}return {selector,fg:style.color.match(/[\d.]+/g).slice(0,3).map(Number),bg:bg.match(/[\d.]+/g).slice(0,3).map(Number)}}).filter(Boolean));
for(const sample of samples)assert(contrast(sample.fg,sample.bg)>=4.5,`${theme}: ${sample.selector} contrast ${contrast(sample.fg,sample.bg).toFixed(2)} < 4.5`);
await page.screenshot({path:path.join(root,`../theme-${theme}-desktop.png`),fullPage:false,animations:'disabled'});
await page.setViewportSize({width:390,height:844});assert.equal(await page.locator('#themeSelect').isVisible(),true);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await page.locator('[data-view="today"]').click();await page.screenshot({path:path.join(root,`../theme-${theme}-mobile.png`),fullPage:false,animations:'disabled'});
await page.locator('#todayAddPlan').click();assert.equal(await page.locator('#itineraryModal').isVisible(),true);await page.keyboard.press('Escape');await page.setViewportSize({width:1280,height:900});await page.locator('[data-view="dashboard"]').click();
}
// Theme survives resetting sample data and is separate from trip JSON exports.
page.on('dialog',d=>d.accept());await page.locator('#resetSamples').click();assert.equal(await page.locator('#themeSelect').inputValue(),'p3r');
const downloadPromise=page.waitForEvent('download');await page.locator('#exportBtn').click();const download=await downloadPromise;const backup=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(backup.version,13);assert(!Object.hasOwn(backup,'theme'));
await page.evaluate(()=>localStorage.setItem('marcyJapan2028PlannerTheme','invalid'));await page.reload();assert.equal(await page.locator('#themeSelect').inputValue(),'p5r');
// Saved preference is applied by the head script even before app.js executes.
await page.evaluate(()=>localStorage.setItem('marcyJapan2028PlannerTheme','p4revival'));await page.route('**/app.js*',r=>r.abort());await page.reload();assert.equal(await page.locator('html').getAttribute('data-theme'),'p4revival');await page.unroute('**/app.js*');
const blocked=await browser.newPage();await blocked.addInitScript(()=>{const get=Storage.prototype.getItem,set=Storage.prototype.setItem;Storage.prototype.getItem=function(k){if(k==='marcyJapan2028PlannerTheme')throw Error('Blocked');return get.call(this,k)};Storage.prototype.setItem=function(k,v){if(k==='marcyJapan2028PlannerTheme')throw Error('Blocked');return set.call(this,k,v)}});await blocked.goto(url);assert.equal(await blocked.locator('#themeSelect').inputValue(),'p5r');await blocked.locator('#themeSelect').selectOption('p3r');assert.equal(await blocked.locator('html').getAttribute('data-theme'),'p3r');assert.match(await blocked.locator('#toast').innerText(),/this visit/);await blocked.close();
assert.deepEqual(errors,[]);console.log('PASS: three palettes, sampled text contrast, desktop/phone controls, reload/reset persistence, unchanged trip data, JSON export, prepaint preference, invalid fallback and blocked theme storage.');
}finally{await browser.close();server.close()}})().catch(e=>{console.error(e);server.close();process.exitCode=1});
