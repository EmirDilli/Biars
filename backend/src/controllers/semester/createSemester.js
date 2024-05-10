const { response } = require("express");
const { Semester } = require("../../schemas/index");
const { generateResponse } = require("../../utils/response");

/**
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */

module.exports.createSemester = async (req, res) => {
  try {
    if (req.user.type != 0) {
      return res.status(401).json(generateResponse("Unauthorized"));
    }
    if (!req.body.start || !req.body.end) {
      return res.status(400).json(generateResponse("Bad Input"));
    }
    const activeSemester = await Semester.find({ status: "active" });

    if (activeSemester.length !== 0) {
      return res.status(405).json(generateResponse("There is active semester"));
    }
    const semesters = await Semester.find();
    semesters.sort((a, b) => {
      // Extract year and semester from semesterId
      const yearA = parseInt(a.semesterId.slice(0, 4));
      const semesterA = a.semesterId.slice(4);

      const yearB = parseInt(b.semesterId.slice(0, 4));
      const semesterB = b.semesterId.slice(4);

      // Sort by year in descending order
      if (yearA !== yearB) {
        return yearB - yearA;
      }

      // If years are the same, sort by semester in ascending order
      if (semesterA < semesterB) {
        return -1;
      } else if (semesterA > semesterB) {
        return 1;
      } else {
        return 0;
      }
    });

    const lastSemesterId = semesters[0].semesterId;
    let year = parseInt(lastSemesterId.slice(0, 4));
    let semester = lastSemesterId.slice(4);

    // Determine if it's a Fall or Spring semester and update accordingly
    if (semester === "F") {
      // If it's Fall, change it to Spring and increment the year
      semester = "S";
      year++;
    } else {
      // If it's Spring, increment the semester number and change it to Fall
      semester = "F";
    }

    // Construct the new semesterIdye
    const nextSemesterId = `${year}${semester}`;

    const currenSemester = new Semester({
      semesterId: nextSemesterId,
      status: "active",
      startDate: req.body.start,
      endDate: req.body.end,
    });
    const startDate = new Date(req.body.start);
    const endDate = new Date(req.body.end);
    const semesterWeeks = generateWeeks(startDate, endDate);
    currenSemester.weeks = semesterWeeks;
    currenSemester.save();
    //await currenSemester.save();
    return res.status(200).json(generateResponse("Success!", nextSemesterId));
  } catch (error) {
    return res.status(500).json(generateResponse("Server Error", { error }));
  }
};
function generateWeeks(startDate, endDate) {
  const weeks = [];
  let currentWeekStartDate = new Date(startDate);
  let currentWeekEndDate = new Date(startDate);
  currentWeekEndDate.setDate(currentWeekStartDate.getDate() + 6);

  let weekId = 1;
  while (currentWeekEndDate <= endDate) {
    weeks.push({
      weekId,
      startDate: currentWeekStartDate.toISOString().split("T")[0],
      endDate: currentWeekEndDate.toISOString().split("T")[0],
    });

    currentWeekStartDate.setDate(currentWeekStartDate.getDate() + 7);
    currentWeekEndDate.setDate(currentWeekEndDate.getDate() + 7);
    weekId++;
  }

  return weeks;
}
