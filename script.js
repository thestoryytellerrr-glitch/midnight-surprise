document.addEventListener('DOMContentLoaded', () => {

  // --- AUDIO CONTROLLER ---
  const mainAudio = document.getElementById('audio-main');
  const hbdAudio = document.getElementById('audio-hbd');
  const musicBtn = document.getElementById('music-toggle-btn');

  function initAudio() {
    if (mainAudio) mainAudio.load();
    if (hbdAudio) hbdAudio.load();
  }

  function startMainAudio() {
    initAudio();
    if (mainAudio) {
      mainAudio.volume = 1.0;

      // Loop back to 07s on completion
      if (!mainAudio.has7sLoop) {
        mainAudio.has7sLoop = true;
        mainAudio.removeAttribute('loop');
        mainAudio.addEventListener('ended', () => {
          mainAudio.currentTime = 7;
          mainAudio.play().catch(() => {});
        });
      }

      // Start directly at 07s
      if (mainAudio.currentTime < 7) {
        mainAudio.currentTime = 7;
      }

      if (mainAudio.paused) {
        mainAudio.play().then(() => {
          if (musicBtn) musicBtn.classList.add('playing');
        }).catch(() => {});
      }
    }
  }

  if (musicBtn) {
    musicBtn.onclick = () => {
      triggerHaptic(30);
      if (mainAudio.paused) {
        startMainAudio();
        musicBtn.classList.add('playing');
      } else {
        mainAudio.pause();
        musicBtn.classList.remove('playing');
      }
    };
  }

  // --- CHAPTER NAVIGATION ENGINE ---
  function goToChapter(chapNum) {
    triggerHaptic(40);
    document.querySelectorAll('.chapter').forEach(c => c.classList.remove('active'));
    
    const target = document.getElementById(`chap-${chapNum}`);
    if (target) {
      target.classList.add('active');
    }

    if (chapNum === 5) initScratchCard();
    if (chapNum === 7) startTypewriter();
    if (chapNum === 11) launchFireworks();
  }

  // Bind Buttons
  for (let i = 1; i <= 10; i++) {
    const btn = document.getElementById(`btn-chap-${i}`);
    if (btn) {
      btn.onclick = () => {
        if (i === 1) startMainAudio();
        goToChapter(i + 1);
      };
    }
  }

  const replayBtn = document.getElementById('btn-replay');
  if (replayBtn) {
    replayBtn.onclick = () => goToChapter(1);
  }

  // --- CHAPTER 4: CAKE CUTTING ---
  const cakeTrigger = document.getElementById('cake-trigger');
  const flameEl = document.getElementById('flame-element');
  const btnChap4 = document.getElementById('btn-chap-4');
  const cakeStatus = document.getElementById('cake-status-text');

  if (cakeTrigger) {
    cakeTrigger.onclick = () => {
      triggerHaptic([50, 100, 50]);
      if (flameEl) flameEl.classList.add('out');
      
      if (mainAudio) mainAudio.pause();
      if (hbdAudio) {
        hbdAudio.currentTime = 0;
        hbdAudio.play().catch(() => {});
      }

      launchFireworks();
      if (cakeStatus) cakeStatus.innerText = "🎉 Cake Cut! Happy Birthday!";
      if (btnChap4) btnChap4.classList.remove('hidden');
    };
  }

  // --- CHAPTER 5: SCRATCH CARD CANVAS ---
  let scratchInitialized = false;
  function initScratchCard() {
    if (scratchInitialized) return;
    scratchInitialized = true;

    const canvas = document.getElementById('scratch-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#c9184a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px Poppins';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Scratch Here ✨', canvas.width / 2, canvas.height / 2 + 5);

    let isScratching = false;

    function scratch(e) {
      if (!isScratching) return;
      const rect = canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    canvas.addEventListener('mousedown', () => isScratching = true);
    canvas.addEventListener('mouseup', () => isScratching = false);
    canvas.addEventListener('mousemove', scratch);

    canvas.addEventListener('touchstart', () => isScratching = true);
    canvas.addEventListener('touchend', () => isScratching = false);
    canvas.addEventListener('touchmove', scratch);
  }

  // --- CHAPTER 6: GIFT BOX ---
  const giftTrigger = document.getElementById('gift-trigger');
  const btnChap6 = document.getElementById('btn-chap-6');
  if (giftTrigger) {
    giftTrigger.onclick = () => {
      triggerHaptic(50);
      giftTrigger.style.transform = 'scale(1.2) rotate(5deg)';
      setTimeout(() => {
        giftTrigger.style.transform = 'scale(1)';
        if (btnChap6) btnChap6.classList.remove('hidden');
      }, 300);
    };
  }

  // --- CHAPTER 7: TYPEWRITER (22ms) ---
  const letterText = "Dearest Samrudhi,\n\nWelcome to Level 19! Today marks the start of another wonderful chapter.\nFrom your infectious smile to your unmatched kindness, you light up every room you enter.\nAs you step into this new year, I wish you endless happiness, peace, and success in everything you do.\nThank you for being the wonderful, genuine person you are.\n\nAlways cheering for you,\nGoldiee";

  function startTypewriter() {
    const typedEl = document.getElementById('typed-text');
    if (!typedEl) return;
    typedEl.innerHTML = "";
    let charIdx = 0;

    function typeNextChar() {
      if (charIdx < letterText.length) {
        const char = letterText.charAt(charIdx);
        typedEl.innerHTML += (char === '\n') ? '<br/>' : char;
        charIdx++;
        setTimeout(typeNextChar, 22);
      }
    }
    typeNextChar();
  }

  // --- CHAPTER 8: POLAROID FLIP ---
  document.querySelectorAll('.polaroid-card').forEach(card => {
    card.onclick = () => {
      triggerHaptic(30);
      card.classList.toggle('flipped');
    };
  });

  // --- HAPTIC FEEDBACK ---
  function triggerHaptic(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
  }

  // --- FIREWORKS CANVAS ENGINE ---
  function launchFireworks() {
    const canvas = document.getElementById('fireworks-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        radius: Math.random() * 3 + 2,
        alpha: 1
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.015;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        if (p.alpha <= 0) particles.splice(idx, 1);
      });

      if (particles.length > 0) requestAnimationFrame(animate);
    }
    animate();
  }

  // --- COUNTDOWN TIMER ---
  const targetDate = new Date('August 2, 2026 00:00:00').getTime();
  setInterval(() => {
    const now = new Date().getTime();
    const diff = targetDate - now;

    if (diff > 0) {
      document.getElementById('days').innerText = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
      document.getElementById('hours').innerText = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
      document.getElementById('mins').innerText = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
      document.getElementById('secs').innerText = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
    }
  }, 1000);

});
                          
