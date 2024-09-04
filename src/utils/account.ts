import crypto from "crypto";
import { AccountValidation } from "accsaver-shared";
import { ObjectId } from "mongodb";
import { isPlainObject } from "./validation.js";
import type { AccountDecrypted, AccountEncrypted } from "../db.js";

const algorithm = process.env.SYM_ENC_ALGORITHM;
const key = Buffer.from(
  process.env.SYM_ENC_KEY,
  process.env.SYM_ENC_KEY_ENCODING as BufferEncoding
);

export function isValidAccountName(name: any) {
  return (
    typeof name === "string" && AccountValidation.validateName(name) === ""
  );
}

export function isValidAccountId(id: any) {
  return typeof id === "string" && ObjectId.isValid(id);
}

export function isValidAccountData(data: any) {
  return (
    isPlainObject(data) &&
    typeof data.username === "string" &&
    typeof data.email === "string" &&
    typeof data.password === "string" &&
    typeof data.recoveryCodes === "string" &&
    typeof data.otherNotes === "string" &&
    AccountValidation.validateUsername(data.username) === "" &&
    AccountValidation.validateEmail(data.email) === "" &&
    AccountValidation.validatePassword(data.password) === "" &&
    AccountValidation.validateRecoveryCodes(data.recoveryCodes) === "" &&
    AccountValidation.validateOtherNotes(data.otherNotes) === ""
  );
}

export function encryptAccount(account: AccountDecrypted): AccountEncrypted {
  const iv = crypto.randomBytes(
    parseInt(process.env.SYM_ENC_KEY_SIZE_IN_BYTES, 10)
  );
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let dataBase64 = cipher.update(
    JSON.stringify(account.data),
    "utf8",
    "base64"
  );
  dataBase64 += cipher.final("base64");

  return {
    id: account.id,
    name: account.name,
    data: {
      base64: dataBase64,
      ivHex: iv.toString("hex")
    }
  };
}

export function decryptAccount(account: AccountEncrypted): AccountDecrypted {
  const iv = Buffer.from(account.data.ivHex, "hex");
  const deCipher = crypto.createDecipheriv(algorithm, key, iv);

  let data;
  data = deCipher.update(account.data.base64, "base64", "utf8");
  data += deCipher.final("utf8");
  data = JSON.parse(data);

  return {
    id: account.id,
    name: account.name,
    data
  };
}
