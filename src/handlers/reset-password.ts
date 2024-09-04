import type { Request, Response } from "express";
import type {
  ResetPasswordRequestBody,
  ResetPasswordErrorResponseBody
} from "accsaver-shared";
import { ResponseErrorMessage } from "accsaver-shared";
import { isValidToken } from "../utils/token.js";
import { usersColl } from "../db.js";
import verifyCaptcha from "../utils/captcha.js";
import {
  hashPassword,
  isStrongPassword,
  isValidPassword
} from "../utils/password.js";

export default async function ResetPasswordHandler(
  req: Request<{}, ResetPasswordErrorResponseBody, ResetPasswordRequestBody>,
  res: Response<ResetPasswordErrorResponseBody>
) {
  const { token, newPassword, captchaResponse } = req.body;
  let user;

  if (!(await verifyCaptcha(captchaResponse))) {
    res.json({ error: true, message: ResponseErrorMessage.CAPTCHA_ERROR });
    return;
  }

  if (!isValidToken(token)) {
    res.json({ error: true, message: ResponseErrorMessage.INVALID_TOKEN });
    return;
  }

  user = await usersColl.findOne(
    {
      tokens: {
        $elemMatch: { name: "password_reset", value: token }
      }
    },
    { projection: { _id: 1, email: 1 } }
  );

  if (user === null) {
    res.json({ error: true, message: ResponseErrorMessage.INVALID_TOKEN });
    return;
  }

  if (!isValidPassword(newPassword)) {
    res.json({ error: true, message: ResponseErrorMessage.INVALID_PASSWORD });
    return;
  }

  if (!isStrongPassword(newPassword, user.email)) {
    res.json({ error: true, message: ResponseErrorMessage.WEAK_PASSWORD });
    return;
  }

  await usersColl.updateOne(
    { _id: user._id },
    {
      $set: {
        password: await hashPassword(newPassword)
      },
      $pull: {
        tokens: { name: "password_reset" }
      }
    }
  );

  res.status(204).end();
}
