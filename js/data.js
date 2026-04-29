/* ══════════════════════════════════════════════════════════
   STORY & MISSION DATA
══════════════════════════════════════════════════════════ */
const StoryData = {
  bootSequence: [
    'BIOS v9.1.3 ... OK',
    'CPU: 64-CORE THREADRIPPER ... ONLINE',
    'RAM: 256GB ECC DDR5 ... VERIFIED',
    'Loading encrypted kernel module ...',
    'Mounting shadow filesystem ...',
    'Initializing zero-knowledge auth layer ...',
  ],

  nixIntro: [
    { m: (alias) => `...${alias}. You made it through.`, wait: 800 },
    { m: () => 'I am Nix. I built the encryption architecture protecting this entire network.', wait: 700 },
    { m: () => 'Four minutes ago, a threat actor punched through the outer perimeter.', wait: 600, glitch: true },
    { m: () => 'They are inside. Hunting for the master password hash in our core database.', wait: 700 },
    { m: () => 'If they crack it — every node, every user, every secret — gone.', wait: 800, glitch: true },
    { m: () => 'The only thing standing between them and total collapse is cryptography.', wait: 600 },
    { m: () => 'And right now, you are the one who needs to understand it.', wait: 700 },
    { m: () => "So pay close attention. I'll only explain this once.", wait: 400 },
  ],

  missions: [
    {
      title: '01: LOCK THE GATES',
      module: 'MODULE 01',
      dialogue: 'NIX',
      text: 'Think of a <span class="hl">Hash Function</span> like a mathematical meat grinder. You feed in a password, turn the crank, and out comes a fixed string of hex code — and you can never un-grind the meat to get the password back.<br><br>Older grinders like MD5 are flawed — hackers can create <strong>Collisions</strong>, forging a virus file with the same hash as a trusted one. Select a secure algorithm, hash a password, and study the bit pattern.'
    },
    {
      title: '02: THREAT ANALYSIS',
      module: 'MODULE 02',
      dialogue: 'NIX',
      text: 'If similar passwords had similar-looking hashes, hackers could play "Hot or Cold" to guess yours. A secure hash triggers the <span class="hl">Avalanche Effect</span>.<br><br>Change just <strong>one character</strong> of your password and roughly 50% of the output bits flip completely. The output is utterly unpredictable — exactly what we need.'
    },
    {
      title: '03: PERIMETER DEFENSE',
      module: 'MODULE 03',
      dialogue: 'NIX',
      text: 'This is a <strong>Zero-Knowledge Proof</strong> mechanism. The server never stores your real password — it hashes whatever is typed and compares hash-to-hash blindly. Your password never touches the wire.<br><br>Run the Brute Force Simulator. Watch the attacker hash guess after guess — and get rejected every time.'
    },
    {
      title: '04: INCIDENT ZERO',
      module: 'MODULE 04',
      dialogue: 'HCK',
      text: 'Perimeter breached. Extracting data. Let\'s see what you\'re hiding behind those hashes...'
    },
    {
      title: '05: CRYPTOGRAPHIC LOCKDOWN',
      module: 'MODULE 05',
      dialogue: 'SRV',
      text: 'Hashing is one-way. But to send data we need to retrieve, we need <span class="hl">Symmetric Encryption</span> — AES-256-GCM.<br><br>To stop Rainbow Table attacks, a random <strong>Salt</strong> is injected into your passphrase, then <strong>PBKDF2</strong> stretches it through 100,000 iterations. Brute-forcing becomes computationally impossible.'
    },
    {
      title: '06: COVERT EXFILTRATION',
      module: 'MODULE 06',
      dialogue: 'NIX',
      text: 'The enemy is smart. They aren\'t just attacking our servers; they are trying to sneak data out right under our noses using <span class="hl">Steganography</span>.<br><br>By hiding encrypted ciphertext in the <strong>Least Significant Bits</strong> of image pixels, a secret message can be sent inside an innocent-looking photo. The change is invisible to the human eye.'
    },
    {
      title: '07: FINAL EVALUATION',
      module: 'MODULE 07',
      dialogue: 'NIX',
      text: (alias) => `All modules cleared. Threat actors expelled. You have mastered the fundamentals of the Matrix Protocol, ${alias}.<br><br>Complete this final assessment to secure your operational clearance.`
    }
  ],

  quiz: [
    {
      q: 'Why were MD5 and SHA-1 blocked during Initialization?',
      o: ['Too slow for modern servers', 'Vulnerable to Collision Attacks — hackers can forge matching hashes', 'Produces hashes that are too long'],
      c: 1
    },
    {
      q: 'What does the Avalanche Effect prove about a hash function?',
      o: ['A tiny input change scrambles ~50% of output bits unpredictably', 'It creates a delay to slow down attackers', 'It groups bits into encrypted blocks'],
      c: 0
    },
    {
      q: 'What is the purpose of PBKDF2 and Salt?',
      o: ['To compress data before AES encryption', 'To stretch the password and block brute-force + rainbow table attacks', 'To hide the Initialization Vector from the wire'],
      c: 1
    },
    {
      q: 'What happened when the AES-GCM ciphertext was tampered with?',
      o: ['The server silently decrypted a corrupted message', 'The server crashed with a timeout error', 'AES-GCM threw an Authentication Tag Mismatch and safely blocked it'],
      c: 2
    }
  ]
};
