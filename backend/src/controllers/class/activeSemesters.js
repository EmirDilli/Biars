const { ClassSemester, Class, Section, Semester } = require("../../schemas/index");

module.exports.activeSemesters = async (req, res) => {
  const classCode = req.params.className;
  
  try {
    const classObj = await Class.findOne({ code: classCode });

    if (!classObj) {
      return res.status(404).json({ error: "Class not found" });
    }
 
    const activeSemester = await Semester.findOne( {status: "active"} ).select('_id');

    const activeClassSemester = await ClassSemester.findOne({
      class: classObj._id,
      semester: activeSemester,
    }).populate({
      path: 'sections',
      populate: {
        path: 'students',
        model: 'Student'
      }
    });

    if (!activeClassSemester) {
      return res.status(404).json({ message: 'Active semester not found for the specified class.' });
    }

    // Transform sections to include detailed student info
    const sections = activeClassSemester.sections.map(section => ({
      id: section._id,
      name: 'za',
      students: section.students.map(student => ({
        id: student._id,
        name: student.name, // Assuming `name` is a field in your Student model
      }))
    }));

    res.json({
      semesterId: activeClassSemester._id,
      sections: sections
    });
  } catch (error) {
    console.error('Failed to fetch active semester:', error);
    res.status(500).json({ error: 'Internal server error' });
      }
};