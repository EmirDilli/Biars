const { Class } = require("../../schemas/index");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
module.exports.getClasses = async (req, res) => {
  try {
    const classes = await Class.find({}, "name department code");
    res.json(
      classes.map((c) => ({
        className: c.name,
        department: c.department,
        code: c.code,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
