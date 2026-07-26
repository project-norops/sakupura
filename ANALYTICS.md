# サクプラ GA4計測契約

## 目的

収益性、再訪、回遊、ツール完了率を改善するため、個人を特定しない操作イベントだけをGA4へ送信する。入力内容そのものは計測しない。

## 共通イベント

| イベント               | 発火条件                             | 主なパラメータ                      |
| ---------------------- | ------------------------------------ | ----------------------------------- |
| `select_content`       | トップや関連欄からツール・一覧を選ぶ | `content_type`, `item_id`           |
| `search`               | トップ・カテゴリー内で検索する       | `content_type`, `result_count`      |
| `share`                | X共有または共有URLのコピーを試す     | `method`, `content_type`, `item_id` |
| `bookmark_prompt_open` | 保存案内を開く                       | `method`, `content_type`, `item_id` |
| `bookmark_url_copy`    | 保存用URLのコピーに成功              | `method`, `content_type`, `item_id` |
| `sample_load`          | 操作サンプルを読み込む               | `tool_id`                           |
| `tool_run`             | ツールの主処理を実行する             | `tool_id`, `platform`               |
| `tool_result_copy`     | ツールの結果をコピーする             | `tool_id`, `result_type`            |
| `tool_post_open`       | SNS投稿画面を開く                    | `tool_id`, `platform`               |
| `premium_interest_open` | 開発検討中の有料候補機能の説明を開く | `tool_id`, `feature_id`, `placement` |
| `premium_interest_confirm` | 有料候補機能への関心を明示する    | `tool_id`, `feature_id`, `placement` |

`share`と`select_content`はGA4の推奨イベントを利用する。それ以外はサクプラ固有イベントとする。

`select_content`の`content_type`は、カテゴリー選択を`category`、ツール詳細からのカテゴリー遷移を`category_from_tool`、同カテゴリーのツール遷移を`related_tool`として区別する。検索イベントでは検索語を送らず、固定値`tool_directory`と結果件数だけを送る。

`premium_interest_open`は説明ダイアログを開いた弱い関心、`premium_interest_confirm`は利用者が「興味があります」を押した強い関心として区別する。`feature_id`と`placement`は実装前に許可リストへ登録した固定値だけを使う。メールアドレスや自由記述をGA4へ送らない。

## 有料候補機能の関心度判定

- 主指標は`premium_interest_confirm / tool_run`、補助指標は`premium_interest_confirm / premium_interest_open`とする。
- ツール別・機能別に28日間で比較し、クリック数だけで採否を判断しない。
- 初期の運用仮説は、主指標8%以上を優先検証、3%以上8%未満を表示・説明改善後の再検証、3%未満を保留とする。
- 原則として`tool_run`が300回程度に達するまでは早期の中止判断をしない。母数が小さい場合は参考値として扱う。
- 内部確認や自動テストの操作は、可能な範囲で集計から除外する。

## 送信禁止

- 入力文章、ハッシュタグ、URLクエリ、計算金額、原価、売上、メールアドレスなどの入力値
- LocalStorageの内容
- ユーザーエージェント全文、IPアドレス、個人を識別できる値
- エラー本文やクリップボード内容

イベントには固定のslug、操作種別、SNS種別、ページパスなど、事前に定義した値だけを使う。

## 実装ルール

- 共通送信処理は`packages/shared-ui/AnalyticsEvents.tsx`だけで管理する。
- 単純なクリックは`data-analytics-event`と許可済みの`data-analytics-*`属性で宣言する。
- 成功時だけ測る操作は`trackAnalyticsEvent`を成功処理の直後に呼ぶ。
- 新規ツールでは最低でも主処理の`tool_run`を実装する。
- GA4未読込、広告ブロッカー、通信失敗時もツール機能を停止させない。
- 関心度テストは自動表示せず、利用者の操作で開く。計測失敗時もダイアログ表示や閉じる操作を妨げない。
