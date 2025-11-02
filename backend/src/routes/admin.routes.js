import { Router } from "express";
import {
    uploadToDisk,
    uploadToMemory,
} from "../middlewares/multer.middlewares.js";
import {
    adminLogin,
    adminLogout,
    modelfinetuner,
    getAllUsers,
    deleteUser,
    uploadCSVData,
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { verifyAdmin } from "../middlewares/auth.admin.middlewares.js";

const router = Router();

router.route("/login").post(adminLogin);

router.use(verifyJWT, verifyAdmin);

router.route("/logout").post(adminLogout);
router.route("/users").get(getAllUsers);
router.route("/users/:userId").delete(deleteUser);

router.route("/finetune-model").post(
    uploadToMemory.single("file"),
    modelfinetuner
);

router.route("/upload/:modelName").post(
    uploadToDisk.single("csvfile"),
    uploadCSVData
);

export default router;