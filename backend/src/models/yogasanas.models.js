import mongoose, {Schema} from "mongoose";

const yogaSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        musclestargeted: {
            type: String,
            required: true
        },
        link: {
            type: String,
            required: true
        }
    }
)

export const yogas = mongoose.model("yogas", yogaSchema)