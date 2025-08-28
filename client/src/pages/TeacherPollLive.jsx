// src/pages/TeacherPollLive.jsx
import { useState, useEffect } from "react";
import socket from "../utils/socket.js";
import ChatWidget from "./ChatWidget.jsx";
import "../../public/css/TeacherPollLive.css";

export default function TeacherLivePoll({ poll, onNewQuestion }) {
  const [results, setResults] = useState(
    poll ? Array(poll.options.length).fill(0) : []
  );
  const [timeLeft, setTimeLeft] = useState(poll ? poll.duration : 0);

  useEffect(() => {
    if (!poll) return;

    // Reset results and timer
    setResults(Array(poll.options.length).fill(0));
    setTimeLeft(poll.duration);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [poll]);

  // Listen to live results
  useEffect(() => {
    socket.on("live-results", setResults);
    return () => socket.off("live-results");
  }, []);

  if (!poll) return <h2>No active poll</h2>;

  const totalVotes = results.reduce((a, b) => a + b, 0);

  return (
    <div className="teacher-poll-root">
      <button className="teacher-back-btn" onClick={onNewQuestion}>
        + Create New Question
      </button>

      <div className="poll-wrapper0">
        <h2 className="question-title">{poll.question}</h2>
        <p>Time left: {timeLeft}s</p>

        <div className="results-list">
          {poll.options.map((opt, idx) => {
            const percent =
              totalVotes > 0 ? Math.round((results[idx] / totalVotes) * 100) : 0;
            return (
              <div key={idx} className="result-row">
                <div className="result-index">{idx + 1}</div>
                <div className="result-bar-container">
                  <div
                    className="result-bar-fill"
                    style={{ width: `${percent}%` }}
                  >
                    <div className="bar-option-over">{opt.text}</div>
                    {percent > 15 && <div className="bar-percent">{percent}%</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ChatWidget user={{ name: "Teacher", role: "teacher" }} />
    </div>
  );
}
