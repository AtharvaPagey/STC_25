import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/APIError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getTreatmentsForDisease } from "../utils/dbimportexport.js";
import jwt from "jsonwebtoken";
import axios from "axios";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

const LoginOrRegister = asyncHandler(async (req, res) => {
  const { uid, email } = req.firebaseUser;

  if (!uid || !email) {
    throw new ApiError(
      400,
      "Firebase user information is missing from request"
    );
  }

  let user = await User.findOne({ firebaseUID: uid });

  if (!user) {
    const { age, username, fullName } = req.body;
    user = await User.create({
      firebaseUID: uid,
      email: email,
      username: username || email.split("@")[0],
      fullname: fullName || "",
      age: age || null,
    });
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select("-refreshToken");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged In Successfully"
      )
    );
});

const predictdiseaseandmed = asyncHandler(async (req, res) => {
  const { symptoms, travelHistory, occupation, foodData } = req.body;
  const user = req.user;

  const raw_data = {
    age: user.age,
    gender: user.gender,
    symptoms: symptoms,
    travelHistory: travelHistory,
    occupation: occupation,
    food: foodData,
  };

  let predictionResponse;
  try {
    predictionResponse = await axios.post(
      "http://localhost:5001/predict",
      raw_data
    );
  } catch (error) {
    console.error("Error connecting to the prediction service:", error.message);
    throw new ApiError(
      502,
      "The prediction service is currently unavailable or returned an error."
    );
  }

  const diseaseName = predictionResponse.data.diseaseName;

  if (!diseaseName) {
    throw new ApiError(
      404,
      "Could not determine a disease from the provided data."
    );
  }

  const output = await getTreatmentsForDisease(diseaseName);
  if (!output) {
    throw new ApiError(500, "Could not find treatments for the predicted disease.");
  }

  try {
    await PredictionHistory.create({
      predictedDisease: diseaseName,
      prescribedMeds: output.medicines || [],
      prescribedYogas: output.yogasanas || [],
    });
  } catch (dbError) {
    console.error("Failed to save prediction history to Atlas:", dbError.message);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, output, "Prediction successful"));
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user || incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id
    );
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken: accessToken, refreshToken: refreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

/**
 * @desc    Update the current user's account details (name, age, etc.)
 * @route   PATCH /api/v1/users/update-details
 * @access  Private
 */
const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, username, age, gender, occupation } = req.body;

  const updateData = {};
  if (fullName) updateData.fullName = fullName;
  if (username) updateData.username = username;
  if (age) updateData.age = age;
  if (gender) updateData.gender = gender;
  if (occupation) updateData.occupation = occupation;

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, "No fields provided to update.");
  }

  if (username) {
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
      throw new ApiError(409, "Username is already taken.");
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("-password -refreshToken");

  if (!updatedUser) {
    throw new ApiError(404, "User not found.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Account details updated successfully.")
    );
});

/**
 * @desc    Delete the current user's account and all their data
 * @route   DELETE /api/v1/users/delete-account
 * @access  Private
 */
const deleteUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    await PredictionHistory.deleteMany({ user: userId });
  } catch (dbError) {
    console.error("Failed to delete user's prediction history:", dbError);
    throw new ApiError(500, "Failed to delete associated user data.");
  }

  const deletedUser = await User.findByIdAndDelete(userId);

  if (!deletedUser) {
    throw new ApiError(404, "User not found.");
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "User account deleted successfully.")
    );
});

export {
  LoginOrRegister,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateAccountDetails,
  predictdiseaseandmed,
  deleteUser
};
