import { Router } from "express";
import { body } from "express-validator";
import { uploadToDisk, uploadToMemory } from "../middlewares/multer.middlewares.js";
import { uploaddata } from "../utils/dbimportexport.js";
import {
    adminLogin,
    adminLogout,
    modelfinetuner,
    getAllUsers,
    deleteUser,
    uploadCSVData
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { verifyAdmin } from "../middlewares/auth.admin.middlewares.js";

const router = Router();

router.route("/login").post(adminLogin);
router.use(verifyJWT, verifyAdmin);
router.route("/logout").post(adminLogout);
router.route("/finetune-model").post(
    verifyAdmin, uploadToMemory.single("file")
    [
        body('newData', 'Fine-tuning data must be a non-empty array.').notEmpty().isString()
    ],
    modelfinetuner
);
router.post('/upload/:modelName', verifyJWT, upload.single('csvfile'), uploadCSVData);
router.route("/users").get(getAllUsers);
router.route("/users/:userId").delete(deleteUser);


export default router;