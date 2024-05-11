const { Router } = require("express");
const { isAuth } = require("../utils/isAuth");
const multer = require("multer");
const upload = multer();
const {
  uploadAsssessment, downloadAssessmentPDF
} = require("../controllers/assessment/uploadAssessment");
const {getAllAssessments, getAssessmentWithId, 
  removeAssessment, viewOldAssessments, 
  exportAssessment, getQuestionHistory, 
  createAssessment, addQuestionToAssessment, 
  removeQuestionFromAssessment, createAssessmentWithQuestion, createAssessmentFromQuestions} = require("../controllers/assessment/assessmentController");

const router = Router();

router.post(
  "/uploadAssessment",
  isAuth,
  upload.single("file"),
  uploadAsssessment
);

router.post("/createAssessmentFromQuestions", createAssessmentFromQuestions);

router.post("/downloadAssessmentPDF/:id", downloadAssessmentPDF);

router.post("/createAssessmentWithQuestion", createAssessmentWithQuestion);

router.get("/getAllAssessments", getAllAssessments);

router.get('/getAssessmentWithId/:id', getAssessmentWithId);

router.delete("/removeAssessment", removeAssessment);

router.get("/viewOldAssessments", viewOldAssessments);

router.get("/download-assessment/:assessmentId", exportAssessment);

router.get("/getQuestionHistory/:questionId", getQuestionHistory);

router.post("/createAssessment", createAssessment);

router.post("/addQuestionToAssessment", addQuestionToAssessment);

router.post("/removeQuestionFromAssessment", removeQuestionFromAssessment);









module.exports = router;
