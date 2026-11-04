"""Automatický průchod AI mapou na telefonu (390 px) a notebooku (1366 px).

Spuštění z kořene repozitáře:
    ./tests/setup.sh            # jednou, stáhne jsPDF pro offline běh
    python3 tests/test_flow.py  # volitelně: cesta k HTML a složka pro výstupy

Skript proklikne filtry, řazení podle obtížnosti, detail, kopírování pokynu, přechod ke kurzu,
formulář a stažení PDF a uloží snímky obrazovky do tests/out/.
"""
import asyncio, sys, re, os, json
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
P = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(HERE, '..', 'index.html')
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, 'out')
os.makedirs(OUT, exist_ok=True)
JSPDF = os.path.join(HERE, 'vendor', 'jspdf', 'dist', 'jspdf.umd.min.js')
if not os.path.exists(JSPDF):
    sys.exit('Chybí jsPDF, spusťte nejdřív ./tests/setup.sh')
norm = lambda s: re.sub(r'[  ]', ' ', s or '')

async def setup(b, w, h, dpr=1):
    ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=dpr, accept_downloads=True)
    pg = await ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    async def cdn(route): await route.fulfill(path=JSPDF, content_type='application/javascript')
    await pg.route('https://cdnjs.cloudflare.com/**', cdn)
    await pg.route('https://fonts.googleapis.com/**', lambda r: r.abort())
    await pg.goto('file://' + P); await pg.wait_for_timeout(500)
    return ctx, pg, errs

async def levels(pg):
    return await pg.eval_on_selector_all('.uc .lvl', 'els => els.map(e => e.getAttribute("aria-label"))')

async def main():
    ok, out = {}, []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()

        # telefon
        ctx, pg, errs = await setup(b, 390, 844, 2)
        await pg.screenshot(path=f'{OUT}/m-start.png')
        ok['42 karet na startu'] = await pg.locator('.uc').count() == 42
        lv = await levels(pg)
        ok['seřazeno od nejsnazších'] = lv == sorted(lv, key=lambda a: 'střední' in a)
        ok['bez hledání, plánu a Grizletu'] = (await pg.locator('#f-q, #plan, #tray, #gz').count()) == 0
        await pg.click('[data-obor="logistika"]'); await pg.click('[data-odd="obchod"]'); await pg.wait_for_timeout(200)
        t = norm(await pg.inner_text('#res-title')); out.append('m filtr: ' + t)
        ok['filtr obchod a logistika'] = t.startswith('4 možnosti pro obchod v logistice')
        await pg.click('[data-odd="vse"]'); await pg.click('[data-lvl="m"]'); await pg.wait_for_timeout(150)
        lv = await levels(pg); t = norm(await pg.inner_text('#res-title')); out.append('m obtížnost: ' + t)
        ok['filtr obtížnosti'] = lv and all(a == 'Obtížnost: střední' for a in lv) and ' střední' in t
        await pg.click('[data-lvl="vse"]'); await pg.click('[data-odd="pece"]'); await pg.wait_for_timeout(150)
        ok['stránka na telefonu nescrolluje do strany'] = await pg.evaluate('document.documentElement.scrollWidth') == 390
        await pg.locator('[data-open]').first.click(); await pg.wait_for_timeout(350)
        await pg.screenshot(path=f'{OUT}/m-detail.png')
        await pg.click('[data-copy]'); await pg.wait_for_timeout(200)
        ok['kopírování pokynu'] = norm(await pg.inner_text('#d-copied')) == 'Zkopírováno'
        zajem = json.loads(await pg.input_value('#l-zajem'))
        ok['skryté pole s oborem a prohlédnutou možností'] = zajem['obor'] == 'Logistika' and len(zajem['prohlednute']) == 1
        await pg.click('#sheet [data-kurz]'); await pg.wait_for_timeout(1200)
        ok['z detailu ke kurzu'] = await pg.is_hidden('#ov') and await pg.evaluate("document.activeElement.id") == 'l-email'
        await pg.screenshot(path=f'{OUT}/m-kurz-full.png', full_page=True)
        await pg.click('#l-submit'); await pg.wait_for_timeout(100)
        ok['validace formuláře'] = norm(await pg.inner_text('#l-err')) == 'Napište prosím svůj e-mail.'
        await pg.fill('#l-name', 'Jana Nováková'); await pg.fill('#l-email', 'jana.novakova@kvasek.cz'); await pg.fill('#l-firm', 'Pekárna Kvásek s.r.o.')
        await pg.fill('#l-phone', '+420 777 123 456')
        await pg.check('#l-consent')
        async with pg.expect_download() as dl_info:
            await pg.click('#l-submit')
        dl = await dl_info.value
        await dl.save_as(f'{OUT}/ukazka.pdf')
        await pg.wait_for_timeout(300)
        out.append('m stažení: ' + dl.suggested_filename)
        ok['PDF se stáhlo'] = dl.suggested_filename.startswith('AI-Akcelerator-') and os.path.getsize(f'{OUT}/ukazka.pdf') > 20000
        ok['po stažení další krok'] = await pg.is_visible('#lead-ok .next') and await pg.is_hidden('#lead')
        await pg.click('[data-custom-yes]'); await pg.wait_for_timeout(150)
        ok['zájem o návrh na míru po stažení'] = await pg.is_visible('#lead-ok .next .noted')
        ok['návrh na míru ve skrytém poli'] = json.loads(await pg.input_value('#l-zajem'))['navrh_na_miru'] is True
        await pg.locator('#lead-ok').scroll_into_view_if_needed(); await pg.wait_for_timeout(300)
        await pg.screenshot(path=f'{OUT}/m-done.png')
        await pg.click('.sales summary'); await pg.wait_for_timeout(100)
        sales = norm(await pg.inner_text('#sales')); out.append('m obchodník: ' + sales.replace('\n', ' | ')[:320])
        ok['obchodník vidí telefon'] = '+420 777 123 456' in sales
        ok['obchodník vidí návrh na míru'] = 'chce, připravit podle oboru' in sales
        ok['žádné chyby na telefonu'] = not errs
        if errs: out.append('m chyby: ' + '; '.join(errs))
        await ctx.close()

        # notebook
        ctx, pg, errs = await setup(b, 1366, 768)
        await pg.screenshot(path=f'{OUT}/d-start.png')
        await pg.click('[data-obor="vyroba"]'); await pg.wait_for_timeout(150)
        await pg.locator('[data-open="vy1"]').click(); await pg.wait_for_timeout(350)
        await pg.screenshot(path=f'{OUT}/d-detail.png')
        inside = []
        for i in range(8):
            await pg.keyboard.press('Tab'); inside.append(await pg.evaluate("!!document.activeElement.closest('#ov')"))
        ok['fokus zůstává v detailu'] = all(inside)
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
        ok['Esc zavře detail'] = await pg.is_hidden('#ov')
        await pg.click('.top-cta'); await pg.wait_for_timeout(1200)
        await pg.screenshot(path=f'{OUT}/d-kurz.png')
        await pg.fill('#l-email', 'petr@firma.cz'); await pg.check('#l-consent')
        async with pg.expect_download() as dl2:
            await pg.click('#l-submit')
        ok['stačí jen e-mail'] = (await dl2.value).suggested_filename.startswith('AI-Akcelerator-')
        ok['žádné chyby na notebooku'] = not errs
        if errs: out.append('d chyby: ' + '; '.join(errs))
        await ctx.close(); await b.close()

    print('\n'.join(out))
    bad = [name for name, v in ok.items() if not v]
    print('\n' + ('Vše v pořádku (%d kontrol)' % len(ok) if not bad else 'Selhalo: ' + ', '.join(bad)))
    sys.exit(1 if bad else 0)

asyncio.run(main())
