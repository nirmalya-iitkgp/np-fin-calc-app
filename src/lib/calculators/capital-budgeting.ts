// Capital Budgeting calculations

export function npv(rate: number, cashFlows: number[]): number {
  return cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t), 0);
}

export function irr(cashFlows: number[], guess = 0.1, maxIter = 1000, tol = 1e-7): number | null {
  let rate = guess;
  for (let i = 0; i < maxIter; i++) {
    let fVal = 0, fDeriv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      fVal += cashFlows[t] / Math.pow(1 + rate, t);
      fDeriv += -t * cashFlows[t] / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(fDeriv) < 1e-14) return null;
    const newRate = rate - fVal / fDeriv;
    if (Math.abs(newRate - rate) < tol) return newRate;
    rate = newRate;
  }
  return null;
}

export function paybackPeriod(initialInvestment: number, cashFlows: number[]): number | null {
  let cumulative = -initialInvestment;
  for (let t = 0; t < cashFlows.length; t++) {
    cumulative += cashFlows[t];
    if (cumulative >= 0) {
      const prev = cumulative - cashFlows[t];
      return t + Math.abs(prev) / cashFlows[t];
    }
  }
  return null;
}

export function discountedPaybackPeriod(initialInvestment: number, cashFlows: number[], rate: number): number | null {
  let cumulative = -initialInvestment;
  for (let t = 0; t < cashFlows.length; t++) {
    const dcf = cashFlows[t] / Math.pow(1 + rate, t + 1);
    cumulative += dcf;
    if (cumulative >= 0) {
      const prev = cumulative - dcf;
      return t + Math.abs(prev) / dcf;
    }
  }
  return null;
}

export function profitabilityIndex(rate: number, initialInvestment: number, cashFlows: number[]): number {
  const pvCashFlows = cashFlows.reduce((acc, cf, t) => acc + cf / Math.pow(1 + rate, t + 1), 0);
  return pvCashFlows / initialInvestment;
}
