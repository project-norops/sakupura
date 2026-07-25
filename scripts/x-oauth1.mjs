import { createHmac, randomBytes } from "node:crypto";

export const REQUIRED_X_SECRETS = [
  "X_API_KEY",
  "X_API_KEY_SECRET",
  "X_ACCESS_TOKEN",
  "X_ACCESS_TOKEN_SECRET",
];

export function readXCredentials(env = process.env) {
  const missing = REQUIRED_X_SECRETS.filter((name) => !env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(
      `GitHub Repository Secretが不足しています: ${missing.join(", ")}`,
    );
  }

  return {
    consumerKey: env.X_API_KEY.trim(),
    consumerSecret: env.X_API_KEY_SECRET.trim(),
    accessToken: env.X_ACCESS_TOKEN.trim(),
    accessTokenSecret: env.X_ACCESS_TOKEN_SECRET.trim(),
  };
}

export function percentEncode(value) {
  return encodeURIComponent(String(value)).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export function createOAuthAuthorizationHeader({
  method,
  url,
  consumerKey,
  consumerSecret,
  accessToken,
  accessTokenSecret,
  nonce = randomBytes(18).toString("hex"),
  timestamp = Math.floor(Date.now() / 1000).toString(),
}) {
  const parsedUrl = new URL(url);
  const oauthParameters = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: accessToken,
    oauth_version: "1.0",
  };
  const signatureParameters = [
    ...parsedUrl.searchParams.entries(),
    ...Object.entries(oauthParameters),
  ]
    .map(([key, value]) => [percentEncode(key), percentEncode(value)])
    .sort(([leftKey, leftValue], [rightKey, rightValue]) =>
      leftKey === rightKey
        ? leftValue.localeCompare(rightValue)
        : leftKey.localeCompare(rightKey),
    )
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const normalizedUrl = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;
  const signatureBase = [
    method.toUpperCase(),
    percentEncode(normalizedUrl),
    percentEncode(signatureParameters),
  ].join("&");
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(accessTokenSecret)}`;
  const signature = createHmac("sha1", signingKey)
    .update(signatureBase)
    .digest("base64");

  return `OAuth ${Object.entries({
    ...oauthParameters,
    oauth_signature: signature,
  })
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${percentEncode(key)}="${percentEncode(value)}"`)
    .join(", ")}`;
}
