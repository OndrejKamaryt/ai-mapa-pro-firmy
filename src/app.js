/* ---------- AI mapa: logika ---------- */
(function(){
'use strict';
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf = (n, d) => Number(n).toLocaleString('cs-CZ', { maximumFractionDigits: d || 0 });
const kc = n => nf(n) + ' Kč';
const SUB_RATE = 478.19, SUB_HOURS = 60, SUB_ONE = Math.round(SUB_RATE * SUB_HOURS);

const S = { obor:null, odd:'vse', lvl:'vse', seen:[], custom:false, lead:null, done:false, fname:'' };

const byId = id => UC.find(u => u.id === id);
const hrs = u => nf(u[0], 1) + ' až ' + nf(u[1], 1) + ' h týdně';
const moznost = n => n === 1 ? 'možnost' : (n >= 2 && n <= 4 ? 'možnosti' : 'možností');
const LVL_ADJ = { s:['snadná', 'snadné', 'snadných'], m:['střední', 'střední', 'středních'] };
const lvlAdj = (n, l) => LVL_ADJ[l][n === 1 ? 0 : (n >= 2 && n <= 4 ? 1 : 2)];
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const ICON_OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const V_OBOR = { stavebnictvi:'ve stavebnictví', zdravotnictvi:'ve zdravotnictví', logistika:'v logistice', fin:'ve finančních službách',
                 pravo:'v advokátních kancelářích', vyroba:'ve výrobě a průmyslu', auto:'v automobilovém průmyslu', jine:'pro váš obor' };
const PRO_ODD = { obchod:'pro obchod', marketing:'pro marketing', hr:'pro HR a nábor', finance:'pro finance a účetnictví',
                  pece:'pro zákaznickou péči', provoz:'pro provoz a odbornou práci', vedeni:'pro vedení firmy' };
const ICON_CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const ICON_WARN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5v.01"/></svg>';

/* obtížnost jako tři sloupečky: snadné má vyplněný jeden, střední dva */
const BARS = { s:1, m:2 };
const bars = l => '<svg viewBox="0 0 18 16" aria-hidden="true">' + [[1, 10, 5], [7, 6, 9], [13, 2, 13]].map(([x, y, h], i) =>
  '<rect x="' + x + '" y="' + y + '" width="4" height="' + h + '" rx="1"' + (i < BARS[l] ? ' class="on"' : '') + '/>').join('') + '</svg>';
const lvlTag = (l, text) => {
  const a = 'Obtížnost: ' + LEVEL[l].toLowerCase();
  return text ? '<span class="lvl">' + bars(l) + a + '</span>' : '<span class="lvl" role="img" aria-label="' + a + '" title="' + a + '">' + bars(l) + '</span>';
};

/* ---------- filtry ---------- */
function renderChips(){
  $('#f-obor').innerHTML = OBORY.map(([k, l]) => '<button class="chip" type="button" data-obor="' + k + '" aria-pressed="' + (S.obor === k) + '">' + esc(l) + '</button>').join('');
  $('#f-odd').innerHTML = ODDELENI.map(([k, l]) => '<button class="chip" type="button" data-odd="' + k + '" aria-pressed="' + (S.odd === k) + '">' + esc(l) + '</button>').join('');
  $('#f-lvl').innerHTML = [['vse', 'Všechny']].concat(Object.entries(LEVEL)).map(([k, l]) =>
    '<button class="chip" type="button" data-lvl="' + k + '" aria-pressed="' + (S.lvl === k) + '">' + (BARS[k] ? '<span class="lvl">' + bars(k) + '</span>' : '') + esc(l) + '</button>').join('');
}
// od nejsnazších, v rámci obtížnosti napřed možnosti přímo pro obor
const rank = u => (u.l === 's' ? 0 : 2) + (u.i.length ? 0 : 1);
function visible(){
  return UC.filter(u => (S.odd === 'vse' || u.d === S.odd)
    && (S.lvl === 'vse' || u.l === S.lvl)
    && (!S.obor || (S.obor === 'jine' ? !u.i.length : (!u.i.length || u.i.includes(S.obor)))))
    .sort((a, b) => rank(a) - rank(b));
}

/* ---------- karty ---------- */
function card(u){
  return '<article class="uc" data-id="' + u.id + '">' +
    '<div class="uc-top"><span class="dept">' + esc(ODD_LABEL[u.d]) + '</span>' + (u.i.length ? '<span class="ind">' + esc(OBOR_PRO[u.i[0]]) + '</span>' : '') + '</div>' +
    '<h3>' + esc(u.t) + '</h3><p class="w">' + esc(u.w) + '</p>' +
    '<div class="meta"><span>' + ICON_CLOCK + 'Ušetří ' + hrs(u.u) + '</span>' + lvlTag(u.l) + '</div>' +
    '<div class="uc-actions"><button class="btn btn-ghost btn-sm" type="button" data-open="' + u.id + '">Zobrazit postup</button></div></article>';
}
function renderGrid(){
  const list = visible();
  const n = list.length;
  const what = n + ' ' + (S.lvl !== 'vse' ? lvlAdj(n, S.lvl) + ' ' : '') + moznost(n);
  let title;
  if (!S.obor && S.odd === 'vse') title = what + ' pro všechny obory';
  else title = what + (S.odd !== 'vse' ? ' ' + PRO_ODD[S.odd] : '') + (S.obor ? ' ' + V_OBOR[S.obor] : '');
  $('#res-title').textContent = title;
  $('#res-sub').textContent = S.obor || S.odd !== 'vse' ? 'Seřazené od nejsnazších. U každé najdete postup a pokyn pro AI.' : 'Vyberte obor a oddělení, ať vidíte jen to, co se vás týká.';
  $('#grid').innerHTML = n ? list.map(card).join('') : '<p class="empty">Tady nic není. Zkuste jiné oddělení nebo obtížnost.</p>';
}

/* ---------- co odchází s formulářem ---------- */
function payload(){
  return { zdroj: 'AI mapa pro firmy', obor: S.obor ? OBOR_LABEL[S.obor] : null, oddeleni: S.odd !== 'vse' ? ODD_LABEL[S.odd] : null,
           prohlednute: S.seen.map(byId).filter(Boolean).map(u => ({ id: u.id, nazev: u.t, oddeleni: ODD_LABEL[u.d] })),
           navrh_na_miru: S.custom };
}
function syncLead(){ $('#l-zajem').value = JSON.stringify(payload()); renderSales(); }

/* ---------- detail možnosti ---------- */
let lastFocus = null, openId = null;
function openDetail(id, opener){
  const u = byId(id); if (!u) return;
  openId = id; lastFocus = opener || document.activeElement;
  if (!S.seen.includes(id)){ S.seen.push(id); syncLead(); }
  $('#sheet').innerHTML =
    '<button class="x" type="button" data-close aria-label="Zavřít"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
    '<div class="uc-top"><span class="dept">' + esc(ODD_LABEL[u.d]) + '</span>' + (u.i.length ? '<span class="ind">' + esc(OBOR_PRO[u.i[0]]) + '</span>' : '') + '</div>' +
    '<h2 id="d-title">' + esc(u.t) + '</h2><p class="w">' + esc(u.w) + '</p>' +
    '<div class="meta"><span>' + ICON_CLOCK + 'Ušetří ' + hrs(u.u) + '</span>' + lvlTag(u.l, true) + '</div>' +
    '<p class="tool">Nástroj: ' + esc(NASTROJ[u.n]) + '</p>' +
    '<div class="sec"><h4>Jak na to</h4><ol class="steps">' + u.s.map(x => '<li><span>' + esc(x) + '</span></li>').join('') + '</ol></div>' +
    '<div class="sec"><h4>Pokyn pro AI</h4><div class="prompt" id="d-prompt">' + esc(u.p) + '</div>' +
    '<div class="prompt-actions"><button class="btn btn-dark btn-sm" type="button" data-copy>Kopírovat pokyn</button><span class="copied" id="d-copied" aria-live="polite"></span></div>' +
    '<p class="soft" style="margin-top:8px">Text v hranatých závorkách nahraďte svými údaji.</p></div>' +
    '<div class="sec note">' + ICON_WARN + '<span><b>Na co si dát pozor:</b> ' + esc(u.x) + '</span></div>' +
    '<div class="sheet-actions"><p>Chcete, aby tohle a další postupy zvládal celý tým? Naučíme ho to v kurzu AI Akcelerátor.</p>' +
    '<button class="btn btn-primary" type="button" data-kurz>Stáhnout ukázku kurzu</button></div>';
  $('#ov').hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('#sheet [data-close]').focus(), 30);
}
function closeDetail(){
  $('#ov').hidden = true; openId = null;
  document.body.style.overflow = '';
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll:true });
}
async function copyPrompt(){
  const u = byId(openId); if (!u) return;
  const msg = $('#d-copied');
  try { await navigator.clipboard.writeText(u.p); msg.textContent = 'Zkopírováno'; }
  catch (e) {
    const r = document.createRange(); r.selectNodeContents($('#d-prompt'));
    const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
    let ok = false; try { ok = document.execCommand('copy'); } catch (e2) {}
    msg.textContent = ok ? 'Zkopírováno' : 'Text je označený, zkopírujte ho zkratkou Ctrl+C';
  }
}
function goKurz(){
  if (!$('#ov').hidden){ lastFocus = null; closeDetail(); }
  const target = S.done ? $('#lead-ok') : $('#form-box');
  target.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block:'start' });
  if (!S.done) setTimeout(() => $('#l-email').focus({ preventScroll:true }), 450);
}

/* ---------- kurz a formulář ---------- */
function renderKurz(){
  $('#mods').innerHTML = KURZ.moduly.map(mo => '<li><b>' + esc(mo.t) + '</b><span>' + mo.h + ' hodiny. ' + esc(mo.praxe) + '</span></li>').join('');
  $('#sub-one').textContent = kc(SUB_ONE);
}
const FREE = ['gmail.com', 'seznam.cz', 'email.cz', 'centrum.cz', 'post.cz', 'volny.cz', 'atlas.cz', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'tiscali.cz', 'azet.sk'];
const MSG = {
  declined: 'Stažení jste zrušili. Ukázka zůstává připravená, stačí kliknout znovu.',
  busy: 'Okno se stažením už je otevřené. Potvrďte ho, nebo to za chvíli zkuste znovu.',
  blocked: 'V tomto zobrazení se PDF stáhnout nedá. Otevřete stránku v Claudu v prohlížeči nebo v aplikaci a zkuste to znovu.',
  error: 'PDF se nepodařilo vytvořit. Zkuste to prosím znovu.'
};
function showErr(msg){ const e = $('#l-err'); e.textContent = msg; e.hidden = !msg; }
async function submitLead(e){
  e.preventDefault();
  const name = $('#l-name').value.trim(), email = $('#l-email').value.trim(), firm = $('#l-firm').value.trim(), phone = $('#l-phone').value.trim();
  let msg = '', bad = null;
  if (!email){ msg = 'Napište prosím svůj e-mail.'; bad = '#l-email'; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){ msg = 'E-mail nevypadá správně, zkontrolujte ho prosím.'; bad = '#l-email'; }
  else if (phone && phone.replace(/\D/g, '').length < 9){ msg = 'Telefon nevypadá správně. Opravte ho, nebo pole nechte prázdné.'; bad = '#l-phone'; }
  else if (!$('#l-consent').checked){ msg = 'Bez souhlasu se zpracováním údajů vám nemůžeme poslat nabídku ani se ozvat.'; bad = '#l-consent'; }
  showErr(msg);
  if (msg){ if (bad) $(bad).focus(); return; }
  S.lead = { name, email, firm, phone, free: FREE.includes(email.split('@')[1].toLowerCase()) };
  S.custom = $('#l-custom').checked;
  syncLead();
  const btn = $('#l-submit'); btn.disabled = true; btn.textContent = 'Připravuji PDF…';
  let res = 'error';
  try { res = await savePdf(); } catch (e2) { res = 'error'; }
  btn.disabled = false; btn.textContent = 'Stáhnout ukázku kurzu';
  if (res === 'saved' || res === 'fallback'){
    S.done = true; renderDone(); renderSales();
    const tt = $('#lead-ok .done-t'); if (tt) tt.focus({ preventScroll:true });
    return;
  }
  showErr(MSG[res] || MSG.error);
  renderSales();
}
function alertDone(r){ const box = $('#lead-ok'); let p = $('#again-msg'); if (!p){ p = document.createElement('p'); p.id = 'again-msg'; p.className = 'err'; box.insertBefore(p, box.children[2] || null); } p.textContent = MSG[r] || MSG.error; }
function renderDone(){
  $('#lead').hidden = true;
  const box = $('#lead-ok'); box.hidden = false;
  const custom = S.custom
    ? '<div class="next"><span class="badge">Další krok</span><h4>Návrh na míru připravíme</h4>' +
      '<p>Podle vašeho oboru a práce vašich lidí připravíme, jak by kurz mohl vypadat u vás, a ozveme se na ' + esc(S.lead.email) + '.</p>' +
      '<p class="noted">' + ICON_OK + 'Zájem o návrh na míru máme poznamenaný.</p></div>'
    : '<div class="next"><span class="badge">Další krok</span><h4>Chcete vidět kurz na míru pro vaši firmu?</h4>' +
      '<p>Podle vašeho oboru a práce vašich lidí připravíme, jak by AI Akcelerátor mohl vypadat právě u vás.</p>' +
      '<button class="btn btn-primary" type="button" data-custom-yes>Chci návrh na míru</button></div>';
  box.innerHTML = '<p class="done-t" tabindex="-1">' + ICON_OK + 'Ukázka kurzu je stažená</p>' +
    '<p class="soft">Nestáhla se? <button class="linkish" type="button" data-again>Stáhnout znovu</button></p>' + custom +
    '<p class="soft">Chcete to probrat hned? <a href="https://business.lifescale.cz/cz" target="_blank" rel="noopener">Rezervujte si nezávaznou konzultaci</a>.</p>' +
    (S.lead && S.lead.free ? '<p class="soft">Tip: s firemním e-mailem vám umíme poslat i nabídku přímo pro vaši firmu.</p>' : '');
}

/* ---------- PDF ---------- */
async function savePdf(){
  if (!window.jspdf) throw new Error('jspdf');
  const blob = buildPdf();
  const fname = S.fname = 'AI-Akcelerator-ukazka-kurzu.pdf';
  // v prohlížeči Clauda jde stažení jen přes schopnost downloads, odkaz s atributem download tam nefunguje
  if (window.claude && typeof window.claude.use === 'function'){
    let dl = null;
    try { dl = await window.claude.use('downloads'); } catch (e) { dl = null; }
    if (!dl) return 'blocked';
    try { await dl.save({ filename:fname, data:blob }); return 'saved'; }
    catch (e) {
      const c = e && e.code;
      if (c === 'declined') return 'declined';
      if (c === 'rate_limited') return 'busy';
      if (c === 'bad_request' || c === 'transform_error' || c === 'too_large') return 'error';
      return 'blocked';
    }
  }
  // běžný web, tedy ostrá verze: klasické stažení
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = fname; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return 'fallback';
}
function buildPdf(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit:'mm', format:'a4' });
  doc.addFileToVFS('Figtree-R.ttf', FONT_R); doc.addFont('Figtree-R.ttf', 'Figtree', 'normal');
  doc.addFileToVFS('Figtree-B.ttf', FONT_B); doc.addFont('Figtree-B.ttf', 'Figtree', 'bold');
  const M = 18, PW = 210, PH = 297, W = PW - 2 * M, BOTTOM = PH - 18;
  const INK = [32, 16, 11], MUTED = [92, 88, 85], BLUE = [0, 121, 181], NAVY = [11, 52, 96];
  let y = 0;
  const lh = size => size * 0.3528 * 1.38;
  const newPage = () => { doc.addPage(); y = M; };
  const ensure = h => { if (y + h > BOTTOM) newPage(); };
  function para(str, size, style, color, opts){
    opts = opts || {};
    const x = M + (opts.indent || 0), w = W - (opts.indent || 0);
    doc.setFont('Figtree', style); doc.setFontSize(size); doc.setTextColor.apply(doc, color);
    const lines = doc.splitTextToSize(String(str), w);
    const h = lines.length * lh(size);
    if (opts.keep) ensure(h);
    lines.forEach(line => { ensure(lh(size)); doc.text(line, x, y, { baseline:'top' }); y += lh(size); });
    y += opts.gap === undefined ? 1.5 : opts.gap;
  }
  const today = new Date().toLocaleDateString('cs-CZ', { day:'numeric', month:'long', year:'numeric' });
  // hlavička
  doc.setFillColor.apply(doc, NAVY); doc.rect(0, 0, PW, 54, 'F');
  doc.setFillColor(0, 180, 241); doc.rect(0, 54, PW, 1.6, 'F');
  doc.setTextColor(127, 214, 247); doc.setFont('Figtree', 'bold'); doc.setFontSize(9.5);
  doc.text('UKÁZKA KURZU  |  LIFESCALE BUSINESS', M, 13, { baseline:'top' });
  doc.setTextColor(255, 255, 255);
  const title = KURZ.nazev;
  let ts = 22; doc.setFontSize(ts);
  let tl = doc.splitTextToSize(title, W);
  if (tl.length > 1){ ts = 17; doc.setFontSize(ts); tl = doc.splitTextToSize(title, W).slice(0, 2); }
  let ty = 19;
  tl.forEach(line => { doc.text(line, M, ty, { baseline:'top' }); ty += lh(ts) * 0.92; });
  doc.setFont('Figtree', 'normal'); doc.setFontSize(10.5); doc.setTextColor(207, 227, 245);
  let sy = ty + 1.5;
  doc.splitTextToSize(KURZ.podtitul + '. Ukázka standardní verze, každé firmě kurz upravujeme na míru.', W).forEach(line => { doc.text(line, M, sy, { baseline:'top' }); sy += lh(10.5) * 0.95; });
  doc.setFontSize(9.5); doc.setTextColor(150, 190, 225);
  doc.text(doc.splitTextToSize('Staženo z AI mapy ' + today + (S.lead.firm ? ' pro firmu ' + S.lead.firm.replace(/\.+$/, '') : '') + '.', W)[0], M, sy + 1, { baseline:'top' });
  y = 66;
  const bullet = (txt) => { ensure(lh(10.5) + 1); doc.setFont('Figtree', 'normal'); doc.setFontSize(10.5); doc.setTextColor.apply(doc, INK); doc.text('•', M + 3, y, { baseline:'top' }); para(txt, 10.5, 'normal', INK, { indent:7, gap:0.8 }); };
  // o kurzu
  para('O kurzu', 14, 'bold', INK, { gap:2 });
  para(KURZ.oKurzu + ' Tady je jeho standardní podoba, každé firmě ho upravujeme na míru.', 11, 'normal', INK, { gap:3 });
  para('Každých 160 hodin, které tým díky AI ušetří za měsíc, je jako jeden člověk navíc. Nemusíte ho hledat ani zaučovat.', 11, 'bold', BLUE, { gap:5 });
  // program
  para('Program kurzu', 14, 'bold', INK, { gap:2.5, keep:true });
  KURZ.moduly.forEach((mo, i) => {
    ensure(34);
    para('Modul ' + (i + 1) + ': ' + mo.t + ' (' + mo.h + ' hodiny)', 11.5, 'bold', INK, { gap:1 });
    mo.body.forEach(x => bullet(x));
    para('V praxi: ' + mo.praxe, 10, 'normal', BLUE, { gap:3.5, indent:7 });
  });
  y += 1;
  para('Co si lidé odnesou', 12, 'bold', INK, { gap:1.2, keep:true });
  KURZ.odnesou.forEach(o => bullet(o[0] + ': ' + o[1] + '.'));
  y += 3;
  para('Rozsah a forma', 12, 'bold', INK, { gap:1, keep:true });
  para(KURZ.forma, 10.5, 'normal', INK, { gap:5 });
  // na míru
  ensure(34);
  para('Jak kurz upravujeme na míru', 14, 'bold', INK, { gap:2 });
  KURZ.naMiru.forEach(x => bullet(x));
  y += 2.5;
  ensure(30);
  para('Jak to vypadalo u jiných firem', 11, 'bold', INK, { gap:1.2 });
  KURZ.priklady.forEach(p => bullet(p[0] + ': ' + p[1]));
  y += 5;
  // dotace
  ensure(36);
  para('Dotace na kurz', 14, 'bold', INK, { gap:2 });
  para('Podporu z výzvy Vzdělávání pro firmy dostanete na účastníka, který absolvuje aspoň 50 hodin. Standardní AI Akcelerátor má 12 hodin, pro dotaci ho proto doplníme o další témata, třeba digitální produktivitu nebo kybernetickou bezpečnost, na ' + SUB_HOURS + ' hodin. Výzva hradí ' + nf(SUB_RATE, 2) + ' Kč na osobohodinu, tedy až ' + kc(SUB_ONE) + ' na účastníka. U OSVČ a dodavatelů je podpora poloviční a proplácí se zpětně. S žádostí vám pomůžeme a dotační servis je v ceně kurzu.', 10.5, 'normal', INK, { gap:3 });
  doc.setFont('Figtree', 'normal'); doc.setFontSize(10); doc.setTextColor.apply(doc, BLUE);
  ensure(6); doc.textWithLink('Víc o dotacích na vzdělávání: business.lifescale.cz/cz/pages/sluzby/dotace-z-eu-na-vzdelavani', M, y, { url:'https://business.lifescale.cz/cz/pages/sluzby/dotace-z-eu-na-vzdelavani', baseline:'top' }); y += lh(10) + 3;
  para('AI Act od února 2025 ukládá firmám, které AI používají, zajistit lidem, kteří s ní pracují, dostatečnou gramotnost v AI. Kurz s prezenční listinou to pomůže doložit.', 9.5, 'normal', MUTED, { gap:6 });
  // další krok
  const nextHead = S.custom ? 'Návrh na míru pro vaši firmu připravíme' : 'Chcete vidět, jak by kurz vypadal u vás?';
  const nextBody = S.custom
    ? 'Podle vašeho oboru a práce vašich lidí připravíme, jak by kurz mohl vypadat u vás, a ozveme se.'
    : 'Napište nám. Podle vašeho oboru a práce vašich lidí připravíme návrh kurzu na míru pro vaši firmu.';
  doc.setFont('Figtree', 'normal'); doc.setFontSize(10.5);
  const nextTxt = doc.splitTextToSize(nextBody, W - 12);
  const boxH = 12 + nextTxt.length * lh(10.5) + 12;
  ensure(boxH + 4);
  doc.setFillColor(227, 246, 254); doc.roundedRect(M, y, W, boxH, 3, 3, 'F');
  doc.setTextColor.apply(doc, INK); doc.setFont('Figtree', 'bold'); doc.setFontSize(12);
  doc.text(nextHead, M + 6, y + 5, { baseline:'top' });
  doc.setFont('Figtree', 'normal'); doc.setFontSize(10.5);
  nextTxt.forEach((line, i) => doc.text(line, M + 6, y + 11 + i * lh(10.5), { baseline:'top' }));
  const cy = y + 11 + nextTxt.length * lh(10.5) + 1.5;
  doc.setFontSize(10); doc.text('Ondřej Kamarýt, poradce růstu firem, ondrej.kamaryt@lifescale.cz, +420 606 786 231', M + 6, cy, { baseline:'top' });
  doc.setTextColor.apply(doc, BLUE); doc.text('business.lifescale.cz', M + 6, cy + 5, { baseline:'top' });
  y += boxH + 6;
  // patička na každé straně
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++){
    doc.setPage(i);
    doc.setFont('Figtree', 'normal'); doc.setFontSize(8.5); doc.setTextColor(140, 140, 140);
    doc.text('LifeScale Business, ukázka kurzu AI Akcelerátor', M, PH - 10);
    doc.text(i + ' / ' + pages, PW - M, PH - 10, { align:'right' });
  }
  return doc.output('blob');
}

/* ---------- pohled obchodníka ---------- */
function renderSales(){
  const L = S.lead;
  const seen = S.seen.map(byId).filter(Boolean);
  const rows = [
    ['Zdroj', 'AI mapa pro firmy'],
    ['Stáhl', S.done ? 'ukázku kurzu AI Akcelerátor' : 'zatím nic'],
    ['Kontakt', L ? esc([L.name, L.email, L.phone, L.firm].filter(Boolean).join(', ')) + (L.free ? ' <i>(soukromý e-mail)</i>' : '') + (L.phone ? '' : ' <i>(bez telefonu)</i>') : 'zatím nevyplněno'],
    ['Návrh kurzu na míru', S.custom ? '<b>chce, připravit podle oboru a prohlédnutých možností</b>' : 'zatím ne'],
    ['Velikost firmy', L && !L.firm ? 'firmu nevyplnil, dohledat v BizMachine podle domény e-mailu' : 'dohledat v BizMachine podle názvu firmy'],
    ['Obor', S.obor ? esc(OBOR_LABEL[S.obor]) : 'nevybral'],
    ['Oddělení', S.odd !== 'vse' ? esc(ODD_LABEL[S.odd]) : 'nevybral'],
    ['Prohlédl si', seen.length ? esc(seen.map(u => u.t + ' (' + ODD_LABEL[u.d] + ')').join('; ')) : 'zatím nic'],
    ['Skryté pole formuláře', '<code>' + esc(JSON.stringify(payload())) + '</code>']
  ];
  $('#sales').innerHTML = rows.map(r => '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>').join('');
}

/* ---------- ukázka v úvodu ---------- */
function renderHeroVis(){
  const u = byId('o1'), el = $('#hero-vis');
  if (!u || !el) return;
  el.innerHTML = '<div class="hv-card"><div class="uc-top"><span class="dept">' + esc(ODD_LABEL[u.d]) + '</span></div>' +
    '<h3>' + esc(u.t) + '</h3>' +
    '<div class="meta"><span>' + ICON_CLOCK + 'Ušetří ' + hrs(u.u) + '</span>' + lvlTag(u.l, true) + '</div>' +
    '<p class="hv-label">Pokyn pro AI</p><div class="hv-prompt"><span>' + esc(u.p.replace(/\n/g, ' ')) + '</span></div>' +
    '<div class="hv-row"><span class="hv-chip">Kopírovat pokyn</span><span class="hv-ok">' + ICON_OK + 'Zkopírováno</span></div></div>';
}

/* ---------- události ---------- */
document.addEventListener('click', e => {
  const ob = e.target.closest('[data-obor]');
  if (ob){ S.obor = S.obor === ob.dataset.obor ? null : ob.dataset.obor; renderChips(); renderGrid(); syncLead(); return; }
  const od = e.target.closest('[data-odd]');
  if (od){ S.odd = od.dataset.odd; renderChips(); renderGrid(); syncLead(); return; }
  const lv = e.target.closest('[data-lvl]');
  if (lv){ S.lvl = lv.dataset.lvl; renderChips(); renderGrid(); return; }
  const op = e.target.closest('[data-open]');
  if (op){ openDetail(op.dataset.open, op); return; }
  if (e.target.closest('[data-close]')){ closeDetail(); return; }
  if (e.target.closest('[data-copy]')){ copyPrompt(); return; }
  if (e.target.closest('[data-kurz]')){ goKurz(); return; }
  if (e.target.closest('[data-again]')){ savePdf().then(r => { if (r !== 'saved' && r !== 'fallback') alertDone(r); }).catch(() => alertDone('error')); return; }
  if (e.target.closest('[data-custom-yes]')){ S.custom = true; syncLead(); renderDone(); const n = $('#lead-ok .next .noted'); if (n){ n.setAttribute('tabindex', '-1'); n.focus({ preventScroll:true }); } return; }
  if (e.target.id === 'ov') closeDetail();
});
$('#lead').addEventListener('submit', submitLead);
$('#l-custom').addEventListener('change', e => { S.custom = e.target.checked; syncLead(); });
document.addEventListener('keydown', e => {
  const layer = !$('#ov').hidden ? $('#ov') : null;
  if (!layer) return;
  if (e.key === 'Escape'){ closeDetail(); return; }
  if (e.key === 'Tab'){
    const f = $$('button:not([disabled]), a[href], input, select, [tabindex="0"]', layer);
    if (!f.length) return;
    const i = f.indexOf(document.activeElement);
    e.preventDefault();
    f[(i + (e.shiftKey ? f.length - 1 : 1) + f.length) % f.length].focus();
  }
});
$('#hero-n').textContent = UC.length + ' konkrétních možností';
renderHeroVis(); renderKurz();
renderChips(); renderGrid(); syncLead();
})();
