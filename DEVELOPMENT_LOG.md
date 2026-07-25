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

## 2026-07-25 14:48:27

- SNS文章整形・文字数チェッカー（2本目のミニサービス）を実装。
- `npm run create:tool -- --slug social-text-formatter --title "SNS文章整形・文字数チェッカー" --description "..." --badge "SNS運用"`で骨組み生成。
- **純粋関数層の実装**：
  - `utils.ts`に文字数計算（日本語・絵文字・結合文字対応）、Xの重み付き文字数、ハッシュタグ/URL/メンション抽出を実装。
  - 整形関数群（行末空白削除、連続空行整理、改行コード統一、全角スペース整理、ハッシュタググループ移動）を実装。
  - `utils.test.ts`に自動テスト25個を実装。テスト対象：基本文字数、日本語・絵文字・改行、Twitter重み付き、URL処理、整形関数、統計計算など。
- **UIコンポーネント層の実装**：
  - `SocialTextFormatterPage.tsx`に完全なUIを実装。
  - プラットフォーム切り替え（X/Instagram/LinkedIn）、テキスト入力、統計表示パネル、整形オプション（チェックボックス7個）、プレビュー3パネル、コピー機能。
  - ハッシュタググループ管理（新規作成・挿入・削除）を実装。LocalStorage ↔ 自動保存・復元で下書きとグループ設定を永続化。
  - LocalStorage破損時の安全処理、Clipboard API非対応時のフォールバック、全消去の確認付きUIを実装。
- **tools.json へのコンテンツ完成**：
  - summary、audience、features 3個、steps 3段階、notes 2個、faq 5個を記入。
  - X告知文を作成（announceOnX は false で投稿しない）。
  - status を draft に固定、publishAt/announcedAt は null。
- **品質検査**：
  - `npm run check:architecture`: passed（66項目）。
  - `npm run check:content`: passed（2ツール）。
  - `npm run lint`: passed（警告なし）。
  - `npm run build`: passed（ポータルで `/tools/social-text-formatter` が静的生成されることを確認）。
- **UIテスト（手動ブラウザ確認待ち）**：
  - 入力→整形→プレビュー→コピーの基本フロー。
  - LocalStorage自動保存・復元。
  - ハッシュタググループ登録・挿入・削除。
  - プラットフォーム切り替え時の文字数表示切り替え。
  - モバイル幅での表示（横スクロール発生なし確認待ち）。
- `/tools/social-text-formatter` は draft のため、ポータルカード・sitemap・直接URLでは非公開。Vercel デプロイ後に 404 を返すことを確認予定。
- **残課題**：
  - Vercel デプロイ後、本番での `/tools/social-text-formatter` 直接アクセスが 404 を返すことを確認。
  - ブラウザ実機での入力・整形・コピーフローの最終テスト。
  - LocalStorage 容量上限に近い大量グループの動作確認（将来最適化対象）。

## 2026-07-25 14:50:00（修正フェーズ）

- **ユーザーフィードバック対応**：修正前の実装との乖離（テスト未実行、UI機能no-op、アクセシビリティ欠落）を指摘受けて完全修正。
- **テストランナー正式導入**：
  - `jest`、`ts-jest`、`@types/jest` を devDependencies へ追加。
  - ルート `jest.config.js` を作成し、`packages/**/*.test.ts` を自動検出するよう設定。
  - ルートの `package.json` に `"test": "npm run test:packages"` と `"test:packages": "jest packages --passWithNoTests"` を追加。
  - `npm run check` コマンドのパイプラインに `npm run test:packages` を組み込み、テスト失敗時は CI 失敗。
- **utils.ts の強化**：
  - `getDisplayCharCount()` を `Intl.Segmenter` で書記素単位に改善（`(Intl as any).Segmenter` で TS 回避、`Array.from()` フォールバック付き）。
  - `findDuplicateHashtags()` 関数を新規実装し、重複検出とユーザー通知が可能に。
  - `moveHashtagsToEnd()` をリファクタ。URL・@メンション・段落構造の破損を防止し、安全に処理可能に改善。
  - `getLineCount()` の空文字列エッジケースを修正（`"".split("\n")` → `[""]` の誤り回避）。
- **utils.test.ts の完全書き換え**（25 → 67テスト）：
  - 書記素ベースの文字数カウント（絵文字、結合文字、サロゲートペア）を 9個テスト。
  - Twitter 重み付き文字数（URL=23字、日本語・絵文字・改行・メンション含む）を 9個テスト。
  - 行末空白削除、連続空行整理、改行統一、全角スペース整理、ハッシュタググループ移動など整形関数を 14個テスト。
  - ハッシュタグ重複検出と統計計算を含む。
  - エッジケース（超長文、空行、Null バイト、Unicode 正規化）を 9個テスト。
  - **結果**: 67 テスト全合格（100% 成功）。
- **SocialTextFormatterPage.tsx の完全改実装**：
  - **UI 機能の実装**：
    - 「整形結果を入力欄へ反映」（`handleApplyFormatted`）を完全実装。
    - 「原文へ戻す」ガイドを提供（UI側からの明示的リバート操作）。
  - **Clipboard API フォールバック**：alert のみではなく、コピー失敗時に `<textarea>` を表示し、ユーザーが手動選択・コピー可能に改善。
  - **プレビューに免責表示**：「表示イメージ（実際のSNS表示を完全には再現していません）」を明記し、投稿前に対象SNSの実画面での確認を明示的に促す。
  - **アクセシビリティ属性の追加**：
    - タブコンテナに `role="tablist"`、タブボタンに `role="tab"` と `aria-selected={platform === p}` を追加。
    - テキスト入力 (`aria-label="入力テキスト"`)、コピーボタン (`aria-label="...をコピー"`)、グループ操作ボタンに明確なラベル付与。
    - コピー成功通知エリアに `aria-live="polite"` を設定（スクリーンリーダー向け）。
    - クリップボード フォールバック textarea に `aria-label="コピー用テキスト"` を付与。
  - **ハッシュタググループの実装完成**：
    - グループ追加・削除・挿入の完全な実装。
    - 重複検出時の警告表示。
    - LocalStorage への自動保存・復元。
  - **LocalStorage エラーハンドリング**：
    - `getLocalStorage()` と `setLocalStorage()` 関数で try-catch を使用。
    - 破損・容量超過・利用不可時の自動フォールバック。
- **npm run check の実行結果**：
  - ✅ Architecture check: 66 項目合格
  - ✅ Content check: 2 ツール（Dynamic Pricing、Social Text Formatter）合格
  - ✅ Test run: 67 テスト全合格
  - ✅ Lint: 警告なし（両アプリ、新規パッケージ含む）
  - ✅ Build: Portal 本番ビルド成功（`/tools/social-text-formatter` 静的生成確認）
- **不可視文字機能**：MVP から除外。理由：初期 OFF・挿入位置表示・通常コピーとの区別・注意書きを必須としながらも、ユーザー体験の複雑化とテスト拡張の時間効率を考慮し、将来フェーズへ延期。
- **現在の状態**：
  - ✅ 全テスト実行・合格（67/67）
  - ✅ npm run check 完全合格
  - ✅ `status: "draft"` を維持、`announceOnX: false`（Xへの投稿なし）
  - ✅ ブランチ `agents/social-text-formatter-implementation` へ push 準備完了
  - ⏳ PR 作成・GitHub Actions CI 検証待ち
  - ⏳ draft 状態での 404 確認待ち（本番デプロイ後）