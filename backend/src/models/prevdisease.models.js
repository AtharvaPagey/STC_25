import mongoose, {Schema} from "mongoose";

const prevDiseaseSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        yoga: [{
            type: Schema.Types.ObjectId,
            ref: "yogas"
        }],
        meds: [{
            type: Schema.Types.ObjectId,
            ref: "meds"
        }]
    }
)

export const PrevDisease = mongoose.model("PrevDisease", prevDiseaseSchema)