import mongoose, {Schema} from "mongoose";


const maindiseaseSchema = new Schema(
    {
        name:{
            type: String,
            required: true,
        },
        courseoftreatment:{
            type: String,
            required: true
        },
        description:{
            type: String,
        },
        meds:[
            {
                type: Schema.Types.ObjectId,
                ref: "meds"
            }
        ],
        yogas:[
            {
                type: Schema.Types.ObjectId,
                ref: "yogas"
            }
        ]
    }
)

export const MainDisease = mongoose.model("MainDisease", maindiseaseSchema)
