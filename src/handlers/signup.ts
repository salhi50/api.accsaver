import type { Request, Response } from "express";
import type {
  SignupRequestBody,
  SignupErrorResponseBody
} from "accsaver-shared";
import { ResponseErrorMessage } from "accsaver-shared";
import { usersColl } from "../db.js";
import {
  hashPassword,
  isStrongPassword,
  isValidPassword
} from "../utils/password.js";
import { generateToken, generateLink } from "../utils/token.js";
import { isValidEmail, sendEmailVerification } from "../utils/email.js";
import verifyCaptcha from "../utils/captcha.js";

export default async function SignupHandler(
  req: Request<{}, SignupErrorResponseBody, SignupRequestBody>,
  res: Response<SignupErrorResponseBody>
) {
  const { email, password, captchaResponse } = req.body;
  let verToken: string;
  let verURL: string;

  if (!(await verifyCaptcha(captchaResponse))) {
    res.json({ error: true, message: ResponseErrorMessage.CAPTCHA_ERROR });
    return;
  }

  if (!isValidEmail(email) || !isValidPassword(password)) {
    res.json({
      error: true,
      message: ResponseErrorMessage.INVALID_EMAIL_OR_PASSWORD
    });
    return;
  }

  if (
    (await usersColl.findOne({ email }, { projection: { _id: 1 } })) !== null
  ) {
    res.json({ error: true, message: ResponseErrorMessage.EMAIL_EXIST });
    return;
  }

  if (!isStrongPassword(password, email)) {
    res.json({ error: true, message: ResponseErrorMessage.WEAK_PASSWORD });
    return;
  }

  verToken = generateToken();
  verURL = generateLink(
    process.env.CLIENT_EMAIL_VERIFICATION_BASE_URL,
    verToken
  );

  await sendEmailVerification(email, verURL);

  await usersColl.insertOne({
    email,
    password: await hashPassword(password),
    emailVerified: false,
    tokens: [{ name: "email_verification", value: verToken }],
    accounts: []
  });

  res.status(204).end();
}
