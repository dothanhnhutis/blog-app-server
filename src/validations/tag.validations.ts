import { z } from "zod";
const paramsTag = z
  .object({
    id: z.string(),
  })
  .strict();
const bodyTag = z
  .object({
    tagName: z
      .string({
        required_error: "tagName field is required",
        invalid_type_error: "tagName field must be string",
      })
      .min(1, "tagName field must be at least 1 character"),
    slug: z
      .string({
        required_error: "slug field is required",
        invalid_type_error: "slug field must be string",
      })
      .min(1, "slug field must be at least 1 character"),
  })
  .strict();
export const getTagValidation = z.object({
  params: paramsTag,
});
export const createTagValidation = z.object({
  body: bodyTag,
});
export const editTagValidation = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: bodyTag.partial(),
});
export const deleteTagValidation = getTagValidation;
export type GetTagInput = z.infer<typeof getTagValidation>;
export type CreateTagInput = z.infer<typeof createTagValidation>;
export type EditTagInput = z.infer<typeof editTagValidation>;
export type DeleteTagInput = GetTagInput;
