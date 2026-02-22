# Let's Play Project
A hacker-themed, interactive cryptography playground that teaches the real difference between one-way hashing and two-way encryption — through both a guided story mission and an unrestricted technical sandbox.


What Is This?
Most people treat "hashing" and "encryption" as synonyms. They're not. This tool makes that gap impossible to ignore by letting you experiment with both side by side, in an environment that actually makes cryptography feel cool.
There are two ways in:

01 // MISSION — Story Mode
A guided narrative simulation. You play as a hacker learning cryptographic fundamentals under pressure. Visualize avalanche effects, follow a storyline, and defend against simulated breach attempts.

02 // SANDBOX — Pro Sandbox
Unrestricted access. No logging. Raw hashing engines, bit visualizers, and a fully functional AES-256-GCM encryption utility. For when you just want to get your hands dirty.


Features:

->Hash Engine:
Supports MD5 (128-bit, broken), SHA-1 (160-bit, deprecated), SHA-256 (256-bit, secure), and SHA-512 (512-bit, maximum strength)
Live hex output + binary structure visualization
One-click copy

->Compare All Algorithms:
Type once, see MD5, SHA-256, and SHA-512 output simultaneously
Output length comparison (32 / 64 / 128 hex chars) makes the bit-size difference tangible
Inline explanation of why longer hashes are harder to brute-force

->AES-256-GCM Encryption Utility:
Symmetric encryption using PBKDF2 key derivation + AES-256-GCM
Encrypt and decrypt modes
Debug view of the PBKDF2-derived key
Demonstrates that unlike hashing, encryption is fully reversible — with the right passphrase
