const { calculateStatistics } = require("../../utils/calculations");
const { ClassSemester, Class, Semester } = require("../../schemas/index");

module.exports.classStatistic = async (req, res) => {
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
      .populate("portfolio")
      .populate({
        path: "assessments.assessment",
        select: "type",
      });

    const statistics = await calculateStatistics(classSemesters);

    let earliestSemester = null;
    let latestSemester = null;

    if (classSemesters) {
      earliestSemester = classSemesters[0].name;
      latestSemester = classSemesters[0].name;

      classSemesters.forEach((sem) => {
        if (sem.name < earliestSemester) {
          earliestSemester = sem.name;
        }
        if (sem.name > latestSemester) {
          latestSemester = sem.name;
        }
      });
    }

    res.json({
      statistics,
      earliestSemester: earliestSemester
        ? earliestSemester.match(/\(([^)]+)\)/)[1]
        : null,
      latestSemester: latestSemester
        ? latestSemester.match(/\(([^)]+)\)/)[1]
        : null,
    });
  } catch (err) {
    console.error("Failed to calculate statistics:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
