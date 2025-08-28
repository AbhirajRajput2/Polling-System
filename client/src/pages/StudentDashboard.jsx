import { useState, useEffect, useRef } from "react";
import socket from "../utils/socket.js";
import "../../public/css/StudentDashboard.css";
import ChatWidget from "./ChatWidget.jsx";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function StudentDashboard() {
  const [name, setName] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const hasSubmittedRef = useRef(hasSubmitted);

  useEffect(() => {
    hasSubmittedRef.current = hasSubmitted;
  }, [hasSubmitted]);

  // Socket listeners
  useEffect(() => {
    socket.on("receive-question", (data) => {
      setQuestion(data);
      setSelectedOption(null);
      setResults(new Array(data.options.length).fill(0));
      setTimeLeft(data.duration || 60);
      setHasSubmitted(false);
    });

    socket.on("live-results", (data) => setResults(data));
    socket.on("poll-ended", (data) => setResults(data.results));

    return () => {
      socket.off("receive-question");
      socket.off("live-results");
      socket.off("poll-ended");
    };
  }, []);

  // Timer
  useEffect(() => {
    if (!question) return;
    setTimeLeft(question.duration || 60);
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [question]);

  // Join socket room
  useEffect(() => {
    if (isNameSet && name) {
      socket.emit("join", { name, role: "student" });
    }
  }, [isNameSet, name]);

  // Submit answer
  const submitAnswer = async () => {
    if (selectedOption === null || hasSubmittedRef.current) return;

    try {
      await axios.post(
        `${API_BASE}/api/questions/${question._id}/vote`,
        { optionIndex: selectedOption }
      );

      socket.emit("submit-answer", { name, selectedOption });
      setHasSubmitted(true);
    } catch (err) {
      console.error("Error submitting vote:", err);
      alert("Failed to submit your vote. Try again.");
    }
  };

  // Conditional renders
  if (!isNameSet) {
    return (
      <div className="student-name-root">
        <h2>Enter your name:</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
        <button onClick={() => name.trim() && setIsNameSet(true)}>Start</button>
      </div>
    );
  }

  if (!question) {
    return <h3 className="wait-message">Waiting for teacher to send a question...</h3>;
  }

  // Calculate percentages
  const totalVotes = results?.reduce((a, b) => a + b, 0) || 0;
  const optionsWithPercent = question.options.map((opt, idx) => ({
    text: opt.text,
    percent: totalVotes > 0 ? Math.round((results[idx] / totalVotes) * 100) : 0,
  }));

  return (
    <div className="poll-results">
      <div className="question-meta">
        <span className="question-number">Question 1</span>
        <span className="timer" role="img" aria-label="timer">
          ⏱️ <span className="time red">{`00:${timeLeft.toString().padStart(2, "0")}`}</span>
        </span>
      </div>

      <div className={`question-title ${hasSubmitted ? "answered" : ""}`}>
        {question.question}
      </div>

      <div className="results-list">
        {optionsWithPercent.map((opt, idx) => (
          <label
            key={idx}
            className={`
              result-row 
              ${selectedOption === idx && !hasSubmitted ? "selected-before-submit" : ""}
              ${selectedOption === idx && hasSubmitted ? "selected" : ""}
              ${hasSubmitted ? "submitted" : ""}
            `}
            onClick={() => !hasSubmitted && setSelectedOption(idx)}
          >
            <div
              className="result-row-fill"
              style={{ width: hasSubmitted ? `${opt.percent}%` : 0 }}
            ></div>

            <div className="result-index">{idx + 1}</div>
            <div className="result-text">{opt.text}</div>
            <div className="result-percent">
              {hasSubmitted ? (opt.percent > 0 ? `${opt.percent}%` : "0%") : ""}
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={submitAnswer}
        disabled={selectedOption === null || hasSubmitted}
        className={`submit-answer-btn ${hasSubmitted ? "submitted-btn" : ""}`}
      >
        {hasSubmitted ? "Answer Submitted" : "Submit Answer"}
      </button>

      <ChatWidget user={{ name, role: "student" }} />
    </div>
  );
}
