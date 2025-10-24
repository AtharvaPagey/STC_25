import { ApiError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

export const verifyAdmin = asyncHandler(async (req, _, next) => {
    if (req.user?.role !== "ADMIN") {
        throw new ApiError(403, "Forbidden: You do not have permission to perform this action.");
    }
    next();
});