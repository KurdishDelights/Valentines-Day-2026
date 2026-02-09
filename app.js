const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const actions = document.getElementById("actions");
const result = document.getElementById("result");
const hint = document.getElementById("hint");
const bg = document.getElementById("bg");

const HEARTS = ["💖","💘","💝","💗","💓","💕","💞","❤️","🩷","😍"];

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function placeNoButton(x = null, y = null){
  const row = actions.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();

  const pad = 6;
  const maxX = row.width  - btn.width  - pad;
  const maxY = row.height - btn.height - pad;

  const nx = (x === null) ? Math.random() * maxX : clamp(x, pad, maxX);
  const ny = (y === null) ? Math.random() * maxY : clamp(y, pad, maxY);

  noBtn.style.left = nx + "px";
  noBtn.style.top  = ny + "px";
}

function moveAwayFromPointer(clientX, clientY){
  const row = actions.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();

  const px = clientX - row.left;
  const py = clientY - row.top;

  const bx = (btn.left - row.left) + btn.width / 2;
  const by = (btn.top  - row.top)  + btn.height / 2;

  let dx = bx - px;
  let dy = by - py;

  const dist = Math.hypot(dx, dy) || 1;

  const danger = 115;
  if (dist < danger){
    dx /= dist;
    dy /= dist;

    const push = 150;
    const targetX = (btn.left - row.left) + dx * push;
    const targetY = (btn.top  - row.top)  + dy * push;

    const jitter = 50;
    placeNoButton(
      targetX + (Math.random() - 0.5) * jitter,
      targetY + (Math.random() - 0.5) * jitter
    );
  }
}

function heartBurst(centerX, centerY, amount = 80){
  for (let i = 0; i < amount; i++){
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

    function tick(){
      life++;
      x += vx * 4;
      y += (vy * 4) + life * 0.18; // gravity
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

function createBgHeart(initial){
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

function startBg(){
  for (let i = 0; i < 18; i++) createBgHeart(true);
  setInterval(() => createBgHeart(false), 900);
}

window.addEventListener("load", () => {
  placeNoButton(actions.clientWidth * 0.62, 10);
  startBg();
});

window.addEventListener("resize", () => placeNoButton());

// Mouse + touch dodge
actions.addEventListener("mousemove", (e) => moveAwayFromPointer(e.clientX, e.clientY));
actions.addEventListener("touchstart", (e) => {
  const t = e.touches[0]; if (!t) return;
  moveAwayFromPointer(t.clientX, t.clientY);
}, { passive: true });
actions.addEventListener("touchmove", (e) => {
  const t = e.touches[0]; if (!t) return;
  moveAwayFromPointer(t.clientX, t.clientY);
}, { passive: true });

// If somehow clicked
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  placeNoButton();
  hint.textContent = "Nice try 😏";
  setTimeout(() => hint.textContent = "Tip: try clicking “No” 😈", 1200);
});

// YES
yesBtn.addEventListener("click", () => {
  result.style.display = "block";
  hint.textContent = "You’re stuck with me 😌💞";
  noBtn.style.display = "none";

  const r = yesBtn.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  heartBurst(cx, cy, 90);
  setTimeout(() => heartBurst(cx + 120, cy + 30, 55), 160);
  setTimeout(() => heartBurst(cx - 120, cy + 30, 55), 260);
});
