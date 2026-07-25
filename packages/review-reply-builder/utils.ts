export type ReplyTone = "polite" | "friendly" | "short";

export type ReplyInput = {
  rating: number;
  tone: ReplyTone;
  customerName: string;
  storeName: string;
  detail: string;
};

const greeting = (name: string) =>
  name.trim()
    ? `${name.trim()}様、このたびは口コミをお寄せいただき、`
    : "このたびは口コミをお寄せいただき、";

export function buildReply(input: ReplyInput): string {
  const rating = Math.min(5, Math.max(1, Math.round(input.rating)));
  const detail = input.detail.trim();
  const store = input.storeName.trim();
  const prefix = greeting(input.customerName);
  const closing = store
    ? `今後とも${store}をよろしくお願いいたします。`
    : "またのご利用を心よりお待ちしております。";

  if (rating <= 2) {
    const concern = detail
      ? `「${detail}」とのご指摘を真摯に受け止め、`
      : "いただいたご意見を真摯に受け止め、";
    if (input.tone === "short")
      return `${prefix}ありがとうございます。ご期待に沿えず、申し訳ございません。${concern}改善に努めます。`;
    return `${prefix}誠にありがとうございます。せっかくお選びいただいたにもかかわらず、ご期待に沿えず申し訳ございません。${concern}原因を確認し、サービスの改善に努めてまいります。貴重なご意見をありがとうございました。`;
  }

  if (rating === 3) {
    const middle = detail
      ? `「${detail}」についてのお声も、今後の改善に生かしてまいります。`
      : "よりご満足いただけるよう、サービスの改善を続けてまいります。";
    return `${prefix}ありがとうございます。${middle}${closing}`;
  }

  const joy = detail
    ? `「${detail}」をお褒めいただき、スタッフ一同とても励みになります。`
    : "温かいお言葉をいただき、スタッフ一同とても励みになります。";
  if (input.tone === "short")
    return `${prefix}ありがとうございます。${joy}${closing}`;
  if (input.tone === "friendly")
    return `${prefix}ありがとうございます！${joy}次回も気持ちよくご利用いただけるよう努めます。${closing}`;
  return `${prefix}誠にありがとうございます。${joy}これからもご期待に沿えるよう、より良いサービスをお届けしてまいります。${closing}`;
}
