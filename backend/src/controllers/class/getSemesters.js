const { ClassSemester, Class } = require("../../schemas/index");
module.exports.getSemester = async (req, res) => {
  const { className } = req.params;
  const classObj = await Class.findOne({ code: className });
  if (!classObj) return res.status(404).json({ error: "Class not found" });
  try {
    // Assuming a relation where ClassSemester includes a reference to Class
    const semesters = await ClassSemester.find({
      class: classObj._id,
      status: "completed",
    }).populate({
      path: "semester",
      select: "semesterId",
    });

    res.json(semesters.map((s) => s.semester.semesterId).sort());
  } catch (error) {
    res.status(500).send("Server error: " + error.message);
  }
};
