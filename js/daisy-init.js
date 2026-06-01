function initDaisy() {
  const widget = document.getElementById('daisy-widget');
  if (!widget) return;

  window.currentDaisyContext = 'idle';

  widget.style.cursor = 'pointer';

  // Add a speech bubble to the widget if it doesn't exist
  let bubble = document.getElementById('daisy-bubble');
  if (!bubble) {
    bubble = document.createElement('div');
    bubble.id = 'daisy-bubble';
    bubble.style.position = 'absolute';
    bubble.style.bottom = '110px';
    bubble.style.right = '50px';
    bubble.style.background = 'var(--bg, #111)';
    bubble.style.color = 'var(--c, #0ff)';
    bubble.style.padding = '12px 16px';
    bubble.style.borderRadius = '8px';
    bubble.style.border = '1px solid var(--c, #0ff)';
    bubble.style.fontSize = '12px';
    bubble.style.fontFamily = 'var(--font-mono, monospace)';
    bubble.style.maxWidth = '250px';
    bubble.style.boxShadow = '0 0 15px rgba(0,255,255,0.2)';
    bubble.style.opacity = '0';
    bubble.style.transition = 'opacity 0.3s ease';
    bubble.style.pointerEvents = 'none';
    bubble.style.zIndex = '10000';
    
    // Triangle pointer
    const pointer = document.createElement('div');
    pointer.style.position = 'absolute';
    pointer.style.bottom = '-6px';
    pointer.style.right = '20px';
    pointer.style.borderWidth = '6px 6px 0';
    pointer.style.borderStyle = 'solid';
    pointer.style.borderColor = 'var(--c, #0ff) transparent transparent transparent';
    
    const pointerInner = document.createElement('div');
    pointerInner.style.position = 'absolute';
    pointerInner.style.bottom = '-4px';
    pointerInner.style.right = '-5px';
    pointerInner.style.borderWidth = '5px 5px 0';
    pointerInner.style.borderStyle = 'solid';
    pointerInner.style.borderColor = 'var(--bg, #111) transparent transparent transparent';

    pointer.appendChild(pointerInner);
    bubble.appendChild(pointer);
    
    const textSpan = document.createElement('span');
    textSpan.id = 'daisy-bubble-text';
    bubble.appendChild(textSpan);
    
    widget.appendChild(bubble);
  }

  let bubbleTimeout = null;

  function setDaisyState(state, textKey) {
    // Reset classes
    widget.classList.remove('daisy-idle', 'daisy-think', 'daisy-celebrate', 'daisy-warn');
    widget.classList.add(`daisy-${state}`);
    
    // Update text and show bubble
    if (textKey && DaisyDialogues[textKey]) {
      window.currentDaisyContext = textKey;
      const textSpan = document.getElementById('daisy-bubble-text');
      textSpan.textContent = DaisyDialogues[textKey];
      bubble.style.opacity = '1';
      
      clearTimeout(bubbleTimeout);
      bubbleTimeout = setTimeout(() => {
        bubble.style.opacity = '0';
        
        // Go back to idle after a celebration or warning
        if (state === 'celebrate' || state === 'warn') {
           setTimeout(() => {
             widget.classList.remove(`daisy-${state}`);
             widget.classList.add('daisy-idle');
           }, 500); // Small buffer to let the animation finish
        }
      }, 5000); // Show text for 5 seconds
    } else if (!textKey) {
      // Just change state without text, hide bubble if any
      bubble.style.opacity = '0';
      if (state === 'celebrate' || state === 'warn') {
        setTimeout(() => {
          widget.classList.remove(`daisy-${state}`);
          widget.classList.add('daisy-idle');
        }, 2000); // Revert to idle after the animation
      }
    }
  }

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
        // Automatically revert to idle after thinking about algorithm
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

  // --- CHAT PANEL SETUP ---
  const chatPanel = document.createElement('div');
  chatPanel.id = 'daisy-chat';
  chatPanel.innerHTML = `
    <div id="daisy-chat-header">
      <span>Daisy // SECURE COMMS</span>
      <button id="daisy-chat-close">✖</button>
    </div>
    <div id="daisy-chat-history"></div>
    <div id="daisy-chat-input-area">
      <input type="text" id="daisy-chat-input" placeholder="Message Daisy..." autocomplete="off">
      <button id="daisy-chat-send">SEND</button>
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
      input.focus();
    }
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    chatPanel.classList.remove('open');
  });

  // Chat logic
  window.daisyChat = function(message) {
    if (!message.trim()) return;
    
    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'daisy-msg user';
    userMsg.textContent = message;
    history.appendChild(userMsg);
    
    // Daisy reply
    setTimeout(() => {
      const reply = DaisyDialogues[window.currentDaisyContext] || DaisyDialogues['idle'];
      const daisyMsg = document.createElement('div');
      daisyMsg.className = 'daisy-msg daisy';
      daisyMsg.textContent = reply;
      history.appendChild(daisyMsg);
      history.scrollTop = history.scrollHeight;
    }, 300);

    history.scrollTop = history.scrollHeight;
    input.value = '';
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
