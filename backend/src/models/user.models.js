import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
      username: {
          type: String,
          required: true,
          unique: true,
          lowercase: true,
          trim: true,
          index: true
      },
      email: {
          type: String,
          required: true,
          unique: true,
          lowercase: true,
          trim: true,
      },
      fullname: {
          type: String,
          required: true,
          trim: true,
          index: true
      },
      firebaseUID: {
          type: String,
          required: true,
          unique: true,
          index: true
      },

      age: {
          type: String,
      },

      gender: {
          type: String,
          required: true,
          default: 'Male'
      },

      role: {
          type: String,
          enum: ['USER', 'ADMIN'],
          default: 'USER'
      },

      prevDisease: [
          {
              type: Schema.Types.ObjectId,
              ref: "PrevDisease"
          }
      ],
      refreshToken: {
          type: String
      },
      password: {
          type: String
      }
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
