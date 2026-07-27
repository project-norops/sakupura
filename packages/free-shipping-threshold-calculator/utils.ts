export type ShippingScenario = {
  id: string;
  threshold: number;
  expectedAddition: number;
};
export type ShippingInputs = {
  averageOrderAmount: number;
  grossMarginRate: number;
  shippingCost: number;
  paymentFeeRate: number;
  scenarios: ShippingScenario[];
};
export type ShippingScenarioResult = ShippingScenario & {
  projectedOrderAmount: number;
  requiredAddition: number;
  shortfall: number;
  qualifies: boolean;
  profitPerOrder: number;
  profitDifference: number;
};

export function compareShippingThresholds(
  inputs: ShippingInputs,
): ShippingScenarioResult[] {
  const margin = inputs.grossMarginRate / 100;
  const payment = inputs.paymentFeeRate / 100;
  const currentProfit =
    inputs.averageOrderAmount * margin - inputs.averageOrderAmount * payment;
  return inputs.scenarios.slice(0, 3).map((scenario) => {
    const projectedOrderAmount =
      inputs.averageOrderAmount + scenario.expectedAddition;
    const requiredAddition = Math.max(
      0,
      scenario.threshold - inputs.averageOrderAmount,
    );
    const shortfall = Math.max(0, scenario.threshold - projectedOrderAmount);
    const qualifies = shortfall === 0;
    const profitPerOrder =
      projectedOrderAmount * margin -
      projectedOrderAmount * payment -
      inputs.shippingCost;
    return {
      ...scenario,
      projectedOrderAmount,
      requiredAddition,
      shortfall,
      qualifies,
      profitPerOrder,
      profitDifference: profitPerOrder - currentProfit,
    };
  });
}
