import { Router, Request } from "express";
import { requiredAuth } from "../middleware/requiredAuth";
import { v2 as cloudinary } from "cloudinary";
import { validateResource } from "../middleware/validateResource";
import {
  uploadImageValidation,
  UploadImageInput,
  DeleteImageInput,
} from "../validations/image.validations";
import prisma from "../utils/db";
const route = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

route.get("/", requiredAuth, async (req, res) => {
  const images = await cloudinary.search
    .expression("folder:ich/*")
    .sort_by("created_at", "desc")
    .max_results(500)
    .execute();
  return res.send(images);
});

route.post(
  "/",
  requiredAuth,
  validateResource(uploadImageValidation),
  async (req: Request<{}, {}, UploadImageInput["body"]>, res) => {
    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      // transformation: [{ width: 1000, height: 752, crop: "scale" }],
      folder: "ich",
      tags: ["avatar"],
    };
    const { public_id, asset_id, width, height, secure_url, tags } =
      await cloudinary.uploader.upload_large(req.body.data, options);
    const data = await prisma.image.create({
      data: {
        id: asset_id,
        public_id,
        tags,
        width,
        height,
        url: secure_url,
        userId: res.locals.currentUser?.id!,
      },
    });
    return res.send(data);
  }
);

route.delete(
  "/",
  requiredAuth,
  async (req: Request<{}, {}, DeleteImageInput["body"]>, res) => {
    const { id } = req.body;
    await cloudinary.uploader.destroy(id);
    return res.send("oke");
  }
);

export default route;
