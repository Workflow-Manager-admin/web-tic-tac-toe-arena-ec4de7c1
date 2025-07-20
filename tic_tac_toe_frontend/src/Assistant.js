import React, { useState } from "react";

// PUBLIC_INTERFACE
/**
 * Assistant component for the Tic Tac Toe app.
 * Appears as a floating help/chat bubble that expands to show help, suggestions, and rules.
 * Style matches the modern minimalistic UI.
 */
function Assistant({ board, isXNext, winner, gameOver, suggestMove, mode }) {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState([
    {
      from: "assistant",
      text: "Hi! I'm your Tic Tac Toe assistant. Need game instructions, move suggestions, or have questions? Ask me or click a quick button!",
    },
  ]);
  const [input, setInput] = useState("");

  // "AI" answers for sample queries
  function getResponse(userMsg) {
    const msg = userMsg.trim().toLowerCase();
    // How to play
    if (
      msg.includes("how") &&
      (msg.includes("play") || msg.includes("start"))
    ) {
      return (
        "Click an empty square to place your mark. Get three in a row—horizontally, vertically, or diagonally—to win!"
      );
    }
    // Winning conditions
    if (
      msg.includes("win") ||
      msg.includes("winner") ||
      msg.includes("condition")
    ) {
      return (
        "To win, get three of your marks (X or O) in a straight line: horizontally, vertically, or diagonally."
      );
    }
    // Draw
    if (msg.includes("draw")) {
      return (
        "A draw happens if all squares are filled and there's no winner—nobody gets three in a row."
      );
    }
    // Suggest move
    if (
      msg.includes("move") &&
      (msg.includes("suggest") ||
        msg.includes("hint") ||
        msg.includes("best") ||
        msg.includes("play"))
    ) {
      if (winner || gameOver) {
        return "The game is over. Start a new game for suggestions!";
      }
      // Ask parent for suggestion based on current board
      let moveIdx = suggestMove(board, isXNext ? "X" : "O");
      if (moveIdx === null || typeof moveIdx === "undefined") {
        return "No possible moves! The board is full.";
      }
      return `I recommend you play in square ${moveIdx + 1}.`;
    }
    // Explanation about modes
    if (msg.includes("computer") || msg.includes("mode")) {
      if (mode === "PVC")
        return "You're playing Human vs Computer. X is you, O is the computer AI.";
      if (mode === "PVP")
        return "You're playing Two Player mode. Take turns between X and O!";
    }
    // Rules
    if (msg.includes("rule") || msg.includes("about")) {
      return "Tic Tac Toe: Players (X and O) take turns. The first to place three of their marks in a horizontal, vertical, or diagonal line wins. If no one succeeds and all squares are filled, it's a draw.";
    }
    // Fallback/generic
    return "I'm here to help! Ask me about the rules, how to play, or for a move suggestion.";
  }

  // Handler for user sending a message
  function sendMsg(msg) {
    if (!msg.trim()) return;
    setChat((c) => [...c, { from: "user", text: msg }]);
    setInput("");
    setTimeout(() => {
      const reply = getResponse(msg);
      setChat((c) => [...c, { from: "assistant", text: reply }]);
    }, 400);
  }

  function quickAsk(question) {
    sendMsg(question);
    setOpen(true);
  }

  // Suggestions for quick action buttons
  const quickButtons = [
    {
      label: "How to play?",
      q: "How do I play?",
    },
    {
      label: "Show game rules",
      q: "What are the rules?",
    },
    {
      label: "Suggest a move",
      q: "Suggest a move",
    },
    {
      label: "How can I win?",
      q: "How do I win?",
    },
  ];

  return (
    <>
      <div
        className="ttt-assistant-bubble"
        tabIndex={0}
        title="Game Assistant"
        aria-label="Open game assistant"
        style={{
          position: "fixed",
          bottom: 32,
          right: 26,
          background: "#ffcf33",
          color: "#282c34",
          borderRadius: "50%",
          width: 58,
          height: 58,
          boxShadow: "0 6px 22px 0 rgba(0,0,0,0.18)",
          display: open ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 31,
          zIndex: 1002,
          cursor: "pointer",
          transition: "all 0.18s",
        }}
        onClick={() => setOpen(true)}
      >
        <span role="img" aria-label="Assistant" style={{ marginTop: -4 }}>
          💡
        </span>
      </div>
      {open && (
        <div
          className="ttt-assistant-panel"
          style={{
            position: "fixed",
            bottom: 40,
            right: 24,
            width: "328px",
            maxWidth: "calc(100vw - 24px)",
            background: "#fff",
            borderRadius: 13,
            boxShadow: "0 10px 38px 0 rgba(0,0,0,0.18)",
            zIndex: 1003,
            padding: "22px 16px 66px 16px",
            fontFamily: "inherit",
            minHeight: 210,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            fontSize: "1.05rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 13,
            }}
          >
            <div style={{ fontWeight: 700, color: "#1976d2", fontSize: 17 }}>
              <span role="img" aria-label="Assistant">
                💡
              </span>{" "}
              Game Assistant
            </div>
            <button
              aria-label="Close assistant"
              tabIndex={0}
              style={{
                background: "none",
                border: "none",
                fontSize: 23,
                color: "#d33",
                cursor: "pointer",
                fontWeight: 700,
                borderRadius: 14,
                padding: 1,
                margin: -8,
              }}
              onClick={() => setOpen(false)}
            >
              &times;
            </button>
          </div>
          <div
            className="assistant-chat"
            style={{
              overflowY: "auto",
              maxHeight: 195,
              marginBottom: 5,
              paddingRight: 4,
              wordBreak: "break-word",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {chat.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.from === "assistant" ? "flex-start" : "flex-end",
                  background:
                    msg.from === "assistant"
                      ? "#e9ecef"
                      : "#1976d2",
                  color: msg.from === "assistant" ? "#282c34" : "#fff",
                  padding: "6px 13px",
                  borderRadius: 10,
                  maxWidth: "82%",
                  fontSize: "1.01rem",
                  boxShadow:
                    msg.from === "assistant"
                      ? "0px 1.2px 5px 0 rgba(31,38,135,0.07)"
                      : "0px 1.6px 7px 0 rgba(25,118,210,0.10)",
                  marginBottom: 2,
                }}
              >
                <span>{msg.text}</span>
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 7,
              margin: "8px 0 8px 0",
              justifyContent: "center",
            }}
          >
            {quickButtons.map((btn, idx) => (
              <button
                key={btn.label}
                tabIndex={0}
                className="assistant-quick-btn"
                style={{
                  padding: "4.5px 12px",
                  borderRadius: 8,
                  border: "1.5px solid #1976d2",
                  background: "#fff",
                  color: "#1976d2",
                  fontWeight: 500,
                  fontSize: ".92rem",
                  cursor: "pointer",
                  margin: "0 2px",
                  marginBottom: 2,
                  transition: "background 0.17s, color 0.18s",
                }}
                onClick={() => quickAsk(btn.q)}
              >
                {btn.label}
              </button>
            ))}
          </div>
          <form
            style={{
              display: "flex",
              gap: 7,
              marginTop: 7,
              borderTop: "1px solid #e9ecef",
              paddingTop: 7,
            }}
            onSubmit={(e) => {
              e.preventDefault();
              sendMsg(input);
            }}
          >
            <input
              aria-label="Ask assistant"
              className="assistant-input"
              style={{
                flex: 1,
                border: "1.5px solid #e9ecef",
                borderRadius: 8,
                padding: "6.5px 9px",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.17s",
              }}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for help or type '?''"
              autoFocus
              maxLength={100}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMsg(input);
                }
              }}
            />
            <button
              type="submit"
              aria-label="Send"
              className="assistant-send-btn"
              style={{
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "7px 15px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Assistant;
