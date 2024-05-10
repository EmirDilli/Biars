const { Router } = require("express");
const { isAuth } = require("../utils/isAuth");
const multer = require("multer");
const upload = multer();
const { createSemester } = require("../controllers/semester/createSemester");
const { createClasses } = require("../controllers/semester/createClasses");
const router = Router();

router.post(
  "/createSemester",
  isAuth,

  createSemester
);
router.post(
  "/createClasses",
  isAuth,
  upload.fields([
    { name: "classes", maxCount: 1 },
    { name: "file2", maxCount: 1 },
    { name: "file3", maxCount: 1 },
  ]),
  createClasses
);

module.exports = router;
