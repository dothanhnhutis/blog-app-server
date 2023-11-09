import { z } from "zod";

const userParams = z.object({
  id: z.string(),
});

const userBody = z.object({
  email: z
    .string({
      required_error: "token field is required",
      invalid_type_error: "token field must be string",
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
  roleId: z.string({
    required_error: "roleId field is required",
    invalid_type_error: "roleId field must be string",
  }),
  isActive: z.boolean({
    required_error: "isActive field is required",
    invalid_type_error: "isActive field must be boolean",
  }),
  username: z.string({
    required_error: "username field is required",
    invalid_type_error: "username field must be string",
  }),
  bio: z.string({
    required_error: "bio field is required",
    invalid_type_error: "bio field must be string",
  }),
  phone: z.string({
    required_error: "phone field is required",
    invalid_type_error: "phone field must be string",
  }),
  avatarUrl: z.string({
    required_error: "avatarUrl field is required",
    invalid_type_error: "avatarUrl field must be string",
  }),
  address: z.string({
    required_error: "address field is required",
    invalid_type_error: "address field must be string",
  }),
});

export const editUserValidation = z.object({
  params: userParams.strict(),
  body: userBody.partial().strict(),
});

export const createUserValidation = z.object({
  body: userBody
    .partial()
    .required({
      email: true,
      password: true,
      username: true,
      roleId: true,
    })
    .strict(),
});

export const getUserValidation = z.object({
  params: userParams.strict(),
});

export const deleteUserValidation = getUserValidation;

export type EditUserInput = z.infer<typeof editUserValidation>;
export type CreateUserInput = z.infer<typeof createUserValidation>;
export type GetUserInput = z.infer<typeof getUserValidation>;
export type DeleteUserInput = z.infer<typeof deleteUserValidation>;
