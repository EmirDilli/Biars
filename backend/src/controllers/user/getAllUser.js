const { response } = require("express");
const User = require("../../schemas/user");
const { generateResponse } = require("../../utils/response");

const jwt = require("jsonwebtoken");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

module.exports.getAllUser = async (req, res) => {
  try {
    const user = await User.find({ _id: { $ne: req.user._id } }).select(
      "_id name surname profileUrl"
    );

    return res.status(200).json(generateResponse("Success!", user));
  } catch (error) {
    return res.status(500).json(generateResponse("Server Error", { error }));
  }
};
