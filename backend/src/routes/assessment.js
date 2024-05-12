const { Router } = require("express");
const { isAuth } = require("../utils/isAuth");
const multer = require("multer");
const upload = multer();
const {
  uploadAsssessment,
  downloadAssessmentPDF,
} = require("../controllers/assessment/uploadAssessment");

const {
  getAllAssessments,
  getAssessmentWithId,
  removeAssessment,
  viewOldAssessments,
  getQuestionHistory,
  createAssessment,
  addQuestionToAssessment,
  removeQuestionFromAssessment,
  createAssessmentWithQuestion,
  createAssessmentFromQuestions,
} = require("../controllers/assessment/assessmentController");

const { getAssignment } = require("../controllers/assessment/getAssignment");
const {
  getAllAssignments,
} = require("../controllers/assessment/getAllAssignments");

const router = Router();

router.post(
  "/:classCode/:sectionNumber/:assignment/uploadAssessment",
  isAuth,
  upload.single("file"),
  uploadAsssessment
);

// createAssessmentFromQuestions takes input from the questionDisplayPage. Takes the questions selected and creates a assessment to the database.
// Then, the _id of that assessment is given as parameter to the downloadAssessmentPDF function below to locally download and create the pdf document.
// 1. select the questions from the page
// 2. create the function via createAssessmentFromQuestions (create assessment button already does this)
// 3. give the _id of this created assessment to downloadAssessmentPDF
router.post("/createAssessmentFromQuestions", createAssessmentFromQuestions);
router.post("/downloadAssessmentPDF/:id", downloadAssessmentPDF);

router.post("/createAssessmentWithQuestion", createAssessmentFromQuestions);

router.get("/getAllAssessments", getAllAssessments); // returns all assessments

router.get("/getAssessmentWithId/:id", getAssessmentWithId); // returns the assessment with the given id

router.delete("/removeAssessment", removeAssessment); // removes the assesment given its _id

router.get("/viewOldAssessments", viewOldAssessments);

router.get("/getQuestionHistory/:questionId", getQuestionHistory); // get all the assessments that contain the given question (_id of question is given)

router.post("/createAssessment", createAssessment);
// Above function, the instructor gives how many questions for each topic will be present in the assessment and then the assessment is created.
// E.g:
/*

assessmentData = 
{  
  "name": "Midterm Exam",
  "date": "2024-06-15",
  "courseId": "MATH303",
  "type": "Exam"
}

topics = 
{
  "Algebra": 5,
  "Calculus": 3,
  "Geometry": 2
}
*/

router.post("/addQuestionToAssessment", addQuestionToAssessment); // adds the question the assessment. input body is: { assessmentId, questionId, weight, max } = req.body;

router.post("/removeQuestionFromAssessment", removeQuestionFromAssessment); // removes question from the assessment.  input body is: { assessmentId, questionId} = req.body;

router.get(
  "/:classCode/:sectionNumber/:assignment/getAssignment",
  isAuth,
  getAssignment
);
router.get(
  "/:classCode/:sectionNumber/:assignment/getAllAssignments",
  isAuth,
  getAllAssignments
);

module.exports = router;
