import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket.js";
import TeacherLivePoll from "../pages/TeacherPollLive.jsx";
import "../../public/css/CreateQuestionPage.css";
import ChatWidget from "../pages/ChatWidget.jsx";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [currentPoll, setCurrentPoll] = useState(null);

  const addOption = () => {
    if (options.length >= 4) return;
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  useEffect(() => {
    socket.emit("join", { name: "Teacher", role: "teacher" });
  }, []);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleCorrectChange = (index) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(newOptions);
  };

  const handleStartPoll = async () => {
    if (!questionText || options.some((opt) => !opt.text)) {
      alert("Please fill all fields");
      return;
    }

    try {
      // Save poll to backend
      const res = await axios.post(`${API_BASE}/api/questions`, {
        questionText,
        options: options.map((opt) => ({ text: opt.text })),
        duration: 60,
      });

      const savedQuestion = res.data;

      // Emit to students
      socket.emit("new-question", savedQuestion);

      setCurrentPoll(savedQuestion);

      // Reset form
      setQuestionText("");
      setOptions([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);
    } catch (err) {
      console.error("Failed to save poll:", err);
      alert("Failed to start poll. Check console for errors.");
    }
  };

  const handleNewQuestion = () => {
    setCurrentPoll(null);
  };

  return (
    <div className="cq-viewport">
      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "flex-end" }}>
        <button className="teacher-add-option-btn" onClick={() => navigate("/teacher/history")}>
          View Full History
        </button>
      </div>

      {!currentPoll ? (
        <>
          <div className="teacher-tag">✦ Intervue Poll</div>
          <h1 className="teacher-main-heading">
            Let’s <span className="teacher-highlight">Get Started</span>
          </h1>
          <p className="teacher-subtitle">
            You can create and manage polls, ask questions, and monitor responses in real-time.
          </p>

          <div className="teacher-form-row">
            <label className="teacher-form-label" htmlFor="question">
              Enter your question
            </label>
            <span className="teacher-timer">60 seconds ▼</span>
          </div>
          <textarea
            id="question"
            className="teacher-textarea"
            placeholder="Enter your question here"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            maxLength={100}
            rows={3}
          />
          <div className="teacher-char-count">{questionText.length}/100</div>

          <div className="teacher-edit-options-title">Edit Options</div>
          <div className="teacher-edit-options-row">
            <div className="teacher-opt-left"></div>
            <div className="teacher-opt-right">Is it Correct?</div>
          </div>

          {options.map((opt, idx) => (
            <div className="teacher-option-row" key={idx}>
              <div className="teacher-option-index">{idx + 1}</div>
              <input
                className="teacher-option-input"
                type="text"
                value={opt.text}
                placeholder={`Option ${idx + 1}`}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                maxLength={100}
              />
              <div className="teacher-option-radio-group">
                <label className="teacher-radio-label">
                  <input
                    type="radio"
                    name="correct"
                    checked={opt.isCorrect}
                    onChange={() => handleCorrectChange(idx)}
                  />
                  <span className="teacher-custom-radio checked"></span>Yes
                </label>
                <label className="teacher-radio-label">
                  <input
                    type="radio"
                    name="correct"
                    checked={!opt.isCorrect}
                    onChange={() => handleCorrectChange(-1)}
                  />
                  <span className="teacher-custom-radio"></span>No
                </label>
              </div>
            </div>
          ))}

          {options.length < 4 && (
            <button className="teacher-add-option-btn" onClick={addOption}>
              + Add More option
            </button>
          )}

          <div className="teacher-footer">
            <button className="teacher-ask-question-btn" onClick={handleStartPoll}>
              Ask Question
            </button>
          </div>
        </>
      ) : (
        <TeacherLivePoll poll={currentPoll} onNewQuestion={handleNewQuestion} />
      )}
    </div>
  );
}
