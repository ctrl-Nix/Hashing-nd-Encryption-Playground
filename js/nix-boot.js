(function() {

  const bootOverlay = document.createElement('div');
  bootOverlay.style.cssText = 'position:fixed; inset:0; background:#050508; z-index:999999; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#00f5ff; font-family:"Share Tech Mono", monospace; overflow:hidden;';
  
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute; inset:0; opacity:0.25; z-index:1;';
  bootOverlay.appendChild(canvas);
  
  const terminal = document.createElement('div');
  terminal.style.cssText = 'position:relative; z-index:2; width:90%; max-width:800px; font-size:16px; line-height:1.8; text-shadow:0 0 10px rgba(0,245,255,0.4);';
  bootOverlay.appendChild(terminal);
  
  document.body.appendChild(bootOverlay);
  document.body.style.overflow = 'hidden';

  // Audio Context (Optional, triggers if user clicked recently, but we'll try)
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
      osc.frequency.setValueAtTime(150 + Math.random()*50, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch(e) {}
  };

  // Matrix Rain
  const ctx = canvas.getContext('2d');
  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  window.addEventListener('resize', resize);
  resize();
  
  const cols = Math.floor(canvas.width / 20);
  const drops = Array(cols).fill(1);
  const chars = 'アイウエオカキクケコ0123456789ABCDEF<>{}|/\\!@#$';
  const rainAnim = setInterval(() => {
    ctx.fillStyle = 'rgba(5, 5, 8, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00f5ff'; 
    ctx.font = '14px "Share Tech Mono", monospace';
    drops.forEach((y,i) => {
      ctx.fillText(chars[Math.floor(Math.random()*chars.length)], i*20, y*20);
      if(y*20>canvas.height && Math.random()>0.975) drops[i]=0;
      drops[i]++;
    });
  }, 50);

  const pause = ms => new Promise(r => setTimeout(r, ms));
  const typeText = async (prefix, text, color='#00f5ff', speed = 25) => {
    const line = document.createElement('div');
    line.style.marginBottom = '12px';
    
    if (prefix) {
      const prefSpan = document.createElement('span');
      prefSpan.style.color = '#ff003c';
      prefSpan.style.marginRight = '12px';
      prefSpan.textContent = prefix;
      line.appendChild(prefSpan);
    }

    const textSpan = document.createElement('span');
    textSpan.style.color = color;
    line.appendChild(textSpan);
    terminal.appendChild(line);
    
    for(let i=0; i<text.length; i++) {
      textSpan.textContent += text[i];
      if (text[i] !== ' ' && i % 2 === 0) playTypingSound();
      await pause(speed);
    }
    return line;
  };

  const initBoot = async () => {
    await pause(400);
    await typeText('[SYS]', 'INITIALIZING SECURE HANDSHAKE...', '#a0aec0', 15);
    await pause(200);
    await typeText('[SYS]', 'ESTABLISHING ENCRYPTED TUNNEL...', '#a0aec0', 10);
    await pause(400);

    const isCheatsheet = document.title.toLowerCase().includes('cheatsheet');
    
    if (isCheatsheet) {
      await typeText('[NIX]', 'Accessing the Senior Cryptography Archives.', '#00ff88', 35);
      await pause(500);
      await typeText('[NIX]', 'Decrypting AES-GCM tags... Stand by.', '#00ff88', 25);
      await pause(400);
      await typeText('[SYS]', 'REFERENCE MATERIAL LOADED.', '#fff', 15);
    } else {
      await typeText('[NIX]', 'Welcome to the Matrix Protocol.', '#00ff88', 35);
      await pause(500);
      await typeText('[NIX]', 'The ultimate Cryptography Sandbox and Cyber-Defense Simulator.', '#00ff88', 30);
      await pause(400);
      await typeText('[SYS]', 'UPLINK ESTABLISHED. RENDER ENGINE START.', '#fff', 15);
    }

    await pause(1000);
    
    // Glitch and Fade out
    bootOverlay.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    bootOverlay.style.opacity = '0';
    bootOverlay.style.transform = 'scale(1.05)';
    
    setTimeout(() => {
      bootOverlay.remove();
      clearInterval(rainAnim);
      document.body.style.overflow = '';
      window.removeEventListener('resize', resize);
    }, 800);
  };

  // Add a click-to-start overlay if we want audio to be guaranteed, 
  // but since it's a landing page we auto-play visuals and attempt audio
  initBoot();

})();
