// Private Markets & Credit Risk calculations

// Normal CDF approximation
function normCDF(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1.0 + sign * y);
}

function normPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// Inverse normal CDF (Beasley-Springer-Moro approximation)
function normInv(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  if (p === 0.5) return 0;
  
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
    1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
    6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
    -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];

  const pLow = 0.02425, pHigh = 1 - pLow;
  let q: number, r: number;

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  } else if (p <= pHigh) {
    q = p - 0.5;
    r = q * q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
}

export function illiquidityDiscount(
  assetValue: number, liquidationCostPct: number, holdingPeriod: number,
  volatility: number, riskFreeRate: number, gSpread = 0
) {
  const K = assetValue * (1 - liquidationCostPct);
  const rEff = riskFreeRate + gSpread;
  const sqrtT = Math.sqrt(holdingPeriod);
  const d1 = (Math.log(assetValue / K) + (rEff + 0.5 * volatility ** 2) * holdingPeriod) / (volatility * sqrtT);
  const d2 = d1 - volatility * sqrtT;
  const putValue = K * Math.exp(-rEff * holdingPeriod) * normCDF(-d2) - assetValue * normCDF(-d1);
  return {
    discountValue: putValue,
    discountPct: putValue / assetValue,
    adjustedValue: assetValue - putValue,
  };
}

export function mertonCreditRisk(
  E: number, sigmaE: number, D: number, T: number, r: number
) {
  // Iterative solver for implied V and sigmaV
  let V = E + D;
  let sigmaV = sigmaE;

  for (let iter = 0; iter < 200; iter++) {
    const sqrtT = Math.sqrt(T);
    const d1 = (Math.log(V / D) + (r + 0.5 * sigmaV ** 2) * T) / (sigmaV * sqrtT);
    const d2 = d1 - sigmaV * sqrtT;
    const Nd1 = normCDF(d1);
    const Nd2 = normCDF(d2);

    const eqImplied = V * Nd1 - D * Math.exp(-r * T) * Nd2;
    const sigmaImplied = (V * Nd1 * sigmaV) / E;

    const newV = E + D * Math.exp(-r * T) * Nd2 + (eqImplied - E) * 0.5;
    V = V + (eqImplied - E) * 0.3;
    sigmaV = sigmaV + (sigmaE * E / (V * Nd1) - sigmaV) * 0.3;

    if (Math.abs(eqImplied - E) < 1e-6 && Math.abs(sigmaImplied - sigmaE * E / (V * Nd1)) < 1e-6) break;
  }

  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(V / D) + (r + 0.5 * sigmaV ** 2) * T) / (sigmaV * sqrtT);
  const d2 = d1 - sigmaV * sqrtT;

  return {
    impliedAssetValue: V,
    impliedAssetVolatility: sigmaV,
    distanceToDefault: d2,
    probabilityOfDefault: normCDF(-d2),
  };
}

export function monteCarloPEValuation(
  baseFCFs: number[], discountRateMean: number, discountRateStd: number,
  exitMultipleMean: number, exitMultipleStd: number, numSimulations: number
) {
  // Simple seeded pseudo-random using Box-Muller
  const randNorm = () => {
    const u1 = Math.random(), u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };

  const valuations: number[] = [];
  const n = baseFCFs.length;

  for (let i = 0; i < numSimulations; i++) {
    const dr = Math.max(0.01, discountRateMean + discountRateStd * randNorm());
    const em = Math.max(0, exitMultipleMean + exitMultipleStd * randNorm());

    let pvFCF = 0;
    for (let t = 0; t < n; t++) {
      pvFCF += baseFCFs[t] / Math.pow(1 + dr, t + 1);
    }
    const tv = baseFCFs[n - 1] * em;
    const pvTV = tv / Math.pow(1 + dr, n);
    valuations.push(pvFCF + pvTV);
  }

  valuations.sort((a, b) => a - b);
  const mean = valuations.reduce((a, b) => a + b, 0) / numSimulations;
  const median = valuations[Math.floor(numSimulations / 2)];
  const p5 = valuations[Math.floor(numSimulations * 0.05)];
  const p25 = valuations[Math.floor(numSimulations * 0.25)];
  const p75 = valuations[Math.floor(numSimulations * 0.75)];
  const p95 = valuations[Math.floor(numSimulations * 0.95)];

  return { mean, median, p5, p25, p75, p95 };
}

export { normCDF, normPDF, normInv };
