import type { Request, Response } from "express";
import type {
  InitPasswordResetRequestBody,
  InitPasswordResetResponseBody
} from "accsaver-shared";
import { isValidToken } from "../utils/token.js";
import { usersColl } from "../db.js";

export default async function InitPasswordResetHandler(
  req: Request<{}, InitPasswordResetResponseBody, InitPasswordResetRequestBody>,
  res: Response<InitPasswordResetResponseBody>
) {
  const { token } = req.body;
  let user;

  if (!isValidToken(token)) {
    res.json({ email: null });
    return;
  }

  user = await usersColl.findOne(
    {
      tokens: {
        $elemMatch: { name: "password_reset", value: token }
      }
    },
    {
      projection: { email: 1 }
    }
  );

  if (user === null) {
    res.json({ email: null });
    return;
  }

  res.json({ email: user.email });
}
