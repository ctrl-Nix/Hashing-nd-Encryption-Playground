/* ══════════════════════════════════════════════════════════
   MD5 PASSWORD CRACKER — WEB WORKER
   Runs entirely off-main-thread for non-blocking UI
══════════════════════════════════════════════════════════ */

// Self-contained MD5 implementation (no DOM access in workers)
function md5(input) {
  function safeAdd(x,y){const l=(x&0xFFFF)+(y&0xFFFF),m=(x>>16)+(y>>16)+(l>>16);return(m<<16)|(l&0xFFFF);}
  function rol(n,c){return(n<<c)|(n>>>(32-c));}
  function cmn(q,a,b,x,s,t){return safeAdd(rol(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b);}
  function ff(a,b,c,d,x,s,t){return cmn((b&c)|(~b&d),a,b,x,s,t);}
  function gg(a,b,c,d,x,s,t){return cmn((b&d)|(c&~d),a,b,x,s,t);}
  function hh(a,b,c,d,x,s,t){return cmn(b^c^d,a,b,x,s,t);}
  function ii(a,b,c,d,x,s,t){return cmn(c^(b|~d),a,b,x,s,t);}
  const bytes=[];
  for(let i=0;i<input.length;i++){const c=input.charCodeAt(i);if(c<128)bytes.push(c);else if(c<2048)bytes.push(192|(c>>6),128|(c&63));else bytes.push(224|(c>>12),128|((c>>6)&63),128|(c&63));}
  const len8=bytes.length,len16=(len8+72)>>6;
  const M=new Array(len16*16).fill(0);
  for(let i=0;i<len8;i++)M[i>>2]|=bytes[i]<<((i%4)*8);
  M[len8>>2]|=0x80<<((len8%4)*8);M[len16*16-2]=len8*8;
  let a=1732584193,b=-271733879,c=-1732584194,d=271733878;
  for(let i=0;i<M.length;i+=16){
    const[A,B,C,D]=[a,b,c,d];
    a=ff(a,b,c,d,M[i],7,-680876936);d=ff(d,a,b,c,M[i+1],12,-389564586);c=ff(c,d,a,b,M[i+2],17,606105819);b=ff(b,c,d,a,M[i+3],22,-1044525330);
    a=ff(a,b,c,d,M[i+4],7,-176418897);d=ff(d,a,b,c,M[i+5],12,1200080426);c=ff(c,d,a,b,M[i+6],17,-1473231341);b=ff(b,c,d,a,M[i+7],22,-45705983);
    a=ff(a,b,c,d,M[i+8],7,1770035416);d=ff(d,a,b,c,M[i+9],12,-1958414417);c=ff(c,d,a,b,M[i+10],17,-42063);b=ff(b,c,d,a,M[i+11],22,-1990404162);
    a=ff(a,b,c,d,M[i+12],7,1804603682);d=ff(d,a,b,c,M[i+13],12,-40341101);c=ff(c,d,a,b,M[i+14],17,-1502002290);b=ff(b,c,d,a,M[i+15],22,1236535329);
    a=gg(a,b,c,d,M[i+1],5,-165796510);d=gg(d,a,b,c,M[i+6],9,-1069501632);c=gg(c,d,a,b,M[i+11],14,643717713);b=gg(b,c,d,a,M[i],20,-373897302);
    a=gg(a,b,c,d,M[i+5],5,-701558691);d=gg(d,a,b,c,M[i+10],9,38016083);c=gg(c,d,a,b,M[i+15],14,-660478335);b=gg(b,c,d,a,M[i+4],20,-405537848);
    a=gg(a,b,c,d,M[i+9],5,568446438);d=gg(d,a,b,c,M[i+14],9,-1019803690);c=gg(c,d,a,b,M[i+3],14,-187363961);b=gg(b,c,d,a,M[i+8],20,1163531501);
    a=gg(a,b,c,d,M[i+13],5,-1444681467);d=gg(d,a,b,c,M[i+2],9,-51403784);c=gg(c,d,a,b,M[i+7],14,1735328473);b=gg(b,c,d,a,M[i+12],20,-1926607734);
    a=hh(a,b,c,d,M[i+5],4,-378558);d=hh(d,a,b,c,M[i+8],11,-2022574463);c=hh(c,d,a,b,M[i+11],16,1839030562);b=hh(b,c,d,a,M[i+14],23,-35309556);
    a=hh(a,b,c,d,M[i+1],4,-1530992060);d=hh(d,a,b,c,M[i+4],11,1272893353);c=hh(c,d,a,b,M[i+7],16,-155497632);b=hh(b,c,d,a,M[i+10],23,-1094730640);
    a=hh(a,b,c,d,M[i+13],4,681279174);d=hh(d,a,b,c,M[i],11,-358537222);c=hh(c,d,a,b,M[i+3],16,-722521979);b=hh(b,c,d,a,M[i+6],23,76029189);
    a=hh(a,b,c,d,M[i+9],4,-640364487);d=hh(d,a,b,c,M[i+12],11,-421815835);c=hh(c,d,a,b,M[i+15],16,530742520);b=hh(b,c,d,a,M[i+2],23,-995338651);
    a=ii(a,b,c,d,M[i],6,-198630844);d=ii(d,a,b,c,M[i+7],10,1126891415);c=ii(c,d,a,b,M[i+14],15,-1416354905);b=ii(b,c,d,a,M[i+5],21,-57434055);
    a=ii(a,b,c,d,M[i+12],6,1700485571);d=ii(d,a,b,c,M[i+3],10,-1894986606);c=ii(c,d,a,b,M[i+10],15,-1051523);b=ii(b,c,d,a,M[i+1],21,-2054922799);
    a=ii(a,b,c,d,M[i+8],6,1873313359);d=ii(d,a,b,c,M[i+15],10,-30611744);c=ii(c,d,a,b,M[i+6],15,-1560198380);b=ii(b,c,d,a,M[i+13],21,1309151649);
    a=ii(a,b,c,d,M[i+4],6,-145523070);d=ii(d,a,b,c,M[i+11],10,-1120210379);c=ii(c,d,a,b,M[i+2],15,718787259);b=ii(b,c,d,a,M[i+9],21,-343485551);
    a=safeAdd(a,A);b=safeAdd(b,B);c=safeAdd(c,C);d=safeAdd(d,D);
  }
  const h = n => {
    let s = "";
    for (let i = 0; i < 4; i++) s += ((n >>> (i * 8)) & 0xff).toString(16).padStart(2, "0");
    return s;
  };
  return h(a) + h(b) + h(c) + h(d);
}

// 2000 most common passwords wordlist
const WORDLIST = [
  "password","123456","12345678","qwerty","abc123","monkey","1234567","letmein","trustno1","dragon",
  "baseball","iloveyou","master","sunshine","ashley","bailey","passw0rd","shadow","123123","654321",
  "superman","qazwsx","michael","football","password1","password123","batman","login","welcome","hello",
  "charlie","donald","jordan","thomas","access","ranger","buster","joshua","soccer","harley",
  "hunter","summer","george","pepper","daniel","hannah","andrew","dave","jennifer","jessica",
  "yankees","maggie","starwars","silver","ginger","computer","taylor","abcdef","111111","131313",
  "freedom","pass","internet","tigger","123456789","1234567890","zaq1zaq1","test","corvette","merlin",
  "cookie","dallas","golfing","orange","cheese","camaro","maverick","robert","matrix","phoenix",
  "william","princess","richard","diamond","guitar","iceman","jackson","sparky","midnight","thunder",
  "purple","falcon","banana","martin","junior","rabbit","creative","cowboy","soccer1","mustang",
  "london","apples","tennis","coffee","morgan","angels","yankee","golfer","killer","boston",
  "tigers","hammer","knight","flower","whatever","fishing","paradise","chicken","benjamin","albert",
  "secret","nothing","garden","angel","peanut","turtle","samantha","austin","nicolas","samsung",
  "victoria","summer1","amanda","jasmine","nicole","chelsea","biteme","matthew","december","steven",
  "travis","tucker","orange1","diablo","joshua1","compaq","hardcore","corvette1","lakers","Lakers",
  "icecream","joseph","friends","golf","cheese1","butter","united","turtle1","steelers","rocket",
  "india","music","warrior","peaches","jasper","amanda1","monster","dolphins","captain","lovely",
  "patricia","giants","bonnie","qwert","samson","q1w2e3","player","tinker","scooter","pumpkin",
  "bandit","december1","champion","success","pokemon","gaming","carmen","chicken1","fishing1","december12",
  "spencer","golden","gandalf","chester","simba","wilson","october","happy","service","mercedes",
  "jackson1","crystal","brooklyn","debbie","maxwell","trinity","digital","complex","voyager","classic",
  "gabriel","hannah1","jennifer1","rachel","jasmine1","please","maria","sophie","dolphins1","austin1",
  "eagles","winner","nicholas","viking","estrella","brandon","knight1","chicago","warrior1","champion1",
  "pakistan","buffalo","raiders","badger","testing","freedom1","thunder1","jackson5","gateway","extreme",
  "dragon1","spider","scorpion","blaster","a1b2c3d4","tomcat","grizzly","cotton","private","panther",
  "runner","falcon1","alaska","peaches1","jasper1","denver","nirvana","thunder11","buffalo1","broncos",
  "yankees1","tigers1","cowboys","red123","phoenix1","soccer12","hammer1","chicago1","rabbit1","simba1",
  "steelers1","gopher","pacific","falcon12","rockets","cowboy1","warrior12","batman1","martin1","junior1",
  "dallas1","maggie1","ginger1","buster1","ranger1","pepper1","shadow1","midnight1","golfer1","silver1",
  "sparky1","mustang1","banana1","purple1","knight12","flower1","falcon123","tigers12","cowboy12",
  "admin","root","administrator","guest","info","mysql","user","test123","oracle","master123",
  "changeme","manager","backup","ftp123","server","monitor","control","system","apache","default",
  "cisco","switch","database","network","support","public","webmaster","operator","access1","setup",
  "1234","4321","9999","8888","7777","1111","2222","3333","4444","5555",
  "6666","0000","7654321","1q2w3e","1q2w3e4r","1q2w3e4r5t","zxcvbn","zxcvbnm","asdfgh","asdfghjkl",
  "qwerty123","qwerty1","qwertyuiop","1qaz2wsx","1qaz2wsx3edc","aaaaaa","abcabc","abc1234","a1b2c3",
  "p@ssw0rd","passw0rd1","pa55word","pa$$word","p@ss1234","passpass","pass1234","pass12345","passwd","p455w0rd",
  "loveyou","iloveu","love123","lovelife","lovely1","loveme","love1","love12","love1234","lovebug",
  "angels1","angel1","angel123","angelic","angela","angelina","angie","angelbaby","angelface","angela1",
  "summer12","summer123","sunny","sunshine1","sunrise","sunset","sunflower","sunday","sundance","sunlight",
  "football1","football12","soccer123","baseball1","basketball","hockey","tennis1","cricket","rugby","lacrosse",
  "michael1","michael12","mike","mikey","michael123","mike1","mike123","miguel","mikhail","michelangelo",
  "january","february","march","april","may2020","june","july","august","september","october1",
  "november","monday","tuesday","wednesday","thursday","friday","saturday","spring","winter","autumn",
  "red","blue","green","yellow","black","white","brown","pink","gray","cyan",
  "violet","indigo","maroon","olive","teal","navy","aqua","lime","gold","beige",
  "dog","cat","fish","bird","lion","wolf","bear","tiger","eagle","shark",
  "snake","horse","panda","koala","fox","deer","whale","dolphin","elephant","monkey1",
  "car","bike","truck","plane","boat","train","rocket1","shuttle","yacht","tank",
  "pizza","burger","taco","pasta","sushi","steak","bacon","waffle","cookie1","chocolate",
  "coffee1","water","juice","beer","wine","vodka","whiskey","rum","bourbon","tequila",
  "guitar1","piano","drums","violin","flute","trumpet","cello","bass","banjo","harmonica",
  "tokyo","paris","london1","berlin","rome","moscow","sydney","toronto","dubai","seoul",
  "mars","venus","earth","jupiter","saturn","neptune","pluto","mercury","uranus","orbit",
  "ironman","spiderman","hulk","thor","captain1","deadpool","wolverine","flash","aquaman","joker",
  "gandalf1","frodo","legolas","aragorn","sauron","gimli","samwise","bilbo","elrond","gollum",
  "harry","hermione","ron","dumbledore","voldemort","snape","draco","sirius","hedwig","hogwarts",
  "mario","luigi","zelda","link","pikachu","sonic","kirby","yoshi","peach","bowser",
  "apple","google","amazon","microsoft","facebook","twitter","instagram","netflix","spotify","youtube",
  "iphone","android","samsung1","pixel","oneplus","xiaomi","huawei","nokia","motorola","sony",
  "windows","linux","macos","ubuntu","fedora","debian","centos","redhat","chrome","firefox",
  "python","java","javascript","ruby","golang","swift","kotlin","rust","scala","perl",
  "hacker","exploit","virus","malware","trojan","worm","botnet","phishing","ddos","ransomware",
  "crypto","bitcoin","ethereum","blockchain","mining","wallet","token","defi","nft","satoshi",
  "america","canada","mexico","brazil","france","germany","japan","china","india1","australia",
  "newyork","losangeles","sanfrancisco","houston","miami","seattle","boston1","denver1","atlanta","portland",
  "alpha","bravo","charlie1","delta","echo","foxtrot","golf1","hotel","india2","juliet",
  "kilo","lima","mike2","november1","oscar","papa","quebec","romeo","sierra","tango",
  "uniform","victor","whiskey1","xray","yankee1","zulu",
  "monday1","qweasd","qwe123","asd123","zxc123","1234qwer","qwer1234","asdf1234","zxcv1234","poiuytrewq",
  "lkjhgfdsa","mnbvcxz","0987654321","1029384756","5678","6789","7890","3456","2345","5432",
  "abcdefgh","abcdefghi","abcdefghij","aabbccdd","aabb1122","aa1234","bb1234","cc1234","xxxx","zzzz",
  "aaaa1111","bbbb2222","cccc3333","dddd4444","eeee5555","abc12345","xyz12345","def12345","ghi12345","jkl12345",
  "trustme","believe","forever","always","dream","destiny","spirit","soul","heart","hope",
  "victory","legend","legacy","power","glory","grace","faith","justice","truth","honor",
  "royal","crown","king","queen","prince","empress","knight2","castle","throne","palace",
  "ninja","samurai","shogun","sensei","ronin","katana","shuriken","dojo","karate","judo",
  "wizard","sorcerer","mage","druid","paladin","cleric","rogue","barbarian","bard","monk",
  "galaxy","cosmos","nebula","quasar","supernova","blackhole","asteroid","comet","constellation","starship",
  "matrix1","neo","trinity1","morpheus","oracle1","cipher","tank1","dozer","apoc","switch1",
  "pirate","treasure","captain2","compass","anchor","voyage","harbor","lighthouse","kraken","mermaid",
  "storm","blizzard","tornado","hurricane","cyclone","tsunami","avalanche","earthquake","volcano","wildfire",
  "diamond1","ruby1","emerald","sapphire","topaz","opal","pearl","jade","amber","crystal1",
  "shadow12","phantom","ghost","specter","wraith","shade","spirit1","haunt","poltergeist","apparition",
  "arsenal","chelsea1","liverpool","united1","madrid","barcelona","bayern","juventus","milan","inter",
  "champion12","winner1","legend1","warrior123","fighter","gladiator","spartan","centurion","legionnaire","hero",
  "music1","melody","rhythm","harmony","symphony","concert","album","track","vinyl","stereo",
  "ocean","river","mountain","forest","desert","island","valley","canyon","glacier","waterfall",
  "sunrise1","sunset1","moonlight","starlight","daybreak","twilight","dusk","dawn","aurora","eclipse",
  "phoenix12","dragon12","griffin","unicorn","pegasus","hydra","basilisk","chimera","minotaur","centaur",
  "sentinel","guardian","protector","defender","watcher","keeper","shield","fortress","citadel","bastion",
  "mystic","arcane","ethereal","celestial","divine","sacred","ancient","primeval","eternal","immortal",
  "velocity","turbo","nitro","boost","overdrive","maximum","ultimate","supreme","infinite","absolute",
  "cobra","viper","mamba","python1","anaconda","rattlesnake","sidewinder","copperhead","kingsnake","coral",
  "apache1","tomahawk","blackhawk","chinook","osprey","raptor","predator","reaper","sentinel1","guardian1",
  "winter1","frost","blizzard1","arctic","polar","glacier1","iceberg","snowfall","snowflake","icicle",
  "shadow123","midnight12","darkness","blackout","eclipse1","twilight1","nightfall","moonrise","dusk1","oblivion",
  "adventure","explore","discover","journey","quest","odyssey","expedition","safari","excursion","venture",
  "rebel","outlaw","maverick1","renegade","fugitive","desperado","vigilante","mercenary","bounty","gunslinger",
  "omega","sigma","epsilon","theta","lambda","gamma","kappa","phi","psi","chi",
  "quantum","photon","neutron","proton","electron","particle","molecule","atom","nucleus","isotope",
  "darwin","einstein","newton","tesla","galileo","copernicus","hawking","curie","pasteur","edison",
  "hendrix","lennon","presley","morrison","cobain","mercury1","sinatra","marley","bowie","prince1",
  "ronaldo","messi","beckham","pele","maradona","zidane","neymar","mbappe","salah","lewandowski",
  "beethoven","mozart","bach","chopin","vivaldi","brahms","schubert","handel","strauss","wagner",
  "picasso","monet","vangogh","davinci","rembrandt","michelangelo1","raphael","vermeer","renoir","cezanne",
  "hemingway","shakespeare","dickens","tolkien","orwell","twain","poe","austen","kafka","dostoevsky",
  "everest","kilimanjaro","denali","fuji","olympus","rainier","blanc","matterhorn","aconcagua","elbrus",
  "pacific1","atlantic","indian","arctic1","mediterranean","caribbean","baltic","caspian","adriatic","aegean",
  "falcon1234","eagle1","hawk","osprey1","condor","albatross","penguin","pelican","flamingo","heron",
  "redwolf","direwolf","whitewolf","graywolf","snowwolf","blackwolf","nightwolf","lonewolf","alphawolf","packwolf",
  "darkside","lightside","balance","neutral","alignment","chaotic","lawful","order","entropy","harmony1",
  "binary","hexadecimal","octal","decimal","ascii","unicode","utf8","base64","sha256","aes256",
  "firewall","vpn","proxy","gateway1","router","modem","server1","cluster","node","endpoint",
  "benchmark","optimize","compile","debug","deploy","release","staging","production","sandbox","container",
  "react","angular","vue","svelte","nextjs","nuxt","express","django","flask","rails",
  "postgres","mongodb","redis","elastic","cassandra","dynamo","sqlite","mariadb","couchdb","influx",
  "docker","kubernetes","terraform","ansible","jenkins","gitlab","github1","bitbucket","circleci","travisci",
  "lambda1","function","handler","trigger","event","stream","queue","topic","pubsub","webhook",
  "backup1","restore","snapshot","replica","failover","loadbalance","autoscale","healthcheck","heartbeat","watchdog",
  "encrypt","decrypt1","cipher1","plaintext","ciphertext","signature","certificate","handshake","protocol","session",
  "overflow","underflow","injection","traversal","escalation","spoofing","sniffing","cracking","fuzzing","pentest",
  "incident","response","forensic","evidence","analysis","report","timeline","artifact","indicator","compromise"
];

// Worker message handler
self.onmessage = function(e) {
  const { targetHash } = e.data;
  const total = WORDLIST.length;
  const startTime = performance.now();

  for (let i = 0; i < total; i++) {
    const word = WORDLIST[i];
    const hash = md5(word);

    // Report progress every 20 words
    if (i % 20 === 0) {
      self.postMessage({
        type: 'progress',
        index: i,
        total: total,
        current: word,
        currentHash: hash.substring(0, 16) + '...'
      });
    }

    if (hash === targetHash) {
      self.postMessage({
        type: 'found',
        password: word,
        hash: hash,
        attempts: i + 1,
        time: (performance.now() - startTime).toFixed(2)
      });
      return;
    }
  }

  self.postMessage({
    type: 'notfound',
    attempts: total,
    time: (performance.now() - startTime).toFixed(2)
  });
};
