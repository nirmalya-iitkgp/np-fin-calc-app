// Operations Finance calculations

import { normInv } from './private-credit';

export function eoq(annualDemand: number, orderingCost: number, holdingCost: number) {
  const q = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
  const totalCost = (annualDemand / q) * orderingCost + (q / 2) * holdingCost;
  return { eoq: q, totalAnnualCost: totalCost };
}

export function reorderPoint(
  dailyDemand: number, leadTimeDays: number, serviceLevel: number, stdDevDailyDemand = 0
) {
  const demandDuringLT = dailyDemand * leadTimeDays;
  let safetyStock = 0;
  if (stdDevDailyDemand > 0 && serviceLevel > 0.5) {
    const z = normInv(serviceLevel);
    const stdLT = Math.sqrt(leadTimeDays) * stdDevDailyDemand;
    safetyStock = z * stdLT;
  }
  return { reorderPoint: demandDuringLT + safetyStock, safetyStock };
}

export function newsvendor(
  costUnderstock: number, costOverstock: number,
  demandType: 'normal' | 'uniform',
  params: { mean?: number; stdDev?: number; min?: number; max?: number }
) {
  const cr = costUnderstock / (costUnderstock + costOverstock);
  let optimalQty = 0;

  if (demandType === 'normal') {
    const { mean = 0, stdDev = 0 } = params;
    if (stdDev === 0) {
      optimalQty = mean;
    } else {
      optimalQty = mean + stdDev * normInv(cr);
    }
  } else {
    const { min: minD = 0, max: maxD = 0 } = params;
    optimalQty = minD + cr * (maxD - minD);
  }

  return { criticalRatio: cr, optimalQuantity: optimalQty };
}
