/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { Footer } from "./Footer";

describe("Footer", () => {
  it("keeps policy links and exposes the X feedback profile safely", () => {
    render(<Footer />);

    expect(screen.getByRole("link", { name: "プライバシーポリシー" })).toHaveAttribute(
      "href",
      "/privacy",
    );
    expect(screen.getByRole("link", { name: "免責事項" })).toHaveAttribute(
      "href",
      "/disclaimer",
    );
    expect(screen.getByRole("link", { name: "サクプラ トップ" })).toHaveAttribute(
      "href",
      "/",
    );

    const feedbackLink = screen.getByRole("link", {
      name: "ご意見・不具合報告（X・新しいタブで開く）",
    });
    expect(feedbackLink).toHaveAttribute("href", "https://x.com/sakupura_tools");
    expect(feedbackLink).toHaveAttribute("target", "_blank");
    expect(feedbackLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(feedbackLink).toHaveTextContent("ご意見・不具合報告（X）");
    expect(
      screen.getByText("Xの公開投稿には個人情報・機密情報を書かないでください。"),
    ).toBeInTheDocument();
  });
});
