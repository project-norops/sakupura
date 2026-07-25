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

骨組みは標準コマンドから生成します。

```bash
npm run create:tool -- --slug example-tool --title "表示名" --description "説明" --badge "分類"
```

このコマンドが`packages/<service-name>`、`/tools/<service-name>`、サービス台帳、
ポータル依存を同時に作成します。手作業で同じ情報を複数箇所へ追加しません。

新規サービスは必ず`draft`で生成されます。台帳の公開制御項目は次のとおりです。

```json
{
  "status": "draft",
  "publishAt": null,
  "announceOnX": false,
  "announcedAt": null
}
```

予約時は`status`を`scheduled`にして`publishAt`へタイムゾーン付きISO日時を設定します。
現在は予約情報を保持する段階であり、時刻到来だけでは公開されません。公開確認後に
`published`へ変更すると、ポータルカード、sitemap、ツールURLが公開されます。
`draft`、`scheduled`、`archived`のツールURLは404になります。

実装後は`npm run check`で構成検査、lint、本番ビルドをまとめて実行してから
`main`へPushします。

## Xリリース告知

告知文はサービス台帳の`releasePost`から生成します。

```bash
npm run release:post -- --slug example-tool
```

実投稿にはX Developer AppのUser Access TokenをGitHub Repository Secret
`X_USER_ACCESS_TOKEN`へ登録します。GitHub Actionsの
`Announce released tool on X`を手動実行し、公開済みサービスのslugを指定します。
投稿できるのは`published`かつ`announceOnX: true`で`announcedAt: null`のサービスだけです。
成功後はworkflowが`announcedAt`を台帳へ記録するため、同じサービスの再投稿を停止できます。
通常のpushでは投稿しません。

新しい単体Next.jsアプリやVercel Projectは作成しません。既存の単体互換アプリも、
本番公開先はポータル内の`/tools/<service-name>`とします。

## デプロイ後の確認

1. 対象サービスの `/tools/...` URLが200を返す。
2. トップページのカードから同じURLへ遷移できる。
3. `google-site-verification` がHTMLに含まれる。
4. GA4／AdSenseスクリプトが読み込まれる。
5. `/robots.txt` と `/sitemap.xml` が正しい。
