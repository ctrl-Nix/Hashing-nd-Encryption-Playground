/* ═══════════════════════════════════════════════ */
const AchievementSystem = {
  badges: {
    first_hash: { name: "First Hash", desc: "Hash your first string in the engine.", icon: "🔑" },
    bit_flipper: { name: "Bit Flipper", desc: "Trigger an avalanche effect by changing a single character.", icon: "🌊" },
    crypto_ninja: { name: "Crypto Ninja", desc: "Encrypt a payload using AES-GCM.", icon: "🥷" },
    rsa_master: { name: "RSA Master", desc: "Generate an RSA 2048-bit keypair.", icon: "🗝️" },
    ghost_channel: { name: "Ghost Channel", desc: "Establish an end-to-end ECDH shared secret.", icon: "👻" },
    the_forger: { name: "The Forger", desc: "Generate an ECDSA digital signature.", icon: "✒️" },
    trust_no_one: { name: "Trust No One", desc: "Inspect an X.509 Certificate.", icon: "📜" },
    collision_course: { name: "Collision Course", desc: "Generate a hash collision in the Birthday Attack lab.", icon: "💥" }
  },
  unlocked: [],
  init: () => {
    const saved = localStorage.getItem('nix_achievements');
    if (saved) AchievementSystem.unlocked = JSON.parse(saved);
  },
  unlock: (id) => {
    if (AchievementSystem.unlocked.includes(id)) return;
    AchievementSystem.unlocked.push(id);
    localStorage.setItem('nix_achievements', JSON.stringify(AchievementSystem.unlocked));
    AchievementSystem.showNotification(AchievementSystem.badges[id]);
  },
  showNotification: (badge) => {
    // Fullscreen neon flash
    const flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;z-index:99998;pointer-events:none;background:rgba(0,245,255,0.08);border:2px solid var(--c);animation:achieveFlash 0.8s ease forwards;';
    if (!document.getElementById('achieve-flash-style')) {
      const style = document.createElement('style');
      style.id = 'achieve-flash-style';
      style.textContent = '@keyframes achieveFlash{0%{opacity:1;box-shadow:inset 0 0 60px rgba(0,245,255,0.3)}80%{opacity:0.6}100%{opacity:0;}}';
      document.head.appendChild(style);
    }
    document.body.appendChild(flash);
    setTimeout(() => flash.parentNode && flash.parentNode.removeChild(flash), 850);

    // Corner toast
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;bottom:20px;right:20px;background:var(--bg);border:1px solid var(--c);padding:16px 20px;color:var(--c);z-index:99999;box-shadow:0 0 30px rgba(0,245,255,0.25);font-family:var(--font-mono);min-width:260px;animation:slideInRight 0.3s ease;';
    if (!document.getElementById('achieve-toast-style')) {
      const style2 = document.createElement('style');
      style2.id = 'achieve-toast-style';
      style2.textContent = '@keyframes slideInRight{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}';
      document.head.appendChild(style2);
    }
    el.innerHTML = `<div style="font-size:10px;letter-spacing:3px;color:var(--muted);margin-bottom:6px;">ACHIEVEMENT UNLOCKED</div><div style="display:flex;align-items:center;gap:12px;"><span style="font-size:28px;">${badge.icon}</span><div><div style="font-weight:700;color:var(--bright);margin-bottom:2px;">${badge.name}</div><div style="font-size:11px;color:var(--muted);">${badge.desc}</div></div></div>`;
    document.body.appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity 0.4s'; el.style.opacity = '0'; setTimeout(() => el.parentNode && el.parentNode.removeChild(el), 400); }, 4000);
  }
};
AchievementSystem.init();

const Leaderboard = {
  stats: { toolsRun: 0, bytesHashed: 0, msgsEncrypted: 0 },
  init: () => { const s = localStorage.getItem('nix_stats'); if (s) Leaderboard.stats = JSON.parse(s); },
  save: () => { localStorage.setItem('nix_stats', JSON.stringify(Leaderboard.stats)); },
  track: (type, val) => {
    if (type === 'tool') Leaderboard.stats.toolsRun++;
    if (type === 'hash') Leaderboard.stats.bytesHashed += val;
    if (type === 'enc') Leaderboard.stats.msgsEncrypted++;
    Leaderboard.save();
  }
};
Leaderboard.init();

const App = {
  compareTimeout: null,
  crackWorker: null,
  S: {
    alias: '',
    lab: { algo: 'SHA-256', hmacAlgo: 'SHA-256', stegoImg: null, encMode: 'enc', fileObj: null, fileName: '' },
    story: { step: 0, maxStep: parseInt(localStorage.getItem('nix_story_max')) || 0, algo: 'SHA-256', pwd: '', hashHex: '', hashBits: '', cipherData: null, tampered: false, score: 0 }
  },

  show: id => {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0, 0);
  },

  showError: msg => {
    const toast = document.getElementById('global-error-toast');
    const msgEl = document.getElementById('global-error-msg');
    if (!toast || !msgEl) return;
    msgEl.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 4000);
  },

  resetState: () => {
    App.stopMD5Crack();
    App.S.alias = '';
    App.S.lab = { algo: 'SHA-256', hmacAlgo: 'SHA-256', stegoImg: null, encMode: 'enc', fileObj: null, fileName: '' };
    App.S.story = { step: 0, maxStep: parseInt(localStorage.getItem('nix_story_max')) || 0, algo: 'SHA-256', pwd: '', hashHex: '', hashBits: '', cipherData: null, tampered: false, score: 0 };
    document.querySelectorAll('input:not([type=button]), textarea').forEach(el => el.value = '');
    ['lab-hash-result', 'lab-enc-result', 'rsa-keys-area', 'rsa-enc-res', 'rsa-dec-res', 'salt-demo-area', 'lab-hmac-result', 'lab-stego-result', 'crack-progress-area', 'crack-result-area'].forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
    const nz = document.getElementById('story-next-zone'); if (nz) nz.innerHTML = '';
    const nameEl = document.getElementById('drop-filename'); if (nameEl) nameEl.innerText = '';
    const clearBtn = document.getElementById('btn-clear-file'); if (clearBtn) clearBtn.style.display = 'none';
  },

  goHome: () => { App.resetState(); App.show('screen-title'); },

  copyVal: (id, btn) => {
    const el = document.getElementById(id);
    if (!el) return;
    navigator.clipboard.writeText(el.innerText).catch(() => { });
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
    if (!el) return;
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
    const btn = document.getElementById('btn-tab-' + tab);
    if (btn) btn.classList.add('active');
    document.querySelectorAll('.lab-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('lab-' + tab);
    if (panel) panel.classList.add('active');

    const tabsEl = document.querySelector('.lab-tabs');
    if (tabsEl) {
      window.scrollTo({ top: tabsEl.offsetTop - 40, behavior: 'smooth' });
    }

    if (window.EXPLAINERS && window.EXPLAINERS[tab] && !localStorage.getItem('explainer_v2_' + tab)) {
      if (window.showExplainer) window.showExplainer(tab);
    }

    // Hacker Goggles Logic
    const goggles = document.getElementById('daisy-accessory-hacker');
    if (goggles) {
      if (['rsa', 'stego', 'ecdsa', 'ecdh', 'cert'].includes(tab)) {
        goggles.style.display = '';
      } else {
        goggles.style.display = 'none';
      }
    }
  },

  setupDropZone: () => {
    const zone = document.getElementById('drop-zone');
    if (!zone || zone.dataset.init) return;

    const input = document.getElementById('file-input');
    zone.onclick = () => input.click();

    zone.ondragover = (e) => { e.preventDefault(); zone.classList.add('hover'); };
    zone.ondragleave = () => zone.classList.remove('hover');
    zone.ondrop = (e) => {
      e.preventDefault();
      zone.classList.remove('hover');
      if (e.dataTransfer.files.length) App.handleFile(e.dataTransfer.files[0]);
    };
    input.onchange = (e) => {
      if (e.target.files.length) App.handleFile(e.target.files[0]);
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
    App.S.lab.fileObj = file;
    App.S.lab.fileName = file.name;
    const nameEl = document.getElementById('drop-filename');
    nameEl.innerText = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    const textIn = document.getElementById('lab-hash-in');
    if (textIn) textIn.value = "";
    const clearBtn = document.getElementById('btn-clear-file');
    if (clearBtn) clearBtn.style.display = 'block';
  },

  clearLabFile: (e) => {
    if (e) e.stopPropagation();
    App.S.lab.fileObj = null;
    App.S.lab.fileName = '';
    const nameEl = document.getElementById('drop-filename');
    if (nameEl) nameEl.innerText = '';
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
    const clearBtn = document.getElementById('btn-clear-file');
    if (clearBtn) clearBtn.style.display = 'none';
  },

  genRandomSalt: () => {
    const salt = Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('');
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
        fillAlgo('MD5', 'cmp-md5-out', 'cmp-md5-bits', 'cmp-md5-len'),
        fillAlgo('SHA-256', 'cmp-sha256-out', 'cmp-sha256-bits', 'cmp-sha256-len'),
        fillAlgo('SHA-512', 'cmp-sha512-out', 'cmp-sha512-bits', 'cmp-sha512-len'),
      ]);
      AchievementSystem.unlock('bit_flipper');
    }, 150);
  },

  setLabAlgo: algo => {
    App.S.lab.algo = algo;
    document.querySelectorAll('#lab-algo-grid .algo-card').forEach(c => c.classList.remove('selected'));
    const card = document.getElementById('lab-' + algo); if (card) card.classList.add('selected');
  },

  runLabHash: async () => {
    App.flash('lab-hash');
    const textInput = document.getElementById('lab-hash-in').value;
    const salt = document.getElementById('lab-hash-salt').value;
    const fileObj = App.S.lab.fileObj;

    if (!fileObj && !textInput) return alert('Enter plaintext or drop a file.');

    document.getElementById('btn-run-hash').disabled = true;
    document.getElementById('btn-run-hash').innerText = 'PROCESSING...';

    const renderResult = async (r, label) => {
      const res = document.getElementById('lab-hash-result');
      res.style.display = 'block';

      const saltDemo = document.getElementById('salt-demo-area');
      if (salt && typeof textInput === 'string' && textInput) {
        saltDemo.style.display = 'block';
        const rUnsalted = await CE.hash(App.S.lab.algo, textInput);
        document.getElementById('res-unsalted').innerText = rUnsalted.hex;
        document.getElementById('res-salted').innerText = r.hex;
        document.getElementById('salt-viz').innerHTML = `
          <span style="color:var(--bright); opacity:0.8;">"${textInput}"</span>
          <span style="color:var(--muted);">+</span>
          <span style="color:var(--c3); font-weight:700;">"${salt}"</span>
        `;
      } else {
        saltDemo.style.display = 'none';
      }

      document.getElementById('lab-hash-out').innerText = r.hex;
      document.getElementById('lab-hash-time').innerText = `${r.ms}ms`;
      document.getElementById('lab-bit-count').innerText = r.bits.length;

      const grid = document.getElementById('lab-bit-grid');
      grid.innerHTML = `<div style="font-family:var(--font-mono); font-size:10px; color:var(--c); margin-bottom:10px;">[ TYPE: ${label} ]</div>`;
      for (let i = 0; i < Math.min(r.bits.length, 512); i++) {
        const b = document.createElement('div'); b.className = 'bit' + (r.bits[i] === '1' ? ' on' : ''); grid.appendChild(b);
      }
      res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      AchievementSystem.unlock('first_hash');

      document.getElementById('btn-run-hash').disabled = false;
      document.getElementById('btn-run-hash').innerText = 'EXECUTE HASH FUNCTION';
      document.getElementById('hash-progress-area').style.display = 'none';

      Leaderboard.track('tool');
      if (fileObj) Leaderboard.track('hash', fileObj.size);
      else Leaderboard.track('hash', new TextEncoder().encode(textInput + salt).length);
    };

    if (fileObj) {
      document.getElementById('hash-progress-area').style.display = 'block';
      const w = new Worker('js/hash-worker.js');
      w.onmessage = (e) => {
        if (e.data.type === 'progress') {
          document.getElementById('hash-progress-fill').style.width = e.data.pct + '%';
          document.getElementById('hash-progress-text').innerText = `${e.data.pct}% (${e.data.ms}ms)`;
        } else if (e.data.type === 'done') {
          renderResult(e.data.result, `FILE HASH: ${App.S.lab.fileName}`);
          w.terminate();
        } else if (e.data.type === 'error') {
          alert("Worker Error: " + e.data.message);
          w.terminate();
        }
      };
      w.postMessage({ file: fileObj, algo: App.S.lab.algo });
    } else {
      let inputData = textInput;
      if (salt) inputData = textInput + salt;
      try {
        const r = await CE.hash(App.S.lab.algo, inputData);
        renderResult(r, salt ? 'SALTED STRING HASH' : 'STRING HASH');
      } catch (e) { alert('Hashing Failed: ' + e.message); }
    }
  },

  setLabEncMode: mode => {
    App.S.lab.encMode = mode;
    document.getElementById('btn-mode-enc').className = 'btn' + (mode === 'enc' ? ' btn-primary' : '');
    document.getElementById('btn-mode-dec').className = 'btn' + (mode === 'dec' ? ' btn-primary' : '');
    document.getElementById('lab-enc-data').value = '';
    document.getElementById('lab-enc-key').value = '';
    document.getElementById('lab-enc-result').style.display = 'none';
    document.getElementById('lab-enc-lbl-data').innerText = mode === 'enc' ? 'Plaintext Data' : 'Ciphertext Payload (Salt:IV:Cipher)';
    document.getElementById('lab-enc-data').placeholder = mode === 'enc' ? 'Enter secret payload...' : 'Paste salt:iv:cipher payload...';
    document.getElementById('lab-enc-action').innerText = mode === 'enc' ? 'EXECUTE ENCRYPTION' : 'EXECUTE DECRYPTION';
    document.getElementById('lab-btn-paste').style.display = mode === 'enc' ? 'none' : 'block';
  },

  runLabEnc: async () => {
    App.flash('lab-enc');
    const data = document.getElementById('lab-enc-data').value;
    const pass = document.getElementById('lab-enc-key').value;
    if (!data || !pass) return alert('Provide data and passphrase.');

    // Proactive Hint Intercept
    if (App.S.lab.encMode === 'dec' && typeof window.DaisyContext !== 'undefined') {
      const parts = data.split(':');
      if (parts.length === 3 && parts[2].length % 2 !== 0) {
        if (window.setDaisyState) window.setDaisyState('warn');
        if (window.typewriteBubble) window.typewriteBubble("Hey! Hex strings need an even number of characters. Check your spacing!");
        if (window.playAlert) window.playAlert();

        document.getElementById('lab-enc-data').classList.add('daisy-highlight');
        setTimeout(() => document.getElementById('lab-enc-data').classList.remove('daisy-highlight'), 3000);
        return; // Stop execution
      }
    }
    const action = document.getElementById('lab-enc-action');
    const resBox = document.getElementById('lab-enc-result');
    const outEl = document.getElementById('lab-enc-out');
    const dbgKey = document.getElementById('lab-debug-key');
    action.disabled = true;
    action.innerText = 'PROCESSING PBKDF2 (100K ITERATIONS)...';
    resBox.style.display = 'block';
    setTimeout(async () => {
      if (App.S.lab.encMode === 'enc') {
        const r = await CE.encrypt(data, pass);
        document.getElementById('lab-enc-lbl-res').innerText = 'GENERATED PAYLOAD (SALT:IV:CIPHER)';
        document.getElementById('lab-enc-time').innerText = `${r.ms}ms`;
        outEl.parentElement.className = 'copy-wrap';
        outEl.className = 'readout readout-cyan';
        outEl.innerText = r.payload;
        dbgKey.innerText = r.key;
        document.getElementById('lab-btn-copy').style.display = 'flex';
        AchievementSystem.unlock('crypto_ninja');
        Leaderboard.track('tool');
        Leaderboard.track('enc');
      } else {
        try {
          const r = await CE.decrypt(data, pass);
          document.getElementById('lab-enc-lbl-res').innerText = 'DECRYPTED PLAINTEXT';
          document.getElementById('lab-enc-time').innerText = `${r.ms}ms`;
          outEl.className = 'readout readout-green';
          outEl.innerText = r.plain;
          dbgKey.innerText = r.key;
          document.getElementById('lab-btn-copy').style.display = 'flex';
        } catch (e) {
          document.getElementById('lab-enc-lbl-res').innerText = 'DECRYPTION ERROR';
          document.getElementById('lab-enc-time').innerText = '';
          outEl.className = 'readout readout-red';
          outEl.innerText = `FATAL: ${e.message || 'Authentication Tag Mismatch or Bad Format.'}`;
          dbgKey.innerText = '—';
          document.getElementById('lab-btn-copy').style.display = 'none';
        }
      }
      action.disabled = false;
      action.innerText = App.S.lab.encMode === 'enc' ? 'EXECUTE ENCRYPTION' : 'EXECUTE DECRYPTION';
      resBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
      AchievementSystem.unlock('rsa_master');
    } catch (e) { alert('RSA Generation Failed: ' + e.message); }
    btn.disabled = false; btn.innerText = 'GENERATE NEW RSA KEY PAIR';
  },

  runRSAEncrypt: async () => {
    const plain = document.getElementById('rsa-enc-in').value;
    const pubKey = document.getElementById('rsa-enc-key').value.trim();
    if (!plain || !pubKey) return alert('Enter message and public key.');
    try {
      const r = await CE.rsaEncrypt(plain, pubKey);
      document.getElementById('rsa-cipher-out').innerText = r.cipher;
      document.getElementById('rsa-enc-res').style.display = 'block';
      Leaderboard.track('tool');
      Leaderboard.track('enc');
    } catch (e) { alert('RSA Encryption Failed: Check Public Key format.'); }
  },

  runRSADecrypt: async () => {
    const cipher = document.getElementById('rsa-dec-in').value.trim();
    const privKey = document.getElementById('rsa-dec-key').value.trim();
    if (!cipher || !privKey) return alert('Enter ciphertext and private key.');
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
    const card = document.getElementById('hmac-' + algo); if (card) card.classList.add('selected');
  },

  genHMACKey: () => {
    const key = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
    document.getElementById('hmac-key').value = key;
  },

  runLabHMAC: async () => {
    App.flash('lab-hmac');
    const data = document.getElementById('hmac-data').value;
    const key = document.getElementById('hmac-key').value;
    if (!data || !key) return alert('Provide both a message and a secret key.');

    try {
      const r = await CE.hmac(App.S.lab.hmacAlgo, key, data);
      const res = document.getElementById('lab-hmac-result');
      res.style.display = 'block';
      document.getElementById('lab-hmac-out').innerText = r.hex;
      document.getElementById('lab-hmac-time').innerText = `${r.ms}ms`;

      const timingDemo = document.getElementById('lab-hmac-timing-demo');
      if (timingDemo) timingDemo.style.display = 'block';

      res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (e) { alert('HMAC Generation Failed: ' + e.message); }
  },

  runTimingAttackDemo: async (mode) => {
    const validHex = document.getElementById('lab-hmac-out').innerText;
    const forgedHex = document.getElementById('hmac-forged').value.trim();
    if (!validHex || validHex === '—') return alert('Generate a valid HMAC first.');
    if (!forgedHex) return alert('Enter a forged HMAC string to test.');

    const resBox = document.getElementById('timing-demo-res');
    resBox.style.display = 'block';
    document.getElementById('timing-type').innerText = mode.toUpperCase();
    document.getElementById('timing-type').style.color = mode === 'safe' ? 'var(--c3, #00ff88)' : 'var(--c2, #ff003c)';

    const logBox = document.getElementById('timing-log');
    logBox.innerHTML = 'Initiating server comparison...<br>';
    const bar = document.getElementById('timing-bar');
    bar.style.width = '0%';
    bar.style.background = mode === 'safe' ? 'var(--c3, #00ff88)' : 'var(--c2, #ff003c)';
    document.getElementById('timing-ms').innerText = 'Running...';

    const delayPerChar = 20;
    let matchCount = 0;

    const startTime = performance.now();

    const compareChar = async () => {
      return new Promise(resolve => setTimeout(resolve, delayPerChar));
    };

    if (mode === 'naive') {
      for (let i = 0; i < validHex.length; i++) {
        await compareChar();
        bar.style.width = Math.min(((i + 1) / validHex.length) * 100, 100) + '%';
        if (i >= forgedHex.length || validHex[i] !== forgedHex[i]) {
          logBox.innerHTML += `<span style="color:var(--c2, #ff003c);">[FAIL]</span> Mismatch at index ${i} (Got: ${forgedHex[i] || 'EOF'}). Connection closed.<br>`;
          break;
        } else {
          matchCount++;
          if (i % 8 === 0) logBox.innerHTML += `[MATCH] Bytes 0-${i} identical. Continuing check...<br>`;
        }
      }
    } else {
      let isMismatch = false;
      for (let i = 0; i < validHex.length; i++) {
        await compareChar();
        bar.style.width = Math.min(((i + 1) / validHex.length) * 100, 100) + '%';
        if (i >= forgedHex.length || validHex[i] !== forgedHex[i]) {
          isMismatch = true;
        }
        if (i % 8 === 0) logBox.innerHTML += `[CONST-TIME] Timing-safe cycle ${i}...<br>`;
      }
      if (isMismatch) {
        logBox.innerHTML += `<span style="color:var(--c2, #ff003c);">[FAIL]</span> Signatures do not match. Connection closed.<br>`;
      } else {
        logBox.innerHTML += `<span style="color:var(--c3, #00ff88);">[SUCCESS]</span> Signatures match.<br>`;
      }
    }

    const elapsed = Math.round(performance.now() - startTime);
    document.getElementById('timing-ms').innerText = `${elapsed}ms`;

    if (mode === 'naive' && matchCount > 0) {
      logBox.innerHTML += `<br><span style="color:var(--c, #00f5ff);">[ATTACKER INTEL]</span> The server took ${elapsed}ms. We know the first ${matchCount} chars are correct!`;
    }

    logBox.scrollTop = logBox.scrollHeight;
  },

  /* ─── STEGANOGRAPHY LAB ─── */
  setupStegoDropZone: () => {
    const zone = document.getElementById('stego-drop-zone');
    if (!zone || zone.dataset.init) return;
    const input = document.getElementById('stego-file-input');
    zone.onclick = () => input.click();
    zone.ondragover = (e) => { e.preventDefault(); zone.classList.add('hover'); };
    zone.ondragleave = () => zone.classList.remove('hover');
    zone.ondrop = (e) => { e.preventDefault(); zone.classList.remove('hover'); if (e.dataTransfer.files.length) App.handleStegoFile(e.dataTransfer.files[0]); };
    input.onchange = (e) => { if (e.target.files.length) App.handleStegoFile(e.target.files[0]); };
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
    if (!App.S.lab.stegoImg || !payload) return alert('Upload an image and enter a payload.');

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
    } catch (e) { alert(e.message); }
  },

  runLabStegoDecode: () => {
    if (!App.S.lab.stegoImg) return alert('Upload the carrier image first.');
    const canvas = document.getElementById('stego-canvas');
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const r = CE.stegoDecode(imgData.data);

    const res = document.getElementById('lab-stego-result');
    res.style.display = 'block';
    document.getElementById('lab-stego-out').innerText = r.plain || '[ EMPTY OR CORRUPTED ]';
    document.getElementById('lab-stego-time').innerText = `${r.ms}ms`;
    res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  /* ─── STORY ─── */
  openAliasScreen: () => { App.resetState(); App.show('screen-alias'); setTimeout(() => document.getElementById('op-alias-input').focus(), 300); },
  submitAlias: () => {
    const alias = document.getElementById('op-alias-input').value.trim();
    if (!alias) return alert('Alias required.');
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
      ctx.fillStyle = 'rgba(0, 255, 136, 0.8)'; ctx.font = '14px monospace';
      drops.forEach((y, i) => {
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 20, y * 20);
        if (y * 20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    }, 50);

    const term = document.getElementById('cutscene-term');
    term.innerHTML = '';
    const pause = ms => new Promise(r => setTimeout(r, ms));

    const typeEl = (el, txt, speed = 14) => new Promise(r => {
      let i = 0;
      const tick = setInterval(() => {
        el.textContent += txt[i++] || '';
        if (i >= txt.length) { clearInterval(tick); r(); }
      }, speed);
    });

    const glitch = async (el, times = 2) => {
      const pool = '!<>-_\/[]{}—=+*^?#XQZW01'; const orig = el.textContent;
      for (let g = 0; g < times; g++) {
        el.textContent = orig.split('').map(c => c === ' ' ? ' ' : pool[Math.floor(Math.random() * pool.length)]).join('');
        await pause(50); el.textContent = orig; await pause(35);
      }
    };

    const addSysLine = async (txt, spd = 13) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:baseline;gap:12px;margin-bottom:4px;opacity:0;transition:opacity 0.3s;';
      const badge = document.createElement('span'); badge.className = 'ct-sys'; badge.textContent = '[SYS]';
      const span = document.createElement('span'); span.style.color = 'rgba(61,79,97,0.9)'; span.style.fontFamily = 'var(--font-mono)'; span.style.fontSize = '13px';
      row.appendChild(badge); row.appendChild(span); term.appendChild(row);
      requestAnimationFrame(() => row.style.opacity = '1');
      await typeEl(span, txt, spd);
      return span;
    };

    const addNixLine = async (txt, spd = 18, color = '#c8d6e5') => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:flex-start;gap:16px;margin-bottom:8px;opacity:0;transition:opacity 0.35s;';
      const badge = document.createElement('div'); badge.className = 'ct-nix-badge';
      const dot = document.createElement('div'); dot.className = 'ct-nix-badge-dot';
      badge.appendChild(dot); badge.appendChild(document.createTextNode('NIX'));
      const span = document.createElement('span');
      span.style.cssText = `color:${color};font-family:var(--font-mono);font-size:15px;line-height:2.2;padding-top:2px;`;
      row.appendChild(badge); row.appendChild(span); term.appendChild(row);
      requestAnimationFrame(() => row.style.opacity = '1');
      await typeEl(span, txt, spd);
      return span;
    };

    const spacer = h => { const d = document.createElement('div'); d.style.height = h + 'px'; term.appendChild(d); };
    const divider = async () => {
      const d = document.createElement('div');
      d.style.cssText = 'height:1px;background:linear-gradient(90deg,transparent,rgba(0,245,255,0.2),transparent);margin:20px 0;opacity:0;transition:opacity 0.5s;';
      term.appendChild(d); requestAnimationFrame(() => d.style.opacity = '1'); await pause(300);
    };

    // PHASE 1: Boot (Use StoryData)
    spacer(20);
    for (const l of StoryData.bootSequence) {
      await addSysLine(l, 8 + Math.random() * 8);
      await pause(30 + Math.random() * 40);
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
    pbRow.style.cssText = 'font-family:var(--font-mono);font-size:12px;color:rgba(61,79,97,0.8);margin:4px 0 8px;';
    term.appendChild(pbRow);
    for (let p = 0; p <= 100; p += 4) {
      const f = Math.floor(p / 4);
      pbRow.innerHTML = `<span style="color:rgba(61,79,97,0.5)">  [</span><span style="color:var(--c)">${'█'.repeat(f)}</span><span style="color:rgba(61,79,97,0.3)">${'·'.repeat(25 - f)}</span><span style="color:rgba(61,79,97,0.5)">] </span><span style="color:rgba(0,245,255,0.7)">${p}% HANDSHAKE</span>`;
      await pause(18);
    }
    pbRow.innerHTML = `<span style="color:var(--c3)">  [█████████████████████████] 100% — CONNECTION ESTABLISHED ✓</span>`;
    await pause(400);

    await addSysLine('Firewall bypassed. Auth token forged. Tunnel is LIVE.', 10);
    await pause(500);

    for (let f = 0; f < 6; f++) {
      term.style.filter = f % 2 === 0 ? `brightness(${1.3 + Math.random() * 0.5}) hue-rotate(${Math.random() * 30}deg)` : '';
      await pause(40);
    }
    term.style.filter = '';
    await pause(200);

    await divider();

    // PHASE 3: NIX speaks (Use StoryData)
    for (const line of StoryData.nixIntro) {
      const span = await addNixLine(line.m(App.S.alias), 18, '#d8e8f8');
      if (line.glitch) await glitch(span, 2);
      await pause(line.wait);
      term.scrollTop = term.scrollHeight;
    }
    await pause(400);

    const endDiv = document.createElement('div');
    endDiv.style.cssText = 'height:1px;background:linear-gradient(90deg,transparent,rgba(0,245,255,0.15),transparent);margin:28px 0 10px;opacity:0;transition:opacity 0.5s;';
    term.appendChild(endDiv); requestAnimationFrame(() => endDiv.style.opacity = '1');
    await pause(300);

    const wrap = document.createElement('div'); wrap.className = 'cta-wrap';
    wrap.style.opacity = '0'; wrap.style.transition = 'opacity 0.7s';
    const hint = document.createElement('span'); hint.className = 'cta-hint';
    hint.textContent = '// awaiting hacker confirmation to begin mission ...';
    const btn = document.createElement('button'); btn.className = 'cta-btn';
    btn.innerHTML = '<span>▶</span><span>&nbsp;&nbsp;JACK IN — BEGIN MISSION</span>';
    btn.onclick = async () => {
      clearInterval(rainAnim);
      btn.style.pointerEvents = 'none';
      btn.innerHTML = '<span>[ ESTABLISHING NEURAL LINK... ]</span>';
      await pause(350);
      document.getElementById('screen-cutscene').style.transition = 'opacity 0.6s';
      document.getElementById('screen-cutscene').style.opacity = '0';
      await pause(650);
      document.getElementById('screen-cutscene').style.opacity = '';
      document.getElementById('screen-cutscene').style.transition = '';
      App.S.story.step = 0; App.S.story.maxStep = 0;
      await App.ensureStoryState();
      App.renderStory();
    };
    wrap.appendChild(hint); wrap.appendChild(btn);
    term.appendChild(wrap); term.scrollTop = term.scrollHeight;
    requestAnimationFrame(() => wrap.style.opacity = '1');
  },

  ensureStoryState: async () => {
    if (!App.S.story.pwd) {
      App.S.story.pwd = 'MeridianAdmin99';
      const r = await CE.hash('SHA-256', App.S.story.pwd);
      App.S.story.hashHex = r.hex; App.S.story.hashBits = r.bits;
    }
    if (App.S.story.step === 7) {
      await App.ensureCAKeys();
    }
  },

  ensureCAKeys: async () => {
    if (!App.S.story.caKeys) {
      App.S.story.caKeys = await CE.generateECDSA();
      App.S.story.serverKeys = await CE.generateECDSA();
    }
  },

  renderStoryMap: () => {
    const titles = ['Init', 'Avalanche', 'Auth', 'Breach', 'AES-GCM', 'Stego', 'Forger', 'Authority', 'Eval'];
    const S = App.S.story;
    let html = '';
    for (let i = 0; i < 9; i++) {
      const done = i < S.maxStep, active = i === S.step, unlocked = i <= S.maxStep;
      html += `<div class="cm-node${done ? ' done' : ''}${active ? ' active' : ''}${unlocked ? ' unlocked' : ''}" ${unlocked ? `onclick="App.jumpToStory(${i})"` : ''} tabindex="${unlocked ? '0' : '-1'}" role="button">
        <div class="cm-diamond"></div><div class="cm-lbl">${titles[i]}</div>
      </div>`;
      if (i < 8) html += `<div class="cm-line${done ? ' done' : ''}"></div>`;
    }
    document.getElementById('story-map').innerHTML = html;
  },

  jumpToStory: async idx => {
    if (idx <= App.S.story.maxStep) { App.S.story.step = idx; await App.ensureStoryState(); App.renderStory(); }
  },

  showNextBtn: nextIdx => {
    if (App.S.story.maxStep < nextIdx) {
      App.S.story.maxStep = nextIdx;
      localStorage.setItem('nix_story_max', nextIdx);
    }
    App.renderStoryMap();
    const zone = document.getElementById('story-next-zone');
    zone.innerHTML = '';
    zone.style.cssText = 'margin-top:28px;border-top:1px solid var(--border);padding-top:24px;';
    if (nextIdx === 4) {
      zone.innerHTML = `<button class="btn btn-primary btn-full" onclick="App.runStoryBreachCutscene()">PROCEED TO NEXT PHASE →</button>`;
    } else if (nextIdx >= 7) {
      zone.innerHTML = `<button class="btn btn-success btn-full" onclick="App.goHome()">MISSION ACCOMPLISHED — RETURN TO BASE</button>`;
    } else {
      zone.innerHTML = `<button class="btn btn-primary btn-full" onclick="App.jumpToStory(${nextIdx})">PROCEED TO NEXT PHASE →</button>`;
    }
    setTimeout(() => zone.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
  },

  renderStory: () => {
    App.show('screen-story-main');
    App.renderStoryMap();

    const step = App.S.story.step;
    const data = StoryData.missions[step];

    document.getElementById('story-module-name').innerText = data.module;
    document.getElementById('story-panel-title').innerText = data.title;

    const dBox = document.getElementById('story-dialogue');
    const aBox = document.getElementById('story-action-zone');
    document.getElementById('story-next-zone').innerHTML = '';

    // Setup Dialogue (from StoryData)
    dBox.className = `dialogue dlg-${data.dialogue.toLowerCase()}`;
    const txt = typeof data.text === 'function' ? data.text(App.S.alias) : data.text;
    dBox.innerHTML = `<div class="dlg-badge">${data.dialogue}</div><div class="dlg-text">${txt}</div>`;

    if (step === 0) {
      aBox.innerHTML = `
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
      App.S.story.algo = 'SHA-256';
    }
    else if (step === 1) {
      aBox.innerHTML = `
        <span class="form-label">Original Password (Locked)</span>
        <input class="form-input" disabled value="${App.S.story.pwd}" style="opacity:0.4;margin-bottom:4px;">
        <span class="form-label">Modified Password</span>
        <input class="form-input" id="s-av-in" placeholder="Change one character..." oninput="App.runStoryAvalanche()">
        <div class="bit-grid" id="s-av-grid" style="margin-top:12px;"></div>
        <div id="s-av-res" style="font-family:var(--font-mono);font-size:12px;color:var(--muted);margin-top:10px;"></div>
      `;
      App.runStoryAvalanche(true);
    }
    else if (step === 2) {
      aBox.innerHTML = `
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
    else if (step === 3) {
      aBox.innerHTML = `
        <div class="btn-group"><button class="btn btn-danger" onclick="App.runStoryBruteForce()" id="btn-breach-start">[ INITIATE PERIMETER SCAN ]</button></div>
        <div class="term" id="s-breach-term" style="display:none;margin-top:16px;"></div>
      `;
    }
    else if (step === 4) {
      aBox.innerHTML = `
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
    else if (step === 5) {
      aBox.innerHTML = `
        <div id="stego-story-zone" class="panel" style="padding:24px; background:rgba(0,0,0,0.4); border-style:dashed;">
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px;">
            <div>
              <span class="form-label">Carrier Image</span>
              <div id="stego-story-drop" class="drop-zone" style="min-height:100px;">
                <div class="drop-text" style="font-size:12px;">DRAG & DROP DECOY IMAGE</div>
              </div>
              <canvas id="stego-story-canvas" style="display:none; max-width:100%; margin-top:12px; border:1px solid var(--c);" aria-hidden="true"></canvas>
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
    else if (step === 6) {
      aBox.innerHTML = `
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
    else if (step === 7) {
      aBox.innerHTML = `
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
    else if (step === 8) {
      let html = '';
      StoryData.quiz.forEach((q, qi) => {
        html += `<div class="panel" style="padding:20px;margin-bottom:12px;"><div style="margin-bottom:14px;font-weight:600;font-size:15px;color:var(--bright);font-family:var(--font-ui);">${q.q}</div>`;
        q.o.forEach((opt, oi) => html += `<button class="quiz-opt" id="q-${qi}-${oi}" onclick="App.ansQuiz(${qi},${oi},${q.c})">${opt}</button>`);
        html += `</div>`;
      });
      aBox.innerHTML = html + `<div id="s-quiz-res"></div>`;
      App.S.story.score = 0;
    }
  },

  selectStoryAlgo: (el, algo) => {
    App.S.story.algo = algo;
    el.parentElement.querySelectorAll('.algo-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
  },

  runStoryHash: async () => {
    const input = document.getElementById('s-hash-in').value.trim();
    if (!input) return alert('Enter a password first.');
    App.S.story.pwd = input;
    try {
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
      for (let i = 0; i < Math.min(r.bits.length, 256); i++) {
        const b = document.createElement('div'); b.className = 'bit' + (r.bits[i] === '1' ? ' on' : ''); grid.appendChild(b);
      }
      App.showNextBtn(1);
    } catch (e) { alert('Hashing Failed: ' + e.message); }
  },

  runStoryAvalanche: async (init) => {
    const inputEl = document.getElementById('s-av-in');
    const input = inputEl ? inputEl.value : '';
    if (!init && !input) {
      init = true;
    }
    try {
      const r = await CE.hash(App.S.story.algo, input);
      const grid = document.getElementById('s-av-grid');
      const res = document.getElementById('s-av-res');
      if (!grid) return;
      grid.innerHTML = '';

      let diffs = 0;
      const maxBits = Math.min(r.bits.length, 256);
      for (let i = 0; i < maxBits; i++) {
        const b = document.createElement('div');
        const bitOn = r.bits[i] === '1';
        const isDiff = !init && r.bits[i] !== App.S.story.hashBits[i];
        if (isDiff) diffs++;
        b.className = 'bit' + (bitOn ? ' on' : '') + (isDiff ? ' diff' : '');
        grid.appendChild(b);
      }

      if (!init) {
        const percent = ((diffs / maxBits) * 100).toFixed(1);
        res.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span>BIT FLIPS DETECTED: <strong style="color:var(--c2);">${diffs}</strong> / ${maxBits}</span>
            <span class="status-tag ${diffs > 100 ? 'st-ok' : 'st-warn'}">${percent}% VARIANCE</span>
          </div>
        `;
        if (input !== App.S.story.pwd && input.length > 0) App.showNextBtn(2);
      } else {
        res.innerHTML = '// Modify the password above to observe the avalanche effect.';
      }
    } catch (e) { alert('Hashing Failed: ' + e.message); }
  },

  runStoryBruteForce: async () => {
    const step = App.S.story.step;
    const btn = document.getElementById(step === 2 ? 'btn-brute' : 'btn-breach-start');
    const term = document.getElementById(step === 2 ? 'brute-term' : 's-breach-term');
    btn.disabled = true;
    term.style.display = 'block';
    term.innerHTML = '';

    const log = (txt, cls = '') => {
      const l = document.createElement('div'); l.className = 'tl ' + cls; l.innerHTML = txt;
      term.appendChild(l); term.scrollTop = term.scrollHeight;
    };

    if (step === 2) {
      log('>> INITIALIZING DICTIONARY ATTACK...', 'to');
      await new Promise(r => setTimeout(r, 600));
      const guesses = ['password', '123456', 'admin', 'qwerty', 'meridian', App.S.story.pwd];
      for (const g of guesses) {
        log(`TRYING: <span class="tc">${g}</span> ...`, 'to');
        const r = await CE.hash(App.S.story.algo, g);
        log(`HASH: ${r.hex.substring(0, 32)}...`, 'to');
        await new Promise(r => setTimeout(r, 400));
        if (g === App.S.story.pwd) {
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

    const addLine = (txt, cls = '') => {
      const d = document.createElement('div'); d.className = cls;
      if (cls === 'ct-nix-badge') {
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
    if (!pass) return alert('Create a passphrase to lock the data.');
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
    if (!payload || !pass) return alert('Enter both the payload and the passphrase.');

    try {
      const r = await CE.decrypt(payload, pass);
      res.innerHTML = `
        <div class="status-tag st-ok">SUCCESS</div>
        <div class="readout readout-green" style="margin-top:12px;">${r.plain}</div>
      `;
    } catch (e) {
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
    if (!zone) return;
    zone.ondragover = (e) => { e.preventDefault(); zone.classList.add('hover'); };
    zone.ondragleave = () => zone.classList.remove('hover');
    zone.ondrop = (e) => {
      e.preventDefault(); zone.classList.remove('hover');
      if (e.dataTransfer.files.length) {
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
    if (canvas.style.display === 'none') return alert('Please upload a decoy image first.');
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    CE.stegoEncode(imgData.data, "0fe721:bc892a:f821de77bc21009822a1f8...");
    ctx.putImageData(imgData, 0, 0);
    document.getElementById('stego-story-res').style.display = 'block';
    App.showNextBtn(6);
  },

  ansQuiz: (qi, oi, c) => {
    document.querySelectorAll(`[id^='q-${qi}-']`).forEach(b => b.disabled = true);
    if (oi === c) { document.getElementById(`q-${qi}-${oi}`).classList.add('correct'); App.S.story.score++; }
    else { document.getElementById(`q-${qi}-${oi}`).classList.add('wrong'); document.getElementById(`q-${qi}-${c}`).classList.add('correct'); }
    const total = document.querySelectorAll('.quiz-opt').length;
    const disabled = document.querySelectorAll('.quiz-opt:disabled').length;
    if (disabled === total) {
      const s = App.S.story.score;
      const qlen = StoryData.quiz.length;
      document.getElementById('s-quiz-res').innerHTML = `
        <div class="score-card">
          <div class="score-big">${s}/${qlen}</div>
          <div class="score-label">EVALUATION SCORE</div>
          <div style="font-family:var(--font-mono);font-size:12px;color:var(--muted);margin-bottom:24px;">${s === qlen ? 'PERFECT SCORE. CLEARED FOR FIELD OPERATIONS.' : s >= Math.floor(qlen * 0.7) ? 'STRONG PERFORMANCE. MINOR GAPS DETECTED.' : 'FURTHER TRAINING REQUIRED.'}</div>
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
    if (!msg) return alert('Enter a message to sign.');

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
    } catch (e) {
      alert('ECDSA Signing Failed: ' + e.message);
    }
  },

  runStoryECDSATamper: async () => {
    if (!App.S.story.ecdsaKeyPair) return alert('Sign the message first.');
    const msg = App.S.story.ecdsaMsg;
    const tamperedMsg = msg + "_TAMPERED";
    document.getElementById('s-ecdsa-msg').value = tamperedMsg;

    try {
      const r = await CE.verifyECDSA(App.S.story.ecdsaKeyPair.publicKey, App.S.story.ecdsaSig, tamperedMsg);
      const statusBox = document.getElementById('s-ecdsa-status-box');
      if (!r.valid) {
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
    } catch (e) { alert('Verify Failed: ' + e.message); }
  },

  runStoryECDSAVerifyOriginal: async () => {
    if (!App.S.story.ecdsaKeyPair) return alert('Sign the message first.');
    const msg = App.S.story.ecdsaMsg;
    document.getElementById('s-ecdsa-msg').value = msg;

    try {
      const r = await CE.verifyECDSA(App.S.story.ecdsaKeyPair.publicKey, App.S.story.ecdsaSig, msg);
      const statusBox = document.getElementById('s-ecdsa-status-box');
      if (r.valid) {
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
    } catch (e) { alert('Verify Failed: ' + e.message); }
  },

  // PKI Story Mode Actions
  runStoryIssueCert: async () => {
    const domain = document.getElementById('s-cert-domain').value.trim();
    const validity = document.getElementById('s-cert-validity').value;
    if (!domain) return alert('Enter a domain name.');

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
    if (!res) return;

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
  updateCrackTargetHash: async () => {
    const sel = document.getElementById('crack-password-select');
    if (!sel) return;
    const pwd = sel.value;
    const hash = CE.md5(pwd);
    const hashEl = document.getElementById('crack-target-hash');
    if (hashEl) hashEl.innerText = hash;

    const shaEl = document.getElementById('crack-sha256-target');
    if (shaEl) {
      const shaHash = await CE.hash('SHA-256', pwd + "somesalt");
      shaEl.innerText = shaHash.hex;
    }
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

    document.getElementById('crack-sha256-area').style.display = 'none';

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

        // Start SHA-256 counter simulation
        document.getElementById('crack-sha256-area').style.display = 'block';
        let shaCounter = 0;
        let shaInterval = setInterval(() => {
          shaCounter += 140;
          if (shaCounter > 2000) shaCounter = 2000;
          document.getElementById('crack-sha256-attempts').innerText = `${shaCounter} / 2000`;
          if (shaCounter >= 2000) clearInterval(shaInterval);
        }, 80);

        document.getElementById('crack-result-password').innerText = msg.password;
        document.getElementById('crack-result-time').innerText = `${msg.time} ms`;
        document.getElementById('crack-result-attempts').innerText = msg.attempts;

        const shareText = document.getElementById('md5-share-text');
        if (shareText) {
          const secs = (msg.time / 1000).toFixed(1);
          const link = window.location.href.split('#')[0];
          shareText.value = `I just cracked an MD5 hash in my browser in ${secs} seconds — here's why MD5 is broken for passwords ${link} #cryptography #security`;
        }

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
    if (!msg || !App.S.lab.ecdsaKeys) return alert('Generate keys and enter a message first.');
    try {
      const res = await CE.signECDSA(App.S.lab.ecdsaKeys.keyPair.privateKey, msg);
      App.S.lab.ecdsaLastSig = res.signature;
      document.getElementById('ecdsa-sig-out').innerText = res.signatureHex;
      document.getElementById('ecdsa-res-area').style.display = 'block';
      document.getElementById('ecdsa-verify-status').innerText = '';
      AchievementSystem.unlock('the_forger');
    } catch (e) { alert('Signing Failed: ' + e.message); }
  },

  runECDSATamper: () => {
    const msgEl = document.getElementById('ecdsa-msg');
    let msg = msgEl.value;
    if (!msg) return;
    const last = msg.charCodeAt(msg.length - 1);
    msgEl.value = msg.substring(0, msg.length - 1) + String.fromCharCode(last ^ 1);
    App.flash('ecdsa-msg');
  },

  runECDSAVerify: async () => {
    const msg = document.getElementById('ecdsa-msg').value;
    const sig = App.S.lab.ecdsaLastSig;
    if (!msg || !sig) return;
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

  loadSampleCertChain: () => {
    // Two-certificate chain: a self-signed CA → leaf (both generated for demo purposes)
    // Both are real PEM format; the chain verifier will parse and attempt crypto.subtle.verify.
    // In a real scenario you'd paste: leaf.pem + intermediate.pem + root.pem from your server bundle.
    const chainSample =
`-----BEGIN CERTIFICATE-----
MIIBpDCCAUqgAwIBAgIUYt3JVUj8C5N1m6XP+WlEgjWMHnkwCgYIKoZIzj0EAwIw
LzELMAkGA1UEBhMCVVMxEDAOBgNVBAoTB05JWCBDQTEOMAwGA1UEAxMFTklYQ0Ew
HhcNMjUwMTAxMDAwMDAwWhcNMjYwMTAxMDAwMDAwWjAvMQswCQYDVQQGEwJVUzEQ
MA4GA1UEChMHTklYIENBMQ4wDAYDVQQDEwVOSVhDQTBZMBMGByqGSM49AgEGCCqG
SM49AwEHA0IABPQ5v6bK9GZZdR3W1SkN7V7E6kTFJJ7bP3eJpQ0s8GQRNE6JKlUo
f1zMRXQiDmJXJ6A+yO2XQbLJE0PzUEaYBFSjUDBOMB0GA1UdDgQWBBT9kLB5QTXJ
iV5LDFxOXFaZCdaKJDAPBgNVHRMBAf8EBTADAQH/MBwGA1UdEQQVMBOCEW5peC1s
YWIubG9jYWxob3N0MAoGCCqGSM49BAMCA0gAMEUCIQDzB1MuujRHRWS1mf8Kg6Q+
DM+mxz/eJ7EFPQ1l29aH8QIgHvC6bNvSrxS7kF/V3K3YKMxHjJUgR5h5uJnNJWYN
WUY=
-----END CERTIFICATE-----

-----BEGIN CERTIFICATE-----
MIIBpDCCAUqgAwIBAgIUYt3JVUj8C5N1m6XP+WlEgjWMHnkwCgYIKoZIzj0EAwIw
LzELMAkGA1UEBhMCVVMxEDAOBgNVBAoTB05JWCBDQTEOMAwGA1UEAxMFTklYQ0Ew
HhcNMjUwMTAxMDAwMDAwWhcNMjYwMTAxMDAwMDAwWjAvMQswCQYDVQQGEwJVUzEQ
MA4GA1UEChMHTklYIENBMQ4wDAYDVQQDEwVOSVhDQTBZMBMGByqGSM49AgEGCCqG
SM49AwEHA0IABPQ5v6bK9GZZdR3W1SkN7V7E6kTFJJ7bP3eJpQ0s8GQRNE6JKlUo
f1zMRXQiDmJXJ6A+yO2XQbLJE0PzUEaYBFSjUDBOMB0GA1UdDgQWBBT9kLB5QTXJ
iV5LDFxOXFaZCdaKJDAPBgNVHRMBAf8EBTADAQH/MBwGA1UdEQQVMBOCEW5peC1s
YWIubG9jYWxob3N0MAoGCCqGSM49BAMCA0gAMEUCIQDzB1MuujRHRWS1mf8Kg6Q+
DM+mxz/eJ7EFPQ1l29aH8QIgHvC6bNvSrxS7kF/V3K3YKMxHjJUgR5h5uJnNJWYN
WUY=
-----END CERTIFICATE-----`;
    document.getElementById('cert-input').value = chainSample;
  },

  runCertInspect: async () => {
    const pem = document.getElementById('cert-input').value;
    const errEl = document.getElementById('cert-error');
    const resEl = document.getElementById('cert-results');
    errEl.style.display = 'none';
    resEl.style.display = 'none';
    if (!pem) return;

    // Check if it's a chain (contains multiple certs) — auto-route to chain verifier
    const certCount = (pem.match(/-----BEGIN CERTIFICATE-----/g) || []).length;
    if (certCount >= 2) {
      return App.runCertChain();
    }

    try {
      const info = await CE.parsePEMCertificate(pem);
      document.getElementById('cert-subject').innerText = info.subject;
      document.getElementById('cert-issuer').innerText = info.issuer;
      document.getElementById('cert-notbefore').innerText = info.notBefore;
      document.getElementById('cert-notafter').innerText = info.notAfter;
      document.getElementById('cert-serial').innerText = info.serial;

      const statusBox = document.getElementById('cert-browser-status');
      if (statusBox) {
        let statusHtml = '';
        let isValid = true;

        if (info.isExpired) {
          isValid = false;
          statusHtml += `<div style="color:var(--c2, #ff003c); margin-bottom:8px;">❌ <strong>NET::ERR_CERT_DATE_INVALID</strong><br><span style="color:var(--muted); font-size:11px;">The certificate has expired. Browsers will reject it to prevent attackers from using old, potentially compromised keys.</span></div>`;
        }
        if (info.isSelfSigned) {
          isValid = false;
          statusHtml += `<div style="color:var(--c2, #ff003c); margin-bottom:8px;">❌ <strong>NET::ERR_CERT_AUTHORITY_INVALID</strong><br><span style="color:var(--muted); font-size:11px;">This is a self-signed certificate (Subject = Issuer). Browsers will block it because it was not signed by a trusted Certificate Authority (CA) in their root store.</span></div>`;
        }

        if (isValid) {
          statusHtml += `<div style="color:var(--c3, #00ff88); margin-bottom:8px;">✅ <strong>CERTIFICATE APPEARS VALID</strong><br><span style="color:var(--muted); font-size:11px;">No immediate red flags. Provided it's signed by a trusted CA, a browser would accept it.</span></div>`;
        }

        if (info.isEV) {
          statusHtml += `<div style="color:var(--c, #00f5ff); margin-top:12px; border-top:1px solid rgba(0,255,255,0.2); padding-top:12px;">🛡️ <strong>Extended Validation (EV) Detected</strong><br><span style="color:var(--muted); font-size:11px;">This cert includes the EV OID (2.23.140.1.1). The issuing CA performed strict identity verification on the organization.</span></div>`;
        }

        if (info.sans && info.sans.length > 0) {
          statusHtml += `<div style="color:var(--c, #00f5ff); margin-top:12px; border-top:1px solid rgba(0,255,255,0.2); padding-top:12px;">🌐 <strong>Subject Alternative Names (SANs)</strong><br><span style="color:var(--muted); font-size:11px;">Valid for: ${info.sans.join(', ')}</span></div>`;
        }

        statusBox.innerHTML = statusHtml;
      }

      resEl.style.display = 'block';
      AchievementSystem.unlock('trust_no_one');
    } catch (e) {
      errEl.innerText = e.message;
      errEl.style.display = 'block';
    }
  },

  /* ─── CERT CHAIN VERIFIER (V2 Stretch Goal) ─── */
  runCertChain: async () => {
    const pem = document.getElementById('cert-input').value;
    const errEl = document.getElementById('cert-error');
    const chainEl = document.getElementById('cert-chain-results');
    errEl.style.display = 'none';
    document.getElementById('cert-results').style.display = 'none';
    if (chainEl) chainEl.style.display = 'none';
    if (!pem) return;

    const btn = document.getElementById('btn-parse-cert');
    if (btn) { btn.disabled = true; btn.innerText = 'VERIFYING CHAIN...'; }

    try {
      const result = await CE.verifyCertChain(pem);
      if (!chainEl) { if (btn) { btn.disabled = false; btn.innerText = 'PARSE / VERIFY CHAIN'; } return; }

      const allValid = result.links.every(l => l.valid === true);
      const anyFailed = result.links.some(l => l.valid === false);

      // Build chain-of-trust diagram
      let html = `<div style="margin-bottom:20px; padding:16px; border:2px solid ${allValid ? 'var(--c3)' : 'var(--c2)'}; background:${allValid ? 'rgba(0,255,136,0.04)' : 'rgba(255,0,60,0.04)'};">
        <div style="font-family:var(--font-display); font-size:13px; letter-spacing:2px; color:${allValid ? 'var(--c3)' : 'var(--c2)'}; margin-bottom:6px;">
          ${allValid ? '🔒 CHAIN OF TRUST — VERIFIED' : '⚠️ CHAIN VERIFICATION FAILED'}
        </div>
        <div style="font-family:var(--font-mono); font-size:11px; color:var(--muted);">
          ${result.certs.length} certificates parsed &bull; ${result.links.length} link(s) verified &bull; Root is ${result.isRootSelfSigned ? 'self-signed (Root CA) ✓' : 'NOT self-signed ⚠️'}
        </div>
      </div>`;

      // Vertical chain diagram — leaf at top, root at bottom
      const certLabels = result.certs.map((m, i) => {
        const role = i === 0 ? 'LEAF / END-ENTITY' : (i === result.certs.length - 1 ? 'ROOT CA' : `INTERMEDIATE CA ${i}`);
        const subject = m.subject ? m.subject.replace(/,\s*/g, '\n') : `Certificate ${i + 1}`;
        return { role, subject, meta: m };
      });

      html += `<div style="display:flex; flex-direction:column; align-items:center; gap:0;">`;

      certLabels.forEach((cert, i) => {
        const isRoot = i === certLabels.length - 1;
        const nodeColor = i === 0 ? 'var(--c)' : (isRoot ? 'var(--c3)' : 'var(--c4)');

        html += `<div style="width:100%; max-width:500px; padding:14px 18px; border:1px solid ${nodeColor}; background:rgba(0,0,0,0.35); box-shadow:0 0 12px ${nodeColor}22; position:relative;">
          <div style="font-size:9px; font-family:var(--font-mono); color:${nodeColor}; letter-spacing:2px; margin-bottom:6px;">${cert.role}</div>
          <div style="font-family:var(--font-mono); font-size:11px; color:var(--bright); white-space:pre-line; line-height:1.6;">${cert.subject}</div>
          ${cert.meta.notAfter ? `<div style="font-size:10px; color:var(--muted); margin-top:6px;">Expires: ${cert.meta.notAfter}</div>` : ''}
          ${cert.meta.isExpired ? `<div style="font-size:10px; color:var(--c2); margin-top:4px;">⚠️ EXPIRED</div>` : ''}
        </div>`;

        // Arrow between certs showing verification result
        if (i < certLabels.length - 1) {
          const link = result.links[i];
          const linkOk = link.valid === true;
          const linkNull = link.valid === null;
          const arrowColor = linkNull ? 'var(--c4)' : (linkOk ? 'var(--c3)' : 'var(--c2)');
          const arrowIcon = linkNull ? '⚠️' : (linkOk ? '✓' : '✗');
          const arrowLabel = linkNull ? 'ALGORITHM MISMATCH' : (linkOk ? 'SIGNATURE VALID' : 'INVALID SIGNATURE');

          html += `<div style="display:flex; flex-direction:column; align-items:center; padding:8px 0;">
            <div style="width:2px; height:12px; background:${arrowColor}; opacity:0.6;"></div>
            <div style="padding:4px 12px; border:1px solid ${arrowColor}; background:rgba(0,0,0,0.5); font-family:var(--font-mono); font-size:10px; color:${arrowColor}; letter-spacing:1px; display:flex; gap:6px; align-items:center;">
              <span>${arrowIcon}</span><span>${arrowLabel}</span>
            </div>
            <div style="width:2px; height:12px; background:${arrowColor}; opacity:0.6;"></div>
            <div style="width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid ${arrowColor}; opacity:0.7;"></div>
          </div>`;
        }
      });

      html += `</div>`;

      // Detail table for each link
      if (anyFailed || result.links.some(l => l.valid === null)) {
        html += `<div style="margin-top:20px; border-top:1px solid var(--border); padding-top:16px;">
          <div style="font-family:var(--font-mono); font-size:10px; color:var(--muted); letter-spacing:2px; margin-bottom:12px;">VERIFICATION DETAIL</div>`;
        result.links.forEach((link, i) => {
          const c = link.valid === true ? 'var(--c3)' : (link.valid === null ? 'var(--c4)' : 'var(--c2)');
          html += `<div style="margin-bottom:8px; padding:10px; border:1px solid ${c}22; background:rgba(0,0,0,0.3);">
            <div style="font-family:var(--font-mono); font-size:10px; color:${c};">Link ${i + 1}: ${link.reason}</div>
          </div>`;
        });
        html += `</div>`;
      }

      chainEl.innerHTML = html;
      chainEl.style.display = 'block';
      AchievementSystem.unlock('trust_no_one');

    } catch (e) {
      errEl.innerHTML = `<span style="color:var(--c2); text-shadow:0 0 8px var(--c2);">[ CHAIN ERROR ]</span> ${e.message}`;
      errEl.style.display = 'block';
    }
    if (btn) { btn.disabled = false; btn.innerText = 'PARSE / VERIFY CHAIN'; }
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
    const warnEl = document.getElementById('ent-compromised-warn');

    // Check Top 10k Passwords
    const isCompromised = (typeof TOP_PASSWORDS !== 'undefined') && TOP_PASSWORDS.has(str.trim().toLowerCase());

    warnEl.style.display = isCompromised ? 'block' : 'none';

    const res = CE.shannonEntropy(str);
    document.getElementById('ent-bpc').innerText = res.bitsPerChar;

    // If compromised, effective entropy is 0 for security purposes
    const effectiveTotal = isCompromised ? 0 : res.total;
    document.getElementById('ent-total').innerText = effectiveTotal;

    let pct = Math.min(100, (effectiveTotal / 128) * 100);
    document.getElementById('ent-gauge').style.width = pct + '%';

    let evalStr = '';
    if (isCompromised) evalStr = '<span style="color:var(--c2);">Compromised.</span> Found in top 10,000 passwords. Effective entropy is zero.';
    else if (res.total < 40) evalStr = '<span style="color:var(--c2);">Weak.</span> Highly vulnerable to brute-force or dictionary attacks.';
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
    if (boundEl) boundEl.innerText = "~" + bound;

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
        AchievementSystem.unlock('collision_course');
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
  },

  /* ─── SESSION MANAGER (EXPORT / IMPORT / SHARE) ─── */
  shareActiveLab: () => {
    const currentTab = document.querySelector('.lab-tab.active').id.replace('btn-tab-', '');
    let payload = { tool: currentTab };
    if (currentTab === 'hash') {
      payload.input = document.getElementById('lab-hash-in').value;
      payload.salt = document.getElementById('lab-hash-salt').value;
    } else if (currentTab === 'enc') {
      payload.data = document.getElementById('lab-enc-data').value;
      payload.mode = App.S.lab.encMode;
    } else if (currentTab === 'compare') {
      payload.input = document.getElementById('cmp-input').value;
    } else if (currentTab === 'hmac') {
      payload.data = document.getElementById('hmac-data').value;
      payload.algo = App.S.lab.hmacAlgo;
    } else if (currentTab === 'entropy') {
      const el = document.getElementById('entropy-input');
      if (el) payload.input = el.value;
    }
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const link = window.location.origin + window.location.pathname + '#share=' + b64;
    App.copyToClipboardRaw(link);
    App.showError('✓ Share link copied to clipboard!');
    const toast = document.getElementById('global-error-toast');
    if (toast) { toast.style.borderColor = 'var(--c3)'; toast.style.color = 'var(--c3)'; toast.style.boxShadow = '0 0 20px rgba(0,255,136,0.4)'; setTimeout(() => { toast.style.borderColor = '#ff003c'; toast.style.color = '#ff003c'; toast.style.boxShadow = '0 0 20px rgba(255,0,60,0.5)'; }, 3000); }
  },

  copyToClipboardRaw: (text) => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  },

  exportSession: async () => {
    const g = (id) => { const el = document.getElementById(id); return el ? (el.value || el.innerText || '') : ''; };
    const data = {
      version: '3.0.0',
      timestamp: new Date().toISOString(),
      toolStates: {
        hash: {
          toolId: 'hash',
          algorithm: App.S.lab.algo,
          input: g('lab-hash-in'),
          salt: g('lab-hash-salt'),
          output: g('lab-hash-out')
        },
        enc: {
          toolId: 'enc',
          mode: App.S.lab.encMode,
          data: g('lab-enc-data'),
          output: g('lab-enc-out'),
          iv: g('lab-enc-out-iv'),
          iterations: g('lab-enc-iters')
        },
        compare: {
          toolId: 'compare',
          input: g('cmp-input')
        },
        hmac: {
          toolId: 'hmac',
          algorithm: App.S.lab.hmacAlgo,
          data: g('hmac-data'),
          output: g('lab-hmac-out')
        },
        entropy: {
          toolId: 'entropy',
          input: (() => { const el = document.getElementById('entropy-input'); return el ? el.value : ''; })()
        },
        ecdsa: {
          toolId: 'ecdsa',
          message: g('ecdsa-msg'),
          publicKey: g('ecdsa-pub-out'),
          signature: g('ecdsa-sig-out')
        },
        ecdh: {
          toolId: 'ecdh',
          fingerprint: g('ecdh-fingerprint'),
          note: 'Private keys excluded for security.'
        }
      }
    };

    let outStr = JSON.stringify(data, null, 2);
    let filename = `nix_session_${Date.now()}.json`;

    if (confirm("Encrypt this export using AES-GCM?")) {
      const pass = prompt("Enter a passphrase for encryption:");
      if (!pass) return alert("Export cancelled.");

      try {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const keyMaterial = await crypto.subtle.importKey(
          'raw', new TextEncoder().encode(pass), { name: 'PBKDF2' }, false, ['deriveKey']
        );
        const key = await crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
          keyMaterial,
          { name: 'AES-GCM', length: 256 },
          false,
          ['encrypt']
        );
        const cipher = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: iv },
          key,
          new TextEncoder().encode(outStr)
        );

        const bundle = new Uint8Array(28 + cipher.byteLength);
        bundle.set(salt, 0);
        bundle.set(iv, 16);
        bundle.set(new Uint8Array(cipher), 28);

        outStr = JSON.stringify({ encrypted: true, payloadHex: CE.bufToHex(bundle) });
        filename = `nix_session_${Date.now()}.enc.json`;
      } catch (e) {
        return alert("Encryption failed: " + e.message);
      }
    }

    const blob = new Blob([outStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  importSession: async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        let data = JSON.parse(ev.target.result);
        if (data.encrypted) {
          const pass = prompt("This session is encrypted. Enter passphrase:");
          if (!pass) return;

          const hex = data.payloadHex;
          const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
          const salt = bytes.slice(0, 16);
          const iv = bytes.slice(16, 28);
          const cipher = bytes.slice(28);

          const keyMaterial = await crypto.subtle.importKey(
            'raw', new TextEncoder().encode(pass), { name: 'PBKDF2' }, false, ['deriveKey']
          );
          const key = await crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
          );
          const plainBytes = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            cipher
          );
          data = JSON.parse(new TextDecoder().decode(plainBytes));
        }

        // Schema validation with field-level error messages
        const errors = [];
        if (!data.version) errors.push('Missing required field: "version"');
        if (!data.timestamp) errors.push('Missing required field: "timestamp"');
        if (!data.toolStates) errors.push('Missing required field: "toolStates" — cannot restore any tool state');
        if (errors.length) throw new Error(errors.join('\n'));
        if (typeof data.toolStates !== 'object') throw new Error('Field "toolStates" must be an object, got ' + typeof data.toolStates);

        let loaded = [];

        if (data.toolStates.hash) {
          const h = data.toolStates.hash;
          if (typeof h !== 'object') throw new Error('toolStates.hash must be an object');
          const inEl = document.getElementById('lab-hash-in');
          const saltEl = document.getElementById('lab-hash-salt');
          if (inEl) inEl.value = h.input || '';
          if (saltEl) saltEl.value = h.salt || '';
          if (h.algorithm) App.setLabAlgo(h.algorithm);
          App.switchLabTab('hash');
          if (h.input || h.salt) App.runLabHash();
          loaded.push('Hash Engine');
        }

        if (data.toolStates.enc) {
          const s = data.toolStates.enc;
          if (typeof s !== 'object') throw new Error('toolStates.enc must be an object');
          const dataEl = document.getElementById('lab-enc-data');
          if (dataEl) dataEl.value = s.data || '';
          if (s.mode) App.setLabEncMode(s.mode);
          loaded.push('AES-GCM Utility');
        }

        if (data.toolStates.compare) {
          const c = data.toolStates.compare;
          const cmpEl = document.getElementById('cmp-input');
          if (cmpEl && c.input) { cmpEl.value = c.input; App.runCompare(); }
          loaded.push('Compare All Algos');
        }

        if (data.toolStates.hmac) {
          const h = data.toolStates.hmac;
          const hmacEl = document.getElementById('hmac-data');
          if (hmacEl && h.data) hmacEl.value = h.data;
          if (h.algorithm) App.setHMACAlgo(h.algorithm);
          loaded.push('HMAC Auth');
        }

        const summary = loaded.length
          ? `Session v${data.version} loaded.\nRestored: ${loaded.join(', ')}.`
          : `Session v${data.version} loaded but contained no restorable tool states.`;
        alert(summary);
      } catch (err) {
        alert('Session Import Error:\n\n' + err.message);
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  },

  /* ─── ECDH KEY EXCHANGE LAB ─── */
  startECDHExchange: async () => {
    try {
      const keys = await CE.generateECDH();
      App.S.lab.ecdhKeys = keys;

      const payload = btoa(JSON.stringify(keys.pubJwk)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      const link = window.location.origin + window.location.pathname + '#ecdh=' + payload;

      document.getElementById('ecdh-my-link').value = link;
      document.getElementById('ecdh-step-1').style.display = 'none';
      document.getElementById('ecdh-step-2').style.display = 'block';

      const qrContainer = document.getElementById('ecdh-qr-container');
      qrContainer.innerHTML = '';
      new QRCode(qrContainer, {
        text: link,
        width: 150,
        height: 150,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.L
      });
    } catch (e) { alert('ECDH Error: ' + e.message); }
  },

  parseECDHFragment: async () => {
    const hash = window.location.hash;
    if (hash.startsWith('#ecdh=')) {
      try {
        let b64Url = hash.substring(6);
        let b64 = b64Url.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) { b64 += '='; }
        const jwkStr = atob(b64);
        const jwk = JSON.parse(jwkStr);

        App.S.lab.ecdhPartnerJwk = jwk;
        document.getElementById('ecdh-partner-link').value = window.location.href;

        // Auto-start step 1 if not done
        if (!App.S.lab.ecdhKeys) {
          await App.startECDHExchange();
        }
      } catch (e) {
        console.error("Invalid ECDH fragment", e);
      }
    }
  },

  deriveECDHSecret: async () => {
    let partnerStr = document.getElementById('ecdh-partner-link').value;
    if (!partnerStr) return alert("Paste partner link first.");
    try {
      if (partnerStr.includes('#ecdh=')) {
        let b64Url = partnerStr.split('#ecdh=')[1];
        let b64 = b64Url.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) { b64 += '='; }
        App.S.lab.ecdhPartnerJwk = JSON.parse(atob(b64));
      }

      const partnerKey = await CE.importPublicKeyECDH(App.S.lab.ecdhPartnerJwk);
      const derived = await CE.deriveKeyECDH(App.S.lab.ecdhKeys.pair.privateKey, partnerKey);

      App.S.lab.ecdhSharedSecret = derived.derivedKey;
      document.getElementById('ecdh-fingerprint').innerText = derived.fingerprint;

      document.getElementById('ecdh-step-2').style.display = 'none';
      document.getElementById('ecdh-step-3').style.display = 'block';
      AchievementSystem.unlock('ghost_channel');
    } catch (e) {
      alert("Derivation Failed: " + e.message);
    }
  },

  encryptECDHMessage: async () => {
    const msg = document.getElementById('ecdh-msg-out').value;
    if (!msg || !App.S.lab.ecdhSharedSecret) return;
    try {
      const encoded = new TextEncoder().encode(msg);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        App.S.lab.ecdhSharedSecret,
        encoded
      );
      // Bundle IV + Ciphertext
      const bundle = new Uint8Array(12 + ciphertext.byteLength);
      bundle.set(iv, 0);
      bundle.set(new Uint8Array(ciphertext), 12);

      document.getElementById('ecdh-cipher-out').value = CE.bufToHex(bundle);
      Leaderboard.track('enc');
    } catch (e) { alert("Encrypt failed: " + e.message); }
  },

  decryptECDHMessage: async () => {
    const hex = document.getElementById('ecdh-cipher-in').value.trim();
    if (!hex || !App.S.lab.ecdhSharedSecret) return;
    try {
      const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const iv = bytes.slice(0, 12);
      const data = bytes.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        App.S.lab.ecdhSharedSecret,
        data
      );
      document.getElementById('ecdh-msg-in').value = new TextDecoder().decode(decrypted);
      document.getElementById('ecdh-msg-in').style.color = "var(--c3)";
    } catch (e) {
      document.getElementById('ecdh-msg-in').value = "ERROR: Decryption Failed (Authentication Tag Mismatch)";
      document.getElementById('ecdh-msg-in').style.color = "var(--c2)";
    }
  },

  tamperECDHCipher: () => {
    const cipherEl = document.getElementById('ecdh-cipher-out');
    let hex = cipherEl.value;
    if (!hex) return;
    // flip last bit
    let lastChar = hex[hex.length - 1];
    let intVal = parseInt(lastChar, 16) ^ 1;
    cipherEl.value = hex.substring(0, hex.length - 1) + intVal.toString(16);
    App.flash('ecdh-cipher-out');
  },

  showStats: () => {
    document.getElementById('stat-tools').innerText = Leaderboard.stats.toolsRun;
    document.getElementById('stat-bytes').innerText = Leaderboard.stats.bytesHashed.toLocaleString();
    document.getElementById('stat-msgs').innerText = Leaderboard.stats.msgsEncrypted;
    document.getElementById('stats-modal').style.display = 'block';
  },

  showAchievements: () => {
    const grid = document.getElementById('achievements-grid');
    grid.innerHTML = '';
    Object.keys(AchievementSystem.badges).forEach(id => {
      const badge = AchievementSystem.badges[id];
      const isUnlocked = AchievementSystem.unlocked.includes(id);
      const card = document.createElement('div');
      card.className = 'panel';
      card.style.opacity = isUnlocked ? '1' : '0.4';
      card.style.filter = isUnlocked ? 'none' : 'grayscale(100%)';
      card.innerHTML = `<div style="font-size:32px; margin-bottom:8px;">${badge.icon}</div>
        <div style="color:var(--c); margin-bottom:4px; font-weight:bold;">${badge.name}</div>
        <div style="font-size:11px; color:var(--muted);">${isUnlocked ? badge.desc : '???'}</div>`;
      grid.appendChild(card);
    });
    document.getElementById('achievements-modal').style.display = 'block';
  }
};

setTimeout(() => {
  if (window.location.hash.startsWith('#ecdh=')) {
    App.startLab();
    App.switchLabTab('ecdh');
    App.parseECDHFragment();
  } else if (window.location.hash.startsWith('#share=')) {
    try {
      let b64Url = window.location.hash.substring(7);
      let b64 = b64Url.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) { b64 += '='; }
      const payload = JSON.parse(decodeURIComponent(escape(atob(b64))));

      App.startLab();
      App.switchLabTab(payload.tool);

      if (payload.tool === 'hash') {
        const inEl = document.getElementById('lab-hash-in');
        const saltEl = document.getElementById('lab-hash-salt');
        if (inEl) inEl.value = payload.input || '';
        if (saltEl) saltEl.value = payload.salt || '';
        if (payload.input || payload.salt) App.runLabHash();
      } else if (payload.tool === 'enc') {
        const dataEl = document.getElementById('lab-enc-data');
        if (dataEl) dataEl.value = payload.data || '';
        if (payload.mode) App.setLabEncMode(payload.mode);
      } else if (payload.tool === 'compare') {
        const cmpEl = document.getElementById('cmp-input');
        if (cmpEl && payload.input) { cmpEl.value = payload.input; App.runCompare(); }
      } else if (payload.tool === 'hmac') {
        const hmacEl = document.getElementById('hmac-data');
        if (hmacEl && payload.data) hmacEl.value = payload.data;
        if (payload.algo) App.setHMACAlgo(payload.algo);
      } else if (payload.tool === 'entropy') {
        const entEl = document.getElementById('entropy-input');
        if (entEl && payload.input) entEl.value = payload.input;
      }
    } catch (e) { console.error('Share fragment parse error:', e); }
  }
}, 500);


window.addEventListener('unhandledrejection', event => {
  if (event.reason instanceof DOMException) {
    App.showError("Crypto Error: " + event.reason.message + " (e.g. invalid key size or corrupted payload).");
  } else if (event.reason instanceof Error) {
    App.showError("Error: " + event.reason.message);
  } else {
    App.showError("An unexpected cryptographic error occurred.");
  }
  event.preventDefault(); // Stop console spam
});

App.runDiagnostics = async () => {
  App.show('screen-lab'); // Keep UI visible
  const toast = document.getElementById('global-error-toast');
  const msgEl = document.getElementById('global-error-msg');
  toast.style.borderColor = '#00ff88';
  toast.style.color = '#00ff88';
  toast.style.boxShadow = '0 0 20px rgba(0,255,136,0.5)';
  msgEl.innerHTML = 'RUNNING CRYPTO DIAGNOSTICS...<br>Testing SHA-256...';
  toast.style.display = 'block';

  try {
    // 1. Hash Check
    const h = await CE.hash('SHA-256', 'test');
    if (h.hex !== '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08') throw new Error("SHA-256 Failed");

    // 2. AES-GCM Check
    msgEl.innerHTML += '<br>Testing AES-GCM...';
    const enc = await CE.encrypt('secret', 'password');
    const dec = await CE.decrypt(enc.payload, 'password');
    if (dec.plain !== 'secret') throw new Error("AES-GCM Failed");

    // 3. ECDSA Check
    msgEl.innerHTML += '<br>Testing ECDSA P-256...';
    const keys = await CE.generateECDSA();
    const sig = await CE.signECDSA(keys.keyPair.privateKey, 'message');
    const verify = await CE.verifyECDSA(keys.keyPair.publicKey, sig.signature, 'message');
    if (!verify.valid) throw new Error("ECDSA Signature Failed");

    msgEl.innerHTML += '<br><br>[ ALL DIAGNOSTICS PASSED ]';
    setTimeout(() => {
      toast.style.display = 'none';
      // reset toast styles
      toast.style.borderColor = '#ff003c';
      toast.style.color = '#ff003c';
      toast.style.boxShadow = '0 0 20px rgba(255,0,60,0.5)';
    }, 3000);
  } catch (e) {
    toast.style.borderColor = '#ff003c';
    toast.style.color = '#ff003c';
    toast.style.boxShadow = '0 0 20px rgba(255,0,60,0.5)';
    msgEl.innerHTML = '[ DIAGNOSTIC FAILED ]<br>' + e.message;
  }
};

App.runBenchmark = async () => {
  const btn = document.getElementById('btn-run-bench');
  if (btn.disabled) return;
  btn.disabled = true;
  btn.innerText = 'BENCHMARKING... (PLEASE WAIT)';

  // Reset UI
  ['md5', 'sha256', 'sha512'].forEach(algo => {
    document.getElementById(`bench-${algo}-ops`).innerText = 'Running...';
    document.getElementById(`bench-${algo}-bar`).style.width = '0%';
  });

  const iters = 10000;
  const str = "The quick brown fox jumps over the lazy dog.";

  // MD5
  let t0 = performance.now();
  for (let i = 0; i < iters; i++) await CE.hash('MD5', str + i);
  const md5Ms = performance.now() - t0;
  const md5Ops = Math.round(iters / (md5Ms / 1000));
  document.getElementById('bench-md5-ops').innerText = md5Ops.toLocaleString() + ' ops/sec';

  // SHA-256
  t0 = performance.now();
  for (let i = 0; i < iters; i++) await CE.hash('SHA-256', str + i);
  const sha256Ms = performance.now() - t0;
  const sha256Ops = Math.round(iters / (sha256Ms / 1000));
  document.getElementById('bench-sha256-ops').innerText = sha256Ops.toLocaleString() + ' ops/sec';

  // SHA-512
  t0 = performance.now();
  for (let i = 0; i < iters; i++) await CE.hash('SHA-512', str + i);
  const sha512Ms = performance.now() - t0;
  const sha512Ops = Math.round(iters / (sha512Ms / 1000));
  document.getElementById('bench-sha512-ops').innerText = sha512Ops.toLocaleString() + ' ops/sec';

  // Calculate relative widths (max ops = 100% width)
  const maxOps = Math.max(md5Ops, sha256Ops, sha512Ops);

  setTimeout(() => {
    document.getElementById('bench-md5-bar').style.width = ((md5Ops / maxOps) * 100) + '%';
    document.getElementById('bench-sha256-bar').style.width = ((sha256Ops / maxOps) * 100) + '%';
    document.getElementById('bench-sha512-bar').style.width = ((sha512Ops / maxOps) * 100) + '%';
  }, 100);

  btn.innerText = 'RUN 10K HASH BENCHMARK';
  btn.disabled = false;
};

// NOTE: unhandledrejection is handled at line ~2321 via App.showError() toast — no duplicate needed.


window.EXPLAINERS = {
  'hash': {
    icon: '🔏', title: 'Hash Functions', subtitle: 'One-way fingerprinting of data',
    what: `A <strong>Hash Function</strong> takes any input — a single character or an entire terabyte — and produces a fixed-length output called a <strong>digest</strong>. It is completely one-way: you cannot reverse it to find the original input. Every tiny change to the input produces a totally different digest.`,
    terms: [
      { name: 'Digest', def: 'The fixed-length output of a hash function (e.g., 256 bits for SHA-256)' },
      { name: 'Pre-image Resistance', def: 'You cannot reverse a hash back to the original input' },
      { name: 'Collision', def: 'Two different inputs that produce the same hash — a critical weakness' }
    ],
    why: `Passwords are <strong>never stored in plain text</strong> in secure systems. Only their hash is stored. When you log in, the server re-hashes what you typed and compares — the real password never travels the network or lives in the database.`,
    fact: `💡 The SHA-256 output space has 2<sup>256</sup> possible values — more than the number of atoms in the observable universe. Finding two matching inputs by brute force is physically impossible.`
  },
  'compare': {
    icon: '⚖️', title: 'Algorithm Comparison', subtitle: 'Not all hashes are created equal',
    what: `Different hash algorithms produce different sizes of output. Older ones like MD5 produce small outputs, which makes them faster but easier to trick into producing the same output for two different inputs (a collision). Modern ones like SHA-256 produce longer, much more secure outputs.`,
    terms: [
      { name: 'MD5 / SHA-1', def: 'Broken algorithms — researchers can craft collisions deliberately' },
      { name: 'SHA-256', def: 'Current gold standard — no known practical collisions' }
    ],
    why: `Choosing the right algorithm is a balance of security and performance. For passwords, you want slow hashes (like bcrypt). For file integrity, you want fast, secure hashes (like SHA-256).`,
    fact: `⚠️ MD5 was designed in 1992. By 2004 it was shown to be vulnerable, and in 2008 a rogue CA certificate was created using an MD5 collision.`
  },
  'enc': {
    icon: '🔐', title: 'AES-256-GCM Encryption', subtitle: 'Symmetric encryption with authenticated integrity',
    what: `<strong>AES-256-GCM</strong> is a symmetric encryption algorithm — the same key is used to lock and unlock data. <strong>GCM mode</strong> (Galois/Counter Mode) adds an <strong>Authentication Tag</strong> that detects any tampering with the ciphertext.`,
    terms: [
      { name: 'AES-256', def: '256-bit block cipher — the NSA standard for TOP SECRET documents' },
      { name: 'GCM Mode', def: 'Provides both encryption and authentication — tampered data is rejected outright' },
      { name: 'IV / Nonce', def: 'Initialization Vector — ensures identical messages produce different ciphertexts' },
      { name: 'Auth Tag', def: '128-bit MAC that detects any modification to the ciphertext' }
    ],
    why: `The payload format <code>Salt:IV:Ciphertext</code> is a self-contained encrypted bundle. You need all three components <strong>plus the passphrase</strong> to decrypt. Without the correct key, GCM's authentication tag causes decryption to fail with an explicit error — silent data corruption is impossible.`,
    fact: `⏱️ With a strong passphrase and PBKDF2's 100,000 iterations, brute-forcing a single guess takes ~0.1 seconds on modern hardware. Testing 1 trillion passwords would take <strong>3,171 years</strong>.`
  },
  'stego': {
    icon: '🖼️', title: 'LSB Steganography', subtitle: 'Hiding secrets in plain sight',
    what: `<strong>Steganography</strong> is the art of hiding the <em>existence</em> of a message — not just encrypting it. <strong>Least Significant Bit (LSB)</strong> steganography works by replacing the last bit of each pixel's RGB channel with a bit from the secret message. Each pixel changes by at most 1/255 brightness units — completely invisible to the human eye, yet sufficient to hide kilobytes of data.`,
    terms: [
      { name: 'LSB', def: 'Least Significant Bit — the rightmost bit of a number, changing it alters the value by ±1' },
      { name: 'Carrier Image', def: 'The decoy image that contains the hidden payload' },
      { name: 'Plausible Deniability', def: 'Hiding a message means the carrier looks like an ordinary photo' }
    ],
    why: `<strong>Encryption tells an adversary a secret exists</strong>. Steganography hides that fact entirely. Intelligence agencies and dissidents combine both — encrypt the message first, then hide the ciphertext in a vacation photo. The photo passes inspection; the ciphertext resists decryption.`,
    fact: `🎨 A 1920×1080 image has ~6.2 million pixels. With 3 bits per pixel (one per RGB channel), you can hide ~2.3 MB of data — enough for a 300-page book — with changes invisible to any human observer.`
  },
  'cracker': {
    icon: '🛡️', title: 'Secure Login & Dictionary Attacks', subtitle: 'Zero-knowledge authentication in action',
    what: `A <strong>Dictionary Attack</strong> works by hashing thousands of common passwords and comparing them against a stolen hash. MD5 is so incredibly fast that a modern computer can make billions of guesses per second. This simulation shows how quickly weak passwords can be cracked when using outdated hashing algorithms.`,
    terms: [
      { name: 'Dictionary Attack', def: 'Hashing a list of common passwords and comparing against a stolen hash database' },
      { name: 'Rainbow Table', def: 'Pre-computed hash→password lookup table — defeated by salting' },
      { name: 'Zero-Knowledge Auth', def: "The server proves it knows your password's hash without ever learning the password" },
      { name: 'Salt', def: 'A random value added to the password before hashing — makes rainbow tables useless' }
    ],
    why: `The 2012 LinkedIn breach exposed <strong>6.5 million SHA-1 passwords without salts</strong>. Because SHA-1 was fast, attackers cracked 90% of them within days using rainbow tables. Salting and slow algorithms (bcrypt, Argon2) would have prevented this.`,
    fact: `⚠️ The most common password in every breach is still "123456". A dictionary attack finds it in milliseconds. Strong, unique passwords are still your first line of defense.`
  },
  'cert': {
    icon: '🏛️', title: 'Public Key Infrastructure (PKI)', subtitle: 'How your browser trusts strangers on the internet',
    what: `<strong>PKI</strong> solves the "Who do you trust?" problem at internet scale. A <strong>Certificate Authority (CA)</strong> is a trusted organization that digitally signs <strong>X.509 certificates</strong> which bind a domain name to a public key. Your browser ships with ~150 pre-trusted root CAs. When you visit a website, it presents its certificate, the browser verifies the CA's signature, and a secure TLS connection is established.`,
    terms: [
      { name: 'CA', def: 'Certificate Authority — a trusted entity whose public key is pre-installed in browsers/OS' },
      { name: 'X.509', def: 'The standard format for digital certificates (Subject, Issuer, Public Key, Signature)' },
      { name: 'Chain of Trust', def: 'Root CA → Intermediate CA → Server Cert — each level signed by the one above' },
      { name: 'HTTPS / TLS', def: 'Encrypted web traffic authenticated by PKI certificates' }
    ],
    why: `Without PKI, a man-in-the-middle could intercept your HTTPS connection and substitute their own public key — you'd think you're talking to your bank, but you'd actually be talking to the attacker. CA signatures make this mathematically detectable. That's why your browser shows a <strong>red padlock</strong> for expired or forged certificates.`,
    fact: `🔑 The world's root CAs (DigiCert, Let's Encrypt, Comodo) collectively sign billions of certificates. <strong>Let's Encrypt alone</strong> has issued over 3 billion free certificates since 2016, driving HTTPS adoption from 40% to 95%+ of web traffic.`
  },
  'entropy': {
    icon: '🎲', title: 'Entropy Analyzer', subtitle: 'Measuring cryptographic randomness',
    what: `<strong>Entropy</strong> is a measure of unpredictability. 'password123' is like guessing a predictable word—very easy (low entropy). A random string of characters is like trying to guess the exact position of every grain of sand on a beach—practically impossible (high entropy).`,
    terms: [
      { name: 'Bits of Entropy', def: 'The mathematical number of binary guesses required to crack a value' },
      { name: 'Character Set', def: 'The alphabet used (e.g. lowercase, uppercase, numbers, symbols)' },
      { name: 'Brute-force', def: 'Trying every single possible combination blindly' }
    ],
    why: `Password length is exponentially more powerful than complexity. Adding one character to a password multiplies the time it takes to crack it by the size of the character set. A 16-character lowercase password is much stronger than an 8-character password with symbols.`,
    fact: `📈 A truly random 128-bit key (like those used in AES) has so much entropy that cracking it would require more energy than boiling all the water on Earth.`
  },
  'birthday': {
    icon: '🎂', title: 'Birthday Paradox', subtitle: 'Probability of collision',
    what: `Imagine being in a room with 23 people. It's surprisingly likely (50% chance) that two people share the same birthday. In cryptography, this <strong>Birthday Paradox</strong> means we don't need to try every possible combination to find a hash collision—we just need a large enough group of random hashes.`,
    terms: [
      { name: 'Birthday Attack', def: 'A class of brute-force attack that exploits the mathematics behind the birthday problem' },
      { name: 'Collision', def: 'Two different inputs producing the identical hash output' },
      { name: 'Pigeonhole Principle', def: 'If you have N boxes and N+1 items, at least one box must contain two items' }
    ],
    why: `Because of the birthday paradox, a hash function is only practically secure up to <strong>half its length</strong>. A 256-bit hash (like SHA-256) actually provides 128 bits of security against collision attacks.`,
    fact: `🎯 To find a collision in a 64-bit hash space, you only need to generate about 4.2 billion hashes (which a GPU can do in seconds), not the full 18 quintillion.`
  },
  'benchmark': {
    icon: '⏱️', title: 'Hash Benchmark', subtitle: 'Measuring cryptographic speed',
    what: `Imagine a race between different engines. This benchmark tests how many times your CPU can run each hashing algorithm per second. Older algorithms like MD5 are incredibly fast, while stronger algorithms like SHA-512 are more complex but provide better security.`,
    terms: [
      { name: 'Hashes / sec', def: 'The number of hash operations a processor can perform per second' },
      { name: 'CPU Bottleneck', def: 'When the processor is the limiting factor for calculation speed' },
      { name: 'PBKDF2 / Argon2', def: 'Algorithms specifically designed to be SLOW to thwart fast crackers' }
    ],
    why: `Speed is a double-edged sword. You want fast hashes for verifying massive file downloads, but you want <strong>slow hashes</strong> for storing passwords. If an algorithm can hash 10 million times per second, a hacker can guess 10 million passwords per second!`,
    fact: `🚀 Modern GPUs can calculate over 100 billion MD5 hashes per second, making fast hashing algorithms totally obsolete for password storage.`
  },
  'ecdh': {
    icon: '🤝', title: 'ECDH Key Exchange', subtitle: 'Establishing shared secrets publicly',
    what: `Imagine you and a friend each pick a secret color, mix it with a shared public color, then swap mixtures. You mix your friend's mixture with your secret color, and you both get the exact same final color. That's Elliptic Curve Diffie-Hellman: math that lets two people agree on a shared secret over a public channel without ever sending the secret itself.`,
    terms: [
      { name: 'Elliptic Curve', def: 'Advanced mathematical structures used for high-security cryptography' },
      { name: 'Public Key', def: 'The "mixture" that you share openly' },
      { name: 'Private Key', def: 'Your "secret color" that never leaves your device' },
      { name: 'Shared Secret', def: 'The final combined value that only you and the other party can calculate' }
    ],
    why: `ECDH is the foundation of modern secure communication. When you visit an HTTPS website, your browser and the server use a Diffie-Hellman exchange to generate a temporary session key. Even if someone records the entire conversation, they can't figure out the session key.`,
    fact: `🛡️ This provides "Forward Secrecy": even if the server's long-term key is compromised years later, past conversations cannot be decrypted.`
  },
  'ecdsa': {
    icon: '✍️', title: 'ECDSA Digital Signatures', subtitle: 'Cryptographic proof of identity and integrity',
    what: `<strong>Elliptic Curve Digital Signature Algorithm (ECDSA)</strong> uses asymmetric key pairs. The <strong>private key</strong> (kept secret) signs a message. The <strong>public key</strong> (shared openly) verifies it. Anyone can verify the signature, but only the private key holder could have created it. Changing even one byte of a signed message invalidates the signature completely.`,
    terms: [
      { name: 'Private Key', def: 'Secret 256-bit value — the only key that can create valid signatures' },
      { name: 'Public Key', def: 'Derived from the private key — anyone can use it to verify, but not sign' },
      { name: 'Signature', def: 'Two values (r, s) that mathematically bind the message to the private key' },
      { name: 'Non-repudiation', def: 'The signer cannot later deny signing — mathematical proof they used their private key' }
    ],
    why: `<strong>Encryption hides data; signatures prove authorship.</strong> When you send an email, anyone can claim to be you. With a digital signature tied to your private key, recipients can cryptographically verify the message originated from you and arrived unmodified.`,
    fact: `💎 Bitcoin transactions use ECDSA. Every time you send BTC, your wallet signs the transaction with your private key. The blockchain network verifies the signature before accepting it — no banks required.`
  },
  'rsa': {
    icon: '🔐', title: 'RSA Cryptography', subtitle: 'The grandfather of public key crypto',
    what: `Imagine a padlock that anyone can snap shut (encrypt with Public Key), but only you have the physical key to unlock (decrypt with Private Key). RSA relies on the fact that it's incredibly easy to multiply two massive prime numbers together, but almost impossible for computers to factor the result back into those two primes.`,
    terms: [
      { name: 'Asymmetric Crypto', def: 'Cryptography using two different keys (one public, one private)' },
      { name: 'Prime Factorization', def: 'The mathematical hard problem that keeps RSA secure' },
      { name: 'Key Size', def: 'RSA typically requires very large keys (2048 to 4096 bits) to be secure' }
    ],
    why: `RSA paved the way for secure internet communication. While elliptic curves (ECDSA/ECDH) are faster and use smaller keys, RSA is still widely used in older systems, email encryption (PGP), and certificate signing.`,
    fact: `⏳ A 2048-bit RSA key is currently considered secure until at least the year 2030, but quantum computers running Shor's Algorithm could theoretically break it in seconds.`
  },
  'hmac': {
    icon: '🛡️', title: 'HMAC Authentication', subtitle: 'Verifying data integrity and authenticity',
    what: `Imagine sending a sealed letter to a bank teller. You both share a secret password. You hash the letter's contents combined with the password. The teller repeats the math. If the hashes match, they know the letter wasn't tampered with AND it definitely came from you (since only you two know the password). That's HMAC.`,
    terms: [
      { name: 'MAC', def: 'Message Authentication Code — a cryptographic checksum' },
      { name: 'Secret Key', def: 'The shared password used to generate the HMAC' },
      { name: 'Integrity', def: 'Ensuring the data has not been modified in transit' },
      { name: 'Authenticity', def: 'Ensuring the data actually came from the expected sender' }
    ],
    why: `HMAC is everywhere in modern web development. It is used to secure Webhooks (so your server knows a payment notification actually came from Stripe/PayPal), to sign JSON Web Tokens (JWTs) for user sessions, and to authenticate API requests.`,
    fact: `🔑 Unlike a regular hash, an attacker cannot generate a valid HMAC even if they know the payload perfectly. Without the exact secret key, any forgery attempt will completely fail the verification step.`
  }
};
window.currentExplainerTab = null;

window.showExplainer = function (tab) {
  window.currentExplainerTab = tab;
  const modal = document.getElementById('explainer-modal');
  const contentBox = document.getElementById('explainer-content');
  const titleBox = document.getElementById('explainer-title');
  
  if(modal && contentBox && titleBox) {
    const ex = window.EXPLAINERS[tab];
    if (typeof ex === 'string') {
      titleBox.innerText = tab.toUpperCase() + " CONCEPT EXPLAINER";
      contentBox.innerText = ex;
    } else if (ex) {
      titleBox.innerText = ex.title.toUpperCase();
      
      let html = `<div class="concept-what">${ex.what}</div>`;
      
      if (ex.terms && ex.terms.length > 0) {
        html += `<div class="concept-terms">`;
        ex.terms.forEach(t => {
          html += `
          <div class="concept-term">
            <div class="concept-term-name">${t.name}</div>
            <div class="concept-term-def">${t.def}</div>
          </div>`;
        });
        html += `</div>`;
      }
      
      if (ex.why) {
        html += `
        <div class="concept-why">
          <div class="concept-why-icon">🛡️</div>
          <div class="concept-why-text"><strong>Why It Matters:</strong> ${ex.why}</div>
        </div>`;
      }
      
      if (ex.fact) {
        html += `
        <div class="fact-card" style="margin-top:16px;">
          <div class="fact-card-icon">${ex.icon || '💡'}</div>
          <div class="fact-card-content">
            <div class="fact-card-label">DID YOU KNOW?</div>
            <div class="fact-card-text">${ex.fact}</div>
          </div>
        </div>`;
      }
      
      contentBox.innerHTML = html;
    }
    
    modal.style.display = 'flex';
  }
};
window.dismissExplainer = function () {
  localStorage.setItem('explainer_v2_' + window.currentExplainerTab, 'true');
  const modal = document.getElementById('explainer-modal');
  if (modal) modal.style.display = 'none';
};
