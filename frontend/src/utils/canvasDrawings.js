/**
 * Whiteboard-style canvas drawing engine.
 * Each draw* function accepts a progress value [0, 1] and animates the shape drawing in.
 */

const INK = '#1e293b';
const LABEL_COLOR = '#4f46e5';
const LINE_W = 2.5;
const DRAW_DURATION = 0.9; // seconds per element

function style(ctx, color = INK, lw = LINE_W) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function lerp(a, b, t) { return a + (b - a) * t; }

function line(ctx, x1, y1, x2, y2, p) {
  if (p <= 0) return;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(lerp(x1, x2, p), lerp(y1, y2, p));
  ctx.stroke();
}

function arc(ctx, cx, cy, r, start, sweep, p) {
  if (p <= 0) return;
  ctx.beginPath();
  ctx.arc(cx, cy, r, start, start + sweep * p);
  ctx.stroke();
}

function label(ctx, text, x, y, p, align = 'center') {
  if (p <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, p * 2.5);
  ctx.font = '600 15px Caveat';
  ctx.fillStyle = LABEL_COLOR;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

// Splits progress across N equal parts
function parts(n, progress, fn) {
  const step = 1 / n;
  for (let i = 0; i < n; i++) {
    const p = Math.max(0, Math.min(1, (progress - i * step) / step));
    fn(i, p);
  }
}

// ── Shape renderers ───────────────────────────────────────────────────────────

export function drawStickFigure(ctx, x, y, size, progress, lbl) {
  style(ctx);
  const hr = size * 0.18;
  const hy = y - size * 0.52;
  const bodyTop = hy + hr;
  const bodyBot = y + size * 0.12;
  const armY = bodyTop + (bodyBot - bodyTop) * 0.38;

  const draw = [
    (p) => arc(ctx, x, hy, hr, -Math.PI / 2, Math.PI * 2, p),
    (p) => line(ctx, x, bodyTop, x, bodyBot, p),
    (p) => line(ctx, x, armY, x - size * 0.32, armY + size * 0.2, p),
    (p) => line(ctx, x, armY, x + size * 0.32, armY + size * 0.2, p),
    (p) => line(ctx, x, bodyBot, x - size * 0.26, y + size * 0.56, p),
    (p) => line(ctx, x, bodyBot, x + size * 0.26, y + size * 0.56, p),
  ];
  parts(draw.length, progress, (i, p) => draw[i](p));

  if (lbl && progress > 0.75) label(ctx, lbl, x, y + size * 0.72, (progress - 0.75) / 0.25);
}

export function drawBox(ctx, x, y, w, h, progress, lbl) {
  style(ctx);
  const perim = 2 * (w + h);
  const segs = [
    { len: w, fn: (p) => line(ctx, x, y, x + w, y, p) },
    { len: h, fn: (p) => line(ctx, x + w, y, x + w, y + h, p) },
    { len: w, fn: (p) => line(ctx, x + w, y + h, x, y + h, p) },
    { len: h, fn: (p) => line(ctx, x, y + h, x, y, p) },
  ];
  let elapsed = 0;
  segs.forEach(({ len, fn }) => {
    const frac = len / perim;
    const p = Math.max(0, Math.min(1, (progress - elapsed) / frac));
    fn(p);
    elapsed += frac;
  });
  if (lbl && progress > 0.55) label(ctx, lbl, x + w / 2, y + h / 2, (progress - 0.55) / 0.45);
}

export function drawArrow(ctx, x1, y1, x2, y2, progress, lbl) {
  style(ctx);
  const lp = Math.min(1, progress * 1.2);
  line(ctx, x1, y1, x2, y2, lp);

  if (progress > 0.72) {
    const hp = (progress - 0.72) / 0.28;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const hl = 13;
    const tx = lerp(x1, x2, lp);
    const ty = lerp(y1, y2, lp);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - hl * Math.cos(angle - Math.PI / 6) * hp, ty - hl * Math.sin(angle - Math.PI / 6) * hp);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - hl * Math.cos(angle + Math.PI / 6) * hp, ty - hl * Math.sin(angle + Math.PI / 6) * hp);
    ctx.stroke();
  }

  if (lbl && progress > 0.45) {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const off = 18;
    label(ctx, lbl, mx - Math.sin(ang) * off, my + Math.cos(ang) * off, (progress - 0.45) / 0.55);
  }
}

export function drawDatabase(ctx, x, y, size, progress, lbl) {
  style(ctx);
  const rx = size * 0.62;
  const ry = size * 0.2;
  const h = size * 1.1;

  const draw = [
    (p) => { ctx.beginPath(); ctx.ellipse(x, y, rx * Math.min(1, p * 3), ry, 0, 0, Math.PI * 2); if (p > 0) ctx.stroke(); },
    (p) => line(ctx, x - rx, y, x - rx, y + h, p),
    (p) => line(ctx, x + rx, y, x + rx, y + h, p),
    (p) => { ctx.beginPath(); ctx.ellipse(x, y + h, rx, ry * Math.min(1, p * 3), 0, 0, Math.PI * 2); if (p > 0) ctx.stroke(); },
  ];
  parts(draw.length, progress, (i, p) => draw[i](p));

  if (lbl && progress > 0.7) label(ctx, lbl, x, y + h * 0.5, (progress - 0.7) / 0.3);
}

export function drawCloud(ctx, x, y, size, progress, lbl) {
  style(ctx);
  const blobs = [
    { cx: x,           cy: y + size * 0.18, r: size * 0.34 },
    { cx: x - size * 0.28, cy: y + size * 0.28, r: size * 0.24 },
    { cx: x + size * 0.28, cy: y + size * 0.28, r: size * 0.24 },
    { cx: x - size * 0.14, cy: y - size * 0.02, r: size * 0.27 },
    { cx: x + size * 0.14, cy: y - size * 0.02, r: size * 0.27 },
  ];
  blobs.forEach((b, i) => {
    const p = Math.max(0, Math.min(1, (progress - i / blobs.length) / (1 / blobs.length)));
    arc(ctx, b.cx, b.cy, b.r, 0, Math.PI * 2, p);
  });
  if (lbl && progress > 0.8) label(ctx, lbl, x, y + size * 0.58, (progress - 0.8) / 0.2);
}

export function drawCircle(ctx, x, y, radius, progress, lbl) {
  style(ctx);
  arc(ctx, x, y, radius, -Math.PI / 2, Math.PI * 2, progress);
  if (lbl && progress > 0.7) label(ctx, lbl, x, y, (progress - 0.7) / 0.3);
}

export function drawPhone(ctx, x, y, size, progress, lbl) {
  style(ctx);
  const w = size * 0.55;
  const h = size * 1.0;
  const bx = x - w / 2;
  const by = y - h / 2;

  const draw = [
    (p) => drawBox(ctx, bx, by, w, h, p, null),
    (p) => line(ctx, bx + w * 0.3, by + h * 0.07, bx + w * 0.7, by + h * 0.07, p),
    (p) => arc(ctx, x, by + h * 0.88, size * 0.08, 0, Math.PI * 2, p),
  ];
  parts(draw.length, progress, (i, p) => draw[i](p));
  if (lbl && progress > 0.75) label(ctx, lbl, x, by + h + 14, (progress - 0.75) / 0.25);
}

export function drawComputer(ctx, x, y, size, progress, lbl) {
  style(ctx);
  const sw = size * 1.3;
  const sh = size * 0.85;
  const bx = x - sw / 2;
  const by = y - sh / 2;

  const draw = [
    (p) => drawBox(ctx, bx, by, sw, sh, p, null),
    (p) => line(ctx, x - size * 0.35, by + sh, x + size * 0.35, by + sh, p),
    (p) => line(ctx, x - size * 0.55, by + sh + size * 0.12, x + size * 0.55, by + sh + size * 0.12, p),
  ];
  parts(draw.length, progress, (i, p) => draw[i](p));
  if (lbl && progress > 0.75) label(ctx, lbl, x, by + sh + size * 0.22, (progress - 0.75) / 0.25);
}

export function drawText(ctx, x, y, text, progress) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = Math.min(1, progress * 2.5);
  ctx.font = '600 20px Caveat';
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}

// ── Dispatch ──────────────────────────────────────────────────────────────────

export function renderElement(ctx, el, elapsed) {
  const start = el.delay || 0;
  const progress = Math.max(0, Math.min(1, (elapsed - start) / DRAW_DURATION));
  if (progress <= 0) return;

  switch (el.type) {
    case 'stick_figure': drawStickFigure(ctx, el.x, el.y, el.size || 55, progress, el.label); break;
    case 'box':          drawBox(ctx, el.x, el.y, el.width || 120, el.height || 75, progress, el.label); break;
    case 'arrow':        drawArrow(ctx, el.x1, el.y1, el.x2, el.y2, progress, el.label); break;
    case 'database':     drawDatabase(ctx, el.x, el.y, el.size || 55, progress, el.label); break;
    case 'cloud':        drawCloud(ctx, el.x, el.y, el.size || 70, progress, el.label); break;
    case 'circle':       drawCircle(ctx, el.x, el.y, el.radius || 50, progress, el.label); break;
    case 'phone':        drawPhone(ctx, el.x, el.y, el.size || 50, progress, el.label); break;
    case 'computer':     drawComputer(ctx, el.x, el.y, el.size || 60, progress, el.label); break;
    case 'text':         drawText(ctx, el.x, el.y, el.text, progress); break;
    default: break;
  }
}

export { DRAW_DURATION };
