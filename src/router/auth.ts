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

router.post(
  "/signin/provider",
  validateResource(signinProviderValidation),
  async (req: Request<{}, {}, SignupProviderInput>, res) => {
    const { token } = req.body;
    const decoded = verifyJWT<{
      email: string | null;
      username: string;
      avatarUrl: string;
    }>(token, process.env.JWT_SECRET ?? "");
    if (!decoded || !decoded.email)
      throw new BadRequestError("Uer already exists");

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
      include: {
        userPreference: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!user) {
      const { id, email, role, status, userPreference } =
        await prisma.user.create({
          data: {
            email: decoded.email,
            userPreference: {
              create: {
                username: decoded.username,
                avatarUrl: decoded.avatarUrl,
              },
            },
          },
          include: {
            userPreference: {
              select: {
                username: true,
                avatarUrl: true,
              },
            },
          },
        });
      const token = signJWT(
        {
          id,
          email,
          role,
          status,
        },
        process.env.JWT_SECRET ?? "",
        {
          expiresIn: 15 * 24 * 60 * 60,
        }
      );
      return res.send({
        id,
        email: decoded.email,
        username: userPreference?.username!,
        avatarUrl: userPreference?.avatarUrl,
        role,
        status,
        token,
      });
    }

    const newtoken = signJWT(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      process.env.JWT_SECRET ?? "",
      {
        expiresIn: 15 * 24 * 60 * 60,
      }
    );

    return res.send({
      id: user.id,
      email: decoded.email,
      username: user.userPreference?.username!,
      avatarUrl: user.userPreference?.avatarUrl,
      role: user.role,
      status: user.status,
      token: newtoken,
    });
  }
);

router.post(
  "/signup",
  validateResource(signupValidation),
  async (req: Request<{}, {}, SignupInput>, res) => {
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
    const { id, role, status, userPreference } = await prisma.user.create({
      data: {
        email: email,
        password: hash,
        userPreference: {
          create: {
            username: email.split("@")[0] ?? email,
          },
        },
      },
      include: {
        userPreference: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
    await prisma.otp.update({
      where: { id: otp.id },
      data: {
        verified: true,
      },
    });
    return res.send({
      id,
      email,
      username: userPreference?.username!,
      avatarUrl: userPreference?.avatarUrl,
      role,
      status,
    });
  }
);

router.post(
  "/signin",
  validateResource(signinValidation),
  async (req: Request<{}, {}, SigninInput>, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email: email },
      include: {
        userPreference: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
    if (
      user &&
      user.password &&
      (await comparePassword(user.password, password))
    ) {
      const token = signJWT(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        process.env.JWT_SECRET ?? "",
        {
          expiresIn: 15 * 24 * 60 * 60,
        }
      );
      if (user.status === "BLOCK")
        throw new BadRequestError(
          "Your account has been locked please contact the administrator"
        );
      return res.send({
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        username: user.userPreference?.username,
        avatarUrl: user.userPreference?.avatarUrl,
        token,
      });
    }
    throw new BadRequestError("invalid email or password");
  }
);

export default router;
