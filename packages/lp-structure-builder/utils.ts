export type LpSection = { id: string; name: string; purpose: string };
export type OutputMode = "document" | "notion";

export const PRESETS: Record<string, Omit<LpSection, "id">[]> = {
  service: [
    {
      name: "ファーストビュー",
      purpose: "誰の、どんな悩みを解決するサービスかを一言で伝える",
    },
    { name: "よくある悩み", purpose: "訪問者が抱える課題を具体的に並べる" },
    { name: "解決方法", purpose: "サービスが課題を解決できる理由を示す" },
    { name: "特徴・メリット", purpose: "選ばれる理由を3点程度に整理する" },
    { name: "利用の流れ", purpose: "申込みから利用開始までの手順を示す" },
    { name: "料金", purpose: "プランと含まれる内容を明確にする" },
    { name: "よくある質問", purpose: "申込み前の不安を解消する" },
    { name: "最終CTA", purpose: "行動を促すボタンと安心材料を置く" },
  ],
  product: [
    {
      name: "商品ビジュアル",
      purpose: "商品名・魅力・購入ボタンを最初に見せる",
    },
    { name: "利用シーン", purpose: "商品を使った後の変化を想像させる" },
    { name: "こだわり", purpose: "素材・製法・機能の違いを説明する" },
    { name: "お客様の声", purpose: "具体的な感想で信頼を補強する" },
    { name: "仕様・配送", purpose: "サイズ、内容、配送条件を明記する" },
    { name: "よくある質問", purpose: "購入前の疑問を解消する" },
    { name: "購入CTA", purpose: "価格と購入ボタンを再掲する" },
  ],
  event: [
    { name: "イベント概要", purpose: "日時・場所・対象・価値を伝える" },
    { name: "こんな方におすすめ", purpose: "参加対象を明確にする" },
    { name: "当日の内容", purpose: "プログラムや得られるものを示す" },
    { name: "登壇者・主催者", purpose: "実績とプロフィールで信頼を示す" },
    { name: "参加方法", purpose: "料金、定員、申込み手順を説明する" },
    { name: "申込みCTA", purpose: "締切と申込みボタンを置く" },
  ],
};

export function createSections(type: keyof typeof PRESETS): LpSection[] {
  return PRESETS[type].map((section, index) => ({
    ...section,
    id: `${type}-${index + 1}`,
  }));
}

export function moveSection(
  items: LpSection[],
  index: number,
  direction: -1 | 1,
): LpSection[] {
  const destination = index + direction;
  if (
    index < 0 ||
    index >= items.length ||
    destination < 0 ||
    destination >= items.length
  )
    return items;
  const next = [...items];
  [next[index], next[destination]] = [next[destination], next[index]];
  return next;
}

export function toMarkdown(
  title: string,
  audience: string,
  sections: LpSection[],
  mode: OutputMode = "document",
): string {
  const heading = title.trim() || "LPタイトル（未入力）";
  const target = audience.trim() || "想定するお客様を記入";
  return [
    `# ${heading}`,
    "",
    `想定読者: ${target}`,
    "",
    ...sections.flatMap((section, index) => {
      const common = [
        `## ${index + 1}. ${section.name}`,
        "",
        `役割: ${section.purpose}`,
        "",
      ];
      return mode === "notion"
        ? [
            ...common,
            "- [ ] 見出しを決める",
            "- [ ] 本文を作成する",
            "- [ ] 画像・実績・リンクを用意する",
            "",
            "メモ:",
            "",
          ]
        : [...common, "本文メモ:", ""];
    }),
  ]
    .join("\n")
    .trim();
}
