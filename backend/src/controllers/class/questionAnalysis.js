const { topicAnalysis } = require("../../utils/calculations");
const { ClassSemester, Class, Semester } = require("../../schemas/index");

module.exports.questionAnalysis = async (req, res) => {
  const classCode = req.params.className;
  try {
    const classObj = await Class.findOne({ code: classCode });
    if (!classObj) {
      return res.status(404).json({ error: "Class not found" });
    }
    
    const activeSemester = await Semester.findOne({status: "active"}).select('_id');

    const classSemesters = await ClassSemester.find({
      class: classObj._id,
      semester: {$ne: activeSemester}
    })
      .populate("portfolio")
      .populate({
        path: "assessments.assessment",
        select: "type questions", // Now including 'questions' to fetch 'max'
        populate: {
          path: "questions.question",
          model: "Question",
          select: "topics", // assuming 'topics' is the only needed field from Question
        },
      });

    res.json(await topicAnalysis(classSemesters));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
