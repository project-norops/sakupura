# サクプラ Copilot instructions

- 作業前に`AGENTS.md`、`ARCHITECTURE.md`、`ANALYTICS.md`、`DEVELOPMENT_LOG.md`を読む。
- 本番はGitHub `project-norops/sakupura`、Vercel Project `100apps-portal`、`https://www.norops.jp`の1系統だけである。
- 新規ツールは必ず`npm run create:tool`から作成し、`packages/<slug>`と`/tools/<slug>`へ配置する。新規Next.jsアプリ、Vercel Project、独自ドメインを作らない。
- `apps/portal/src/data/tools.json`をサービス台帳の唯一の情報源とする。カード、sitemap、依存関係を別々に手編集しない。
- 新規ツールは`draft`で生成する。`status`、`publishAt`、`announceOnX`、`announcedAt`を削除せず、`published`になるまでカード・sitemap・URLへ公開しない。
- `scheduled`は予約情報であり、時刻到来だけで`published`へ変更しない。`.github/workflows/scheduled-release.yml`が品質検査と本番URL確認を行う。予約公開ロジックを各ツールへ複製しない。
- 各ツールには対象者、固有機能、使い方、注意点、FAQ、X告知文を具体的に記載する。文字数を埋めるための一般論、他ツールからのコピー、未確認情報を追加しない。
- 共通UI、ブックマーク、フッター、Google連携は`@sakupla/shared-ui`を利用する。Google IDをツールへ直書きしない。
- 操作計測は`ANALYTICS.md`と`@sakupla/shared-ui`の共通処理を利用する。主処理には`tool_run`を設定し、入力文章、金額、URLクエリ、LocalStorage、個人情報をGA4へ送らない。
- 外部API、DNS、Vercel、GitHub Secrets、X投稿などの外部状態を無断で変更しない。X投稿は手動workflowまたは明示的に有効化された予約公開workflowだけを使い、本番確認と投稿に成功した場合だけ`announcedAt`を記録する。
- 完了前に`npm run check`を実行し、ログ更新、commit、push、本番確認まで行う。失敗や警告を無視しない。
- 旧資産`100apps-*`は隔離中である。明示的な監査・移行タスク以外では編集・削除しない。
