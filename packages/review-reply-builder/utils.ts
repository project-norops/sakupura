export type ReplyTone = "polite" | "friendly" | "short";

export type ReplyInput = {
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
  const closing = store
    ? `今後とも${store}をよろしくお願いいたします。`
    : "またのご利用を心よりお待ちしております。";

  if (rating <= 2) {
    const concern = detail
      ? `「${detail}」についてのご指摘を真摯に受け止め、`
      : "いただいたご意見を真摯に受け止め、";
    const staffFollow = staff
      ? `担当した${staff}とも内容を共有し、改善に努めます。`
      : "改善に努めます。";
    if (input.tone === "short")
      return `${prefix}ありがとうございます。ご期待に沿えず、申し訳ございません。${concern}${staffFollow}`;
    const follow = staff
      ? `担当した${staff}とも内容を共有し、原因を確認したうえで改善に努めてまいります。`
      : "原因を確認したうえで、改善に努めてまいります。";
    return `${prefix}ありがとうございます。せっかくお選びいただいたにもかかわらず、ご期待に沿えず申し訳ございません。${concern}${follow}貴重なご意見をありがとうございました。`;
  }

  if (rating === 3) {
    const middle = detail
      ? `「${detail}」についての率直なお声は、今後の改善に生かしてまいります。`
      : "よりご満足いただけるよう、今後も改善を続けてまいります。";
    const staffNote = staff ? `担当した${staff}にも共有いたします。` : "";
    return `${prefix}ありがとうございます。${middle}${staffNote}${closing}`;
  }

  const joy = detail
    ? `「${detail}」について高く評価していただき、大変うれしく思います。`
    : "温かいお言葉をいただき、大変うれしく思います。";
  const staffNote = staff
    ? `担当した${staff}にとっても大きな励みになります。`
    : "スタッフ一同の励みになります。";
  if (input.tone === "short")
    return `${prefix}ありがとうございます。${joy}${staffNote}${closing}`;
  if (input.tone === "friendly")
    return `${prefix}ありがとうございます。${joy}${staffNote}次回も気持ちよくご利用いただけるよう努めます。${closing}`;
  return `${prefix}ありがとうございます。${joy}${staffNote}これからもご期待に沿えるよう、より良いサービスをお届けしてまいります。${closing}`;
}
