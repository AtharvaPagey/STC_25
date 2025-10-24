import admin from '../config/firebase.config.js';
import { ApiError } from '../utils/APIError.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { User } from '../models/user.models.js';
import jwt from 'jsonwebtoken';

export const verifyFirebaseToken = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
        throw new ApiError(401, "No Firebase token provided. Unauthorized access.");
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.firebaseUser = decodedToken;
        next();
    } catch (error) {
        if (error.code === 'auth/id-token-expired') {
            throw new ApiError(401, "Firebase token has expired. Please log in again.");
        }
        throw new ApiError(401, "Invalid Firebase token provided.");
    }
});

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers.authorization?.split("Bearer ")[1];

        if (!token) {
            throw new ApiError(401, "Unauthorized access. No token provided.");
        }

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET 
        );

        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(401, "Invalid access token. User not found.");
        }

        req.user = user;
        next();
        
    } catch (error) {
        let errorMessage = "Invalid access token.";
        if (error.name === "TokenExpiredError") {
            errorMessage = "Access token has expired. Please refresh your token.";
        }
        
        throw new ApiError(401, error.message || errorMessage);
    }
});