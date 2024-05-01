const { response } = require("express");
const Dm = require("../../schemas/dm");
const Channel = require("../../schemas/channel");
const { generateResponse } = require("../../utils/response");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
module.exports.getWorkspaceInfo = async (req, res) => {
  try {
    if (!req.params.workspace_id) {
      return res.status(400).json(generateResponse("Bad Input"));
    }
    const userId = req.user._id;
    const workspaceId = req.params.workspace_id;

    const dms = await Dm.find({ workspace: workspaceId })
      .populate({
        path: "user_id_1",
        select: "_id name",
      })
      .populate({
        path: "user_id_2",
        select: "_id name",
      });

    const filteredConversations = dms.filter((conversation) => {
      return (
        conversation.user_id_1._id.equals(userId) ||
        conversation.user_id_2._id.equals(userId)
      );
    });

    // Map each conversation to contain only the other user's ID and messages
    const mappedConversations = filteredConversations.map((conversation) => {
      // Determine the other user's ID
      const otherUserId = conversation.user_id_1._id.equals(userId)
        ? conversation.user_id_2
        : conversation.user_id_1;
      // Return an object containing the other user's ID and messages
      return {
        _id: conversation._id,
        user: otherUserId,
        messages: conversation.messages,
      };
    });

    //fetching channels
    const channels = await Channel.find({ workspace: workspaceId }).select(
      "_id name"
    );

    return res.status(200).json(
      generateResponse("Success!", {
        dms: mappedConversations,
        channels: channels,
      })
    );
  } catch (error) {
    return res.status(500).json(generateResponse("Server Error", error));
  }
};
