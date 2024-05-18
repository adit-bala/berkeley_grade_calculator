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
  const { totalGradePoints, totalUnits, currGPA } = calculateOverallGPA(
    classMap,
    gradeValuesMap
  );
  const row = document.createElement("tr");
  let gpaString = currGPA?.toString();
  row.innerHTML = `<td>${Math.round(
    totalGradePoints
  )}</td><td>${totalUnits}</td><td>${parseFloat(
    gpaString.slice(0, gpaString.indexOf(".") + 3 + 1)
  )}</td>`;
  tGPAbody.appendChild(row);
}

function calculateOverallGPA(classMap, gradeValuesMap) {
  classMap.forEach((cls) => {
    const grade = cls.grade;
    const units = parseFloat(cls.units);
    if (gradeValuesMap.has(grade)) {
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

function modifyGPA(row, unit, gpa, reversal) {
  const tGPAbody = document.getElementById("GPA");
  const units = parseInt(row.querySelector(".units").value);
  const grade = row.querySelector(".grades option:checked").textContent;
  const gpaRow = tGPAbody.rows[1];
  if (unit) {
    totalUnits += isNaN(units) ? 0 : reversal ? -units : units;
  }
  if (gpa && gradeValuesMap.has(grade)) {
    const gradePoints = gradeValuesMap.get(grade) * units;
    totalGradePoints += reversal ? -gradePoints : gradePoints;
  }
  const currGPA = totalGradePoints / totalUnits;
  const totalUnitsCell = gpaRow.cells[1];
  const GPAcell = gpaRow.cells[2];
  totalUnitsCell.textContent = totalUnits;
  GPAcell.textContent = currGPA;
}

document.addEventListener("DOMContentLoaded", function () {
  var addCourseButton = document.getElementById("addClass");
  let row, tbody;
  addCourseButton.addEventListener("click", function () {
    tbody = document.getElementById("courseTable");
    row = tbody.insertRow();
    row.innerHTML = `<td><input type="text" id="courseName" name="courseName" placeholder="Optional"></td>
      <td><input type="text" class="units" name="units" required></td>
      <td> <select class="grades" name="grade" required>
              <option value="">Select Grade</option>
              <option value="A+">A+</option>
              <option value="A">A</option>
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
          </select></td>
      <td><input type="button" class="removeClass" value="Remove Class" ></td>`;

    tbody.appendChild(row);
    row.querySelector(".removeClass").addEventListener("click", () => {
      // reverse units and gpa
      modifyGPA(row, true, true, true);
      tbody.removeChild(row);
    });
    row.querySelector(".units").addEventListener("beforeinput", () => {
      // reverse units
      modifyGPA(row, true, false, true);
    });
    row.querySelector(".grades").addEventListener("beforechange", () => {
      // reverse gpa
      modifyGPA(row, false, true, true);
    });
    row.querySelector(".units").addEventListener("input", () => {
      // add units
      modifyGPA(row, true, false, false);
    });
    row.querySelector(".grades").addEventListener("change", () => {
      // add gpa
      modifyGPA(row, false, true, false);
    });
  });
});
