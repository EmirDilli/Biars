const {
  ClassSemester,
  Class,
  ClassPortfolio,
  Semester,
} = require("../../schemas/index");

module.exports.updateGrades = async (req, res) => {
  const { pId, sId, assessmentName, newGrades } = req.body;

  try {
    console.log(pId, sId, assessmentName, newGrades);
    let portfolio = await ClassPortfolio.findById(pId).populate(
      "studentPerformance"
    );

    const classSemester = await ClassSemester.findOne({ portfolio: pId })
      .populate("assessments")
      .select("assessments");

    for (let i = 0; i < classSemester.assessments.length; i++) {
      if (classSemester.assessments[i].name === assessmentName) {
        index = i;
        break;
      }
    }

    const studentPerformanceToUpdate = portfolio.studentPerformance.find(
      (sp) => sp.student == sId
    );

    if (studentPerformanceToUpdate) {
      studentPerformanceToUpdate.grades = newGrades;
      console.log(newGrades);
      await portfolio.save();
    }

    res.json(portfolio);
  } catch (error) {
    console.error("Failed to update grades:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
