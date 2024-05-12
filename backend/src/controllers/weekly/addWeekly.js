const {
  User,
  Semester,
  Class,
  Section,
  ClassSemester,
} = require("../../schemas/index");
const { generateResponse } = require("../../utils/response");
const {
  PutObjectCommand,
  S3Client,
  TransitionStorageClass,
} = require("@aws-sdk/client-s3");
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

module.exports.addWeekly = async (req, res) => {
  try {
    const { className, sectionNumber } = req.params;
    if (!className || !sectionNumber) {
      return res.status(400).json(generateResponse("Bad Input"));
    }
    console.log(req.body.type);
    const activeSemester = await Semester.findOne({ status: "active" });
    if (req.body.type !== "text") {
      const files = req.files;
      if (req.body.type === "assignment") {
        for (const file of files) {
          console.log(file);
          const params = {
            Bucket: "cs319",
            Body: file.buffer,
            Key: `${activeSemester.semesterId}/${className}/Assignments/${req.body.name}/${file.originalname}`,
            ACL: "public-read",
          };

          const data = await s3Client.send(new PutObjectCommand(params));
          console.log(
            "Successfully uploaded object: " + params.Bucket + "/" + params.Key
          );
        }
      } else {
        const params = {
          Bucket: "cs319",
          Body: req.files[0].buffer,
          Key: `${activeSemester.semesterId}/${className}/Documents/${req.body.name}`,
          ACL: "public-read",
        };

        const data = await s3Client.send(new PutObjectCommand(params));
        console.log(
          "Successfully uploaded object: " + params.Bucket + "/" + params.Key
        );
      }
    }

    const classObj = await Class.findOne({ code: className }).select(
      "_id code"
    );

    if (!classObj) {
      return res.status(404).json({ error: "Class not found" });
    }
    const activeClassSemester = await ClassSemester.findOne({
      class: classObj._id,
      semester: activeSemester,
    });

    if (!activeClassSemester) {
      return res.status(404).json({
        message: "Active semester not found for the specified class.",
      });
    }

    const targetSection = await Section.findOne({
      classSemester: activeClassSemester._id,
      sectionNumber: sectionNumber,
    });

    if (
      !targetSection.weeklyContent.some(
        (entry) => entry.weekId === req.body.weekId
      )
    ) {
      targetSection.weeklyContent.push({
        weekId: req.body.weekId,
        entries: [],
      });
    }

    let content;
    //req.body.type assignment=Assignments File=Documents
    //req.body.name=assignment name file=file Name
    switch (req.body.type) {
      case "assignment":
        content = {
          type: "link",
          linkType: "assignment",
          value: `https://cs319.fra1.digitaloceanspaces.com/${activeSemester.semesterId}/${className}/Assignments/${req.body.name}`,
          description: req.body.name,
        };
        break;
      case "file":
        let ext = req.body.name.split(".");
        const extension = ext.pop(ext.length - 1);
        ext.join(".");
        content = {
          type: "link",
          linkType: extension,
          value: `https://cs319.fra1.digitaloceanspaces.com/${activeSemester.semesterId}/${className}/Documents/${req.body.name}`,
          description: ext,
        };
        break;
      case "text":
        content = { type: "text", value: req.body.text };
    }

    const index = targetSection.weeklyContent.findIndex(
      (entry) => entry.weekId == req.body.weekId
    );

    targetSection.weeklyContent[index].entries.push(content);

    await targetSection.save();

    return res.status(200).json(generateResponse("Success", {}));
  } catch (error) {
    return res.status(500).json(generateResponse("Server Error", { error }));
  }
};
