const Dm = require("../../schemas/dm");
const Message = require("../../schemas/message");
const { generateResponse } = require("../../utils/response");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

module.exports.saveDmMessage = async (req, res) => {
  try {
    if (!req.body.dm_id || !req.body.message) {
      return res.status(400).json(generateResponse("Bad Input!"));
    }

    const newMessage = new Message({
      sender_id: req.body.message.sender_id,
      receiver_id: req.body.message.receiver_id,
      text: req.body.message.text,
      date: req.body.message.date,
    });
    const message = await newMessage.save();

    const messageId = message._id;

    const result = await Dm.updateOne(
      { _id: req.body.dm_id },
      { $push: { messages: messageId } }
    );
    return res.status(200).json(generateResponse("Success", message));
  } catch (error) {
    return res.status(500).json(generateResponse("Server Error", error));
  }
};
