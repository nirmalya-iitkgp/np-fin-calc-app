// Equity Valuation & Portfolio Management

export function gordonGrowthModel(dividend: number, growthRate: number, requiredReturn: number): number {
  if (requiredReturn <= growthRate) return Infinity;
  return dividend / (requiredReturn - growthRate);
}

export function capm(riskFreeRate: number, beta: number, marketReturn: number): number {
  return riskFreeRate + beta * (marketReturn - riskFreeRate);
}

export function sharpeRatio(portfolioReturn: number, riskFreeRate: number, stdDev: number): number {
  return (portfolioReturn - riskFreeRate) / stdDev;
}

export function dividendDiscountModel(dividends: number[], requiredReturn: number, terminalGrowth: number): number {
  const n = dividends.length;
  let pvDividends = 0;
  for (let t = 0; t < n; t++) {
    pvDividends += dividends[t] / Math.pow(1 + requiredReturn, t + 1);
  }
  const terminalValue = (dividends[n - 1] * (1 + terminalGrowth)) / (requiredReturn - terminalGrowth);
  const pvTerminal = terminalValue / Math.pow(1 + requiredReturn, n);
  return pvDividends + pvTerminal;
}

export function wacc(
  equityWeight: number, costOfEquity: number,
  debtWeight: number, costOfDebt: number, taxRate: number
): number {
  return equityWeight * costOfEquity + debtWeight * costOfDebt * (1 - taxRate);
}
