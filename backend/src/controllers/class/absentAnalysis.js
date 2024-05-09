const { calculateAttendanceBracket } = require("../../utils/calculations");
const { ClassSemester, Class } = require("../../schemas/index");

module.exports.absentAnalysis = async (req, res) => {
  const classCode = req.params.className;
  try {
    const classObj = await Class.findOne({ code: classCode });
    if (!classObj) {
      return res.status(404).json({ error: "Class not found" });
    }

    const classSemesters = await ClassSemester.find({
      class: classObj._id,
      status: "completed",
    })
      .populate("portfolio")
      .populate({ path: "assessments.assessment", select: "weight" });

    res.json(await calculateAttendanceBracket(classSemesters));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
