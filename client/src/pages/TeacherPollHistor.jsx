import { useEffect, useState } from "react";
import axios from "axios";
import "../../public/css/TeacherPollHistory.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function TeacherPollHistory() {
  const [pollHistory, setPollHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPollHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/questions`);
        setPollHistory(res.data);
      } catch (err) {
        console.error("Error fetching poll history:", err);
        setError("Failed to fetch poll history.");
      } finally {
        setLoading(false);
      }
    };

    fetchPollHistory();
  }, []);

  if (loading) return <p>Loading poll history...</p>;
  if (error) return <p>{error}</p>;
  if (pollHistory.length === 0) return <p>No previous polls conducted yet.</p>;

  return (
    <div className="tph-root">
      <h2>All Previous Polls</h2>
      {pollHistory.map((poll) => {
        const totalVotes = poll.options.reduce((sum, o) => sum + (o.votes || 0), 0);

        return (
          <div key={poll._id} className="tph-wrapper">
            <div className="tph-question-title">{poll.question}</div>

            <div className="tph-results-list">
              {poll.options.map((opt, idx) => {
                const percent = totalVotes
                  ? Math.round(((opt.votes || 0) / totalVotes) * 100)
                  : 0;

                return (
                  <div key={idx} className="tph-result-row">
                    <div className="tph-result-index">{idx + 1}</div>
                    <div className="tph-result-bar-container">
                      <div
                        className="tph-result-bar-fill"
                        style={{ width: `${percent}%` }}
                      >
                        <div className="tph-bar-option-over">{opt.text}</div>
                        {percent > 10 && (
                          <div className="tph-bar-percent">{percent}%</div>
                        )}
                      </div>
                    </div>
                    <div className="tph-vote-count">{opt.votes || 0} votes</div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
