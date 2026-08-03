export type GuideSection =
  | {
      kind: "context";
      title: string;
      paragraphs: string[];
    }
  | {
      kind: "workflow";
      title: string;
      intro: string;
      steps: {
        title: string;
        detail: string;
        doneWhen: string;
        toolSlugs: string[];
      }[];
    }
  | {
      kind: "example";
      title: string;
      scenario: string;
      inputs: string[];
      results: string[];
      interpretation: string;
    }
  | {
      kind: "comparison";
      title: string;
      intro: string;
      rows: { need: string; choose: string; why: string }[];
    }
  | {
      kind: "checklist";
      title: string;
      items: string[];
    }
  | {
      kind: "caution";
      title: string;
      paragraphs: string[];
    };

export type GuideVisual =
  | {
      kind: "timeline";
      title: string;
      description: string;
      items: { label: string; detail: string }[];
    }
  | {
      kind: "risk-map";
      title: string;
      description: string;
      items: { label: string; question: string; action: string }[];
    }
  | {
      kind: "pipeline";
      title: string;
      description: string;
      items: { label: string; detail: string; gate: string }[];
    }
  | {
      kind: "gates";
      title: string;
      description: string;
      items: { label: string; detail: string; checks: string[] }[];
    };

export type GuideDefinition = {
  slug: string;
  eyebrow: string;
  title: string;
  description: string;
  audience: string;
  decision: string;
  updatedAt: string;
  readingMinutes: number;
  categoryIds: string[];
  toolSlugs: string[];
  visual: GuideVisual;
  sections: GuideSection[];
  sources: { title: string; publisher: string; url: string; note: string }[];
};

export const guides: GuideDefinition[] = [
  {
    slug: "creator-commission-workflow",
    eyebrow: "CREATOR BUSINESS",
    title: "個人クリエイターのための、依頼受付から納品・入金までの進め方",
    description:
      "コミッションや制作案件で、料金表を作る前から納品後までに何を決め、どの記録を残すかを具体例で整理します。単発の計算ではなく、条件の聞き漏らしと採算崩れを同時に減らすための実務ガイドです。",
    audience:
      "イラスト、動画、デザイン、文章、配信素材などを一人で受注し、見積もり、制作、修正、納品までを自分で管理する方。",
    decision:
      "受注できるか、いくらで受けるか、どの条件を合意してから着手するかを、同じ情報から判断できる状態を作る。",
    updatedAt: "2026-08-03",
    readingMinutes: 11,
    categoryIds: ["business-operations", "content-marketing"],
    toolSlugs: [
      "commission-brief-builder",
      "commission-rate-card-maker",
      "freelance-capacity-planner",
      "invoice-pdf-generator",
    ],
    visual: {
      kind: "timeline",
      title: "依頼を仕事として完了するまでの全体像",
      description:
        "制作だけでなく、相談前後の確認と納品後の入金までを一つの流れとして管理します。",
      items: [
        { label: "相談", detail: "用途・期限・納品物・利用範囲を聞く" },
        { label: "合意", detail: "金額・修正・支払条件を文章でそろえる" },
        { label: "制作", detail: "途中確認と変更内容を一か所に残す" },
        { label: "完了", detail: "受領・請求・入金・記録保管まで確認する" },
      ],
    },
    sections: [
      {
        kind: "context",
        title: "最初に料金を決めると、後から条件が増えやすい",
        paragraphs: [
          "制作依頼では、用途、サイズ、納品形式、修正回数、実績公開の可否によって必要な時間と責任範囲が変わります。最初に金額だけを伝えると、依頼者と制作者が別々の完成像を持ったまま進み、追加対応を無償で抱えやすくなります。",
          "先に依頼内容を整理し、次に自分の稼働余力を確認し、その条件に対して料金を提示する順序なら、断る判断も含めて説明しやすくなります。発注時の取引条件は書面やメール等で明示し、口頭だけにしないことも重要です。",
        ],
      },
      {
        kind: "workflow",
        title: "相談を受けてから入金を確認するまでの7段階",
        intro:
          "ツールを使うことが目的ではありません。依頼者との確認、制作中の連絡、納品後の記録までを一つの仕事として進めます。補助ツールは、必要な工程だけで使ってください。",
        steps: [
          {
            title: "1. 依頼内容を確認する",
            detail:
              "依頼者が何に使う制作物なのかを聞きます。希望納期、サイズ、納品形式、修正回数、利用範囲、実績として公開してよい時期も確認します。決まっていない項目は推測せず、確認待ちと書き残します。",
            doneWhen:
              "依頼者と制作者が、作るもの・使い方・期限を同じ言葉で確認できている。",
            toolSlugs: ["commission-brief-builder"],
          },
          {
            title: "2. 受注余力を確認する",
            detail:
              "制作時間に加え、資料確認、連絡、修正、書き出し、経理に必要な時間も見積もります。ほかの案件と重ねても納期を守れるかを確認し、無理がある場合は納期変更や辞退を伝えます。",
            doneWhen:
              "作業時間と予備時間を予定表に確保し、受ける・条件を変える・断るのいずれかを決めている。",
            toolSlugs: ["freelance-capacity-planner"],
          },
          {
            title: "3. 見積もりと取引条件を合意する",
            detail:
              "基本料金と追加料金だけでなく、納品物、納期、支払期日、修正範囲、利用範囲、キャンセル時の扱いを文章で提示します。料金表だけで済ませず、今回の依頼に合う条件をメールや書面で確認します。",
            doneWhen:
              "金額と条件をまとめた最終版に対し、依頼者から確認できる形で同意を得ている。",
            toolSlugs: ["commission-rate-card-maker"],
          },
          {
            title: "4. 制作予定と連絡方法を決める",
            detail:
              "ラフ確認、初稿、修正、納品の予定日を決めます。確認を依頼する相手、返答期限、連絡手段も決め、返答が遅れた場合に納期をどう調整するか共有します。",
            doneWhen:
              "双方が次に行うことと期限を確認でき、連絡先とファイル共有場所が一つに決まっている。",
            toolSlugs: [],
          },
          {
            title: "5. 制作途中で認識を合わせる",
            detail:
              "合意した確認時点でラフや初稿を見せます。変更依頼は一か所にまとめ、当初の範囲内か追加対応かを分けます。口頭で決まった変更も、作業へ戻る前に文章で確認します。",
            doneWhen:
              "採用する案と修正内容が確定し、追加料金や納期変更の有無も記録されている。",
            toolSlugs: [],
          },
          {
            title: "6. 納品し、受領を確認する",
            detail:
              "合意した形式とファイル数を確認して納品します。ファイル名、閲覧権限、ダウンロード期限を伝え、依頼者が開けることを確認します。元データを渡す契約でない場合は、納品対象を明確にします。",
            doneWhen:
              "依頼者から受領確認があり、納品日・納品物・修正の終了が記録されている。",
            toolSlugs: [],
          },
          {
            title: "7. 請求し、入金と記録を確認する",
            detail:
              "合意した金額、取引内容、支払期日で請求書を作ります。入金後は請求書、合意内容、納品記録を案件ごとに保管します。未入金の場合にいつ確認連絡をするかも決めておきます。",
            doneWhen:
              "請求内容に誤りがなく、入金確認日または未入金への次の対応日を記録している。",
            toolSlugs: ["invoice-pdf-generator"],
          },
        ],
      },
      {
        kind: "example",
        title: "例：SNS用イラスト3点を月末までに納品する",
        scenario:
          "依頼者は『SNSで使うイラストを3点、月末まで』と相談。制作者は今月の残り稼働が24時間で、同時進行案件があります。",
        inputs: [
          "用途：告知投稿とプロフィール固定投稿",
          "納品：正方形PNG 3点、背景透過版を含む",
          "修正：ラフ段階2回、清書後は色調整1回",
          "想定作業：制作12時間、連絡・書き出し・納品3時間",
        ],
        results: [
          "15時間を確保できるか、既存案件と合わせて稼働率を確認する",
          "基本3点、透過版、追加修正の条件を料金表と確認シートで一致させる",
          "実績公開日と公開可否を納品前に確定する",
        ],
        interpretation:
          "この例で重要なのは『3点だから○円』と先に決めないことです。用途と納品物、修正範囲、必要時間を揃えて初めて、受注可否と料金を同じ前提で判断できます。",
      },
      {
        kind: "comparison",
        title: "迷ったときの選び分け",
        intro: "今いる工程に合わせて、最初に開くツールを選びます。",
        rows: [
          {
            need: "相談内容が曖昧",
            choose: "制作案件ヒアリングシート作成",
            why: "未確定項目と確認事項を先に見える化する",
          },
          {
            need: "受けられるか判断できない",
            choose: "稼働・売上キャパシティ計画",
            why: "制作以外の時間を含めて残り余力を確認する",
          },
          {
            need: "料金の伝え方を整えたい",
            choose: "コミッション料金表メーカー",
            why: "基本料金と追加条件を一緒に提示する",
          },
          {
            need: "合意後の請求を残したい",
            choose: "見積書・請求書PDF作成",
            why: "金額と支払期日を取引記録として出力する",
          },
        ],
      },
      {
        kind: "checklist",
        title: "着手前の最終確認",
        items: [
          "依頼内容、納期、納品場所・方法が文章で残っている",
          "報酬額、支払期日、支払方法が合意内容と一致している",
          "修正回数と追加料金が発生する条件を双方が確認している",
          "著作権、利用範囲、実績公開の可否を料金とは別に確認している",
          "余白時間を残し、病気や差し戻しを含む遅延リスクを説明できる",
        ],
      },
      {
        kind: "caution",
        title: "このガイドで判断できないこと",
        paragraphs: [
          "個別案件の契約解釈、著作権の帰属、税務処理、適正価格を確定するものではありません。法令の適用関係は発注者・受注者の状況で変わるため、重要な契約では専門家と最新の公式情報を確認してください。",
          "ツールへ入力した内容をそのまま合意済みとみなさず、最終版を依頼者へ提示し、返信や署名など確認可能な形で残してください。",
        ],
      },
    ],
    sources: [
      {
        title: "フリーランス法特設サイト",
        publisher: "公正取引委員会",
        url: "https://www.jftc.go.jp/freelancelaw_2025/",
        note: "取引条件の明示事項と書面・電磁的方法の考え方を確認。",
      },
      {
        title: "フリーランス・事業者間取引適正化等法Q&A",
        publisher: "公正取引委員会",
        url: "https://www.jftc.go.jp/fllaw_limited/fllaw_qa.html",
        note: "対象となる取引と義務の詳細確認に使用。",
      },
    ],
  },
  {
    slug: "small-commerce-profit-check",
    eyebrow: "SMALL COMMERCE",
    title: "小さなネットショップのための、赤字・在庫切れ・返品を防ぐ確認手順",
    description:
      "売価だけでは見えない送料、決済費、返品、在庫切れの影響を、ひとつの発売判断へまとめるガイドです。数字を精密に見せることより、仮定と未確認事項を分けることを重視します。",
    audience:
      "ハンドメイド、グッズ、食品、デジタル商品などを小規模に販売し、表計算だけでは条件のつながりを追いにくい運営者。",
    decision:
      "販売するほど損をする条件、在庫切れ、返品時の想定外負担を発売前に発見し、小さく試せる条件を決める。",
    updatedAt: "2026-08-03",
    readingMinutes: 11,
    categoryIds: ["business-operations", "commerce-data"],
    toolSlugs: [
      "dynamic-pricing",
      "free-shipping-threshold-calculator",
      "reorder-point-calculator",
      "merchant-feed-checker",
    ],
    visual: {
      kind: "risk-map",
      title: "発売前に見る4つのリスク",
      description:
        "一つでも答えられない項目があれば、販売数量を増やす前に条件を確認します。",
      items: [
        {
          label: "利益",
          question: "送料や手数料を引いて、1注文でいくら残るか",
          action: "通常・送料無料・値引きの条件を分けて計算する",
        },
        {
          label: "表示",
          question: "支払総額、配送時期、返品条件が購入前に見えるか",
          action: "購入者が迷う情報を先に掲載する",
        },
        {
          label: "在庫",
          question: "欠品と売れ残りの両方へ対応できる数量か",
          action: "初回は小さく始め、追加発注の基準を決める",
        },
        {
          label: "運用",
          question: "注文、発送、問い合わせを無理なく処理できるか",
          action: "テスト注文を行い、対応記録の場所を決める",
        },
      ],
    },
    sections: [
      {
        kind: "context",
        title: "売価・送料・在庫・返品は別々に決めない",
        paragraphs: [
          "販売価格に粗利があっても、決済費、梱包費、送料無料負担、返品時の往復送料を加えると利益が消えることがあります。反対に、利益率を守るために価格を上げても、在庫数や販売速度と合わなければ資金が滞留します。",
          "発売前は一つの正解を求めず、通常注文、送料無料到達、返品発生の三つを並べ、どの仮定が変わると赤字になるかを確認します。",
        ],
      },
      {
        kind: "example",
        title: "例：原価1,200円の小物をオンライン販売する",
        scenario:
          "月30個の販売を想定し、平均送料700円、決済費率3.6%、梱包費100円。4,500円以上の注文を送料無料にする案を検討します。",
        inputs: [
          "商品原価：1,200円、梱包費：100円",
          "候補売価：3,200円、決済費率：3.6%",
          "通常送料：700円、送料無料候補：4,500円",
          "平均販売：1日1個、納品まで5日、安全在庫を別途設定",
        ],
        results: [
          "単品注文と送料無料注文の1注文利益を分けて比較する",
          "送料無料に届くための追加購入額が現実的かを確認する",
          "発注点は平均販売数だけでなく、納品遅延と需要変動を含めて見直す",
        ],
        interpretation:
          "送料無料ラインで客単価が上がるとは限りません。『追加購入が起きた場合』の採算と、『起きなかった場合』の通常注文を分け、実販売後に仮定を更新します。",
      },
      {
        kind: "comparison",
        title: "数字ごとに担当する判断を分ける",
        intro: "似た計算に見えても、答える質問が異なります。",
        rows: [
          {
            need: "目標手取りから売価を逆算",
            choose: "販売価格・利益シミュレーター",
            why: "原価、件数、決済費から必要価格を見る",
          },
          {
            need: "送料無料条件を比較",
            choose: "送料無料ライン・利益シミュレーター",
            why: "追加購入仮説と1注文利益を候補別に見る",
          },
          {
            need: "いつ追加発注するか",
            choose: "発注点・安全在庫計算",
            why: "販売速度とリードタイムから確認時点を作る",
          },
          {
            need: "商品データの登録不備を確認",
            choose: "商品フィード診断",
            why: "価格や在庫以前に配信を止める項目欠落を探す",
          },
        ],
      },
      {
        kind: "workflow",
        title: "商品を準備してから発売後に見直すまでの7段階",
        intro:
          "利益計算だけで発売を決めず、表示、在庫、注文対応、返品対応まで準備します。発売前の数字は仮説なので、発売後は実績に置き換えます。",
        steps: [
          {
            title: "1. 販売条件と費用を集める",
            detail:
              "商品原価だけでなく、梱包材、決済手数料、販売サービス利用料、送料、保管費、返品時に失う費用を一覧にします。不明な金額はゼロにせず、仮の金額と分かるようにします。",
            doneWhen:
              "費用の一覧に確認元と更新日があり、未確認の費用を説明できる。",
            toolSlugs: [],
          },
          {
            title: "2. 売価と送料条件を決める",
            detail:
              "通常注文と送料無料注文を分けて、1注文あたりに残る利益を比べます。値引きやポイントを予定している場合も、その分を差し引いて確認します。",
            doneWhen:
              "通常、送料無料、値引きの各条件で赤字にならない境界が分かっている。",
            toolSlugs: [
              "dynamic-pricing",
              "free-shipping-threshold-calculator",
            ],
          },
          {
            title: "3. 返品・配送・問い合わせのルールを表示する",
            detail:
              "送料、発送までの日数、返品・交換できる条件、問い合わせ先を購入前に確認できる場所へ掲載します。自分に都合のよい条件だけでなく、購入者が迷いやすい例も書きます。",
            doneWhen:
              "初めて訪れた人が、支払総額、到着時期、返品方法、連絡先を購入前に確認できる。",
            toolSlugs: [],
          },
          {
            title: "4. 初回在庫と追加発注の基準を決める",
            detail:
              "平均販売数と納品日数から発注を検討する残数を出します。初回は予測を過信せず、小さく販売できる数量から始め、欠品時の案内方法も用意します。",
            doneWhen:
              "初回数量、発注を検討する残数、仕入先へ連絡する担当と期限が決まっている。",
            toolSlugs: ["reorder-point-calculator"],
          },
          {
            title: "5. 商品情報と購入経路を確認する",
            detail:
              "商品名、価格、在庫、画像、説明、配送条件が販売画面と商品データで一致しているか確認します。テスト注文を行い、注文通知、在庫減算、決済、確認メールまで進むか確かめます。",
            doneWhen:
              "少量のテストで、商品を探してから注文確認を受け取るまでの一連の流れを完了できる。",
            toolSlugs: ["merchant-feed-checker"],
          },
          {
            title: "6. 小さく発売し、対応記録を残す",
            detail:
              "最初から多く仕入れず、対応できる件数で販売を始めます。注文数だけでなく、問い合わせ内容、発送遅延、キャンセル、返品理由も日付とともに記録します。個人情報は集計表へ含めません。",
            doneWhen:
              "最初の確認日を決め、売上以外の問題も同じ記録から振り返り、担当者が次の対応を決められる。",
            toolSlugs: [],
          },
          {
            title: "7. 実績を確認し、一つずつ改善する",
            detail:
              "実売価、平均注文額、送料負担、返品率、販売速度を発売前の仮定と比べます。売価、送料無料ライン、仕入数量を同時に変えず、まず影響の大きい一条件だけを変えます。",
            doneWhen:
              "予測と実績の差、その理由、次に変える一条件、次回確認日が記録されている。",
            toolSlugs: [],
          },
        ],
      },
      {
        kind: "caution",
        title: "返品条件は計算結果より先に表示を確認する",
        paragraphs: [
          "通信販売では、返品特約の有無や内容を消費者が容易に確認できる形で表示する必要があります。計算上の返品コストが低くても、表示が曖昧なまま販売を開始してよいという意味にはなりません。",
          "税、法令、プラットフォーム手数料、配送会社の条件は変わるため、ツールの初期値ではなく販売時点の公式情報を確認してください。",
        ],
      },
      {
        kind: "checklist",
        title: "発売判断のチェックリスト",
        items: [
          "通常注文と送料無料注文の利益を別々に確認した",
          "返品・交換時に負担する送料、再梱包、再販売不能分を洗い出した",
          "納品遅延が起きた場合の安全在庫を過去実績または仮定として明示した",
          "販売価格、送料、引渡時期、返品特約の表示を公式要件と照合した",
          "発売後7日で更新する仮定を一つに絞った",
        ],
      },
    ],
    sources: [
      {
        title: "通信販売広告について",
        publisher: "消費者庁 特定商取引法ガイド",
        url: "https://www.no-trouble.caa.go.jp/what/mailorder/advertising.html",
        note: "販売価格、送料、引渡時期、返品特約などの表示事項を確認。",
      },
      {
        title: "通信販売における返品特約の表示についてのガイドライン",
        publisher: "消費者庁",
        url: "https://www.no-trouble.caa.go.jp/pdf/20200331ra05.pdf",
        note: "返品特約を消費者が容易に認識できる表示方法の確認に使用。",
      },
    ],
  },
  {
    slug: "csv-handoff-quality",
    eyebrow: "DATA HANDOFF",
    title: "CSVを安全に受け渡すための、確認・修正・引き渡し手順",
    description:
      "文字化け、列ずれ、重複、欠損、結合ミスを一度に直そうとせず、元データを残したまま安全な順序で確認するガイドです。CSVの一般形式と業務固有ルールを混同しない方法を示します。",
    audience:
      "EC、会計、顧客管理、在庫、取引先とのデータ受け渡しでCSVを扱い、Excelや各サービスの取込エラーに悩む担当者。",
    decision:
      "元ファイルを壊さず、形式の問題と業務ルール違反を分け、どの修正を誰が確認したか追える状態にする。",
    updatedAt: "2026-08-03",
    readingMinutes: 12,
    categoryIds: ["commerce-data"],
    toolSlugs: [
      "csv-encoding-fixer",
      "csv-column-mapper",
      "csv-rule-validator",
      "csv-duplicate-cleaner",
      "csv-joiner",
    ],
    visual: {
      kind: "pipeline",
      title: "安全なCSV受け渡しの順番",
      description:
        "後から元へ戻れる状態を保ち、形式を直してからデータの意味を確認します。",
      items: [
        {
          label: "仕様確認",
          detail: "取込先の列・形式・締切を入手",
          gate: "相手と前提が一致",
        },
        {
          label: "原本保全",
          detail: "受領ファイルを上書きせず保管",
          gate: "いつでも復元可能",
        },
        {
          label: "形式修正",
          detail: "文字化け・列名・列順を整える",
          gate: "複数行を目視確認",
        },
        {
          label: "品質確認",
          detail: "必須値・重複・件数差を確認",
          gate: "保留理由を記録",
        },
        {
          label: "少量取込",
          detail: "テスト後に完成版と履歴を渡す",
          gate: "受領確認を取得",
        },
      ],
    },
    sections: [
      {
        kind: "example",
        title: "例：商品CSVが文字化けし、取込先では列エラーも出る",
        scenario:
          "取引先から届いたCSVをExcelで開くと商品名が崩れ、EC管理画面へ入れると必須列不足と重複SKUが報告されました。",
        inputs: [
          "元ファイルは変更せずコピーを作る",
          "文字コード候補と区切り文字を先に確認する",
          "取込先テンプレートの列名と必須条件を入手する",
          "SKUの完全一致と表記ゆれ候補を分ける",
        ],
        results: [
          "文字コード変換後のファイルを新しい名前で保存する",
          "列対応表を作り、未割当列と除外列をレビューする",
          "重複候補は自動削除せず、残す行を担当者が選ぶ",
        ],
        interpretation:
          "文字化けした状態で重複削除や列結合を行うと、同じ値を別物として扱う危険があります。まず読める形式へ戻し、次に構造、最後に業務ルールを確認します。",
      },
      {
        kind: "context",
        title: "CSVには一つの完全な実装ルールがあるわけではない",
        paragraphs: [
          "RFC 4180は一般的なCSV形式を整理していますが、現実のファイルでは改行、引用符、文字コード、区切り文字、空欄の扱いがシステムごとに異なります。拡張子が.csvでも、そのまま安全に交換できるとは限りません。",
          "形式として正しいことと、業務上正しいことも別です。列数が揃っていても、商品コードの重複、必須値の欠損、日付形式の違いがあれば取込結果は期待と異なります。",
        ],
      },
      {
        kind: "workflow",
        title: "受領してから相手へ渡すまでの7段階",
        intro:
          "CSVを直す前に、何へ取り込むファイルかを確認します。自動で整えられる形式と、担当者が決める業務上の意味を分けて進めます。",
        steps: [
          {
            title: "1. 受け渡し条件を確認する",
            detail:
              "取込先のテンプレート、必須列、文字コード、区切り文字、最大件数、締切を相手に確認します。個人情報や機密情報がある場合は、送付方法、保存場所、削除時期も先に決めます。",
            doneWhen:
              "取込先の仕様と安全な受け渡し方法を、担当者同士で文章に残している。",
            toolSlugs: [],
          },
          {
            title: "2. 原本を保全する",
            detail:
              "受領したファイルを上書きせず、日時と入手元が分かる名前で保管します。個人情報を含む場合は共有範囲を限定します。",
            doneWhen:
              "受領した原本、作業用コピー、完成版を区別でき、いつでも原本へ戻れる。",
            toolSlugs: [],
          },
          {
            title: "3. 読める形式へ変換する",
            detail:
              "文字コードと区切りを確認し、変換後のプレビューで日本語、改行、引用符が崩れていないかを見ます。読めない値がある状態では、削除や統合へ進みません。",
            doneWhen:
              "先頭・途中・末尾の複数行を読み、文字化けや列ずれがないことを確認している。",
            toolSlugs: ["csv-encoding-fixer"],
          },
          {
            title: "4. 取込先の列へ合わせる",
            detail:
              "元の列と取込先の列を対応表にします。列名変更、並べ替え、除外、固定値を一つずつ確認し、対応先がない列を自動で捨てません。",
            doneWhen:
              "すべての出力列について、元の列・固定値・空欄のどれを使うか説明できる。",
            toolSlugs: ["csv-column-mapper"],
          },
          {
            title: "5. 業務ルールと重複を確認する",
            detail:
              "必須、型、範囲、許可値を取込先のルールに合わせて確認します。同じSKUや顧客番号が複数ある場合は、完全一致と表記ゆれ候補を分け、担当者が残す行を決めます。",
            doneWhen:
              "エラー件数、保留件数、重複を残す・除く理由が行番号とともに記録されている。",
            toolSlugs: ["csv-rule-validator", "csv-duplicate-cleaner"],
          },
          {
            title: "6. 件数を照合し、少量で試す",
            detail:
              "変換前後の行数、主要キーの件数、金額などの合計を比べます。別表を結合する場合は未一致と一対多を確認し、まず少量のデータをテスト環境へ取り込みます。",
            doneWhen:
              "件数差の理由を説明でき、少量取込で意図した項目が正しい場所へ入っている。",
            toolSlugs: ["csv-joiner"],
          },
          {
            title: "7. 完成版と作業記録を引き渡す",
            detail:
              "完成版のファイル名、文字コード、行数、作成日時を相手へ伝えます。除外した行、未解決のエラー、再取込時の注意も一緒に渡し、受領後は不要な作業用ファイルを決めた時期に削除します。",
            doneWhen:
              "受領確認があり、完成版・未解決事項・変更履歴・保管期限を双方が確認している。",
            toolSlugs: [],
          },
        ],
      },
      {
        kind: "comparison",
        title: "症状から最初の確認を選ぶ",
        intro: "複数の問題がある場合も、上から順に確認します。",
        rows: [
          {
            need: "日本語が崩れる・開けない",
            choose: "CSV文字コード変換",
            why: "内容判断の前に読み取り形式を整える",
          },
          {
            need: "列名や順番が合わない",
            choose: "CSV列マッピング",
            why: "取込先テンプレートとの対応を明示する",
          },
          {
            need: "必須・型・値のエラー",
            choose: "CSVルール検証",
            why: "案件固有の品質条件を行単位で確認する",
          },
          {
            need: "同じ人・商品が複数ある",
            choose: "CSV重複クリーナー",
            why: "完全一致と表記ゆれ候補を分離する",
          },
          {
            need: "二つの表を照合したい",
            choose: "CSV結合",
            why: "未一致や一対多を確認しながら列を追加する",
          },
        ],
      },
      {
        kind: "checklist",
        title: "相手へ渡す前の確認",
        items: [
          "原本、作業中、納品版を別ファイルとして保持している",
          "列名、区切り文字、文字コード、改行、引用符の前提を共有した",
          "行数と主要キーの件数を変換前後で比較した",
          "除外列、固定値、重複除外の判断理由を記録した",
          "数式として解釈され得る値や個人情報の取り扱いを確認した",
          "取込先のテスト環境または少量データで先に検証した",
        ],
      },
      {
        kind: "caution",
        title: "自動修正しない項目",
        paragraphs: [
          "氏名、住所、商品コードなどの表記ゆれは、同一人物・同一商品とは限りません。類似候補を自動統合せず、元行へ戻れる情報を残して担当者が判断してください。",
          "CSVに個人情報、認証情報、非公開売上が含まれる場合は、公開サイトや共有チャットへアップロードせず、端末内処理であっても保存先とバックアップを確認してください。",
        ],
      },
    ],
    sources: [
      {
        title: "RFC 4180: Common Format and MIME Type for CSV Files",
        publisher: "RFC Editor",
        url: "https://www.rfc-editor.org/info/rfc4180/",
        note: "CSVの一般的なレコード、区切り、引用符の形式確認に使用。",
      },
      {
        title: "CSV Injection",
        publisher: "OWASP",
        url: "https://owasp.org/www-community/attacks/CSV_Injection",
        note: "表計算ソフトが値を数式として扱う場合の安全確認に使用。",
      },
    ],
  },
  {
    slug: "web-publish-preflight",
    eyebrow: "WEB PUBLISHING",
    title: "Webページを安心して公開するための、公開前・公開後チェック",
    description:
      "LPや告知ページを公開するときに、画像、配色、OGP、robots、sitemapを混ぜずに確認する順序を示します。公開できることと、検索・共有で正しく伝わることを別々に検証します。",
    audience:
      "小規模サイト、キャンペーンページ、ポートフォリオを一人または少人数で制作し、専門担当なしで公開確認を行う方。",
    decision:
      "公開後に直せる見た目の問題と、発見性・共有・アクセシビリティへ影響する問題を分け、公開を止める条件を明確にする。",
    updatedAt: "2026-08-03",
    readingMinutes: 11,
    categoryIds: ["web-design", "content-marketing"],
    toolSlugs: [
      "lp-structure-builder",
      "image-resizer",
      "contrast-color-fixer",
      "ogp-card-preview",
      "robots-sitemap-checker",
    ],
    visual: {
      kind: "gates",
      title: "公開判断を4つの確認ゲートに分ける",
      description:
        "見た目が整っていても、内容や公開設定に問題があれば次のゲートへ進みません。",
      items: [
        {
          label: "内容",
          detail: "事実・権利・連絡先を確認",
          checks: ["元資料と一致", "掲載許可あり"],
        },
        {
          label: "操作",
          detail: "PC・スマホ・キーボードで確認",
          checks: ["読める", "最後まで操作できる"],
        },
        {
          label: "共有・検索",
          detail: "OGP・canonical・robotsを確認",
          checks: ["URLが正しい", "公開方針と一致"],
        },
        {
          label: "公開後",
          detail: "本番再確認と監視担当を決定",
          checks: ["戻し方がある", "次回確認日あり"],
        },
      ],
    },
    sections: [
      {
        kind: "context",
        title: "URLが開くことだけでは公開確認にならない",
        paragraphs: [
          "ページがHTTP 200で表示されても、タイトルや説明が古い、共有画像が切れる、文字が読みにくい、robots設定で検索対象から外れている、といった問題は残ります。反対にrobots.txtが取得できても、検索登録が保証されるわけではありません。",
          "公開確認は、内容、操作、見た目、共有、検索の五つに分けます。すべてを同じ担当者の目視だけに頼らず、機械確認できる項目と人が判断する項目を区別します。",
        ],
      },
      {
        kind: "checklist",
        title: "公開を止める条件",
        items: [
          "主要なボタンやフォームがスマートフォンで操作できない",
          "ページタイトル、説明、canonicalが別ページを示している",
          "意図しないnoindex、robots.txtのDisallow、認証保護が残っている",
          "本文と背景のコントラストが不足し、重要情報を読み取れない",
          "共有カードの画像・タイトル・説明が内容と異なる",
          "入力データや秘密情報を想定外の外部サービスへ送る",
        ],
      },
      {
        kind: "comparison",
        title: "問題の種類と確認手段",
        intro: "同じ『公開前チェック』でも、見る対象を分けます。",
        rows: [
          {
            need: "ページの順序・訴求が曖昧",
            choose: "LP構成作成",
            why: "対象者、悩み、根拠、CTAの流れを先に確認する",
          },
          {
            need: "画像が重い・寸法が合わない",
            choose: "画像リサイズ",
            why: "用途別サイズと容量を端末内で調整する",
          },
          {
            need: "文字が読みにくい",
            choose: "コントラスト確認",
            why: "前景色と背景色を数値で比較する",
          },
          {
            need: "SNS共有の見え方が不明",
            choose: "OGPカードプレビュー",
            why: "metaタグとカード見本を公開前に確認する",
          },
          {
            need: "検索向けファイルが不安",
            choose: "robots・sitemap事前チェック",
            why: "書式、ホスト、重複、除外候補を静的に確認する",
          },
        ],
      },
      {
        kind: "workflow",
        title: "企画してから公開後を確認するまでの7段階",
        intro:
          "ページを作る作業だけでなく、内容の承認、問い合わせ対応、公開判断、公開後の監視までを含めます。ツールで確認できない項目は、担当者と記録を決めて進めます。",
        steps: [
          {
            title: "1. 誰に何を伝えるページか決める",
            detail:
              "対象者、解決したい問題、ページを読んだ後にしてほしい行動を一文で書きます。掲載する根拠、問い合わせ先、公開責任者も決め、根拠のない最上級表現を避けます。",
            doneWhen:
              "ページの目的、対象者、主要な行動、内容を承認する人をチーム内で説明できる。",
            toolSlugs: ["lp-structure-builder"],
          },
          {
            title: "2. 掲載内容と権利・個人情報を確認する",
            detail:
              "名称、価格、日付、連絡先、注意事項を元資料と照合します。画像や文章の利用許可、人物の写り込み、個人情報、公開してはいけない社内情報がないかを担当者が確認します。",
            doneWhen:
              "事実確認と掲載許可が終わり、未確認の内容が公開ページに残っていない。",
            toolSlugs: [],
          },
          {
            title: "3. 見た目と操作を端末別に確認する",
            detail:
              "PCとスマートフォンで、画像容量、文字の読みやすさ、横はみ出し、ボタンの押しやすさを確認します。キーボードだけでも主要なリンクやフォームを操作し、エラー時の説明も読みます。",
            doneWhen:
              "代表的な画面幅と操作方法で、主要な内容を読み、目的の操作を最後まで完了できる。",
            toolSlugs: ["image-resizer", "contrast-color-fixer"],
          },
          {
            title: "4. 共有情報と検索設定を確認する",
            detail:
              "title、description、canonical、OGP画像を本文と一致させます。robots.txt、sitemap、noindex、認証保護も公開方針と照合します。検索登録そのものは検索エンジンの判断です。",
            doneWhen:
              "共有カードが正しい内容を示し、検索対象・非対象のURLを意図どおり説明できる。",
            toolSlugs: ["ogp-card-preview", "robots-sitemap-checker"],
          },
          {
            title: "5. Previewで業務の流れを通して試す",
            detail:
              "ページを開くだけでなく、入口から主要操作、完了表示、問い合わせまでを試します。計測が必要な場合は、個人情報を送らずに必要なイベントだけが記録されるか確認します。",
            doneWhen:
              "公開責任者が確認項目と残る問題を読み、公開する・直す・延期するの判断を記録している。",
            toolSlugs: [],
          },
          {
            title: "6. 公開手順と戻し方を決めて反映する",
            detail:
              "公開時刻、担当者、連絡先、変更内容を決めます。問題が起きたときに前の版へ戻す方法や、ページを一時的に止める条件も公開前に確認します。",
            doneWhen:
              "公開担当、確認担当、停止条件、戻し方が記録され、必要な承認を得ている。",
            toolSlugs: [],
          },
          {
            title: "7. 本番で再確認し、結果を記録する",
            detail:
              "本番URLの応答、主要操作、共有カード、canonical、robots、sitemapを改めて確認します。問い合わせやエラー、アクセス状況を決めた期間だけ観測し、次に直す一項目を選びます。",
            doneWhen:
              "本番確認の結果、問題の有無、対応担当、次回確認日が記録されている。",
            toolSlugs: [],
          },
        ],
      },
      {
        kind: "example",
        title: "例：新しい無料ツールの告知ページを公開する",
        scenario:
          "PCのPreviewでは完成しているが、SNS共有と検索向け設定はまだ確認していません。",
        inputs: [
          "ページの主目的：無料ツールを一度試してもらう",
          "主画像：1200×630、共有カードにも利用",
          "canonical：本番のツールURL",
          "公開範囲：認証なし、検索対象に含める",
        ],
        results: [
          "375pxで主要操作と結果が横にはみ出さないことを確認する",
          "OGP画像、title、descriptionを本文の内容と一致させる",
          "本番応答、robots、sitemap、noindexの有無を別々に記録する",
        ],
        interpretation:
          "Previewで見た目が整っていても、canonicalがPreview URLのままなら公開を止めます。見た目の微調整より、誤ったURLや検索拒否設定を先に直します。",
      },
      {
        kind: "caution",
        title: "検索登録とアクセシビリティを保証しない",
        paragraphs: [
          "robots.txtやsitemapが正しくても、検索結果への表示や順位は保証されません。公開後はSearch Console等で取得・インデックス状況を確認し、欠測をゼロとして扱わないでください。",
          "コントラスト比だけでアクセシビリティ全体を満たすわけではありません。見出し構造、代替テキスト、フォーカス、キーボード操作、エラー説明も実画面で確認します。",
        ],
      },
    ],
    sources: [
      {
        title:
          "Robots meta tag, data-nosnippet, and X-Robots-Tag specifications",
        publisher: "Google Search Central",
        url: "https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag",
        note: "noindex等のページ単位制御の確認に使用。",
      },
      {
        title: "Build and submit a sitemap",
        publisher: "Google Search Central",
        url: "https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap",
        note: "サイトマップへ含めるURLと送信方法の確認に使用。",
      },
      {
        title: "Understanding Success Criterion 1.4.3: Contrast (Minimum)",
        publisher: "W3C WAI",
        url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
        note: "通常テキストと大きな文字のコントラスト基準の確認に使用。",
      },
    ],
  },
];

export function getGuideBySlug(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

export function getGuidesByCategory(categoryId: string) {
  return guides.filter((guide) => guide.categoryIds.includes(categoryId));
}
