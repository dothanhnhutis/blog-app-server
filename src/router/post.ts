import { Router, Request } from "express";
import {
  CreatePostInput,
  QueryPostInput,
  createPostValidation,
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
  roleAccess(["ADMIN", "POSTER"]),
  validateResource(createPostValidation),
  (req, res) => {}
);

router.patch(
  "/:id",
  requiredAuth,
  roleAccess(["ADMIN", "POSTER"]),
  validateResource(createPostValidation),
  (req, res) => {}
);

router.post(
  "/",
  requiredAuth,
  roleAccess(["ADMIN", "POSTER"]),
  validateResource(createPostValidation),
  async (req: Request<{}, {}, CreatePostInput>, res) => {
    const { slug, tagId, authorId } = req.body;

    const slugExist = await prisma.post.findUnique({ where: { slug } });
    if (slugExist) throw new BadRequestError("slug has been used");

    const tagExist = await prisma.tag.findUnique({ where: { id: tagId } });
    if (!tagExist) throw new BadRequestError("tagId invalid");

    if (
      res.locals.currentUser?.role === "POSTER" &&
      res.locals.currentUser?.id !== authorId
    )
      throw new BadRequestError("authorId invalid");

    const newPost = await prisma.post.create({ data: { ...req.body } });

    return res.send({
      message: "create post success",
      post: newPost,
    });
  }
);

router.get(
  "/*",
  async (req: Request<{}, {}, {}, QueryPostInput["query"]>, res) => {
    console.log(req.query);
    // const { authorName, title, tagName } = req.query;
    return res.send({
      message: "get post success",
      posts: req.query,
    });
  }
);
export default router;
