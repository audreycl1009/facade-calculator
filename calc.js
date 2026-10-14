// Calculation logic shared by index.html (browser) and tests/run.js (Node).
// Pure functions only: no DOM, no storage.
const DEFAULT_WASTE = 5;
const OPENING_TYPES = ['Window', 'Door', 'Louver'];

const num = v => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
const fmt = n => (Math.round(n * 100) / 100).toFixed(2);
const overlap = (a0, a1, b0, b1) => Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));

function materialsInUse(s) {
  const seen = [];
  for (const f of s.facades) for (const z of f.zones) {
    const m = (z.material || '').trim();
    if (m && !seen.includes(m)) seen.push(m);
  }
  return seen;
}
function wasteFor(s, material) {
  return material in s.waste ? num(s.waste[material]) : DEFAULT_WASTE;
}

// Pure calculation: state in, results out. No rounding until display.
function calculate(s) {
  const rows = [], openingRows = [], warnings = [];
  const minDeduct = num(s.minDeduct);

  s.facades.forEach((f, fi) => {
    const label = f.name || `Facade ${fi + 1}`;
    const W = num(f.width), H = num(f.height), qty = Math.max(0, num(f.qty));
    if (W <= 0 || H <= 0) warnings.push(`${label}: width and height must be greater than 0.`);

    // Zone coverage check: bands should run 0 → H with no gaps or overlaps.
    const zones = f.zones.map(z => ({ material: (z.material || '').trim() || '(unnamed)', bottom: num(z.bottom), top: num(z.top) }));
    zones.forEach(z => {
      if (z.top <= z.bottom) warnings.push(`${label}: zone "${z.material}" has top ≤ bottom.`);
      if (z.bottom < 0 || z.top > H + 1e-9) warnings.push(`${label}: zone "${z.material}" (${fmt(z.bottom)}–${fmt(z.top)} m) extends outside the facade (0–${fmt(H)} m).`);
    });
    const sorted = [...zones].filter(z => z.top > z.bottom).sort((a, b) => a.bottom - b.bottom);
    let cursor = 0;
    sorted.forEach(z => {
      if (z.bottom > cursor + 1e-9) warnings.push(`${label}: no material between ${fmt(cursor)} and ${fmt(z.bottom)} m.`);
      if (z.bottom < cursor - 1e-9) warnings.push(`${label}: zones overlap between ${fmt(z.bottom)} and ${fmt(Math.min(cursor, z.top))} m.`);
      cursor = Math.max(cursor, z.top);
    });
    if (cursor < H - 1e-9) warnings.push(`${label}: no material between ${fmt(cursor)} and ${fmt(H)} m.`);

    const openings = f.openings.map(o => ({
      type: o.type, width: num(o.width), height: num(o.height), sill: num(o.sill), count: Math.max(0, num(o.count)),
    }));
    openings.forEach((o, oi) => {
      const name = `${label}: ${o.type.toLowerCase()} #${oi + 1}`;
      if (o.width > W + 1e-9) warnings.push(`${name} is wider (${fmt(o.width)} m) than the facade (${fmt(W)} m).`);
      if (o.sill < 0 || o.sill + o.height > H + 1e-9) warnings.push(`${name} (${fmt(o.sill)}–${fmt(o.sill + o.height)} m) extends past the facade height.`);
    });

    // Gross, deduction and net per zone, then merged per material within this facade.
    const byMaterial = new Map();
    zones.forEach(z => {
      const zb = Math.max(0, z.bottom), zt = Math.min(H, z.top);
      const gross = W * Math.max(0, zt - zb);
      let deducted = 0;
      openings.forEach(o => {
        if (o.width * o.height < minDeduct) return;
        deducted += o.width * overlap(o.sill, o.sill + o.height, zb, zt) * o.count;
      });
      const acc = byMaterial.get(z.material) || { gross: 0, deducted: 0 };
      acc.gross += gross; acc.deducted += deducted;
      byMaterial.set(z.material, acc);
    });
    byMaterial.forEach((acc, material) => {
      let net = acc.gross - acc.deducted;
      if (net < -1e-9) {
        warnings.push(`${label}: openings exceed the area of "${material}". Net area set to 0.`);
        net = 0;
      }
      const waste = wasteFor(s, material);
      rows.push({
        facade: label, qty, material,
        gross: acc.gross * qty, deducted: acc.deducted * qty, net: net * qty,
        waste, order: net * qty * (1 + waste / 100),
      });
    });

    // Opening areas by type (Decision 1), whether or not they were deducted.
    OPENING_TYPES.forEach(type => {
      const ofType = openings.filter(o => o.type === type);
      if (!ofType.length) return;
      const count = ofType.reduce((t, o) => t + o.count, 0) * qty;
      const area = ofType.reduce((t, o) => t + o.width * o.height * o.count, 0) * qty;
      const notDeducted = ofType.filter(o => o.width * o.height < minDeduct).reduce((t, o) => t + o.count, 0) * qty;
      openingRows.push({ facade: label, type, count, area, notDeducted });
    });
  });

  const materialTotals = new Map();
  rows.forEach(r => {
    const t = materialTotals.get(r.material) || { gross: 0, deducted: 0, net: 0, order: 0, waste: r.waste };
    t.gross += r.gross; t.deducted += r.deducted; t.net += r.net; t.order += r.order;
    materialTotals.set(r.material, t);
  });
  const total = rows.reduce((t, r) => ({
    gross: t.gross + r.gross, deducted: t.deducted + r.deducted, net: t.net + r.net, order: t.order + r.order,
  }), { gross: 0, deducted: 0, net: 0, order: 0 });

  return { rows, openingRows, materialTotals, total, warnings };
}

if (typeof module !== 'undefined') {
  module.exports = { DEFAULT_WASTE, OPENING_TYPES, num, fmt, overlap, materialsInUse, wasteFor, calculate };
}
