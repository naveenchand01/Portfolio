import type { VisualScene } from '@/content/projects';

/*
 * Generative canvas scenes for the project panels. Each scene draws one frame for time `t`
 * (seconds) into a w×h canvas and may keep its own state between frames.
 */

type State = Record<string, unknown>;
type Scene = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, st: State) => void;

const MONO = '600 12px "JetBrains Mono", monospace';

/** STOCK AI: candles, a forecast cone, a dashed forecast line and a pulsing "now" marker. */
const stock: Scene = (ctx, w, h, t, st) => {
  if (!st.data) {
    const data: number[] = [];
    let v = 0.5;
    for (let i = 0; i < 90; i++) {
      v = Math.max(0.15, Math.min(0.85, v + (Math.random() - 0.48) * 0.05));
      data.push(v);
    }
    st.data = data;
  }
  const data = st.data as number[];
  ctx.fillStyle = '#05080c';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += w / 12) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += h / 8) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const n = data.length;
  const split = Math.floor(n * 0.7);
  const step = w / (n - 1);
  const Y = (v: number) => h * 0.12 + (1 - v) * h * 0.72;
  const at = (i: number) => data[Math.max(0, Math.min(n - 1, i))] as number;

  for (let i = 0; i < split; i++) {
    const o = at(i - 1);
    const c = at(i);
    const x = i * step;
    ctx.strokeStyle = c >= o ? 'rgba(0,224,164,0.85)' : 'rgba(255,92,92,0.85)';
    ctx.fillStyle = ctx.strokeStyle;
    ctx.beginPath();
    ctx.moveTo(x, Y(Math.max(o, c) + 0.02));
    ctx.lineTo(x, Y(Math.min(o, c) - 0.02));
    ctx.stroke();
    ctx.fillRect(x - step * 0.3, Y(Math.max(o, c)), step * 0.6, Math.max(1.5, Math.abs(Y(o) - Y(c))));
  }

  const last = at(split - 1);
  const x0 = (split - 1) * step;
  const grad = ctx.createLinearGradient(x0, 0, w, 0);
  grad.addColorStop(0, 'rgba(47,107,255,0.35)');
  grad.addColorStop(1, 'rgba(47,107,255,0.02)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(x0, Y(last));
  for (let i = split; i < n; i++) ctx.lineTo(i * step, Y(at(i) + 0.04 + ((i - split) / (n - split)) * 0.12));
  for (let i = n - 1; i >= split; i--)
    ctx.lineTo(i * step, Y(at(i) - 0.04 - ((i - split) / (n - split)) * 0.12));
  ctx.closePath();
  ctx.fill();

  ctx.setLineDash([6, 6]);
  ctx.lineDashOffset = -t * 30;
  ctx.strokeStyle = '#c8ff2e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0, Y(last));
  for (let i = split; i < n; i++) ctx.lineTo(i * step, Y(at(i) + Math.sin(t * 1.5 + i * 0.3) * 0.01));
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.lineWidth = 1;

  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.moveTo(x0, 0);
  ctx.lineTo(x0, h);
  ctx.stroke();
  const pr = 5 + Math.sin(t * 4) * 2;
  ctx.fillStyle = '#c8ff2e';
  ctx.beginPath();
  ctx.arc(x0, Y(last), pr, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,255,46,0.4)';
  ctx.beginPath();
  ctx.arc(x0, Y(last), pr + 8 + ((t * 6) % 1) * 14, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = MONO;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText('LSTM + XGBoost forecast', x0 + 12, h * 0.1);
  ctx.fillStyle = '#00e0a4';
  ctx.fillText(`FinBERT sentiment  +0.${62 + Math.round(Math.sin(t) * 8)}`, 16, h - 18);
};

/** NFT Vault: an isometric grid of tiles that lift in a ripple, like tokens being minted. */
const nft: Scene = (ctx, w, h, t) => {
  ctx.fillStyle = '#07060d';
  ctx.fillRect(0, 0, w, h);
  const size = Math.min(w, h) / 9;
  const cx = w / 2;
  const cy = h / 2 - size * 0.4;
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const i = c - 3;
      const j = r - 3;
      const x = cx + (i - j) * size * 0.62;
      const y = cy + (i + j) * size * 0.36;
      const d = Math.hypot(i, j);
      const lift = Math.max(0, Math.sin(t * 1.4 - d * 0.9)) * size * 0.5;
      const hue = (200 + d * 28 + t * 30) % 360;
      ctx.fillStyle = `hsla(${hue}, 85%, ${55 + (lift / size) * 20}%, 0.95)`;
      ctx.beginPath();
      ctx.moveTo(x, y - lift - size * 0.36);
      ctx.lineTo(x + size * 0.6, y - lift);
      ctx.lineTo(x, y - lift + size * 0.36);
      ctx.lineTo(x - size * 0.6, y - lift);
      ctx.closePath();
      ctx.fill();
      for (const [side, light] of [
        [-1, 30],
        [1, 22],
      ] as const) {
        ctx.fillStyle = `hsla(${hue}, 70%, ${light}%, 0.95)`;
        ctx.beginPath();
        ctx.moveTo(x + side * size * 0.6, y - lift);
        ctx.lineTo(x, y - lift + size * 0.36);
        ctx.lineTo(x, y + size * 0.36 + 6);
        ctx.lineTo(x + side * size * 0.6, y + 6);
        ctx.closePath();
        ctx.fill();
      }
    }
  }
  ctx.font = MONO;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  const id = String(Math.floor(t * 3) % 1000).padStart(4, '0');
  ctx.fillText(`lazyMint(tokenId: #${id})  →  ipfs://Qm…${id}`, 16, h - 18);
};

/** DeFi Vault: a liquidity core with tokens orbiting on three rings and a live APY. */
const defi: Scene = (ctx, w, h, t) => {
  ctx.fillStyle = '#060a0b';
  ctx.fillRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;
  const R = Math.min(w, h) * 0.42;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.45);
  g.addColorStop(0, 'rgba(0,224,164,0.9)');
  g.addColorStop(1, 'rgba(0,224,164,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.45 + Math.sin(t * 2) * 6, 0, Math.PI * 2);
  ctx.fill();
  const colors = ['#2f6bff', '#c8ff2e', '#00e0a4'];
  [0.45, 0.68, 0.9].forEach((k, ri) => {
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.setLineDash([3, 7]);
    ctx.beginPath();
    ctx.arc(cx, cy, R * k, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    const count = 4 + ri * 3;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + t * (0.5 - ri * 0.15) * (ri % 2 ? -1 : 1);
      ctx.fillStyle = colors[(i + ri) % 3] as string;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * R * k, cy + Math.sin(a) * R * k, 5 + ri, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.fillStyle = '#05080c';
  ctx.textAlign = 'center';
  ctx.font = `800 ${Math.round(R * 0.16)}px Syne, sans-serif`;
  ctx.fillText(`${(4.2 + Math.sin(t * 0.8) * 0.6).toFixed(2)}%`, cx, cy + R * 0.02);
  ctx.font = '600 11px "JetBrains Mono", monospace';
  ctx.fillText('VARIABLE APY', cx, cy + R * 0.14);
  ctx.textAlign = 'left';
  ctx.font = MONO;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(`Chainlink ETH/USD  ${3000 + Math.round(Math.sin(t * 0.6) * 40)}`, 16, h - 18);
};

type Node = { x: number; y: number; vx: number; vy: number; bad: boolean };

/** Cyber Trigger: a drifting network graph, a scanning sweep and flagged anomalies. */
const forensics: Scene = (ctx, w, h, t, st) => {
  if (!st.nodes) {
    st.nodes = Array.from({ length: 46 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
      bad: Math.random() < 0.12,
    }));
  }
  const nodes = st.nodes as Node[];
  ctx.fillStyle = '#080609';
  ctx.fillRect(0, 0, w, h);
  for (const n of nodes) {
    n.x += n.vx * 0.016;
    n.y += n.vy * 0.016;
    if (n.x < 0.03 || n.x > 0.97) n.vx *= -1;
    if (n.y < 0.05 || n.y > 0.9) n.vy *= -1;
  }
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i] as Node;
      const b = nodes[j] as Node;
      const d = Math.hypot((a.x - b.x) * w, (a.y - b.y) * h);
      if (d < 120) {
        ctx.strokeStyle = `rgba(160,180,255,${(1 - d / 120) * 0.25})`;
        ctx.beginPath();
        ctx.moveTo(a.x * w, a.y * h);
        ctx.lineTo(b.x * w, b.y * h);
        ctx.stroke();
      }
    }
  }
  const sweep = ((t * 0.25) % 1) * w;
  const sg = ctx.createLinearGradient(sweep - 120, 0, sweep, 0);
  sg.addColorStop(0, 'rgba(0,229,255,0)');
  sg.addColorStop(1, 'rgba(0,229,255,0.22)');
  ctx.fillStyle = sg;
  ctx.fillRect(sweep - 120, 0, 120, h);
  ctx.fillStyle = 'rgba(0,229,255,0.8)';
  ctx.fillRect(sweep, 0, 1.5, h);
  for (const n of nodes) {
    const x = n.x * w;
    const y = n.y * h;
    const scanned = Math.abs(x - sweep) < 80 && x < sweep;
    if (n.bad) {
      ctx.strokeStyle = scanned ? 'rgba(255,77,46,1)' : 'rgba(255,77,46,0.5)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - 8, y - 8, 16, 16);
      ctx.lineWidth = 1;
      ctx.fillStyle = '#ff4d2e';
    } else ctx.fillStyle = scanned ? '#00e5ff' : 'rgba(200,210,255,0.55)';
    ctx.beginPath();
    ctx.arc(x, y, n.bad ? 3.5 : 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.font = MONO;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(
    `anomaly_score > 0.87  ·  ${nodes.filter((n) => n.bad).length} flagged  ·  evidence.E01`,
    16,
    h - 18,
  );
};

/** One title per row/column of the similarity matrix. */
const FILMS = [
  'Avatar',
  'Interstellar',
  'Inception',
  'The Matrix',
  'Gravity',
  'Alien',
  'Arrival',
  'Dune',
  'Titanic',
  'Up',
  'Skyfall',
  'Frozen',
  'Jaws',
  'Heat',
  'Gladiator',
  'Memento',
  'Zodiac',
  'Rocky',
];

/** Shortens `text` with an ellipsis until it fits in `max` pixels. */
const ellipsize = (ctx: CanvasRenderingContext2D, text: string, max: number) => {
  let s = text;
  while (s.length > 4 && ctx.measureText(s).width > max) s = `${s.slice(0, -2)}…`;
  return s;
};

/** Movie Recommender: a cosine-similarity heatmap with a scanning query row and its top matches. */
const movies: Scene = (ctx, w, h, t) => {
  ctx.fillStyle = '#07070b';
  ctx.fillRect(0, 0, w, h);
  const n = FILMS.length;
  const size = Math.min(w * 0.55, h * 0.78);
  const cell = size / n;
  const ox = w * 0.06;
  const oy = (h - size) / 2 - 8;
  const q = Math.floor(t / 2.2) % n;
  const sim = (i: number, j: number) =>
    i === j ? 1 : 0.5 + 0.5 * Math.sin(i * 1.7 + j * 2.3) * Math.cos(i * 0.9 - j * 1.3);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const v = sim(i, j);
      const on = i === q;
      ctx.fillStyle = on ? `rgba(200,255,46,${0.15 + v * 0.85})` : `rgba(47,107,255,${0.06 + v * v * 0.6})`;
      ctx.fillRect(ox + j * cell + 1, oy + i * cell + 1, cell - 2, cell - 2);
    }
  }
  const scan = ((t % 2.2) / 2.2) * size;
  ctx.fillStyle = 'rgba(200,255,46,0.9)';
  ctx.fillRect(ox + scan, oy + q * cell - 3, 2, cell + 6);

  const ranked = Array.from({ length: n }, (_, j) => j)
    .filter((j) => j !== q)
    .sort((a, b) => sim(q, b) - sim(q, a))
    .slice(0, 5);
  const lx = ox + size + w * 0.05;
  const rx = w - 16;
  ctx.font = MONO;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillText(ellipsize(ctx, `query: ${FILMS[q]}`, rx - lx), lx, oy + 12);
  ranked.forEach((j, k) => {
    const y = oy + 44 + k * 34;
    const s = sim(q, j);
    const shown = Math.min(1, Math.max(0, (t % 2.2) * 2.5 - k * 0.35));
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(lx, y, rx - lx, 6);
    ctx.fillStyle = '#c8ff2e';
    ctx.fillRect(lx, y, (rx - lx) * s * shown, 6);
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    const score = s.toFixed(2);
    ctx.fillText(
      ellipsize(ctx, `${k + 1}. ${FILMS[j]}`, rx - lx - ctx.measureText(score).width - 8),
      lx,
      y - 6,
    );
    ctx.textAlign = 'right';
    ctx.fillText(score, rx, y - 6);
    ctx.textAlign = 'left';
  });
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText('TF-IDF → cosine_similarity  ·  4803 × 4803', 16, h - 18);
};

/** Restaurant Website: warm blobs drifting behind a turning plate with rising steam. */
const restaurant: Scene = (ctx, w, h, t) => {
  ctx.fillStyle = '#0d0907';
  ctx.fillRect(0, 0, w, h);
  const blobs = [
    ['255,122,56', 0.25, 0.3, 0.35],
    ['255,190,80', 0.75, 0.25, 0.28],
    ['80,170,120', 0.2, 0.8, 0.22],
    ['90,110,200', 0.82, 0.78, 0.2],
  ] as const;
  for (const [i, [rgb, bx, by, br]] of blobs.entries()) {
    const x = (bx + Math.sin(t * 0.4 + i * 2) * 0.05) * w;
    const y = (by + Math.cos(t * 0.35 + i) * 0.05) * h;
    const r = br * Math.max(w, h);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb},0.35)`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  const cx = w / 2;
  const cy = h / 2;
  const R = Math.min(w, h) * 0.26;
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath();
  ctx.arc(cx, cy, R * 0.72, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const a = t * 0.5 + (i / 6) * Math.PI * 2;
    ctx.fillStyle = i % 2 ? '#ff7a38' : '#ffbe50';
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * R * 0.86, cy + Math.sin(a) * R * 0.86, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let k = 0; k < 3; k++) {
    const p = (t * 0.35 + k / 3) % 1;
    ctx.strokeStyle = `rgba(255,255,255,${(1 - p) * 0.35})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const sx = cx + (k - 1) * R * 0.3;
    for (let s = 0; s <= 20; s++) {
      const yy = cy - R * 0.2 - (s / 20) * R * 1.1 * (0.4 + p);
      const xx = sx + Math.sin(s * 0.5 + t * 2 + k) * 8;
      if (s === 0) ctx.moveTo(xx, yy);
      else ctx.lineTo(xx, yy);
    }
    ctx.stroke();
  }
  ctx.lineWidth = 1;
  ctx.font = MONO;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  // Top-right: the screenshot frame covers the bottom of this panel.
  ctx.textAlign = 'right';
  ctx.fillText('filter: all · breakfast · lunch · dinner', w - 16, 30);
  ctx.textAlign = 'left';
};

export const SCENES: Record<VisualScene, Scene> = {
  stock,
  nft,
  defi,
  forensics,
  movies,
  restaurant,
};
