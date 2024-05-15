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
console.log(classMap);

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
  row.innerHTML = `<td>${Math.round(totalGradePoints)}</td><td>${totalUnits}</td><td>${currGPA.toFixed(3)}</td>`;
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
