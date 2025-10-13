import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { MainDisease } from "../models/maindisease.models.js";
import { occupationlst } from "../models/occupationlists.models.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import fs from "fs";
import csv from "csv-parser";
import { ApiError } from "./APIError.js";

async function getDetailedPreviousDiseasesForUser(userId) {
    try {
        const pipeline = [
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "prevdiseases",
                    localField: "prevDisease",
                    foreignField: "_id",
                    as: "diseaseHistory"
                }
            },
            {
                $unwind: "$diseaseHistory"
            },
            {
                $lookup: {
                    from: "yogas",
                    localField: "diseaseHistory.yoga",
                    foreignField: "_id",
                    as: "populatedYogas"
                }
            },
            {
                $lookup: {
                    from: "meds",
                    localField: "diseaseHistory.meds",
                    foreignField: "_id",
                    as: "populatedMeds"
                }
            },
            {
                $project: {
                    _id: "$diseaseHistory._id",
                    name: "$diseaseHistory.name",
                    yogas: "$populatedYogas",
                    meds: "$populatedMeds"
                }
            }
        ];

        if (mongoose.connection.readyState == 1){
            const previousDiseases = await User.aggregate(pipeline);
            return previousDiseases;
        }
    } catch (error) {
        console.error("Error fetching previous diseases:", error);
        throw new Error("Could not retrieve detailed disease history for the user.");
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
                    courseOfTreatment: "$courseoftreatment",
                    description: 1,
                    medicines: "$populatedMeds",
                    yogasanas: "$populatedYogas"
                }
            }
        ];

        if(mongoose.connection.readyState == 1){
            const results = await MainDisease.aggregate(pipeline);
            return results.length > 0 ? results[0] : null;
        }
    } catch (error) {
        console.error("Error retrieving treatments for disease:", error);
        throw new Error("Could not retrieve treatments.");
    }
}

async function uploaddata(filePath, collectionName) {
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
            const result = await collection.insertMany(data);
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