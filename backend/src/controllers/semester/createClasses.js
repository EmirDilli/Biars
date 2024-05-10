const { response } = require("express");
const {
  Section,
  ClassSemester,
  Semester,
  Class,
  User,
  Instructor,
  TA,
} = require("../../schemas/index");
const { generateResponse } = require("../../utils/response");
const { Readable } = require("stream");
const csv = require("csv-parser");

module.exports.createClasses = async (req, res) => {
  try {
    const activeSemester = await Semester.findOne({ status: "active" });

    if (!activeSemester) {
      return res.status(404).json(generateResponse("No active semester found"));
    }

    const classesFile = req.files["classes"][0];
    const csvData = await parseCSVData(classesFile.buffer, activeSemester);
    await activeSemester.save(); // Save semester changes after all class semesters have been processed.
    return res.status(200).json(generateResponse("Success!", csvData));
  } catch (error) {
    return res.status(500).json(generateResponse("Server Error", { error }));
  }
};

async function parseCSVData(buffer, activeSemester) {
  const classSemesters = {};

  const processRow = async (row) => {
    let classCode = row["ClassCode"];
    if (!classSemesters[classCode]) {
      const classObj = await Class.findOne({ code: classCode });
      if (!classObj) return;

      classSemesters[classCode] = new ClassSemester({
        class: classObj._id,
        semester: activeSemester._id,
        name: `${classObj.name} (${activeSemester.semesterId})`,
      });

      await classSemesters[classCode].save();
      activeSemester.classSemesters.push(classSemesters[classCode]._id);
    }

    const instructor = row["Instructors"];
    const tas = row["TAs"] ? row["TAs"].split(";").map((ta) => ta.trim()) : [];

    const userId = await User.findOne({ name: instructor }).select("_id");

    const instructorDb = await Instructor.findOne({ userId: userId });

    if (!classSemesters[classCode].instructors.includes(instructorDb._id)) {
      classSemesters[classCode].instructors.push(instructorDb._id);
    }

    tas.forEach(async (ta) => {
      const userId = await User.findOne({ name: ta }).select("_id");
      const taDb = await TA.findOne({ userId: userId });
      if (!classSemesters[classCode].tas.includes(taDb._id)) {
        classSemesters[classCode].tas.push(taDb._id);
      }
    });
    await classSemesters[classCode].save();
    let schedule = Array.from({ length: 5 }, () => Array(8).fill(0));
    for (let day = 1; day <= 5; day++) {
      for (let hour = 1; hour <= 8; hour++) {
        let keyType = `C${day}${hour}`;
        let type = row[keyType] ? row[keyType] : null;
        schedule[day - 1][hour - 1] = type;
      }
    }
    const section = new Section({
      location: row["SectionNumber"],
      instructor: instructorDb._id,
      maxEnrollment: parseInt(row["MaxEnrollment"]),
      classSemester: classSemesters[classCode]._id,
      schedule: schedule,
      sectionNumber: classSemesters[classCode].sections.length + 1 + "",
    });

    const sectionDb = await section.save();
    classSemesters[classCode].sections.push(sectionDb._id);
    await classSemesters[classCode].save();
  };

  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer);
    const parser = csv();

    stream
      .pipe(parser)
      .on("data", (row) => results.push(row))
      .on("end", async () => {
        for (let row of results) {
          await processRow(row);
        }
        resolve(classSemesters); // Only resolve after all rows have been processed
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}
