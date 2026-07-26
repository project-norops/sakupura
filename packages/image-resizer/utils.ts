export type ImageFormat = "png" | "jpeg" | "webp";
export type CropPosition =
  | "top-left"
  | "top"
  | "top-right"
  | "left"
  | "center"
  | "right"
  | "bottom-left"
  | "bottom"
  | "bottom-right";

export type ImagePreset = {
  id: string;
  label: string;
  width: number;
  height: number;
  format: ImageFormat;
  description: string;
};

export const IMAGE_PRESETS: ImagePreset[] = [
  {
    id: "ogp",
    label: "OGP・X共有",
    width: 1200,
    height: 630,
    format: "png",
    description: "Web記事やXのリンクカード",
  },
  {
    id: "instagram",
    label: "Instagram正方形",
    width: 1080,
    height: 1080,
    format: "jpeg",
    description: "フィード投稿の基本サイズ",
  },
  {
    id: "youtube",
    label: "YouTubeサムネイル",
    width: 1280,
    height: 720,
    format: "jpeg",
    description: "16:9の動画サムネイル",
  },
  {
    id: "app-icon",
    label: "アプリアイコン",
    width: 512,
    height: 512,
    format: "png",
    description: "Webアプリやストア素材",
  },
  {
    id: "favicon",
    label: "favicon PNG",
    width: 192,
    height: 192,
    format: "png",
    description: "ブラウザ・PWA向け",
  },
];

export function outputFilename(
  originalName: string,
  preset: ImagePreset,
): string {
  const base =
    originalName
      .replace(/\.[^.]+$/, "")
      .normalize("NFKC")
      .replace(/[^\p{L}\p{N}_-]+/gu, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "image";
  const extension = preset.format === "jpeg" ? "jpg" : preset.format;
  return `${base}-${preset.id}-${preset.width}x${preset.height}.${extension}`;
}

export function calculateSourceRect(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  mode: "cover" | "contain",
  position: CropPosition = "center",
) {
  if (mode === "contain") {
    const scale = Math.min(
      targetWidth / sourceWidth,
      targetHeight / sourceHeight,
    );
    const width = sourceWidth * scale;
    const height = sourceHeight * scale;
    return {
      sx: 0,
      sy: 0,
      sw: sourceWidth,
      sh: sourceHeight,
      dx: (targetWidth - width) / 2,
      dy: (targetHeight - height) / 2,
      dw: width,
      dh: height,
    };
  }
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetWidth / targetHeight;
  const horizontal =
    position.endsWith("left") || position === "left"
      ? 0
      : position.endsWith("right") || position === "right"
        ? 1
        : 0.5;
  const vertical =
    position.startsWith("top") || position === "top"
      ? 0
      : position.startsWith("bottom") || position === "bottom"
        ? 1
        : 0.5;
  if (sourceRatio > targetRatio) {
    const sw = sourceHeight * targetRatio;
    return {
      sx: (sourceWidth - sw) * horizontal,
      sy: 0,
      sw,
      sh: sourceHeight,
      dx: 0,
      dy: 0,
      dw: targetWidth,
      dh: targetHeight,
    };
  }
  const sh = sourceWidth / targetRatio;
  return {
    sx: 0,
    sy: (sourceHeight - sh) * vertical,
    sw: sourceWidth,
    sh,
    dx: 0,
    dy: 0,
    dw: targetWidth,
    dh: targetHeight,
  };
}

export function outputScale(
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  mode: "cover" | "contain",
): number {
  const scales = [targetWidth / sourceWidth, targetHeight / sourceHeight];
  return mode === "cover" ? Math.max(...scales) : Math.min(...scales);
}

export function validateImageFile(
  file: Pick<File, "type" | "size">,
): string | null {
  if (!file.type.startsWith("image/"))
    return "画像ファイルを選択してください。";
  if (file.type === "image/svg+xml")
    return "安全のためSVGは対象外です。PNG・JPEG・WebPをご利用ください。";
  if (file.size > 20 * 1024 * 1024) return "20MB以下の画像をご利用ください。";
  return null;
}
