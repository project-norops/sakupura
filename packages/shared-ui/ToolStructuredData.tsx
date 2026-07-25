import type { ToolGuideContent } from "./ToolGuide";

export type ToolStructuredDataProps = {
  title: string;
  description: string;
  url: string;
  content: ToolGuideContent;
};

export function ToolStructuredData({
  title,
  description,
  url,
  content,
}: ToolStructuredDataProps) {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: title,
        description,
        url,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web Browser",
        inLanguage: "ja",
        offers: { "@type": "Offer", price: "0", priceCurrency: "JPY" },
        isAccessibleForFree: true,
      },
      {
        "@type": "FAQPage",
        mainEntity: content.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "サクプラ",
            item: "https://www.norops.jp/",
          },
          { "@type": "ListItem", position: 2, name: title, item: url },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
