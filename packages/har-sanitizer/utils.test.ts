import {
  entryCount,
  parseHar,
  sanitizeHar,
  scanHar,
  serializeHar,
} from "./utils";

const sample = {
  log: {
    version: "1.2",
    entries: [
      {
        request: {
          method: "POST",
          url: "https://example.com/api?token=query-secret&view=ok",
          headers: [
            { name: "Authorization", value: "Bearer abc.def.ghi" },
            { name: "Accept", value: "application/json" },
          ],
          cookies: [{ name: "sid", value: "cookie-secret" }],
          queryString: [
            { name: "token", value: "query-secret" },
            { name: "view", value: "ok" },
          ],
          postData: {
            mimeType: "application/json",
            text: JSON.stringify({
              profile: { password: "body-secret", name: "A" },
            }),
          },
        },
        response: {
          headers: [{ name: "Set-Cookie", value: "sid=response-secret" }],
          cookies: [],
          content: {
            mimeType: "application/json",
            text: JSON.stringify({
              access_token: "response-token",
              status: "ok",
            }),
          },
        },
      },
    ],
  },
};

test("parses HAR 1.2 entries and rejects other JSON", () => {
  expect(entryCount(parseHar(JSON.stringify(sample)))).toBe(1);
  expect(() => parseHar("{}")).toThrow("log.entries");
  expect(() => parseHar("not-json")).toThrow("JSONとして");
});

test("finds headers, cookies, query values, and nested JSON keys without exposing raw values", () => {
  const findings = scanHar(sample);
  expect(findings.map((finding) => finding.name)).toEqual([
    "Authorization",
    "Set-Cookie",
    "sid",
    "token",
    "password",
    "access_token",
  ]);
  expect(
    findings.every((finding) => !finding.maskedPreview.includes("secret")),
  ).toBe(true);
  expect(
    findings.find((finding) => finding.name === "Authorization")?.risk,
  ).toBe("high");
});

test("redacts only selected findings and reports remaining candidates", () => {
  const findings = scanHar(sample);
  const selected = new Set(
    findings
      .filter((finding) =>
        ["Authorization", "token", "password"].includes(finding.name),
      )
      .map((finding) => finding.id),
  );
  const result = sanitizeHar(sample, selected);
  const output = serializeHar(result.har);

  expect(result.audit).toHaveLength(3);
  expect(result.remaining.map((finding) => finding.name)).toEqual([
    "Set-Cookie",
    "sid",
    "access_token",
  ]);
  expect(output).toContain('"value": "[REDACTED]"');
  expect(output).toContain("token=%5BREDACTED%5D");
  expect(output).toContain('\\"password\\":\\"[REDACTED]\\"');
  expect(output).toContain("cookie-secret");
});

test("redacts all findings without mutating the source HAR", () => {
  const findings = scanHar(sample);
  const result = sanitizeHar(
    sample,
    new Set(findings.map((finding) => finding.id)),
  );
  expect(result.remaining).toHaveLength(0);
  expect(serializeHar(result.har)).not.toContain("body-secret");
  expect(JSON.stringify(sample)).toContain("body-secret");
});
