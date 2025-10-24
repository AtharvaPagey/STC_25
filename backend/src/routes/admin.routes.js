import { Router } from "express";
import { body } from "express-validator";
import {
    adminLogin,
    adminLogout,
    modelfinetuner,
    getAllUsers,
    deleteUser
} from "../controllers/admin.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { verifyAdmin } from "../middlewares/auth.admin.middlewares.js";

const router = Router();

router.route("/login").post(adminLogin);

router.use(verifyJWT, verifyAdmin);


router.route("/logout").post(adminLogout);

router.route("/finetune-model").post(
    [
        body('newData', 'Fine-tuning data must be a non-empty array.').isArray({ min: 1 })
    ],
    modelfinetuner
);

router.route("/users").get(getAllUsers);
router.route("/users/:userId").delete(deleteUser);


export default router;