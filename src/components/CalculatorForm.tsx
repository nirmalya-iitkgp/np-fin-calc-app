import React, { useState } from "react";
import { Download, FileText, BookOpen, ChevronDown } from "lucide-react";
import { exportToCSV, exportToPDF } from "../lib/export-utils";
import type { FormulaDoc } from "../lib/formula-docs";

interface Field {
  key: string;
  label: string;
  placeholder?: string;
  type?: "number" | "text" | "select";
  options?: { label: string; value: string }[];
  defaultValue?: string;
}

export interface Result {
  label: string;
  value: string | number;
  highlight?: boolean;
}

interface CalculatorFormProps {
  title: string;
  description: string;
  fields: Field[];
  onCalculate: (values: Record<string, string>) => Result[];
  onSaveResult?: (inputs: Record<string, string>, results: Result[]) => void;
  formulaDoc?: FormulaDoc;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({ title, description, fields, onCalculate, onSaveResult, formulaDoc }) => {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    fields.forEach(f => { init[f.key] = f.defaultValue || ""; });
    return init;
  });
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  const fieldLabels = Object.fromEntries(fields.map(f => [f.key, f.label]));

  const handleCalculate = () => {
    try {
      setError(null);
      setSaved(false);
      const res = onCalculate(values);
      setResults(res);
      if (onSaveResult) {
        onSaveResult(values, res);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
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

      {/* Formula Documentation */}
      {formulaDoc && (
        <div className="rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setShowFormula(!showFormula)}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <BookOpen size={15} className="text-primary shrink-0" />
            <span>Formula Reference</span>
            <ChevronDown size={14} className={`ml-auto transition-transform duration-200 ${showFormula ? "rotate-180" : ""}`} />
          </button>
          {showFormula && (
            <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border bg-muted/20">
              {/* Formula */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Formula</p>
                <pre className="text-sm font-mono leading-relaxed text-foreground whitespace-pre-wrap bg-muted/40 rounded-md px-3 py-2">
                  {formulaDoc.formula}
                </pre>
              </div>
              {/* Variables */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Variables</p>
                <div className="space-y-1">
                  {formulaDoc.variables.map((v, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="font-mono text-primary font-semibold shrink-0 min-w-[60px]">{v.symbol}</span>
                      <span className="text-muted-foreground">— {v.description}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Notes */}
              {formulaDoc.notes && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{formulaDoc.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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

      <div className="flex flex-wrap gap-3">
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
        {saved && (
          <span className="text-xs text-primary self-center animate-in fade-in">✓ Saved to history</span>
        )}
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

          {/* Export buttons */}
          <div className="flex gap-2 pt-3 border-t border-border mt-3">
            <button
              onClick={() => exportToCSV(title, values, results, fieldLabels)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:opacity-80 transition-opacity"
            >
              <Download size={13} /> CSV
            </button>
            <button
              onClick={() => exportToPDF(title, values, results, fieldLabels)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:opacity-80 transition-opacity"
            >
              <FileText size={13} /> PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
