const { Class, Student, Semester, Instructor } = require("../../schemas/index");
const { generateResponse } = require("../../utils/response");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
module.exports.getClasses = async (req, res) => {
  try {
    let data = { classes: {} };
    if (req.user.type == 3) {
      const student = await Student.findOne({ userId: req.user._id }).populate({
        path: "classes",
        populate: {
          path: "classSemester",
          populate: {
            path: "class",
          },
        }, // Populate classSemester field
      });
      data = student;
    }
    if (req.user.type == 1) {
      const student = await Instructor.findOne({
        userId: req.user._id,
      }).populate({
        path: "classes",
        populate: {
          path: "classSemester",
          populate: {
            path: "class",
          },
        }, // Populate classSemester field
      });
      data = student;
      console.log(student);
    }

    res.status(200).json(generateResponse("Success", data.classes));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
