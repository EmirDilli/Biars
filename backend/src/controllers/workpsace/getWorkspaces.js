const { response } = require("express");
const Workspace = require("../../schemas/workspace");
const { generateResponse } = require("../../utils/response");

const jwt = require("jsonwebtoken");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
module.exports.getWorkspaces = async (req, res) => {
  try {
    const workpsaceIds = req.user.workspaces;
    console.log(req.user);
    const workspaces = await Workspace.find({ _id: { $in: workpsaceIds } });
    return res.status(200).json(generateResponse("Success!", workspaces));
  } catch (error) {
    return res.status(500).json(generateResponse("Server Error"));
  }
};
