function initDaisy() {
  const widget = document.getElementById('daisy-widget');
  if (!widget) return;

  window.currentDaisyContext = 'idle';

  // ─── EXPRESSION SWITCHING ───
  const EXPRESSIONS = ['idle', 'think', 'celebrate', 'warn'];

  function setDaisyExpression(expr) {
    EXPRESSIONS.forEach(e => {
      const el = document.getElementById(`daisy-expr-${e}`);
      if (el) el.style.display = (e === expr) ? '' : 'none';
    });
  }

  // ─── COMIC SPEECH BUBBLE (CSS-driven) ───
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
    // Reset animation class
    widget.classList.remove('daisy-idle', 'daisy-think', 'daisy-celebrate', 'daisy-warn');
    widget.classList.add(`daisy-${state}`);

    // Switch facial expression
    setDaisyExpression(state);

    // Show bubble text
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
            setDaisyExpression('idle');
          }, 500);
        }
      }, 5000);
    } else if (!textKey) {
      bubble.classList.remove('visible');
      if (state === 'celebrate' || state === 'warn') {
        setTimeout(() => {
          widget.classList.remove(`daisy-${state}`);
          widget.classList.add('daisy-idle');
          setDaisyExpression('idle');
        }, 2000);
      }
    }
  }

  // ─── MONKEY-PATCH APP FUNCTIONS ───

  // 1. App.switchLabTab
  if (window.App && App.switchLabTab) {
    const orig = App.switchLabTab;
    App.switchLabTab = function(tabId) {
      orig.call(App, tabId);
      setDaisyState('idle', tabId);
    };
  }

  // 2. App.setLabAlgo
  if (window.App && App.setLabAlgo) {
    const orig = App.setLabAlgo;
    App.setLabAlgo = function(algo) {
      orig.call(App, algo);
      if (algo === 'MD5' || algo === 'SHA-1') {
        setDaisyState('warn', algo);
      } else {
        setDaisyState('think', algo);
        setTimeout(() => {
          widget.classList.remove('daisy-think');
          widget.classList.add('daisy-idle');
          setDaisyExpression('idle');
        }, 3000);
      }
    };
  }

  // 3. App.runLabHash
  if (window.App && App.runLabHash) {
    const orig = App.runLabHash;
    App.runLabHash = async function() {
      setDaisyState('think');
      let res;
      try {
        res = await orig.apply(App, arguments);
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
    const orig = App.runRSAGen;
    App.runRSAGen = async function() {
      setDaisyState('think');
      let res;
      try {
        res = await orig.apply(App, arguments);
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
    const orig = App.startMD5Crack;
    App.startMD5Crack = function() {
      setDaisyState('think', 'cracker');
      orig.apply(App, arguments);
    };
  }

  // 6. AchievementSystem.unlock
  if (window.AchievementSystem && AchievementSystem.unlock) {
    const orig = AchievementSystem.unlock;
    AchievementSystem.unlock = function(id) {
      orig.call(AchievementSystem, id);
      setDaisyState('celebrate', 'celebrate');
    };
  }

  // ─── CHAT PANEL ───
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

  // Toggle chat
  widget.addEventListener('click', () => {
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

    // Daisy thinks while typing
    setDaisyExpression('think');
    const typing = addTypingIndicator();

    // Reply
    setTimeout(() => {
      typing.remove();
      setDaisyExpression('idle');

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
