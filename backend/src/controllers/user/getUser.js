const { response } = require("express");
const User = require("../../schemas/user");
const { generateResponse } = require("../../utils/response");

const jwt = require("jsonwebtoken");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

module.exports.getUser = async (req, res) => {
  try {
    if (!req.params.user_id) {
      return res.status(400).json(generateResponse("Bad Input!"));
    }
    const user = await User.findById(req.params.user_id);
    if (!user) {
      return res.status(404).json(generateResponse("User does not exist!"));
    }

    return res.status(200).json(generateResponse("Success!", user));
  } catch (error) {
    return res.status(500).json(generateResponse("Server Error", { error }));
  }
};
