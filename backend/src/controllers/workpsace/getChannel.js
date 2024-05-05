const Dm = require("../../schemas/dm");
const Channel = require("../../schemas/channel");
const { generateResponse } = require("../../utils/response");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

module.exports.getChannel = async (req, res) => {
  try {
    if (!req.params.channel_id) {
      return res.status(400).json(generateResponse("Bad Input!"));
    }
    const userId = req.user._id;

    const channel = await Channel.findById(req.params.channel_id)
      .populate({ path: "messages", options: { sort: { createdAt: -1 } } })
      .populate({
        path: "messages",
        populate: {
          path: "sender_id",
          select: "_id name surname profileUrl",
        },
      });
    const filteredUsers = channel.users.filter((user) =>
      user._id.equals(userId)
    );
    channel.users = filteredUsers;

    return res.status(200).json(generateResponse("Success", channel));
  } catch (error) {
    return res.status(500).json(generateResponse("Server Error", error));
  }
};
