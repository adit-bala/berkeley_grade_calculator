const classMap = new Map();
const button = document.querySelector(".button___drmCY");

function handleMutations(mutationsList, observer) {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      const button = document.querySelector(".button___drmCY");

      var flag = false;
      if (button) {
        button.click();
      }

      const grade_html = document.querySelector(
        "student-semesters .Card__body"
      );

      if (grade_html) {
        const grade_body = grade_html.querySelectorAll(
          "div table.classesTable___Vfcks tbody > tr"
        );
        if (grade_body.length !== 0 && !flag) {
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
          flag = true;
          //console.log(calculateOverallGPA(classMap, gradeValuesMap));
          observer.disconnect();
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

chrome.runtime.sendMessage({
  from: "content",
  subject: "showPageAction",
});

// Listen for messages from the popup.
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.from === "popup" && msg.subject === "DOMInfo") {
    // Send the classMap data back to the popup
    sendResponse({ classes: Array.from(classMap.entries()) });
  }
  return true;
});
