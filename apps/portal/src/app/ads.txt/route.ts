import { googleServices } from "@sakupla/shared-ui";

const adsensePublisherId = googleServices.adsenseClientId.replace(/^ca-/, "");

export function GET() {
  return new Response(
    `google.com, ${adsensePublisherId}, DIRECT, f08c47fec0942fa0\n`,
    {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Content-Type": "text/plain; charset=utf-8",
      },
    },
  );
}
