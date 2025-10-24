import mongoose, {Schema} from "mongoose";

const occupationLstSchema = new Schema(
    {
        allowlst: [{
            type: String
        }],
        denylst: [{
            type: String
        }]
    }
)

export const occupationlst = mongoose.model("occupationlst", occupationLstSchema)