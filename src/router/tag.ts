import { Router, Request } from "express";
import prisma from "../utils/db";
import { validateResource } from "../middleware/validateResource";
import {
  CreateTagInput,
  EditTagInput,
  QueryTagInput,
  createTagValidation,
  editTagValidation,
} from "../validations/tag.validations";
import { BadRequestError } from "../errors/bad-request-error";
import { requiredAuth } from "../middleware/requiredAuth";
import { roleAccess } from "../middleware/checkRole";

const router = Router();

router.delete(
  "/:id",
  requiredAuth,
  roleAccess(["ADMIN", "POSTER"]),
  async (req: Request<EditTagInput["params"]>, res) => {
    const { id } = req.params;

    const tag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) throw new BadRequestError("slug not exist");

    const deleteTag = await prisma.tag.delete({
      where: { id },
    });

    return res.send({
      tag: deleteTag,
    });
  }
);

router.patch(
  "/:id",
  requiredAuth,
  roleAccess(["ADMIN", "POSTER"]),
  validateResource(editTagValidation),
  async (
    req: Request<EditTagInput["params"], {}, EditTagInput["body"]>,
    res
  ) => {
    const { id } = req.params;

    const tagExist = await prisma.tag.findUnique({
      where: { id },
    });
    if (!tagExist) throw new BadRequestError("tag not exist");

    const slugExist = await prisma.tag.findUnique({
      where: { slug: req.body.slug },
    });
    if (slugExist) throw new BadRequestError("slug has been used");

    const newTag = await prisma.tag.update({
      where: { id },
      data: { ...req.body },
    });

    return res.send({
      tag: newTag,
    });
  }
);

router.get("/:id", async (req: Request<QueryTagInput["params"]>, res) => {
  const tag = await prisma.tag.findUnique({
    where: { id: req.params.id },
    include: {
      _count: {
        select: {
          post: true,
        },
      },
    },
  });
  return res.send(tag);
});

router.get("/", async (req, res) => {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: {
          post: true,
        },
      },
    },
  });
  return res.send(tags);
});

router.post(
  "/",
  requiredAuth,
  roleAccess(["ADMIN", "POSTER"]),
  validateResource(createTagValidation),
  async (req: Request<{}, {}, CreateTagInput>, res) => {
    const { name, slug } = req.body;

    const tag = await prisma.tag.findUnique({
      where: { slug: slug },
    });
    if (tag) throw new BadRequestError("slug has been used");
    const newTag = await prisma.tag.create({ data: { name, slug } });

    return res.send({
      tag: newTag,
    });
  }
);

export default router;
