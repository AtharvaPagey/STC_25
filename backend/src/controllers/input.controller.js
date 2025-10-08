import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { MainDisease } from "../models/maindisease.models.js";


async function runAggregationPipeline(collection, pipeline) {
  try {
    const resultsArray = await collection.aggregate(pipeline).toArray();
    const resultsJson = JSON.stringify(resultsArray, null, 2);
    return resultsJson;
  } catch (error) {
    console.error(`An error occurred: ${error}`);
    return null;
  }
}

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



export{
    getDetailedPreviousDiseasesForUser,
    getTreatmentsForDisease, 
    runAggregationPipeline
}