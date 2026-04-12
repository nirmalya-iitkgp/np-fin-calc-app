import React, { useState } from "react";
import { CalculatorForm } from "../components/CalculatorForm";
import type { Result } from "../components/CalculatorForm";
import { useCalculationStore, type CalculationRecord } from "../hooks/use-calculation-store";
import { exportToCSV, exportToPDF } from "../lib/export-utils";
import * as tvm from "../lib/calculators/tvm";
import * as bonds from "../lib/calculators/bonds";
import * as deriv from "../lib/calculators/derivatives";
import * as capBudget from "../lib/calculators/capital-budgeting";
import * as equity from "../lib/calculators/equity";
import * as general from "../lib/calculators/general";
import * as commRE from "../lib/calculators/commodity-realestate";
import * as privCredit from "../lib/calculators/private-credit";
import * as yieldCurve from "../lib/calculators/yield-curve";
import * as queuing from "../lib/calculators/queuing";
import * as ops from "../lib/calculators/operations";
import * as accounting from "../lib/calculators/accounting";
import { getFormulaDoc } from "../lib/formula-docs";
import {
  FVGrowthChart, FVAnnuityChart, LoanAmortizationChart, NPVCashFlowChart,
  BSMPayoffChart, YieldCurveChart, SpotRatesChart, DepreciationChart,
  IncomeStatementChart, MonteCarloChart
} from "../components/ResultCharts";
import {
  Calculator as CalcIcon, TrendingUp, BarChart3, PieChart, Landmark, Activity,
  ChevronRight, Menu, X, Warehouse, ShieldAlert, GitBranch,
  Users, Settings, FileSpreadsheet, History, Star, Trash2, Download, FileText
} from "lucide-react";

const fmt = (v: number, decimals = 4) => Number(v.toFixed(decimals));
const pct = (v: number) => `${(v * 100).toFixed(4)}%`;

type Module = {
  id: string;
  label: string;
  icon: React.ReactNode;
  subCalcs: { id: string; label: string }[];
};

const modules: Module[] = [
  {
    id: "tvm", label: "Time Value of Money", icon: <CalcIcon size={18} />,
    subCalcs: [
      { id: "fv", label: "Future Value" },
      { id: "pv", label: "Present Value" },
      { id: "fv-annuity", label: "FV of Annuity" },
      { id: "pv-annuity", label: "PV of Annuity" },
      { id: "loan", label: "Loan Payment" },
      { id: "apr-ear", label: "APR ↔ EAR" },
    ],
  },
  {
    id: "bonds", label: "Fixed Income", icon: <Landmark size={18} />,
    subCalcs: [
      { id: "bond-price", label: "Bond Price" },
      { id: "zero-coupon", label: "Zero-Coupon Bond" },
      { id: "current-yield", label: "Current Yield" },
      { id: "duration", label: "Duration & Convexity" },
    ],
  },
  {
    id: "derivatives", label: "Derivatives", icon: <Activity size={18} />,
    subCalcs: [
      { id: "bsm", label: "Black-Scholes" },
      { id: "greeks", label: "Option Greeks" },
      { id: "futures", label: "Futures Price" },
    ],
  },
  {
    id: "capital", label: "Capital Budgeting", icon: <BarChart3 size={18} />,
    subCalcs: [
      { id: "npv", label: "NPV" },
      { id: "irr", label: "IRR" },
      { id: "payback", label: "Payback Period" },
      { id: "pi", label: "Profitability Index" },
    ],
  },
  {
    id: "equity", label: "Equity & Portfolio", icon: <TrendingUp size={18} />,
    subCalcs: [
      { id: "ggm", label: "Gordon Growth Model" },
      { id: "capm", label: "CAPM" },
      { id: "sharpe", label: "Sharpe Ratio" },
      { id: "wacc", label: "WACC" },
    ],
  },
  {
    id: "commodity", label: "Commodity & Real Estate", icon: <Warehouse size={18} />,
    subCalcs: [
      { id: "comm-futures", label: "Commodity Futures" },
      { id: "schwartz-smith", label: "Schwartz-Smith Model" },
      { id: "re-terminal", label: "RE Terminal Value" },
    ],
  },
  {
    id: "private", label: "Private Mkts & Credit", icon: <ShieldAlert size={18} />,
    subCalcs: [
      { id: "illiquidity", label: "Illiquidity Discount" },
      { id: "merton", label: "Merton Credit Risk" },
      { id: "mc-pe", label: "Monte Carlo PE" },
    ],
  },
  {
    id: "yieldcurve", label: "Yield Curve Models", icon: <GitBranch size={18} />,
    subCalcs: [
      { id: "nelson-siegel", label: "Nelson-Siegel" },
      { id: "svensson", label: "Svensson" },
      { id: "forward-rate", label: "Forward Rate" },
      { id: "bootstrap", label: "Bootstrap Spot Rates" },
    ],
  },
  {
    id: "queuing", label: "Queuing Theory", icon: <Users size={18} />,
    subCalcs: [
      { id: "mm1", label: "M/M/1 Queue" },
      { id: "mmc", label: "M/M/c Queue" },
    ],
  },
  {
    id: "operations", label: "Operations Finance", icon: <Settings size={18} />,
    subCalcs: [
      { id: "eoq", label: "EOQ" },
      { id: "rop", label: "Reorder Point" },
      { id: "newsvendor", label: "Newsvendor Model" },
    ],
  },
  {
    id: "accounting", label: "Financial Accounting", icon: <FileSpreadsheet size={18} />,
    subCalcs: [
      { id: "income-stmt", label: "Income Statement" },
      { id: "balance-sheet", label: "Balance Sheet" },
      { id: "ratios", label: "Financial Ratios" },
    ],
  },
  {
    id: "general", label: "General Tools", icon: <PieChart size={18} />,
    subCalcs: [
      { id: "stats", label: "Descriptive Statistics" },
      { id: "perpetuity", label: "Perpetuity" },
      { id: "depreciation", label: "Depreciation" },
    ],
  },
];

function getCalcContent(moduleId: string, subId: string, onSaveResult?: (inputs: Record<string, string>, results: Result[]) => void) {
  const v = (vals: Record<string, string>, key: string) => {
    const n = parseFloat(vals[key]);
    if (isNaN(n)) throw new Error(`Invalid input: ${key}`);
    return n;
  };
  const formulaDoc = getFormulaDoc(moduleId, subId);

  // ─── TVM ───
  if (moduleId === "tvm" && subId === "fv") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Future Value" description="Calculate the future value of a present sum."
      fields={[
        { key: "pv", label: "Present Value ($)", placeholder: "1000" },
        { key: "rate", label: "Interest Rate (decimal)", placeholder: "0.05" },
        { key: "periods", label: "Number of Periods", placeholder: "10" },
      ]}
      onCalculate={vals => [{ label: "Future Value", value: fmt(tvm.futureValue(v(vals,"pv"), v(vals,"rate"), v(vals,"periods")), 2), highlight: true }]}
      renderChart={(vals) => {
        const pv = parseFloat(vals.pv), rate = parseFloat(vals.rate), periods = parseFloat(vals.periods);
        if ([pv, rate, periods].some(isNaN)) return null;
        return <FVGrowthChart pv={pv} rate={rate} periods={periods} />;
      }}
    />
  );
  if (moduleId === "tvm" && subId === "pv") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Present Value" description="Calculate the present value of a future sum."
      fields={[
        { key: "fv", label: "Future Value ($)", placeholder: "1500" },
        { key: "rate", label: "Discount Rate (decimal)", placeholder: "0.05" },
        { key: "periods", label: "Number of Periods", placeholder: "10" },
      ]}
      onCalculate={vals => [{ label: "Present Value", value: fmt(tvm.presentValue(v(vals,"fv"), v(vals,"rate"), v(vals,"periods")), 2), highlight: true }]}
    />
  );
  if (moduleId === "tvm" && subId === "fv-annuity") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Future Value of Annuity" description="Calculate FV of a series of equal payments."
      fields={[
        { key: "pmt", label: "Payment ($)", placeholder: "200" },
        { key: "rate", label: "Interest Rate (decimal)", placeholder: "0.05" },
        { key: "periods", label: "Number of Periods", placeholder: "10" },
        { key: "type", label: "Annuity Type", type: "select", options: [{ label: "Ordinary", value: "0" }, { label: "Annuity Due", value: "1" }], defaultValue: "0" },
      ]}
      onCalculate={vals => [{ label: "Future Value", value: fmt(tvm.futureValueAnnuity(v(vals,"pmt"), v(vals,"rate"), v(vals,"periods"), vals.type === "1"), 2), highlight: true }]}
      renderChart={(vals) => {
        const pmt = parseFloat(vals.pmt), rate = parseFloat(vals.rate), periods = parseFloat(vals.periods);
        if ([pmt, rate, periods].some(isNaN)) return null;
        return <FVAnnuityChart pmt={pmt} rate={rate} periods={periods} isDue={vals.type === "1"} />;
      }}
    />
  );
  if (moduleId === "tvm" && subId === "pv-annuity") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Present Value of Annuity" description="Calculate PV of a series of equal payments."
      fields={[
        { key: "pmt", label: "Payment ($)", placeholder: "200" },
        { key: "rate", label: "Discount Rate (decimal)", placeholder: "0.05" },
        { key: "periods", label: "Number of Periods", placeholder: "10" },
        { key: "type", label: "Annuity Type", type: "select", options: [{ label: "Ordinary", value: "0" }, { label: "Annuity Due", value: "1" }], defaultValue: "0" },
      ]}
      onCalculate={vals => [{ label: "Present Value", value: fmt(tvm.presentValueAnnuity(v(vals,"pmt"), v(vals,"rate"), v(vals,"periods"), vals.type === "1"), 2), highlight: true }]}
    />
  );
  if (moduleId === "tvm" && subId === "loan") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Loan Payment" description="Calculate periodic loan payment."
      fields={[
        { key: "principal", label: "Loan Principal ($)", placeholder: "100000" },
        { key: "rate", label: "Period Interest Rate (decimal)", placeholder: "0.004167" },
        { key: "periods", label: "Number of Payments", placeholder: "360" },
      ]}
      onCalculate={vals => {
        const pmt = tvm.loanPayment(v(vals,"principal"), v(vals,"rate"), v(vals,"periods"));
        return [
          { label: "Payment per Period", value: fmt(pmt, 2), highlight: true },
          { label: "Total Paid", value: fmt(pmt * v(vals,"periods"), 2) },
          { label: "Total Interest", value: fmt(pmt * v(vals,"periods") - v(vals,"principal"), 2) },
        ];
      }}
      renderChart={(vals) => {
        const principal = parseFloat(vals.principal), rate = parseFloat(vals.rate), periods = parseFloat(vals.periods);
        if ([principal, rate, periods].some(isNaN)) return null;
        return <LoanAmortizationChart principal={principal} rate={rate} periods={periods} />;
      }}
    />
  );
  if (moduleId === "tvm" && subId === "apr-ear") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="APR ↔ EAR Conversion" description="Convert between APR and EAR."
      fields={[
        { key: "apr", label: "APR (decimal)", placeholder: "0.12" },
        { key: "m", label: "Compounding Periods / Year", placeholder: "12" },
      ]}
      onCalculate={vals => {
        const ear = tvm.aprToEar(v(vals,"apr"), v(vals,"m"));
        return [
          { label: "Effective Annual Rate (EAR)", value: pct(ear), highlight: true },
          { label: "APR from this EAR", value: pct(tvm.earToApr(ear, v(vals,"m"))) },
        ];
      }}
    />
  );

  // ─── BONDS ───
  if (moduleId === "bonds" && subId === "bond-price") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Bond Price" description="Price a coupon-paying bond."
      fields={[
        { key: "face", label: "Face Value ($)", placeholder: "1000" },
        { key: "coupon", label: "Coupon Rate (decimal)", placeholder: "0.06" },
        { key: "ytm", label: "Yield to Maturity (decimal)", placeholder: "0.05" },
        { key: "years", label: "Years to Maturity", placeholder: "10" },
        { key: "freq", label: "Coupons per Year", placeholder: "2" },
      ]}
      onCalculate={vals => [{ label: "Bond Price", value: fmt(bonds.bondPrice(v(vals,"face"), v(vals,"coupon"), v(vals,"ytm"), v(vals,"years"), v(vals,"freq")), 2), highlight: true }]}
    />
  );
  if (moduleId === "bonds" && subId === "zero-coupon") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Zero-Coupon Bond Price" description="Price a zero-coupon bond."
      fields={[
        { key: "face", label: "Face Value ($)", placeholder: "1000" },
        { key: "ytm", label: "Yield to Maturity (decimal)", placeholder: "0.05" },
        { key: "years", label: "Years to Maturity", placeholder: "10" },
      ]}
      onCalculate={vals => [{ label: "Price", value: fmt(bonds.zeroCouponBondPrice(v(vals,"face"), v(vals,"ytm"), v(vals,"years")), 2), highlight: true }]}
    />
  );
  if (moduleId === "bonds" && subId === "current-yield") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Current Yield" description="Calculate bond's current yield."
      fields={[
        { key: "coupon", label: "Coupon Rate (decimal)", placeholder: "0.06" },
        { key: "face", label: "Face Value ($)", placeholder: "1000" },
        { key: "price", label: "Market Price ($)", placeholder: "950" },
      ]}
      onCalculate={vals => [{ label: "Current Yield", value: pct(bonds.currentYield(v(vals,"coupon"), v(vals,"face"), v(vals,"price"))), highlight: true }]}
    />
  );
  if (moduleId === "bonds" && subId === "duration") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Duration & Convexity" description="Calculate Macaulay/Modified Duration and Convexity."
      fields={[
        { key: "face", label: "Face Value ($)", placeholder: "1000" },
        { key: "coupon", label: "Coupon Rate (decimal)", placeholder: "0.06" },
        { key: "ytm", label: "YTM (decimal)", placeholder: "0.05" },
        { key: "years", label: "Years to Maturity", placeholder: "10" },
        { key: "freq", label: "Coupons per Year", placeholder: "2" },
      ]}
      onCalculate={vals => {
        const args: [number, number, number, number, number] = [v(vals,"face"), v(vals,"coupon"), v(vals,"ytm"), v(vals,"years"), v(vals,"freq")];
        return [
          { label: "Macaulay Duration", value: fmt(bonds.macaulayDuration(...args)), highlight: true },
          { label: "Modified Duration", value: fmt(bonds.modifiedDuration(...args)) },
          { label: "Convexity", value: fmt(bonds.convexity(...args)) },
          { label: "Bond Price", value: fmt(bonds.bondPrice(...args), 2) },
        ];
      }}
    />
  );

  // ─── DERIVATIVES ───
  if (moduleId === "derivatives" && subId === "bsm") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Black-Scholes-Merton" description="Price European call and put options."
      fields={[
        { key: "S", label: "Spot Price ($)", placeholder: "100" },
        { key: "K", label: "Strike Price ($)", placeholder: "100" },
        { key: "r", label: "Risk-Free Rate (decimal)", placeholder: "0.05" },
        { key: "T", label: "Time to Expiry (years)", placeholder: "1" },
        { key: "sigma", label: "Volatility (decimal)", placeholder: "0.2" },
      ]}
      onCalculate={vals => {
        const args: [number, number, number, number, number] = [v(vals,"S"), v(vals,"K"), v(vals,"r"), v(vals,"T"), v(vals,"sigma")];
        return [
          { label: "Call Price", value: fmt(deriv.blackScholesCall(...args), 4), highlight: true },
          { label: "Put Price", value: fmt(deriv.blackScholesPut(...args), 4), highlight: true },
        ];
      }}
      renderChart={(vals) => {
        const K = parseFloat(vals.K), S = parseFloat(vals.S), r = parseFloat(vals.r), T = parseFloat(vals.T), sigma = parseFloat(vals.sigma);
        if ([K, S, r, T, sigma].some(isNaN)) return null;
        return <BSMPayoffChart K={K} callPrice={deriv.blackScholesCall(S, K, r, T, sigma)} putPrice={deriv.blackScholesPut(S, K, r, T, sigma)} />;
      }}
    />
  );
  if (moduleId === "derivatives" && subId === "greeks") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Option Greeks" description="Calculate Delta, Gamma, Vega, Theta, and Rho."
      fields={[
        { key: "S", label: "Spot Price ($)", placeholder: "100" },
        { key: "K", label: "Strike Price ($)", placeholder: "100" },
        { key: "r", label: "Risk-Free Rate (decimal)", placeholder: "0.05" },
        { key: "T", label: "Time to Expiry (years)", placeholder: "1" },
        { key: "sigma", label: "Volatility (decimal)", placeholder: "0.2" },
      ]}
      onCalculate={vals => {
        const g = deriv.greeks(v(vals,"S"), v(vals,"K"), v(vals,"r"), v(vals,"T"), v(vals,"sigma"));
        return [
          { label: "Call Delta", value: fmt(g.callDelta), highlight: true },
          { label: "Put Delta", value: fmt(g.putDelta) },
          { label: "Gamma", value: fmt(g.gamma, 6) },
          { label: "Vega (per 1%)", value: fmt(g.vega, 4) },
          { label: "Call Theta (daily)", value: fmt(g.callTheta, 6) },
          { label: "Put Theta (daily)", value: fmt(g.putTheta, 6) },
          { label: "Call Rho (per 1%)", value: fmt(g.callRho, 4) },
          { label: "Put Rho (per 1%)", value: fmt(g.putRho, 4) },
        ];
      }}
    />
  );
  if (moduleId === "derivatives" && subId === "futures") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Futures Price" description="Calculate theoretical futures price."
      fields={[
        { key: "spot", label: "Spot Price ($)", placeholder: "50" },
        { key: "r", label: "Risk-Free Rate (decimal)", placeholder: "0.05" },
        { key: "T", label: "Time to Maturity (years)", placeholder: "0.5" },
        { key: "storage", label: "Storage Cost (decimal)", placeholder: "0" },
        { key: "convYield", label: "Convenience Yield (decimal)", placeholder: "0" },
      ]}
      onCalculate={vals => [{ label: "Futures Price", value: fmt(deriv.futuresPrice(v(vals,"spot"), v(vals,"r"), v(vals,"T"), v(vals,"storage"), v(vals,"convYield")), 4), highlight: true }]}
    />
  );

  // ─── CAPITAL BUDGETING ───
  if (moduleId === "capital" && subId === "npv") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Net Present Value (NPV)" description="Enter cash flows as comma-separated (first is initial investment, typically negative)."
      fields={[
        { key: "rate", label: "Discount Rate (decimal)", placeholder: "0.1" },
        { key: "cashflows", label: "Cash Flows (comma-separated)", placeholder: "-1000,300,400,500,600" },
      ]}
      onCalculate={vals => {
        const cfs = vals.cashflows.split(",").map(s => parseFloat(s.trim()));
        if (cfs.some(isNaN)) throw new Error("Invalid cash flows");
        return [{ label: "NPV", value: fmt(capBudget.npv(v(vals,"rate"), cfs), 2), highlight: true }];
      }}
      renderChart={(vals) => {
        const rate = parseFloat(vals.rate);
        const cfs = vals.cashflows.split(",").map(s => parseFloat(s.trim()));
        if (isNaN(rate) || cfs.some(isNaN)) return null;
        return <NPVCashFlowChart rate={rate} cashflows={cfs} />;
      }}
    />
  );
  if (moduleId === "capital" && subId === "irr") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Internal Rate of Return (IRR)" description="Enter cash flows as comma-separated."
      fields={[{ key: "cashflows", label: "Cash Flows (comma-separated)", placeholder: "-1000,300,400,500,600" }]}
      onCalculate={vals => {
        const cfs = vals.cashflows.split(",").map(s => parseFloat(s.trim()));
        if (cfs.some(isNaN)) throw new Error("Invalid cash flows");
        const result = capBudget.irr(cfs);
        if (result === null) throw new Error("IRR could not converge");
        return [{ label: "IRR", value: pct(result), highlight: true }];
      }}
    />
  );
  if (moduleId === "capital" && subId === "payback") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Payback Period" description="Calculate simple and discounted payback periods."
      fields={[
        { key: "investment", label: "Initial Investment ($)", placeholder: "1000" },
        { key: "cashflows", label: "Annual Cash Flows (comma-separated)", placeholder: "300,400,500,600" },
        { key: "rate", label: "Discount Rate (decimal, for DPP)", placeholder: "0.1" },
      ]}
      onCalculate={vals => {
        const cfs = vals.cashflows.split(",").map(s => parseFloat(s.trim()));
        const inv = v(vals, "investment");
        const pp = capBudget.paybackPeriod(inv, cfs);
        const dpp = capBudget.discountedPaybackPeriod(inv, cfs, v(vals, "rate"));
        return [
          { label: "Simple Payback", value: pp !== null ? `${fmt(pp, 2)} years` : "Never", highlight: true },
          { label: "Discounted Payback", value: dpp !== null ? `${fmt(dpp, 2)} years` : "Never" },
        ];
      }}
    />
  );
  if (moduleId === "capital" && subId === "pi") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Profitability Index" description="Ratio of PV of future cash flows to initial investment."
      fields={[
        { key: "rate", label: "Discount Rate (decimal)", placeholder: "0.1" },
        { key: "investment", label: "Initial Investment ($)", placeholder: "1000" },
        { key: "cashflows", label: "Future Cash Flows (comma-separated)", placeholder: "300,400,500,600" },
      ]}
      onCalculate={vals => {
        const cfs = vals.cashflows.split(",").map(s => parseFloat(s.trim()));
        return [{ label: "Profitability Index", value: fmt(capBudget.profitabilityIndex(v(vals,"rate"), v(vals,"investment"), cfs), 4), highlight: true }];
      }}
    />
  );

  // ─── EQUITY ───
  if (moduleId === "equity" && subId === "ggm") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Gordon Growth Model" description="Value a stock based on expected dividends growing at a constant rate."
      fields={[
        { key: "div", label: "Next Year's Dividend ($)", placeholder: "2" },
        { key: "g", label: "Growth Rate (decimal)", placeholder: "0.03" },
        { key: "r", label: "Required Return (decimal)", placeholder: "0.1" },
      ]}
      onCalculate={vals => [{ label: "Intrinsic Value", value: fmt(equity.gordonGrowthModel(v(vals,"div"), v(vals,"g"), v(vals,"r")), 2), highlight: true }]}
    />
  );
  if (moduleId === "equity" && subId === "capm") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="CAPM" description="Calculate expected return using CAPM."
      fields={[
        { key: "rf", label: "Risk-Free Rate (decimal)", placeholder: "0.03" },
        { key: "beta", label: "Beta", placeholder: "1.2" },
        { key: "rm", label: "Market Return (decimal)", placeholder: "0.1" },
      ]}
      onCalculate={vals => [{ label: "Expected Return", value: pct(equity.capm(v(vals,"rf"), v(vals,"beta"), v(vals,"rm"))), highlight: true }]}
    />
  );
  if (moduleId === "equity" && subId === "sharpe") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Sharpe Ratio" description="Measure risk-adjusted return."
      fields={[
        { key: "rp", label: "Portfolio Return (decimal)", placeholder: "0.12" },
        { key: "rf", label: "Risk-Free Rate (decimal)", placeholder: "0.03" },
        { key: "sigma", label: "Std Deviation (decimal)", placeholder: "0.15" },
      ]}
      onCalculate={vals => [{ label: "Sharpe Ratio", value: fmt(equity.sharpeRatio(v(vals,"rp"), v(vals,"rf"), v(vals,"sigma")), 4), highlight: true }]}
    />
  );
  if (moduleId === "equity" && subId === "wacc") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="WACC" description="Weighted Average Cost of Capital."
      fields={[
        { key: "we", label: "Equity Weight (decimal)", placeholder: "0.6" },
        { key: "ke", label: "Cost of Equity (decimal)", placeholder: "0.1" },
        { key: "wd", label: "Debt Weight (decimal)", placeholder: "0.4" },
        { key: "kd", label: "Cost of Debt (decimal)", placeholder: "0.05" },
        { key: "tax", label: "Tax Rate (decimal)", placeholder: "0.3" },
      ]}
      onCalculate={vals => [{ label: "WACC", value: pct(equity.wacc(v(vals,"we"), v(vals,"ke"), v(vals,"wd"), v(vals,"kd"), v(vals,"tax"))), highlight: true }]}
    />
  );

  // ─── COMMODITY & REAL ESTATE ───
  if (moduleId === "commodity" && subId === "comm-futures") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Commodity Futures Price" description="Cost-of-carry model: F = S × exp((r + u − y) × T)"
      fields={[
        { key: "S", label: "Spot Price ($)", placeholder: "50" },
        { key: "T", label: "Time to Maturity (years)", placeholder: "0.5" },
        { key: "r", label: "Risk-Free Rate (decimal)", placeholder: "0.05" },
        { key: "u", label: "Storage Cost Rate (decimal)", placeholder: "0.02" },
        { key: "y", label: "Convenience Yield (decimal)", placeholder: "0.01" },
      ]}
      onCalculate={vals => [{ label: "Futures Price", value: fmt(commRE.commodityFuturesPrice(v(vals,"S"), v(vals,"T"), v(vals,"r"), v(vals,"u"), v(vals,"y")), 4), highlight: true }]}
    />
  );
  if (moduleId === "commodity" && subId === "schwartz-smith") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Schwartz-Smith Two-Factor Model" description="Two-factor commodity futures pricing with mean-reverting short-term factor."
      fields={[
        { key: "S", label: "Spot Price ($)", placeholder: "50" },
        { key: "Z", label: "Long-term Factor Z (log units)", placeholder: "3.912" },
        { key: "T", label: "Time to Maturity (years)", placeholder: "1" },
        { key: "r", label: "Risk-Free Rate (decimal)", placeholder: "0.05" },
        { key: "kappa", label: "Mean Reversion Speed (κ)", placeholder: "1.5" },
        { key: "sigmaX", label: "Short-term Vol (σ_X)", placeholder: "0.3" },
        { key: "sigmaZ", label: "Long-term Vol (σ_ζ)", placeholder: "0.1" },
        { key: "rho", label: "Correlation (ρ)", placeholder: "0.5" },
      ]}
      onCalculate={vals => [{ label: "Futures Price", value: fmt(commRE.schwartzSmithFuturesPrice(v(vals,"S"), v(vals,"Z"), v(vals,"T"), v(vals,"r"), v(vals,"kappa"), v(vals,"sigmaX"), v(vals,"sigmaZ"), v(vals,"rho")), 4), highlight: true }]}
    />
  );
  if (moduleId === "commodity" && subId === "re-terminal") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Real Estate Terminal Value" description="Gordon Growth Model for real estate exit valuation."
      fields={[
        { key: "noi", label: "Next Period NOI ($)", placeholder: "500000" },
        { key: "capRate", label: "Exit Cap Rate (decimal)", placeholder: "0.07" },
        { key: "growth", label: "Long-term Growth Rate (decimal)", placeholder: "0.02" },
      ]}
      onCalculate={vals => [{ label: "Terminal Value", value: fmt(commRE.realEstateTerminalValue(v(vals,"noi"), v(vals,"capRate"), v(vals,"growth")), 2), highlight: true }]}
    />
  );

  // ─── PRIVATE MARKETS & CREDIT RISK ───
  if (moduleId === "private" && subId === "illiquidity") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Illiquidity Discount (Option Model)" description="Put-option approach to valuing illiquidity cost."
      fields={[
        { key: "value", label: "Asset Value ($)", placeholder: "1000000" },
        { key: "liqCost", label: "Liquidation Cost (%)", placeholder: "0.10" },
        { key: "holdPeriod", label: "Holding Period (years)", placeholder: "3" },
        { key: "vol", label: "Volatility (decimal)", placeholder: "0.25" },
        { key: "rf", label: "Risk-Free Rate (decimal)", placeholder: "0.04" },
        { key: "gSpread", label: "G-Spread (decimal)", placeholder: "0.02" },
      ]}
      onCalculate={vals => {
        const res = privCredit.illiquidityDiscount(v(vals,"value"), v(vals,"liqCost"), v(vals,"holdPeriod"), v(vals,"vol"), v(vals,"rf"), v(vals,"gSpread"));
        return [
          { label: "Discount Value", value: fmt(res.discountValue, 2), highlight: true },
          { label: "Discount %", value: pct(res.discountPct) },
          { label: "Adjusted Asset Value", value: fmt(res.adjustedValue, 2) },
        ];
      }}
    />
  );
  if (moduleId === "private" && subId === "merton") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Merton Model (Credit Risk)" description="Structural credit risk model — equity as call option on firm assets."
      fields={[
        { key: "E", label: "Equity Value ($)", placeholder: "500000" },
        { key: "sigmaE", label: "Equity Volatility (decimal)", placeholder: "0.4" },
        { key: "D", label: "Face Value of Debt ($)", placeholder: "800000" },
        { key: "T", label: "Time to Debt Maturity (years)", placeholder: "5" },
        { key: "r", label: "Risk-Free Rate (decimal)", placeholder: "0.05" },
      ]}
      onCalculate={vals => {
        const res = privCredit.mertonCreditRisk(v(vals,"E"), v(vals,"sigmaE"), v(vals,"D"), v(vals,"T"), v(vals,"r"));
        return [
          { label: "Implied Asset Value", value: fmt(res.impliedAssetValue, 2), highlight: true },
          { label: "Implied Asset Vol", value: pct(res.impliedAssetVolatility) },
          { label: "Distance to Default", value: fmt(res.distanceToDefault, 4) },
          { label: "Probability of Default", value: pct(res.probabilityOfDefault) },
        ];
      }}
    />
  );
  if (moduleId === "private" && subId === "mc-pe") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Monte Carlo PE Valuation" description="Simulate PE valuation with uncertain discount rates and exit multiples."
      fields={[
        { key: "fcfs", label: "Base FCFs (comma-separated)", placeholder: "100,120,140,160,180" },
        { key: "drMean", label: "Discount Rate Mean (decimal)", placeholder: "0.12" },
        { key: "drStd", label: "Discount Rate Std Dev", placeholder: "0.02" },
        { key: "emMean", label: "Exit Multiple Mean", placeholder: "8" },
        { key: "emStd", label: "Exit Multiple Std Dev", placeholder: "1.5" },
        { key: "sims", label: "Number of Simulations", placeholder: "10000" },
      ]}
      onCalculate={vals => {
        const fcfs = vals.fcfs.split(",").map(s => parseFloat(s.trim()));
        if (fcfs.some(isNaN)) throw new Error("Invalid FCFs");
        const res = privCredit.monteCarloPEValuation(fcfs, v(vals,"drMean"), v(vals,"drStd"), v(vals,"emMean"), v(vals,"emStd"), Math.round(v(vals,"sims")));
        return [
          { label: "Mean Valuation", value: fmt(res.mean, 2), highlight: true },
          { label: "Median Valuation", value: fmt(res.median, 2) },
          { label: "5th Percentile", value: fmt(res.p5, 2) },
          { label: "25th Percentile", value: fmt(res.p25, 2) },
          { label: "75th Percentile", value: fmt(res.p75, 2) },
          { label: "95th Percentile", value: fmt(res.p95, 2) },
        ];
      }}
      renderChart={(vals) => {
        const fcfs = vals.fcfs.split(",").map(s => parseFloat(s.trim()));
        if (fcfs.some(isNaN)) return null;
        try {
          const res = privCredit.monteCarloPEValuation(fcfs, parseFloat(vals.drMean), parseFloat(vals.drStd), parseFloat(vals.emMean), parseFloat(vals.emStd), Math.round(parseFloat(vals.sims)));
          return <MonteCarloChart stats={res} />;
        } catch { return null; }
      }}
    />
  );

  // ─── YIELD CURVE ───
  if (moduleId === "yieldcurve" && subId === "nelson-siegel") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Nelson-Siegel Spot Yield" description="Calculate spot yield at a given maturity using NS parameters."
      fields={[
        { key: "m", label: "Maturity (years)", placeholder: "5" },
        { key: "beta0", label: "β₀ (long-term level)", placeholder: "0.06" },
        { key: "beta1", label: "β₁ (slope)", placeholder: "-0.02" },
        { key: "beta2", label: "β₂ (curvature)", placeholder: "0.01" },
        { key: "tau", label: "τ (decay)", placeholder: "1.5" },
      ]}
      onCalculate={vals => [{ label: "Spot Yield", value: pct(yieldCurve.nelsonSiegelYield(v(vals,"m"), v(vals,"beta0"), v(vals,"beta1"), v(vals,"beta2"), v(vals,"tau"))), highlight: true }]}
      renderChart={(vals) => {
        const b0 = parseFloat(vals.beta0), b1 = parseFloat(vals.beta1), b2 = parseFloat(vals.beta2), tau = parseFloat(vals.tau);
        if ([b0, b1, b2, tau].some(isNaN)) return null;
        return <YieldCurveChart yieldFn={(m) => yieldCurve.nelsonSiegelYield(m, b0, b1, b2, tau)} />;
      }}
    />
  );
  if (moduleId === "yieldcurve" && subId === "svensson") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Svensson Spot Yield" description="Extended Nelson-Siegel with second curvature term."
      fields={[
        { key: "m", label: "Maturity (years)", placeholder: "5" },
        { key: "beta0", label: "β₀", placeholder: "0.06" },
        { key: "beta1", label: "β₁", placeholder: "-0.02" },
        { key: "beta2", label: "β₂", placeholder: "0.01" },
        { key: "beta3", label: "β₃", placeholder: "0.005" },
        { key: "tau1", label: "τ₁", placeholder: "1.5" },
        { key: "tau2", label: "τ₂", placeholder: "5" },
      ]}
      onCalculate={vals => [{ label: "Spot Yield", value: pct(yieldCurve.svenssonYield(v(vals,"m"), v(vals,"beta0"), v(vals,"beta1"), v(vals,"beta2"), v(vals,"beta3"), v(vals,"tau1"), v(vals,"tau2"))), highlight: true }]}
      renderChart={(vals) => {
        const b0 = parseFloat(vals.beta0), b1 = parseFloat(vals.beta1), b2 = parseFloat(vals.beta2), b3 = parseFloat(vals.beta3), t1 = parseFloat(vals.tau1), t2 = parseFloat(vals.tau2);
        if ([b0, b1, b2, b3, t1, t2].some(isNaN)) return null;
        return <YieldCurveChart yieldFn={(m) => yieldCurve.svenssonYield(m, b0, b1, b2, b3, t1, t2)} />;
      }}
    />
  );
  if (moduleId === "yieldcurve" && subId === "forward-rate") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Forward Rate" description="Calculate implied forward rate between two spot rates."
      fields={[
        { key: "s1", label: "Spot Rate 1 (decimal)", placeholder: "0.04" },
        { key: "t1", label: "Maturity 1 (years)", placeholder: "2" },
        { key: "s2", label: "Spot Rate 2 (decimal)", placeholder: "0.05" },
        { key: "t2", label: "Maturity 2 (years)", placeholder: "5" },
      ]}
      onCalculate={vals => [{ label: "Forward Rate", value: pct(yieldCurve.forwardRate(v(vals,"s1"), v(vals,"t1"), v(vals,"s2"), v(vals,"t2"))), highlight: true }]}
    />
  );
  if (moduleId === "yieldcurve" && subId === "bootstrap") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Bootstrap Spot Rates" description="Derive spot rates from par yields. Enter comma-separated values."
      fields={[
        { key: "parYields", label: "Par Yields (comma-separated, decimal)", placeholder: "0.03,0.035,0.04,0.045,0.05" },
        { key: "maturities", label: "Maturities (comma-separated, years)", placeholder: "1,2,3,4,5" },
      ]}
      onCalculate={vals => {
        const py = vals.parYields.split(",").map(s => parseFloat(s.trim()));
        const mat = vals.maturities.split(",").map(s => parseFloat(s.trim()));
        if (py.some(isNaN) || mat.some(isNaN)) throw new Error("Invalid input");
        if (py.length !== mat.length) throw new Error("Par yields and maturities must have same length");
        const spots = yieldCurve.bootstrapSpotRates(py, mat);
        return spots.map((s, i) => ({ label: `Spot Rate (${mat[i]}Y)`, value: pct(s), highlight: i === spots.length - 1 }));
      }}
    />
  );

  // ─── QUEUING THEORY ───
  if (moduleId === "queuing" && subId === "mm1") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="M/M/1 Queue" description="Single-server Markovian queue analysis."
      fields={[
        { key: "lambda", label: "Arrival Rate (λ)", placeholder: "4" },
        { key: "mu", label: "Service Rate (μ)", placeholder: "5" },
      ]}
      onCalculate={vals => {
        const res = queuing.mm1(v(vals,"lambda"), v(vals,"mu"));
        return [
          { label: "Utilization (ρ)", value: fmt(res.utilization, 4), highlight: true },
          { label: "Avg System Length (L)", value: fmt(res.avgSystemLength, 4) },
          { label: "Avg Queue Length (Lq)", value: fmt(res.avgQueueLength, 4) },
          { label: "Avg System Time (W)", value: fmt(res.avgSystemTime, 4) },
          { label: "Avg Queue Time (Wq)", value: fmt(res.avgQueueTime, 4) },
          { label: "P(empty)", value: fmt(res.probEmpty, 4) },
        ];
      }}
    />
  );
  if (moduleId === "queuing" && subId === "mmc") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="M/M/c Queue" description="Multi-server Markovian queue with Erlang-C."
      fields={[
        { key: "lambda", label: "Arrival Rate (λ)", placeholder: "10" },
        { key: "mu", label: "Service Rate per Server (μ)", placeholder: "4" },
        { key: "c", label: "Number of Servers (c)", placeholder: "3" },
      ]}
      onCalculate={vals => {
        const res = queuing.mmc(v(vals,"lambda"), v(vals,"mu"), Math.round(v(vals,"c")));
        return [
          { label: "Utilization (ρ)", value: fmt(res.utilization, 4), highlight: true },
          { label: "P(waiting)", value: fmt(res.probWaiting, 4) },
          { label: "Avg Queue Length (Lq)", value: fmt(res.avgQueueLength, 4) },
          { label: "Avg Queue Time (Wq)", value: fmt(res.avgQueueTime, 4) },
          { label: "Avg System Length (L)", value: fmt(res.avgSystemLength, 4) },
          { label: "Avg System Time (W)", value: fmt(res.avgSystemTime, 4) },
        ];
      }}
    />
  );

  // ─── OPERATIONS FINANCE ───
  if (moduleId === "operations" && subId === "eoq") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Economic Order Quantity (EOQ)" description="Optimal order quantity minimizing total inventory costs."
      fields={[
        { key: "D", label: "Annual Demand", placeholder: "10000" },
        { key: "S", label: "Ordering Cost per Order ($)", placeholder: "100" },
        { key: "H", label: "Holding Cost per Unit/Year ($)", placeholder: "5" },
      ]}
      onCalculate={vals => {
        const res = ops.eoq(v(vals,"D"), v(vals,"S"), v(vals,"H"));
        return [
          { label: "EOQ", value: fmt(res.eoq, 2), highlight: true },
          { label: "Total Annual Cost", value: fmt(res.totalAnnualCost, 2) },
        ];
      }}
    />
  );
  if (moduleId === "operations" && subId === "rop") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Reorder Point" description="Calculate reorder point with safety stock."
      fields={[
        { key: "d", label: "Daily Demand", placeholder: "50" },
        { key: "lt", label: "Lead Time (days)", placeholder: "7" },
        { key: "sl", label: "Service Level (0-1)", placeholder: "0.95" },
        { key: "stdDev", label: "Std Dev of Daily Demand", placeholder: "10" },
      ]}
      onCalculate={vals => {
        const res = ops.reorderPoint(v(vals,"d"), v(vals,"lt"), v(vals,"sl"), v(vals,"stdDev"));
        return [
          { label: "Reorder Point", value: fmt(res.reorderPoint, 2), highlight: true },
          { label: "Safety Stock", value: fmt(res.safetyStock, 2) },
        ];
      }}
    />
  );
  if (moduleId === "operations" && subId === "newsvendor") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Newsvendor Model" description="Optimal stocking quantity under demand uncertainty."
      fields={[
        { key: "cu", label: "Cost of Understock (Cu)", placeholder: "10" },
        { key: "co", label: "Cost of Overstock (Co)", placeholder: "3" },
        { key: "type", label: "Demand Distribution", type: "select", options: [{ label: "Normal", value: "normal" }, { label: "Uniform", value: "uniform" }], defaultValue: "normal" },
        { key: "mean", label: "Demand Mean (normal) / Min (uniform)", placeholder: "100" },
        { key: "std", label: "Demand Std Dev (normal) / Max (uniform)", placeholder: "20" },
      ]}
      onCalculate={vals => {
        const dt = vals.type as 'normal' | 'uniform';
        const params = dt === 'normal'
          ? { mean: v(vals,"mean"), stdDev: v(vals,"std") }
          : { min: v(vals,"mean"), max: v(vals,"std") };
        const res = ops.newsvendor(v(vals,"cu"), v(vals,"co"), dt, params);
        return [
          { label: "Critical Ratio", value: fmt(res.criticalRatio, 4) },
          { label: "Optimal Quantity", value: fmt(res.optimalQuantity, 2), highlight: true },
        ];
      }}
    />
  );

  // ─── FINANCIAL ACCOUNTING ───
  if (moduleId === "accounting" && subId === "income-stmt") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Income Statement Generator" description="Generate a simplified income statement."
      fields={[
        { key: "revenue", label: "Revenue ($)", placeholder: "1000000" },
        { key: "cogsPct", label: "COGS % of Revenue (decimal)", placeholder: "0.6" },
        { key: "opexPct", label: "OpEx % of Revenue (decimal)", placeholder: "0.15" },
        { key: "interest", label: "Interest Expense ($)", placeholder: "20000" },
        { key: "taxRate", label: "Tax Rate (decimal)", placeholder: "0.25" },
      ]}
      onCalculate={vals => {
        const is = accounting.generateIncomeStatement(v(vals,"revenue"), v(vals,"cogsPct"), v(vals,"opexPct"), v(vals,"interest"), v(vals,"taxRate"));
        return [
          { label: "Revenue", value: fmt(is.revenue, 2) },
          { label: "COGS", value: fmt(is.cogs, 2) },
          { label: "Gross Profit", value: fmt(is.grossProfit, 2), highlight: true },
          { label: "Operating Expenses", value: fmt(is.operatingExpenses, 2) },
          { label: "Operating Income", value: fmt(is.operatingIncome, 2), highlight: true },
          { label: "Interest Expense", value: fmt(is.interestExpense, 2) },
          { label: "EBT", value: fmt(is.ebt, 2) },
          { label: "Tax Expense", value: fmt(is.taxExpense, 2) },
          { label: "Net Income", value: fmt(is.netIncome, 2), highlight: true },
        ];
      }}
    />
  );
  if (moduleId === "accounting" && subId === "balance-sheet") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Balance Sheet Generator" description="Generate a simplified balance sheet."
      fields={[
        { key: "cash", label: "Cash ($)", placeholder: "100000" },
        { key: "receivables", label: "Receivables ($)", placeholder: "150000" },
        { key: "inventory", label: "Inventory ($)", placeholder: "200000" },
        { key: "fixedAssets", label: "Fixed Assets ($)", placeholder: "500000" },
        { key: "currentLiab", label: "Current Liabilities ($)", placeholder: "120000" },
        { key: "ltDebt", label: "Long-term Debt ($)", placeholder: "300000" },
      ]}
      onCalculate={vals => {
        const bs = accounting.generateBalanceSheet(v(vals,"cash"), v(vals,"receivables"), v(vals,"inventory"), v(vals,"fixedAssets"), v(vals,"currentLiab"), v(vals,"ltDebt"));
        return [
          { label: "Current Assets", value: fmt(bs.currentAssets, 2) },
          { label: "Fixed Assets", value: fmt(bs.fixedAssets, 2) },
          { label: "Total Assets", value: fmt(bs.totalAssets, 2), highlight: true },
          { label: "Current Liabilities", value: fmt(bs.currentLiabilities, 2) },
          { label: "Long-term Debt", value: fmt(bs.longTermDebt, 2) },
          { label: "Total Liabilities", value: fmt(bs.totalLiabilities, 2) },
          { label: "Equity", value: fmt(bs.equity, 2), highlight: true },
        ];
      }}
    />
  );
  if (moduleId === "accounting" && subId === "ratios") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Financial Ratios" description="Calculate key financial ratios from income and balance sheet data."
      fields={[
        { key: "revenue", label: "Revenue ($)", placeholder: "1000000" },
        { key: "grossProfit", label: "Gross Profit ($)", placeholder: "400000" },
        { key: "opIncome", label: "Operating Income ($)", placeholder: "250000" },
        { key: "netIncome", label: "Net Income ($)", placeholder: "180000" },
        { key: "currentAssets", label: "Current Assets ($)", placeholder: "450000" },
        { key: "currentLiab", label: "Current Liabilities ($)", placeholder: "120000" },
        { key: "totalAssets", label: "Total Assets ($)", placeholder: "950000" },
        { key: "totalLiab", label: "Total Liabilities ($)", placeholder: "420000" },
      ]}
      onCalculate={vals => {
        const eq = v(vals,"totalAssets") - v(vals,"totalLiab");
        return [
          { label: "Gross Margin", value: pct(v(vals,"grossProfit") / v(vals,"revenue")), highlight: true },
          { label: "Operating Margin", value: pct(v(vals,"opIncome") / v(vals,"revenue")) },
          { label: "Net Margin", value: pct(v(vals,"netIncome") / v(vals,"revenue")) },
          { label: "Current Ratio", value: fmt(v(vals,"currentAssets") / v(vals,"currentLiab"), 2) },
          { label: "Debt-to-Equity", value: fmt(v(vals,"totalLiab") / (eq || 1), 2) },
          { label: "ROE", value: pct(v(vals,"netIncome") / (eq || 1)) },
          { label: "ROA", value: pct(v(vals,"netIncome") / v(vals,"totalAssets")) },
        ];
      }}
    />
  );

  // ─── GENERAL TOOLS ───
  if (moduleId === "general" && subId === "stats") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Descriptive Statistics" description="Enter comma-separated numbers."
      fields={[{ key: "data", label: "Data (comma-separated)", placeholder: "10,20,30,40,50" }]}
      onCalculate={vals => {
        const data = vals.data.split(",").map(s => parseFloat(s.trim()));
        if (data.some(isNaN)) throw new Error("Invalid data");
        const s = general.descriptiveStats(data);
        if (!s) throw new Error("No data");
        return [
          { label: "Mean", value: fmt(s.mean, 4), highlight: true },
          { label: "Median", value: fmt(s.median, 4) },
          { label: "Mode", value: s.mode.length ? s.mode.join(", ") : "None" },
          { label: "Std Deviation", value: fmt(s.stdDev, 4) },
          { label: "Variance", value: fmt(s.variance, 4) },
          { label: "Min", value: s.min },
          { label: "Max", value: s.max },
          { label: "Range", value: s.range },
          { label: "Count", value: s.count },
        ];
      }}
    />
  );
  if (moduleId === "general" && subId === "perpetuity") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Perpetuity Valuation" description="Value a perpetuity (simple or growing)."
      fields={[
        { key: "cf", label: "Cash Flow ($)", placeholder: "100" },
        { key: "r", label: "Discount Rate (decimal)", placeholder: "0.05" },
        { key: "g", label: "Growth Rate (decimal, 0 for simple)", placeholder: "0" },
      ]}
      onCalculate={vals => {
        const g = v(vals, "g");
        const val = g === 0 ? general.perpetuity(v(vals,"cf"), v(vals,"r")) : general.growingPerpetuity(v(vals,"cf"), v(vals,"r"), g);
        return [{ label: "Perpetuity Value", value: fmt(val, 2), highlight: true }];
      }}
    />
  );
  if (moduleId === "general" && subId === "depreciation") return (
    <CalculatorForm formulaDoc={formulaDoc} onSaveResult={onSaveResult} title="Depreciation" description="Calculate depreciation schedule."
      fields={[
        { key: "cost", label: "Asset Cost ($)", placeholder: "10000" },
        { key: "salvage", label: "Salvage Value ($)", placeholder: "1000" },
        { key: "life", label: "Useful Life (years)", placeholder: "5" },
        { key: "method", label: "Method", type: "select", options: [{ label: "Straight-Line", value: "straight-line" }, { label: "Double Declining Balance", value: "ddb" }], defaultValue: "straight-line" },
      ]}
      onCalculate={vals => {
        const sched = general.depreciation(v(vals,"cost"), v(vals,"salvage"), v(vals,"life"), vals.method as 'straight-line' | 'ddb');
        return sched.map(s => ({
          label: `Year ${s.year}`,
          value: `Dep: $${fmt(s.depreciation, 2)} | BV: $${fmt(s.bookValue, 2)}`,
        }));
      }}
    />
  );

  return <div className="text-muted-foreground text-sm">Select a calculator from the menu.</div>;
}

const RecordCard: React.FC<{
  record: CalculationRecord;
  onLoad: (r: CalculationRecord) => void;
  onToggleFav: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ record, onLoad, onToggleFav, onDelete }) => (
  <div className="bg-sidebar-accent/30 rounded-lg p-2.5 group">
    <div className="flex items-start justify-between gap-1">
      <button onClick={() => onLoad(record)} className="text-left flex-1 min-w-0">
        <p className="text-[12px] font-medium text-sidebar-accent-foreground truncate">{record.subCalcLabel}</p>
        <p className="text-[10px] text-sidebar-foreground truncate">{record.moduleLabel}</p>
      </button>
      <div className="flex items-center gap-0.5 shrink-0">
        <button onClick={() => onToggleFav(record.id)} className="p-1 rounded hover:bg-sidebar-accent">
          <Star size={12} className={record.isFavorite ? "fill-primary text-primary" : "text-sidebar-foreground"} />
        </button>
        <button onClick={() => onDelete(record.id)} className="p-1 rounded hover:bg-sidebar-accent opacity-0 group-hover:opacity-100 transition-opacity">
          <Trash2 size={12} className="text-sidebar-foreground" />
        </button>
      </div>
    </div>
    <div className="mt-1.5 space-y-0.5">
      {record.results.slice(0, 2).map((r, i) => (
        <div key={i} className="flex justify-between text-[10px]">
          <span className="text-sidebar-foreground truncate">{r.label}</span>
          <span className="text-primary font-medium ml-2 shrink-0">{r.value}</span>
        </div>
      ))}
    </div>
    <p className="text-[9px] text-sidebar-foreground/40 mt-1">{new Date(record.timestamp).toLocaleString()}</p>
  </div>
);

type SidebarView = "calculators" | "history" | "favorites";


const Index = () => {
  const [activeModule, setActiveModule] = useState("");
  const [activeSubCalc, setActiveSubCalc] = useState("");
  const [expandedModule, setExpandedModule] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHome, setShowHome] = useState(true);
  const [sidebarView, setSidebarView] = useState<SidebarView>("calculators");
  const store = useCalculationStore();

  const handleModuleClick = (moduleId: string) => {
    if (expandedModule === moduleId) {
      setExpandedModule("");
    } else {
      setExpandedModule(moduleId);
      const mod = modules.find(m => m.id === moduleId);
      if (mod && mod.subCalcs.length > 0) {
        setActiveModule(moduleId);
        setActiveSubCalc(mod.subCalcs[0].id);
        setShowHome(false);
      }
    }
  };

  const handleSubCalcClick = (moduleId: string, subId: string) => {
    setActiveModule(moduleId);
    setActiveSubCalc(subId);
    setShowHome(false);
    setSidebarOpen(false);
  };

  const handleCategoryClick = (moduleId: string) => {
    const mod = modules.find(m => m.id === moduleId);
    if (mod && mod.subCalcs.length > 0) {
      setActiveModule(moduleId);
      setActiveSubCalc(mod.subCalcs[0].id);
      setExpandedModule(moduleId);
      setShowHome(false);
    }
  };

  const handleGoHome = () => {
    setShowHome(true);
    setActiveModule("");
    setActiveSubCalc("");
    setExpandedModule("");
  };

  const handleLoadRecord = (record: CalculationRecord) => {
    setActiveModule(record.moduleId);
    setActiveSubCalc(record.subCalcId);
    const mod = modules.find(m => m.id === record.moduleId);
    if (mod) setExpandedModule(mod.id);
    setShowHome(false);
    setSidebarOpen(false);
  };

  const activeModuleData = modules.find(m => m.id === activeModule);
  const activeSubCalcData = activeModuleData?.subCalcs.find(s => s.id === activeSubCalc);

  const onSaveResult = (inputs: Record<string, string>, results: Result[]) => {
    store.addRecord({
      moduleId: activeModule,
      subCalcId: activeSubCalc,
      moduleLabel: activeModuleData?.label || "",
      subCalcLabel: activeSubCalcData?.label || "",
      inputs,
      results,
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-card border border-border shadow-sm"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-72 bg-sidebar border-r border-sidebar-border
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-sidebar-border">
          <button onClick={handleGoHome} className="flex items-center gap-2.5 w-full text-left">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <CalcIcon size={16} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-sidebar-accent-foreground tracking-tight">Financial Calculator</h1>
              <p className="text-[11px] text-sidebar-foreground">Suite</p>
            </div>
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex border-b border-sidebar-border">
          {([["calculators", CalcIcon, "Calcs"], ["history", History, "History"], ["favorites", Star, "Favorites"]] as const).map(([view, Icon, label]) => (
            <button
              key={view}
              onClick={() => setSidebarView(view as SidebarView)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-colors
                ${sidebarView === view ? "text-primary border-b-2 border-primary" : "text-sidebar-foreground hover:text-sidebar-accent-foreground"}`}
            >
              <Icon size={13} />
              {label}
              {view === "history" && store.history.length > 0 && (
                <span className="bg-primary/20 text-primary text-[10px] px-1.5 rounded-full">{store.history.length}</span>
              )}
              {view === "favorites" && store.favorites.length > 0 && (
                <span className="bg-primary/20 text-primary text-[10px] px-1.5 rounded-full">{store.favorites.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Navigation - Calculators */}
        {sidebarView === "calculators" && (
          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
            {modules.map(mod => (
              <div key={mod.id}>
                <button
                  onClick={() => handleModuleClick(mod.id)}
                  className={`sidebar-item w-full ${expandedModule === mod.id ? "sidebar-item-active" : ""}`}
                >
                  <span className="shrink-0">{mod.icon}</span>
                  <span className="flex-1 text-left truncate">{mod.label}</span>
                  <ChevronRight size={14} className={`shrink-0 transition-transform duration-200 ${expandedModule === mod.id ? "rotate-90" : ""}`} />
                </button>
                {expandedModule === mod.id && (
                  <div className="ml-8 mt-1 mb-2 space-y-0.5">
                    {mod.subCalcs.map(sub => (
                      <button
                        key={sub.id}
                        onClick={() => handleSubCalcClick(mod.id, sub.id)}
                        className={`w-full text-left text-[13px] px-3 py-1.5 rounded-md transition-colors duration-150
                          ${activeModule === mod.id && activeSubCalc === sub.id
                            ? "text-primary font-semibold bg-sidebar-accent"
                            : "text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50"
                          }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* History View */}
        {sidebarView === "history" && (
          <div className="flex-1 overflow-y-auto py-3 px-3">
            {store.history.length === 0 ? (
              <p className="text-[12px] text-sidebar-foreground/60 text-center py-8">No calculations yet. Results are saved automatically.</p>
            ) : (
              <>
                <button onClick={store.clearHistory} className="w-full text-[11px] text-destructive hover:text-destructive/80 text-center py-1 mb-2">
                  Clear non-favorites
                </button>
                <div className="space-y-1">
                  {store.history.map(rec => (
                    <RecordCard key={rec.id} record={rec} onLoad={handleLoadRecord} onToggleFav={store.toggleFavorite} onDelete={store.deleteRecord} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Favorites View */}
        {sidebarView === "favorites" && (
          <div className="flex-1 overflow-y-auto py-3 px-3">
            {store.favorites.length === 0 ? (
              <p className="text-[12px] text-sidebar-foreground/60 text-center py-8">Star a calculation to save it as a favorite.</p>
            ) : (
              <div className="space-y-1">
                {store.favorites.map(rec => (
                  <RecordCard key={rec.id} record={rec} onLoad={handleLoadRecord} onToggleFav={store.toggleFavorite} onDelete={store.deleteRecord} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-4 border-t border-sidebar-border">
          <p className="text-[11px] text-sidebar-foreground/60">Based on Financial_Calc by Nirmalya</p>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {showHome ? (
          <>
            {/* Home Header */}
            <header className="bg-background/80 backdrop-blur-md border-b border-border px-6 lg:px-8 py-6 lg:py-10">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Financial Calculator Suite</h2>
                <p className="text-sm text-muted-foreground mt-2">Choose a category to get started</p>
              </div>
            </header>

            {/* Category Grid */}
            <div className="max-w-4xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
                {modules.map(mod => (
                  <button
                    key={mod.id}
                    onClick={() => handleCategoryClick(mod.id)}
                    className="group flex flex-col items-center gap-3 p-4 lg:p-6 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all duration-200"
                  >
                    <div className="w-11 h-11 lg:w-14 lg:h-14 rounded-xl bg-accent flex items-center justify-center text-accent-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                      {React.cloneElement(mod.icon as React.ReactElement, { size: 22 })}
                    </div>
                    <div className="text-center">
                      <p className="text-xs lg:text-sm font-semibold text-foreground leading-tight">{mod.label}</p>
                      <p className="text-[10px] lg:text-xs text-muted-foreground mt-0.5">{mod.subCalcs.length} calculators</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Calculator Header */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-6 lg:px-8 py-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <button onClick={handleGoHome} className="hover:text-foreground transition-colors">Home</button>
                <ChevronRight size={14} />
                <span>{activeModuleData?.label}</span>
                <ChevronRight size={14} />
                <span className="text-foreground font-medium">{activeSubCalcData?.label}</span>
              </div>
            </header>

            {/* Calculator content */}
            <div className="max-w-2xl mx-auto px-6 lg:px-8 py-8">
              <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                {getCalcContent(activeModule, activeSubCalc, onSaveResult)}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Index;
