export type AppDefinition = {
  id: string;
  title: string;
  description: string;
  href: string;
  badge: string;
};

const apps: AppDefinition[] = [
  {
    id: "001-dynamic-pricing",
    title: "動的プライシング・収益シミュレーター",
    description:
      "目標手取り額、原価、決済手数料、販売数を入力して最適な販売単価を計算します。",
    href: "/tools/dynamic-pricing",
    badge: "収益計算",
  },
];

export default apps;
