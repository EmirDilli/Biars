const User = require("../../schemas/user");
const { generateResponse } = require("../../utils/response");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
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

module.exports.uploadAsssessment = async (req, res) => {
  try {
    const files = req.files;

    for (const file of files) {
      const params = {
        Bucket: "cs319",
        Body: file.buffer,
        Key: `semester/ /${file.originalname}`,
        ACL: "public-read",
      };

      const data = await s3Client.send(new PutObjectCommand(params));
      console.log(
        "Successfully uploaded object: " + params.Bucket + "/" + params.Key
      );
    }

    return res.status(200).json(generateResponse("Success", {}));
  } catch (error) {
    return res.status(500).json(generateResponse("Server Error", { error }));
  }
};
