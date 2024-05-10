const fs = require("fs");

// Sample data
const classes = [
  {
    classCode: "CS101",
    instructors: ["John Doe", "Jane Smith"],
    tas: ["Alice Johnson", "Bob Brown"],
    sections: [
      {
        location: "Room 101",
        schedule: "Mon-Wed 9:00-10:30",
        instructor: "John Doe",
        maxEnrollment: 30,
      },
      {
        location: "Room 102",
        schedule: "Tue-Thu 11:00-12:30",
        instructor: "Jane Smith",
        maxEnrollment: 25,
      },
    ],
  },
  {
    classCode: "CS202",
    instructors: ["David Lee"],
    tas: ["Eva Martinez"],
    sections: [
      {
        location: "Room 201",
        schedule: "Mon-Wed 10:30-12:00",
        instructor: "David Lee",
        maxEnrollment: 40,
      },
    ],
  },
];

// Function to convert an array to CSV format
function arrayToCSV(array) {
  return array.map((row) => row.join(",")).join("\n");
}

// Function to generate CSV content for sections
function generateSectionsCSV(sections) {
  const sectionRows = sections.map((section) => [
    section.location,
    section.schedule,
    section.instructor,
    section.maxEnrollment,
  ]);
  const headerRow = ["Location", "Schedule", "Instructor", "Max Enrollment"];
  return `${headerRow.join(",")}\n${arrayToCSV(sectionRows)}`;
}

// Function to generate CSV content for classes
function generateClassesCSV(classes) {
  const classRows = classes.map((classInfo) => [
    classInfo.classCode,
    classInfo.instructors.join("; "),
    classInfo.tas.join("; "),
    generateSectionsCSV(classInfo.sections),
  ]);
  const headerRow = ["Class Code", "Instructors", "TAs", "Sections"];
  return `${headerRow.join(",")}\n${arrayToCSV(classRows)}`;
}

// Generate CSV content
const csvContent = generateClassesCSV(classes);

// Write CSV content to a file
fs.writeFile("classes.csv", csvContent, "utf8", (err) => {
  if (err) {
    console.error("Error writing CSV file:", err);
    return;
  }
  console.log("CSV file has been saved successfully.");
});
