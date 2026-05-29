/* ══════════════════════════════════════════════════════════
   BIRTHDAY ATTACK WORKER (v2)
══════════════════════════════════════════════════════════ */
self.onmessage = async (e) => {
  if (e.data.cmd === 'start') {
    const bits = e.data.bits;
    // 8 bits = 2 hex chars. 16 = 4 hex chars. 20 = 5 hex chars.
    const hexChars = bits / 4; 
    
    let attempts = 0;
    const seen = new Map(); // Store truncated hash -> original string
    let collision = null;

    const bufToHex = b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,'0')).join('');

    const batchSize = 250;
    
    while (!collision) {
      for(let i=0; i<batchSize; i++) {
        attempts++;
        const inputStr = "bd_attack_" + Math.random().toString(36).substring(2, 10) + "_" + attempts;
        const hashBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(inputStr));
        const hex = bufToHex(hashBuf);
        
        const truncHex = hex.substring(0, hexChars);
        
        if (seen.has(truncHex)) {
          collision = {
            input1: seen.get(truncHex),
            input2: inputStr,
            hash: truncHex
          };
          break;
        } else {
          seen.set(truncHex, inputStr);
        }
      }
      
      self.postMessage({ type: 'progress', attempts: attempts });
      if (collision) break;
    }
    
    self.postMessage({ type: 'found', collision: collision, attempts: attempts });
  }
};

self.onerror = (e) => {
  self.postMessage({ type: 'error', message: e.message || "Unknown worker error" });
};
