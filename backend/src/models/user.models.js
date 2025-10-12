import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


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
        age: {
            type: String,
            trim: true, 
            index: true
        },
        prevDisease: [
            {
                type: Schema.Types.ObjectId,
                ref: "PrevDisease"
            }
        ],
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)


export const User = mongoose.model("User", userSchema)
