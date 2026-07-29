document.addEventListener('DOMContentLoaded', () => {

  let currentChap = 1;
  const TOTAL_CHAPS = 12;
  const TARGET_DATE = new Date("2026-08-02T00:00:00");
  const SECRET_PIN = "1809";

  function triggerHaptic(pattern = 30) {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  }

  function spawnRibbonParticles() {
    const layer = document.getElementById('ribbon-particles-layer');
    if (!layer) return;
    layer.innerHTML = '';
    const count = 18;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'ribbon-particle';
      el.textContent = '🎀';
      el.style.left = Math.random() * 95 + 'vw';
      el.style.animationDelay = (Math.random() * 8) + 's';
      el.style.animationDuration = (6 + Math.random() * 6) + 's';
      el.style.fontSize = (14 + Math.random() * 12) + 'px';
      layer.appendChild(el);
    }
  }
  spawnRibbonParticles();

  function resetAllStates() {
    isCandleBlown = false;
    isCakeCut = false;
    
    const flame = document.getElementById('candle-flame');
    if (flame) flame.style.display = 'block';
    
    const knife = document.getElementById('cake-knife');
    if (knife) knife.classList.remove('cutting');
    
    const leftHalf = document.getElementById('cake-left');
    const rightHalf = document.getElementById('cake-right');
    if (leftHalf) leftHalf.classList.remove('cut');
    if (rightHalf) rightHalf.classList.remove('cut');

    const hint = document.getElementById('cake-action-hint');
    if (hint) hint.textContent = "Tap candle to blow out! 🔥";

    const runawayBtn = document.getElementById('btn-excited-no');
    if (runawayBtn) {
      runawayBtn.style.transform = 'none';
      runawayBtn.style.position = 'relative';
    }

    typingStarted = false;
    const env = document.getElementById('envelope-el');
    if (env) env.classList.remove('open');
    
    const modal = document.getElementById('fullscreen-letter-modal');
    if (modal) modal.classList.remove('active');
    
    const textBox = document.getElementById('typing-text-box');
    if (textBox) textBox.innerHTML = '';
    
    const btn6 = document.getElementById('btn-chap-6');
    if (btn6) btn6.style.display = 'none';

    const btn7 = document.getElementById('btn-chap-7');
    if (btn7) btn7.style.display = 'none';

    pIdx = 0;
    renderPhoto();
    const statsOverlay = document.getElementById('stats-overlay');
    if (statsOverlay) statsOverlay.style.display = 'none';

    initScratchCanvas();

    const fwCanvas = document.getElementById('fireworks-canvas');
    if (fwCanvas) fwCanvas.classList.remove('active');
  }

  function goToChapter(num) {
    if (num < 1 || num > TOTAL_CHAPS) return;
    triggerHaptic(40);
    document.querySelectorAll('.chapter').forEach(c => c.classList.remove('active'));

    const next = document.getElementById('chap-' + num);
    if (next) next.classList.add('active');
    currentChap = num;

    if (num === 5) startFireworksLoop();
    if (num === 12) triggerHaptic([60, 120, 60]);
  }

  document.getElementById('nav-back-btn')?.addEventListener('click', () => goToChapter(currentChap - 1));
  document.getElementById('nav-replay-btn')?.addEventListener('click', () => {
    resetAllStates();
    goToChapter(1);
  });

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  function playSynchronizedExplosionSound() {
    initAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;

    const boom = audioCtx.createOscillator();
    const boomGain = audioCtx.createGain();
    boom.type = 'triangle';
    boom.frequency.setValueAtTime(220, now);
    boom.frequency.exponentialRampToValueAtTime(30, now + 0.25);
    boomGain.gain.setValueAtTime(0.7, now);
    boomGain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
    boom.connect(boomGain);
    boomGain.connect(audioCtx.destination);
    boom.start(now);
    boom.stop(now + 0.25);

    const bufferSize = audioCtx.sampleRate * 0.15;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.25, now + 0.05);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    noise.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(now + 0.05);
  }

  const mainAudio = document.getElementById('audio-main');
  const hbdAudio = document.getElementById('audio-hbd');

  function startMainAudio() {
    initAudio();
    if (mainAudio && mainAudio.paused) {
      mainAudio.volume = 1.0;
      mainAudio.play().catch(() => {});
    }
  }

  setTimeout(() => {
    const loadBar = document.getElementById('load-bar');
    if (loadBar) loadBar.style.width = '100%';
    setTimeout(() => {
      const btn1 = document.getElementById('btn-chap-1');
      if (btn1) btn1.style.display = 'inline-block';
    }, 1200);
  }, 300);

  const btnChap1 = document.getElementById('btn-chap-1');
  if (btnChap1) btnChap1.onclick = () => { startMainAudio(); goToChapter(2); };

  function checkTimerAndAutoUnlock() {
    const diff = TARGET_DATE - new Date();
    if (diff <= 0) {
      if (currentChap === 2) goToChapter(3);
    } else {
      const tdDays = document.getElementById('td-days');
      const tdHours = document.getElementById('td-hours');
      const tdMins = document.getElementById('td-mins');
      const tdSecs = document.getElementById('td-secs');

      if (tdDays) tdDays.textContent = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
      if (tdHours) tdHours.textContent = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
      if (tdMins) tdMins.textContent = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
      if (tdSecs) tdSecs.textContent = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
    }
  }
  setInterval(checkTimerAndAutoUnlock, 1000);
  checkTimerAndAutoUnlock();

  const btnChap2Preview = document.getElementById('btn-chap-2-preview');
  if (btnChap2Preview) btnChap2Preview.onclick = () => goToChapter(3);

  let secretTap = 0;
  const secretTitle = document.getElementById('secret-title');
  if (secretTitle) {
    secretTitle.onclick = () => {
      secretTap++;
      if (secretTap >= 3) {
        secretTap = 0;
        if (prompt("Enter Secret Passcode:") === SECRET_PIN) goToChapter(3);
      }
    };
  }

  const runawayBtn = document.getElementById('btn-excited-no');
  function dodgeNoButton() {
    triggerHaptic(20);
    const x = (Math.random() - 0.5) * 160;
    const y = (Math.random() - 0.5) * 100;
    if (runawayBtn) runawayBtn.style.transform = `translate(${x}px, ${y}px)`;
  }

  if (runawayBtn) {
    runawayBtn.addEventListener('mouseover', dodgeNoButton);
    runawayBtn.addEventListener('touchstart', (e) => { e.preventDefault(); dodgeNoButton(); });
    runawayBtn.addEventListener('click', dodgeNoButton);
  }

  const btnExcitedYes = document.getElementById('btn-excited-yes');
  if (btnExcitedYes) {
    btnExcitedYes.onclick = () => {
      triggerHaptic(50);
      goToChapter(4);
    };
  }

  let isCandleBlown = false;
  let isCakeCut = false;

  function handleCakeInteraction() {
    if (!isCandleBlown) {
      isCandleBlown = true;
      const flame = document.getElementById('candle-flame');
      if (flame) flame.style.display = 'none';
      const hint = document.getElementById('cake-action-hint');
      if (hint) hint.textContent = "Candle blown out! Tap again to slice cake 🔪";
      triggerHaptic(50);
    } else if (!isCakeCut) {
      isCakeCut = true;
      const knife = document.getElementById('cake-knife');
      if (knife) knife.classList.add('cutting');

      setTimeout(() => {
        document.getElementById('cake-left')?.classList.add('cut');
        document.getElementById('cake-right')?.classList.add('cut');
        triggerHaptic([40, 60, 40]);

        if (mainAudio) mainAudio.pause();
        if (hbdAudio) hbdAudio.play().catch(() => {});

        setTimeout(() => {
          goToChapter(5);
        }, 1200);
      }, 500);
    }
  }

  const cakeStage = document.getElementById('cake-touch-area');
  if (cakeStage) cakeStage.onclick = handleCakeInteraction;

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const micCtx = new AudioCtx();
      const source = micCtx.createMediaStreamSource(stream);
      const analyser = micCtx.createAnalyser();
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      function checkMic() {
        if (!isCandleBlown && currentChap === 4) {
          analyser.getByteFrequencyData(data);
          let avg = data.reduce((a, b) => a + b) / data.length;
          if (avg > 35) handleCakeInteraction();
        }
        requestAnimationFrame(checkMic);
      }
      checkMic();
    }).catch(() => {});
  }

  function startFireworksLoop() {
    document.getElementById('fireworks-canvas')?.classList.add('active');
  }

  const btnChap5 = document.getElementById('btn-chap-5');
  if (btnChap5) {
    btnChap5.onclick = () => {
      document.getElementById('fireworks-canvas')?.classList.remove('active');
      goToChapter(6);
    };
  }

  const surpriseTrigger = document.getElementById('surprise-box-trigger');
  if (surpriseTrigger) {
    surpriseTrigger.onclick = () => {
      triggerHaptic([50, 100, 50]);
      const giftEl = document.getElementById('gift-box-el');
      if (giftEl) giftEl.style.transform = 'scale(1.15) rotate(5deg)';
      setTimeout(() => {
        if (giftEl) giftEl.style.transform = 'scale(1)';
        const btn6 = document.getElementById('btn-chap-6');
        if (btn6) btn6.style.display = 'inline-block';
      }, 300);
    };
  }

  const btnChap6 = document.getElementById('btn-chap-6');
  if (btnChap6) {
    btnChap6.onclick = () => {
      if (hbdAudio) hbdAudio.pause();
      startMainAudio();
      goToChapter(7);
    };
  }

  const fullLetterLines = [
    "Dearest Samrudhi,\n",
    "Welcome to Level 19! Today marks the start of another beautiful chapter in your life, and I wanted to make sure you were surrounded by all the light, warmth, and joy you so effortlessly give to everyone around you.\n\n",
    "From your infectious smile to your unmatched grace, you have a rare gift for making every room brighter and every moment sweeter. Watching you grow, achieve, and inspire has been nothing short of amazing.\n\n",
    "As you step into this new year, I wish you endless laughter, peace, unforgettable adventures, and the courage to chase every single dream you hold in your heart.\n\n",
    "Thank you for being the wonderful, genuine, and radiant person you are. Happy 19th Birthday! ✨\n\n",
    "Always cheering for you,\nGoldiee"
  ];

  let typingStarted = false;
  function typeWriterLetter() {
    if (typingStarted) return;
    typingStarted = true;
    const container = document.getElementById('typing-text-box');
    if (!container) return;
    container.innerHTML = "";
    let lineIdx = 0;

    function typeNextLine() {
      if (lineIdx < fullLetterLines.length) {
        const p = document.createElement('p');
        p.style.marginBottom = "8px";
        p.textContent = fullLetterLines[lineIdx];
        container.appendChild(p);
        lineIdx++;
        setTimeout(typeNextLine, 600);
      } else {
        const btn7 = document.getElementById('btn-chap-7');
        if (btn7) btn7.style.display = 'inline-block';
      }
    }
    typeNextLine();
  }

  const envWrapper = document.getElementById('envelope-wrapper');
  if (envWrapper) {
    envWrapper.onclick = () => {
      triggerHaptic(40);
      document.getElementById('envelope-el')?.classList.add('open');
      setTimeout(() => {
        document.getElementById('fullscreen-letter-modal')?.classList.add('active');
        typeWriterLetter();
      }, 500);
    };
  }

  const closeLetterBtn = document.getElementById('close-letter-btn');
  if (closeLetterBtn) {
    closeLetterBtn.onclick = () => {
      document.getElementById('fullscreen-letter-modal')?.classList.remove('active');
      const btn7 = document.getElementById('btn-chap-7');
      if (btn7) btn7.style.display = 'inline-block';
    };
  }

  const btnChap7 = document.getElementById('btn-chap-7');
  if (btnChap7) btnChap7.onclick = () => goToChapter(8);

  const photoList = [
    { cap: "Bright Smiles & Warm Memories", note: "Some moments stay golden forever." },
    { cap: "Laughter & Pure Joy", note: "Your happiness lights up every room." },
    { cap: "Unforgettable Days", note: "Grateful for every single memory." },
    { cap: "Kindness & Grace", note: "Always bringing warmth wherever you go." },
    { cap: "Cherished Moments", note: "Level 19 fits you perfectly!" },
    { cap: "Sweet Birthday Vibes", note: "May your year be filled with peace." },
    { cap: "Golden Memories", note: "Here is to many more chapters!" },
    { cap: "Celebration Day", note: "Happy 19th Birthday, Samrudhi!" }
  ];
  let pIdx = 0;

  function renderPhoto() {
    const counter = document.getElementById('photo-counter');
    const idxNum = document.getElementById('photo-idx-num');
    const caption = document.getElementById('photo-caption');
    const backNote = document.getElementById('photo-back-note');
    const polaroid = document.getElementById('polaroid-el');

    if (counter) counter.textContent = `Memory ${pIdx + 1} of 8 (Tap to Flip)`;
    if (idxNum) idxNum.textContent = pIdx + 1;
    if (caption) caption.textContent = photoList[pIdx].cap;
    if (backNote) backNote.textContent = `"${photoList[pIdx].note}"`;
    if (polaroid) polaroid.classList.remove('flipped');
  }

  const polaroidEl = document.getElementById('polaroid-el');
  if (polaroidEl) {
    polaroidEl.onclick = () => {
      triggerHaptic(30);
      polaroidEl.classList.toggle('flipped');
    };
  }

  const nextPhotoBtn = document.getElementById('next-photo-btn');
  if (nextPhotoBtn) nextPhotoBtn.onclick = () => { pIdx = (pIdx + 1) % photoList.length; renderPhoto(); };

  const prevPhotoBtn = document.getElementById('prev-photo-btn');
  if (prevPhotoBtn) prevPhotoBtn.onclick = () => { pIdx = (pIdx - 1 + photoList.length) % photoList.length; renderPhoto(); };

  const btnChap8 = document.getElementById('btn-chap-8');
  if (btnChap8) btnChap8.onclick = () => goToChapter(9);

  const sealEl = document.getElementById('seal-el');
  if (sealEl) {
    sealEl.onclick = () => {
      triggerHaptic(50);
      const overlay = document.getElementById('stats-overlay');
      if (overlay) overlay.style.display = 'block';
    };
  }

  const btnChap9 = document.getElementById('btn-chap-9');
  if (btnChap9) btnChap9.onclick = () => goToChapter(10);

  const reasonsList = [
    "1. Your contagious smile.", "2. Your unmatched kindness.", "3. How genuine you are.",
    "4. Your warm presence.", "5. The way you make people feel seen.", "6. Your resilience.",
    "7. Your sweet laugh.", "8. Your graceful charm.", "9. How thoughtful you are.",
    "10. Your bright energy.", "11. The peace you bring.", "12. Your wonderful heart.",
    "13. Your patience.", "14. Your golden spirit.", "15. How reliable you are.",
    "16. Your positivity.", "17. The joy you spread.", "18. Simply being yourself.",
    "19. Everything that makes you Samrudhi! ❤️"
  ];
  let rIdx = 0;

  const reasonCard = document.getElementById('reason-card-el');
  if (reasonCard) {
    reasonCard.onclick = () => {
      triggerHaptic(20);
      rIdx = (rIdx + 1) % reasonsList.length;
      const idxEl = document.getElementById('reason-idx');
      const textEl = document.getElementById('reason-text-el');
      if (idxEl) idxEl.textContent = `Reason ${rIdx + 1} of 19 (Tap card)`;
      if (textEl) textEl.textContent = reasonsList[rIdx];
    };
  }

  function initScratchCanvas() {
    const scratchCanvas = document.getElementById('scratch-canvas');
    if (!scratchCanvas) return;
    const scratchCtx = scratchCanvas.getContext('2d');
    if (!scratchCtx) return;

    scratchCtx.globalCompositeOperation = 'source-over';
    scratchCtx.fillStyle = '#d4af37';
    scratchCtx.fillRect(0, 0, 240, 110);
    scratchCtx.fillStyle = '#ffffff';
    scratchCtx.font = '11px Poppins';
    scratchCtx.fillText('Scratch Here ✨', 78, 60);

    let isScratching = false;
    function scratchScratch(e) {
      if (!isScratching) return;
      const rect = scratchCanvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

      scratchCtx.globalCompositeOperation = 'destination-out';
      scratchCtx.beginPath();
      scratchCtx.arc(x, y, 18, 0, Math.PI * 2);
      scratchCtx.fill();
    }

    scratchCanvas.onmousedown = () => isScratching = true;
    scratchCanvas.onmouseup = () => isScratching = false;
    scratchCanvas.onmousemove = scratchScratch;
    scratchCanvas.ontouchstart = () => isScratching = true;
    scratchCanvas.ontouchend = () => isScratching = false;
    scratchCanvas.ontouchmove = scratchScratch;
  }
  initScratchCanvas();

  const btnChap10 = document.getElementById('btn-chap-10');
  if (btnChap10) btnChap10.onclick = () => goToChapter(11);

  const btnChap11 = document.getElementById('btn-chap-11');
  if (btnChap11) btnChap11.onclick = () => goToChapter(12);

  const captureBtn = document.getElementById('nav-capture-btn');
  if (captureBtn) {
    captureBtn.onclick = () => {
      triggerHaptic(50);
      if (window.html2canvas) {
        html2canvas(document.body).then(canvas => {
          const a = document.createElement('a');
          a.download = 'Samrudhi-19th-Birthday.png';
          a.href = canvas.toDataURL();
          a.click();
        });
      }
    };
  }

  const fwCanvas = document.getElementById('fireworks-canvas');
  const fwCtx = fwCanvas ? fwCanvas.getContext('2d') : null;
  let bw = fwCanvas ? (fwCanvas.width = window.innerWidth) : window.innerWidth;
  let bh = fwCanvas ? (fwCanvas.height = window.innerHeight) : window.innerHeight;

  let particles = [];
  function createFirework(x, y) {
    playSynchronizedExplosionSound();

    const colors = ['#ff4d6d', '#c9184a', '#ffd700', '#ffffff', '#ff758f'];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)], alpha: 1, decay: Math.random() * 0.02 + 0.015
      });
    }
  }

  function renderFireworks() {
    if (fwCtx && fwCanvas) {
      fwCtx.clearRect(0, 0, bw, bh);
      if (fwCanvas.classList.contains('active') && Math.random() < 0.08) {
        createFirework(Math.random() * (bw * 0.8) + bw * 0.1, Math.random() * (bh * 0.5) + bh * 0.1);
      }
      particles.forEach((p, index) => {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.05; p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(index, 1);
        } else {
          fwCtx.fillStyle = p.color;
          fwCtx.globalAlpha = p.alpha;
          fwCtx.beginPath();
          fwCtx.arc(p.x, p.y, 2.8, 0, Math.PI * 2);
          fwCtx.fill();
        }
      });
      fwCtx.globalAlpha = 1;
    }
    requestAnimationFrame(renderFireworks);
  }
  renderFireworks();

  window.onresize = () => {
    bw = fwCanvas ? (fwCanvas.width = window.innerWidth) : window.innerWidth;
    bh = fwCanvas ? (fwCanvas.height = window.innerHeight) : window.innerHeight;
  };
  renderFireworks();

  window.onresize = () => {
    bw = fwCanvas ? (fwCanvas.width = window.innerWidth) : window.innerWidth;
    bh = fwCanvas ? (fwCanvas.height = window.innerHeight) : window.innerHeight;
  };

  resetAllStates();
});
