const {
  Instructor,
  Student,
  TA,
  Semester,
  Class,
  ClassSemester,
  Question,
  Assessment,
  ClassPortfolio,
  Section,
} = require("./src/schemas/index");

const mongoose = require("mongoose");
mongoose
  .connect(
    "mongodb+srv://shakespeare1111:BDkNwexuNyy6OBSD@bairs.pp6jasp.mongodb.net/bairs?retryWrites=true&w=majority&appName=Bairs",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )

  .then(() => {
    console.log("Connected to MongoDB");

    // Create Instructors
    const instructors = [
      new Instructor({ name: "John Doe" }),
      new Instructor({ name: "Jane Smith" }),
      // Add more instructors as needed
    ];

    // Create TAs
    const tas = [
      new TA({ name: "Alice Johnson" }),
      new TA({ name: "Bob Williams" }),
      // Add more TAs as needed
    ];

    // Create Students
    const students = [
      new Student({ name: "Charlie Brown" }),
      new Student({ name: "David Lee" }),
      // Add more students as needed
    ];

    // Save Instructors, TAs, and Students
    Promise.all([
      ...instructors.map((instructor) => instructor.save()),
      ...tas.map((ta) => ta.save()),
      ...students.map((student) => student.save()),
    ])
      .then(() => {
        console.log("Instructors, TAs, and Students created");

        // Create Classes
        const classes = [
          new Class({
            name: "Algorithms",
            description: "Study of algorithms",
            keywords: ["algorithms", "data structures"],
            department: "Computer Science",
            code: "CS 319",
          }),
          new Class({
            name: "Calculus",
            description: "Study of calculus",
            keywords: ["calculus", "derivatives", "integrals"],
            department: "Mathematics",
            code: "MATH 201",
          }),
          // Add more classes as needed
        ];

        // Save Classes
        Promise.all(classes.map((classObj) => classObj.save()))
          .then(async (savedClasses) => {
            console.log("Classes created");

            // Create Class Semesters
            const semesters = [
              "2016F",
              "2016S",
              "2017F",
              "2017S",
              "2018F",
              "2018S",
              "2019F",
              "2019S",
              "2020F",
              "2020S",
              "2021F",
              "2021S",
              "2022F",
              "2022S",
              "2023F",
              "2023S",
              "2024F",
              "2024S",
            ];
            const semesterDocuments = semesters.map(
              (semester) =>
                new Semester({
                  semesterId: semester,
                  startDate: new Date(),
                  endDate: new Date(),
                })
            );
            await Promise.all(semesterDocuments.map((sem) => sem.save()));
            console.log("Semesters created");

            const classSemesters = [];

            for (const classObj of savedClasses) {
              for (const semester of semesterDocuments) {
                const instructorIds = instructors.map(
                  (instructor) => instructor._id
                );
                const taIds = tas.map((ta) => ta._id);

                const classStatus =
                  semester.semesterId === "2024S" ? "active" : "completed";

                const classSemester = new ClassSemester({
                  class: classObj._id,
                  name: `${classObj.name} (${semester.semesterId})`,
                  instructors: instructorIds,
                  tas: taIds,
                  status: classStatus,
                  assessment: [],
                  sections: [],
                  exams: [],
                  homeworks: [],
                  quizzes: [],
                  projects: [],
                  assessments: [],
                  semester: semester,
                });
                classSemesters.push(classSemester);
                semester.classSemesters.push(classSemester._id); // Link ClassSemester to Semester
                await semester.save(); // Save the semester with the new class semester
              }
            }

            // Save Class Semesters
            Promise.all(
              classSemesters.map((classSemester) => classSemester.save())
            )
              .then((savedClassSemesters) => {
                console.log("Class Semesters created");

                // Create Sections
                const sections = [];

                for (const classSemester of savedClassSemesters) {
                  const instructorId =
                    instructors[Math.floor(Math.random() * instructors.length)]
                      ._id;
                  const studentIds = students.map((student) => student._id);

                  const section1 = new Section({
                    classSemester: classSemester._id,
                    instructor: instructorId,
                    schedule: ["Monday 9:00 AM", "Wednesday 9:00 AM"],
                    location: "Room 101",
                    enrollment: Math.floor(Math.random() * 50) + 20,
                    students: studentIds,
                  });

                  const section2 = new Section({
                    classSemester: classSemester._id,
                    instructor: instructorId,
                    schedule: ["Tuesday 2:00 PM", "Thursday 2:00 PM"],
                    location: "Room 202",
                    enrollment: Math.floor(Math.random() * 50) + 20,
                    students: studentIds,
                  });

                  sections.push(section1, section2);
                  classSemester.sections.push(section1._id, section2._id);
                }

                // Save Sections and update Class Semesters
                Promise.all([
                  ...sections.map((section) => section.save()),
                  ...savedClassSemesters.map((classSemester) =>
                    classSemester.save()
                  ),
                ])
                  .then(() => {
                    console.log("Sections created");

                    // Create Questions
                    const questions = [
                      new Question({ topics: ["Loops", "Conditionals"] }),
                      new Question({ topics: ["Functions", "Variables"] }),
                      new Question({ topics: ["Recursion"] }),
                      new Question({ topics: ["Arrays"] }),
                    ];
                    const savedQuestions = Promise.all(
                      questions.map((q) => q.save())
                    );

                    // Create Assessments
                    const assessments = [];

                    for (const classSemester of savedClassSemesters) {
                      const examCount = Math.floor(Math.random() * 3) + 1;
                      const homeworkCount = Math.floor(Math.random() * 5) + 2;
                      const quizCount = Math.floor(Math.random() * 3) + 1;
                      const projectCount = Math.floor(Math.random() * 2) + 1;

                      const examWeights = generateWeights(examCount, 40);
                      const homeworkWeights = generateWeights(
                        homeworkCount,
                        30
                      );
                      const quizWeights = generateWeights(quizCount, 10);
                      const projectWeights = generateWeights(projectCount, 20);

                      for (let i = 0; i < examCount; i++) {
                        const eType = i == examCount - 1 ? "final" : "exam";
                        const eName =
                          eType === "final" ? "Final" : `Exam ${i + 1}`;
                        const exam = new Assessment({
                          name: eName,
                          type: eType,
                          questions: [
                            { question: questions[1], weight: 33, max: 33 },
                            { question: questions[0], weight: 33, max: 33 },
                            { question: questions[2], weight: 33, max: 33 },
                          ],
                          answerKey: [],
                        });
                        assessments.push(exam);
                        classSemester.exams.push({
                          assessment: exam._id,
                          weight: examWeights[i],
                        });
                        classSemester.assessments.push({
                          assessment: exam._id,
                          weight: examWeights[i],
                        });
                      }

                      for (let i = 0; i < homeworkCount; i++) {
                        const homework = new Assessment({
                          name: `HW ${i + 1}`,
                          type: "homework",
                          questions: [
                            { question: questions[1], weight: 33, max: 33 },
                            { question: questions[0], weight: 33, max: 33 },
                            { question: questions[2], weight: 33, max: 33 },
                          ],
                          answerKey: [],
                        });
                        assessments.push(homework);
                        classSemester.homeworks.push({
                          assessment: homework._id,
                          weight: homeworkWeights[i],
                        });
                        classSemester.assessments.push({
                          assessment: homework._id,
                          weight: homeworkWeights[i],
                        });
                      }

                      for (let i = 0; i < quizCount; i++) {
                        const quiz = new Assessment({
                          name: `Quiz ${i + 1}`,
                          type: "quiz",
                          questions: [
                            { question: questions[1], weight: 33, max: 33 },
                            { question: questions[0], weight: 33, max: 33 },
                            { question: questions[2], weight: 33, max: 33 },
                          ],
                          answerKey: [],
                        });
                        assessments.push(quiz);
                        classSemester.quizzes.push({
                          assessment: quiz._id,
                          weight: quizWeights[i],
                        });
                        classSemester.assessments.push({
                          assessment: quiz._id,
                          weight: quizWeights[i],
                        });
                      }

                      for (let i = 0; i < projectCount; i++) {
                        const project = new Assessment({
                          name: `Project`,
                          type: "project",
                          questions: [
                            { question: questions[1], weight: 100, max: 100 },
                          ],
                          answerKey: [],
                        });
                        assessments.push(project);
                        classSemester.projects.push({
                          assessment: project._id,
                          weight: projectWeights[i],
                        });
                        classSemester.assessments.push({
                          assessment: project._id,
                          weight: projectWeights[i],
                        });
                      }
                    }

                    // Save Assessments and update Class Semesters
                    Promise.all([
                      ...assessments.map((assessment) => assessment.save()),
                      ...savedClassSemesters.map((classSemester) =>
                        classSemester.save()
                      ),
                    ])
                      .then(() => {
                        console.log("Assessments created");
                        // Create Class Portfolios
                        const classPortfolios = [];

                        const createClassPortfolios = async () => {
                          for (const classSemester of savedClassSemesters) {
                            const sections = classSemester.sections;
                            const studentPerformance = [];

                            for (const sectionId of sections) {
                              const section = await Section.findById(
                                sectionId
                              ).populate("students");
                              const students = section.students;

                              for (const student of students) {
                                const absents = Math.floor(Math.random() * 10);
                                const letterGrade = getRandomLetterGrade();

                                const examGrades = generateAssessmentGrades(
                                  classSemester.exams,
                                  3
                                ); // Assume 10 questions per exam
                                const quizGrades = generateAssessmentGrades(
                                  classSemester.quizzes,
                                  3
                                ); // Assume 5 questions per quiz
                                const homeworkGrades = generateAssessmentGrades(
                                  classSemester.homeworks,
                                  3
                                ); // Assume 3 questions per homework
                                const projectGrades = generateAssessmentGrades(
                                  classSemester.projects,
                                  1
                                ); // Assume 1 deliverable per
                                const grades = [
                                  ...examGrades,
                                  ...homeworkGrades,
                                  ...quizGrades,
                                  ...projectGrades,
                                ];
                                const totalGrade = Math.floor(
                                  Math.random() * 100
                                );

                                studentPerformance.push({
                                  student: student._id,
                                  absents,
                                  examGrades,
                                  quizGrades,
                                  homeworkGrades,
                                  projectGrades,
                                  grades,
                                  totalGrade,
                                  letterGrade,
                                });
                              }
                            }
                            const classPortfolio = new ClassPortfolio({
                              classSemester: classSemester._id,
                              studentPerformance,
                            });
                            await classPortfolio.save();

                            classSemester.portfolio = classPortfolio._id;
                            await classSemester.save();
                          }
                        };

                        function generateAssessmentGrades(
                          assessments,
                          numQuestions
                        ) {
                          return assessments.map(() => ({
                            total: Math.floor(Math.random() * 100),
                            questionsGrades: Array.from(
                              { length: numQuestions },
                              () =>
                                Math.floor((Math.random() * 100) / numQuestions)
                            ),
                          }));
                        }

                        createClassPortfolios()
                          .then(() => {
                            // Save Class Portfolios
                            Promise.all(
                              classPortfolios.map((portfolio) =>
                                portfolio.save()
                              )
                            )
                              .then(() => {
                                console.log("Class Portfolios created");
                              })
                              .catch((err) =>
                                console.error(
                                  "Error saving Class Portfolios:",
                                  err
                                )
                              );
                          })
                          .catch((err) =>
                            console.error(
                              "Error creating Class Portfolios:",
                              err
                            )
                          );
                      })
                      .catch((err) =>
                        console.error(
                          "Error saving Assessments or updating Class Semesters:",
                          err
                        )
                      );
                  })
                  .catch((err) =>
                    console.error(
                      "Error saving Sections or updating Class Semesters:",
                      err
                    )
                  );
              })
              .catch((err) =>
                console.error("Error saving Class Semesters:", err)
              );
          })
          .catch((err) => console.error("Error saving Classes:", err));
      })
      .catch((err) =>
        console.error("Error saving Instructors, TAs, or Students:", err)
      );
  })
  .catch((err) => console.error("Error connecting to MongoDB:", err));
function generateWeights(count, sum) {
  const weights = [];
  let remaining = sum;

  for (let i = 0; i < count - 1; i++) {
    const weight = Math.floor(Math.random() * remaining);
    weights.push(weight);
    remaining -= weight;
  }

  weights.push(remaining);
  return weights;
}

// Helper function to get a random letter grade
function getRandomLetterGrade() {
  const grades = ["A", "B", "C", "D", "F"];
  return grades[Math.floor(Math.random() * grades.length)];
}
