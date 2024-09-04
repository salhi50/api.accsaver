import bcrypt from "bcrypt";
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";
import { CredentielsValidation } from "accsaver-shared";

const MINIMUM_ZXCVBN_SCORE = 2;

zxcvbnOptions.setOptions({
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary
  }
});

export function isValidPassword(password: any) {
  return (
    typeof password === "string" &&
    Buffer.byteLength(password, "utf8") <= 72 &&
    CredentielsValidation.validatePassword(password) === ""
  );
}

export function isStrongPassword(password: string, email: string) {
  return zxcvbn(password, [email]).score >= MINIMUM_ZXCVBN_SCORE;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  passwordPlain: string,
  passwordHashed: string
) {
  return bcrypt.compare(passwordPlain, passwordHashed);
}
