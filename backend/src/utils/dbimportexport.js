import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { MainDisease } from "../models/maindisease.models.js";
import { MongoClient } from "mongodb";
import fs from "fs";
import csv from "csv-parser";

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

        const previousDiseases = await User.aggregate(pipeline);

        return previousDiseases;

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

        const results = await MainDisease.aggregate(pipeline);

        return results.length > 0 ? results[0] : null;

    } catch (error) {
        console.error("Error retrieving treatments for disease:", error);
        throw new Error("Could not retrieve treatments.");
    }
}

async function uploadCsvToAtlas(filePath, collectionName) {
    const MONGO_URI = process.env.MONGO_DB_CONNECTION_STRING;
    const DB_NAME = "your_database";

    const client = new MongoClient(MONGO_URI);
    const data = [];

    try {
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .on("error", (error) => reject(error))
                .pipe(csv())
                .on("data", (row) => {
                    data.push(row);
                })
                .on("end", () => {
                    console.log(`Read ${data.length} rows from ${filePath}`);
                    resolve();
                });
        });

        if (data.length === 0) {
            console.log("CSV file is empty. Nothing to upload.");
            return true;
        }

        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(collectionName);
        console.log(`Successfully connected to database '${DB_NAME}' and collection '${collectionName}'.`);

        const result = await collection.insertMany(data);
        console.log(`Successfully uploaded ${result.insertedCount} documents to MongoDB Atlas.`);
        return true;

    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`ERROR: The file was not found at ${filePath}`);
        } else {
            console.error(`ERROR: An unexpected error occurred: ${error}`);
        }
        return false;
    } finally {
        await client.close();
        console.log("MongoDB connection closed.");
    }
}

export {
    getDetailedPreviousDiseasesForUser,
    getTreatmentsForDisease,
    uploadCsvToAtlas
}