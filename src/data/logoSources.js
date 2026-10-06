export const NBA_LOGO_IDS = {
  'Atlanta Hawks':'1610612737','Boston Celtics':'1610612738','Brooklyn Nets':'1610612751','Charlotte Hornets':'1610612766',
  'Chicago Bulls':'1610612741','Cleveland Cavaliers':'1610612739','Dallas Mavericks':'1610612742','Denver Nuggets':'1610612743',
  'Detroit Pistons':'1610612765','Golden State Warriors':'1610612744','Houston Rockets':'1610612745','Indiana Pacers':'1610612754',
  'LA Clippers':'1610612746','Los Angeles Lakers':'1610612747','Memphis Grizzlies':'1610612763','Miami Heat':'1610612748',
  'Milwaukee Bucks':'1610612749','Minnesota Timberwolves':'1610612750','New Orleans Pelicans':'1610612740','New York Knicks':'1610612752',
  'Oklahoma City Thunder':'1610612760','Orlando Magic':'1610612753','Philadelphia 76ers':'1610612755','Phoenix Suns':'1610612756',
  'Portland Trail Blazers':'1610612757','Sacramento Kings':'1610612758','San Antonio Spurs':'1610612759','Toronto Raptors':'1610612761',
  'Utah Jazz':'1610612762','Washington Wizards':'1610612764'
};

export const WIKIPEDIA_PAGE_OVERRIDES = {
  'Real Madrid':'Real Madrid Baloncesto','FC Barcelona':'FC Barcelona Bàsquet','Baskonia':'Saski Baskonia','Valencia Basket':'Valencia Basket',
  'Olympiacos':'Olympiacos B.C.','Panathinaikos':'Panathinaikos B.C.','Fenerbahçe':'Fenerbahçe Beko','Anadolu Efes':'Anadolu Efes S.K.',
  'Virtus Bologna':'Virtus Bologna','Olimpia Milano':'Olimpia Milano','AS Monaco':'AS Monaco Basket','Paris Basketball':'Paris Basketball',
  'Bayern Munich':'FC Bayern Munich Basketball','ALBA Berlin':'Alba Berlin','Žalgiris Kaunas':'BC Žalgiris','Maccabi Tel Aviv':'Maccabi Tel Aviv B.C.',
  'Partizan':'KK Partizan','Crvena zvezda':'KK Crvena zvezda','Dubai Basketball':'Dubai Basketball','Hapoel Tel Aviv':'Hapoel Tel Aviv B.C.',
  'Joventut Badalona':'Joventut Badalona','Unicaja Málaga':'Baloncesto Málaga','Gran Canaria':'CB Gran Canaria','BAXI Manresa':'Bàsquet Manresa',
  'Beşiktaş':'Beşiktaş J.K. (basketball)','Galatasaray':'Galatasaray S.K. (men’s basketball)','Türk Telekom':'Türk Telekom B.K.','Tofaş Bursa':'Tofaş S.K.',
  'Reyer Venezia':'Reyer Venezia','Pallacanestro Brescia':'Pallacanestro Brescia','ASVEL':'ASVEL Basket','JL Bourg':'JL Bourg Basket',
  'Ratiopharm Ulm':'Ratiopharm Ulm','Telekom Baskets Bonn':'Telekom Baskets Bonn','Cedevita Olimpija':'KK Cedevita Olimpija','Buducnost':'KK Budućnost',
  'Mega Basket':'KK Mega Basket','Rytas Vilnius':'BC Rytas','Hapoel Jerusalem':'Hapoel Jerusalem B.C.','CSKA Moscow':'PBC CSKA Moscow',
  'Zenit Saint Petersburg':'BC Zenit Saint Petersburg','UNICS Kazan':'UNICS','Lokomotiv Kuban':'PBC Lokomotiv Kuban','Sydney Kings':'Sydney Kings',
  'Melbourne United':'Melbourne United','Perth Wildcats':'Perth Wildcats','Chiba Jets':'Chiba Jets Funabashi','Alvark Tokyo':'Alvark Tokyo',
  'Guangdong Southern Tigers':'Guangdong Southern Tigers','Beijing Ducks':'Beijing Ducks','Shanghai Sharks':'Shanghai Sharks','Liaoning Flying Leopards':'Liaoning Flying Leopards',
  'Boca Juniors':'Boca Juniors basketball','Instituto Córdoba':'Instituto Atlético Central Córdoba basketball','Flamengo':'Flamengo Basketball','Franca':'Sesi Franca Basquete'
};

export function nbaRemoteLogo(name){
  const id=NBA_LOGO_IDS[name];
  return id ? `https://cdn.nba.com/logos/nba/${id}/primary/L/logo.svg` : null;
}
