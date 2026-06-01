importScripts('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3/dist/transformers.min.js');

let generator;

self.addEventListener('message', async (event) => {
  const { type, text, context } = event.data;

  if (type === 'generate') {
    if (!generator) {
      try {
        generator = await pipeline('text-generation', 'Xenova/Qwen2.5-0.5B-Instruct', {
          progress_callback: (x) => {
            if (x.status === 'progress' || x.status === 'downloading') {
               // Post progress back
               const pct = x.progress || 0;
               self.postMessage({ type: 'progress', pct, file: x.file || 'model' });
            }
          }
        });
      } catch (err) {
        self.postMessage({ type: 'error', error: err.message });
        return;
      }
    }

    const { tool = 'idle', algo = 'none', action = 'none' } = context || {};

    const systemPrompt = `You are Daisy, a cheerful daisy flower with stick arms inside a cryptography playground called NIX. Explain crypto concepts in simple fun analogies. Keep replies under 3 sentences. Be warm. Current tool: ${tool}. Current algo: ${algo}. Last action: ${action}.`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: text }
    ];

    try {
      let finalReply = "";
      const streamer = new TextStreamer(generator.tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: (token) => {
          finalReply += token;
          self.postMessage({ type: 'token', text: token });
        }
      });

      await generator(messages, {
        max_new_tokens: 128,
        temperature: 0.7,
        streamer: streamer
      });

      self.postMessage({ type: 'done', text: finalReply });
    } catch (err) {
      self.postMessage({ type: 'error', error: err.message });
    }
  }
});
