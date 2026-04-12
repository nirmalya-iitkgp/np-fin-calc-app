import React from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  Cell
} from "recharts";

const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  secondary: "hsl(var(--muted-foreground))",
  accent: "hsl(var(--accent))",
  destructive: "hsl(var(--destructive))",
  green: "#22c55e",
  blue: "#3b82f6",
  orange: "#f97316",
  purple: "#a855f7",
};

const chartWrapper = "mt-4 rounded-lg border border-border bg-muted/10 p-4";
const chartTitle = "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3";

// ─── FV Growth Chart ───
export function FVGrowthChart({ pv, rate, periods }: { pv: number; rate: number; periods: number }) {
  const data = [];
  for (let t = 0; t <= periods; t++) {
    data.push({ year: t, value: pv * Math.pow(1 + rate, t) });
  }
  return (
    <div className={chartWrapper}>
      <p className={chartTitle}>Growth Over Time</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Value"]} />
          <Area type="monotone" dataKey="value" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.15} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── FV Annuity Growth Chart ───
export function FVAnnuityChart({ pmt, rate, periods, isDue }: { pmt: number; rate: number; periods: number; isDue: boolean }) {
  const data = [];
  let acc = 0;
  for (let t = 1; t <= periods; t++) {
    if (rate === 0) { acc += pmt; }
    else {
      const fva = pmt * ((Math.pow(1 + rate, t) - 1) / rate);
      acc = isDue ? fva * (1 + rate) : fva;
    }
    data.push({ year: t, value: acc, contribution: pmt * t });
  }
  return (
    <div className={chartWrapper}>
      <p className={chartTitle}>Accumulated Value vs Contributions</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip formatter={(v: number, name: string) => [`$${v.toFixed(2)}`, name === "value" ? "Total Value" : "Contributions"]} />
          <Area type="monotone" dataKey="value" stroke={CHART_COLORS.primary} fill={CHART_COLORS.primary} fillOpacity={0.15} strokeWidth={2} name="Total Value" />
          <Area type="monotone" dataKey="contribution" stroke={CHART_COLORS.secondary} fill={CHART_COLORS.secondary} fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" name="Contributions" />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Loan Amortization Chart ───
export function LoanAmortizationChart({ principal, rate, periods }: { principal: number; rate: number; periods: number }) {
  if (rate === 0) return null;
  const pmt = principal * (rate * Math.pow(1 + rate, periods)) / (Math.pow(1 + rate, periods) - 1);
  const data = [];
  let balance = principal;
  // Show max 60 data points for readability
  const step = Math.max(1, Math.floor(periods / 60));
  for (let t = 1; t <= periods; t += step) {
    const interest = balance * rate;
    const prinPaid = pmt - interest;
    data.push({ period: t, principal: prinPaid, interest, balance });
    balance -= prinPaid;
    // Advance for step > 1
    for (let s = 1; s < step && t + s <= periods; s++) {
      const int2 = balance * rate;
      balance -= (pmt - int2);
    }
  }
  return (
    <div className={chartWrapper}>
      <p className={chartTitle}>Payment Breakdown (Principal vs Interest)</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} stackOffset="none">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${v.toFixed(0)}`} />
          <Tooltip formatter={(v: number, name: string) => [`$${v.toFixed(2)}`, name]} />
          <Bar dataKey="principal" stackId="a" fill={CHART_COLORS.green} name="Principal" />
          <Bar dataKey="interest" stackId="a" fill={CHART_COLORS.orange} name="Interest" />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── NPV Cash Flow Chart ───
export function NPVCashFlowChart({ rate, cashflows }: { rate: number; cashflows: number[] }) {
  let cumulative = 0;
  const data = cashflows.map((cf, i) => {
    const dcf = cf / Math.pow(1 + rate, i);
    cumulative += dcf;
    return { period: `T${i}`, cashflow: cf, dcf: parseFloat(dcf.toFixed(2)), cumulative: parseFloat(cumulative.toFixed(2)) };
  });
  return (
    <div className={chartWrapper}>
      <p className={chartTitle}>Cash Flow Analysis</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="period" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip />
          <Bar dataKey="dcf" name="Discounted CF">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.dcf >= 0 ? CHART_COLORS.green : CHART_COLORS.destructive} />
            ))}
          </Bar>
          <Line type="monotone" dataKey="cumulative" stroke={CHART_COLORS.primary} strokeWidth={2} name="Cumulative" />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── BSM Payoff Diagram ───
export function BSMPayoffChart({ K, callPrice, putPrice }: { K: number; callPrice: number; putPrice: number }) {
  const data = [];
  const range = K * 0.6;
  for (let s = K - range; s <= K + range; s += range / 25) {
    const callPayoff = Math.max(0, s - K) - callPrice;
    const putPayoff = Math.max(0, K - s) - putPrice;
    data.push({ spot: parseFloat(s.toFixed(2)), call: parseFloat(callPayoff.toFixed(2)), put: parseFloat(putPayoff.toFixed(2)) });
  }
  return (
    <div className={chartWrapper}>
      <p className={chartTitle}>Option P&L at Expiry</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="spot" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: "Spot", position: "bottom", fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip />
          <Line type="monotone" dataKey="call" stroke={CHART_COLORS.green} strokeWidth={2} dot={false} name="Call P&L" />
          <Line type="monotone" dataKey="put" stroke={CHART_COLORS.destructive} strokeWidth={2} dot={false} name="Put P&L" />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Yield Curve Chart (Nelson-Siegel / Svensson) ───
export function YieldCurveChart({ yieldFn, maxMaturity = 30 }: { yieldFn: (m: number) => number; maxMaturity?: number }) {
  const data = [];
  for (let m = 0.25; m <= maxMaturity; m += 0.25) {
    data.push({ maturity: m, yield: parseFloat((yieldFn(m) * 100).toFixed(4)) });
  }
  return (
    <div className={chartWrapper}>
      <p className={chartTitle}>Yield Curve</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="maturity" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" label={{ value: "Maturity (yrs)", position: "bottom", fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit="%" />
          <Tooltip formatter={(v: number) => [`${v.toFixed(4)}%`, "Yield"]} />
          <Line type="monotone" dataKey="yield" stroke={CHART_COLORS.primary} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Bootstrap Spot Rates Chart ───
export function SpotRatesChart({ maturities, spotRates }: { maturities: number[]; spotRates: number[] }) {
  const data = maturities.map((m, i) => ({ maturity: `${m}Y`, rate: parseFloat((spotRates[i] * 100).toFixed(4)) }));
  return (
    <div className={chartWrapper}>
      <p className={chartTitle}>Spot Rate Term Structure</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="maturity" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit="%" />
          <Tooltip formatter={(v: number) => [`${v.toFixed(4)}%`, "Spot Rate"]} />
          <Bar dataKey="rate" fill={CHART_COLORS.primary} name="Spot Rate" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Depreciation Schedule Chart ───
export function DepreciationChart({ schedule }: { schedule: { year: number; depreciation: number; bookValue: number }[] }) {
  return (
    <div className={chartWrapper}>
      <p className={chartTitle}>Depreciation Schedule</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={schedule}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${v}`} />
          <Tooltip formatter={(v: number, name: string) => [`$${v.toFixed(2)}`, name]} />
          <Bar dataKey="depreciation" fill={CHART_COLORS.orange} name="Depreciation" radius={[4, 4, 0, 0]} />
          <Bar dataKey="bookValue" fill={CHART_COLORS.blue} name="Book Value" radius={[4, 4, 0, 0]} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Income Statement Waterfall ───
export function IncomeStatementChart({ data }: { data: { revenue: number; cogs: number; grossProfit: number; operatingExpenses: number; operatingIncome: number; netIncome: number } }) {
  const items = [
    { name: "Revenue", value: data.revenue },
    { name: "COGS", value: -data.cogs },
    { name: "Gross Profit", value: data.grossProfit },
    { name: "OpEx", value: -data.operatingExpenses },
    { name: "Op. Income", value: data.operatingIncome },
    { name: "Net Income", value: data.netIncome },
  ];
  return (
    <div className={chartWrapper}>
      <p className={chartTitle}>Income Statement Breakdown</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={items}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Amount"]} />
          <Bar dataKey="value" name="Amount" radius={[4, 4, 0, 0]}>
            {items.map((entry, i) => (
              <Cell key={i} fill={entry.value >= 0 ? CHART_COLORS.green : CHART_COLORS.destructive} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Monte Carlo Distribution Chart ───
export function MonteCarloChart({ stats }: { stats: { p5: number; p25: number; median: number; mean: number; p75: number; p95: number } }) {
  const data = [
    { label: "5th %ile", value: stats.p5 },
    { label: "25th %ile", value: stats.p25 },
    { label: "Median", value: stats.median },
    { label: "Mean", value: stats.mean },
    { label: "75th %ile", value: stats.p75 },
    { label: "95th %ile", value: stats.p95 },
  ];
  return (
    <div className={chartWrapper}>
      <p className={chartTitle}>Valuation Distribution</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Value"]} />
          <Bar dataKey="value" fill={CHART_COLORS.purple} name="Valuation" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i === 2 || i === 3 ? CHART_COLORS.primary : CHART_COLORS.purple} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
