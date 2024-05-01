const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { generateResponse } = require("../utils/response");
const User = require("../schemas/user");

/**
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction}
 */
module.exports.isAuth =
  /**
   * @param {express.Request} req
   * @param {express.Response} res
   * @param {express.NextFunction}
   */

  async (req, res, next) => {
    try {
      //find JWT in Headers
      const token = req.headers["authorization"];
      if (!token) {
        return res.status(401).json(generateResponse("Unauthorized", {}));
      } else {
        const bearerToken = token.split(" ")[1];
        const tokenDecode = jwt.verify(bearerToken, process.env.JWT_SECRET_KEY);
        const user = await User.findById(tokenDecode.user_id);

        if (!user) {
          return res.status(404).json(generateResponse("User not Found", {}));
        }
        req.user = user;

        next();
      }
    } catch (error) {
      res.status(401).json({ message: "error", error });
    }
  };
