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
const classMap = new Map();
let totalGradePoints = 0;
let totalUnits = 0;
const button = document.querySelector(".button___drmCY");

function handleMutations(mutationsList, observer) {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      const button = document.querySelector(".button___drmCY");
      console.log(button);
      var flag = false;
      if (button) {
        flag = true;
        button.click();
      }
      if (flag) {
        observer.disconnect();
      }

      const grade_html = document.querySelector(
        "student-semesters .Card__body"
      );

      if (grade_html) {
        const grade_body = grade_html.querySelectorAll(
          "div table.classesTable___Vfcks tbody > tr"
        );
        if (grade_body.length !== 0) {
          grade_body.forEach((row) => {
            const tds = row.querySelectorAll("td");
            const className = tds[0].querySelector("a").textContent.trim();
            const title = tds[1]
              .querySelector('[data-testid="semester-class-section-row-title"]')
              .textContent.trim();
            const units = tds[2].querySelector("span").textContent.trim();
            const grade = tds[3].textContent.trim();

            classMap.set(className, { title, units, grade });
          });
          
        }
      }
    }
  }
}

const observer = new MutationObserver(handleMutations);
observer.observe(document.body, {
  attributes: true,
  childList: true,
  subtree: true,
});

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

  return totalGradePoints / totalUnits;
}

function modifyGPA(cls) {
  const grade = cls.grade;
  const units = parseFloat(cls.units);
  if (gradeValuesMap.has(grade)) {
    const gradePoints = gradeValuesMap.get(grade);
    totalGradePoints += gradePoints * units;
    totalUnits += units;
  }
  return totalGradePoints / totalUnits;
}
