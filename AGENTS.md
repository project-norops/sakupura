# サクプラ AI開発ガードレール

このファイルはリポジトリ全体に適用される。作業開始時に本ファイル、`ARCHITECTURE.md`、`DEVELOPMENT_LOG.md`を読むこと。

## 変更してよい範囲

- 本番はVercel Project `100apps-portal`の1つだけとする。
- 新しいミニサービスは`packages/<slug>`へ実装し、公開URLは`/tools/<slug>`とする。
- 新しい独立Next.jsアプリ、Vercel Project、独自ドメイン、リポジトリを作らない。
- 既存の`apps/001-dynamic-pricing`は移行互換用。明示的な依頼なしに複製・削除しない。
- `100apps-portal`、`100apps-001-dynamic-pricing`、`100apps-template`は隔離中の旧資産。今回の本番構成として参照・編集しない。
- 共通レイアウト、Google連携、ドメイン、DNS、環境変数、Vercel設定を変更する場合は、影響を説明し、公開状態まで検証する。
- 外部AI APIを利用する機能を追加しない。データは原則としてブラウザ内で処理・保存する。

## 新しいミニサービス

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
