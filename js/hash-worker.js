importScripts('crypto.js');

self.onmessage = async (e) => {
  const { file, algo } = e.data;
  const chunkSize = 5 * 1024 * 1024; // 5MB
  let offset = 0;
  const total = file.size;
  
  const chunks = [];
  const t0 = performance.now();

  try {
    while (offset < total) {
      const slice = file.slice(offset, Math.min(offset + chunkSize, total));
      const buffer = await slice.arrayBuffer();
      chunks.push(new Uint8Array(buffer));
      offset += slice.size;
      
      self.postMessage({
        type: 'progress',
        pct: Math.round((offset / total) * 100),
        ms: (performance.now() - t0).toFixed(0)
      });
    }

    const finalBuffer = new Uint8Array(total);
    let ptr = 0;
    for (let c of chunks) {
      finalBuffer.set(c, ptr);
      ptr += c.length;
    }

    const r = await CE.hash(algo, finalBuffer.buffer);
    r.ms = (performance.now() - t0).toFixed(2);
    
    self.postMessage({ type: 'done', result: r });
  } catch (err) {
    self.postMessage({ type: 'error', message: err.message });
  }
};
