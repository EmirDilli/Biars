const { Router } = require("express");
const { login } = require("../controllers/auth/login");
const { getUser } = require("../controllers/user/getUser");
const { isAuth } = require("../utils/isAuth");
const { getAllUser } = require("../controllers/user/getAllUser");

const router = Router();

router.get("/:user_id", isAuth, getUser);
router.get("/", isAuth, getAllUser);

module.exports = router;
