import mongoose, {Schema} from "mongoose";

const medsSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        ingredients: [{
            type: String,
            required: true
        }],
        effects: [{
            type: String,
            required: true
        }]        
    }
)

export const meds = mongoose.model("meds", medsSchema)