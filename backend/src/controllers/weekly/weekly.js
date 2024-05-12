const {
  ClassSemester,
  Class,
  Section,
  Semester,
} = require("../../schemas/index");

module.exports.weekly = async (req, res) => {
  const classCode = req.params.className;
  const sectionNumber = req.params.sectionNumber;

  try {
    const classObj = await Class.findOne({ code: classCode }).select(
      "_id, code"
    );

    if (!classObj) {
      return res.status(404).json({ error: "Class not found" });
    }

    const activeSemester = await Semester.findOne({ status: "active" }).select(
      "_id weeks"
    );

    const activeClassSemester = await ClassSemester.findOne({
      class: classObj._id,
      semester: activeSemester,
    }).populate({
      path: "sections",
      match: { sectionNumber: sectionNumber },
      select: "weeklyContent sectionNumber",
    });

    if (!activeClassSemester) {
      return res.status(404).json({
        message: "Active semester not found for the specified class.",
      });
    }

    res.json({
      weeks: activeSemester.weeks,
      content: activeClassSemester.sections[0].weeklyContent,
    });
  } catch (error) {
    console.error("Failed to fetch weekly content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
