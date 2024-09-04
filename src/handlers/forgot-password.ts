import type { Request, Response } from "express";
import type {
  ForgotPasswordRequestBody,
  ForgotPasswordErrorResponseBody
} from "accsaver-shared";
import { ResponseErrorMessage } from "accsaver-shared";
import { usersColl } from "../db.js";
import verifyCaptcha from "../utils/captcha.js";
import { generateLink, generateToken } from "../utils/token.js";
import { isValidEmail, sendResetPasswordLink } from "../utils/email.js";

export default async function ForgotPasswordHandler(
  req: Request<{}, ForgotPasswordErrorResponseBody, ForgotPasswordRequestBody>,
  res: Response<ForgotPasswordErrorResponseBody>
) {
  const { email, captchaResponse } = req.body;
  let user, token, link;

  if (!(await verifyCaptcha(captchaResponse))) {
    res.json({ error: true, message: ResponseErrorMessage.CAPTCHA_ERROR });
    return;
  }

  if (!isValidEmail(email)) {
    res.json({ error: true, message: ResponseErrorMessage.INVALID_EMAIL });
    return;
  }

  user = await usersColl.findOne({ email }, { projection: { _id: 1 } });

  if (!user) {
    res.json({ error: true, message: ResponseErrorMessage.ACCOUNT_NOT_FOUND });
    return;
  }

  token = generateToken();
  link = generateLink(process.env.CLIENT_RESET_PASSWORD_BASE_URL, token);

  await sendResetPasswordLink(email, link);

  await usersColl.updateOne(
    { _id: user._id },
    {
      $pull: {
        tokens: { name: "password_reset" }
      }
    }
  );

  await usersColl.updateOne(
    { _id: user._id },
    {
      $push: {
        tokens: { name: "password_reset", value: token }
      }
    }
  );

  res.status(204).end();
}
