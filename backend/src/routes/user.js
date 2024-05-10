const { Router } = require("express");
const { login } = require("../controllers/auth/login");
const { getUser } = require("../controllers/user/getUser");
const { isAuth } = require("../utils/isAuth");
const { getAllUser } = require("../controllers/user/getAllUser");
const { getClasses } = require("../controllers/user/getClasses");
const { enrollStudent } = require("../controllers/user/enrollStudents");
const multer = require("multer");
const upload = multer();

const router = Router();

router.get("/:user_id", isAuth, getUser);
router.get("/", isAuth, getAllUser);
router.get("/:user_id/classes", isAuth, getClasses);
router.post("/enrollStudents", isAuth, upload.single("file"), enrollStudent);

module.exports = router;
