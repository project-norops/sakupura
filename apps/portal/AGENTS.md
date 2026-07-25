# ポータル固有ルール

ルートの`AGENTS.md`と`ARCHITECTURE.md`を優先して守る。

- 新規ツールの骨組みは`npm run create:tool`で生成する。
- `src/data/tools.json`をサービス台帳の唯一の情報源とする。
- ポータルカードとsitemapへ同じ情報を手作業で重複追加しない。
- Google連携は`@sakupla/shared-ui`を利用し、ポータルや各ツールへIDを直書きしない。
- 本番公開はこのポータルの`/tools/*`だけとし、子Vercel Projectを作らない。
