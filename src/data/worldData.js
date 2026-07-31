export const DETAILED_COUNTRY_SPECS = [
  ['Spain','Europe','Liga ACB','Copa del Rey','Supercopa Endesa','Primera FEB'],
  ['France','Europe','LNB Pro A','French Cup','French Champions Match','Pro B'],
  ['Germany','Europe','Basketball Bundesliga','German Cup','German Champions Cup','ProA Germany'],
  ['Italy','Europe','Lega Basket Serie A','Italian Cup','Italian Super Cup','Serie A2'],
  ['Greece','Europe','Greek League','Greek Cup','Greek Super Cup','Greek A2'],
  ['Turkey','Europe','Turkish BSL','Turkish Cup','Turkish Presidents Cup','Turkish TBL'],
  ['Serbia','Europe','KLS Serbia','Serbian Cup','Serbian Super Cup','Serbian Second League'],
  ['Lithuania','Europe','Lithuanian LKL','King Mindaugas Cup','Lithuanian Super Cup','NKL Lithuania'],
  ['Israel','Europe','Israeli Premier League','Israeli State Cup','Israeli Winner Cup','Israeli National League'],
  ['Russia','Europe','VTB United League','Russian Cup','VTB Super Cup','Russian Superleague'],
  ['Croatia','Europe','Croatian League','Kresimir Cosic Cup','Croatian Super Cup',null],
  ['Slovenia','Europe','Slovenian League','Slovenian Cup','Slovenian Super Cup',null],
  ['Poland','Europe','Polish League','Polish Cup','Polish Super Cup',null],
  ['Argentina','South America','Liga Nacional','Copa Super 20','Supercopa Argentina',null],
  ['Brazil','South America','NBB Brazil','Copa Super 8','Supercopa Brazil',null],
  ['Mexico','North America','LNBP Mexico','Copa Value','Campeon de Campeones',null],
  ['Puerto Rico','North America','BSN Puerto Rico','Copa BSN','Supercopa Puerto Rico',null],
  ['Canada','North America','CEBL Canada','CEBL Championship Weekend',null,null],
  ['China','Asia','CBA','CBA Cup','CBA Super Cup',null],
  ['Japan','Asia','B.League','Emperor\'s Cup','B.League Super Cup',null],
  ['South Korea','Asia','Korean KBL','KBL Cup','KBL Super Cup',null],
  ['Philippines','Asia','Philippine PBA','Philippine Cup','PBA Champions Cup',null],
  ['Australia','Oceania','NBL Australia','NBL Cup','NBL Champions Game',null],
  ['New Zealand','Oceania','New Zealand NBL','New Zealand Cup',null,null],
];

export const SUMMARY_COUNTRY_SPECS = [
  ['Latvia','Europe','Latvian League'],['Finland','Europe','Finnish Korisliiga'],['Georgia','Europe','Georgian Superliga'],
  ['Czechia','Europe','Czech NBL'],['Ukraine','Europe','Ukrainian SuperLeague'],['Montenegro','Europe','Montenegrin League'],
  ['Bosnia and Herzegovina','Europe','Bosnian League'],['Belgium','Europe','BNXT League'],['Netherlands','Europe','BNXT League'],
  ['Portugal','Europe','Portuguese LPB'],['Sweden','Europe','Swedish Basketligan'],['Denmark','Europe','Danish Basketligaen'],
  ['Iceland','Europe','Icelandic Urvalsdeild'],['Hungary','Europe','Hungarian NB I/A'],['Romania','Europe','Romanian Liga Nationala'],
  ['Bulgaria','Europe','Bulgarian NBL'],['Switzerland','Europe','Swiss Basketball League'],['Austria','Europe','Austrian Superliga'],
  ['Dominican Republic','North America','LNB Dominican Republic'],
  ['Venezuela','South America','SPB Venezuela'],['Uruguay','South America','Uruguayan League'],['Colombia','South America','Liga WPlay'],
  ['Iran','Asia','Iranian Super League'],['Lebanon','Asia','Lebanese Basketball League'],['Jordan','Asia','Jordanian Premier League'],
  ['Angola','Africa','Angolan League'],['Tunisia','Africa','Tunisian Pro A'],['Egypt','Africa','Egyptian Super League'],
  ['Nigeria','Africa','Nigerian Premier League'],['Senegal','Africa','Senegalese Division I'],
];

export const NATIONAL_TEAM_COUNTRIES = [
  'USA','Canada','Mexico','Puerto Rico','Dominican Republic','Bahamas','Panama',
  'Argentina','Brazil','Venezuela','Uruguay','Colombia',
  'Spain','France','Serbia','Greece','Turkey','Italy','Germany','Lithuania','Israel','Russia','Slovenia','Croatia','Poland',
  'Latvia','Finland','Georgia','Czechia','Ukraine','Montenegro','Bosnia and Herzegovina','Belgium','Netherlands','Portugal','Sweden','Denmark','Iceland','Hungary','Romania','Bulgaria','Switzerland','Austria',
  'Australia','New Zealand','China','Japan','South Korea','Philippines','Iran','Lebanon','Jordan','India','Saudi Arabia','Qatar','Bahrain','Kazakhstan','Chinese Taipei','Indonesia',
  'Nigeria','Senegal','Angola','Tunisia','Egypt','Cameroon','Ivory Coast','Mali','South Sudan','DR Congo','Cape Verde','Uganda','Rwanda','Kenya','Guinea','Mozambique',
];

export const NATIONAL_COLORS = {
  USA:'#1D428A',Canada:'#D71920',Mexico:'#006847','Puerto Rico':'#0038A8','Dominican Republic':'#002D62',Bahamas:'#00ABC9',Panama:'#DA121A',
  Argentina:'#75AADB',Brazil:'#009739',Venezuela:'#F4C300',Uruguay:'#5BC0EB',Colombia:'#FCD116',
  Spain:'#C60B1E',France:'#0055A4',Serbia:'#C6363C',Greece:'#0D5EAF',Turkey:'#E30A17',Italy:'#008C45',Germany:'#111111',
  Lithuania:'#FDB913',Israel:'#1D428A',Russia:'#D52B1E',Slovenia:'#005DA4',Croatia:'#FF0000',Poland:'#DC143C',Latvia:'#9E3039',
  Finland:'#003580',Georgia:'#FF0000',Czechia:'#11457E',Ukraine:'#0057B8',Montenegro:'#C40308','Bosnia and Herzegovina':'#002395',
  Belgium:'#111111',Netherlands:'#F36C21',Portugal:'#006600',Sweden:'#006AA7',Denmark:'#C60C30',Iceland:'#02529C',Hungary:'#CE2939',Romania:'#002B7F',Bulgaria:'#00966E',Switzerland:'#D52B1E',Austria:'#ED2939',Australia:'#FFCD00','New Zealand':'#111111',China:'#DE2910',Japan:'#BC002D',
  'South Korea':'#003478',Philippines:'#0038A8',Iran:'#239F40',Lebanon:'#ED1C24',Jordan:'#007A3D',India:'#FF9933','Saudi Arabia':'#006C35',Qatar:'#8A1538',Bahrain:'#CE1126',Kazakhstan:'#00AFCA','Chinese Taipei':'#000095',Indonesia:'#CE1126',
  Nigeria:'#008753',Senegal:'#00853F',Angola:'#CC092F',Tunisia:'#E70013',Egypt:'#CE1126',Cameroon:'#007A5E','Ivory Coast':'#F77F00',
  Mali:'#14B53A','South Sudan':'#078930','DR Congo':'#007FFF','Cape Verde':'#003893',Uganda:'#FCDC04',Rwanda:'#00A1DE',Kenya:'#006600',Guinea:'#CE1126',Mozambique:'#007168',
};

const T = (country, league, rows) => rows.map(([name,color,tier=1]) => ({ name,country,league,color,tier }));

export const EXPANDED_REAL_TEAMS = [
  ...T('Spain','Liga ACB',[
    ['Real Madrid','#FEBE10'],['FC Barcelona','#A50044'],['Baskonia','#0B4DA2'],['Valencia Basket','#F58220'],
    ['Unicaja Malaga','#006633'],['Joventut Badalona','#00843D'],['Gran Canaria','#F4C430'],['UCAM Murcia','#C8102E'],
    ['La Laguna Tenerife','#F7C600'],['BAXI Manresa','#D71920'],['Bilbao Basket','#111111'],['Basket Zaragoza','#D71920'],
    ['MoraBanc Andorra','#0057B8'],['Rio Breogan','#1D428A'],['Basquet Girona','#C8102E'],['Forca Lleida','#003DA5'],
    ['Coviran Granada','#C8102E'],['Coruna','#1D428A']]),
  ...T('Spain','Primera FEB',[["Movistar Estudiantes",'#6A1B9A',2],['San Pablo Burgos','#002D62',2],['Palencia Baloncesto','#5B2C83',2],['Fuenlabrada','#F58220',2]]),
  ...T('France','LNB Pro A',[
    ['AS Monaco','#E2001A'],['Paris Basketball','#111111'],['ASVEL','#111111'],['JL Bourg','#D71920'],['Limoges CSP','#007A33'],
    ['Nanterre 92','#007A33'],['Strasbourg IG','#C8102E'],['Le Mans Sarthe','#F58220'],['Cholet Basket','#C8102E'],['Dijon Basket','#111111'],
    ['Gravelines-Dunkerque','#F58220'],['Nancy Basket','#C8102E'],['Le Portel','#1D428A'],['Chalon-sur-Saone','#C8102E'],['Saint-Quentin','#1D428A'],['La Rochelle','#F7C600']]),
  ...T('Germany','Basketball Bundesliga',[
    ['Bayern Munich','#DC052D'],['ALBA Berlin','#FFDD00'],['Ratiopharm Ulm','#F58220'],['Telekom Baskets Bonn','#E2001A'],
    ['Wurzburg Baskets','#C8102E'],['MHP Riesen Ludwigsburg','#F7C600'],['Brose Bamberg','#C8102E'],['EWE Baskets Oldenburg','#F7C600'],
    ['Niners Chemnitz','#F58220'],['Rostock Seawolves','#1D428A'],['Hamburg Towers','#111111'],['Basketball Lowen Braunschweig','#F7C600'],
    ['Mitteldeutscher BC','#F58220'],['Frankfurt Skyliners','#1D428A'],['Gottingen','#6A1B9A'],['Vechta','#C8102E']]),
  ...T('Italy','Lega Basket Serie A',[
    ['Virtus Bologna','#111111'],['Olimpia Milano','#D71920'],['Reyer Venezia','#7A263A'],['Pallacanestro Brescia','#1D428A'],
    ['Dinamo Sassari','#1D428A'],['Pallacanestro Varese','#C8102E'],['Aquila Trento','#111111'],['Reggiana','#C8102E'],
    ['Treviso Basket','#1D428A'],['Derthona Basket','#111111'],['Trieste','#C8102E'],['Scafati','#F7C600'],
    ['Cremona','#1D428A'],['Napoli Basket','#0057B8'],['Trapani Shark','#C8102E'],['Pistoia Basket','#F58220']]),
  ...T('Greece','Greek League',[
    ['Olympiacos','#D71920'],['Panathinaikos','#007A33'],['AEK Athens','#F7C600'],['Aris','#F7C600'],['PAOK','#111111'],
    ['Promitheas Patras','#E2001A'],['Peristeri','#1D428A'],['Panionios','#C8102E'],['Maroussi','#F7C600'],['Kolossos Rhodes','#1D428A'],
    ['Lavrio','#1D428A'],['Karditsa','#1D428A']]),
  ...T('Turkey','Turkish BSL',[
    ['Fenerbahce','#FFED00'],['Anadolu Efes','#1B4FA3'],['Besiktas','#111111'],['Galatasaray','#A90432'],['Turk Telekom','#1D428A'],
    ['Tofas Bursa','#0057B8'],['Bahcesehir Koleji','#C8102E'],['Karsiyaka','#007A33'],['Bursaspor','#007A33'],['Darussafaka','#007A33'],
    ['Petkim Spor','#1D428A'],['Merkezefendi','#6A1B9A'],['Buyukcekmece','#1D428A'],['Manisa Basket','#F7C600'],['Yalovaspor','#3A7D44'],['Mersin MSK','#C8102E']]),
  ...T('Serbia','KLS Serbia',[
    ['Partizan','#111111'],['Crvena zvezda','#D71920'],['Mega Basket','#F05A28'],['FMP Belgrade','#C8102E'],['Spartak Subotica','#1D428A'],
    ['Borac Cacak','#D71920'],['Vojvodina','#C8102E'],['Zlatibor','#F7C600'],['Metalac Valjevo','#1D428A'],['Dynamic Belgrade','#F58220'],
    ['Sloga Kraljevo','#C8102E'],['Tamis Pancevo','#1D428A']]),
  ...T('Lithuania','Lithuanian LKL',[
    ['Zalgiris Kaunas','#007A33'],['Rytas Vilnius','#C8102E'],['Wolves Vilnius','#111111'],['Lietkabelis','#7A263A'],['Neptunas Klaipeda','#1D428A'],
    ['Juventus Utena','#C8102E'],['Siauliai','#F7C600'],['Jonava','#1D428A'],['Mazeikiai','#C8102E'],['Nevėzis','#007A33']]),
  ...T('Israel','Israeli Premier League',[
    ['Maccabi Tel Aviv','#F7C600'],['Hapoel Tel Aviv','#D71920'],['Hapoel Jerusalem','#C8102E'],['Hapoel Holon','#6A1B9A'],
    ['Bnei Herzliya','#1D428A'],['Maccabi Ramat Gan','#1D428A'],['Ironi Kiryat Ata','#C8102E'],['Hapoel Gilboa Galil','#C8102E'],
    ['Hapoel Beer Sheva','#C8102E'],['Ironi Ness Ziona','#F58220'],['Maccabi Rishon','#F7C600'],['Elitzur Netanya','#F7C600']]),
  ...T('Russia','VTB United League',[
    ['CSKA Moscow','#C8102E'],['Zenit Saint Petersburg','#1D428A'],['UNICS Kazan','#007A33'],['Lokomotiv Kuban','#C8102E'],['Parma Perm','#1D428A'],
    ['Uralmash','#F58220'],['Nizhny Novgorod','#111111'],['Enisey Krasnoyarsk','#1D428A'],['Avtodor Saratov','#111111'],['Samara','#1D428A'],
    ['MBA Moscow','#C8102E'],['Dynamo Vladivostok','#1D428A']]),
  ...T('Croatia','Croatian League',[
    ['Cibona Zagreb','#1D428A'],['Split','#F7C600'],['Zadar','#1D428A'],['Cedevita Junior','#F58220'],['Dubrava','#F7C600'],['Sibenka','#F58220'],['Alkar','#1D428A'],['Kvarner','#1D428A']]),
  ...T('Slovenia','Slovenian League',[
    ['Cedevita Olimpija','#F58220'],['Krka Novo Mesto','#007A33'],['Helios Suns','#F7C600'],['Ilirija','#1D428A'],['Sentjur','#1D428A'],['Podcetrtek','#007A33'],['Skofja Loka','#C8102E'],['Rogaska','#1D428A']]),
  ...T('Poland','Polish League',[
    ['Slask Wroclaw','#007A33'],['Anwil Wloclawek','#1D428A'],['Trefl Sopot','#F7C600'],['Legia Warsaw','#007A33'],['Stal Ostrow','#C8102E'],['King Szczecin','#1D428A'],['Start Lublin','#C8102E'],['Arka Gdynia','#F7C600']]),
  ...T('Argentina','Liga Nacional',[
    ['Boca Juniors','#0057B8'],['Instituto Cordoba','#D71920'],['Quimsa','#003DA5'],['Penarol Mar del Plata','#1D428A'],['San Lorenzo','#C8102E'],['Obras Sanitarias','#F7C600'],
    ['Ferro Carril Oeste','#007A33'],['Atenas Cordoba','#007A33'],['Regatas Corrientes','#1D428A'],['Olimpico La Banda','#111111'],['Gimnasia Comodoro','#007A33'],['Platense','#6A1B9A']]),
  ...T('Brazil','NBB Brazil',[
    ['Flamengo','#C8102E'],['Franca','#1D428A'],['Minas Tenis Clube','#1D428A'],['Bauru Basket','#C8102E'],['Sao Paulo FC','#C8102E'],['Corinthians','#111111'],
    ['Brasilia','#1D428A'],['Paulistano','#C8102E'],['Pinheiros','#1D428A'],['Unifacisa','#1D428A'],['Mogi das Cruzes','#C8102E'],['Sesi Araraquara','#F58220']]),
  ...T('Mexico','LNBP Mexico',[
    ['Fuerza Regia','#1D428A'],['Astros de Jalisco','#C8102E'],['Halcones de Xalapa','#6A1B9A'],['Soles de Mexicali','#F58220'],['Mineros de Zacatecas','#C8102E'],['Panteras de Aguascalientes','#F7C600'],['Dorados de Chihuahua','#F7C600'],['Plateros de Fresnillo','#1D428A']]),
  ...T('Puerto Rico','BSN Puerto Rico',[
    ['Vaqueros de Bayamon','#1D428A'],['Capitanes de Arecibo','#C8102E'],['Cangrejeros de Santurce','#F58220'],['Leones de Ponce','#C8102E'],['Mets de Guaynabo','#1D428A'],['Criollos de Caguas','#C8102E'],['Gigantes de Carolina','#1D428A'],['Santeros de Aguada','#007A33']]),
  ...T('Canada','CEBL Canada',[
    ['Scarborough Shooting Stars','#1D428A'],['Niagara River Lions','#F58220'],['Vancouver Bandits','#007A33'],['Calgary Surge','#C8102E'],['Ottawa BlackJacks','#111111'],['Winnipeg Sea Bears','#1D428A'],['Edmonton Stingers','#F7C600'],['Montreal Alliance','#1D428A']]),
  ...T('China','CBA',[
    ['Beijing Ducks','#1D428A'],['Guangdong Southern Tigers','#D71920'],['Shanghai Sharks','#0057B8'],['Liaoning Flying Leopards','#C8102E'],['Zhejiang Golden Bulls','#C8102E'],['Xinjiang Flying Tigers','#1D428A'],['Shenzhen Leopards','#C8102E'],['Shandong Heroes','#F58220'],['Beijing Royal Fighters','#1D428A'],['Guangzhou Loong Lions','#C8102E'],['Nanjing Monkey Kings','#F58220'],['Qingdao Eagles','#1D428A']]),
  ...T('Japan','B.League',[
    ['Chiba Jets','#D71920'],['Alvark Tokyo','#111111'],['Ryukyu Golden Kings','#F58220'],['Utsunomiya Brex','#F7C600'],['Osaka Evessa','#C8102E'],['Nagoya Diamond Dolphins','#C8102E'],['Sunrockers Shibuya','#F7C600'],['Yokohama B-Corsairs','#1D428A'],['Kawasaki Brave Thunders','#C8102E'],['Shimano Susanoo Magic','#1D428A'],['Gunma Crane Thunders','#F7C600'],['San-en NeoPhoenix','#F58220']]),
  ...T('South Korea','Korean KBL',[
    ['Seoul SK Knights','#C8102E'],['Busan KCC Egis','#1D428A'],['Anyang Jung Kwan Jang','#C8102E'],['Changwon LG Sakers','#7A263A'],['Suwon KT Sonicboom','#1D428A'],['Wonju DB Promy','#007A33'],['Daegu KOGAS Pegasus','#1D428A'],['Ulsan Hyundai Mobis Phoebus','#1D428A']]),
  ...T('Philippines','Philippine PBA',[
    ['San Miguel Beermen','#C8102E'],['Barangay Ginebra','#C8102E'],['TNT Tropang Giga','#1D428A'],['Meralco Bolts','#F58220'],['Magnolia Hotshots','#1D428A'],['Rain or Shine Elasto Painters','#F7C600'],['NorthPort Batang Pier','#F58220'],['NLEX Road Warriors','#1D428A']]),
  ...T('Australia','NBL Australia',[
    ['Sydney Kings','#5B2C83'],['Melbourne United','#111111'],['Perth Wildcats','#D71920'],['Illawarra Hawks','#E2001A'],['Adelaide 36ers','#C8102E'],['Brisbane Bullets','#1D428A'],['Cairns Taipans','#F58220'],['New Zealand Breakers','#111111'],['South East Melbourne Phoenix','#F58220'],['Tasmania JackJumpers','#007A33']]),
  ...T('New Zealand','New Zealand NBL',[
    ['Auckland Tuatara','#1D428A'],['Wellington Saints','#F7C600'],['Canterbury Rams','#C8102E'],['Otago Nuggets','#F7C600'],['Nelson Giants','#1D428A'],['Taranaki Airs','#C8102E'],['Hawkes Bay Hawks','#111111'],['Southland Sharks','#1D428A']]),
];

export const SUMMARY_REAL_TEAMS = [
  ...T('Latvia','Latvian League',[['VEF Riga','#111111'],['Ventspils','#F7C600'],['Valmiera Glass','#1D428A'],['Liepaja','#C8102E'],['Ogre','#F58220'],['Rigas Zelli','#F58220']]),
  ...T('Finland','Finnish Korisliiga',[['Helsinki Seagulls','#F7C600'],['Karhu Basket','#C8102E'],['Kataja Basket','#1D428A'],['Salon Vilpas','#C8102E'],['Kouvot','#1D428A'],['BC Nokia','#111111']]),
  ...T('Georgia','Georgian Superliga',[['Kutaisi 2010','#1D428A'],['TSU Tbilisi','#1D428A'],['Rustavi','#C8102E'],['Batumi','#1D428A'],['Titebi','#F58220'],['Kavkasia','#007A33']]),
  ...T('Czechia','Czech NBL',[['Nymburk','#1D428A'],['Opava','#F7C600'],['Brno','#C8102E'],['Decin','#1D428A'],['Pardubice','#C8102E'],['Usti nad Labem','#1D428A']]),
  ...T('Ukraine','Ukrainian SuperLeague',[['Budivelnyk Kyiv','#F7C600'],['Dnipro','#1D428A'],['Kyiv-Basket','#F58220'],['Cherkaski Mavpy','#C8102E'],['Zaporizhzhia','#1D428A'],['BIPA Odessa','#1D428A']]),
  ...T('Montenegro','Montenegrin League',[['Buducnost','#1D428A'],['Mornar Bar','#C8102E'],['Sutjeska','#1D428A'],['Podgorica','#F58220'],['Lovcen','#C8102E'],['Teodo Tivat','#1D428A']]),
  ...T('Bosnia and Herzegovina','Bosnian League',[['Igokea','#1D428A'],['Bosna Sarajevo','#7A263A'],['Siroki','#1D428A'],['Sloboda Tuzla','#C8102E'],['Borac Banja Luka','#C8102E'],['Spars Sarajevo','#F58220']]),
  ...T('Belgium','BNXT League',[['Oostende','#F7C600'],['Antwerp Giants','#C8102E'],['Spirou Charleroi','#C8102E'],['Limburg United','#1D428A'],['Leuven Bears','#1D428A'],['Mons-Hainaut','#F58220']]),
  ...T('Netherlands','BNXT League',[['Leiden','#1D428A'],['Den Bosch','#C8102E'],['Donar Groningen','#1D428A'],['Landstede Hammers','#111111'],['Feyenoord Basketball','#C8102E'],['BAL Weert','#F58220']]),
  ...T('Portugal','Portuguese LPB',[['Benfica','#C8102E'],['Sporting CP','#007A33'],['FC Porto','#1D428A'],['Oliveirense','#007A33'],['Ovarense','#C8102E'],['Vitoria Guimaraes','#111111']]),
  ...T('Sweden','Swedish Basketligan',[['Norrkoping Dolphins','#F58220'],['Sodertalje BBK','#1D428A'],['Borås Basket','#C8102E'],['Jamtland Basket','#007A33'],['Lulea Basket','#1D428A'],['Koping Stars','#111111']]),
  ...T('Denmark','Danish Basketligaen',[['Bakken Bears','#1D428A'],['Horsens IC','#F7C600'],['Svendborg Rabbits','#C8102E'],['Team FOG Naestved','#007A33'],['Randers Cimbria','#1D428A'],['Copenhagen Basketball','#111111']]),
  ...T('Iceland','Icelandic Urvalsdeild',[['Valur','#C8102E'],['Keflavik','#1D428A'],['Njarðvik','#007A33'],['Stjarnan','#1D428A'],['Tindastoll','#7A263A'],['Grindavik','#F7C600']]),
  ...T('Hungary','Hungarian NB I/A',[['Falco Szombathely','#F7C600'],['Szolnoki Olaj','#C8102E'],['Alba Fehervar','#1D428A'],['Kormend','#C8102E'],['Atomeromu','#1D428A'],['Sopron KC','#007A33']]),
  ...T('Romania','Romanian Liga Nationala',[['U-BT Cluj-Napoca','#111111'],['CSO Voluntari','#1D428A'],['Oradea','#C8102E'],['Dinamo Bucharest','#C8102E'],['Rapid Bucharest','#7A263A'],['Sibiu','#F7C600']]),
  ...T('Bulgaria','Bulgarian NBL',[['Rilski Sportist','#1D428A'],['Levski Sofia','#1D428A'],['Balkan Botevgrad','#007A33'],['CSKA Sofia','#C8102E'],['Spartak Pleven','#1D428A'],['Cherno More','#007A33']]),
  ...T('Switzerland','Swiss Basketball League',[['Fribourg Olympic','#1D428A'],['Lions de Geneve','#C8102E'],['Massagno','#111111'],['Monthey','#F7C600'],['Neuchatel','#1D428A'],['Starwings Basel','#C8102E']]),
  ...T('Austria','Austrian Superliga',[['Vienna Timberwolves','#111111'],['Swans Gmunden','#1D428A'],['Kapfenberg Bulls','#C8102E'],['Oberwart Gunners','#F7C600'],['Traiskirchen Lions','#C8102E'],['Wels','#1D428A']]),
  ...T('Dominican Republic','LNB Dominican Republic',[['Metros de Santiago','#1D428A'],['Titanes del Distrito','#C8102E'],['Reales de La Vega','#F7C600'],['Marineros de Puerto Plata','#1D428A'],['Leones de Santo Domingo','#C8102E'],['Caneros del Este','#007A33']]),
  ...T('Venezuela','SPB Venezuela',[['Trotamundos de Carabobo','#1D428A'],['Guaros de Lara','#C8102E'],['Cocodrilos de Caracas','#C8102E'],['Spartans Distrito Capital','#F58220'],['Gladiadores de Anzoategui','#1D428A'],['Broncos de Caracas','#F7C600']]),
  ...T('Uruguay','Uruguayan League',[['Aguada','#C8102E'],['Biguá','#1D428A'],['Penarol','#F7C600'],['Nacional','#1D428A'],['Malvin','#1D428A'],['Hebraica Macabi','#F7C600']]),
  ...T('Colombia','Liga WPlay',[['Titanes de Barranquilla','#1D428A'],['Cimarrones del Choco','#007A33'],['Motilones del Norte','#C8102E'],['Piratas de Bogota','#111111'],['Bucaros','#F7C600'],['Caribbean Storm','#1D428A']]),
  ...T('Iran','Iranian Super League',[['Shahrdari Gorgan','#C8102E'],['Mahram Tehran','#1D428A'],['Zob Ahan','#007A33'],['Petrochimi Bandar Imam','#F58220'],['Tabiat','#007A33'],['Kalleh Mazandaran','#1D428A']]),
  ...T('Lebanon','Lebanese Basketball League',[['Al Riyadi Beirut','#F7C600'],['Sagesse','#007A33'],['Beirut Club','#1D428A'],['Champville','#C8102E'],['Homenetmen','#F58220'],['Antranik','#1D428A']]),
  ...T('Jordan','Jordanian Premier League',[['Al Ahli Amman','#007A33'],['Orthodox Club','#1D428A'],['Al Wehdat','#007A33'],['Al Jubeiha','#C8102E'],['Kufryoba','#1D428A'],['Ashrafieh','#F58220']]),
  ...T('Angola','Angolan League',[['Petro de Luanda','#F7C600'],['Primeiro de Agosto','#C8102E'],['Interclube','#1D428A'],['ASA','#111111'],['Vila Clotilde','#1D428A'],['Kwanza','#007A33']]),
  ...T('Tunisia','Tunisian Pro A',[['US Monastir','#1D428A'],['ES Rades','#C8102E'],['Club Africain','#C8102E'],['Etoile du Sahel','#C8102E'],['JS Kairouan','#1D428A'],['Ezzahra Sports','#007A33']]),
  ...T('Egypt','Egyptian Super League',[['Al Ahly','#C8102E'],['Zamalek','#111111'],['Al Ittihad Alexandria','#007A33'],['Gezira','#1D428A'],['Sporting Alexandria','#1D428A'],['Smouha','#1D428A']]),
  ...T('Nigeria','Nigerian Premier League',[['Rivers Hoopers','#007A33'],['Kwara Falcons','#1D428A'],['Kano Pillars','#C8102E'],['Gombe Bulls','#F58220'],['Lagos Islanders','#1D428A'],['Police Batons','#111111']]),
  ...T('Senegal','Senegalese Division I',[['AS Douanes','#007A33'],['Dakar Universite Club','#1D428A'],['Jeanne dArc Dakar','#C8102E'],['Sibac','#F58220'],['Ville de Dakar','#1D428A'],['US Rail','#C8102E']]),
];
