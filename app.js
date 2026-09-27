const express = require("express");
const path = require("path");
const questions = require("./data/questions");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Home page
app.get("/", (req, res) => {
  const questionCount = questions.length;

  const categories = [
    ...new Set(questions.map((question) => question.category))
  ];

  const commitId = process.env.RENDER_GIT_COMMIT || "local";

  res.render("index", {
    questionCount,
    categories,
    commitId
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Quiz page
app.get("/quiz", (req, res) => {
  const commitId = process.env.RENDER_GIT_COMMIT || "local";

  res.render("quiz", {
    questions,
    commitId
  });
});

// Submit quiz
app.post("/quiz/submit", (req, res) => {
  let score = 0;

  for (const question of questions) {
    const submittedAnswer = req.body[`question_${question.id}`];

    if (!submittedAnswer) {
      return res.status(400).send("Please answer all questions.");
    }

    if (!question.options.includes(submittedAnswer)) {
      return res.status(400).send("Invalid answer submitted.");
    }

    if (submittedAnswer === question.answer) {
      score++;
    }
  }

  const commitId = process.env.RENDER_GIT_COMMIT || "local";

  res.render("result", {
    score,
    correct: score,
    total: questions.length,
    commitId
  });
});

// Questions API
app.get("/api/questions", (req, res) => {
  const publicQuestions = questions.map((question) => ({
    id: question.id,
    question: question.question,
    options: question.options,
    category: question.category,
    difficulty: question.difficulty
  }));

  res.json(publicQuestions);
});

module.exports = app;