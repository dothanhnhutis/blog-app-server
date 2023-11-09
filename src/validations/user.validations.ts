import { z } from "zod";
import { roles } from "../constants";

export const editUserValidation = z.object({
  params: z
    .object({
      id: z.string(),
    })
    .strict(),
  body: z
    .object({
      email: z
        .string({
          invalid_type_error: "email field must be string",
        })
        .email("Invalid email"),
      password: z
        .string({
          invalid_type_error: "password field must be string",
        })
        .min(8, "password field is too short")
        .max(40, "password field can not be longer than 40 characters")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]*$/,
          "password field must include: letters, numbers and special characters"
        ),
      role: z.enum(roles),
      isActive: z.boolean(),
      userPreference: z
        .object({
          username: z.string({
            invalid_type_error: "username field must be string",
          }),
          bio: z.string({
            invalid_type_error: "bio field must be string",
          }),
          phone: z.string({
            invalid_type_error: "phone field must be string",
          }),
          avatarUrl: z.string({
            invalid_type_error: "avatarUrl field must be string",
          }),
          address: z.string({
            invalid_type_error: "address field must be string",
          }),
        })
        .partial(),
    })
    .partial(),
});

export type EditUserInput = z.infer<typeof editUserValidation>;
