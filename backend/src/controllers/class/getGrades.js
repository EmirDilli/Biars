const { populate } = require("../../schemas/answer");
const {
  ClassSemester,
  Class,
  Semester,
  ClassPortfolio,
  Assessment,
  Student,
} = require("../../schemas/index");
module.exports.getGrades = async (req, res) => {
  const { className } = req.params;

  try {
    const classGrades = await Semester.findOne({ status: "active" }).populate({
      path: "classSemesters",
      populate: "class",
    });

    let wantedClass;
    for (let i = 0; i < classGrades.classSemesters.length; i++) {
      if (classGrades.classSemesters[i].class.code === className) {
        wantedClass = classGrades.classSemesters[i];
      }
    }
    const assessments = await ClassSemester.findById(wantedClass._id)
      .populate({ path: "assessments.assessment" })
      .select("assessments");

    let studentPerformance = await ClassSemester.findById(wantedClass._id)
      .populate({ path: "portfolio" })
      .select("portfolio");

    studentPerformance = studentPerformance.portfolio.studentPerformance;
    console.log(studentPerformance);
    const student = await Student.findOne({ userId: req.user._id });
    let length = studentPerformance.length;
    let performance;
    for (let i = 0; i < length; i++) {
      if (studentPerformance[i].student.toString() === student._id.toString()) {
        performance = studentPerformance[i];
      }
    }
    res.json({ grades: performance.grades, assessments });
  } catch (error) {
    res.status(500).send("Server error: " + error.message);
  }
};
