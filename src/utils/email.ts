import { CredentielsValidation } from "accsaver-shared";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
});

const from = `"AccSaver" <${process.env.SMTP_EMAIL}>`;

export function isValidEmail(email: any) {
  return (
    typeof email === "string" &&
    CredentielsValidation.validateEmail(email) === ""
  );
}

export function sendEmailVerification(to: string, url: string) {
  return transporter.sendMail({
    from,
    to,
    subject: "Verify Your Email Address",
    text: `Please verify your email by clicking on the following link: ${url}`,
    html: `
        <p>Please verify your email by clicking the link below:</p>
        <a href="${url}">Verify Email</a>
    `
  });
}

export function sendResetPasswordLink(to: string, url: string) {
  return transporter.sendMail({
    from,
    to,
    subject: "Reset your password",
    text: `Click the following link to create a new password: ${url}`,
    html: `
        <p>Click the url below to create a new password:</p>
        <a href="${url}">Reset Password</a>
    `
  });
}
