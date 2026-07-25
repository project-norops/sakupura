export type ReplyTone = "polite" | "friendly" | "short";
export type BusinessType = "service" | "retail";

export type ReplyInput = {
  businessType: BusinessType;
  rating: number;
  tone: ReplyTone;
  customerName: string;
  storeName: string;
  staffName: string;
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
  const staff = input.staffName.trim();
  const prefix = greeting(input.customerName);
  const isRetail = input.businessType === "retail";
  const closing = isRetail
    ? store
      ? `今後とも${store}をよろしくお願いいたします。`
      : "またご利用いただけましたら幸いです。"
    : store
      ? `また${store}をご利用いただける日を、心よりお待ちしております。`
      : "またのご利用を心よりお待ちしております。";

  if (rating <= 2) {
    const concern = detail
      ? `${detail}についてのご指摘を真摯に受け止め、`
      : "いただいたご意見を真摯に受け止め、";
    const improvement = isRetail
      ? "商品やご案内の内容を確認し、改善に努めます。"
      : "当日の対応やサービス内容を確認し、改善に努めます。";
    const staffFollow = staff
      ? `担当した${staff}とも内容を共有し、${improvement}`
      : improvement;
    if (input.tone === "short")
      return `${prefix}ありがとうございます。ご期待に沿えず、申し訳ございません。${concern}${staffFollow}`;
    const follow = staff
      ? `担当した${staff}とも内容を共有し、${improvement}`
      : improvement;
    return `${prefix}ありがとうございます。せっかくお選びいただいたにもかかわらず、ご期待に沿えず申し訳ございません。${concern}${follow}貴重なご意見をありがとうございました。`;
  }

  if (rating === 3) {
    const middle = detail
      ? `${detail}についての率直なお声は、今後の改善に生かしてまいります。`
      : "よりご満足いただけるよう、今後も改善を続けてまいります。";
    const staffNote = staff ? `担当した${staff}にも共有いたします。` : "";
    return `${prefix}ありがとうございます。${middle}${staffNote}${closing}`;
  }

  const joy = detail
    ? `${detail}について高く評価していただき、大変うれしく思います。`
    : "温かいお言葉をいただき、大変うれしく思います。";
  const staffNote = staff
    ? `担当した${staff}にとっても大きな励みになります。`
    : "スタッフ一同の励みになります。";
  if (input.tone === "short")
    return `${prefix}ありがとうございます。${joy}${staffNote}${closing}`;
  if (input.tone === "friendly")
    return `${prefix}ありがとうございます。${joy}${staffNote}${isRetail ? "これからも安心してお選びいただける商品とサービスをお届けします。" : "次回も気持ちよくご利用いただけるよう努めます。"}${closing}`;
  return `${prefix}ありがとうございます。${joy}${staffNote}${isRetail ? "今後も安心してお選びいただける商品とサービスをお届けしてまいります。" : "これからもご期待に沿えるよう、より良いサービスをお届けしてまいります。"}${closing}`;
}
