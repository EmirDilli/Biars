const Workpspace = require("../../schemas/workspace");

const { generateResponse } = require("../../utils/response");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

module.exports.createWorkspace = async (req, res) => {
  try {
    if (!req.body.workspace) {
      return res.status(400).json(generateResponse("Bad Input!"));
    }
    const workspace = new Workpspace(req.body.workspace);
    const response = await workspace.save();

    return res.status(200).json(generateResponse("Success", response));
  } catch (error) {
    return res.status(500).json(generateResponse("Server Error", error));
  }
};
