export const categoryIds = [
  "content-marketing",
  "business-operations",
  "commerce-data",
  "web-design",
] as const;

export type CategoryId = (typeof categoryIds)[number];

export type CategoryDefinition = {
  id: CategoryId;
  name: string;
  shortDescription: string;
  description: string;
  audience: string;
  painPoints: string[];
  accentClass: string;
  badgeClass: string;
  iconClass: string;
  symbol: string;
};

export const categories: CategoryDefinition[] = [
  {
    id: "content-marketing",
    name: "発信・集客",
    shortDescription: "SNS、メール、動画、口コミ対応の発信作業を整えるツール",
    description:
      "SNS投稿、メール配信、YouTube運用、口コミ返信など、情報発信に伴う確認と整形を短時間で終えるための無料ツールをまとめています。投稿先ごとの文字数や書式、視聴者が探しやすい構成、返信時の言葉選びといった細かな作業をブラウザ上で整理できます。",
    audience:
      "個人事業主、小規模店舗の運営者、広報・マーケティング担当者、動画制作者など、少人数で複数の発信先を管理している方に向いています。",
    painPoints: [
      "SNSやメールごとの書式を毎回確認する手間を減らしたい",
      "動画や字幕を公開前に分かりやすく整えたい",
      "口コミへの返信を失礼のない自然な文章で作りたい",
    ],
    accentClass: "border-t-blue-500",
    badgeClass: "bg-blue-50 text-blue-700 ring-blue-200",
    iconClass: "bg-blue-600 text-white",
    symbol: "発",
  },
  {
    id: "business-operations",
    name: "業務効率化",
    shortDescription: "計算、書類、定期業務など日々の事務作業を軽くするツール",
    description:
      "価格決定、作業時間の記録、請求書作成、営業日の計算など、小規模事業で繰り返し発生する事務作業を簡単にする無料ツールをまとめています。大きな業務システムを導入するほどではない作業を、登録なしですぐに処理できます。",
    audience:
      "フリーランス、一人会社、小規模チーム、バックオフィス担当者など、日常業務を少ない入力で確実に終えたい方に向いています。",
    painPoints: [
      "価格や工数を手計算して転記する時間を減らしたい",
      "単発の見積書・請求書やメール署名をすぐ作りたい",
      "定期作業や営業日基準の期限を忘れず管理したい",
    ],
    accentClass: "border-t-emerald-500",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    iconClass: "bg-emerald-600 text-white",
    symbol: "業",
  },
  {
    id: "commerce-data",
    name: "EC・CSV",
    shortDescription: "商品データやCSVの確認・修正を端末内で行うツール",
    description:
      "ShopifyやGoogle Merchant Centerの商品データ、業務で受け取ったCSVを公開・登録前に確認する無料ツールをまとめています。列名、値、差分、文字コードなどの問題を具体的に示し、元ファイルを外部へ送らずに修正作業を進められます。",
    audience:
      "EC運営者、商品登録担当者、データ移行を行う制作会社、ExcelとCSVを日常的に扱うバックオフィス担当者に向いています。",
    painPoints: [
      "商品CSVを登録してからエラーに気づく状況を減らしたい",
      "更新前後のCSVで変わった行だけを確認したい",
      "Excelで開いたCSVの日本語文字化けを直したい",
    ],
    accentClass: "border-t-amber-500",
    badgeClass: "bg-amber-50 text-amber-800 ring-amber-200",
    iconClass: "bg-amber-500 text-slate-950",
    symbol: "表",
  },
  {
    id: "web-design",
    name: "Web制作・改善",
    shortDescription: "LP、画像、配色、計測リンク、サイト移転を支援するツール",
    description:
      "Webページの企画から公開後の改善までに必要な、LP構成、画像サイズ、配色、計測用URL、リダイレクト確認を支援する無料ツールをまとめています。制作工程の小さな確認作業を分離し、専門ソフトを開かずに必要な結果だけを作れます。",
    audience:
      "Web制作者、デザイナー、マーケティング担当者、サイト運営者、個人開発者など、制作と改善を少人数で進める方に向いています。",
    painPoints: [
      "LPの構成や必要素材を制作前に整理したい",
      "用途ごとの画像サイズや読みやすい配色を確認したい",
      "計測リンクやサイト移転設定のミスを公開前に見つけたい",
    ],
    accentClass: "border-t-violet-500",
    badgeClass: "bg-violet-50 text-violet-700 ring-violet-200",
    iconClass: "bg-violet-600 text-white",
    symbol: "Web",
  },
];

export function getCategoryById(id: string) {
  return categories.find((category) => category.id === id);
}

export function getCategoryBySlug(slug: string) {
  return getCategoryById(slug);
}
