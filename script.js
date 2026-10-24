(() => {
  "use strict";

  /* --------------------------------------------------------------------------
     1. WEB AUDIO SYNTHESIZER (Music Box Melody & Interactive SFX)
     -------------------------------------------------------------------------- */
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
      this.melodyTimer = null;
      this.noteIndex = 0;
      this.melody = [
        [261.63, 0.35],
        [261.63, 0.25],
        [293.66, 0.55],
        [261.63, 0.55],
        [349.23, 0.55],
        [329.63, 0.95],
        [261.63, 0.35],
        [261.63, 0.25],
        [293.66, 0.55],
        [261.63, 0.55],
        [392.0, 0.55],
        [349.23, 0.95],
        [261.63, 0.35],
        [261.63, 0.25],
        [523.25, 0.55],
        [440.0, 0.55],
        [349.23, 0.55],
        [329.63, 0.55],
        [293.66, 0.85],
        [466.16, 0.35],
        [466.16, 0.25],
        [440.0, 0.55],
        [349.23, 0.55],
        [392.0, 0.55],
        [349.23, 1.1],
      ];
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }

    playTone(freq, duration = 0.4, type = "sine", volume = 0.12, delay = 0) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime + delay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    }

    playSparkle() {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((f, idx) => {
        this.playTone(f, 0.35, "triangle", 0.09, idx * 0.07);
      });
    }

    playWhoosh() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.28);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.16, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }

    playHeartBlast() {
      const chord = [261.63, 329.63, 392.0, 493.88, 587.33, 783.99, 1046.5];
      chord.forEach((f, i) => {
        this.playTone(f, 1.3, "triangle", 0.1, i * 0.055);
      });
    }

    playPop(pitchOffset = 0) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(420 + pitchOffset * 35, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);

      this.playTone(523.25 + pitchOffset * 55, 0.4, "triangle", 0.08, 0.06);
    }

    startAmbientMelody() {
      if (this.melodyTimer) return;
      const step = () => {
        if (this.enabled && this.ctx && this.ctx.state === "running") {
          const [freq, dur] = this.melody[this.noteIndex % this.melody.length];
          this.playTone(freq, dur * 1.1, "sine", 0.042, 0);
          this.playTone(freq * 2, dur * 0.7, "triangle", 0.016, 0.02);
          this.noteIndex++;
          this.melodyTimer = setTimeout(step, dur * 950);
        } else {
          this.melodyTimer = setTimeout(step, 800);
        }
      };
      this.melodyTimer = setTimeout(step, 600);
    }

    toggle() {
      this.enabled = !this.enabled;
      if (this.enabled) {
        this.init();
        this.playSparkle();
      }
      return this.enabled;
    }
  }

  const sound = new SoundEngine();

  /* --------------------------------------------------------------------------
     2. OFFSCREEN HEART SPRITE CACHE & HIGH-PERFORMANCE PARTICLE ENGINE
     -------------------------------------------------------------------------- */
  const ambientCanvas = document.getElementById("ambient-canvas");
  const ambientCtx = ambientCanvas.getContext("2d", { alpha: true });
  const fxCanvas = document.getElementById("fx-canvas");
  const fxCtx = fxCanvas.getContext("2d", { alpha: true });

  let viewW = window.innerWidth;
  let viewH = window.innerHeight;

  function resizeCanvases() {
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    ambientCanvas.width = viewW;
    ambientCanvas.height = viewH;
    fxCanvas.width = viewW;
    fxCanvas.height = viewH;
  }
  window.addEventListener("resize", resizeCanvases, { passive: true });
  resizeCanvases();

  function drawHeartPath(ctx, x, y, size) {
    ctx.beginPath();
    const topCurveHeight = size * 0.3;
    ctx.moveTo(x, y + topCurveHeight);
    ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    ctx.bezierCurveTo(
      x - size / 2,
      y + (size + topCurveHeight) / 2,
      x,
      y + (size + topCurveHeight) / 1.4,
      x,
      y + size,
    );
    ctx.bezierCurveTo(
      x,
      y + (size + topCurveHeight) / 1.4,
      x + size / 2,
      y + (size + topCurveHeight) / 2,
      x + size / 2,
      y + topCurveHeight,
    );
    ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    ctx.closePath();
  }

  // Pre-render glowing heart sprites once so per-frame drawing uses fast drawImage()
  const heartSpriteCache = new Map();
  function getHeartSprite(color, withGlow = false) {
    const key = `${color}_${withGlow}`;
    if (heartSpriteCache.has(key)) return heartSpriteCache.get(key);

    const c = document.createElement("canvas");
    c.width = 40;
    c.height = 40;
    const ctx = c.getContext("2d");
    ctx.fillStyle = color;
    if (withGlow) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 6;
    }
    drawHeartPath(ctx, 20, 8, 22);
    ctx.fill();
    heartSpriteCache.set(key, c);
    return c;
  }

  // Lightweight ambient floating stardust (32 particles, zero bezier calculation per frame)
  const ambientParticles = Array.from({ length: 32 }, () => {
    const hue = Math.random() < 0.5 ? "#ff85b3" : "#ffe6a3";
    const isHeart = Math.random() < 0.28;
    return {
      x: Math.random() * viewW,
      y: Math.random() * viewH,
      r: Math.random() * 2.2 + 0.9,
      vy: -(Math.random() * 0.4 + 0.15),
      vx: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.55 + 0.2,
      isHeart,
      hue,
      sprite: isHeart ? getHeartSprite(hue, false) : null,
    };
  });

  const fxParticles = [];
  const shockwaves = [];
  const MAX_FX_PARTICLES = 90;
  let fxWasActive = false;

  function trimFxParticles() {
    if (fxParticles.length > MAX_FX_PARTICLES) {
      fxParticles.splice(0, fxParticles.length - MAX_FX_PARTICLES);
    }
  }

  function spawnHeartBlast(x, y, count = 46) {
    const colors = [
      "#ff2e79",
      "#ff7eb3",
      "#ffe6a3",
      "#f5b963",
      "#ffffff",
      "#ff4b91",
    ];
    shockwaves.push({
      x,
      y,
      r: 10,
      maxR: Math.max(viewW, viewH) * 0.48,
      alpha: 0.85,
    });

    const actualCount = Math.min(count, 52);
    for (let i = 0; i < actualCount; i++) {
      const angle =
        (Math.PI * 2 * i) / actualCount + (Math.random() - 0.5) * 0.3;
      const speed = Math.random() * 9.5 + 3;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const isHeart = Math.random() < 0.68;
      fxParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        gravity: 0.14,
        drag: 0.97,
        size: Math.random() * 12 + 8,
        color,
        sprite: isHeart ? getHeartSprite(color, false) : null,
        alpha: 1,
        decay: Math.random() * 0.016 + 0.012,
        shape: isHeart ? "heart" : "sparkle",
      });
    }
    trimFxParticles();
  }

  function spawnConfettiShower(count = 42) {
    const colors = [
      "#ff4b91",
      "#ffe6a3",
      "#ff9ec7",
      "#f5b963",
      "#c084fc",
      "#ffffff",
    ];
    const actualCount = Math.min(count, 48);
    for (let i = 0; i < actualCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      const isHeart = Math.random() < 0.45;
      fxParticles.push({
        x: Math.random() * viewW,
        y: -15 - Math.random() * 60,
        vx: (Math.random() - 0.5) * 3.5,
        vy: Math.random() * 4.2 + 2.4,
        gravity: 0.06,
        drag: 0.99,
        size: Math.random() * 10 + 7,
        color,
        sprite: isHeart ? getHeartSprite(color, false) : null,
        alpha: 1,
        decay: 0.009,
        shape: isHeart ? "heart" : "confetti",
      });
    }
    trimFxParticles();
  }

  function animateCanvases() {
    if (!document.hidden) {
      // 1. Ambient Canvas
      ambientCtx.clearRect(0, 0, viewW, viewH);
      for (let i = 0; i < ambientParticles.length; i++) {
        const p = ambientParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -20) p.y = viewH + 20;
        if (p.x < -20) p.x = viewW + 20;
        if (p.x > viewW + 20) p.x = -20;

        ambientCtx.globalAlpha = p.alpha;
        if (p.isHeart && p.sprite) {
          const s = p.r * 6.5;
          ambientCtx.drawImage(p.sprite, p.x - s / 2, p.y - s / 2, s, s);
        } else {
          ambientCtx.fillStyle = p.hue;
          ambientCtx.beginPath();
          ambientCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ambientCtx.fill();
        }
      }
      ambientCtx.globalAlpha = 1;

      // 2. Foreground FX Canvas (only draws when active particles exist)
      const hasFx = fxParticles.length > 0 || shockwaves.length > 0;
      if (hasFx || fxWasActive) {
        fxCtx.clearRect(0, 0, viewW, viewH);
        fxWasActive = hasFx;

        for (let i = shockwaves.length - 1; i >= 0; i--) {
          const sw = shockwaves[i];
          sw.r += (sw.maxR - sw.r) * 0.1;
          sw.alpha *= 0.9;
          fxCtx.beginPath();
          fxCtx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
          fxCtx.strokeStyle = `rgba(255, 180, 215, ${sw.alpha})`;
          fxCtx.lineWidth = 4;
          fxCtx.stroke();
          if (sw.alpha < 0.025) shockwaves.splice(i, 1);
        }

        for (let i = fxParticles.length - 1; i >= 0; i--) {
          const pt = fxParticles[i];
          pt.vx *= pt.drag;
          pt.vy = pt.vy * pt.drag + pt.gravity;
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.alpha -= pt.decay;

          if (pt.alpha <= 0 || pt.y > viewH + 30) {
            fxParticles.splice(i, 1);
            continue;
          }

          fxCtx.globalAlpha = Math.max(0, pt.alpha);
          if (pt.shape === "heart" && pt.sprite) {
            const drawSize = pt.size * 1.6;
            fxCtx.drawImage(
              pt.sprite,
              pt.x - drawSize / 2,
              pt.y - drawSize / 2,
              drawSize,
              drawSize,
            );
          } else if (pt.shape === "confetti") {
            fxCtx.fillStyle = pt.color;
            fxCtx.fillRect(
              pt.x - pt.size / 2,
              pt.y - pt.size / 4,
              pt.size,
              pt.size * 0.55,
            );
          } else {
            fxCtx.fillStyle = pt.color;
            fxCtx.beginPath();
            fxCtx.arc(pt.x, pt.y, pt.size * 0.32, 0, Math.PI * 2);
            fxCtx.fill();
          }
        }
        fxCtx.globalAlpha = 1;
      }
    }

    requestAnimationFrame(animateCanvases);
  }
  requestAnimationFrame(animateCanvases);

  /* --------------------------------------------------------------------------
     3. STAGE NAVIGATION & SOUND HUD
     -------------------------------------------------------------------------- */
  let currentStage = 1;
  const stages = document.querySelectorAll(".stage");
  const stageDots = document.querySelectorAll(".stage-dot");
  const soundToggleBtn = document.getElementById("sound-toggle");
  const soundIcon = document.getElementById("sound-icon");
  const soundLabel = document.getElementById("sound-label");

  soundToggleBtn.addEventListener("click", () => {
    const isOn = sound.toggle();
    soundIcon.textContent = isOn ? "🔊" : "🔇";
    soundLabel.textContent = isOn ? "Melody On" : "Muted";
  });

  function goToStage(stageNum) {
    currentStage = stageNum;
    stages.forEach((sec, idx) => {
      const num = idx + 1;
      sec.classList.toggle("active", num === stageNum);
    });

    stageDots.forEach((dot) => {
      const dotStage = Number(dot.dataset.stage);
      dot.classList.toggle("active", dotStage === stageNum);
      dot.classList.toggle("completed", dotStage < stageNum);
    });

    // Stop Stage 3 Heart Tree loop immediately when not on Stage 3
    if (stageNum !== 3) {
      stopHeartTreeAnimation();
    }
    if (stageNum !== 4) {
      stopMicBlowDetection();
    }

    if (stageNum === 2) {
      resetBowAndArrow();
    } else if (stageNum === 3) {
      startHeartTreeAnimation();
    } else if (stageNum === 5) {
      initBalloonsArena();
    }
  }

  stageDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const target = Number(dot.dataset.stage);
      sound.playSparkle();
      goToStage(target);
    });
  });

  /* --------------------------------------------------------------------------
     4. STAGE 1: CURIOSITY LOADING & GIFT UNWRAP
     -------------------------------------------------------------------------- */
  const curiosityLoader = document.getElementById("curiosity-loader");
  const unwrapView = document.getElementById("unwrap-view");
  const curiosityStepTag = document.getElementById("curiosity-step-tag");
  const curiosityText = document.getElementById("curiosity-text");
  const curiosityProgress = document.getElementById("curiosity-progress");
  const curiositySubtext = document.getElementById("curiosity-subtext");
  const giftBox = document.getElementById("gift-box");
  const giftBoxTrigger = document.getElementById("gift-box-trigger");
  const unwrapBtn = document.getElementById("unwrap-btn");

  let curiosityTimers = [];

  const curiositySteps = [
    {
      tag: "HOLD ON A SECOND...",
      title: "Wait... do you know what day it is today? 🤫✨",
      sub: "Checking the celestial calendar...",
      progress: "25%",
    },
    {
      tag: "SOMETHING MAGICAL IS BREWING...",
      title: "26 years ago today, the world became a whole lot brighter 🌸",
      sub: "Sprinkling golden stardust & rose petals...",
      progress: "62%",
    },
    {
      tag: "ALMOST READY, BIRTHDAY QUEEN 👑",
      title: "Take a deep breath, Supraja… Your birthday surprise is ready! 💖",
      sub: "Tying the final golden satin ribbon...",
      progress: "100%",
    },
  ];

  function runCuriositySequence() {
    curiosityTimers.forEach(clearTimeout);
    curiosityTimers = [];

    curiosityLoader.classList.remove("hidden");
    unwrapView.classList.add("hidden");
    giftBox.classList.remove("unwrapping");

    curiositySteps.forEach((step, idx) => {
      const t = setTimeout(() => {
        curiosityText.style.opacity = "0";
        setTimeout(() => {
          curiosityStepTag.textContent = step.tag;
          curiosityText.textContent = step.title;
          curiositySubtext.textContent = step.sub;
          curiosityProgress.style.width = step.progress;
          curiosityText.style.opacity = "1";
        }, 180);
      }, idx * 1750);
      curiosityTimers.push(t);
    });

    const finalTimer = setTimeout(
      () => {
        curiosityLoader.classList.add("hidden");
        unwrapView.classList.remove("hidden");
        sound.playSparkle();
        spawnConfettiShower(28);
      },
      curiositySteps.length * 1750 + 300,
    );

    curiosityTimers.push(finalTimer);
  }

  let isUnwrapping = false;
  function handleUnwrapGift() {
    if (isUnwrapping) return;
    isUnwrapping = true;

    sound.init();
    sound.startAmbientMelody();
    sound.playHeartBlast();

    giftBox.classList.add("unwrapping");
    const rect = giftBox.getBoundingClientRect();
    spawnHeartBlast(rect.left + rect.width / 2, rect.top + rect.height / 2, 42);

    setTimeout(() => {
      goToStage(2);
      isUnwrapping = false;
    }, 950);
  }

  giftBoxTrigger.addEventListener("click", handleUnwrapGift);
  unwrapBtn.addEventListener("click", handleUnwrapGift);

  /* --------------------------------------------------------------------------
     5. STAGE 2: CUPID'S BOW & ARROW — PULL & RELEASE TO HIT THE HEART
     -------------------------------------------------------------------------- */
  const archerySvg = document.getElementById("archery-svg");
  const bowString = document.getElementById("bow-string");
  const pullHandle = document.getElementById("pull-handle");
  const arrowGroup = document.getElementById("arrow-group");
  const targetHeartGroup = document.getElementById("target-heart-group");
  const trajectoryDots = document.getElementById("trajectory-dots");
  const tensionFill = document.getElementById("tension-fill");
  const tensionPercent = document.getElementById("tension-percent");
  const bowInstruction = document.getElementById("bow-instruction");
  const quickShootBtn = document.getElementById("quick-shoot-btn");

  let isPullingBow = false;
  let pullDistance = 0;
  let arrowFlying = false;
  let pullStartX = 0;

  // Pre-build trajectory dots once (zero DOM allocation during pointermove)
  const trajectoryDotNodes = [];
  for (let i = 1; i <= 10; i++) {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    circle.setAttribute("cx", String(220 + i * 46));
    circle.setAttribute("cy", "210");
    circle.setAttribute("r", String(Math.max(2, 5 - i * 0.25)));
    circle.setAttribute("fill", "#ffe6a3");
    circle.setAttribute("opacity", "0");
    trajectoryDots.appendChild(circle);
    trajectoryDotNodes.push(circle);
  }

  function updateTrajectoryDots(pullAmt) {
    const show = pullAmt >= 10;
    for (let i = 0; i < trajectoryDotNodes.length; i++) {
      const op = show ? Math.max(0, (pullAmt / 110) * (1 - (i + 1) * 0.07)) : 0;
      trajectoryDotNodes[i].setAttribute("opacity", op.toFixed(2));
    }
  }

  function updateBowVisuals(pullAmt) {
    const clamped = Math.max(0, Math.min(110, pullAmt));
    pullDistance = clamped;
    const pct = Math.round((clamped / 110) * 100);

    bowString.setAttribute("points", `0,-135 ${-clamped},0 0,135`);
    pullHandle.setAttribute("transform", `translate(${-clamped}, 0)`);
    arrowGroup.setAttribute("transform", `translate(${170 - clamped}, 210)`);

    tensionFill.style.width = `${pct}%`;
    tensionPercent.textContent = `${pct}%`;

    updateTrajectoryDots(clamped);
  }

  function resetBowAndArrow() {
    isPullingBow = false;
    arrowFlying = false;
    targetHeartGroup.style.opacity = "1";
    targetHeartGroup.style.transform = "translate(735px, 210px) scale(1)";
    bowInstruction.textContent =
      "Drag the bowstring back (or tap Pull & Release) to pierce the glowing crystal heart! 🏹💖";
    updateBowVisuals(0);
  }

  function fireArrow() {
    if (arrowFlying) return;
    arrowFlying = true;
    updateTrajectoryDots(0);

    bowString.setAttribute("points", "0,-135 0,0 0,135");
    pullHandle.setAttribute("transform", "translate(0, 0)");
    sound.playWhoosh();

    let currentX = 170 - pullDistance;
    const targetX = 635;
    const svgRect = archerySvg.getBoundingClientRect();
    const scaleX = svgRect.width / 900;
    const scaleY = svgRect.height / 420;
    let stepCount = 0;

    function stepArrow() {
      currentX += 36;
      stepCount++;
      arrowGroup.setAttribute("transform", `translate(${currentX}, 210)`);

      if (stepCount % 2 === 0) {
        const screenX = svgRect.left + (currentX + 110) * scaleX;
        const screenY = svgRect.top + 210 * scaleY;
        fxParticles.push({
          x: screenX,
          y: screenY + (Math.random() - 0.5) * 10,
          vx: -Math.random() * 1.8,
          vy: (Math.random() - 0.5) * 1.8,
          gravity: 0.02,
          drag: 0.96,
          size: 8,
          color: "#ffe6a3",
          sprite: getHeartSprite("#ffe6a3", false),
          alpha: 0.9,
          decay: 0.045,
          shape: "heart",
        });
      }

      if (currentX < targetX) {
        requestAnimationFrame(stepArrow);
      } else {
        sound.playHeartBlast();
        bowInstruction.textContent =
          "💥 BULLSEYE! Happy 26th Birthday, Supraja! 💖✨";

        const heartScreenX = svgRect.left + 735 * scaleX;
        const heartScreenY = svgRect.top + 210 * scaleY;
        spawnHeartBlast(heartScreenX, heartScreenY, 55);
        spawnConfettiShower(40);

        targetHeartGroup.style.transition = "opacity 0.3s ease";
        targetHeartGroup.style.opacity = "0";

        setTimeout(() => {
          goToStage(3);
        }, 1100);
      }
    }

    requestAnimationFrame(stepArrow);
  }

  function getSvgPointX(clientX) {
    const rect = archerySvg.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 900;
  }

  archerySvg.addEventListener("pointerdown", (e) => {
    if (arrowFlying) return;
    sound.init();
    isPullingBow = true;
    pullStartX = getSvgPointX(e.clientX);
    updateBowVisuals(25);
  });

  window.addEventListener(
    "pointermove",
    (e) => {
      if (!isPullingBow || arrowFlying) return;
      const currentSvgX = getSvgPointX(e.clientX);
      const delta = Math.max(20, (pullStartX - currentSvgX) * 1.15 + 25);
      updateBowVisuals(delta);
    },
    { passive: true },
  );

  window.addEventListener("pointerup", () => {
    if (!isPullingBow || arrowFlying) return;
    isPullingBow = false;
    if (pullDistance >= 22) {
      fireArrow();
    } else {
      updateBowVisuals(0);
    }
  });

  quickShootBtn.addEventListener("click", () => {
    if (arrowFlying) return;
    sound.init();
    let d = 0;
    const drawInterval = setInterval(() => {
      d += 14;
      updateBowVisuals(d);
      if (d >= 105) {
        clearInterval(drawInterval);
        setTimeout(fireArrow, 120);
      }
    }, 22);
  });

  /* --------------------------------------------------------------------------
     6. STAGE 3: GLOWING HEART TREE OF 26 WISHES (Ultra-Smooth Cached Canvas)
     -------------------------------------------------------------------------- */
  const treeCanvas = document.getElementById("heart-tree-canvas");
  const treeCtx = treeCanvas.getContext("2d");
  const toCakeBtn = document.getElementById("to-cake-btn");

  let treeBranches = [];
  let treeLeaves = [];
  let fallingLeafPetals = [];
  let treeAnimId = null;
  let treeStaticBuffer = null;
  let treeStaticBaked = false;

  function stopHeartTreeAnimation() {
    if (treeAnimId) {
      cancelAnimationFrame(treeAnimId);
      treeAnimId = null;
    }
  }

  function generateHeartTree() {
    treeBranches = [];
    treeLeaves = [];
    fallingLeafPetals = [];
    treeStaticBaked = false;

    const W = treeCanvas.width;
    const H = treeCanvas.height;

    if (!treeStaticBuffer) {
      treeStaticBuffer = document.createElement("canvas");
      treeStaticBuffer.width = W;
      treeStaticBuffer.height = H;
    } else {
      treeStaticBuffer.getContext("2d").clearRect(0, 0, W, H);
    }

    const leafColors = [
      "#ff2e79",
      "#ff6fa5",
      "#ffb3d1",
      "#ffe6a3",
      "#ff4b91",
      "#ff85b3",
    ];

    function buildBranch(x1, y1, length, angle, depth) {
      const x2 = x1 + Math.cos(angle) * length;
      const y2 = y1 + Math.sin(angle) * length;

      treeBranches.push({
        x1,
        y1,
        x2,
        y2,
        width: Math.max(2, depth * 2.2),
        depth,
        progress: 0,
        delay: (5 - depth) * 9,
      });

      if (depth <= 3) {
        const clusterCount = depth === 1 ? 4 : 2;
        for (let i = 0; i < clusterCount; i++) {
          const color =
            leafColors[Math.floor(Math.random() * leafColors.length)];
          treeLeaves.push({
            x: x2 + (Math.random() - 0.5) * 44,
            y: y2 + (Math.random() - 0.5) * 44,
            maxSize: Math.random() * 14 + 12,
            size: 0,
            color,
            sprite: getHeartSprite(color, true),
            delay: (5 - depth) * 10 + Math.random() * 20,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }

      if (depth > 1) {
        const subLen = length * (0.74 + Math.random() * 0.07);
        buildBranch(
          x2,
          y2,
          subLen,
          angle - (0.34 + Math.random() * 0.14),
          depth - 1,
        );
        buildBranch(
          x2,
          y2,
          subLen,
          angle + (0.34 + Math.random() * 0.14),
          depth - 1,
        );
        if (depth === 4) {
          buildBranch(
            x2,
            y2,
            subLen * 0.85,
            angle + (Math.random() - 0.5) * 0.2,
            depth - 1,
          );
        }
      }
    }

    buildBranch(W / 2, H - 28, 112, -Math.PI / 2, 5);
  }

  function bakeStaticTreeBuffer() {
    const W = treeCanvas.width;
    const H = treeCanvas.height;
    const bCtx = treeStaticBuffer.getContext("2d");
    bCtx.clearRect(0, 0, W, H);

    // Soft radial aura behind canopy
    const canopyGlow = bCtx.createRadialGradient(
      W / 2,
      H * 0.42,
      15,
      W / 2,
      H * 0.42,
      220,
    );
    canopyGlow.addColorStop(0, "rgba(255, 75, 145, 0.25)");
    canopyGlow.addColorStop(0.6, "rgba(245, 185, 99, 0.08)");
    canopyGlow.addColorStop(1, "rgba(255, 75, 145, 0)");
    bCtx.fillStyle = canopyGlow;
    bCtx.fillRect(0, 0, W, H);

    // Draw all completed branches once onto static buffer
    bCtx.strokeStyle = "#e6b17e";
    bCtx.lineCap = "round";
    for (let i = 0; i < treeBranches.length; i++) {
      const b = treeBranches[i];
      bCtx.beginPath();
      bCtx.moveTo(b.x1, b.y1);
      bCtx.lineTo(b.x2, b.y2);
      bCtx.lineWidth = b.width;
      bCtx.stroke();
    }

    // Draw "♥ XXVI ♥" at base of trunk
    bCtx.font = '700 22px "Cormorant Garamond", serif';
    bCtx.fillStyle = "#ffe6a3";
    bCtx.textAlign = "center";
    bCtx.fillText("♥ XXVI ♥", W / 2, H - 6);

    treeStaticBaked = true;
  }

  function startHeartTreeAnimation() {
    stopHeartTreeAnimation();
    generateHeartTree();
    let frame = 0;

    function renderTree() {
      if (currentStage !== 3) {
        treeAnimId = null;
        return;
      }
      frame++;
      const W = treeCanvas.width;
      const H = treeCanvas.height;
      treeCtx.clearRect(0, 0, W, H);

      if (treeStaticBaked) {
        treeCtx.drawImage(treeStaticBuffer, 0, 0);
      } else {
        let allBranchesDone = true;
        treeCtx.strokeStyle = "#e6b17e";
        treeCtx.lineCap = "round";

        for (let i = 0; i < treeBranches.length; i++) {
          const b = treeBranches[i];
          if (frame > b.delay && b.progress < 1) {
            b.progress = Math.min(1, b.progress + 0.07);
          }
          if (b.progress < 1) allBranchesDone = false;

          if (b.progress > 0) {
            const curX = b.x1 + (b.x2 - b.x1) * b.progress;
            const curY = b.y1 + (b.y2 - b.y1) * b.progress;
            treeCtx.beginPath();
            treeCtx.moveTo(b.x1, b.y1);
            treeCtx.lineTo(curX, curY);
            treeCtx.lineWidth = b.width;
            treeCtx.stroke();
          }
        }

        if (allBranchesDone) {
          bakeStaticTreeBuffer();
        }
      }

      // Draw blooming heart leaves using pre-rendered sprites (zero shadowBlur lag!)
      for (let i = 0; i < treeLeaves.length; i++) {
        const leaf = treeLeaves[i];
        if (frame > leaf.delay && leaf.size < leaf.maxSize) {
          leaf.size = Math.min(leaf.maxSize, leaf.size + 0.65);
        }
        if (leaf.size > 0) {
          const swayX = Math.sin(frame * 0.03 + leaf.phase) * 2;
          const swayY = Math.cos(frame * 0.025 + leaf.phase) * 1.4;
          const drawSize = leaf.size * 1.5;
          treeCtx.drawImage(
            leaf.sprite,
            leaf.x + swayX - drawSize / 2,
            leaf.y + swayY - drawSize / 2,
            drawSize,
            drawSize,
          );
        }
      }

      // Gently spawn falling heart petals (capped at 18 max)
      if (
        frame > 55 &&
        fallingLeafPetals.length < 18 &&
        Math.random() < 0.06 &&
        treeLeaves.length > 0
      ) {
        const src = treeLeaves[Math.floor(Math.random() * treeLeaves.length)];
        fallingLeafPetals.push({
          x: src.x,
          y: src.y,
          vx: (Math.random() - 0.5) * 1.0,
          vy: Math.random() * 1.1 + 0.6,
          size: Math.random() * 12 + 10,
          sprite: src.sprite,
          alpha: 0.9,
        });
      }

      for (let i = fallingLeafPetals.length - 1; i >= 0; i--) {
        const fp = fallingLeafPetals[i];
        fp.x += fp.vx + Math.sin(frame * 0.04 + i) * 0.35;
        fp.y += fp.vy;
        fp.alpha -= 0.006;
        if (fp.y > H - 20 || fp.alpha <= 0) {
          fallingLeafPetals.splice(i, 1);
          continue;
        }
        treeCtx.globalAlpha = fp.alpha;
        treeCtx.drawImage(
          fp.sprite,
          fp.x - fp.size / 2,
          fp.y - fp.size / 2,
          fp.size,
          fp.size,
        );
      }
      treeCtx.globalAlpha = 1;

      treeAnimId = requestAnimationFrame(renderTree);
    }

    renderTree();
  }

  treeCanvas.addEventListener("click", (e) => {
    const rect = treeCanvas.getBoundingClientRect();
    const scaleX = treeCanvas.width / rect.width;
    const scaleY = treeCanvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const colors = ["#ff2e79", "#ffe6a3", "#ff85b3", "#ffffff"];
    for (let i = 0; i < 4; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      if (treeLeaves.length > 160) treeLeaves.shift();
      treeLeaves.push({
        x: x + (Math.random() - 0.5) * 36,
        y: y + (Math.random() - 0.5) * 36,
        maxSize: Math.random() * 15 + 12,
        size: 2,
        color,
        sprite: getHeartSprite(color, true),
        delay: 0,
        phase: Math.random() * Math.PI * 2,
      });
    }
    sound.playSparkle();
  });

  toCakeBtn.addEventListener("click", () => {
    sound.playSparkle();
    goToStage(4);
  });

  /* --------------------------------------------------------------------------
     7. STAGE 4: FIRST THINGS FIRST — BLOW OUT CANDLE & CUT THE CAKE
     -------------------------------------------------------------------------- */
  const candleGroup = document.getElementById("candle-group");
  const candleFlameGroup = document.getElementById("candle-flame-group");
  const candleSmokeGroup = document.getElementById("candle-smoke-group");
  const cakeKnife = document.getElementById("cake-knife");
  const cakeSvg = document.getElementById("cake-svg");
  const cakeHeading = document.getElementById("cake-heading");
  const cakeSubtext = document.getElementById("cake-subtext");
  const wishSparkles = document.getElementById("wish-sparkles");
  const blowCandleBtn = document.getElementById("blow-candle-btn");
  const micBlowBtn = document.getElementById("mic-blow-btn");
  const cutCakeBtn = document.getElementById("cut-cake-btn");
  const tapAnywhereBanner = document.getElementById("tap-anywhere-banner");

  let candleBlown = false;
  let cakeCut = false;
  let micStream = null;
  let micMonitorId = null;

  function resetCakeStage() {
    candleBlown = false;
    cakeCut = false;
    candleFlameGroup.classList.remove("hidden");
    candleSmokeGroup.classList.add("hidden");
    cakeKnife.classList.add("hidden");
    cakeKnife.classList.remove("knife-cutting");
    cakeSvg.classList.remove("cake-sliced");
    blowCandleBtn.classList.remove("hidden");
    micBlowBtn.classList.remove("hidden");
    cutCakeBtn.classList.add("hidden");
    tapAnywhereBanner.classList.add("hidden");
    cakeHeading.textContent = "Close Your Eyes & Make a Birthday Wish! 🌟";
    cakeSubtext.textContent =
      "Tap the glowing candle flame (or blow gently into your microphone!) to blow out your 26th birthday candle 🕯️💨";
    wishSparkles.innerHTML = "<span>✨ Make a Wish ✨</span>";
    stopMicBlowDetection();
  }

  function blowOutCandle() {
    if (candleBlown) return;
    candleBlown = true;
    stopMicBlowDetection();

    sound.playWhoosh();
    setTimeout(() => sound.playSparkle(), 220);

    candleFlameGroup.classList.add("hidden");
    candleSmokeGroup.classList.remove("hidden");
    blowCandleBtn.classList.add("hidden");
    micBlowBtn.classList.add("hidden");

    cakeKnife.classList.remove("hidden");
    cutCakeBtn.classList.remove("hidden");

    cakeHeading.textContent =
      "Wish Made! Now Let’s Cut Your Birthday Cake 🎂🔪";
    cakeSubtext.textContent =
      "Tap the cake or the button below to slice your 26th birthday cake!";
    wishSparkles.innerHTML = "<span>🌟 Wish Sent to the Universe! 🌟</span>";

    const rect = candleGroup.getBoundingClientRect();
    spawnHeartBlast(rect.left + rect.width / 2, rect.top, 35);
  }

  function cutTheCake() {
    if (!candleBlown) {
      blowOutCandle();
      return;
    }
    if (cakeCut) return;
    cakeCut = true;

    sound.playHeartBlast();
    cakeKnife.classList.add("knife-cutting");

    setTimeout(() => {
      cakeSvg.classList.add("cake-sliced");
      cutCakeBtn.classList.add("hidden");
      tapAnywhereBanner.classList.remove("hidden");
      cakeHeading.textContent = "Happy 26th Birthday, Supraja! 🍰🥂";
      cakeSubtext.textContent =
        "The sweetest slice for someone truly worth celebrating!";
      wishSparkles.innerHTML = "<span>🍰 Yummiest 26th Year Ahead! 💖</span>";
      spawnConfettiShower(45);
    }, 420);
  }

  async function startMicBlowDetection() {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(micStream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      micBlowBtn.innerHTML = "<span>🎙️ Listening... Blow gently now! 💨</span>";

      const checkVolume = () => {
        if (candleBlown) return;
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < 30; i++) sum += data[i];
        const avgLowFreq = sum / 30;
        if (avgLowFreq > 95) {
          blowOutCandle();
          return;
        }
        micMonitorId = requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch {
      micBlowBtn.innerHTML =
        "<span>💡 Tap the flame directly to blow it out!</span>";
    }
  }

  function stopMicBlowDetection() {
    if (micMonitorId) cancelAnimationFrame(micMonitorId);
    if (micStream) {
      micStream.getTracks().forEach((t) => t.stop());
      micStream = null;
    }
  }

  candleGroup.addEventListener("click", blowOutCandle);
  blowCandleBtn.addEventListener("click", blowOutCandle);
  micBlowBtn.addEventListener("click", startMicBlowDetection);
  cutCakeBtn.addEventListener("click", cutTheCake);
  cakeSvg.addEventListener("click", () => {
    if (!candleBlown) {
      blowOutCandle();
    } else if (!cakeCut) {
      cutTheCake();
    }
  });

  tapAnywhereBanner.addEventListener("click", () => {
    sound.playSparkle();
    goToStage(5);
  });

  document.getElementById("stage-4").addEventListener("click", (e) => {
    if (cakeCut && !e.target.closest("button")) {
      sound.playSparkle();
      goToStage(5);
    }
  });

  /* --------------------------------------------------------------------------
     8. STAGE 5: POP THE BALLOONS — 7 UNIQUE BIRTHDAY TRUTHS
     -------------------------------------------------------------------------- */
  const balloonsArena = document.getElementById("balloons-arena");
  const balloonCountText = document.getElementById("balloon-count-text");
  const poppedLatestText = document.getElementById("popped-latest-text");
  const poppedChipsList = document.getElementById("popped-chips-list");
  const toLetterBtn = document.getElementById("to-letter-btn");

  const balloonMessages = [
    {
      num: "1",
      color: "linear-gradient(135deg, #ff7eb3 0%, #ff1e62 100%)",
      knot: "#ff1e62",
      emoji: "👑",
      text: "26 never looked this radiant, graceful, and unstoppable!",
    },
    {
      num: "2",
      color: "linear-gradient(135deg, #ffe9a6 0%, #d9822b 100%)",
      knot: "#d9822b",
      emoji: "🌸",
      text: "Your smile has a superpower — it makes everyone around you feel at home.",
    },
    {
      num: "3",
      color: "linear-gradient(135deg, #d8b4fe 0%, #9333ea 100%)",
      knot: "#9333ea",
      emoji: "✨",
      text: "You have the purest heart and the most inspiring spirit, Supraja!",
    },
    {
      num: "4",
      color: "linear-gradient(135deg, #fda4af 0%, #e11d48 100%)",
      knot: "#e11d48",
      emoji: "🌍",
      text: "May your 26th year bring exciting adventures & unforgettable memories!",
    },
    {
      num: "5",
      color: "linear-gradient(135deg, #f9a8d4 0%, #db2777 100%)",
      knot: "#db2777",
      emoji: "🌠",
      text: "May every secret wish you made on that candle come true tenfold!",
    },
    {
      num: "6",
      color: "linear-gradient(135deg, #fde68a 0%, #f59e0b 100%)",
      knot: "#f59e0b",
      emoji: "🥂",
      text: "Stronger, wiser, kinder, and more fabulous than ever at 26!",
    },
    {
      num: "7",
      color: "linear-gradient(135deg, #ff9ebb 0%, #be123c 100%)",
      knot: "#be123c",
      emoji: "💖",
      text: "Never forget: Today and every day, you are someone truly worth celebrating!",
    },
  ];

  let poppedCount = 0;

  function initBalloonsArena() {
    if (
      balloonsArena.children.length > 0 &&
      poppedCount < balloonMessages.length
    )
      return;
    resetBalloonsStage();
  }

  function resetBalloonsStage() {
    poppedCount = 0;
    balloonsArena.innerHTML = "";
    poppedChipsList.innerHTML = "";
    balloonCountText.textContent = `0 / ${balloonMessages.length} Balloons Popped`;
    poppedLatestText.textContent =
      "Tap any floating balloon above to pop it and reveal its birthday note! 🎈";
    toLetterBtn.classList.add("hidden");

    balloonMessages.forEach((item, index) => {
      const wrap = document.createElement("div");
      wrap.className = "balloon-item";
      wrap.style.animationDelay = `${index * -0.45}s`;

      const body = document.createElement("div");
      body.className = "balloon-body";
      body.style.background = item.color;
      body.style.color = item.knot;

      const numSpan = document.createElement("span");
      numSpan.className = "balloon-num";
      numSpan.textContent = item.num;

      const stringDiv = document.createElement("div");
      stringDiv.className = "balloon-string";

      body.appendChild(numSpan);
      wrap.appendChild(body);
      wrap.appendChild(stringDiv);

      wrap.addEventListener("click", () => {
        if (wrap.classList.contains("popped")) return;
        wrap.classList.add("popped");
        poppedCount++;

        sound.playPop(index);

        const rect = body.getBoundingClientRect();
        spawnHeartBlast(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          30,
        );

        balloonCountText.textContent = `${poppedCount} / ${balloonMessages.length} Balloons Popped`;
        poppedLatestText.textContent = `${item.emoji} "${item.text}"`;

        // Compact interactive badge so all 7 fit in 1 line without overflowing screen height
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "popped-chip active-chip";
        chip.textContent = `${item.emoji} #${item.num}`;
        chip.title = item.text;
        Array.from(poppedChipsList.children).forEach((c) =>
          c.classList.remove("active-chip"),
        );
        chip.addEventListener("click", () => {
          Array.from(poppedChipsList.children).forEach((c) =>
            c.classList.remove("active-chip"),
          );
          chip.classList.add("active-chip");
          poppedLatestText.textContent = `${item.emoji} "${item.text}"`;
          sound.playSparkle();
        });
        poppedChipsList.appendChild(chip);

        if (poppedCount === balloonMessages.length) {
          sound.playHeartBlast();
          spawnConfettiShower(45);
          toLetterBtn.classList.remove("hidden");
        } else if (poppedCount >= 3) {
          toLetterBtn.classList.remove("hidden");
        }
      });

      balloonsArena.appendChild(wrap);
    });
  }

  toLetterBtn.addEventListener("click", () => {
    sound.playSparkle();
    goToStage(6);
  });

  /* --------------------------------------------------------------------------
     9. STAGE 6: ONE LAST THING — ENVELOPE & BIRTHDAY LETTER + REPLAY
     -------------------------------------------------------------------------- */
  const envelopeScene = document.getElementById("envelope-scene");
  const envelopeTrigger = document.getElementById("envelope-trigger");
  const openEnvelopeBtn = document.getElementById("open-envelope-btn");
  const envelopeIntroHeader = document.getElementById("envelope-intro-header");
  const fullLetterView = document.getElementById("full-letter-view");
  const celebrateShowerBtn = document.getElementById("celebrate-shower-btn");
  const replaySurpriseBtn = document.getElementById("replay-surprise-btn");

  let envelopeOpened = false;

  function resetEnvelopeStage() {
    envelopeOpened = false;
    envelopeTrigger.classList.remove("open");
    envelopeScene.classList.remove("hidden");
    envelopeIntroHeader.classList.remove("hidden");
    fullLetterView.classList.add("hidden");
  }

  function openBirthdayEnvelope() {
    if (envelopeOpened) return;
    envelopeOpened = true;

    sound.playSparkle();
    envelopeTrigger.classList.add("open");

    const rect = envelopeTrigger.getBoundingClientRect();
    spawnHeartBlast(rect.left + rect.width / 2, rect.top + rect.height / 2, 42);

    setTimeout(() => {
      envelopeScene.classList.add("hidden");
      envelopeIntroHeader.classList.add("hidden");
      fullLetterView.classList.remove("hidden");
      sound.playHeartBlast();
      spawnConfettiShower(50);
    }, 1050);
  }

  envelopeTrigger.addEventListener("click", openBirthdayEnvelope);
  openEnvelopeBtn.addEventListener("click", openBirthdayEnvelope);

  celebrateShowerBtn.addEventListener("click", () => {
    sound.playHeartBlast();
    spawnConfettiShower(50);
    spawnHeartBlast(window.innerWidth / 2, window.innerHeight * 0.35, 45);
  });

  replaySurpriseBtn.addEventListener("click", () => {
    sound.playSparkle();
    resetBowAndArrow();
    resetCakeStage();
    resetBalloonsStage();
    resetEnvelopeStage();
    goToStage(1);
    runCuriositySequence();
  });

  /* --------------------------------------------------------------------------
     INITIALIZE EXPERIENCE ON LOAD
     -------------------------------------------------------------------------- */
  runCuriositySequence();
})();
