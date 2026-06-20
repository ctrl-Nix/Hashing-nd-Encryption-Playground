/* ══════════════════════════════════════════════════════════════════
   STORY EXPLANATION DATA — concept briefs, key terms, why-it-matters
   One entry per mission (index matches StoryData.missions[])
══════════════════════════════════════════════════════════════════ */
const StoryExplain = [

  /* 0 — Hash Functions */
  {
    icon: '🔏',
    title: 'Hash Functions',
    subtitle: 'One-way fingerprinting of data',
    what: `A <strong>Hash Function</strong> takes any input — a single character or an entire terabyte — and produces a fixed-length output called a <strong>digest</strong>. It is completely one-way: you cannot reverse it to find the original input. Every tiny change to the input produces a totally different digest.`,
    terms: [
      { name: 'Digest', def: 'The fixed-length output of a hash function (e.g., 256 bits for SHA-256)' },
      { name: 'Pre-image Resistance', def: 'You cannot reverse a hash back to the original input' },
      { name: 'Collision', def: 'Two different inputs that produce the same hash — a critical weakness' },
      { name: 'MD5 / SHA-1', def: 'Broken algorithms — researchers can craft collisions deliberately' },
      { name: 'SHA-256', def: 'Current gold standard — no known practical collisions' },
    ],
    why: `Passwords are <strong>never stored in plain text</strong> in secure systems. Only their hash is stored. When you log in, the server re-hashes what you typed and compares — the real password never travels the network or lives in the database.`,
    fact: `[i] The SHA-256 output space has 2<sup>256</sup> possible values — more than the number of atoms in the observable universe. Finding two matching inputs by brute force is physically impossible.`,
  },

  /* 1 — Avalanche Effect */
  {
    icon: '🌊',
    title: 'Avalanche Effect',
    subtitle: 'Small input change → massive output scramble',
    what: `The <strong>Avalanche Effect</strong> is a property of secure hash functions where changing even a single bit of the input causes approximately <strong>50% of the output bits to flip</strong>. This unpredictability is essential — without it, attackers could use "hot or cold" guessing games to approximate your password.`,
    terms: [
      { name: 'Bit Flip', def: 'A single 0→1 or 1→0 change in the binary output' },
      { name: '~50% Variance', def: 'The target avalanche rate — any more or less would reveal patterns' },
      { name: 'Diffusion', def: 'Spreading input bits across the full output (one of Shannon\'s two design goals)' },
      { name: 'Confusion', def: 'Making the relationship between key and ciphertext complex (Shannon\'s other goal)' },
    ],
    why: `Without the Avalanche Effect, if "password1" and "password2" produced <strong>similar</strong> hashes, an attacker could observe the differences and zero in on the real password. True randomness in output makes this impossible.`,
    fact: `🔬 SHA-256's avalanche effect has been mathematically proven. Testing with millions of single-bit changes consistently yields 127–129 bit-flips out of 256 — remarkably close to the ideal 128 (50%).`,
  },

  /* 2 — Password Login & Dictionary Attack */
  {
    icon: '[DEF]',
    title: 'Secure Login & Dictionary Attacks',
    subtitle: 'Zero-knowledge authentication in action',
    what: `Modern authentication uses a <strong>Zero-Knowledge Proof</strong>: the server never needs to know your actual password. It stores only the hash. At login, it hashes your input and compares digests. A <strong>Dictionary Attack</strong> works by hashing thousands of common passwords and comparing — it only succeeds if you used a weak, common password.`,
    terms: [
      { name: 'Dictionary Attack', def: 'Hashing a list of common passwords and comparing against a stolen hash database' },
      { name: 'Rainbow Table', def: 'Pre-computed hash→password lookup table — defeated by salting' },
      { name: 'Zero-Knowledge Auth', def: 'The server proves it knows your password\'s hash without ever learning the password' },
      { name: 'Salt', def: 'A random value added to the password before hashing — makes rainbow tables useless' },
    ],
    why: `The 2012 LinkedIn breach exposed <strong>6.5 million SHA-1 passwords without salts</strong>. Because SHA-1 was fast, attackers cracked 90% of them within days using rainbow tables. Salting and slow algorithms (bcrypt, Argon2) would have prevented this.`,
    fact: `[WARN] The most common password in every breach is still "123456". A dictionary attack finds it in milliseconds. Strong, unique passwords are still your first line of defense.`,
  },

  /* 3 — Network Breach / Incident Zero */
  {
    icon: '💀',
    title: 'Incident Zero — Network Intrusion',
    subtitle: 'What happens when the perimeter fails',
    what: `No system is perfectly secure against a <strong>sufficiently motivated attacker</strong>. Network intrusions often exploit <strong>software vulnerabilities</strong> (like buffer overflows or unpatched CVEs), not cryptographic weaknesses. Once inside, attackers pivot to extract credentials and data.`,
    terms: [
      { name: 'CVE', def: 'Common Vulnerabilities and Exposures — public database of known security holes' },
      { name: 'Buffer Overflow', def: 'Writing past allocated memory to overwrite control data and hijack execution' },
      { name: 'Lateral Movement', def: 'Moving through a network after initial breach to reach higher-value targets' },
      { name: 'Privilege Escalation', def: 'Gaining higher access levels than initially compromised' },
    ],
    why: `<strong>Defence in depth</strong> means even if an attacker breaks one layer, additional encryption layers protect data at rest. This is why we need AES encryption <em>on top of</em> authentication — a hacked server shouldn't expose plaintext secrets.`,
    fact: `The average time to detect a data breach in 2023 was <strong>204 days</strong>. Attackers often reside undetected inside networks for months, slowly escalating access.`,
  },

  /* 4 — AES-256-GCM Encryption */
  {
    icon: '[CRYPTO]',
    title: 'AES-256-GCM Encryption',
    subtitle: 'Symmetric encryption with authenticated integrity',
    what: `<strong>AES-256-GCM</strong> is a symmetric encryption algorithm — the same key is used to lock and unlock data. <strong>GCM mode</strong> (Galois/Counter Mode) adds an <strong>Authentication Tag</strong> that detects any tampering with the ciphertext. PBKDF2 stretches a human-readable passphrase into a strong cryptographic key using 100,000 hash iterations and a random Salt.`,
    terms: [
      { name: 'AES-256', def: '256-bit block cipher — the NSA standard for TOP SECRET documents' },
      { name: 'GCM Mode', def: 'Provides both encryption and authentication — tampered data is rejected outright' },
      { name: 'PBKDF2', def: 'Password-Based Key Derivation Function — slows brute-force by design' },
      { name: 'Salt', def: 'Random 16-byte value mixed with your passphrase — unique per encryption' },
      { name: 'IV / Nonce', def: 'Initialization Vector — ensures identical messages produce different ciphertexts' },
      { name: 'Auth Tag', def: '128-bit MAC that detects any modification to the ciphertext' },
    ],
    why: `The payload format <code>Salt:IV:Ciphertext</code> is a self-contained encrypted bundle. You need all three components <strong>plus the passphrase</strong> to decrypt. Without the correct key, GCM's authentication tag causes decryption to fail with an explicit error — silent data corruption is impossible.`,
    fact: `⏱️ With a strong passphrase and PBKDF2's 100,000 iterations, brute-forcing a single guess takes ~0.1 seconds on modern hardware. Testing 1 trillion passwords would take <strong>3,171 years</strong>.`,
  },

  /* 5 — Steganography */
  {
    icon: '🖼️',
    title: 'LSB Steganography',
    subtitle: 'Hiding secrets in plain sight',
    what: `<strong>Steganography</strong> is the art of hiding the <em>existence</em> of a message — not just encrypting it. <strong>Least Significant Bit (LSB)</strong> steganography works by replacing the last bit of each pixel's RGB channel with a bit from the secret message. Each pixel changes by at most 1/255 brightness units — completely invisible to the human eye, yet sufficient to hide kilobytes of data.`,
    terms: [
      { name: 'LSB', def: 'Least Significant Bit — the rightmost bit of a number, changing it alters the value by ±1' },
      { name: 'Carrier Image', def: 'The decoy image that contains the hidden payload' },
      { name: 'Steganalysis', def: 'Statistical analysis to detect the presence of hidden data in files' },
      { name: 'Plausible Deniability', def: 'Hiding a message means the carrier looks like an ordinary photo' },
    ],
    why: `<strong>Encryption tells an adversary a secret exists</strong>. Steganography hides that fact entirely. Intelligence agencies and dissidents combine both — encrypt the message first, then hide the ciphertext in a vacation photo. The photo passes inspection; the ciphertext resists decryption.`,
    fact: `🎨 A 1920×1080 image has ~6.2 million pixels. With 3 bits per pixel (one per RGB channel), you can hide ~2.3 MB of data — enough for a 300-page book — with changes invisible to any human observer.`,
  },

  /* 6 — ECDSA Digital Signatures */
  {
    icon: '✍️',
    title: 'ECDSA Digital Signatures',
    subtitle: 'Cryptographic proof of identity and integrity',
    what: `<strong>Elliptic Curve Digital Signature Algorithm (ECDSA)</strong> uses asymmetric key pairs. The <strong>private key</strong> (kept secret) signs a message. The <strong>public key</strong> (shared openly) verifies it. Anyone can verify the signature, but only the private key holder could have created it. Changing even one byte of a signed message invalidates the signature completely.`,
    terms: [
      { name: 'Private Key', def: 'Secret 256-bit value — the only key that can create valid signatures' },
      { name: 'Public Key', def: 'Derived from the private key — anyone can use it to verify, but not sign' },
      { name: 'P-256 Curve', def: 'NIST standard elliptic curve — used in TLS, SSH, and JWT tokens' },
      { name: 'Signature', def: 'Two 256-bit values (r, s) that mathematically bind the message to the private key' },
      { name: 'Non-repudiation', def: 'The signer cannot later deny signing — mathematical proof they used their private key' },
    ],
    why: `<strong>Encryption hides data; signatures prove authorship.</strong> When you send an email, anyone can claim to be you. With a digital signature tied to your private key, recipients can cryptographically verify the message originated from you and arrived unmodified. This is the backbone of code signing, email security (S/MIME), and cryptocurrency transactions.`,
    fact: `💎 Bitcoin transactions use ECDSA over the secp256k1 curve. Every time you send BTC, your wallet signs the transaction with your private key. The blockchain network verifies the signature before accepting it — no banks, no intermediaries.`,
  },

  /* 7 — PKI / Certificate Authority */
  {
    icon: '[PKI]',
    title: 'Public Key Infrastructure (PKI)',
    subtitle: 'How your browser trusts strangers on the internet',
    what: `<strong>PKI</strong> solves the "Who do you trust?" problem at internet scale. A <strong>Certificate Authority (CA)</strong> is a trusted organization that digitally signs <strong>X.509 certificates</strong> which bind a domain name to a public key. Your browser ships with ~150 pre-trusted root CAs. When you visit a website, it presents its certificate, the browser verifies the CA's signature, and a secure TLS connection is established.`,
    terms: [
      { name: 'CA', def: 'Certificate Authority — a trusted entity whose public key is pre-installed in browsers/OS' },
      { name: 'X.509', def: 'The standard format for digital certificates (Subject, Issuer, Public Key, Signature)' },
      { name: 'Chain of Trust', def: 'Root CA → Intermediate CA → Server Cert — each level signed by the one above' },
      { name: 'HTTPS / TLS', def: 'Encrypted web traffic authenticated by PKI certificates' },
      { name: 'Certificate Pinning', def: 'Apps that reject any certificate not matching a pre-known fingerprint' },
    ],
    why: `Without PKI, a man-in-the-middle could intercept your HTTPS connection and substitute their own public key — you'd think you're talking to your bank, but you'd actually be talking to the attacker. CA signatures make this mathematically detectable. That's why your browser shows a <strong>red padlock</strong> for expired or forged certificates.`,
    fact: `The world's root CAs (DigiCert, Let's Encrypt, Comodo) collectively sign billions of certificates. <strong>Let's Encrypt alone</strong> has issued over 3 billion free certificates since 2016, driving HTTPS adoption from 40% to 95%+ of web traffic.`,
  },

  /* 8 — Final Quiz */
  {
    icon: '[TEST]',
    title: 'Final Assessment',
    subtitle: 'Prove your clearance — 6 questions covering all modules',
    what: `You have traversed the full cryptographic stack — from basic hashing to PKI certificate chains. This assessment tests whether you can apply these concepts, not just recall them. Each question reflects a real-world security scenario.`,
    terms: [
      { name: 'Modules Covered', def: 'Hashing · Avalanche · Auth · AES-GCM · Steganography · ECDSA · PKI' },
      { name: 'Passing Score', def: '4/6 or higher — demonstrates operational readiness' },
      { name: 'Perfect Score', def: '6/6 — Cleared for field operations' },
    ],
    why: `<strong>Understanding cryptography at this level</strong> lets you make better security decisions: choosing the right algorithm, recognizing weak implementations, and understanding why security warnings should never be ignored.`,
    fact: `🎓 The concepts in this module are tested in COMPTIA Security+, CEH, and CISSP certifications — industry-standard credentials in the cybersecurity field.`,
  },
];
