const { Router } = require("express");
const { isAuth } = require("../utils/isAuth");
const { getWorkspaces } = require("../controllers/workpsace/getWorkspaces");
const {
  getWorkspaceInfo,
} = require("../controllers/workpsace/getWorkspaceInfo");
const { getDm } = require("../controllers/workpsace/getDm");

const router = Router();

router.get("/getWorkspaces", isAuth, getWorkspaces);
router.get("/:workspace_id", isAuth, getWorkspaceInfo);
router.get("/dm/:dm_id", isAuth, getDm);

module.exports = router;
