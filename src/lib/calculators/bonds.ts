// Fixed Income / Bond calculations

export function bondPrice(
  faceValue: number, couponRate: number, ytm: number, periods: number, frequency = 2
): number {
  const c = (couponRate * faceValue) / frequency;
  const r = ytm / frequency;
  const n = periods * frequency;
  if (r === 0) return c * n + faceValue;
  const pvCoupons = c * ((1 - Math.pow(1 + r, -n)) / r);
  const pvFace = faceValue / Math.pow(1 + r, n);
  return pvCoupons + pvFace;
}

export function zeroCouponBondPrice(faceValue: number, ytm: number, periods: number): number {
  return faceValue / Math.pow(1 + ytm, periods);
}

export function currentYield(couponRate: number, faceValue: number, marketPrice: number): number {
  return (couponRate * faceValue) / marketPrice;
}

export function macaulayDuration(
  faceValue: number, couponRate: number, ytm: number, periods: number, frequency = 2
): number {
  const c = (couponRate * faceValue) / frequency;
  const r = ytm / frequency;
  const n = periods * frequency;
  const price = bondPrice(faceValue, couponRate, ytm, periods, frequency);
  
  let weightedSum = 0;
  for (let t = 1; t <= n; t++) {
    const cf = t === n ? c + faceValue : c;
    weightedSum += (t / frequency) * cf / Math.pow(1 + r, t);
  }
  return weightedSum / price;
}

export function modifiedDuration(
  faceValue: number, couponRate: number, ytm: number, periods: number, frequency = 2
): number {
  const macD = macaulayDuration(faceValue, couponRate, ytm, periods, frequency);
  return macD / (1 + ytm / frequency);
}

export function convexity(
  faceValue: number, couponRate: number, ytm: number, periods: number, frequency = 2
): number {
  const c = (couponRate * faceValue) / frequency;
  const r = ytm / frequency;
  const n = periods * frequency;
  const price = bondPrice(faceValue, couponRate, ytm, periods, frequency);
  
  let sum = 0;
  for (let t = 1; t <= n; t++) {
    const cf = t === n ? c + faceValue : c;
    sum += (t * (t + 1) * cf) / Math.pow(1 + r, t + 2);
  }
  return sum / (price * frequency * frequency);
}
