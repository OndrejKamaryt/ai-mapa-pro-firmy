/* ---------- data: obory, oddělení a možnosti využití AI ---------- */
// pořadí oborů: výroba jako hlavní cílová skupina první
const OBORY = [
  ['vyroba', 'Výroba a průmysl'], ['auto', 'Automobilový průmysl'], ['logistika', 'Logistika'],
  ['stavebnictvi', 'Stavebnictví'], ['zdravotnictvi', 'Zdravotnictví'], ['fin', 'Finanční služby'],
  ['pravo', 'Advokátní kanceláře'], ['jine', 'Jiný obor']
];
const ODDELENI = [
  ['vse', 'Všechna oddělení'], ['obchod', 'Obchod'], ['marketing', 'Marketing'],
  ['hr', 'HR a nábor'], ['finance', 'Finance a účetnictví'],
  ['pece', 'Zákaznická péče'], ['provoz', 'Provoz a odborná práce'], ['vedeni', 'Vedení firmy']
];
const OBOR_LABEL = Object.fromEntries(OBORY);
const ODD_LABEL = Object.fromEntries(ODDELENI);
const OBOR_PRO = { stavebnictvi:'Pro stavebnictví', zdravotnictvi:'Pro zdravotnictví', logistika:'Pro logistiku', fin:'Pro finanční služby', pravo:'Pro advokátní kanceláře', vyroba:'Pro výrobu', auto:'Pro automotive' };
const LEVEL = { s:'Snadné', m:'Střední' };

/* loga z bloku „Firmy, které s námi spolupracují“ na webu LifeScale: název, soubor v CMS, výška v px */
const LOGA = [
  ['Toyota Financial Services', '8802cfca-e538-4205-bfe2-1b3d1be90388', 30], ['Solodoor', '28d97156-0c2a-44f2-b473-6b72b33f8de1', 26],
  ['Kunzmann', '49351863-1fc9-47fb-9dc4-b9610d8b2397', 26], ['Colas', '190e5e04-02dc-4644-aa4a-8d25199a14c1', 26],
  ['Accenture', 'dc6bbda4-8421-4c81-8104-01467aed29ed', 28]
];

/* možnosti: d = oddělení, i = obory (prázdné = všechny), u = úspora v hodinách týdně [od, do], l = obtížnost, t = název, w = co to přinese.
   Postupy, pokyny pro AI a upozornění ke každé možnosti jsou v podklady/postupy.json, stránka je nezobrazuje. */
const UC = [
  /* OBCHOD */
  { id:'o1', d:'obchod', i:[], u:[2,3], l:'s', t:'Nabídka z poptávky za pár minut',
    w:'Z e-mailu s poptávkou připraví přehled, co klient chce, otázky, které je potřeba doplnit, a návrh průvodního e-mailu k nabídce.' },
  { id:'o2', d:'obchod', i:[], u:[1,2], l:'s', t:'Příprava na schůzku s novým klientem',
    w:'Z vašich poznámek a informací z webu klienta připraví jednostránkový podklad: čím se firma zabývá, možné problémy, otázky a námitky.' },
  { id:'o3', d:'obchod', i:[], u:[1,2], l:'s', t:'Zápis do CRM a další kroky po schůzce',
    w:'Z přepisu nebo poznámek ze schůzky připraví shrnutí do CRM, seznam dalších kroků a e-mail klientovi.' },
  { id:'o4', d:'obchod', i:[], u:[1,2], l:'s', t:'Trénink námitek s AI',
    w:'AI hraje skeptického nákupčího a vy si zkoušíte odpovědi na námitky. Po každé odpovědi dostanete krátkou zpětnou vazbu.' },
  /* MARKETING */
  { id:'m1', d:'marketing', i:[], u:[2,3], l:'s', t:'Z jednoho článku deset příspěvků',
    w:'Z článku, webináře nebo prezentace připraví příspěvky na LinkedIn, tipy do newsletteru a varianty titulků.' },
  { id:'m2', d:'marketing', i:[], u:[1,2], l:'s', t:'Newsletter za hodinu místo za den',
    w:'Z témat a poznámek připraví strukturu newsletteru: předmět, úvod, krátké bloky a výzvu k akci.' },
  { id:'m3', d:'marketing', i:[], u:[2,4], l:'m', t:'Rozbor recenzí a dotazníků',
    w:'Roztřídí odpovědi zákazníků do témat, spočítá zmínky, vybere typické citace a navrhne, co zlepšit nejdřív.' },
  { id:'m4', d:'marketing', i:[], u:[1,3], l:'s', t:'Popisy produktů a služeb na web',
    w:'Z technických parametrů připraví jednotné popisy na web: titulek, perex, přínosy pro zákazníka a parametry.' },
  /* HR */
  { id:'h1', d:'hr', i:[], u:[1,2], l:'s', t:'Inzerát, na který se ozvou ti správní',
    w:'Z popisu pozice připraví srozumitelný inzerát s jasnou náplní práce, požadavky a nabídkou.' },
  { id:'h2', d:'hr', i:[], u:[2,3], l:'s', t:'Plán zaškolení na první měsíc',
    w:'Připraví plán onboardingu po týdnech: cíle, s kým se potkat, co si přečíst a jak poznat, že to nováček zvládl.' },
  { id:'h3', d:'hr', i:[], u:[1,2], l:'s', t:'Otázky k pohovoru a hodnoticí karta',
    w:'Připraví otázky k pohovoru podle dovedností, které hledáte, a jednoduchou kartu pro férové porovnání uchazečů.' },
  { id:'h4', d:'hr', i:[], u:[1,3], l:'m', t:'Odpovědi na časté dotazy ze směrnic',
    w:'Z firemních směrnic připraví srozumitelné odpovědi na časté dotazy zaměstnanců, třeba k dovolené, home office nebo benefitům.' },
  /* FINANCE */
  { id:'f1', d:'finance', i:[], u:[1,3], l:'m', t:'Komentář k odchylkám od rozpočtu',
    w:'Najde největší odchylky skutečnosti od plánu a připraví srozumitelný komentář pro vedení.' },
  { id:'f2', d:'finance', i:[], u:[0.5,1], l:'s', t:'Upomínky, které nezkazí vztah',
    w:'Připraví tři stupně upomínky k neuhrazené faktuře, od přátelské po poslední před vymáháním.' },
  { id:'f3', d:'finance', i:[], u:[1,2], l:'s', t:'Vzorce v Excelu bez hledání na internetu',
    w:'Napíše vzorec pro český Excel, vysvětlí ho krok za krokem a poradí, jak ověřit, že počítá správně.' },
  { id:'f4', d:'finance', i:[], u:[1,3], l:'m', t:'Kontrola faktury proti objednávce',
    w:'Porovná fakturu s objednávkou nebo smlouvou a vypíše rozdíly v položkách, cenách, DPH a splatnosti.' },
  /* ZÁKAZNICKÁ PÉČE */
  { id:'z1', d:'pece', i:[], u:[2,4], l:'s', t:'Odpověď na stížnost, která uklidní',
    w:'Připraví odpověď na stížnost, která uzná problém, vysvětlí další postup a nabídne konkrétní krok.' },
  { id:'z2', d:'pece', i:[], u:[2,3], l:'m', t:'Šablony na nejčastější dotazy',
    w:'Z dotazů za poslední měsíc najde nejčastější témata a ke každému připraví šablonu odpovědi.' },
  { id:'z3', d:'pece', i:[], u:[1,2], l:'s', t:'Zákazník píše anglicky, německy nebo ukrajinsky',
    w:'Přeloží zprávu zákazníka, shrne, co chce, a vaši odpověď přeloží zpátky do jeho jazyka.' },
  { id:'z4', d:'pece', i:[], u:[1,2], l:'m', t:'Zpětná vazba k odpovědím týmu',
    w:'Ohodnotí vzorek odpovědí týmu podle srozumitelnosti, empatie a toho, jestli řeší problém, a ke každé dá radu.' },
  /* PROVOZ A ODBORNÁ PRÁCE */
  { id:'p1', d:'provoz', i:[], u:[1,3], l:'s', t:'Pracovní postup z poznámek',
    w:'Z poznámek zkušeného kolegy připraví přehledný postup: účel, pomůcky, kroky v pořadí, časté chyby a kontrolu.' },
  { id:'p2', d:'provoz', i:[], u:[1,2], l:'s', t:'Hledání příčiny opakovaného problému',
    w:'Projde s vámi problém metodou 5x proč, ptá se po jedné otázce a na konci shrne pravděpodobnou příčinu a opatření.' },
  { id:'p3', d:'provoz', i:[], u:[1,2], l:'s', t:'Předávka směny bez zmatků',
    w:'Z poznámek ze směny připraví stručnou předávací zprávu: co se stalo, co je rozpracované a na co si dát pozor.' },
  { id:'p4', d:'provoz', i:[], u:[1,2], l:'s', t:'Školení BOZP do mobilu',
    w:'Ze směrnice BOZP připraví krátkou lekci: čtyři karty s hlavními pravidly a tři kvízové otázky.' },
  /* VEDENÍ FIRMY */
  { id:'v1', d:'vedeni', i:[], u:[1,2], l:'s', t:'Týdenní přehled pro vedení na jednu stranu',
    w:'Z tabulky s čísly připraví přehled: tři hlavní zprávy, co se zlepšilo, co zhoršilo a jaká rozhodnutí jsou potřeba.' },
  { id:'v2', d:'vedeni', i:[], u:[1,1.5], l:'s', t:'Porada s jasným výsledkem',
    w:'Připraví program porady s časy, odpovědnými lidmi a výstupy a šablonu zápisu s úkoly.' },
  { id:'v3', d:'vedeni', i:[], u:[1,2], l:'s', t:'Oponentura strategického rozhodnutí',
    w:'AI hraje kritického člena představenstva: najde argumenty proti, přehlédnutá rizika a otázky, na které chcete znát odpověď.' },
  { id:'v4', d:'vedeni', i:[], u:[0.5,1], l:'m', t:'Pravidla pro používání AI ve firmě',
    w:'Připraví návrh interních pravidel: jaké nástroje používat, co do nich nevkládat, kdy výstup kontroluje člověk a koho se ptát.' },
  /* STAVEBNICTVÍ */
  { id:'s1', d:'obchod', i:['stavebnictvi'], u:[2,4], l:'m', t:'Kontrola výkazu výměr proti nabídce',
    w:'Porovná výkaz výměr z poptávky s vaší cenovou nabídkou a najde chybějící položky a jiná množství nebo jednotky.' },
  { id:'s2', d:'provoz', i:['stavebnictvi'], u:[1,3], l:'s', t:'Zápis z kontrolního dne',
    w:'Z poznámek a hlasového přepisu z kontrolního dne připraví zápis se stavem prací, vadami, termíny a odpovědnými firmami.' },
  /* ZDRAVOTNICTVÍ */
  { id:'zd1', d:'pece', i:['zdravotnictvi'], u:[1,2], l:'s', t:'Srozumitelné pokyny pro pacienta',
    w:'Přepíše odborné pokyny po vyšetření nebo zákroku do srozumitelné češtiny pro laika, nic medicínsky nemění.' },
  { id:'zd2', d:'vedeni', i:['zdravotnictvi'], u:[1,3], l:'m', t:'Rozpis služeb a zástupů',
    w:'Navrhne rozpis služeb podle vašich pravidel a upozorní, kde je nejde splnit.' },
  /* LOGISTIKA */
  { id:'l1', d:'pece', i:['logistika'], u:[2,4], l:'m', t:'Odpověď na dotaz, kde je zásilka',
    w:'Ze stavu v systému připraví odpověď zákazníkovi: kde zásilka je, kdy dorazí a co dělat, když nebude doma.' },
  { id:'l2', d:'vedeni', i:['logistika'], u:[1,3], l:'m', t:'Rozbor škod a reklamací za měsíc',
    w:'Najde v reklamacích a škodách opakující se vzorce podle tras, typů a dnů a navrhne opatření s největším dopadem.' },
  /* FINANČNÍ SLUŽBY */
  { id:'fs1', d:'obchod', i:['fin'], u:[1,2], l:'m', t:'Přehled firmy z výroční zprávy',
    w:'Z výroční zprávy klienta připraví přehled hlavních ukazatelů, změn a rizik a otázky na schůzku.' },
  { id:'fs2', d:'marketing', i:['fin'], u:[1,2], l:'s', t:'Srozumitelné vysvětlení produktu',
    w:'Vysvětlí finanční produkt člověku bez finančního vzdělání: co to je, pro koho se hodí, poplatky a rizika.' },
  /* ADVOKÁTNÍ KANCELÁŘE */
  { id:'a1', d:'provoz', i:['pravo'], u:[2,4], l:'m', t:'První verze smlouvy z vaší šablony',
    w:'Podle vaší šablony a podmínek obchodu připraví první verzi smlouvy, změny označí a nejasná místa vypíše jako otázky.' },
  { id:'a2', d:'provoz', i:['pravo'], u:[2,4], l:'m', t:'Časová osa a shrnutí spisu',
    w:'Z dokumentů ke kauze sestaví časovou osu s odkazy na dokumenty, shrne stanoviska stran a najde rozpory.' },
  /* VÝROBA A PRŮMYSL */
  { id:'vy1', d:'provoz', i:['vyroba'], u:[1,2], l:'s', t:'Návod ke stroji v jazyce operátora',
    w:'Přepíše návod ke stroji do krátkého postupu pro operátora a přeloží ho, třeba do ukrajinštiny nebo vietnamštiny.' },
  { id:'vy2', d:'provoz', i:['vyroba'], u:[1,2], l:'m', t:'Plán preventivní údržby',
    w:'Z intervalů v návodech a historie poruch navrhne plán údržby na čtvrtletí a upozorní, kde interval nestačí.' },
  /* AUTOMOTIVE */
  { id:'au1', d:'provoz', i:['auto'], u:[2,4], l:'m', t:'Návrh 8D reportu k reklamaci',
    w:'Připraví pracovní verzi 8D reportu a u každého kroku napíše, co chybí a koho se zeptat.' },
  { id:'au2', d:'vedeni', i:['auto'], u:[1,3], l:'m', t:'Příprava na audit podle IATF',
    w:'Projde váš postup a vypíše otázky, které auditor pravděpodobně položí, i důkazy, které máte mít připravené.' }
];
