import assert from "node:assert/strict";
import test from "node:test";
import {
  createOAuthAuthorizationHeader,
  percentEncode,
  readXCredentials,
} from "./x-oauth1.mjs";

test("RFC 3986に従ってOAuthパラメーターをエンコードする", () => {
  assert.equal(percentEncode("Ladies + Gentlemen"), "Ladies%20%2B%20Gentlemen");
  assert.equal(percentEncode("!*'()"), "%21%2A%27%28%29");
});

test("RFC 5849の既知の署名例と一致する", () => {
  const header = createOAuthAuthorizationHeader({
    method: "GET",
    url: "http://photos.example.net/photos?file=vacation.jpg&size=original",
    consumerKey: "dpf43f3p2l4k3l03",
    consumerSecret: "kd94hf93k423kf44",
    accessToken: "nnch734d00sl2jdk",
    accessTokenSecret: "pfkkdhi9sl3r4s00",
    nonce: "kllo9940pd9333jh",
    timestamp: "1191242096",
  });

  assert.match(
    header,
    /oauth_signature="tR3%2BTy81lMeYAr%2FFid0kMTYa%2FWM%3D"/,
  );
  assert.match(header, /oauth_signature_method="HMAC-SHA1"/);
});

test("4つのX認証情報を環境変数から読み込む", () => {
  assert.deepEqual(
    readXCredentials({
      X_API_KEY: "key",
      X_API_KEY_SECRET: "key-secret",
      X_ACCESS_TOKEN: "token",
      X_ACCESS_TOKEN_SECRET: "token-secret",
    }),
    {
      consumerKey: "key",
      consumerSecret: "key-secret",
      accessToken: "token",
      accessTokenSecret: "token-secret",
    },
  );
});

test("不足しているSecret名をすべて表示する", () => {
  assert.throws(
    () => readXCredentials({ X_API_KEY: "key" }),
    /X_API_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET/,
  );
});
