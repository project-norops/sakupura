import type { Metadata } from "next";

export const socialImagePath = "/ogp/sakupura-ogp.png";
export const socialImageAlt =
  "サクプラ｜登録不要・ブラウザですぐ使える無料Webツール";

const openGraphImage = {
  url: socialImagePath,
  width: 1200,
  height: 630,
  type: "image/png",
  alt: socialImageAlt,
} as const;

const twitterImage = {
  url: socialImagePath,
  alt: socialImageAlt,
} as const;

export function withSocialMetadata(metadata: Metadata): Metadata {
  const openGraph = metadata.openGraph ?? {};
  const twitter = metadata.twitter ?? {};
  const fallbackTitle =
    typeof metadata.title === "string" ? metadata.title : undefined;

  return {
    ...metadata,
    openGraph: {
      type: "website",
      locale: "ja_JP",
      siteName: "サクプラ",
      title: openGraph.title ?? fallbackTitle,
      description: openGraph.description ?? metadata.description ?? undefined,
      ...openGraph,
      images: [openGraphImage],
    },
    twitter: {
      title: twitter.title ?? openGraph.title ?? fallbackTitle,
      description:
        twitter.description ?? openGraph.description ?? metadata.description,
      ...twitter,
      card: "summary_large_image",
      images: [twitterImage],
    },
  };
}
