import { calculateInvoice, formatYen, nextDocumentNumber } from "./utils";

describe("invoice utilities", () => {
  test("calculates mixed tax rates", () => {
    const result = calculateInvoice([
      { id: "1", description: "A", quantity: 2, unitPrice: 1000, taxRate: 10 },
      { id: "2", description: "B", quantity: 1, unitPrice: 1000, taxRate: 8 },
    ]);
    expect(result).toMatchObject({ subtotal: 3000, tax: 280, total: 3280 });
  });
  test("uses tax exempt lines", () =>
    expect(
      calculateInvoice([
        { id: "1", description: "A", quantity: 1, unitPrice: 1000, taxRate: 0 },
      ]).total,
    ).toBe(1000));
  test("creates deterministic document number", () =>
    expect(nextDocumentNumber("INV", new Date(2026, 6, 26))).toBe(
      "INV-20260726-001",
    ));
  test("formats yen", () => expect(formatYen(1234)).toContain("1,234"));
});
