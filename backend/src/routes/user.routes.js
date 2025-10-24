import { Router } from "express";
import { body } from "express-validator";
import {
    LoginOrRegister,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateAccountDetails,
    predictdiseaseandmed
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { verifyFirebaseToken } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/login").post(verifyFirebaseToken, LoginOrRegister);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-details").patch(verifyJWT, updateAccountDetails);

router.route("/predict").post(
    verifyJWT,
    [
        body('symptoms', 'Symptoms are required').notEmpty().isString(),
        body('dailyData', 'Daily data must be an array').isArray({ min: 1 }),
        body('travelHistory').optional().isString(),
        body('occupation').optional().isString()
    ],
    predictdiseaseandmed
);


export default router;