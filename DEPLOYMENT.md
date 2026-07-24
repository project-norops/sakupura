# サクプラ デプロイガイド

サクプラは1つのNext.js／Vercel Projectとして運用します。ミニサービスごとに
Vercel Projectやドメインを作成せず、`https://www.norops.jp/tools/...` 配下の
ルートとして公開します。

## Vercel Project

- Git repository: `project-norops/sakupura`
- Production branch: `main`
- Root Directory: repository root
- Framework: Next.js
- Production domain: `https://www.norops.jp`

ルートの `vercel.json` が `apps/portal` をビルドし、
`apps/portal/.next` を本番成果物として公開します。

## 環境変数

```text
NEXT_PUBLIC_SITE_URL=https://www.norops.jp
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<optional override>
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=<optional override>
NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID=<optional override>
```

Googleの現在値は `packages/shared-ui/GoogleServices.ts` に既定値があります。
値の更新や環境別の分離が必要な場合だけVercel環境変数で上書きします。

## ミニサービス追加規約

1. 再利用可能な実装を `packages/<service-name>` に置く。
2. `apps/portal/src/app/tools/<service-name>/page.tsx` から公開する。
3. `apps/portal/src/data/apps.ts` にポータルカードを追加する。
4. `apps/portal/src/app/sitemap.ts` に公開URLを追加する。
5. `npm run lint` と `npm run build` を通してから `main` へPushする。

単体開発用Next.jsアプリを残す場合でも、本番公開先はポータル内の
`/tools/<service-name>` とします。

## デプロイ後の確認

1. 対象サービスの `/tools/...` URLが200を返す。
2. トップページのカードから同じURLへ遷移できる。
3. `google-site-verification` がHTMLに含まれる。
4. GA4／AdSenseスクリプトが読み込まれる。
5. `/robots.txt` と `/sitemap.xml` が正しい。
