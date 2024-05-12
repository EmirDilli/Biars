const { response } = require("express");
const { Semester } = require("../../schemas/index");
const { generateResponse } = require("../../utils/response");
const { ListObjectsV2Command, S3Client } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
dotenv.config();

const s3Client = new S3Client({
  endpoint: "https://fra1.digitaloceanspaces.com", // Find your endpoint in the control panel, under Settings. Prepend "https://".
  forcePathStyle: false, // Configures to use subdomain/virtual calling format.
  region: "fra1", // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (for example, nyc3).
  credentials: {
    accessKeyId: "DO00CT92KUAAMFDT7JAF", // Access key pair. You can create access key pairs using the control panel or API.
    secretAccessKey: process.env.BUCKET_SECRET_KEY, // Secret access key defined through an environment variable.
  },
});

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

module.exports.getAllAssignments = async (req, res) => {
  const activeSemester = await Semester.findOne({ status: "active" });

  const { classCode, sectionNumber, assignment } = req.params;
  const params = {
    Bucket: "cs319",
    Prefix:
      `${activeSemester.semesterId}/${classCode}/Assignments/${assignment}` +
      "/Submissions/", // Include the folder name as a prefix
  };

  try {
    const data = await s3Client.send(new ListObjectsV2Command(params));
    let result = [];
    for (let i = 0; i < data.Contents.length; i++) {
      result.push(data.Contents[i].Key);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).send("Error fetching files");
  }
};
