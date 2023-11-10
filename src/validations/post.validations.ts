import { z } from "zod";

const postParams = z.object({
  id: z.string(),
});

const postBody = z.object({
  title: z
    .string({
      required_error: "title field is required",
      invalid_type_error: "title field must be string",
    })
    .min(1, "title field cann't empty"),
  thumnail: z.string({
    required_error: "thumnail field is required",
    invalid_type_error: "thumnail field must be string",
  }),
  slug: z
    .string({
      required_error: "slug field is required",
      invalid_type_error: "slug field must be string",
    })
    .min(1, "slug field cann't empty"),
  content: z
    .string({
      required_error: "content field is required",
      invalid_type_error: "content field must be string",
    })
    .min(1, "content field cann't empty"),
  tagId: z.string({
    required_error: "tagId field is required",
    invalid_type_error: "tagId field must be string",
  }),
  authorId: z.string({
    required_error: "authorId field is required",
    invalid_type_error: "authorId field must be string",
  }),
});

export const getPostValidation = z.object({
  query: z
    .object({
      title: z.string().optional(),
      tagName: z.string().optional(),
      authorName: z.string().optional(),
    })
    .optional(),
});

export const createPostValidation = z.object({
  body: postBody.strict(),
});
export const editPostValidation = z.object({
  params: postParams.strict(),
  body: postBody.partial().strict(),
});

export const deletePostValidation = z.object({
  params: postParams.strict(),
});

export const queryPostValidation = z.object({
  query: z
    .object({
      title: z.string(),
      slug: z.string(),
      tagName: z.string(),
      authorName: z.string(),
    })
    .partial()
    .strict(),
});

export type QueryPostInput = z.infer<typeof queryPostValidation>;
export type CreatePostInput = z.infer<typeof createPostValidation>;
export type EditPostInput = z.infer<typeof editPostValidation>;
export type DeletePostInput = z.infer<typeof deletePostValidation>;
