document.addEventListener('DOMContentLoaded', () => {

  let currentChap = 1;
  const TOTAL_CHAPS = 12;
  const TARGET_DATE = new Date("2026-08-02T00:00:00");
  const SECRET_PIN = "1809";

  function triggerHaptic(pattern = 30) {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  }

  /* Ribbon Particles Engine */
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

  /* Universal State Reset Engine */
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

  document.getElementById('nav-back-btn').addEventListener('click', () => goToChapter(currentChap - 1));
  document.getElementById('nav-replay-btn').addEventListener('click', () => {
    resetAllStates();
    goToChapter(1);
  });

  /* Real-Time Frame-Synced Audio Explosions */
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

    // High Transient Burst
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

    // Sparkling Crackle Tail
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
    if (mainAudio.paused) {
      mainAudio.volume = 1.0;
      mainAudio.play().catch(() => {});
    }
  }

  /* Chap 1 Preloader */
  setTimeout(() => {
    document.getElementById('load-bar').style.width = '100%';
    setTimeout(() => { document.getElementById('btn-chap-1').style.display = 'inline-block'; }, 1200);
  }, 300);

  document.getElementById('btn-chap-1').onclick = () => { startMainAudio(); goToChapter(2); };

  /* Chap 2 Countdown Gate */
  function checkTimerAndAutoUnlock() {
    const diff = TARGET_DATE - new Date();
    if (diff <= 0) {
      goToChapter(3);
    } else {
      document.getElementById('td-days').textContent = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0');
      document.getElementById('td-hours').textContent = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
      document.getElementById('td-mins').textContent = String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0');
      document.getElementById('td-secs').textContent = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
    }
  }
  setInterval(checkTimerAndAutoUnlock, 1000);
  checkTimerAndAutoUnlock();

  let secretTap = 0;
  document.getElementById('secret-title').onclick = () => {
    secretTap++;
    if (secretTap >= 3) {
      secretTap = 0;
      if (prompt("Enter Secret Passcode:") === SECRET_PIN) goToChapter(3);
    }
  };

  /* Chap 3 Excitement Gate */
  const runawayBtn = document.getElementById('btn-excited-no');
  function dodgeNoButton() {
    triggerHaptic(20);
    const x = (Math.random() - 0.5) * 160;
    const y = (Math.random() - 0.5) * 100;
    runawayBtn.style.transform = `translate(${x}px, ${y}px)`;
  }

  if (runawayBtn) {
    runawayBtn.addEventListener('mouseover', dodgeNoButton);
    runawayBtn.addEventListener('touchstart', (e) => { e.preventDefault(); dodgeNoButton(); });
    runawayBtn.addEventListener('click', dodgeNoButton);
  }

  document.getElementById('btn-excited-yes').onclick = () => {
    triggerHaptic(50);
    goToChapter(4);
  };

  /* Chap 4 Cake Blow & Slicing Physics */
  let isCandleBlown = false;
  let isCakeCut = false;

  function handleCakeInteraction() {
    if (!isCandleBlown) {
      isCandleBlown = true;
      document.getElementById('candle-flame').style.display = 'none';
      document.getElementById('cake-action-hint').textContent = "Candle blown out! Tap again to slice cake 🔪";
      triggerHaptic(50);
    } else if (!isCakeCut) {
      isCakeCut = true;
      const knife = document.getElementById('cake-knife');
      knife.classList.add('cutting');

      setTimeout(() => {
        document.getElementById('cake-left').classList.add('cut');
        document.getElementById('cake-right').classList.add('cut');
        triggerHaptic([40, 60, 40]);

        mainAudio.pause();
        hbdAudio.play().catch(() => {});

        setTimeout(() => {
          goToChapter(5);
        }, 1200);
      }, 500);
    }
  }

  document.getElementById('cake-touch-area').onclick = handleCakeInteraction;

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

  /* Chap 5 Celebration Fireworks Loop */
  function startFireworksLoop() {
    document.getElementById('fireworks-canvas').classList.add('active');
  }

  document.getElementById('btn-chap-5').onclick = () => {
    document.getElementById('fireworks-canvas').classList.remove('active');
    goToChapter(6);
  };

  /* Chap 6 Surprise Gift Box */
  document.getElementById('surprise-box-trigger').onclick = () => {
    triggerHaptic([50, 100, 50]);
    document.getElementById('gift-box-el').style.transform = 'scale(1.15) rotate(5deg)';
    setTimeout(() => {
      document.getElementById('gift-box-el').style.transform = 'scale(1)';
      document.getElementById('btn-chap-6').style.display = 'inline-block';
    }, 300);
  };

  document.getElementById('btn-chap-6').onclick = () => {
    hbdAudio.pause();
    startMainAudio();
    goToChapter(7);
  };

  /* Chap 7 Ribbon Envelope & Fullscreen Modal Letter */
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
        document.getElementById('btn-chap-7').style.display = 'inline-block';
      }
    }
    typeNextLine();
  }

  document.getElementById('envelope-wrapper').onclick = () => {
    triggerHaptic(40);
    document.getElementById('envelope-el').classList.add('open');
    setTimeout(() => {
      document.getElementById('fullscreen-letter-modal').classList.add('active');
      typeWriterLetter();
    }, 500);
  };

  document.getElementById('close-letter-btn').onclick = () => {
    document.getElementById('fullscreen-letter-modal').classList.remove('active');
    document.getElementById('btn-chap-7').style.display = 'inline-block';
  };

  document.getElementById('btn-chap-7').onclick = () => goToChapter(8);

  /* Chap 8 Polaroid Gallery */
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
    document.getElementById('photo-counter').textContent = `Memory ${pIdx + 1} of 8 (Tap to Flip)`;
    document.getElementById('photo-idx-num').textContent = pIdx + 1;
    document.getElementById('photo-caption').textContent = photoList[pIdx].cap;
    document.getElementById('photo-back-note').textContent = `"${photoList[pIdx].note}"`;
    document.getElementById('polaroid-el').classList.remove('flipped');
  }

  document.getElementById('polaroid-el').onclick = () => {
    triggerHaptic(30);
    document.getElementById('polaroid-el').classList.toggle('flipped');
  };
  document.getElementById('next-photo-btn').onclick = () => { pIdx = (pIdx + 1) % photoList.length; renderPhoto(); };
  document.getElementById('prev-photo-btn').onclick = () => { pIdx = (pIdx - 1 + photoList.length) % photoList.length; renderPhoto(); };
  document.getElementById('btn-chap-8').onclick = () => goToChapter(9);

  /* Chap 9 Certificate Seal Tap */
  document.getElementById('seal-el').onclick = () => {
    triggerHaptic(50);
    document.getElementById('stats-overlay').style.display = 'block';
  };
  document.getElementById('btn-chap-9').onclick = () => goToChapter(10);

  /* Chap 10 Reasons Deck & Scratch Canvas */
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

  document.getElementById('reason-card-el').onclick = () => {
    triggerHaptic(20);
    rIdx = (rIdx + 1) % reasonsList.length;
    document.getElementById('reason-idx').textContent = `Reason ${rIdx + 1} of 19 (Tap card)`;
    document.getElementById('reason-text-el').textContent = reasonsList[rIdx];
  };

  function initScratchCanvas() {
    const scratchCanvas = document.getElementById('scratch-canvas');
    if (!scratchCanvas) return;
    const scratchCtx = scratchCanvas.getContext('2d');
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

  document.getElementById('btn-chap-10').onclick = () => goToChapter(11);
  document.getElementById('btn-chap-11').onclick = () => goToChapter(12);

  /* Screen Capture Button */
  document.getElementById('nav-capture-btn').onclick = () => {
    triggerHaptic(50);
    html2canvas(document.body).then(canvas => {
      const a = document.createElement('a');
      a.download = 'Samrudhi-19th-Birthday.png';
      a.href = canvas.toDataURL();
      a.click();
    });
  };

  /* Synchronized Visual & Audio Fireworks Canvas Engine */
  const fwCanvas = document.getElementById('fireworks-canvas');
  const fwCtx = fwCanvas.getContext('2d');
  let bw = (fwCanvas.width = window.innerWidth);
  let bh = (fwCanvas.height = window.innerHeight);

  let particles = [];
  function createFirework(x, y) {
    // Play explosion sound precisely when particles burst visually!
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
    requestAnimationFrame(renderFireworks);
  }
  renderFireworks();

  window.onresize = () => {
    bw = fwCanvas.width = window.innerWidth;
    bh = fwCanvas.height = window.innerHeight;
  };

  // Initial State Reset
  resetAllStates();

});

