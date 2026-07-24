export type AppDefinition = {
  id: string;
  title: string;
  description: string;
  href: string | null;
  badge: string;
};

const configuredDynamicPricingUrl =
  process.env.NEXT_PUBLIC_DYNAMIC_PRICING_URL?.trim();

const dynamicPricingUrl =
  configuredDynamicPricingUrl ||
  (process.env.NODE_ENV === "development" ? "http://localhost:3001" : null);

const apps: AppDefinition[] = [
  {
    id: "001-dynamic-pricing",
    title: "動的プライシング・収益シミュレーター",
    description:
      "目標手取り額、原価、決済手数料、販売数を入力して最適な販売単価を計算します。",
    href: dynamicPricingUrl,
    badge: "収益計算",
  },
];

export default apps;
