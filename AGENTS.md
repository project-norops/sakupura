# サクプラ AI開発ガードレール

このファイルはリポジトリ全体に適用される。作業開始時に本ファイル、`ARCHITECTURE.md`、`ANALYTICS.md`、`PRODUCT_RESEARCH.md`、`PRODUCT_PLAN.md`、`ROADMAP.md`、`DEVELOPMENT_LOG.md`を読むこと。

## 変更してよい範囲

- 本番はVercel Project `100apps-portal`の1つだけとする。
- 新しいミニサービスは`packages/<slug>`へ実装し、公開URLは`/tools/<slug>`とする。
- 新しい独立Next.jsアプリ、Vercel Project、独自ドメイン、リポジトリを作らない。
- 既存の`apps/001-dynamic-pricing`は移行互換用。明示的な依頼なしに複製・削除しない。
- `100apps-portal`、`100apps-001-dynamic-pricing`、`100apps-template`は隔離中の旧資産。今回の本番構成として参照・編集しない。
- 共通レイアウト、Google連携、ドメイン、DNS、環境変数、Vercel設定を変更する場合は、影響を説明し、公開状態まで検証する。
- 外部AI APIを利用する機能を追加しない。データは原則としてブラウザ内で処理・保存する。
- GA4へ入力値、生成結果、個人情報を送らない。操作計測は`ANALYTICS.md`と共通計測処理を利用する。

## 新しいミニサービス

新規企画の提案・優先順位付け・開発判断では、先に`PRODUCT_RESEARCH.md`の必須分析、証拠ルール、採否基準、出力形式を適用する。未確認情報を事実として埋めず、既存ツールへの統合も比較し、ユーザーまたはプロダクト責任者の承認前に実装を開始しない。

実装・改善前に`PRODUCT_PLAN.md`の対象者、解決する面倒、無料版の核、有料候補、固有の確認事項を読む。調査で企画を変更した場合は、根拠とともに`PRODUCT_PLAN.md`を更新してから実装する。企画IDと実際のリリース順は別物として扱う。

手作業で骨組みを作らず、次を使う。

```bash
npm run create:tool -- --slug example-tool --title "表示名" --description "説明" --badge "分類"
```

生成後は実装に集中し、サービス一覧、sitemap、依存関係、公開ルートを個別に重複編集しない。

## 完了条件

1. `npm run check:architecture`
2. `npm run check:content`
3. `npm run lint`
4. `npm run build`
5. `DEVELOPMENT_LOG.md`へ日時、変更内容、検証結果を追記
6. `git add`、`git commit`、`git push`
7. 本番に影響する変更はVercelの成功と公開URLの応答を確認

エラーを無視して完了扱いにしない。秘密情報をコミットしない。破壊的操作は対象と復旧方法を確認してから行う。
