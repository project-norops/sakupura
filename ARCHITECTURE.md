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

## 配信と外部サービス

- GitHubの`main`へのpushをVercel本番デプロイへ接続する。
- ルートの`vercel.json`だけを使用し、子ディレクトリにVercel設定を作らない。
- canonical、robots、sitemapは`https://www.norops.jp`を基準にする。
- GA4、Search Console、AdSenseの値は`packages/shared-ui/GoogleServices.ts`だけで管理し、各サービスへ直書きしない。
- DNS、Vercelドメイン、Google管理画面はリポジトリ外の構成である。コードの存在だけで完了とせず、本番URLから確認する。

## 現在の例外

- `apps/001-dynamic-pricing`は単体互換ビルドのため一時的に残す。新しいサービスでは同形式を増やさない。
- ルート直下の`100apps-*`は旧資産として隔離する。監査完了まで削除しないが、本番実装として利用しない。

## 設計変更の手順

この契約を変える場合は、先に理由、移行手順、Vercel・DNS・Google連携への影響、ロールバック方法を記録する。実装だけを先行させない。
