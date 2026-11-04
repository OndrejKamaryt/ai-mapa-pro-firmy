/* ---------- data: obory, oddělení, kvízy a AI use cases ---------- */
const OBORY = [
  ['stavebnictvi', 'Stavebnictví'], ['zdravotnictvi', 'Zdravotnictví'], ['logistika', 'Logistika'],
  ['fin', 'Finanční služby'], ['pravo', 'Advokátní kanceláře'], ['vyroba', 'Výroba a průmysl'],
  ['auto', 'Automobilový průmysl'], ['jine', 'Jiný obor']
];
const ODDELENI = [
  ['vse', 'Všechna oddělení'], ['obchod', 'Obchod'], ['marketing', 'Marketing'], ['hr', 'HR a nábor'],
  ['finance', 'Finance a účetnictví'], ['pece', 'Zákaznická péče'], ['provoz', 'Provoz a odborná práce'], ['vedeni', 'Vedení firmy']
];
const OBOR_LABEL = Object.fromEntries(OBORY);
const ODD_LABEL = Object.fromEntries(ODDELENI);
const OBOR_PRO = { stavebnictvi:'Pro stavebnictví', zdravotnictvi:'Pro zdravotnictví', logistika:'Pro logistiku', fin:'Pro finanční služby',
                   pravo:'Pro advokátní kanceláře', vyroba:'Pro výrobu', auto:'Pro automotive' };
const LEVEL = { s:'Snadné', m:'Střední' };
const NASTROJ = {
  chat: 'AI chat, třeba ChatGPT, Claude, Copilot nebo Gemini, ideálně ve firemní verzi',
  dok: 'AI chat, do kterého nahrajete dokument nebo tabulku',
  excel: 'Copilot v Excelu nebo AI chat s nahranou tabulkou',
  prepis: 'Přepis schůzky v Teams nebo Google Meet a AI chat'
};

/* use cases: d = oddělení, i = obory (prázdné = všechny), u = úspora v hodinách týdně [od, do], l = obtížnost, n = nástroj */
const UC = [
  /* OBCHOD */
  { id:'o1', d:'obchod', i:[], u:[2,3], l:'s', n:'chat', t:'Nabídka z poptávky za pár minut',
    w:'Z e-mailu s poptávkou připraví přehled, co klient chce, otázky, které je potřeba doplnit, a návrh průvodního e-mailu k nabídce.',
    s:['Vložte text poptávky bez osobních údajů.', 'Přidejte popis vašich služeb nebo ceník.', 'Návrh zkontrolujte a doplňte ceny podle ceníku.'],
    p:'Jsi zkušený obchodník ve firmě [obor firmy]. Níže je poptávka od klienta a popis našich služeb.\n1) Shrň v pěti bodech, co klient potřebuje.\n2) Vypiš otázky, které musíme doplnit, než pošleme cenu.\n3) Napiš návrh průvodního e-mailu k nabídce, nejvýš 150 slov, věcně a bez frází.\n\nPoptávka: [vložte text]\nNaše služby a ceník: [vložte]',
    x:'Ceny a termíny vždy zkontrolujte proti ceníku. AI si umí čísla domyslet.' },
  { id:'o2', d:'obchod', i:[], u:[1,2], l:'s', n:'chat', t:'Příprava na schůzku s novým klientem',
    w:'Z vašich poznámek a informací z webu klienta připraví jednostránkový podklad: čím se firma zabývá, možné problémy, otázky a námitky.',
    s:['Zkopírujte do AI text z webu klienta a své poznámky.', 'Nechte si připravit podklad a otázky.', 'Fakta ověřte na webu a v obchodním rejstříku.'],
    p:'Připravuji se na první schůzku s firmou [název] z oboru [obor]. Tady jsou moje poznámky a informace z jejich webu: [vložte].\nPřiprav mi podklad na jednu stranu: čím se firma zabývá, tři problémy, se kterými jim můžeme pomoct, pět otevřených otázek na schůzku a dvě námitky, které můžou zaznít, i s návrhem odpovědi.',
    x:'AI nemusí mít o firmě aktuální informace. Fakta si ověřte u zdroje.' },
  { id:'o3', d:'obchod', i:[], u:[1,2], l:'s', n:'prepis', t:'Zápis do CRM a další kroky po schůzce',
    w:'Z přepisu nebo poznámek ze schůzky připraví shrnutí do CRM, seznam dalších kroků a e-mail klientovi.',
    s:['Zapněte přepis schůzky, nebo si dělejte stručné poznámky.', 'Vložte přepis do AI s pokynem níže.', 'Shrnutí vložte do CRM a e-mail pošlete pod svým jménem.'],
    p:'Tady je přepis (nebo moje poznámky) z obchodní schůzky: [vložte].\nNapiš:\n1) shrnutí do CRM v pěti odrážkách: potřeby, rozpočet, kdo rozhoduje, termíny, rizika,\n2) další kroky s termínem a odpovědnou osobou,\n3) follow-up e-mail klientovi do 120 slov, který shrne domluvené a navrhne další krok.',
    x:'Schůzku nahrávejte jen se souhlasem klienta. Jména a čísla můžete nahradit zástupnými.' },
  { id:'o4', d:'obchod', i:[], u:[1,2], l:'s', n:'chat', t:'Trénink námitek s AI',
    w:'AI hraje skeptického nákupčího a vy si zkoušíte odpovědi na námitky. Po každé odpovědi dostanete krátkou zpětnou vazbu.',
    s:['Popište AI, co prodáváte a komu.', 'Nechte ji vznášet námitky a odpovídejte jako na schůzce.', 'Nejlepší odpovědi si uložte do sdílených argumentů týmu.'],
    p:'Zahraj si roli nákupčího ve firmě [obor], který řeší nabídku na [produkt nebo službu]. Buď skeptický a vznášej typické námitky: cena, načasování, už máme dodavatele.\nPo každé mé odpovědi mi krátce řekni, co bylo dobře a co zlepšit. Začni první námitkou.',
    x:'Je to trénink. Skutečné slevy a podmínky domlouvejte podle pravidel firmy.' },

  /* MARKETING */
  { id:'m1', d:'marketing', i:[], u:[2,3], l:'s', n:'chat', t:'Z jednoho článku deset příspěvků',
    w:'Z článku, webináře nebo prezentace připraví příspěvky na LinkedIn, tipy do newsletteru a varianty titulků.',
    s:['Vložte článek nebo přepis webináře.', 'Nechte si připravit příspěvky podle pokynu níže.', 'Vyberte nejlepší a upravte je do svého stylu.'],
    p:'Jsi marketér firmy z oboru [obor]. Z tohoto textu připrav:\n- 3 příspěvky na LinkedIn, každý do 120 slov, krátké odstavce, bez emoji a bez hashtagů,\n- 2 krátké tipy do newsletteru,\n- 5 variant titulku.\nPiš věcně, česky a bez reklamních frází.\n\nText: [vložte]',
    x:'Text si před zveřejněním přečtěte nahlas. Když zní jako reklama, nechte AI ubrat superlativy.' },
  { id:'m2', d:'marketing', i:[], u:[1,2], l:'s', n:'chat', t:'Newsletter za hodinu místo za den',
    w:'Z témat a poznámek připraví strukturu newsletteru: předmět, úvod, krátké bloky a výzvu k akci.',
    s:['Sepište témata měsíce a k nim pár poznámek.', 'Nechte AI připravit návrh.', 'Doplňte odkazy a data akcí sami.'],
    p:'Připrav návrh firemního newsletteru pro [cílová skupina]. Témata tohoto měsíce: [3 až 5 témat s poznámkami].\nStruktura: předmět e-mailu ve 3 variantách, úvod do 40 slov, krátký blok ke každému tématu s jedním odkazem, závěr s jednou výzvou k akci.\nTón: přátelský, věcný, bez superlativů.',
    x:'Odkazy, data a ceny doplňte ručně. AI je může vymyslet.' },
  { id:'m3', d:'marketing', i:[], u:[2,4], l:'m', n:'dok', t:'Rozbor recenzí a dotazníků',
    w:'Roztřídí odpovědi zákazníků do témat, spočítá zmínky, vybere typické citace a navrhne, co zlepšit nejdřív.',
    s:['Vyexportujte odpovědi z dotazníku nebo recenze.', 'Odstraňte jména a kontakty.', 'Nahrajte je do AI a nechte si připravit rozbor.'],
    p:'Níže je [počet] odpovědí zákazníků z dotazníku nebo recenzí: [vložte].\nRoztřiď je nejvýš do 6 témat. U každého uveď počet zmínek, dvě typické citace a jestli převažuje spokojenost, nebo nespokojenost.\nNa konci navrhni tři konkrétní kroky s největším dopadem.',
    x:'Počty si namátkou ověřte. AI se při počítání zmínek může splést.' },
  { id:'m4', d:'marketing', i:[], u:[1,3], l:'s', n:'chat', t:'Popisy produktů a služeb na web',
    w:'Z technických parametrů připraví jednotné popisy na web: titulek, perex, přínosy pro zákazníka a parametry.',
    s:['Vložte parametry produktu nebo služby.', 'Nechte si připravit popis podle šablony.', 'Porovnejte text s podklady.'],
    p:'Z těchto technických parametrů napiš popis produktu na web: titulek do 8 slov, perex do 30 slov, 4 odrážky s přínosy pro zákazníka a krátký odstavec s parametry. Nepřidávej vlastnosti, které nejsou v podkladech.\n\nParametry: [vložte]',
    x:'AI ráda doplní vlastnosti, které produkt nemá. Text porovnejte s podklady.' },

  /* HR */
  { id:'h1', d:'hr', i:[], u:[1,2], l:'s', n:'chat', t:'Inzerát, na který se ozvou ti správní',
    w:'Z popisu pozice připraví srozumitelný inzerát s jasnou náplní práce, požadavky a nabídkou.',
    s:['Sepište náplň práce, požadavky a co nabízíte.', 'Nechte AI napsat inzerát.', 'Zkontrolujte, že neobsahuje diskriminační požadavky.'],
    p:'Napiš inzerát na pozici [název pozice] ve firmě [obor, město].\nPodklady: náplň práce [vložte], požadavky [vložte], co nabízíme [vložte].\nStruktura: úvod do 40 slov, co budete dělat (5 odrážek), co potřebujeme (nejvýš 5 odrážek, rozliš nutné a výhodou), co nabízíme, jak se přihlásit.\nPiš genderově vyváženě a bez klišé typu dynamický kolektiv.',
    x:'Inzerát nesmí obsahovat diskriminační požadavky, třeba na věk nebo pohlaví.' },
  { id:'h2', d:'hr', i:[], u:[2,3], l:'s', n:'chat', t:'Plán zaškolení na první měsíc',
    w:'Připraví plán onboardingu po týdnech: cíle, s kým se potkat, co si přečíst a jak poznat, že to nováček zvládl.',
    s:['Napište, co má nováček na konci měsíce umět.', 'Nechte si připravit plán po týdnech.', 'Projděte ho s vedoucím týmu.'],
    p:'Připrav plán zaškolení na první 4 týdny pro pozici [pozice] v týmu [tým].\nCo musí člověk na konci měsíce umět: [vložte].\nPro každý týden uveď cíle, s kým se má potkat, co si má přečíst nebo vyzkoušet a jak poznáme, že to zvládl. Na konci navrhni 5 kontrolních otázek.',
    x:'AI nezná vaše interní procesy, doplní je jen obecně. Plán upravte podle reality týmu.' },
  { id:'h3', d:'hr', i:[], u:[1,2], l:'s', n:'chat', t:'Otázky k pohovoru a hodnoticí karta',
    w:'Připraví otázky k pohovoru podle dovedností, které hledáte, a jednoduchou kartu pro férové porovnání uchazečů.',
    s:['Vypište 4 až 6 dovedností, na kterých záleží.', 'Nechte si připravit otázky a kartu.', 'Rozhodnutí o uchazeči nechte na lidech.'],
    p:'Pro pozici [pozice] připrav 8 otázek k pohovoru zaměřených na tyto dovednosti: [vložte].\nKe každé otázce napiš, co poznáme z dobré a ze slabé odpovědi. Přidej jednoduchou hodnoticí kartu se stupnicí 1 až 4.',
    x:'O uchazeči rozhoduje člověk. AI, která sama vybírá nebo hodnotí uchazeče, patří podle AI Actu mezi vysoce rizikové systémy.' },
  { id:'h4', d:'hr', i:[], u:[1,3], l:'m', n:'dok', t:'Odpovědi na časté dotazy ze směrnic',
    w:'Z firemních směrnic připraví srozumitelné odpovědi na časté dotazy zaměstnanců, třeba k dovolené, home office nebo benefitům.',
    s:['Nahrajte směrnici do firemního AI nástroje.', 'Nechte si připravit otázky a odpovědi s odkazem na článek.', 'Odpovědi zveřejněte na intranetu.'],
    p:'Tady je naše směrnice: [vložte text].\nPřiprav z ní 10 nejčastějších otázek zaměstnanců a ke každé srozumitelnou odpověď do 60 slov. U každé odpovědi uveď článek směrnice, ze kterého vychází. Když směrnice něco neřeší, napiš to a nic si nedomýšlej.',
    x:'Interní dokumenty vkládejte jen do schváleného nástroje, ideálně ve firemní verzi s vypnutým učením na datech.' },

  /* FINANCE */
  { id:'f1', d:'finance', i:[], u:[1,3], l:'m', n:'excel', t:'Komentář k odchylkám od rozpočtu',
    w:'Najde největší odchylky skutečnosti od plánu a připraví srozumitelný komentář pro vedení.',
    s:['Nahrajte tabulku plán proti skutečnosti.', 'Nechte si najít největší odchylky a navrhnout vysvětlení.', 'Čísla přepočítejte a vysvětlení ověřte u středisek.'],
    p:'V příloze je tabulka plán proti skutečnosti za [měsíc] po nákladových střediscích.\nNajdi 5 největších odchylek v korunách i v procentech, navrhni možné vysvětlení a připrav komentář pro vedení do 150 slov. Výpočty ukaž v tabulce, ať je můžu zkontrolovat.',
    x:'Každé číslo si přepočítejte v Excelu. Jazykové modely umí špatně sčítat.' },
  { id:'f2', d:'finance', i:[], u:[0.5,1], l:'s', n:'chat', t:'Upomínky, které nezkazí vztah',
    w:'Připraví tři stupně upomínky k neuhrazené faktuře, od přátelské po poslední před vymáháním.',
    s:['Vložte číslo faktury, částku a splatnost.', 'Nechte si připravit tři verze.', 'Uložte si je jako šablony.'],
    p:'Napiš tři verze upomínky k faktuře [číslo] na [částka] se splatností [datum]: první přátelskou po 7 dnech, druhou důraznější po 21 dnech a třetí před předáním k vymáhání. Každou do 90 slov, zdvořile a bez výhrůžek.',
    x:'Částky, data a čísla účtů doplňte ručně a zkontrolujte.' },
  { id:'f3', d:'finance', i:[], u:[1,2], l:'s', n:'chat', t:'Vzorce v Excelu bez hledání na internetu',
    w:'Napíše vzorec pro český Excel, vysvětlí ho krok za krokem a poradí, jak ověřit, že počítá správně.',
    s:['Popište, co máte v jakém sloupci a co potřebujete spočítat.', 'Nechte si napsat vzorec a vysvětlení.', 'Vyzkoušejte ho nejdřív na kopii souboru.'],
    p:'V Excelu mám ve sloupci A datum, ve sloupci B středisko a ve sloupci C částku. Potřebuji vzorec, který sečte částky za [středisko] v [měsíc].\nNapiš vzorec pro český Excel s oddělovačem středník, vysvětli ho krok za krokem a ukaž, jak ověřím, že počítá správně.',
    x:'Vzorec otestujte na pár řádcích, kde výsledek znáte.' },
  { id:'f4', d:'finance', i:[], u:[1,3], l:'m', n:'dok', t:'Kontrola faktury proti objednávce',
    w:'Porovná fakturu s objednávkou nebo smlouvou a vypíše rozdíly v položkách, cenách, DPH a splatnosti.',
    s:['Nahrajte fakturu a objednávku.', 'Nechte si vypsat rozdíly do tabulky.', 'Platbu schvalujte až po kontrole člověkem.'],
    p:'Porovnej tuto fakturu [vložte] s objednávkou [vložte]. Vypiš všechny rozdíly v položkách, množství, cenách, DPH a splatnosti do tabulky. Když něco nejde porovnat, napiš to.',
    x:'AI je dobrá na první kontrolu, ne na schválení. Platbu vždy schvaluje člověk.' },

  /* ZÁKAZNICKÁ PÉČE */
  { id:'z1', d:'pece', i:[], u:[2,4], l:'s', n:'chat', t:'Odpověď na stížnost, která uklidní',
    w:'Připraví odpověď na stížnost, která uzná problém, vysvětlí další postup a nabídne konkrétní krok.',
    s:['Vložte stížnost bez osobních údajů a pravidla reklamací.', 'Nechte si připravit odpověď.', 'Upravte ji a pošlete pod svým jménem.'],
    p:'Jsi pracovník zákaznické péče firmy z oboru [obor]. Zákazník napsal tuto stížnost: [vložte bez osobních údajů].\nNaše pravidla pro reklamace: [vložte].\nNapiš odpověď do 120 slov: uznej problém, vysvětli, co uděláme a do kdy, a nabídni jeden konkrétní další krok. Bez frází typu „vážíme si vaší zpětné vazby“.',
    x:'Neslibujte nic, co pravidla nedovolují. Odpověď posílá člověk.' },
  { id:'z2', d:'pece', i:[], u:[2,3], l:'m', n:'dok', t:'Šablony na nejčastější dotazy',
    w:'Z dotazů za poslední měsíc najde nejčastější témata a ke každému připraví šablonu odpovědi.',
    s:['Vyexportujte dotazy za měsíc bez jmen a kontaktů.', 'Nechte AI najít témata a napsat šablony.', 'Šablony uložte do helpdesku.'],
    p:'Tady je 30 dotazů zákazníků za poslední měsíc: [vložte bez jmen a kontaktů].\nSeskup je do témat. U 5 nejčastějších napiš šablonu odpovědi do 80 slov a místa, která je potřeba doplnit ručně, označ hranatými závorkami.',
    x:'Z dotazů odstraňte jména, e-maily a čísla objednávek, pokud nepoužíváte firemní AI s ochranou dat.' },
  { id:'z3', d:'pece', i:[], u:[1,2], l:'s', n:'chat', t:'Zákazník píše anglicky, německy nebo ukrajinsky',
    w:'Přeloží zprávu zákazníka, shrne, co chce, a vaši odpověď přeloží zpátky do jeho jazyka.',
    s:['Vložte zprávu zákazníka.', 'Odpověď napište česky.', 'Nechte ji přeložit a zkontrolujte čísla a termíny.'],
    p:'Přelož tuto zprávu od zákazníka do češtiny a napiš mi, co přesně chce: [vložte].\nPak moji odpověď [napište česky] přelož do jazyka zákazníka, zdvořile a srozumitelně.',
    x:'U cen, termínů a právních formulací nechte překlad zkontrolovat člověkem, který jazyk ovládá.' },
  { id:'z4', d:'pece', i:[], u:[1,2], l:'m', n:'dok', t:'Zpětná vazba k odpovědím týmu',
    w:'Ohodnotí vzorek odpovědí týmu podle srozumitelnosti, empatie a toho, jestli řeší problém, a ke každé dá radu.',
    s:['Vyberte 10 odpovědí bez osobních údajů.', 'Nechte si je ohodnotit.', 'Výsledky použijte jako podklad ke koučinku.'],
    p:'Tady je 10 odpovědí našeho týmu zákazníkům: [vložte bez osobních údajů].\nOhodnoť každou na stupnici 1 až 5 podle srozumitelnosti, empatie a toho, jestli řeší problém. Ke každé napiš jednu konkrétní radu, jak ji zlepšit.',
    x:'Hodnocení od AI je podklad ke koučinku, ne hodnocení výkonu člověka.' },

  /* PROVOZ A ODBORNÁ PRÁCE */
  { id:'p1', d:'provoz', i:[], u:[1,3], l:'s', n:'chat', t:'Pracovní postup z poznámek',
    w:'Z poznámek zkušeného kolegy připraví přehledný postup: účel, pomůcky, kroky v pořadí, časté chyby a kontrolu.',
    s:['Sepište nebo nadiktujte, jak činnost děláte.', 'Nechte AI připravit postup.', 'Postup nechte schválit odpovědnou osobou.'],
    p:'Z těchto poznámek napiš pracovní postup pro [činnost]: [vložte].\nStruktura: účel, potřebné nářadí a ochranné pomůcky, očíslované kroky v pořadí, nejčastější chyby a kontrola na konci. Piš krátkými větami, aby to šlo číst i v telefonu na provozu.',
    x:'Postup musí schválit odpovědný technik nebo bezpečnostní technik.' },
  { id:'p2', d:'provoz', i:[], u:[1,2], l:'s', n:'chat', t:'Hledání příčiny opakovaného problému',
    w:'Projde s vámi problém metodou 5x proč, ptá se po jedné otázce a na konci shrne pravděpodobnou příčinu a opatření.',
    s:['Popište problém, kdy a jak často nastává.', 'Odpovídejte na otázky AI.', 'Závěr ověřte měřením nebo pozorováním.'],
    p:'Opakuje se nám problém: [popis, kde, kdy a jak často]. Proveď se mnou analýzu příčin metodou 5x proč. Ptej se mě po jedné otázce a nic si nedomýšlej. Na konci shrň pravděpodobnou příčinu a navrhni opatření.',
    x:'AI je partner na přemýšlení, ne odborník na váš provoz. Závěry ověřte.' },
  { id:'p3', d:'provoz', i:[], u:[1,2], l:'s', n:'chat', t:'Předávka směny bez zmatků',
    w:'Z poznámek ze směny připraví stručnou předávací zprávu: co se stalo, co je rozpracované a na co si dát pozor.',
    s:['Vložte poznámky ze směny.', 'Nechte si připravit předávku do 10 odrážek.', 'Bezpečnostní události hlaste i podle interních pravidel.'],
    p:'Tady jsou poznámky ze směny: [vložte].\nPřiprav předávací zprávu pro další směnu: co se stalo, co zůstalo rozpracované, na co si dát pozor a co je potřeba nahlásit údržbě. Nejvýš 10 odrážek.',
    x:'Bezpečnostní události patří do evidence podle interních pravidel, ne jen do souhrnu.' },
  { id:'p4', d:'provoz', i:[], u:[1,2], l:'s', n:'dok', t:'Školení BOZP do mobilu',
    w:'Ze směrnice BOZP připraví krátkou lekci: čtyři karty s hlavními pravidly a tři kvízové otázky.',
    s:['Nahrajte směrnici BOZP.', 'Nechte AI připravit karty a kvíz.', 'Obsah nechte schválit odpovědnou osobou a pošlete ho lidem do mobilu.'],
    p:'Z této směrnice BOZP připrav krátkou lekci na 3 minuty: 4 karty s hlavními pravidly, každá do 40 slov, a 3 kvízové otázky s možnostmi a vysvětlením správné odpovědi. Piš srozumitelně pro lidi na provozu.\n\nSměrnice: [vložte]',
    x:'Obsah školení BOZP musí odpovídat vaší dokumentaci a schválit ho má odpovědná osoba.' },

  /* VEDENÍ FIRMY */
  { id:'v1', d:'vedeni', i:[], u:[1,2], l:'s', n:'excel', t:'Týdenní přehled pro vedení na jednu stranu',
    w:'Z tabulky s čísly připraví přehled: tři hlavní zprávy, co se zlepšilo, co zhoršilo a jaká rozhodnutí jsou potřeba.',
    s:['Nahrajte tabulku s týdenními čísly.', 'Nechte si připravit přehled.', 'Čísla v textu porovnejte s tabulkou.'],
    p:'Tady jsou čísla za tento týden a minulý měsíc: [vložte tabulku].\nNapiš přehled pro vedení na jednu stranu: tři hlavní zprávy, co se zlepšilo, co se zhoršilo a proč, a dvě rozhodnutí, která je potřeba udělat. Čísla uváděj přesně podle tabulky.',
    x:'AI čísla občas zaokrouhlí nebo prohodí. Zkontrolujte je proti tabulce.' },
  { id:'v2', d:'vedeni', i:[], u:[1,1.5], l:'s', n:'chat', t:'Porada s jasným výsledkem',
    w:'Připraví program porady s časy, odpovědnými lidmi a výstupy a šablonu zápisu s úkoly.',
    s:['Napište téma, účastníky a rozhodnutí, které potřebujete.', 'Nechte si připravit program.', 'Pošlete ho účastníkům předem i s podklady.'],
    p:'Připrav program porady na 45 minut na téma [téma]. Účastníci: [role]. Cíl porady: [rozhodnutí, které potřebujeme].\nKe každému bodu uveď čas, kdo ho vede a jaký má být výstup. Na konci navrhni šablonu zápisu s úkoly.',
    x:'Program je návrh. Podklady a čísla doplňte sami.' },
  { id:'v3', d:'vedeni', i:[], u:[1,2], l:'s', n:'chat', t:'Oponentura strategického rozhodnutí',
    w:'AI hraje kritického člena představenstva: najde argumenty proti, přehlédnutá rizika a otázky, na které chcete znát odpověď.',
    s:['Popište rozhodnutí a klíčová čísla.', 'Nechte AI hledat slabá místa.', 'Otázky proberte s týmem.'],
    p:'Zvažujeme [rozhodnutí, třeba otevřít pobočku v Brně]. Naše situace: [klíčová čísla a omezení].\nZahraj roli kritického člena představenstva: vypiš 5 nejsilnějších argumentů proti, rizika, která nevidíme, a otázky, na které musíme mít odpověď, než rozhodneme.',
    x:'AI nezná váš trh tak dobře jako vy. Je to nástroj na lepší otázky, ne na rozhodnutí.' },
  { id:'v4', d:'vedeni', i:[], u:[0.5,1], l:'m', n:'chat', t:'Pravidla pro používání AI ve firmě',
    w:'Připraví návrh interních pravidel: jaké nástroje používat, co do nich nevkládat, kdy výstup kontroluje člověk a koho se ptát.',
    s:['Popište firmu a nástroje, které používáte.', 'Nechte si připravit návrh pravidel.', 'Návrh nechte zkontrolovat právníkem.'],
    p:'Připrav návrh interních pravidel pro používání AI nástrojů v naší firmě ([obor], [počet] zaměstnanců). Pokryj: které nástroje smíme používat, jaká data do nich nesmíme vkládat, kdy musí výstup zkontrolovat člověk, jak označovat obsah vytvořený s AI a koho se ptát. Nejvýš dvě strany, srozumitelně pro všechny zaměstnance.',
    x:'AI Act od února 2025 ukládá firmám zajistit lidem, kteří s AI pracují, dostatečnou gramotnost v AI. Pravidla jsou dobrý první krok.' },

  /* STAVEBNICTVÍ */
  { id:'s1', d:'obchod', i:['stavebnictvi'], u:[2,4], l:'m', n:'dok', t:'Kontrola výkazu výměr proti nabídce',
    w:'Porovná výkaz výměr z poptávky s vaší cenovou nabídkou a najde chybějící položky a jiná množství nebo jednotky.',
    s:['Nahrajte výkaz výměr a vaši nabídku.', 'Nechte si vypsat rozdíly do tabulky.', 'Množství ověřte v projektové dokumentaci.'],
    p:'Porovnej výkaz výměr z poptávky [vložte] s naší cenovou nabídkou [vložte]. Najdi položky, které v nabídce chybí nebo mají jiné množství či jednotku, a vypiš je do tabulky. Na konci shrň, kde hrozí, že budeme kvůli chybě dražší nebo levnější.',
    x:'Výsledek je pomůcka pro rozpočtáře, ne náhrada kontroly.' },
  { id:'s2', d:'provoz', i:['stavebnictvi'], u:[1,3], l:'s', n:'prepis', t:'Zápis z kontrolního dne',
    w:'Z poznámek a hlasového přepisu z kontrolního dne připraví zápis se stavem prací, vadami, termíny a odpovědnými firmami.',
    s:['Na stavbě si nadiktujte poznámky do telefonu.', 'Vložte přepis do AI.', 'Zápis před rozesláním projděte.'],
    p:'Tady jsou moje poznámky a hlasový přepis z kontrolního dne na stavbě [název]: [vložte].\nPřiprav zápis: účastníci, stav prací podle objektů, zjištěné vady s termínem odstranění a odpovědnou firmou, požadavky na investora a termín dalšího kontrolního dne.',
    x:'Termíny a odpovědné firmy musí sedět s tím, co na kontrolním dni zaznělo.' },

  /* ZDRAVOTNICTVÍ */
  { id:'zd1', d:'pece', i:['zdravotnictvi'], u:[1,2], l:'s', n:'chat', t:'Srozumitelné pokyny pro pacienta',
    w:'Přepíše odborné pokyny po vyšetření nebo zákroku do srozumitelné češtiny pro laika, nic medicínsky nemění.',
    s:['Vložte obecné pokyny bez údajů o pacientovi.', 'Nechte je přepsat srozumitelně.', 'Výsledek musí zkontrolovat zdravotník.'],
    p:'Přepiš tyto pokyny po zákroku do srozumitelné češtiny pro laika: krátké věty, nejdůležitější informace nahoře, co dělat a co nedělat a kdy volat lékaře. Nic nepřidávej ani neměň medicínsky.\n\nPokyny: [vložte, bez jména a dalších údajů pacienta]',
    x:'Údaje o zdravotním stavu konkrétních pacientů do běžných AI nástrojů nikdy nevkládejte.' },
  { id:'zd2', d:'vedeni', i:['zdravotnictvi'], u:[1,3], l:'m', n:'excel', t:'Rozpis služeb a zástupů',
    w:'Navrhne rozpis služeb podle vašich pravidel a upozorní, kde je nejde splnit.',
    s:['Sepište pravidla: počty na směnu, noční, požadavky na volno.', 'Nechte si navrhnout rozpis v tabulce.', 'Zkontrolujte ho proti zákoníku práce.'],
    p:'Potřebuji rozpis služeb na [měsíc] pro [počet] sester na oddělení [oddělení]. Pravidla: [počet lidí na směnu, nejvyšší počet nočních, požadavky na volno].\nNavrhni rozpis v tabulce a vypiš, kde pravidla nejde splnit.',
    x:'Rozpis zkontrolujte proti zákoníku práce a domluveným výjimkám. AI se v pravidlech může splést.' },

  /* LOGISTIKA */
  { id:'l1', d:'pece', i:['logistika'], u:[2,4], l:'m', n:'chat', t:'Odpověď na dotaz, kde je zásilka',
    w:'Ze stavu v systému připraví odpověď zákazníkovi: kde zásilka je, kdy dorazí a co dělat, když nebude doma.',
    s:['Vložte stav zásilky ze systému.', 'Nechte si připravit odpověď.', 'Termín doručení vždy berte ze systému.'],
    p:'Zákazník se ptá na zásilku [číslo]. Stav z našeho systému: [vložte].\nNapiš odpověď do 70 slov: kde zásilka je, kdy dorazí a co může zákazník udělat, když nebude doma. Když stav není jasný, napiš, že to prověříme, a uveď do kdy.',
    x:'Termín doručení si AI nesmí odhadnout sama. Musí vycházet ze stavu v systému.' },
  { id:'l2', d:'vedeni', i:['logistika'], u:[1,3], l:'m', n:'excel', t:'Rozbor škod a reklamací za měsíc',
    w:'Najde v reklamacích a škodách opakující se vzorce podle tras, typů a dnů a navrhne opatření s největším dopadem.',
    s:['Vyexportujte reklamace a škody za měsíc.', 'Jména řidičů nahraďte kódy.', 'Nechte si připravit rozbor a součty ověřte v Excelu.'],
    p:'V tabulce jsou reklamace a škody za [měsíc]: datum, trasa, kód řidiče, typ škody a částka: [vložte].\nNajdi opakující se vzorce podle tras, typů a dnů, spočítej součty podle typu a navrhni tři opatření s největším dopadem. Výpočty ukaž v tabulce.',
    x:'Součty si ověřte v Excelu. Závěry o konkrétních lidech nedělejte jen podle AI.' },

  /* FINANČNÍ SLUŽBY */
  { id:'fs1', d:'obchod', i:['fin'], u:[1,2], l:'m', n:'dok', t:'Přehled firmy z výroční zprávy',
    w:'Z výroční zprávy klienta připraví přehled hlavních ukazatelů, změn a rizik a otázky na schůzku.',
    s:['Nahrajte výroční zprávu do schváleného nástroje.', 'Nechte si připravit přehled s odkazy na strany.', 'Čísla ověřte ve zprávě.'],
    p:'Z této výroční zprávy připrav přehled pro schůzku s klientem: tržby, zisk, zadlužení a cash flow za dva roky, hlavní změny a rizika a 5 otázek, které klientovi položit. U každého čísla uveď stranu, kde je ve zprávě.\n\nZpráva: [nahrajte PDF]',
    x:'Neveřejné údaje klientů vkládejte jen do schváleného firemního nástroje.' },
  { id:'fs2', d:'marketing', i:['fin'], u:[1,2], l:'s', n:'chat', t:'Srozumitelné vysvětlení produktu',
    w:'Vysvětlí finanční produkt člověku bez finančního vzdělání: co to je, pro koho se hodí, poplatky a rizika.',
    s:['Vložte popis produktu a podmínky.', 'Nechte si připravit srozumitelný text.', 'Text nechte projít compliance.'],
    p:'Vysvětli tento finanční produkt pro člověka bez finančního vzdělání: co to je, pro koho se hodí a pro koho ne, jaké má poplatky a rizika. Nejvýš 200 slov, bez slibů výnosu.\n\nProdukt a podmínky: [vložte]',
    x:'Texty o finančních produktech musí odpovídat pravidlům ČNB a projít compliance.' },

  /* ADVOKÁTNÍ KANCELÁŘE */
  { id:'a1', d:'provoz', i:['pravo'], u:[2,4], l:'m', n:'dok', t:'První verze smlouvy z vaší šablony',
    w:'Podle vaší šablony a podmínek obchodu připraví první verzi smlouvy, změny označí a nejasná místa vypíše jako otázky.',
    s:['Vložte šablonu a podmínky obchodu.', 'Nechte si připravit první verzi.', 'Smlouvu vždy kontroluje advokát.'],
    p:'Jsi koncipient v advokátní kanceláři. Na základě naší šablony [vložte] a těchto podmínek obchodu [vložte] připrav první verzi smlouvy. Změny proti šabloně označ a nejasná místa vypiš na konec jako otázky pro advokáta. Bez upozornění nepřidávej ustanovení, která v šabloně nejsou.',
    x:'Údaje klientů vkládejte jen do nástrojů se smluvně zajištěnou mlčenlivostí.' },
  { id:'a2', d:'provoz', i:['pravo'], u:[2,4], l:'m', n:'dok', t:'Časová osa a shrnutí spisu',
    w:'Z dokumentů ke kauze sestaví časovou osu s odkazy na dokumenty, shrne stanoviska stran a najde rozpory.',
    s:['Nahrajte dokumenty ke kauze do schváleného nástroje.', 'Nechte si sestavit časovou osu.', 'Data a citace ověřte v originálech.'],
    p:'Z těchto dokumentů ke kauze sestav časovou osu událostí s datem, popisem a odkazem na dokument. Pak shrň stanoviska stran v pěti bodech a vypiš rozpory mezi dokumenty.\n\nDokumenty: [nahrajte]',
    x:'Odkazy na paragrafy a judikaturu kontrolujte v aktuálním znění.' },

  /* VÝROBA A PRŮMYSL */
  { id:'vy1', d:'provoz', i:['vyroba'], u:[1,2], l:'s', n:'dok', t:'Návod ke stroji v jazyce operátora',
    w:'Přepíše návod ke stroji do krátkého postupu pro operátora a přeloží ho, třeba do ukrajinštiny nebo vietnamštiny.',
    s:['Nahrajte návod výrobce.', 'Nechte si připravit postup a překlad.', 'Překlad dejte zkontrolovat kolegovi, který jazyk ovládá.'],
    p:'Tento návod ke stroji přepiš do krátkého postupu pro operátora: 8 až 12 kroků, jednoduché věty a bezpečnostní upozornění zvlášť a výrazně. Pak ho přelož do [ukrajinštiny nebo vietnamštiny].\n\nNávod: [vložte]',
    x:'Bezpečnostní části musí sedět s originálem výrobce.' },
  { id:'vy2', d:'provoz', i:['vyroba'], u:[1,2], l:'m', n:'excel', t:'Plán preventivní údržby',
    w:'Z intervalů v návodech a historie poruch navrhne plán údržby na čtvrtletí a upozorní, kde interval nestačí.',
    s:['Vložte intervaly z návodů a seznam poruch.', 'Nechte si navrhnout plán.', 'Plán porovnejte s revizními povinnostmi.'],
    p:'Tady jsou intervaly údržby z návodu výrobce [vložte] a seznam poruch za poslední rok [vložte].\nNavrhni plán preventivní údržby na čtvrtletí: co, jak často, kdo a kolik času to zabere. Upozorni na stroje, kde poruchy naznačují, že interval nestačí.',
    x:'Plán musí respektovat pokyny výrobce a vaše revizní povinnosti.' },

  /* AUTOMOTIVE */
  { id:'au1', d:'provoz', i:['auto'], u:[2,4], l:'m', n:'chat', t:'Návrh 8D reportu k reklamaci',
    w:'Připraví pracovní verzi 8D reportu a u každého kroku napíše, co chybí a koho se zeptat.',
    s:['Popište vadu, díl, počet kusů a zákazníka bez jmen.', 'Nechte si připravit kroky D1 až D8.', 'Report doplní a schválí tým kvality.'],
    p:'Připrav návrh 8D reportu k reklamaci: [popis vady, díl, počet kusů, zákazník bez jmen].\nVyplň kroky D1 až D8 podle dostupných informací a u každého kroku napiš, co chybí a koho se zeptat. Nic si nedomýšlej.',
    x:'Závěry musí doložit měření a odpovědný inženýr.' },
  { id:'au2', d:'vedeni', i:['auto'], u:[1,3], l:'m', n:'dok', t:'Příprava na audit podle IATF',
    w:'Projde váš postup a vypíše otázky, které auditor pravděpodobně položí, i důkazy, které máte mít připravené.',
    s:['Nahrajte postup procesu.', 'Nechte si připravit otázky a důkazy.', 'Požadavky ověřte v aktuálním znění normy.'],
    p:'Připravujeme se na audit podle IATF 16949 pro proces [proces]. Tady je náš postup: [vložte].\nVypiš otázky, které auditor pravděpodobně položí, a u každé, jaký důkaz bychom měli mít připravený. Označ místa, kde náš postup vypadá slabě.',
    x:'AI normu nemusí citovat přesně. Požadavky ověřte v jejím aktuálním znění.' }
];

/* Kurz AI Akcelerátor ve standardní podobě, jak ho ukazuje PDF ke stažení.
   Zdroj: osnova a prezentace „AI 12 hodin“ na sdíleném Disku LifeScale Business.
   Příklady úprav jsou anonymizované podle návrhů kurzů pro klienty. */
const KURZ = {
  nazev: 'AI Akcelerátor',
  podtitul: '12 hodin praktického tréninku ve třech blocích po 4 hodinách',
  oKurzu: 'Dvanáctihodinový kurz, po kterém lidé používají AI v každodenní práci. Učí se na reálných firemních zadáních a každý blok končí výstupem, který jde do práce nasadit ještě týž den. Je pro zaměstnance napříč odděleními, kteří chtějí AI využívat efektivně a bezpečně.',
  moduly: [
    { t: 'Základy AI a efektivní prompting', h: 4,
      body: ['Jak psát přesné pokyny pro AI a které techniky dávají lepší výsledky, třeba zadání s rolí.',
             'Zásady zodpovědného používání AI ve firmě.',
             'Co AI bezpečně svěřit a jak nakládat s citlivými daty.'],
      praxe: 'Každý účastník si sestaví sadu vlastních pokynů pro nejčastější úkoly ve své roli.' },
    { t: 'Automatizace práce s textem a dokumenty', h: 4,
      body: ['Shrnutí smluv, reportů a studií a vytažení klíčových informací.',
             'Zápis s úkoly z nahrávky nebo poznámek z porady.',
             'Práce s PDF, rešerše a odpovědi na e-maily.'],
      praxe: 'Účastníci zpracují reálný dokument nebo záznam z porady a udělají z něj strukturovaný výstup.' },
    { t: 'Tvorba obsahu a vizualizace dat', h: 4,
      body: ['Texty pro e-maily, sociální sítě a marketing, přizpůsobené různým cílovým skupinám.',
             'Rychlá příprava prezentací a výstupních zpráv.',
             'Grafy a vizuální výstupy v nástrojích s AI, třeba v Copilotu nebo Canvě.'],
      praxe: 'Každý připraví jeden hotový text, prezentaci nebo report na vlastním zadání.' }
  ],
  odnesou: [
    ['Promptbook', 'připravené pokyny pro nejčastější pracovní úkoly'],
    ['Checklist bezpečnosti', 'pravidla pro práci s AI a citlivými daty'],
    ['Šablony výstupů', 'vzory zápisů z porad, e-mailů a reportů'],
    ['Přehled nástrojů', 'v čem se liší ChatGPT, Copilot, Gemini a Claude a co kdy použít']
  ],
  forma: 'Prezenčně, standardně 12 hodin ve třech blocích po 4 hodinách. Pro menší týmy připravujeme i jednodenní verzi na 8 hodin.',
  naMiru: [
    'Zaměříme se na nástroje, které už používáte, třeba ChatGPT, Copilot, Gemini nebo Claude.',
    'Obsah přizpůsobíme práci vašich oddělení, třeba obchodu, HR, financím nebo marketingu.',
    'Cvičení postavíme na reálných zadáních z vaší firmy.',
    'Rozsah a tempo nastavíme podle provozu a úrovně skupiny.'
  ],
  priklady: [
    ['HR tým stavební firmy', 'data z Excelu, reporty, prezentace a zápisy ze schůzek, s firemním GPT pro citlivá data.'],
    ['Geodetická kancelář', 'technické zprávy, data z měření a Excel, postavené na Microsoft 365 Copilot.'],
    ['Hotel', 'smíšená skupina z nákupu, HR, obchodu, údržby a úklidu, v každém bloku úlohy pro jejich práci.'],
    ['Softwarová firma', 'podpora dostala pevné základy, obchodníci a konzultanti pravidla a konkrétní postupy.']
  ]
};
