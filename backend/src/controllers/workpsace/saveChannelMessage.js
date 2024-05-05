const Channel = require("../../schemas/channel");
const Message = require("../../schemas/message");
const { generateResponse } = require("../../utils/response");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

module.exports.saveChannelMessage = async (req, res) => {
  try {
    if (!req.body.channel_id || !req.body.message) {
      return res.status(400).json(generateResponse("Bad Input!"));
    }

    const newMessage = new Message({
      sender_id: req.body.message.sender_id,
      receiver_id: null,
      text: req.body.message.text,
      date: new Date(),
    });

    const message = await newMessage.save();

    const messageId = message._id;
    const result = await Channel.updateOne(
      { _id: req.body.channel_id },
      { $push: { messages: messageId } }
    );
    return res.status(200).json(generateResponse("Success", newMessage));
  } catch (error) {
    return res.status(500).json(generateResponse("Server Error", error));
  }
};
