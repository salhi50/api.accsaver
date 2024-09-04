import JWT from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

export interface Payload {
  uid: string;
}

export function sign(payload: Payload) {
  return JWT.sign(payload, secret, {
    algorithm: "HS256",
    issuer: "AccSaver",
    expiresIn: "15m"
  });
}

export function verify(token: string) {
  try {
    return JWT.verify(token, secret, {
      algorithms: ["HS256"]
    }) as Payload;
  } catch (e) {
    return false;
  }
}
