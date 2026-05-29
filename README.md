# NIX // THE MATRIX PROTOCOL
**Interactive Cryptography & Cyber-Defense Simulation**

A hacker-themed, interactive playground designed to teach the fundamentals of modern cryptography. This platform bridges the gap between theoretical hashing and reversible encryption through an immersive terminal-based experience.

---

## 🕹️ Operational Modes

### 01 // MISSION (Story Mode)
A guided narrative simulation. Step into the shoes of a network operative to master cryptographic concepts under fire.
- **Visualize Avalanche Effects**: Watch how single-bit changes ripple through complex hash structures.
- **Simulate Brute Force**: Experience how dictionary attacks exploit weak hashing protocols using a real-time Web Worker.
- **Live Breach Response**: Defend virtual infrastructure using encryption protocols during simulated security incidents.
- **Digital Signatures (ECDSA)**: Generate keys, sign payloads, and observe how tampering invalidates trust.
- **Certificate Authority (PKI)**: Act as a Root CA, issue server certificates, and learn how HTTPS trust chains work.
- **Interactive Overlays**: Concept briefs, key term glossaries, and mission progress tracking for deep learning.
- **Accessible Design**: Full keyboard navigation across all interactive elements.

### 02 // SANDBOX (Pro Lab)
An unrestricted technical environment for raw experimentation.
- **Hash Engine**: Compare MD5, SHA-1, SHA-256, and SHA-512 with real-time bit-grid visualization.
- **AES-GCM Utility**: Symmetric encryption using PBKDF2 key derivation and AES-256-GCM payloads.
- **RSA Asymmetric**: Generate 2048-bit key pairs and simulate public-key encryption/decryption.
- **HMAC Auth**: Generate Hash-based Message Authentication Codes to verify data integrity.
- **LSB Steganography**: Hide and extract encrypted payloads within image pixels using Least Significant Bit encoding.
- **MD5 Cracker**: Run off-main-thread dictionary cracking attacks to demonstrate MD5 vulnerabilities.
- **ECDSA Signatures**: Generate P-256 keys, sign payloads securely, and observe cryptographic tampering detection.
- **Certificate Inspector**: Parse PEM X.509 certificates to extract Issuer, Subject, Validity, and SHA-256 fingerprints without third-party libraries.
- **Entropy Analyzer**: Calculate Shannon Entropy and measure bits-per-character density of input strings in real-time.
- **Birthday Attack**: Visualize hash collision probability curves utilizing a high-performance Web Worker to brute-force truncated hashes.

---

## 🛠️ Technical Architecture
- **Engine**: Built on the native **Web Crypto API** for high-performance, industry-standard cryptographic operations.
- **Frontend**: Vanilla JavaScript (ES6+) with a modular architecture (`app.js`, `crypto.js`, `data.js`, `story-mode-v2.js`, `story-explain.js`).
- **Web Workers**: Dedicated `md5-worker.js` and `birthday-worker.js` for non-blocking UI during intense hashing loops.
- **Styling**: Fully mobile-responsive cyber-themed "NIX" UI system using CSS `clamp()`, flexible grids, CRT scanlines, and 44x44px touch targets.
- **Compatibility**: Extensively audited and cross-browser tested on modern Chrome, Firefox, and Safari.

---

## 🚀 Quick Start
1.  Open `index.html` in any modern browser.
2.  Choose **Mission** for a guided tutorial or **Sandbox** for direct tool access.
3.  **Note**: For optimal performance and access to all Web Crypto features, it is recommended to run via a local server (e.g., `npx serve`).

---
**NIX // MATRIX PROTOCOL // SECURE CHANNEL ACTIVE**
