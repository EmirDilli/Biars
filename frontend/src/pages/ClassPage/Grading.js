import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ClassSections = () => {
    const [sections, setSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState(null);
    const [loading, setLoading] = useState(true);
    const { className } = useParams();
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/v1/class/${className}/activeSemesters`, { 
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                setSections(response.data.sections);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch sections:', error);
                setLoading(false);
            }
        };

        if (className) {
            fetchSections();
        }
    }, [className, token]);

    const handleSectionChange = (event) => {
        const sectionId = event.target.value;
        const section = sections.find(s => s.id === sectionId);
        setSelectedSection(section);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
            {loading ? (
                <p style={{ fontSize: '16px', fontWeight: 'bold' }}>Loading sections...</p>
            ) : (
                <div style={{ width: '300px' }}>
                    <select 
                        onChange={handleSectionChange} 
                        value={selectedSection ? selectedSection.id : ''}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px' }}
                    >
                        <option value="">Select Section</option>
                        {sections.map(section => (
                            <option key={section.id} value={section.id}>
                                {section.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {selectedSection && (
                <div style={{ width: '300px', maxHeight: '200px', overflowY: 'auto', marginTop: '20px', border: '1px solid #ccc', borderRadius: '5px' }}>
                    <ul style={{ listStyleType: 'none', padding: '10px' }}>
                        {selectedSection.students.map(student => (
                            <li key={student.id} style={{ padding: '5px 0' }}>
                                {student.id} - {student.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ClassSections;
