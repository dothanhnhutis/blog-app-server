import { z } from "zod";
const otpTypeEnum = ["SIGNINUP", "RESETPASSWORD"] as const;
const otpTypeZod = z.enum(otpTypeEnum);
export type OTPType = z.infer<typeof otpTypeZod>;
export const sendOtpValidation = z.object({
  body: z
    .object({
      token: z.string({
        required_error: "token field is required",
        invalid_type_error: "token field must be string",
      }),
    })
    .strict(),
});

export type SendOtpInput = z.infer<typeof sendOtpValidation>;
