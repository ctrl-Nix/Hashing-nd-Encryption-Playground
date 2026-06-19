/* ══════════════════════════════════════════════════════════════════
   STORY MODE v2 — High-experience learning overlays
   Loads after app.js and overrides story rendering functions
══════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────
   OVERRIDE showNextBtn — fix step 8 = quiz, not "mission accomplished"
───────────────────────────────────────────────────────────────── */

const CHALLENGES = {
  0: { q: "What is the exact length (in characters) of a SHA-256 hash? (Hint: Type 64)", a: ["64"] },
  1: { q: "If you change one character of the input, does the hash change completely? (Yes/No) (Hint: Yes)", a: ["yes", "y"] },
  2: { q: "What extra component does HMAC use to sign data that a normal hash doesn't have? (Hint: key)", a: ["key", "secret key", "secret"] },
  3: { q: "What type of attack tests every possible word in a list to guess a password? (Hint: dictionary)", a: ["dictionary", "dictionary attack"] },
  4: { q: "In symmetric encryption (like AES), do you use the same key for both encryption and decryption? (Yes/No) (Hint: Yes)", a: ["yes", "y"] },
  5: { q: "In LSB Steganography, what does LSB stand for? (Hint: least significant bit)", a: ["least significant bit"] },
  6: { q: "If Alice signs a message with her Private Key, what key does Bob use to verify it? (Hint: public key)", a: ["public", "public key", "alice's public key"] },
  7: { q: "Who signs a digital certificate to prove a server's identity and form a trust chain? (Hint: Certificate Authority)", a: ["certificate authority", "ca"] }
};

window.checkMiniChallenge = function(idx) {
  const input = document.getElementById('challenge-input-' + idx);
  const val = input.value.trim().toLowerCase();
  const challenge = CHALLENGES[idx];
  const isValid = challenge.a.some(ans => val === ans);
  
  const res = document.getElementById('challenge-result-' + idx);
  if (isValid) {
    if (App.S.story.maxStep < idx + 1) App.S.story.maxStep = idx + 1;
    App.renderStoryMap();
    if (window.setDaisyState) window.setDaisyState('celebrate');
    res.innerHTML = '<span style="color:var(--c3, #00ff88);">[✓] ACCESS GRANTED</span>';
    
    setTimeout(() => {
      if (idx === 3) {
        App.runStoryBreachCutscene();
      } else if (idx === 7) {
        App.jumpToStory(8);
      } else {
        App.jumpToStory(idx + 1);
      }
    }, 1000);
  } else {
    if (window.setDaisyState) window.setDaisyState('shock');
    res.innerHTML = '<span style="color:var(--c2, #ff003c);">[X] INCORRECT. REVIEW MODULE.</span>';
    input.value = '';
    input.focus();
  }
};

App.showNextBtn = (nextIdx) => {
  App.renderStoryMap();
  const zone = document.getElementById('story-next-zone');
  zone.innerHTML = '';
  zone.style.cssText = 'margin-top:28px;border-top:1px solid var(--border);padding-top:24px;';

  const currentIdx = nextIdx - 1;

  if (nextIdx > 8) {
    // Mark story as fully completed in localStorage
    localStorage.setItem('nix_story_completed', 'true');
    if (App.S.story.maxStep < 9) { App.S.story.maxStep = 9; localStorage.setItem('nix_story_max', '9'); }

    // Show fullscreen congratulations overlay
    const existing = document.getElementById('story-congrats-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'story-congrats-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:5000;background:rgba(0,0,0,0.92);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px;animation:fadeInOverlay 0.5s ease;';

    if (!document.getElementById('congrats-style')) {
      const s = document.createElement('style');
      s.id = 'congrats-style';
      s.textContent = `
        @keyframes fadeInOverlay{from{opacity:0}to{opacity:1}}
        @keyframes pulseGlow{0%,100%{text-shadow:0 0 20px rgba(0,245,255,0.6)}50%{text-shadow:0 0 60px rgba(0,245,255,1),0 0 100px rgba(0,245,255,0.4)}}
        @keyframes floatUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}
        .congrats-title{font-family:var(--font-display);font-size:clamp(28px,6vw,72px);color:var(--c);letter-spacing:4px;animation:pulseGlow 2s ease infinite,floatUp 0.7s ease;}
        .congrats-sub{font-family:var(--font-mono);font-size:14px;color:var(--muted);letter-spacing:2px;margin:16px 0 32px;animation:floatUp 0.9s ease;}
        .congrats-badges{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:32px;animation:floatUp 1.1s ease;}
        .congrats-badge{font-size:32px;filter:drop-shadow(0 0 8px rgba(0,245,255,0.5));}
      `;
      document.head.appendChild(s);
    }

    overlay.innerHTML = `
      <div class="congrats-title">MISSION COMPLETE</div>
      <div class="congrats-sub">// MATRIX PROTOCOL — ALL 9 CHAPTERS CLEARED — CLEARANCE LEVEL: MAXIMUM</div>
      <div class="congrats-badges">
        <span class="congrats-badge">🏆</span>
        <span class="congrats-badge">🔐</span>
        <span class="congrats-badge">🌐</span>
        <span class="congrats-badge">⚡</span>
        <span class="congrats-badge">🥷</span>
      </div>
      <div style="font-family:var(--font-mono);font-size:12px;color:var(--muted);max-width:500px;line-height:2;margin-bottom:32px;border:1px solid rgba(0,245,255,0.1);padding:20px;">
        You've mastered hashing, symmetric &amp; asymmetric encryption, digital signatures,<br>
        steganography, PKI trust chains, and end-to-end key exchange.<br>
        <span style="color:var(--c3);margin-top:8px;display:block;">[ OPERATIVE STATUS: FIELD READY ]</span>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">
        <button class="btn btn-primary" style="font-size:14px;padding:14px 28px;" onclick="document.getElementById('story-congrats-overlay').remove(); App.goHome();">↩ RETURN TO BASE</button>
        <button class="btn" style="font-size:14px;padding:14px 28px;" onclick="document.getElementById('story-congrats-overlay').remove(); App.showAchievements();">🏆 VIEW ACHIEVEMENTS</button>
      </div>
    `;
    document.body.appendChild(overlay);

    // Also show in the zone
    zone.innerHTML = `
      <div class="mission-complete" style="margin-bottom:16px;">
        <div class="mc-badge">🏆</div>
        <div class="mc-text">
          <div class="mc-text-title">MISSION ACCOMPLISHED</div>
          <div class="mc-text-sub">Matrix Protocol secured. You are cleared for field operations.</div>
        </div>
      </div>
      <button class="btn btn-success btn-full" onclick="App.goHome()">↩ RETURN TO BASE</button>`;

  } else {
    const challenge = CHALLENGES[currentIdx];
    
    // If user already passed this step, just show the proceed button
    if (App.S.story.maxStep >= nextIdx) {
      if (currentIdx === 3) {
        zone.innerHTML = `<button class="btn btn-primary btn-full" onclick="App.runStoryBreachCutscene()">▶ PROCEED TO NEXT PHASE</button>`;
      } else if (currentIdx === 7) {
        zone.innerHTML = `<button class="btn btn-success btn-full" onclick="App.jumpToStory(8)">📋 PROCEED TO FINAL ASSESSMENT</button>`;
      } else {
        zone.innerHTML = `<button class="btn btn-primary btn-full" onclick="App.jumpToStory(${nextIdx})">▶ PROCEED TO NEXT PHASE</button>`;
      }
    } else {
      // Require challenge
      zone.innerHTML = `
        <div style="background:rgba(0,0,0,0.4); border:1px solid var(--c); padding:16px; margin-bottom:16px;">
          <div style="color:var(--c); font-family:var(--font-display); letter-spacing:1px; margin-bottom:8px;">SECURITY CLEARANCE REQUIRED</div>
          <p style="font-size:12px; margin-bottom:12px; color:var(--text);">${challenge.q}</p>
          <div style="display:flex; gap:8px;">
            <input type="text" id="challenge-input-${currentIdx}" class="form-input" style="flex:1;" placeholder="Enter answer..." onkeydown="if(event.key==='Enter') window.checkMiniChallenge(${currentIdx})">
            <button class="btn btn-primary" onclick="window.checkMiniChallenge(${currentIdx})">VERIFY</button>
          </div>
          <div id="challenge-result-${currentIdx}" style="margin-top:8px; font-size:12px;"></div>
        </div>
      `;
    }
  }
  setTimeout(() => zone.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
};


function copyText(text, btn) {
  if (!text) return;
  navigator.clipboard.writeText(text).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy');
    document.body.removeChild(ta);
  });
  if (btn) {
    const prev = btn.innerHTML;
    btn.innerHTML = '<span style="font-size:12px;">✓</span> COPIED';
    btn.classList.add('copied');
    setTimeout(() => { btn.innerHTML = prev; btn.classList.remove('copied'); }, 2000);
  }
}

/** Build a copy button HTML string */
function copyBtnHTML(dataId, label = 'COPY') {
  return `<button class="copy-btn" aria-label="Copy to clipboard" onclick="SMv2.copy('${dataId}',this)" title="Copy to clipboard">
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="5" y="5" width="9" height="10" rx="1"/><path d="M11 5V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2"/>
    </svg>
    ${label}
  </button>`;
}

/** Render a readout block with header label + copy button */
function readoutHTML(id, label, value, colorClass = 'readout-cyan', extraStyle = '') {
  return `
    <div class="readout-wrap reveal-in">
      <div class="readout-header">
        <span class="readout-label">${label}</span>
        ${copyBtnHTML(id)}
      </div>
      <div class="readout ${colorClass}" id="${id}" style="font-size:11px;word-break:break-all;${extraStyle}">${value}</div>
    </div>`;
}

/** Build the mission progress bar HTML */
function renderProgressBar(currentStep, maxStep) {
  const titles = [
    'Hashing','Avalanche','Auth','Breach',
    'Encryption','Steganography','Signatures','PKI','Assessment'
  ];
  let html = '<div class="mission-progress-bar">';
  titles.forEach((t, i) => {
    const cls = i < currentStep ? 'done' : i === currentStep ? 'active' : '';
    const clickable = i <= maxStep ? `onclick="App.jumpToStory(${i})" style="cursor:pointer;"` : '';
    html += `
      <div class="mpb-step ${cls}" ${clickable}>
        <div class="mpb-node">${i < currentStep ? '✓' : (i + 1)}</div>
        <div class="mpb-tooltip">${t}</div>
      </div>`;
    if (i < titles.length - 1) {
      html += `<div class="mpb-line"></div>`;
    }
  });
  html += '</div>';
  return html;
}

/** Build the concept brief collapsible panel */
function renderConceptBrief(stepIdx, autoOpen = false) {
  const d = (typeof StoryExplain !== 'undefined') ? StoryExplain[stepIdx] : null;
  if (!d) return '';

  const termsHTML = (d.terms || []).map(t => `
    <div class="concept-term">
      <div class="concept-term-name">${t.name}</div>
      <div class="concept-term-def">${t.def}</div>
    </div>`).join('');

  const openClass = autoOpen ? ' open' : '';

  return `
    <div class="concept-brief${openClass}" id="concept-brief-${stepIdx}">
      <div class="concept-brief-header" onclick="SMv2.toggleBrief(${stepIdx})">
        <div class="cbh-left">
          <div class="cbh-icon">${d.icon || '📖'}</div>
          <div>
            <div class="cbh-title">CONCEPT BRIEF — ${d.title}</div>
            <div class="cbh-sub">${d.subtitle || ''}</div>
          </div>
        </div>
        <div class="cbh-toggle">
          <span>${autoOpen ? 'COLLAPSE' : 'EXPAND'}</span>
          <span class="cbh-toggle-arrow">▶</span>
        </div>
      </div>
      <div class="concept-brief-body">
        <div class="concept-brief-inner">
          <div class="concept-what">${d.what || ''}</div>
          ${termsHTML ? `<div class="concept-terms">${termsHTML}</div>` : ''}
          ${d.why ? `
            <div class="concept-why">
              <div class="concept-why-icon">🎯</div>
              <div class="concept-why-text">${d.why}</div>
            </div>` : ''}
          ${d.fact ? `
            <div class="fact-card">
              <div class="fact-card-icon">💡</div>
              <div class="fact-card-content">
                <div class="fact-card-label">DID YOU KNOW?</div>
                <div class="fact-card-text">${d.fact}</div>
              </div>
            </div>` : ''}
        </div>
      </div>
    </div>`;
}

/** Hint box */
function hintHTML(text) {
  return `<div class="hint-box"><div class="hint-box-icon">💡</div><div class="hint-box-text">${text}</div></div>`;
}

/** Phase label */
function phaseLabel(text, variant = '') {
  return `<div class="phase-label${variant ? ' ' + variant : ''}">${text}</div>`;
}

/** Mission complete banner */
function missionCompleteHTML(subtext) {
  return `
    <div class="mission-complete">
      <div class="mc-badge">✓</div>
      <div class="mc-text">
        <div class="mc-text-title">MODULE COMPLETE</div>
        <div class="mc-text-sub">${subtext || 'Objective achieved. Proceed to next phase.'}</div>
      </div>
    </div>`;
}

/* ─────────────────────────────────────────────────────────────────
   OVERRIDE renderStory
───────────────────────────────────────────────────────────────── */

App.renderStory = () => {
  App.show('screen-story-main');
  App.renderStoryMap();

  const step = App.S.story.step;
  const data = StoryData.missions[step];

  document.getElementById('story-module-name').innerText = data.module;
  document.getElementById('story-panel-title').innerText = data.title;

  const dBox = document.getElementById('story-dialogue');
  const aBox = document.getElementById('story-action-zone');
  document.getElementById('story-next-zone').innerHTML = '';

  // Dialogue
  dBox.className = `dialogue dlg-${data.dialogue.toLowerCase()}`;
  const txt = typeof data.text === 'function' ? data.text(App.S.alias) : data.text;
  dBox.innerHTML = `<div class="dlg-badge">${data.dialogue}</div><div class="dlg-text">${txt}</div>`;

  // Progress Bar + Concept Brief prefix for all steps
  const progressHTML = renderProgressBar(step, App.S.story.maxStep);
  const conceptHTML  = renderConceptBrief(step, false);
  const prefix = progressHTML + conceptHTML;

  /* ── STEP 0: HASH FUNCTIONS ──────────────────────────────────── */
  if (step === 0) {
    aBox.innerHTML = prefix + `
      ${phaseLabel('◈ STEP 1 — SELECT HASH PROTOCOL')}
      <div class="algo-grid" id="story-algo-grid">

        <div class="algo-card algo-unsafe" onclick="App.selectStoryAlgo(this,'MD5')">
          <div class="algo-dot"></div>
          <div class="algo-info">
            <div class="algo-name">MD5</div>
            <div class="algo-tag tag-danger">⚠ NOT SAFE — Collision attacks exist</div>
          </div>
        </div>

        <div class="algo-card algo-warn" onclick="App.selectStoryAlgo(this,'SHA-1')">
          <div class="algo-dot"></div>
          <div class="algo-info">
            <div class="algo-name">SHA-1</div>
            <div class="algo-tag tag-warn">⚠ DEPRECATED — Broken since 2017</div>
          </div>
        </div>

        <div class="algo-card selected" onclick="App.selectStoryAlgo(this,'SHA-256')">
          <div class="algo-dot"></div>
          <div class="algo-info">
            <div class="algo-name">SHA-256</div>
            <div class="algo-tag tag-safe">✓ SECURE — Industry standard</div>
          </div>
        </div>

        <div class="algo-card" onclick="App.selectStoryAlgo(this,'SHA-512')">
          <div class="algo-dot"></div>
          <div class="algo-info">
            <div class="algo-name">SHA-512</div>
            <div class="algo-tag tag-safe">✓ SECURE — Maximum strength</div>
          </div>
        </div>

      </div>

      ${phaseLabel('◈ STEP 2 — SET CONTROL NODE PASSWORD')}
      ${hintHTML('Try <strong>MD5</strong> or <strong>SHA-1</strong> first to see how a broken algorithm still produces a hash — then switch to <strong>SHA-256</strong> or <strong>SHA-512</strong> for real security.')}
      <input type="text" class="form-input" id="s-hash-in" placeholder="e.g. ProtocolBeta99" onkeydown="if(event.key==='Enter') App.runStoryHash()">
      <div class="btn-group" style="margin-top:12px;">
        <button class="btn btn-primary" onclick="App.runStoryHash()">GENERATE FINGERPRINT</button>
      </div>
      <div id="s-hash-res" style="margin-top:20px;"></div>
    `;
    App.S.story.algo = 'SHA-256';
  }

  /* ── STEP 1: AVALANCHE EFFECT ─────────────────────────────────── */
  else if (step === 1) {
    aBox.innerHTML = prefix + `
      ${phaseLabel('⬡ OBSERVE THE AVALANCHE EFFECT')}
      ${hintHTML('The top password is locked (your hash from Step 1). Type a <strong>slight variation</strong> below — even changing one character — and watch how many output bits flip.')}
      <span class="form-label">Original Password (Locked)</span>
      <input class="form-input" disabled value="${App.S.story.pwd}" style="opacity:0.4;margin-bottom:4px;">
      <span class="form-label">Modified Password</span>
      <input class="form-input" id="s-av-in" placeholder="Change one character..." oninput="App.runStoryAvalanche()">
      <div class="bit-grid-label" style="margin-top:14px;">BIT COMPARISON — Original (left) vs Modified (right)</div>
      <div class="bit-grid" id="s-av-grid" style="margin-top:4px;"></div>
      <div id="s-av-res" style="font-family:var(--font-mono);font-size:12px;color:var(--muted);margin-top:10px;"></div>
    `;
    App.runStoryAvalanche(true);
  }

  /* ── STEP 2: DICTIONARY ATTACK ─────────────────────────────────── */
  else if (step === 2) {
    aBox.innerHTML = prefix + `
      ${phaseLabel('⬡ DICTIONARY ATTACK SIMULATOR', 'phase-warn')}
      ${hintHTML('Watch the attacker hash common passwords one by one. The attack <strong>only succeeds</strong> if your password was in their list — this is why password uniqueness matters.')}
      <div class="btn-group">
        <button class="btn btn-danger" onclick="App.runStoryBruteForce()" id="btn-brute">⚡ INITIALIZE DICTIONARY ATTACK</button>
      </div>
      <div class="term" id="brute-term" style="display:none;margin-top:16px;"></div>
      <div id="s-log-res" style="display:none;margin-top:20px;">
        <span class="form-label">Final Comparator — <span class="status-tag st-ok">MATCH</span> vs <span class="status-tag st-err">MISMATCH</span></span>
        <div class="readout-wrap reveal-in" style="margin-top:8px;">
          <div class="readout-header">
            <span class="readout-label">Database Hash (Stored)</span>
            ${copyBtnHTML('s-log-db')}
          </div>
          <div class="hash-compare readout readout-cyan" id="s-log-db"></div>
        </div>
        <div class="readout-wrap reveal-in" style="margin-top:8px;">
          <div class="readout-header">
            <span class="readout-label">Input Hash (Computed)</span>
            ${copyBtnHTML('s-log-typed')}
          </div>
          <div class="hash-compare readout readout-green" id="s-log-typed"></div>
        </div>
        <div id="s-log-msg" style="margin-top:14px;font-family:var(--font-mono);font-size:12px;"></div>
      </div>
    `;
  }

  /* ── STEP 3: BREACH ────────────────────────────────────────────── */
  else if (step === 3) {
    aBox.innerHTML = prefix + `
      ${phaseLabel('⬡ NETWORK INTRUSION DETECTED', 'phase-warn')}
      ${hintHTML('This simulates a <strong>real-world exploit chain</strong> — vulnerability scan → CVE identification → payload injection. This is why encryption at rest matters even after authentication.')}
      <div class="btn-group">
        <button class="btn btn-danger" onclick="App.runStoryBruteForce()" id="btn-breach-start">[ INITIATE PERIMETER SCAN ]</button>
      </div>
      <div class="term" id="s-breach-term" style="display:none;margin-top:16px;"></div>
    `;
  }

  /* ── STEP 4: AES-GCM ENCRYPTION ───────────────────────────────── */
  else if (step === 4) {
    aBox.innerHTML = prefix + `
      <div style="display:flex;gap:8px;margin-bottom:24px;">
        <button class="btn btn-primary" id="s-mode-enc" onclick="App.setStoryEncMode('enc')" style="flex:1;">🔒 ENCRYPT</button>
        <button class="btn" id="id-mode-dec" onclick="App.setStoryEncMode('dec')" style="flex:1;">🔓 DECRYPT</button>
      </div>
      <div id="s-enc-panel">
        ${phaseLabel('⬡ CLIENT ENCRYPTION PHASE', 'phase-ok')}
        <div class="hint-box" style="margin-bottom:14px;">
          <div class="hint-box-icon">🔑</div>
          <div class="hint-box-text">The payload <strong>LOCKDOWN_PROTOCOL_ALPHA</strong> must be encrypted before transit. Create a passphrase — it will be stretched through <strong>PBKDF2 (100,000 iterations)</strong> into a 256-bit AES key.</div>
        </div>
        <span class="form-label">Plaintext Payload (Locked)</span>
        <input class="form-input" value="LOCKDOWN_PROTOCOL_ALPHA" disabled style="opacity:0.5;margin-bottom:8px;">
        <span class="form-label">Encryption Passphrase</span>
        <input type="password" class="form-input" id="s-enc-in" placeholder="Create a strong passphrase...">
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
          <button class="btn btn-primary" id="s-enc-btn" onclick="App.runStoryEncrypt()" style="flex:1;">STRETCH KEY & ENCRYPT</button>
          <button class="btn" onclick="App.retryStoryEncrypt()">↺ RETRY</button>
        </div>
        <div id="s-enc-res" style="margin-top:20px;"></div>
      </div>
      <div id="s-dec-panel" style="display:none;">
        ${phaseLabel('⬡ STANDALONE DECRYPTION', 'phase-ok')}
        <div class="hint-box" style="margin-bottom:14px;">
          <div class="hint-box-icon">📋</div>
          <div class="hint-box-text">Paste any <strong>Salt:IV:Ciphertext</strong> payload (from the encryption step or the Pro Sandbox) and its passphrase to decrypt it here.</div>
        </div>
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

  /* ── STEP 5: STEGANOGRAPHY ─────────────────────────────────────── */
  else if (step === 5) {
    aBox.innerHTML = prefix + `
      <div id="stego-story-zone" class="panel" style="padding:24px;background:rgba(0,0,0,0.4);border-style:dashed;">
        ${phaseLabel('⬡ LSB STEGANOGRAPHY — COVERT EXFILTRATION')}
        ${hintHTML('Upload any image as the <strong>carrier</strong>. The encrypted ciphertext will be hidden in the least-significant bits of each pixel — <strong>completely invisible</strong> to the human eye.')}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:16px;">
          <div>
            <span class="form-label">Carrier Image</span>
            <div id="stego-story-drop" class="drop-zone" style="min-height:100px;">
              <div class="drop-text" style="font-size:12px;">DRAG & DROP DECOY IMAGE</div>
            </div>
            <canvas id="stego-story-canvas" style="display:none;max-width:100%;margin-top:12px;border:1px solid var(--c);" aria-hidden="true"></canvas>
          </div>
          <div>
            <span class="form-label">Encrypted Payload (Hidden in Pixels)</span>
            <textarea id="stego-story-data" class="form-input" style="font-size:11px;height:80px;" disabled>0fe721:bc892a:f821de77bc21009822a1f8...</textarea>
            <button class="btn btn-primary btn-full" style="margin-top:12px;" onclick="App.runStoryStego()">ENCODE & EXFILTRATE</button>
          </div>
        </div>
        <div id="stego-story-res" style="display:none;margin-top:20px;text-align:center;">
          <div class="status-tag st-ok">DATA SUCCESSFULLY HIDDEN IN PIXELS</div>
          <p style="font-size:11px;color:var(--muted);margin-top:8px;">The carrier image has been modified. To any network monitor, it looks like a standard image upload. The hidden ciphertext is invisible without a steganalysis tool.</p>
          ${missionCompleteHTML('Covert exfiltration channel established. Image ready for transmission.')}
        </div>
      </div>
    `;
    App.setupStoryStegoDrop();
  }

  /* ── STEP 6: ECDSA SIGNATURES ──────────────────────────────────── */
  else if (step === 6) {
    aBox.innerHTML = prefix + `
      <div class="panel" style="padding:20px;background:rgba(0,0,0,0.3);border:1px dashed var(--border);">
        ${phaseLabel('⬡ STEP 1 — SIGN THE MESSAGE', 'phase-purple')}
        ${hintHTML('A new ECDSA P-256 key pair will be generated automatically. Your <strong>private key</strong> signs the message — share only the <strong>public key</strong> for others to verify.')}
        <span class="form-label">Message to Sign</span>
        <input type="text" class="form-input" id="s-ecdsa-msg" value="AUTHENTIC_FIRMWARE_V2.1" onkeydown="if(event.key==='Enter') App.runStoryECDSASign()">
        <button class="btn btn-primary btn-full" style="margin-top:12px;" onclick="App.runStoryECDSASign()">⬡ GENERATE KEY PAIR & SIGN</button>
      </div>
      
      <div id="s-ecdsa-res" style="display:none;margin-top:20px;">
        ${phaseLabel('⬡ STEP 2 — VERIFY & TAMPER', 'phase-purple')}
        <div class="readout-wrap reveal-in" style="margin-bottom:12px;">
          <div class="readout-header">
            <span class="readout-label">Sender Public Key (Shareable — Safe to Distribute)</span>
            ${copyBtnHTML('s-ecdsa-pub')}
          </div>
          <div class="readout readout-cyan" style="font-size:10px;max-height:80px;overflow-y:auto;word-break:break-all;" id="s-ecdsa-pub"></div>
        </div>
        
        <div class="readout-wrap reveal-in" style="margin-bottom:12px;">
          <div class="readout-header">
            <span class="readout-label">ECDSA Signature (Hex — Binds this message to your private key)</span>
            ${copyBtnHTML('s-ecdsa-sig-wrap')}
          </div>
          <div class="sig-bytes" id="s-ecdsa-sig" style="max-height:80px;overflow-y:auto;">
            <span id="s-ecdsa-sig-wrap"></span>
          </div>
        </div>
        
        <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;">
          <button class="tamper-btn" onclick="App.runStoryECDSATamper()">[ TAMPER MESSAGE ]</button>
          <button class="btn" onclick="App.runStoryECDSAVerifyOriginal()">✓ VERIFY ORIGINAL</button>
        </div>
        ${hintHTML('Click <strong>TAMPER MESSAGE</strong> to append "_TAMPERED" to the message and re-verify. The signature will <strong>fail</strong> because the message changed. Then restore and re-verify to see it pass again.')}
        
        <div id="s-ecdsa-status-box" style="margin-top:16px;"></div>
      </div>
    `;
  }

  /* ── STEP 7: PKI CERTIFICATE AUTHORITY ─────────────────────────── */
  else if (step === 7) {
    aBox.innerHTML = prefix + `
      <div class="panel" style="padding:20px;background:rgba(0,0,0,0.3);border:1px dashed var(--border);">
        ${phaseLabel('⬡ STEP 1 — ISSUE CERTIFICATE AS ROOT CA', 'phase-purple')}
        ${hintHTML('You are acting as a <strong>Root Certificate Authority</strong>. Fill in the domain details and issue a signed certificate. The NIX CA\'s private key will sign it, creating a verifiable chain of trust.')}
        <span class="form-label">1. Certificate Subject (Domain)</span>
        <input type="text" class="form-input" id="s-cert-domain" value="meridian.sys" onkeydown="if(event.key==='Enter') App.runStoryIssueCert()">
        
        <span class="form-label" style="margin-top:12px;">2. Validity Period</span>
        <select id="s-cert-validity" class="form-input" style="min-height:auto;padding:12px;cursor:pointer;">
          <option value="1 Year">1 Year</option>
          <option value="5 Years" selected>5 Years</option>
          <option value="10 Years">10 Years</option>
        </select>
        
        <span class="form-label" style="margin-top:12px;">3. Server Public Key (Auto-Generated)</span>
        <input type="text" class="form-input" id="s-cert-pub" value="${App.S.story.serverKeys ? App.S.story.serverKeys.publicKeyHex.substring(0, 40) + '...' : 'Generating...'}" disabled style="opacity:0.6;">
        
        <button class="btn btn-primary btn-full" style="margin-top:16px;" onclick="App.runStoryIssueCert()">🏛️ ISSUE DIGITAL CERTIFICATE</button>
      </div>
      
      <div id="s-cert-res" style="display:none;margin-top:20px;"></div>
    `;
  }

  /* ── STEP 8: QUIZ ──────────────────────────────────────────────── */
  else if (step === 8) {
    App.S.story.score = 0;
    let html = `
      ${progressHTML}
      <div class="quiz-header">
        <div class="quiz-header-icon">📋</div>
        <div>
          <div class="quiz-header-title">FINAL ASSESSMENT</div>
          <div class="quiz-header-sub">6 QUESTIONS · BASED ON ALL 8 MODULES · PROVE YOUR CLEARANCE</div>
        </div>
      </div>
      ${conceptHTML}`;

    StoryData.quiz.forEach((q, qi) => {
      const expl = (typeof StoryExplain !== 'undefined' && StoryExplain[8] && StoryExplain[8].quizExplain)
        ? StoryExplain[8].quizExplain[qi] : null;
      html += `
        <div class="panel" style="padding:20px;margin-bottom:14px;" id="quiz-block-${qi}">
          <div class="quiz-question-num">QUESTION ${qi + 1} OF ${StoryData.quiz.length}</div>
          <div style="margin-bottom:14px;font-weight:600;font-size:15px;color:var(--bright);font-family:var(--font-ui);">${q.q}</div>
          ${q.o.map((opt, oi) => `<button class="quiz-opt" id="q-${qi}-${oi}" onclick="App.ansQuiz(${qi},${oi},${q.c})">${opt}</button>`).join('')}
          <div class="quiz-explanation" id="q-explain-${qi}"></div>
        </div>`;
    });
    html += `<div id="s-quiz-res"></div>`;
    aBox.innerHTML = html;
  }
};

/* ─────────────────────────────────────────────────────────────────
   OVERRIDE runStoryHash — adds copy button on output
───────────────────────────────────────────────────────────────── */

App.runStoryHash = async () => {
  const input = document.getElementById('s-hash-in').value.trim();
  if (!input) { alert('Enter a password first.'); return; }
  App.S.story.pwd = input;
  try {
    const r = await CE.hash(App.S.story.algo, input);
    App.S.story.hashHex = r.hex;
    App.S.story.hashBits = r.bits;

    let colorClass = 'readout-green';
    if (App.S.story.algo === 'MD5') {
      colorClass = 'readout-red';
    } else if (App.S.story.algo === 'SHA-1') {
      colorClass = 'readout-warn';
    }

    const res = document.getElementById('s-hash-res');
    res.innerHTML = `
      <div class="reveal-in">
        ${readoutHTML('s-hash-val', `GENERATED FINGERPRINT (${App.S.story.algo})`, r.hex, colorClass)}
        <div class="bit-grid-label" style="margin-top:16px;">BIT PATTERN — ${r.bits.length} BITS</div>
        <div class="bit-grid" id="s-hash-bits" style="margin-top:4px;max-height:100px;"></div>
        ${missionCompleteHTML('Hash fingerprint generated. Ready to observe Avalanche Effect.')}
      </div>`;

    const grid = document.getElementById('s-hash-bits');
    for (let i = 0; i < Math.min(r.bits.length, 256); i++) {
      const b = document.createElement('div');
      b.className = 'bit' + (r.bits[i] === '1' ? ' on' : '');
      grid.appendChild(b);
    }
    App.showNextBtn(1);
  } catch(e) { alert('Hashing Failed: ' + e.message); }
};

/* ─────────────────────────────────────────────────────────────────
   OVERRIDE runStoryEncrypt — adds copy button on ciphertext output
───────────────────────────────────────────────────────────────── */

App.runStoryEncrypt = async () => {
  const pass = document.getElementById('s-enc-in').value;
  if (!pass) { alert('Create a passphrase to lock the data.'); return; }
  const btn = document.getElementById('s-enc-btn');
  btn.disabled = true;
  btn.innerText = 'STRETCHING KEY (PBKDF2 × 100,000)...';

  setTimeout(async () => {
    try {
      const r = await CE.encrypt('LOCKDOWN_PROTOCOL_ALPHA', pass);
      const res = document.getElementById('s-enc-res');
      res.innerHTML = `
        <div class="reveal-in">
          <div class="status-tag st-ok" style="margin-bottom:12px;">ENCRYPTION COMPLETE — AES-256-GCM</div>
          ${readoutHTML('s-enc-payload', 'ENCRYPTED PAYLOAD (Salt : IV : Ciphertext)', r.payload, 'readout-cyan')}
          <div class="hint-box" style="margin-top:12px;">
            <div class="hint-box-icon">📋</div>
            <div class="hint-box-text">Copy this payload and switch to <strong>DECRYPT mode</strong> above to prove it works. This payload is safe to transmit — <strong>only your passphrase can unlock it</strong>.</div>
          </div>
          ${missionCompleteHTML('Payload encrypted with AES-256-GCM. Integrity is now mathematically guaranteed.')}
        </div>`;
      btn.disabled = false;
      btn.innerText = 'STRETCH KEY & ENCRYPT';
      App.showNextBtn(5);
    } catch (e) {
      document.getElementById('s-enc-res').innerHTML = `<div class="status-tag st-err">ENCRYPTION FAILED: ${e.message}</div>`;
      btn.disabled = false;
      btn.innerText = 'STRETCH KEY & ENCRYPT';
    }
  }, 100);
};

/* ─────────────────────────────────────────────────────────────────
   OVERRIDE runStoryStego — adds completion message
───────────────────────────────────────────────────────────────── */

App.runStoryStego = () => {
  const canvas = document.getElementById('stego-story-canvas');
  if (canvas.style.display === 'none') { alert('Please upload a decoy image first.'); return; }
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  CE.stegoEncode(imgData.data, "0fe721:bc892a:f821de77bc21009822a1f8...");
  ctx.putImageData(imgData, 0, 0);
  document.getElementById('stego-story-res').style.display = 'block';
  App.showNextBtn(6);
};

/* ─────────────────────────────────────────────────────────────────
   OVERRIDE ansQuiz — adds per-question explanations after answer
───────────────────────────────────────────────────────────────── */

const quizExplanations = [
  'MD5 and SHA-1 have known collision vulnerabilities — researchers can deliberately craft two different files that produce the same hash. This breaks file integrity checks and allows forged certificates.',
  'The Avalanche Effect means changing one input bit causes ~50% of output bits to flip randomly — making hash outputs completely unpredictable and resistant to "hot or cold" guessing attacks.',
  'PBKDF2 runs the hash function 100,000+ times (key stretching) and mixes in a random Salt. This makes precomputed rainbow tables useless and forces attackers to individually hash every guess at great computational cost.',
  'AES-GCM includes a 128-bit Authentication Tag derived from the ciphertext. Any modification — even flipping a single bit — makes this tag invalid. The decryptor throws an error rather than silently returning corrupted data.',
  'An ECDSA signature mathematically binds a message to a specific private key. Changing even one byte of the message produces a completely different signature hash — the verification equation fails, proving tampering.',
  'Browsers ship with a pre-trusted list of ~150 Root Certificate Authorities. When a server presents its certificate, the browser verifies the CA\'s digital signature on it. A forged or expired certificate breaks this chain, triggering a security warning.',
];

App.ansQuiz = (qi, oi, c) => {
  document.querySelectorAll(`[id^='q-${qi}-']`).forEach(b => b.disabled = true);
  const isCorrect = oi === c;
  if (isCorrect) {
    document.getElementById(`q-${qi}-${oi}`).classList.add('correct');
    App.S.story.score++;
  } else {
    document.getElementById(`q-${qi}-${oi}`).classList.add('wrong');
    document.getElementById(`q-${qi}-${c}`).classList.add('correct');
  }

  // Show explanation
  const explEl = document.getElementById(`q-explain-${qi}`);
  if (explEl && quizExplanations[qi]) {
    explEl.innerHTML = `
      <span style="font-weight:700;color:${isCorrect ? 'var(--c3)' : 'var(--c2)'};">${isCorrect ? '✓ Correct!' : '✗ Incorrect.'}</span>
      ${quizExplanations[qi]}`;
    explEl.classList.add('show');
  }

  const total = document.querySelectorAll('.quiz-opt').length;
  const disabled = document.querySelectorAll('.quiz-opt:disabled').length;
  if (disabled === total) {
    const s = App.S.story.score;
    const qlen = StoryData.quiz.length;
    const pct = Math.round((s / qlen) * 100);
    let verdict, verdictClass;
    if (s === qlen)      { verdict = 'PERFECT SCORE. CLEARED FOR FIELD OPERATIONS.'; verdictClass = 'st-ok'; }
    else if (s >= Math.floor(qlen * 0.7)) { verdict = 'STRONG PERFORMANCE. MINOR GAPS DETECTED.'; verdictClass = 'st-ok'; }
    else                 { verdict = 'FURTHER TRAINING REQUIRED. Review the concept briefs above.'; verdictClass = 'st-warn'; }

    document.getElementById('s-quiz-res').innerHTML = `
      <div class="score-card reveal-in">
        <div class="score-big">${s}/${qlen}</div>
        <div class="score-label">EVALUATION SCORE — ${pct}%</div>
        <div style="font-family:var(--font-mono);font-size:12px;margin-bottom:24px;">
          <span class="status-tag ${verdictClass}">${verdict}</span>
        </div>
        <button class="btn btn-success" onclick="App.goHome()">↩ RETURN TO MAIN MENU</button>
      </div>`;
  }
};

/* ─────────────────────────────────────────────────────────────────
   OVERRIDE runStoryECDSASign — fixes sig display & adds copy btns
───────────────────────────────────────────────────────────────── */

App.runStoryECDSASign = async () => {
  const msg = document.getElementById('s-ecdsa-msg').value;
  if (!msg) { alert('Enter a message to sign.'); return; }

  try {
    const keys = await CE.generateECDSA();
    App.S.story.ecdsaKeyPair = keys.keyPair;
    App.S.story.ecdsaPubKeyHex = keys.publicKeyHex;
    App.S.story.ecdsaMsg = msg;

    const sigObj = await CE.signECDSA(keys.keyPair.privateKey, msg);
    App.S.story.ecdsaSig = sigObj.signature;
    App.S.story.ecdsaSigHex = sigObj.signatureHex;

    document.getElementById('s-ecdsa-pub').innerText = keys.publicKeyHex;
    // Write to the inner span so the parent container is not wiped
    const sigWrap = document.getElementById('s-ecdsa-sig-wrap');
    if (sigWrap) {
      sigWrap.innerText = sigObj.signatureHex;
    } else {
      // Fallback: container has no child span
      document.getElementById('s-ecdsa-sig').innerText = sigObj.signatureHex;
    }
    document.getElementById('s-ecdsa-res').style.display = 'block';

    const statusBox = document.getElementById('s-ecdsa-status-box');
    statusBox.innerHTML = `
      <div class="sig-result sig-valid reveal-in">
        <div class="sig-status valid">✅ SIGNATURE VALID</div>
        <p style="font-size:12px;color:var(--muted);line-height:1.6;">Verified against Public Key. The message is authentic and untampered. Now try tampering to see what happens.</p>
      </div>`;
    App.S.story.sigVerifiedValid = true;
    App.S.story.sigVerifiedInvalid = false;
  } catch (e) {
    alert('ECDSA Signing Failed: ' + e.message);
  }
};

/* ─────────────────────────────────────────────────────────────────
   PUBLIC API (called from inline onclick)
───────────────────────────────────────────────────────────────── */

window.SMv2 = {
  copy(id, btn) {
    const el = document.getElementById(id);
    if (!el) return;
    copyText(el.innerText || el.textContent, btn);
  },
  toggleBrief(stepIdx) {
    const panel = document.getElementById(`concept-brief-${stepIdx}`);
    if (!panel) return;
    const isOpen = panel.classList.toggle('open');
    const toggle = panel.querySelector('.cbh-toggle span');
    if (toggle) toggle.textContent = isOpen ? 'COLLAPSE' : 'EXPAND';
  }
};

console.log('[SMv2] Story Mode v2 loaded — enhanced experience active');
