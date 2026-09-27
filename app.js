const express = require("express");
const path = require("path");
const questions = require("./data/questions");
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  const questionCount = questions.length;
  const categories = [...new Set(questions.map((question) => question.category))];

  res.render("index", {
    questionCount,
    categories
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/quiz", (req, res) => {
  res.render("quiz", { questions });
});

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

  res.render("result", {
    score,
    correct: score,
    total: questions.length
  });
});

module.exports = app;