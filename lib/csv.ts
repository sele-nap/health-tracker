type CellValue = string | number | boolean | null | undefined;

function escape(value: CellValue): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsv(columns: string[], rows: CellValue[][]): string {
  const header = columns.map(escape).join(",");
  const body = rows.map((row) => row.map(escape).join(",")).join("\r\n");
  return `\uFEFF${header}\r\n${body}`;
}
