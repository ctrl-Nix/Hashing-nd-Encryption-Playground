# System Context — NIX // MATRIX PROTOCOL

This document outlines the operational context, active state variables, and architectural modifications introduced in Version 1.

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
    fileBuffer: null,     // Active file buffer loaded in Hash lab
    fileName: ''          // Active file name loaded in Hash lab
  },
  story: {
    step: 0,              // Current story step (0-8)
    maxStep: 0,           // Max unlocked story step (0-8)
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

- **Worker Spawn**: Spawns `js/md5-worker.js` to run MD5 dictionary cracking concurrently.
- **Main Thread**: Remains 100% responsive, with no layout blocking, allowing users to drag elements and navigate sandbox panels during the attack.
- **Worker Terminate**: Clean worker destruction using `App.stopMD5Crack()` on tab switch, search abort, or search completion.

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

## 4. Architectural Modifications in v1

1. **Accessibility**: Integrated keyboard focus attributes and delegated space/enter listeners to enable mouse-free operation across all custom components.
2. **File Processing**: Optimized MD5 file hashing with direct buffer inputs to eliminate character corruption, and added a binary salt concatenation routine.
3. **Patcher/Encoding Stability**: Corrected a malformed UTF-8 header in `js/app.js` to prevent browser file-load and development server decode failures.
