import React, { useState, useEffect } from "react";
import socket from "../utils/socket";
import "../../public/css/ChatWidget.css";

const ChatWidget = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [activeTab, setActiveTab] = useState("chat");

  useEffect(() => {
    if (!user?.name || !user?.role) return;

    socket.emit("join", { name: user.name, role: user.role });

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("participants", (list) => {
      setParticipants(list);
    });

    socket.on("kicked", ({ reason }) => {
      alert(reason || "You were removed by the teacher");
      window.location.reload();
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("participants");
      socket.off("kicked");
    };
  }, [user]);

  const sendMessage = () => {
    if (message.trim() !== "") {
      const msgData = { sender: user.name, text: message };
      socket.emit("sendMessage", msgData);
      setMessage("");
    }
  };

  const handleKick = (participantId) => {
    if (user.role === "teacher") {
      socket.emit("kickStudent", participantId);
    }
  };

  return (
    <div className="chat-widget">
      {!isOpen && (
        <button className="chat-toggle" onClick={() => setIsOpen(true)}>
          💬 Chat
        </button>
      )}

      {isOpen && (
        <div className="chat-box">
          <div className="chat-header">
            <div className="tabs">
              <button
                className={activeTab === "chat" ? "active" : ""}
                onClick={() => setActiveTab("chat")}
              >
                Chat
              </button>
              <button
                className={activeTab === "participants" ? "active" : ""}
                onClick={() => setActiveTab("participants")}
              >
                Participants
              </button>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              ✖
            </button>
          </div>

          <div className="chat-content">
            {activeTab === "chat" ? (
              <div className="chat-messages">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`chat-msg ${msg.sender === user.name ? "self" : ""}`}
                  >
                    <strong>{msg.sender}: </strong>
                    {msg.text}
                  </div>
                ))}
              </div>
            ) : (
              <div className="chat-participants">
                <h4>Participants</h4>
                <ul>
                  {participants.map((p) => (
                    <li key={p.id} className="participant-item">
                      {p.name} ({p.role})
                      {user.role === "teacher" && p.id !== socket.id && (
                        <button className="kick-btn" onClick={() => handleKick(p.id)}>
                          Kick
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={message}
              placeholder="Type your message..."
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
