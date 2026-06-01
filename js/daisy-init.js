function initDaisy() {
  const widget = document.getElementById('daisy-widget');
  if (!widget) return;

  let statusDot = document.getElementById('daisy-status-dot');
  if (!statusDot) {
    statusDot = document.createElement('div');
    statusDot.id = 'daisy-status-dot';
    widget.appendChild(statusDot);
  }

  // Manual Button
  let manualBtn = document.getElementById('daisy-manual-btn');
  if (!manualBtn) {
    manualBtn = document.createElement('div');
    manualBtn.id = 'daisy-manual-btn';
    manualBtn.textContent = '?';
    widget.appendChild(manualBtn);
  }

  // Manual Modal
  let manualModal = document.getElementById('daisy-manual-modal');
  if (!manualModal) {
    manualModal = document.createElement('div');
    manualModal.id = 'daisy-manual-modal';
    manualModal.style.cssText = 'display:none; position:fixed; top:10%; left:50%; transform:translateX(-50%); width:90%; max-width:500px; max-height:80vh; z-index:10001; background:var(--bg, #05050a); border:2px solid var(--c, #00f5ff); padding:24px; overflow-y:auto; box-shadow:0 0 30px rgba(0,245,255,0.2); font-family:var(--font-mono, monospace); color:var(--text, #e2e8f0); border-radius:8px;';
    
    manualModal.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:16px; border-bottom:1px solid var(--c); padding-bottom:8px;">
        <div style="font-family:var(--font-display); color:var(--c); font-size:16px; letter-spacing:2px;">⌁ DAISY'S MANUAL ⌁</div>
        <button id="daisy-manual-close" style="background:none; border:1px solid var(--c2, #ff003c); color:var(--c2, #ff003c); cursor:pointer;">[X]</button>
      </div>
      <div style="font-size:12px; line-height:1.6; display:flex; flex-direction:column; gap:12px;">
        <p><strong>Hi! I'm Daisy, your local AI companion.</strong> Here is how you can interact with me:</p>
        <ul style="padding-left:16px; display:flex; flex-direction:column; gap:8px;">
          <li><strong style="color:var(--c3, #00ff88);">💬 Local AI Chat:</strong> Click me to open the comms panel. My brain (Qwen2.5) runs 100% inside your browser!</li>
          <li><strong style="color:var(--c3, #00ff88);">🔊 Synthetic Audio:</strong> I generate procedural blips, chimes, and typewriter sounds natively. Click anywhere to activate.</li>
          <li><strong style="color:var(--c3, #00ff88);">😴 Idle State:</strong> If you leave the mouse alone for 30s, I get bored and will try to get your attention.</li>
          <li><strong style="color:var(--c3, #00ff88);">🚨 Hex Validator:</strong> Make a mistake in the decryption labs and I'll proactively intercept the error and highlight the bad input!</li>
          <li><strong style="color:var(--c3, #00ff88);">✋ High Five:</strong> Click on the right side of my body (my right arm) for a quick high five.</li>
          <li><strong style="color:var(--c3, #00ff88);">👉 Poke:</strong> Click directly on my face to poke me and make me flinch!</li>
          <li><strong style="color:var(--c3, #00ff88);">😵‍💫 Dizzy Spin:</strong> Click, drag me fast in circles around the screen, and drop me to make me dizzy!</li>
          <li><strong style="color:var(--c3, #00ff88);">🌸 Ticklish:</strong> Hover your mouse directly over my face/petals quickly to tickle me.</li>
          <li><strong style="color:var(--c3, #00ff88);">🕶️ Hacker Mode:</strong> Switch to advanced labs (like RSA or Steganography) and I'll put on my cyber-goggles.</li>
          <li><strong style="color:var(--c3, #00ff88);">⚡ Shock:</strong> If a crypto tool throws an error, I get shocked!</li>
          <li><strong style="color:var(--c3, #00ff88);">🪴 Level Up Dance:</strong> Unlock an achievement to water me and watch me do a 360° happy dance!</li>
          <li><strong style="color:var(--c3, #00ff88);">👀 Eye Tracking:</strong> Move your mouse around and watch my eyes follow your cursor.</li>
        </ul>
        <div style="margin-top:16px; border-top:1px solid var(--muted); padding-top:12px; color:var(--muted);">
          <strong style="color:var(--c, #00f5ff);">CLASSIFIED SECRETS (EASTER EGGS):</strong><br>
          Type the answers to these clues anywhere on the keyboard:<br>
          - What is the name of this protocol? (3 letters) -> Matrix Rain<br>
          - The study of secure communication? (6 letters) -> Stealth Mode<br>
          - What do we do to plain text to make a fingerprint? (4 letters) -> Overclock Mode
        </div>
      </div>
    `;
    document.body.appendChild(manualModal);

    document.getElementById('daisy-manual-close').addEventListener('click', () => {
      manualModal.style.display = 'none';
    });

    manualBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Don't open chat
      manualModal.style.display = 'block';
    });
  }

  
  // --- AUDIO ENGINE ---
  let audioCtx = null;
  function getAudioCtx() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    return audioCtx;
  }
  
  window.playBlip = function() {
    try {
      const ctx = getAudioCtx();
      if (!ctx || ctx.state === 'suspended') return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch(e){}
  };

  window.playSuccess = function() {
    try {
      const ctx = getAudioCtx();
      if (!ctx || ctx.state === 'suspended') return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.setValueAtTime(800, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch(e){}
  };

  window.playAlert = function() {
    try {
      const ctx = getAudioCtx();
      if (!ctx || ctx.state === 'suspended') return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.setValueAtTime(200, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch(e){}
  };

  window.playTypewriter = function() {
    try {
      const ctx = getAudioCtx();
      if (!ctx || ctx.state === 'suspended') return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(150 + Math.random()*50, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch(e){}
  };

  let typeInterval = null;
  window.typewriteBubble = function(text) {
    const textSpan = document.getElementById('daisy-bubble-text');
    if (!textSpan) return;
    textSpan.textContent = '';
    let i = 0;
    clearInterval(typeInterval);
    typeInterval = setInterval(() => {
      if (i < text.length) {
        textSpan.textContent += text[i];
        if (text[i] !== ' ' && i % 2 === 0) window.playTypewriter();
        i++;
      } else {
        clearInterval(typeInterval);
      }
    }, 30);
  };

  // --- IDLE TRACKER ---
  let idleTimer = null;
  function resetIdle() {
    clearTimeout(idleTimer);
    if (getAudioCtx() && getAudioCtx().state === 'suspended') {
      try { getAudioCtx().resume(); } catch(e){}
    }
    
    if (widget.classList.contains('daisy-bored')) {
      widget.classList.remove('daisy-bored');
      if (window.setDaisyState) window.setDaisyState('idle');
    }
    
    idleTimer = setTimeout(() => {
      widget.classList.add('daisy-bored');
      if (window.setDaisyState) window.setDaisyState('idle');
      const bubble = document.getElementById('daisy-bubble');
      if (bubble) {
        bubble.classList.add('visible');
        window.typewriteBubble("You still there? The encryption isn't going to crack itself!");
        setTimeout(() => bubble.classList.remove('visible'), 5000);
      }
    }, 30000);
  }
  
  window.addEventListener('mousemove', resetIdle);
  window.addEventListener('keydown', resetIdle);
  window.addEventListener('click', resetIdle);
  resetIdle();

  // --- SECRET KEYLOGGER ---
  let keyBuffer = '';
  window.addEventListener('keydown', (e) => {
    if (e.key && e.key.length === 1) {
      keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-20);
      if (keyBuffer.endsWith('nix')) {
        window.playSuccess();
        document.body.style.backgroundImage = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgo8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMDcwYjE0Ii8+Cjx0ZXh0IHg9IjAiIHk9IjIwIiBmaWxsPSIjMDBmZjAwIiBvcGFjaXR5PSIwLjUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMjAiPjEwMTExMDEwMDEwMTwvdGV4dD4KPC9zdmc+")';
        if (window.setDaisyState) window.setDaisyState('celebrate', null);
        const bubble = document.getElementById('daisy-bubble');
        if (bubble) {
          bubble.classList.add('visible');
          window.typewriteBubble("Matrix mode engaged!");
        }
      }
      if (keyBuffer.endsWith('crypto')) {
        window.playSuccess();
        const hackerGoggles = document.getElementById('daisy-accessory-hacker');
        if (hackerGoggles) hackerGoggles.style.display = '';
        if (window.setDaisyState) window.setDaisyState('celebrate', null);
        const bubble = document.getElementById('daisy-bubble');
        if (bubble) {
          bubble.classList.add('visible');
          window.typewriteBubble("Stealth mode activated!");
        }
      }
      if (keyBuffer.endsWith('hash')) {
        window.playSuccess();
        document.documentElement.style.setProperty('--bg', '#000000');
        document.documentElement.style.setProperty('--c', '#ff00ff');
        if (window.setDaisyState) window.setDaisyState('celebrate', null);
        const bubble = document.getElementById('daisy-bubble');
        if (bubble) {
          bubble.classList.add('visible');
          window.typewriteBubble("Overclocking hashes!");
        }
      }
    }
  });

  // Inject CSS highlighter
  const style = document.createElement('style');
  style.textContent = `
    @keyframes daisyGlow {
      0% { box-shadow: 0 0 5px var(--c, #00f5ff); border-color: var(--c, #00f5ff); }
      50% { box-shadow: 0 0 20px var(--c, #00f5ff), 0 0 10px inset var(--c, #00f5ff); border-color: #fff; }
      100% { box-shadow: 0 0 5px var(--c, #00f5ff); border-color: var(--c, #00f5ff); }
    }
    .daisy-highlight {
      animation: daisyGlow 1s infinite alternate !important;
    }
  `;
  document.head.appendChild(style);

  window.DaisyContext = {
    currentTool: 'hash',
    currentAlgo: 'none',
    lastAction: 'none'
  };

  const EXPRESSIONS = ['idle', 'think', 'celebrate', 'warn', 'sleep', 'dizzy', 'shock', 'poke'];

  function setDaisyExpression(expr) {
    EXPRESSIONS.forEach(e => {
      const el = document.getElementById(`daisy-expr-${e}`);
      if (el) el.style.display = (e === expr) ? '' : 'none';
    });
  }

  let bubble = document.getElementById('daisy-bubble');
  if (!bubble) {
    bubble = document.createElement('div');
    bubble.id = 'daisy-bubble';
    const textSpan = document.createElement('span');
    textSpan.id = 'daisy-bubble-text';
    bubble.appendChild(textSpan);
    widget.appendChild(bubble);
  }

  let bubbleTimeout = null;

  window.setDaisyState = function setDaisyState(state, textKey) {
    if (widget.classList.contains('daisy-drag')) return;
    
    if (widget.classList.contains('daisy-flower')) {
      if (textKey && DaisyDialogues[textKey]) {
        const textSpan = document.getElementById('daisy-bubble-text');
        window.typewriteBubble(DaisyDialogues[textKey]);
        bubble.classList.add('visible');
        clearTimeout(bubbleTimeout);
        bubbleTimeout = setTimeout(() => {
          bubble.classList.remove('visible');
        }, 4000);
      }
      return;
    }

    widget.classList.remove('daisy-idle', 'daisy-think', 'daisy-celebrate', 'daisy-warn', 'daisy-sleep', 'daisy-dizzy', 'daisy-shock', 'daisy-poke', 'daisy-dance');
    widget.classList.add(`daisy-${state}`);
    setDaisyExpression(state);
    if (state === 'celebrate') window.playSuccess();
    else if (state === 'warn' || state === 'shock') window.playAlert();
    else if (state !== 'idle' && state !== 'sleep') window.playBlip();

    if (textKey && DaisyDialogues[textKey]) {
      const textSpan = document.getElementById('daisy-bubble-text');
      window.typewriteBubble(DaisyDialogues[textKey]);
      bubble.classList.add('visible');

      clearTimeout(bubbleTimeout);
      bubbleTimeout = setTimeout(() => {
        bubble.classList.remove('visible');

        if (state === 'celebrate' || state === 'warn') {
          setTimeout(() => {
            if (!widget.classList.contains('daisy-sleep') && !widget.classList.contains('daisy-dizzy')) {
              widget.classList.remove(`daisy-${state}`);
              widget.classList.add('daisy-idle');
              setDaisyExpression('idle');
            }
          }, 500);
        }
      }, 4000);
    } else if (!textKey) {
      bubble.classList.remove('visible');
      if (state === 'celebrate' || state === 'warn' || state === 'shock' || state === 'poke' || state === 'dance') {
        setTimeout(() => {
          if (!widget.classList.contains('daisy-sleep') && !widget.classList.contains('daisy-dizzy')) {
            widget.classList.remove(`daisy-${state}`);
            widget.classList.add('daisy-idle');
            setDaisyExpression('idle');
          }
        }, state === 'dance' ? 1500 : 2000);
      }
    }
  }

  let proactiveTimeout = null;
  function triggerProactiveBubble(state, textKey) {
    if (widget.classList.contains('daisy-sleep')) return;
    clearTimeout(proactiveTimeout);
    proactiveTimeout = setTimeout(() => {
      setDaisyState(state, textKey);
    }, 600);
  }

  setTimeout(() => {
    if (widget.classList.contains('daisy-flower')) {
      const textSpan = document.getElementById('daisy-bubble-text');
      textSpan.textContent = "Hii! I'm Daisy — click me to chat or just start exploring!";
      bubble.classList.add('visible');
      clearTimeout(bubbleTimeout);
      bubbleTimeout = setTimeout(() => {
        bubble.classList.remove('visible');
      }, 4000);
    }
  }, 1500);

  // ─── MONKEY-PATCH APP FUNCTIONS ───
  if (typeof App !== 'undefined' && App.switchLabTab) {
    const orig = App.switchLabTab;
    App.switchLabTab = function(tabId) {
      orig.call(App, tabId);
      window.DaisyContext.currentTool = tabId;
      
      // Hacker Accessory Toggle
      const hackerGoggles = document.getElementById('daisy-accessory-hacker');
      if (hackerGoggles) {
        if (['rsa', 'stego', 'ecdsa', 'cert', 'ecdh'].includes(tabId)) {
          hackerGoggles.style.display = '';
        } else {
          hackerGoggles.style.display = 'none';
        }
      }

      triggerProactiveBubble('idle', tabId);
    };
  }

  if (typeof App !== 'undefined' && App.setLabAlgo) {
    const orig = App.setLabAlgo;
    App.setLabAlgo = function(algo) {
      orig.call(App, algo);
      window.DaisyContext.currentAlgo = algo;
      
      if (algo === 'MD5' || algo === 'SHA-1') {
        triggerProactiveBubble('warn', algo);
      } else {
        triggerProactiveBubble('think', algo);
        setTimeout(() => {
          if (!widget.classList.contains('daisy-flower') && !widget.classList.contains('daisy-sleep')) {
            widget.classList.remove('daisy-think');
            widget.classList.add('daisy-idle');
            setDaisyExpression('idle');
          }
        }, 3600);
      }
    };
  }

  if (typeof App !== 'undefined' && App.runLabHash) {
    const orig = App.runLabHash;
    App.runLabHash = async function() {
      if (!widget.classList.contains('daisy-sleep')) {
        const inputVal = document.getElementById('hash-input') ? document.getElementById('hash-input').value : '';
        setDaisyState('think');
        if (inputVal.length > 20) {
          widget.classList.add('daisy-munch');
        }
      }
      let res;
      try {
        res = await orig.apply(App, arguments);
        window.DaisyContext.lastAction = 'just hashed a string';
      } catch (e) {
        widget.classList.remove('daisy-munch');
        if (!widget.classList.contains('daisy-sleep')) setDaisyState('shock', 'warn');
        throw e;
      }
      widget.classList.remove('daisy-munch');
      if (!widget.classList.contains('daisy-sleep')) setDaisyState('celebrate', 'celebrate');
      return res;
    };
  }

  if (typeof App !== 'undefined' && App.runRSAGen) {
    const orig = App.runRSAGen;
    App.runRSAGen = async function() {
      if (!widget.classList.contains('daisy-sleep')) setDaisyState('think');
      let res;
      try {
        res = await orig.apply(App, arguments);
        window.DaisyContext.lastAction = 'generated RSA keys';
      } catch (e) {
        if (!widget.classList.contains('daisy-sleep')) setDaisyState('shock', 'warn');
        throw e;
      }
      if (!widget.classList.contains('daisy-sleep')) setDaisyState('celebrate', 'celebrate');
      return res;
    };
  }

  if (typeof App !== 'undefined' && App.startMD5Crack) {
    const orig = App.startMD5Crack;
    App.startMD5Crack = function() {
      if (!widget.classList.contains('daisy-sleep')) setDaisyState('think', 'cracker');
      window.DaisyContext.lastAction = 'cracked MD5';
      orig.apply(App, arguments);
    };
  }

  if (typeof AchievementSystem !== 'undefined' && AchievementSystem.unlock) {
    const orig = AchievementSystem.unlock;
    AchievementSystem.unlock = function(id) {
      orig.call(AchievementSystem, id);
      if (!widget.classList.contains('daisy-sleep')) {
        setDaisyState('dance', 'celebrate'); // 360 Spin Dance!
        // Watering can grow animation
        widget.classList.add('daisy-grow');
        setTimeout(() => {
          widget.classList.remove('daisy-grow');
        }, 3500);
      }
    };
  }

  // ─── CHAT PANEL ───
  const chatPanel = document.createElement('div');
  chatPanel.id = 'daisy-chat';
  chatPanel.innerHTML = `
    <div id="daisy-chat-header">
      <div class="daisy-header-title">
        <span>DAISY COMMS</span>
        <div class="daisy-hint-btn">?
          <div class="daisy-hint-tooltip">AI runs 100% in your browser — no data leaves your device.</div>
        </div>
      </div>
      <button id="daisy-chat-close">[ ESC ]</button>
    </div>
    <div id="daisy-chat-history">
      <div class="daisy-welcome">
        <strong>⌁ DAISY ONLINE ⌁</strong><br>
        Type a message or switch tools — I'll keep up.
      </div>
    </div>
    <div id="daisy-chat-input-area">
      <input type="text" id="daisy-chat-input" placeholder="// message daisy..." autocomplete="off" spellcheck="false">
      <button id="daisy-chat-send">TX</button>
    </div>
  `;
  document.body.appendChild(chatPanel);

  const history = document.getElementById('daisy-chat-history');
  const input = document.getElementById('daisy-chat-input');
  const sendBtn = document.getElementById('daisy-chat-send');
  const closeBtn = document.getElementById('daisy-chat-close');

  let tickleTimeout;
  widget.addEventListener('mouseenter', () => {
    if (widget.classList.contains('daisy-sleep') || widget.classList.contains('daisy-drag') || widget.classList.contains('daisy-flower') || widget.classList.contains('daisy-dizzy')) return;
    widget.classList.add('daisy-tickle');
    clearTimeout(tickleTimeout);
    tickleTimeout = setTimeout(() => {
      widget.classList.remove('daisy-tickle');
    }, 400);
  });

  let isDragging = false;
  widget.addEventListener('click', (e) => {
    if (isDragging) return;

    const rect = widget.getBoundingClientRect();
    const isRightSide = (e.clientX - rect.left) > (rect.width * 0.7) && (e.clientY - rect.top) > (rect.height * 0.4);
    
    // Face click detection for poking
    const faceCenterX = rect.width / 2;
    const faceCenterY = rect.height * 0.4;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const distToFace = Math.sqrt((clickX - faceCenterX)**2 + (clickY - faceCenterY)**2);
    const isFaceClick = distToFace < 30; // 30px radius around the face

    // High-Five Interaction
    if (isRightSide && widget.classList.contains('daisy-idle')) {
      widget.classList.add('daisy-highfive-slap');
      setTimeout(() => widget.classList.remove('daisy-highfive-slap'), 500);
      return; // Stop here, don't open chat
    }

    // Poke Interaction
    if (isFaceClick && widget.classList.contains('daisy-idle')) {
      setDaisyState('poke');
      return; // Stop here, don't open chat
    }

    if (widget.classList.contains('daisy-flower') || widget.classList.contains('daisy-sleep')) {
      widget.classList.remove('daisy-flower', 'daisy-sleep');
      widget.classList.add('daisy-idle');
      setDaisyExpression('idle');
      
      const textSpan = document.getElementById('daisy-bubble-text');
      textSpan.textContent = "Hi! Let's explore some crypto together!";
      bubble.classList.add('visible');
      clearTimeout(bubbleTimeout);
      bubbleTimeout = setTimeout(() => {
        bubble.classList.remove('visible');
      }, 4000);
    }

    chatPanel.classList.toggle('open');
    if (chatPanel.classList.contains('open')) {
      chatPanel.style.animation = 'none';
      chatPanel.offsetHeight;
      chatPanel.style.animation = '';
      input.focus();
    }
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    chatPanel.classList.remove('open');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatPanel.classList.contains('open')) {
      chatPanel.classList.remove('open');
    }
  });

  // ─── DRAG AND DROP & DIZZY PHYSICS ───
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let dragSpeeds = [];
  let lastDragTime = 0;
  let lastDragX = 0;
  let lastDragY = 0;
  let isDizzy = false;

  widget.addEventListener('mousedown', (e) => {
    if (e.button !== 0 || e.target.tagName === 'INPUT') return;
    e.preventDefault();
    
    isDragging = false;
    isDizzy = false;
    dragSpeeds = [];
    
    const rect = widget.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    
    lastDragTime = Date.now();
    lastDragX = e.clientX;
    lastDragY = e.clientY;

    function onMouseMove(moveEvent) {
      isDragging = true;
      widget.classList.add('daisy-drag');
      
      let newX = moveEvent.clientX - dragOffsetX;
      let newY = moveEvent.clientY - dragOffsetY;
      
      newX = Math.max(0, Math.min(newX, window.innerWidth - widget.offsetWidth));
      newY = Math.max(0, Math.min(newY, window.innerHeight - widget.offsetHeight));

      widget.style.left = newX + 'px';
      widget.style.top = newY + 'px';
      widget.style.right = 'auto';
      widget.style.bottom = 'auto';

      // Physics tracking for Dizzy state
      const now = Date.now();
      const dt = now - lastDragTime;
      if (dt > 0) {
        const dist = Math.sqrt((moveEvent.clientX - lastDragX)**2 + (moveEvent.clientY - lastDragY)**2);
        const speed = dist / dt;
        dragSpeeds.push(speed);
        if (dragSpeeds.length > 15) dragSpeeds.shift();
        
        const avgSpeed = dragSpeeds.reduce((a, b) => a + b, 0) / dragSpeeds.length;
        if (avgSpeed > 3.0) { // Threshold for fast dragging
          isDizzy = true;
        }
      }
      lastDragTime = now;
      lastDragX = moveEvent.clientX;
      lastDragY = moveEvent.clientY;
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      widget.classList.remove('daisy-drag');
      
      if (isDizzy) {
        setDaisyState('dizzy');
        setTimeout(() => {
          if (widget.classList.contains('daisy-dizzy')) {
            widget.classList.remove('daisy-dizzy');
            widget.classList.add('daisy-idle');
            setDaisyExpression('idle');
          }
          isDizzy = false;
        }, 3000);
      }

      setTimeout(() => isDragging = false, 50);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  // ─── EYE TRACKING AND INACTIVITY ───
  let lastInteractionTime = Date.now();

  function resetActivity() {
    lastInteractionTime = Date.now();
    if (widget.classList.contains('daisy-sleep')) {
      widget.classList.remove('daisy-sleep');
      widget.classList.add('daisy-idle');
      setDaisyExpression('idle');
    }
  }

  document.addEventListener('mousemove', (e) => {
    resetActivity();
    if (widget.classList.contains('daisy-flower') || widget.classList.contains('daisy-sleep') || widget.classList.contains('daisy-dizzy')) return;

    const rect = widget.getBoundingClientRect();
    const faceX = rect.left + rect.width / 2;
    const faceY = rect.top + rect.height * 0.4;

    const dx = e.clientX - faceX;
    const dy = e.clientY - faceY;
    
    const maxMove = 2.5;
    let moveX = (dx / window.innerWidth) * maxMove * 2;
    let moveY = (dy / window.innerHeight) * maxMove * 2;
    
    moveX = Math.max(-maxMove, Math.min(maxMove, moveX));
    moveY = Math.max(-maxMove, Math.min(maxMove, moveY));

    widget.style.setProperty('--eye-x', moveX + 'px');
    widget.style.setProperty('--eye-y', moveY + 'px');
  });

  document.addEventListener('keydown', resetActivity);
  document.addEventListener('click', resetActivity);

  // Auto Blinking Logic
  setInterval(() => {
    if (widget.classList.contains('daisy-idle') || widget.classList.contains('daisy-think')) {
      // 30% chance to double blink
      if (Math.random() < 0.3) {
        widget.classList.add('daisy-blink-auto');
        setTimeout(() => {
          widget.classList.remove('daisy-blink-auto');
          setTimeout(() => {
            widget.classList.add('daisy-blink-auto');
            setTimeout(() => widget.classList.remove('daisy-blink-auto'), 150);
          }, 100);
        }, 150);
      } else {
        // Single blink
        widget.classList.add('daisy-blink-auto');
        setTimeout(() => widget.classList.remove('daisy-blink-auto'), 150);
      }
    }
  }, 4000); // Check every 4s, animation handles it

  // Sleep Inactivity Timer
  setInterval(() => {
    if (Date.now() - lastInteractionTime > 60000) {
      if (!widget.classList.contains('daisy-flower') && !widget.classList.contains('daisy-sleep') && !widget.classList.contains('daisy-dizzy')) {
        widget.classList.remove('daisy-idle', 'daisy-think', 'daisy-celebrate', 'daisy-warn');
        widget.classList.add('daisy-sleep');
        setDaisyExpression('sleep');
      }
    }
  }, 5000);

  // ─── TYPING ANIMATION ───
  let typingTimeout;
  input.addEventListener('input', () => {
    resetActivity();
    if (widget.classList.contains('daisy-sleep') || widget.classList.contains('daisy-flower')) return;
    
    widget.classList.add('daisy-listen');
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      widget.classList.remove('daisy-listen');
    }, 500);
  });

  // ─── AI WORKER INTEGRATION ───
  let worker = new Worker('js/daisy.worker.js');
  let currentResponseDiv = null;
  let modelLoaded = false;
  let modelLoading = false;
  let currentProgressDiv = null;
  let currentMessageQueue = [];

  worker.addEventListener('message', (e) => {
    const { type, pct, text } = e.data;

    if (type === 'progress') {
      statusDot.className = 'loading';
      if (currentProgressDiv) {
        currentProgressDiv.textContent = `Downloading Daisy's brain... ${Math.round(pct)}%`;
      }
    } else if (type === 'token') {
      if (!currentResponseDiv) {
        currentResponseDiv = document.createElement('div');
        currentResponseDiv.className = 'daisy-msg daisy';
        history.appendChild(currentResponseDiv);
        
        if (currentProgressDiv) {
          currentProgressDiv.remove();
          currentProgressDiv = null;
        }
        modelLoaded = true;
        modelLoading = false;
        statusDot.className = 'ready';
      }
      currentResponseDiv.textContent += text;
      history.scrollTop = history.scrollHeight;
      
      if (!widget.classList.contains('daisy-dizzy')) {
        widget.classList.remove('daisy-idle', 'daisy-celebrate', 'daisy-warn', 'daisy-sleep');
        widget.classList.add('daisy-think');
        setDaisyExpression('think');
      }

    } else if (type === 'done') {
      if (!widget.classList.contains('daisy-dizzy')) {
        widget.classList.remove('daisy-think');
        widget.classList.add('daisy-celebrate');
        setDaisyExpression('celebrate');
        
        setTimeout(() => {
          if (!widget.classList.contains('daisy-sleep') && !widget.classList.contains('daisy-dizzy')) {
            widget.classList.remove('daisy-celebrate');
            widget.classList.add('daisy-idle');
            setDaisyExpression('idle');
          }
        }, 1500);
      }

      currentResponseDiv = null;
      
      if (currentMessageQueue.length > 0) {
        const nextMsg = currentMessageQueue.shift();
        sendToWorker(nextMsg);
      }

    } else if (type === 'error') {
      if (currentProgressDiv) {
        currentProgressDiv.remove();
        currentProgressDiv = null;
      }
      modelLoading = false;
      statusDot.className = '';
      
      const key = window.DaisyContext.currentAlgo !== 'none' 
        ? window.DaisyContext.currentAlgo 
        : window.DaisyContext.currentTool;
      
      const fallbackReply = DaisyDialogues[key] || DaisyDialogues['idle'];
      const fbDiv = document.createElement('div');
      fbDiv.className = 'daisy-msg daisy';
      fbDiv.textContent = fallbackReply;
      history.appendChild(fbDiv);
      history.scrollTop = history.scrollHeight;
      
      widget.classList.remove('daisy-think');
      widget.classList.add('daisy-idle');
      setDaisyExpression('idle');
      currentResponseDiv = null;
    }
  });

  function sendToWorker(message) {
    worker.postMessage({
      type: 'generate',
      text: message,
      context: { 
        tool: window.DaisyContext.currentTool, 
        algo: window.DaisyContext.currentAlgo,
        action: window.DaisyContext.lastAction
      }
    });
  }

  window.daisyChat = function(message) {
    if (!message.trim()) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'daisy-msg user';
    userMsg.textContent = message;
    history.appendChild(userMsg);
    history.scrollTop = history.scrollHeight;
    input.value = '';
    
    widget.classList.remove('daisy-listen');
    clearTimeout(typingTimeout);

    widget.classList.remove('daisy-idle', 'daisy-celebrate', 'daisy-warn', 'daisy-sleep');
    widget.classList.add('daisy-think');
    setDaisyExpression('think');

    if (!modelLoaded && !modelLoading) {
      modelLoading = true;
      statusDot.className = 'loading';
      currentProgressDiv = document.createElement('div');
      currentProgressDiv.className = 'daisy-msg daisy';
      currentProgressDiv.style.opacity = '0.7';
      currentProgressDiv.textContent = "Downloading Daisy's brain... 0%";
      history.appendChild(currentProgressDiv);
      history.scrollTop = history.scrollHeight;
      sendToWorker(message);
    } else if (modelLoading || currentResponseDiv) {
      currentMessageQueue.push(message);
    } else {
      sendToWorker(message);
    }
  };

  sendBtn.addEventListener('click', () => {
    window.daisyChat(input.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      window.daisyChat(input.value);
    }
  });
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initDaisy();
} else {
  document.addEventListener('DOMContentLoaded', initDaisy);
}
