const form = document.getElementById("feedbackForm");
const summaryText = document.getElementById("summaryText");
const summary = document.getElementById("summary");
const analysis = document.getElementById("analysis");
const recommendation = document.getElementById("recommendation");
const scoreBadge = document.getElementById("scoreBadge");
const formStatus = document.getElementById("formStatus");

function showAlert(message) {
  try {
    alert(message);
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("not supported")) {
      throw error;
    }
    formStatus.textContent = message;
  }
}

function askForSuggestion() {
  try {
    return prompt("Optional: suggest one way to improve the course.") || "";
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("not supported")) {
      throw error;
    }
    return document.getElementById("suggestion").value.trim();
  }
}

const fields = [
  { id: "student", label: "Student name", type: "text" },
  { id: "course", label: "Course name", type: "text" },
  { id: "faculty", label: "Faculty name", type: "text" },
  { id: "teaching", label: "Teaching rating", type: "rating" },
  { id: "practical", label: "Practical / Lab rating", type: "rating" },
  { id: "content", label: "Content rating", type: "rating" }
];

function validateFeedback() {
  const errors = [];

  fields.forEach(function (field) {
    const input = document.getElementById(field.id);
    const value = input.value.trim();
    let message = "";

    if (field.type === "text" && value === "") {
      message = `${field.label} is required.`;
    } else if (field.type === "rating") {
      const rating = Number(value);
      if (value === "" || Number.isNaN(rating) || rating < 1 || rating > 5) {
        message = `${field.label} must be a number from 1 to 5.`;
      }
    }

    document.getElementById(`${field.id}Error`).textContent = message;
    input.setAttribute("aria-invalid", message ? "true" : "false");
    if (message) errors.push(message);
  });

  return errors;
}

function calculateAverage(teaching, practical, content) {
  return (teaching + practical + content) / 3;
}

function calculatePercentage(average) {
  return (average / 5) * 100;
}

function getClassification(average) {
  if (average >= 4) return "Excellent";
  if (average >= 3) return "Good";
  return "Needs improvement";
}

function getRecommendation(classification) {
  if (classification === "Excellent") {
    return "Great ratings! Keep up the good work.";
  }
  if (classification === "Good") {
    return "Good feedback. Consider reviewing areas with lower ratings.";
  }
  return "Thank you for your honest feedback. Please share suggestions to help improve the course.";
}

function submitFeedback(event) {
  event.preventDefault();
  const errors = validateFeedback();

  if (errors.length > 0) {
    showAlert("Please correct the following:\n" + errors.join("\n"));
    return;
  }

  if (!confirm("Submit your feedback now?")) return;

  const suggestion = askForSuggestion();
  const student = document.getElementById("student").value.trim();
  const course = document.getElementById("course").value.trim();
  const faculty = document.getElementById("faculty").value.trim();
  const comments = document.getElementById("comments").value.trim();
  const ratings = [
    { name: "Teaching", value: Number(document.getElementById("teaching").value) },
    { name: "Practical / Lab", value: Number(document.getElementById("practical").value) },
    { name: "Content", value: Number(document.getElementById("content").value) }
  ];

  const average = calculateAverage(
    ratings[0].value,
    ratings[1].value,
    ratings[2].value
  );
  const percentage = calculatePercentage(average);
  const classification = getClassification(average);
  const lowestRating = Math.min(...ratings.map(function (rating) {
    return rating.value;
  }));
  const lowestCategories = ratings
    .filter(function (rating) {
      return rating.value === lowestRating;
    })
    .map(function (rating) {
      return rating.name;
    });
  const ratingSummary = ratings
    .map(function (rating) {
      return `${rating.name}: ${rating.value}/5`;
    })
    .join(" | ");

  summaryText.textContent =
    `Thank you, ${student}. Feedback for ${course} with ${faculty}. ` +
    (comments ? `Comments: ${comments}` : "No additional comments.");
  scoreBadge.textContent = `Average: ${average.toFixed(2)}/5`;
  analysis.textContent =
    `${ratingSummary}. Score: ${percentage.toFixed(2)}%. ` +
    `Classification: ${classification}. ` +
    `Greatest improvement needed: ${lowestCategories.join(", ")} ` +
    `(${lowestRating}/5).` +
    (suggestion.trim() ? ` Suggestion: ${suggestion.trim()}` : "");

  recommendation.textContent = getRecommendation(classification);
  if (ratings.every(function (rating) { return rating.value >= 4.5; })) {
    recommendation.textContent += " Excellent work: all ratings are at least 4.5!";
  }

  summary.classList.remove(
    "classification-excellent",
    "classification-good",
    "classification-needs-improvement"
  );
  summary.classList.add(
    `classification-${classification.toLowerCase().replace(/\s+/g, "-")}`
  );
  recommendation.classList.add("visible");
  formStatus.textContent = "";
  showAlert("Feedback submitted successfully.");
}

function resetFeedback() {
  if (!confirm("Clear the form and all feedback results?")) return;

  form.reset();
  fields.forEach(function (field) {
    document.getElementById(`${field.id}Error`).textContent = "";
    document.getElementById(field.id).setAttribute("aria-invalid", "false");
  });

  summaryText.textContent = "Your submitted feedback will appear here.";
  scoreBadge.textContent = "Average: --/5";
  analysis.textContent = "Ratings and improvement areas will appear here after submission.";
  recommendation.textContent = "A recommendation will appear here.";
  formStatus.textContent = "";
  recommendation.classList.remove("visible");
  summary.classList.remove(
    "classification-excellent",
    "classification-good",
    "classification-needs-improvement"
  );
}

form.addEventListener("submit", submitFeedback);
document.getElementById("resetButton").addEventListener("click", resetFeedback);
form.addEventListener("input", validateFeedback);
form.addEventListener("change", validateFeedback);