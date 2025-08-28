import express from "express";
import Question from "../models/Question.js";

const router = express.Router();

// Get all questions
router.get("/", async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new question
// Create a new question
router.post("/", async (req, res) => {
  const { questionText, options, duration } = req.body;

  const formattedOptions = options.map((opt) => ({
    text: opt.text,
    votes: 0,
  }));

  const question = new Question({
    question: questionText, // matches schema
    options: formattedOptions,
    duration: duration || 60,
  });

  try {
    const savedQuestion = await question.save();
    console.log("Saved question:", savedQuestion); // debug log
    res.status(201).json(savedQuestion);
  } catch (err) {
    console.error("❌ Error saving question:", err);
    res.status(400).json({ message: err.message });
  }
});


// Get a single question by ID
router.get("/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Not found" });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a question
router.put("/:id", async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedQuestion);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a question
router.delete("/:id", async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: "Question deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Vote on an option
router.post("/:id/vote", async (req, res) => {
  const { optionIndex } = req.body;

  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ message: "Question not found" });

    if (
      optionIndex < 0 ||
      optionIndex >= question.options.length
    ) {
      return res.status(400).json({ message: "Invalid option index" });
    }

    // Increment votes for the selected option
    question.options[optionIndex].votes += 1;

    await question.save();
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
