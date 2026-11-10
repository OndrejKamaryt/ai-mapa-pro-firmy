"""Automatický průchod stránkou „Složte si vlastní AI Akcelerátor“ na telefonu (390 px) a notebooku (1366 px).

Spuštění z kořene repozitáře:
    python3 tests/test_flow.py  # volitelně: cesta k HTML a složka pro výstupy

Skript proklikne filtr oborů a oddělení, šest úvodních možností a rozbalení všech, přidání a odebrání z výběru, lištu,
formulář a odeslání. Odeslání zkouší i ve vloženém režimu: stránku otevře v iframe a potvrzení od webu
LifeScale podstrčí sám, jednou úspěšné a jednou chybné. Fotku a písma z internetu zablokuje, takže běží
i bez sítě. Snímky obrazovky uloží do tests/out/.
Bez stažených prohlížečů Playwrightu jde použít nainstalovaný Chrome: PW_CHANNEL=chrome python3 tests/test_flow.py
"""
import asyncio, sys, re, os, json, pathlib
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
P = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(HERE, '..', 'index.html')
URL = pathlib.Path(P).as_uri()
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'out')
os.makedirs(OUT, exist_ok=True)
norm = lambda s: re.sub(r'[  ]', ' ', s or '')

# rodičovská stránka jako na webu LifeScale: přijme kontakt a odpoví potvrzením, ok podle window.ACK_OK
PARENT = '''<!doctype html><meta charset="utf-8"><style>body{margin:0}iframe{display:block;width:100vw;height:100vh;border:0}</style>
<iframe id="f" src="%s"></iframe>
<script>
window.ACK_OK = true; window.LEADS = []; window.PINGS = 0;
window.postMessage = function (msg) {
  if (msg && msg.type === 'ls-ai-mapa-pointer') { window.PINGS++; return; }
  if (!msg || msg.type !== 'ls-ai-mapa-lead') return;
  window.LEADS.push(msg);
  const w = document.getElementById('f').contentWindow;
  setTimeout(() => w.dispatchEvent(new MessageEvent('message', { origin: 'https://business.lifescale.cz',
    data: { type: 'ls-ai-mapa-lead-ack', id: msg.id, ok: window.ACK_OK } })), 50);
};
</script>'''

async def setup(b, w, h, dpr=1, embed=False):
    ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=dpr)
    pg = await ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.route('https://cms.lifescale.cz/**', lambda r: r.abort())
    await pg.route('https://fonts.googleapis.com/**', lambda r: r.abort())
    if embed:
        harness = os.path.join(OUT, 'parent.html')
        open(harness, 'w', encoding='utf-8').write(PARENT % URL)
        await pg.goto(pathlib.Path(harness).as_uri()); await pg.wait_for_timeout(600)
        return ctx, pg, pg.frame_locator('#f'), errs
    await pg.goto(URL); await pg.wait_for_timeout(500)
    return ctx, pg, pg, errs

async def main():
    ok, out = {}, []
    async with async_playwright() as pw:
        b = await pw.chromium.launch(channel=os.environ.get('PW_CHANNEL') or None, args=['--allow-file-access-from-files'])

        # telefon, samostatná stránka
        ctx, pg, f, errs = await setup(b, 390, 844, 2)
        async def pick(pole, skupina, k):
            await pg.click('#' + skupina + ' summary'); await pg.click('[data-' + pole + '="' + k + '"]'); await pg.wait_for_timeout(200)
        await pg.screenshot(path=f'{OUT}/m-start.png')
        ok['nadpis bez názvu AI Akcelerátor'] = norm(await pg.inner_text('h1')).startswith('Složte si AI kurz') and 'Akcelerátor' not in norm(await pg.inner_text('.hero'))
        hero = norm(await pg.inner_text('.hero'))
        ok['dotace a konzultace zdarma v úvodu'] = 'Lze čerpat dotaci' in hero and 'Konzultace zdarma' in hero
        ok['nadpis v jedné velikosti'] = await pg.locator('h1 span.h1-pre, h1 span.h1-name').count() == 0
        ok['text tlačítka v úvodu'] = norm(await pg.inner_text('[data-start]')) == 'Složte si kurz na míru'
        ok['loga jen pod úvodem'] = await pg.locator('.trust .logos img').count() == 5 and await pg.locator('.hero .logos img, .send .logos img').count() == 0
        ok['jedna reference u formuláře'] = await pg.locator('.send-quotes .quote').count() == 1
        await pg.click('[data-start]'); await pg.wait_for_timeout(900)
        ok['tlačítko v úvodu vede k filtru'] = await pg.evaluate("document.activeElement.closest('details') && document.activeElement.closest('details').id") == 'g-obor'
        ok['na telefonu jsou menu zavřená'] = not await pg.evaluate("document.getElementById('g-obor').open || document.getElementById('g-odd').open")
        ok['6 karet a tlačítko pro všechny'] = await pg.locator('.uc').count() == 6 and await pg.is_visible('#more')
        prvni = norm(await pg.inner_text('.uc >> nth=0'))
        ok['úspora na člověka a obtížnost slovem'] = 'týdně na člověka' in prvni and 'Snadné' in prvni
        ok['bez detailu a pokynů pro AI'] = await pg.locator('#ov, [data-open], [data-copy]').count() == 0
        ok['bez sekce kurzu a PDF'] = await pg.locator('#kurz, #mods, .subsidy, .virt').count() == 0
        ok['výroba je první obor'] = await pg.get_attribute('#f-obor .chip >> nth=0', 'data-obor') == 'vyroba'
        ok['lišta je vidět hned'] = await pg.is_visible('#bar') and norm(await pg.inner_text('#bar-n')) == 'Zatím nic nevybráno'
        ok['krátký návod nad filtrem'] = norm(await pg.inner_text('.filter-hint')).startswith('Vyberte si obor a oddělení')
        ok['řada oddělení'] = await pg.locator('#f-odd .chip').count() == 7 and await pg.get_attribute('#f-odd .chip >> nth=0', 'data-odd') == 'obchod'
        await pick('odd', 'g-odd', 'provoz')
        d = await pg.eval_on_selector_all('.uc .dept', 'els => els.map(e => e.textContent)')
        ok['filtr oddělení ukáže všechny jeho možnosti'] = len(d) == 10 and {norm(x) for x in d} == {'Provoz a odborná práce'} and await pg.is_hidden('#more')
        ok['po výběru se menu zavře a fokus je na něm'] = await pg.evaluate("document.activeElement.closest('details') && document.activeElement.closest('details').id") == 'g-odd' and not await pg.evaluate("document.getElementById('g-odd').open")
        ok['menu ukazuje vybrané oddělení'] = norm(await pg.inner_text('#v-odd')) == 'Provoz a odborná práce'
        ok['nadpis podle oddělení'] = norm(await pg.inner_text('#res-title')).endswith('pro provoz a odbornou práci')
        await pick('odd', 'g-odd', 'provoz')
        ok['zrušení oddělení vrátí šestici'] = await pg.locator('.uc').count() == 6 and await pg.is_visible('#more')
        await pg.click('[data-more]'); await pg.wait_for_timeout(150)
        ok['všech 42 po kliknutí'] = await pg.locator('.uc').count() == 42 and await pg.is_hidden('#more')
        popisy = await pg.eval_on_selector_all('.uc .w', 'els => els.map(e => e.textContent)')
        ok['všech 42 popisů říká, co se naučíte'] = len(popisy) == 42 and all(norm(x).startswith('Naučíte se') for x in popisy)
        lv = await pg.eval_on_selector_all('.uc .lvl', 'els => els.map(e => e.getAttribute("aria-label"))')
        ok['seřazeno od nejsnazších'] = lv == sorted(lv, key=lambda a: 'střední' in a)
        await pick('obor', 'g-obor', 'vyroba')
        t = norm(await pg.inner_text('#res-title')); out.append('m obor: ' + t)
        ok['filtr výroba'] = t.endswith('ve výrobě a průmyslu') and await pg.get_attribute('.uc >> nth=0', 'data-id') == 'vy1'
        ok['fokus na menu oboru'] = await pg.evaluate("document.activeElement.closest('details') && document.activeElement.closest('details').id") == 'g-obor'
        await pick('odd', 'g-odd', 'obchod')
        d = await pg.eval_on_selector_all('.uc .dept', 'els => els.map(e => e.textContent)')
        ok['obor a oddělení platí zároveň'] = len(d) == 4 and {norm(x) for x in d} == {'Obchod'} and norm(await pg.inner_text('#res-title')).endswith('pro obchod ve výrobě a průmyslu')
        z = json.loads(await pg.input_value('#l-zajem'))
        ok['oddělení v poli Zajem'] = z['oddeleni'] == 'Obchod' and z['oddeleni_id'] == 'obchod' and 'Oddělení: Obchod' in norm(z['shrnuti'])
        await pick('odd', 'g-odd', 'obchod')
        await pg.click('[data-pick="vy1"]'); await pg.click('[data-pick="p3"]'); await pg.click('[data-pick="h2"]')
        await pg.wait_for_timeout(250)
        ok['přidání do výběru'] = norm(await pg.inner_text('#bar-n')) == 'Váš výběr: 3 možnosti' and await pg.locator('.uc.in').count() == 3
        ok['fokus zůstává na tlačítku karty'] = await pg.evaluate("document.activeElement.dataset.pick") == 'h2'
        ok['hlášení pro čtečku'] = norm(await pg.inner_text('#live')).startswith('Přidáno do výběru: Plán zaškolení')
        await pg.click('[data-pick="h2"]'); await pg.wait_for_timeout(100)
        ok['odebrání na kartě'] = norm(await pg.inner_text('#bar-n')) == 'Váš výběr: 2 možnosti'
        ok['na telefonu nescrolluje do strany'] = await pg.evaluate('document.documentElement.scrollWidth') == 390
        await pg.screenshot(path=f'{OUT}/m-vyber.png')
        await pg.click('[data-go]'); await pg.wait_for_timeout(900)
        ok['lišta vede k formuláři'] = await pg.evaluate("document.activeElement.id") == 'send-title'
        ok['nad formulářem lišta uhne'] = await pg.evaluate("document.getElementById('bar').classList.contains('is-hidden')")
        ok['výběr ve formuláři'] = await pg.locator('#pick li').count() == 2
        ok['do 24 hodin u formuláře'] = 'do 24 hodin' in norm(await pg.inner_text('#lead .soft.center'))
        ok['bez zaškrtávátka kurz na míru'] = await pg.locator('#l-custom').count() == 0
        await pg.click('[data-unpick="vy1"]'); await pg.wait_for_timeout(100)
        ok['odebrání ve formuláři'] = await pg.locator('#pick li').count() == 1 and await pg.locator('.uc.in').count() == 1
        ok['fokus na další položku'] = await pg.evaluate("document.activeElement.dataset.unpick") == 'p3'
        zajem = json.loads(await pg.input_value('#l-zajem'))
        ok['pole Zajem'] = norm(zajem['obor']) == 'Výroba a průmysl' and zajem['oddeleni'] is None and [x['id'] for x in zajem['vyber']] == ['p3'] and norm(zajem['shrnuti']).startswith('AI Akcelerátor na míru')
        await pg.click('#l-submit'); await pg.wait_for_timeout(100)
        ok['validace formuláře'] = norm(await pg.inner_text('#l-err')).startswith('Vyplňte prosím e-mail')
        await pg.fill('#l-email', 'jana.novakova@kvasek.cz'); await pg.fill('#l-phone', '+420 777 123 456')
        await pg.click('#l-submit'); await pg.wait_for_timeout(100)
        ok['souhlas je povinný'] = norm(await pg.inner_text('#l-err')).startswith('Bez souhlasu')
        await pg.check('#l-consent'); await pg.click('#l-submit'); await pg.wait_for_timeout(500)
        ok['potvrzení se shrnutím'] = await pg.is_visible('#lead-ok') and 'Předávka směny' in norm(await pg.inner_text('#lead-ok'))
        ok['potvrzení s 24 hodinami'] = 'Do 24 hodin se vám ozve konzultant' in norm(await pg.inner_text('#lead-ok'))
        ok['konzultant, ne obchodník'] = 'obchodník' not in norm(await pg.inner_text('body')).lower()
        ok['po odeslání bez tlačítek na kartách'] = not await pg.is_visible('[data-pick]')
        await pg.screenshot(path=f'{OUT}/m-done.png')
        ok['žádné chyby na telefonu'] = not errs
        if errs: out.append('m chyby: ' + '; '.join(errs))
        await ctx.close()

        # notebook, vloženo na web: chybné a pak úspěšné předání kontaktu
        ctx, pg, f, errs = await setup(b, 1366, 768, embed=True)
        await pg.screenshot(path=f'{OUT}/d-start.png')
        ok['ve vloženém režimu bez hlavičky'] = not await f.locator('.top').is_visible() and not await f.locator('.sales').is_visible()
        await f.locator('[data-pick="o1"]').click(); await f.locator('[data-pick="v1"]').click()
        ok['na notebooku jsou filtry otevřené'] = await f.locator('#g-obor').evaluate('e => e.open') and await f.locator('#g-odd').evaluate('e => e.open')
        top = await f.locator('.side').evaluate("e => { window.scrollTo({ top: document.getElementById('grid').getBoundingClientRect().bottom + scrollY - innerHeight + 100, behavior: 'instant' }); return e.getBoundingClientRect().top; }")
        ok['filtr zůstává vidět při posouvání'] = abs(top - 16) < 2
        # po přidání je formulář už vidět a lišta schovaná, proto napřed zpátky nahoru
        await f.locator('#vyber').evaluate("() => window.scrollTo({ top: 0, behavior: 'instant' })"); await pg.wait_for_timeout(350)
        await f.locator('[data-go]').click(); await pg.wait_for_timeout(900)
        await f.locator('#l-email').fill('petr@firma.cz'); await f.locator('#l-consent').check()
        await pg.evaluate('window.ACK_OK = false')
        await f.locator('#l-submit').click(); await pg.wait_for_timeout(400)
        ok['stránka dá webu vědět o myši kvůli menu'] = await pg.evaluate('window.PINGS') > 0
        ok['chyba při nepředání'] = 'nepodařilo odeslat' in norm(await f.locator('#l-err').inner_text()) and await f.locator('#lead').is_visible()
        await pg.evaluate('window.ACK_OK = true')
        await f.locator('#l-submit').click(); await pg.wait_for_timeout(500)
        ok['potvrzení po předání'] = await f.locator('#lead-ok').is_visible()
        leads = await pg.evaluate('window.LEADS')
        out.append('d předáno: ' + json.dumps(leads[-1]['zajem']['shrnuti'], ensure_ascii=False))
        ok['předaný kontakt a výběr'] = leads[-1]['lead']['email'] == 'petr@firma.cz' and [x['id'] for x in leads[-1]['zajem']['vyber']] == ['o1', 'v1']
        await pg.screenshot(path=f'{OUT}/d-done.png')
        ok['žádné chyby na notebooku'] = not errs
        if errs: out.append('d chyby: ' + '; '.join(errs))
        await ctx.close(); await b.close()

    print('\n'.join(out))
    bad = [name for name, v in ok.items() if not v]
    print('\n' + ('Vše v pořádku (%d kontrol)' % len(ok) if not bad else 'Selhalo: ' + ', '.join(bad)))
    sys.exit(1 if bad else 0)

asyncio.run(main())
