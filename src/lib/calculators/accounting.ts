// Financial Accounting calculations

export interface IncomeStatement {
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  interestExpense: number;
  ebt: number;
  taxExpense: number;
  netIncome: number;
}

export function generateIncomeStatement(
  revenue: number, cogsPct: number, opexPct: number,
  interestExpense: number, taxRate: number
): IncomeStatement {
  const cogs = revenue * cogsPct;
  const grossProfit = revenue - cogs;
  const operatingExpenses = revenue * opexPct;
  const operatingIncome = grossProfit - operatingExpenses;
  const ebt = operatingIncome - interestExpense;
  const taxExpense = Math.max(0, ebt * taxRate);
  const netIncome = ebt - taxExpense;

  return { revenue, cogs, grossProfit, operatingExpenses, operatingIncome, interestExpense, ebt, taxExpense, netIncome };
}

export interface BalanceSheet {
  totalAssets: number;
  currentAssets: number;
  fixedAssets: number;
  totalLiabilities: number;
  currentLiabilities: number;
  longTermDebt: number;
  equity: number;
}

export function generateBalanceSheet(
  cash: number, receivables: number, inventory: number,
  fixedAssets: number, currentLiabilities: number, longTermDebt: number
): BalanceSheet {
  const currentAssets = cash + receivables + inventory;
  const totalAssets = currentAssets + fixedAssets;
  const totalLiabilities = currentLiabilities + longTermDebt;
  const equity = totalAssets - totalLiabilities;

  return { totalAssets, currentAssets, fixedAssets, totalLiabilities, currentLiabilities, longTermDebt, equity };
}

export function financialRatios(income: IncomeStatement, balance: BalanceSheet) {
  return {
    grossMargin: income.grossProfit / income.revenue,
    operatingMargin: income.operatingIncome / income.revenue,
    netMargin: income.netIncome / income.revenue,
    currentRatio: balance.currentAssets / (balance.currentLiabilities || 1),
    debtToEquity: balance.totalLiabilities / (balance.equity || 1),
    roe: income.netIncome / (balance.equity || 1),
    roa: income.netIncome / (balance.totalAssets || 1),
  };
}
