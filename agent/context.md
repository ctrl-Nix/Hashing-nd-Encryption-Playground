# System Context — NIX // MATRIX PROTOCOL

This document outlines the operational context, active state variables, and architectural modifications introduced in Version 1, 2, and 3.

---

## 1. System State & State Variables

The application's runtime state is stored in the `App.S` object inside [app.js](file:///c:/Users/KIIT/OneDrive/Desktop/play/Hashing-nd-Encryption-Playground/js/app.js). 

```javascript
App.S = {
  alias: '',  // Current operator alias
  lab: {
    algo: 'SHA-256',      // Lab hashing algorithm
    hmacAlgo: 'SHA-256',  // Lab HMAC algorithm
    stegoImg: null,       // Loaded stego carrier image
    encMode: 'enc',       // Lab encryption mode ('enc' or 'dec')
    fileObj: null,        // Active File object for worker processing
    fileName: ''          // Active file name loaded in Hash lab
  },
  story: {
    step: 0,              // Current story step
    maxStep: 0,           // Max unlocked story step (persisted to localStorage)
    algo: 'SHA-256',      // Active hashing algorithm in story step 0
    pwd: '',              // Control node password
    hashHex: '',          // Password hash hexadecimal
    hashBits: '',         // Password hash bit string
    cipherData: null,     // AES ciphertext payload
    tampered: false,      // Message/cert tampering indicator
    score: 0,             // Quiz score tracking
    // ECDSA & CA State variables
    ecdsaKeyPair: null,   // Active ECDSA key pair
    ecdsaPubKeyHex: '',   // ECDSA public key in hex
    ecdsaMsg: '',         // Original message signed
    ecdsaSig: null,       // ECDSA signature ArrayBuffer
    ecdsaSigHex: '',      // ECDSA signature hex
    sigVerifiedValid: false,
    sigVerifiedInvalid: false,
    caKeys: null,         // Root CA ECDSA P-256 key pair
    serverKeys: null,     // Server certificate ECDSA P-256 key pair
    certStr: '',          // Serialized certificate JSON string
    certSig: null,        // Certificate signature ArrayBuffer
    certSigHex: '',       // Certificate signature hex
    certVerified: false,  // Padlock verification indicator
    certTampered: false   // Certification tampering checker
  }
}
```

---

## 2. Web Workers & Concurrent Execution

- **md5-worker**: Spawns `js/md5-worker.js` to run MD5 dictionary cracking concurrently.
- **birthday-worker**: Spawns `js/birthday-worker.js` to run Birthday Attack hash collision loops concurrently without blocking the UI.
- **hash-worker**: Spawns `js/hash-worker.js` to process large file hashing (100MB+) via 5MB chunk slicing and offloaded `crypto.subtle` hashing.

---

## 3. Story Workflow Mapping

The story steps have been re-numbered and expanded to support a 9-step progression:

| Step Index | Title | Section / Case | Primary Cryptography Calls |
| :--- | :--- | :--- | :--- |
| **0** | Init Hashing | `step === 0` | MD5, SHA-1, SHA-256, SHA-512 |
| **1** | Avalanche | `step === 1` | SHA-256 Hashing |
| **2** | Auth / Brute Force | `step === 2` | Hashing comparison |
| **3** | Breach Cutscene | `step === 3` | Matrix interface animation |
| **4** | AES-GCM Encryption | `step === 4` | PBKDF2 stretching & AES-256-GCM |
| **5** | Steganography LSB | `step === 5` | LSB pixel encoding |
| **6** | The Forger (ECDSA) | `step === 6` | SubtleCrypto ECDSA sign & verify |
| **7** | The Authority (PKI) | `step === 7` | SubtleCrypto ECDSA sign & verify |
| **8** | Final Evaluation | `step === 8` | Quiz question loops |

---

## 4. Architectural Modifications in v1, v2, & v3

1. **Accessibility**: Integrated keyboard focus attributes and delegated space/enter listeners to enable mouse-free operation across all custom components.
2. **File Processing**: Optimized MD5 file hashing with direct buffer inputs. Introduced `hash-worker.js` to handle large `File` objects incrementally, preventing main thread freezing.
3. **Patcher/Encoding Stability**: Corrected a malformed UTF-8 header in `js/app.js` to prevent browser file-load and development server decode failures.
4. **Persistence Architecture**: Integrated `AchievementSystem` relying on local storage. Re-wrote `showNextBtn` logic to utilize local storage for `App.S.story.maxStep`. Story completion (`nextIdx > 8`) now also sets `nix_story_completed` in localStorage and triggers a fullscreen congratulations overlay.
5. **Session Serialization**: Introduced Session Manager to serialize and export live Sandbox states (including inputs, algorithm params, and ciphertexts). Securely protects data using PBKDF2 and AES-GCM for optional file encryptions.
   - **Correct sandbox element IDs** (as of v3 patch): `lab-hash-in`, `lab-hash-salt`, `lab-hash-out` (Hash Engine); `lab-enc-data`, `lab-enc-out`, `lab-enc-out-iv` (AES-GCM); `cmp-input` (Compare); `hmac-data`, `lab-hmac-out` (HMAC); `entropy-input` (Entropy); `ecdsa-msg`, `ecdsa-pub-out`, `ecdsa-sig-out` (ECDSA); `ecdh-fingerprint` (ECDH).
6. **Stateless Cross-Browser Sharing**: Utilized hash fragments (`#share=` and `#ecdh=`) with base64url-encoded JSON payloads to bypass the server completely when sharing keys and parameters between browser clients. The `#share=` loader calls `App.startLab()` before populating fields to ensure the DOM is active.
7. **v2 Sandbox Additions**: Added 4 new advanced labs to the sandbox.
   - **ECDSA Signatures**: Generates P-256 keys. Includes a "Tamper" feature to flip one bit and demonstrate verification failure.
   - **Cert Inspector**: Parses PEM-encoded X.509 certificates and checks validity (expiration, self-signed).
   - **Entropy Analyzer**: Calculates Shannon Entropy (`bits/char`). Now properly checks input against a local Top-10,000 password list (loaded globally as `TOP_PASSWORDS`) to detect compromised inputs.
   - **Birthday Attack**: Uses Web Workers (`birthday-worker.js`) to find hash collisions and visualize the probability curve, with an option to export the collision as a JSON proof card.
8. **v4 QA & Performance**: Achieved complete Web Content Accessibility Guidelines (WCAG) 2.1 AA compliance.
   - **ARIA Semantics**: Injected `aria-label`, `role="button"`, and `tabindex="0"` to all interactive `lab-tab` elements. Applied `aria-hidden="true"` to visual-only `canvas` elements.
   - **Error Handling**: Wrapped all native Web Crypto promises with a global `unhandledrejection` listener that intercepts `DOMException`s and renders them in the UI via `#global-error-toast` instead of silently failing.
   - **Stretch Tools**: Integrated a `runDiagnostics()` self-test suite and a 10,000-op `runBenchmark()` panel directly into the UI.
