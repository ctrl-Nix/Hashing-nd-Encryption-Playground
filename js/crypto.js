/* ══════════════════════════════════════════════════════════
   CRYPTO ENGINE (CORE)
══════════════════════════════════════════════════════════ */
const CE = {
  bufToHex: b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,'0')).join(''),
  hexToBuf: h => new Uint8Array(h.match(/.{1,2}/g).map(b => parseInt(b, 16))),
  hexToBits: h => h.split('').map(c => parseInt(c,16).toString(2).padStart(4,'0')).join(''),

  md5: str => {
    function safeAdd(x,y){const l=(x&0xFFFF)+(y&0xFFFF),m=(x>>16)+(y>>16)+(l>>16);return(m<<16)|(l&0xFFFF);}
    function rol(n,c){return(n<<c)|(n>>>(32-c));}
    function cmn(q,a,b,x,s,t){return safeAdd(rol(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b);}
    function ff(a,b,c,d,x,s,t){return cmn((b&c)|(~b&d),a,b,x,s,t);}
    function gg(a,b,c,d,x,s,t){return cmn((b&d)|(c&~d),a,b,x,s,t);}
    function hh(a,b,c,d,x,s,t){return cmn(b^c^d,a,b,x,s,t);}
    function ii(a,b,c,d,x,s,t){return cmn(c^(b|~d),a,b,x,s,t);}
    const bytes=[];
    for(let i=0;i<str.length;i++){const c=str.charCodeAt(i);if(c<128)bytes.push(c);else if(c<2048)bytes.push(192|(c>>6),128|(c&63));else bytes.push(224|(c>>12),128|((c>>6)&63),128|(c&63));}
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
    return[a,b,c,d].map(n=>(n<0?n+0x100000000:n).toString(16).padStart(8,'0')).join('');
  },

  hash: async (algo, str) => {
    const t0 = performance.now();
    let hex;
    if(algo === 'MD5') hex = CE.md5(str);
    else { const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(str)); hex = CE.bufToHex(buf); }
    return { hex, ms: (performance.now()-t0).toFixed(2), bits: CE.hexToBits(hex) };
  },

  deriveKey: async (pass, salt) => {
    const km = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), {name:'PBKDF2'}, false, ['deriveKey']);
    const aesKey = await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:100000,hash:'SHA-256'}, km, {name:'AES-GCM',length:256}, true, ['encrypt','decrypt']);
    const raw = await crypto.subtle.exportKey('raw', aesKey);
    return { aesKey, hexKey: CE.bufToHex(raw) };
  },

  encrypt: async (data, pass) => {
    const t0 = performance.now();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv   = crypto.getRandomValues(new Uint8Array(12));
    const { aesKey, hexKey } = await CE.deriveKey(pass, salt);
    const cipher = await crypto.subtle.encrypt({name:'AES-GCM',iv}, aesKey, new TextEncoder().encode(data));
    return { payload:`${CE.bufToHex(salt)}:${CE.bufToHex(iv)}:${CE.bufToHex(cipher)}`, key:hexKey, ms:(performance.now()-t0).toFixed(2), cipherBuf:cipher };
  },

  decrypt: async (payload, pass) => {
    const t0 = performance.now();
    const parts = payload.trim().split(':');
    if(parts.length !== 3) throw new Error('Invalid Format: expected salt:iv:cipher');
    const salt = CE.hexToBuf(parts[0]), iv = CE.hexToBuf(parts[1]), cipher = CE.hexToBuf(parts[2]);
    const { aesKey, hexKey } = await CE.deriveKey(pass, salt);
    const dec = await crypto.subtle.decrypt({name:'AES-GCM',iv}, aesKey, cipher);
    return { plain: new TextDecoder().decode(dec), key:hexKey, ms:(performance.now()-t0).toFixed(2) };
  }
};
