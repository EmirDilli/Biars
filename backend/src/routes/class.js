const { Router } = require("express");

const { calculateAverages } = require("../controllers/class/classAverages");
const { isAuth } = require("../utils/isAuth");
const { absentAnalysis } = require("../controllers/class/absentAnalysis");
const { classStatistic } = require("../controllers/class/classStatistic");
const { questionAnalysis } = require("../controllers/class/questionAnalysis");
const { report } = require("../controllers/class/report");
const { getSemester } = require("../controllers/class/getSemesters");
const { activeSemesters } = require("../controllers/class/activeSemesters");


const router = Router();
router.get("/:className/averages", isAuth, calculateAverages);
router.get("/:className/absent_analysis", isAuth, absentAnalysis);
router.get("/:className/statistics", isAuth, classStatistic);
router.get("/:className/question_analysis", isAuth, questionAnalysis);
router.get("/:className/report", isAuth, report);
router.get("/:className/semesters", isAuth, getSemester);
router.get("/:className/activeSemesters", isAuth, activeSemesters);
module.exports = router;
