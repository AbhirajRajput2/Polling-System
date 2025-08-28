import React, { useState } from "react";
import "../../public/css/WelcomePage.css"

export default function WelcomePage({ onContinue }) {
  const [selectedRole, setSelectedRole] = useState("student");

  return (
    <div className="welcome-root">
      <div className="tag">✦ Intervue Poll</div>

      <h1 className="main-heading">
        Welcome to the <span className="highlight">Live Polling System</span>
      </h1>

      <p className="subtitle">
        Please select the role that best describes you to begin using the live polling system
      </p>

      <div className="roles-row">
        <div
          className={`role-card${selectedRole === "student" ? " selected" : ""}`}
          onClick={() => setSelectedRole("student")}
        >
          <div className="role-title">I’m a Student</div>
          <div className="role-desc">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry
          </div>
        </div>

        <div
          className={`role-card${selectedRole === "teacher" ? " selected" : ""}`}
          onClick={() => setSelectedRole("teacher")}
        >
          <div className="role-title">I’m a Teacher</div>
          <div className="role-desc">Submit answers and view live poll results in real-time.</div>
        </div>
      </div>

      <button
        className="continue-btn"
        onClick={() => onContinue(selectedRole)}
        tabIndex={0}
      >
        Continue
      </button>
    </div>
  );
}
