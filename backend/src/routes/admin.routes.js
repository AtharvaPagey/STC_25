import { Router } from "express";
import { body } from "express-validator";
import multer from 'multer';
import { uploaddata } from "../utils/dbimportexport.js";
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
const upload = multer({ dest: 'uploads/' });

router.route("/login").post(adminLogin);
router.use(verifyJWT, verifyAdmin);
router.route("/logout").post(adminLogout);
router.route("/finetune-model").post(
    [
        body('newData', 'Fine-tuning data must be a non-empty array.').isArray({ min: 1 })
    ],
    modelfinetuner
);
router.post('/upload/:modelName', upload.single('csvfile'), async (req, res) => {
    let filePath;
    try {
        if (!req.file) {
            throw new ApiError(400, "No file was uploaded.");
        }

        filePath = req.file.path;
        const { modelName } = req.params;
        let Model;

        switch (modelName.toLowerCase()) {
            case 'yogas':
                Model = yogas;
                break;
            case 'meds':
                Model = meds;
                break;
            case 'maindisease':
                Model = MainDisease;
                break;
            case 'prevdisease':
                Model = PrevDisease;
                break;
            default:
                throw new ApiError(400, `Invalid model name: '${modelName}'. Upload failed.`);
        }

        const result = await uploaddata(filePath, Model);

        res.status(result.statusCode).json(result);

    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message,
            success: false
        });
    } finally {
        if (filePath) {
            try {
                await fs.unlink(filePath);
            } catch (cleanupError) {
                console.error("Error deleting temporary file:", cleanupError);
            }
        }
    }
});
router.route("/users").get(getAllUsers);
router.route("/users/:userId").delete(deleteUser);


export default router;