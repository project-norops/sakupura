import {
  analyzeManifest,
  parseManifest,
  serializeManifest,
  type LoadedIcon,
} from "./utils";

const manifest = {
  name: "Sample",
  short_name: "Sample",
  start_url: "/app/",
  scope: "/app/",
  display: "standalone",
  theme_color: "#123456",
  background_color: "#ffffff",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    {
      src: "/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any maskable",
    },
  ],
};

const icons: LoadedIcon[] = [
  {
    fileName: "icon-192.png",
    width: 192,
    height: 192,
    mimeType: "image/png",
    previewUrl: "blob:192",
  },
  {
    fileName: "icon-512.png",
    width: 512,
    height: 512,
    mimeType: "image/png",
    previewUrl: "blob:512",
  },
];

test("parses a manifest and rejects invalid JSON or a non-object root", () => {
  expect(parseManifest(JSON.stringify(manifest))).toEqual(manifest);
  expect(() => parseManifest("not-json")).toThrow("JSONとして");
  expect(() => parseManifest("[]")).toThrow("ルート");
});

test("accepts a complete sample and resolves icon URLs", () => {
  const result = analyzeManifest(
    manifest,
    "https://example.com/app.webmanifest",
    icons,
  );
  expect(result.issues).toHaveLength(0);
  expect(result.icons[0].resolvedUrl).toBe("https://example.com/icon-192.png");
  expect(serializeManifest(result.corrected)).toContain('"sizes": "512x512"');
});

test("reports URL, required member, dimension, and candidate problems", () => {
  const result = analyzeManifest(
    {
      start_url: "/outside/",
      scope: "/app/",
      display: "unknown",
      icons: [{ src: "/wide.png", sizes: "192x192", purpose: "any" }],
    },
    "https://example.com/app.webmanifest",
    [
      {
        fileName: "wide.png",
        width: 300,
        height: 200,
        mimeType: "image/png",
        previewUrl: "blob:wide",
      },
    ],
  );
  expect(result.issues.map((issue) => issue.path)).toEqual(
    expect.arrayContaining([
      "name",
      "short_name",
      "display",
      "start_url / scope",
      "icons[0]",
      "icons[0].sizes",
      "icons",
      "icons.purpose",
    ]),
  );
  expect(result.corrected.icons).toEqual([
    expect.objectContaining({ sizes: "300x200", type: "image/png" }),
  ]);
});

test("does not treat sizes any as the required 192 and 512 candidates", () => {
  const result = analyzeManifest(
    {
      name: "Sample",
      short_name: "Sample",
      start_url: "/",
      scope: "/",
      display: "standalone",
      icons: [{ src: "/icon.svg", sizes: "any", purpose: "maskable" }],
    },
    "https://example.com/manifest.webmanifest",
    [],
  );
  expect(result.issues.filter((issue) => issue.path === "icons")).toHaveLength(
    2,
  );
});
