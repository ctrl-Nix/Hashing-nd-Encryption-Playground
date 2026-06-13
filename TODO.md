# NIX Protocol — Final Launch Checklist

This document tracks the final manual steps required to officially wrap up the project. Since these involve external media (screenshots, video recordings, and final URLs), they must be completed by you before sharing the repository with recruiters.

## 📸 1. Media & Screenshots
- [ ] **README Screenshots**: Take 3 screenshots of the application and save them in the `docs/` folder with the exact following names to automatically populate the `README.md`:
  - `docs/screenshot-dashboard-placeholder.png` *(Suggestion: The main terminal menu)*
  - `docs/screenshot-sandbox-placeholder.png` *(Suggestion: The AES-GCM or Steganography lab)*
  - `docs/screenshot-story-placeholder.png` *(Suggestion: Daisy chatting in Chapter 1 or 2)*
- [ ] **Landing Page Preview**: Take a high-quality screenshot or record a GIF of the app in action. Open `landing.html` and replace the `<div class="preview-placeholder">` block with an actual `<img>` or `<video>` tag pointing to your media.

## 🎥 2. Demo Recording
- [ ] **Record the 5-Minute Demo**: Use `demo-script.md` to record your walkthrough. Make sure to have two browser windows open side-by-side for the ECDH Key Exchange portion!
- [ ] **Link the Demo**: Once uploaded (to YouTube, Loom, or directly in the repo), go through `demo-script.md` and replace the `*[Placeholder for Video/GIF]*` tags with actual links to your recordings.

## 🔗 3. Social & Networking Links
- [ ] **Update Elevator Pitch**: Open `elevator-pitch.md` and scroll to the bottom of the LinkedIn section. Replace the `[Link to your deployed site]` and `[Link to your GitHub repo]` placeholders with your actual Vercel and GitHub URLs.
- [ ] **Post to LinkedIn**: Copy the text from `elevator-pitch.md` (the Senior Engineer version) and publish it to your LinkedIn "About" section or make a dedicated post with your demo video attached.

## ⚡ 4. Final Vercel Audit
- [ ] **Incognito Lighthouse Run**: Deploy the latest `main` branch to Vercel. Open your Vercel URL in an **Incognito/Private Window** (to ensure your Chrome extensions don't ruin the score) and run the Lighthouse Audit one last time. Verify that Performance hits 90+ thanks to the newly added lazy-loading architecture.

---
### 🔮 Future Expansion Ideas (Version 5.0)
*If you ever decide to pick this project back up, here are some great features to build next:*
- **Argon2 / bcrypt Lab**: Add a sandbox tool specifically demonstrating memory-hard password hashing.
- **PWA Support**: Add a `manifest.json` and a Service Worker to make the app fully installable and accessible offline.
- **Story Mode Voice Acting**: Connect the Web Speech API (`window.speechSynthesis`) so Daisy can actually speak her dialogue lines out loud.
