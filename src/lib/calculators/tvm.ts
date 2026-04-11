// Time Value of Money calculations

export function futureValue(pv: number, rate: number, periods: number): number {
  return pv * Math.pow(1 + rate, periods);
}

export function presentValue(fv: number, rate: number, periods: number): number {
  return fv / Math.pow(1 + rate, periods);
}

export function futureValueAnnuity(pmt: number, rate: number, periods: number, isDue = false): number {
  if (rate === 0) return pmt * periods;
  const fva = pmt * ((Math.pow(1 + rate, periods) - 1) / rate);
  return isDue ? fva * (1 + rate) : fva;
}

export function presentValueAnnuity(pmt: number, rate: number, periods: number, isDue = false): number {
  if (rate === 0) return pmt * periods;
  const pva = pmt * ((1 - Math.pow(1 + rate, -periods)) / rate);
  return isDue ? pva * (1 + rate) : pva;
}

export function loanPayment(principal: number, rate: number, periods: number): number {
  if (rate === 0) return principal / periods;
  return principal * (rate * Math.pow(1 + rate, periods)) / (Math.pow(1 + rate, periods) - 1);
}

export function aprToEar(apr: number, compoundingPeriods: number): number {
  return Math.pow(1 + apr / compoundingPeriods, compoundingPeriods) - 1;
}

export function earToApr(ear: number, compoundingPeriods: number): number {
  return compoundingPeriods * (Math.pow(1 + ear, 1 / compoundingPeriods) - 1);
}
