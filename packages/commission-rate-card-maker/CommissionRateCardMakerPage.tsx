"use client";

import { trackAnalyticsEvent } from "@sakupla/shared-ui/AnalyticsEvents";
import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useState, type FormEvent } from "react";

type Menu = { id: number; name: string; price: string; detail: string };
type Option = { id: number; name: string; price: string };
type ThemeId = "sky" | "rose" | "mint" | "violet";
type RateCard = {
  creatorName: string;
  title: string;
  status: "open" | "limited" | "closed";
  theme: ThemeId;
  turnaround: string;
  revisions: string;
  contact: string;
  notes: string;
  menus: Menu[];
  options: Option[];
};

const EMPTY: RateCard = {
  creatorName: "",
  title: "コミッション料金表",
  status: "open",
  theme: "sky",
  turnaround: "",
  revisions: "",
  contact: "",
  notes: "",
  menus: [{ id: 1, name: "", price: "", detail: "" }],
  options: [{ id: 1, name: "", price: "" }],
};

const SAMPLE: RateCard = {
  creatorName: "Sakura Illustration",
  title: "イラストコミッション",
  status: "limited",
  theme: "rose",
  turnaround: "ご入金確認後 14〜21日",
  revisions: "ラフ段階で2回まで",
  contact: "Xのプロフィールにある依頼フォームからご相談ください",
  notes: "商用利用・二次利用は用途を確認して個別にお見積りします。",
  menus: [
    {
      id: 1,
      name: "SNSアイコン",
      price: "8000",
      detail: "人物1名・胸上・背景単色",
    },
    {
      id: 2,
      name: "一枚絵",
      price: "20000",
      detail: "人物1名・簡単な背景込み",
    },
  ],
  options: [
    { id: 1, name: "人物追加", price: "6000" },
    { id: 2, name: "表情差分1点", price: "1500" },
  ],
};

const statusLabels = {
  open: "受付中",
  limited: "残りわずか",
  closed: "受付停止中",
};
const themes: Record<
  ThemeId,
  {
    label: string;
    start: string;
    end: string;
    text: string;
    muted: string;
    border: string;
    panel: string;
  }
> = {
  sky: {
    label: "明るいブルー",
    start: "#eff6ff",
    end: "#bfdbfe",
    text: "#172554",
    muted: "#1e3a8a",
    border: "rgba(30, 58, 138, 0.22)",
    panel: "rgba(255, 255, 255, 0.58)",
  },
  rose: {
    label: "やわらかいピンク",
    start: "#fff1f2",
    end: "#fecdd3",
    text: "#4c0519",
    muted: "#881337",
    border: "rgba(136, 19, 55, 0.2)",
    panel: "rgba(255, 255, 255, 0.55)",
  },
  mint: {
    label: "明るいミント",
    start: "#ecfdf5",
    end: "#a7f3d0",
    text: "#022c22",
    muted: "#065f46",
    border: "rgba(6, 95, 70, 0.2)",
    panel: "rgba(255, 255, 255, 0.55)",
  },
  violet: {
    label: "濃い紫",
    start: "#312e81",
    end: "#7c3aed",
    text: "#ffffff",
    muted: "#ede9fe",
    border: "rgba(255, 255, 255, 0.2)",
    panel: "rgba(255, 255, 255, 0.1)",
  },
};
const inputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100";
const PREMIUM_CANDIDATES = [
  {
    featureId: "rate_card_preset_save" as const,
    name: "料金表プリセットの保存",
    description:
      "よく使うメニューや受付条件をこの端末へ保存し、差し替えて再利用できる候補です。",
  },
  {
    featureId: "multi_menu_rate_card" as const,
    name: "複数ブランド・料金表の管理",
    description:
      "活動名や受付窓口ごとに複数の料金表を切り替えて管理できる候補です。",
  },
];

const yen = (value: string) => `${Number(value).toLocaleString("ja-JP")}円〜`;
const cloneCard = (card: RateCard): RateCard => ({
  ...card,
  menus: card.menus.map((menu) => ({ ...menu })),
  options: card.options.map((option) => ({ ...option })),
});

function toMarkdown(card: RateCard) {
  const menuRows = card.menus.map(
    (menu) => `| ${menu.name} | ${yen(menu.price)} | ${menu.detail || "—"} |`,
  );
  const optionRows = card.options
    .filter((item) => item.name.trim())
    .map((item) => `| ${item.name} | +${yen(item.price).replace("〜", "")} |`);
  return [
    `# ${card.title}`,
    `**${card.creatorName} / ${statusLabels[card.status]}**`,
    "",
    "## 基本メニュー",
    "| メニュー | 料金 | 内容 |",
    "| --- | ---: | --- |",
    ...menuRows,
    ...(optionRows.length
      ? [
          "",
          "## 追加オプション",
          "| オプション | 追加料金 |",
          "| --- | ---: |",
          ...optionRows,
        ]
      : []),
    "",
    `- 納期目安：${card.turnaround}`,
    `- 修正：${card.revisions}`,
    `- 相談方法：${card.contact}`,
    ...(card.notes ? [`- 注意：${card.notes}`] : []),
    "",
    "※料金・納期は目安です。依頼内容を確認後、正式な条件を個別に合意してください。",
  ].join("\n");
}

function drawWrapped(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  let line = "";
  let currentY = y;
  for (const character of text) {
    const next = line + character;
    if (line && context.measureText(next).width > maxWidth) {
      context.fillText(line, x, currentY);
      line = character;
      currentY += lineHeight;
    } else line = next;
  }
  if (line) context.fillText(line, x, currentY);
  return currentY + lineHeight;
}

function downloadImage(card: RateCard) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("画像を作成できませんでした。");
  const theme = themes[card.theme];
  const gradient = context.createLinearGradient(0, 0, 1080, 1350);
  gradient.addColorStop(0, theme.start);
  gradient.addColorStop(1, theme.end);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1080, 1350);
  context.fillStyle = theme.text;
  context.font = "700 34px sans-serif";
  context.fillText(card.creatorName, 70, 90);
  context.font = "900 62px sans-serif";
  let y = drawWrapped(context, card.title, 70, 180, 940, 76);
  context.fillStyle = theme.muted;
  context.font = "800 36px sans-serif";
  context.fillText(statusLabels[card.status], 70, y + 15);
  y += 80;
  context.fillStyle = theme.text;
  for (const menu of card.menus) {
    context.font = "800 40px sans-serif";
    context.fillText(menu.name, 70, y);
    context.textAlign = "right";
    context.fillText(yen(menu.price), 1010, y);
    context.textAlign = "left";
    context.font = "400 27px sans-serif";
    y =
      drawWrapped(
        context,
        menu.detail || "内容はご相談ください",
        70,
        y + 40,
        940,
        34,
      ) + 28;
  }
  const options = card.options.filter((item) => item.name.trim());
  if (options.length) {
    context.font = "800 30px sans-serif";
    context.fillStyle = theme.muted;
    context.fillText("追加オプション", 70, y);
    y += 48;
    context.fillStyle = theme.text;
    context.font = "500 27px sans-serif";
    for (const option of options) {
      context.fillText(
        `・${option.name}  +${Number(option.price).toLocaleString("ja-JP")}円`,
        70,
        y,
      );
      y += 40;
    }
  }
  context.font = "500 27px sans-serif";
  context.fillStyle = theme.muted;
  y = drawWrapped(
    context,
    `納期：${card.turnaround} / 修正：${card.revisions}`,
    70,
    Math.min(y + 28, 1130),
    940,
    38,
  );
  drawWrapped(context, card.contact, 70, y + 12, 940, 38);
  const anchor = document.createElement("a");
  anchor.href = canvas.toDataURL("image/png");
  anchor.download = "commission-rate-card.png";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function CommissionRateCardMakerPage() {
  const [inputs, setInputs] = useState<RateCard>(EMPTY);
  const [result, setResult] = useState<RateCard | null>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const change = <K extends keyof RateCard>(key: K, value: RateCard[K]) => {
    setInputs((current) => ({ ...current, [key]: value }));
    setResult(null);
    setError("");
    setStatus("");
  };
  const changeItem = (
    kind: "menus" | "options",
    id: number,
    key: string,
    value: string,
  ) => {
    change(
      kind,
      inputs[kind].map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ) as RateCard[typeof kind],
    );
  };
  const addItem = (kind: "menus" | "options") => {
    const items = inputs[kind];
    const id = Math.max(0, ...items.map((item) => item.id)) + 1;
    const item =
      kind === "menus"
        ? { id, name: "", price: "", detail: "" }
        : { id, name: "", price: "" };
    change(kind, [...items, item] as RateCard[typeof kind]);
  };
  const removeItem = (kind: "menus" | "options", id: number) =>
    change(
      kind,
      inputs[kind].filter((item) => item.id !== id) as RateCard[typeof kind],
    );

  const generate = (event: FormEvent) => {
    event.preventDefault();
    if (
      !inputs.creatorName.trim() ||
      !inputs.title.trim() ||
      !inputs.turnaround.trim() ||
      !inputs.revisions.trim() ||
      !inputs.contact.trim()
    ) {
      setError(
        "活動名、料金表タイトル、納期目安、修正回数、相談方法を入力してください。",
      );
      return;
    }
    if (
      !inputs.menus.length ||
      inputs.menus.some((menu) => !menu.name.trim() || !menu.price.trim())
    ) {
      setError(
        "基本メニューを1件以上用意し、メニュー名と料金を入力してください。",
      );
      return;
    }
    const prices = [
      ...inputs.menus.map((item) => item.price),
      ...inputs.options
        .filter((item) => item.name.trim())
        .map((item) => item.price),
    ];
    if (
      prices.some(
        (price) =>
          !/^\d+$/.test(price) ||
          Number(price) < 0 ||
          Number(price) > 100000000,
      )
    ) {
      setError("料金は0〜100,000,000円の整数で入力してください。");
      return;
    }
    setError("");
    setStatus("");
    setResult(cloneCard(inputs));
    trackAnalyticsEvent("tool_run", { tool_id: "commission-rate-card-maker" });
  };

  const copyMarkdown = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(toMarkdown(result));
      setStatus("Markdownをコピーしました。");
    } catch {
      setStatus("コピーできませんでした。印刷または画像保存をお試しください。");
    }
  };

  const saveImage = () => {
    if (!result) return;
    try {
      downloadImage(result);
      setStatus("SNS向け料金表画像を保存しました。");
    } catch {
      setStatus("画像を保存できませんでした。別のブラウザでお試しください。");
    }
  };
  const resultTheme = result ? themes[result.theme] : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <style>{`@media print { @page { size: A4 portrait; margin: 12mm; } body * { visibility: hidden !important; } #rate-card-print, #rate-card-print * { visibility: visible !important; } #rate-card-print { position: absolute !important; inset: 0 auto auto 0; width: 100% !important; border: 0 !important; box-shadow: none !important; } #rate-card-print .print-avoid { display: none !important; } #rate-card-print article { break-inside: avoid; } }`}</style>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-violet-700">
          個人クリエイターの受付案内
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          コミッション料金表・受付条件メーカー
        </h1>
        <p className="mt-4 max-w-4xl leading-7 text-slate-600">
          コミッションのメニュー、価格、追加料金、納期、修正回数、受付状況を1枚に整理します。SNS向け画像、Markdown、印刷用料金表をブラウザ内で作成できます。入力内容は外部へ送信しません。
        </p>
        <section
          aria-label="かんたん操作手順"
          className="mt-6 grid gap-3 rounded-2xl border border-violet-100 bg-violet-50 p-4 sm:grid-cols-3 sm:p-5"
        >
          <div>
            <h2 className="font-black">1. メニューを入力</h2>
            <p className="mt-1 text-sm leading-6">
              基本料金と追加オプションを登録
            </p>
          </div>
          <div>
            <h2 className="font-black">2. 見た目を確認</h2>
            <p className="mt-1 text-sm leading-6">
              受付状況、納期、修正条件を確認
            </p>
          </div>
          <div>
            <h2 className="font-black">3. 公開用に保存</h2>
            <p className="mt-1 text-sm leading-6">
              画像・Markdown・印刷形式で保存
            </p>
          </div>
        </section>
        <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          料金表は案内用です。法的な利用規約・契約書・返金条件は生成せず、価格の適正や受注を保証しません。公開前に料金、対象範囲、追加条件が対応しているか確認してください。
        </div>

        <form onSubmit={generate} noValidate className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">料金表の基本情報</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setInputs(cloneCard(SAMPLE));
                  setResult(null);
                  setError("");
                }}
                data-analytics-event="sample_load"
                data-analytics-tool-id="commission-rate-card-maker"
                className="min-h-11 rounded-full border border-violet-300 px-4 text-sm font-bold text-violet-800"
              >
                サンプルを読み込む
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputs(cloneCard(EMPTY));
                  setResult(null);
                  setError("");
                }}
                className="min-h-11 rounded-full border border-slate-300 px-4 text-sm font-bold text-slate-700"
              >
                入力をクリア
              </button>
            </div>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field
              label="活動名・屋号"
              value={inputs.creatorName}
              onChange={(v) => change("creatorName", v)}
              placeholder="例：Sakura Illustration"
            />
            <Field
              label="料金表タイトル"
              value={inputs.title}
              onChange={(v) => change("title", v)}
              placeholder="例：イラストコミッション"
            />
            <label className="block text-sm font-bold text-slate-700">
              受付状況
              <select
                value={inputs.status}
                onChange={(e) =>
                  change("status", e.target.value as RateCard["status"])
                }
                className={inputClass}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="納期目安"
              value={inputs.turnaround}
              onChange={(v) => change("turnaround", v)}
              placeholder="例：ご入金確認後 14〜21日"
            />
            <Field
              label="修正回数・タイミング"
              value={inputs.revisions}
              onChange={(v) => change("revisions", v)}
              placeholder="例：ラフ段階で2回まで"
            />
            <Field
              label="相談方法"
              value={inputs.contact}
              onChange={(v) => change("contact", v)}
              placeholder="例：プロフィールの依頼フォームから相談"
            />
          </div>

          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black">基本メニュー</h2>
              <button
                type="button"
                onClick={() => addItem("menus")}
                className="min-h-11 whitespace-nowrap rounded-full border border-violet-300 px-4 text-sm font-bold text-violet-800"
              >
                メニューを追加
              </button>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              表示料金は「○円〜」として出力します。内容により変わる場合は詳細欄で対象範囲を示してください。
            </p>
            <div className="mt-4 space-y-4">
              {inputs.menus.map((menu, index) => (
                <article
                  key={menu.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-black">メニュー {index + 1}</h3>
                    {inputs.menus.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem("menus", menu.id)}
                        className="min-h-10 px-3 text-sm font-bold text-red-700"
                      >
                        削除
                      </button>
                    )}
                  </div>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <Field
                      label={`メニュー ${index + 1}の名前`}
                      value={menu.name}
                      onChange={(v) => changeItem("menus", menu.id, "name", v)}
                      placeholder="例：SNSアイコン"
                    />
                    <NumberField
                      label={`メニュー ${index + 1}の料金（円）`}
                      value={menu.price}
                      onChange={(v) => changeItem("menus", menu.id, "price", v)}
                    />
                    <div className="sm:col-span-2">
                      <Field
                        label={`メニュー ${index + 1}の内容`}
                        value={menu.detail}
                        onChange={(v) =>
                          changeItem("menus", menu.id, "detail", v)
                        }
                        placeholder="例：人物1名・胸上・背景単色"
                        optional
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-black">追加オプション</h2>
              <button
                type="button"
                onClick={() => addItem("options")}
                className="min-h-11 whitespace-nowrap rounded-full border border-violet-300 px-4 text-sm font-bold text-violet-800"
              >
                オプションを追加
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              不要な場合は空欄のままで構いません。
            </p>
            <div className="mt-4 space-y-4">
              {inputs.options.map((option, index) => (
                <article
                  key={option.id}
                  className="grid gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-[1fr_1fr_auto]"
                >
                  <Field
                    label={`オプション ${index + 1}の名前`}
                    value={option.name}
                    onChange={(v) =>
                      changeItem("options", option.id, "name", v)
                    }
                    placeholder="例：人物追加"
                    optional
                  />
                  <NumberField
                    label={`オプション ${index + 1}の追加料金（円）`}
                    value={option.price}
                    onChange={(v) =>
                      changeItem("options", option.id, "price", v)
                    }
                    optional
                  />
                  <button
                    type="button"
                    onClick={() => removeItem("options", option.id)}
                    className="min-h-11 self-end px-3 text-sm font-bold text-red-700"
                  >
                    削除
                  </button>
                </article>
              ))}
            </div>
          </section>

          <label className="mt-6 block text-sm font-bold text-slate-700">
            注意書き（任意）
            <textarea
              rows={3}
              value={inputs.notes}
              onChange={(e) => change("notes", e.target.value)}
              className={inputClass}
              placeholder="例：商用利用は用途を確認して個別見積り"
            />
          </label>

          <fieldset className="mt-8 rounded-2xl border border-violet-200 bg-violet-50 p-4 sm:p-5">
            <legend className="px-1 text-lg font-black text-slate-950">
              SNS画像のデザイン
            </legend>
            <p
              id="rate-card-theme-help"
              className="mt-1 text-sm leading-6 text-slate-600"
            >
              ここで選んだ背景カラーを、下に表示する料金表プレビューと保存するPNG画像の両方に反映します。
            </p>
            <div
              className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"
              aria-describedby="rate-card-theme-help"
            >
              {Object.entries(themes).map(([value, theme]) => {
                const selected = inputs.theme === value;
                return (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-xl border bg-white p-3 text-sm font-bold transition ${
                      selected
                        ? "border-violet-600 ring-2 ring-violet-200"
                        : "border-slate-200 hover:border-violet-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rate-card-theme"
                      value={value}
                      checked={selected}
                      onChange={() => change("theme", value as ThemeId)}
                      className="mr-2 accent-violet-700"
                    />
                    {theme.label}
                    <span
                      aria-hidden="true"
                      className="mt-2 block h-10 rounded-lg border border-black/10"
                      style={{
                        background: `linear-gradient(135deg, ${theme.start}, ${theme.end})`,
                      }}
                    />
                  </label>
                );
              })}
            </div>
          </fieldset>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-xl bg-red-50 p-4 font-bold text-red-700"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            className="mt-6 min-h-12 rounded-full bg-violet-700 px-6 font-black text-white hover:bg-violet-800"
          >
            プレビューと料金表を作成
          </button>
        </form>
      </section>

      {!result ? (
        <section
          aria-label="料金表の空状態"
          className="mt-6 rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600"
        >
          基本情報とメニューを入力して作成すると、ここにSNS向け料金表の見本と保存ボタンが表示されます。
        </section>
      ) : (
        <>
          <section
            id="rate-card-print"
            aria-labelledby="rate-card-title"
            className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          >
            <div className="print-avoid flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-violet-700">
                  公開前プレビュー
                </p>
                <h2 id="rate-card-title" className="text-2xl font-black">
                  料金表を確認
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={saveImage}
                  className="min-h-11 rounded-full bg-violet-700 px-4 text-sm font-bold text-white"
                >
                  SNS画像を保存
                </button>
                <button
                  type="button"
                  onClick={copyMarkdown}
                  className="min-h-11 rounded-full border border-violet-300 px-4 text-sm font-bold text-violet-800"
                >
                  Markdownをコピー
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="min-h-11 rounded-full bg-slate-900 px-4 text-sm font-bold text-white"
                >
                  印刷・PDF保存
                </button>
              </div>
            </div>
            {status && (
              <p
                role="status"
                className="print-avoid mt-3 text-sm font-bold text-violet-800"
              >
                {status}
              </p>
            )}
            <article
              aria-label="SNS向け料金表プレビュー"
              className="mx-auto mt-6 max-w-2xl overflow-hidden rounded-3xl p-6 sm:p-10"
              style={{
                background: `linear-gradient(135deg, ${resultTheme?.start}, ${resultTheme?.end})`,
                color: resultTheme?.text,
              }}
            >
              <p className="font-bold" style={{ color: resultTheme?.muted }}>
                {result.creatorName}
              </p>
              <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                <h3 className="max-w-lg text-3xl font-black">{result.title}</h3>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-950">
                  {statusLabels[result.status]}
                </span>
              </div>
              <div className="mt-7 space-y-5">
                {result.menus.map((menu) => (
                  <div
                    key={menu.id}
                    className="border-b pb-5"
                    style={{ borderColor: resultTheme?.border }}
                  >
                    <div className="flex flex-wrap justify-between gap-2 text-xl font-black">
                      <span>{menu.name}</span>
                      <span>{yen(menu.price)}</span>
                    </div>
                    <p
                      className="mt-2 text-sm leading-6"
                      style={{ color: resultTheme?.muted }}
                    >
                      {menu.detail || "内容はご相談ください"}
                    </p>
                  </div>
                ))}
              </div>
              {result.options.some((item) => item.name.trim()) && (
                <div className="mt-6">
                  <h4
                    className="font-black"
                    style={{ color: resultTheme?.muted }}
                  >
                    追加オプション
                  </h4>
                  <ul className="mt-2 space-y-1 text-sm">
                    {result.options
                      .filter((item) => item.name.trim())
                      .map((item) => (
                        <li key={item.id}>
                          ・{item.name}　+
                          {Number(item.price).toLocaleString("ja-JP")}円
                        </li>
                      ))}
                  </ul>
                </div>
              )}
              <dl
                className="mt-7 space-y-2 rounded-2xl p-4 text-sm"
                style={{ backgroundColor: resultTheme?.panel }}
              >
                <div>
                  <dt className="font-black">納期目安</dt>
                  <dd>{result.turnaround}</dd>
                </div>
                <div>
                  <dt className="font-black">修正</dt>
                  <dd>{result.revisions}</dd>
                </div>
                <div>
                  <dt className="font-black">相談方法</dt>
                  <dd>{result.contact}</dd>
                </div>
              </dl>
              {result.notes && (
                <p
                  className="mt-4 text-sm leading-6"
                  style={{ color: resultTheme?.muted }}
                >
                  {result.notes}
                </p>
              )}
            </article>
            <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
              <h3 className="font-black">公開前に確認</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>各価格に含む制作範囲と、追加料金の対象が対応しているか</li>
                <li>
                  受付状況、納期、修正回数が現在の対応可能範囲と合っているか
                </li>
                <li>
                  商用利用、支払い、権利、キャンセル条件は必要に応じて別途合意すること
                </li>
              </ul>
            </section>
            <p className="mt-5 text-sm leading-6 text-slate-600">
              これは料金と受付条件の案内用です。法的な利用規約・契約書ではなく、正式な条件は依頼内容を確認して個別に合意してください。
            </p>
          </section>
          <PremiumInterestCards
            toolId="commission-rate-card-maker"
            placement="result_after"
            candidates={PREMIUM_CANDIDATES}
          />
        </>
      )}
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  optional = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  optional?: boolean;
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label} {!optional && <span className="text-red-600">必須</span>}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder={placeholder}
      />
    </label>
  );
}
function NumberField({
  label,
  value,
  onChange,
  optional = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label} {!optional && <span className="text-red-600">必須</span>}
      <input
        type="number"
        min="0"
        max="100000000"
        step="1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder="例：8000"
      />
    </label>
  );
}
