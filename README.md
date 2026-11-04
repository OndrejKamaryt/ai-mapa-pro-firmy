# AI mapa pro firmy

Prototyp lead magnetu pro LifeScale Business. Cílí hlavně na výrobní firmy s 50 až 250 zaměstnanci, které si neumí představit, k čemu by u nich AI byla. Firma si zdarma najde, kde jí AI ušetří práci, a vyzkouší si hotové postupy. Stránka ji pak vede ke kurzu AI Akcelerátor, našemu bestselleru: za kontakt si stáhne jeho ukázku a může si říct o návrh kurzu na míru. Obor, oddělení a prohlédnuté možnosti odcházejí s formulářem ve skrytém poli, takže obchodník ví, z čeho návrh připravit.

![Úvod stránky na notebooku](docs/desktop.png)

![Možnosti seřazené podle obtížnosti a sekce kurzu na telefonu](docs/mobil.png)

## Jak to funguje

1. Návštěvník si vybere obor, oddělení a případně obtížnost a projde 42 konkrétních možností využití AI, seřazených od nejsnazších. Obtížnost ukazuje ikona se třemi sloupečky: snadné mají vyplněný jeden, střední dva.
2. U každé možnosti najde postup, pokyn pro AI ke zkopírování, odhad ušetřeného času a upozornění, na co si dát pozor. Z detailu vede tlačítko rovnou ke kurzu.
3. Sekce o kurzu AI Akcelerátor ukazuje tři moduly, přepočet „160 ušetřených hodin měsíčně je jeden člověk navíc“ a dotaci z výzvy Vzdělávání pro firmy na účastníka.
4. Za firemní e-mail si stáhne v PDF ukázku kurzu ve standardní podobě (12 hodin, tři moduly). Součástí je, co si lidé odnesou, jak kurz upravujeme na míru, příklady úprav u jiných firem a dotace. Jméno, telefon a firma jsou nepovinné.
5. Zaškrtnutím nebo po stažení tlačítkem si může říct o návrh kurzu na míru. S formulářem odchází skryté pole `zajem` jako JSON: obor, oddělení, prohlédnuté možnosti a zájem o návrh na míru.
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
| `src/data.js` | obory, oddělení, všech 42 možností a osnova kurzu `KURZ` |
| `src/app.js` | filtry a řazení, detail možnosti, sekce kurzu, formulář a PDF |
| `src/font.js` | písmo Figtree pro PDF, podmnožina s českými znaky v base64 |
| `build.sh` | složí `src/` do `index.html` a do `dist/artifact.html` pro Claude |
| `cms/html-blok.html` | HTML blok pro stránku v LifeScale CMS, viz níže |
| `tests/` | automatický průchod stránkou na telefonu a notebooku |
| `tools/nbsp.py` | doplní pevné mezery za jednopísmenné předložky a spojky |

## Vložení na web LifeScale

Na webu běží stránka z LifeScale CMS (Directus) s jedním HTML blokem z `cms/html-blok.html`. Blok zobrazí AI mapu z GitHub Pages přes celou obrazovku pod hlavičkou webu.

- Lead magnet pozná, že je vložený, a schová vlastní hlavičku a pohled obchodníka.
- Po odeslání formuláře pošle kontakt a pole `zajem` stránce zprávou `postMessage`, a to jen na `https://business.lifescale.cz`. Stránka přijímá zprávy jen z `https://ondrejkamaryt.github.io`.
- Stránka kontakt odešle na `/api/form-submit` stejně jako formuláře webu, se scénářem `general_inquiry` a poli Vaše jméno, E-mail, Telefon, Firma, Zajem a GDPR. Odtud jde do `form_submissions` a webhookem do Make.
- Když zájemce po stažení klikne na „Chci návrh na míru“, odejde druhé odeslání s `navrh_na_miru: true`.

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

- Dotace na účastníka: 60 hodin × 478,19 Kč na osobohodinu, tedy 28 691 Kč. Podpora se uzná účastníkovi, který absolvuje aspoň 50 hodin. Standardní AI Akcelerátor má 12 hodin, pro dotaci se proto doplní o další témata na 60 hodin a stránka to tak i říká.
- Jeden člověk navíc odpovídá 160 hodinám práce měsíčně.

## Testy

Potřebujete Node.js a Python s Playwrightem.

```
pip install playwright
playwright install chromium
./tests/setup.sh
python3 tests/test_flow.py
```

Test proklikne filtry, řazení podle obtížnosti, detail, kopírování pokynu, přechod ke kurzu, formulář i stažení PDF. Snímky obrazovky a stažené PDF uloží do `tests/out/`.

## Před ostrým spuštěním

- Ověřit, že scénář v Make založí lead z AI mapy v Pipedrivu B2B i s polem Zajem, a rozhodnout, jestli druhé odeslání kvůli návrhu na míru nemá jen doplnit existující lead.
- Přesunout lead magnet z osobního GitHubu na firemní hosting a změnit adresu v `cms/html-blok.html` i v `PARENTS` v `src/app.js`.
- Potvrdit, že anonymizované příklady úprav kurzu u klientů smíme ukazovat.
- Rozhodnout, jestli do PDF patří cena kurzu (prezentace uvádí 600 Kč za osobohodinu).
- Ověřit s dotačním servisem čísla k výzvě Vzdělávání pro firmy.
- Odkaz u souhlasu vést na skutečné zásady zpracování osobních údajů.
- Nahradit písmo Figtree písmem Satoshi z webu.
- Ztmavit modrá tlačítka. Bílé písmo na #00B4F1 má kontrast 2,4 : 1, pro dobrou čitelnost je potřeba aspoň 4,5 : 1.
- Odstranit sekci „Pohled obchodníka“ a štítek Prototyp.

## Licence

Kód je interní materiál LifeScale. Písmo Figtree je pod licencí SIL Open Font License 1.1, plné znění je v `src/FIGTREE-OFL.txt`.
