/* ---------- Složte si vlastní AI Akcelerátor: logika ---------- */
(function(){
'use strict';
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf = (n, d) => Number(n).toLocaleString('cs-CZ', { maximumFractionDigits: d || 0 });
// bez vybraného oboru a oddělení ukážeme jen šest snadných možností, každou z jiného oddělení; pořadí jde změnit tady
const START = ['p3', 'o1', 'h2', 'z3', 'f3', 'v1'];
const CALENDLY = 'https://calendly.com/d/ctjs-ppn-pxz/online-konzultace-lifescale';
const ACK_MS = 12000;   // jak dlouho čekáme, než web LifeScale potvrdí převzetí kontaktu

const S = { obor:null, odd:null, all:false, cart:[], lead:null, done:false, sending:false, sent:null };
// vložené na web LifeScale: hlavičku má stránka webu a kontakt odešle web stejnou cestou jako své formuláře
const EMBED = window.parent !== window;
const PARENTS = ['https://business.lifescale.cz'];
if (EMBED) document.documentElement.classList.add('embed');

const byId = id => UC.find(u => u.id === id);
const hrs = u => nf(u[0], 1) + ' až ' + nf(u[1], 1) + ' h týdně na člověka';
const moznost = n => n === 1 ? 'možnost' : (n >= 2 && n <= 4 ? 'možnosti' : 'možností');
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const ICON_OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const ICON_PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const ICON_MINUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>';
const ICON_CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const V_OBOR = { stavebnictvi:'ve stavebnictví', zdravotnictvi:'ve zdravotnictví', logistika:'v logistice', fin:'ve finančních službách',
                 pravo:'v advokátní kanceláři', vyroba:'ve výrobě a průmyslu', auto:'v automobilovém průmyslu', jine:'ve vašem oboru' };
const PRO_ODD = { obchod:'pro obchod', marketing:'pro marketing', hr:'pro HR a nábor', finance:'pro finance a účetnictví',
                  pece:'pro zákaznickou péči', provoz:'pro provoz a odbornou práci', vedeni:'pro vedení firmy' };

/* obtížnost jako tři sloupečky: snadné má vyplněný jeden, střední dva */
const BARS = { s:1, m:2 };
const bars = l => '<svg viewBox="0 0 18 16" aria-hidden="true">' + [[1, 10, 5], [7, 6, 9], [13, 2, 13]].map(([x, y, h], i) =>
  '<rect x="' + x + '" y="' + y + '" width="4" height="' + h + '" rx="1"' + (i < BARS[l] ? ' class="on"' : '') + '/>').join('') + '</svg>';
const lvlTag = l => { const a = 'Obtížnost: ' + LEVEL[l].toLowerCase(); return '<span class="lvl" role="img" aria-label="' + a + '" title="' + a + '">' + bars(l) + '<span class="lvl-t">' + LEVEL[l] + '</span></span>'; };

/* posun stránky vždy přes window.scrollTo: scrollIntoView by ve vloženém iframe posouval i stránku webu */
function scrollToEl(el){
  const off = EMBED ? 16 : 80;
  window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - off), behavior: reduced() ? 'auto' : 'smooth' });
}
let liveT = null;
function announce(msg){ clearTimeout(liveT); liveT = setTimeout(() => { $('#live').textContent = msg; }, 150); }

/* ---------- obor, oddělení a karty ---------- */
const chip = (pole, k, l, on) => '<button class="chip" type="button" data-' + pole + '="' + k + '" aria-pressed="' + on + '">' + esc(l) + '</button>';
function renderChips(){
  $('#f-obor').innerHTML = OBORY.map(([k, l]) => chip('obor', k, l, S.obor === k)).join('');
  $('#f-odd').innerHTML = ODDELENI.map(([k, l]) => chip('odd', k, l, S.odd === k)).join('');
}
/* filtr: na širší obrazovce je vlevo u karet a otevřený, na telefonu jsou to dvě rozbalovací menu */
const WIDE = matchMedia('(min-width:901px)');
function layoutFilters(){ $$('.fgroup').forEach(d => { d.open = WIDE.matches; }); }
function syncFilters(){
  $('#v-obor').textContent = S.obor ? OBOR_LABEL[S.obor] : 'Všechny';
  $('#v-odd').textContent = S.odd ? ODD_LABEL[S.odd] : 'Všechna';
}
// na telefonu se menu po výběru zavře, aby byly hned vidět karty
function filterPicked(btn){
  syncFilters();
  if (WIDE.matches) return;
  const d = btn.closest('details'); d.open = false; $('summary', d).focus({ preventScroll:true });
}
// od nejsnazších, v rámci obtížnosti napřed možnosti přímo pro obor; bez oboru napřed ty obecné
const rank = u => (u.l === 's' ? 0 : 2) + ((S.obor ? !u.i.length : u.i.length > 0) ? 1 : 0);
function visible(){
  const list = UC.filter(u => (!S.odd || u.d === S.odd) && (!S.obor || (S.obor === 'jine' ? !u.i.length : (!u.i.length || u.i.includes(S.obor)))))
    .sort((a, b) => rank(a) - rank(b));
  if (S.obor || S.odd) return list;
  // bez filtru jde napřed pevná šestice, zbytek až po rozbalení
  return START.map(byId).filter(Boolean).concat(list.filter(u => !START.includes(u.id)));
}
const inCart = id => S.cart.includes(id);
function pickBtn(u){
  const on = inCart(u.id);
  return (on ? ICON_MINUS : ICON_PLUS) + '<span>' + (on ? 'Odebrat z výběru' : 'Přidat do výběru') + '</span><span class="sr-only">: ' + esc(u.t) + '</span>';
}
function card(u){
  const on = inCart(u.id);
  return '<article class="uc' + (on ? ' in' : '') + '" data-id="' + u.id + '">' +
    '<div class="uc-top"><span class="dept">' + esc(ODD_LABEL[u.d]) + '</span>' + (u.i.length ? '<span class="ind">' + esc(OBOR_PRO[u.i[0]]) + '</span>' : '') +
    '<span class="picked" aria-hidden="true">' + ICON_OK + 'Ve výběru</span></div>' +
    '<h3>' + esc(u.t) + '</h3><p class="w">' + esc(u.w) + '</p>' +
    '<div class="meta"><span>' + ICON_CLOCK + 'Ušetří ' + hrs(u.u) + '</span>' + lvlTag(u.l) + '</div>' +
    '<div class="uc-actions"><button class="pick-btn' + (on ? ' on' : '') + '" type="button" data-pick="' + u.id + '">' + pickBtn(u) + '</button></div></article>';
}
function renderGrid(){
  const list = visible();
  const n = list.length;
  const cut = !S.obor && !S.odd && !S.all && n > START.length;
  $('#res-title').textContent = 'Z čeho si můžete kurz složit' + (S.odd ? ' ' + PRO_ODD[S.odd] : '') + (S.obor ? ' ' + V_OBOR[S.obor] : '');
  $('#grid').innerHTML = (cut ? list.slice(0, START.length) : list).map(card).join('');
  $('#more').hidden = !cut;
  $('#more [data-more]').textContent = 'Zobrazit všech ' + n + ' ' + moznost(n);
}
// karty se po přidání jen přepnou, nepřekreslují, aby fokus zůstal na tlačítku
function syncCards(){
  $$('#grid .uc').forEach(el => {
    const u = byId(el.dataset.id), on = inCart(u.id), b = $('[data-pick]', el);
    el.classList.toggle('in', on);
    if (b.classList.contains('on') !== on){ b.classList.toggle('on', on); b.innerHTML = pickBtn(u); }
  });
}

/* ---------- výběr ---------- */
const cartItems = () => S.cart.map(byId).filter(Boolean);
function vyberN(n){ return n + ' ' + moznost(n); }
function renderBar(){
  const items = cartItems(), n = items.length;
  $('#bar-n').textContent = n ? 'Váš výběr: ' + vyberN(n) : 'Zatím nic nevybráno';
}
function renderPick(){
  const items = cartItems();
  $('#pick').innerHTML = items.length
    ? '<h3 class="pick-h">Váš výběr (' + items.length + ')</h3><ul class="pick-list">' + items.map(u =>
        '<li data-id="' + u.id + '"><span>' + esc(u.t) + '</span>' +
        '<button class="x-btn" type="button" data-unpick="' + u.id + '" aria-label="Odebrat: ' + esc(u.t) + '" title="Odebrat"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></li>').join('') + '</ul>'
    : '<p class="pick-empty" id="pick-empty" tabindex="-1">Zatím nic nevybráno. Nevadí, vyberete to s konzultantem.</p>';
}
function toggle(id){
  const u = byId(id); if (!u || S.done) return;
  const on = !inCart(id);
  S.cart = on ? S.cart.concat(id) : S.cart.filter(x => x !== id);
  syncCards(); renderBar(); renderPick(); syncLead();
  const n = S.cart.length;
  announce((on ? 'Přidáno do výběru: ' : 'Odebráno z výběru: ') + u.t + '. ' + (n ? 'Ve výběru ' + (n === 1 ? 'je' : (n <= 4 ? 'jsou' : 'je')) + ' ' + vyberN(n) + '.' : 'Výběr je prázdný.'));
}
function unpick(id){
  const ids = S.cart.slice(), i = ids.indexOf(id);
  toggle(id);
  // fokus na další položku, jinak na předchozí, jinak na text prázdného výběru
  const next = ids[i + 1] || ids[i - 1];
  const target = next ? $('[data-unpick="' + next + '"]') : $('#pick-empty');
  if (target) target.focus({ preventScroll:true });
}

/* ---------- co odchází s formulářem ---------- */
// hotové textové shrnutí jde do pole Zajem jako první, aby se dalo v Make rovnou vložit do zprávy ve Slacku
function buildSummary(){
  const items = cartItems();
  const clean = s => String(s).replace(/[<>&]/g, ' ').replace(/\s+/g, ' ').trim();
  const radky = ['AI Akcelerátor na míru', 'Obor: ' + (S.obor ? OBOR_LABEL[S.obor] : 'nevybrán')];
  if (S.odd) radky.push('Oddělení: ' + ODD_LABEL[S.odd]);
  radky.push(items.length ? 'Výběr (' + items.length + '):\n' + items.map(u => '• ' + clean(u.t) + ' (' + ODD_LABEL[u.d] + ')').join('\n')
    : 'Výběr: nic nevybráno, zeptat se při hovoru');
  return radky.join('\n');
}
function payload(){
  const items = cartItems();
  return { shrnuti: buildSummary(), v: 2, zdroj: 'AI mapa: AI Akcelerátor na míru',
           obor: S.obor ? OBOR_LABEL[S.obor] : null, obor_id: S.obor,
           oddeleni: S.odd ? ODD_LABEL[S.odd] : null, oddeleni_id: S.odd, pocet: items.length,
           vyber: items.map(u => ({ id: u.id, nazev: u.t, oddeleni: ODD_LABEL[u.d] })) };
}
function syncLead(){ $('#l-zajem').value = JSON.stringify(payload()); renderSales(); }
let msgN = 0;
// web LifeScale odpoví zprávou ls-ai-mapa-lead-ack se stejným id, až kontakt převezme
function sendLead(){
  if (!EMBED) return Promise.resolve(null);
  const id = 'lead-' + (++msgN) + '-' + Date.now();
  const L = S.lead;
  const msg = { type:'ls-ai-mapa-lead', id, lead:{ name:L.name, email:L.email, phone:L.phone, firm:L.firm }, zajem:payload() };
  return new Promise(res => {
    const done = ok => { window.removeEventListener('message', on); clearTimeout(tm); if (!ok) console.error('[AI mapa] Kontakt se nepodařilo předat webu LifeScale.'); res(ok); };
    const on = e => { if (PARENTS.includes(e.origin) && e.data && e.data.type === 'ls-ai-mapa-lead-ack' && e.data.id === id) done(!!e.data.ok); };
    const tm = setTimeout(() => done(false), ACK_MS);
    window.addEventListener('message', on);
    PARENTS.forEach(o => { try { window.parent.postMessage(msg, o); } catch (e) {} });
  });
}

/* ---------- formulář ---------- */
const FREE = ['gmail.com', 'seznam.cz', 'email.cz', 'centrum.cz', 'post.cz', 'volny.cz', 'atlas.cz', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'tiscali.cz', 'azet.sk'];
function showErr(html, bad){
  const e = $('#l-err'); e.innerHTML = html || ''; e.hidden = !html;
  ['#l-email', '#l-phone', '#l-consent'].forEach(s => $(s).removeAttribute('aria-invalid'));
  if (bad){ $(bad).setAttribute('aria-invalid', 'true'); $(bad).focus(); }
}
function setSending(on){
  S.sending = on;
  const b = $('#l-submit'); b.disabled = on; b.textContent = on ? 'Odesílám…' : 'Chci konzultaci a návrh kurzu zdarma';
}
async function submitLead(e){
  e.preventDefault();
  if (S.sending || S.done) return;
  const name = $('#l-name').value.trim(), email = $('#l-email').value.trim(), firm = $('#l-firm').value.trim(), phone = $('#l-phone').value.trim();
  let msg = '', bad = null;
  if (!email){ msg = 'Vyplňte prosím e-mail, na který se vám konzultant ozve.'; bad = '#l-email'; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){ msg = 'Zkontrolujte prosím e-mail, něco v něm chybí.'; bad = '#l-email'; }
  else if (phone && phone.replace(/\D/g, '').length < 9){ msg = 'Telefon nevypadá správně. Opravte ho, nebo pole nechte prázdné.'; bad = '#l-phone'; }
  else if (!$('#l-consent').checked){ msg = 'Bez souhlasu se zpracováním údajů se vám konzultant nemůže ozvat.'; bad = '#l-consent'; }
  showErr(msg ? esc(msg) : '', bad);
  if (msg) return;
  S.lead = { name, email, firm, phone, free: FREE.includes(email.split('@')[1].toLowerCase()) };
  syncLead();
  setSending(true);
  const ok = await sendLead();
  setSending(false);
  S.sent = ok; renderSales();
  // potvrzení až ve chvíli, kdy web kontakt opravdu převzal; mimo web jde jen o náhled pro tým
  if (ok === false){
    showErr('Výběr se nepodařilo odeslat. Zkuste to prosím znovu, nebo si rovnou <a href="' + CALENDLY + '" target="_blank" rel="noopener">rezervujte konzultaci</a>.');
    $('#l-submit').focus();
    return;
  }
  S.done = true;
  renderDone(); renderSales(); syncBar();
}
function renderDone(){
  $('#send-form').hidden = true;
  document.querySelector('main').classList.add('is-sent');
  const items = cartItems(), L = S.lead;
  const kam = esc(L.email) + (L.phone ? ' nebo ' + esc(L.phone) : '');
  const box = $('#lead-ok'); box.hidden = false;
  box.innerHTML = '<h2 class="done-t" id="done-t" tabindex="-1">' + ICON_OK + 'Děkujeme, výběr máme</h2>' +
    '<p>Do 24 hodin se vám ozve konzultant na ' + kam + (items.length ? ' a probere s vámi návrh kurzu.' : ' a kurz složíte spolu.') + '</p>' +
    (items.length ? '<ul class="pick-list sent">' + items.map(u => '<li><span>' + esc(u.t) + '</span></li>').join('') + '</ul>' : '') +
    '<p class="soft">Chcete to probrat hned? <a href="' + CALENDLY + '" target="_blank" rel="noopener">Rezervujte si konzultaci</a>.</p>' +
    (EMBED ? '' : '<p class="soft preview">Náhled pro tým: stránka není vložená na web LifeScale, kontakt se nikam neodeslal.</p>');
  scrollToEl($('#send-box'));
  $('#done-t').focus({ preventScroll:true });
}

/* ---------- lišta s výběrem ---------- */
// lišta je vidět pořád, jen když je na obrazovce formulář nebo se do něj píše, uhne
let formInView = false, formFocus = false;
function syncBar(){
  const hide = S.done || formInView || formFocus;
  const bar = $('#bar');
  bar.classList.toggle('is-hidden', hide);
  bar.inert = hide;
}
function goForm(){
  scrollToEl($('#send-title'));
  $('#send-title').focus({ preventScroll:true });
}
if ('IntersectionObserver' in window){
  new IntersectionObserver(en => { formInView = en[0].isIntersecting; syncBar(); }, { rootMargin:'0px 0px -96px 0px' }).observe($('#odeslat'));
}
$('#lead').addEventListener('focusin', () => { formFocus = true; syncBar(); });
$('#lead').addEventListener('focusout', () => { setTimeout(() => { formFocus = $('#lead').contains(document.activeElement); syncBar(); }, 0); });

/* ---------- pohled konzultanta (jen mimo web) ---------- */
function renderSales(){
  if (EMBED) return;
  const L = S.lead;
  const rows = [
    ['Kontakt', L ? esc([L.name, L.email, L.phone, L.firm].filter(Boolean).join(', ')) + (L.free ? ' <i>(soukromý e-mail)</i>' : '') + (L.phone ? '' : ' <i>(bez telefonu)</i>') : 'zatím nevyplněno'],
    ['Velikost firmy', L && !L.firm ? 'firmu nevyplnil, dohledat v BizMachine podle domény e-mailu' : 'dohledat v BizMachine podle názvu firmy'],
    ['Shrnutí pro Slack', '<pre>' + esc(buildSummary()) + '</pre>'],
    ['Předáno webu LifeScale', !EMBED ? 'ne, stránka není vložená na web' : (S.sent === null ? 'zatím ne' : (S.sent ? 'ano' : '<b>nepodařilo se</b>'))],
    ['Pole Zajem', '<code>' + esc(JSON.stringify(payload())) + '</code>']
  ];
  $('#sales').innerHTML = rows.map(r => '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>').join('');
}

/* ---------- události ---------- */
document.addEventListener('click', e => {
  const ob = e.target.closest('[data-obor]');
  if (ob){
    S.obor = S.obor === ob.dataset.obor ? null : ob.dataset.obor;
    // čipy se jen přepnou, aby fokus zůstal na tom, na který se kliklo
    $$('#f-obor [data-obor]').forEach(c => c.setAttribute('aria-pressed', String(S.obor === c.dataset.obor)));
    renderGrid(); renderPick(); syncLead(); filterPicked(ob); return;
  }
  const od = e.target.closest('[data-odd]');
  if (od){
    S.odd = S.odd === od.dataset.odd ? null : od.dataset.odd;
    $$('#f-odd [data-odd]').forEach(c => c.setAttribute('aria-pressed', String(S.odd === c.dataset.odd)));
    renderGrid(); syncLead(); filterPicked(od); return;
  }
  if (e.target.closest('[data-more]')){
    S.all = true; renderGrid();
    const first = $$('#grid [data-pick]')[START.length]; if (first) first.focus({ preventScroll:true });
    return;
  }
  const pk = e.target.closest('[data-pick]');
  if (pk){ toggle(pk.dataset.pick); return; }
  const up = e.target.closest('[data-unpick]');
  if (up){ unpick(up.dataset.unpick); return; }
  if (e.target.closest('[data-go]')){ goForm(); return; }
  if (e.target.closest('[data-start]')){ scrollToEl($('#vyber')); $('#g-obor summary').focus({ preventScroll:true }); return; }
});
$('#lead').addEventListener('submit', submitLead);
$$('[data-logos]').forEach(ul => { ul.innerHTML = LOGA.map(([n, id, h]) => '<li><img style="--h:' + h + 'px" src="https://cms.lifescale.cz/assets/' + id + '?width=360" alt="' + esc(n) + '"></li>').join(''); });
renderChips(); syncFilters(); layoutFilters(); WIDE.addEventListener('change', layoutFilters);
renderGrid(); renderBar(); renderPick(); syncLead(); syncBar();
})();
