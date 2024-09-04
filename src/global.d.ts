declare namespace Express {
  interface Request {
    user: {
      id: ObjectId;
    };
  }
}

declare namespace NodeJS {
  interface ProcessEnv
    extends Record<
      | "MONGO_URI"
      | "RECAPTCHA_SECRET_KEY"
      | "SMTP_EMAIL"
      | "SMTP_PASSWORD"
      | "CLIENT_BASE_URL"
      | "CLIENT_EMAIL_VERIFICATION_BASE_URL"
      | "CLIENT_RESET_PASSWORD_BASE_URL"
      | "JWT_SECRET"
      | "SYM_ENC_ALGORITHM"
      | "SYM_ENC_KEY_ENCODING"
      | "SYM_ENC_KEY"
      | "SYM_ENC_KEY_SIZE_IN_BYTES",
      string
    > {}
}
