const User = require("../../schemas/user");
const { generateResponse } = require("../../utils/response");

const { comparePassword, hashPassword } = require("../../utils/hashing");
const jwt = require("jsonwebtoken");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

module.exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json(generateResponse("Bad Input", {}));
    }

    const user = await User.findOne({ email: username });
    if (!user) {
      return res.status(404).json(generateResponse("User not Found", {}));
    }

    if (!comparePassword(password, user.password)) {
      return res.status(401).json(generateResponse("Unauthorized", {}));
    }

    const token = jwt.sign(
      {
        user_id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );
    await User.findByIdAndUpdate(user._id, { bearerToken: token });
    user.bearerToken = token;
    return res.status(200).json(generateResponse("Success", { user }));
  } catch (error) {
    return res.status(500).json(generateResponse("Server Error", { error }));
  }
};
