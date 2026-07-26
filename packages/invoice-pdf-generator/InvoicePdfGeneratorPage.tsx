"use client";

import { useMemo, useState } from "react";
import {
  calculateInvoice,
  formatYen,
  nextDocumentNumber,
  type InvoiceLine,
} from "./utils";

export function InvoicePdfGeneratorPage() {
  const [kind, setKind] = useState<"estimate" | "invoice">("estimate");
  const [issuer, setIssuer] = useState("サクプラデザイン");
  const [issuerAddress, setIssuerAddress] =
    useState("東京都千代田区丸の内1-1-1");
  const [recipient, setRecipient] = useState("株式会社サンプル");
  const [recipientAddress, setRecipientAddress] =
    useState("東京都新宿区西新宿1-1-1");
  const [registration, setRegistration] = useState("T1234567890123");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [dueDate, setDueDate] = useState("");
  const [note, setNote] = useState("お振込手数料はご負担ください。");
  const [lines, setLines] = useState<InvoiceLine[]>([
    {
      id: "1",
      description: "Webサイト制作",
      quantity: 1,
      unitPrice: 100000,
      taxRate: 10,
    },
  ]);
  const totals = useMemo(() => calculateInvoice(lines), [lines]);
  const invoiceChecks = useMemo(
    () => [
      { label: "発行者の名称", valid: Boolean(issuer.trim()) },
      {
        label: "登録番号（T＋13桁）",
        valid: /^T\d{13}$/.test(registration.trim()),
      },
      { label: "取引年月日", valid: Boolean(transactionDate) },
      { label: "取引先の名称", valid: Boolean(recipient.trim()) },
      {
        label: "取引内容",
        valid:
          lines.length > 0 && lines.every((line) => line.description.trim()),
      },
    ],
    [issuer, lines, recipient, registration, transactionDate],
  );
  const invoiceReady = invoiceChecks.every((check) => check.valid);
  const update = (id: string, patch: Partial<InvoiceLine>) =>
    setLines((items) =>
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  const add = () =>
    setLines((items) => [
      ...items,
      {
        id: `line-${Date.now()}-${items.length}`,
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxRate: 10,
      },
    ]);
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8 print:border-0 print:p-0 print:shadow-none">
        <div className="print:hidden">
          <p className="text-xs font-black uppercase tracking-[.2em] text-blue-600">
            請求業務
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            見積書・請求書PDF作成ツール
          </h1>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            名称・住所・取引年月日・登録番号・明細を入力して見積書や請求書を作り、ブラウザの印刷機能からPDF保存できます。請求書ではインボイスの標準的な記載事項をチェックでき、入力内容はサーバーへ送信しません。
          </p>
        </div>
        <div className="mt-8 grid gap-8 xl:grid-cols-[.9fr_1.1fr] print:block">
          <section className="space-y-4 print:hidden">
            <h2 className="text-xl font-black">1. 書類内容を入力</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                ["estimate", "見積書"],
                ["invoice", "請求書"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setKind(value as typeof kind)}
                  aria-pressed={kind === value}
                  className={`rounded-xl border px-4 py-3 font-bold ${kind === value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-300"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["宛先", recipient, setRecipient],
                ["宛先住所", recipientAddress, setRecipientAddress],
                ["発行者", issuer, setIssuer],
                ["発行者住所", issuerAddress, setIssuerAddress],
                ["登録番号", registration, setRegistration],
                ["発行日", issueDate, setIssueDate],
                ["取引年月日", transactionDate, setTransactionDate],
                [
                  kind === "estimate" ? "見積有効期限" : "支払期限",
                  dueDate,
                  setDueDate,
                ],
              ].map(([label, value, setter]) => (
                <label
                  key={label as string}
                  className="text-sm font-bold text-slate-700"
                >
                  {label as string}
                  <input
                    type={
                      (label as string).includes("日") ||
                      (label as string).includes("期限")
                        ? "date"
                        : "text"
                    }
                    value={value as string}
                    onChange={(e) =>
                      (setter as (v: string) => void)(e.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal"
                  />
                </label>
              ))}
            </div>
            <div className="space-y-3">
              {lines.map((line, index) => (
                <div
                  key={line.id}
                  className="rounded-2xl border border-slate-200 p-3"
                >
                  <div className="flex justify-between">
                    <strong className="text-sm">明細 {index + 1}</strong>
                    {lines.length > 1 && (
                      <button
                        onClick={() =>
                          setLines((items) =>
                            items.filter((item) => item.id !== line.id),
                          )
                        }
                        className="text-sm font-bold text-rose-700"
                      >
                        削除
                      </button>
                    )}
                  </div>
                  <input
                    aria-label={`明細${index + 1}の内容`}
                    value={line.description}
                    onChange={(e) =>
                      update(line.id, { description: e.target.value })
                    }
                    placeholder="内容"
                    className="mt-2 w-full rounded-lg border px-3 py-2"
                  />
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <input
                      aria-label={`明細${index + 1}の数量`}
                      type="number"
                      min="0"
                      value={line.quantity}
                      onChange={(e) =>
                        update(line.id, { quantity: Number(e.target.value) })
                      }
                      className="rounded-lg border px-2 py-2"
                    />
                    <input
                      aria-label={`明細${index + 1}の単価`}
                      type="number"
                      min="0"
                      value={line.unitPrice}
                      onChange={(e) =>
                        update(line.id, { unitPrice: Number(e.target.value) })
                      }
                      className="rounded-lg border px-2 py-2"
                    />
                    <select
                      aria-label={`明細${index + 1}の税率`}
                      value={line.taxRate}
                      onChange={(e) =>
                        update(line.id, {
                          taxRate: Number(e.target.value) as 10 | 8 | 0,
                        })
                      }
                      className="rounded-lg border px-2 py-2"
                    >
                      <option value="10">10%</option>
                      <option value="8">8%</option>
                      <option value="0">対象外</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={add}
              className="w-full rounded-full border border-slate-300 px-4 py-3 font-bold"
            >
              明細を追加
            </button>
            <label className="block text-sm font-bold text-slate-700">
              備考
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-normal"
              />
            </label>
          </section>
          <section>
            <div className="print:hidden">
              <h2 className="text-xl font-black">2. 内容を確認してPDF保存</h2>
            </div>
            <article
              id="invoice-print-area"
              className="mt-4 min-h-[720px] rounded-2xl border border-slate-300 bg-white p-6 text-slate-950 print:mt-0 print:min-h-0 print:border-0 print:p-0 sm:p-10"
            >
              <h2 className="invoice-keep-together text-center text-3xl font-black tracking-widest">
                {kind === "estimate" ? "御見積書" : "請求書"}
              </h2>
              <div className="invoice-keep-together mt-8 flex justify-between gap-6">
                <div>
                  <p className="border-b border-slate-900 pb-1 text-xl font-bold">
                    {recipient || "宛先未入力"} 御中
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                    {recipientAddress || "宛先住所未入力"}
                  </p>
                </div>
                <div className="text-right text-sm leading-6">
                  <p>
                    {kind === "estimate"
                      ? nextDocumentNumber("EST")
                      : nextDocumentNumber("INV")}
                  </p>
                  <p>発行日 {issueDate}</p>
                  <strong>{issuer || "発行者未入力"}</strong>
                  <p className="whitespace-pre-line">
                    {issuerAddress || "発行者住所未入力"}
                  </p>
                  <p>{registration}</p>
                </div>
              </div>
              <div className="invoice-keep-together">
                <p className="mt-10 text-sm">
                  下記のとおり
                  {kind === "estimate" ? "お見積り" : "ご請求"}
                  申し上げます。
                </p>
                <p className="mt-2 text-sm">取引年月日：{transactionDate}</p>
                <p className="mt-5 border-b-2 border-slate-900 pb-2 text-2xl font-black">
                  合計 {formatYen(totals.total)}
                </p>
              </div>
              <table className="invoice-lines mt-8 w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border p-2 text-left">内容</th>
                    <th className="border p-2">数量</th>
                    <th className="border p-2">単価</th>
                    <th className="border p-2">税率</th>
                    <th className="border p-2">金額</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.id}>
                      <td className="border p-2">
                        {line.description || "未入力"}
                      </td>
                      <td className="border p-2 text-right">{line.quantity}</td>
                      <td className="border p-2 text-right">
                        {formatYen(line.unitPrice)}
                      </td>
                      <td className="border p-2 text-right">
                        {line.taxRate === 8
                          ? "8%（軽減税率）"
                          : line.taxRate === 10
                            ? "10%"
                            : "対象外"}
                      </td>
                      <td className="border p-2 text-right">
                        {formatYen(line.quantity * line.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="invoice-summary ml-auto mt-5 max-w-xs space-y-1 text-sm">
                <p className="flex justify-between">
                  <span>小計</span>
                  <strong>{formatYen(totals.subtotal)}</strong>
                </p>
                <p className="flex justify-between">
                  <span>消費税</span>
                  <strong>{formatYen(totals.tax)}</strong>
                </p>
                {([10, 8] as const).map(
                  (rate) =>
                    totals.taxableByRate[rate] > 0 && (
                      <div
                        key={rate}
                        className="border-t border-dashed pt-1 text-xs leading-5 text-slate-600"
                      >
                        <p className="flex justify-between">
                          <span>
                            {rate}%対象（税抜）
                            {rate === 8 ? "※" : ""}
                          </span>
                          <strong>
                            {formatYen(totals.taxableByRate[rate])}
                          </strong>
                        </p>
                        <p className="flex justify-between">
                          <span>{rate}%消費税</span>
                          <strong>{formatYen(totals.taxByRate[rate])}</strong>
                        </p>
                      </div>
                    ),
                )}
                {totals.taxableByRate[0] > 0 && (
                  <p className="flex justify-between border-t border-dashed pt-1 text-xs text-slate-600">
                    <span>対象外</span>
                    <strong>{formatYen(totals.taxableByRate[0])}</strong>
                  </p>
                )}
                <p className="flex justify-between border-t pt-2 text-lg">
                  <span>合計</span>
                  <strong>{formatYen(totals.total)}</strong>
                </p>
              </div>
              <div className="invoice-terms">
                {totals.taxableByRate[8] > 0 && (
                  <p className="mt-5 text-xs text-slate-600">
                    ※は軽減税率対象品目です。
                  </p>
                )}
                {dueDate && (
                  <p className="mt-8 text-sm font-bold">
                    {kind === "estimate" ? "見積有効期限" : "支払期限"}：
                    {dueDate}
                  </p>
                )}
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
                  {note}
                </p>
              </div>
            </article>
            {kind === "invoice" && (
              <div className="mt-4 rounded-2xl border border-slate-200 p-4 print:hidden">
                <strong className="text-sm text-slate-900">
                  インボイス記載チェック
                </strong>
                <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                  {invoiceChecks.map((check) => (
                    <li
                      key={check.label}
                      className={
                        check.valid ? "text-emerald-700" : "text-rose-700"
                      }
                    >
                      {check.valid ? "✓" : "要確認："} {check.label}
                    </li>
                  ))}
                  <li className="text-emerald-700">
                    ✓ 税率ごとの対価・適用税率・消費税額
                  </li>
                </ul>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  住所は適格請求書の法定必須項目ではありませんが、取引先確認用として記載できます。
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              disabled={kind === "invoice" && !invoiceReady}
              data-analytics-event="tool_run"
              data-analytics-tool-id="invoice-pdf-generator"
              className="mt-4 w-full rounded-full bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 print:hidden"
            >
              印刷画面を開いてPDF保存
            </button>
            <p className="mt-2 text-xs leading-5 text-slate-500 print:hidden">
              PDFには見積書・請求書部分だけが含まれます。明細が複数ページになる場合は表の見出しを各ページに繰り返し、明細行の途中では改ページしません。消費税の端数は一つの書類につき税率ごとに1回切り捨てます。
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500 print:hidden">
              <a
                href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/shohi/6625.htm"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-blue-700 underline"
              >
                国税庁「適格請求書等の記載事項」
              </a>
              （確認日：2026年7月26日）を基準にしています。制度適合を保証するものではないため、発行前に自社の運用と最新情報を確認してください。
            </p>
          </section>
        </div>
      </section>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }

          html,
          body {
            background: #fff !important;
          }

          body * {
            visibility: hidden !important;
          }

          #invoice-print-area,
          #invoice-print-area * {
            visibility: visible !important;
          }

          #invoice-print-area {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            color: #0f172a !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          #invoice-print-area .invoice-keep-together,
          #invoice-print-area .invoice-summary,
          #invoice-print-area .invoice-terms {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          #invoice-print-area .invoice-lines {
            break-inside: auto;
            page-break-inside: auto;
          }

          #invoice-print-area .invoice-lines thead {
            display: table-header-group;
          }

          #invoice-print-area .invoice-lines tr {
            break-inside: avoid;
            page-break-inside: avoid;
            page-break-after: auto;
          }

          #invoice-print-area .invoice-lines th,
          #invoice-print-area .invoice-lines td {
            padding: 5px !important;
          }
        }
      `}</style>
    </main>
  );
}
