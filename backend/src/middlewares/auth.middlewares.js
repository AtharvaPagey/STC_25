import admin from "../firebase/admin.js"; // Your initialized admin SDK
import { ApiError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { User } from "../models/user.models.js";

export const verifyFirebaseToken = asyncHandler(async (req, _, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            throw new ApiError(401, "Unauthorized request: No token provided");
        }

        const decodedToken = await admin.auth().verifyIdToken(token);
        
        // Find the user in your MongoDB database using the Firebase UID
        const user = await User.findOne({ firebaseUID: decodedToken.uid });

        if (!user) {
            // This case can happen if a user is in Firebase but not yet in your DB.
            // Your login/register controller will handle creating them.
            // For now, we can attach the Firebase user info to the request.
            req.firebaseUser = decodedToken;
        }

        req.user = user; // Attach your MongoDB user object to the request
        next();

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});