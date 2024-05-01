const Dm = require("../../schemas/dm");
const Channel = require("../../schemas/channel");
const { generateResponse } = require("../../utils/response");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

module.exports.getDm = async (req, res) => {
  try {
    if (!req.params.dm_id) {
      return res.status(400).json(generateResponse("Bad Input!"));
    }
    const userId = req.user._id;
    const dm = await Dm.findById(req.params.dm_id)
      .populate({
        path: "user_id_1",
      })
      .populate({
        path: "user_id_2",
      });

    // Determine the other user's ID
    const otherUser = dm.user_id_1._id.equals(userId)
      ? dm.user_id_2
      : dm.user_id_1;
    // Return an object containing the other user's ID and messages

    return res.status(200).json(
      generateResponse("Success", {
        _id: dm._id,
        user: otherUser,
        messages: dm.messages,
      })
    );
  } catch (error) {
    return res.status(500).json(generateResponse("Server Error", error));
  }
};
