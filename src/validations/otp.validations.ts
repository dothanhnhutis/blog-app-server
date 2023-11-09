import { z } from "zod";
const otpTypeEnum = ["SIGNINUP", "RESETPASSWORD"] as const;
export const sendOtpValidation = z.object({
  body: z
    .object({
      email: z
        .string({
          required_error: "email field is required",
          invalid_type_error: "email field must be string",
        })
        .email("Invalid email"),
      type: z.enum(otpTypeEnum),
    })
    .strict(),
});

export type SendOtpInput = z.infer<typeof sendOtpValidation>;
