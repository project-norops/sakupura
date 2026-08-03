# サクプラ アーキテクチャ契約

## 固定する構成

| 項目               | 値                                |
| ------------------ | --------------------------------- |
| プロダクト         | サクプラ                          |
| 本番URL            | `https://www.norops.jp`           |
| GitHub             | `project-norops/sakupura`         |
| Vercel Project     | `100apps-portal`                  |
| 本番アプリ         | `apps/portal`                     |
| ミニサービス実装   | `packages/<slug>`                 |
| 公開URL            | `/tools/<slug>`                   |
| サービス台帳       | `apps/portal/src/data/tools.json` |
| 共通UI・Google連携 | `packages/shared-ui`              |

## 新規サービスの構成

```text
packages/<slug>/
  <PascalName>Page.tsx
  index.ts
  package.json

apps/portal/src/app/tools/<slug>/
  page.tsx
```

台帳を唯一のサービス一覧とし、ポータルカードとsitemapは台帳から生成する。新規サービスは`npm run create:tool`で追加する。

各サービスは機能だけでなく、台帳内に対象者、固有機能、使い方、注意点、FAQ、リリース告知文を持つ。`ToolGuide`がその内容を共通レイアウトで表示し、`npm run check:content`が公開品質を検査する。

## 公開状態

各サービスは台帳に`status`、`publishAt`、`announceOnX`、`announcedAt`を持つ。

| status      | 意味                 | ポータル・sitemap・URL |
| ----------- | -------------------- | ---------------------- |
| `draft`     | 開発中               | 非公開                 |
| `scheduled` | 公開日時を予約済み   | 非公開                 |
| `published` | 公開処理と確認が完了 | 公開                   |
| `archived`  | 公開終了             | 非公開                 |

- `scheduled`と`published`では、タイムゾーン付きISO形式の`publishAt`を必須とする。
- 予約時刻を過ぎただけでは公開しない。予約公開workflowが全品質検査に合格した場合だけ`published`へ変更する。
- 予約公開workflowは本番URLを確認し、確認できなければ台帳を`scheduled`へ戻して再デプロイする。
- `announceOnX`は告知対象かを示し、投稿成功後にだけ`announcedAt`を記録する。
- ポータルカードとsitemapは`published`だけを表示し、それ以外のツールURLは404を返す。

## 配信と外部サービス

- GitHubの`main`へのpushをVercel本番デプロイへ接続する。
- ルートの`vercel.json`だけを使用し、子ディレクトリにVercel設定を作らない。
- canonical、robots、sitemapは`https://www.norops.jp`を基準にする。
- GA4、Search Console、AdSenseの値は`packages/shared-ui/GoogleServices.ts`だけで管理し、各サービスへ直書きしない。
- DNS、Vercelドメイン、Google管理画面はリポジトリ外の構成である。コードの存在だけで完了とせず、本番URLから確認する。
- X告知は台帳から文面を生成する。手動workflowまたは有効化済みの予約公開workflowだけがOAuth 1.0a用の4つのRepository Secret（`X_API_KEY`、`X_API_KEY_SECRET`、`X_ACCESS_TOKEN`、`X_ACCESS_TOKEN_SECRET`）を使える。通常のpushだけでは投稿しない。
- 予約公開からのX告知は、品質検査、Vercel本番反映、対象URLの内容確認がすべて成功した後だけ実行する。投稿成功時は`announcedAt`を自動記録し、二重投稿を停止する。
- 定期実行はRepository Variable `SCHEDULED_RELEASES_ENABLED=true`の場合だけ有効になる。緊急停止はこの変数を`false`へ変更する。

## 共通OGP・Xカード

- サイト共通のブランド画像は`apps/portal/public/ogp/sakupura-ogp.png`（PNG、1200×630）を正本とし、本番絶対URL`https://www.norops.jp/ogp/sakupura-ogp.png`で配信する。編集用SVGも同じディレクトリへ保持する。
- 各ページのMetadataは`apps/portal/src/lib/metadata.ts`の`withSocialMetadata`を使う。ページ固有のtitle、description、canonical、Open Graph URLを保ったまま、共通の`openGraph.images`、`twitter.images`、画像alt、`summary_large_image`を付与する。
- Next.jsでは子segmentの`openGraph`や`twitter`が親segmentの同名オブジェクトを上書きするため、root metadataだけに依存しない。トップ、カテゴリ、ツール、サイトポリシー系ページの各metadataを共通処理で包む。
- `npm run create:tool`が使うroute templateにも同じ共通処理を組み込み、新規ツールで画像設定が欠落しないようにする。
- 個別ツール画像は最初から全件作らない。共有・XのUTM流入・クリック等を確認した後、反応の高い上位ツールに限って別途判断する。

## 実践ガイド

- `/guides`を仕事の進め方から既存ツールを選ぶ編集コンテンツの一覧とし、`/guides/<slug>`を個別ガイドの公開URLとする。
- ガイド正本は`apps/portal/src/data/guides.ts`とし、具体例、比較、作業順序、停止条件、適用限界、確認した一次情報・仕様を持つ。既存ツールの説明を言い換えただけのページを作らない。
- ガイドはトップ、該当カテゴリー、共通ヘッダー・フッター、sitemapから到達できるようにする。関連ツールは既存台帳slugを参照し、第二のツール台帳を作らない。
- `Article`構造化データ、canonical、更新日、一次情報リンクを持つ。法令・仕様の変更時は根拠と更新日を再確認する。
- ガイド追加は本数を目的にせず、既存ガイドと異なる利用判断、具体例、構成を持つ場合だけ行う。

## 現在の例外

- `apps/001-dynamic-pricing`は単体互換ビルドのため一時的に残す。新しいサービスでは同形式を増やさない。
- ルート直下の`100apps-*`は旧資産として隔離する。監査完了まで削除しないが、本番実装として利用しない。

## 設計変更の手順

この契約を変える場合は、先に理由、移行手順、Vercel・DNS・Google連携への影響、ロールバック方法を記録する。実装だけを先行させない。
