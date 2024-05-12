const {
  ClassSemester,
  Class,
  Section,
  Semester,
} = require("../../schemas/index");

module.exports.getClassGrades = async (req, res) => {
  const classCode = req.params.className;

  try {
    const classObj = await Class.findOne({ code: classCode }).select(
      "_id code"
    );

    if (!classObj) {
      return res.status(404).json({ error: "Class not found" });
    }

    const activeSemester = await Semester.findOne({ status: "active" }).select(
      "_id"
    );

    const activeClassSemester = await ClassSemester.findOne({
      class: classObj._id,
      semester: activeSemester,
    })
      .populate({
        path: "assessments.assessment",
        select: "type name",
        populate: {
          path: "questions",
          select: "max weight",
        },
      })
      .populate("portfolio")
      .populate("sections")
      .populate({
        path: "sections",
        populate: {
          path: "students",
          populate: {
            path: "userId",
            model: "User",
            select: "name",
          },
        },
      });

    if (!activeClassSemester) {
      return res
        .status(404)
        .json({
          message: "Active semester not found for the specified class.",
        });
    }

    function getAllAssessmentDetails(activeClassSemester) {
      if (!activeClassSemester) {
        console.log("Active class semester not found.");
        return [];
      }
      return activeClassSemester.assessments.map((assessmentEntry, i) => {
        const assessment = assessmentEntry.assessment;

        const questionDetails = {
          assessment: assessment.name,
          questionNumber: assessment.questions.length,
          questionMaxes: assessment.questions.map((q) => q.max),
          questionWeights: assessment.questions.map((q) => q.weight),
          sections: activeClassSemester.sections.map((section) => {
            return {
              name: section.sectionNumber,
              students: section.students.map((student) => {
                // Finding the student's performance for this specific assessment
                const studentPerformance =
                  activeClassSemester.portfolio.studentPerformance.find(
                    (perf) => perf.student.toString() === student._id.toString()
                  );
                const grades = studentPerformance
                  ? studentPerformance.grades[i]
                  : [];

                return {
                  id: student._id,
                  name: student.userId.name,
                  grades: grades,
                };
              }),
            };
          }),
        };

        return questionDetails;
      });
    }

    res.json({
      res: getAllAssessmentDetails(activeClassSemester),
      pId: activeClassSemester.portfolio._id,
    });
  } catch (error) {
    console.error("Failed to fetch weekly content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
