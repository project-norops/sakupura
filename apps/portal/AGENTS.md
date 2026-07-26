# ポータル固有ルール

- CSV・TSVアップロード画面には、固定スキーマがある場合は入力用テンプレートのダウンロードを置く。固定スキーマがない場合も、その説明と確認用サンプルを置く。
- 印刷・PDF保存はツールの成果物だけを対象にし、共通ヘッダー・フッター・入力UIを含めない。複数ページの表は見出し行と改ページを考慮する。

ルートの`AGENTS.md`と`ARCHITECTURE.md`を優先して守る。

- 新規ツールの骨組みは`npm run create:tool`で生成する。
- `src/data/tools.json`をサービス台帳の唯一の情報源とする。
- ポータルカードとsitemapへ同じ情報を手作業で重複追加しない。
- カードとsitemapには`published`だけを表示し、`draft`、`scheduled`、`archived`のURLは404にする。
- 新規ツールの`status`は`draft`から始め、公開日時とX告知状態を台帳で管理する。
- Google連携は`@sakupla/shared-ui`を利用し、ポータルや各ツールへIDを直書きしない。
- 本番公開はこのポータルの`/tools/*`だけとし、子Vercel Projectを作らない。
