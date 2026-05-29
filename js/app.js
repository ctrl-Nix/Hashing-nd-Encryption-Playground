/* ═══════════════════════════════════════════════ */
const App = {
  compareTimeout: null,
  crackWorker: null,
  S: {
    alias: '',
    lab: { algo: 'SHA-256', hmacAlgo: 'SHA-256', stegoImg: null, encMode: 'enc', fileBuffer: null, fileName: '' },
    story: { step: 0, maxStep: 0, algo: 'SHA-256', pwd: '', hashHex: '', hashBits: '', cipherData: null, tampered: false, score: 0 }
  },

  show: id => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0, 0);
  },

  resetState: () => {
    App.stopMD5Crack();
    App.S.alias = '';
    App.S.lab = { algo: 'SHA-256', hmacAlgo: 'SHA-256', stegoImg: null, encMode: 'enc', fileBuffer: null, fileName: '' };
    App.S.story = { step:0, maxStep:0, algo:'SHA-256', pwd:'', hashHex:'', hashBits:'', cipherData:null, tampered:false, score:0 };
    document.querySelectorAll('input:not([type=button]), textarea').forEach(el => el.value = '');
    ['lab-hash-result','lab-enc-result','rsa-keys-area','rsa-enc-res','rsa-dec-res','salt-demo-area','lab-hmac-result','lab-stego-result', 'crack-progress-area', 'crack-result-area'].forEach(id => { const el = document.getElementById(id); if(el) el.style.display='none'; });
    const nz = document.getElementById('story-next-zone'); if(nz) nz.innerHTML = '';
    const nameEl = document.getElementById('drop-filename'); if(nameEl) nameEl.innerText = '';
    const clearBtn = document.getElementById('btn-clear-file'); if(clearBtn) clearBtn.style.display = 'none';
  },

  goHome: () => { App.resetState(); App.show('screen-title'); },

  copyVal: (id, btn) => {
    const el = document.getElementById(id);
    if(!el) return;
    navigator.clipboard.writeText(el.innerText).catch(()=>{});
    btn.classList.add('copied');
    const txt = btn.querySelector('.copy-text');
    const ico = btn.querySelector('.copy-icon');
    const prevTxt = txt.textContent;
    txt.textContent = 'COPIED';
    ico.textContent = '✓';
    setTimeout(() => {
      btn.classList.remove('copied');
      txt.textContent = prevTxt;
      ico.textContent = '⧉';
    }, 2000);
  },

  pasteVal: async id => {
    try { document.getElementById(id).value = await navigator.clipboard.readText(); }
    catch { alert('Clipboard access denied — paste manually (Ctrl+V / Cmd+V).'); }
  },

  flash: id => {
    const el = document.getElementById(id);
    if(!el) return;
    el.classList.remove('glitch-flash');
    void el.offsetWidth; // Trigger reflow
    el.classList.add('glitch-flash');
  },

  /* ─── LAB ─── */
  startLab: () => { 
    App.resetState(); 
    App.show('screen-lab'); 
    App.setupDropZone();
    App.setupStegoDropZone();
    App.updateCrackTargetHash();
    App.setupKeyboardAccessibility();
  },

  exportTelemetry: (module) => {
    let data = { timestamp: new Date().toISOString(), module };
    
    if (module === 'hash') {
      data.algorithm = App.S.lab.algo;
      data.input = document.getElementById('lab-hash-in').value || 'File: ' + App.S.lab.fileName;
      data.salt = document.getElementById('lab-hash-salt').value;
      data.output = document.getElementById('lab-hash-out').innerText;
    } else if (module === 'enc') {
      data.mode = App.S.lab.encMode;
      data.input = document.getElementById('lab-enc-data').value;
      data.output = document.getElementById('lab-enc-out').innerText;
      data.derivedKey = document.getElementById('lab-debug-key').innerText;
    } else if (module === 'rsa-enc') {
      data.plain = document.getElementById('rsa-enc-in').value;
      data.publicKey = document.getElementById('rsa-enc-key').value;
      data.ciphertext = document.getElementById('rsa-cipher-out').innerText;
    } else if (module === 'rsa-dec') {
      data.ciphertext = document.getElementById('rsa-dec-in').value;
      data.privateKey = document.getElementById('rsa-dec-key').value;
      data.decrypted = document.getElementById('rsa-plain-out').innerText;
    } else if (module === 'hmac') {
      data.algorithm = App.S.lab.hmacAlgo;
      data.payload = document.getElementById('hmac-data').value;
      data.secretKey = document.getElementById('hmac-key').value;
      data.tag = document.getElementById('lab-hmac-out').innerText;
    } else if (module === 'stego') {
      data.payload = document.getElementById('stego-payload').value;
      data.output = document.getElementById('lab-stego-out').innerText;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nix_telemetry_${module}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  switchLabTab: tab => {
    document.querySelectorAll('.lab-tab').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-tab-'+tab).classList.add('active');
    document.querySelectorAll('.lab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('lab-'+tab).classList.add('active');
    window.scrollTo({ top: document.querySelector('.lab-tabs').offsetTop - 40, behavior: 'smooth' });
  },

  setupDropZone: () => {
    const zone = document.getElementById('drop-zone');
    if(!zone || zone.dataset.init) return;
    
    const input = document.getElementById('file-input');
    zone.onclick = () => input.click();
    
    zone.ondragover = (e) => { e.preventDefault(); zone.classList.add('hover'); };
    zone.ondragleave = () => zone.classList.remove('hover');
    zone.ondrop = (e) => {
      e.preventDefault();
      zone.classList.remove('hover');
      if(e.dataTransfer.files.length) App.handleFile(e.dataTransfer.files[0]);
    };
    input.onchange = (e) => {
      if(e.target.files.length) App.handleFile(e.target.files[0]);
    };
    
    const textIn = document.getElementById('lab-hash-in');
    if (textIn) {
      textIn.addEventListener('input', () => {
        App.clearLabFile();
      });
    }
    
    zone.dataset.init = "true";
  },

  handleFile: (file) => {
    const reader = new FileReader();
    const nameEl = document.getElementById('drop-filename');
    
    nameEl.innerText = "READING FILE...";
    reader.onload = (e) => {
      App.S.lab.fileBuffer = e.target.result;
      App.S.lab.fileName = file.name;
      nameEl.innerText = `${file.name} (${(file.size/1024).toFixed(1)} KB)`;
      const textIn = document.getElementById('lab-hash-in');
      if(textIn) textIn.value = ""; 
      const clearBtn = document.getElementById('btn-clear-file');
      if(clearBtn) clearBtn.style.display = 'block';
    };
    reader.readAsArrayBuffer(file);
  },

  clearLabFile: (e) => {
    if(e) e.stopPropagation();
    App.S.lab.fileBuffer = null;
    App.S.lab.fileName = '';
    const nameEl = document.getElementById('drop-filename');
    if(nameEl) nameEl.innerText = '';
    const fileInput = document.getElementById('file-input');
    if(fileInput) fileInput.value = '';
    const clearBtn = document.getElementById('btn-clear-file');
    if(clearBtn) clearBtn.style.display = 'none';
  },

  genRandomSalt: () => {
    const salt = Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2,'0')).join('');
    document.getElementById('lab-hash-salt').value = salt;
  },

  runCompare: async () => {
    const input = document.getElementById('cmp-input').value.trim();
    if (!input) {
      if (App.compareTimeout) clearTimeout(App.compareTimeout);
      document.getElementById('cmp-results').style.display = 'none';
      return;
    }
    if (App.compareTimeout) clearTimeout(App.compareTimeout);
    App.compareTimeout = setTimeout(async () => {
      const res = document.getElementById('cmp-results');
      res.style.display = 'block';

      const fillAlgo = async (algo, outId, bitsId, lenId) => {
        try {
          const r = await CE.hash(algo, input);
          if (document.getElementById('cmp-input').value !== input) return; 
          document.getElementById(outId).innerText = r.hex;
          document.getElementById(lenId).innerText = r.hex.length + ' chars';
          const grid = document.getElementById(bitsId); grid.innerHTML = '';
          for (let i = 0; i < Math.min(r.bits.length, 256); i++) {
            const b = document.createElement('div');
            b.className = 'bit' + (r.bits[i] === '1' ? ' on' : '');
            grid.appendChild(b);
          }
        } catch (e) {
          document.getElementById(outId).innerText = "ERROR: " + e.message;
        }
      };

      await Promise.all([
        fillAlgo('MD5',     'cmp-md5-out',    'cmp-md5-bits',    'cmp-md5-len'),
        fillAlgo('SHA-256', 'cmp-sha256-out', 'cmp-sha256-bits', 'cmp-sha256-len'),
        fillAlgo('SHA-512', 'cmp-sha512-out', 'cmp-sha512-bits', 'cmp-sha512-len'),
      ]);
    }, 150);
  },

  setLabAlgo: algo => {
    App.S.lab.algo = algo;
    document.querySelectorAll('#lab-algo-grid .algo-card').forEach(c => c.classList.remove('selected'));
    const card = document.getElementById('lab-'+algo); if(card) card.classList.add('selected');
  },

  runLabHash: async () => {
    App.flash('lab-hash');
    const textInput = document.getElementById('lab-hash-in').value;
    const salt = document.getElementById('lab-hash-salt').value;
    const data = App.S.lab.fileBuffer || textInput;
    
    if(!data) return alert('Enter plaintext or drop a file.');
    
    let inputData = data;
    if (salt) {
      if (typeof data === 'string') {
        inputData = data + salt;
      } else {
        const fileBytes = new Uint8Array(data);
        const saltBytes = new TextEncoder().encode(salt);
        const combined = new Uint8Array(fileBytes.length + saltBytes.length);
        combined.set(fileBytes);
        combined.set(saltBytes, fileBytes.length);
        inputData = combined.buffer;
      }
    }
    const r = await CE.hash(App.S.lab.algo, inputData);
    const res = document.getElementById('lab-hash-result');
    res.style.display = 'block';
    
    // Salt Comparison Demo
    const saltDemo = document.getElementById('salt-demo-area');
    if(salt && typeof data === 'string') {
      saltDemo.style.display = 'block';
      const rUnsalted = await CE.hash(App.S.lab.algo, data);
      document.getElementById('res-unsalted').innerText = rUnsalted.hex;
      document.getElementById('res-salted').innerText = r.hex;
      document.getElementById('salt-viz').innerHTML = `
        <span style="color:var(--bright); opacity:0.8;">"${data}"</span>
        <span style="color:var(--muted);">+</span>
        <span style="color:var(--c3); font-weight:700;">"${salt}"</span>
      `;
    } else {
      saltDemo.style.display = 'none';
    }

    const label = App.S.lab.fileBuffer ? `FILE HASH: ${App.S.lab.fileName}` : (salt ? 'SALTED STRING HASH' : 'STRING HASH');
    document.getElementById('lab-hash-out').innerText = r.hex;
    document.getElementById('lab-hash-time').innerText = `${r.ms}ms`;
    document.getElementById('lab-bit-count').innerText = r.bits.length;
    
    const grid = document.getElementById('lab-bit-grid'); 
    grid.innerHTML = `<div style="font-family:var(--font-mono); font-size:10px; color:var(--c); margin-bottom:10px;">[ TYPE: ${label} ]</div>`;
    
    for(let i=0; i<Math.min(r.bits.length,512); i++){
      const b = document.createElement('div'); b.className = 'bit'+(r.bits[i]==='1'?' on':''); grid.appendChild(b);
    }
    res.scrollIntoView({ behavior:'smooth', block:'nearest' });
  },

  setLabEncMode: mode => {
    App.S.lab.encMode = mode;
    document.getElementById('btn-mode-enc').className = 'btn'+(mode==='enc'?' btn-primary':'');
    document.getElementById('btn-mode-dec').className = 'btn'+(mode==='dec'?' btn-primary':'');
    document.getElementById('lab-enc-data').value = '';
    document.getElementById('lab-enc-key').value = '';
    document.getElementById('lab-enc-result').style.display = 'none';
    document.getElementById('lab-enc-lbl-data').innerText = mode==='enc' ? 'Plaintext Data' : 'Ciphertext Payload (Salt:IV:Cipher)';
    document.getElementById('lab-enc-data').placeholder = mode==='enc' ? 'Enter secret payload...' : 'Paste salt:iv:cipher payload...';
    document.getElementById('lab-enc-action').innerText = mode==='enc' ? 'EXECUTE ENCRYPTION' : 'EXECUTE DECRYPTION';
    document.getElementById('lab-btn-paste').style.display = mode==='enc' ? 'none' : 'block';
  },

  runLabEnc: async () => {
    App.flash('lab-enc');
    const data = document.getElementById('lab-enc-data').value;
    const pass = document.getElementById('lab-enc-key').value;
    if(!data||!pass) return alert('Provide data and passphrase.');
    const action = document.getElementById('lab-enc-action');
    const resBox = document.getElementById('lab-enc-result');
    const outEl  = document.getElementById('lab-enc-out');
    const dbgKey = document.getElementById('lab-debug-key');
    action.disabled = true;
    action.innerText = 'PROCESSING PBKDF2 (100K ITERATIONS)...';
    resBox.style.display = 'block';
    setTimeout(async () => {
      if(App.S.lab.encMode === 'enc') {
        const r = await CE.encrypt(data, pass);
        document.getElementById('lab-enc-lbl-res').innerText = 'GENERATED PAYLOAD (SALT:IV:CIPHER)';
        document.getElementById('lab-enc-time').innerText = `${r.ms}ms`;
        outEl.parentElement.className = 'copy-wrap';
        outEl.className = 'readout readout-cyan';
        outEl.innerText = r.payload;
        dbgKey.innerText = r.key;
        document.getElementById('lab-btn-copy').style.display = 'flex';
      } else {
        try {
          const r = await CE.decrypt(data, pass);
          document.getElementById('lab-enc-lbl-res').innerText = 'DECRYPTED PLAINTEXT';
          document.getElementById('lab-enc-time').innerText = `${r.ms}ms`;
          outEl.className = 'readout readout-green';
          outEl.innerText = r.plain;
          dbgKey.innerText = r.key;
          document.getElementById('lab-btn-copy').style.display = 'flex';
        } catch(e) {
          document.getElementById('lab-enc-lbl-res').innerText = 'DECRYPTION ERROR';
          document.getElementById('lab-enc-time').innerText = '';
          outEl.className = 'readout readout-red';
          outEl.innerText = `FATAL: ${e.message || 'Authentication Tag Mismatch or Bad Format.'}`;
          dbgKey.innerText = '—';
          document.getElementById('lab-btn-copy').style.display = 'none';
        }
      }
      action.disabled = false;
      action.innerText = App.S.lab.encMode==='enc' ? 'EXECUTE ENCRYPTION' : 'EXECUTE DECRYPTION';
      resBox.scrollIntoView({ behavior:'smooth', block:'nearest' });
    }, 60);
  },

  /* ─── RSA LAB ─── */
  runRSAGen: async () => {
    const btn = document.getElementById('btn-gen-rsa');
    btn.disabled = true; btn.innerText = 'GENERATING 2048-BIT KEY PAIR...';
    try {
      const keys = await CE.generateRSA();
      document.getElementById('rsa-pub-out').innerText = keys.pub;
      document.getElementById('rsa-priv-out').innerText = keys.priv;
      document.getElementById('rsa-keys-area').style.display = 'block';
      document.getElementById('rsa-enc-key').value = keys.pub;
      document.getElementById('rsa-dec-key').value = keys.priv;
    } catch (e) { alert('RSA Generation Failed: ' + e.message); }
    btn.disabled = false; btn.innerText = 'GENERATE NEW RSA KEY PAIR';
  },

  runRSAEncrypt: async () => {
    const plain = document.getElementById('rsa-enc-in').value;
    const pubKey = document.getElementById('rsa-enc-key').value.trim();
    if(!plain || !pubKey) return alert('Enter message and public key.');
    try {
      const r = await CE.rsaEncrypt(plain, pubKey);
      document.getElementById('rsa-cipher-out').innerText = r.cipher;
      document.getElementById('rsa-enc-res').style.display = 'block';
    } catch (e) { alert('RSA Encryption Failed: Check Public Key format.'); }
  },

  runRSADecrypt: async () => {
    const cipher = document.getElementById('rsa-dec-in').value.trim();
    const privKey = document.getElementById('rsa-dec-key').value.trim();
    if(!cipher || !privKey) return alert('Enter ciphertext and private key.');
    try {
      const r = await CE.rsaDecrypt(cipher, privKey);
      document.getElementById('rsa-plain-out').innerText = r.plain;
      document.getElementById('rsa-dec-res').style.display = 'block';
    } catch (e) { alert('RSA Decryption Failed: Bad key or corrupted ciphertext.'); }
  },

  /* ─── HMAC LAB ─── */
  setHMACAlgo: algo => {
    App.S.lab.hmacAlgo = algo;
    document.querySelectorAll('#hmac-algo-grid .algo-card').forEach(c => c.classList.remove('selected'));
    const card = document.getElementById('hmac-'+algo); if(card) card.classList.add('selected');
  },

  genHMACKey: () => {
    const key = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2,'0')).join('');
    document.getElementById('hmac-key').value = key;
  },

  runLabHMAC: async () => {
    App.flash('lab-hmac');
    const data = document.getElementById('hmac-data').value;
    const key = document.getElementById('hmac-key').value;
    if(!data || !key) return alert('Provide both a message and a secret key.');
    
    const r = await CE.hmac(App.S.lab.hmacAlgo, key, data);
    const res = document.getElementById('lab-hmac-result');
    res.style.display = 'block';
    document.getElementById('lab-hmac-out').innerText = r.hex;
    document.getElementById('lab-hmac-time').innerText = `${r.ms}ms`;
    res.scrollIntoView({ behavior:'smooth', block:'nearest' });
  },

  /* ─── STEGANOGRAPHY LAB ─── */
  setupStegoDropZone: () => {
    const zone = document.getElementById('stego-drop-zone');
    if(!zone || zone.dataset.init) return;
    const input = document.getElementById('stego-file-input');
    zone.onclick = () => input.click();
    zone.ondragover = (e) => { e.preventDefault(); zone.classList.add('hover'); };
    zone.ondragleave = () => zone.classList.remove('hover');
    zone.ondrop = (e) => { e.preventDefault(); zone.classList.remove('hover'); if(e.dataTransfer.files.length) App.handleStegoFile(e.dataTransfer.files[0]); };
    input.onchange = (e) => { if(e.target.files.length) App.handleStegoFile(e.target.files[0]); };
    zone.dataset.init = "true";
  },

  handleStegoFile: (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.getElementById('stego-canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width; canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        App.S.lab.stegoImg = img;
        document.getElementById('stego-preview-wrap').style.display = 'block';
        document.getElementById('stego-filename').innerText = `${file.name} (${img.width}x${img.height})`;
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  },

  runLabStegoEncode: () => {
    const canvas = document.getElementById('stego-canvas');
    const payload = document.getElementById('stego-payload').value;
    if(!App.S.lab.stegoImg || !payload) return alert('Upload an image and enter a payload.');
    
    try {
      const ctx = canvas.getContext('2d');
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const r = CE.stegoEncode(imgData.data, payload);
      ctx.putImageData(imgData, 0, 0);
      
      const link = document.createElement('a');
      link.download = 'secret_carrier.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      alert(`Success! Data encoded in ${r.ms}ms. Downloaded as secret_carrier.png`);
    } catch(e) { alert(e.message); }
  },

  runLabStegoDecode: () => {
    if(!App.S.lab.stegoImg) return alert('Upload the carrier image first.');
    const canvas = document.getElementById('stego-canvas');
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const r = CE.stegoDecode(imgData.data);
    
    const res = document.getElementById('lab-stego-result');
    res.style.display = 'block';
    document.getElementById('lab-stego-out').innerText = r.plain || '[ EMPTY OR CORRUPTED ]';
    document.getElementById('lab-stego-time').innerText = `${r.ms}ms`;
    res.scrollIntoView({ behavior:'smooth', block:'nearest' });
  },

  /* ─── STORY ─── */
  openAliasScreen: () => { App.resetState(); App.show('screen-alias'); setTimeout(() => document.getElementById('op-alias-input').focus(), 300); },
  submitAlias: () => {
    const alias = document.getElementById('op-alias-input').value.trim();
    if(!alias) return alert('Alias required.');
    App.S.alias = alias;
    document.getElementById('hud-alias-display').innerText = alias;
    App.setupKeyboardAccessibility();
    App.startStoryIntro();
  },

  startStoryIntro: async () => {
    App.show('screen-cutscene');
    const canvas = document.getElementById('matrix-rain');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const cols = Math.floor(canvas.width / 20);
    const drops = Array(cols).fill(1);
    const chars = 'アイウエオカキクケコ0123456789ABCDEF<>{}|/\\!@#$';
    const rainAnim = setInterval(() => {
      ctx.fillStyle = 'rgba(0,0,0,0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0,245,255,0.6)'; ctx.font = '14px monospace';
      drops.forEach((y,i) => {
        ctx.fillText(chars[Math.floor(Math.random()*chars.length)], i*20, y*20);
        if(y*20>canvas.height && Math.random()>0.975) drops[i]=0;
        drops[i]++;
      });
    }, 50);

    const term = document.getElementById('cutscene-term');
    term.innerHTML = '';
    const pause = ms => new Promise(r => setTimeout(r, ms));

    const typeEl = (el, txt, speed=14) => new Promise(r => {
      let i=0;
      const tick = setInterval(() => {
        el.textContent += txt[i++]||'';
        if(i>=txt.length) { clearInterval(tick); r(); }
      }, speed);
    });

    const glitch = async (el, times=2) => {
      const pool = '!<>-_\/[]{}—=+*^?#XQZW01'; const orig = el.textContent;
      for(let g=0;g<times;g++){
        el.textContent = orig.split('').map(c=>c===' '?' ':pool[Math.floor(Math.random()*pool.length)]).join('');
        await pause(50); el.textContent=orig; await pause(35);
      }
    };

    const addSysLine = async (txt, spd=13) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:baseline;gap:12px;margin-bottom:4px;opacity:0;transition:opacity 0.3s;';
      const badge = document.createElement('span'); badge.className='ct-sys'; badge.textContent='[SYS]';
      const span = document.createElement('span'); span.style.color='rgba(61,79,97,0.9)'; span.style.fontFamily='var(--font-mono)'; span.style.fontSize='13px';
      row.appendChild(badge); row.appendChild(span); term.appendChild(row);
      requestAnimationFrame(()=>row.style.opacity='1');
      await typeEl(span, txt, spd);
      return span;
    };

    const addNixLine = async (txt, spd=18, color='#c8d6e5') => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:flex-start;gap:16px;margin-bottom:8px;opacity:0;transition:opacity 0.35s;';
      const badge = document.createElement('div'); badge.className='ct-nix-badge';
      const dot = document.createElement('div'); dot.className='ct-nix-badge-dot';
      badge.appendChild(dot); badge.appendChild(document.createTextNode('NIX'));
      const span = document.createElement('span');
      span.style.cssText = `color:${color};font-family:var(--font-mono);font-size:15px;line-height:2.2;padding-top:2px;`;
      row.appendChild(badge); row.appendChild(span); term.appendChild(row);
      requestAnimationFrame(()=>row.style.opacity='1');
      await typeEl(span, txt, spd);
      return span;
    };

    const spacer = h => { const d = document.createElement('div'); d.style.height=h+'px'; term.appendChild(d); };
    const divider = async () => {
      const d = document.createElement('div');
      d.style.cssText='height:1px;background:linear-gradient(90deg,transparent,rgba(0,245,255,0.2),transparent);margin:20px 0;opacity:0;transition:opacity 0.5s;';
      term.appendChild(d); requestAnimationFrame(()=>d.style.opacity='1'); await pause(300);
    };

    // PHASE 1: Boot (Use StoryData)
    spacer(20);
    for(const l of StoryData.bootSequence) {
      await addSysLine(l, 8+Math.random()*8);
      await pause(30+Math.random()*40);
    }
    await pause(200);
    await divider();

    // PHASE 2: Network tunnel
    await addSysLine('Routing through Tor network — layer 1 ... layer 2 ... layer 3', 10);
    await pause(120);
    await addSysLine('MAC spoofed: 3E:F7:A2:09:CC:11 → FF:FF:FF:FF:FF:FF', 9);
    await pause(100);
    await addSysLine(`Probing Meridian Systems mainframe — 192.168.0.1:443 ...`, 11);
    await pause(180);

    const pbRow = document.createElement('div');
    pbRow.style.cssText='font-family:var(--font-mono);font-size:12px;color:rgba(61,79,97,0.8);margin:4px 0 8px;';
    term.appendChild(pbRow);
    for(let p=0;p<=100;p+=4) {
      const f=Math.floor(p/4);
      pbRow.innerHTML = `<span style="color:rgba(61,79,97,0.5)">  [</span><span style="color:var(--c)">${'█'.repeat(f)}</span><span style="color:rgba(61,79,97,0.3)">${'·'.repeat(25-f)}</span><span style="color:rgba(61,79,97,0.5)">] </span><span style="color:rgba(0,245,255,0.7)">${p}% HANDSHAKE</span>`;
      await pause(18);
    }
    pbRow.innerHTML = `<span style="color:var(--c3)">  [█████████████████████████] 100% — CONNECTION ESTABLISHED ✓</span>`;
    await pause(400);

    await addSysLine('Firewall bypassed. Auth token forged. Tunnel is LIVE.', 10);
    await pause(500);

    for(let f=0;f<6;f++){
      term.style.filter = f%2===0 ? `brightness(${1.3+Math.random()*0.5}) hue-rotate(${Math.random()*30}deg)` : '';
      await pause(40);
    }
    term.style.filter='';
    await pause(200);

    await divider();

    // PHASE 3: NIX speaks (Use StoryData)
    for(const line of StoryData.nixIntro) {
      const span = await addNixLine(line.m(App.S.alias), 18, '#d8e8f8');
      if(line.glitch) await glitch(span, 2);
      await pause(line.wait);
      term.scrollTop = term.scrollHeight;
    }
    await pause(400);

    const endDiv = document.createElement('div');
    endDiv.style.cssText='height:1px;background:linear-gradient(90deg,transparent,rgba(0,245,255,0.15),transparent);margin:28px 0 10px;opacity:0;transition:opacity 0.5s;';
    term.appendChild(endDiv); requestAnimationFrame(()=>endDiv.style.opacity='1');
    await pause(300);

    const wrap = document.createElement('div'); wrap.className='cta-wrap';
    wrap.style.opacity='0'; wrap.style.transition='opacity 0.7s';
    const hint = document.createElement('span'); hint.className='cta-hint';
    hint.textContent='// awaiting hacker confirmation to begin mission ...';
    const btn = document.createElement('button'); btn.className='cta-btn';
    btn.innerHTML='<span>▶</span><span>&nbsp;&nbsp;JACK IN — BEGIN MISSION</span>';
    btn.onclick = async () => {
      clearInterval(rainAnim);
      btn.style.pointerEvents='none';
      btn.innerHTML='<span>[ ESTABLISHING NEURAL LINK... ]</span>';
      await pause(350);
      document.getElementById('screen-cutscene').style.transition='opacity 0.6s';
      document.getElementById('screen-cutscene').style.opacity='0';
      await pause(650);
      document.getElementById('screen-cutscene').style.opacity='';
      document.getElementById('screen-cutscene').style.transition='';
      App.S.story.step=0; App.S.story.maxStep=0;
      await App.ensureStoryState();
      App.renderStory();
    };
    wrap.appendChild(hint); wrap.appendChild(btn);
    term.appendChild(wrap); term.scrollTop=term.scrollHeight;
    requestAnimationFrame(()=>wrap.style.opacity='1');
  },

  ensureStoryState: async () => {
    if(!App.S.story.pwd) {
      App.S.story.pwd = 'MeridianAdmin99';
      const r = await CE.hash('SHA-256', App.S.story.pwd);
      App.S.story.hashHex = r.hex; App.S.story.hashBits = r.bits;
    }
    if(App.S.story.step === 7) {
      await App.ensureCAKeys();
    }
  },

  ensureCAKeys: async () => {
    if(!App.S.story.caKeys) {
      App.S.story.caKeys = await CE.generateECDSA();
      App.S.story.serverKeys = await CE.generateECDSA();
    }
  },

  renderStoryMap: () => {
    const titles = ['Init','Avalanche','Auth','Breach','AES-GCM','Stego','Forger','Authority','Eval'];
    const S = App.S.story;
    let html='';
    for(let i=0;i<9;i++){
      const done=i<S.maxStep, active=i===S.step, unlocked=i<=S.maxStep;
      html+=`<div class="cm-node${done?' done':''}${active?' active':''}${unlocked?' unlocked':''}" ${unlocked?`onclick="App.jumpToStory(${i})"`:''} tabindex="${unlocked?'0':'-1'}" role="button">
        <div class="cm-diamond"></div><div class="cm-lbl">${titles[i]}</div>
      </div>`;
      if(i<8) html+=`<div class="cm-line${done?' done':''}"></div>`;
    }
    document.getElementById('story-map').innerHTML=html;
  },

  jumpToStory: async idx => {
    if(idx<=App.S.story.maxStep){ App.S.story.step=idx; await App.ensureStoryState(); App.renderStory(); }
  },

  showNextBtn: nextIdx => {
    if(App.S.story.maxStep<nextIdx) App.S.story.maxStep=nextIdx;
    App.renderStoryMap();
    const zone=document.getElementById('story-next-zone');
    zone.innerHTML='';
    zone.style.cssText='margin-top:28px;border-top:1px solid var(--border);padding-top:24px;';
    if(nextIdx===4) {
      zone.innerHTML=`<button class="btn btn-primary btn-full" onclick="App.runStoryBreachCutscene()">PROCEED TO NEXT PHASE →</button>`;
    } else if(nextIdx>=7) {
      zone.innerHTML=`<button class="btn btn-success btn-full" onclick="App.goHome()">MISSION ACCOMPLISHED — RETURN TO BASE</button>`;
    } else {
      zone.innerHTML=`<button class="btn btn-primary btn-full" onclick="App.jumpToStory(${nextIdx})">PROCEED TO NEXT PHASE →</button>`;
    }
    setTimeout(()=>zone.scrollIntoView({behavior:'smooth',block:'center'}),120);
  },

  renderStory: () => {
    App.show('screen-story-main');
    App.renderStoryMap();
    
    const step = App.S.story.step;
    const data = StoryData.missions[step];
    
    document.getElementById('story-module-name').innerText = data.module;
    document.getElementById('story-panel-title').innerText = data.title;
    
    const dBox=document.getElementById('story-dialogue');
    const aBox=document.getElementById('story-action-zone');
    document.getElementById('story-next-zone').innerHTML='';

    // Setup Dialogue (from StoryData)
    dBox.className = `dialogue dlg-${data.dialogue.toLowerCase()}`;
    const txt = typeof data.text === 'function' ? data.text(App.S.alias) : data.text;
    dBox.innerHTML = `<div class="dlg-badge">${data.dialogue}</div><div class="dlg-text">${txt}</div>`;

    if(step===0){
      aBox.innerHTML=`
        <span class="form-label">1. Select Hash Protocol</span>
        <div class="algo-grid" id="story-algo-grid">
          <div class="algo-card" onclick="App.selectStoryAlgo(this,'MD5')"><div class="algo-dot"></div><div><div class="algo-name">MD5</div><div class="algo-tag">BROKEN</div></div></div>
          <div class="algo-card" onclick="App.selectStoryAlgo(this,'SHA-1')"><div class="algo-dot"></div><div><div class="algo-name">SHA-1</div><div class="algo-tag">DEPRECATED</div></div></div>
          <div class="algo-card selected" onclick="App.selectStoryAlgo(this,'SHA-256')"><div class="algo-dot"></div><div><div class="algo-name">SHA-256</div><div class="algo-tag">SECURE</div></div></div>
          <div class="algo-card" onclick="App.selectStoryAlgo(this,'SHA-512')"><div class="algo-dot"></div><div><div class="algo-name">SHA-512</div><div class="algo-tag">SECURE</div></div></div>
        </div>
        <span class="form-label">2. Set Control Node Password</span>
        <input type="text" class="form-input" id="s-hash-in" placeholder="e.g. ProtocolBeta99" onkeydown="if(event.key==='Enter') App.runStoryHash()">
        <div class="btn-group"><button class="btn btn-primary" onclick="App.runStoryHash()">GENERATE FINGERPRINT</button></div>
        <div id="s-hash-res" style="margin-top:20px;"></div>
      `;
      App.S.story.algo='SHA-256';
    }
    else if(step===1){
      aBox.innerHTML=`
        <span class="form-label">Original Password (Locked)</span>
        <input class="form-input" disabled value="${App.S.story.pwd}" style="opacity:0.4;margin-bottom:4px;">
        <span class="form-label">Modified Password</span>
        <input class="form-input" id="s-av-in" placeholder="Change one character..." oninput="App.runStoryAvalanche()">
        <div class="bit-grid" id="s-av-grid" style="margin-top:12px;"></div>
        <div id="s-av-res" style="font-family:var(--font-mono);font-size:12px;color:var(--muted);margin-top:10px;"></div>
      `;
      App.runStoryAvalanche(true);
    }
    else if(step===2){
      aBox.innerHTML=`
        <div class="btn-group"><button class="btn btn-danger" onclick="App.runStoryBruteForce()" id="btn-brute">INITIALIZE BRUTE FORCE SCRIPT ⚡</button></div>
        <div class="term" id="brute-term" style="display:none;margin-top:16px;"></div>
        <div id="s-log-res" style="display:none;margin-top:20px;">
          <span class="form-label">Final Comparator — <span class="status-tag st-ok">MATCH</span> vs <span class="status-tag st-err">MISMATCH</span></span>
          <div class="hash-compare" id="s-log-db" style="margin-bottom:8px;"></div>
          <div class="hash-compare" id="s-log-typed"></div>
          <div id="s-log-msg" style="margin-top:14px;font-family:var(--font-mono);font-size:12px;"></div>
        </div>
      `;
    }
    else if(step===3){
      aBox.innerHTML=`
        <div class="btn-group"><button class="btn btn-danger" onclick="App.runStoryBruteForce()" id="btn-breach-start">[ INITIATE PERIMETER SCAN ]</button></div>
        <div class="term" id="s-breach-term" style="display:none;margin-top:16px;"></div>
      `;
    }
    else if(step===4){
      aBox.innerHTML=`
        <div style="display:flex;gap:8px;margin-bottom:24px;">
          <button class="btn btn-primary" id="s-mode-enc" onclick="App.setStoryEncMode('enc')" style="flex:1;">🔒 ENCRYPT</button>
          <button class="btn" id="id-mode-dec" onclick="App.setStoryEncMode('dec')" style="flex:1;">🔓 DECRYPT</button>
        </div>
        <div id="s-enc-panel">
          <span class="form-label" style="color:var(--c3);">1. Client Encryption Phase</span>
          <div style="font-size:13px;color:var(--muted);margin-bottom:12px;font-family:var(--font-ui);">Protect the payload below. Enter a passphrase — only someone with this key can decrypt it.</div>
          <input class="form-input" value="LOCKDOWN_PROTOCOL_ALPHA" disabled style="opacity:0.5;margin-bottom:8px;">
          <input type="password" class="form-input" id="s-enc-in" placeholder="Create encryption passphrase...">
          <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
            <button class="btn btn-primary" id="s-enc-btn" onclick="App.runStoryEncrypt()" style="flex:1;">STRETCH KEY & ENCRYPT</button>
            <button class="btn" onclick="App.retryStoryEncrypt()">↺ RETRY</button>
          </div>
          <div id="s-enc-res" style="margin-top:20px;"></div>
        </div>
        <div id="s-dec-panel" style="display:none;">
          <span class="form-label" style="color:var(--c);">Standalone Decryption</span>
          <div style="font-size:13px;color:var(--muted);margin-bottom:12px;font-family:var(--font-ui);">Paste any AES-GCM payload (Salt:IV:Cipher) and its passphrase to decrypt — works with Pro Sandbox payloads too.</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span class="form-label" style="margin:0;">Ciphertext Payload</span>
            <button class="paste-btn" onclick="App.pasteVal('s-standalone-payload')">📋 PASTE</button>
          </div>
          <textarea class="form-input" id="s-standalone-payload" style="min-height:70px;" placeholder="Paste salt:iv:cipher here..."></textarea>
          <span class="form-label">Passphrase</span>
          <input type="password" class="form-input" id="s-standalone-key" placeholder="Decryption passphrase...">
          <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
            <button class="btn btn-primary" onclick="App.runStandaloneDecrypt()" style="flex:1;">🔓 DECRYPT</button>
            <button class="btn" onclick="App.clearStandaloneDecrypt()">↺ CLEAR</button>
          </div>
          <div id="s-standalone-res" style="margin-top:20px;"></div>
        </div>
      `;
    }
    else if(step===5){
      aBox.innerHTML=`
        <div id="stego-story-zone" class="panel" style="padding:24px; background:rgba(0,0,0,0.4); border-style:dashed;">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
            <div>
              <span class="form-label">Carrier Image</span>
              <div id="stego-story-drop" class="drop-zone" style="min-height:100px;">
                <div class="drop-text" style="font-size:12px;">DRAG & DROP DECOY IMAGE</div>
              </div>
              <canvas id="stego-story-canvas" style="display:none; max-width:100%; margin-top:12px; border:1px solid var(--c);"></canvas>
            </div>
            <div>
              <span class="form-label">Encrypted Data</span>
              <textarea id="stego-story-data" class="form-input" style="font-size:11px; height:80px;" disabled>0fe721:bc892a:f821de77bc21009822a1f8...</textarea>
              <button class="btn btn-primary btn-full" style="margin-top:12px;" onclick="App.runStoryStego()">ENCODE & EXFILTRATE</button>
            </div>
          </div>
          <div id="stego-story-res" style="display:none; margin-top:20px; text-align:center;">
             <div class="status-tag st-ok">DATA SUCCESSFULLY HIDDEN IN PIXELS</div>
             <p style="font-size:11px; color:var(--muted); margin-top:8px;">The carrier image has been modified with the AES ciphertext. To the network monitors, it looks like a standard image upload.</p>
          </div>
        </div>
      `;
      App.setupStoryStegoDrop();
    }
    else if(step===6){
      aBox.innerHTML=`
        <div class="panel" style="padding:20px; background:rgba(0,0,0,0.3); border:1px dashed var(--border);">
          <span class="form-label">Message to Sign</span>
          <input type="text" class="form-input" id="s-ecdsa-msg" value="AUTHENTIC_FIRMWARE_V2.1" onkeydown="if(event.key==='Enter') App.runStoryECDSASign()">
          <button class="btn btn-primary btn-full" style="margin-top:12px;" onclick="App.runStoryECDSASign()">GENERATE KEY PAIR & SIGN</button>
        </div>
        
        <div id="s-ecdsa-res" style="display:none; margin-top:20px;">
          <span class="form-label">Sender Public Key (Shareable)</span>
          <div class="readout readout-cyan" style="font-size:10px; max-height:80px; overflow-y:auto; word-break:break-all;" id="s-ecdsa-pub"></div>
          
          <span class="form-label" style="margin-top:12px;">ECDSA Signature (Hex)</span>
          <div class="sig-bytes" id="s-ecdsa-sig" style="max-height:80px; overflow-y:auto;"></div>
          
          <div style="display:flex; gap:8px; margin-top:16px;">
            <button class="tamper-btn" onclick="App.runStoryECDSATamper()">[ TAMPER MESSAGE ]</button>
            <button class="btn" onclick="App.runStoryECDSAVerifyOriginal()">VERIFY ORIGINAL</button>
          </div>
          
          <div id="s-ecdsa-status-box" style="margin-top:16px;"></div>
        </div>
      `;
    }
    else if(step===7){
      aBox.innerHTML=`
        <div class="panel" style="padding:20px; background:rgba(0,0,0,0.3); border: 1px dashed var(--border);">
          <span class="form-label">1. Certificate Subject (Domain)</span>
          <input type="text" class="form-input" id="s-cert-domain" value="meridian.sys" onkeydown="if(event.key==='Enter') App.runStoryIssueCert()">
          
          <span class="form-label" style="margin-top:12px;">2. Validity Period</span>
          <select id="s-cert-validity" class="form-input" style="min-height:auto; padding:12px; cursor:pointer;">
            <option value="1 Year">1 Year</option>
            <option value="5 Years" selected>5 Years</option>
            <option value="10 Years">10 Years</option>
          </select>
          
          <span class="form-label" style="margin-top:12px;">3. Server Public Key (Auto-Filled)</span>
          <input type="text" class="form-input" id="s-cert-pub" value="${App.S.story.serverKeys.publicKeyHex.substring(0, 40)}..." disabled style="opacity:0.6;">
          
          <button class="btn btn-primary btn-full" style="margin-top:16px;" onclick="App.runStoryIssueCert()">ISSUE DIGITAL CERTIFICATE</button>
        </div>
        
        <div id="s-cert-res" style="display:none; margin-top:20px;"></div>
      `;
    }
    else if(step===8){
      let html='';
      StoryData.quiz.forEach((q,qi)=>{
        html+=`<div class="panel" style="padding:20px;margin-bottom:12px;"><div style="margin-bottom:14px;font-weight:600;font-size:15px;color:var(--bright);font-family:var(--font-ui);">${q.q}</div>`;
        q.o.forEach((opt,oi)=>html+=`<button class="quiz-opt" id="q-${qi}-${oi}" onclick="App.ansQuiz(${qi},${oi},${q.c})">${opt}</button>`);
        html+=`</div>`;
      });
      aBox.innerHTML=html+`<div id="s-quiz-res"></div>`;
      App.S.story.score=0;
    }
  },

  selectStoryAlgo: (el, algo) => {
    App.S.story.algo = algo;
    el.parentElement.querySelectorAll('.algo-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
  },

  runStoryHash: async () => {
    const input = document.getElementById('s-hash-in').value.trim();
    if(!input) return alert('Enter a password first.');
    App.S.story.pwd = input;
    const r = await CE.hash(App.S.story.algo, input);
    App.S.story.hashHex = r.hex;
    App.S.story.hashBits = r.bits;
    
    const res = document.getElementById('s-hash-res');
    res.innerHTML = `
      <div class="readout readout-green" style="font-size:12px; margin-bottom:12px;">
        <div style="font-size:9px; color:var(--muted); margin-bottom:4px;">GENERATED FINGERPRINT (${App.S.story.algo})</div>
        ${r.hex}
      </div>
      <div class="bit-grid" style="max-height:100px;"></div>
    `;
    const grid = res.querySelector('.bit-grid');
    for(let i=0; i<Math.min(r.bits.length, 256); i++) {
      const b = document.createElement('div'); b.className = 'bit' + (r.bits[i]==='1'?' on':''); grid.appendChild(b);
    }
    App.showNextBtn(1);
  },

  runStoryAvalanche: async (init) => {
    const inputEl = document.getElementById('s-av-in');
    const input = inputEl ? inputEl.value : '';
    if (!init && !input) {
      init = true;
    }
    const r = await CE.hash(App.S.story.algo, input);
    const grid = document.getElementById('s-av-grid');
    const res = document.getElementById('s-av-res');
    if(!grid) return;
    grid.innerHTML = '';
    
    let diffs = 0;
    const maxBits = Math.min(r.bits.length, 256);
    for(let i=0; i<maxBits; i++) {
      const b = document.createElement('div');
      const bitOn = r.bits[i] === '1';
      const isDiff = !init && r.bits[i] !== App.S.story.hashBits[i];
      if(isDiff) diffs++;
      b.className = 'bit' + (bitOn ? ' on' : '') + (isDiff ? ' diff' : '');
      grid.appendChild(b);
    }
    
    if(!init) {
      const percent = ((diffs / maxBits) * 100).toFixed(1);
      res.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span>BIT FLIPS DETECTED: <strong style="color:var(--c2);">${diffs}</strong> / ${maxBits}</span>
          <span class="status-tag ${diffs > 100 ? 'st-ok' : 'st-warn'}">${percent}% VARIANCE</span>
        </div>
      `;
      if(input !== App.S.story.pwd && input.length > 0) App.showNextBtn(2);
    } else {
      res.innerHTML = '// Modify the password above to observe the avalanche effect.';
    }
  },

  runStoryBruteForce: async () => {
    const step = App.S.story.step;
    const btn = document.getElementById(step === 2 ? 'btn-brute' : 'btn-breach-start');
    const term = document.getElementById(step === 2 ? 'brute-term' : 's-breach-term');
    btn.disabled = true;
    term.style.display = 'block';
    term.innerHTML = '';
    
    const log = (txt, cls='') => {
      const l = document.createElement('div'); l.className = 'tl ' + cls; l.innerHTML = txt;
      term.appendChild(l); term.scrollTop = term.scrollHeight;
    };

    if(step === 2) {
      log('>> INITIALIZING DICTIONARY ATTACK...', 'to');
      await new Promise(r => setTimeout(r, 600));
      const guesses = ['password', '123456', 'admin', 'qwerty', 'meridian', App.S.story.pwd];
      for(const g of guesses) {
        log(`TRYING: <span class="tc">${g}</span> ...`, 'to');
        const r = await CE.hash(App.S.story.algo, g);
        log(`HASH: ${r.hex.substring(0,32)}...`, 'to');
        await new Promise(r => setTimeout(r, 400));
        if(g === App.S.story.pwd) {
          log('!! MATCH FOUND !! ACCESS GRANTED.', 'tc');
          document.getElementById('s-log-res').style.display = 'block';
          document.getElementById('s-log-db').innerHTML = `<span class="to">DB_HASH:</span> ${App.S.story.hashHex}`;
          document.getElementById('s-log-typed').innerHTML = `<span class="to">IN_HASH:</span> ${r.hex}`;
          document.getElementById('s-log-msg').innerHTML = '<span class="st-ok">SIGNATURE VERIFIED // SESSION OPEN</span>';
          App.showNextBtn(3);
          break;
        } else {
          log('ERROR: HASH MISMATCH. REJECTED.', 'te');
        }
      }
    } else {
      log('>> SCANNING NETWORK TOPOLOGY...', 'to');
      await new Promise(r => setTimeout(r, 800));
      log('>> VULNERABILITY FOUND: CVE-2026-X99 (Buffer Overflow)', 'te');
      await new Promise(r => setTimeout(r, 600));
      log('>> INJECTING PAYLOAD...', 'tc');
      await new Promise(r => setTimeout(r, 1000));
      log('!! EXPLOIT SUCCESSFUL. DROPPING SHELL.', 'tc');
      App.showNextBtn(4);
    }
  },

  runStoryBreachCutscene: async () => {
    App.show('screen-cutscene');
    const term = document.getElementById('cutscene-term');
    term.innerHTML = '';
    
    const addLine = (txt, cls='') => {
      const d = document.createElement('div'); d.className = cls;
      if(cls === 'ct-nix-badge') {
         const b = document.createElement('div'); b.className = 'ct-nix-badge';
         b.innerHTML = '<div class="ct-nix-badge-dot"></div>NIX';
         term.appendChild(b);
      }
      const s = document.createElement('span'); s.style.cssText = 'color:var(--c2); font-family:var(--font-mono); font-size:15px; margin-left:12px;';
      s.textContent = txt; term.appendChild(d); d.appendChild(s);
      term.scrollTop = term.scrollHeight;
    };

    const addSysLine = async (txt) => {
       const row = document.createElement('div'); row.style.marginBottom = '4px';
       row.innerHTML = `<span class="ct-sys">[ALRT]</span> <span style="color:var(--c2); font-family:var(--font-mono);">${txt}</span>`;
       term.appendChild(row); term.scrollTop = term.scrollHeight;
    };

    await addSysLine('!!! CRITICAL SYSTEM ALERT !!!');
    await new Promise(r => setTimeout(r, 500));
    await addSysLine('UNAUTHORIZED ACCESS DETECTED AT NODE 0xF2');
    await new Promise(r => setTimeout(r, 400));
    await addSysLine('ENCRYPTION ARCHITECTURE COMPROMISED...');
    await new Promise(r => setTimeout(r, 1000));
    
    const wrap = document.createElement('div'); wrap.className = 'cta-wrap';
    const btn = document.createElement('button'); btn.className = 'cta-btn';
    btn.innerHTML = '<span>⚠</span><span>&nbsp;&nbsp;EMERGENCY LOCKDOWN</span>';
    btn.onclick = () => {
      App.jumpToStory(4);
    };
    wrap.appendChild(btn);
    term.appendChild(wrap);
  },

  setStoryEncMode: mode => {
    document.getElementById('s-mode-enc').className = 'btn' + (mode === 'enc' ? ' btn-primary' : '');
    document.getElementById('id-mode-dec').className = 'btn' + (mode === 'dec' ? ' btn-primary' : '');
    document.getElementById('s-enc-panel').style.display = mode === 'enc' ? 'block' : 'none';
    document.getElementById('s-dec-panel').style.display = mode === 'dec' ? 'block' : 'none';
  },

  runStoryEncrypt: async () => {
    const pass = document.getElementById('s-enc-in').value;
    if(!pass) return alert('Create a passphrase to lock the data.');
    const btn = document.getElementById('s-enc-btn');
    btn.disabled = true;
    btn.innerText = 'STRETCHING KEY (PBKDF2)...';
    
    setTimeout(async () => {
      const r = await CE.encrypt('LOCKDOWN_PROTOCOL_ALPHA', pass);
      const res = document.getElementById('s-enc-res');
      res.innerHTML = `
        <div class="status-tag st-ok" style="margin-bottom:12px;">ENCRYPTION COMPLETE</div>
        <div class="readout readout-cyan" style="font-size:11px; padding-right:80px;">${r.payload}</div>
        <div style="font-size:10px; color:var(--muted); margin-top:8px;">// This payload contains your Salt, IV, and Ciphertext. It is now safely unreadable without your key.</div>
      `;
      btn.disabled = false;
      btn.innerText = 'STRETCH KEY & ENCRYPT';
      App.showNextBtn(5);
    }, 100);
  },

  retryStoryEncrypt: () => {
    document.getElementById('s-enc-in').value = '';
    document.getElementById('s-enc-res').innerHTML = '';
  },

  runStandaloneDecrypt: async () => {
    const payload = document.getElementById('s-standalone-payload').value.trim();
    const pass = document.getElementById('s-standalone-key').value;
    const res = document.getElementById('s-standalone-res');
    if(!payload || !pass) return alert('Enter both the payload and the passphrase.');
    
    try {
      const r = await CE.decrypt(payload, pass);
      res.innerHTML = `
        <div class="status-tag st-ok">SUCCESS</div>
        <div class="readout readout-green" style="margin-top:12px;">${r.plain}</div>
      `;
    } catch(e) {
      res.innerHTML = `
        <div class="status-tag st-err">FAILED</div>
        <div class="readout readout-red" style="margin-top:12px;">${e.message}</div>
      `;
    }
  },

  clearStandaloneDecrypt: () => {
    document.getElementById('s-standalone-payload').value = '';
    document.getElementById('s-standalone-key').value = '';
    document.getElementById('s-standalone-res').innerHTML = '';
  },

  setupStoryStegoDrop: () => {
    const zone = document.getElementById('stego-story-drop');
    if(!zone) return;
    zone.ondragover = (e) => { e.preventDefault(); zone.classList.add('hover'); };
    zone.ondragleave = () => zone.classList.remove('hover');
    zone.ondrop = (e) => {
      e.preventDefault(); zone.classList.remove('hover');
      if(e.dataTransfer.files.length) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
             const canvas = document.getElementById('stego-story-canvas');
             const ctx = canvas.getContext('2d');
             canvas.width = img.width; canvas.height = img.height;
             ctx.drawImage(img, 0, 0);
             canvas.style.display = 'block';
             zone.style.display = 'none';
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(e.dataTransfer.files[0]);
      }
    };
  },

  runStoryStego: () => {
    const canvas = document.getElementById('stego-story-canvas');
    if(canvas.style.display === 'none') return alert('Please upload a decoy image first.');
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0,0,canvas.width,canvas.height);
    CE.stegoEncode(imgData.data, "0fe721:bc892a:f821de77bc21009822a1f8...");
    ctx.putImageData(imgData, 0, 0);
    document.getElementById('stego-story-res').style.display = 'block';
    App.showNextBtn(6);
  },

  ansQuiz: (qi,oi,c) => {
    document.querySelectorAll(`[id^='q-${qi}-']`).forEach(b=>b.disabled=true);
    if(oi===c){document.getElementById(`q-${qi}-${oi}`).classList.add('correct'); App.S.story.score++;}
    else{document.getElementById(`q-${qi}-${oi}`).classList.add('wrong'); document.getElementById(`q-${qi}-${c}`).classList.add('correct');}
    const total=document.querySelectorAll('.quiz-opt').length;
    const disabled=document.querySelectorAll('.quiz-opt:disabled').length;
    if(disabled===total){
      const s=App.S.story.score;
      const qlen = StoryData.quiz.length;
      document.getElementById('s-quiz-res').innerHTML=`
        <div class="score-card">
          <div class="score-big">${s}/${qlen}</div>
          <div class="score-label">EVALUATION SCORE</div>
          <div style="font-family:var(--font-mono);font-size:12px;color:var(--muted);margin-bottom:24px;">${s===qlen?'PERFECT SCORE. CLEARED FOR FIELD OPERATIONS.':s>=Math.floor(qlen*0.7)?'STRONG PERFORMANCE. MINOR GAPS DETECTED.':'FURTHER TRAINING REQUIRED.'}</div>
          <button class="btn btn-success" onclick="App.goHome()">RETURN TO MAIN MENU</button>
        </div>
      `;
    }
  },

  /* ─── NEW FEATURES AND RESTRUCTURED FUNCTIONS ─── */
  
  // Keyboard Accessibility Setup
  setupKeyboardAccessibility: () => {
    // Only setup once
    if (window.keyboardAccessInit) return;
    window.keyboardAccessInit = true;

    document.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        const target = e.target;
        if (target && target.getAttribute('tabindex') === '0') {
          if (e.key === ' ') e.preventDefault(); // Prevent page scroll
          target.click();
        }
      }
    });
  },

  // ECDSA Story Mode Actions
  runStoryECDSASign: async () => {
    const msg = document.getElementById('s-ecdsa-msg').value;
    if(!msg) return alert('Enter a message to sign.');
    
    try {
      const keys = await CE.generateECDSA();
      App.S.story.ecdsaKeyPair = keys.keyPair;
      App.S.story.ecdsaPubKeyHex = keys.publicKeyHex;
      App.S.story.ecdsaMsg = msg;
      
      const sigObj = await CE.signECDSA(keys.keyPair.privateKey, msg);
      App.S.story.ecdsaSig = sigObj.signature;
      App.S.story.ecdsaSigHex = sigObj.signatureHex;
      
      document.getElementById('s-ecdsa-pub').innerText = keys.publicKeyHex;
      document.getElementById('s-ecdsa-sig').innerText = sigObj.signatureHex;
      document.getElementById('s-ecdsa-res').style.display = 'block';
      
      const statusBox = document.getElementById('s-ecdsa-status-box');
      statusBox.innerHTML = `
        <div class="sig-result sig-valid">
          <div class="sig-status valid">✓ SIGNATURE VALID</div>
          <p style="font-size:11px; color:var(--muted);">Verified against Public Key. The message is authentic and untampered.</p>
        </div>
      `;
      App.S.story.sigVerifiedValid = true;
      App.S.story.sigVerifiedInvalid = false; // reset tamper status
    } catch(e) {
      alert('ECDSA Signing Failed: ' + e.message);
    }
  },

  runStoryECDSATamper: async () => {
    if(!App.S.story.ecdsaKeyPair) return alert('Sign the message first.');
    const msg = App.S.story.ecdsaMsg;
    const tamperedMsg = msg + "_TAMPERED";
    document.getElementById('s-ecdsa-msg').value = tamperedMsg;
    
    const r = await CE.verifyECDSA(App.S.story.ecdsaKeyPair.publicKey, App.S.story.ecdsaSig, tamperedMsg);
    const statusBox = document.getElementById('s-ecdsa-status-box');
    if(!r.valid) {
      statusBox.innerHTML = `
        <div class="sig-result sig-invalid">
          <div class="sig-status invalid">✗ SIGNATURE INVALID</div>
          <p style="font-size:11px; color:var(--muted);">Integrity Check Failed! The message has been altered after signing.</p>
        </div>
      `;
      App.S.story.sigVerifiedInvalid = true;
      App.flash('s-ecdsa-status-box');
    }
    
    if (App.S.story.sigVerifiedValid && App.S.story.sigVerifiedInvalid) {
      App.showNextBtn(7);
    }
  },

  runStoryECDSAVerifyOriginal: async () => {
    if(!App.S.story.ecdsaKeyPair) return alert('Sign the message first.');
    const msg = App.S.story.ecdsaMsg;
    document.getElementById('s-ecdsa-msg').value = msg;
    
    const r = await CE.verifyECDSA(App.S.story.ecdsaKeyPair.publicKey, App.S.story.ecdsaSig, msg);
    const statusBox = document.getElementById('s-ecdsa-status-box');
    if(r.valid) {
      statusBox.innerHTML = `
        <div class="sig-result sig-valid">
          <div class="sig-status valid">✓ SIGNATURE VALID</div>
          <p style="font-size:11px; color:var(--muted);">Verified against Public Key. The message is authentic and untampered.</p>
        </div>
      `;
      App.S.story.sigVerifiedValid = true;
    }
    
    if (App.S.story.sigVerifiedValid && App.S.story.sigVerifiedInvalid) {
      App.showNextBtn(7);
    }
  },

  // PKI Story Mode Actions
  runStoryIssueCert: async () => {
    const domain = document.getElementById('s-cert-domain').value.trim();
    const validity = document.getElementById('s-cert-validity').value;
    if(!domain) return alert('Enter a domain name.');
    
    const certObj = {
      domain: domain,
      validity: validity,
      publicKey: App.S.story.serverKeys.publicKeyHex
    };
    const certStr = JSON.stringify(certObj);
    App.S.story.certStr = certStr;
    
    const sigObj = await CE.signECDSA(App.S.story.caKeys.keyPair.privateKey, certStr);
    App.S.story.certSig = sigObj.signature;
    App.S.story.certSigHex = sigObj.signatureHex;
    
    App.S.story.certVerified = true;
    App.S.story.certTampered = false;
    App.renderStoryCertResult();
  },

  renderStoryCertResult: () => {
    const res = document.getElementById('s-cert-res');
    if(!res) return;
    
    res.style.display = 'block';
    
    const verified = App.S.story.certVerified;
    const certObj = JSON.parse(App.S.story.certStr);
    
    res.innerHTML = `
      <div class="cert-panel ${verified ? 'cert-valid' : 'cert-invalid'}">
        <div class="cert-lock ${verified ? 'secure' : 'broken'}">
          ${verified ? '🔒 SECURE CONNECTION // HTTPS ACTIVE' : '🔓 SECURITY ALERT // UNTRUSTED CERTIFICATE'}
        </div>
        
        <div class="cert-chain">
          <div class="cert-chain-node root">
            <strong>ROOT CA</strong><br>
            Trust Anchor
          </div>
          <div class="cert-chain-arrow">→</div>
          <div class="cert-chain-node server">
            <strong>${certObj.domain}</strong><br>
            ${verified ? 'Verifiable chain' : 'INVALID CHAIN'}
          </div>
        </div>
        
        <div class="cert-field">
          <span class="cert-field-label">Subject CN:</span>
          <span class="cert-field-value">${certObj.domain}</span>
          <span class="cert-field-label">Issuer O:</span>
          <span class="cert-field-value">NIX Root Authority</span>
          <span class="cert-field-label">Validity:</span>
          <span class="cert-field-value">${certObj.validity}</span>
          <span class="cert-field-label">Signature:</span>
          <span class="cert-field-value" style="font-size:9px;">${App.S.story.certSigHex.substring(0, 30)}...</span>
        </div>
        
        ${verified ? `
          <div style="margin-top:20px; display:flex; gap:8px;">
            <button class="tamper-btn" onclick="App.runStoryCertTamper()">[ TAMPER WITH CERTIFICATE ]</button>
          </div>
        ` : `
          <div style="margin-top:20px; display:flex; gap:8px;">
            <button class="btn" onclick="App.runStoryCertRestore()">RESTORE CERTIFICATE</button>
          </div>
        `}
      </div>
    `;
    
    if (App.S.story.certVerified && App.S.story.certTampered) {
      App.showNextBtn(8);
    }
  },

  runStoryCertTamper: async () => {
    const certObj = {
      domain: 'phishing.meridian.sys',
      validity: '5 Years',
      publicKey: App.S.story.serverKeys.publicKeyHex
    };
    const tamperedCertStr = JSON.stringify(certObj);
    
    const r = await CE.verifyECDSA(App.S.story.caKeys.keyPair.publicKey, App.S.story.certSig, tamperedCertStr);
    
    App.S.story.certStr = tamperedCertStr;
    App.S.story.certVerified = r.valid;
    App.S.story.certTampered = true;
    App.renderStoryCertResult();
    App.flash('s-cert-res');
  },

  runStoryCertRestore: async () => {
    const domain = 'meridian.sys';
    const certObj = {
      domain: domain,
      validity: '5 Years',
      publicKey: App.S.story.serverKeys.publicKeyHex
    };
    const certStr = JSON.stringify(certObj);
    App.S.story.certStr = certStr;
    
    const r = await CE.verifyECDSA(App.S.story.caKeys.keyPair.publicKey, App.S.story.certSig, certStr);
    App.S.story.certVerified = r.valid;
    App.renderStoryCertResult();
  },

  // MD5 password cracker sandbox tab
  updateCrackTargetHash: () => {
    const sel = document.getElementById('crack-password-select');
    if (!sel) return;
    const pwd = sel.value;
    const hash = CE.md5(pwd);
    const hashEl = document.getElementById('crack-target-hash');
    if (hashEl) hashEl.innerText = hash;
  },

  startMD5Crack: () => {
    const sel = document.getElementById('crack-password-select');
    if (!sel) return;
    const pwd = sel.value;
    const targetHash = CE.md5(pwd);

    App.stopMD5Crack();

    const startBtn = document.getElementById('btn-crack-start');
    const stopBtn = document.getElementById('btn-crack-stop');
    const progArea = document.getElementById('crack-progress-area');
    const resArea = document.getElementById('crack-result-area');
    const terminal = document.getElementById('crack-terminal');
    const fill = document.getElementById('crack-fill');

    if (startBtn) startBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'block';
    if (progArea) progArea.style.display = 'block';
    if (resArea) resArea.style.display = 'none';
    if (fill) fill.style.width = '0%';
    if (terminal) {
      terminal.innerHTML = `[SYS] INITIALIZING OFF-THREAD WEB WORKER...<br>[SYS] TARGET MD5 HASH: ${targetHash}<br>[SYS] LOADING 2000 PASSWORDS DICTIONARY...<br>`;
    }

    App.crackWorker = new Worker('js/md5-worker.js');
    App.crackWorker.postMessage({ targetHash });

    App.crackWorker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'progress') {
        const pct = ((msg.index / msg.total) * 100).toFixed(0);
        if (fill) fill.style.width = pct + '%';
        const pctEl = document.getElementById('crack-progress-pct');
        const countEl = document.getElementById('crack-progress-count');
        if (pctEl) pctEl.innerText = pct + '%';
        if (countEl) countEl.innerText = `${msg.index} / ${msg.total}`;
        if (terminal) {
          const logLine = `[TRY] "${msg.current}" -> ${msg.currentHash}<br>`;
          terminal.innerHTML += logLine;
          terminal.scrollTop = terminal.scrollHeight;
        }
      } else if (msg.type === 'found') {
        if (fill) fill.style.width = '100%';
        const pctEl = document.getElementById('crack-progress-pct');
        const countEl = document.getElementById('crack-progress-count');
        if (pctEl) pctEl.innerText = '100%';
        if (countEl) countEl.innerText = `${msg.attempts} / ${msg.attempts}`;
        
        if (startBtn) startBtn.style.display = 'block';
        if (stopBtn) stopBtn.style.display = 'none';
        if (resArea) resArea.style.display = 'block';

        document.getElementById('crack-result-password').innerText = msg.password;
        document.getElementById('crack-result-time').innerText = `${msg.time} ms`;
        document.getElementById('crack-result-attempts').innerText = msg.attempts;

        if (terminal) {
          terminal.innerHTML += `<span style="color:var(--c3);">[SUCCESS] PASSWORD CRACKED IN ${msg.time}ms! MATCH FOUND: "${msg.password}"</span><br>`;
          terminal.scrollTop = terminal.scrollHeight;
        }
        App.crackWorker.terminate();
        App.crackWorker = null;
      } else if (msg.type === 'notfound') {
        if (startBtn) startBtn.style.display = 'block';
        if (stopBtn) stopBtn.style.display = 'none';
        if (terminal) {
          terminal.innerHTML += `<span style="color:var(--c2);">[FAIL] PASSWORD NOT FOUND IN DICTIONARY.</span><br>`;
          terminal.scrollTop = terminal.scrollHeight;
        }
        App.crackWorker.terminate();
        App.crackWorker = null;
      }
    };
  },

  stopMD5Crack: () => {
    if (App.crackWorker) {
      App.crackWorker.terminate();
      App.crackWorker = null;
    }
    const startBtn = document.getElementById('btn-crack-start');
    const stopBtn = document.getElementById('btn-crack-stop');
    const terminal = document.getElementById('crack-terminal');
    if (startBtn) startBtn.style.display = 'block';
    if (stopBtn) stopBtn.style.display = 'none';
    if (terminal) {
      terminal.innerHTML += `<span style="color:var(--c2);">[SYS] DICTIONARY ATTACK ABORTED BY OPERATOR.</span><br>`;
      terminal.scrollTop = terminal.scrollHeight;
    }
  },

  /* ─── ECDSA LAB ─── */
  runECDSAGen: async () => {
    try {
      App.S.lab.ecdsaKeys = await CE.generateECDSA();
      document.getElementById('ecdsa-pub-out').innerText = App.S.lab.ecdsaKeys.publicKeyPem;
      document.getElementById('ecdsa-keys-area').style.display = 'block';
    } catch (e) { alert('ECDSA Generation Failed: ' + e.message); }
  },
  
  runECDSASign: async () => {
    const msg = document.getElementById('ecdsa-msg').value;
    if(!msg || !App.S.lab.ecdsaKeys) return alert('Generate keys and enter a message first.');
    try {
      const res = await CE.signECDSA(App.S.lab.ecdsaKeys.keyPair.privateKey, msg);
      App.S.lab.ecdsaLastSig = res.signature;
      document.getElementById('ecdsa-sig-out').innerText = res.signatureHex;
      document.getElementById('ecdsa-res-area').style.display = 'block';
      document.getElementById('ecdsa-verify-status').innerText = '';
    } catch (e) { alert('Signing Failed: ' + e.message); }
  },

  runECDSATamper: () => {
    const msgEl = document.getElementById('ecdsa-msg');
    let msg = msgEl.value;
    if(!msg) return;
    const last = msg.charCodeAt(msg.length-1);
    msgEl.value = msg.substring(0, msg.length-1) + String.fromCharCode(last ^ 1);
    App.flash('ecdsa-msg');
  },

  runECDSAVerify: async () => {
    const msg = document.getElementById('ecdsa-msg').value;
    const sig = App.S.lab.ecdsaLastSig;
    if(!msg || !sig) return;
    try {
      const res = await CE.verifyECDSA(App.S.lab.ecdsaKeys.keyPair.publicKey, sig, msg);
      const statusEl = document.getElementById('ecdsa-verify-status');
      if (res.valid) {
        statusEl.innerHTML = '<span style="color:var(--c3);">✓ SIGNATURE VALID (Authentic)</span>';
      } else {
        statusEl.innerHTML = '<span style="color:var(--c2);">✗ SIGNATURE INVALID (Tampered)</span>';
        App.flash('ecdsa-verify-status');
      }
    } catch (e) { alert('Verify Failed: ' + e.message); }
  },

  /* ─── CERT INSPECTOR LAB ─── */
  loadSampleCert: () => {
    // Real Let's Encrypt R3 Intermediate Certificate
    const sample = `-----BEGIN CERTIFICATE-----\n` +
      `MIIFjTCCA3WgAwIBAgIRANOxciY0IzLcO8t9/B5GkGcwDQYJKoZIhvcNAQELBQAw\n` +
      `TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh\n` +
      `cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMjAwOTA0MDAwMDAw\n` +
      `WhcNMjUwOTE1MTYwMDAwWjBfMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu\n` +
      `ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxJTAjBgNVBAMTHExldCdzIEVuY3J5\n` +
      `cHQgQXV0aG9yaXR5IFgzMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA\n` +
      `pW++Drm3D6lRj1p9j3E+G/pZ+1mN9lZk0/BwZ+M/QO9V2g0b+B2bYyN7hP7F2V9V\n` +
      `... truncated for sandbox display ...\n` +
      `-----END CERTIFICATE-----`;
    document.getElementById('cert-input').value = sample;
  },

  runCertInspect: async () => {
    const pem = document.getElementById('cert-input').value;
    const errEl = document.getElementById('cert-error');
    const resEl = document.getElementById('cert-results');
    errEl.style.display = 'none';
    resEl.style.display = 'none';
    if(!pem) return;
    
    try {
      const info = await CE.parsePEMCertificate(pem);
      document.getElementById('cert-subject').innerText = info.subject;
      document.getElementById('cert-issuer').innerText = info.issuer;
      document.getElementById('cert-notbefore').innerText = info.notBefore;
      document.getElementById('cert-notafter').innerText = info.notAfter;
      document.getElementById('cert-serial').innerText = info.serial;
      resEl.style.display = 'block';
    } catch(e) {
      errEl.innerText = e.message;
      errEl.style.display = 'block';
    }
  },

  /* ─── ENTROPY LAB ─── */
  loadEntropyPreset: (type) => {
    const dict = {
      'low': 'password123',
      'medium': '123e4567-e89b-12d3-a456-426614174000',
      'high': 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2'
    };
    document.getElementById('entropy-input').value = dict[type];
    App.runEntropy();
  },

  runEntropy: () => {
    const str = document.getElementById('entropy-input').value;
    const res = CE.shannonEntropy(str);
    document.getElementById('ent-bpc').innerText = res.bitsPerChar;
    document.getElementById('ent-total').innerText = res.total;
    
    let pct = Math.min(100, (res.total / 128) * 100);
    document.getElementById('ent-gauge').style.width = pct + '%';
    
    let evalStr = '';
    if (res.total < 40) evalStr = '<span style="color:var(--c2);">Weak.</span> Highly vulnerable to brute-force or dictionary attacks.';
    else if (res.total < 80) evalStr = '<span style="color:var(--c4);">Moderate.</span> Susceptible to targeted brute-force.';
    else evalStr = '<span style="color:var(--c3);">Strong.</span> Sufficient entropy for most cryptographic keys.';
    document.getElementById('ent-eval').innerHTML = evalStr;
  },

  /* ─── BIRTHDAY ATTACK LAB ─── */
  startBirthdayAttack: () => {
    if (App.bdWorker) App.bdWorker.terminate();
    const bits = parseInt(document.getElementById('bd-bits').value);
    
    document.getElementById('bd-result-area').style.display = 'none';
    document.getElementById('bd-progress-area').style.display = 'block';
    document.getElementById('bd-attempts').innerText = '0';
    document.getElementById('bd-prob').innerText = '0.00%';
    document.getElementById('bd-prob-bar').style.width = '0%';
    document.getElementById('btn-bd-start').innerText = 'RUNNING ATTACK...';
    document.getElementById('btn-bd-start').disabled = true;

    App.bdWorker = new Worker('js/birthday-worker.js');
    
    const space = Math.pow(2, bits);
    const bound = Math.round(Math.pow(2, bits / 2));
    const boundEl = document.getElementById('bd-bound');
    if(boundEl) boundEl.innerText = "~" + bound;
    
    App.bdWorker.onmessage = (e) => {
      const data = e.data;
      if (data.type === 'progress') {
        document.getElementById('bd-attempts').innerText = data.attempts;
        let prob = 1 - Math.exp(-(data.attempts * (data.attempts - 1)) / (2 * space));
        let probPct = Math.min(99.99, prob * 100);
        document.getElementById('bd-prob').innerText = probPct.toFixed(2) + '%';
        document.getElementById('bd-prob-bar').style.width = probPct + '%';
      } else if (data.type === 'found') {
        document.getElementById('btn-bd-start').innerText = 'START ATTACK';
        document.getElementById('btn-bd-start').disabled = false;
        
        document.getElementById('bd-attempts').innerText = data.attempts;
        document.getElementById('bd-prob').innerText = '100.00%';
        document.getElementById('bd-prob-bar').style.width = '100%';
        
        document.getElementById('bd-input1').innerText = data.collision.input1;
        document.getElementById('bd-input2').innerText = data.collision.input2;
        document.getElementById('bd-hash').innerText = data.collision.hash;
        
        document.getElementById('bd-result-area').style.display = 'block';
      } else if (data.type === 'error') {
        document.getElementById('btn-bd-start').innerText = 'START ATTACK';
        document.getElementById('btn-bd-start').disabled = false;
        document.getElementById('bd-error').innerText = "Worker Error: " + data.message;
      }
    };
    
    App.bdWorker.postMessage({ cmd: 'start', bits: bits });
  },

  exportBirthdayProof: () => {
    const data = {
      timestamp: new Date().toISOString(),
      type: "SHA-256 Truncated Collision Proof",
      collision: {
        hash: document.getElementById('bd-hash').innerText,
        inputA: document.getElementById('bd-input1').innerText,
        inputB: document.getElementById('bd-input2').innerText
      },
      attemptsRequired: document.getElementById('bd-attempts').innerText
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `collision_proof_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
};
