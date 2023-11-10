import { Router, Request } from "express";
import prisma from "../utils/db";
import { validateResource } from "../middleware/validateResource";
import {
  CreateTagInput,
  EditTagInput,
  GetTagInput,
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
  roleAccess(["Admin", "Manager", "Writer"]),
  async (req: Request<EditTagInput["params"]>, res) => {
    const { id } = req.params;
    const tag = await prisma.tag.findUnique({
      where: { id },
    });
    if (!tag) throw new BadRequestError("slug not exist");
    const deleteTag = await prisma.tag.delete({
      where: { id },
    });
    return res.send(deleteTag);
  }
);

router.patch(
  "/:id",
  requiredAuth,
  roleAccess(["Admin", "Manager", "Writer"]),
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

    return res.send(newTag);
  }
);

router.get("/:id", async (req: Request<GetTagInput["params"]>, res) => {
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
  roleAccess(["Admin", "Manager", "Writer"]),
  validateResource(createTagValidation),
  async (req: Request<{}, {}, CreateTagInput["body"]>, res) => {
    const { tagName, slug } = req.body;

    const tag = await prisma.tag.findUnique({
      where: { slug: slug },
    });
    if (tag) throw new BadRequestError("slug has been used");
    const newTag = await prisma.tag.create({ data: { tagName, slug } });

    return res.send(newTag);
  }
);

export default router;
