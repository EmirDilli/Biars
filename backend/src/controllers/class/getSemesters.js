const { ClassSemester, Class, Semester } = require("../../schemas/index");
module.exports.getSemester = async (req, res) => {
  const { className } = req.params;
  const classObj = await Class.findOne({ code: className });
  if (!classObj) return res.status(404).json({ error: "Class not found" });

  const activeSemester = await Semester.findOne({status: "active"}).select('_id');
  
  try {
    const semesters = await ClassSemester.find({
      class: classObj._id,
      semester: {$ne: activeSemester}
    }).populate({
      path: "semester",
      select: "semesterId",
    });

    res.json(semesters.map((s) => s.semester.semesterId).sort());
  } catch (error) {
    res.status(500).send("Server error: " + error.message);
  }
};
