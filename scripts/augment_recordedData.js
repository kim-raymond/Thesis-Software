const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'recordedData.json');
const OUT_FILE = path.join(__dirname, '..', 'src', 'data', 'recordedData_augmented.json');

function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function meanStd(arr) {
  const n = arr.length || 1;
  const mean = arr.reduce((a,b)=>a+b,0)/n;
  const std = Math.sqrt(arr.reduce((a,b)=>a+Math.pow(b-mean,2),0)/Math.max(1,n-1) || 1);
  return { mean, std };
}

const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

// group by zoneId
const zones = {};
for (const r of raw) {
  const id = Number(r.zoneId);
  if (!zones[id]) zones[id] = { name: r.zoneName, samples: [] };
  zones[id].samples.push(r);
}

const stats = {};
for (const id of Object.keys(zones)) {
  const s = zones[id].samples;
  stats[id] = {
    r1: meanStd(s.map(x=>Number(x.r1))),
    r2: meanStd(s.map(x=>Number(x.r2))),
    r3: meanStd(s.map(x=>Number(x.r3))),
    rawR1: meanStd(s.map(x=>Number(x.rawR1 ?? x.r1))),
    rawR2: meanStd(s.map(x=>Number(x.rawR2 ?? x.r2))),
    rawR3: meanStd(s.map(x=>Number(x.rawR3 ?? x.r3))),
    d1: meanStd(s.map(x=>Number(x.distance1 ?? x.distance ?? 0))),
    d2: meanStd(s.map(x=>Number(x.distance2 ?? x.distance ?? 0))),
    d3: meanStd(s.map(x=>Number(x.distance3 ?? x.distance ?? 0))),
  };
}

const PER_ZONE = 10;
const augmented = raw.slice();
for (const id of Object.keys(stats)) {
  const st = stats[id];
  for (let i=0;i<PER_ZONE;i++) {
    const r1 = Math.round(st.r1.mean + Math.max(1, st.r1.std) * randn());
    const r2 = Math.round(st.r2.mean + Math.max(1, st.r2.std) * randn());
    const r3 = Math.round(st.r3.mean + Math.max(1, st.r3.std) * randn());
    const rawR1 = Math.round(st.rawR1.mean + Math.max(1, st.rawR1.std) * randn());
    const rawR2 = Math.round(st.rawR2.mean + Math.max(1, st.rawR2.std) * randn());
    const rawR3 = Math.round(st.rawR3.mean + Math.max(1, st.rawR3.std) * randn());
    const distance1 = Number((st.d1.mean + Math.max(0.01, st.d1.std) * randn()).toFixed(2));
    const distance2 = Number((st.d2.mean + Math.max(0.01, st.d2.std) * randn()).toFixed(2));
    const distance3 = Number((st.d3.mean + Math.max(0.01, st.d3.std) * randn()).toFixed(2));

    const entry = {
      r1, r2, r3,
      rawR1, rawR2, rawR3,
      distance1, distance2, distance3,
      zoneId: Number(id),
      zoneName: zones[id].name,
      timestamp: new Date().toISOString()
    };
    augmented.push(entry);
  }
}

fs.writeFileSync(OUT_FILE, JSON.stringify(augmented, null, 2));
console.log(`Wrote augmented data: ${OUT_FILE} (added ${Object.keys(stats).length * PER_ZONE} samples)`);
