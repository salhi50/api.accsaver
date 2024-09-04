import type { Request, Response, NextFunction } from "express";

export default function allowMethods(
  methods: string[] = [],
  sendAllowHeader = false
) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (methods.indexOf(req.method) === -1) {
      return next({
        status: 405,
        // prettier-ignore
        headers: !sendAllowHeader ? null : {
          Allow: methods.join(", ")
        }
      });
    }
    next();
  };
}
