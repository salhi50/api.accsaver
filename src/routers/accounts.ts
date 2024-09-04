import type { Request, Response } from "express";
import type {
  GetAllAccountsResponseBody,
  GetAccountByIdResponseBody,
  NewAccountRequestBody,
  UpdateAccountRequestBody
} from "accsaver-shared";
import express from "express";
import { ObjectId } from "mongodb";
import { usersColl } from "../db.js";
import {
  decryptAccount,
  encryptAccount,
  isValidAccountData,
  isValidAccountId,
  isValidAccountName
} from "../utils/account.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

router.use(auth());

router.get("/", async (req, res: Response<GetAllAccountsResponseBody>) => {
  let user = await usersColl.findOne(
    { _id: req.user.id },
    {
      projection: {
        _id: 0,
        "accounts.id": 1,
        "accounts.name": 1
      }
    }
  );

  res.json({
    result: user!.accounts
  });
});

router.post(
  "/new",
  async (req: Request<{}, {}, NewAccountRequestBody>, res) => {
    const { name, data } = req.body;

    if (!isValidAccountName(name) || !isValidAccountData(data)) {
      res.status(400).json({});
      return;
    }

    await usersColl.updateOne(
      { _id: req.user.id },
      {
        $push: {
          accounts: encryptAccount({
            id: new ObjectId().toString(),
            name,
            data
          })
        }
      }
    );

    res.status(204).end();
  }
);

router.use("/:id", (req, res, next) => {
  const { id } = req.params;

  if (!isValidAccountId(id)) {
    res.status(404).json({});
    return;
  }

  next();
});

router.get(
  "/:id",
  async (req, res: Response<Partial<GetAccountByIdResponseBody>>) => {
    const { id } = req.params;
    let user = await usersColl.findOne(
      { _id: req.user.id, "accounts.id": id },
      { projection: { "accounts.$": 1, _id: 0 } }
    );

    if (!user) {
      res.status(404).json({});
      return;
    }

    res.json({
      result: decryptAccount(user.accounts[0])
    });
  }
);

router.post(
  "/:id/update",
  async (req: Request<{ id: string }, {}, UpdateAccountRequestBody>, res) => {
    const { name, data } = req.body;
    const { id } = req.params;
    let result;

    if (!isValidAccountName(name) || !isValidAccountData(data)) {
      res.status(400).json({});
      return;
    }

    result = await usersColl.updateOne(
      { _id: req.user.id, "accounts.id": id },
      {
        $set: {
          "accounts.$": encryptAccount({ id, name, data })
        }
      }
    );

    if (result.matchedCount !== 1) {
      res.status(404).json({});
      return;
    }

    res.status(204).end();
  }
);

router.post("/:id/delete", async (req, res) => {
  const { id } = req.params;
  let result = await usersColl.updateOne(
    { _id: req.user.id },
    {
      $pull: { accounts: { id } }
    }
  );

  if (result.matchedCount !== 1) {
    res.status(404).json({});
    return;
  }

  res.status(204).json({});
});

export default router;
