---
applyTo: "packages/**,apps/portal/src/app/tools/**,apps/portal/src/data/tools.json,templates/tool/**"
---

# ミニサービス固有ルール

- 機能はブラウザ内で完結させ、サーバー費用や外部AI API依存を増やさない。
- 計算根拠、対象外の条件、データ保存場所を利用者に説明する。
- `ToolGuide`を外さず、台帳の`content`をツール固有の検証済み文章で完成させる。
- 新規ツールは`draft`のまま実装する。公開予約では`scheduled`とタイムゾーン付き`publishAt`を設定し、公開確認前に`published`へ変更しない。
- `announceOnX`と`announcedAt`を手動で推測更新しない。`announcedAt`は投稿成功を確認した処理だけが設定する。
- 入力値を検証し、異常値、空入力、コピー失敗、LocalStorage破損を安全に処理する。
- 金融、税務、法務、医療など重要判断に関わる結果は参考値と明示し、公式情報や専門家確認を案内する。
- 公開前に`npm run check:content`を通し、同一説明文の横展開やTODOを残さない。
