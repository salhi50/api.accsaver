import type { Account as SharedAccount } from "accsaver-shared";
import { MongoClient } from "mongodb";

interface Token {
  name: string;
  value: string;
}

interface PasswordResetToken extends Token {
  name: "password_reset";
}

interface EmailVerificationToken extends Token {
  name: "email_verification";
}

interface Account extends Pick<SharedAccount, "name" | "id"> {
  data: unknown;
}

interface AccountEncrypted extends Account {
  data: {
    base64: string;
    ivHex: string;
  };
}

interface AccountDecrypted extends Account {
  data: SharedAccount["data"];
}

interface User {
  email: string;
  emailVerified: boolean;
  password: string;
  tokens: (PasswordResetToken | EmailVerificationToken)[];
  accounts: AccountEncrypted[];
}

const url = process.env.MONGO_URI;
const client = new MongoClient(url);

const db = client.db("accsaver");
const usersColl = db.collection<User>("users");

export { usersColl };
export type {
  EmailVerificationToken,
  PasswordResetToken,
  Account,
  AccountEncrypted,
  AccountDecrypted
};
