const User = require("../../schemas/user");
const { generateResponse } = require("../../utils/response");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const Question = require("../../schemas/question");
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

module.exports.uploadQuestion = async (req, res) => {
  try {
    const file = req.file; // The file uploaded by the user
    const { solution, classId, topics, course } = req.body; // Extended to include classId and topics as an array

    if (!file) {
      return res.status(400).send({ message: "No file uploaded." });
    }

    const fileKey = `questions/${Date.now()}-${file.originalname}`;
    const params = {
      Bucket: "cs319",
      Body: file.buffer,
      Key: fileKey,
      ACL: "public-read",
    };

    await s3Client.send(new PutObjectCommand(params));
    const fileUrl = `https://${params.Bucket}.fra1.digitaloceanspaces.com/${fileKey}`;

  
    const newQuestion = new Question({
      url: fileUrl,
      solution,
      class: classId, // fetch this using the class name e.g cs319 -> objectid of cs319 instance
      topics: Array.isArray(topics) ? topics : [], 
      course
    });

    const savedQuestion = await newQuestion.save();

    res.status(201).json(savedQuestion);
  } catch (error) {
    console.error("Failed to upload question:", error);
    res.status(500).json({ message: error.message });
  }
};


module.exports.removeQuestion = async (req, res) => {
  try {
    const { filename } = req.params;

    // Sanitize or validate the filename if necessary
    if (!filename || typeof filename !== 'string' || filename.length === 0) {
      return res.status(400).json({ message: "Invalid filename provided." });
    }

    const fileKey = `questions/${filename}`;
    const bucketName = "cs319";
    const fileUrl = `https://${bucketName}.fra1.digitaloceanspaces.com/${fileKey}`;

    // First, delete the file from DigitalOcean Spaces
    const deleteParams = { Bucket: bucketName, Key: fileKey };
    await s3Client.send(new DeleteObjectCommand(deleteParams));
    console.log(`Successfully deleted object: ${bucketName}/${fileKey}`);

    // Then, delete the corresponding entry from the MongoDB database
    const deletionResult = await Question.deleteOne({ url: fileUrl });
    if (deletionResult.deletedCount === 0) {
      return res.status(404).json({ message: "No matching question found in the database." });
    }

    res.status(200).json({
      message: "Successfully deleted both the file and database entry.",
      details: deletionResult
    });
  } catch (error) {
    console.error("Error in deleting question:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};