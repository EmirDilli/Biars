import React, { useState, useEffect } from "react";
import axios from "axios";
import "./schedulePage.css";

export default function SchedulePage() {
  const [schedule, setSchedule] = useState([]);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/v1/user/${userId}/classes`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Initialize a local schedule structure from response
        let weeklySchedule = [
          Array(8).fill(null),
          Array(8).fill(null),
          Array(8).fill(null),
          Array(8).fill(null),
          Array(8).fill(null),
        ];

        // Fill the schedule with class names or null for free time
        for (let index1 = 0; index1 < response.data.data.length; index1++) {
          const classObj = response.data.data[index1];

          for (let index2 = 0; index2 < classObj.schedule.length; index2++) {
            for (let index3 = 0; index3 < 8; index3++) {
              const day = classObj.schedule[index2][index3];
              if (classObj.schedule[index2][index3] != null) {
                weeklySchedule[index2][index3] =
                  day +
                  " " +
                  response.data.data[index1].classSemester.class.code +
                  "-" +
                  response.data.data[index1].sectionNumber +
                  " " +
                  classObj.location;
              }
            }
          }
        }

        setSchedule(weeklySchedule);
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
      }
    }

    fetchSchedule();
  }, []);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const times = [
    "8:30-9:20",
    "9:30-10:20",
    "10:30-11:20",
    "11:30-12:20",
    "1:30-2:20",
    "2:30-3:20",
    "3:30-4:20",
    "4:30-5:20",
  ];

  return (
    <div className="schedule-container">
      {days.map((day, dayIndex) => (
        <div key={day} className="day-column">
          <h3>{day}</h3>
          {schedule[dayIndex] &&
            schedule[dayIndex].map((subject, hourIndex) => {
              const type = subject ? subject.split(" ") : null;
              let info = "";
              if (type) {
                for (let i = 0; i < type.length - 1; i++) {
                  info += " " + type[i];
                }
              }

              let classType = "lecture"; // Default class type is lecture
              if (type && type[0] === "Lab") {
                classType = "lab";
              } else if (type && type[0] === "Spare") {
                classType = "spare";
              } else if (!subject) {
                classType = "free";
              }

              return (
                <div
                  key={times[hourIndex]}
                  className={`class-hour ${classType}-hour`}
                >
                  <span className="class-time">{times[hourIndex]}</span>
                  <span className="class-name">
                    {subject && (
                      <>
                        <span>{info}</span>
                        <br /> {/* Add line break */}
                        <span className="class-location">
                          {type[type.length - 1] && (
                            <>{type[type.length - 1]}</>
                          )}
                        </span>
                      </>
                    )}
                    {!subject && classType === "free" && "Free Time"}
                  </span>
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}
