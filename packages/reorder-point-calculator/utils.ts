export type InventoryInputs = {
  averageWeeklySales: number;
  maximumWeeklySales: number;
  averageLeadTimeDays: number;
  maximumLeadTimeDays: number;
  currentStock: number;
  incomingStock: number;
};

export type InventoryResult = {
  averageDailySales: number;
  inventoryPosition: number;
  safetyStock: number;
  reorderPoint: number;
  daysUntilReorder: number;
  recommendedOrderQuantity: number;
  status: "now" | "soon" | "later";
};

export function calculateReorderPoint(inputs: InventoryInputs): InventoryResult {
  const averageDailySales = inputs.averageWeeklySales / 7;
  const maximumDailySales = inputs.maximumWeeklySales / 7;
  const inventoryPosition = inputs.currentStock + inputs.incomingStock;
  const safetyStockRaw = Math.max(
    0,
    maximumDailySales * inputs.maximumLeadTimeDays -
      averageDailySales * inputs.averageLeadTimeDays,
  );
  const safetyStock = Math.ceil(safetyStockRaw);
  const reorderPoint = Math.ceil(
    averageDailySales * inputs.averageLeadTimeDays + safetyStockRaw,
  );
  const daysUntilReorder = Math.max(
    0,
    (inventoryPosition - reorderPoint) / averageDailySales,
  );
  const recommendedOrderQuantity = Math.ceil(
    Math.max(0, reorderPoint + inputs.averageWeeklySales - inventoryPosition),
  );
  const status =
    inventoryPosition <= reorderPoint
      ? "now"
      : daysUntilReorder <= inputs.averageLeadTimeDays
        ? "soon"
        : "later";

  return {
    averageDailySales,
    inventoryPosition,
    safetyStock,
    reorderPoint,
    daysUntilReorder,
    recommendedOrderQuantity,
    status,
  };
}
