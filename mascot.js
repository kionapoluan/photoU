/**
 * mascot.js — PhotoU Mascot Animation System
 * Inject a mascot character that does page-specific animations.
 * Usage: <script src="mascot.js" data-scene="index|frames|booth|sticker|result"></script>
 */
(function () {
  const SCENE = document.currentScript?.dataset?.scene || 'idle';

  /* ── inject styles ── */
  const style = document.createElement('style');
  style.textContent = `
    #mascot-root {
      position: fixed;
      bottom: 0;
      right: -120px;
      z-index: 9999;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      transition: right 0.05s linear;
    }
    #mascot-bubble {
      background: white;
      border: 2.5px solid #b05dd8;
      border-radius: 16px 16px 4px 16px;
      padding: 7px 12px;
      font-family: 'Space Mono', 'Courier New', monospace;
      font-size: 10px;
      color: #7a4a99;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 14px rgba(176,93,216,0.25);
      white-space: nowrap;
      opacity: 0;
      transform: scale(0.7) translateY(8px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      pointer-events: none;
      max-width: 180px;
      white-space: normal;
      text-align: center;
      line-height: 1.4;
    }
    #mascot-bubble.show {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    #mascot-img {
      width: 80px;
      image-rendering: pixelated;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
      transform-origin: bottom center;
    }

    /* animations */
    @keyframes mascot-wave {
      0%,100% { transform: rotate(0deg) scaleX(1); }
      20%      { transform: rotate(-8deg) scaleX(1); }
      40%      { transform: rotate(8deg) scaleX(1); }
      60%      { transform: rotate(-6deg) scaleX(1); }
      80%      { transform: rotate(6deg) scaleX(1); }
    }
    @keyframes mascot-idle-bob {
      0%,100% { transform: translateY(0) scaleX(1); }
      25%     { transform: translateY(-6px) scaleX(1); }
      50%     { transform: translateY(0) scaleX(-1); }
      75%     { transform: translateY(-6px) scaleX(-1); }
    }
    @keyframes mascot-jump {
      0%,100% { transform: translateY(0) scaleX(var(--mx,1)); }
      30%     { transform: translateY(-18px) scaleX(var(--mx,1)); }
      60%     { transform: translateY(-8px) scaleX(var(--mx,1)); }
    }
    @keyframes mascot-dance {
      0%  { transform: rotate(-10deg) translateY(0); }
      25% { transform: rotate(10deg) translateY(-10px); }
      50% { transform: rotate(-10deg) translateY(0); }
      75% { transform: rotate(10deg) translateY(-10px); }
      100%{ transform: rotate(-10deg) translateY(0); }
    }
    @keyframes mascot-spin {
      from { transform: rotateY(0deg); }
      to   { transform: rotateY(360deg); }
    }
    @keyframes mascot-walk-step {
      0%   { transform: scaleX(1) translateY(0); }
      25%  { transform: scaleX(1) translateY(-4px); }
      50%  { transform: scaleX(-1) translateY(0); }
      75%  { transform: scaleX(-1) translateY(-4px); }
      100% { transform: scaleX(1) translateY(0); }
    }
    @keyframes mascot-press-btn {
      0%,100% { transform: translateY(0); }
      50%     { transform: translateY(-10px); }
    }
    @keyframes mascot-happy {
      0%,100% { transform: translateY(0) rotate(0deg); }
      25%     { transform: translateY(-12px) rotate(-5deg); }
      50%     { transform: translateY(0) rotate(5deg); }
      75%     { transform: translateY(-8px) rotate(-5deg); }
    }
  `;
  document.head.appendChild(style);

  /* ── create DOM ── */
  const root = document.createElement('div');
  root.id = 'mascot-root';

  const bubble = document.createElement('div');
  bubble.id = 'mascot-bubble';

  const img = document.createElement('img');
  img.id = 'mascot-img';
  img.src = 'mascot.png';
  img.alt = 'mascot';

  root.appendChild(bubble);
  root.appendChild(img);
  document.body.appendChild(root);

  /* ── helpers ── */
  function setAnim(name, dur = '1s', iter = 'infinite') {
    img.style.animation = `${name} ${dur} ease-in-out ${iter}`;
  }
  function clearAnim() {
    img.style.animation = 'none';
    img.style.transform = '';
  }
  function showBubble(text, ms = 3000) {
    bubble.textContent = text;
    bubble.classList.add('show');
    if (ms > 0) setTimeout(() => bubble.classList.remove('show'), ms);
  }
  function hideBubble() { bubble.classList.remove('show'); }

  /* slide in from right */
  function slideIn(targetRight = 16, speed = 3, cb) {
    let cur = -120;
    root.style.right = cur + 'px';
    const iv = setInterval(() => {
      cur = Math.min(cur + speed, targetRight);
      root.style.right = cur + 'px';
      if (cur >= targetRight) { clearInterval(iv); cb && cb(); }
    }, 16);
  }

  /* slide out to right */
  function slideOut(speed = 4, cb) {
    let cur = parseFloat(root.style.right || '16');
    const iv = setInterval(() => {
      cur -= speed;
      root.style.right = cur + 'px';
      if (cur < -130) { clearInterval(iv); cb && cb(); }
    }, 16);
  }

  /* walk left-right patrol */
  function startPatrol(leftPx, rightPx, stepMs = 16) {
    let pos = rightPx;
    let dir = -1; // going left first
    let walking = true;
    img.style.transform = 'scaleX(1)';

    function step() {
      if (!walking) return;
      pos += dir * 2;
      root.style.right = pos + 'px';
      img.style.transform = dir < 0 ? 'scaleX(1)' : 'scaleX(-1)';
      // add slight bob
      const bob = Math.sin(Date.now() / 150) * 3;
      img.style.marginBottom = bob + 'px';
      if (pos <= leftPx) dir = 1;
      if (pos >= rightPx) dir = -1;
      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
    return () => { walking = false; };
  }

  /* ── SCENE LOGIC ── */

  // --- INDEX (splash) scene ---
  if (SCENE === 'index') {
    setTimeout(() => {
      setAnim('mascot-wave', '0.6s');
      slideIn(16, 3, () => {
        showBubble('Hai! Klik START\nuntuk mulai! 📸', 3500);
        setAnim('mascot-wave', '0.6s');
        setTimeout(() => {
          // walk toward START button (slide left)
          let pos = 16;
          hideBubble();
          img.style.animation = 'none';
          const iv = setInterval(() => {
            pos += 2;
            root.style.right = pos + 'px';
            const bob = Math.sin(Date.now() / 160) * 3;
            img.style.transform = `scaleX(-1) translateY(${bob}px)`;
            if (pos >= 200) {
              clearInterval(iv);
              // "press" START button animation
              img.style.transform = 'scaleX(-1)';
              setAnim('mascot-press-btn', '0.4s', '4');
              showBubble('Ayo tekan START! 🌸', 2500);
              setTimeout(() => {
                hideBubble();
                // walk back to right
                const iv2 = setInterval(() => {
                  pos -= 2;
                  root.style.right = pos + 'px';
                  const bob2 = Math.sin(Date.now() / 160) * 3;
                  img.style.transform = `scaleX(1) translateY(${bob2}px)`;
                  if (pos <= 16) {
                    clearInterval(iv2);
                    setAnim('mascot-idle-bob', '2s');
                  }
                }, 16);
              }, 2800);
            }
          }, 16);
        }, 4200);
      });
    }, 800);
  }

  // --- FRAMES (choose frame) scene ---
  else if (SCENE === 'frames') {
    setTimeout(() => {
      slideIn(16, 3, () => {
        showBubble('Pilih frame yang\npaling cantik! 🎀', 3000);
        setAnim('mascot-idle-bob', '2s');
      });
    }, 600);

    // when user clicks a frame card → mascot jumps happily
    document.addEventListener('click', (e) => {
      if (e.target.closest('.fcard')) {
        clearAnim();
        setAnim('mascot-jump', '0.5s', '2');
        showBubble('Wah bagus pilihannya! ✨', 2000);
      }
      // when USE THIS FRAME is clicked → mascot does a spin then walks away
      if (e.target.closest('#useBtn') || e.target.closest('.use-btn')) {
        clearAnim();
        setAnim('mascot-happy', '0.6s', '3');
        showBubble('Yeay! Sini foto! 📷', 2000);
        setTimeout(() => slideOut(5), 2200);
      }
    });

    // Patrol when idle
    setTimeout(() => {
      document.addEventListener('mousemove', resetIdleTimer);
      let idleTimer = null;
      function resetIdleTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(doIdlePatrol, 6000);
      }
      let stopPatrol = null;
      function doIdlePatrol() {
        clearAnim();
        showBubble('Psst... pilih yang\nada bunga-bunganya! 🌸', 3000);
        if (stopPatrol) stopPatrol();
        stopPatrol = startPatrol(16, 120);
        resetIdleTimer();
      }
      resetIdleTimer();
    }, 2000);
  }

  // --- BOOTH (take photo) scene ---
  else if (SCENE === 'booth') {
    setTimeout(() => {
      slideIn(16, 3, () => {
        showBubble('Siap foto? Senyum\nyang manis ya! 😊', 3000);
        setAnim('mascot-idle-bob', '2s');
      });
    }, 600);

    // when SNAP button clicked → mascot celebrates
    document.addEventListener('click', (e) => {
      if (e.target.closest('.snap-btn')) {
        clearAnim();
        setAnim('mascot-happy', '0.4s', '3');
        const msgs = ['Kece banget! 📸', 'Cantik! Lagi dong! ✨', 'Mantap jiwa! 🌸'];
        const taken = document.querySelectorAll('.slot-wrap img').length;
        showBubble(msgs[Math.min(taken, 2)], 2000);
      }
      // FINISH / NEXT
      if (e.target.closest('#nextFinishBtn:not(:disabled)') || e.target.closest('#finishBtn:not(:disabled)')) {
        clearAnim();
        setAnim('mascot-dance', '0.5s', '4');
        showBubble('Sekarang kasih\nstiker lucu! 🎉', 2000);
        setTimeout(() => slideOut(5), 2500);
      }
    });

    // patrol when idle
    setTimeout(() => {
      let stopP = null;
      let idleTm = null;
      function resetIdle() {
        clearTimeout(idleTm);
        idleTm = setTimeout(() => {
          if (stopP) stopP();
          const quips = ['Jangan lupa senyum!😄', 'Pencahayaan oke~', 'Pose apa nih? 💅'];
          showBubble(quips[Math.floor(Math.random() * quips.length)], 3000);
          stopP = startPatrol(16, 100);
          resetIdle();
        }, 7000);
      }
      document.addEventListener('mousemove', resetIdle);
      resetIdle();
    }, 2000);
  }

  // --- STICKER scene ---
  else if (SCENE === 'sticker') {
    setTimeout(() => {
      slideIn(16, 3, () => {
        showBubble('Tempel stiker\nfavorit kamu! 🎀', 3000);
        setAnim('mascot-idle-bob', '2s');
      });
    }, 600);

    document.addEventListener('click', (e) => {
      if (e.target.closest('.sticker-item')) {
        clearAnim();
        setAnim('mascot-jump', '0.4s', '2');
        showBubble('Lucu stikernya! 💖', 1800);
      }
      if (e.target.closest('.next-btn')) {
        clearAnim();
        setAnim('mascot-dance', '0.5s', '4');
        showBubble('Hampir selesai!\nYeay! 🎉', 2000);
        setTimeout(() => slideOut(5), 2500);
      }
    });

    // patrol idle
    setTimeout(() => {
      let stopP = null;
      let idleTm = null;
      function resetIdle() {
        clearTimeout(idleTm);
        idleTm = setTimeout(() => {
          if (stopP) stopP();
          showBubble('Coba stiker bintang~⭐', 3000);
          stopP = startPatrol(16, 110);
          resetIdle();
        }, 8000);
      }
      document.addEventListener('mousemove', resetIdle);
      resetIdle();
    }, 2000);
  }

  // --- RESULT scene ---
  else if (SCENE === 'result') {
    setTimeout(() => {
      slideIn(16, 3, () => {
        showBubble('WOW keren banget\nfoto kamu! 😍', 3000);
        setAnim('mascot-happy', '0.6s', '4');
        setTimeout(() => {
          setAnim('mascot-idle-bob', '2s');
          setTimeout(() => {
            showBubble('Jangan lupa save\nfotonya ya! 💾', 3000);
          }, 4000);
        }, 3000);
      });
    }, 800);

    document.addEventListener('click', (e) => {
      if (e.target.closest('.ac-btn.purple')) {
        clearAnim();
        setAnim('mascot-dance', '0.5s', '6');
        showBubble('Tersimpan! Cantik~📸', 2500);
        setTimeout(() => setAnim('mascot-idle-bob', '2s'), 3500);
      }
    });
  }

  // --- default idle ---
  else {
    slideIn(16, 3, () => {
      setAnim('mascot-idle-bob', '2s');
    });
  }

})();
