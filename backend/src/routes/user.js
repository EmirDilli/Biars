const { Router } = require("express");
const { login } = require("../controllers/auth/login");
const { getUser } = require("../controllers/user/getUser");
const { isAuth } = require("../utils/isAuth");

const router = Router();

router.get("/:user_id", isAuth, getUser);

module.exports = router;
