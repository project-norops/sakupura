"use client";

import { trackAnalyticsEvent } from "@sakupla/shared-ui/AnalyticsEvents";
import { PremiumInterestCards } from "@sakupla/shared-ui/PremiumInterestCards";
import { useState, type FormEvent } from "react";

type BriefInputs = {
  projectName: string;
  productionType: string;
  purpose: string;
  size: string;
  deadline: string;
  references: "ready" | "later" | "none";
  revisions: string;
  deliveryFormats: string;
  portfolio: "allowed" | "not-allowed" | "confirm";
  notes: string;
};

const EMPTY: BriefInputs = {
  projectName: "",
  productionType: "illustration",
  purpose: "",
  size: "",
  deadline: "",
  references: "ready",
  revisions: "",
  deliveryFormats: "",
  portfolio: "confirm",
  notes: "",
};

const SAMPLE: BriefInputs = {
  projectName: "SNSアイコン制作",
  productionType: "illustration",
  purpose: "Xと配信チャンネルで使用する本人用アイコン",
  size: "2000 × 2000 px、正方形、背景は単色",
  deadline: "2026-08-20",
  references: "later",
  revisions: "2",
  deliveryFormats: "PNG（透過背景あり・なしの2種類）",
  portfolio: "confirm",
  notes:
    "人物1名、胸から上。商用利用の範囲とクレジット表記は着手前に確認する。",
};

const PREMIUM_CANDIDATES = [
  {
    featureId: "brief_template_save" as const,
    name: "ヒアリング項目の保存",
    description:
      "よく使う質問や納品条件をこの端末に保存し、次の依頼確認で再利用できる候補です。",
  },
  {
    featureId: "multi_brief_project" as const,
    name: "複数案件の確認状況管理",
    description:
      "複数の依頼確認シートを並べ、未確認項目や更新状況を一覧で管理できる候補です。",
  },
];

const inputClass =
  "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const productionLabels: Record<string, string> = {
  illustration: "イラスト・画像",
  video: "動画・映像",
  stream: "配信素材",
  design: "デザイン・印刷物",
  other: "その他",
};

const referenceLabels = {
  ready: "参考資料あり（共有済み）",
  later: "参考資料あり（後で共有）",
  none: "参考資料なし",
};

const portfolioLabels = {
  allowed: "実績公開可",
  "not-allowed": "実績公開不可",
  confirm: "依頼者へ確認が必要",
};

function formatDate(value: string) {
  if (!value) return "未入力";
  const [year, month, day] = value.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

function rows(inputs: BriefInputs) {
  return [
    ["案件名", inputs.projectName],
    ["制作種別", productionLabels[inputs.productionType]],
    ["用途・使用場所", inputs.purpose],
    ["サイズ・仕様", inputs.size],
    ["希望納期", formatDate(inputs.deadline)],
    ["参考資料", referenceLabels[inputs.references]],
    ["修正回数の目安", `${inputs.revisions}回`],
    ["納品形式", inputs.deliveryFormats],
    ["制作者の実績公開", portfolioLabels[inputs.portfolio]],
    ["補足・確認事項", inputs.notes || "特になし"],
  ];
}

function unresolved(inputs: BriefInputs) {
  const items: string[] = [];
  if (inputs.references === "later") {
    items.push("参考資料の共有方法と共有日を確認する");
  }
  if (inputs.references === "none") {
    items.push("参考資料なしで認識が一致するか確認する");
  }
  if (inputs.portfolio === "confirm") {
    items.push("制作物を実績として公開できるか確認する");
  }
  items.push("料金、支払時期、権利・利用範囲は別途合意する");
  return items;
}

function toPlainText(inputs: BriefInputs) {
  return [
    "【制作依頼 確認シート】",
    ...rows(inputs).map(([label, value]) => `■ ${label}\n${value}`),
    "■ 着手前に確認すること",
    ...unresolved(inputs).map((item) => `・${item}`),
    "※このシートは依頼内容の確認用です。契約書や法的文書ではありません。",
  ].join("\n\n");
}

export function CommissionBriefBuilderPage() {
  const [inputs, setInputs] = useState<BriefInputs>(EMPTY);
  const [result, setResult] = useState<BriefInputs | null>(null);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const update = <K extends keyof BriefInputs>(
    key: K,
    value: BriefInputs[K],
  ) => {
    setInputs((current) => ({ ...current, [key]: value }));
    setResult(null);
    setError("");
    setCopyStatus("");
  };

  const loadSample = () => {
    setInputs(SAMPLE);
    setResult(null);
    setError("");
    setCopyStatus("");
  };

  const clear = () => {
    setInputs(EMPTY);
    setResult(null);
    setError("");
    setCopyStatus("");
  };

  const generate = (event: FormEvent) => {
    event.preventDefault();
    const revisionCount = Number(inputs.revisions);
    if (
      !inputs.projectName.trim() ||
      !inputs.purpose.trim() ||
      !inputs.size.trim() ||
      !inputs.deadline ||
      !inputs.deliveryFormats.trim()
    ) {
      setError("案件名、用途、サイズ、希望納期、納品形式を入力してください。");
      return;
    }
    if (
      inputs.revisions.trim() === "" ||
      !Number.isInteger(revisionCount) ||
      revisionCount < 0 ||
      revisionCount > 20
    ) {
      setError("修正回数は0〜20の整数で入力してください。");
      return;
    }
    setError("");
    setCopyStatus("");
    setResult({ ...inputs });
    trackAnalyticsEvent("tool_run", { tool_id: "commission-brief-builder" });
  };

  const copyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(toPlainText(result));
      setCopyStatus("確認シートをコピーしました。");
    } catch {
      setCopyStatus(
        "コピーできませんでした。印刷からPDF保存をお試しください。",
      );
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <style>{`@media print {
        @page { size: A4 portrait; margin: 12mm; }
        body * { visibility: hidden !important; }
        #brief-print-area, #brief-print-area * { visibility: visible !important; }
        #brief-print-area { position: absolute !important; inset: 0 auto auto 0; width: 100% !important; border: 0 !important; box-shadow: none !important; }
        #brief-print-area tr { break-inside: avoid; }
        #brief-print-area .print-avoid { display: none !important; }
      }`}</style>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          個人クリエイターの依頼確認
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          制作案件ヒアリングシート作成
        </h1>
        <p className="mt-4 max-w-4xl leading-7 text-slate-600">
          イラスト、動画、配信素材などの制作依頼について、用途・サイズ・納期・修正・納品形式を質問に沿って整理します。認識違いを減らすための確認シートを、コピーまたは印刷できます。入力内容は外部へ送信しません。
        </p>

        <section
          aria-label="かんたん操作手順"
          className="mt-6 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:grid-cols-3 sm:p-5"
        >
          <div>
            <h2 className="font-black">1. 質問に答える</h2>
            <p className="mt-1 text-sm leading-6">
              用途、仕様、納期、修正、納品形式を入力
            </p>
          </div>
          <div>
            <h2 className="font-black">2. 未確認を確認</h2>
            <p className="mt-1 text-sm leading-6">
              資料や実績公開など、着手前の確認点を見る
            </p>
          </div>
          <div>
            <h2 className="font-black">3. 共有する</h2>
            <p className="mt-1 text-sm leading-6">
              確認シートをコピー、印刷またはPDF保存
            </p>
          </div>
        </section>

        <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          このシートは依頼内容を整理するためのものです。料金、支払い、著作権、利用範囲などを定める契約書・法的文書ではありません。
        </div>

        <form onSubmit={generate} noValidate className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">制作依頼について入力</h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={loadSample}
                data-analytics-event="sample_load"
                data-analytics-tool-id="commission-brief-builder"
                className="min-h-11 rounded-full border border-blue-300 px-4 text-sm font-bold text-blue-700"
              >
                サンプルを読み込む
              </button>
              <button
                type="button"
                onClick={clear}
                className="min-h-11 rounded-full border border-slate-300 px-4 text-sm font-bold text-slate-700"
              >
                入力をクリア
              </button>
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <TextField
              label="案件名"
              required
              value={inputs.projectName}
              onChange={(value) => update("projectName", value)}
              placeholder="例：SNSアイコン制作"
            />
            <label className="block text-sm font-bold text-slate-700">
              制作種別
              <select
                value={inputs.productionType}
                onChange={(event) =>
                  update("productionType", event.target.value)
                }
                className={inputClass}
              >
                {Object.entries(productionLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <TextField
              label="用途・使用場所"
              required
              value={inputs.purpose}
              onChange={(value) => update("purpose", value)}
              placeholder="例：Xと配信チャンネルの本人用アイコン"
            />
            <TextField
              label="サイズ・仕様"
              required
              value={inputs.size}
              onChange={(value) => update("size", value)}
              placeholder="例：2000 × 2000 px、背景透過"
            />
            <label className="block text-sm font-bold text-slate-700">
              希望納期 <span className="text-red-600">必須</span>
              <input
                type="date"
                value={inputs.deadline}
                onChange={(event) => update("deadline", event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-bold text-slate-700">
              参考資料
              <select
                value={inputs.references}
                onChange={(event) =>
                  update(
                    "references",
                    event.target.value as BriefInputs["references"],
                  )
                }
                className={inputClass}
              >
                {Object.entries(referenceLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-bold text-slate-700">
              修正回数の目安 <span className="text-red-600">必須</span>
              <input
                type="number"
                min="0"
                max="20"
                step="1"
                value={inputs.revisions}
                onChange={(event) => update("revisions", event.target.value)}
                className={inputClass}
                placeholder="例：2"
              />
            </label>
            <TextField
              label="納品形式"
              required
              value={inputs.deliveryFormats}
              onChange={(value) => update("deliveryFormats", value)}
              placeholder="例：PNG（透過あり・なし）"
            />
            <label className="block text-sm font-bold text-slate-700 sm:col-span-2">
              制作者の実績公開
              <select
                value={inputs.portfolio}
                onChange={(event) =>
                  update(
                    "portfolio",
                    event.target.value as BriefInputs["portfolio"],
                  )
                }
                className={inputClass}
              >
                {Object.entries(portfolioLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-bold text-slate-700 sm:col-span-2">
              補足・確認事項
              <textarea
                rows={4}
                value={inputs.notes}
                onChange={(event) => update("notes", event.target.value)}
                className={inputClass}
                placeholder="例：人物1名、胸から上。クレジット表記は着手前に確認する。"
              />
            </label>
          </div>

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
            className="mt-6 min-h-12 rounded-full bg-blue-600 px-6 font-black text-white hover:bg-blue-700"
          >
            確認シートを作成する
          </button>
        </form>
      </section>

      {!result ? (
        <section
          aria-label="確認シートの空状態"
          className="mt-6 rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600"
        >
          必須項目を入力して作成すると、ここに確認シートと着手前の確認点が表示されます。
        </section>
      ) : (
        <>
          <section
            id="brief-print-area"
            aria-labelledby="brief-result-title"
            className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-blue-700">
                  制作依頼 確認シート
                </p>
                <h2
                  id="brief-result-title"
                  className="mt-1 text-2xl font-black"
                >
                  {result.projectName}
                </h2>
              </div>
              <div className="print-avoid flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  className="min-h-11 rounded-full border border-blue-300 px-4 text-sm font-bold text-blue-700"
                >
                  文章をコピー
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
            {copyStatus && (
              <p
                role="status"
                className="print-avoid mt-3 text-sm font-bold text-blue-700"
              >
                {copyStatus}
              </p>
            )}

            <dl className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200">
              {rows(result).map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-1 p-4 sm:grid-cols-[12rem_1fr]"
                >
                  <dt className="font-bold text-slate-600">{label}</dt>
                  <dd className="whitespace-pre-wrap text-slate-950">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <h3 className="font-black text-amber-950">
                着手前に確認すること
              </h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-950">
                {unresolved(result).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            <p className="mt-5 text-sm leading-6 text-slate-600">
              このシートは依頼内容の確認用です。契約書や法的文書ではありません。
            </p>
          </section>

          <PremiumInterestCards
            toolId="commission-brief-builder"
            placement="result_after"
            candidates={PREMIUM_CANDIDATES}
          />
        </>
      )}
    </main>
  );
}

function TextField({
  label,
  required = false,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block text-sm font-bold text-slate-700">
      {label} {required && <span className="text-red-600">必須</span>}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
        placeholder={placeholder}
      />
    </label>
  );
}
