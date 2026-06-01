function initDaisy() {
  const widget = document.getElementById('daisy-widget');
  if (!widget) return;

  window.currentDaisyContext = 'idle';

  // ─── SPEECH BUBBLE (CSS-driven, no inline styles) ───
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

  function setDaisyState(state, textKey) {
    widget.classList.remove('daisy-idle', 'daisy-think', 'daisy-celebrate', 'daisy-warn');
    widget.classList.add(`daisy-${state}`);

    if (textKey && DaisyDialogues[textKey]) {
      window.currentDaisyContext = textKey;
      const textSpan = document.getElementById('daisy-bubble-text');
      textSpan.textContent = DaisyDialogues[textKey];
      bubble.classList.add('visible');

      clearTimeout(bubbleTimeout);
      bubbleTimeout = setTimeout(() => {
        bubble.classList.remove('visible');

        if (state === 'celebrate' || state === 'warn') {
          setTimeout(() => {
            widget.classList.remove(`daisy-${state}`);
            widget.classList.add('daisy-idle');
          }, 500);
        }
      }, 5000);
    } else if (!textKey) {
      bubble.classList.remove('visible');
      if (state === 'celebrate' || state === 'warn') {
        setTimeout(() => {
          widget.classList.remove(`daisy-${state}`);
          widget.classList.add('daisy-idle');
        }, 2000);
      }
    }
  }

  // ─── MONKEY-PATCH APP FUNCTIONS ───

  // 1. App.switchLabTab
  if (window.App && App.switchLabTab) {
    const originalSwitch = App.switchLabTab;
    App.switchLabTab = function(tabId) {
      originalSwitch.call(App, tabId);
      setDaisyState('idle', tabId);
    };
  }

  // 2. App.setLabAlgo
  if (window.App && App.setLabAlgo) {
    const originalSetAlgo = App.setLabAlgo;
    App.setLabAlgo = function(algo) {
      originalSetAlgo.call(App, algo);

      if (algo === 'MD5' || algo === 'SHA-1') {
        setDaisyState('warn', algo);
      } else {
        setDaisyState('think', algo);
        setTimeout(() => {
          widget.classList.remove('daisy-think');
          widget.classList.add('daisy-idle');
        }, 3000);
      }
    };
  }

  // 3. App.runLabHash
  if (window.App && App.runLabHash) {
    const originalHash = App.runLabHash;
    App.runLabHash = async function() {
      setDaisyState('think');

      let res;
      try {
        res = await originalHash.apply(App, arguments);
      } catch (e) {
        setDaisyState('warn', 'warn');
        throw e;
      }

      setDaisyState('celebrate', 'celebrate');
      return res;
    };
  }

  // 4. App.runRSAGen
  if (window.App && App.runRSAGen) {
    const originalRSAGen = App.runRSAGen;
    App.runRSAGen = async function() {
      setDaisyState('think');

      let res;
      try {
        res = await originalRSAGen.apply(App, arguments);
      } catch (e) {
        setDaisyState('warn', 'warn');
        throw e;
      }

      setDaisyState('celebrate', 'celebrate');
      return res;
    };
  }

  // 5. App.startMD5Crack
  if (window.App && App.startMD5Crack) {
    const originalCrack = App.startMD5Crack;
    App.startMD5Crack = function() {
      setDaisyState('think', 'cracker');
      originalCrack.apply(App, arguments);
    };
  }

  // 6. AchievementSystem.unlock
  if (window.AchievementSystem && AchievementSystem.unlock) {
    const originalUnlock = AchievementSystem.unlock;
    AchievementSystem.unlock = function(id) {
      originalUnlock.call(AchievementSystem, id);
      setDaisyState('celebrate', 'celebrate');
    };
  }

  // ─── CHAT PANEL SETUP ───
  const chatPanel = document.createElement('div');
  chatPanel.id = 'daisy-chat';
  chatPanel.innerHTML = `
    <div id="daisy-chat-header">
      <span>DAISY COMMS</span>
      <button id="daisy-chat-close">[ ESC ]</button>
    </div>
    <div id="daisy-chat-history">
      <div class="daisy-welcome">
        <strong>⌁ DAISY ONLINE ⌁</strong><br>
        Nebula Crypto-Explorer v1.0<br>
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

  // Toggle chat on widget click
  widget.addEventListener('click', () => {
    chatPanel.classList.toggle('open');
    if (chatPanel.classList.contains('open')) {
      // Re-trigger animation by removing and re-adding the class
      chatPanel.style.animation = 'none';
      chatPanel.offsetHeight; // reflow
      chatPanel.style.animation = '';
      input.focus();
    }
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    chatPanel.classList.remove('open');
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && chatPanel.classList.contains('open')) {
      chatPanel.classList.remove('open');
    }
  });

  // ─── CHAT LOGIC ───
  function addTypingIndicator() {
    const typing = document.createElement('div');
    typing.className = 'daisy-typing';
    typing.id = 'daisy-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    history.appendChild(typing);
    history.scrollTop = history.scrollHeight;
    return typing;
  }

  window.daisyChat = function(message) {
    if (!message.trim()) return;

    // User message
    const userMsg = document.createElement('div');
    userMsg.className = 'daisy-msg user';
    userMsg.textContent = message;
    history.appendChild(userMsg);
    history.scrollTop = history.scrollHeight;
    input.value = '';

    // Typing indicator
    const typing = addTypingIndicator();

    // Daisy reply after a short delay
    setTimeout(() => {
      typing.remove();

      const reply = DaisyDialogues[window.currentDaisyContext] || DaisyDialogues['idle'];
      const daisyMsg = document.createElement('div');
      daisyMsg.className = 'daisy-msg daisy';
      daisyMsg.textContent = reply;
      history.appendChild(daisyMsg);
      history.scrollTop = history.scrollHeight;
    }, 600 + Math.random() * 400);
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

// Initialize when DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initDaisy();
} else {
  document.addEventListener('DOMContentLoaded', initDaisy);
}
