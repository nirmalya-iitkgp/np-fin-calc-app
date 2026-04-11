interface ExportResult {
  label: string;
  value: string | number;
}

export function exportToCSV(
  title: string,
  inputs: Record<string, string>,
  results: ExportResult[],
  fieldLabels?: Record<string, string>
) {
  const lines: string[] = [];
  lines.push("Financial Calculator - " + title);
  lines.push("Generated," + new Date().toLocaleString());
  lines.push("");
  lines.push("INPUTS");
  lines.push("Parameter,Value");
  for (const [key, val] of Object.entries(inputs)) {
    const label = fieldLabels?.[key] || key;
    lines.push(`"${label}","${val}"`);
  }
  lines.push("");
  lines.push("RESULTS");
  lines.push("Metric,Value");
  for (const r of results) {
    lines.push(`"${r.label}","${r.value}"`);
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `${title.replace(/\s+/g, "_")}_${Date.now()}.csv`);
}

export function exportToPDF(
  title: string,
  inputs: Record<string, string>,
  results: ExportResult[],
  fieldLabels?: Record<string, string>
) {
  // Build a simple HTML table and use print-to-PDF
  const html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body { font-family: Arial, sans-serif; margin: 40px; color: #1a1a1a; }
  h1 { font-size: 20px; border-bottom: 2px solid #10b981; padding-bottom: 8px; }
  h2 { font-size: 14px; color: #555; margin-top: 24px; }
  table { border-collapse: collapse; width: 100%; margin-top: 8px; }
  th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 13px; }
  th { background: #f5f5f5; font-weight: 600; }
  .highlight { color: #10b981; font-weight: 700; }
  .timestamp { color: #999; font-size: 11px; margin-top: 4px; }
</style></head><body>
<h1>${title}</h1>
<p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
<h2>Inputs</h2>
<table><tr><th>Parameter</th><th>Value</th></tr>
${Object.entries(inputs)
  .map(([k, val]) => `<tr><td>${fieldLabels?.[k] || k}</td><td>${val}</td></tr>`)
  .join("")}
</table>
<h2>Results</h2>
<table><tr><th>Metric</th><th>Value</th></tr>
${results
  .map((r) => `<tr><td>${r.label}</td><td class="highlight">${r.value}</td></tr>`)
  .join("")}
</table>
</body></html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 400);
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
