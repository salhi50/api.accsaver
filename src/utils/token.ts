import { randomBytes } from "crypto";

export const TOKEN_SIZE = 32;
export const TOKEN_ENCODING = "base64url";

export function isValidToken(token: any) {
  return (
    typeof token === "string" &&
    Buffer.byteLength(token, TOKEN_ENCODING) === TOKEN_SIZE
  );
}

export function generateToken() {
  return randomBytes(TOKEN_SIZE).toString(TOKEN_ENCODING);
}

export function generateLink(baseURL: string, token: string) {
  const BASE_URL = new URL(baseURL);
  BASE_URL.searchParams.set("token", token);
  return BASE_URL.toString();
}
