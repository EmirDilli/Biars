const { Router } = require("express");
const { isAuth } = require("../utils/isAuth");
const { getWorkspaces } = require("../controllers/workpsace/getWorkspaces");
const {
  getWorkspaceInfo,
} = require("../controllers/workpsace/getWorkspaceInfo");
const { getDm } = require("../controllers/workpsace/getDm");
const { saveDmMessage } = require("../controllers/workpsace/saveDmMessage");
const { getChannel } = require("../controllers/workpsace/getChannel");
const {
  saveChannelMessage,
} = require("../controllers/workpsace/saveChannelMessage");
const { createWorkspace } = require("../controllers/workpsace/createWorkspace");

const router = Router();

router.get("/getWorkspaces", isAuth, getWorkspaces);
router.get("/:workspace_id", isAuth, getWorkspaceInfo);
router.get("/dm/:dm_id", isAuth, getDm);
router.post("/dm/saveMessage", isAuth, saveDmMessage);
router.get("/channel/:channel_id", isAuth, getChannel);
router.post("/channel/saveMessage", isAuth, saveChannelMessage);
router.post("/createWorkspace", isAuth, createWorkspace);

module.exports = router;
