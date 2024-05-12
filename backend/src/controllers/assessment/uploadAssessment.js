const User = require("../../schemas/user");
const Assessment = require("../../schemas/assessment");

const { Semester } = require("../../schemas/index");

const { generateResponse } = require("../../utils/response");
const {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} = require("@aws-sdk/client-s3");
const PDFDocument = require("pdfkit");
const path = require("path");
const axios = require("axios");
const fs = require("fs");
const { Buffer } = require("buffer");
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
    const file = req.file;

    const activeSemester = await Semester.findOne({ status: "active" });
    const { classCode, sectionNumber, assignment } = req.params;
    console.log(file);
    let params = {
      Bucket: "cs319",
      Body: file.buffer,
      Key: `${
        activeSemester.semesterId
      }/${classCode}/Assignments/${assignment}/Submissions/${
        req.user.id +
        "-" +
        req.user.name +
        "-" +
        classCode +
        "-" +
        sectionNumber +
        "-" +
        assignment +
        "." +
        file.originalname.split(".")[file.originalname.split(".").length - 1]
      }`,
      ACL: "public-read",
    };

    console.log(file.originalname);
    params = {
      Bucket: "cs319",
      Body: file.buffer, // The path to the directory you want to upload the object to, starting with your Space name.
      Key: `assessments/${file.originalname}`, // Object key, referenced whenever you want to access this file later.
      ACL: "public-read", // Defines ACL permissions, such as private or public.
    };
    let data = await s3Client.send(new PutObjectCommand(params));
    console.log(data);
    console.log(
      "Successfully uploaded object: " + params.Bucket + "/" + params.Key
    );
    return res.status(200).json(generateResponse("Success", {}));
  } catch (error) {
    return res.status(500).json(generateResponse("Server Error", { error }));
  }
};

module.exports.downloadAssessmentPDF = async (req, res) => {
  const assessmentId = req.params.id;

  const assessment = await Assessment.findById(assessmentId)
    .populate({
      path: "questions.question",
      model: "Question",
    })
    .exec();

  if (!assessment) {
    return res.status(404).send("Assessment not found");
  }

  const outputDir = path.join(__dirname, "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true }); // Ensure the directory exists
  }

  const pdfPath = path.join(outputDir, `Assessment-${assessmentId}.pdf`);
  const doc = new PDFDocument();
  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  for (let { question } of assessment.questions) {
    if (!question.url) continue; // Skip if no URL is found

    const url = new URL(question.url);
    const bucket = url.host.split(".")[0];
    const key = url.pathname.substring(1);

    try {
      const objectData = await s3Client.send(
        new GetObjectCommand({ Bucket: bucket, Key: key })
      );
      let chunks = [];
      for await (const chunk of objectData.Body) {
        chunks.push(chunk);
      }
      const imageBuffer = Buffer.concat(chunks);

      doc.image(imageBuffer, {
        fit: [500, 400],
        align: "center",
        valign: "center",
      });
      doc.addPage();
    } catch (error) {
      console.error(
        "Failed to download or process image from:",
        question.url,
        error
      );
      continue; // Skip to the next question if there's an error
    }
  }

  doc.end();

  stream.on("finish", () => {
    res.download(pdfPath, (err) => {
      if (err) {
        console.error("Download failed:", err);
        // fs.unlinkSync(pdfPath); // Commented out to check file persistence
        return;
      }
      console.log(`PDF has been downloaded: ${pdfPath}`);
      // fs.unlinkSync(pdfPath); // Optionally keep the file for verification
    });
  });

  stream.on("error", (error) => {
    console.error("Error in stream writing:", error);
  });
};
