/* ══════════════════════════════════════════════════════════
   APP CONTROLLER
══════════════════════════════════════════════════════════ */
const App = {
  S: {
    alias: '',
    lab: { algo: 'SHA-256', encMode: 'enc' },
    story: { step: 0, maxStep: 0, algo: 'SHA-256', pwd: '', hashHex: '', hashBits: '', cipherData: null, tampered: false, score: 0 }
  },

  show: id => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  },

  resetState: () => {
    App.S.alias = '';
    App.S.lab = { algo: 'SHA-256', encMode: 'enc' };
    App.S.story = { step:0, maxStep:0, algo:'SHA-256', pwd:'', hashHex:'', hashBits:'', cipherData:null, tampered:false, score:0 };
    document.querySelectorAll('input:not([type=button]), textarea').forEach(el => el.value = '');
    ['lab-hash-result','lab-enc-result'].forEach(id => { const el = document.getElementById(id); if(el) el.style.display='none'; });
    const nz = document.getElementById('story-next-zone'); if(nz) nz.innerHTML = '';
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

  /* ─── LAB ─── */
  startLab: () => { App.resetState(); App.show('screen-lab'); },
  switchLabTab: tab => {
    document.querySelectorAll('.lab-tab').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-tab-'+tab).classList.add('active');
    document.querySelectorAll('.lab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('lab-'+tab).classList.add('active');
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
    const input = document.getElementById('lab-hash-in').value;
    if(!input) return alert('Enter plaintext data.');
    const r = await CE.hash(App.S.lab.algo, input);
    const res = document.getElementById('lab-hash-result');
    res.style.display = 'block';
    document.getElementById('lab-hash-out').innerText = r.hex;
    document.getElementById('lab-hash-time').innerText = `${r.ms}ms`;
    document.getElementById('lab-bit-count').innerText = r.bits.length;
    const grid = document.getElementById('lab-bit-grid'); grid.innerHTML = '';
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
        <div class="btn-group"><button class="btn btn-danger" onclick="App.runStoryBreachLogic()" id="btn-breach-start">[ INITIATE PERIMETER SCAN ]</button></div>
        <div class="term" id="s-breach-term" style="display:none;margin-top:16px;"></div>
      `;
    }
    else if(step===4){
      aBox.innerHTML=`
        <div style="display:flex;gap:8px;margin-bottom:24px;">
          <button class="btn btn-primary" id="s-mode-enc" onclick="App.setStoryEncMode('enc')" style="flex:1;">🔒 ENCRYPT</button>
          <button class="btn" id="s-mode-dec" onclick="App.setStoryEncMode('dec')" style="flex:1;">🔓 DECRYPT</button>
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

  selectStoryAlgo: (el, algo) => {
    App.S.story.algo=algo;
    document.querySelectorAll('#story-algo-grid .algo-card').forEach(c=>c.classList.remove('selected'));
    el.classList.add('selected');
  },

  runStoryHash: async () => {
    const val=document.getElementById('s-hash-in').value.trim();
    if(!val) return alert('Enter a password.');
    const resEl=document.getElementById('s-hash-res');
    const r=await CE.hash(App.S.story.algo, val);
    if(App.S.story.algo==='MD5'||App.S.story.algo==='SHA-1'){
      resEl.innerHTML=`<div class="readout readout-red">
        <strong style="display:block;margin-bottom:8px;">[!] PROTOCOL BLOCKED: ${App.S.story.algo}</strong>
        This algorithm is cryptographically compromised — vulnerable to <strong>Collision Attacks</strong>. Select SHA-256 or SHA-512 to continue.
        <div class="bit-grid" style="margin-top:12px;">${r.bits.slice(0,160).split('').map(b=>`<div class="bit${b==='1'?' diff':''}"></div>`).join('')}</div>
      </div>`;
    } else {
      App.S.story.pwd=val; App.S.story.hashHex=r.hex; App.S.story.hashBits=r.bits;
      resEl.innerHTML=`<div class="readout readout-green">
        <strong style="display:block;margin-bottom:8px;">[✓] FINGERPRINT SECURED</strong>
        <span style="font-size:11px;word-break:break-all;display:block;margin-bottom:12px;">${r.hex}</span>
        <div class="bit-grid">${r.bits.slice(0,256).split('').map(b=>`<div class="bit${b==='1'?' on':''}"></div>`).join('')}</div>
      </div>`;
      App.showNextBtn(1);
    }
  },

  runStoryAvalanche: async (initOnly=false) => {
    const base=App.S.story.hashBits; if(!base) return;
    const b=document.getElementById('s-av-in')?.value||App.S.story.pwd;
    let modBits=base;
    if(!initOnly&&b!==App.S.story.pwd){
      const h=await CE.hash(App.S.story.algo,b); modBits=h.bits;
    }
    const limit=base.length; let diffs=0;
    const grid=document.getElementById('s-av-grid'); if(!grid) return;
    grid.innerHTML='';
    for(let i=0;i<limit;i++){
      const bit=document.createElement('div'); bit.className='bit';
      if(modBits[i]==='1') bit.classList.add('on');
      if(base[i]!==modBits[i]){ bit.classList.add('diff'); diffs++; }
      grid.appendChild(bit);
    }
    if(!initOnly){
      const pct=((diffs/limit)*100).toFixed(1);
      const resEl=document.getElementById('s-av-res');
      if(resEl) resEl.innerHTML=`
        <div class="dr-row"><div class="dr-lbl">Bits Flipped:</div><div><strong style="color:${diffs>0?'var(--c2)':'inherit'};font-size:16px;">${diffs}</strong> / ${limit} (${pct}%) ${parseFloat(pct)>40?'🌊 Avalanche Confirmed!':''}</div></div>
      `;
      if(parseFloat(pct)>30) App.showNextBtn(2);
    }
  },

  runStoryBruteForce: async () => {
    document.getElementById('btn-brute').disabled=true;
    const term=document.getElementById('brute-term'); term.style.display='block'; term.innerHTML='';
    const guesses=['password','123456','admin','root','qwerty','letmein','Meridian99','MeridianAdmin1'];
    for(const g of guesses){
      const s=document.createElement('span'); s.className='tl';
      const h=await CE.hash(App.S.story.algo,g);
      s.innerHTML=`<span class="tc">trying: ${g}</span> → <span class="to">${h.hex.substring(0,20)}...</span>`;
      term.appendChild(s); term.scrollTop=term.scrollHeight;
      await new Promise(r=>setTimeout(r,140));
    }
    const final='MeridianAdmin1';
    const r=await CE.hash(App.S.story.algo,final);
    document.getElementById('s-log-res').style.display='block';
    const dbEl=document.getElementById('s-log-db'); dbEl.innerHTML='';
    const typEl=document.getElementById('s-log-typed'); typEl.innerHTML='';
    for(let i=0;i<App.S.story.hashHex.length;i++){
      const m=App.S.story.hashHex[i]===r.hex[i];
      const s1=document.createElement('span'); s1.textContent=App.S.story.hashHex[i]; s1.className=m?'hc-match':'hc-miss';
      const s2=document.createElement('span'); s2.textContent=r.hex[i]||'-'; s2.className=m?'hc-match':'hc-miss';
      dbEl.appendChild(s1); typEl.appendChild(s2);
    }
    document.getElementById('s-log-msg').innerHTML=`<span class="status-tag st-ok">[✓] HASH MISMATCH — ATTACK DEFLECTED — SYSTEM SECURE</span>`;
    App.showNextBtn(3);
  },

  runStoryBreachCutscene: () => {
    App.playCutscene([
      {m:'[CRITICAL] UNAUTHORIZED ACCESS DETECTED ON PORT 22.',c:'var(--c2)'},
      {m:'[SYS] OUTER FIREWALL BREACHED.',c:'var(--c2)'},
      {m:'[SYS] DUMPING SHADOW DATABASE FILES ...',c:'var(--muted)'},
      {m:'[SYS] DATABASE EXFILTRATION IN PROGRESS.',c:'var(--muted)',wait:900},
      {m:`Nix: They got the hashes, ${App.S.alias}. We are out of time.`,c:'var(--c)'},
    ], ()=>App.jumpToStory(3));
  },

  playCutscene: async (lines, onDone) => {
    App.show('screen-cutscene');
    const term=document.getElementById('cutscene-term'); term.innerHTML='';
    for(const line of lines){
      const row=document.createElement('div'); row.className='cutscene-line';
      const el=document.createElement('span'); el.style.color=line.c; el.style.fontFamily='var(--font-mono)'; el.style.fontSize='14px'; el.style.lineHeight='2.4'; el.style.display='block';
      el.textContent=line.m; row.appendChild(el); term.appendChild(row);
      await new Promise(r=>setTimeout(r,line.wait||700));
    }
    const btn=document.createElement('button'); btn.className='cta-btn'; btn.style.marginTop='32px';
    btn.innerHTML='<span>&gt;</span><span>&nbsp;&nbsp;CONTINUE</span>';
    btn.onclick=()=>{ document.getElementById('screen-cutscene').classList.remove('active'); if(onDone) onDone(); };
    term.appendChild(btn);
  },

  runStoryBreachLogic: () => {
    const startBtn=document.getElementById('btn-breach-start'); if(startBtn) startBtn.style.display='none';
    const term=document.getElementById('s-breach-term'); term.style.display='block'; term.innerHTML='';
    const lines=[
      {c:'tp',m:'root@h4x0r:~# SELECT username, hash FROM users;'},
      {c:'to',m:`nix_admin | ${App.S.story.hashHex.substring(0,32)}...`},
      {c:'tp',m:'root@h4x0r:~# reverse_hash target.hash'},
      {c:'te',m:'ERROR: Mathematical one-way function. Reversal is impossible.'},
      {c:'tp',m:'root@h4x0r:~# crack_password --brute-force --wordlist rockyou.txt'},
      {c:'te',m:'ETA: 5.2 × 10⁴² years. Computation terminated.'},
    ];
    lines.forEach((l,i)=>setTimeout(()=>{
      const s=document.createElement('span'); s.className='tl '+l.c; s.innerText=l.m; term.appendChild(s); term.scrollTop=term.scrollHeight;
    },400+i*800));
    setTimeout(()=>App.showNextBtn(4), lines.length*800+600);
  },

  runStoryEncrypt: async () => {
    const pass=document.getElementById('s-enc-in').value;
    if(!pass) return alert('Enter passphrase.');
    const btn=document.getElementById('s-enc-btn');
    btn.innerText='PROCESSING PBKDF2 (100K ITERATIONS)...'; btn.disabled=true;
    setTimeout(async()=>{
      const r=await CE.encrypt('LOCKDOWN_PROTOCOL_ALPHA',pass);
      App.S.story.cipherData={payload:r.payload,cipherBuf:r.cipherBuf};
      App.S.story.tampered=false;
      document.getElementById('s-enc-res').innerHTML=`
        <div class="readout readout-cyan" style="font-size:11px;word-break:break-all;">${r.payload}</div>
        <div style="margin-top:10px;"><span class="status-tag st-ok">[✓] PAYLOAD ENCRYPTED — TRANSMITTING...</span></div>
      `;
      App.showNextBtn(5);
      ['s-enc-step-2','s-enc-step-3'].forEach(id=>{const el=document.getElementById(id);if(el)el.remove();});
      const sdp=document.getElementById('s-standalone-payload'); if(sdp) sdp.value=r.payload;
      btn.innerText='STRETCH KEY & ENCRYPT'; btn.disabled=false;

      document.getElementById('s-enc-res').insertAdjacentHTML('afterend',`
        <div id="s-enc-step-2" style="margin-top:28px;padding-top:20px;border-top:1px solid var(--border);">
          <span class="form-label" style="color:var(--c2);">2. Threat Actor Interception</span>
          <div style="font-size:13px;color:var(--muted);margin-bottom:12px;font-family:var(--font-ui);">The attacker intercepts the payload. They can't read it — but what if they alter the ciphertext bytes?</div>
          <div class="readout readout-dim" id="s-tamp-payload" style="font-size:11px;word-break:break-all;margin-bottom:12px;">${r.payload}</div>
          <div class="btn-group">
            <button class="btn btn-danger" id="btn-tamper" onclick="App.runStoryTamper()">[INJECT MALICIOUS BYTE]</button>
            <button class="btn" id="btn-fwd" onclick="App.runStoryForward()">ALLOW PACKET THROUGH</button>
          </div>
          <div id="tamper-msg" style="display:none;margin-top:12px;padding:10px;border-left:2px solid var(--c2);background:rgba(255,0,60,0.04);">
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--c2);">[!] HACKER ALTERED CIPHERTEXT PAYLOAD IN TRANSIT</span>
          </div>
        </div>
        <div id="s-enc-step-3" style="display:none;margin-top:28px;padding-top:20px;border-top:1px solid var(--border);">
          <span class="form-label" style="color:var(--c);">3. Server Decryption Attempt</span>
          <input type="password" class="form-input" id="s-tamp-in" placeholder="Server enters shared passphrase...">
          <div class="btn-group" style="margin-top:12px;">
            <button class="btn btn-primary" id="s-dec-btn" onclick="App.runStoryDecrypt()">🔓 ATTEMPT DECRYPTION</button>
          </div>
          <div id="s-tamp-res" style="margin-top:20px;"></div>
        </div>
      `);
    },800);
  },

  runStoryTamper: () => {
    const src=new Uint8Array(App.S.story.cipherData.cipherBuf instanceof ArrayBuffer ? App.S.story.cipherData.cipherBuf : App.S.story.cipherData.cipherBuf);
    const bytes=new Uint8Array(src.length); bytes.set(src); bytes[bytes.length-1]^=1;
    App.S.story.cipherData.cipherBuf=bytes.buffer;
    const parts=App.S.story.cipherData.payload.split(':');
    App.S.story.cipherData.payload=`${parts[0]}:${parts[1]}:${CE.bufToHex(bytes.buffer)}`;
    document.getElementById('s-tamp-payload').innerText=App.S.story.cipherData.payload;
    document.getElementById('tamper-msg').style.display='block';
    App.S.story.tampered=true;
    document.getElementById('btn-tamper').disabled=true;
    document.getElementById('btn-fwd').disabled=true;
    App.runStoryForward();
  },

  runStoryForward: () => {
    const bt=document.getElementById('btn-tamper'),bf=document.getElementById('btn-fwd');
    if(bt) bt.disabled=true; if(bf) bf.disabled=true;
    document.getElementById('s-enc-step-3').style.display='block';
  },

  runStoryDecrypt: async () => {
    const pass=document.getElementById('s-tamp-in').value;
    if(!pass) return alert('Enter the passphrase used for encryption.');
    const resDiv=document.getElementById('s-tamp-res');
    const btn=document.getElementById('s-dec-btn');
    btn.innerText='AUTHENTICATING...'; btn.disabled=true;
    setTimeout(async()=>{
      try {
        const r=await CE.decrypt(App.S.story.cipherData.payload,pass);
        resDiv.innerHTML=`<span class="status-tag st-ok" style="font-size:13px;padding:8px 16px;">✅ DECRYPTION & AUTHENTICATION SUCCESSFUL</span><br><br><span style="color:var(--bright);font-family:var(--font-mono);font-size:14px;">Message: "${r.plain}"</span>`;
        App.showNextBtn(5);
      } catch(e){
        if(App.S.story.tampered){
          resDiv.innerHTML=`<div class="readout readout-red">
            <strong style="display:block;margin-bottom:8px;">❌ FATAL: AUTH TAG MISMATCH</strong>
            <span style="font-size:13px;color:var(--text);line-height:1.7;">AES-GCM detected that the ciphertext was altered in transit. Decryption was blocked to prevent payload injection. This is AES-GCM's cryptographic integrity guarantee — working exactly as designed.</span>
          </div>`;
          App.showNextBtn(5);
        } else {
          resDiv.innerHTML=`<span class="status-tag st-err" style="font-size:13px;padding:8px 16px;">❌ WRONG PASSPHRASE — TRY AGAIN</span>`;
          App.showNextBtn(5);
        }
      }
      btn.innerText='🔓 ATTEMPT DECRYPTION'; btn.disabled=false;
    },100);
  },

  setStoryEncMode: mode => {
    document.getElementById('s-mode-enc').className='btn'+(mode==='enc'?' btn-primary':'');
    document.getElementById('s-mode-dec').className='btn'+(mode==='dec'?' btn-primary':'');
    document.getElementById('s-enc-panel').style.display=mode==='enc'?'block':'none';
    document.getElementById('s-dec-panel').style.display=mode==='dec'?'block':'none';
  },

  retryStoryEncrypt: () => {
    const encIn=document.getElementById('s-enc-in'); if(encIn) encIn.value='';
    const res=document.getElementById('s-enc-res'); if(res) res.innerHTML='';
    ['s-enc-step-2','s-enc-step-3'].forEach(id=>{const el=document.getElementById(id);if(el)el.remove();});
    const btn=document.getElementById('s-enc-btn'); if(btn){btn.innerText='STRETCH KEY & ENCRYPT';btn.disabled=false;}
    App.S.story.cipherData=null; App.S.story.tampered=false;
    const zone=document.getElementById('story-next-zone'); if(zone) zone.innerHTML='';
    if(encIn) encIn.focus();
  },

  runStandaloneDecrypt: async () => {
    const payload=document.getElementById('s-standalone-payload').value.trim();
    const pass=document.getElementById('s-standalone-key').value;
    const resDiv=document.getElementById('s-standalone-res');
    if(!payload||!pass){ resDiv.innerHTML='<span class="status-tag st-warn">[!] Enter both ciphertext and passphrase.</span>'; return; }
    resDiv.innerHTML='<span class="status-tag st-info">[ PBKDF2 KEY DERIVATION... ]</span>';
    setTimeout(async()=>{
      try {
        const r=await CE.decrypt(payload,pass);
        resDiv.innerHTML=`<div class="readout readout-green">
          <strong style="display:block;margin-bottom:8px;">[✓] DECRYPTION SUCCESSFUL</strong>
          <span style="font-size:15px;color:var(--bright);">${r.plain}</span>
          <span style="display:block;margin-top:8px;font-size:10px;color:var(--muted);">[${r.ms}ms] — AES-256-GCM auth tag verified</span>
        </div>`;
        App.showNextBtn(5);
      } catch(e){
        resDiv.innerHTML=`<div class="readout readout-red">
          <strong>[✗] DECRYPTION FAILED</strong>
          <span style="font-size:12px;display:block;margin-top:8px;color:var(--text);">${e.message.includes('Invalid')?'Invalid payload format. Use salt:iv:cipher.':'Wrong passphrase or tampered ciphertext. AES-GCM authentication failed.'}</span>
        </div>`;
      }
    },80);
  },

  clearStandaloneDecrypt: () => {
    ['s-standalone-payload','s-standalone-key'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('s-standalone-res').innerHTML='';
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
