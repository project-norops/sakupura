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
      steps: { title: string; detail: string; toolSlugs: string[] }[];
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
  sections: GuideSection[];
  sources: { title: string; publisher: string; url: string; note: string }[];
};

export const guides: GuideDefinition[] = [
  {
    slug: "creator-commission-workflow",
    eyebrow: "CREATOR BUSINESS",
    title: "個人クリエイターの料金決定・受注・納品を一本につなぐ",
    description:
      "コミッションや制作案件で、料金表を作る前から納品後までに何を決め、どの記録を残すかを具体例で整理します。単発の計算ではなく、条件の聞き漏らしと採算崩れを同時に減らすための実務ガイドです。",
    audience:
      "イラスト、動画、デザイン、文章、配信素材などを一人で受注し、見積もり、制作、修正、納品までを自分で管理する方。",
    decision:
      "受注できるか、いくらで受けるか、どの条件を合意してから着手するかを、同じ情報から判断できる状態を作る。",
    updatedAt: "2026-08-03",
    readingMinutes: 8,
    categoryIds: ["business-operations", "content-marketing"],
    toolSlugs: [
      "commission-brief-builder",
      "commission-rate-card-maker",
      "freelance-capacity-planner",
      "invoice-pdf-generator",
    ],
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
        title: "相談から記録までの4段階",
        intro:
          "各ツールは単独でも使えますが、前の工程の出力を次の判断材料にすると、同じ内容を何度も聞き直す作業を減らせます。",
        steps: [
          {
            title: "1. 依頼内容を確認する",
            detail:
              "制作物の用途、希望納期、サイズ、納品形式、修正回数、権利・実績公開の扱いを質問に沿って整理します。未確定項目は空想で埋めず、確認待ちとして残します。",
            toolSlugs: ["commission-brief-builder"],
          },
          {
            title: "2. 受注余力を確認する",
            detail:
              "制作時間だけでなく、営業、連絡、経理、修正対応などの非請求時間を差し引きます。希望納期に間に合うかを、売上目標とは別に確認します。",
            toolSlugs: ["freelance-capacity-planner"],
          },
          {
            title: "3. 料金と受付条件を提示する",
            detail:
              "基本料金、追加料金、修正範囲、納期、受付状況を一枚にまとめます。料金表は契約書の代わりではなく、相談前の条件共有として使います。",
            toolSlugs: ["commission-rate-card-maker"],
          },
          {
            title: "4. 合意した内容で請求を記録する",
            detail:
              "取引先、内容、金額、支払期日を確認し、合意済みの条件と請求内容の食い違いをなくします。振込先や個人情報を含むファイルは共有先を限定します。",
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
    title: "小規模ECの利益・送料・在庫・返品を発売前に点検する",
    description:
      "売価だけでは見えない送料、決済費、返品、在庫切れの影響を、ひとつの発売判断へまとめるガイドです。数字を精密に見せることより、仮定と未確認事項を分けることを重視します。",
    audience:
      "ハンドメイド、グッズ、食品、デジタル商品などを小規模に販売し、表計算だけでは条件のつながりを追いにくい運営者。",
    decision:
      "販売するほど損をする条件、在庫切れ、返品時の想定外負担を発売前に発見し、小さく試せる条件を決める。",
    updatedAt: "2026-08-03",
    readingMinutes: 9,
    categoryIds: ["business-operations", "commerce-data"],
    toolSlugs: [
      "dynamic-pricing",
      "free-shipping-threshold-calculator",
      "reorder-point-calculator",
      "merchant-feed-checker",
    ],
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
        title: "発売前・発売後で計算を分ける",
        intro:
          "発売前の数字は仮説です。発売後は実績で置き換え、予測が外れた理由を追います。",
        steps: [
          {
            title: "発売前：損をしない境界を出す",
            detail:
              "原価、手数料、送料を分け、通常注文と送料無料注文の利益を比較します。",
            toolSlugs: [
              "dynamic-pricing",
              "free-shipping-threshold-calculator",
            ],
          },
          {
            title: "発売前：欠品と過剰在庫の境界を出す",
            detail:
              "平均販売数と納品日数を入力し、発注を検討する残数を作ります。安全在庫は需要変動を見ながら別に決めます。",
            toolSlugs: ["reorder-point-calculator"],
          },
          {
            title: "発売直後：仮定を実績へ置き換える",
            detail:
              "実売価、平均注文額、送料負担、返品理由、販売速度を週単位で確認します。個人情報は集計へ含めません。",
            toolSlugs: [],
          },
          {
            title: "見直し：一度に一条件だけ変える",
            detail:
              "売価、送料無料ライン、仕入数量を同時に変えず、どの変更が結果へ影響したか比較できるようにします。",
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
    title: "CSV受け渡し前の品質確認を、直す順番から設計する",
    description:
      "文字化け、列ずれ、重複、欠損、結合ミスを一度に直そうとせず、元データを残したまま安全な順序で確認するガイドです。CSVの一般形式と業務固有ルールを混同しない方法を示します。",
    audience:
      "EC、会計、顧客管理、在庫、取引先とのデータ受け渡しでCSVを扱い、Excelや各サービスの取込エラーに悩む担当者。",
    decision:
      "元ファイルを壊さず、形式の問題と業務ルール違反を分け、どの修正を誰が確認したか追える状態にする。",
    updatedAt: "2026-08-03",
    readingMinutes: 10,
    categoryIds: ["commerce-data"],
    toolSlugs: [
      "csv-encoding-fixer",
      "csv-column-mapper",
      "csv-rule-validator",
      "csv-duplicate-cleaner",
      "csv-joiner",
    ],
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
        title: "壊しにくい確認順序",
        intro: "後工程ほど判断を伴うため、自動変換と人の確認を分けます。",
        steps: [
          {
            title: "1. 原本を保全する",
            detail:
              "受領したファイルを上書きせず、日時と入手元が分かる名前で保管します。個人情報を含む場合は共有範囲を限定します。",
            toolSlugs: [],
          },
          {
            title: "2. 読める形式へ変換する",
            detail:
              "文字コードと区切りを確認し、変換後のプレビューで日本語、改行、引用符を確認します。",
            toolSlugs: ["csv-encoding-fixer"],
          },
          {
            title: "3. 取込先の列へ合わせる",
            detail:
              "列名変更、並べ替え、除外、固定値を対応表として確認します。未割当を自動で捨てません。",
            toolSlugs: ["csv-column-mapper"],
          },
          {
            title: "4. 業務ルールを検証する",
            detail:
              "必須、型、範囲、許可値を案件固有のルールとして確認します。",
            toolSlugs: ["csv-rule-validator"],
          },
          {
            title: "5. 重複と結合を人が確認する",
            detail:
              "表記ゆれ候補と完全一致を分け、結合時は未一致と一対多を確認してから保存します。",
            toolSlugs: ["csv-duplicate-cleaner", "csv-joiner"],
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
    title: "SNS・Web公開前の制作チェックを、見た目と発見性に分ける",
    description:
      "LPや告知ページを公開するときに、画像、配色、OGP、robots、sitemapを混ぜずに確認する順序を示します。公開できることと、検索・共有で正しく伝わることを別々に検証します。",
    audience:
      "小規模サイト、キャンペーンページ、ポートフォリオを一人または少人数で制作し、専門担当なしで公開確認を行う方。",
    decision:
      "公開後に直せる見た目の問題と、発見性・共有・アクセシビリティへ影響する問題を分け、公開を止める条件を明確にする。",
    updatedAt: "2026-08-03",
    readingMinutes: 9,
    categoryIds: ["web-design", "content-marketing"],
    toolSlugs: [
      "lp-structure-builder",
      "image-resizer",
      "contrast-color-fixer",
      "ogp-card-preview",
      "robots-sitemap-checker",
    ],
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
        title: "人の確認と機械確認を交互に行う",
        intro: "最後にまとめて確認せず、工程ごとに失敗を止めます。",
        steps: [
          {
            title: "1. 内容と行動を決める",
            detail:
              "誰のどの問題を解決し、読後に何をしてほしいかを一文で説明します。根拠のない最上級表現を避けます。",
            toolSlugs: ["lp-structure-builder"],
          },
          {
            title: "2. 見た目を端末別に確認する",
            detail:
              "画像容量、文字の読みやすさ、横はみ出し、44px程度の操作領域、キーボード操作を確認します。",
            toolSlugs: ["image-resizer", "contrast-color-fixer"],
          },
          {
            title: "3. 共有情報を確認する",
            detail:
              "title、description、canonical、OGP画像の絶対URLと表示内容を本文と一致させます。",
            toolSlugs: ["ogp-card-preview"],
          },
          {
            title: "4. 検索向け設定を確認する",
            detail:
              "robots.txtとsitemapの取得、意図しないnoindex、公開URLの応答を確認します。インデックス登録自体は検索エンジンの判断です。",
            toolSlugs: ["robots-sitemap-checker"],
          },
          {
            title: "5. 本番で同じ確認を繰り返す",
            detail:
              "Preview成功を本番成功とみなさず、公開URL、共有カード、ヘッダー、主要操作を再確認します。",
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
