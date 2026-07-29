document.addEventListener('DOMContentLoaded', () => {

  let currentChap = 1;
  const TOTAL_CHAPS = 14;
  const TARGET_DATE = new Date("2026-08-02T00:00:00");
  const SECRET_PIN = "1809";

  function triggerHaptic(pattern = 30) {
    if ('vibrate' in navigator) navigator.vibrate(pattern);
  }

  function goToChapter(num) {
    if (num < 1 || num > TOTAL_CHAPS) return;
    triggerHaptic(40);
    document.querySelectorAll('.chapter').forEach(c => c.classList.remove('active'));

    const next = document.getElementById('chap-' + num);
    if (next) next.classList.add('active');
    currentChap = num;

    if (num === 3) startFireworksLoop();
    if (num === 11) {
      isPetalsActive = true;
      document.getElementById('bg-layer').classList.add('floral-theme');
    }
    if (num === 14) triggerHaptic([60, 120, 60]);
  }

  document.getElementById('nav-back-btn').addEventListener('click', () => goToChapter(currentChap - 1));
  document.getElementById('nav-replay-btn').addEventListener('click', () => goToChapter(1));

  /* FINGER TOUCH-DRAG 360° / 180° ROTATION ENGINE */
  function enableFingerDragSpin(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    let isDragging = false;
    let startX = 0;
    let currentRotationY = 0;

    const startDrag = (e) => {
      isDragging = true;
      startX = e.touches ? e.touches[0].clientX : e.clientX;
    };

    const moveDrag = (e) => {
      if (!isDragging) return;
      const currentX = e.touches ? e.touches[0].clientX : e.clientX;
      const deltaX = currentX - startX;
      currentRotationY += deltaX * 0.85; // rotation speed multiplier
      startX = currentX;
      el.style.transform = `rotateY(${currentRotationY}deg)`;
    };

    const stopDrag = () => { isDragging = false; };

    el.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup', stopDrag);

    el.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchmove', moveDrag, { passive: true });
    window.addEventListener('touchend', stopDrag);
  }

  enableFingerDragSpin('cake-touch-area');
  enableFingerDragSpin('gift-box-3d');

  /* Web Audio Synthesizers */
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) audioCtx = new AudioCtx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  }

  /* REAL FIRECRACKER SYNTHESIZER */
  let firecrackerInterval = null;
  function startFirecrackerSynth() {
    initAudio();
    if (!audioCtx || firecrackerInterval) return;

    firecrackerInterval = setInterval(() => {
      const now = audioCtx.currentTime;

      // Sub-bass Boom
      const boom = audioCtx.createOscillator();
      const boomGain = audioCtx.createGain();
      boom.type = 'sine';
      boom.frequency.setValueAtTime(150, now);
      boom.frequency.exponentialRampToValueAtTime(25, now + 0.35);
      boomGain.gain.setValueAtTime(0.9, now);
      boomGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      boom.connect(boomGain);
      boomGain.connect(audioCtx.destination);
      boom.start(now);
      boom.stop(now + 0.35);

      // Crackle Noise Tail
      const bufferSize = audioCtx.sampleRate * 0.1;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = audioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      noise.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);
      noise.start(now);

    }, 220);
  }

  function stopFirecrackerSynth() {
    if (firecrackerInterval) {
      clearInterval(firecrackerInterval);
      firecrackerInterval = null;
    }
  }

  const mainAudio = document.getElementById('audio-main');
  const hbdAudio = document.getElementById('audio-hbd');

  function startMainAudio() {
    if (mainAudio.paused) {
      mainAudio.volume = 1.0;
      mainAudio.play().catch(() => {});
    }
  }

  /* Chap 1 Loading */
  setTimeout(() => {
    document.getElementById('load-bar').style.width = '100%';
    setTimeout(() => { document.getElementById('btn-chap-1').style.display = 'inline-block'; }, 1200);
  }, 300);

  document.getElementById('btn-chap-1').onclick = () => { startMainAudio(); goToChapter(2); };

  /* Chap 2 Countdown & Secret Passcode */
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

  /* Chap 3 Fireworks */
  function startFireworksLoop() {
    startFirecrackerSynth();
    document.getElementById('fireworks-canvas').classList.add('active');
  }

  document.getElementById('btn-chap-3').onclick = () => {
    stopFirecrackerSynth();
    document.getElementById('fireworks-canvas').classList.remove('active');
    goToChapter(4);
  };

  /* Chap 4 Cake Slicing */
  let isCakeCut = false;
  function cutCake() {
    if (isCakeCut) return;
    isCakeCut = true;
    document.getElementById('cake-stage').classList.add('slicing');

    setTimeout(() => {
      document.getElementById('cake-split-box').classList.add('sliced');
      document.getElementById('candle-flame').style.display = 'none';

      mainAudio.pause();
      hbdAudio.play().catch(() => {});

      setTimeout(() => { document.getElementById('btn-chap-4').style.display = 'inline-block'; }, 1500);
    }, 600);
  }

  document.getElementById('cake-touch-area').onclick = cutCake;
  document.getElementById('btn-chap-4').onclick = () => {
    hbdAudio.pause();
    startMainAudio();
    goToChapter(5);
  };

  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const micCtx = new AudioCtx();
      const source = micCtx.createMediaStreamSource(stream);
      const analyser = micCtx.createAnalyser();
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      function checkMic() {
        analyser.getByteFrequencyData(data);
        let avg = data.reduce((a, b) => a + b) / data.length;
        if (avg > 35) cutCake();
        requestAnimationFrame(checkMic);
      }
      checkMic();
    }).catch(() => {});
  }

  /* Chap 5 Gift Box Unwrapping */
  document.getElementById('gift-box-3d').onclick = () => {
    document.getElementById('gift-box-3d').classList.add('opened');
    setTimeout(() => { document.getElementById('btn-chap-5').style.display = 'inline-block'; }, 600);
  };
  document.getElementById('btn-chap-5').onclick = () => goToChapter(6);

  /* Chap 6 Envelope, Unrolling Scroll & Line-by-Line Typing */
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
        setTimeout(typeNextLine, 700);
      } else {
        document.getElementById('btn-chap-6').style.display = 'inline-block';
      }
    }
    typeNextLine();
  }

  document.getElementById('envelope-wrapper').onclick = () => {
    document.getElementById('envelope-el').classList.add('open');
    setTimeout(() => {
      document.getElementById('scroll-el').classList.add('unrolled');
      setTimeout(typeWriterLetter, 600);
    }, 400);
  };
  document.getElementById('btn-chap-6').onclick = () => goToChapter(7);

  /* Chap 7 Polaroid Gallery */
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

  document.getElementById('polaroid-el').onclick = () => { document.getElementById('polaroid-el').classList.toggle('flipped'); };
  document.getElementById('next-photo-btn').onclick = () => { pIdx = (pIdx + 1) % photoList.length; renderPhoto(); };
  document.getElementById('prev-photo-btn').onclick = () => { pIdx = (pIdx - 1 + photoList.length) % photoList.length; renderPhoto(); };
  document.getElementById('btn-chap-7').onclick = () => goToChapter(8);

  /* Chap 8 Certificate Seal Tap */
  document.getElementById('seal-el').onclick = () => { document.getElementById('stats-overlay').style.display = 'block'; };
  document.getElementById('btn-chap-8').onclick = () => goToChapter(9);

  /* Chap 9 Reasons Deck */
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
    rIdx = (rIdx + 1) % reasonsList.length;
    document.getElementById('reason-idx').textContent = `Reason ${rIdx + 1} of 19 (Tap card)`;
    document.getElementById('reason-text-el').textContent = reasonsList[rIdx];
  };
  document.getElementById('btn-chap-9').onclick = () => goToChapter(10);

  /* Chap 10 Scratch Canvas */
  const scratchCanvas = document.getElementById('scratch-canvas');
  const scratchCtx = scratchCanvas.getContext('2d');
  scratchCtx.fillStyle = '#d4af37';
  scratchCtx.fillRect(0, 0, 250, 125);
  scratchCtx.fillStyle = '#120318';
  scratchCtx.font = '11px Poppins';
  scratchCtx.fillText('Scratch Here ✨', 82, 68);

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

  scratchCanvas.addEventListener('mousedown', () => isScratching = true);
  scratchCanvas.addEventListener('mouseup', () => isScratching = false);
  scratchCanvas.addEventListener('mousemove', scratchScratch);
  scratchCanvas.addEventListener('touchstart', () => isScratching = true);
  scratchCanvas.addEventListener('touchend', () => isScratching = false);
  scratchCanvas.addEventListener('touchmove', scratchScratch);

  document.getElementById('btn-chap-10').onclick = () => goToChapter(11);
  document.getElementById('btn-chap-11').onclick = () => goToChapter(12);

  document.getElementById('btn-chap-12').onclick = () => {
    const wishVal = document.getElementById('wish-input').value;
    if (wishVal) localStorage.setItem('samrudhi_19_wish', wishVal);
    goToChapter(13);
  };

  /* Chap 13 Firefly Jar */
  document.getElementById('jar-el').onclick = () => {
    document.getElementById('jar-el').classList.add('opened');
    document.getElementById('jar-status').textContent = "✨ Fireflies released into the night sky!";
    document.getElementById('btn-chap-13').style.display = 'inline-block';
  };
  document.getElementById('btn-chap-13').onclick = () => goToChapter(14);

  document.getElementById('nav-capture-btn').onclick = () => {
    html2canvas(document.body).then(canvas => {
      const a = document.createElement('a');
      a.download = 'Samrudhi-19th-Birthday.png';
      a.href = canvas.toDataURL();
      a.click();
    });
  };

  /* Canvases */
  const bCanvas = document.getElementById('bokeh-canvas');
  const bCtx = bCanvas.getContext('2d');
  let bw = (bCanvas.width = window.innerWidth);
  let bh = (bCanvas.height = window.innerHeight);

  const bDots = Array.from({ length: 28 }, () => ({
    x: Math.random() * bw, y: Math.random() * bh,
    r: Math.random() * 4 + 2, alpha: Math.random() * 0.5 + 0.2, vy: Math.random() * 0.4 + 0.15
  }));

  function renderBokeh() {
    bCtx.clearRect(0, 0, bw, bh);
    bDots.forEach(d => {
      d.y -= d.vy;
      if (d.y < -10) d.y = bh + 10;
      bCtx.fillStyle = `rgba(212, 175, 55, ${d.alpha})`;
      bCtx.beginPath();
      bCtx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      bCtx.fill();
    });
    requestAnimationFrame(renderBokeh);
  }
  renderBokeh();

  let isPetalsActive = false;
  const pCanvas = document.getElementById('petals-canvas');
  const pCtx = pCanvas.getContext('2d');
  pCanvas.width = bw; pCanvas.height = bh;

  const petals = Array.from({ length: 22 }, () => ({
    x: Math.random() * bw, y: Math.random() * bh,
    r: Math.random() * 5 + 3, vy: Math.random() * 1 + 0.5, vx: Math.sin(Math.random() * Math.PI) * 0.5
  }));

  function renderPetals() {
    pCtx.clearRect(0, 0, bw, bh);
    if (isPetalsActive) {
      petals.forEach(p => {
        p.y += p.vy; p.x += p.vx;
        if (p.y > bh) p.y = -10;
        pCtx.fillStyle = 'rgba(255, 183, 3, 0.65)';
        pCtx.beginPath();
        pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        pCtx.fill();
      });
    }
    requestAnimationFrame(renderPetals);
  }
  renderPetals();

  const fwCanvas = document.getElementById('fireworks-canvas');
  const fwCtx = fwCanvas.getContext('2d');
  fwCanvas.width = bw; fwCanvas.height = bh;

  let particles = [];
  function createFirework(x, y) {
    const colors = ['#ffd700', '#ff007f', '#9d4edd', '#00f5d4', '#ffffff'];
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      particles.push({
        x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)], alpha: 1, decay: Math.random() * 0.02 + 0.015
      });
    }
  }

  function renderFireworks() {
    fwCtx.clearRect(0, 0, bw, bh);
    if (fwCanvas.classList.contains('active') && Math.random() < 0.1) {
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
        fwCtx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        fwCtx.fill();
      }
    });
    fwCtx.globalAlpha = 1;
    requestAnimationFrame(renderFireworks);
  }
  renderFireworks();

  window.onresize = () => {
    bw = bCanvas.width = pCanvas.width = fwCanvas.width = window.innerWidth;
    bh = bCanvas.height = pCanvas.height = fwCanvas.height = window.innerHeight;
  };

});
  
