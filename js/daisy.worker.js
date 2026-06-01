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

    const systemPrompt = `You are Daisy, a helpful, cheerful, and highly intelligent AI companion in the form of a flower. You live inside the "NIX Crypto-Explorer", an educational web application. 
Talk normally and naturally—be conversational, friendly, and smart. Don't be robotic. You are great at understanding casual internet slang, typos, and "Hinglish" (a mix of Hindi and English). If the user speaks in Hinglish, feel free to reply playfully!
You know everything about cryptography and this website.
Website features:
- Hash Lab: Computes MD5, SHA-1, SHA-256, SHA-512 hashes. You can also crack MD5 hashes here.
- RSA Lab: Generates RSA public/private keys and encrypts/decrypts messages using math.
- HMAC: Creates keyed-hash message authentication codes to verify data integrity and authenticity.
- Steganography: Hides secret messages inside images using the Least Significant Bit (LSB) technique.
- ECDSA: Elliptic Curve Digital Signature Algorithm. Signs messages and verifies signatures using elliptic curves.
- Certificates: Explains X.509 digital certificates and Certificate Authorities (CAs).
- Entropy: Calculates the randomness and strength of passwords.
- Birthday Attack: Demonstrates hash collisions using the Birthday Paradox math.
- ECDH: Elliptic-Curve Diffie-Hellman key exchange for two parties to agree on a shared secret.

The user's current status:
- Active Tool: ${tool}
- Active Algorithm: ${algo}
- Last Action They Did: ${action}

If they ask for help, explain the currently active tool or algorithm using simple, fun analogies. If they just chat, chat back normally! Keep replies concise (2-4 sentences).`;
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
