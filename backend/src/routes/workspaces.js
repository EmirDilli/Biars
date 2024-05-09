const { Router } = require("express");
const { isAuth } = require("../utils/isAuth");
const {
  getPublicWorkspaces,
} = require("../controllers/workpsace/getPublicWorkspaces");

const router = Router();

router.get("/", isAuth, getPublicWorkspaces);

module.exports = router;
