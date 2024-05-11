const Question = require("../../schemas/question"); // Make sure to provide the correct path to your Question model

module.exports.getAllQuestionsOfClass = async (req, res) => {
    try {
        const classId = req.params.classId;  // The class ID is expected as a URL parameter
        const questions = await Question.find({ class: classId });

        res.status(200).json({
            success: true,
            count: questions.length,
            data: questions
        });
    } catch (error) {
        console.error('Failed to retrieve questions:', error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve questions due to an error.",
            error: error.message
        });
    }
};

module.exports.getAllQuestions = async (req, res) => {
    try {
        const questions = await Question.find({});
        res.status(200).json({
            success: true,
            count: questions.length,
            data: questions
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve questions',
            error: error.message
        });
    }
};
