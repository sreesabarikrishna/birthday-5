/* Realistic 3D birthday cake: drip frosting, strawberries, blueberries, sugar pearls.
   A knife makes two cuts and a slice slides out. Needs three.js (r128) loaded first. */
(function () {
  const box = document.getElementById("cake3d");
  const fallback = document.getElementById("cakeFallback");
  const api = { ok: false, setActive() {}, cut(done) { if (done) done(); }, reset() {} };
  window.Cake3D = api;
  if (!box) return;
  const fail = () => { if (fallback) fallback.hidden = false; };
  if (!window.THREE) { fail(); return; }
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { fail(); return; }

  const TAU = Math.PI * 2, R = 1.9, H = 1.7, A = Math.PI * 50 / 180; // radius, height, width of the slice
  const rnd = (a, b) => a + Math.random() * (b - a);
  const mkCanvas = (w, h) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  box.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
  camera.position.set(0, 4.7, 8.6);
  camera.lookAt(0, 0.85, 0);

  /* ---------- Soft studio light reflections (painted in code) ---------- */
  try {
    const c = mkCanvas(1024, 512), g = c.getContext("2d");
    const sky = g.createLinearGradient(0, 0, 0, 512);
    sky.addColorStop(0, "#ffffff"); sky.addColorStop(0.5, "#e3f1ff"); sky.addColorStop(1, "#9cc4ea");
    g.fillStyle = sky; g.fillRect(0, 0, 1024, 512);
    g.fillStyle = "#ffffff";
    [[60, 60, 200, 110], [420, 40, 160, 130], [700, 80, 220, 90]].forEach((r) => g.fillRect(r[0], r[1], r[2], r[3]));
    const t = new THREE.CanvasTexture(c);
    t.mapping = THREE.EquirectangularReflectionMapping;
    t.encoding = THREE.sRGBEncoding;
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromEquirectangular(t).texture;
    t.dispose(); pm.dispose();
  } catch (e) { /* the cake still looks fine with plain lights */ }

  scene.add(new THREE.HemisphereLight(0xffffff, 0xbcd8f5, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.9);
  key.position.set(4, 8, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 25 });
  key.shadow.bias = -0.0005;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xcfe4ff, 0.35);
  fill.position.set(-5, 3, 3);
  scene.add(fill);

  /* ---------- Textures drawn in code ---------- */
  function sideCanvas() { // light blue buttercream with white drips
    const c = mkCanvas(1024, 256), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "#e8f4ff"); gr.addColorStop(1, "#b9daf7");
    g.fillStyle = gr; g.fillRect(0, 0, 1024, 256);
    for (let i = 0; i < 300; i++) {
      g.fillStyle = "rgba(255,255,255," + rnd(0.05, 0.14) + ")";
      g.fillRect(rnd(0, 1024), 0, rnd(1, 4), 256);
    }
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, 1024, 26);
    for (let x = 0; x < 1024;) {
      const w = rnd(30, 62), len = rnd(34, 100);
      g.beginPath(); g.rect(x, 0, w, len); g.arc(x + w / 2, len, w / 2, 0, TAU); g.fill();
      x += w + rnd(8, 30);
    }
    return c;
  }
  function topCanvas() { // swirled frosting on top
    const c = mkCanvas(512, 512), g = c.getContext("2d");
    const rg = g.createRadialGradient(256, 256, 20, 256, 256, 256);
    rg.addColorStop(0, "#ffffff"); rg.addColorStop(1, "#dcecfb");
    g.fillStyle = rg; g.fillRect(0, 0, 512, 512);
    g.lineCap = "round";
    for (let k = 0; k < 7; k++) {
      g.beginPath();
      for (let t = 0; t < 5; t += 0.05) {
        const a = t * 2.4 + k * 0.9, rad = 18 + t * 44;
        const x = 256 + Math.cos(a) * rad, y = 256 + Math.sin(a) * rad;
        if (t) g.lineTo(x, y); else g.moveTo(x, y);
      }
      g.strokeStyle = "rgba(150,195,240,.28)"; g.lineWidth = 9; g.stroke();
      g.strokeStyle = "rgba(255,255,255,.8)"; g.lineWidth = 4; g.stroke();
    }
    return c;
  }
  function insideCanvas() { // the cut face: sponge, cream and strawberry jam layers
    const W = 512, Hh = 480, c = mkCanvas(W, Hh), g = c.getContext("2d");
    const band = (y0, y1, col) => { g.fillStyle = col; g.fillRect(0, y0 * Hh, W, (y1 - y0) * Hh); };
    const sp = g.createLinearGradient(0, 0, W, 0);
    sp.addColorStop(0, "#f7e6b8"); sp.addColorStop(1, "#ecd290");
    band(0, 1, sp);
    for (let i = 0; i < 3500; i++) {
      g.fillStyle = Math.random() < 0.5 ? "rgba(205,150,80," + rnd(0.08, 0.2) + ")" : "rgba(255,248,220," + rnd(0.1, 0.25) + ")";
      g.fillRect(rnd(0, W), rnd(0, Hh), rnd(1, 3), rnd(1, 3));
    }
    band(0, 0.055, "#eaf5ff");
    [[0.31, 0.355], [0.645, 0.69]].forEach((b) => {
      band(b[0], b[1], "#fffdf7");
      g.fillStyle = "#f4a3b4";
      g.fillRect(0, (b[0] + (b[1] - b[0]) * 0.35) * Hh, W, (b[1] - b[0]) * 0.3 * Hh);
    });
    g.fillStyle = "#cfe6fb"; g.fillRect(W - 22, 0, 22, Hh);
    g.fillStyle = "#ffffff"; g.fillRect(W - 22, 0, 22, 0.055 * Hh);
    return c;
  }
  function berryCanvas() { // strawberry skin with seeds
    const c = mkCanvas(256, 256), g = c.getContext("2d");
    const gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "#ef4560"); gr.addColorStop(1, "#b5132c");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 160; i++) {
      g.fillStyle = "rgba(255,232,150,.9)";
      g.beginPath(); g.ellipse(rnd(0, 256), rnd(0, 256), 1.6, 3, 0, 0, TAU); g.fill();
    }
    return c;
  }
  const srgb = (cv) => { const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t; };

  const sideC = sideCanvas();
  const topTex = srgb(topCanvas());
  const topMat = new THREE.MeshStandardMaterial({ map: topTex, bumpMap: topTex, bumpScale: 0.6, roughness: 0.5, envMapIntensity: 0.4 });
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xf0d9a0, roughness: 0.9 });
  const insMat = new THREE.MeshStandardMaterial({ map: srgb(insideCanvas()), roughness: 0.9, side: THREE.DoubleSide, envMapIntensity: 0.15 });

  function sideMat(ts, tl) { // each piece shows its own part of the drip texture
    const t = srgb(sideC);
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.set(tl / TAU, 1);
    t.offset.set(ts / TAU + 0.5, 0);
    return new THREE.MeshStandardMaterial({ map: t, bumpMap: t, bumpScale: 1.2, roughness: 0.45, envMapIntensity: 0.45 });
  }
  function part(ts, tl) {
    const geo = new THREE.CylinderGeometry(R, R, H, 64, 1, false, ts, tl);
    geo.translate(0, H / 2, 0);
    const m = new THREE.Mesh(geo, [sideMat(ts, tl), topMat, baseMat]);
    m.castShadow = m.receiveShadow = true;
    return m;
  }
  function face(theta) { // flat cut face, drawn at the edge of the slice
    const m = new THREE.Mesh(new THREE.PlaneGeometry(R, H), insMat);
    m.position.set(Math.sin(theta) * R / 2, H / 2, Math.cos(theta) * R / 2);
    m.rotation.y = theta - Math.PI / 2;
    m.receiveShadow = true;
    return m;
  }

  /* ---------- The cake: one big piece and one slice ---------- */
  const cake = new THREE.Group();
  const body = new THREE.Group(), slice = new THREE.Group();
  cake.add(body, slice);
  scene.add(cake);
  body.add(part(A / 2, TAU - A), face(A / 2), face(-A / 2));
  slice.add(part(-A / 2, A), face(A / 2), face(-A / 2));

  function dec(mesh, theta, radius, y) { // put each decoration on the body or on the slice
    mesh.position.set(Math.sin(theta) * radius, y, Math.cos(theta) * radius);
    mesh.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    const t = ((theta + Math.PI) % TAU + TAU) % TAU - Math.PI;
    (Math.abs(t) < A / 2 ? slice : body).add(mesh);
  }
  const deg = (d) => d * Math.PI / 180;

  const creamMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, envMapIntensity: 0.6 });
  for (let i = 0; i < 16; i++) { // piped rosettes around the top edge
    const r = new THREE.Group();
    const a = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), creamMat); a.scale.y = 0.8;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), creamMat); b.position.y = 0.1;
    r.add(a, b);
    dec(r, (i + 0.5) * TAU / 16, R - 0.17, H + 0.05);
  }
  const pearlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.15, metalness: 0.1, envMapIntensity: 1 });
  const pearlGeo = new THREE.SphereGeometry(0.06, 12, 10);
  for (let i = 0; i < 45; i++) dec(new THREE.Mesh(pearlGeo, pearlMat), (i + 0.5) * TAU / 45, R + 0.02, 0.07);

  const sbGeo = new THREE.LatheGeometry([[0, 0], [0.1, 0], [0.15, 0.04], [0.17, 0.12], [0.15, 0.24], [0.1, 0.34], [0.04, 0.42], [0, 0.46]]
    .map((p) => new THREE.Vector2(p[0], p[1])), 20);
  const sbMat = new THREE.MeshStandardMaterial({ map: srgb(berryCanvas()), roughness: 0.35, envMapIntensity: 0.7 });
  for (let k = 0; k < 6; k++) {
    const s = new THREE.Mesh(sbGeo, sbMat);
    s.scale.setScalar(rnd(0.9, 1.1));
    s.rotation.set(rnd(-0.12, 0.12), rnd(0, TAU), rnd(-0.12, 0.12));
    dec(s, deg(k * 60), R * 0.53, H - 0.02);
  }
  const bbMat = new THREE.MeshStandardMaterial({ color: 0x3a4fa8, roughness: 0.4, envMapIntensity: 0.6 });
  const bbGeo = new THREE.SphereGeometry(0.09, 14, 12);
  [[0, 0.31], [60, 0.31], [120, 0.31], [180, 0.31], [240, 0.31], [300, 0.31],
   [0, 0.72], [30, 0.72], [90, 0.72], [150, 0.72], [210, 0.72], [270, 0.72], [330, 0.72]]
    .forEach((p) => dec(new THREE.Mesh(bbGeo, bbMat), deg(p[0]), p[1] * R, H + 0.07));

  /* ---------- Plate, shadow and knife ---------- */
  const plateMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.18, envMapIntensity: 0.9 });
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.45, 0.1, 64), plateMat);
  plate.position.y = -0.05; plate.receiveShadow = true; plate.castShadow = true;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(2.58, 0.04, 12, 80), plateMat);
  rim.rotation.x = Math.PI / 2;
  const floor = new THREE.Mesh(new THREE.CircleGeometry(7, 48), new THREE.ShadowMaterial({ opacity: 0.16 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.101; floor.receiveShadow = true;
  scene.add(plate, rim, floor);

  const knife = new THREE.Group();
  const blade = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.0, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xeaf0f6, metalness: 1, roughness: 0.2, envMapIntensity: 1.3 }));
  blade.position.x = 1.25;
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.22, 0.17), new THREE.MeshStandardMaterial({ color: 0x4f9fe0, roughness: 0.35 }));
  handle.position.set(2.95, 0.88, 0);
  blade.castShadow = handle.castShadow = true;
  knife.add(blade, handle);
  knife.position.y = 7;
  knife.visible = false;
  scene.add(knife);

  /* ---------- Cutting ---------- */
  const ease = { io: (k) => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2, out: (k) => 1 - Math.pow(1 - k, 3), in: (k) => k * k * k };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  function tween(ms, fn) {
    return new Promise((res) => {
      const t0 = performance.now();
      (function f(now) {
        const k = Math.min(1, (now - t0) / ms);
        fn(k);
        if (k < 1) requestAnimationFrame(f); else res();
      })(t0);
    });
  }
  let spin = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canSpin = spin;
  let busy = false, isCut = false, active = false;

  async function doCut(done) {
    if (busy || isCut) return;
    busy = true; spin = false; knife.visible = true;
    const r0 = cake.rotation.y, r1 = Math.round(r0 / TAU) * TAU; // turn the cake to face you
    await tween(500, (k) => { cake.rotation.y = r0 + (r1 - r0) * ease.io(k); });
    for (const th of [A / 2, -A / 2]) {
      knife.rotation.y = th - Math.PI / 2;
      await tween(650, (k) => { knife.position.y = 7 + (1.05 - 7) * ease.io(k); });
      await wait(120);
      await tween(450, (k) => { knife.position.y = 1.05 + (7 - 1.05) * ease.in(k); });
    }
    knife.visible = false;
    await tween(1000, (k) => { const e = ease.out(k); slice.position.z = 0.6 * e; slice.rotation.y = -0.08 * e; });
    isCut = true; busy = false;
    if (done) done();
  }
  async function undo() {
    if (busy || !isCut) return;
    busy = true;
    await tween(700, (k) => { const e = ease.io(k); slice.position.z = 0.6 * (1 - e); slice.rotation.y = -0.08 * (1 - e); });
    isCut = false; busy = false; spin = canSpin;
  }

  function resize() { renderer.setSize(box.clientWidth || 300, box.clientWidth || 300, false); }
  resize();
  if (window.ResizeObserver) new ResizeObserver(resize).observe(box);

  (function frame() {
    requestAnimationFrame(frame);
    if (!active || document.hidden) return;
    if (spin) cake.rotation.y += 0.004;
    renderer.render(scene, camera);
  })();

  api.ok = true;
  api.cut = doCut;
  api.reset = undo;
  api.setActive = (on) => { active = on; if (on) resize(); };
})();
