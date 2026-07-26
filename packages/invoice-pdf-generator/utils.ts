export type InvoiceLine = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: 10 | 8 | 0;
};

export function calculateInvoice(lines: InvoiceLine[]) {
  const subtotal = lines.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice,
    0,
  );
  const taxByRate = { 10: 0, 8: 0, 0: 0 } as Record<10 | 8 | 0, number>;
  for (const line of lines)
    taxByRate[line.taxRate] += Math.floor(
      (line.quantity * line.unitPrice * line.taxRate) / 100,
    );
  const tax = taxByRate[10] + taxByRate[8];
  return { subtotal, taxByRate, tax, total: subtotal + tax };
}

export function nextDocumentNumber(prefix: "EST" | "INV", date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${prefix}-${y}${m}${d}-001`;
}

export function formatYen(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}
