const Assessment = require("../../schemas/assessment");
const Question = require("../../schemas/question");
const mongoose = require("mongoose");

// Helper function to generate response
function generateResponse(message, data) {
    return { message, data };
}
//
// ************************************ Helpers ********************************************************
// GET ALL ASSESSMENTS
module.exports.getAllAssessments = async (req, res) => {
    try {
        const assessments = await Assessment.find({}); // Fetch all documents in the assessments collection
        if (assessments.length === 0) {
            return res.status(404).json(generateResponse("No assessments found", {}));
        }

        res.status(200).json(generateResponse("Assessments retrieved successfully", { assessments }));
    } catch (error) {
        console.error("Error retrieving assessments:", error);
        res.status(500).json(generateResponse("Server Error", { error: error.toString() }));
    }
};

// GET ASSESSMENT WITH ID
module.exports.getAssessmentWithId = async (req, res) => {
    
    try {
        
        const assessmentId = req.params.id;  // Assuming you are passing the id as a URL parameter
        if (!assessmentId) {
            return res.status(400).json(generateResponse("No Assessment ID provided", {}));
        }

        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json(generateResponse("Assessment not found", {}));
        }

        res.status(200).json(generateResponse("Assessment retrieved successfully", { assessment }));
    } catch (error) {
        console.error("Error retrieving assessment:", error);
        res.status(500).json(generateResponse("Server Error", { error: error.toString() }));
    }

};


module.exports.createAssessmentWithQuestion = async (req, res) => {
    const { questionId, assessmentData, weight, max } = req.body;
  
    if (!questionId || !assessmentData || weight === undefined || max === undefined) {
      return res.status(400).send({ message: "Missing questionId, assessmentData, weight, or max in request body." });
    }
  
    try {
      // Validate if the questionId exists in the database
      const questionExists = await Question.exists({ _id: questionId });
      if (!questionExists) {
        return res.status(404).send({ message: "Question not found with the provided ID." });
      }
  
      // Create a new assessment with the question details in its questions array
      const newAssessment = new Assessment({
        ...assessmentData,
        questions: [{ 
          question: questionId,
          weight: weight,
          max: max 
        }] // Initialize with the provided question ID and additional details
      });
  
      // Save the new assessment to the database
      await newAssessment.save();
      console.log("Assessment created successfully:", newAssessment);
  
      // Send success response
      res.status(201).send({ message: "Assessment created successfully", assessment: newAssessment });
    } catch (error) {
      console.error("Failed to create assessment:", error);
      res.status(500).send({ message: "Failed to create assessment", error: error.message });
    }
};
// **********************************************************************************************************


//1.1
module.exports.removeAssessment = async (req, res) => {
    try {
        
        const { assessmentId } = req.params; // Assuming ID is passed as a URL parameter

        if (!assessmentId) {
            return res.status(400).json(generateResponse("Missing Assessment ID", {}));
        }

        const deletedAssessment = await Assessment.findByIdAndDelete(assessmentId);

        if (!deletedAssessment) {
            return res.status(404).json(generateResponse("Assessment Not Found", {}));
        }

        return res.status(200).json(generateResponse("Assessment Removed Successfully", { id: assessmentId }));
    } catch (error) {
        console.error("Error removing assessment:", error);
        return res.status(500).json(generateResponse("Server Error", { error: error.toString() }));
    }
};


//1.2
module.exports.viewOldAssessments = async (req, res) => {
    try {
        const { semester } = req.query; // Assuming the semester is passed as a query parameter

        if (!semester) {
            return res.status(400).json(generateResponse("Semester parameter is required", {}));
        }

        const assessments = await Assessment.find({ givenSemester: semester });

        if (assessments.length === 0) {
            return res.status(404).json(generateResponse("No assessments found for the specified semester", {}));
        }

        return res.status(200).json(generateResponse("Assessments retrieved successfully", { assessments }));
    } catch (error) {
        console.error("Error retrieving assessments:", error);
        return res.status(500).json(generateResponse("Server Error", { error: error.toString() }));
    }
};


//1.3
module.exports.exportAssessment = async (req, res) => {

    try {
        const assessmentId = req.params.assessmentId;
        // Assuming function fetchAssessment fetches the necessary details
        const assessment = await fetchAssessment(assessmentId);


        if (!assessment) {
            return res.status(404).send('Assessment not found');
        }



        const questions = await Promise.all(
            assessment.questions.map(questionUrl => 
                axios.get(questionUrl).then(response => response.data))
        );



        const doc = new PDFDocument();
        const fileName = `Assessment-${assessmentId}.pdf`;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/pdf');

        doc.pipe(res); // Pipe PDF to response

        doc.fontSize(25).text('Assessment Details', {
            underline: true
        });

        doc.fontSize(18).text(`Name: ${assessment.name}`, {
            continued: true
        }).text(` Date: ${assessment.date}`, {
            underline: false,
            align: 'right'
        });

        doc.fontSize(16).text(`Deadline: ${assessment.deadline}`);
        doc.fontSize(16).text(`Semester: ${assessment.givenSemester}`);
        // Add questions to PDF
    
        questions.forEach((question, index) => {
            doc.addPage().fontSize(14).text(`Question ${index + 1}:`);
            doc.fontSize(12).text(question);
        });
    
        doc.end();
    
    } 
    catch (error) {
        
        console.error("Failed to generate PDF:", error);
        res.status(500).send('Failed to generate PDF');

    }

};  

//1.4
module.exports.getQuestionHistory = async (req, res) => {
    const questionId = req.params.questionId;

    if (!questionId) {
        return res.status(400).json(generateResponse("Question ID is required", {}));
    }

    try {
        const history = await Assessment.aggregate([
            { $match: { questions: questionId } }, // Find assessments with the question
            { $group: {
                _id: "$givenSemester", // Group by the semester
                assessments: { $push: {
                    name: "$name",
                    date: "$date",
                    deadline: "$deadline",
                    assignedStudents: "$assignedStudents",
                    questions: "$questions",
                    answerKey: "$answerKey",
                    averageGrade: "$averageGradeOfAssessment",
                    studentGrades: "$studentGrades",
                    standardDeviation: "$standardDeviation",
                    graderTAs: "$graderTAs"
                }}
            }},
            { $sort: { _id: 1 } } // Sort groups by semester
        ]);

        if (history.length === 0) {
            return res.status(404).json(generateResponse("No assessments found with the given question", {}));
        }

        res.status(200).json(generateResponse("Assessment history retrieved successfully", { history }));
    } catch (error) {
        console.error("Error fetching question history:", error);
        return res.status(500).json(generateResponse("Server Error", { error: error.toString() }));
    }
};

//1.5
module.exports.createAssessment = async (req, res) => {
    try {
        const { assessmentData, topics } = req.body;

        // Calculate total number of questions and their weight
        const totalQuestions = Object.values(topics).reduce((acc, num) => acc + num, 0);
        const questionWeight = totalQuestions > 0 ? 100 / totalQuestions : 0;

        // Gather all questions needed for the assessment
        const questionsForAssessment = [];
        for (const [topic, numQuestions] of Object.entries(topics)) {
            const questions = await Question.aggregate([
                { $match: { topics: topic } },
                { $sample: { size: numQuestions } }
            ]);

            questionsForAssessment.push(...questions.map(q => ({
                question: q._id,
                weight: questionWeight,
                max: 10               // Default max score, adjust as needed
            })));
        }

        // Create the assessment
        const newAssessment = new Assessment({
            ...assessmentData,
            questions: questionsForAssessment
        });

        await newAssessment.save();

        res.status(201).json({
            message: "Assessment created successfully",
            assessment: newAssessment
        });
    } catch (error) {
        console.error('Failed to create assessment:', error);
        res.status(500).json({
            message: "Error creating assessment",
            error: error.message
        });
    }
};





// 1.6 TODO


module.exports.addQuestionToAssessment = async (req, res) => {
    const { assessmentId, questionId, weight, max } = req.body;

    if (!assessmentId || !questionId || weight === undefined || max === undefined) {
      return res.status(400).send({ message: 'Assessment ID, Question ID, weight, and max score are required.' });
    }

    try {
      // First, verify that the question exists
      const questionExists = await Question.exists({ _id: questionId });
      if (!questionExists) {
        return res.status(404).send({ message: "Question not found" });
      }

      // Add the question with additional details to the assessment's questions array
      const updatedAssessment = await Assessment.findByIdAndUpdate(
        assessmentId,
        { $addToSet: { questions: { question: questionId, weight: weight, max: max } } }, // Use $addToSet to avoid duplicates
        { new: true, runValidators: true }
      );

      if (!updatedAssessment) {
        return res.status(404).send({ message: "Assessment not found" });
      }

      return res.status(200).send(updatedAssessment);
    } catch (error) {
      console.error("Failed to add question to assessment:", error);
      return res.status(500).send({ message: 'Failed to add question to assessment' });
    }
  };
//1.8 TODO

//1.9 Remove Question
module.exports.removeQuestionFromAssessment = async (req, res) => {
    try {

        const { assessmentId, questionId } = req.body;

        if (!assessmentId || !questionId) {
            return res.status(400).json(generateResponse("Bad Input", {}));
        }

        // Find the assessment by ID
        const assessment = await Assessment.findById(assessmentId);
        if (!assessment) {
            return res.status(404).json(generateResponse("Assessment Not Found", {}));
        }

        // Check if the question ID is in the questions array
        const questionIndex = assessment.questions.indexOf(questionId);
        if (questionIndex === -1) {
            // If the question ID is not found, respond accordingly
            return res.status(404).json(generateResponse("Question Not Found", {}));
        }

        assessment.questions.splice(questionIndex, 1);

        await assessment.save();

        // Respond with success and the updated assessment
        return res.status(200).json(generateResponse("Question Removed Successfully", { assessment }));
    } catch (error) {
        console.error("Error removing question from assessment:", error);
        return res.status(500).json(generateResponse("Server Error", { error: error.toString() }));
    }
};


const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id) && new mongoose.Types.ObjectId(id).toString() === id;
};

module.exports.createAssessmentFromQuestions = async (req, res) => {
    const { questions, name, date, courseId, type } = req.body;
   
    console.log(questions)
    console.log(name)
    console.log(date)
    console.log(courseId)
    console.log(type)
    // Check if all required fields are provided
    if (!questions || !name || !date || !courseId || !type) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    console.log("1")
    // Validate the courseId and each questionId
    if (!isValidObjectId(courseId)) {
        console.log("Invalid courseId")
        return res.status(400).json({ message: "Invalid courseId" });
    }
    console.log("2")
    for (let question of questions) {

        if (!isValidObjectId(question.questionId)) {
            console.log("Invalid questionId in the list")
            return res.status(400).json({ message: "Invalid questionId in the list" });
        }
    }
    console.log("3")
    try {
        console.log("will create assessment data")
        const assessmentData = {
            
            name: name,
            date: new Date(date),
            course: new mongoose.Types.ObjectId(courseId),
            type: type,
            questions: questions.map(q => ({
                question: new mongoose.Types.ObjectId(q.questionId),
                weight: q.weight,
                max: q.max
            })),
            answerKey: []
            
        };
        console.log("will create assessment")
        const assessment = new Assessment(assessmentData);
        console.log(assessment)
        const savedAssessment = await assessment.save();
        console.log(assessment._id);
        return res.status(201).json(savedAssessment);
    } catch (error) {
        console.error('Failed to create assessment:', error);
        return res.status(500).json({ message: "Failed to create assessment", error: error.message });
    }
};

