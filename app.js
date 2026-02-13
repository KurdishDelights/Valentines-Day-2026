const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const actions = document.getElementById("actions");
const result = document.getElementById("result");
const hint = document.getElementById("hint");
const subtitle = document.getElementById("subtitle");
const bg = document.getElementById("bg");

// Music
const bgMusic = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
let musicStarted = false;

const HEARTS = ["💖","💘","💝","💗","💓","💕","💞","❤️","🩷","😍"];
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function showMusicStatus(msg) {
  // reuse the hint line to show status briefly
  if (!hint) return;
  const old = hint.textContent;
  hint.textContent = msg;
  setTimeout(() => (hint.textContent = old), 2500);
}

async function tryStartMusic(source = "unknown") {
  if (!bgMusic) {
    console.error("bgMusic element not found");
    showMusicStatus("Music error: audio element missing.");
    return false;
  }

  try {
    // If the MP3 fails to load, this will often throw or never start.
    await bgMusic.play();
    musicStarted = true;

    if (musicBtn) {
      musicBtn.textContent = "🎵 Playing";
      setTimeout(() => (musicBtn.style.display = "none"), 600);
    }

    console.log(`Music started (${source})`);
    return true;
  } catch (err) {
    console.error(`Music failed (${source}):`, err);

    if (musicBtn) {
      musicBtn.style.display = "block";
      musicBtn.textContent = "▶️ Play music";
    }

    showMusicStatus("Tap ▶️ Play music (autoplay blocked).");
    return false;
  }
}

// If the file is missing, you'll usually get an error event
if (bgMusic) {
  bgMusic.addEventListener("error", () => {
    console.error("Audio error event fired. File missing or unsupported codec.");
    showMusicStatus("Music file not loading. Check MP3 is in repo root.");
    if (musicBtn) musicBtn.style.display = "block";
  });

  bgMusic.addEventListener("canplay", () => {
    console.log("Audio can play (file found).");
  });
}

if (musicBtn) {
  musicBtn.addEventListener("click", async () => {
    musicBtn.textContent = "⏳ Starting...";
    const ok = await tryStartMusic("button");
    if (!ok) {
      musicBtn.textContent = "▶️ Play music";
    }
  });
}

function placeNoButton(x = null, y = null) {
  const row = actions.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();
  const pad = 6;

  const maxX = row.width - btn.width - pad;
  const maxY = row.height - btn.height - pad;

  const nx = (x === null) ? Math.random() * maxX : clamp(x, pad, maxX);
  const ny = (y === null) ? Math.random() * maxY : clamp(y, pad, maxY);

  noBtn.style.left = nx + "px";
  noBtn.style.top = ny + "px";
}

function moveAwayFromPointer(clientX, clientY) {
  const row = actions.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();

  const px = clientX - row.left;
  const py = clientY - row.top;

  const bx = (btn.left - row.left) + btn.width / 2;
  const by = (btn.top - row.top) + btn.height / 2;

  let dx = bx - px;
  let dy = by - py;

  const dist = Math.hypot(dx, dy) || 1;
  const danger = 115;

  if (dist < danger) {
    dx /= dist;
    dy /= dist;

    const push = 150;
    const targetX = (btn.left - row.left) + dx * push;
    const targetY = (btn.top - row.top) + dy * push;

    const jitter = 50;
    placeNoButton(
      targetX + (Math.random() - 0.5) * jitter,
      targetY + (Math.random() - 0.5) * jitter
    );
  }
}

function heartBurst(centerX, centerY, amount = 80) {
  for (let i = 0; i < amount; i++) {
    const el = document.createElement("div");
    el.className = "confetti";
    el.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
    document.body.appendChild(el);

    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 6;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed - (2 + Math.random() * 3);

    let x = centerX;
    let y = centerY;
    let rot = Math.random() * 360;
    let life = 0;
    const maxLife = 120 + Math.random() * 40;

    function tick() {
      life++;
      x += vx * 4;
      y += (vy * 4) + life * 0.18;
      rot += 6;

      el.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
      el.style.opacity = String(1 - life / maxLife);

      if (life < maxLife) requestAnimationFrame(tick);
      else el.remove();
    }

    el.style.transform = `translate(${x}px, ${y}px)`;
    requestAnimationFrame(tick);
  }
}

function createBgHeart(initial) {
  const el = document.createElement("div");
  el.className = "bg-heart";
  el.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
  bg.appendChild(el);

  const x = Math.random() * window.innerWidth;
  const duration = 6500 + Math.random() * 6500;
  const delay = initial ? Math.random() * 2200 : 0;
  const dx = (Math.random() * 180 - 90) + "px";

  el.style.left = x + "px";
  el.style.bottom = (-30 - Math.random() * 50) + "px";
  el.style.setProperty("--dx", dx);
  el.style.animationDuration = duration + "ms";
  el.style.animationDelay = delay + "ms";

  setTimeout(() => el.remove(), duration + delay + 150);
}

function startBg() {
  for (let i = 0; i < 18; i++) createBgHeart(true);
  setInterval(() => createBgHeart(false), 900);
}

window.addEventListener("load", async () => {
  placeNoButton(actions.clientWidth * 0.62, 10);
  startBg();

  // Try autoplay (may fail)
  await tryStartMusic("autoplay");
});

window.addEventListener("resize", () => placeNoButton());

actions.addEventListener("mousemove", (e) => moveAwayFromPointer(e.clientX, e.clientY));
actions.addEventListener("touchstart", (e) => {
  const t = e.touches[0]; if (!t) return;
  moveAwayFromPointer(t.clientX, t.clientY);
}, { passive: true });
actions.addEventListener("touchmove", (e) => {
  const t = e.touches[0]; if (!t) return;
  moveAwayFromPointer(t.clientX, t.clientY);
}, { passive: true });

let noClicks = 0;
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  noClicks++;

  placeNoButton();
  subtitle.textContent = "Are you sure? 🤨";

  const growSteps = Math.min(noClicks, 5);
  yesBtn.style.transform = `scale(${1 + growSteps * 0.06})`;

  hint.textContent = "You really tried that huh 😏";
  setTimeout(() => hint.textContent = "Don't be a stanky puta 😈", 1200);
});

yesBtn.addEventListener("click", async () => {
  // Start music on user gesture if it hasn't started yet
  if (!musicStarted) await tryStartMusic("yes-click");

  result.style.display = "block";
  subtitle.textContent = "Best decision ever 😌💞";
  hint.textContent = "You’re stuck with me, Bebe 💘";
  noBtn.style.display = "none";

  const r = yesBtn.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  heartBurst(cx, cy, 90);
  setTimeout(() => heartBurst(cx + 120, cy + 30, 55), 160);
  setTimeout(() => heartBurst(cx - 120, cy + 30, 55), 260);
});


