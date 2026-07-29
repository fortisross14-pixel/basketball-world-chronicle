export const NBA_TEAMS = [
  ['Atlanta Hawks', '#E03A3E'], ['Boston Celtics', '#007A33'], ['Brooklyn Nets', '#000000'],
  ['Charlotte Hornets', '#1D1160'], ['Chicago Bulls', '#CE1141'], ['Cleveland Cavaliers', '#860038'],
  ['Dallas Mavericks', '#00538C'], ['Denver Nuggets', '#0E2240'], ['Detroit Pistons', '#C8102E'],
  ['Golden State Warriors', '#1D428A'], ['Houston Rockets', '#CE1141'], ['Indiana Pacers', '#002D62'],
  ['LA Clippers', '#C8102E'], ['Los Angeles Lakers', '#552583'], ['Memphis Grizzlies', '#5D76A9'],
  ['Miami Heat', '#98002E'], ['Milwaukee Bucks', '#00471B'], ['Minnesota Timberwolves', '#0C2340'],
  ['New Orleans Pelicans', '#0C2340'], ['New York Knicks', '#006BB6'], ['Oklahoma City Thunder', '#007AC1'],
  ['Orlando Magic', '#0077C0'], ['Philadelphia 76ers', '#006BB6'], ['Phoenix Suns', '#1D1160'],
  ['Portland Trail Blazers', '#E03A3E'], ['Sacramento Kings', '#5A2D81'], ['San Antonio Spurs', '#C4CED4'],
  ['Toronto Raptors', '#CE1141'], ['Utah Jazz', '#002B5C'], ['Washington Wizards', '#002B5C'],
].map(([name, color]) => ({ name, color, country: name === 'Toronto Raptors' ? 'Canada' : 'USA' }));

export const EURO_TOP_CLUBS = [
  ['Real Madrid', 'Spain', 'Liga ACB', '#FEBE10'], ['FC Barcelona', 'Spain', 'Liga ACB', '#A50044'],
  ['Baskonia', 'Spain', 'Liga ACB', '#0B4DA2'], ['Valencia Basket', 'Spain', 'Liga ACB', '#F58220'],
  ['Olympiacos', 'Greece', 'Greek League', '#D71920'], ['Panathinaikos', 'Greece', 'Greek League', '#007A33'],
  ['Fenerbahçe', 'Turkey', 'Turkish BSL', '#FFED00'], ['Anadolu Efes', 'Turkey', 'Turkish BSL', '#1B4FA3'],
  ['Virtus Bologna', 'Italy', 'Lega Basket Serie A', '#111111'], ['Olimpia Milano', 'Italy', 'Lega Basket Serie A', '#D71920'],
  ['AS Monaco', 'France', 'LNB Pro A', '#E2001A'], ['Paris Basketball', 'France', 'LNB Pro A', '#111111'],
  ['Bayern Munich', 'Germany', 'Basketball Bundesliga', '#DC052D'], ['ALBA Berlin', 'Germany', 'Basketball Bundesliga', '#FFDD00'],
  ['Žalgiris Kaunas', 'Lithuania', 'Lithuanian LKL', '#007A33'], ['Maccabi Tel Aviv', 'Israel', 'Israeli Premier League', '#F7C600'],
  ['Partizan', 'Serbia', 'Adriatic League', '#111111'], ['Crvena zvezda', 'Serbia', 'Adriatic League', '#D71920'],
  ['Dubai Basketball', 'UAE', 'Adriatic League', '#6E2C91'], ['Hapoel Tel Aviv', 'Israel', 'Israeli Premier League', '#D71920'],
].map(([name, country, league, color]) => ({ name, country, league, color, euroLeague: true }));

export const EURO_DOMESTIC = [
  ['Joventut Badalona', 'Spain', 'Liga ACB', '#00843D', 1], ['Unicaja Málaga', 'Spain', 'Liga ACB', '#006633', 1],
  ['Gran Canaria', 'Spain', 'Liga ACB', '#F4C430', 1], ['BAXI Manresa', 'Spain', 'Liga ACB', '#D71920', 1],
  ['San Pablo Burgos', 'Spain', 'Primera FEB', '#002D62', 2], ['Estudiantes', 'Spain', 'Primera FEB', '#6A1B9A', 2],
  ['Aris', 'Greece', 'Greek League', '#F7C600', 1], ['PAOK', 'Greece', 'Greek League', '#111111', 1],
  ['Iraklis', 'Greece', 'Greek A2', '#1D428A', 2], ['Panionios', 'Greece', 'Greek A2', '#C8102E', 2],
  ['Beşiktaş', 'Turkey', 'Turkish BSL', '#111111', 1], ['Galatasaray', 'Turkey', 'Turkish BSL', '#A90432', 1],
  ['Türk Telekom', 'Turkey', 'Turkish BSL', '#1D428A', 1], ['Tofaş Bursa', 'Turkey', 'Turkish BSL', '#0057B8', 1],
  ['Semt77 Yalovaspor', 'Turkey', 'Turkish TBL', '#3A7D44', 2], ['MKE Ankaragücü', 'Turkey', 'Turkish TBL', '#F5C400', 2],
  ['Reyer Venezia', 'Italy', 'Lega Basket Serie A', '#7A263A', 1], ['Pallacanestro Brescia', 'Italy', 'Lega Basket Serie A', '#1D428A', 1],
  ['Fortitudo Bologna', 'Italy', 'Serie A2', '#1D428A', 2], ['Scaligera Verona', 'Italy', 'Serie A2', '#F7C600', 2],
  ['ASVEL', 'France', 'LNB Pro A', '#111111', 1], ['JL Bourg', 'France', 'LNB Pro A', '#D71920', 1],
  ['Limoges CSP', 'France', 'LNB Pro A', '#007A33', 1], ['Orléans Loiret', 'France', 'Pro B', '#D71920', 2],
  ['Ratiopharm Ulm', 'Germany', 'Basketball Bundesliga', '#F58220', 1], ['Telekom Baskets Bonn', 'Germany', 'Basketball Bundesliga', '#E2001A', 1],
  ['Tigers Tübingen', 'Germany', 'ProA Germany', '#F7C600', 2], ['Phoenix Hagen', 'Germany', 'ProA Germany', '#E2001A', 2],
  ['Cedevita Olimpija', 'Slovenia', 'Adriatic League', '#F58220', 1], ['Buducnost', 'Montenegro', 'Adriatic League', '#1D428A', 1],
  ['Mega Basket', 'Serbia', 'Adriatic League', '#F05A28', 1], ['Borac Čačak', 'Serbia', 'KLS Serbia', '#D71920', 2],
].map(([name, country, league, color, tier]) => ({ name, country, league, color, tier, euroLeague: false }));

const C = {
  ACC: '#1D428A', 'Big Ten': '#003087', 'Big 12': '#C8102E', SEC: '#004B8D',
  'Big East': '#1D428A', 'Atlantic 10': '#C8102E', AAC: '#0057B8', 'Mountain West': '#4B0082',
  WCC: '#8B1E3F', MVC: '#D71920', Ivy: '#006633', Patriot: '#002D62',
  'Big West': '#1D428A', 'Sun Belt': '#F58220', SoCon: '#6A1B9A', MAC: '#0057B8',
};

const COLOR_OVERRIDES = {
  Duke: '#003087', 'North Carolina': '#7BAFD4', Kentucky: '#0033A0', Kansas: '#0051BA',
  UCLA: '#2D68C4', USC: '#990000', Michigan: '#FFCB05', 'Michigan State': '#18453B',
  Purdue: '#CEB888', Indiana: '#990000', Illinois: '#E84A27', Wisconsin: '#C5050C',
  'Ohio State': '#BB0000', Maryland: '#E03A3E', Oregon: '#154733', Washington: '#4B2E83',
  Arizona: '#CC0033', 'Arizona State': '#8C1D40', Baylor: '#154734', Houston: '#C8102E',
  'Iowa State': '#C8102E', 'Kansas State': '#512888', 'Texas Tech': '#CC0000', TCU: '#4D1979',
  BYU: '#002E5D', Utah: '#CC0000', Alabama: '#9E1B32', Auburn: '#0C2340',
  Florida: '#0021A5', Georgia: '#BA0C2F', LSU: '#461D7C', Tennessee: '#FF8200',
  Texas: '#BF5700', Oklahoma: '#841617', Arkansas: '#9D2235', Vanderbilt: '#866D4B',
  UConn: '#000E2F', Villanova: '#00205B', Georgetown: '#041E42', Marquette: '#003366',
  Providence: '#111111', "St. John's": '#BA0C2F', Xavier: '#0C2340', Creighton: '#005CA9',
  Gonzaga: '#002967', "Saint Mary's": '#D50032', Memphis: '#003087', Temple: '#9D2235',
  'San Diego State': '#A6192E', 'New Mexico': '#BA0C2F', UNLV: '#CF0A2C',
  Princeton: '#FF8F00', Harvard: '#A51C30', Yale: '#00356B', Columbia: '#B9D9EB',
  Dayton: '#CE1141', VCU: '#F8B800', 'Saint Louis': '#003DA5', Davidson: '#AC1A2F',
  'UC Irvine': '#0064A4', 'UC San Diego': '#182B49', Hawaii: '#024731',
  'Appalachian State': '#FFCC00', 'James Madison': '#450084', Chattanooga: '#0033A0',
  Akron: '#041E42', 'Kent State': '#002664', Ohio: '#00694E', Toledo: '#15397F',
};

const conferences = {
  ACC: ['Boston College','California','Clemson','Duke','Florida State','Georgia Tech','Louisville','Miami','NC State','North Carolina','Notre Dame','Pittsburgh','SMU','Stanford','Syracuse','Virginia','Virginia Tech','Wake Forest'],
  'Big Ten': ['Illinois','Indiana','Iowa','Maryland','Michigan','Michigan State','Minnesota','Nebraska','Northwestern','Ohio State','Oregon','Penn State','Purdue','Rutgers','UCLA','USC','Washington','Wisconsin'],
  'Big 12': ['Arizona','Arizona State','Baylor','BYU','Cincinnati','Colorado','Houston','Iowa State','Kansas','Kansas State','Oklahoma State','TCU','Texas Tech','UCF','Utah','West Virginia'],
  SEC: ['Alabama','Arkansas','Auburn','Florida','Georgia','Kentucky','LSU','Mississippi State','Missouri','Oklahoma','Ole Miss','South Carolina','Tennessee','Texas','Texas A&M','Vanderbilt'],
  'Big East': ['Butler','UConn','Creighton','DePaul','Georgetown','Marquette','Providence','Seton Hall',"St. John's",'Villanova','Xavier'],
  'Atlantic 10': ['Davidson','Dayton','Duquesne','Fordham','George Mason','George Washington','La Salle','Loyola Chicago','Richmond','Rhode Island','Saint Bonaventure',"Saint Joseph's",'Saint Louis','VCU'],
  AAC: ['Charlotte','East Carolina','Florida Atlantic','Memphis','North Texas','Rice','South Florida','Temple','Tulane','Tulsa','UAB','UTSA','Wichita State'],
  'Mountain West': ['Air Force','Boise State','Colorado State','Fresno State','Nevada','New Mexico','San Diego State','San Jose State','UNLV','Utah State','Wyoming'],
  WCC: ['Gonzaga',"Saint Mary's",'San Francisco','Santa Clara','Loyola Marymount','Pepperdine','Portland','Pacific','San Diego','Seattle','Washington State'],
  MVC: ['Belmont','Bradley','Drake','Evansville','Illinois State','Indiana State','Missouri State','Murray State','Northern Iowa','Southern Illinois','UIC','Valparaiso'],
  Ivy: ['Brown','Columbia','Cornell','Dartmouth','Harvard','Penn','Princeton','Yale'],
  Patriot: ['American','Army','Boston University','Bucknell','Colgate','Holy Cross','Lafayette','Lehigh','Loyola Maryland','Navy'],
  'Big West': ['Cal Poly','Cal State Bakersfield','Cal State Fullerton','CSUN','Hawaii','Long Beach State','UC Davis','UC Irvine','UC Riverside','UC San Diego'],
  'Sun Belt': ['Appalachian State','Arkansas State','Coastal Carolina','Georgia Southern','Georgia State','James Madison','Louisiana','Marshall','South Alabama','Troy'],
  SoCon: ['Chattanooga','The Citadel','East Tennessee State','Furman','Mercer','Samford','UNC Greensboro','VMI','Western Carolina','Wofford'],
  MAC: ['Akron','Ball State','Bowling Green','Buffalo','Central Michigan','Eastern Michigan','Kent State','Miami Ohio','Northern Illinois','Ohio','Toledo','Western Michigan'],
};

export const NCAA_PROGRAMS = Object.entries(conferences).flatMap(([conference, schools]) =>
  schools.map((name) => ({
    name,
    conference,
    country: 'USA',
    color: COLOR_OVERRIDES[name] ?? C[conference],
  })),
);

if (NCAA_PROGRAMS.length !== 200) {
  throw new Error(`Expected exactly 200 NCAA programs, received ${NCAA_PROGRAMS.length}.`);
}

export const OTHER_PRO_TEAMS = [
  ['Sydney Kings','Australia','NBL Australia','#5B2C83'], ['Melbourne United','Australia','NBL Australia','#111111'],
  ['Perth Wildcats','Australia','NBL Australia','#D71920'], ['Illawarra Hawks','Australia','NBL Australia','#E2001A'],
  ['Chiba Jets','Japan','B.League','#D71920'], ['Alvark Tokyo','Japan','B.League','#111111'],
  ['Ryukyu Golden Kings','Japan','B.League','#F58220'], ['Utsunomiya Brex','Japan','B.League','#F7C600'],
  ['Beijing Ducks','China','CBA','#1D428A'], ['Guangdong Southern Tigers','China','CBA','#D71920'],
  ['Shanghai Sharks','China','CBA','#0057B8'], ['Liaoning Flying Leopards','China','CBA','#C8102E'],
  ['Boca Juniors','Argentina','Liga Nacional','#0057B8'], ['Instituto Córdoba','Argentina','Liga Nacional','#D71920'],
  ['Flamengo','Brazil','NBB Brazil','#C8102E'], ['Franca','Brazil','NBB Brazil','#1D428A'],
].map(([name, country, league, color]) => ({ name, country, league, color }));

export const G_LEAGUE_TEAMS = [
  ['Austin Spurs','#C4CED4'], ['College Park Skyhawks','#E03A3E'], ['Delaware Blue Coats','#006BB6'],
  ['Grand Rapids Gold','#0E2240'], ['Greensboro Swarm','#1D1160'], ['Iowa Wolves','#0C2340'],
  ['Long Island Nets','#000000'], ['Maine Celtics','#007A33'], ['Memphis Hustle','#5D76A9'],
  ['Motor City Cruise','#C8102E'], ['Ontario Clippers','#C8102E'], ['Osceola Magic','#0077C0'],
  ['Rio Grande Valley Vipers','#CE1141'], ['Santa Cruz Warriors','#1D428A'],
].map(([name, color]) => ({ name, color, country: 'USA', league: 'NBA G League' }));
