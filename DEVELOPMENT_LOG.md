# 開発ガイドライン & ガードレール規約

## 🛡️ AI開発 ガードレール規約
1. [cite_start]**基盤非破壊ルール**: 共通UI・ログ収集関数・共通レイアウトを変更・削除しないこと 。
2. [cite_start]**AI API依存ゼロ**: 外部AI API（OpenAI等）を呼び出すコードを実装しないこと 。
3. [cite_start]**ブラウザ完結型**: データ保存は LocalStorage / IndexedDB を優先し、サーバー費用を発生させないこと [cite: 1, 12]。

## 📝 変更履歴
- YYYY-MM-DD: 初期セットアップ完了

## 2026-07-25 05:25:14

- 現行モノリポを `apps/portal`、`apps/001-dynamic-pricing`、`packages/shared-ui` に整理。
- Search Console認証をNext.js metadataへ移し、GA4ローダーとAdSenseを共通レイアウトへ統合。
- ポータルのrobots／sitemap、Tailwind共有UI走査、ESLint、Vercel向け環境変数と手順書を整備。
- 動的プライシングの重複App Routerを解消し、入力復元・検証・BOOTH固定手数料・コピー失敗処理を修正。
- `npm run lint`: passed（両アプリ、警告なし）。
- `npm run build`: passed（両アプリ、静的生成成功）。
- Vercelのリポジトリ直下Project向けに、ポータルのbuild commandとoutput directoryを`vercel.json`で固定。
- 本番の308転送先に合わせ、SEO canonical／sitemap／robotsの基準URLを`https://www.norops.jp`へ統一。

## 2026-07-25 05:43:07

- 本番構成を「サクプラ単一Vercel Project＋`/tools/*`ミニサービス」に統一。
- 動的プライシングを`@sakupla/dynamic-pricing`パッケージへ分離し、`/tools/dynamic-pricing`から公開。
- ポータルカード、sitemap、デプロイ手順、npmワークスペース依存を単一プロジェクト構成へ更新。
- `npm run lint`: passed（警告なし）。
- `npm run build`: passed（ポータルに`/tools/dynamic-pricing`を静的生成、単体互換アプリも成功）。
- 本番依存監査でNext.js 16.2.11内のPostCSS／Sharpにhigh 3件を確認。安全な修正版Next.jsが未公開で、`npm audit fix --force`はNext.js 9への破壊的ダウングレードとなるため未適用。
- Vercelデプロイ成功。本番トップと`/tools/dynamic-pricing`の200応答、内部リンク、Googleコード、sitemap掲載を確認。

## 2026-07-25 10:20:00

- Google各サービスの確認失敗を調査し、`norops.jp`のDNS未構成とVercel DNSレコード欠落を特定。
- AdSense所有確認用の`google-adsense-account`メタタグをポータル全体へ追加。
- `/ads.txt`を追加し、共通設定の公開者IDからGoogle AdSenseレコードを生成。
- `npm run lint`: passed（両アプリ、警告なし）。
- `npm run build`: passed（ポータルの`/ads.txt`を含め、両アプリの本番ビルド成功）。

## 2026-07-25 12:52:02

- `ARCHITECTURE.md`を追加し、単一Vercel Project、`packages/<slug>`、`/tools/<slug>`、本番ドメイン、外部連携の固定契約を明文化。
- ルートとポータルの`AGENTS.md`を更新し、新規独立アプリ・Vercel Project・Google ID重複・旧資産利用を禁止。
- `npm run create:tool`を追加。ボイラープレートからservice package、ポータルroute、サービス台帳、portal依存を一括生成可能にした。
- サービス一覧を`tools.json`へ一元化し、ポータルカードとsitemapが同じ台帳を利用する構成へ変更。
- `npm run check:architecture`を追加し、Vercel設定、許可アプリ、台帳、package、route、依存、SEO・Google連携など34項目を自動検査。
- GitHub Actionsへ構成検査、lint、本番ビルドを追加。Tailwind走査対象を全service packageへ拡張。
- GitHub Actions公式ActionをNode.js 24対応の`checkout@v6`、`setup-node@v6`で固定。
- 生成コマンドのドライランとテンプレート変数検査: passed。
- Prettier検査: passed。
- `npm run check`: passed（構成検査34項目、両アプリlint、両アプリ本番ビルド成功）。

## 2026-07-25 13:28:16

- 共通`BookmarkButton`を追加。PC、iOS、Android向けの保存方法とURLコピーを全ページで案内。
- フッターへプライバシーポリシー、免責事項、トップへの共通リンクを追加し、`/privacy`と`/disclaimer`を新設。
- AdSense、GA4、Cookie、CMP、ブラウザ内データ保存をプライバシーポリシーへ明記し、法務ページをsitemapへ追加。
- 共通`ToolGuide`を追加し、各ツールにsummary、対象者、固有機能3件、使い方3件、注意点2件、FAQ3件を表示する構成へ変更。
- `npm run check:content`を追加。TODO、説明不足、重複summary、ガイド総量、X告知文をCIで検査。
- 動的プライシングへ固有の説明、使い方、制約、FAQ、リリース告知文を追加。
- X告知文生成とドライランを追加。実投稿は`X_USER_ACCESS_TOKEN`を使う手動GitHub Actionsに限定し、通常pushからの誤投稿を防止。
- `.github/copilot-instructions.md`とpath固有instructionsを追加し、現行リポジトリ構成、品質基準、外部操作制限をCopilotへ常時伝達。
- モバイル幅の実画面で横スクロールなし、ブックマークdialog、ツールガイド、法務ページ、外部リンクを確認。
- `npm run create:tool -- --dry-run`: passed。
- X告知文生成・投稿ドライラン: passed（実投稿なし）。
- `npm run check`: passed（構成検査47項目、コンテンツ品質検査、両アプリlint、両アプリ本番ビルド成功）。

## 2026-07-25 13:49:08

- サービス台帳へ`status`、`publishAt`、`announceOnX`、`announcedAt`を共通項目として追加。
- 公開状態を`draft`、`scheduled`、`published`、`archived`に固定し、新規ツールは安全な`draft`で生成するよう変更。
- ポータルカードとsitemapは`published`だけを対象にし、未公開・予約中・終了済みのツールrouteは404を返すよう変更。
- 予約時刻だけでは公開せず、将来のスケジューラーがCIと本番確認後に`published`へ遷移させる契約を文書化。
- 公開日時と告知日時の形式、状態との整合性、告知順序を`check:content`で検査。
- X投稿を`published`かつ`announceOnX: true`かつ未告知のサービスに限定し、成功時に`announcedAt`を台帳へ自動記録するworkflowへ更新。
- Copilotのリポジトリ共通指示、ツール固有指示、ポータルルール、デプロイ手順へ公開状態の扱いを追加。
- 新規ツール生成ドライラン、X告知文生成・投稿ドライラン: passed（実投稿なし）。
- `npm run check`: passed（構成検査51項目、コンテンツ品質検査、両アプリlint、両アプリ本番ビルド成功）。
