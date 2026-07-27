export type ManifestValue = Record<string, unknown>;

export type LoadedIcon = {
  fileName: string;
  width: number;
  height: number;
  mimeType: string;
  previewUrl: string;
};

export type ManifestIssue = {
  level: "error" | "warning" | "info";
  path: string;
  message: string;
};

export type IconCheck = {
  index: number;
  src: string;
  declaredSizes: string;
  purpose: string;
  loaded: LoadedIcon | null;
  resolvedUrl: string | null;
};

export type ManifestAnalysis = {
  issues: ManifestIssue[];
  icons: IconCheck[];
  corrected: ManifestValue;
};

function isRecord(value: unknown): value is ManifestValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function fileNameFromSource(source: string) {
  try {
    return decodeURIComponent(
      new URL(source, "https://example.invalid/").pathname.split("/").pop() ??
        "",
    );
  } catch {
    return source.split(/[\\/]/).pop() ?? source;
  }
}

function declaredSizes(value: string) {
  return value.toLowerCase().split(/\s+/).filter(Boolean);
}

function matchesActualSize(value: string, size: number) {
  return declaredSizes(value).some(
    (item) => item === `${size}x${size}` || item === "any",
  );
}

function hasExactSize(value: string, size: number) {
  return declaredSizes(value).includes(`${size}x${size}`);
}

function isColor(value: unknown) {
  return (
    typeof value === "string" &&
    (/^#[0-9a-f]{3,8}$/i.test(value) || /^[a-z]+$/i.test(value))
  );
}

export function parseManifest(text: string): ManifestValue {
  let value: unknown;
  try {
    value = JSON.parse(text.replace(/^\uFEFF/, ""));
  } catch {
    throw new Error(
      "マニフェストをJSONとして読み込めませんでした。構文を確認してください。",
    );
  }
  if (!isRecord(value)) {
    throw new Error("マニフェストのルートはJSONオブジェクトにしてください。");
  }
  return value;
}

export function analyzeManifest(
  manifest: ManifestValue,
  manifestUrl: string,
  loadedIcons: readonly LoadedIcon[],
): ManifestAnalysis {
  const issues: ManifestIssue[] = [];
  const corrected = clone(manifest);
  const add = (level: ManifestIssue["level"], path: string, message: string) =>
    issues.push({ level, path, message });

  if (typeof manifest.name !== "string" || !manifest.name.trim()) {
    add("error", "name", "アプリ名 name を入力してください。");
  }
  if (typeof manifest.short_name !== "string" || !manifest.short_name.trim()) {
    add("warning", "short_name", "短い表示名 short_name がありません。");
  }
  if (typeof manifest.start_url !== "string" || !manifest.start_url.trim()) {
    add("error", "start_url", "起動URL start_url を入力してください。");
  }
  if (typeof manifest.scope !== "string" || !manifest.scope.trim()) {
    add(
      "warning",
      "scope",
      "意図しない画面遷移を避けるため scope の明示を推奨します。",
    );
  }

  const allowedDisplays = new Set([
    "fullscreen",
    "standalone",
    "minimal-ui",
    "browser",
    "window-controls-overlay",
    "borderless",
  ]);
  if (
    typeof manifest.display !== "string" ||
    !allowedDisplays.has(manifest.display)
  ) {
    add(
      "warning",
      "display",
      "display は standalone など対応する表示モードを指定してください。",
    );
  }
  if (manifest.theme_color !== undefined && !isColor(manifest.theme_color)) {
    add("warning", "theme_color", "theme_color をCSS色として解釈できません。");
  }
  if (
    manifest.background_color !== undefined &&
    !isColor(manifest.background_color)
  ) {
    add(
      "warning",
      "background_color",
      "background_color をCSS色として解釈できません。",
    );
  }

  let base: URL | null = null;
  try {
    base = new URL(manifestUrl);
  } catch {
    add(
      "error",
      "manifest URL",
      "マニフェストURLを絶対URLで入力してください。",
    );
  }

  if (
    base &&
    typeof manifest.start_url === "string" &&
    typeof manifest.scope === "string"
  ) {
    try {
      const start = new URL(manifest.start_url, base);
      const scope = new URL(manifest.scope, base);
      if (start.origin !== base.origin) {
        add(
          "error",
          "start_url",
          "start_url はマニフェストと同じオリジンにしてください。",
        );
      }
      if (scope.origin !== base.origin) {
        add(
          "error",
          "scope",
          "scope はマニフェストと同じオリジンにしてください。",
        );
      }
      if (!start.pathname.startsWith(scope.pathname)) {
        add("error", "start_url / scope", "start_url が scope の範囲外です。");
      }
    } catch {
      add(
        "error",
        "start_url / scope",
        "start_url または scope をURLとして解釈できません。",
      );
    }
  }

  const rawIcons = Array.isArray(manifest.icons) ? manifest.icons : [];
  if (!rawIcons.length) {
    add("error", "icons", "1件以上のアイコンを icons へ指定してください。");
  }
  const correctedIcons = Array.isArray(corrected.icons) ? corrected.icons : [];
  const icons: IconCheck[] = [];

  rawIcons.forEach((rawIcon, index) => {
    if (!isRecord(rawIcon)) {
      add(
        "error",
        `icons[${index}]`,
        "アイコンはJSONオブジェクトで指定してください。",
      );
      return;
    }
    const src = typeof rawIcon.src === "string" ? rawIcon.src : "";
    const sizes = typeof rawIcon.sizes === "string" ? rawIcon.sizes : "";
    const purpose =
      typeof rawIcon.purpose === "string" ? rawIcon.purpose : "any";
    if (!src)
      add("error", `icons[${index}].src`, "アイコンの src は必須です。");
    if (!sizes) {
      add(
        "warning",
        `icons[${index}].sizes`,
        "ラスター画像では sizes の明示を推奨します。",
      );
    }
    if (
      !/^(?:any|maskable|monochrome)(?:\s+(?:any|maskable|monochrome))*$/.test(
        purpose,
      )
    ) {
      add(
        "warning",
        `icons[${index}].purpose`,
        "purpose に未対応の値が含まれています。",
      );
    }

    let resolvedUrl: string | null = null;
    if (src && base) {
      try {
        resolvedUrl = new URL(src, base).toString();
      } catch {
        add(
          "error",
          `icons[${index}].src`,
          "アイコン src をURLとして解釈できません。",
        );
      }
    }
    const targetName = fileNameFromSource(src).toLowerCase();
    const loaded =
      loadedIcons.find((icon) => icon.fileName.toLowerCase() === targetName) ??
      null;
    if (loaded) {
      if (loaded.width !== loaded.height) {
        add(
          "error",
          `icons[${index}]`,
          `実画像は ${loaded.width}×${loaded.height}px で正方形ではありません。`,
        );
      }
      if (sizes && !matchesActualSize(sizes, loaded.width)) {
        add(
          "error",
          `icons[${index}].sizes`,
          `宣言サイズ ${sizes} と実寸 ${loaded.width}×${loaded.height}px が一致しません。`,
        );
      }
      const correctedIcon = correctedIcons[index];
      if (isRecord(correctedIcon)) {
        correctedIcon.sizes = `${loaded.width}x${loaded.height}`;
        if (loaded.mimeType) correctedIcon.type = loaded.mimeType;
        if (!correctedIcon.purpose) correctedIcon.purpose = "any";
      }
    } else if (src) {
      add(
        "info",
        `icons[${index}]`,
        `${fileNameFromSource(src)} の実画像は未選択のため、実寸とMIMEは未確認です。`,
      );
    }
    icons.push({
      index,
      src,
      declaredSizes: sizes,
      purpose,
      loaded,
      resolvedUrl,
    });
  });

  if (!icons.some((icon) => hasExactSize(icon.declaredSizes, 192))) {
    add("warning", "icons", "Chromium向けの192x192アイコン候補がありません。");
  }
  if (!icons.some((icon) => hasExactSize(icon.declaredSizes, 512))) {
    add("warning", "icons", "Chromium向けの512x512アイコン候補がありません。");
  }
  if (!icons.some((icon) => icon.purpose.split(/\s+/).includes("maskable"))) {
    add(
      "warning",
      "icons.purpose",
      "maskableアイコンがありません。端末によって小さく表示される場合があります。",
    );
  }

  return { issues, icons, corrected };
}

export function serializeManifest(manifest: ManifestValue) {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}
