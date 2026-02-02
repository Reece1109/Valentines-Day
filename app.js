
// Elements
const zone = document.getElementById("zone");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const result = document.getElementById("result");
const hint = document.getElementById("hint");

/* ---------- CONFETTI ---------- */
const confettiCanvas = document.getElementById("confettiCanvas");

function resizeConfettiCanvas() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  confettiCanvas.width = Math.floor(window.innerWidth * dpr);
  confettiCanvas.height = Math.floor(window.innerHeight * dpr);
  confettiCanvas.style.width = "100vw";
  confettiCanvas.style.height = "100vh";
}

resizeConfettiCanvas();
window.addEventListener("resize", resizeConfettiCanvas);
window.addEventListener("orientationchange", () => setTimeout(resizeConfettiCanvas, 150));

const confettiInstance = confetti.create(confettiCanvas, {
  resize: false,
  useWorker: true
});

function fullScreenConfetti(durationMs = 1600) {
  const end = Date.now() + durationMs;

  (function frame() {
    confettiInstance({
      particleCount: 12,
      spread: 90,
      startVelocity: 45,
      ticks: 180,
      origin: { x: Math.random(), y: Math.random() * 0.3 }
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();

  setTimeout(() => {
    confettiInstance({
      particleCount: 300,
      spread: 140,
      startVelocity: 60,
      ticks: 220,
      origin: { x: 0.5, y: 0.55 }
    });
  }, 300);
}

/* ---------- YES BUTTON GROWS ---------- */
let yesScale = 1;
function growYes(amount = 0.1) {
  yesScale = Math.min(2.6, yesScale + amount);
  yesBtn.style.transform = `translateY(-50%) scale(${yesScale})`;
}

/* ---------- NO BUTTON: MAKE IT NOT A REAL OPTION ---------- */
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

// Move the "No" button away from (px, py)
function moveNo(px, py, intensity = 200) {
  const z = zone.getBoundingClientRect();
  const b = noBtn.getBoundingClientRect();

  let dx = (b.left + b.width / 2) - px;
  let dy = (b.top + b.height / 2) - py;
  let mag = Math.hypot(dx, dy) || 1;
  dx /= mag;
  dy /= mag;

  let newLeft = (b.left - z.left) + dx * intensity;
  let newTop  = (b.top - z.top) + dy * intensity;

  newLeft = clamp(newLeft, 0, z.width - b.width);
  newTop  = clamp(newTop, 0, z.height - b.height);

  noBtn.style.left = newLeft + "px";
  noBtn.style.top = newTop + "px";
  noBtn.style.transform = "none";

  // Make "Yes" more tempting each time "No" runs
  growYes(0.12);
}

// Teleport "No" to a random safe spot inside the zone
function teleportNo() {
  const z = zone.getBoundingClientRect();
  const b = noBtn.getBoundingClientRect();
  const pad = 8;
  const left = Math.random() * (z.width - b.width - pad * 2) + pad;
  const top  = Math.random() * (z.height - b.height - pad * 2) + pad;
  noBtn.style.left = left + "px";
  noBtn.style.top = top + "px";
  noBtn.style.transform = "none";
  growYes(0.18);
}

// Keep running away when the pointer gets close
zone.addEventListener("pointermove", e => {
  const b = noBtn.getBoundingClientRect();
  const d = Math.hypot(
    (b.left + b.width / 2) - e.clientX,
    (b.top + b.height / 2) - e.clientY
  );
  if (d < 150) moveNo(e.clientX, e.clientY, 220);
});

// If they try to click/touch the "No" button, teleport it
["pointerdown", "mouseenter", "touchstart"].forEach(evt => {
  noBtn.addEventListener(evt, (e) => {
    e.preventDefault();
    teleportNo();
  }, { passive: false });
});

// Block keyboard activation on "No"
noBtn.addEventListener("keydown", (e) => {
  if (["Enter", " ", "Spacebar"].includes(e.key)) {
    e.preventDefault();
    teleportNo();
  }
});

// Also prevent regular clicks on "No" just in case
noBtn.addEventListener("click", e => {
  e.preventDefault();
  teleportNo();
});

/* ---------- YES CLICK: CELEBRATE THEN REDIRECT ---------- */
yesBtn.addEventListener("click", () => {
  zone.style.display = "none";
  hint.style.display = "none";   // Hide the hint
  result.style.display = "block";
  resizeConfettiCanvas();
  fullScreenConfetti(1400);

  // Redirect to confirmation page after a short celebration
  setTimeout(() => {
    window.location.href = "confirmation.html";
  }, 1200);
});
