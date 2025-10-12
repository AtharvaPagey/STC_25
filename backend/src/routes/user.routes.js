import { Router } from "express";
import { handleFirebaseLoginOrRegister, logoutUser} from "../controllers/user.controller.js";
import { verifyFirebaseToken } from "../middlewares/auth.middleware.js";

const router = Router();

// This will be your main login/registration route.
// The frontend will call this endpoint AFTER the user has signed in with the magic link.
router.route("/login-register").post(verifyFirebaseToken, handleFirebaseLoginOrRegister);

// All other protected routes will now use the verifyFirebaseToken middleware
router.route("/logout").post(verifyFirebaseToken, logoutUser);
router.route("/current-user").get(verifyFirebaseToken, getCurrentUser);
// ... and so on for your other protected routes

export default router;