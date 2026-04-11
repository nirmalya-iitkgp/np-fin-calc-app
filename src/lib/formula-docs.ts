// Formula documentation for all calculators

export interface FormulaDoc {
  formula: string;
  variables: { symbol: string; description: string }[];
  notes?: string;
}

type FormulaKey = `${string}::${string}`;

export const formulaDocs: Record<FormulaKey, FormulaDoc> = {
  // ─── TIME VALUE OF MONEY ───
  "tvm::fv": {
    formula: "FV = PV × (1 + r)ⁿ",
    variables: [
      { symbol: "FV", description: "Future Value" },
      { symbol: "PV", description: "Present Value" },
      { symbol: "r", description: "Interest rate per period" },
      { symbol: "n", description: "Number of periods" },
    ],
  },
  "tvm::pv": {
    formula: "PV = FV / (1 + r)ⁿ",
    variables: [
      { symbol: "PV", description: "Present Value" },
      { symbol: "FV", description: "Future Value" },
      { symbol: "r", description: "Discount rate per period" },
      { symbol: "n", description: "Number of periods" },
    ],
  },
  "tvm::fv-annuity": {
    formula: "FVA = PMT × [(1 + r)ⁿ − 1] / r\nAnnuity Due: FVA × (1 + r)",
    variables: [
      { symbol: "FVA", description: "Future Value of Annuity" },
      { symbol: "PMT", description: "Periodic payment" },
      { symbol: "r", description: "Interest rate per period" },
      { symbol: "n", description: "Number of periods" },
    ],
  },
  "tvm::pv-annuity": {
    formula: "PVA = PMT × [1 − (1 + r)⁻ⁿ] / r\nAnnuity Due: PVA × (1 + r)",
    variables: [
      { symbol: "PVA", description: "Present Value of Annuity" },
      { symbol: "PMT", description: "Periodic payment" },
      { symbol: "r", description: "Discount rate per period" },
      { symbol: "n", description: "Number of periods" },
    ],
  },
  "tvm::loan": {
    formula: "PMT = P × [r(1 + r)ⁿ] / [(1 + r)ⁿ − 1]",
    variables: [
      { symbol: "PMT", description: "Periodic payment" },
      { symbol: "P", description: "Principal (loan amount)" },
      { symbol: "r", description: "Interest rate per period" },
      { symbol: "n", description: "Total number of payments" },
    ],
  },
  "tvm::apr-ear": {
    formula: "EAR = (1 + APR/m)ᵐ − 1\nAPR = m × [(1 + EAR)^(1/m) − 1]",
    variables: [
      { symbol: "EAR", description: "Effective Annual Rate" },
      { symbol: "APR", description: "Annual Percentage Rate" },
      { symbol: "m", description: "Compounding periods per year" },
    ],
  },

  // ─── FIXED INCOME / BONDS ───
  "bonds::bond-price": {
    formula: "P = Σ [C / (1 + y/f)ᵗ] + F / (1 + y/f)ⁿ\nwhere t = 1 to n, n = years × frequency",
    variables: [
      { symbol: "P", description: "Bond price" },
      { symbol: "C", description: "Coupon payment = (coupon rate × face) / frequency" },
      { symbol: "F", description: "Face value" },
      { symbol: "y", description: "Yield to maturity" },
      { symbol: "f", description: "Coupons per year" },
      { symbol: "n", description: "Total coupon periods" },
    ],
  },
  "bonds::zero-coupon": {
    formula: "P = F / (1 + y)ⁿ",
    variables: [
      { symbol: "P", description: "Bond price" },
      { symbol: "F", description: "Face value" },
      { symbol: "y", description: "Yield to maturity" },
      { symbol: "n", description: "Years to maturity" },
    ],
  },
  "bonds::current-yield": {
    formula: "CY = (Coupon Rate × Face Value) / Market Price",
    variables: [
      { symbol: "CY", description: "Current yield" },
    ],
  },
  "bonds::duration": {
    formula: "MacDur = [Σ t × CFₜ / (1 + y/f)ᵗ] / P\nModDur = MacDur / (1 + y/f)\nConvexity = [Σ t(t+1) × CFₜ / (1 + y/f)^(t+2)] / (P × f²)",
    variables: [
      { symbol: "MacDur", description: "Macaulay Duration (weighted avg time)" },
      { symbol: "ModDur", description: "Modified Duration (price sensitivity)" },
      { symbol: "CFₜ", description: "Cash flow at period t" },
      { symbol: "P", description: "Bond price" },
      { symbol: "y", description: "Yield to maturity" },
      { symbol: "f", description: "Coupon frequency" },
    ],
    notes: "Duration measures interest rate sensitivity. A 1% yield change moves price ≈ −ModDur × ΔY + ½ × Convexity × (ΔY)².",
  },

  // ─── DERIVATIVES ───
  "derivatives::bsm": {
    formula: "C = S·N(d₁) − K·e⁻ʳᵀ·N(d₂)\nP = K·e⁻ʳᵀ·N(−d₂) − S·N(−d₁)\nd₁ = [ln(S/K) + (r + σ²/2)T] / (σ√T)\nd₂ = d₁ − σ√T",
    variables: [
      { symbol: "C, P", description: "Call / Put option price" },
      { symbol: "S", description: "Current spot price" },
      { symbol: "K", description: "Strike price" },
      { symbol: "r", description: "Risk-free rate" },
      { symbol: "T", description: "Time to expiration (years)" },
      { symbol: "σ", description: "Volatility of underlying" },
      { symbol: "N(·)", description: "Standard normal CDF" },
    ],
    notes: "Assumes European options, no dividends, constant volatility, and log-normal returns.",
  },
  "derivatives::greeks": {
    formula: "Δ_call = N(d₁), Δ_put = N(d₁) − 1\nΓ = φ(d₁) / (Sσ√T)\nν = Sφ(d₁)√T / 100\nΘ_call = −[Sφ(d₁)σ/(2√T)] − rKe⁻ʳᵀN(d₂)\nρ_call = KTe⁻ʳᵀN(d₂) / 100",
    variables: [
      { symbol: "Δ (Delta)", description: "Rate of change of option price w.r.t. underlying" },
      { symbol: "Γ (Gamma)", description: "Rate of change of Delta" },
      { symbol: "ν (Vega)", description: "Sensitivity to volatility (per 1%)" },
      { symbol: "Θ (Theta)", description: "Time decay (per day)" },
      { symbol: "ρ (Rho)", description: "Sensitivity to interest rate (per 1%)" },
      { symbol: "φ(·)", description: "Standard normal PDF" },
    ],
  },
  "derivatives::futures": {
    formula: "F = S × e^(r + u − y)T",
    variables: [
      { symbol: "F", description: "Futures price" },
      { symbol: "S", description: "Spot price" },
      { symbol: "r", description: "Risk-free rate" },
      { symbol: "u", description: "Storage cost rate" },
      { symbol: "y", description: "Convenience yield" },
      { symbol: "T", description: "Time to maturity" },
    ],
  },

  // ─── CAPITAL BUDGETING ───
  "capital::npv": {
    formula: "NPV = Σ CFₜ / (1 + r)ᵗ, for t = 0, 1, …, n",
    variables: [
      { symbol: "NPV", description: "Net Present Value" },
      { symbol: "CFₜ", description: "Cash flow at time t (CF₀ is typically negative)" },
      { symbol: "r", description: "Discount rate" },
    ],
    notes: "Accept projects with NPV > 0.",
  },
  "capital::irr": {
    formula: "0 = Σ CFₜ / (1 + IRR)ᵗ\nSolved iteratively via Newton-Raphson method.",
    variables: [
      { symbol: "IRR", description: "Internal Rate of Return — rate that makes NPV = 0" },
      { symbol: "CFₜ", description: "Cash flow at time t" },
    ],
    notes: "Accept projects where IRR > cost of capital. Uses Newton-Raphson with max 1000 iterations.",
  },
  "capital::payback": {
    formula: "Simple: Find t where Σ CFₖ ≥ I₀ (k = 1..t)\nDiscounted: Find t where Σ CFₖ/(1+r)ᵏ ≥ I₀",
    variables: [
      { symbol: "I₀", description: "Initial investment" },
      { symbol: "CFₖ", description: "Cash flow in period k" },
      { symbol: "r", description: "Discount rate (for DPP)" },
    ],
    notes: "Interpolates between periods for fractional payback. Returns null if never recovered.",
  },
  "capital::pi": {
    formula: "PI = [Σ CFₜ / (1 + r)ᵗ] / I₀, for t = 1, …, n",
    variables: [
      { symbol: "PI", description: "Profitability Index" },
      { symbol: "CFₜ", description: "Future cash flows" },
      { symbol: "I₀", description: "Initial investment" },
      { symbol: "r", description: "Discount rate" },
    ],
    notes: "Accept projects with PI > 1.",
  },

  // ─── EQUITY & PORTFOLIO ───
  "equity::ggm": {
    formula: "P₀ = D₁ / (r − g)",
    variables: [
      { symbol: "P₀", description: "Intrinsic stock price" },
      { symbol: "D₁", description: "Expected next-period dividend" },
      { symbol: "r", description: "Required rate of return" },
      { symbol: "g", description: "Constant dividend growth rate" },
    ],
    notes: "Requires r > g. Returns Infinity otherwise.",
  },
  "equity::capm": {
    formula: "E(Rᵢ) = Rᶠ + βᵢ × [E(Rₘ) − Rᶠ]",
    variables: [
      { symbol: "E(Rᵢ)", description: "Expected return of asset i" },
      { symbol: "Rᶠ", description: "Risk-free rate" },
      { symbol: "βᵢ", description: "Systematic risk (beta)" },
      { symbol: "E(Rₘ)", description: "Expected market return" },
    ],
  },
  "equity::sharpe": {
    formula: "SR = (Rₚ − Rᶠ) / σₚ",
    variables: [
      { symbol: "SR", description: "Sharpe Ratio" },
      { symbol: "Rₚ", description: "Portfolio return" },
      { symbol: "Rᶠ", description: "Risk-free rate" },
      { symbol: "σₚ", description: "Portfolio standard deviation" },
    ],
    notes: "Higher values indicate better risk-adjusted returns.",
  },
  "equity::wacc": {
    formula: "WACC = wₑ·kₑ + w_d·k_d·(1 − t)",
    variables: [
      { symbol: "wₑ, w_d", description: "Equity and debt weights" },
      { symbol: "kₑ", description: "Cost of equity" },
      { symbol: "k_d", description: "Cost of debt" },
      { symbol: "t", description: "Corporate tax rate" },
    ],
    notes: "Debt gets a tax shield because interest is tax-deductible.",
  },

  // ─── COMMODITY & REAL ESTATE ───
  "commodity::comm-futures": {
    formula: "F = S × e^(r + u − y)T",
    variables: [
      { symbol: "F", description: "Futures price" },
      { symbol: "S", description: "Spot price" },
      { symbol: "r", description: "Risk-free rate" },
      { symbol: "u", description: "Storage cost rate" },
      { symbol: "y", description: "Convenience yield" },
      { symbol: "T", description: "Time to maturity" },
    ],
  },
  "commodity::schwartz-smith": {
    formula: "ln F(T) = E[χₜ]e⁻ᵏᵀ + (ζₜ + rT) + ½·Var\nVar = σ²χ(1−e⁻²ᵏᵀ)/(2κ) + σ²ζ·T + 2ρσχσζ(1−e⁻ᵏᵀ)/κ",
    variables: [
      { symbol: "χₜ", description: "Short-term mean-reverting factor" },
      { symbol: "ζₜ", description: "Long-term equilibrium price factor" },
      { symbol: "κ", description: "Mean reversion speed" },
      { symbol: "σχ, σζ", description: "Short-term and long-term volatilities" },
      { symbol: "ρ", description: "Correlation between factors" },
    ],
    notes: "Two-factor model separating transient shocks from permanent price level changes.",
  },
  "commodity::re-terminal": {
    formula: "TV = NOI / (Cap Rate − g)",
    variables: [
      { symbol: "TV", description: "Terminal value of property" },
      { symbol: "NOI", description: "Net Operating Income (next period)" },
      { symbol: "Cap Rate", description: "Exit capitalization rate" },
      { symbol: "g", description: "Long-term growth rate" },
    ],
    notes: "Exit cap rate must exceed growth rate. Analogous to Gordon Growth Model.",
  },

  // ─── PRIVATE MARKETS & CREDIT RISK ───
  "private::illiquidity": {
    formula: "Put = K·e⁻ʳᵀ·N(−d₂) − V·N(−d₁)\nK = V × (1 − liquidation cost)\nDiscount = Put / V",
    variables: [
      { symbol: "Put", description: "Put option value (illiquidity cost)" },
      { symbol: "V", description: "Asset value" },
      { symbol: "K", description: "Effective floor price after liquidation costs" },
      { symbol: "r", description: "Risk-free rate + g-spread" },
      { symbol: "σ", description: "Asset volatility" },
      { symbol: "T", description: "Holding period" },
    ],
    notes: "Models illiquidity as a put option — the cost of being unable to sell at the optimal time.",
  },
  "private::merton": {
    formula: "E = V·N(d₁) − D·e⁻ʳᵀ·N(d₂)\nσ_E = V·N(d₁)·σ_V / E\nd₁ = [ln(V/D) + (r + σ²_V/2)T] / (σ_V√T)",
    variables: [
      { symbol: "V", description: "Total asset value (implied)" },
      { symbol: "E", description: "Equity market value" },
      { symbol: "D", description: "Face value of debt" },
      { symbol: "σ_V", description: "Asset volatility (implied)" },
      { symbol: "σ_E", description: "Equity volatility (observed)" },
      { symbol: "DD", description: "Distance to default = d₂" },
      { symbol: "PD", description: "Probability of default = N(−d₂)" },
    ],
    notes: "Solves two nonlinear equations iteratively to find implied asset value and volatility.",
  },
  "private::mc-pe": {
    formula: "Val = Σ FCFₜ/(1+DR)ᵗ + (FCFₙ × EM)/(1+DR)ⁿ\nDR ~ N(μ_DR, σ_DR), EM ~ N(μ_EM, σ_EM)",
    variables: [
      { symbol: "FCFₜ", description: "Free cash flow at period t" },
      { symbol: "DR", description: "Discount rate (random, normally distributed)" },
      { symbol: "EM", description: "Exit multiple (random, normally distributed)" },
      { symbol: "n", description: "Number of projection periods" },
    ],
    notes: "Monte Carlo simulation with Box-Muller normal random generation. DR floored at 1%, EM floored at 0.",
  },

  // ─── YIELD CURVE MODELS ───
  "yieldcurve::nelson-siegel": {
    formula: "y(m) = β₀ + β₁·[(1−e⁻ᵐ/τ)/(m/τ)] + β₂·[(1−e⁻ᵐ/τ)/(m/τ) − e⁻ᵐ/τ]",
    variables: [
      { symbol: "y(m)", description: "Spot yield at maturity m" },
      { symbol: "β₀", description: "Long-term level (asymptote)" },
      { symbol: "β₁", description: "Short-term component (slope)" },
      { symbol: "β₂", description: "Medium-term component (curvature)" },
      { symbol: "τ", description: "Decay parameter" },
    ],
    notes: "At m = 0: y = β₀ + β₁. As m → ∞: y → β₀.",
  },
  "yieldcurve::svensson": {
    formula: "y(m) = β₀ + β₁·f₁ + β₂·(f₁ − e⁻ᵐ/τ₁) + β₃·(f₂ − e⁻ᵐ/τ₂)\nwhere fᵢ = (1−e⁻ᵐ/τᵢ)/(m/τᵢ)",
    variables: [
      { symbol: "β₃", description: "Second curvature term" },
      { symbol: "τ₁, τ₂", description: "Two decay parameters" },
    ],
    notes: "Extends Nelson-Siegel with a second hump to fit more complex yield curve shapes.",
  },
  "yieldcurve::forward-rate": {
    formula: "f(t₁, t₂) = [(1 + s₂)^t₂ / (1 + s₁)^t₁]^(1/(t₂−t₁)) − 1",
    variables: [
      { symbol: "f(t₁,t₂)", description: "Forward rate from t₁ to t₂" },
      { symbol: "s₁, s₂", description: "Spot rates at maturities t₁ and t₂" },
    ],
    notes: "Derived from the no-arbitrage condition between spot rates.",
  },
  "yieldcurve::bootstrap": {
    formula: "For t=1: spot₁ = par₁\nFor t>1: (1 + coupon)/(1 + spotₜ)^T = 1 + coupon − Σ coupon/(1 + spotⱼ)^Tⱼ",
    variables: [
      { symbol: "spotₜ", description: "Bootstrapped spot rate for maturity t" },
      { symbol: "parₜ", description: "Par yield for maturity t" },
    ],
    notes: "Sequentially solves for spot rates using previously derived rates.",
  },

  // ─── QUEUING THEORY ───
  "queuing::mm1": {
    formula: "ρ = λ/μ\nL = ρ/(1−ρ)\nLq = ρ²/(1−ρ)\nW = 1/(μ−λ)\nWq = λ/[μ(μ−λ)]\nP₀ = 1−ρ",
    variables: [
      { symbol: "λ", description: "Arrival rate" },
      { symbol: "μ", description: "Service rate" },
      { symbol: "ρ", description: "Server utilization" },
      { symbol: "L", description: "Average number in system" },
      { symbol: "Lq", description: "Average number in queue" },
      { symbol: "W", description: "Average time in system" },
      { symbol: "Wq", description: "Average time in queue" },
    ],
    notes: "Requires λ < μ for stability. Uses Little's Law: L = λW.",
  },
  "queuing::mmc": {
    formula: "ρ = λ/(cμ)\nP(wait) = C(c, λ/μ) [Erlang-C]\nLq = P(wait)·(λ/μ)/(1−ρ)\nWq = Lq/λ, W = Wq + 1/μ, L = λW",
    variables: [
      { symbol: "c", description: "Number of servers" },
      { symbol: "C(c, a)", description: "Erlang-C formula" },
      { symbol: "λ", description: "Arrival rate" },
      { symbol: "μ", description: "Service rate per server" },
    ],
    notes: "Requires λ < cμ for stability. Erlang-C uses factorials for c terms.",
  },

  // ─── OPERATIONS FINANCE ───
  "operations::eoq": {
    formula: "Q* = √(2DS / H)\nTotal Cost = (D/Q*)S + (Q*/2)H",
    variables: [
      { symbol: "Q*", description: "Economic Order Quantity" },
      { symbol: "D", description: "Annual demand" },
      { symbol: "S", description: "Ordering cost per order" },
      { symbol: "H", description: "Holding cost per unit per year" },
    ],
    notes: "Minimizes total inventory cost (ordering + holding). Assumes constant demand.",
  },
  "operations::rop": {
    formula: "ROP = d × L + SS\nSS = z × σ_d × √L",
    variables: [
      { symbol: "ROP", description: "Reorder Point" },
      { symbol: "d", description: "Average daily demand" },
      { symbol: "L", description: "Lead time (days)" },
      { symbol: "SS", description: "Safety stock" },
      { symbol: "z", description: "Z-score for service level" },
      { symbol: "σ_d", description: "Standard deviation of daily demand" },
    ],
    notes: "z is derived from the inverse normal CDF of the service level.",
  },
  "operations::newsvendor": {
    formula: "CR = Cᵤ / (Cᵤ + Cₒ)\nNormal: Q* = μ + σ·Φ⁻¹(CR)\nUniform: Q* = a + CR·(b − a)",
    variables: [
      { symbol: "CR", description: "Critical ratio" },
      { symbol: "Cᵤ", description: "Cost of understock (shortage)" },
      { symbol: "Cₒ", description: "Cost of overstock (excess)" },
      { symbol: "Q*", description: "Optimal order quantity" },
      { symbol: "Φ⁻¹", description: "Inverse normal CDF" },
    ],
    notes: "Single-period stocking decision under demand uncertainty.",
  },

  // ─── FINANCIAL ACCOUNTING ───
  "accounting::income-stmt": {
    formula: "Gross Profit = Revenue − COGS\nOperating Income = Gross Profit − OpEx\nEBT = Operating Income − Interest\nNet Income = EBT − Taxes",
    variables: [
      { symbol: "COGS", description: "Cost of Goods Sold = Revenue × COGS%" },
      { symbol: "OpEx", description: "Operating Expenses = Revenue × OpEx%" },
      { symbol: "EBT", description: "Earnings Before Tax" },
    ],
    notes: "Tax expense is max(0, EBT × tax rate) — no taxes on losses.",
  },
  "accounting::balance-sheet": {
    formula: "Current Assets = Cash + Receivables + Inventory\nTotal Assets = Current Assets + Fixed Assets\nEquity = Total Assets − Total Liabilities",
    variables: [
      { symbol: "Assets", description: "Resources owned by the company" },
      { symbol: "Liabilities", description: "Current + Long-term obligations" },
      { symbol: "Equity", description: "Residual ownership = A − L" },
    ],
    notes: "Fundamental accounting equation: Assets = Liabilities + Equity.",
  },
  "accounting::ratios": {
    formula: "Gross Margin = GP / Rev\nOp. Margin = OI / Rev\nNet Margin = NI / Rev\nCurrent Ratio = CA / CL\nD/E = TL / Eq\nROE = NI / Eq\nROA = NI / TA",
    variables: [
      { symbol: "GP", description: "Gross Profit" },
      { symbol: "OI", description: "Operating Income" },
      { symbol: "NI", description: "Net Income" },
      { symbol: "CA, CL", description: "Current Assets, Current Liabilities" },
      { symbol: "TA, TL", description: "Total Assets, Total Liabilities" },
      { symbol: "Eq", description: "Shareholders' Equity" },
    ],
  },

  // ─── GENERAL TOOLS ───
  "general::stats": {
    formula: "Mean = Σxᵢ / n\nVariance = Σ(xᵢ − x̄)² / (n−1)\nStd Dev = √Variance",
    variables: [
      { symbol: "x̄", description: "Sample mean" },
      { symbol: "n", description: "Number of data points" },
    ],
    notes: "Uses sample variance (n−1 denominator, Bessel's correction). Median is middle value of sorted data.",
  },
  "general::perpetuity": {
    formula: "PV = CF / r (simple)\nPV = CF / (r − g) (growing, requires r > g)",
    variables: [
      { symbol: "PV", description: "Present value of perpetuity" },
      { symbol: "CF", description: "Periodic cash flow" },
      { symbol: "r", description: "Discount rate" },
      { symbol: "g", description: "Growth rate" },
    ],
  },
  "general::depreciation": {
    formula: "Straight-Line: Dep = (Cost − Salvage) / Life\nDDB: Dep = BV × (2/Life), capped at BV − Salvage",
    variables: [
      { symbol: "BV", description: "Book value at start of period" },
      { symbol: "Cost", description: "Original asset cost" },
      { symbol: "Salvage", description: "Estimated residual value" },
      { symbol: "Life", description: "Useful life in years" },
    ],
    notes: "DDB (Double Declining Balance) accelerates depreciation. Switches implicitly when DDB dep exceeds remaining depreciable amount.",
  },
};

export function getFormulaDoc(moduleId: string, subId: string): FormulaDoc | undefined {
  return formulaDocs[`${moduleId}::${subId}` as FormulaKey];
}
