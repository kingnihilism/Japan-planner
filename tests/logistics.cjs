// Optional browser regression checks. The planner itself still needs no build.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const server = http.createServer((req, res) => {
  const name = req.url.split('?')[0];
  const file = path.join(root, name === '/' ? 'index.html' : name);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  try { res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html'); res.end(fs.readFileSync(file)); }
  catch { res.writeHead(404).end(); }
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({headless:true});
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const url = `http://127.0.0.1:${server.address().port}`;
    await page.goto(url);
    await page.locator('[data-view="logistics"]').click();
    assert.equal(await page.locator('[data-show-address]').count(), 4);
    assert.equal(await page.locator('.transition-card').count(), 4);
    await page.locator('[data-transition-task="move1:0"]').check();
    await page.reload();
    await page.locator('[data-view="logistics"]').click();
    assert.equal(await page.locator('[data-transition-task="move1:0"]').isChecked(), true);
    await page.locator('[data-edit-logistics="transition:move1"]').click();
    await page.locator('[name="checkout"]').fill('10:00');
    await page.locator('[name="carry"]').fill('Five-night capsule and chargers');
    await page.locator('#logisticsForm button.primary').click();
    assert.match(await page.locator('.transition-card').first().innerText(), /10:00/);
    await page.locator('[data-edit-logistics="baggage:return"]').click();
    for (const [name,value] of Object.entries({allowedCount:'1',limitKg:'23',weight0:'24',weight1:'10',shoppingKg:'15'})) await page.locator(`[name="${name}"]`).fill(value);
    await page.locator('#logisticsForm button.primary').click();
    const baggage = await page.locator('.baggage-card').last().innerText();
    assert.match(baggage, /exceed your recorded allowance/);
    assert.match(baggage, /exceeds your recorded per-bag limit/);
    assert.match(baggage, /Shopping weight exceeds/);
    await page.locator('[data-edit-logistics="address:0"]').click();
    await page.locator('[name="addressJa"]').fill('東京都テスト住所 <img src=x onerror=alert(1)>');
    await page.locator('[name="sourceUrl"]').fill('https://example.com/address');
    await page.locator('#logisticsForm button.primary').click();
    await page.locator('[data-show-address="0"]').click();
    assert.match(await page.locator('#addressCardBody').innerText(), /<img src=x/);
    assert.equal(await page.locator('#addressCardBody img').count(), 0);
    await page.keyboard.press('Escape');
    const state = await page.evaluate(() => JSON.parse(localStorage.getItem('marcyJapan2028PlannerV1')));
    assert.equal(state.version, 13);
    // Check a true downloadable backup and restore through the UI.
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#exportBtn').click();
    const download = await downloadPromise;
    assert.match(download.suggestedFilename(), /v13/);
    const backup = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    assert.equal(backup.transitions[0].checkout, '10:00');
    assert.equal(backup.baggage.return.weights[0], 24);
    page.on('dialog', dialog => dialog.accept());
    await page.locator('[data-transition-task="move1:0"]').uncheck();
    await page.locator('#importInput').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup))});
    await page.waitForFunction(() => document.querySelector('[data-transition-task="move1:0"]').checked);
    await page.locator('#resetSamples').click();
    assert.equal(await page.locator('[data-transition-task="move1:0"]').isChecked(), true);
    // Legacy migration retains custom records, dining and savings.
    const legacy = {...state,version:12,savedAmount:4321};
    legacy.dining[0].notes = 'Custom dining note';
    legacy.research.push({id:'custom',title:'My saved research',city:'Tokyo'});
    delete legacy.hotelAddresses; delete legacy.transitions; delete legacy.baggage;
    await page.evaluate(value => localStorage.setItem('marcyJapan2028PlannerV1', JSON.stringify(value)), legacy);
    await page.reload();
    const migrated = await page.evaluate(() => ({version:data.version,saved:data.savedAmount,note:data.dining[0].notes,research:data.research.some(x=>x.id==='custom'),baggage:data.baggage}));
    assert.equal(migrated.version,13); assert.equal(migrated.saved,4321);
    assert.equal(migrated.note,'Custom dining note'); assert.equal(migrated.research,true);
    assert.equal(migrated.baggage.outbound.checkedCount,1); assert.equal(migrated.baggage.return.checkedCount,2);
    assert.equal(migrated.baggage.return.limitKg,null);
    const validation = await page.evaluate(() => ({errors:validateBackup({...data,baggage:[]}),future:validateBackup({...data,version:14}),safe:sanitizeBaggage({return:{limitKg:Infinity,weights:[-5,'bad'],checkedCount:99}})}));
    assert(validation.errors.length); assert(validation.future.length);
    assert.equal(validation.safe.return.limitKg,null); assert.equal(validation.safe.return.weights[0],null);
    await page.setViewportSize({width:390,height:844});
    await page.locator('[data-view="logistics"]').click();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true);
    await page.locator('[data-show-address="3"]').click();
    assert.equal(await page.locator('#addressCardModal').isVisible(),true);
    await page.screenshot({path:path.join(root,'../v13-mobile.png'),fullPage:true});
    assert.deepEqual(errors,[]);
    console.log('PASS: saved checklists, transfer editing, baggage warnings, safe address rendering, JSON backup/restore, sample reset, V12 migration, validation, mobile layout; no page errors.');
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); server.close(); process.exitCode = 1; });
