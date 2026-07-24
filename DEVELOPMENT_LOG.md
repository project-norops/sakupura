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
