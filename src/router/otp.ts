import prisma from "../utils/db";
import { Router, Request } from "express";
import { generateOTPCode } from "../utils";
import { sendMail } from "../utils/nodemailer";
import { BadRequestError } from "../errors/bad-request-error";
import { validateResource } from "../middleware/validateResource";
import {
  OTPType,
  SendOtpInput,
  sendOtpValidation,
} from "../validations/otp.validations";
import { verifyJWT } from "../utils/jwt";
import { NotFoundError } from "../errors/not-found-error";

const router = Router();

router.post(
  "/send",
  validateResource(sendOtpValidation),
  async (req: Request<{}, {}, SendOtpInput["body"]>, res) => {
    const { token } = req.body;
    const decoded = verifyJWT<{
      email: string;
      type: OTPType;
    }>(token, process.env.JWT_SECRET ?? "");
    if (!decoded) throw new NotFoundError();
    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });
    if (user && decoded.type === "SIGNINUP")
      throw new BadRequestError("Uer already exists");
    const otp = await prisma.otp.findFirst({
      where: {
        verified: false,
        expireAt: { gte: new Date(Date.now()) },
        email: decoded.email,
        type: decoded.type,
      },
    });
    const code = otp?.code ?? generateOTPCode();
    if (!otp) {
      await prisma.otp.create({
        data: {
          code,
          expireAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          email: decoded.email,
          type: decoded.type,
        },
      });
    }
    const data = {
      from: 'I.C.H Verify Email" <gaconght@gmail.com>',
      to: decoded.email,
      subject: "I.C.H Verify Email",
      html: `<b>code: ${code}</b>`,
    };
    const isSend = await sendMail(data);
    if (!isSend) throw new BadRequestError("Send email fail");
    return res.send({
      message: "Send email success",
    });
  }
);

export default router;
