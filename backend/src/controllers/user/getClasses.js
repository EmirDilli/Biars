const { Class, Student } = require("../../schemas/index");
const { generateResponse } = require("../../utils/response");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
module.exports.getClasses = async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id }).populate({
      path: "classes",
      populate: {
        path: "classSemester",
        populate: {
          path: "class",
        },
      }, // Populate classSemester field
    });

    res.status(200).json(generateResponse("Success", student.classes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
