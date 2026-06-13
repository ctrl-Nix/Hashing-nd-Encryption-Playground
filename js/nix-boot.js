(function() {

  const style = document.createElement('style');
  style.textContent = `
    @keyframes nix-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
    .nix-cursor { animation: nix-blink 0.8s step-end infinite; margin-left: 6px; vertical-align: bottom; }
    @keyframes nix-rgb-shift {
      0% { transform: translate(1px, 1px); text-shadow: 2px 0 #00f5ff, -2px 0 #ff003c; }
      20% { transform: translate(-1px, -2px); text-shadow: -2px 0 #00f5ff, 2px 0 #ff003c; }
      40% { transform: translate(-2px, 1px); text-shadow: 2px 0 #00f5ff, -2px 0 #ff003c; }
      60% { transform: translate(2px, 1px); text-shadow: -2px 0 #00f5ff, 2px 0 #ff003c; }
      80% { transform: translate(1px, -1px); text-shadow: 2px 0 #00f5ff, -2px 0 #ff003c; }
      100% { transform: translate(0, 0); text-shadow: 2px 0 #00f5ff, -2px 0 #ff003c; }
    }
    .nix-glitch { animation: nix-rgb-shift 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite; display: inline-block; }
  `;
  document.head.appendChild(style);

  const bootOverlay = document.createElement('div');
  bootOverlay.style.cssText = 'position:fixed; inset:0; background:#040406; z-index:999999; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#00f5ff; font-family:"Share Tech Mono", monospace; overflow:hidden; perspective:1000px;';
  
  // CRT Scanlines
  const scanlines = document.createElement('div');
  scanlines.style.cssText = 'position:absolute; inset:0; z-index:3; pointer-events:none; background:linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size:100% 4px, 3px 100%; opacity:0.7;';
  bootOverlay.appendChild(scanlines);

  // Vignette
  const vignette = document.createElement('div');
  vignette.style.cssText = 'position:absolute; inset:0; z-index:4; pointer-events:none; background:radial-gradient(circle at center, transparent 40%, #000 120%); opacity:0.9;';
  bootOverlay.appendChild(vignette);

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute; inset:0; opacity:0.35; z-index:1; filter: drop-shadow(0 0 5px #00f5ff);';
  bootOverlay.appendChild(canvas);
  
  const terminal = document.createElement('div');
  terminal.style.cssText = 'position:relative; z-index:2; width:90%; max-width:800px; font-size:18px; line-height:1.8; text-shadow:0 0 12px rgba(0,245,255,0.6); margin-top:-5%;';
  bootOverlay.appendChild(terminal);
  
  document.body.appendChild(bootOverlay);
  document.body.style.overflow = 'hidden';

  // Audio Context
  let audioCtx = null;
  const playTypingSound = () => {
    try {
      if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === 'suspended') return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(200 + Math.random()*100, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.03);
    } catch(e) {}
  };

  // Upgraded Matrix Rain
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  window.addEventListener('resize', resize);
  resize();
  
  const cols = Math.floor(canvas.width / 20);
  const drops = Array(cols).fill(1);
  const chars = 'アイウエオカキクケコ0123456789ABCDEF<>{}|/\\!@#$';
  
  const rainAnim = setInterval(() => {
    ctx.fillStyle = 'rgba(4, 4, 6, 0.15)'; // Trail length
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '16px "Share Tech Mono", monospace';
    
    drops.forEach((y,i) => {
      const char = chars[Math.floor(Math.random()*chars.length)];
      
      // Draw the bright white head
      ctx.fillStyle = '#ffffff'; 
      ctx.fillText(char, i*20, y*20);
      
      // Draw the cyan tail behind it
      ctx.fillStyle = '#00f5ff';
      ctx.fillText(chars[Math.floor(Math.random()*chars.length)], i*20, (y-1)*20);

      if(y*20 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  }, 40);

  const pause = ms => new Promise(r => setTimeout(r, ms));
  
  const typeText = async (prefix, text, color='#00f5ff') => {
    const line = document.createElement('div');
    line.style.marginBottom = '14px';
    
    if (prefix) {
      const prefSpan = document.createElement('span');
      prefSpan.style.color = '#ff003c';
      prefSpan.style.marginRight = '14px';
      prefSpan.style.fontWeight = 'bold';
      prefSpan.style.textShadow = '0 0 10px rgba(255,0,60,0.8)';
      prefSpan.textContent = prefix;
      line.appendChild(prefSpan);
    }

    const textSpan = document.createElement('span');
    textSpan.style.color = color;
    textSpan.style.textShadow = `0 0 12px ${color}90`;
    line.appendChild(textSpan);
    
    const cursor = document.createElement('span');
    cursor.textContent = '█';
    cursor.className = 'nix-cursor';
    cursor.style.color = color;
    cursor.style.textShadow = `0 0 10px ${color}`;
    line.appendChild(cursor);
    
    terminal.appendChild(line);
    
    for(let i=0; i<text.length; i++) {
      textSpan.textContent += text[i];
      if (text[i] !== ' ' && i % 2 === 0) playTypingSound();
      
      // Dynamic typing speed for realism
      let delay = Math.random() * 40 + 10;
      if (text[i] === '.') delay += 300;
      if (text[i] === ',') delay += 150;
      await pause(delay);
    }
    
    // Random glitch effect on completed line
    if (Math.random() > 0.3) {
      const orig = textSpan.textContent;
      textSpan.classList.add('nix-glitch');
      textSpan.textContent = orig.split('').map(c => Math.random()>0.8 ? '!<>-_\\/[]{}—=+*^?#'[Math.floor(Math.random()*17)] : c).join('');
      await pause(100 + Math.random()*150);
      textSpan.classList.remove('nix-glitch');
      textSpan.textContent = orig;
    }

    cursor.remove();
    return line;
  };

  const initBoot = async () => {
    await pause(600);
    await typeText('[SYS]', 'INITIALIZING SECURE HANDSHAKE...', '#a0aec0');
    await pause(100);
    await typeText('[SYS]', 'ESTABLISHING ENCRYPTED TUNNEL...', '#a0aec0');
    await pause(300);

    const isCheatsheet = document.title.toLowerCase().includes('cheatsheet');
    
    if (isCheatsheet) {
      await typeText('[NIX]', 'Accessing the Senior Cryptography Archives.', '#00ff88');
      await pause(400);
      await typeText('[NIX]', 'Decrypting AES-GCM tags... Stand by.', '#00ff88');
      await pause(200);
      await typeText('[SYS]', 'REFERENCE MATERIAL LOADED. SECURE CHANNEL ACTIVE.', '#ffffff');
    } else {
      await typeText('[NIX]', 'Welcome to the Matrix Protocol.', '#00ff88');
      await pause(400);
      await typeText('[NIX]', 'The ultimate Cryptography Sandbox and Cyber-Defense Simulator.', '#00ff88');
      await pause(200);
      await typeText('[SYS]', 'UPLINK ESTABLISHED. RENDER ENGINE START.', '#ffffff');
    }

    await pause(800);
    
    // Fade terminal text out first
    terminal.style.transition = 'opacity 0.4s ease';
    terminal.style.opacity = '0';
    await pause(300);
    
    // Smoothly dissolve the entire matrix background
    bootOverlay.style.transition = 'opacity 1.2s ease-in-out';
    bootOverlay.style.opacity = '0';
    
    setTimeout(() => {
      bootOverlay.remove();
      document.head.removeChild(style);
      clearInterval(rainAnim);
      document.body.style.overflow = '';
      window.removeEventListener('resize', resize);
    }, 1200);
  };

  initBoot();

})();
