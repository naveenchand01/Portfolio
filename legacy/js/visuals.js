/* Generative project visuals — each canvas only animates while on screen */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scenes = {
    /* STOCK AI — candles, a moving forecast band and a sentiment pulse */
    stock(ctx, w, h, t, st) {
      if (!st.data) {
        st.data = [];
        let v = 0.5;
        for (let i = 0; i < 90; i++) {
          v += (Math.random() - 0.48) * 0.05;
          v = Math.max(0.15, Math.min(0.85, v));
          st.data.push(v);
        }
      }
      ctx.fillStyle = '#05080c';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += w / 12) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += h / 8) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      const n = st.data.length;
      const split = Math.floor(n * 0.7);
      const shift = (t * 6) % 1;
      const step = w / (n - 1);
      const Y = (v) => h * 0.12 + (1 - v) * h * 0.72;

      // candles
      for (let i = 0; i < split; i++) {
        const o = st.data[Math.max(0, i - 1)], c = st.data[i];
        const up = c >= o;
        const x = i * step;
        ctx.strokeStyle = up ? 'rgba(0,224,164,0.85)' : 'rgba(255,92,92,0.85)';
        ctx.fillStyle = ctx.strokeStyle;
        const hi = Math.max(o, c) + 0.02, lo = Math.min(o, c) - 0.02;
        ctx.beginPath(); ctx.moveTo(x, Y(hi)); ctx.lineTo(x, Y(lo)); ctx.stroke();
        ctx.fillRect(x - step * 0.3, Y(Math.max(o, c)), step * 0.6, Math.max(1.5, Math.abs(Y(o) - Y(c))));
      }

      // forecast cone
      const last = st.data[split - 1];
      const x0 = (split - 1) * step;
      const grad = ctx.createLinearGradient(x0, 0, w, 0);
      grad.addColorStop(0, 'rgba(47,107,255,0.35)');
      grad.addColorStop(1, 'rgba(47,107,255,0.02)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x0, Y(last));
      for (let i = split; i < n; i++) { const k = (i - split) / (n - split); ctx.lineTo(i * step, Y(st.data[i] + 0.04 + k * 0.12)); }
      for (let i = n - 1; i >= split; i--) { const k = (i - split) / (n - split); ctx.lineTo(i * step, Y(st.data[i] - 0.04 - k * 0.12)); }
      ctx.closePath();
      ctx.fill();

      // forecast line (dashed, animated)
      ctx.setLineDash([6, 6]);
      ctx.lineDashOffset = -t * 30;
      ctx.strokeStyle = '#c8ff2e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x0, Y(last));
      for (let i = split; i < n; i++) ctx.lineTo(i * step, Y(st.data[i] + Math.sin(t * 1.5 + i * 0.3) * 0.01));
      ctx.stroke();
      ctx.setLineDash([]);

      // "now" marker
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0, h); ctx.stroke();
      const pr = 5 + Math.sin(t * 4) * 2;
      ctx.fillStyle = '#c8ff2e';
      ctx.beginPath(); ctx.arc(x0, Y(last), pr, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(200,255,46,0.4)';
      ctx.beginPath(); ctx.arc(x0, Y(last), pr + 8 + shift * 14, 0, Math.PI * 2); ctx.stroke();

      ctx.font = '600 12px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.fillText('LSTM + XGBoost forecast', x0 + 12, h * 0.1);
      ctx.fillStyle = '#00e0a4';
      ctx.fillText('FinBERT sentiment  +0.' + (62 + Math.round(Math.sin(t) * 8)), 16, h - 18);
    },

    /* NFT Vault — rotating isometric tiles, minting one by one */
    nft(ctx, w, h, t) {
      ctx.fillStyle = '#07060d';
      ctx.fillRect(0, 0, w, h);
      const cols = 7, rows = 7;
      const size = Math.min(w, h) / 9;
      const cx = w / 2, cy = h / 2 - size * 0.4;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = c - (cols - 1) / 2, j = r - (rows - 1) / 2;
          const x = cx + (i - j) * size * 0.62;
          const y = cy + (i + j) * size * 0.36;
          const d = Math.hypot(i, j);
          const lift = Math.max(0, Math.sin(t * 1.4 - d * 0.9)) * size * 0.5;
          const hue = (200 + d * 28 + t * 30) % 360;
          // top
          ctx.fillStyle = `hsla(${hue}, 85%, ${55 + lift / size * 20}%, 0.95)`;
          ctx.beginPath();
          ctx.moveTo(x, y - lift - size * 0.36);
          ctx.lineTo(x + size * 0.6, y - lift);
          ctx.lineTo(x, y - lift + size * 0.36);
          ctx.lineTo(x - size * 0.6, y - lift);
          ctx.closePath(); ctx.fill();
          // sides
          ctx.fillStyle = `hsla(${hue}, 70%, 30%, 0.95)`;
          ctx.beginPath();
          ctx.moveTo(x - size * 0.6, y - lift); ctx.lineTo(x, y - lift + size * 0.36);
          ctx.lineTo(x, y + size * 0.36 + 6); ctx.lineTo(x - size * 0.6, y + 6); ctx.closePath(); ctx.fill();
          ctx.fillStyle = `hsla(${hue}, 70%, 22%, 0.95)`;
          ctx.beginPath();
          ctx.moveTo(x + size * 0.6, y - lift); ctx.lineTo(x, y - lift + size * 0.36);
          ctx.lineTo(x, y + size * 0.36 + 6); ctx.lineTo(x + size * 0.6, y + 6); ctx.closePath(); ctx.fill();
        }
      }
      ctx.font = '600 12px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      const id = String(Math.floor(t * 3) % 1000).padStart(4, '0');
      ctx.fillText('lazyMint(tokenId: #' + id + ')  →  ipfs://Qm…' + id, 16, h - 18);
    },

    /* DeFi Vault — liquidity rings with orbiting tokens */
    defi(ctx, w, h, t) {
      ctx.fillStyle = '#060a0b';
      ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.42;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.45);
      g.addColorStop(0, 'rgba(0,224,164,0.9)');
      g.addColorStop(1, 'rgba(0,224,164,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.45 + Math.sin(t * 2) * 6, 0, Math.PI * 2); ctx.fill();
      const rings = [0.45, 0.68, 0.9];
      rings.forEach((k, ri) => {
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.setLineDash([3, 7]);
        ctx.beginPath(); ctx.arc(cx, cy, R * k, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        const count = 4 + ri * 3;
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2 + t * (0.5 - ri * 0.15) * (ri % 2 ? -1 : 1);
          const x = cx + Math.cos(a) * R * k, y = cy + Math.sin(a) * R * k;
          const colors = ['#2f6bff', '#c8ff2e', '#00e0a4'];
          ctx.fillStyle = colors[(i + ri) % 3];
          ctx.beginPath(); ctx.arc(x, y, 5 + ri, 0, Math.PI * 2); ctx.fill();
        }
      });
      ctx.fillStyle = '#05080c';
      ctx.font = '800 ' + Math.round(R * 0.16) + 'px Syne, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText((4.2 + Math.sin(t * 0.8) * 0.6).toFixed(2) + '%', cx, cy + R * 0.02);
      ctx.font = '600 11px JetBrains Mono, monospace';
      ctx.fillText('VARIABLE APY', cx, cy + R * 0.14);
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('Chainlink ETH/USD  ' + (3000 + Math.round(Math.sin(t * 0.6) * 40)), 16, h - 18);
    },

    /* Cyber Trigger — network graph with a scanning sweep and flagged anomalies */
    forensics(ctx, w, h, t, st) {
      if (!st.nodes) {
        st.nodes = Array.from({ length: 46 }, () => ({
          x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.02, vy: (Math.random() - 0.5) * 0.02, bad: Math.random() < 0.12,
        }));
      }
      ctx.fillStyle = '#080609';
      ctx.fillRect(0, 0, w, h);
      const N = st.nodes;
      N.forEach((n) => {
        n.x += n.vx * 0.016; n.y += n.vy * 0.016;
        if (n.x < 0.03 || n.x > 0.97) n.vx *= -1;
        if (n.y < 0.05 || n.y > 0.9) n.vy *= -1;
      });
      for (let i = 0; i < N.length; i++) {
        for (let j = i + 1; j < N.length; j++) {
          const dx = (N[i].x - N[j].x) * w, dy = (N[i].y - N[j].y) * h;
          const d = Math.hypot(dx, dy);
          if (d < 120) {
            ctx.strokeStyle = `rgba(160,180,255,${(1 - d / 120) * 0.25})`;
            ctx.beginPath(); ctx.moveTo(N[i].x * w, N[i].y * h); ctx.lineTo(N[j].x * w, N[j].y * h); ctx.stroke();
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
      N.forEach((n) => {
        const x = n.x * w, y = n.y * h;
        const scanned = Math.abs(x - sweep) < 80 && x < sweep;
        if (n.bad) {
          ctx.strokeStyle = scanned ? 'rgba(255,77,46,1)' : 'rgba(255,77,46,0.5)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x - 8, y - 8, 16, 16);
          ctx.lineWidth = 1;
          ctx.fillStyle = '#ff4d2e';
        } else ctx.fillStyle = scanned ? '#00e5ff' : 'rgba(200,210,255,0.55)';
        ctx.beginPath(); ctx.arc(x, y, n.bad ? 3.5 : 2.5, 0, Math.PI * 2); ctx.fill();
      });
      ctx.font = '600 12px JetBrains Mono, monospace';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('anomaly_score > 0.87  ·  ' + N.filter((n) => n.bad).length + ' flagged  ·  evidence.E01', 16, h - 18);
    },
  };

  document.querySelectorAll('canvas[data-visual]').forEach((canvas) => {
    const scene = scenes[canvas.dataset.visual];
    if (!scene) return;
    const ctx = canvas.getContext('2d');
    const state = {};
    let visible = false, w = 0, h = 0;
    const start = performance.now() - Math.random() * 5000;

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = (now) => {
      if (!w) resize();
      scene(ctx, w, h, (now - start) / 1000, state);
      if (visible && !reduce) requestAnimationFrame(draw);
    };
    new ResizeObserver(() => { resize(); if (!visible || reduce) draw(performance.now()); }).observe(canvas);
    new IntersectionObserver(([e]) => {
      const was = visible;
      visible = e.isIntersecting;
      if (visible && !was) requestAnimationFrame(draw);
    }, { rootMargin: '100px' }).observe(canvas);
  });
})();
