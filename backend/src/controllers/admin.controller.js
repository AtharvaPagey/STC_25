import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/APIError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

/**
 * @description Handle admin login using email and password
 * @route POST /api/v1/admin/login
 */
const adminLogin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });
    if (!user || user.role !== 'ADMIN') {
        throw new ApiError(404, "Admin account not found or invalid credentials");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid admin credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);
    const loggedInAdmin = await User.findById(user._id).select("-password -refreshToken");

    const options = { httpOnly: true, secure: true };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { admin: loggedInAdmin, accessToken }, "Admin logged in successfully")
        );
});

/**
 * @description Handle admin logout
 * @route POST /api/v1/admin/logout
 */
const adminLogout = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    const options = { httpOnly: true, secure: true };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Admin logged out successfully"));
});

/**
 * @description Starts the ML model fine-tuning process (admin only)
 * @route POST /api/v1/admin/finetune-model
 */
const modelfinetuner = asyncHandler(async (req, res) => {
    const { newData } = req.body;

    if (!newData || !Array.isArray(newData) || newData.length === 0) {
        throw new ApiError(400, "Fine-tuning data is required and must be a non-empty array.");
    }

    try {
        const fineTuningResponse = await axios.post('http://localhost:5001/finetune', {
            dataset: newData
        });

        return res.status(202).json(
            new ApiResponse(
                202,
                fineTuningResponse.data,
                "Fine-tuning process has been successfully started."
            )
        );

    } catch (error) {
        console.error("Error communicating with the fine-tuning service:", error.message);
        throw new ApiError(500, "The fine-tuning service is currently unavailable or failed to start the job.");
    }
});

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select("-password -refreshToken");

    if (!users) {
        throw new ApiError(404, "No users found in the database");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, users, "All users fetched successfully"));
});


/**
 * @description Delete a specific user by their ID (admin only)
 * @route DELETE /api/v1/admin/users/:userId
 */
const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId?.trim()) {
        throw new ApiError(400, "User ID is required");
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
        throw new ApiError(404, "User not found or has already been deleted");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { deletedUserId: userId }, "User deleted successfully"));
});

export {
    adminLogin,
    adminLogout,
    modelfinetuner,
    getAllUsers,
    deleteUser
};