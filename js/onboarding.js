(function() {
  const modalHTML = `
    <div id="onboarding-overlay" style="display:none; position:fixed; inset:0; background:rgba(5,5,10,0.9); z-index:99999; backdrop-filter:blur(4px); align-items:center; justify-content:center; animation: fadeIn 0.3s forwards;">
      <div style="background:#0a0a14; border:2px solid var(--c, #00f5ff); width:90%; max-width:600px; padding:32px; box-shadow:0 0 40px rgba(0,245,255,0.2); position:relative; font-family:var(--font-mono); color:#e2e8f0;">
        
        <button onclick="window.hideOnboarding()" style="position:absolute; top:16px; right:16px; background:none; border:1px solid #ff003c; color:#ff003c; cursor:pointer;">[X]</button>

        <!-- Slide 1 -->
        <div class="ob-slide active" id="ob-slide-1">
          <div style="font-family:var(--font-display); font-size:24px; color:var(--c); margin-bottom:16px; letter-spacing:2px;">WELCOME TO NIX</div>
          <p style="line-height:1.6; margin-bottom:16px;">The NIX Crypto-Explorer is an advanced Cryptography Sandbox and Cyber-Defense Simulator.</p>
          <p style="line-height:1.6; color:var(--muted);">Whether you're here to learn the basics of Hashing, or simulate a live Birthday Attack, you have full unrestricted access to the engines.</p>
          <div style="margin-top:24px; text-align:center;">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="var(--c)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter:drop-shadow(0 0 10px var(--c));">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
        </div>

        <!-- Slide 2 -->
        <div class="ob-slide" id="ob-slide-2" style="display:none;">
          <div style="font-family:var(--font-display); font-size:24px; color:var(--c3, #00ff88); margin-bottom:16px; letter-spacing:2px;">CHOOSE YOUR PATH</div>
          <div style="display:flex; flex-direction:column; gap:16px;">
            <div style="border:1px solid var(--c); padding:16px; background:rgba(0,245,255,0.05);">
              <strong style="color:var(--c);">01 // STORY MODE</strong>
              <p style="margin-top:8px; font-size:12px; line-height:1.5;">A guided narrative simulation. You'll intercept transmissions, decrypt messages, and master cryptographic fundamentals while under fire.</p>
            </div>
            <div style="border:1px solid var(--c4, #ff00ff); padding:16px; background:rgba(255,0,255,0.05);">
              <strong style="color:var(--c4);">02 // PRO SANDBOX</strong>
              <p style="margin-top:8px; font-size:12px; line-height:1.5;">An unrestricted tactical sandbox. Access raw hashing engines, bit visualizers, RSA generators, and AES-256-GCM utilities directly.</p>
            </div>
          </div>
        </div>

        <!-- Slide 3 -->
        <div class="ob-slide" id="ob-slide-3" style="display:none;">
          <div style="font-family:var(--font-display); font-size:24px; color:var(--c2, #ff003c); margin-bottom:16px; letter-spacing:2px;">MEET DAISY</div>
          <p style="line-height:1.6; margin-bottom:16px;">Daisy is your onboard AI companion. She lives in the bottom-right corner of your screen.</p>
          <ul style="line-height:1.6; padding-left:20px; color:var(--muted); font-size:14px;">
            <li><strong style="color:var(--c3, #00ff88);">Local AI Chat:</strong> Click her to chat! She uses the <strong>Qwen2.5</strong> AI model.</li>
            <li><strong style="color:var(--c3, #00ff88);">100% Private:</strong> The model is downloaded directly into your browser cache. No data is sent to a server!</li>
            <li><strong>Proactive Hints:</strong> If you make a mistake, she will warn you.</li>
            <li><strong>Audio Cues:</strong> Click anywhere to enable her procedural audio.</li>
            <li><strong>Easter Eggs:</strong> She responds to hidden keyboard commands.</li>
          </ul>
        </div>

        <!-- Controls -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:32px; padding-top:16px; border-top:1px solid rgba(255,255,255,0.1);">
          <button id="ob-btn-prev" style="background:none; border:1px solid var(--muted); color:var(--muted); padding:8px 16px; cursor:pointer; visibility:hidden;">← PREV</button>
          
          <div id="ob-dots" style="display:flex; gap:8px;">
            <div class="ob-dot active" style="width:8px; height:8px; background:var(--c); border-radius:50%;"></div>
            <div class="ob-dot" style="width:8px; height:8px; background:var(--muted); border-radius:50%;"></div>
            <div class="ob-dot" style="width:8px; height:8px; background:var(--muted); border-radius:50%;"></div>
          </div>

          <button id="ob-btn-next" style="background:var(--c); border:1px solid var(--c); color:#000; padding:8px 16px; cursor:pointer; font-weight:bold;">NEXT →</button>
        </div>

      </div>
    </div>
  `;

  let currentSlide = 1;
  const totalSlides = 3;

  function init() {
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    document.getElementById('ob-btn-next').addEventListener('click', () => {
      if (currentSlide < totalSlides) {
        showSlide(currentSlide + 1);
      } else {
        window.hideOnboarding();
      }
    });

    document.getElementById('ob-btn-prev').addEventListener('click', () => {
      if (currentSlide > 1) {
        showSlide(currentSlide - 1);
      }
    });

    // Check localStorage
    if (!localStorage.getItem('nix_onboarded')) {
      setTimeout(window.showOnboarding, 500);
    }
  }

  function showSlide(n) {
    document.querySelectorAll('.ob-slide').forEach(el => el.style.display = 'none');
    document.getElementById('ob-slide-' + n).style.display = 'block';
    
    const dots = document.querySelectorAll('.ob-dot');
    dots.forEach((d, i) => {
      d.style.background = (i === n - 1) ? 'var(--c)' : 'var(--muted)';
    });

    document.getElementById('ob-btn-prev').style.visibility = (n === 1) ? 'hidden' : 'visible';
    
    const nextBtn = document.getElementById('ob-btn-next');
    if (n === totalSlides) {
      nextBtn.textContent = 'BEGIN JOURNEY';
      nextBtn.style.background = 'var(--c3, #00ff88)';
      nextBtn.style.borderColor = 'var(--c3, #00ff88)';
    } else {
      nextBtn.textContent = 'NEXT →';
      nextBtn.style.background = 'var(--c)';
      nextBtn.style.borderColor = 'var(--c)';
    }
    
    currentSlide = n;
  }

  window.showOnboarding = function() {
    currentSlide = 1;
    showSlide(1);
    document.getElementById('onboarding-overlay').style.display = 'flex';
  };

  window.hideOnboarding = function() {
    document.getElementById('onboarding-overlay').style.display = 'none';
    localStorage.setItem('nix_onboarded', 'true');
  };

  window.addEventListener('DOMContentLoaded', init);
})();
