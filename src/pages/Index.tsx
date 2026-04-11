import React, { useState } from "react";
import { CalculatorForm } from "../components/CalculatorForm";
import * as tvm from "../lib/calculators/tvm";
import * as bonds from "../lib/calculators/bonds";
import * as deriv from "../lib/calculators/derivatives";
import * as capBudget from "../lib/calculators/capital-budgeting";
import * as equity from "../lib/calculators/equity";
import * as general from "../lib/calculators/general";
import {
  Calculator, TrendingUp, BarChart3, PieChart, Landmark, Activity,
  ChevronRight, Menu, X
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
    id: "tvm", label: "Time Value of Money", icon: <Calculator size={18} />,
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
    id: "general", label: "General Tools", icon: <PieChart size={18} />,
    subCalcs: [
      { id: "stats", label: "Descriptive Statistics" },
      { id: "perpetuity", label: "Perpetuity" },
      { id: "depreciation", label: "Depreciation" },
    ],
  },
];

function getCalcContent(moduleId: string, subId: string) {
  const v = (vals: Record<string, string>, key: string) => {
    const n = parseFloat(vals[key]);
    if (isNaN(n)) throw new Error(`Invalid input: ${key}`);
    return n;
  };

  // TVM
  if (moduleId === "tvm" && subId === "fv") return (
    <CalculatorForm title="Future Value" description="Calculate the future value of a present sum."
      fields={[
        { key: "pv", label: "Present Value ($)", placeholder: "1000" },
        { key: "rate", label: "Interest Rate (decimal)", placeholder: "0.05" },
        { key: "periods", label: "Number of Periods", placeholder: "10" },
      ]}
      onCalculate={vals => [{ label: "Future Value", value: fmt(tvm.futureValue(v(vals,"pv"), v(vals,"rate"), v(vals,"periods")), 2), highlight: true }]}
    />
  );
  if (moduleId === "tvm" && subId === "pv") return (
    <CalculatorForm title="Present Value" description="Calculate the present value of a future sum."
      fields={[
        { key: "fv", label: "Future Value ($)", placeholder: "1500" },
        { key: "rate", label: "Discount Rate (decimal)", placeholder: "0.05" },
        { key: "periods", label: "Number of Periods", placeholder: "10" },
      ]}
      onCalculate={vals => [{ label: "Present Value", value: fmt(tvm.presentValue(v(vals,"fv"), v(vals,"rate"), v(vals,"periods")), 2), highlight: true }]}
    />
  );
  if (moduleId === "tvm" && subId === "fv-annuity") return (
    <CalculatorForm title="Future Value of Annuity" description="Calculate FV of a series of equal payments."
      fields={[
        { key: "pmt", label: "Payment ($)", placeholder: "200" },
        { key: "rate", label: "Interest Rate (decimal)", placeholder: "0.05" },
        { key: "periods", label: "Number of Periods", placeholder: "10" },
        { key: "type", label: "Annuity Type", type: "select", options: [{ label: "Ordinary", value: "0" }, { label: "Annuity Due", value: "1" }], defaultValue: "0" },
      ]}
      onCalculate={vals => [{ label: "Future Value", value: fmt(tvm.futureValueAnnuity(v(vals,"pmt"), v(vals,"rate"), v(vals,"periods"), vals.type === "1"), 2), highlight: true }]}
    />
  );
  if (moduleId === "tvm" && subId === "pv-annuity") return (
    <CalculatorForm title="Present Value of Annuity" description="Calculate PV of a series of equal payments."
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
    <CalculatorForm title="Loan Payment" description="Calculate periodic loan payment."
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
    />
  );
  if (moduleId === "tvm" && subId === "apr-ear") return (
    <CalculatorForm title="APR ↔ EAR Conversion" description="Convert between APR and EAR."
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

  // Bonds
  if (moduleId === "bonds" && subId === "bond-price") return (
    <CalculatorForm title="Bond Price" description="Price a coupon-paying bond."
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
    <CalculatorForm title="Zero-Coupon Bond Price" description="Price a zero-coupon bond."
      fields={[
        { key: "face", label: "Face Value ($)", placeholder: "1000" },
        { key: "ytm", label: "Yield to Maturity (decimal)", placeholder: "0.05" },
        { key: "years", label: "Years to Maturity", placeholder: "10" },
      ]}
      onCalculate={vals => [{ label: "Price", value: fmt(bonds.zeroCouponBondPrice(v(vals,"face"), v(vals,"ytm"), v(vals,"years")), 2), highlight: true }]}
    />
  );
  if (moduleId === "bonds" && subId === "current-yield") return (
    <CalculatorForm title="Current Yield" description="Calculate bond's current yield."
      fields={[
        { key: "coupon", label: "Coupon Rate (decimal)", placeholder: "0.06" },
        { key: "face", label: "Face Value ($)", placeholder: "1000" },
        { key: "price", label: "Market Price ($)", placeholder: "950" },
      ]}
      onCalculate={vals => [{ label: "Current Yield", value: pct(bonds.currentYield(v(vals,"coupon"), v(vals,"face"), v(vals,"price"))), highlight: true }]}
    />
  );
  if (moduleId === "bonds" && subId === "duration") return (
    <CalculatorForm title="Duration & Convexity" description="Calculate Macaulay/Modified Duration and Convexity."
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

  // Derivatives
  if (moduleId === "derivatives" && subId === "bsm") return (
    <CalculatorForm title="Black-Scholes-Merton" description="Price European call and put options."
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
    />
  );
  if (moduleId === "derivatives" && subId === "greeks") return (
    <CalculatorForm title="Option Greeks" description="Calculate Delta, Gamma, Vega, Theta, and Rho."
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
    <CalculatorForm title="Futures Price" description="Calculate theoretical futures price."
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

  // Capital Budgeting
  if (moduleId === "capital" && subId === "npv") return (
    <CalculatorForm title="Net Present Value (NPV)" description="Enter cash flows as comma-separated values (first is initial investment, typically negative)."
      fields={[
        { key: "rate", label: "Discount Rate (decimal)", placeholder: "0.1" },
        { key: "cashflows", label: "Cash Flows (comma-separated)", placeholder: "-1000,300,400,500,600" },
      ]}
      onCalculate={vals => {
        const cfs = vals.cashflows.split(",").map(s => parseFloat(s.trim()));
        if (cfs.some(isNaN)) throw new Error("Invalid cash flows");
        return [{ label: "NPV", value: fmt(capBudget.npv(v(vals,"rate"), cfs), 2), highlight: true }];
      }}
    />
  );
  if (moduleId === "capital" && subId === "irr") return (
    <CalculatorForm title="Internal Rate of Return (IRR)" description="Enter cash flows as comma-separated values."
      fields={[
        { key: "cashflows", label: "Cash Flows (comma-separated)", placeholder: "-1000,300,400,500,600" },
      ]}
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
    <CalculatorForm title="Payback Period" description="Calculate simple and discounted payback periods."
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
    <CalculatorForm title="Profitability Index" description="Calculate the ratio of PV of future cash flows to initial investment."
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

  // Equity
  if (moduleId === "equity" && subId === "ggm") return (
    <CalculatorForm title="Gordon Growth Model" description="Value a stock based on expected dividends growing at a constant rate."
      fields={[
        { key: "div", label: "Next Year's Dividend ($)", placeholder: "2" },
        { key: "g", label: "Growth Rate (decimal)", placeholder: "0.03" },
        { key: "r", label: "Required Return (decimal)", placeholder: "0.1" },
      ]}
      onCalculate={vals => [{ label: "Intrinsic Value", value: fmt(equity.gordonGrowthModel(v(vals,"div"), v(vals,"g"), v(vals,"r")), 2), highlight: true }]}
    />
  );
  if (moduleId === "equity" && subId === "capm") return (
    <CalculatorForm title="CAPM" description="Calculate expected return using the Capital Asset Pricing Model."
      fields={[
        { key: "rf", label: "Risk-Free Rate (decimal)", placeholder: "0.03" },
        { key: "beta", label: "Beta", placeholder: "1.2" },
        { key: "rm", label: "Market Return (decimal)", placeholder: "0.1" },
      ]}
      onCalculate={vals => [{ label: "Expected Return", value: pct(equity.capm(v(vals,"rf"), v(vals,"beta"), v(vals,"rm"))), highlight: true }]}
    />
  );
  if (moduleId === "equity" && subId === "sharpe") return (
    <CalculatorForm title="Sharpe Ratio" description="Measure risk-adjusted return."
      fields={[
        { key: "rp", label: "Portfolio Return (decimal)", placeholder: "0.12" },
        { key: "rf", label: "Risk-Free Rate (decimal)", placeholder: "0.03" },
        { key: "sigma", label: "Std Deviation (decimal)", placeholder: "0.15" },
      ]}
      onCalculate={vals => [{ label: "Sharpe Ratio", value: fmt(equity.sharpeRatio(v(vals,"rp"), v(vals,"rf"), v(vals,"sigma")), 4), highlight: true }]}
    />
  );
  if (moduleId === "equity" && subId === "wacc") return (
    <CalculatorForm title="WACC" description="Weighted Average Cost of Capital."
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

  // General Tools
  if (moduleId === "general" && subId === "stats") return (
    <CalculatorForm title="Descriptive Statistics" description="Enter comma-separated numbers."
      fields={[
        { key: "data", label: "Data (comma-separated)", placeholder: "10,20,30,40,50" },
      ]}
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
    <CalculatorForm title="Perpetuity Valuation" description="Value a perpetuity (simple or growing)."
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
    <CalculatorForm title="Depreciation" description="Calculate depreciation schedule."
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

const Index = () => {
  const [activeModule, setActiveModule] = useState("tvm");
  const [activeSubCalc, setActiveSubCalc] = useState("fv");
  const [expandedModule, setExpandedModule] = useState("tvm");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleModuleClick = (moduleId: string) => {
    if (expandedModule === moduleId) {
      setExpandedModule("");
    } else {
      setExpandedModule(moduleId);
      const mod = modules.find(m => m.id === moduleId);
      if (mod && mod.subCalcs.length > 0) {
        setActiveModule(moduleId);
        setActiveSubCalc(mod.subCalcs[0].id);
      }
    }
  };

  const handleSubCalcClick = (moduleId: string, subId: string) => {
    setActiveModule(moduleId);
    setActiveSubCalc(subId);
    setSidebarOpen(false);
  };

  const activeModuleData = modules.find(m => m.id === activeModule);
  const activeSubCalcData = activeModuleData?.subCalcs.find(s => s.id === activeSubCalc);

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
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Calculator size={16} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-sidebar-accent-foreground tracking-tight">Financial Calculator</h1>
              <p className="text-[11px] text-sidebar-foreground">Suite</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
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
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{activeModuleData?.label}</span>
            <ChevronRight size={14} />
            <span className="text-foreground font-medium">{activeSubCalcData?.label}</span>
          </div>
        </header>

        {/* Calculator content */}
        <div className="max-w-2xl mx-auto px-6 lg:px-8 py-8">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            {getCalcContent(activeModule, activeSubCalc)}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
