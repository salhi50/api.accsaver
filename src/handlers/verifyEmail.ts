import type { Request, Response } from "express";
import type {
  EmailVerificationRequestBody,
  EmailVerificationResponseBody
} from "accsaver-shared";
import { usersColl } from "../db.js";
import { isValidToken } from "../utils/token.js";

export default async function VerifyEmailHandler(
  req: Request<{}, EmailVerificationResponseBody, EmailVerificationRequestBody>,
  res: Response<EmailVerificationResponseBody>
) {
  const { token } = req.body;
  let user;

  if (!isValidToken(token)) {
    res.json({ verified: false });
    return;
  }

  user = await usersColl.findOne({
    tokens: {
      $elemMatch: { name: "email_verification", value: token }
    }
  });

  if (user === null) {
    res.json({ verified: false });
    return;
  }

  await usersColl.updateOne(
    { _id: user._id },
    {
      $set: { emailVerified: true },
      $pull: {
        tokens: { name: "email_verification" }
      }
    }
  );

  res.json({ verified: true });
}
