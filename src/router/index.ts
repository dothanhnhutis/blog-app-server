import { Router } from "express";
import user from "./user";
import auth from "./auth";
import otp from "./otp";
import tag from "./tag";
import post from "./post";
import role from "./role";

const router = Router();

// router.use("/users", user);
router.use("/auth", auth);
router.use("/otps", otp);
router.use("/roles", role);

// router.use("/tags", tag);
// router.use("/posts", post);
export default router;
