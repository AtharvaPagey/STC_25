import { Router } from "express";
import { body } from "express-validator";
import {
    LoginOrRegister,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateAccountDetails,
    predictdiseaseandmed,
    deleteUser,
} from "../controllers/user.controller.js";
import { verifyJWT, verifyFirebaseToken } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/login").post(verifyFirebaseToken, LoginOrRegister);
router.route("/refresh-token").post(refreshAccessToken);

router.use(verifyJWT);
router.route("/logout").post(logoutUser);
router.route("/current-user").get(getCurrentUser);
router.route("/update-details").patch(updateAccountDetails);
router.route("/delete-account").delete(deleteUser);

router.route("/predict").post(
    [
        body("symptoms", "Symptoms are required").notEmpty().isString(),
        body("dailyData", "Daily data must be a non-empty array")
        .isArray({ min: 1 }),
        body("dailyData.*", "Each item in dailyData must be an object")
        .isObject(),

        body("travelHistory").optional().isString(),
        body("occupation").optional().isString(),
    ],
    predictdiseaseandmed
);

export default router;