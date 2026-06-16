# NIX Cryptography Explorer & Defense Simulator

<div align="center">
  <em>A highly performant, 100% client-side web platform engineered to demystify applied cryptography through real-time, interactive visualization.</em>
</div>

<br />

<!-- SCREENSHOT PLACEHOLDER 1: Hero or Dashboard -->
![NIX Dashboard / Hero Image](docs/banner.png)

## 📖 Project Overview

**NIX Protocol** is an interactive, browser-based cybersecurity sandbox designed to bridge the gap between theoretical cryptographic concepts and practical, hands-on implementation. Built entirely without a backend server, the platform leverages the native Web Cryptography API and parallelized Web Workers to execute enterprise-grade operations—such as AES-GCM payload encryption, ECDH key negotiation, and MD5 collision brute-forcing—directly within the browser's local sandbox.

Whether you are a student visualizing the avalanche effect of a SHA-256 hash, or a security engineer parsing a PEM-encoded X.509 certificate chain, NIX provides a buttery-smooth, deeply interactive environment to validate architectural concepts in real-time.

---

## ✨ Core Features

### 01 // Interactive Pro Sandbox
An unrestricted technical environment for raw cryptographic experimentation:
- **Hashing & Entropy**: Compare MD5, SHA-1, SHA-256, and SHA-512 algorithms. Calculate Shannon Entropy and measure bits-per-character density of input strings.
- **Symmetric & Asymmetric Encryption**: Generate 2048-bit RSA key pairs, and execute symmetric encryption utilizing PBKDF2 key derivation and AES-256-GCM payloads.
- **Digital Signatures (ECDSA)**: Generate P-256 keys, sign payloads, and observe real-time cryptographic tampering detection.
- **Certificate Inspector & Chain Verifier**: Parse raw PEM X.509 certificates to extract metadata, or paste an entire certificate chain (leaf to root) to visually verify the chain of trust using native browser cryptography.
- **LSB Steganography**: Hide and extract encrypted payloads within image pixels using Least Significant Bit encoding.
- **Two-User ECDH Key Exchange**: Secure, end-to-end symmetric key derivation utilizing shareable links and dynamically rendered QR codes for real-time browser-to-browser cryptography.

<!-- SCREENSHOT PLACEHOLDER 2: Sandbox / Tool UI -->
![NIX Sandbox Tools](docs/screenshot-sandbox-placeholder.png)

### 02 // Live Threat Simulations
Stop reading theory and start visualizing vulnerabilities:
- **Birthday Attack Collision Engine**: Visualize hash collision probability curves utilizing a high-performance Web Worker to brute-force truncated hashes. 
- **MD5 Dictionary Cracker**: Run off-main-thread dictionary cracking attacks utilizing a 10,000-word payload to demonstrate legacy algorithm vulnerabilities.
- **Large File Analysis**: Real-time chunked hashing of 100MB+ files without locking the main UI thread.

### 03 // Narrative Story Mode
A gamified, 9-chapter simulation engine designed to teach cryptographic fundamentals step-by-step:
- Intercept and decode simulated "enemy" transmissions.
- Master cryptographic concepts under fire using an integrated AI Assistant ("Daisy") that provides context-aware hints via localized models.

<!-- SCREENSHOT PLACEHOLDER 3: Story Mode / Cyber UI -->
![NIX Story Mode UI](docs/screenshot-story-placeholder.png)

### 04 // Daisy: Local AI Companion
A highly intelligent, fully local AI assistant integrated directly into the sandbox:
- **Zero-Server Inference**: Powered by Hugging Face `Transformers.js`, Daisy downloads and runs a 0.5B parameter LLM (Qwen) entirely inside your browser's Web Worker. No API keys, no cloud servers, 100% privacy.
- **Context-Aware Assistance**: Daisy monitors your current active tool (e.g., MD5 hashing or AES encryption) and provides tailored, conversational explanations, hints, and analogies.
- **Interruptible Streaming**: Real-time token streaming with full UI integration, including dynamic facial expressions, drag-and-drop physics, and user-triggered response abortion.

---

## 🏗️ Architecture Overview

The platform was engineered from the ground up to operate on a **Zero-Trust, Zero-Server Architecture**. Every cryptographic operation is executed strictly within the client utilizing the native `window.crypto.subtle` API, ensuring that sensitive inputs, private keys, and encrypted payloads never touch an external network.

To maintain a 60 FPS user experience while performing computationally intensive tasks (e.g., probabilistic collision modeling and rapid dictionary cracking), the architecture heavily utilizes **Web Workers**. This offloads thread-blocking `while` loops and heavy buffer allocations to background threads. The frontend is built entirely on Vanilla ES6+ modules, ensuring zero dependency bloat, near-instant load times (achieving a 90+ Lighthouse Performance score), and high resilience against supply-chain vulnerabilities.

## 💻 Built With

- **Core Logic**: HTML5, CSS3, Vanilla ES6+ JavaScript
- **Security Primitives**: Native Web Cryptography API (`crypto.subtle`)
- **Performance**: HTML5 Web Workers (Parallel processing)
- **Tooling**: Node.js / `npx serve` for local execution
- **UI/UX**: Custom "Matrix-inspired" UI framework featuring CSS Variables, `clamp()` fluid typography, responsive CSS Grid layouts, and dynamic DOM manipulation.

---

## 🚀 How to Run Locally

Because NIX relies on advanced Web APIs (like Web Workers and `crypto.subtle`), it must be served over `http://localhost` (or HTTPS) rather than the `file://` protocol. 

To spin up the project locally, simply open your terminal in the root directory and run:

```bash
npx serve .
```
*(Alternatively, you can use `python -m http.server 8000`)*

Then navigate to `http://localhost:3000` in your modern web browser.

---
**NIX // MATRIX PROTOCOL // SECURE CHANNEL ACTIVE**
