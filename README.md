# AI mapa pro firmy

Prototyp lead magnetu pro LifeScale Business. Firma si zdarma najde, kde jí AI ušetří práci, a sestaví si z toho vlastní plán. Za kontakt si plán stáhne v PDF. Plán pak vede ke školení AI Akcelerátor a k pilotu Grizletu jako malému prvnímu kroku.

![Úvod stránky na notebooku](docs/desktop.png)

![Detail možnosti, ukázková lekce a plán na telefonu](docs/mobil.png)

## Jak to funguje

1. Návštěvník si vybere obor a oddělení a projde 42 konkrétních možností využití AI. U každé najde postup, pokyn pro AI ke zkopírování, upozornění, na co si dát pozor, a ukázkovou lekci ve stylu Grizletu.
2. Vybrané možnosti si přidá do plánu. Stránka spočítá odhad ušetřených hodin a nákladů na práci podle počtu lidí a hodinové sazby. Ukáže také výši podpory z výzvy Vzdělávání pro firmy.
3. Za jméno, firemní e-mail, název firmy a počet zaměstnanců si stáhne plán v PDF. Volitelně zaškrtne zájem o pilot Grizletu.
4. Dole na stránce je skrytý „Pohled obchodníka“. Ukazuje, co by dorazilo do Pipedrivu, včetně první věty do telefonu. Do ostré verze nepatří.

## Spuštění

Otevřete `index.html` v prohlížeči. Stránka nepotřebuje server ani instalaci, knihovnu jsPDF a písma si načte z CDN.

Stejná stránka běží i jako artefakt v Claudu. Tam se PDF stahuje přes schopnost `downloads`, na běžném webu klasickým stažením souboru.

## Struktura

| Soubor | Co obsahuje |
| --- | --- |
| `index.html` | sestavená stránka, tu otevírejte a nasazujte |
| `src/head.html` | titulek, odkazy na písma a všechny styly |
| `src/body.html` | obsah stránky |
| `src/data.js` | obory, oddělení, kvízové otázky a všech 42 možností |
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

Po úpravě spusťte:

```
python3 tools/nbsp.py src/body.html src/data.js src/app.js
./build.sh
```

## Výpočty

- Úspora za měsíc: součet hodin týdně u vybraných možností × 52/12 × počet lidí.
- Náklady na práci: ušetřené hodiny × hodinová sazba. Výchozích 435 Kč vychází z průměrné mzdy 51 966 Kč za 2. čtvrtletí 2026 podle ČSÚ, s odvody zaměstnavatele (× 1,338) a při 160 hodinách měsíčně.
- Podpora na školení: počet lidí × 60 hodin × 478,19 Kč na osobohodinu. Podpora se uzná účastníkovi, který absolvuje aspoň 50 hodin, 60 hodin je rezerva.
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

- Napojit formulář na Pipedrive B2B přes vlastní endpoint na serveru. API token Pipedrivu nesmí být v kódu stránky.
- Doplnit cenu pilotu Grizletu.
- Ověřit s dotačním servisem čísla k výzvě Vzdělávání pro firmy.
- Odkaz u souhlasu vést na skutečné zásady zpracování osobních údajů.
- Nahradit písmo Figtree písmem Satoshi z webu.
- Ztmavit modrá tlačítka. Bílé písmo na #00B4F1 má kontrast 2,4 : 1, pro dobrou čitelnost je potřeba aspoň 4,5 : 1.
- Odstranit sekci „Pohled obchodníka“ a štítek Prototyp.

## Licence

Kód je interní materiál LifeScale. Písmo Figtree je pod licencí SIL Open Font License 1.1, plné znění je v `src/FIGTREE-OFL.txt`.
