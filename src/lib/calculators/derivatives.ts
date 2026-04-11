// Derivatives & Options calculations

// Standard normal CDF approximation
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

function d1d2(S: number, K: number, r: number, T: number, sigma: number) {
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  return { d1, d2 };
}

export function blackScholesCall(S: number, K: number, r: number, T: number, sigma: number): number {
  const { d1, d2 } = d1d2(S, K, r, T, sigma);
  return S * normCDF(d1) - K * Math.exp(-r * T) * normCDF(d2);
}

export function blackScholesPut(S: number, K: number, r: number, T: number, sigma: number): number {
  const { d1, d2 } = d1d2(S, K, r, T, sigma);
  return K * Math.exp(-r * T) * normCDF(-d2) - S * normCDF(-d1);
}

export function greeks(S: number, K: number, r: number, T: number, sigma: number) {
  const { d1, d2 } = d1d2(S, K, r, T, sigma);
  const sqrtT = Math.sqrt(T);
  return {
    callDelta: normCDF(d1),
    putDelta: normCDF(d1) - 1,
    gamma: normPDF(d1) / (S * sigma * sqrtT),
    vega: S * normPDF(d1) * sqrtT / 100,
    callTheta: (-(S * normPDF(d1) * sigma) / (2 * sqrtT) - r * K * Math.exp(-r * T) * normCDF(d2)) / 365,
    putTheta: (-(S * normPDF(d1) * sigma) / (2 * sqrtT) + r * K * Math.exp(-r * T) * normCDF(-d2)) / 365,
    callRho: K * T * Math.exp(-r * T) * normCDF(d2) / 100,
    putRho: -K * T * Math.exp(-r * T) * normCDF(-d2) / 100,
  };
}

export function futuresPrice(spot: number, riskFreeRate: number, time: number, storageCost = 0, convYield = 0): number {
  return spot * Math.exp((riskFreeRate + storageCost - convYield) * time);
}
