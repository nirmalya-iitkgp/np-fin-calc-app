// Yield Curve Models

export function nelsonSiegelYield(m: number, beta0: number, beta1: number, beta2: number, tau: number): number {
  if (m === 0) return beta0 + beta1;
  const mTau = m / tau;
  const expTerm = Math.exp(-mTau);
  const factor = (1 - expTerm) / mTau;
  return beta0 + beta1 * factor + beta2 * (factor - expTerm);
}

export function svenssonYield(
  m: number, beta0: number, beta1: number, beta2: number, beta3: number, tau1: number, tau2: number
): number {
  if (m === 0) return beta0 + beta1;
  const mTau1 = m / tau1;
  const mTau2 = m / tau2;
  const exp1 = Math.exp(-mTau1);
  const exp2 = Math.exp(-mTau2);
  const factor1 = (1 - exp1) / mTau1;
  const factor2 = (1 - exp2) / mTau2;
  return beta0 + beta1 * factor1 + beta2 * (factor1 - exp1) + beta3 * (factor2 - exp2);
}

export function bootstrapSpotRates(
  parYields: number[], maturities: number[]
): number[] {
  const spotRates: number[] = [];
  for (let i = 0; i < maturities.length; i++) {
    if (i === 0) {
      spotRates.push(parYields[i]);
      continue;
    }
    const coupon = parYields[i];
    let pvCoupons = 0;
    for (let j = 0; j < i; j++) {
      pvCoupons += coupon / Math.pow(1 + spotRates[j], maturities[j]);
    }
    const remaining = (1 + coupon) - pvCoupons;
    const spotRate = Math.pow((1 + coupon) / remaining, 1 / maturities[i]) - 1;
    spotRates.push(spotRate);
  }
  return spotRates;
}

export function forwardRate(spotRate1: number, t1: number, spotRate2: number, t2: number): number {
  const factor1 = Math.pow(1 + spotRate1, t1);
  const factor2 = Math.pow(1 + spotRate2, t2);
  return Math.pow(factor2 / factor1, 1 / (t2 - t1)) - 1;
}
