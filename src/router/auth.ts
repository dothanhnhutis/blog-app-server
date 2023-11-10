import { Router, Request } from "express";
import {
  SigninInput,
  SignupInput,
  SignupProviderInput,
  signinProviderValidation,
  signinValidation,
  signupValidation,
} from "../validations/auth.validations";
import prisma from "../utils/db";
import { BadRequestError } from "../errors/bad-request-error";
import { comparePassword, hashPassword } from "../utils";
import { validateResource } from "../middleware/validateResource";
import { signJWT, verifyJWT } from "../utils/jwt";

const router = Router();

const EXPIRES = 15 * 24 * 60 * 60;

router.post(
  "/signin/provider",
  validateResource(signinProviderValidation),
  async (req: Request<{}, {}, SignupProviderInput["body"]>, res) => {
    const { token } = req.body;
    const decoded = verifyJWT<{
      email: string;
      username: string;
      avatarUrl: string;
    }>(token, process.env.JWT_SECRET ?? "");
    if (!decoded) throw new BadRequestError("Uer already exists");

    let user = await prisma.user.upsert({
      where: { email: decoded.email },
      update: {},
      create: {
        email: decoded.email,
        username: decoded.username,
        avatarUrl: decoded.avatarUrl,
        role: "Writer",
      },
    });

    const newtoken = signJWT({ id: user.id }, process.env.JWT_SECRET ?? "", {
      expiresIn: 15 * 24 * 60 * 60,
    });

    return res.send({
      id: user.id,
      email: user.email,
      username: user.username,
      avatarUrl: user.avatarUrl,
      role: user.role,
      isActive: user.isActive,
      token: newtoken,
    });
  }
);

router.post(
  "/signup",
  validateResource(signupValidation),
  async (req: Request<{}, {}, SignupInput["body"]>, res) => {
    const { email, password, code } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user) throw new BadRequestError("Uer already exists");
    const otp = await prisma.otp.findUnique({
      where: {
        verified: false,
        code_email: {
          code: code,
          email: email,
        },
      },
    });
    if (!otp) throw new BadRequestError("Email verification code has expired");

    const hash = hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hash,
        username: email.split("@")[0] ?? email,
      },
    });
    await prisma.otp.update({
      where: { id: otp.id },
      data: {
        verified: true,
      },
    });
    return res.send(newUser);
  }
);

router.post(
  "/signin",
  validateResource(signinValidation),
  async (req: Request<{}, {}, SigninInput["body"]>, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!user) throw new BadRequestError("invalid email or password");
    if (!user.isActive)
      throw new BadRequestError(
        "Your account has been locked please contact the administrator"
      );
    if (user.password && (await comparePassword(user.password, password))) {
      const token = signJWT({ id: user.id }, process.env.JWT_SECRET ?? "", {
        expiresIn: EXPIRES,
      });

      return res.send({
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isActive: user.isActive,
        token,
      });
    }
  }
);

export default router;
