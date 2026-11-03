# AI mapa pro firmy

Prototyp lead magnetu pro LifeScale Business. Firma si zdarma najde, kde jí AI ušetří práci, a sestaví si z toho vlastní plán. Za kontakt si stáhne ukázku kurzu AI Akcelerátor, našeho bestselleru, a může si říct o návrh kurzu na míru. Výběr z plánu odchází s formulářem ve skrytém poli, takže obchodník ví, z čeho návrh připravit. Jako menší první krok stránka nabízí první lekci v Grizletu zdarma.

![Úvod stránky na notebooku](docs/desktop.png)

![Detail možnosti, ukázková lekce a plán na telefonu](docs/mobil.png)

## Jak to funguje

1. Návštěvník si vybere obor a oddělení a projde 42 konkrétních možností využití AI. U každé najde postup, pokyn pro AI ke zkopírování a upozornění, na co si dát pozor. Krátká animace ukazuje, jak by se postup tým naučil v Grizletu, a návštěvník si může projít ukázkovou lekci.
2. Vybrané možnosti si přidá do plánu. Zadá jen počet lidí a stránka ukáže, kolik hodin a korun měsíčně tým zhruba ušetří. Ukáže také, kolik může firma získat na školení AI Akcelerátor z výzvy Vzdělávání pro firmy.
3. Za firemní e-mail si stáhne v PDF ukázku kurzu AI Akcelerátor ve standardní podobě (12 hodin, tři moduly). Součástí je, co si lidé odnesou, jak kurz upravujeme na míru, příklady úprav u jiných firem a dotace. Jméno, telefon a firma jsou nepovinné. V příloze jsou postupy a pokyny pro AI k možnostem z jeho plánu.
4. Zaškrtnutím nebo po stažení tlačítkem si může říct o návrh kurzu na míru. Jako menší krok stránka nabízí první lekci v Grizletu zdarma, o tu si může říct i na konci ukázkové lekce.
5. Výběr z plánu odchází s formulářem ve skrytém poli `plan` jako JSON: obor, počet lidí, vybrané možnosti s oddělením, odhad úspory, dotace a zájem o návrh na míru a o první lekci zdarma.
6. Dole na stránce je skrytý „Pohled obchodníka“. Ukazuje, co by dorazilo do Pipedrivu, i obsah skrytého pole. Do ostré verze nepatří.

## Spuštění

Otevřete `index.html` v prohlížeči. Stránka nepotřebuje server ani instalaci, knihovnu jsPDF a písma si načte z CDN.

Stejná stránka běží i jako artefakt v Claudu. Tam se PDF stahuje přes schopnost `downloads`, na běžném webu klasickým stažením souboru.

## Struktura

| Soubor | Co obsahuje |
| --- | --- |
| `index.html` | sestavená stránka, tu otevírejte a nasazujte |
| `src/head.html` | titulek, odkazy na písma a všechny styly |
| `src/body.html` | obsah stránky |
| `src/data.js` | obory, oddělení, kvízové otázky, všech 42 možností a osnova kurzu `KURZ` |
| `src/app.js` | filtry, plán, výpočty, ukázková lekce, formulář a PDF |
| `src/font.js` | písmo Figtree pro PDF, podmnožina s českými znaky v base64 |
| `build.sh` | složí `src/` do `index.html` a do `dist/artifact.html` pro Claude |
| `tests/` | automatický průchod stránkou na telefonu a notebooku |
| `tools/nbsp.py` | doplní pevné mezery za jednopísmenné předložky a spojky |

## Úprava obsahu

Možnosti jsou v `src/data.js` v poli `UC`. Každá má tato pole:

| Pole | Význam |
| --- | --- |
| `id` | jedinečný kód, třeba `o1` |
| `d` | oddělení: `obchod`, `marketing`, `hr`, `finance`, `pece`, `provoz` nebo `vedeni` |
| `i` | obory, pro které je možnost určená, prázdné pole znamená všechny obory |
| `u` | úspora v hodinách týdně na člověka ve tvaru `[od, do]` |
| `l` | obtížnost: `s` snadné, `m` střední |
| `n` | nástroj: `chat`, `dok`, `excel` nebo `prepis` |
| `q` | otázka do ukázkové lekce, klíč z objektu `KVIZ` |
| `t`, `w` | název a popis |
| `s` | kroky postupu |
| `p` | pokyn pro AI, text v hranatých závorkách si návštěvník nahradí svými údaji |
| `x` | na co si dát pozor |

Osnova kurzu AI Akcelerátor pro PDF je v `src/data.js` v objektu `KURZ`: moduly, co si lidé odnesou, rozsah a forma, co se upravuje na míru a příklady úprav. Vychází z dokumentu a prezentace „AI 12 hodin“ na sdíleném Disku LifeScale Business, příklady jsou anonymizované podle návrhů kurzů pro klienty.

Po úpravě spusťte:

```
python3 tools/nbsp.py src/body.html src/data.js src/app.js
./build.sh
```

## Výpočty

- Úspora za měsíc: střed rozmezí hodin týdně u vybraných možností × 52/12 × počet lidí, zaokrouhlený na dvě platné číslice. Celé rozmezí je v PDF.
- Náklady na práci: ušetřené hodiny × 435 Kč. Sazba vychází z průměrné mzdy 51 966 Kč za 2. čtvrtletí 2026 podle ČSÚ, s odvody zaměstnavatele (× 1,338) a při 160 hodinách měsíčně.
- Podpora na školení: počet lidí × 60 hodin × 478,19 Kč na osobohodinu. Podpora se uzná účastníkovi, který absolvuje aspoň 50 hodin. Standardní AI Akcelerátor má 12 hodin, pro dotaci se proto doplní o další témata na 60 hodin a stránka to tak i říká.
- Když jsou v plánu úkoly z více oddělení, stránka upozorní, že výpočet předpokládá, že každý z lidí dělá všechny.

## Testy

Potřebujete Node.js a Python s Playwrightem.

```
pip install playwright
playwright install chromium
./tests/setup.sh
python3 tests/test_flow.py
```

Test proklikne filtry, detail, kopírování pokynu, ukázkovou lekci, plán, výpočty, formulář i stažení PDF. Snímky obrazovky a stažené PDF uloží do `tests/out/`.

## Před ostrým spuštěním

- Napojit formulář na Pipedrive B2B přes vlastní endpoint na serveru, včetně skrytého pole `plan`. API token Pipedrivu nesmí být v kódu stránky.
- Potvrdit, že anonymizované příklady úprav kurzu u klientů smíme ukazovat.
- Rozhodnout, jestli do PDF patří cena kurzu (prezentace uvádí 600 Kč za osobohodinu).
- Domluvit, kdo připraví první lekci v Grizletu zdarma a do kdy se firmě ozve.
- Ověřit s dotačním servisem čísla k výzvě Vzdělávání pro firmy.
- Odkaz u souhlasu vést na skutečné zásady zpracování osobních údajů.
- Nahradit písmo Figtree písmem Satoshi z webu.
- Ztmavit modrá tlačítka. Bílé písmo na #00B4F1 má kontrast 2,4 : 1, pro dobrou čitelnost je potřeba aspoň 4,5 : 1.
- Odstranit sekci „Pohled obchodníka“ a štítek Prototyp.

## Licence

Kód je interní materiál LifeScale. Písmo Figtree je pod licencí SIL Open Font License 1.1, plné znění je v `src/FIGTREE-OFL.txt`.
