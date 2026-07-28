export type DeliveryRequirements = {
  allowedExtensions: string[];
  requiredFiles: string[];
  namePrefix: string;
  requireLowercase: boolean;
  disallowSpaces: boolean;
  minWidth: number | null;
  minHeight: number | null;
};

export type DeliveryFileInfo = {
  name: string;
  size: number;
  width?: number;
  height?: number;
  imageReadError?: boolean;
};

export type DeliveryIssue = {
  severity: "error" | "warning";
  fileName: string;
  check: string;
  message: string;
};

export type DeliveryCheckResult = {
  files: DeliveryFileInfo[];
  issues: DeliveryIssue[];
  errorCount: number;
  warningCount: number;
  passedCount: number;
};

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "gif", "webp"]);

export function normalizeExtensions(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[、,\s]+/)
        .map((item) => item.trim().toLowerCase().replace(/^\./, ""))
        .filter(Boolean),
    ),
  );
}

export function normalizeRequiredFiles(value: string) {
  return Array.from(
    new Set(
      value
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

export function extensionOf(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot > 0 ? fileName.slice(lastDot + 1).toLowerCase() : "";
}

export function evaluateDeliveryFiles(
  files: DeliveryFileInfo[],
  requirements: DeliveryRequirements,
): DeliveryCheckResult {
  const issues: DeliveryIssue[] = [];
  const names = files.map((file) => file.name.toLowerCase());
  const nameCounts = new Map<string, number>();
  for (const name of names)
    nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1);

  for (const required of requirements.requiredFiles) {
    if (!names.includes(required.toLowerCase())) {
      issues.push({
        severity: "error",
        fileName: required,
        check: "必要ファイル",
        message: `必要な「${required}」が見つかりません。`,
      });
    }
  }

  for (const file of files) {
    const extension = extensionOf(file.name);
    if (!extension || !requirements.allowedExtensions.includes(extension)) {
      issues.push({
        severity: "error",
        fileName: file.name,
        check: "拡張子",
        message: extension
          ? `許可した拡張子（${requirements.allowedExtensions.join(" / ")}）に含まれません。`
          : "拡張子がありません。",
      });
    }
    if (
      requirements.namePrefix &&
      !file.name.toLowerCase().startsWith(requirements.namePrefix.toLowerCase())
    ) {
      issues.push({
        severity: "error",
        fileName: file.name,
        check: "ファイル名",
        message: `ファイル名が「${requirements.namePrefix}」で始まっていません。`,
      });
    }
    if (
      requirements.requireLowercase &&
      file.name !== file.name.toLowerCase()
    ) {
      issues.push({
        severity: "warning",
        fileName: file.name,
        check: "ファイル名",
        message:
          "大文字が含まれています。小文字へ統一する要件を確認してください。",
      });
    }
    if (requirements.disallowSpaces && /\s/.test(file.name)) {
      issues.push({
        severity: "warning",
        fileName: file.name,
        check: "ファイル名",
        message:
          "空白が含まれています。ハイフンやアンダースコアへの置換を確認してください。",
      });
    }
    if ((nameCounts.get(file.name.toLowerCase()) ?? 0) > 1) {
      issues.push({
        severity: "error",
        fileName: file.name,
        check: "重複名",
        message: "大文字・小文字を無視すると同じ名前のファイルが複数あります。",
      });
    }

    if (
      IMAGE_EXTENSIONS.has(extension) &&
      (requirements.minWidth !== null || requirements.minHeight !== null)
    ) {
      if (
        file.imageReadError ||
        file.width === undefined ||
        file.height === undefined
      ) {
        issues.push({
          severity: "warning",
          fileName: file.name,
          check: "画像寸法",
          message:
            "画像寸法を読み取れませんでした。元の制作ソフトなどで確認してください。",
        });
      } else if (
        (requirements.minWidth !== null &&
          file.width < requirements.minWidth) ||
        (requirements.minHeight !== null &&
          file.height < requirements.minHeight)
      ) {
        issues.push({
          severity: "error",
          fileName: file.name,
          check: "画像寸法",
          message: `${file.width} × ${file.height} pxです。最小 ${requirements.minWidth ?? "指定なし"} × ${requirements.minHeight ?? "指定なし"} pxを満たしません。`,
        });
      }
    }
  }

  const problemFiles = new Set(
    issues.map((issue) => issue.fileName.toLowerCase()),
  );
  const errorCount = issues.filter(
    (issue) => issue.severity === "error",
  ).length;
  const warningCount = issues.length - errorCount;
  return {
    files,
    issues,
    errorCount,
    warningCount,
    passedCount: files.filter(
      (file) => !problemFiles.has(file.name.toLowerCase()),
    ).length,
  };
}

function csvCell(value: string | number) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

export function resultToCsv(result: DeliveryCheckResult) {
  const rows: Array<Array<string | number>> = [
    ["判定", "ファイル名", "確認項目", "内容"],
    ...result.issues.map((issue) => [
      issue.severity === "error" ? "要修正" : "要確認",
      issue.fileName,
      issue.check,
      issue.message,
    ]),
  ];
  if (!result.issues.length)
    rows.push(["問題なし", "", "全項目", "設定した要件内で指摘はありません"]);
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function resultToText(result: DeliveryCheckResult) {
  return [
    "【制作物 納品前チェック結果】",
    `確認ファイル: ${result.files.length}件`,
    `要修正: ${result.errorCount}件 / 要確認: ${result.warningCount}件 / 指摘なし: ${result.passedCount}件`,
    "",
    ...(result.issues.length
      ? result.issues.map(
          (issue) =>
            `・[${issue.severity === "error" ? "要修正" : "要確認"}] ${issue.fileName} / ${issue.check}: ${issue.message}`,
        )
      : ["・設定した要件内で指摘はありません。"]),
    "",
    "※ブラウザで確認できる範囲の結果です。納品先の最終要件も確認してください。",
  ].join("\n");
}
