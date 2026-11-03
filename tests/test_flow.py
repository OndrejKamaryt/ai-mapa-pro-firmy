"""Automatický průchod AI mapou na telefonu (390 px) a notebooku (1366 px).

Spuštění z kořene repozitáře:
    ./tests/setup.sh            # jednou, stáhne jsPDF pro offline běh
    python3 tests/test_flow.py  # volitelně: cesta k HTML a složka pro výstupy

Skript proklikne filtry, detail, kopírování pokynu, ukázkovou lekci, plán, výpočty,
formulář, stažení PDF i nabídku první lekce v Grizletu zdarma a uloží snímky obrazovky do tests/out/.
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
norm = lambda s: re.sub(r'[  ]', ' ', s or '')

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

async def main():
    ok, out = {}, []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()

        # telefon
        ctx, pg, errs = await setup(b, 390, 844, 2)
        await pg.screenshot(path=f'{OUT}/m-start.png')
        ok['42 karet na startu'] = await pg.locator('.uc').count() == 42
        ok['prázdný plán ukazuje výzvu'] = await pg.is_visible('#plan-empty') and await pg.is_hidden('#plan-body')
        await pg.click('[data-obor="logistika"]'); await pg.click('[data-odd="obchod"]'); await pg.wait_for_timeout(200)
        t = norm(await pg.inner_text('#res-title')); out.append('m filtr: ' + t)
        ok['filtr obchod a logistika'] = t.startswith('4 možnosti pro obchod v logistice')
        await pg.click('[data-odd="pece"]'); await pg.wait_for_timeout(150)
        ok['stránka na telefonu nescrolluje do strany'] = await pg.evaluate('document.documentElement.scrollWidth') == 390
        await pg.locator('[data-open]').first.click(); await pg.wait_for_timeout(350)
        await pg.screenshot(path=f'{OUT}/m-detail.png')
        await pg.click('[data-copy]'); await pg.wait_for_timeout(200)
        ok['kopírování pokynu'] = norm(await pg.inner_text('#d-copied')) == 'Zkopírováno'
        await pg.click('#sheet [data-lesson]'); await pg.wait_for_timeout(300)
        await pg.click('#phone [data-gz="next"]'); await pg.wait_for_timeout(150)
        await pg.click('#phone [data-gz="next"]'); await pg.wait_for_timeout(150)
        ok['kvíz čeká na odpověď'] = await pg.is_disabled('#phone .gz-btn')
        await pg.click('#phone [data-opt="0"]'); await pg.wait_for_timeout(150)
        await pg.screenshot(path=f'{OUT}/m-lesson-quiz.png')
        await pg.click('#phone [data-gz="next"]'); await pg.wait_for_timeout(150)
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
        ok['Esc zavře lekci a detail zůstane'] = await pg.is_hidden('#gz') and await pg.is_visible('#ov')
        await pg.click('#sheet [data-plan]'); await pg.wait_for_timeout(150)
        await pg.keyboard.press('Escape'); await pg.wait_for_timeout(200)
        await pg.click('[data-odd="vse"]'); await pg.wait_for_timeout(150)
        btns = pg.locator('.uc [data-plan][aria-pressed="false"]')
        await btns.nth(0).click(); await pg.wait_for_timeout(100); await btns.nth(1).click(); await pg.wait_for_timeout(200)
        out.append('m lišta: ' + norm(await pg.inner_text('#tray-t')).replace('\n', ' | '))
        ok['lišta s plánem'] = await pg.is_visible('#tray')
        await pg.screenshot(path=f'{OUT}/m-tray.png')
        await pg.click('#tray a'); await pg.wait_for_timeout(1500)
        out.append('m plán: ' + ' | '.join([norm(await pg.inner_text(s)) for s in ('#plan-title', '#save-h', '#save-k', '#sub-sum')]))
        ok['plán se 3 možnostmi'] = norm(await pg.inner_text('#plan-title')) == 'Vybrali jste 3 možnosti'
        await pg.click('[data-step="1"]'); await pg.click('[data-step="1"]'); await pg.wait_for_timeout(100)
        sub12 = norm(await pg.inner_text('#sub-sum')); out.append('m dotace pro 12: ' + sub12)
        ok['stepper a dotace pro 12 lidí'] = '344 297 Kč' in sub12 and await pg.input_value('#c-n') == '12'
        await pg.screenshot(path=f'{OUT}/m-plan-full.png', full_page=True)
        await pg.click('#l-submit'); await pg.wait_for_timeout(100)
        ok['validace formuláře'] = norm(await pg.inner_text('#l-err')) == 'Napište prosím svůj e-mail.'
        await pg.fill('#l-name', 'Jana Nováková'); await pg.fill('#l-email', 'jana.novakova@kvasek.cz'); await pg.fill('#l-firm', 'Pekárna Kvásek s.r.o.')
        await pg.fill('#l-phone', '+420 777 123 456')
        await pg.check('#l-consent')
        async with pg.expect_download() as dl_info:
            await pg.click('#l-submit')
        dl = await dl_info.value
        await dl.save_as(f'{OUT}/plan.pdf')
        await pg.wait_for_timeout(300)
        out.append('m stažení: ' + dl.suggested_filename)
        ok['PDF se stáhlo'] = dl.suggested_filename.startswith('AI-Akcelerator-') and os.path.getsize(f'{OUT}/plan.pdf') > 20000
        ok['po stažení další krok'] = await pg.is_visible('#lead-ok .next') and await pg.is_hidden('#lead')
        plan = json.loads(await pg.input_value('#l-plan'))
        ok['skryté pole s plánem'] = len(plan['moznosti']) == 3 and plan['lide'] == 12
        await pg.click('[data-custom-yes]'); await pg.wait_for_timeout(150)
        ok['zájem o návrh na míru po stažení'] = await pg.is_visible('#lead-ok .next .noted')
        await pg.click('[data-pilot-yes]'); await pg.wait_for_timeout(150)
        ok['zájem o první lekci zdarma po stažení'] = await pg.is_visible('#lead-ok .noted')
        await pg.locator('#lead-ok').scroll_into_view_if_needed(); await pg.wait_for_timeout(300)
        await pg.screenshot(path=f'{OUT}/m-done.png')
        await pg.click('.sales summary'); await pg.wait_for_timeout(100)
        sales = norm(await pg.inner_text('#sales')); out.append('m obchodník: ' + sales.replace('\n', ' | ')[:320])
        ok['obchodník vidí zájem o první lekci'] = 'chce, připravit první lekci' in sales
        ok['obchodník vidí telefon'] = '+420 777 123 456' in sales
        ok['obchodník vidí návrh na míru'] = 'chce, připravit podle plánu' in sales and 'První věta' not in sales
        ok['žádné chyby na telefonu'] = not errs
        if errs: out.append('m chyby: ' + '; '.join(errs))
        await ctx.close()

        # notebook
        ctx, pg, errs = await setup(b, 1366, 768)
        await pg.screenshot(path=f'{OUT}/d-start.png')
        await pg.click('[data-obor="vyroba"]'); await pg.wait_for_timeout(150)
        await pg.locator('[data-open="vy1"]').click(); await pg.wait_for_timeout(350)
        await pg.screenshot(path=f'{OUT}/d-detail.png')
        sc1 = await pg.get_attribute('#sheet .ga', 'data-scene'); await pg.wait_for_timeout(3500)
        sc2 = await pg.get_attribute('#sheet .ga', 'data-scene')
        ok['animace Grizletu v detailu běží'] = sc1 == '1' and sc2 == '2'
        inside = []
        for i in range(8):
            await pg.keyboard.press('Tab'); inside.append(await pg.evaluate("!!document.activeElement.closest('#ov')"))
        ok['fokus zůstává v detailu'] = all(inside)
        await pg.click('#sheet [data-lesson]'); await pg.wait_for_timeout(300)
        await pg.click('#phone [data-gz="next"]'); await pg.wait_for_timeout(120)
        await pg.click('#phone [data-gz="next"]'); await pg.wait_for_timeout(120)
        await pg.click('#phone [data-opt="1"]'); await pg.wait_for_timeout(120)
        await pg.click('#phone [data-gz="next"]'); await pg.wait_for_timeout(120)
        await pg.screenshot(path=f'{OUT}/d-lesson.png')
        await pg.click('#phone [data-gz="pilot"]'); await pg.wait_for_timeout(1200)
        ok['lekce zdarma z ukázky přidá možnost do plánu'] = (await pg.locator('#plist li').count() == 1 and await pg.is_visible('#pilot-chip')
                                                     and await pg.is_hidden('#ov') and await pg.is_hidden('#gz'))
        await pg.screenshot(path=f'{OUT}/d-plan.png')
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
