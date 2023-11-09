import { z } from "zod";

export const initSystemValidation = z.object({
  body: z
    .object({
      email: z
        .string({
          required_error: "email field is required",
          invalid_type_error: "email field must be string",
        })
        .email("Invalid email"),
      password: z
        .string({
          required_error: "password field is required",
          invalid_type_error: "password field must be string",
        })
        .min(8, "password field is too short")
        .max(40, "password field can not be longer than 40 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]*$/,
          "password field must include: letters, numbers and special characters"
        ),
      code: z
        .string({
          required_error: "code field is required",
          invalid_type_error: "code field must be string",
        })
        .length(6, "code field include 6 characters"),
      apiKey: z.string({
        required_error: "apiKey field is required",
        invalid_type_error: "apiKey field must be string",
      }),
    })
    .strict(),
});

export type InitSystemInput = z.infer<typeof initSystemValidation>;
