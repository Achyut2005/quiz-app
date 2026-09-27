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
  res.send("QuizMaster is running!");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/quiz", (req, res) => {
  res.json(questions);
});

module.exports = app;