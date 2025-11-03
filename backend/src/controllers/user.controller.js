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
  const { symptoms, travelHistory, occupation , foodData} = req.body;

  const raw_data = {
    age: User.age || "25",
    gender: User.gender || "Male",
    symptoms: symptoms,
    travel_history: travelHistory,
    occupation: occupation,
    food: foodData || "apple, pineapple , papaya, onion"
  };


  try {
    const predictionResponse = await axios.post(
      "http://localhost:5001/predict",
      raw_data
    );

    const diseaseName = predictionResponse;
    console.log(diseaseName)

    if (!diseaseName) {
      throw new ApiError(
        404,
        "Could not determine a disease from the provided data."
      );
    }

    const output = await getTreatmentsForDisease(diseaseName);
    if (!output) {
      throw new ApiError(
        500,
        "Could not find treatments for the predicted disease."
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, output, "Prediction successful"));
  } catch (error) {
    console.error(
      "Error in prediction:",
      error.response ? error.response.data : error.message
    );

    if (error.response) {
      throw new ApiError(502, "The prediction service returned an error.");
    } else if (error.request) {
      throw new ApiError(503, "The prediction service is unavailable.");
    } else {
      throw new ApiError(500, error.message || "An unexpected error occurred.");
    }
  }
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

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email, age, gender } = req.body;
  
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const mongoUpdateData = {};
  const firebaseUpdateData = {};

  if (fullName && fullName !== user.fullname) {
    mongoUpdateData.fullname = fullName;
    firebaseUpdateData.displayName = fullName;
  }
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      throw new ApiError(409, "This email is already taken.");
    }
    mongoUpdateData.email = email;
    firebaseUpdateData.email = email;
  }
  if (age) mongoUpdateData.age = age;
  if (gender) mongoUpdateData.gender = gender;

  if (Object.keys(mongoUpdateData).length === 0) {
    throw new ApiError(400, "No fields provided to update.");
  }

  if (Object.keys(firebaseUpdateData).length > 0) {
    try {
      await admin.auth().updateUser(user.firebaseUID, firebaseUpdateData);
    } catch (firebaseError) {
      if (firebaseError.code === "auth/email-already-exists") {
        throw new ApiError(409, "This email is already in use by another account.");
      }
      console.error("Firebase update failed:", firebaseError);
      throw new ApiError(500, "Failed to update authentication details.");
    }
  }
  Object.assign(user, mongoUpdateData);
  const updatedUser = await user.save({ validateBeforeSave: true });

  const userResponse = await User.findById(updatedUser._id).select(
    "-password -refreshToken -firebaseUID"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, userResponse, "Account details updated successfully"));
});

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
  LoginOrRegister,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateAccountDetails,
  predictdiseaseandmed,
  deleteUser
};
