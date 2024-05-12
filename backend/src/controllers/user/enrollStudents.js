const { response } = require("express");
const { parse } = require("csv-parse/sync");
const {
  User,
  Student,
  Semester,
  ClassSemester,
  Class,
  Section,
} = require("../../schemas/index");
const { generateResponse } = require("../../utils/response");
let Chatbot = require("../chatbot/chatbotClass");
let ChatbotChats = require("../chatbot/chatbotChatClass");

async function createChatbotChats(userId, usersCourseList){
 

  let promises = usersCourseList.map(async (code) => {
    let chatbotId = await Chatbot.getChatbotId(code, 0);
    let chatbotId2 = await Chatbot.getChatbotId(code, 1);
    await ChatbotChats.createNewChatbotChat(chatbotId, userId);
    return await ChatbotChats.createNewChatbotChat(chatbotId2, userId);
  });

  promises.then(() => {
    return true;
  });

}

module.exports.enrollStudent = async (req, res) => {
  try {
    const file = req.file; // Get the uploaded file

    if (!file) {
      return res.status(400).json(generateResponse("No file uploaded"));
    }
    const activeSemester = await Semester.findOne({
      status: "active",
    }).populate({
      path: "classSemesters",
      select: "_id class",
    });

    // Parse the CSV
    const records = parse(file.buffer, {
      columns: true, // Use the first row as headers to generate objects
      skip_empty_lines: true, // Skip empty lines
      delimiter: ",", // Delimiter is a comma
      trim: true, // Trim spaces from fields
    });

    // Post-process to handle semicolon-separated lists in specific fields
    const processedRecords = records.map((record) => ({
      ...record,
      classes: record.classes.split(";").map((item) => item.trim()), // Split the 'classes' field into an array
      sections: record.sections.split(";").map((item) => parseInt(item.trim())), // Split the 'sections' field into an array of integers
    }));

    // Process each record asynchronously
    for (const record of processedRecords) {
      const userDb = await User.findOne({ id: record.id }).select("_id");

      if (!userDb) {
        console.error(`User with id ${record.id} not found`);
        continue; // Move to the next record
      }

      const studentDb = await Student.findOne({ userId: userDb._id });

      const classIds = await Class.find({ code: { $in: record.classes } });

      createChatbotChats(userDb._id, record.classes);
      
      

      const classSemesters = [];
      for (const classId of classIds) {
        for (const classSemester of activeSemester.classSemesters) {
          if (classSemester.class.toString() === classId._id.toString()) {
            classSemesters.push(classSemester._id);
          }
        }
      }

      const classSemestersDb = await ClassSemester.find({
        _id: { $in: classSemesters },
      });

      for (const [index, classSemester] of classSemestersDb.entries()) {
        const sections = await Section.find({
          _id: { $in: classSemester.sections },
        });

        for (const section of sections) {
          if (section.sectionNumber == record.sections[index]) {
            section.students.push(studentDb._id);
            await section.save();
            studentDb.classes.push(section._id);
            await studentDb.save();
          }
        }
      }
    }

    // Respond with the processed data or confirmation of successful processing
    return res.status(200).json(generateResponse("Success!", processedRecords));
  } catch (error) {
    console.error("Error parsing CSV:", error);
    return res.status(500).json(generateResponse("Server Error", { error }));
  }
};
