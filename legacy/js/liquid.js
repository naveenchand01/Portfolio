/* Liquid background — WebGL domain-warped flow field.
   Each page has its own palette; on arrival the palette
   flows from the previous page's colours into the new ones. */
(function () {
  const canvas = document.getElementById('liquid');
  if (!canvas) return;

  const PALETTES = {
    home:    ['#5b2cff', '#00d1c1', '#ff7a59'],
    about:   ['#ff3d7f', '#ffb547', '#7b5cff'],
    work:    ['#00c896', '#2f6bff', '#c8ff2e'],
    stack:   ['#2f5bff', '#9d4dff', '#00e5ff'],
    contact: ['#ff4d2e', '#ff2e93', '#ffc93c'],
  };
  const page = document.body.dataset.page || 'home';
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const target = PALETTES[page].map(hex);

  let from = target;
  try {
    const prev = sessionStorage.getItem('nc-palette');
    if (prev && prev !== page && PALETTES[prev]) from = PALETTES[prev].map(hex);
    sessionStorage.setItem('nc-palette', page);
  } catch (e) {}

  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) {
    canvas.remove();
    const f = document.createElement('div');
    f.className = 'liquid-fallback';
    document.body.prepend(f);
    return;
  }

  const vert = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
  const frag = `
  precision highp float;
  uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uIntensity; uniform float uScroll;
  uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3;

  float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hash(i), hash(i+vec2(1.0,0.0)), u.x), mix(hash(i+vec2(0.0,1.0)), hash(i+vec2(1.0,1.0)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++){ v += a*noise(p); p = m*p; a *= 0.5; }
    return v;
  }
  void main(){
    vec2 uv = gl_FragCoord.xy / uRes;
    float s = min(uRes.x, uRes.y);
    vec2 p = (gl_FragCoord.xy - 0.5*uRes) / s;
    vec2 m = (uMouse*uRes - 0.5*uRes) / s;

    // the cursor drags the liquid like a finger in paint
    vec2 dm = p - m;
    float d = length(dm);
    p -= dm * 0.32 * exp(-d*d*5.0);

    p.y += uScroll * 0.25;
    float t = uTime * 0.045;
    vec2 q = vec2(fbm(p*1.15 + vec2(0.0, t)), fbm(p*1.15 + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(p*1.15 + 3.2*q + vec2(1.7, 9.2) + t*1.4), fbm(p*1.15 + 3.2*q + vec2(8.3, 2.8) - t*1.2));
    float f = fbm(p*1.15 + 3.4*r);

    vec3 col = vec3(0.018, 0.016, 0.03);
    col = mix(col, uC1, clamp(f*f*2.6, 0.0, 1.0));
    col = mix(col, uC2, clamp(length(q)*1.25 - 0.45, 0.0, 1.0) * 0.9);
    col = mix(col, uC3, clamp(r.y*r.y*2.4 - 0.32, 0.0, 1.0) * 0.85);

    // glossy sheen ridges — the "liquid metal" highlight
    float band = sin(f*24.0 + r.x*9.0 - uTime*0.35);
    col += vec3(1.0) * pow(max(band, 0.0), 18.0) * 0.22 * smoothstep(0.35, 0.8, f);

    col *= smoothstep(0.12, 0.9, f) * 1.6 + 0.07;

    float v = smoothstep(1.3, 0.15, length((uv - 0.5) * vec2(1.25, 1.0)) * 1.35);
    col *= mix(0.45, 1.0, v);
    col *= uIntensity;
    col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
  }`;

  function sh(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = {};
  ['uRes', 'uTime', 'uMouse', 'uIntensity', 'uScroll', 'uC1', 'uC2', 'uC3'].forEach((n) => (U[n] = gl.getUniformLocation(prog, n)));

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = window.matchMedia('(max-width: 700px)').matches;
  const QUALITY = isSmall ? 0.42 : 0.5;

  function resize() {
    const w = Math.max(1, Math.floor(window.innerWidth * QUALITY));
    const h = Math.max(1, Math.floor(window.innerHeight * QUALITY));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }
  resize();
  window.addEventListener('resize', resize);

  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  window.addEventListener('pointermove', (e) => {
    mouse.tx = e.clientX / window.innerWidth;
    mouse.ty = 1 - e.clientY / window.innerHeight;
  }, { passive: true });

  // Pages can lower the intensity behind dense content
  const api = (window.Liquid = { intensity: 1, targetIntensity: 1, pulse: 0 });

  let blend = 0;
  const start = performance.now();
  let last = start;
  let running = true;
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) { last = performance.now(); requestAnimationFrame(frame); }
  });

  let time = 20 + Math.random() * 40;
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    time += dt * (1 + api.pulse * 6);
    api.pulse *= 0.94;

    mouse.x += (mouse.tx - mouse.x) * 0.045;
    mouse.y += (mouse.ty - mouse.y) * 0.045;

    blend = from === target ? 1 : Math.min(1, (now - start) / 2200);
    const e = 1 - Math.pow(1 - blend, 3);
    const c = [0, 1, 2].map((i) => from[i].map((v, k) => v + (target[i][k] - v) * e));

    const sy = window.scrollY / window.innerHeight;
    const fade = Math.max(0.42, 1 - sy * 0.45);
    api.intensity += (api.targetIntensity * fade - api.intensity) * 0.06;

    gl.uniform2f(U.uRes, canvas.width, canvas.height);
    gl.uniform1f(U.uTime, time);
    gl.uniform2f(U.uMouse, mouse.x, mouse.y);
    gl.uniform1f(U.uIntensity, api.intensity);
    gl.uniform1f(U.uScroll, sy);
    gl.uniform3fv(U.uC1, c[0]);
    gl.uniform3fv(U.uC2, c[1]);
    gl.uniform3fv(U.uC3, c[2]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (!reduce) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  if (reduce) window.addEventListener('scroll', () => requestAnimationFrame(frame), { passive: true });
})();
