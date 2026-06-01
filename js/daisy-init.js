function initDaisy() {
  const widget = document.getElementById('daisy-widget');
  if (!widget) return;

  // Status dot creation
  let statusDot = document.getElementById('daisy-status-dot');
  if (!statusDot) {
    statusDot = document.createElement('div');
    statusDot.id = 'daisy-status-dot';
    widget.appendChild(statusDot);
  }

  // ─── DAISY CONTEXT ───
  window.DaisyContext = {
    currentTool: 'hash',
    currentAlgo: 'none',
    lastAction: 'none'
  };

  // ─── EXPRESSION SWITCHING ───
  const EXPRESSIONS = ['idle', 'think', 'celebrate', 'warn', 'sleep'];

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
    // Prevent state changes if dragging or sleeping (unless explicitly waking up)
    if (widget.classList.contains('daisy-drag')) return;
    
    // If still in flower mode, do not animate limbs
    if (widget.classList.contains('daisy-flower')) {
      if (textKey && DaisyDialogues[textKey]) {
        const textSpan = document.getElementById('daisy-bubble-text');
        textSpan.textContent = DaisyDialogues[textKey];
        bubble.classList.add('visible');
        clearTimeout(bubbleTimeout);
        bubbleTimeout = setTimeout(() => {
          bubble.classList.remove('visible');
        }, 4000); // 4s auto-hide
      }
      return;
    }

    // Reset animation classes
    widget.classList.remove('daisy-idle', 'daisy-think', 'daisy-celebrate', 'daisy-warn', 'daisy-sleep');
    widget.classList.add(`daisy-${state}`);
    setDaisyExpression(state);

    // Show bubble text
    if (textKey && DaisyDialogues[textKey]) {
      const textSpan = document.getElementById('daisy-bubble-text');
      textSpan.textContent = DaisyDialogues[textKey];
      bubble.classList.add('visible');

      clearTimeout(bubbleTimeout);
      bubbleTimeout = setTimeout(() => {
        bubble.classList.remove('visible');

        if (state === 'celebrate' || state === 'warn') {
          setTimeout(() => {
            if (!widget.classList.contains('daisy-sleep')) {
              widget.classList.remove(`daisy-${state}`);
              widget.classList.add('daisy-idle');
              setDaisyExpression('idle');
            }
          }, 500);
        }
      }, 4000); // 4s auto-hide
    } else if (!textKey) {
      bubble.classList.remove('visible');
      if (state === 'celebrate' || state === 'warn') {
        setTimeout(() => {
          if (!widget.classList.contains('daisy-sleep')) {
            widget.classList.remove(`daisy-${state}`);
            widget.classList.add('daisy-idle');
            setDaisyExpression('idle');
          }
        }, 2000);
      }
    }
  }

  // Helper for proactive bubbles
  let proactiveTimeout = null;
  function triggerProactiveBubble(state, textKey) {
    // Don't trigger if sleeping
    if (widget.classList.contains('daisy-sleep')) return;
    clearTimeout(proactiveTimeout);
    proactiveTimeout = setTimeout(() => {
      setDaisyState(state, textKey);
    }, 600);
  }

  // ─── INITIAL GREETING ───
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
  if (window.App && App.switchLabTab) {
    const orig = App.switchLabTab;
    App.switchLabTab = function(tabId) {
      orig.call(App, tabId);
      window.DaisyContext.currentTool = tabId;
      triggerProactiveBubble('idle', tabId);
    };
  }

  if (window.App && App.setLabAlgo) {
    const orig = App.setLabAlgo;
    App.setLabAlgo = function(algo) {
      orig.call(App, algo);
      window.DaisyContext.currentAlgo = algo;
      
      if (algo === 'MD5' || algo === 'SHA-1') {
        triggerProactiveBubble('warn', algo);
      } else {
        triggerProactiveBubble('think', algo);
        // Switch back to idle after thinking
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

  if (window.App && App.runLabHash) {
    const orig = App.runLabHash;
    App.runLabHash = async function() {
      if (!widget.classList.contains('daisy-sleep')) setDaisyState('think');
      let res;
      try {
        res = await orig.apply(App, arguments);
        window.DaisyContext.lastAction = 'just hashed a string';
      } catch (e) {
        if (!widget.classList.contains('daisy-sleep')) setDaisyState('warn', 'warn');
        throw e;
      }
      if (!widget.classList.contains('daisy-sleep')) setDaisyState('celebrate', 'celebrate');
      return res;
    };
  }

  if (window.App && App.runRSAGen) {
    const orig = App.runRSAGen;
    App.runRSAGen = async function() {
      if (!widget.classList.contains('daisy-sleep')) setDaisyState('think');
      let res;
      try {
        res = await orig.apply(App, arguments);
        window.DaisyContext.lastAction = 'generated RSA keys';
      } catch (e) {
        if (!widget.classList.contains('daisy-sleep')) setDaisyState('warn', 'warn');
        throw e;
      }
      if (!widget.classList.contains('daisy-sleep')) setDaisyState('celebrate', 'celebrate');
      return res;
    };
  }

  if (window.App && App.startMD5Crack) {
    const orig = App.startMD5Crack;
    App.startMD5Crack = function() {
      if (!widget.classList.contains('daisy-sleep')) setDaisyState('think', 'cracker');
      window.DaisyContext.lastAction = 'cracked MD5';
      orig.apply(App, arguments);
    };
  }

  if (window.AchievementSystem && AchievementSystem.unlock) {
    const orig = AchievementSystem.unlock;
    AchievementSystem.unlock = function(id) {
      orig.call(AchievementSystem, id);
      if (!widget.classList.contains('daisy-sleep')) setDaisyState('celebrate', 'celebrate');
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

  // ─── TICKLE ANIMATION ───
  let tickleTimeout;
  widget.addEventListener('mouseenter', () => {
    if (widget.classList.contains('daisy-sleep') || widget.classList.contains('daisy-drag') || widget.classList.contains('daisy-flower')) return;
    widget.classList.add('daisy-tickle');
    clearTimeout(tickleTimeout);
    tickleTimeout = setTimeout(() => {
      widget.classList.remove('daisy-tickle');
    }, 400);
  });

  // ─── TOGGLE CHAT / WAKE UP ───
  // We use a flag to separate drag from click
  let isDragging = false;
  widget.addEventListener('click', (e) => {
    if (isDragging) return; // Prevent click if we were dragging

    // Wake up from flower or sleep mode
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

  // ─── DRAG AND DROP ───
  let dragOffsetX = 0;
  let dragOffsetY = 0;

  widget.addEventListener('mousedown', (e) => {
    // Only drag with left click, don't drag if input focused
    if (e.button !== 0 || e.target.tagName === 'INPUT') return;
    e.preventDefault(); // Prevent text selection
    
    isDragging = false;
    const rect = widget.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;

    function onMouseMove(moveEvent) {
      isDragging = true;
      widget.classList.add('daisy-drag');
      // Calculate new position
      let newX = moveEvent.clientX - dragOffsetX;
      let newY = moveEvent.clientY - dragOffsetY;
      
      // Keep within bounds
      newX = Math.max(0, Math.min(newX, window.innerWidth - widget.offsetWidth));
      newY = Math.max(0, Math.min(newY, window.innerHeight - widget.offsetHeight));

      widget.style.left = newX + 'px';
      widget.style.top = newY + 'px';
      widget.style.right = 'auto'; // Disable right/bottom positioning
      widget.style.bottom = 'auto';
    }

    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      widget.classList.remove('daisy-drag');
      // Reset isDragging after a short delay so click event doesn't fire
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

    // Eye tracking logic (only when idle, think, or celebrate)
    if (widget.classList.contains('daisy-flower') || widget.classList.contains('daisy-sleep')) return;

    const rect = widget.getBoundingClientRect();
    // Approximate center of Daisy's face in the SVG
    const faceX = rect.left + rect.width / 2;
    const faceY = rect.top + rect.height * 0.4;

    const dx = e.clientX - faceX;
    const dy = e.clientY - faceY;
    
    // Map full screen distance to a tiny pixel translation (-2.5px to +2.5px)
    const distance = Math.sqrt(dx*dx + dy*dy);
    const maxMove = 2.5;
    
    // Normalize and scale
    let moveX = (dx / window.innerWidth) * maxMove * 2;
    let moveY = (dy / window.innerHeight) * maxMove * 2;
    
    // Clamp
    moveX = Math.max(-maxMove, Math.min(maxMove, moveX));
    moveY = Math.max(-maxMove, Math.min(maxMove, moveY));

    widget.style.setProperty('--eye-x', moveX + 'px');
    widget.style.setProperty('--eye-y', moveY + 'px');
  });

  document.addEventListener('keydown', resetActivity);
  document.addEventListener('click', resetActivity);

  // Inactivity loop (60 seconds)
  setInterval(() => {
    if (Date.now() - lastInteractionTime > 60000) {
      if (!widget.classList.contains('daisy-flower') && !widget.classList.contains('daisy-sleep')) {
        widget.classList.remove('daisy-idle', 'daisy-think', 'daisy-celebrate', 'daisy-warn');
        widget.classList.add('daisy-sleep');
        setDaisyExpression('sleep');
      }
    }
  }, 5000);

  // ─── TYPING ANIMATION (LISTEN STATE) ───
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
      statusDot.className = 'loading'; // Red pulse
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
        statusDot.className = 'ready'; // Green static
      }
      currentResponseDiv.textContent += text;
      history.scrollTop = history.scrollHeight;
      
      widget.classList.remove('daisy-idle', 'daisy-celebrate', 'daisy-warn', 'daisy-sleep');
      widget.classList.add('daisy-think');
      setDaisyExpression('think');

    } else if (type === 'done') {
      widget.classList.remove('daisy-think');
      widget.classList.add('daisy-celebrate');
      setDaisyExpression('celebrate');
      
      setTimeout(() => {
        if (!widget.classList.contains('daisy-sleep')) {
          widget.classList.remove('daisy-celebrate');
          widget.classList.add('daisy-idle');
          setDaisyExpression('idle');
        }
      }, 1500);

      currentResponseDiv = null;
      
      if (currentMessageQueue.length > 0) {
        const nextMsg = currentMessageQueue.shift();
        sendToWorker(nextMsg);
      }

    } else if (type === 'error') {
      console.warn("Daisy Worker Error:", e.data.error);
      
      if (currentProgressDiv) {
        currentProgressDiv.remove();
        currentProgressDiv = null;
      }
      modelLoading = false;
      statusDot.className = ''; // Revert to grey
      
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
    
    // Remove typing state
    widget.classList.remove('daisy-listen');
    clearTimeout(typingTimeout);

    widget.classList.remove('daisy-idle', 'daisy-celebrate', 'daisy-warn', 'daisy-sleep');
    widget.classList.add('daisy-think');
    setDaisyExpression('think');

    if (!modelLoaded && !modelLoading) {
      modelLoading = true;
      statusDot.className = 'loading'; // Red pulse
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
