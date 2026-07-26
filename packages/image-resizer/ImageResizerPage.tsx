"use client";

import JSZip from "jszip";
import { useEffect, useMemo, useState } from "react";
import {
  IMAGE_PRESETS,
  calculateSourceRect,
  outputScale,
  outputFilename,
  validateImageFile,
  type CropPosition,
} from "./utils";

type LoadedImage = { file: File; url: string; element: HTMLImageElement };

const CROP_POSITIONS: {
  value: CropPosition;
  label: string;
  objectPosition: string;
}[] = [
  { value: "top-left", label: "左上", objectPosition: "left top" },
  { value: "top", label: "上", objectPosition: "center top" },
  { value: "top-right", label: "右上", objectPosition: "right top" },
  { value: "left", label: "左", objectPosition: "left center" },
  { value: "center", label: "中央", objectPosition: "center center" },
  { value: "right", label: "右", objectPosition: "right center" },
  { value: "bottom-left", label: "左下", objectPosition: "left bottom" },
  { value: "bottom", label: "下", objectPosition: "center bottom" },
  { value: "bottom-right", label: "右下", objectPosition: "right bottom" },
];

function canvasBlob(
  image: HTMLImageElement,
  preset: (typeof IMAGE_PRESETS)[number],
  mode: "cover" | "contain",
  background: string,
  position: CropPosition,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = preset.width;
  canvas.height = preset.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("画像処理を開始できませんでした。");
  context.fillStyle =
    preset.format === "png" ? background : background || "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const rect = calculateSourceRect(
    image.naturalWidth,
    image.naturalHeight,
    preset.width,
    preset.height,
    mode,
    position,
  );
  context.drawImage(
    image,
    rect.sx,
    rect.sy,
    rect.sw,
    rect.sh,
    rect.dx,
    rect.dy,
    rect.dw,
    rect.dh,
  );
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("画像を書き出せませんでした。")),
      `image/${preset.format}`,
      0.9,
    ),
  );
}

export function ImageResizerPage() {
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [selected, setSelected] = useState(() =>
    IMAGE_PRESETS.map((preset) => preset.id),
  );
  const [mode, setMode] = useState<"cover" | "contain">("cover");
  const [position, setPosition] = useState<CropPosition>("center");
  const [background, setBackground] = useState("#ffffff");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const presets = useMemo(
    () => IMAGE_PRESETS.filter((preset) => selected.includes(preset.id)),
    [selected],
  );

  useEffect(
    () => () => {
      if (loaded) URL.revokeObjectURL(loaded.url);
    },
    [loaded],
  );

  const chooseFile = (file?: File) => {
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      setMessage(error);
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      setLoaded((current) => {
        if (current) URL.revokeObjectURL(current.url);
        return { file, url, element: image };
      });
      setMessage("");
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      setMessage("画像を読み込めませんでした。");
    };
    image.src = url;
  };

  const downloadZip = async () => {
    if (!loaded || presets.length === 0) return;
    setBusy(true);
    setMessage("画像を作成しています…");
    try {
      const zip = new JSZip();
      for (const preset of presets)
        zip.file(
          outputFilename(loaded.file.name, preset),
          await canvasBlob(loaded.element, preset, mode, background, position),
        );
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "sakupla-resized-images.zip";
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage(`${presets.length}種類をZIPに保存しました。`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "画像を作成できませんでした。",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
          画像変換
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Web・SNS画像一括リサイザー
        </h1>
        <p className="mt-4 max-w-3xl leading-7 text-slate-600">
          画像を1枚選ぶだけで、OGP・X・Instagram・YouTube・favicon向けのサイズをまとめて作成します。画像は外部へ送信せず、このブラウザ内だけで処理します。
        </p>
        <div className="mt-8 grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
          <section>
            <h2 className="text-xl font-black text-slate-950">
              1. 元画像を選択
            </h2>
            <label
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                chooseFile(event.dataTransfer.files[0]);
              }}
              className="mt-4 block cursor-pointer rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-7 text-center hover:border-blue-400"
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => chooseFile(event.target.files?.[0])}
              />
              <span className="text-3xl">🖼️</span>
              <span className="mt-2 block font-black text-slate-800">
                画像を選ぶ・ここへドロップ
              </span>
              <span className="mt-1 block text-sm text-slate-500">
                PNG・JPEG・WebP、20MBまで
              </span>
            </label>
            {loaded && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                {/* Preview uses a user-selected object URL and must not be sent through Next image optimization. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={loaded.url}
                  alt="選択した元画像"
                  className="max-h-64 w-full object-contain"
                />
                <p className="p-3 text-center text-xs font-bold text-slate-600">
                  {loaded.element.naturalWidth} × {loaded.element.naturalHeight}
                  px
                </p>
              </div>
            )}
            <fieldset className="mt-5">
              <legend className="text-sm font-bold text-slate-700">
                画像の収め方
              </legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {[
                  [
                    "cover",
                    "枠いっぱいに切り抜く",
                    "縦横比を保って拡大・縮小し、はみ出した部分を切り抜きます。",
                  ],
                  [
                    "contain",
                    "余白を付けて全体表示",
                    "縦横比を保って拡大・縮小し、画像全体を指定サイズへ収めます。",
                  ],
                ].map(([value, label, description]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMode(value as typeof mode)}
                    className={`rounded-xl border px-3 py-3 text-left text-sm ${mode === value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-300 text-slate-700"}`}
                  >
                    <strong className="block">{label}</strong>
                    <span className="mt-1 block text-xs font-normal leading-5">
                      {description}
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>
            {mode === "cover" ? (
              <fieldset className="mt-4">
                <legend className="text-sm font-bold text-slate-700">
                  切り抜き位置
                </legend>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  残したい被写体がある方向を選びます。すべての出力サイズへ共通で適用されます。
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {CROP_POSITIONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setPosition(item.value)}
                      aria-pressed={position === item.value}
                      className={`rounded-lg border px-2 py-2 text-xs font-bold ${position === item.value ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-300 text-slate-600"}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : (
              <label className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-700">
                余白の色
                <span className="flex items-center gap-2">
                  <span className="font-mono text-xs font-normal uppercase">
                    {background}
                  </span>
                  <input
                    type="color"
                    value={background}
                    onChange={(event) => setBackground(event.target.value)}
                    className="h-10 w-14 cursor-pointer rounded border-0"
                  />
                </span>
              </label>
            )}
          </section>
          <section>
            <h2 className="text-xl font-black text-slate-950">
              2. 作成するサイズ
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {IMAGE_PRESETS.map((preset) => (
                <label
                  key={preset.id}
                  className={`cursor-pointer rounded-2xl border p-4 ${selected.includes(preset.id) ? "border-blue-500 bg-blue-50" : "border-slate-200"}`}
                >
                  {loaded && (
                    <div
                      className="mb-3 overflow-hidden rounded-xl border border-slate-200"
                      style={{
                        aspectRatio: `${preset.width} / ${preset.height}`,
                        backgroundColor: background,
                      }}
                    >
                      {/* Local object URLs are previewed without Next image optimization. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={loaded.url}
                        alt={`${preset.label}の出力プレビュー`}
                        className="h-full w-full"
                        style={{
                          objectFit: mode,
                          objectPosition: CROP_POSITIONS.find(
                            (item) => item.value === position,
                          )?.objectPosition,
                        }}
                      />
                    </div>
                  )}
                  <span className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selected.includes(preset.id)}
                      onChange={() =>
                        setSelected((items) =>
                          items.includes(preset.id)
                            ? items.filter((id) => id !== preset.id)
                            : [...items, preset.id],
                        )
                      }
                      className="mt-1 h-4 w-4"
                    />
                    <span>
                      <strong className="block text-slate-950">
                        {preset.label}
                      </strong>
                      <span className="mt-1 block text-sm text-slate-600">
                        {preset.width} × {preset.height}px・{preset.description}
                      </span>
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {loaded &&
              presets.some(
                (preset) =>
                  outputScale(
                    loaded.element.naturalWidth,
                    loaded.element.naturalHeight,
                    preset.width,
                    preset.height,
                    mode,
                  ) > 1,
              ) && (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold leading-6 text-amber-900">
                  一部の出力は元画像より拡大されるため、ぼやけて見える場合があります。上のプレビューで確認してください。
                </p>
              )}
            <button
              type="button"
              disabled={!loaded || presets.length === 0 || busy}
              onClick={downloadZip}
              data-analytics-event="tool_run"
              data-analytics-tool-id="image-resizer"
              className="mt-6 w-full rounded-full bg-blue-600 px-5 py-4 font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "作成中…" : `${presets.length}種類をZIPで保存`}
            </button>
            {message && (
              <p
                role="status"
                className="mt-3 rounded-xl bg-slate-100 p-3 text-sm font-bold text-slate-700"
              >
                {message}
              </p>
            )}
            <p className="mt-4 text-xs leading-5 text-slate-500">
              faviconは互換性の高いPNGで生成します。ICO形式が必要な環境では、生成したPNGから別途変換してください。
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
