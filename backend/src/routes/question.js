const { Router } = require("express");
const { isAuth } = require("../utils/isAuth");
const multer = require("multer");
const upload = multer();

const {
  uploadQuestion,
} = require("../controllers/question/questionDigitalOcean");
const {getAllQuestions, getAllQuestionsOfClass} = require("../controllers/question/questionController");

const router = Router();

router.post(
  "/uploadQuestion",
  isAuth,
  upload.single("file"),
  uploadQuestion
);

router.get("/getAllQuestions", getAllQuestions);
router.get("/getAllQuestionsOfClass", getAllQuestionsOfClass);

module.exports = router;
