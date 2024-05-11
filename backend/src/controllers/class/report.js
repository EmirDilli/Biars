const {
  topicAnalysis,
  calculateAverages,
  calculateAttendanceBracket,
  calculateStatistics,
} = require("../../utils/calculations");
const { ClassSemester, Class, Semester } = require("../../schemas/index");

module.exports.report = async (req, res) => {
  const { className } = req.params;
  const { start, end, stats } = req.query;

  try {
    const classObj = await Class.findOne({ code: className });
    if (!classObj) return res.status(404).json({ error: "Class not found" });

    const activeSemester = await Semester.findOne({status: "active"}).select('_id');

    const classSemesters = await ClassSemester.find({
      class: classObj._id,
      semester: {$ne: activeSemester},
      name: {
        $gte: `${classObj.name} (${start})`,
        $lte: `${classObj.name} (${end})`,
      },
    })
      .sort("name")
      .populate("portfolio")
      .populate({
        path: "assessments.assessment",
        select: "type questions weight", // Now including 'questions' to fetch 'max'
        populate: {
          path: "questions.question",
          model: "Question",
          select: "topics", // assuming 'topics' is the only needed field from Question
        },
      });

    const response = {};

    // Parallel execution of independent statistical calculations
    const statsPromises = [];
    if (stats.includes("averages")) {
      statsPromises.push(
        calculateAverages(classSemesters).then(
          (result) => (response.averages = result)
        )
      );
    }
    if (stats.includes("topicAnalysis")) {
      statsPromises.push(
        topicAnalysis(classSemesters).then(
          (result) => (response.questionAnalysis = result)
        )
      );
    }
    if (stats.includes("attendanceAnalysis")) {
      statsPromises.push(
        calculateAttendanceBracket(classSemesters).then(
          (result) => (response.attendance = result)
        )
      );
    }
    if (stats.includes("statistics")) {
      statsPromises.push(
        calculateStatistics(classSemesters).then(
          (result) => (response.statistics = result)
        )
      );
    }

    // Await all statistics to complete
    await Promise.all(statsPromises);

    res.json(response);
  } catch (err) {
    console.error("Failed to generate report:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
