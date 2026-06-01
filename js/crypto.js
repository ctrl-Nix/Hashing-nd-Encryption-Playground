/* ══════════════════════════════════════════════════════════
   CRYPTO ENGINE (CORE)
══════════════════════════════════════════════════════════ */
const CE = {
  bufToHex: b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,'0')).join(''),
  hexToBuf: h => { const m = h.match(/.{1,2}/g); if(!m) throw new Error("Invalid hex"); return new Uint8Array(m.map(b => parseInt(b, 16))); },
  hexToBits: h => h.split('').map(c => parseInt(c,16).toString(2).padStart(4,'0')).join(''),

  md5: input => {
    function safeAdd(x,y){const l=(x&0xFFFF)+(y&0xFFFF),m=(x>>16)+(y>>16)+(l>>16);return(m<<16)|(l&0xFFFF);}
    function rol(n,c){return(n<<c)|(n>>>(32-c));}
    function cmn(q,a,b,x,s,t){return safeAdd(rol(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b);}
    function ff(a,b,c,d,x,s,t){return cmn((b&c)|(~b&d),a,b,x,s,t);}
    function gg(a,b,c,d,x,s,t){return cmn((b&d)|(c&~d),a,b,x,s,t);}
    function hh(a,b,c,d,x,s,t){return cmn(b^c^d,a,b,x,s,t);}
    function ii(a,b,c,d,x,s,t){return cmn(c^(b|~d),a,b,x,s,t);}
    // Accept both string and Uint8Array/ArrayBuffer for binary-safe MD5
    let bytes;
    if (typeof input === 'string') {
      bytes = Array.from(new TextEncoder().encode(input));
    } else {
      bytes = Array.from(input instanceof ArrayBuffer ? new Uint8Array(input) : (ArrayBuffer.isView(input) ? new Uint8Array(input.buffer, input.byteOffset, input.byteLength) : new Uint8Array(input)));
    }
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
  },

  hash: async (algo, data) => {
    const t0 = performance.now();
    let hex;
    const buffer = (typeof data === 'string') ? new TextEncoder().encode(data) : data;
    
    if(algo === 'MD5') {
      // MD5 now accepts both string and ArrayBuffer/Uint8Array directly
      hex = CE.md5(typeof data === 'string' ? data : buffer);
    } else {
      const hashBuf = await crypto.subtle.digest(algo, buffer);
      hex = CE.bufToHex(hashBuf);
    }
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
  },

  /* ─── ASYMMETRIC (RSA) ─── */
  generateRSA: async () => {
    const pair = await crypto.subtle.generateKey(
      { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
      true, ["encrypt", "decrypt"]
    );
    const pub = await crypto.subtle.exportKey("spki", pair.publicKey);
    const priv = await crypto.subtle.exportKey("pkcs8", pair.privateKey);
    return {
      pub: btoa(String.fromCharCode(...new Uint8Array(pub))),
      priv: btoa(String.fromCharCode(...new Uint8Array(priv)))
    };
  },

  importRSA: async (keyData, isPrivate) => {
    const buf = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
    return await crypto.subtle.importKey(
      isPrivate ? "pkcs8" : "spki",
      buf,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      isPrivate ? ["decrypt"] : ["encrypt"]
    );
  },

  rsaEncrypt: async (plain, pubKeyB64) => {
    const t0 = performance.now();
    const pubKey = await CE.importRSA(pubKeyB64, false);
    const cipher = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, pubKey, new TextEncoder().encode(plain));
    return { cipher: btoa(String.fromCharCode(...new Uint8Array(cipher))), ms: (performance.now()-t0).toFixed(2) };
  },

  rsaDecrypt: async (cipherB64, privKeyB64) => {
    const t0 = performance.now();
    const privKey = await CE.importRSA(privKeyB64, true);
    const cipher = Uint8Array.from(atob(cipherB64), c => c.charCodeAt(0));
    const plain = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privKey, cipher);
    return { plain: new TextDecoder().decode(plain), ms: (performance.now()-t0).toFixed(2) };
  },

  /* ─── HMAC ─── */
  hmac: async (algo, keyStr, dataStr) => {
    const t0 = performance.now();
    const enc = new TextEncoder();
    const keyData = enc.encode(keyStr);
    const data = enc.encode(dataStr);
    
    const key = await crypto.subtle.importKey(
      "raw", keyData,
      { name: "HMAC", hash: algo },
      false, ["sign"]
    );
    
    const sig = await crypto.subtle.sign("HMAC", key, data);
    const hex = CE.bufToHex(sig);
    return { hex, ms: (performance.now()-t0).toFixed(2), bits: CE.hexToBits(hex) };
  },

  /* ─── STEGANOGRAPHY (LSB) ─── */
  stegoEncode: (pixelData, dataStr) => {
    const t0 = performance.now();
    const data = new TextEncoder().encode(dataStr + "\0"); // Null terminator
    if (data.length * 8 > pixelData.length * 0.75) throw new Error("Data too large for this image.");

    let bitIdx = 0;
    for (let i = 0; i < data.length; i++) {
      for (let bit = 7; bit >= 0; bit--) {
        const value = (data[i] >> bit) & 1;
        const pixelPos = bitIdx + Math.floor(bitIdx / 3); // Skip alpha channel
        pixelData[pixelPos] = (pixelData[pixelPos] & 0xFE) | value;
        bitIdx++;
      }
    }
    return { ms: (performance.now() - t0).toFixed(2) };
  },

  stegoDecode: (pixelData) => {
    const t0 = performance.now();
    let bits = [];
    let bytes = [];
    
    for (let i = 0; i < pixelData.length; i++) {
      if ((i + 1) % 4 === 0) continue; // Skip alpha
      bits.push(pixelData[i] & 1);
      if (bits.length === 8) {
        const byte = parseInt(bits.join(""), 2);
        if (byte === 0) break; // Found null terminator
        bytes.push(byte);
        bits = [];
      }
      if (bytes.length > 10000) break; // Safety limit
    }
    
    try {
      const plain = new TextDecoder("utf-8", { fatal: true }).decode(new Uint8Array(bytes));
      return { plain, ms: (performance.now() - t0).toFixed(2) };
    } catch(e) {
      return { plain: "[ ERROR: No valid payload found in image. Carrier is likely empty or corrupted. ]", ms: (performance.now() - t0).toFixed(2) };
    }
  },

  /* ─── ENTROPY ─── */
  shannonEntropy: (str) => {
    if (!str.length) return { bitsPerChar: 0, total: 0 };
    const freqs = {};
    for (let i = 0; i < str.length; i++) {
      freqs[str[i]] = (freqs[str[i]] || 0) + 1;
    }
    let entropy = 0;
    for (let char in freqs) {
      const p = freqs[char] / str.length;
      entropy -= p * Math.log2(p);
    }
    return {
      bitsPerChar: entropy.toFixed(2),
      total: Math.round(entropy * str.length)
    };
  },

  /* ─── X.509 CERTIFICATE INSPECTION (BASIC ASN.1 DER PARSER) ─── */
  parsePEMCertificate: async (pem) => {
    try {
      const b64 = pem.replace(/(-----(BEGIN|END) CERTIFICATE-----|\s)/g, '');
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for(let i=0; i<bin.length; i++) bytes[i] = bin.charCodeAt(i);

      // Extract string via OID heuristic
      const extractStrings = (oidBytes) => {
        let results = [];
        for(let i=0; i<bytes.length-20; i++) {
          let match = true;
          for(let j=0; j<oidBytes.length; j++) {
            if (bytes[i+j] !== oidBytes[j]) { match = false; break; }
          }
          if (match) {
            let t = bytes[i+oidBytes.length];
            if (t === 0x13 || t === 0x0c || t === 0x16) {
              let len = bytes[i+oidBytes.length+1];
              let start = i+oidBytes.length+2;
              results.push(new TextDecoder().decode(bytes.slice(start, start+len)));
            }
          }
        }
        return results;
      };

      const cns = extractStrings([0x06, 0x03, 0x55, 0x04, 0x03]);
      const orgs = extractStrings([0x06, 0x03, 0x55, 0x04, 0x0A]);
      const countries = extractStrings([0x06, 0x03, 0x55, 0x04, 0x06]);
      
      let dates = [];
      for(let i=0; i<bytes.length-15; i++) {
        if (bytes[i] === 0x17 && bytes[i+1] === 0x0D) {
          let dStr = new TextDecoder().decode(bytes.slice(i+2, i+15));
          let yr = parseInt(dStr.slice(0,2));
          yr = (yr < 50 ? 2000 : 1900) + yr;
          dates.push(`${yr}-${dStr.slice(2,4)}-${dStr.slice(4,6)} ${dStr.slice(6,8)}:${dStr.slice(8,10)} UTC`);
        }
      }
      
      let serial = "Unknown";
      for(let i=0; i<100; i++) {
        if (bytes[i] === 0x02 && bytes[i+1] > 4) {
          let slen = bytes[i+1];
          let hex = [];
          for(let j=0; j<slen; j++) hex.push(bytes[i+2+j].toString(16).padStart(2,'0'));
          serial = hex.join(':').toUpperCase();
          break;
        }
      }

      // Calculate SHA-256 fingerprint
      const hashBuf = await crypto.subtle.digest('SHA-256', bytes);
      const fingerprint = CE.bufToHex(hashBuf).toUpperCase().match(/.{1,2}/g).join(':');

      return {
        subject: `CN=${cns[1] || cns[0] || 'Unknown'}, O=${orgs[1] || orgs[0] || 'Unknown'}, C=${countries[1] || countries[0] || 'Unknown'}`,
        issuer: `CN=${cns[0] || 'Unknown'}, O=${orgs[0] || 'Unknown'}`,
        notBefore: dates[0] || 'Unknown',
        notAfter: dates[1] || 'Unknown',
        serial: serial,
        fingerprint: fingerprint
      };
    } catch (e) {
      throw new Error("Invalid or malformed PEM certificate format.");
    }
  },

  /* ─── ECDSA DIGITAL SIGNATURES ─── */
  generateECDSA: async () => {
    const pair = await crypto.subtle.generateKey(
      { name: 'ECDSA', namedCurve: 'P-256' },
      false, // Private key is NOT exportable — never serialized or logged
      ['sign', 'verify']
    );
    // Export public key only for display
    const pubRaw = await crypto.subtle.exportKey('spki', pair.publicKey);
    const pubJwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
    
    const b64 = btoa(String.fromCharCode(...new Uint8Array(pubRaw)));
    const pem = `-----BEGIN PUBLIC KEY-----\n${b64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;
    
    return {
      keyPair: pair,
      publicKeyHex: CE.bufToHex(pubRaw),
      publicKeyPem: pem,
      publicKeyJwk: JSON.stringify(pubJwk, null, 2)
    };
  },

  signECDSA: async (privateKey, message) => {
    const t0 = performance.now();
    const encoded = new TextEncoder().encode(message);
    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      privateKey,
      encoded
    );
    return {
      signature: signature,
      signatureHex: CE.bufToHex(signature),
      ms: (performance.now() - t0).toFixed(2)
    };
  },

  verifyECDSA: async (publicKey, signature, message) => {
    const t0 = performance.now();
    const encoded = new TextEncoder().encode(message);
    const valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      publicKey,
      signature,
      encoded
    );
    return { valid, ms: (performance.now() - t0).toFixed(2) };
  },

  exportPublicKeyECDSA: async (publicKey) => {
    const raw = await crypto.subtle.exportKey('spki', publicKey);
    return CE.bufToHex(raw);
  },

  /* ─── ECDH KEY EXCHANGE ─── */
  generateECDH: async () => {
    const pair = await crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveKey', 'deriveBits']
    );
    const pubJwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
    return { pair, pubJwk };
  },

  importPublicKeyECDH: async (jwk) => {
    return await crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      []
    );
  },

  deriveKeyECDH: async (privateKey, publicKey) => {
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'ECDH',
        public: publicKey
      },
      privateKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    // Export raw key for fingerprint
    const rawKey = await crypto.subtle.exportKey('raw', derivedKey);
    const hashBuf = await crypto.subtle.digest('SHA-256', rawKey);
    const fingerprint = CE.bufToHex(hashBuf).toUpperCase().match(/.{1,2}/g).join(':');

    return { derivedKey, fingerprint, rawKeyHex: CE.bufToHex(rawKey) };
  }
};
