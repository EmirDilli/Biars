import React, { useState, useEffect } from 'react';
import './questionDisplay.css';  // Import CSS styles
import ImageModal from '../../components/ImageModal/ImageModal'; // Import the modal component

function QuestionPage() {
    const [questions, setQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [assessmentName, setAssessmentName] = useState('');
    const [assessmentDate, setAssessmentDate] = useState('');
    const [courseId, setCourseId] = useState('');
    const [assessmentType, setAssessmentType] = useState('');
    const [zoomedImageSrc, setZoomedImageSrc] = useState(null);  // For modal image zoom

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:3000/api/v1/question/getAllQuestions');
                const data = await response.json();
                setQuestions(data.data);
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
            setLoading(false);
        };

        fetchQuestions();
    }, []);

    const toggleQuestionSelection = (questionId) => {
        const isSelected = selectedQuestions.some(q => q.questionId === questionId);
        if (isSelected) {
            setSelectedQuestions(selectedQuestions.filter(q => q.questionId !== questionId));
        } else {
            setSelectedQuestions([...selectedQuestions, { questionId, weight: 10, max: 100 }]);
        }
    };

    const createAssessment = async () => {
        if (!assessmentName || !assessmentDate || !courseId || !assessmentType) {
            alert("Please fill all assessment details.");
            return;
        }
        const assessmentData = {
            name: assessmentName,
            date: assessmentDate,
            courseId,
            type: assessmentType,
            questions: selectedQuestions
        };

        try {
            const response = await fetch('http://localhost:3000/api/v1/assessment/createAssessmentFromQuestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assessmentData),
            });
            const result = await response.json();
            if (response.ok) {
                alert('Assessment created successfully!');
                console.log(result);
            } else {
                throw new Error(result.message || "Error creating assessment");
            }
        } catch (error) {
            console.error('Error creating assessment:', error);
            alert(`Error: ${error.message}`);
        }
    };

    const handleImageClick = (event, src) => {
        event.stopPropagation();  // Prevent triggering selection when clicking for zoom
        setZoomedImageSrc(src);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1>Create an Assessment</h1>
            <input type="text" placeholder="Assessment Name" value={assessmentName} onChange={e => setAssessmentName(e.target.value)} />
            <input type="date" value={assessmentDate} onChange={e => setAssessmentDate(e.target.value)} />
            <input type="text" placeholder="Course ID" value={courseId} onChange={e => setCourseId(e.target.value)} />
            <select value={assessmentType} onChange={e => setAssessmentType(e.target.value)}>
                <option value="">Select Type</option>
                <option value="exam">Exam</option>
                <option value="final">Final</option>
                <option value="quiz">Quiz</option>
                <option value="homework">Homework</option>
                <option value="project">Project</option>
            </select>
            <div className="question-container">
                {questions.map((question, index) => (
                    <div key={index} className="question-item">
                        <input
                            type="checkbox"
                            checked={selectedQuestions.some(q => q.questionId === question._id)}
                            onChange={() => toggleQuestionSelection(question._id)}
                        />
                        <img src={question.url} alt="Question" onClick={(e) => handleImageClick(e, question.url)} />
                        <p>{question.solution || "No solution provided"}</p>
                    </div>
                ))}
            </div>
            <button onClick={createAssessment}>Create Assessment</button>
            <ImageModal src={zoomedImageSrc} onClose={() => setZoomedImageSrc(null)} />
        </div>
    );
}

export default QuestionPage;
