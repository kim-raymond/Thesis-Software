const fs = require('fs');
const path = require('path');
const { RandomForestClassifier } = require('random-forest');

const DATA_PATH = path.join(__dirname, '..', 'src', 'data', 'recordedData_augmented.json');
const OUTPUT_DIR = path.join(__dirname, '..', 'test_output_augmented');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const trainingData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

function randn_bm() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function meanStd(values) {
  const n = values.length || 1;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / Math.max(1, n - 1);
  return { mean, std: Math.sqrt(variance || 1) };
}

// Group training data by zone
const zones = {};
for (const rec of trainingData) {
  const zid = Number(rec.zoneId);
  if (!zones[zid]) zones[zid] = { samples: [], zoneName: rec.zoneName };
  zones[zid].samples.push(rec);
}

// Compute per-zone stats for features we will synthesize
const zoneStats = {};
for (const zid of Object.keys(zones)) {
  const samples = zones[zid].samples;
  const get = (k) => samples.map(s => Number(s[k] ?? 0));
  zoneStats[zid] = {
    r1: meanStd(get('r1')),
    r2: meanStd(get('r2')),
    r3: meanStd(get('r3')),
    rawR1: meanStd(get('rawR1')),
    rawR2: meanStd(get('rawR2')),
    rawR3: meanStd(get('rawR3')),
    d1: meanStd(get('distance1')),
    d2: meanStd(get('distance2')),
    d3: meanStd(get('distance3')),
  };
}

// Build training features & labels (same 12 features as LocalizationModel)
const features = [];
const labels = [];
for (const rec of trainingData) {
  const r1 = Number(rec.r1);
  const r2 = Number(rec.r2);
  const r3 = Number(rec.r3);
  const rawR1 = Number(rec.rawR1 ?? rec.r1);
  const rawR2 = Number(rec.rawR2 ?? rec.r2);
  const rawR3 = Number(rec.rawR3 ?? rec.r3);
  const d1 = Number(rec.distance1 ?? rec.distance ?? 0);
  const d2 = Number(rec.distance2 ?? rec.distance ?? 0);
  const d3 = Number(rec.distance3 ?? rec.distance ?? 0);
  const diff_r3_r2 = r3 - r2;
  const diff_r2_r1 = r2 - r1;
  const diff_r1_r3 = r1 - r3;
  features.push([r1, r2, r3, rawR1, rawR2, rawR3, d1, d2, d3, diff_r3_r2, diff_r2_r1, diff_r1_r3]);
  labels.push(Number(rec.zoneId));
}

if (features.length === 0) {
  console.error('No training samples found.');
  process.exit(1);
}

console.log(`Training on ${features.length} samples across ${Object.keys(zones).length} zones.`);

const rf = new RandomForestClassifier({ nEstimators: 100 });
rf.train(features, labels);

// Generate synthetic tests: 20 per zone
const TESTS_PER_ZONE = 20;
const syntheticTests = [];
for (const zid of Object.keys(zoneStats)) {
  const stats = zoneStats[zid];
  for (let i = 0; i < TESTS_PER_ZONE; i++) {
    const sampleR1 = Math.round(stats.r1.mean + Math.max(1, stats.r1.std) * randn_bm());
    const sampleR2 = Math.round(stats.r2.mean + Math.max(1, stats.r2.std) * randn_bm());
    const sampleR3 = Math.round(stats.r3.mean + Math.max(1, stats.r3.std) * randn_bm());
    const sampleRawR1 = Math.round(stats.rawR1.mean + Math.max(1, stats.rawR1.std) * randn_bm());
    const sampleRawR2 = Math.round(stats.rawR2.mean + Math.max(1, stats.rawR2.std) * randn_bm());
    const sampleRawR3 = Math.round(stats.rawR3.mean + Math.max(1, stats.rawR3.std) * randn_bm());
    const sampleD1 = Number((stats.d1.mean + Math.max(0.01, stats.d1.std) * randn_bm()).toFixed(2));
    const sampleD2 = Number((stats.d2.mean + Math.max(0.01, stats.d2.std) * randn_bm()).toFixed(2));
    const sampleD3 = Number((stats.d3.mean + Math.max(0.01, stats.d3.std) * randn_bm()).toFixed(2));

    const diff_r3_r2 = sampleR3 - sampleR2;
    const diff_r2_r1 = sampleR2 - sampleR1;
    const diff_r1_r3 = sampleR1 - sampleR3;

    const feature = [sampleR1, sampleR2, sampleR3, sampleRawR1, sampleRawR2, sampleRawR3, sampleD1, sampleD2, sampleD3, diff_r3_r2, diff_r2_r1, diff_r1_r3];

    syntheticTests.push({ zoneId: Number(zid), feature, sample: { r1: sampleR1, r2: sampleR2, r3: sampleR3, rawR1: sampleRawR1, rawR2: sampleRawR2, rawR3: sampleRawR3, d1: sampleD1, d2: sampleD2, d3: sampleD3 } });
  }
}

// Perform predictions and build confusion matrix
const zoneIds = Object.keys(zones).map(k => Number(k)).sort((a,b)=>a-b);
const idToIndex = {};
zoneIds.forEach((id, idx) => idToIndex[id] = idx);

const matrix = Array(zoneIds.length).fill(0).map(()=>Array(zoneIds.length).fill(0));
const results = [];

for (const test of syntheticTests) {
  const pred = rf.predict([test.feature]);
  const predictedId = Number(pred[0]);
  const trueId = test.zoneId;
  const pi = idToIndex[predictedId] ?? -1;
  const ti = idToIndex[trueId];
  if (pi >= 0) matrix[ti][pi] += 1;
  results.push({ trueId, predictedId, sample: test.sample });
}

// Compute per-zone accuracy
const perZone = {};
for (let i=0;i<zoneIds.length;i++) {
  const zid = zoneIds[i];
  const row = matrix[i];
  const total = row.reduce((a,b)=>a+b,0);
  const correct = row[i] || 0;
  const accuracy = total === 0 ? 0 : correct / total;
  perZone[zid] = { zoneId: zid, totalTests: total, correct, accuracy };
}

// Save outputs
fs.writeFileSync(path.join(OUTPUT_DIR, 'synthetic_test_results_augmented.json'), JSON.stringify(results, null, 2));
fs.writeFileSync(path.join(OUTPUT_DIR, 'confusion_matrix_augmented.csv'), ['true\\pred', ...zoneIds].join(',') + '\n' + matrix.map((row, idx) => [zoneIds[idx], ...row].join(',')).join('\n'));
fs.writeFileSync(path.join(OUTPUT_DIR, 'per_zone_accuracy.json'), JSON.stringify(perZone, null, 2));

// Print summary
console.log('Per-zone accuracy:');
let totalCorrect = 0, totalTests = 0;
for (const zid of Object.keys(perZone)) {
  const p = perZone[zid];
  totalCorrect += p.correct; totalTests += p.totalTests;
  console.log(`  Zone ${zid}: ${ (p.accuracy*100).toFixed(1) }% (${p.correct}/${p.totalTests})`);
}
console.log(`Overall accuracy: ${ (totalTests===0?0:(totalCorrect/totalTests*100)).toFixed(1) }% (${totalCorrect}/${totalTests})`);
console.log(`Wrote outputs to ${OUTPUT_DIR}`);
