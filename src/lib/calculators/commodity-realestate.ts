// Commodity & Real Estate Finance calculations

export function commodityFuturesPrice(
  S: number, T: number, r: number, storageCost = 0, convenienceYield = 0
): number {
  return S * Math.exp((r + storageCost - convenienceYield) * T);
}

export function schwartzSmithFuturesPrice(
  S: number, Z: number, T: number, r: number,
  kappa: number, sigmaX: number, sigmaZ: number, rho: number
): number {
  const currentX = Math.log(S) - Z;
  const expectedXT = currentX * Math.exp(-kappa * T);
  const expectedZT = Z + r * T;
  const expectedLogST = expectedXT + expectedZT;

  const varXT = (sigmaX ** 2 / (2 * kappa)) * (1 - Math.exp(-2 * kappa * T));
  const varZT = sigmaZ ** 2 * T;
  const covXZ = (rho * sigmaX * sigmaZ / kappa) * (1 - Math.exp(-kappa * T));
  const totalVar = varXT + varZT + 2 * covXZ;

  return Math.exp(expectedLogST + 0.5 * totalVar);
}

export function realEstateTerminalValue(
  noi: number, exitCapRate: number, growthRate: number
): number {
  if (exitCapRate <= growthRate) throw new Error("Exit cap rate must exceed growth rate");
  return noi / (exitCapRate - growthRate);
}
