const { mean, std } = require("mathjs");

async function calculateAverages(classSemesters) {
  let averages = {};

  for (const semester of classSemesters) {
    const weights = semester.assessments.map((a) => a.weight);
    const portfolio = semester.portfolio;

    let weightedSum = 0;
    let weightTotal = 0;

    portfolio.studentPerformance.forEach((performance) => {
      performance.grades.forEach((grade, index) => {
        weightedSum += grade.total * weights[index];
        weightTotal += weights[index];
      });
    });

    averages[semester.name] =
      weightTotal > 0 ? (weightedSum / weightTotal).toFixed(2) : 0;
  }

  const response = {};
  for (const key in averages) {
    if (averages.hasOwnProperty(key)) {
      const yearSemester = key.match(/\d{4}[FS]/)[0];
      response[yearSemester] = averages[key];
    }
  }

  return response;
}

async function calculateAttendanceBracket(classSemesters) {
  const absentRanges = [0, 4, 8, 12, 16, 20];
  let categoryGrade = Array(absentRanges.length + 1).fill(0);
  let categoryCount = Array(absentRanges.length + 1).fill(0);

  for (const semester of classSemesters) {
    const portfolio = semester.portfolio;
    const weights = semester.assessments.map((a) => a.weight);

    portfolio.studentPerformance.forEach((performance) => {
      const index = absentRanges.findIndex(
        (range) => performance.absents < range
      );
      const categoryIndex = index === -1 ? absentRanges.length : index;

      performance.grades.forEach((grade, idx) => {
        categoryGrade[categoryIndex] += grade.total * weights[idx];
        categoryCount[categoryIndex] += weights[idx];
      });
    });
  }

  const averages = categoryGrade.map((sum, index) =>
    categoryCount[index] > 0 ? (sum / categoryCount[index]).toFixed(2) : "N/A"
  );

  return {
    ranges: absentRanges,
    avgGrades: averages,
  };
}

async function calculateStatistics(classSemesters) {
  let examScores = [];
  let finalScores = [];
  let combinedHomeworkQuizProjectScores = [];
  let absentCounts = [];

  for (const semester of classSemesters) {
    const portfolio = semester.portfolio;

    portfolio.studentPerformance.forEach((performance) => {
      absentCounts.push(performance.absents);

      performance.grades.forEach((grade, index) => {
        if (semester.assessments[index].assessment.type === "exam")
          examScores.push(grade.total);
        else if (semester.assessments[index].assessment.type === "final") {
          examScores.push(grade.total);
          finalScores.push(grade.total);
        } else combinedHomeworkQuizProjectScores.push(grade.total);
      });
    });
  }

  const statistics = {
    meanExamScore: examScores.length != 0 ? mean(examScores) : null,
    stdDevExamScore: examScores.length != 0 ? std(examScores) : null,
    meanFinalScore: finalScores.length != 0 ? mean(finalScores) : null,
    stdDevFinalScore: finalScores.length != 0 ? std(finalScores) : null,
    meanHomeworkQuizProjectScore:
      combinedHomeworkQuizProjectScores.length != 0
        ? mean(combinedHomeworkQuizProjectScores)
        : null,
    meanAbsentCount: absentCounts.length != 0 ? mean(absentCounts) : null,
  };

  return statistics;
}

async function topicAnalysis(classSemesters) {
  let topicSuccess = {};

  for (const semester of classSemesters) {
    let assessments = [];

    semester.assessments.forEach((assessmentEntry) => {
      const assessment = assessmentEntry["assessment"];
      if (!assessment || !assessment.questions) return;

      let questions = assessment.questions.map((questionEntry) => ({
        topics: questionEntry.question.topics,
        maxScore: questionEntry.max,
      }));

      assessments.push({
        type:
          assessment.type === "final" ? "exam" : assessment.type.toLowerCase(),
        questions: questions,
      });
    });

    // Initialize topicSuccess structure if not already
    assessments.forEach((assessment) => {
      assessment.questions.forEach((question) => {
        question.topics.forEach((topic) => {
          if (!topicSuccess[topic]) {
            topicSuccess[topic] = {
              exam: [],
              homework: [],
              quiz: [],
              project: [],
              total: [],
            };
          }
        });
      });
    });

    const portfolio = semester.portfolio;

    portfolio.studentPerformance.forEach((performance) => {
      const grades = performance.grades;

      assessments.forEach((assessment, aIdx) => {
        assessment.questions.forEach((question, qIdx) => {
          if (
            grades.length <= aIdx ||
            grades[aIdx].questionsGrades.length <= qIdx
          )
            return;
          question.topics.forEach((topic) => {
            const successRate =
              grades[aIdx].questionsGrades[qIdx] / question.maxScore;
            topicSuccess[topic][assessment.type].push(successRate);
            topicSuccess[topic].total.push(successRate);
          });
        });
      });
    });
  }

  // Calculate mean success rates for each topic and assessment type
  let result = {};
  for (let topic in topicSuccess) {
    result[topic] = {};
    for (let type in topicSuccess[topic]) {
      result[topic][type] =
        topicSuccess[topic][type].length > 0
          ? mean(topicSuccess[topic][type])
          : -1;
    }
  }

  return result;
}

module.exports = {
  calculateAverages,
  calculateAttendanceBracket,
  calculateStatistics,
  topicAnalysis,
};
