const { Router } = require("express");
const { isAuth } = require("../utils/isAuth");
const multer = require("multer");
const upload = multer();
const {
  uploadAsssessment,
} = require("../controllers/assessment/uploadAssessment");

const router = Router();

router.post(
  "/uploadAssessment",
  isAuth,
  upload.array("files", 10),
  uploadAsssessment
);

module.exports = router;
