let classMap;
let totalGradePoints = 0;
let totalUnits = 0;
const gradeValuesMap = new Map([
  ["A+", 4.0],
  ["A", 4.0],
  ["A-", 3.7],
  ["B+", 3.3],
  ["B", 3.0],
  ["B-", 2.7],
  ["C+", 2.3],
  ["C", 2.0],
  ["C-", 1.7],
  ["D+", 1.3],
  ["D", 1.0],
  ["D-", 0.7],
  ["F", 0],
]);

document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    chrome.tabs
      .sendMessage(tabs[0].id, { from: "popup", subject: "DOMInfo" })
      .then(setDOMInfo);
  });
});

function setDOMInfo(info) {
  classMap = new Map(info.classes);
  const tbody = document.getElementById("courseTable");
  // Convert the Map to an array, reverse it, and populate the table
  [...classMap.entries()]
    .filter(([course, info]) => gradeValuesMap.has(info.grade))
    .reverse()
    .forEach(([course, info]) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${course}</td><td>${info.units}</td><td>${info.grade}</td>`;
      tbody.appendChild(row);
    });
  const tGPAbody = document.getElementById("GPA");
  const { totalGradePoints, totalUnits, currGPA } =
    calculateOverallGPA();
  const row = document.createElement("tr");
  let gpaString = currGPA?.toString();
  row.innerHTML = `<td>${Math.round(
    totalGradePoints
  )}</td><td>${totalUnits}</td><td>${parseFloat(
    gpaString.slice(0, gpaString.indexOf(".") + 3 + 1)
  )}</td>`;
  tGPAbody.appendChild(row);
}

function calculateOverallGPA() {
  totalGradePoints = 0;
  totalUnits = 0;
  classMap.forEach((cls) => {
    const grade = cls.grade;
    const units = parseFloat(cls.units);
    if (gradeValuesMap.has(grade) && units) {
      const gradePoints = gradeValuesMap.get(grade);
      totalGradePoints += gradePoints * units;
      totalUnits += units;
    }
  });

  if (totalUnits === 0) {
    return -1;
  }
  const currGPA = totalGradePoints / totalUnits;
  return { totalGradePoints, totalUnits, currGPA };
}

function modifyGPA() {
  const tGPAbody = document.getElementById("GPA");
  const { totalGradePoints, totalUnits, currGPA } =
    calculateOverallGPA();
  const gpaRow = tGPAbody.rows[1];
  const totalGradePoint = gpaRow.cells[0];
  const totalUnitsCell = gpaRow.cells[1];
  const GPAcell = gpaRow.cells[2];
  totalGradePoint.textContent = totalGradePoints;
  totalUnitsCell.textContent = totalUnits;
  GPAcell.textContent = currGPA;
}
var index = 0;
document.addEventListener("DOMContentLoaded", function () {
  var addCourseButton = document.getElementById("addClass");
  let row, tbody;
  addCourseButton.addEventListener("click", function () {
    tbody = document.getElementById("courseTable");
    row = tbody.insertRow();
    row.id = `course-${index}`; // Unique ID for the row
    index += 1;
    row.innerHTML = `<td><input type="text" id="courseName" name="courseName" placeholder="Optional"></td>
      <td><input type="text" class="units" name="units" required></td>
      <td> <select class="grades" name="grade" required>
              <option value="A+">A+</option>
              <option value="A" selected>A</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B">B</option>
              <option value="B-">B-</option>
              <option value="C+">C+</option>
              <option value="C">C</option>
              <option value="C-">C-</option>
              <option value="D+">D+</option>
              <option value="D">D</option>
              <option value="D-">D-</option>
              <option value="F">F</option>
          </select></td>`;
    tbody.appendChild(row);
    classMap.set(row.id, { title: -1, units: 0.0, grade: "A" });
    row.querySelector(".units").addEventListener("input", () => {
      const prev = classMap.get(row.id);
      let unit = parseInt(row.querySelector(".units").value);
      unit = isNaN(unit) ? 0 : unit;
      prev.units = unit;
      classMap.set(row.id, prev);
      // add units
      modifyGPA();
    });
    row.querySelector(".grades").addEventListener("change", () => {
      const prev = classMap.get(row.id);
      prev.grade = row.querySelector(".grades option:checked").textContent;
      classMap.set(row.id, prev);
      modifyGPA();
    });
  });
});
