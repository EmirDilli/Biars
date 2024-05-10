const { calculateAverages } = require("../../utils/calculations");
const { ClassSemester, Class, Semester } = require("../../schemas/index");

module.exports.calculateAverages = async (req, res) => {
  const classCode = req.params.className;
  const { start, end } = req.query;

  try {
    const classObj = await Class.findOne({ code: classCode });
    if (!classObj) {
      return res.status(404).json({ error: "Class not found" });
    }

    const activeSemester = await Semester.findOne({status: "active"}).select('_id');

    let filter = {
      class: classObj._id,
      semester: {$ne: activeSemester}
    };
    if (start && end) {
      filter.name = {
        $gte: `${classObj.name} (${start})`,
        $lte: `${classObj.name} (${end})`,
      };
    }

    const classSemesters = await ClassSemester.find(filter)
      .sort("name")
      .populate("portfolio")
      .populate({ path: "assessments.assessment", select: "weight" })
      .populate({ 
        path: "semester", 
        match: { status: "completed" } 
      });

    res.json(await calculateAverages(classSemesters));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
