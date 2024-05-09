const Workspace = require("../../schemas/workspace");

const { generateResponse } = require("../../utils/response");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

module.exports.getPublicWorkspaces = async (req, res) => {
  try {
    const publicWorkspaces = await Workspace.find({
      isPublic: true,
      _id: { $nin: req.user.workspaces }, // Exclude workspaces belonging to the user
    });
    return res.status(200).json(generateResponse("Success", publicWorkspaces));
  } catch (error) {
    return res.status(500).json(generateResponse("Server Error", error));
  }
};
