import { z } from "zod";
import { otpTypes } from "../constants";
export const sendOtpValidation = z.object({
  body: z
    .object({
      email: z
        .string({
          required_error: "email field is required",
          invalid_type_error: "email field must be string",
        })
        .email("Invalid email"),
      type: z.enum(otpTypes),
    })
    .strict(),
});

export type SendOtpInput = z.infer<typeof sendOtpValidation>["body"];
