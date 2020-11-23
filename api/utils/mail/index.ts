import nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/sendmail-transport";
import { requireEnv } from "require-env-variable";

const { OFFICE365_USERNAME, OFFICE365_PASSWORD } = requireEnv(
  "OFFICE365_USERNAME",
  "OFFICE365_PASSWORD"
);

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  auth: {
    user: OFFICE365_USERNAME,
    pass: OFFICE365_PASSWORD,
  },
});

const mailOptions = {
  from: OFFICE365_USERNAME,
  subject: "",
  html: "",
};

export const sendMail = async (opts: MailOptions) => {
  return await transporter.sendMail({
    ...mailOptions,
    ...opts,
  });
};

export { UnlockMail } from "./mail";
