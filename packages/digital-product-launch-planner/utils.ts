export type LaunchType = "digital_product" | "commission" | "stream_event";
export type PreparationStage = "not_started" | "core_ready" | "page_ready";

export type LaunchTask = {
  id: string;
  title: string;
  description: string;
  group: string;
  offsetDays: number;
  date: string;
  completed: boolean;
  overdue: boolean;
};

type TaskTemplate = Omit<LaunchTask, "date" | "completed" | "overdue"> & {
  completedAtStage: 1 | 2 | 3;
};

export const launchTypeLabels: Record<LaunchType, string> = {
  digital_product: "デジタル商品・教材",
  commission: "コミッション募集",
  stream_event: "配信イベント",
};

const templates: Record<LaunchType, TaskTemplate[]> = {
  digital_product: [
    {
      id: "outline",
      title: "収録内容と購入者像を確定",
      description:
        "章立て、同梱ファイル、購入後にできることを1文で整理します。",
      group: "商品制作",
      offsetDays: -14,
      completedAtStage: 1,
    },
    {
      id: "files",
      title: "商品ファイルと利用案内を完成",
      description:
        "配布ファイルを開き、同梱物・ファイル名・閲覧方法を確認します。",
      group: "商品制作",
      offsetDays: -10,
      completedAtStage: 1,
    },
    {
      id: "sales-page",
      title: "商品ページの本文と価格を確定",
      description:
        "対象者、内容、価格、提供形式、注意事項を販売ページへ記載します。",
      group: "販売準備",
      offsetDays: -7,
      completedAtStage: 2,
    },
    {
      id: "purchase-test",
      title: "購入から受取までをテスト",
      description:
        "テスト購入またはプレビューで、決済後の案内とファイル取得を確認します。",
      group: "販売準備",
      offsetDays: -5,
      completedAtStage: 2,
    },
    {
      id: "sample",
      title: "見本・無料サンプルを準備",
      description: "購入前に内容を判断できる画像、抜粋、短いデモを用意します。",
      group: "告知",
      offsetDays: -4,
      completedAtStage: 3,
    },
    {
      id: "announce",
      title: "発売予告を公開",
      description: "誰の何を助ける商品か、発売日、確認先を案内します。",
      group: "告知",
      offsetDays: -3,
      completedAtStage: 3,
    },
    {
      id: "final-check",
      title: "価格・リンク・配布物を最終確認",
      description:
        "公開URL、価格、画像、ダウンロード内容を別端末でも確認します。",
      group: "公開",
      offsetDays: -1,
      completedAtStage: 3,
    },
    {
      id: "launch",
      title: "商品を公開",
      description: "商品ページを公開し、告知先のリンクが正しいか確認します。",
      group: "公開",
      offsetDays: 0,
      completedAtStage: 3,
    },
    {
      id: "follow-up",
      title: "購入者案内と初期反応を確認",
      description:
        "問い合わせ、取得エラー、案内不足を確認し、必要な修正を記録します。",
      group: "公開後",
      offsetDays: 1,
      completedAtStage: 3,
    },
  ],
  commission: [
    {
      id: "scope",
      title: "募集内容と受付対象を確定",
      description: "制作物、用途、受付件数、対応できない依頼を整理します。",
      group: "受付設計",
      offsetDays: -10,
      completedAtStage: 1,
    },
    {
      id: "conditions",
      title: "料金・納期・修正条件を確定",
      description: "基本料金、追加料金、納期目安、修正回数を確認します。",
      group: "受付設計",
      offsetDays: -8,
      completedAtStage: 1,
    },
    {
      id: "form",
      title: "依頼フォームと回答導線をテスト",
      description:
        "必要項目、送信後の案内、返信方法を自分で操作して確認します。",
      group: "受付準備",
      offsetDays: -6,
      completedAtStage: 2,
    },
    {
      id: "portfolio",
      title: "作例と受付案内を準備",
      description: "依頼者が仕上がりを判断できる作例と料金表を用意します。",
      group: "受付準備",
      offsetDays: -4,
      completedAtStage: 2,
    },
    {
      id: "advance",
      title: "受付開始の予告を公開",
      description: "受付開始日、対象、件数、相談先を事前に案内します。",
      group: "告知",
      offsetDays: -2,
      completedAtStage: 3,
    },
    {
      id: "open",
      title: "コミッション受付を開始",
      description:
        "フォームを公開し、料金表・作例・受付状況のリンクを確認します。",
      group: "公開",
      offsetDays: 0,
      completedAtStage: 3,
    },
    {
      id: "reply",
      title: "初回問い合わせと残枠を確認",
      description: "不足質問、返信時間、受付可能数を確認し案内を更新します。",
      group: "公開後",
      offsetDays: 1,
      completedAtStage: 3,
    },
  ],
  stream_event: [
    {
      id: "concept",
      title: "配信内容と視聴者のゴールを確定",
      description: "企画内容、対象者、開始時刻、終了目安を整理します。",
      group: "企画",
      offsetDays: -14,
      completedAtStage: 1,
    },
    {
      id: "assets",
      title: "配信素材と進行表を準備",
      description: "サムネイル、画面素材、話す順番、紹介リンクを揃えます。",
      group: "制作",
      offsetDays: -10,
      completedAtStage: 1,
    },
    {
      id: "setup",
      title: "配信ページと公開範囲を設定",
      description:
        "タイトル、説明、公開範囲、チャット設定、アーカイブ方針を確認します。",
      group: "配信準備",
      offsetDays: -7,
      completedAtStage: 2,
    },
    {
      id: "rehearsal",
      title: "限定公開でテスト配信",
      description:
        "音声、画面、回線、録画、リンク表示を本番と同じ手順で確認します。",
      group: "配信準備",
      offsetDays: -5,
      completedAtStage: 2,
    },
    {
      id: "announce",
      title: "配信予告を公開",
      description: "日時、内容、視聴先、見逃し時の案内を告知します。",
      group: "告知",
      offsetDays: -3,
      completedAtStage: 3,
    },
    {
      id: "reminder",
      title: "前日リマインドと最終確認",
      description: "開始時刻、視聴URL、素材、通知設定を確認します。",
      group: "告知",
      offsetDays: -1,
      completedAtStage: 3,
    },
    {
      id: "live",
      title: "配信イベントを実施",
      description: "開始前に音声・映像を再確認し、予定どおり公開します。",
      group: "公開",
      offsetDays: 0,
      completedAtStage: 3,
    },
    {
      id: "archive",
      title: "アーカイブと案内を更新",
      description: "視聴URL、概要欄、紹介リンク、次の案内を確認します。",
      group: "公開後",
      offsetDays: 1,
      completedAtStage: 3,
    },
  ],
};

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function addDays(value: string, days: number) {
  const date = parseLocalDate(value);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

export function createLaunchPlan({
  type,
  launchDate,
  stage,
  today,
}: {
  type: LaunchType;
  launchDate: string;
  stage: PreparationStage;
  today: string;
}) {
  const completedLevel =
    stage === "not_started" ? 0 : stage === "core_ready" ? 1 : 2;
  return templates[type].map<LaunchTask>((task) => {
    const date = addDays(launchDate, task.offsetDays);
    const completed = task.completedAtStage <= completedLevel;
    return { ...task, date, completed, overdue: !completed && date < today };
  });
}

function escapeIcs(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

export function tasksToIcs(tasks: LaunchTask[], projectName: string) {
  const events = tasks.flatMap((task, index) => {
    const start = task.date.replaceAll("-", "");
    const end = addDays(task.date, 1).replaceAll("-", "");
    return [
      "BEGIN:VEVENT",
      `UID:launch-${index + 1}-${start}@norops.jp`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${escapeIcs(`[${projectName}] ${task.title}`)}`,
      `DESCRIPTION:${escapeIcs(`${task.group}\n${task.description}`)}`,
      "END:VEVENT",
    ];
  });
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NOROPS//Sakupla Launch Planner//JA",
    "CALSCALE:GREGORIAN",
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function tasksToText(
  tasks: LaunchTask[],
  projectName: string,
  type: LaunchType,
) {
  return [
    `${projectName}｜${launchTypeLabels[type]}`,
    "",
    ...tasks.map(
      (task) =>
        `${task.completed ? "[x]" : "[ ]"} ${task.date} ${task.title}\n    ${task.description}`,
    ),
  ].join("\n");
}
