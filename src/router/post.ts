import { Router, Request } from "express";
import {
  CreatePostInput,
  DeletePostInput,
  EditPostInput,
  QueryPostInput,
  createPostValidation,
  deletePostValidation,
  editPostValidation,
} from "../validations/post.validations";
import { requiredAuth } from "../middleware/requiredAuth";
import { roleAccess } from "../middleware/checkRole";
import { validateResource } from "../middleware/validateResource";
import prisma from "../utils/db";
import { BadRequestError } from "../errors/bad-request-error";

const router = Router();

router.delete(
  "/:id",
  requiredAuth,
  roleAccess(["Admin", "Manager", "Writer"]),
  validateResource(deletePostValidation),
  async (req: Request<DeletePostInput["params"]>, res) => {
    const { id } = req.params;
    const post = await prisma.post.delete({ where: { id } });
    return res.send(post);
  }
);

router.patch(
  "/:id",
  requiredAuth,
  roleAccess(["Admin", "Manager", "Writer"]),
  validateResource(editPostValidation),
  async (
    req: Request<EditPostInput["params"], {}, EditPostInput["body"]>,
    res
  ) => {
    const { id } = req.params;
    const { slug, tagId, authorId } = req.body;

    const existPost = await prisma.post.findUnique({ where: { id } });
    if (existPost) throw new BadRequestError("post has been used");

    const slugExist = await prisma.post.findUnique({ where: { slug } });
    if (slugExist) throw new BadRequestError("slug has been used");

    const tagExist = await prisma.tag.findUnique({ where: { id: tagId } });
    if (!tagExist) throw new BadRequestError("tagId invalid");

    const authorExist = await prisma.user.findUnique({
      where: { id: authorId },
    });
    if (!authorExist) throw new BadRequestError("authorId invalid");

    const updatePost = await prisma.post.update({
      where: { id },
      data: req.body,
    });

    return res.send(updatePost);
  }
);

router.post(
  "/",
  requiredAuth,
  roleAccess(["Admin", "Manager", "Writer"]),
  validateResource(createPostValidation),
  async (req: Request<{}, {}, CreatePostInput["body"]>, res) => {
    const { slug, tagId, authorId } = req.body;

    const slugExist = await prisma.post.findUnique({ where: { slug } });
    if (slugExist) throw new BadRequestError("slug has been used");

    const tagExist = await prisma.tag.findUnique({ where: { id: tagId } });
    if (!tagExist) throw new BadRequestError("tagId invalid");

    const authorExist = await prisma.user.findUnique({
      where: { id: authorId },
    });
    if (!authorExist) throw new BadRequestError("authorId invalid");

    const newPost = await prisma.post.create({ data: req.body });

    return res.send(newPost);
  }
);

router.get(
  "/*",
  async (req: Request<{}, {}, {}, QueryPostInput["query"]>, res) => {
    const { authorName, title, tagName, slug } = req.query;

    return res.send({
      query: req.query,
    });
  }
);
export default router;
