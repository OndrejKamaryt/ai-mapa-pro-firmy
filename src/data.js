/* ---------- data: obory, oddělení a možnosti využití AI ---------- */
// pořadí oborů: výroba jako hlavní cílová skupina první
const OBORY = [
  ['vyroba', 'Výroba a průmysl'], ['auto', 'Automobilový průmysl'], ['logistika', 'Logistika'],
  ['stavebnictvi', 'Stavebnictví'], ['zdravotnictvi', 'Zdravotnictví'], ['fin', 'Finanční služby'],
  ['pravo', 'Advokátní kanceláře'], ['jine', 'Jiný obor']
];
const ODDELENI = [
  ['obchod', 'Obchod'], ['marketing', 'Marketing'],
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
  ['Publicis Groupe', '472ed0f8-7401-4283-a595-3b4d727c284a', 48], ['Colas', '190e5e04-02dc-4644-aa4a-8d25199a14c1', 26],
  ['Accenture', 'dc6bbda4-8421-4c81-8104-01467aed29ed', 28]
];

/* možnosti: d = oddělení, i = obory (prázdné = všechny), u = úspora v hodinách týdně [od, do], l = obtížnost, t = název, w = co to přinese.
   Postupy, pokyny pro AI a upozornění ke každé možnosti jsou v podklady/postupy.json, stránka je nezobrazuje. */
const UC = [
  /* OBCHOD */
  { id:'o1', d:'obchod', i:[], u:[2,3], l:'s', t:'Nabídka z poptávky za pár minut',
    w:'Naučíte se s AI připravit z e-mailu s poptávkou přehled, co klient chce, otázky k doplnění a návrh průvodního e-mailu.' },
  { id:'o2', d:'obchod', i:[], u:[1,2], l:'s', t:'Příprava na schůzku s novým klientem',
    w:'Naučíte se s AI připravit z poznámek a webu klienta jednostránkový podklad: čím se firma zabývá, možné problémy, otázky a námitky.' },
  { id:'o3', d:'obchod', i:[], u:[1,2], l:'s', t:'Zápis do CRM a další kroky po schůzce',
    w:'Naučíte se s AI připravit z přepisu nebo poznámek ze schůzky shrnutí do CRM, seznam dalších kroků a e-mail klientovi.' },
  { id:'o4', d:'obchod', i:[], u:[1,2], l:'s', t:'Trénink námitek s AI',
    w:'Naučíte se trénovat odpovědi na námitky: AI hraje skeptického nákupčího a po každé odpovědi vám dá krátkou zpětnou vazbu.' },
  /* MARKETING */
  { id:'m1', d:'marketing', i:[], u:[2,3], l:'s', t:'Z jednoho článku deset příspěvků',
    w:'Naučíte se s AI připravit z článku, webináře nebo prezentace příspěvky na LinkedIn, tipy do newsletteru a varianty titulků.' },
  { id:'m2', d:'marketing', i:[], u:[1,2], l:'s', t:'Newsletter za hodinu místo za den',
    w:'Naučíte se s AI sestavit z témat a poznámek newsletter: předmět, úvod, krátké bloky a výzvu k akci.' },
  { id:'m3', d:'marketing', i:[], u:[2,4], l:'m', t:'Rozbor recenzí a dotazníků',
    w:'Naučíte se s AI roztřídit odpovědi zákazníků do témat, spočítat zmínky, vybrat typické citace a určit, co zlepšit nejdřív.' },
  { id:'m4', d:'marketing', i:[], u:[1,3], l:'s', t:'Popisy produktů a služeb na web',
    w:'Naučíte se s AI psát z technických parametrů jednotné popisy na web: titulek, perex, přínosy pro zákazníka a parametry.' },
  /* HR */
  { id:'h1', d:'hr', i:[], u:[1,2], l:'s', t:'Inzerát, na který se ozvou ti správní',
    w:'Naučíte se s AI napsat z popisu pozice srozumitelný inzerát s jasnou náplní práce, požadavky a nabídkou.' },
  { id:'h2', d:'hr', i:[], u:[2,3], l:'s', t:'Plán zaškolení na první měsíc',
    w:'Naučíte se s AI sestavit plán onboardingu po týdnech: cíle, s kým se potkat, co si přečíst a jak poznat, že to nováček zvládl.' },
  { id:'h3', d:'hr', i:[], u:[1,2], l:'s', t:'Otázky k pohovoru a hodnoticí karta',
    w:'Naučíte se s AI připravit otázky k pohovoru podle hledaných dovedností a jednoduchou kartu pro férové porovnání uchazečů.' },
  { id:'h4', d:'hr', i:[], u:[1,3], l:'m', t:'Odpovědi na časté dotazy ze směrnic',
    w:'Naučíte se s AI připravit z firemních směrnic srozumitelné odpovědi na časté dotazy zaměstnanců, třeba k dovolené, home office nebo benefitům.' },
  { id:'h5', d:'hr', i:[], u:[1,2], l:'s', t:'Podklady k hodnoticímu rozhovoru',
    w:'Naučíte se s AI připravit z poznámek vedoucího osnovu hodnoticího rozhovoru, otázky a konkrétní zpětnou vazbu bez obecných frází.' },
  { id:'h6', d:'hr', i:[], u:[1,2], l:'m', t:'Proč od vás lidé odcházejí',
    w:'Naučíte se s AI roztřídit odpovědi z výstupních rozhovorů a průzkumů spokojenosti do témat a zjistit, co řešit nejdřív.' },
  { id:'h7', d:'hr', i:[], u:[1,3], l:'m', t:'Roční plán vzdělávání',
    w:'Naučíte se s AI sestavit z požadavků vedoucích a výsledků hodnocení plán školení s prioritami, termíny a odhadem nákladů.' },
  { id:'h8', d:'hr', i:[], u:[0.5,1], l:'s', t:'Oznámení, které si lidé přečtou',
    w:'Naučíte se s AI napsat srozumitelné oznámení o změně směn, mezd nebo benefitů a přeložit ho do jazyka zahraničních kolegů.' },
  /* FINANCE */
  { id:'f1', d:'finance', i:[], u:[1,3], l:'m', t:'Komentář k odchylkám od rozpočtu',
    w:'Naučíte se s AI najít největší odchylky skutečnosti od plánu a napsat k nim srozumitelný komentář pro vedení.' },
  { id:'f2', d:'finance', i:[], u:[0.5,1], l:'s', t:'Upomínky, které nezkazí vztah',
    w:'Naučíte se s AI připravit tři stupně upomínky k neuhrazené faktuře, od přátelské po poslední před vymáháním.' },
  { id:'f3', d:'finance', i:[], u:[1,2], l:'s', t:'Vzorce v Excelu bez hledání na internetu',
    w:'Naučíte se s AI psát vzorce pro český Excel, rozumět jim krok za krokem a ověřit, že počítají správně.' },
  { id:'f4', d:'finance', i:[], u:[1,3], l:'m', t:'Kontrola faktury proti objednávce',
    w:'Naučíte se s AI porovnat fakturu s objednávkou nebo smlouvou a vypsat rozdíly v položkách, cenách, DPH a splatnosti.' },
  /* ZÁKAZNICKÁ PÉČE */
  { id:'z1', d:'pece', i:[], u:[2,4], l:'s', t:'Odpověď na stížnost, která uklidní',
    w:'Naučíte se s AI připravit odpověď na stížnost, která uzná problém, vysvětlí další postup a nabídne konkrétní krok.' },
  { id:'z2', d:'pece', i:[], u:[2,3], l:'m', t:'Šablony na nejčastější dotazy',
    w:'Naučíte se s AI najít v dotazech za poslední měsíc nejčastější témata a ke každému připravit šablonu odpovědi.' },
  { id:'z3', d:'pece', i:[], u:[1,2], l:'s', t:'Zákazník píše anglicky, německy nebo ukrajinsky',
    w:'Naučíte se s AI přeložit zprávu zákazníka, shrnout, co chce, a vaši odpověď přeložit zpátky do jeho jazyka.' },
  { id:'z4', d:'pece', i:[], u:[1,2], l:'m', t:'Zpětná vazba k odpovědím týmu',
    w:'Naučíte se s AI hodnotit vzorek odpovědí týmu podle srozumitelnosti, empatie a toho, jestli řeší problém, a získat ke každé radu.' },
  /* PROVOZ A ODBORNÁ PRÁCE */
  { id:'p1', d:'provoz', i:[], u:[1,3], l:'s', t:'Pracovní postup z poznámek',
    w:'Naučíte se s AI připravit z poznámek zkušeného kolegy přehledný postup: účel, pomůcky, kroky v pořadí, časté chyby a kontrolu.' },
  { id:'p2', d:'provoz', i:[], u:[1,2], l:'s', t:'Hledání příčiny opakovaného problému',
    w:'Naučíte se s AI projít problém metodou 5x proč, otázku po otázce, a na konci shrnout pravděpodobnou příčinu a opatření.' },
  { id:'p3', d:'provoz', i:[], u:[1,2], l:'s', t:'Předávka směny bez zmatků',
    w:'Naučíte se s AI připravit z poznámek ze směny stručnou předávací zprávu: co se stalo, co je rozpracované a na co si dát pozor.' },
  { id:'p4', d:'provoz', i:[], u:[1,2], l:'s', t:'Školení BOZP do mobilu',
    w:'Naučíte se s AI připravit ze směrnice BOZP krátkou lekci: čtyři karty s hlavními pravidly a tři kvízové otázky.' },
  /* VEDENÍ FIRMY */
  { id:'v1', d:'vedeni', i:[], u:[1,2], l:'s', t:'Týdenní přehled pro vedení na jednu stranu',
    w:'Naučíte se s AI připravit z tabulky s čísly přehled: tři hlavní zprávy, co se zlepšilo, co zhoršilo a jaká rozhodnutí jsou potřeba.' },
  { id:'v2', d:'vedeni', i:[], u:[1,1.5], l:'s', t:'Porada s jasným výsledkem',
    w:'Naučíte se s AI připravit program porady s časy, odpovědnými lidmi a výstupy a šablonu zápisu s úkoly.' },
  { id:'v3', d:'vedeni', i:[], u:[1,2], l:'s', t:'Oponentura strategického rozhodnutí',
    w:'Naučíte se nechat AI hrát kritického člena představenstva, který najde argumenty proti, přehlédnutá rizika a otázky, na které chcete znát odpověď.' },
  { id:'v4', d:'vedeni', i:[], u:[0.5,1], l:'m', t:'Pravidla pro používání AI ve firmě',
    w:'Naučíte se s AI navrhnout interní pravidla: jaké nástroje používat, co do nich nevkládat, kdy výstup kontroluje člověk a koho se ptát.' },
  /* STAVEBNICTVÍ */
  { id:'s1', d:'obchod', i:['stavebnictvi'], u:[2,4], l:'m', t:'Kontrola výkazu výměr proti nabídce',
    w:'Naučíte se s AI porovnat výkaz výměr z poptávky s vaší cenovou nabídkou a najít chybějící položky a jiná množství nebo jednotky.' },
  { id:'s2', d:'provoz', i:['stavebnictvi'], u:[1,3], l:'s', t:'Zápis z kontrolního dne',
    w:'Naučíte se s AI připravit z poznámek a hlasového přepisu z kontrolního dne zápis se stavem prací, vadami, termíny a odpovědnými firmami.' },
  /* ZDRAVOTNICTVÍ */
  { id:'zd1', d:'pece', i:['zdravotnictvi'], u:[1,2], l:'s', t:'Srozumitelné pokyny pro pacienta',
    w:'Naučíte se s AI přepsat odborné pokyny po vyšetření nebo zákroku do srozumitelné češtiny pro laika, bez změny medicínského obsahu.' },
  { id:'zd2', d:'vedeni', i:['zdravotnictvi'], u:[1,3], l:'m', t:'Rozpis služeb a zástupů',
    w:'Naučíte se s AI navrhnout rozpis služeb podle vašich pravidel a zjistit, kde je nejde splnit.' },
  /* LOGISTIKA */
  { id:'l1', d:'pece', i:['logistika'], u:[2,4], l:'m', t:'Odpověď na dotaz, kde je zásilka',
    w:'Naučíte se s AI připravit ze stavu v systému odpověď zákazníkovi: kde zásilka je, kdy dorazí a co dělat, když nebude doma.' },
  { id:'l2', d:'vedeni', i:['logistika'], u:[1,3], l:'m', t:'Rozbor škod a reklamací za měsíc',
    w:'Naučíte se s AI najít v reklamacích a škodách opakující se vzorce podle tras, typů a dnů a navrhnout opatření s největším dopadem.' },
  /* FINANČNÍ SLUŽBY */
  { id:'fs1', d:'obchod', i:['fin'], u:[1,2], l:'m', t:'Přehled firmy z výroční zprávy',
    w:'Naučíte se s AI připravit z výroční zprávy klienta přehled hlavních ukazatelů, změn a rizik a otázky na schůzku.' },
  { id:'fs2', d:'marketing', i:['fin'], u:[1,2], l:'s', t:'Srozumitelné vysvětlení produktu',
    w:'Naučíte se s AI vysvětlit finanční produkt člověku bez finančního vzdělání: co to je, pro koho se hodí, poplatky a rizika.' },
  /* ADVOKÁTNÍ KANCELÁŘE */
  { id:'a1', d:'provoz', i:['pravo'], u:[2,4], l:'m', t:'První verze smlouvy z vaší šablony',
    w:'Naučíte se s AI připravit podle vaší šablony a podmínek obchodu první verzi smlouvy, označit změny a vypsat nejasná místa jako otázky.' },
  { id:'a2', d:'provoz', i:['pravo'], u:[2,4], l:'m', t:'Časová osa a shrnutí spisu',
    w:'Naučíte se s AI sestavit z dokumentů ke kauze časovou osu s odkazy, shrnout stanoviska stran a najít rozpory.' },
  /* VÝROBA A PRŮMYSL */
  { id:'vy1', d:'provoz', i:['vyroba'], u:[1,2], l:'s', t:'Návod ke stroji v jazyce operátora',
    w:'Naučíte se s AI přepsat návod ke stroji do krátkého postupu pro operátora a přeložit ho, třeba do ukrajinštiny nebo vietnamštiny.' },
  { id:'vy2', d:'provoz', i:['vyroba'], u:[1,2], l:'m', t:'Plán preventivní údržby',
    w:'Naučíte se s AI navrhnout z intervalů v návodech a historie poruch plán údržby na čtvrtletí a zjistit, kde interval nestačí.' },
  /* AUTOMOTIVE */
  { id:'au1', d:'provoz', i:['auto'], u:[2,4], l:'m', t:'Návrh 8D reportu k reklamaci',
    w:'Naučíte se s AI připravit pracovní verzi 8D reportu a u každého kroku zjistit, co chybí a koho se zeptat.' },
  { id:'au2', d:'vedeni', i:['auto'], u:[1,3], l:'m', t:'Příprava na audit podle IATF',
    w:'Naučíte se s AI projít váš postup a vypsat otázky, které auditor pravděpodobně položí, i důkazy, které máte mít připravené.' },
  /* další možnosti pro obory, čtyři ke každému */
  { id:'vy3', d:'provoz', i:['vyroba'], u:[1,2], l:'s', t:'Hlášení neshody bez dohadování',
    w:'Naučíte se s AI připravit z poznámek mistra a fotky vady jasné hlášení neshody: co se stalo, kde, kolik kusů a jaké je okamžité opatření.' },
  { id:'vy4', d:'obchod', i:['vyroba'], u:[2,3], l:'m', t:'Technická poptávka bez přehlédnutí',
    w:'Naučíte se s AI vytáhnout z poptávky a výkresu materiál, rozměry, tolerance a termín a připravit otázky, které je potřeba doptat.' },
  { id:'vy5', d:'vedeni', i:['vyroba'], u:[1,3], l:'m', t:'Rozbor prostojů za měsíc',
    w:'Naučíte se s AI najít v záznamech o prostojích nejčastější příčiny, spočítat, kolik času stojí, a navrhnout, čím začít.' },
  { id:'vy6', d:'finance', i:['vyroba'], u:[1,2], l:'m', t:'Kontrola kalkulace zakázky',
    w:'Naučíte se s AI sestavit kalkulaci zakázky z materiálu, strojních hodin a režie a najít položky, kde marže nevychází.' },
  { id:'au3', d:'provoz', i:['auto'], u:[2,4], l:'m', t:'PFMEA bez prázdných políček',
    w:'Naučíte se s AI projít návrh PFMEA, doplnit možné vady, příčiny a kontroly a označit řádky, kde chybí opatření.' },
  { id:'au4', d:'obchod', i:['auto'], u:[2,3], l:'m', t:'Zákaznické požadavky na jedné stránce',
    w:'Naučíte se s AI shrnout dlouhé požadavky odběratele (CSR) do přehledu, co se týká vaší výroby, kontroly a dokumentace.' },
  { id:'au5', d:'provoz', i:['auto'], u:[1,2], l:'s', t:'Kontrolní plán srozumitelně pro dílnu',
    w:'Naučíte se s AI převést kontrolní plán do listu pro kontrolora: co měřit, čím, jak často a co dělat při odchylce.' },
  { id:'au6', d:'hr', i:['auto'], u:[1,2], l:'m', t:'Matice kvalifikací operátorů',
    w:'Naučíte se s AI sestavit z přehledu školení matici kvalifikací a zjistit, na kterých pracovištích chybí zástup.' },
  { id:'l3', d:'provoz', i:['logistika'], u:[1,2], l:'s', t:'Instrukce pro řidiče a skladníky',
    w:'Naučíte se s AI napsat krátké instrukce v jazyce řidičů a skladníků: postup nakládky, potřebné doklady a co dělat při problému.' },
  { id:'l4', d:'obchod', i:['logistika'], u:[2,3], l:'m', t:'Nabídka na přepravu z poptávky',
    w:'Naučíte se s AI připravit z poptávky přehled trasy, objemu a požadavků a návrh odpovědi s cenou a podmínkami.' },
  { id:'l5', d:'finance', i:['logistika'], u:[1,3], l:'s', t:'Kontrola faktur od dopravců',
    w:'Naučíte se s AI porovnat faktury dopravců s objednávkami a ceníkem a vypsat rozdíly v sazbách, příplatcích a mýtném.' },
  { id:'l6', d:'vedeni', i:['logistika'], u:[1,2], l:'m', t:'Týdenní přehled skladu',
    w:'Naučíte se s AI připravit z exportu ze skladového systému přehled vychystaných zakázek, chyb a zpoždění s komentářem pro vedení.' },
  { id:'s3', d:'provoz', i:['stavebnictvi'], u:[2,3], l:'s', t:'Stavební deník z hlasové poznámky',
    w:'Naučíte se s AI připravit z hlasové poznámky a fotek denní záznam do stavebního deníku: počasí, práce, lidé, stroje a události.' },
  { id:'s4', d:'obchod', i:['stavebnictvi'], u:[2,4], l:'m', t:'Rozbor zadávací dokumentace',
    w:'Naučíte se s AI projít zadávací dokumentaci, vypsat požadavky, termíny a rizika a připravit osnovu nabídky.' },
  { id:'s5', d:'provoz', i:['stavebnictvi'], u:[1,2], l:'s', t:'Soupis vad a nedodělků při předání',
    w:'Naučíte se s AI připravit z poznámek z přejímky soupis vad s místem, odpovědnou firmou a termínem odstranění.' },
  { id:'s6', d:'finance', i:['stavebnictvi'], u:[1,3], l:'m', t:'Vícepráce a změnové listy',
    w:'Naučíte se s AI porovnat změny od investora s rozpočtem, sepsat vícepráce a připravit podklad pro změnový list.' },
  { id:'zd3', d:'pece', i:['zdravotnictvi'], u:[1,2], l:'s', t:'Odpovědi pacientům na časté dotazy',
    w:'Naučíte se s AI připravit šablony odpovědí na časté dotazy pacientů: objednání, příprava na vyšetření a co si přinést.' },
  { id:'zd4', d:'provoz', i:['zdravotnictvi'], u:[1,2], l:'m', t:'Ošetřovatelský postup ze směrnice',
    w:'Naučíte se s AI převést interní směrnici do přehledného postupu pro sestry s jednotlivými kroky a kontrolním listem.' },
  { id:'zd5', d:'vedeni', i:['zdravotnictvi'], u:[2,3], l:'m', t:'Příprava na akreditaci',
    w:'Naučíte se s AI projít akreditační standardy, vypsat, jaké dokumenty a důkazy potřebujete, a najít, co chybí.' },
  { id:'zd6', d:'marketing', i:['zdravotnictvi'], u:[1,2], l:'s', t:'Srozumitelné texty na web',
    w:'Naučíte se s AI napsat srozumitelné popisy služeb a vyšetření na web, bez odborného žargonu a bez slibů, které dávat nesmíte.' },
  { id:'fs3', d:'obchod', i:['fin'], u:[1,2], l:'s', t:'Záznam z jednání s klientem',
    w:'Naučíte se s AI připravit z poznámek ze schůzky záznam z jednání: potřeby klienta, doporučení a jeho zdůvodnění.' },
  { id:'fs4', d:'vedeni', i:['fin'], u:[1,2], l:'m', t:'Co se mění v regulaci',
    w:'Naučíte se s AI shrnout dlouhý regulatorní dokument nebo metodiku do přehledu, co se mění, od kdy a koho se to týká.' },
  { id:'fs5', d:'finance', i:['fin'], u:[1,3], l:'m', t:'Kontrola podkladů od klienta',
    w:'Naučíte se s AI projít podklady od klienta, vypsat chybějící dokumenty a najít nesrovnalosti v číslech.' },
  { id:'fs6', d:'pece', i:['fin'], u:[1,2], l:'s', t:'Srozumitelné oznámení o změně podmínek',
    w:'Naučíte se s AI přepsat oznámení o změně podmínek do srozumitelného e-mailu: co se mění, od kdy a co má klient udělat.' },
  { id:'a3', d:'provoz', i:['pravo'], u:[1,2], l:'s', t:'Porovnání dvou verzí smlouvy',
    w:'Naučíte se s AI porovnat dvě verze smlouvy, vypsat podstatné změny a označit, co je pro klienta nevýhodné.' },
  { id:'a4', d:'pece', i:['pravo'], u:[1,2], l:'s', t:'Srozumitelný e-mail klientovi',
    w:'Naučíte se s AI napsat klientovi srozumitelně, co ho v řízení čeká, jaké jsou termíny a co od něj potřebujete.' },
  { id:'a5', d:'provoz', i:['pravo'], u:[3,5], l:'m', t:'První průchod při due diligence',
    w:'Naučíte se s AI projít balík smluv a vypsat do tabulky strany, dobu trvání, výpovědní lhůty a rizikové klauzule.' },
  { id:'a6', d:'finance', i:['pravo'], u:[1,2], l:'s', t:'Výkaz práce pro klienta',
    w:'Naučíte se s AI připravit z poznámek a e-mailů srozumitelný výkaz odvedené práce, který klient pochopí bez dalšího vysvětlování.' }
];
