import React, { useState, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./grading.css";

function AssessmentSelector({ assessments, onSelection }) {
  return (
    <div>
      <h3>Select an Assessment:</h3>
      <select onChange={(e) => onSelection(e.target.value)}>
        {assessments.map((assessment) => (
          <option key={assessment.assessment} value={assessment.assessment}>
            {assessment.assessment}
          </option>
        ))}
      </select>
    </div>
  );
}

function SectionSelector({ sections, onSelect }) {
  return (
    <div>
      <h3>Select a Section:</h3>
      <select onChange={(e) => onSelect(e.target.value)}>
        <option value="">All Sections</option>
        {sections.map((section) => (
          <option key={section.name} value={section.name}>
            {section.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function StudentList({ students, onSelectStudent }) {
  return (
    <div>
      <ul>
        {students.map((student) => (
          <li key={student.id} onClick={() => onSelectStudent(student)}>
            {student.name} - Grade:{" "}
            {student.grades?.questionsGrades?.length > 0
              ? student.grades.total
              : "Ungraded"}
          </li>
        ))}
      </ul>
    </div>
  );
}

function GradeEditor({
  student,
  questionNumber,
  questionMaxes,
  questionWeights,
  onSave,
  onClose,
}) {
  const initialGrades =
    student.grades.questionsGrades && student.grades.questionsGrades.length > 0
      ? student.grades.questionsGrades.map(String)
      : Array(questionNumber).fill("");

  const [grades, setGrades] = useState(initialGrades);

  const calculateTotal = (grades) =>
    grades.reduce(
      (acc, grade, index) =>
        acc +
        (grade
          ? (parseFloat(grade) / questionMaxes[index]) * questionWeights[index]
          : 0),
      0
    );

  const [totalGrade, setTotalGrade] = useState(calculateTotal(grades));

  useEffect(() => {
    setTotalGrade(calculateTotal(grades));
  }, [grades]);

  const handleGradeChange = (index, value) => {
    const newGrades = [...grades];
    newGrades[index] = value;
    setGrades(newGrades);
  };

  const handleSave = () => {
    const numericGrades = grades.map((grade) =>
      grade === "" ? 0 : Number(grade)
    );
    onSave(student.id, { questionsGrades: numericGrades, total: totalGrade });
    onClose();
  };

  // Check if any field is empty to conditionally disable the Save button
  const isSaveDisabled = grades.some((grade) => grade === "");

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2 className="modal-header">Grading: {student.name}</h2>
        {grades.map((grade, index) => (
          <div key={index} className="input-group">
            <label>
              Question {index + 1}:
              <div className="tooltip">
                Info
                <span className="tooltiptext">
                  Max: {questionMaxes[index]}, Weight: {questionWeights[index]}
                </span>
              </div>
              <input
                type="number"
                value={grade}
                onChange={(e) => handleGradeChange(index, e.target.value)}
                placeholder="Enter grade"
              />
            </label>
          </div>
        ))}
        <div className="input-group">
          <label>
            Total Grade:
            <input
              type="number"
              value={totalGrade.toFixed(2)}
              readOnly // Make this field read-only if manual entry shouldn't be allowed
            />
          </label>
        </div>
        <button onClick={handleSave} disabled={isSaveDisabled}>
          Save
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

function GradingPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedAssessmentData, setSelectedAssessmentData] = useState({
    sections: [],
  });
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pId, setpId] = useState("");
  const [filterUngraded, setFilterUngraded] = useState(false);
  const { className } = useParams();
  const [serverData, setServerData] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const endpoint = `http://localhost:3000/api/v1/class/${className}/classGrades`;
    axios
      .get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setpId(response.data.pId);
        setServerData(response.data.res);
        setSelectedAssessmentData(response.data.res[0] || { sections: [] }); // Safe default
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setSelectedAssessmentData({ sections: [] }); // Safe default on error
      });
  }, [className, token, refreshKey]);

  const handleAssessmentSelection = (assessmentId) => {
    const selectedData = serverData.find(
      (data) => data.assessment === assessmentId
    );
    setSelectedAssessmentData(selectedData || { sections: [] }); // Safe default
    setSelectedSection("");
    setSelectedStudent(null);
    setShowEditor(false);
  };

  const handleSelectSection = (section) => {
    setSelectedSection(section);
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setShowEditor(true);
  };

  const handleSaveGrades = (studentId, grades) => {
    const data = {
      pId: pId,
      sId: studentId,
      newGrades: grades,
      assessmentName: selectedAssessmentData.assessment,
    };

    axios
      .post(
        `http://localhost:3000/api/v1/class/${className}/updateGrades`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setRefreshKey((oldKey) => oldKey + 1);
        console.log("Response:", response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    console.log("Saving grades for:", studentId, grades);
    setShowEditor(false);
  };

  const filteredStudents = selectedSection
    ? selectedAssessmentData.sections.find(
        (sec) => sec.name === selectedSection
      )?.students || []
    : selectedAssessmentData.sections.flatMap((sec) => sec.students || []); // Safely use flatMap

  const visibleStudents = filteredStudents.filter((student) => {
    const matchesName = student.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const isUngraded = filterUngraded
      ? student.grades.questionsGrades.length === 0
      : true;
    return matchesName && isUngraded;
  });

  return (
    <div className="container">
      <h1>{className}</h1>
      <AssessmentSelector
        assessments={serverData}
        onSelection={handleAssessmentSelection}
      />
      <SectionSelector
        sections={selectedAssessmentData.sections}
        onSelect={handleSelectSection}
      />
      <input
        type="text"
        placeholder="Search students"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={() => setFilterUngraded(!filterUngraded)}>
        {filterUngraded ? "Show All" : "Filter Ungraded"}
      </button>
      <StudentList
        students={visibleStudents}
        onSelectStudent={handleSelectStudent}
      />
      {showEditor && selectedStudent && (
        <GradeEditor
          student={selectedStudent}
          questionNumber={selectedAssessmentData.questionNumber}
          questionMaxes={selectedAssessmentData.questionMaxes}
          questionWeights={selectedAssessmentData.questionWeights}
          onSave={handleSaveGrades}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}

export default GradingPage;
