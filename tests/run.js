// Eval runner: checks calc.js against hand-calculated cases in tests/cases.json.
// Usage: node tests/run.js
const path = require('path');
const { calculate } = require(path.join(__dirname, '..', 'calc.js'));
const { tolerance_percent: tol, cases } = require('./cases.json');

let checks = 0, failures = 0;
const pctDiff = (got, want) => want === 0 ? Math.abs(got) * 100 : Math.abs(got - want) / Math.abs(want) * 100;

for (const c of cases) {
  const r = calculate(c.input);
  const lines = [];
  for (const [material, want] of Object.entries(c.expected)) {
    const got = r.materialTotals.get(material);
    for (const field of ['net', 'order']) {
      checks++;
      const value = got ? got[field] : NaN;
      const diff = got ? pctDiff(value, want[field]) : Infinity;
      const ok = diff <= tol;
      if (!ok) failures++;
      lines.push(`  ${ok ? 'PASS' : 'FAIL'}  ${material} ${field}: expected ${want[field].toFixed(2)}, got ${Number.isFinite(value) ? value.toFixed(2) : 'missing'} (${Number.isFinite(diff) ? diff.toFixed(3) : '∞'}% off)`);
    }
  }
  for (const [type, want] of Object.entries(c.expected_not_deducted || {})) {
    checks++;
    const got = r.openingRows.filter(o => o.type === type).reduce((t, o) => t + o.notDeducted, 0);
    const ok = got === want;
    if (!ok) failures++;
    lines.push(`  ${ok ? 'PASS' : 'FAIL'}  ${type} openings not deducted: expected ${want}, got ${got}`);
  }
  if (r.warnings.length) lines.push(`  note  warnings: ${r.warnings.join(' | ')}`);
  console.log(c.name);
  console.log(lines.join('\n'));
}

console.log(`\n${checks - failures}/${checks} checks passed (tolerance ${tol}%).`);
process.exit(failures ? 1 : 0);
