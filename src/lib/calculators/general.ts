// General Financial & Quantitative Tools

export function descriptiveStats(data: number[]) {
  const n = data.length;
  if (n === 0) return null;
  const sorted = [...data].sort((a, b) => a - b);
  const mean = data.reduce((a, b) => a + b, 0) / n;
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
  const variance = data.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (n - 1 || 1);
  const stdDev = Math.sqrt(variance);
  const min = sorted[0];
  const max = sorted[n - 1];

  // Mode
  const freq: Record<number, number> = {};
  let maxFreq = 0;
  data.forEach(v => { freq[v] = (freq[v] || 0) + 1; maxFreq = Math.max(maxFreq, freq[v]); });
  const mode = maxFreq > 1 ? Object.entries(freq).filter(([, f]) => f === maxFreq).map(([v]) => Number(v)) : [];

  return { mean, median, mode, variance, stdDev, min, max, count: n, range: max - min };
}

export function perpetuity(cashFlow: number, rate: number): number {
  return cashFlow / rate;
}

export function growingPerpetuity(cashFlow: number, rate: number, growth: number): number {
  if (rate <= growth) return Infinity;
  return cashFlow / (rate - growth);
}

export function simpleLinearRegression(x: number[], y: number[]) {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const meanY = sumY / n;
  const ssRes = y.reduce((acc, yi, i) => acc + (yi - (slope * x[i] + intercept)) ** 2, 0);
  const ssTot = y.reduce((acc, yi) => acc + (yi - meanY) ** 2, 0);
  const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { slope, intercept, rSquared };
}

export function depreciation(cost: number, salvage: number, life: number, method: 'straight-line' | 'ddb') {
  if (method === 'straight-line') {
    const annual = (cost - salvage) / life;
    return Array.from({ length: life }, (_, i) => ({
      year: i + 1, depreciation: annual, bookValue: cost - annual * (i + 1)
    }));
  }
  // Double declining balance
  const rate = 2 / life;
  const schedule = [];
  let bv = cost;
  for (let i = 0; i < life; i++) {
    const dep = Math.max(Math.min(bv * rate, bv - salvage), 0);
    bv -= dep;
    schedule.push({ year: i + 1, depreciation: dep, bookValue: bv });
  }
  return schedule;
}
