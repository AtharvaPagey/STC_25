import { asyncHandler } from "../utils/AsyncHandler.js";
import {ApiError} from "../utils/APIError.js"
import { User} from "../models/user.models.js"
import { ApiResponse } from "../utils/ApiResponse.js";

const modelfinetuner = asyncHandler(async(req, res) => {
    try{
        // if new data is to be put as input
        // then call the ml finetuner here and get the output (present in finetuning)
        // if fine tuning finishes in success then return success else return error
    }catch(error){
        throw new ApiError(500, `This Error occured: ${error}`)
    }
})