import type { Request, Response, NextFunction } from "express";
import { isNumber, isObject, isPlainObject } from "../utils/validation.js";

export default function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500;
  let response = {};
  if (res.headersSent) return next(err);
  if (isObject(err)) {
    if (isPlainObject(err.headers)) res.set(err.headers);
    if (isPlainObject(err.response)) response = err.response;
    if (isNumber(err.status)) statusCode = err.status;
    else if (isNumber(err.statusCode)) statusCode = err.statusCode;
    if (statusCode < 400 || statusCode > 599) statusCode = 500;
  }
  res.status(statusCode).json(response);
}
