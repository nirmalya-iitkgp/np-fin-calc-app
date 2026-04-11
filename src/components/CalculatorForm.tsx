import React, { useState } from "react";

interface Field {
  key: string;
  label: string;
  placeholder?: string;
  type?: "number" | "text" | "select";
  options?: { label: string; value: string }[];
  defaultValue?: string;
}

interface Result {
  label: string;
  value: string | number;
  highlight?: boolean;
}

interface CalculatorFormProps {
  title: string;
  description: string;
  fields: Field[];
  onCalculate: (values: Record<string, string>) => Result[];
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({ title, description, fields, onCalculate }) => {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    fields.forEach(f => { init[f.key] = f.defaultValue || ""; });
    return init;
  });
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    try {
      setError(null);
      const res = onCalculate(values);
      setResults(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Calculation error");
      setResults(null);
    }
  };

  const handleClear = () => {
    const init: Record<string, string> = {};
    fields.forEach(f => { init[f.key] = f.defaultValue || ""; });
    setValues(init);
    setResults(null);
    setError(null);
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="calc-section-title">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(field => (
          <div key={field.key}>
            <label className="calc-label">{field.label}</label>
            {field.type === "select" && field.options ? (
              <select
                className="calc-input w-full"
                value={values[field.key]}
                onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
              >
                {field.options.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                className="calc-input w-full"
                placeholder={field.placeholder}
                value={values[field.key]}
                onChange={e => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && handleCalculate()}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCalculate}
          className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Calculate
        </button>
        <button
          onClick={handleClear}
          className="px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:opacity-80 transition-opacity"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {results && results.length > 0 && (
        <div className="calc-result space-y-2">
          {results.map((r, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-muted-foreground">{r.label}</span>
              <span className={r.highlight ? "text-primary font-bold text-base" : "font-semibold"}>
                {typeof r.value === "number" ? r.value.toLocaleString(undefined, { maximumFractionDigits: 6 }) : r.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
