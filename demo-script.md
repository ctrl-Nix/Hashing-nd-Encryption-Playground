# NIX Protocol — 5-Minute Live Demo Script

*This script is paced for a normal speaking rate (~130 words per minute). Follow the **[ACTION]** cues on screen while delivering the spoken lines.*

---

### [0:00] Intro & The Theme
**[ACTION]** 
- Open `index.html` (or the deployed URL). 
- Hover over the landing page elements to show the UI responsiveness, then click "Enter the Simulation".

**🗣️ SPOKEN SCRIPT:**
> "Hi everyone. Today I'm demonstrating the NIX Protocol—a 100% client-side cryptography sandbox I engineered to make complex security concepts visual, interactive, and completely accessible. The goal was to build a tool that teaches enterprise-grade cryptography without requiring any backend servers. Let's dive in."

*[Placeholder for Intro Video/GIF]*

---

### [0:30] Story Mode — Hashing Basics
**[ACTION]** 
- Click on **"Story Mode"** and enter an Alias.
- Progress to Chapter 1 (Hashing).
- Type "hello" into the hash input, then change it to "hellp". Point out how the entire output changes.

**🗣️ SPOKEN SCRIPT:**
> "To guide new users, I built an interactive 9-chapter Story Mode. Here in Chapter 1, we cover the 'Avalanche Effect' of hashing. Notice how typing 'hello' generates a specific SHA-256 fingerprint. But if I change just one single letter—to 'hellp'—the entire resulting hash completely scrambles. This real-time visual feedback instantly teaches users that hashes are deterministic, yet mathematically unpredictable."

*[Placeholder for Story Mode Video/GIF]*

---

### [1:30] Sandbox — AES-GCM Live Encrypt/Decrypt
**[ACTION]** 
- Exit Story Mode and enter the **Pro Sandbox**.
- Click the **AES-GCM** tab.
- Type a secret message, type a password, and hit "Encrypt".
- Show the ciphertext. Then hit "Decrypt" to recover it.

**🗣️ SPOKEN SCRIPT:**
> "For advanced users, we have the Pro Sandbox, granting raw access to the native Web Cryptography API. Let's look at symmetric encryption using AES-256-GCM. I'll type a secret message, input a master password, and encrypt it. Behind the scenes, my app derives a secure key using PBKDF2 and generates an Initialization Vector. Here is our ciphertext payload. We can easily decrypt it back using the same password. All of this math happens right here in the browser."

*[Placeholder for AES Video/GIF]*

---

### [2:30] Sandbox — ECDSA Signature & Tamper
**[ACTION]** 
- Switch to the **ECDSA (Digital Signatures)** tab.
- Click "Generate New Key Pair" (Briefly gesture to the Public/Private keys).
- Type "Transfer $10" and click **Sign Message**.
- Click the **"Tamper (Flip Bit)"** button and watch the verification fail (Red screen).

**🗣️ SPOKEN SCRIPT:**
> "Next is Asymmetric Cryptography using ECDSA. I'll generate a fresh P-256 elliptic curve key pair. If I write a message like 'Transfer ten dollars' and sign it, the app uses the private key to generate a verifiable digital signature. But watch what happens if a hacker tries to intercept this. If I click 'Tamper' to flip a single bit—say, changing it to 100 dollars—the Web Crypto engine immediately detects the fraud, and the signature verification fails. Trust is mathematically preserved."

*[Placeholder for ECDSA Video/GIF]*

---

### [3:30] Two-User ECDH Key Exchange
**[ACTION]** 
- Open a **second, separate browser tab** (or a separate window side-by-side).
- On Tab A, go to the **ECDH Key Exchange** tool and click "Start Key Exchange".
- Copy the generated shareable URL and paste it into Tab B.
- Tab B will instantly generate a response link. Copy that and paste it back into Tab A.
- Highlight that both tabs now display the *exact same* Shared Secret.

**🗣️ SPOKEN SCRIPT:**
> "Now for the hardest concept: Key Exchange over a public channel. I've opened two separate tabs representing two different users. Tab A generates an ECDH public key and embeds it in a shareable link. I'll send that link to Tab B. Tab B reads the public key, generates its own pair, and replies with a second link. Once I paste that back into Tab A, both users independently derive the exact same shared symmetric key. They can now send end-to-end encrypted messages without a server ever facilitating the secret."

*[Placeholder for ECDH Video/GIF]*

---

### [4:30] Achievements & Session Export
**[ACTION]** 
- Open the **Session Manager** (bottom right icon or main menu).
- Click **"Export Session"** to show the JSON download.
- Open the **Achievements** panel to show the unlocked badges (e.g., 'Crypto Ninja', 'The Forger').

**🗣️ SPOKEN SCRIPT:**
> "Finally, to encourage exploration, I built a local Achievement system that rewards users for completing complex tasks like generating collisions or signing payloads. And because this is a developer tool, you can export your entire Sandbox state—including all your generated keys, hashes, and payloads—as an AES-encrypted JSON file, allowing you to seamlessly pick up your session later."

### [4:50] Conclusion
**[ACTION]** 
- Return to the Main Dashboard.

**🗣️ SPOKEN SCRIPT:**
> "NIX proves that enterprise-grade security tools can run blisteringly fast, with zero server latency, while remaining visually engaging. The code is entirely open source on GitHub. Thank you for watching."
