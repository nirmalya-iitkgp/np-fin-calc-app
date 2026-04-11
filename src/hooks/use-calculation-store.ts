import { useState, useCallback, useEffect } from "react";

export interface CalculationRecord {
  id: string;
  moduleId: string;
  subCalcId: string;
  moduleLabel: string;
  subCalcLabel: string;
  inputs: Record<string, string>;
  results: { label: string; value: string | number; highlight?: boolean }[];
  timestamp: number;
  isFavorite: boolean;
}

const HISTORY_KEY = "fc_calc_history";
const MAX_HISTORY = 100;

function loadRecords(): CalculationRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecords(records: CalculationRecord[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(records));
}

export function useCalculationStore() {
  const [records, setRecords] = useState<CalculationRecord[]>(loadRecords);

  useEffect(() => {
    saveRecords(records);
  }, [records]);

  const addRecord = useCallback(
    (entry: Omit<CalculationRecord, "id" | "timestamp" | "isFavorite">) => {
      const record: CalculationRecord = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        isFavorite: false,
      };
      setRecords((prev) => [record, ...prev].slice(0, MAX_HISTORY));
      return record;
    },
    []
  );

  const toggleFavorite = useCallback((id: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setRecords((prev) => prev.filter((r) => r.isFavorite));
  }, []);

  const history = records;
  const favorites = records.filter((r) => r.isFavorite);

  return { history, favorites, addRecord, toggleFavorite, deleteRecord, clearHistory };
}
