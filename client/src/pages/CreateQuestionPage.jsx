import { useState } from "react";
import axios from "axios";
import "../../public/css/CreateQuestionPage.css";

export default function CreateQuestion() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  const addOption = () => {
    if (options.length >= 4) return;
    setOptions([...options, { text: "", isCorrect: false }]);
  };

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

  // ✅ Submit question to backend
  const handleSubmit = async () => {
    if (!question || options.some(opt => !opt.text)) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/questions", {
        questionText: question,
        options,
      });
      console.log("Question saved:", res.data);
      alert("Question created successfully!");
      // Reset form
      setQuestion("");
      setOptions([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);
    } catch (err) {
      console.error(err);
      alert("Error saving question");
    }
  };

  return (
    <div className="cq-viewport">
      <div className="cq-content">
        <div className="tag">✦ Intervue Poll</div>
        <h1 className="main-heading">
          Let’s <span className="highlight">Get Started</span>
        </h1>
        <p className="subtitle">
          you’ll have the ability to create and manage polls, ask questions, and
          monitor your students' responses in real-time.
        </p>

        <div className="form-row">
          <div className="form-label">Enter your question</div>
        </div>
        <textarea
          className="question-textarea"
          placeholder="Enter your question here"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={100}
          rows={3}
        />
        <div className="char-count">{question.length}/100</div>

        <div className="edit-options-title">Edit Options</div>
        <div className="edit-options-row">
          <div className="opt-left"></div>
          <div className="opt-right">Is it Correct?</div>
        </div>

        {options.map((option, index) => (
          <div key={index} className="option-row">
            <div className="option-index">{index + 1}</div>
            <input
              type="text"
              className="option-input"
              value={option.text}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              maxLength={100}
            />
            <div className="option-radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name={`correct-${index}`}
                  checked={option.isCorrect}
                  onChange={() => handleCorrectChange(index)}
                />
                <span className="custom-radio checked"></span>
                Yes
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name={`not-correct-${index}`}
                  checked={!option.isCorrect}
                  onChange={() => handleCorrectChange(-1)}
                />
                <span className="custom-radio"></span>
                No
              </label>
            </div>
          </div>
        ))}

        {options.length < 4 && (
          <button className="add-option-btn" onClick={addOption}>
            + Add More option
          </button>
        )}
        <div style={{ height: "110px" }}></div>
      </div>

      <div className="cq-footer">
        <button className="ask-question-btn" onClick={handleSubmit}>
          Ask Question
        </button>
      </div>
    </div>
  );
}
