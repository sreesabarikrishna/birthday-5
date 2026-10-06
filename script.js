/* ===== Edit these lines ===== */
const HER_NAME = "Kunjaahh🤍";
const FROM_NAME = "Abhi💙";
const LETTER = "Wish You Happy Birthday....\nMy Love 🤍\n\nEppolum Nammalkk Ithupole Irikkanm Ttah....\nNjn Ind Ninte Kudey Enthinum\nLike A Friend 😁\nLike A Future Husband ☺️\n\nPineh Eppolum Happy Irikkanam\nNammal Long-distance Relationship Aahn Ippom🫠\nBut Nammdey Manassu Ellam Kondum Aduth Aahn Njn Ninte Kudeyum😊\nNiii Entey Kudeyum Eppolum Ind😚\n\nLove You My Favorite Person 👩‍❤️‍👨\nLove You My Bestfriend 👫\nLove You My Future Wife 👰🏻‍♀️\nLove You My Everything 🌏";
/* ============================ */

const $ = (s) => document.querySelector(s);
const pages = [...document.querySelectorAll(".page")];
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let cur = 0, shotsInit = false;

document.title = "Happy Birthday " + " Manju🤍";
document.querySelectorAll("[data-name]").forEach((n) => { n.textContent = HER_NAME; });
$("#from").textContent = FROM_NAME;
$("#to").textContent = "Dear " + HER_NAME + ",";

/* ---- "Happy Birthday" appears letter by letter ---- */
(function () {
  const hb = $("#hb"), words = "Happy Birthday".split(" ");
  let i = 0;
  hb.textContent = "";
  words.forEach((w, wi) => {
    const ws = document.createElement("span");
    ws.className = "word";
    ws.setAttribute("aria-hidden", "true");
    [...w].forEach((ch) => {
      const l = document.createElement("span");
      l.className = "l";
      l.textContent = ch;
      l.style.setProperty("--i", i++);
      ws.appendChild(l);
    });
    hb.appendChild(ws);
    if (wi < words.length - 1) hb.appendChild(document.createTextNode(" "));
  });
})();

/* ---- Floating bubbles ---- */
(function () {
  const box = $("#bubbles");
  for (let i = 0; i < 16; i++) {
    const b = document.createElement("span"), s = 14 + Math.random() * 46;
    b.style.cssText = "left:" + Math.random() * 100 + "%;width:" + s + "px;height:" + s + "px;" +
      "animation-duration:" + (12 + Math.random() * 14) + "s;animation-delay:-" + Math.random() * 20 + "s";
    box.appendChild(b);
  }
})();

/* ---- Song ---- */
const song = $("#song"), music = $("#music");
function setMusic(on) {
  music.classList.toggle("on", on);
  music.classList.toggle("off", !on);
}
function playSong() {
  const p = song.play();
  if (p && p.then) p.then(() => { music.hidden = false; setMusic(true); }).catch(() => {}); // no song.mp3? it stays quiet
}
music.addEventListener("click", () => {
  if (song.paused) song.play().then(() => setMusic(true)).catch(() => {}); else { song.pause(); setMusic(false); }
});

/* ---- Pages, dots, buttons, swipe, keyboard ---- */
const dotsEl = $("#dots");
pages.forEach((_, i) => {
  const d = document.createElement("button");
  d.type = "button";
  d.className = "dot";
  d.setAttribute("aria-label", "Page " + (i + 1));
  d.addEventListener("click", () => { if (cur > 0) goTo(i); });
  dotsEl.appendChild(d);
});

function goTo(i) {
  i = Math.max(0, Math.min(pages.length - 1, i));
  cur = i;
  pages.forEach((p, k) => {
    p.classList.toggle("active", k === i);
    p.classList.toggle("left", k < i);
  });
  document.body.classList.toggle("p0", i === 0);
  [...dotsEl.children].forEach((d, k) => d.classList.toggle("on", k === i));
  $("#back").classList.toggle("invisible", i <= 1);
  $("#next").textContent = i === pages.length - 1 ? "Start over" : "Next";
  $("#next").classList.remove("pulse");
  pages[i].scrollTop = 0;
  if (window.Cake3D) Cake3D.setActive(i === 1);
  if (i === 2 && !shotsInit) initShots();
}
$("#start").addEventListener("click", () => { playSong(); goTo(1); });
$("#next").addEventListener("click", () => goTo(cur === pages.length - 1 ? 0 : cur + 1));
$("#back").addEventListener("click", () => goTo(cur - 1));

let sx = null;
document.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
document.addEventListener("touchend", (e) => {
  if (sx === null || cur === 0) return;
  const dx = e.changedTouches[0].clientX - sx;
  if (Math.abs(dx) > 70) goTo(Math.max(1, cur + (dx < 0 ? 1 : -1)));
  sx = null;
});
document.addEventListener("keydown", (e) => {
  if (cur === 0) return;
  if (e.key === "ArrowRight") goTo(cur + 1);
  if (e.key === "ArrowLeft") goTo(Math.max(1, cur - 1));
});

/* ---- Confetti ---- */
function confetti(cx, cy, n) {
  if (reduced) return;
  const colors = ["#4f9fe0", "#8ec5f5", "#ffffff", "#bfe0ff", "#2f7fc8"];
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span"), sz = 6 + Math.random() * 7;
    s.className = "confetti";
    s.style.cssText = "left:" + cx + "px;top:" + cy + "px;width:" + sz + "px;height:" + sz * (Math.random() < 0.5 ? 1 : 0.45) +
      "px;background:" + colors[i % colors.length] + ";border-radius:" + (Math.random() < 0.4 ? "50%" : "2px");
    document.body.appendChild(s);
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, d = 120 + Math.random() * 260;
    s.animate(
      [{ transform: "translate(0,0) rotate(0)", opacity: 1 },
       { transform: "translate(" + Math.cos(a) * d + "px," + (Math.sin(a) * d + 160) + "px) rotate(" + Math.random() * 720 + "deg)", opacity: 0 }],
      { duration: 1400 + Math.random() * 1200, easing: "cubic-bezier(.15,.7,.3,1)" }
    ).onfinish = () => s.remove();
  }
}

/* ---- Page 2: cut the cake ---- */
const stage = $("#cakeStage"), cutBtn = $("#cutBtn"), cakeMsg = $("#cakeMsg");
let cutDone = false;
cutBtn.addEventListener("click", () => {
  if (cutDone) {
    if (window.Cake3D) Cake3D.reset();
    cutDone = false;
    cutBtn.textContent = "Cut the cake";
    cakeMsg.textContent = "";
    return;
  }
  cutBtn.disabled = true;
  Cake3D.cut(() => {
    const r = stage.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + r.height * 0.5, 90);
    cakeMsg.textContent = "Happy Birthday, " + HER_NAME + "! Make a wish and enjoy your slice 🎂";
    cutBtn.textContent = "Put the cake back";
    cutBtn.disabled = false;
    cutDone = true;
    $("#next").classList.add("pulse");
  });
});

/* ---- Page 3: photos appear as you scroll down ---- */
function initShots() {
  shotsInit = true;
  const shots = document.querySelectorAll(".shot");
  if (!("IntersectionObserver" in window)) { shots.forEach((s) => s.classList.add("show")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("show"); io.unobserve(e.target); } });
  }, { root: $("#photoPage"), threshold: 0.2 });
  shots.forEach((s) => io.observe(s));
}

/* ---- Page 4: open the envelope, the letter types itself, then balloons ---- */
const envelope = $("#envelope");
envelope.addEventListener("click", () => {
  if (envelope.classList.contains("open")) return;
  envelope.classList.add("open");
  $("#envHint").textContent = "";
  setTimeout(() => {
    envelope.classList.add("gone");
    $("#envHint").hidden = true;
    $("#loveCard").hidden = false;
    typeLetter();
  }, reduced ? 50 : 1900);
});

function typeLetter() {
  const el = $("#letter");
  const finish = () => {
    el.classList.remove("typing");
    $("#sign").classList.add("show");
    $("#balloonBtn").classList.add("show");
  };
  if (reduced) { el.textContent = LETTER; finish(); return; }
  let i = 0;
  el.classList.add("typing");
  (function step() {
    el.textContent = LETTER.slice(0, ++i);
    if (i < LETTER.length) setTimeout(step, 28); else finish();
  })();
}

function balloons(n) {
  if (reduced) return;
  const colors = ["#8ec5f5", "#bfe0ff", "#ffffff", "#5aa9e6", "#dff0ff"];
  for (let i = 0; i < n; i++) {
    const b = document.createElement("div"), w = 38 + Math.random() * 26;
    b.className = "balloon";
    b.style.cssText = "left:" + (5 + Math.random() * 90) + "%;width:" + w + "px;height:" + w * 1.25 + "px;background:" + colors[i % colors.length];
    document.body.appendChild(b);
    const sway = (Math.random() - 0.5) * 80;
    b.animate(
      [{ transform: "translate(0,0)" },
       { transform: "translate(" + sway + "px,-" + innerHeight * 0.5 + "px)" },
       { transform: "translate(" + -sway + "px,-" + (innerHeight + 220) + "px)" }],
      { duration: 5000 + Math.random() * 4000, delay: Math.random() * 1200, easing: "ease-in", fill: "backwards" }
    ).onfinish = () => b.remove();
  }
}
$("#balloonBtn").addEventListener("click", () => {
  balloons(14);
  confetti(innerWidth / 2, innerHeight * 0.6, 80);
});

goTo(0);