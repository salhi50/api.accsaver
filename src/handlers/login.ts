import type { Request, Response } from "express";
import {
  ResponseErrorMessage,
  type LoginRequestBody,
  type LoginResponseBody
} from "accsaver-shared";
import * as JWT from "../utils/jwt.js";
import { usersColl } from "../db.js";
import verifyCaptcha from "../utils/captcha.js";
import { isValidPassword, verifyPassword } from "../utils/password.js";
import { isValidEmail } from "../utils/email.js";

export default async function LoginHandler(
  req: Request<{}, LoginResponseBody, LoginRequestBody>,
  res: Response<LoginResponseBody>
) {
  const { email, password, captchaResponse } = req.body;
  let user, accessToken;

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

  user = await usersColl.findOne(
    { email },
    { projection: { password: 1, emailVerified: 1 } }
  );

  if (user === null || !(await verifyPassword(password, user.password))) {
    res.json({
      error: true,
      message: ResponseErrorMessage.INVALID_EMAIL_OR_PASSWORD
    });
    return;
  }

  if (!user.emailVerified) {
    res.json({ error: true, message: ResponseErrorMessage.EMAIL_NOT_VERIFIED });
    return;
  }

  accessToken = JWT.sign({
    uid: user._id.toString()
  });

  res.json({ accessToken });
}
