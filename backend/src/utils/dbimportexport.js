import {mongoose} from "mongoose";
import { User } from "../models/user.models.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import fs from "fs";
import csv from "csv-parser";
import { ApiError } from "./APIError.js";
import { MainDisease } from '../models/maindisease.models.js';

async function getDetailedPreviousDiseasesForUser(userId) {
    try {
        if (mongoose.connection.readyState !== 1) {
            throw new ApiError(503, "Database not connected.");
        }

        const user = await User.findById(userId)
            .populate({
                path: 'prevDisease',
                model: 'PrevDisease',
                populate: [
                    {
                        path: 'meds',
                        model: 'meds'
                    },
                    {
                        path: 'yogas',
                        model: 'yogas'
                    }
                ]
            });

        if (!user) {
            throw new ApiError(404, "User not found.");
        }

        return user.prevDisease;

    } catch (error) {
        console.error("Error retrieving detailed previous diseases:", error);
        throw new ApiError(500, "Could not retrieve user's disease history.");
    }
}

async function getTreatmentsForDisease(diseaseName) {
    try {
        const pipeline = [
            {
                $match: {
                    name: { $regex: `^${diseaseName}$`, $options: 'i' }
                }
            },
            {
                $lookup: {
                    from: "yogas",
                    localField: "yogas",
                    foreignField: "_id",
                    as: "populatedYogas"
                }
            },
            {
                $lookup: {
                    from: "meds",
                    localField: "meds",
                    foreignField: "_id",
                    as: "populatedMeds"
                }
            },
            {
                $project: {
                    _id: 0,
                    name: 1,
                    medicines: {
                        $map: {
                            input: "$populatedMeds",
                            as: "med",
                            in: {
                                name: "$$med.name",
                                effects: "$$med.effects",
                                ingredients: "$$med.ingredients"
                            }
                        }
                    },
                    yogasanas: {
                        $map: {
                            input: "$populatedYogas",
                            as: "yoga",
                            in: {
                                name: "$$yoga.name",
                                "muscles targeted": "$$yoga.musclestargeted",
                                "youtube link": "$$yoga.link"
                            }
                        }
                    }
                }
            }
        ];

        if (mongoose.connection.readyState !== 1) {
            throw new Error("Database not connected.");
        }
        
        const results = await MainDisease.aggregate(pipeline);
        return results.length > 0 ? results[0] : null;

    } catch (error) {
        console.error("Error retrieving treatments for disease:", error);
        throw new Error("Could not retrieve treatments.");
    }
}

async function uploaddata(filePath, Model) {
    const data = [];
    try {
        await new Promise((res, rec) => {
            fs.createReadStream(filePath)
                .on("error", (error) => rec(error))
                .pipe(csv())
                .on("data", (row) => {
                    data.push(row);
                })
                .on("end", () => {
                    console.log(`Read ${data.length} rows from ${filePath}`);
                    res();
                });
        });

        if (data.length === 0) {
            console.log("CSV file is empty. Nothing to upload.");
            return true;
        }

        if(mongoose.connection.readyState == 1){
            const result = await Model.insertMany(data);
        }
        return new ApiResponse(200, `Successfully uploaded ${result.insertedCount} documents to MongoDB Atlas.`);
    } catch (error) {
        throw new ApiError(`An unexpected error occurred: ${error}`);
    }
}

export {
    getDetailedPreviousDiseasesForUser,
    getTreatmentsForDisease,
    uploaddata
}