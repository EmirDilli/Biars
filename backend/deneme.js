// Step 1: Import the S3Client object and all necessary SDK commands.
const fs = require("fs");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const dotenv = require("dotenv");
dotenv.config();

// Step 2: The s3Client function validates your request and directs it to your Space's specified endpoint using the AWS SDK.
const s3Client = new S3Client({
  endpoint: "https://fra1.digitaloceanspaces.com", // Find your endpoint in the control panel, under Settings. Prepend "https://".
  forcePathStyle: false, // Configures to use subdomain/virtual calling format.
  region: "fra1", // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (for example, nyc3).
  credentials: {
    accessKeyId: "DO00CT92KUAAMFDT7JAF", // Access key pair. You can create access key pairs using the control panel or API.
    secretAccessKey: process.env.BUCKET_SECRET_KEY, // Secret access key defined through an environment variable.
  },
});
const fileContent = fs.readFileSync("./dilli_emir_hw6.pdf");

// Step 3: Define the parameters for the object you want to upload.
const params = {
  Bucket: "cs319", // The path to the directory you want to upload the object to, starting with your Space name.
  Key: "questions/dilli_emir_hw6.pdf", // Object key, referenced whenever you want to access this file later.
  Body: fileContent, // The object's contents. This variable is an object, not a string.
  ACL: "private", // Defines ACL permissions, such as private or public.
};

// Step 4: Define a function that uploads your object using SDK's PutObjectCommand object and catches any errors.
const uploadObject = async () => {
  try {
    const data = await s3Client.send(new PutObjectCommand(params));
    console.log(data);
    console.log(
      "Successfully uploaded object: " + params.Bucket + "/" + params.Key
    );
    return data;
  } catch (err) {
    console.log("Error", err);
  }
};

// Step 5: Call the uploadObject function.
uploadObject();
