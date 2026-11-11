# Složte si vlastní AI Akcelerátor

Lead magnet pro LifeScale Business, dřív „AI mapa pro firmy“. Cílí hlavně na výrobní firmy s 50 až 250 zaměstnanci, které si neumí představit, k čemu by u nich AI byla. Návštěvník si podle oboru vybere, s čím by AI pomohla jeho lidem, a pošle výběr. Konzultant LifeScale mu z něj připraví návrh kurzu AI Akcelerátor na míru. Koncept je z porady Ondřeje Kamarýta a Martina Ptáčka 4. 11. 2026.

![Úvod stránky na notebooku](docs/desktop.png)

![Sekce s konzultací zdarma a formulářem na notebooku](docs/formular.png)

![Úvod, výběr pro výrobu, formulář a potvrzení na telefonu](docs/mobil.png)

## Jak to funguje

1. Úvod s fotkou: „Složte si AI kurz podle toho, co váš tým opravdu řeší“. Název AI Akcelerátor na stránce záměrně není, návštěvník by mu bez vysvětlení nerozuměl, zůstává jen ve shrnutí pro konzultanta. Dál podnadpis s tím, co návštěvník dostane, tlačítko „Složte si kurz na míru“ a ikony „Lze čerpat dotaci Vzdělávání pro firmy“ a „Konzultace zdarma“. Pod úvodem je šedá řada pěti log firem (pole `LOGA` v `src/data.js`).
2. Pracovní část začíná jednou větou, jak se stránkou pracovat. Vlevo je filtr s obory (výroba je první) a odděleními, který při posouvání zůstává vidět, vpravo karty. Na telefonu jsou to dvě rozbalovací menu nad kartami. Bez vybraného oboru a oddělení stránka ukáže šest snadných možností, každou z jiného oddělení (pole `START` v `src/app.js`), a tlačítko „Zobrazit všech 90 možností“. Po výběru oboru nebo oddělení ukáže všechny možnosti, které k němu patří, seřazené od nejsnazších. Vybrat jde jen jedno, obor, nebo oddělení. S vybraným oborem jdou napřed možnosti přímo pro něj (ke každému oboru jich je šest), pak obecné možnosti, které se oboru hodí nejvíc a dostanou jeho štítek, třeba „Pro výrobu“, a nakonec ostatní obecné. Obtížnost ukazuje slovo a ikona se třemi sloupečky: snadné mají vyplněný jeden, střední dva.
3. Každá karta říká, co možnost přinese a kolik času týdně ušetří, a má jediné tlačítko: „Přidat do výběru“, případně „Odebrat z výběru“. Detail s postupem a pokynem pro AI už stránka nemá.
4. U spodního okraje je pořád vidět lišta s počtem vybraných možností a tlačítkem „Poslat výběr“, které vede k formuláři. Když je formulář na obrazovce nebo se do něj píše, lišta uhne.
5. Závěr stránky je tmavá sekce „Pošlete nám výběr a připravíme vám návrh kurzu“: tři krátké body, co se návštěvník na konzultaci dozví, jedna reference a formulář s výběrem, ze kterého jde odebírat. Povinný je jen e-mail a souhlas se zpracováním údajů, jméno, telefon a firma jsou nepovinné. Odeslat jde i prázdný výběr, konzultant ho pak projde s návštěvníkem.
6. Po odeslání stránka poděkuje, ukáže shrnutí výběru a malý odkaz na rezervaci konzultace v Calendly. Potvrzení se ukáže až ve chvíli, kdy web LifeScale kontakt převezme. Když se to nepovede, formulář zůstane vyplněný a stránka nabídne odeslat znovu.
7. Dole je skrytý „Pohled konzultanta“. Ukazuje kontakt, shrnutí pro Slack a celé pole Zajem. Na webu LifeScale se nezobrazuje.

## Spuštění

Otevřete `index.html` v prohlížeči. Stránka nepotřebuje server ani instalaci, písma si načte z Google Fonts a fotku v úvodu z LifeScale CMS. Samostatně otevřená stránka kontakt nikam neposílá, potvrzení je jen náhled pro tým.

## Struktura

| Soubor | Co obsahuje |
| --- | --- |
| `index.html` | sestavená stránka, tu otevírejte a nasazujte |
| `src/head.html` | titulek, popis, odkazy na písma a všechny styly |
| `src/body.html` | obsah stránky |
| `src/data.js` | obory, oddělení, loga a všech 90 možností |
| `src/app.js` | filtry a řazení, výběr, lišta, formulář a předání kontaktu webu |
| `build.sh` | složí `src/` do `index.html` a do `dist/artifact.html` pro Claude |
| `cms/html-blok.html` | HTML blok pro stránku v LifeScale CMS, viz níže |
| `podklady/postupy.json` | postupy, pokyny pro AI a upozornění ke všem možnostem jako podklad pro návrh kurzu. Na stránce nejsou a do veřejného repozitáře nejdou, soubor je jen v pracovní složce. |
| `podklady/kandidati-v-zaloze.json` | zásobník možností, které se na stránku nedostaly, i s důvodem. Také jen v pracovní složce. |
| `tests/` | automatický průchod stránkou na telefonu a notebooku |
| `tools/nbsp.py` | doplní pevné mezery za jednopísmenné předložky a spojky |

## Vložení na web LifeScale

Na webu běží stránka z LifeScale CMS (Directus) s jedním HTML blokem z `cms/html-blok.html`. Blok zobrazí stránku z GitHub Pages přes celou obrazovku. Posouvá se obsah iframu, ne stránka webu, a tak si blok se stránkou posílají zprávy, aby se hlavička a menu webu chovaly jako na ostatních stránkách.

- Stránka pozná, že je vložená, a schová vlastní hlavičku a pohled konzultanta.
- Hlavička webu odjíždí s obsahem stejně jako na běžných stránkách webu a vrátí se, až je obsah zase úplně nahoře. Stránka hlásí svůj posun zprávou `ls-ai-mapa-scroll` (pole `y` a `top`) a blok podle něj hlavičku posune. Hlavička přitom leží přes horní okraj iframu. Blok proto napřed pošle její výšku zprávou `ls-ai-mapa-host` a stránka si nahoře nechá stejně vysoké místo. Dokud ho v poli `top` nepotvrdí, zůstává hlavička pořád nahoře a iframe pod ní. Nová stránka tak funguje i se starším blokem a nový blok se starší stránkou.
- Rozbalené menu webu se zavře, když myš přejede nad iframe, když se obsah posune nebo když návštěvník v iframu stiskne Esc. Stránka to hlásí zprávou `ls-ai-mapa-pointer` (při Esc s polem `key`) a blok pošle menu událost `pointerout`, na kterou menu slyší. Zavírá se pak stejně rychle jako jinde na webu.
- Kolečko myši nebo tah prstem nad hlavičkou by posunuly stránku webu místo obsahu. Blok je proto předá stránce zprávou `ls-ai-mapa-wheel` a ta se posune o `dy`.
- Patička webu odjede hned, jak se posunete nahoru, stejně jako na běžných stránkách. Blok proto hlásí stránce, o kolik je stránka webu odrolovaná (`ls-ai-mapa-page`, pole `y`). Dokud je odrolovaná, stránka kolečko nebo tah prstem nahoru nepřijme a pošle je zpátky zprávou `ls-ai-mapa-page-scroll` (pole `dy`, záporné). Blok pak posune celou stránku webu a obsah se vrací až potom. Se starším blokem v CMS se nic nemění.
- Po odeslání formuláře pošle kontakt a pole `zajem` stránce zprávou `postMessage` typu `ls-ai-mapa-lead`, a to jen na `https://business.lifescale.cz`. Stránka webu přijímá zprávy jen z `https://ondrejkamaryt.github.io`.
- Stránka webu kontakt odešle na `/api/form-submit` stejně jako formuláře webu, se scénářem `general_inquiry` a poli Vaše jméno, E-mail, Telefon, Firma, Zajem a GDPR. Odtud jde do `form_submissions` a webhookem do Make, který lead ohlásí v kanálu #lifescale-leads. Výsledek vrátí zprávou `ls-ai-mapa-lead-ack` a podle ní stránka ukáže potvrzení, nebo chybu.

Blok v CMS se nemění sám. Po každé úpravě `cms/html-blok.html` ho někdo musí do CMS přenést a `__PAGE_ID__` nahradit číslem stránky. Naposledy se přenášel 10. 11. 2026 a odpovídá tomuto souboru.

Co se od běžné stránky webu liší dál, protože se posouvá obsah iframu:

- Hlavička se vrací až úplně nahoře. Stejně se dnes chovají ostatní stránky webu: hlavička je `sticky` uvnitř obalu s `overflow-x-hidden`, a tak s obsahem jen odjede. Až to správce webu opraví a hlavička se začne vracet při posunu nahoru, je potřeba stejné chování doplnit do bloku.
- Klávesy pro posun (mezerník, PageDown, šipky) posouvají obsah až po kliknutí do něj. Hned po načtení posunou stránku webu k patičce.
- Na telefonu se při čtení neschová adresní řádek prohlížeče. Schovává se jen při posunu celé stránky.

### Pole Zajem

JSON s obsahem výběru. Jako první je hotové textové shrnutí, které stačí v Make vložit do zprávy ve Slacku:

```json
{
  "shrnuti": "AI Akcelerátor na míru\nObor: Výroba a průmysl\nOddělení: Provoz a odborná práce\nVýběr (2):\n• Návod ke stroji v jazyce operátora (Provoz a odborná práce)\n• Předávka směny bez zmatků (Provoz a odborná práce)",
  "v": 2,
  "zdroj": "AI mapa: AI Akcelerátor na míru",
  "obor": "Výroba a průmysl",
  "obor_id": "vyroba",
  "oddeleni": "Provoz a odborná práce",
  "oddeleni_id": "provoz",
  "pocet": 2,
  "vyber": [
    { "id": "vy1", "nazev": "Návod ke stroji v jazyce operátora", "oddeleni": "Provoz a odborná práce" },
    { "id": "p3", "nazev": "Předávka směny bez zmatků", "oddeleni": "Provoz a odborná práce" }
  ]
}
```

Bez vybraného oboru je `obor` i `obor_id` `null` a ve shrnutí „Obor: nevybrán“. Bez vybraného oddělení je `oddeleni` i `oddeleni_id` `null` a řádek „Oddělení“ ve shrnutí chybí. Prázdný výběr má `pocet` 0 a ve shrnutí „Výběr: nic nevybráno, zeptat se při hovoru“. Postup a pokyn ke každé možnosti najde konzultant podle `id` v `podklady/postupy.json`.

## Úprava obsahu

Možnosti jsou v `src/data.js` v poli `UC`. Každá má tato pole:

| Pole | Význam |
| --- | --- |
| `id` | jedinečný kód, třeba `o1` |
| `d` | oddělení: `obchod`, `marketing`, `hr`, `finance`, `pece`, `provoz` nebo `vedeni` |
| `i` | obory, pro které je možnost určená, prázdné pole znamená všechny obory |
| `r` | nepovinné, jen u obecných možností: obory, kterým se možnost hodí nejvíc. Po výběru takového oboru jde hned za jeho vlastní možnosti a dostane jeho štítek. Dávejte ho jen tam, kde text možnosti pro obor sedí doslova |
| `u` | úspora v hodinách týdně na člověka ve tvaru `[od, do]` |
| `j` | nepovinné, jednorázová úspora jako text, třeba `4 až 8 h po každé akci`. Dávejte ho u nárazových úkolů, kde týdenní průměr nesedí. Karta pak místo údaje z `u` ukáže „Ušetří“ a tento text, `u` ale zůstává povinné |
| `l` | obtížnost: `s` snadné, `m` střední |
| `t`, `w` | název a co se člověk naučí, popis začíná „Naučíte se“ |

Pořadí oborů určuje pole `OBORY`, šest úvodních možností pole `START` v `src/app.js`. Po úpravě spusťte:

```
python3 tools/nbsp.py src/body.html src/data.js src/app.js
./build.sh
```

## Testy

Potřebujete Python s Playwrightem. Prohlížeč stačí nainstalovaný Chrome.

```
pip install playwright
PW_CHANNEL=chrome python3 tests/test_flow.py
```

Test proklikne obory, oddělení, rozbalení všech možností, řazení podle obtížnosti, řazení a štítky podle oboru, přidání a odebrání na kartě i ve formuláři, lištu, kontrolu formuláře a odeslání. Ve vloženém režimu podstrčí potvrzení od webu LifeScale jednou chybné a jednou úspěšné a zkouší i zprávy pro hlavičku a menu webu: hlášení posunu, místo na hlavičku, kolečko nad hlavičkou a Esc. Snímky obrazovky uloží do `tests/out/`.

## Před ostrým spuštěním

- Doplnit do scénáře v Make pole Zajem: přidat Parse JSON a do zprávy v #lifescale-leads vložit `shrnuti`, aby konzultant výběr viděl ve Slacku i v Pipedrivu. Když JSON nepůjde načíst, vložit text pole celý.
- Přesunout stránku z osobního GitHubu na firemní hosting a změnit adresu v `cms/html-blok.html` i v `PARENTS` v `src/app.js`.
- Doplnit stránce v CMS titulek a popis pro vyhledávače.
- Potvrdit tvrzení na stránce: „Nezávazné“ a „Konzultant se vám ozve do 24 hodin“, i o víkendech a svátcích.
- Upřesnit dotaci: výzva uznává podporu účastníkovi, který absolvuje aspoň 50 hodin, a standardní AI Akcelerátor má 12 hodin. Stránka teď říká „Lze čerpat dotaci“ bez této podmínky, konzultant ji musí vysvětlit.
- Rozhodnout, jestli loga zůstanou bez upřesnění: jsou z bloku „Firmy, které s námi spolupracují“ na webu, ne všechny musely absolvovat právě AI kurz. Reference Karla Kunzmanna je zkrácená citace z webu.
- Nahradit písmo Figtree písmem Satoshi z webu.
- Ztmavit modrá tlačítka. Bílé písmo na #00B4F1 má kontrast 2,4 : 1, pro dobrou čitelnost je potřeba aspoň 4,5 : 1. Stránka zatím drží barvy webu LifeScale.
- Odstranit pohled konzultanta a štítek Prototyp.

## Licence

Kód je interní materiál LifeScale.
