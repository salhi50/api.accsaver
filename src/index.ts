import "dotenv/config";
import express from "express";

import cors from "cors";
import helmet from "helmet";
import nocache from "nocache";
import allowMethods from "./middlewares/allowMethods.js";
import errorHandler from "./middlewares/errorHandler.js";

import SignupHandler from "./handlers/signup.js";
import VerifyEmailHandler from "./handlers/verifyEmail.js";
import ForgotPasswordHandler from "./handlers/forgot-password.js";
import InitPasswordResetHandler from "./handlers/init-password-reset.js";
import ResetPasswordHandler from "./handlers/reset-password.js";
import LoginHandler from "./handlers/login.js";

import AccountsRouter from "./routers/accounts.js";

const app = express();
const PORT = process.env.PORT || 5500;

app.disable("x-powered-by");
app.disable("etag");
app.set("query parser", "simple");

app.use(nocache());

app.use(
  helmet.xContentTypeOptions(),
  helmet.xFrameOptions({ action: "deny" }),
  helmet.strictTransportSecurity({
    maxAge: 31536000,
    includeSubDomains: false,
    preload: false
  })
);

app.use(
  cors({
    origin: process.env.CLIENT_BASE_URL,
    methods: [],
    credentials: false
  })
);

app.use(allowMethods(["GET", "HEAD", "POST"]));

app.use((req, res, next) => {
  if (req.accepts("json") !== "json") {
    return next({ status: 406 });
  }
  if (req.method === "POST" && req.is("json") !== "json") {
    return next({ status: 415 });
  }
  next();
});

app.use(express.json({ limit: "10kb" }));

app.post("/signup", SignupHandler);
app.post("/verify-email", VerifyEmailHandler);
app.post("/forgot-password", ForgotPasswordHandler);
app.post("/init-password-reset", InitPasswordResetHandler);
app.post("/reset-password", ResetPasswordHandler);
app.post("/login", LoginHandler);
app.use("/accounts", AccountsRouter);

app.all("*", (req, res, next) => {
  next({ status: 404 });
});

app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});

export default app;
