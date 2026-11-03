/* ---------- AI mapa: logika ---------- */
(function(){
'use strict';
const $ = (s, el) => (el || document).querySelector(s);
const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf = (n, d) => Number(n).toLocaleString('cs-CZ', { maximumFractionDigits: d || 0 });
const kc = n => nf(n) + ' Kč';
const SUB_RATE = 478.19, SUB_HOURS = 60, WEEKS = 52 / 12, RATE = 435;
const KEY = 'ls-ai-mapa-v1';

const S = { obor:null, odd:'vse', q:'', plan:[], people:10, pilot:false, custom:false, lead:null, done:false, fname:'' };
try { const saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved && Array.isArray(saved.plan)) S.plan = saved.plan.filter(id => UC.some(u => u.id === id)); } catch (e) {}
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify({ plan:S.plan })); } catch (e) {} };

const byId = id => UC.find(u => u.id === id);
const hrs = u => nf(u[0], 1) + ' až ' + nf(u[1], 1) + ' h týdně';
const moznost = n => n === 1 ? 'možnost' : (n >= 2 && n <= 4 ? 'možnosti' : 'možností');
const lidi = p => p === 1 ? 'člověka' : (p >= 2 && p <= 4 ? 'lidi' : 'lidí');            // pro + 4. pád
const hodAcc = n => n === 1 ? 'hodinu' : (n >= 2 && n <= 4 ? 'hodiny' : 'hodin');      // ušetří 1 hodinu, 3 hodiny, 5 hodin
const hodNom = n => n % 1 ? 'hodiny' : (n === 1 ? 'hodina' : (n >= 2 && n <= 4 ? 'hodiny' : 'hodin'));
const sig2 = n => { if (!(n > 0)) return 0; const d = Math.pow(10, Math.max(0, Math.floor(Math.log10(n)) - 1)); return Math.round(n / d) * d; };
const roundH = h => h < 10 ? Math.max(1, Math.round(h)) : sig2(h);
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const ICON_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
const ICON_OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const V_OBOR = { stavebnictvi:'ve stavebnictví', zdravotnictvi:'ve zdravotnictví', logistika:'v logistice', fin:'ve finančních službách',
                 pravo:'v advokátních kancelářích', vyroba:'ve výrobě a průmyslu', auto:'v automobilovém průmyslu', jine:'pro váš obor' };
const PRO_ODD = { obchod:'pro obchod', marketing:'pro marketing', hr:'pro HR a nábor', finance:'pro finance a účetnictví',
                  pece:'pro zákaznickou péči', provoz:'pro provoz a odbornou práci', vedeni:'pro vedení firmy' };
const ICON_CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
const ICON_WARN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9.5 17h-19z"/><path d="M12 10v4M12 17.5v.01"/></svg>';

/* ---------- filtry ---------- */
function renderChips(){
  $('#f-obor').innerHTML = OBORY.map(([k, l]) => '<button class="chip" type="button" data-obor="' + k + '" aria-pressed="' + (S.obor === k) + '">' + esc(l) + '</button>').join('');
  $('#f-odd').innerHTML = ODDELENI.map(([k, l]) => '<button class="chip" type="button" data-odd="' + k + '" aria-pressed="' + (S.odd === k) + '">' + esc(l) + '</button>').join('');
}
const plain = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
function visible(){
  const q = plain(S.q.trim());
  return UC.filter(u => (S.odd === 'vse' || u.d === S.odd)
    && (!S.obor || (S.obor === 'jine' ? !u.i.length : (!u.i.length || u.i.includes(S.obor))))
    && (!q || plain(u.t + ' ' + u.w + ' ' + ODD_LABEL[u.d]).includes(q)))
    .sort((a, b) => (b.i.length ? 1 : 0) - (a.i.length ? 1 : 0));
}

/* ---------- karty ---------- */
function card(u){
  const inPlan = S.plan.includes(u.id);
  return '<article class="uc' + (inPlan ? ' in' : '') + '" data-id="' + u.id + '">' +
    '<div class="uc-top"><span class="dept">' + esc(ODD_LABEL[u.d]) + '</span>' + (u.i.length ? '<span class="ind">' + esc(OBOR_PRO[u.i[0]]) + '</span>' : '') + '</div>' +
    '<h3>' + esc(u.t) + '</h3><p class="w">' + esc(u.w) + '</p>' +
    '<div class="meta"><span>' + ICON_CLOCK + 'Ušetří ' + hrs(u.u) + '</span><span class="lvl ' + u.l + '">' + LEVEL[u.l] + '</span></div>' +
    '<div class="uc-actions"><button class="btn btn-ghost btn-sm" type="button" data-open="' + u.id + '">Zobrazit postup</button>' +
    '<button class="btn btn-sm ' + (inPlan ? 'on' : 'btn-primary') + '" type="button" data-plan="' + u.id + '" aria-pressed="' + inPlan + '">' + (inPlan ? 'V plánu ✓' : '+ Do plánu') + '</button></div></article>';
}
function renderGrid(){
  const list = visible();
  const n = list.length;
  let title;
  if (!S.obor && S.odd === 'vse') title = n + ' ' + moznost(n) + ' pro všechny obory';
  else title = n + ' ' + moznost(n) + (S.odd !== 'vse' ? ' ' + PRO_ODD[S.odd] : '') + (S.obor ? ' ' + V_OBOR[S.obor] : '');
  if (S.q.trim()) title += ', hledáte „' + S.q.trim() + '“';
  $('#res-title').textContent = title;
  $('#res-sub').textContent = S.obor || S.odd !== 'vse' ? 'Přidejte si do plánu, co by vám pomohlo, a stáhněte si ho v PDF.' : 'Vyberte obor a oddělení, ať vidíte jen to, co se vás týká.';
  $('#grid').innerHTML = n ? list.map(card).join('') : '<p class="empty">Tady nic není. Zkuste jiné oddělení nebo kratší hledané slovo.</p>';
}

/* ---------- plán a výpočty ---------- */
function totals(){
  const items = S.plan.map(byId).filter(Boolean);
  const a = items.reduce((s, u) => s + u.u[0], 0), b = items.reduce((s, u) => s + u.u[1], 0), m = (a + b) / 2;
  const p = Math.min(5000, Math.max(1, Math.round(Number(S.people) || 1)));
  const h = m * WEEKS * p;
  return { items, a, b, m, p, h, h1: a * WEEKS * p, h2: b * WEEKS * p, k: h * RATE, sub: p * SUB_HOURS * SUB_RATE,
           mixed: new Set(items.map(u => u.d)).size > 1 };
}
const saveNote = t => 'Odhad počítá s průměrnou mzdou podle ČSÚ a s tím, že lidé úkoly dělají pravidelně.' +
  (t.mixed ? ' Úkoly jsou z\u00a0více oddělení, takže skutečná úspora bude spíš nižší.' : '');
function planPayload(){
  const t = totals();
  return { zdroj: 'AI mapa pro firmy', obor: S.obor ? OBOR_LABEL[S.obor] : null, lide: t.p,
           moznosti: t.items.map(u => ({ id: u.id, nazev: u.t, oddeleni: ODD_LABEL[u.d] })),
           uspora_h_mesicne: roundH(t.h), dotace_kc: Math.round(t.sub), navrh_na_miru: S.custom, prvni_lekce_zdarma: S.pilot };
}
function renderPlan(){
  const t = totals(), n = t.items.length, H = roundH(t.h);
  $('#pill-n').textContent = n;
  $('#plan-title').textContent = n ? 'Vybrali jste ' + n + ' ' + moznost(n) : 'Zatím nemáte nic vybraného';
  $('#plan-empty').hidden = n > 0;
  $('#plan-body').hidden = n === 0;
  $('#plist').innerHTML = t.items.map(u => '<li><span class="pt">' + esc(u.t) + '</span><span class="ps">Ušetří ' + hrs(u.u) + '</span>' +
    '<button class="rm" type="button" data-plan="' + u.id + '" aria-label="Odebrat z plánu: ' + esc(u.t) + '">' + ICON_X + '</button></li>').join('');
  $('#save-h').textContent = (t.p === 1 ? 'Ušetříte zhruba ' : 'Tým ušetří zhruba ') + nf(H) + ' ' + hodAcc(H) + ' měsíčně';
  $('#save-k').textContent = 'To je kolem ' + kc(sig2(t.k)) + ' měsíčně v\u00a0nákladech na práci.';
  $('#save-note').textContent = saveNote(t);
  $('#sub-sum').innerHTML = 'Když kurz rozšíříme na 60 hodin, můžete na školení pro ' + t.p + ' ' + lidi(t.p) + ' získat dotaci až <b>' + kc(Math.round(t.sub)) + '</b>.';
  $('#pilot-chip').hidden = !S.pilot;
  $('#l-plan').value = JSON.stringify(planPayload());
  $('#tray-t').innerHTML = '<b>V\u00a0plánu ' + n + ' ' + moznost(n) + '</b><span>ušetří zhruba ' + nf(t.m, 1) + ' h týdně<span class="tr-pp"> na člověka</span></span>';
  $('#tray').hidden = n === 0 || planVisible;
  renderSales();
}
function togglePlan(id){
  const i = S.plan.indexOf(id);
  if (i >= 0) S.plan.splice(i, 1); else S.plan.push(id);
  persist();
  renderGrid(); renderPlan();
  const sb = $('#sheet [data-plan="' + id + '"]');
  if (sb){ const on = S.plan.includes(id); sb.className = 'btn ' + (on ? 'on' : 'btn-primary'); sb.textContent = on ? 'V plánu ✓' : '+ Přidat do plánu'; sb.setAttribute('aria-pressed', String(on)); }
}
let planVisible = false;

/* ---------- detail možnosti ---------- */
let lastFocus = null, openId = null;
function openDetail(id, opener){
  const u = byId(id); if (!u) return;
  openId = id; lastFocus = opener || document.activeElement;
  const on = S.plan.includes(id);
  $('#sheet').innerHTML =
    '<button class="x" type="button" data-close aria-label="Zavřít"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
    '<div class="uc-top"><span class="dept">' + esc(ODD_LABEL[u.d]) + '</span>' + (u.i.length ? '<span class="ind">' + esc(OBOR_PRO[u.i[0]]) + '</span>' : '') + '</div>' +
    '<h2 id="d-title">' + esc(u.t) + '</h2><p class="w">' + esc(u.w) + '</p>' +
    '<div class="meta"><span>' + ICON_CLOCK + 'Ušetří ' + hrs(u.u) + '</span><span class="lvl ' + u.l + '">' + LEVEL[u.l] + '</span></div>' +
    '<p class="tool">Nástroj: ' + esc(NASTROJ[u.n]) + '</p>' +
    '<div class="sec"><h4>Jak na to</h4><ol class="steps">' + u.s.map(x => '<li><span>' + esc(x) + '</span></li>').join('') + '</ol></div>' +
    '<div class="sec"><h4>Pokyn pro AI</h4><div class="prompt" id="d-prompt">' + esc(u.p) + '</div>' +
    '<div class="prompt-actions"><button class="btn btn-dark btn-sm" type="button" data-copy>Kopírovat pokyn</button><span class="copied" id="d-copied" aria-live="polite"></span></div>' +
    '<p class="soft" style="margin-top:8px">Text v hranatých závorkách nahraďte svými údaji.</p></div>' +
    '<div class="sec note">' + ICON_WARN + '<span><b>Na co si dát pozor:</b> ' + esc(u.x) + '</span></div>' +
    gzPanel(u, id) +
    '<div class="sheet-actions"><button class="btn ' + (on ? 'on' : 'btn-primary') + '" type="button" data-plan="' + id + '" aria-pressed="' + on + '">' + (on ? 'V plánu ✓' : '+ Přidat do plánu') + '</button></div>';
  $('#ov').hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('#sheet [data-close]').focus(), 30);
  startGa();
}
function closeDetail(){
  $('#ov').hidden = true; openId = null;
  clearInterval(gaTimer);
  if ($('#gz').hidden) document.body.style.overflow = '';
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

/* ---------- Grizlet v detailu: krátká animace ---------- */
let gaTimer = 0;
function gzPanel(u, id){
  const k = KVIZ[u.q], wrong = k.o.find((o, i) => i !== k.ok);
  return '<div class="sec gzbox"><div class="gzbox-top">' +
    '<div class="ga" data-scene="1" aria-hidden="true">' +
      '<div class="ga-scr ga-s1"><p class="ga-time">9:41</p>' +
        '<div class="ga-msg"><p class="ga-from"><span class="ga-ic">g</span><b>Grizlet</b></p><span class="t">Nová lekce: ' + esc(u.t) + '</span></div>' +
        '<span class="ga-open">Otevřít lekci</span></div>' +
      '<div class="ga-scr ga-s2"><div class="ga-prog"><i></i><i></i><i></i><i></i></div>' +
        '<p class="ga-cat">' + esc(ODD_LABEL[u.d]) + '  3/4</p><p class="ga-q">' + esc(k.q) + '</p>' +
        '<span class="ga-opt"><span>' + esc(wrong) + '</span></span><span class="ga-opt ga-right"><span>' + esc(k.o[k.ok]) + '</span></span>' +
        '<span class="ga-fb">✓ Správně</span></div>' +
      '<div class="ga-scr ga-s3"><p class="ga-h">Výsledky lekce</p><p class="ga-big">8 z 10</p><p class="ga-sub">lidí lekci dokončilo</p>' +
        '<div class="ga-bar"><i></i></div>' +
        '<ul class="ga-people"><li>Jana N. <b>100 %</b></li><li>Petr K. <b>80 %</b></li><li>Eva S. <b>100 %</b></li></ul></div>' +
    '</div>' +
    '<div class="gzbox-side"><h4>Naučte to tým v mobilu</h4>' +
      '<ol class="ga-steps"><li class="on">Lekce přijde odkazem do mobilu</li><li>Za 3 až 4 minuty projdou postup a kvíz</li><li>Vy vidíte, kdo ji zvládl</li></ol></div>' +
  '</div>' +
  '<p class="gzbox-free"><b>První lekci pro váš tým připravíme v Grizletu zdarma.</b></p>' +
  '<button class="btn btn-ghost btn-sm" type="button" data-lesson="' + id + '">Projít ukázku lekce</button></div>';
}
function startGa(){
  clearInterval(gaTimer);
  const el = $('#sheet .ga'); if (!el) return;
  const steps = $$('#sheet .ga-steps li');
  const set = s => { el.dataset.scene = String(s); steps.forEach((li, i) => li.classList.toggle('on', i === s - 1)); };
  if (reduced()){ el.classList.add('ga-static'); el.dataset.scene = '2'; steps.forEach(li => li.classList.add('on')); return; }
  let s = 1; set(1);
  gaTimer = setInterval(() => { if (!document.contains(el)) { clearInterval(gaTimer); return; } s = s % 3 + 1; set(s); }, 3200);
}

/* ---------- ukázková lekce ve stylu Grizletu ---------- */
let gz = { id:null, step:0, answered:false };
function openLesson(id){
  gz = { id, step:0, answered:false };
  $('#gz').hidden = false;
  document.body.style.overflow = 'hidden';
  renderLesson();
  setTimeout(() => { const b = $('#phone .gz-btn'); if (b) b.focus(); }, 30);
}
function closeLesson(){
  $('#gz').hidden = true;
  if ($('#ov').hidden) document.body.style.overflow = '';
  const b = $('#sheet [data-lesson]'); if (b && !$('#ov').hidden) b.focus();
}
function renderLesson(){
  const u = byId(gz.id), k = KVIZ[u.q];
  const prog = '<div class="gz-prog" aria-hidden="true">' + [0, 1, 2, 3].map(i => '<i class="' + (i <= gz.step ? 'on' : '') + '"></i>').join('') + '</div>';
  const cat = '<p class="gz-cat">' + esc(ODD_LABEL[u.d]) + '  ' + (gz.step + 1) + '/4</p>';
  let body = '', btn = '';
  if (gz.step === 0){
    body = '<h3>' + esc(u.t) + '</h3><p>' + esc(u.w) + '</p><p style="margin-top:12px"><b>Ušetří ' + hrs(u.u) + '.</b></p>';
    btn = '<button class="gz-btn" type="button" data-gz="next">Pokračovat</button>';
  } else if (gz.step === 1){
    body = '<h3>Jak na to</h3><ol>' + u.s.map(x => '<li>' + esc(x) + '</li>').join('') + '</ol><p style="margin-top:12px">Hotový pokyn pro AI najdete u lekce jako přílohu.</p>';
    btn = '<button class="gz-btn" type="button" data-gz="next">Pokračovat</button>';
  } else if (gz.step === 2){
    body = '<h3>' + esc(k.q) + '</h3><div class="gz-opts">' + k.o.map((o, i) => '<button class="gz-opt" type="button" data-opt="' + i + '">' + esc(o) + '</button>').join('') + '</div><div id="gz-fb"></div>';
    btn = '<button class="gz-btn" type="button" data-gz="next" disabled>Pokračovat</button>';
  } else {
    body = '<div class="gz-done"><p class="big">Hotovo!</p><p>Takhle se vaši lidé naučí nový postup za pár minut. Lekci jim pošlete odkazem, e-mailem nebo přes Teams a\u00a0otevře se v\u00a0mobilu bez instalace. Vy pak vidíte, kdo lekci dokončil a\u00a0s\u00a0jakým skóre.</p>' +
      '<p><b>První lekci pro váš tým připravíme zdarma</b>, třeba z\u00a0tohoto postupu nebo z\u00a0vašeho materiálu.</p></div>';
    btn = '<button class="gz-btn" type="button" data-gz="pilot">Chci první lekci zdarma</button>';
  }
  $('#phone').innerHTML = prog + cat + '<div class="gz-body">' + body + '</div>' + btn;
}
function answer(i){
  if (gz.answered) return;
  gz.answered = true;
  const k = KVIZ[byId(gz.id).q];
  $$('#phone .gz-opt').forEach((b, j) => { b.disabled = true; if (j === k.ok) b.classList.add('ok'); else if (j === i) b.classList.add('no'); });
  const good = i === k.ok;
  $('#gz-fb').innerHTML = '<div class="gz-fb' + (good ? '' : ' bad') + '"><b>' + (good ? 'Správně.' : 'Tohle ne.') + '</b> ' + esc(k.fb) + '</div>';
  const b = $('#phone .gz-btn'); b.disabled = false; b.focus();
}

/* ---------- vstupní nabídka a formulář ---------- */
function wantPilot(id){
  if (id && byId(id) && !S.plan.includes(id)){ S.plan.push(id); persist(); }
  S.pilot = true;
  if (!$('#gz').hidden) closeLesson();
  if (!$('#ov').hidden) closeDetail();
  renderGrid(); renderPlan();
  if (S.done) renderDone();
  const target = S.done ? $('#lead-ok') : $('#form-box');
  target.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block:'start' });
  if (!S.done) setTimeout(() => $('#l-email').focus({ preventScroll:true }), 450);
}
const FREE = ['gmail.com', 'seznam.cz', 'email.cz', 'centrum.cz', 'post.cz', 'volny.cz', 'atlas.cz', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com', 'tiscali.cz', 'azet.sk'];
const MSG = {
  declined: 'Stažení jste zrušili. Plán zůstává připravený, stačí kliknout znovu.',
  busy: 'Okno se stažením už je otevřené. Potvrďte ho, nebo to za chvíli zkuste znovu.',
  blocked: 'V\u00a0tomto zobrazení se PDF stáhnout nedá. Otevřete stránku v\u00a0Claudu v\u00a0prohlížeči nebo v\u00a0aplikaci a\u00a0zkuste to znovu.',
  error: 'PDF se nepodařilo vytvořit. Zkuste to prosím znovu.'
};
function showErr(msg){ const e = $('#l-err'); e.textContent = msg; e.hidden = !msg; }
async function submitLead(e){
  e.preventDefault();
  const name = $('#l-name').value.trim(), email = $('#l-email').value.trim(), firm = $('#l-firm').value.trim(), phone = $('#l-phone').value.trim();
  let msg = '', bad = null;
  if (!S.plan.length) msg = 'Přidejte do plánu aspoň jednu možnost.';
  else if (!email){ msg = 'Napište prosím svůj e-mail.'; bad = '#l-email'; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)){ msg = 'E-mail nevypadá správně, zkontrolujte ho prosím.'; bad = '#l-email'; }
  else if (phone && phone.replace(/\D/g, '').length < 9){ msg = 'Telefon nevypadá správně. Opravte ho, nebo pole nechte prázdné.'; bad = '#l-phone'; }
  else if (!$('#l-consent').checked){ msg = 'Bez souhlasu se zpracováním údajů vám nemůžeme poslat nabídku ani se ozvat.'; bad = '#l-consent'; }
  showErr(msg);
  if (msg){ if (bad) $(bad).focus(); return; }
  S.lead = { name, email, firm, phone, free: FREE.includes(email.split('@')[1].toLowerCase()) };
  S.custom = $('#l-custom').checked;
  $('#l-plan').value = JSON.stringify(planPayload());
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
      '<p>Podle možností z\u00a0vašeho plánu připravíme, jak by kurz mohl vypadat u\u00a0vás, a\u00a0ozveme se na ' + esc(S.lead.email) + '.</p>' +
      '<p class="noted">' + ICON_OK + 'Zájem o\u00a0návrh na míru máme poznamenaný.</p></div>'
    : '<div class="next"><span class="badge">Další krok</span><h4>Chcete vidět kurz na míru pro vaši firmu?</h4>' +
      '<p>Podle možností z\u00a0vašeho plánu připravíme, jak by AI Akcelerátor mohl vypadat právě u\u00a0vás.</p>' +
      '<button class="btn btn-primary" type="button" data-custom-yes>Chci návrh na míru</button></div>';
  box.innerHTML = '<p class="done-t" tabindex="-1">' + ICON_OK + 'Ukázka kurzu je stažená</p>' +
    '<p class="soft">Nestáhla se? <button class="linkish" type="button" data-again>Stáhnout znovu</button></p>' + custom +
    '<div class="next alt"><h4>Vyzkoušejte první lekci zdarma</h4>' +
    '<p>Z\u00a0jednoho vašeho materiálu nebo postupu z\u00a0plánu připravíme v\u00a0Grizletu lekci na 3 až 4 minuty s\u00a0kvízem a\u00a0pošleme ji týmu do mobilu. Uvidíte, kdo ji dokončil a\u00a0s\u00a0jakým skóre.</p>' +
    (S.pilot ? '<p class="noted">' + ICON_OK + 'Zájem o\u00a0první lekci zdarma máme poznamenaný.</p>' : '<button class="btn btn-ghost" type="button" data-pilot-yes>Chci první lekci zdarma</button>') + '</div>' +
    '<p class="soft">Chcete to probrat hned? <a href="https://business.lifescale.cz/cz" target="_blank" rel="noopener">Rezervujte si nezávaznou konzultaci</a>.</p>' +
    (S.lead && S.lead.free ? '<p class="soft">Tip: s\u00a0firemním e-mailem vám umíme poslat i nabídku přímo pro vaši firmu.</p>' : '');
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
  const INK = [32, 16, 11], MUTED = [92, 88, 85], BLUE = [0, 121, 181], NAVY = [11, 52, 96], AMBER = [122, 67, 0];
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
  function box(str, size, fill, color){
    doc.setFont('Figtree', 'normal'); doc.setFontSize(size);
    const lines = doc.splitTextToSize(String(str), W - 10);
    const step = lh(size);
    let i = 0;
    while (i < lines.length){
      const room = Math.max(1, Math.floor((BOTTOM - y - 8) / step));
      if (room < 2 && y > M + 10){ newPage(); continue; }
      const chunk = lines.slice(i, i + room);
      const h = chunk.length * step + 8;
      doc.setFillColor.apply(doc, fill); doc.roundedRect(M, y, W, h, 2.5, 2.5, 'F');
      doc.setTextColor.apply(doc, color);
      chunk.forEach((line, j) => doc.text(line, M + 5, y + 4 + j * step, { baseline:'top' }));
      y += h + 3; i += chunk.length;
      if (i < lines.length) newPage();
    }
  }
  const t = totals();
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
  doc.text(doc.splitTextToSize('Staženo z\u00a0AI mapy ' + today + (S.lead.firm ? ' pro firmu ' + S.lead.firm.replace(/\.+$/, '') : '') + '.', W)[0], M, sy + 1, { baseline:'top' });
  y = 66;
  const bullet = (txt) => { ensure(lh(10.5) + 1); doc.setFont('Figtree', 'normal'); doc.setFontSize(10.5); doc.setTextColor.apply(doc, INK); doc.text('•', M + 3, y, { baseline:'top' }); para(txt, 10.5, 'normal', INK, { indent:7, gap:0.8 }); };
  // o kurzu
  para('O kurzu', 14, 'bold', INK, { gap:2 });
  para(KURZ.oKurzu + ' Tady je jeho standardní podoba, každé firmě ho upravujeme na míru.', 11, 'normal', INK, { gap:5 });
  // program
  para('Program kurzu', 14, 'bold', INK, { gap:2.5, keep:true });
  KURZ.moduly.forEach((mo, i) => {
    ensure(34);
    para('Modul ' + (i + 1) + ': ' + mo.t + ' (' + mo.h + ' hodiny)', 11.5, 'bold', INK, { gap:1 });
    mo.body.forEach(x => bullet(x));
    para('V\u00a0praxi: ' + mo.praxe, 10, 'normal', BLUE, { gap:3.5, indent:7 });
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
  para('Jak to vypadalo u\u00a0jiných firem', 11, 'bold', INK, { gap:1.2 });
  KURZ.priklady.forEach(p => bullet(p[0] + ': ' + p[1]));
  y += 5;
  // dotace
  ensure(36);
  para('Dotace na kurz', 14, 'bold', INK, { gap:2 });
  para('Podporu z\u00a0výzvy Vzdělávání pro firmy dostanete na účastníka, který absolvuje aspoň 50 hodin. Standardní AI Akcelerátor má 12 hodin, pro dotaci ho proto doplníme o\u00a0další témata, třeba digitální produktivitu nebo kybernetickou bezpečnost, na ' + SUB_HOURS + ' hodin. Výzva hradí ' + nf(SUB_RATE, 2) + ' Kč na osobohodinu, tedy pro ' + t.p + ' ' + lidi(t.p) + ' a\u00a0' + SUB_HOURS + ' hodin až ' + kc(Math.round(t.sub)) + '. U\u00a0OSVČ a\u00a0dodavatelů je podpora poloviční a\u00a0proplácí se zpětně. S\u00a0žádostí vám pomůžeme a\u00a0dotační servis je v\u00a0ceně kurzu.', 10.5, 'normal', INK, { gap:3 });
  doc.setFont('Figtree', 'normal'); doc.setFontSize(10); doc.setTextColor.apply(doc, BLUE);
  ensure(6); doc.textWithLink('Víc o\u00a0dotacích na vzdělávání: business.lifescale.cz/cz/pages/sluzby/dotace-z-eu-na-vzdelavani', M, y, { url:'https://business.lifescale.cz/cz/pages/sluzby/dotace-z-eu-na-vzdelavani', baseline:'top' }); y += lh(10) + 3;
  para('AI Act od února 2025 ukládá firmám, které AI používají, zajistit lidem, kteří s ní pracují, dostatečnou gramotnost v AI. Kurz s prezenční listinou to pomůže doložit.', 9.5, 'normal', MUTED, { gap:6 });
  // další krok
  const nextHead = S.custom ? 'Návrh na míru pro vaši firmu připravíme' : 'Chcete vidět, jak by kurz vypadal u vás?';
  const nextBody = S.custom
    ? 'Podle možností, které jste si vybrali v AI mapě, připravíme, jak by kurz mohl vypadat u vás, a ozveme se.'
    : 'Napište nám. Podle možností, které jste si vybrali v AI mapě, připravíme návrh kurzu na míru pro vaši firmu.';
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
  para('Vyzkoušejte první lekci v\u00a0Grizletu zdarma', 12, 'bold', INK, { gap:1, keep:true });
  para('Z\u00a0jednoho vašeho materiálu, třeba z\u00a0postupu v\u00a0příloze, připravíme v\u00a0Grizletu lekci na 3 až 4 minuty s\u00a0kvízem a\u00a0pošleme ji týmu do mobilu. Lekce se otevře odkazem, bez instalace a\u00a0bez hesla, a\u00a0vy uvidíte, kdo ji dokončil a\u00a0s\u00a0jakým skóre.' + (S.pilot ? ' Zájem o\u00a0první lekci zdarma máme poznamenaný.' : ''), 10.5, 'normal', INK, { gap:4 });
  // váš výběr z AI mapy
  newPage();
  para('Váš výběr z AI mapy', 16, 'bold', INK, { gap:2 });
  const H = roundH(t.h);
  para('Tyto možnosti jste si vybrali v AI mapě. Postupy a pokyny můžete vyzkoušet hned. Pro ' + t.p + ' ' + lidi(t.p) + ' ušetří zhruba ' + nf(H) + ' ' + hodAcc(H) + ' měsíčně, tedy kolem ' + kc(sig2(t.k)) + ' měsíčně v nákladech na práci při ' + kc(RATE) + ' za hodinu. Podle toho, jak často úkoly děláte, to může být ' + nf(roundH(t.h1)) + ' až ' + nf(roundH(t.h2)) + ' hodin měsíčně.', 10.5, 'normal', INK, { gap:2 });
  para(saveNote(t), 9.5, 'normal', MUTED, { gap:6 });
  t.items.forEach((u, idx) => {
    ensure(40);
    if (idx){ doc.setDrawColor(230, 235, 239); doc.setLineWidth(0.3); doc.line(M, y, PW - M, y); y += 4; }
    para((idx + 1) + '. ' + u.t, 14, 'bold', INK, { gap:1 });
    para(ODD_LABEL[u.d] + (u.i.length ? ', ' + OBOR_LABEL[u.i[0]] : '') + '. Ušetří ' + hrs(u.u) + '. Obtížnost: ' + LEVEL[u.l].toLowerCase() + '.', 9.5, 'normal', BLUE, { gap:2 });
    para(u.w, 11, 'normal', INK, { gap:2.5 });
    para('Jak na to', 11, 'bold', INK, { gap:1 });
    u.s.forEach((s, i) => para((i + 1) + '. ' + s, 10.5, 'normal', INK, { indent:3, gap:0.6 }));
    y += 2;
    para('Pokyn pro AI (text v hranatých závorkách nahraďte svými údaji)', 11, 'bold', INK, { gap:1.5 });
    box(u.p, 10, [242, 250, 254], INK);
    para('Na co si dát pozor: ' + u.x, 10, 'normal', AMBER, { gap:7 });
  });
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
  const t = totals();
  const L = S.lead;
  const rows = [
    ['Zdroj', 'AI mapa pro firmy'],
    ['Stáhl', S.done ? 'ukázku kurzu AI Akcelerátor' : 'zatím nic'],
    ['Kontakt', L ? esc([L.name, L.email, L.phone, L.firm].filter(Boolean).join(', ')) + (L.free ? ' <i>(soukromý e-mail)</i>' : '') + (L.phone ? '' : ' <i>(bez telefonu)</i>') : 'zatím nevyplněno'],
    ['Návrh kurzu na míru', S.custom ? '<b>chce, připravit podle plánu</b>' : 'zatím ne'],
    ['První lekce v\u00a0Grizletu zdarma', S.pilot ? '<b>chce, připravit první lekci</b>' : 'zatím ne'],
    ['Velikost firmy', L && !L.firm ? 'firmu nevyplnil, dohledat v\u00a0BizMachine podle domény e-mailu' : 'dohledat v\u00a0BizMachine podle názvu firmy'],
    ['Obor', S.obor ? esc(OBOR_LABEL[S.obor]) : 'nevybral'],
    ['Plán', t.items.length ? esc(t.items.map(u => u.t + ' (' + ODD_LABEL[u.d] + ')').join('; ')) : 'prázdný'],
    ['Odhad úspory', t.items.length ? 'zhruba ' + nf(roundH(t.h)) + ' h měsíčně pro ' + t.p + ' ' + lidi(t.p) : 'nic'],
    ['Podpora Vzdělávání pro firmy', 'až ' + kc(Math.round(t.sub)) + ' pro ' + t.p + ' ' + lidi(t.p) + ' a\u00a060 hodin'],
    ['Skryté pole formuláře', '<code>' + esc(JSON.stringify(planPayload())) + '</code>']
  ];
  $('#sales').innerHTML = rows.map(r => '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>').join('');
}

/* ---------- ukázka v úvodu ---------- */
function renderHeroVis(){
  const u = byId('o1'), k = u && KVIZ[u.q], el = $('#hero-vis');
  if (!u || !k || !el) return;
  el.innerHTML = '<div class="hv-card"><div class="uc-top"><span class="dept">' + esc(ODD_LABEL[u.d]) + '</span></div>' +
    '<h3>' + esc(u.t) + '</h3>' +
    '<div class="meta"><span>' + ICON_CLOCK + 'Ušetří ' + hrs(u.u) + '</span><span class="lvl ' + u.l + '">' + LEVEL[u.l] + '</span></div>' +
    '<p class="hv-label">Pokyn pro AI</p><div class="hv-prompt"><span>' + esc(u.p.replace(/\n/g, ' ')) + '</span></div>' +
    '<div class="hv-row"><span class="hv-chip on">V plánu ✓</span></div></div>' +
    '<div class="hv-phone"><div class="gz-prog"><i class="on"></i><i class="on"></i><i class="on"></i><i></i></div>' +
    '<p class="gz-cat">' + esc(ODD_LABEL[u.d]) + '  3/4</p><p class="hv-q">' + esc(k.q) + '</p>' +
    '<div class="hv-opt">' + esc(k.o[0]) + '</div><div class="hv-opt hv-ok">' + esc(k.o[k.ok]) + '</div>' +
    '<div class="hv-btn">Pokračovat</div></div>' +
    '<p class="hv-cap"><i>g</i>Lekce pro tým do mobilu</p>';
}

/* ---------- události ---------- */
document.addEventListener('click', e => {
  const ob = e.target.closest('[data-obor]');
  if (ob){ S.obor = S.obor === ob.dataset.obor ? null : ob.dataset.obor; renderChips(); renderGrid(); renderSales(); return; }
  const od = e.target.closest('[data-odd]');
  if (od){ S.odd = od.dataset.odd; renderChips(); renderGrid(); return; }
  const op = e.target.closest('[data-open]');
  if (op){ openDetail(op.dataset.open, op); return; }
  const pl = e.target.closest('[data-plan]');
  if (pl){ togglePlan(pl.dataset.plan); return; }
  if (e.target.closest('[data-close]')){ closeDetail(); return; }
  if (e.target.closest('[data-copy]')){ copyPrompt(); return; }
  const ls = e.target.closest('[data-lesson]');
  if (ls){ openLesson(ls.dataset.lesson); return; }
  const opt = e.target.closest('[data-opt]');
  if (opt){ answer(Number(opt.dataset.opt)); return; }
  const g = e.target.closest('[data-gz]');
  if (g){ if (g.dataset.gz === 'pilot') wantPilot(gz.id); else { gz.step++; gz.answered = false; renderLesson(); const b = $('#phone .gz-btn'); if (b && !b.disabled) b.focus(); } return; }
  const st = e.target.closest('[data-step]');
  if (st){ const v = Math.min(5000, Math.max(1, (Math.round(Number(S.people)) || 1) + Number(st.dataset.step))); S.people = v; $('#c-n').value = v; renderPlan(); return; }
  if (e.target.closest('[data-again]')){ savePdf().then(r => { if (r !== 'saved' && r !== 'fallback') alertDone(r); }).catch(() => alertDone('error')); return; }
  if (e.target.closest('[data-custom-yes]')){ S.custom = true; $('#l-plan').value = JSON.stringify(planPayload()); renderDone(); renderSales(); const n = $('#lead-ok .next .noted'); if (n){ n.setAttribute('tabindex', '-1'); n.focus({ preventScroll:true }); } return; }
  if (e.target.closest('[data-pilot-yes]')){ S.pilot = true; renderDone(); renderSales(); const n = $('#lead-ok .noted'); if (n){ n.setAttribute('tabindex', '-1'); n.focus({ preventScroll:true }); } return; }
  if (e.target.id === 'ov') closeDetail();
  if (e.target.id === 'gz') closeLesson();
});
$('#gz-close').addEventListener('click', closeLesson);
$('#pilot-x').addEventListener('click', () => { S.pilot = false; renderPlan(); $('#l-email').focus({ preventScroll:true }); });
$('#lead').addEventListener('submit', submitLead);
$('#l-custom').addEventListener('change', e => { S.custom = e.target.checked; $('#l-plan').value = JSON.stringify(planPayload()); renderSales(); });
let qt = 0;
$('#f-q').addEventListener('input', e => { clearTimeout(qt); qt = setTimeout(() => { S.q = e.target.value; renderGrid(); }, 150); });
$('#c-n').addEventListener('input', e => { S.people = e.target.value; renderPlan(); });
$('#c-n').addEventListener('change', e => { const v = Math.min(5000, Math.max(1, Math.round(Number(e.target.value)) || 1)); S.people = v; e.target.value = v; renderPlan(); });
document.addEventListener('keydown', e => {
  const layer = !$('#gz').hidden ? $('#gz') : (!$('#ov').hidden ? $('#ov') : null);
  if (!layer) return;
  if (e.key === 'Escape'){ if (layer.id === 'gz') closeLesson(); else closeDetail(); return; }
  if (e.key === 'Tab'){
    const f = $$('button:not([disabled]), a[href], input, select, [tabindex="0"]', layer);
    if (!f.length) return;
    const i = f.indexOf(document.activeElement);
    e.preventDefault();
    f[(i + (e.shiftKey ? f.length - 1 : 1) + f.length) % f.length].focus();
  }
});
if ('IntersectionObserver' in window){
  new IntersectionObserver(([en]) => { planVisible = en.isIntersecting; $('#tray').hidden = !S.plan.length || planVisible; }, { threshold:0.08 }).observe($('#plan'));
}
$('#hero-n').textContent = UC.length + ' konkrétních možností';
renderHeroVis();
renderChips(); renderGrid(); renderPlan();
})();
