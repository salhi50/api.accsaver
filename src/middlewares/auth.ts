import type { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";
import * as JWT from "../utils/jwt.js";
import { usersColl } from "../db.js";

export default function auth() {
  return async function (req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;
    let parts: string[];
    let jwtPayload: ReturnType<typeof JWT.verify>;
    let user;

    if (typeof authorization !== "string") {
      res.status(401).json({});
      return;
    }

    parts = authorization.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res.status(401).json({});
      return;
    }

    jwtPayload = JWT.verify(parts[1]);

    if (!jwtPayload) {
      res.status(401).json({});
      return;
    }

    req.user = {
      id: new ObjectId(jwtPayload.uid)
    };

    user = await usersColl.findOne(
      { _id: req.user.id },
      { projection: { _id: 1 } }
    );

    if (!user) {
      res.status(401).json({});
      return;
    }

    next();
  };
}
