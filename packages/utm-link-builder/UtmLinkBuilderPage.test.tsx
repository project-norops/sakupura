/** @jest-environment jsdom */

import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UtmLinkBuilderPage } from "./UtmLinkBuilderPage";

jest.mock("qrcode", () => ({
  __esModule: true,
  default: {
    toDataURL: jest.fn().mockResolvedValue("data:image/png;base64,qr"),
  },
}));

test("builds a normalized UTM link and explains each required field", async () => {
  const user = userEvent.setup();
  render(<UtmLinkBuilderPage />);

  await user.type(
    screen.getByPlaceholderText("https://www.example.com/service"),
    "https://example.com/page#section",
  );
  await user.type(screen.getByPlaceholderText("x"), "X");
  await user.type(screen.getByPlaceholderText("social"), "Social Media");
  await user.type(
    screen.getByPlaceholderText("summer_sale_2026"),
    "New Launch",
  );

  const result = await screen.findByDisplayValue(/utm_source=x/);
  expect((result as HTMLTextAreaElement).value).toContain(
    "utm_medium=social_media",
  );
  expect((result as HTMLTextAreaElement).value).toContain("#section");
  expect(screen.getByText(/どこから来たか/)).toBeInTheDocument();
  expect(screen.getByText(/どの手段で届けたか/)).toBeInTheDocument();
  await waitFor(() =>
    expect(
      screen.getByAltText("作成したUTMリンクのQRコード"),
    ).toBeInTheDocument(),
  );
});

test("links to official Google guidance and states it is unofficial", () => {
  render(<UtmLinkBuilderPage />);
  expect(
    screen.getByRole("link", { name: /Google Analytics公式/ }),
  ).toHaveAttribute(
    "href",
    "https://support.google.com/analytics/answer/10917952?hl=ja",
  );
  expect(screen.getByText(/Googleの公式ツールではなく/)).toBeInTheDocument();
});
