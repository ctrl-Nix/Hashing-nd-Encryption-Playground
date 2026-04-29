/* ══════════════════════════════════════════════════════════
   APP CONTROLLER
══════════════════════════════════════════════════════════ */
const App = {
  S: {
    alias: '',
    lab: { algo: 'SHA-256', encMode: 'enc', fileBuffer: null, fileName: '' },
    story: { step: 0, maxStep: 0, algo: 'SHA-256', pwd: '', hashHex: '', hashBits: '', cipherData: null, tampered: false, score: 0 }
  },

  show: id => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  },

  resetState: () => {
    App.S.alias = '';
    App.S.lab = { algo: 'SHA-256', encMode: 'enc', fileBuffer: null, fileName: '' };
    App.S.story = { step:0, maxStep:0, algo:'SHA-256', pwd:'', hashHex:'', hashBits:'', cipherData:null, tampered:false, score:0 };
    document.querySelectorAll('input:not([type=button]), textarea').forEach(el => el.value = '');
    ['lab-hash-result','lab-enc-result','rsa-keys-area','rsa-enc-res','rsa-dec-res','salt-demo-area'].forEach(id => { const el = document.getElementById(id); if(el) el.style.display='none'; });
    const nz = document.getElementById('story-next-zone'); if(nz) nz.innerHTML = '';
    const nameEl = document.getElementById('drop-filename'); if(nameEl) nameEl.innerText = '';
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
  },

  switchLabTab: tab => {
    document.querySelectorAll('.lab-tab').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-tab-'+tab).classList.add('active');
    document.querySelectorAll('.lab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('lab-'+tab).classList.add('active');
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
    };
    reader.readAsArrayBuffer(file);
  },

  genRandomSalt: () => {
    const salt = Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2,'0')).join('');
    document.getElementById('lab-hash-salt').value = salt;
  },

  runCompare: async () => {
    const input = document.getElementById('cmp-input').value;
    const res = document.getElementById('cmp-results');
    if (!input) { res.style.display = 'none'; return; }
    res.style.display = 'block';

    const fillAlgo = async (algo, outId, bitsId, lenId) => {
      const r = await CE.hash(algo, input);
      document.getElementById(outId).innerText = r.hex;
      document.getElementById(lenId).innerText = r.hex.length + ' chars';
      const grid = document.getElementById(bitsId); grid.innerHTML = '';
      for (let i = 0; i < Math.min(r.bits.length, 256); i++) {
        const b = document.createElement('div');
        b.className = 'bit' + (r.bits[i] === '1' ? ' on' : '');
        grid.appendChild(b);
      }
    };

    await Promise.all([
      fillAlgo('MD5',     'cmp-md5-out',    'cmp-md5-bits',    'cmp-md5-len'),
      fillAlgo('SHA-256', 'cmp-sha256-out', 'cmp-sha256-bits', 'cmp-sha256-len'),
      fillAlgo('SHA-512', 'cmp-sha512-out', 'cmp-sha512-bits', 'cmp-sha512-len'),
    ]);
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
    
    const r = await CE.hash(App.S.lab.algo, salt ? (typeof data === 'string' ? data + salt : data) : data);
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

  /* ─── STORY ─── */
  openAliasScreen: () => { App.resetState(); App.show('screen-alias'); setTimeout(() => document.getElementById('op-alias-input').focus(), 300); },
  submitAlias: () => {
    const alias = document.getElementById('op-alias-input').value.trim();
    if(!alias) return alert('Alias required.');
    App.S.alias = alias;
    document.getElementById('hud-alias-display').innerText = alias;
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
  },

  renderStoryMap: () => {
    const titles = ['Init','Avalanche','Auth','Breach','AES-GCM','Eval'];
    const S = App.S.story;
    let html='';
    for(let i=0;i<6;i++){
      const done=i<S.maxStep, active=i===S.step, unlocked=i<=S.maxStep;
      html+=`<div class="cm-node${done?' done':''}${active?' active':''}${unlocked?' unlocked':''}" ${unlocked?`onclick="App.jumpToStory(${i})"`:''}>
        <div class="cm-diamond"></div><div class="cm-lbl">${titles[i]}</div>
      </div>`;
      if(i<5) html+=`<div class="cm-line${done?' done':''}"></div>`;
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
    } else if(nextIdx>=6) {
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

  ansQuiz: (qi,oi,c) => {
    document.querySelectorAll(`[id^='q-${qi}-']`).forEach(b=>b.disabled=true);
    if(oi===c){document.getElementById(`q-${qi}-${oi}`).classList.add('correct'); App.S.story.score++;}
    else{document.getElementById(`q-${qi}-${oi}`).classList.add('wrong'); document.getElementById(`q-${qi}-${c}`).classList.add('correct');}
    const total=document.querySelectorAll('.quiz-opt').length;
    const disabled=document.querySelectorAll('.quiz-opt:disabled').length;
    if(disabled===total){
      const s=App.S.story.score;
      document.getElementById('s-quiz-res').innerHTML=`
        <div class="score-card">
          <div class="score-big">${s}/4</div>
          <div class="score-label">EVALUATION SCORE</div>
          <div style="font-family:var(--font-mono);font-size:12px;color:var(--muted);margin-bottom:24px;">${s===4?'PERFECT SCORE. CLEARED FOR FIELD OPERATIONS.':s>=3?'STRONG PERFORMANCE. MINOR GAPS DETECTED.':'FURTHER TRAINING REQUIRED.'}</div>
          <button class="btn btn-success" onclick="App.goHome()">RETURN TO MAIN MENU</button>
        </div>
      `;
    }
  }
};
