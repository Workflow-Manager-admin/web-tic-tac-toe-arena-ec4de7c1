import React, { useState, useEffect } from "react";
import "./App.css";
import Assistant from "./Assistant";

/**
 * Color Theme Constants (provided in requirements)
 * Accent:    #ffcf33
 * Primary:   #1976d2
 * Secondary: #424242
 */

// PUBLIC_INTERFACE
function App() {
  // --- Game State ---
  const emptyBoard = Array(9).fill(null);

  // Modes: 'PVP' (human vs human), 'PVC' (human vs computer)
  const [mode, setMode] = useState("PVC");
  const [board, setBoard] = useState(emptyBoard);
  const [isXNext, setIsXNext] = useState(true);
  const [history, setHistory] = useState([emptyBoard]);
  const [stepNumber, setStepNumber] = useState(0);
  const [status, setStatus] = useState("Next: X");
  const [winner, setWinner] = useState(null);
  const [scores, setScores] = useState({ X: 0, O: 0, Draws: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [startingPlayer, setStartingPlayer] = useState("X"); // Alternate who starts for new games

  // --- Utility Functions ---

  // PUBLIC_INTERFACE
  function calculateWinner(squares) {
    /**
     * Determines the winner of the game or if there's a draw.
     * Returns 'X', 'O', or null (for no winner yet). Draw detection is handled separately.
     */
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8], // rows
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8], // columns
      [0, 4, 8],
      [2, 4, 6], // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }
    return null;
  }

  // PUBLIC_INTERFACE
  function isDraw(squares) {
    /**
     * Returns true if the board is full and there is no winner.
     */
    return squares.every((sq) => sq !== null) && !calculateWinner(squares);
  }

  // --- Game Logic ---

  // PUBLIC_INTERFACE
  function handleClick(i) {
    /**
     * Handles a user clicking on a board square.
     */
    const squares = board.slice();
    if (winner || squares[i] || gameOver) return;

    squares[i] = isXNext ? "X" : "O";
    const newHistory = [...history.slice(0, stepNumber + 1), squares];
    setBoard(squares);
    setIsXNext(!isXNext);
    setStepNumber(newHistory.length - 1);
    setHistory(newHistory);
  }

  // PUBLIC_INTERFACE
  function jumpTo(step) {
    /**
     * Allows time travel within game history (not exposed in UI for now).
     */
    setStepNumber(step);
    setBoard(history[step]);
    setIsXNext(step % 2 === 0);
    setWinner(null);
    setGameOver(false);
  }

  // Simple computer move: pick winning move, then block, then center, then corner, then random.
  // PUBLIC_INTERFACE
  function computerMove(squares) {
    /**
     * Implements a very basic AI for the computer's move:
     * - Win if possible
     * - Block opponent's win
     * - Otherwise, follow a priority list (center > corners > random)
     * Returns the index to move.
     */
    const ai = "O";
    const user = "X";

    // Win?
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        const clone = squares.slice();
        clone[i] = ai;
        if (calculateWinner(clone) === ai) return i;
      }
    }
    // Block?
    for (let i = 0; i < 9; i++) {
      if (!squares[i]) {
        const clone = squares.slice();
        clone[i] = user;
        if (calculateWinner(clone) === user) return i;
      }
    }
    // Center?
    if (!squares[4]) return 4;
    // Corners?
    const corners = [0, 2, 6, 8];
    const openCorners = corners.filter((i) => !squares[i]);
    if (openCorners.length > 0) return openCorners[Math.floor(Math.random() * openCorners.length)];
    // Sides?
    const sides = [1, 3, 5, 7];
    const openSides = sides.filter((i) => !squares[i]);
    if (openSides.length > 0) return openSides[Math.floor(Math.random() * openSides.length)];
    // Shouldn't reach here
    return null;
  }

  // PUBLIC_INTERFACE
  function handleModeChange(e) {
    /**
     * Handles switching between PVP and PVC mode and resets the game.
     */
    setMode(e.target.value);
    handleNewGame(e.target.value, true);
  }

  // PUBLIC_INTERFACE
  function handleNewGame(newMode = mode, fromModeChange = false) {
    /**
     * Starts a new game, optionally alternating the first player.
     */
    let nextStart =
      fromModeChange || startingPlayer === "O" ? "X" : "O";
    setStartingPlayer(nextStart);
    setBoard(emptyBoard);
    setHistory([emptyBoard]);
    setStepNumber(0);
    setIsXNext(nextStart === "X");
    setWinner(null);
    setStatus("Next: " + nextStart);
    setGameOver(false);
    if (newMode === "PVC" && nextStart === "O") {
      // Computer goes first
      setTimeout(() => {
        computerMoveHandler(emptyBoard, false);
      }, 500);
    }
  }

  // PUBLIC_INTERFACE
  function handleResetScores() {
    /**
     * Resets the scoreboard to all zeros. Does not reset the board.
     */
    setScores({ X: 0, O: 0, Draws: 0 });
  }

  // Computer AI: play after player's move
  useEffect(() => {
    if (
      mode === "PVC" &&
      !winner &&
      !gameOver &&
      !isXNext // Computer plays as "O"
    ) {
      setTimeout(() => {
        computerMoveHandler(board, true);
      }, 500);
    }
    // eslint-disable-next-line
  }, [board, isXNext, winner, mode, gameOver]);

  // PUBLIC_INTERFACE
  function computerMoveHandler(currBoard, updateBoard = true) {
    const moveIndex = computerMove(currBoard);
    if (moveIndex !== null && !currBoard[moveIndex]) {
      const newBoard = currBoard.slice();
      newBoard[moveIndex] = "O";
      const newHistory = [...history.slice(0, stepNumber + 1), newBoard];
      if (updateBoard) {
        setBoard(newBoard);
        setIsXNext(true);
        setStepNumber(newHistory.length - 1);
        setHistory(newHistory);
      }
    }
  }

  // Update winner, game over, status, and scores after every move
  useEffect(() => {
    const win = calculateWinner(board);
    const draw = isDraw(board);

    if (win) {
      setWinner(win);
      setStatus(`Winner: ${win}`);
      setScores((s) => ({ ...s, [win]: s[win] + 1 }));
      setGameOver(true);
    } else if (draw) {
      setWinner(null);
      setStatus("Draw!");
      setScores((s) => ({ ...s, Draws: s.Draws + 1 }));
      setGameOver(true);
    } else {
      setWinner(null);
      setGameOver(false);
      setStatus(`Next: ${isXNext ? "X" : "O"}`);
    }
    // eslint-disable-next-line
  }, [board]);

  // --- Component UI ---

  return (
    <div className="App" style={{ minHeight: "100vh" }}>
      <div className="ttt-outer-container">
        <h1 className="ttt-title">Tic Tac Toe Arena</h1>
        <ModeSelector mode={mode} onChange={handleModeChange} />
        <div className="ttt-main-panel">
          <ScorePanel scores={scores} />
          <div className="ttt-board-panel">
            <GameStatus
              status={status}
              winner={winner}
              mode={mode}
              isXNext={isXNext}
              startingPlayer={startingPlayer}
            />
            <Board
              squares={board}
              onClick={handleClick}
              disabled={!!winner || gameOver}
              winningLine={winner ? getWinningLine(board) : []}
            />
            <ControlPanel
              onReset={handleNewGame}
              onResetScores={handleResetScores}
              mode={mode}
            />
          </div>
        </div>
      </div>
      <TTTStyles />
      <Assistant
        board={board}
        isXNext={isXNext}
        winner={winner}
        gameOver={gameOver}
        mode={mode}
        // Assistant suggestion logic (uses core AI, but picks for the "current user")
        suggestMove={(b, player) => {
          // We must reuse the same logic used in game AI, but allow for X or O (user may ask at any point)
          // Helper: try to find winning, block, center, corners, or side
          const opp = player === "X" ? "O" : "X";
          // Try winning move for player
          for (let i = 0; i < 9; i++) {
            if (!b[i]) {
              const clone = b.slice();
              clone[i] = player;
              if (calculateWinner(clone) === player) return i;
            }
          }
          // Block opponent's win
          for (let i = 0; i < 9; i++) {
            if (!b[i]) {
              const clone = b.slice();
              clone[i] = opp;
              if (calculateWinner(clone) === opp) return i;
            }
          }
          // Center
          if (!b[4]) return 4;
          // Corners
          const corners = [0, 2, 6, 8],
            openCorners = corners.filter((i) => !b[i]);
          if (openCorners.length) return openCorners[0];
          // Sides
          const sides = [1, 3, 5, 7],
            openSides = sides.filter((i) => !b[i]);
          if (openSides.length) return openSides[0];
          // Board full
          return null;
        }}
      />
    </div>
  );
}

// ----- UI Components -----

// PUBLIC_INTERFACE
function Board({ squares, onClick, disabled, winningLine }) {
  /**
   * Renders the 3x3 board UI.
   */
  function renderSquare(i) {
    const isWinnerSq = winningLine && winningLine.includes(i);
    return (
      <button
        key={i}
        className={
          "ttt-square" +
          (isWinnerSq ? " winner" : "") +
          (squares[i] ? " filled" : "")
        }
        style={{
          color: squares[i] === "X" ? "#1976d2" : squares[i] === "O" ? "#424242" : undefined,
          cursor: squares[i] || disabled ? "default" : "pointer",
        }}
        onClick={() => {
          if (!squares[i] && !disabled) onClick(i);
        }}
        tabIndex={0}
        aria-label={`Square ${i + 1} ${squares[i] ? "occupied by " + squares[i] : ""}`}
      >
        {squares[i]}
      </button>
    );
  }
  return (
    <div className="ttt-board">
      {[0, 1, 2].map((row) => (
        <div className="ttt-row" key={row}>
          {[
            renderSquare(row * 3 + 0),
            renderSquare(row * 3 + 1),
            renderSquare(row * 3 + 2),
          ]}
        </div>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function ModeSelector({ mode, onChange }) {
  /**
   * Renders the human-vs-computer and human-vs-human mode selection controls.
   */
  return (
    <div className="ttt-mode-selector">
      <label>
        <input
          type="radio"
          name="ttt-mode"
          value="PVC"
          checked={mode === "PVC"}
          onChange={onChange}
        />
        Human vs Computer
      </label>
      <label>
        <input
          type="radio"
          name="ttt-mode"
          value="PVP"
          checked={mode === "PVP"}
          onChange={onChange}
        />
        Two Players
      </label>
    </div>
  );
}

// PUBLIC_INTERFACE
function ScorePanel({ scores }) {
  /**
   * Displays the running score for X, O, and draws.
   */
  return (
    <div className="ttt-score-panel">
      <span className="score-x">
        X: <strong>{scores.X}</strong>
      </span>
      <span className="score-o">
        O: <strong>{scores.O}</strong>
      </span>
      <span className="score-draw">
        Draws: <strong>{scores.Draws}</strong>
      </span>
    </div>
  );
}

// PUBLIC_INTERFACE
function GameStatus({ status, winner, mode, isXNext, startingPlayer }) {
  /**
   * Shows current game status, winner, and player to move.
   */
  // Add description text depending on mode
  let desc = "";
  if (winner) {
    desc = winner === "X"
      ? "X wins!"
      : winner === "O"
        ? "O wins!"
        : "";
  } else if (status === "Draw!") {
    desc = "It's a draw!";
  } else {
    desc =
      mode === "PVC"
        ? isXNext
          ? "Your turn (X)"
          : "Computer's turn (O)"
        : `Player ${isXNext ? "X" : "O"}'s turn`;
  }

  return (
    <div className="ttt-status-panel">
      <span className="ttt-status">{desc}</span>
    </div>
  );
}

// PUBLIC_INTERFACE
function ControlPanel({ onReset, onResetScores }) {
  /**
   * Control buttons for new game (reset board) and reset scores.
   */
  return (
    <div className="ttt-controls">
      <button className="ttt-btn ttt-btn-accent" onClick={() => onReset()}>
        New Game
      </button>
      <button className="ttt-btn ttt-btn-outline" onClick={onResetScores}>
        Reset Scores
      </button>
    </div>
  );
}

// PUBLIC_INTERFACE
function getWinningLine(squares) {
  /**
   * Returns the array of the winning line indices if any, or [].
   */
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // columns
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return [a, b, c];
    }
  }
  return [];
}

// PUBLIC_INTERFACE
function TTTStyles() {
  /**
   * Adds modern, minimalistic styles scoped for the Tic Tac Toe Arena.
   * Uses the requested palette: accent (#ffcf33), primary (#1976d2), secondary (#424242)
   */
  return (
    <style>{`
    .ttt-outer-container {
      max-width: 480px;
      margin: 0 auto;
      padding: 24px 16px 40px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      min-height: 100vh;
      background: var(--bg-primary, #fff);
    }
    .ttt-title {
      font-size: 2.2rem;
      font-weight: 700;
      letter-spacing: -0.6px;
      margin: 0 0 20px 0;
      color: #1976d2;
      text-align: center;
    }
    .ttt-main-panel {
      display: flex;
      flex-direction: column;
      gap: 24px;
      width: 100%;
      align-items: center;
    }
    .ttt-board-panel {
      background: #f8f9fa;
      padding: 20px 16px;
      border-radius: 16px;
      box-shadow: 0 2px 16px 0 rgba(0,0,0,0.07);
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 350px;
    }
    .ttt-mode-selector {
      display: flex;
      gap: 18px;
      margin: 0 auto 16px auto;
      justify-content: center;
    }
    .ttt-mode-selector label {
      font-weight: 500;
      font-size: 1rem;
      cursor: pointer;
      color: #424242;
    }
    .ttt-mode-selector input[type="radio"] {
      accent-color: #1976d2;
      margin-right: 4px;
      vertical-align: middle;
    }
    .ttt-score-panel {
      display: flex;
      gap: 16px;
      justify-content: center;
      font-size: 1.1rem;
      margin-bottom: 10px;
      text-align: center;
    }
    .score-x { color: #1976d2; font-weight: 600; }
    .score-o { color: #424242; font-weight: 600; }
    .score-draw { color: #ffcf33; font-weight: 600; }
    .ttt-status-panel {
      min-height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      margin: 14px 0 10px 0;
      color: #1976d2;
      font-weight: 500;
    }
    .ttt-controls {
      display: flex;
      gap: 10px;
      margin-top: 10px;
      justify-content: center;
      width: 100%;
    }
    .ttt-btn {
      font-size: 1rem;
      padding: 8px 20px;
      border-radius: 8px;
      font-weight: 600;
      outline: none;
      border: none;
      cursor: pointer;
      transition: all 0.14s;
      background: #1976d2;
      color: #fff;
      border: 2px solid #1976d2;
      min-width: 110px;
    }
    .ttt-btn-accent {
      background: #ffcf33;
      color: #282c34;
      border: 2px solid #ffcf33;
    }
    .ttt-btn-outline {
      background: #fff;
      color: #1976d2;
      border: 2px solid #1976d2;
    }
    .ttt-btn:hover, .ttt-btn-accent:hover, .ttt-btn-outline:hover {
      opacity: 0.93;
      filter: brightness(0.96);
      box-shadow: 0 6px 16px 0 rgba(31, 38, 135, 0.10);
    }
    .ttt-board {
      display: flex;
      flex-direction: column;
      background: #fff;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      box-shadow: 0 1.5px 7px 0 rgba(31, 38, 135, 0.04);
      overflow: hidden;
      width: 270px;
      max-width: 96vw;
      margin: 0 auto;
      aspect-ratio: 1/1;
      align-items: center;
      user-select: none;
    }
    .ttt-row {
      display: flex;
      flex-direction: row;
      width: 100%;
      height: 33.3333%;
    }
    .ttt-square {
      outline: none;
      border: none;
      border-right: 2px solid #e9ecef;
      border-bottom: 2px solid #e9ecef;
      background: transparent;
      font-size: 2.8rem;
      font-weight: 700;
      width: 90px;
      height: 90px;
      max-width: 32vw;
      max-height: 32vw;
      text-align: center;
      vertical-align: middle;
      line-height: 90px;
      transition: background 0.1s, box-shadow 0.18s;
      color: #1976d2;
      z-index: 2;
      cursor: pointer;
    }
    .ttt-square:nth-child(3n) {
      border-right: none;
    }
    .ttt-row:last-child .ttt-square {
      border-bottom: none;
    }
    .ttt-square.filled {
      cursor: default;
      opacity: 0.98;
    }
    .ttt-square.winner {
      background: #ffcf33;
      color: #424242;
      box-shadow: 0 0 8px #ffcf33bb;
      z-index: 4;
    }
    @media (max-width: 900px) {
      .ttt-outer-container {
        max-width: 100vw;
        padding: 8vw 5vw 24vw 5vw;
      }
      .ttt-title {
        font-size: 1.35rem;
      }
      .ttt-board-panel {
        max-width: 99vw;
        padding: 8vw 2vw;
      }
      .ttt-board {
        width: 97vw;
        max-width: 99vw;
      }
      .ttt-square {
        width: 29vw;
        height: 29vw;
        font-size: 9vw;
      }
    }
    @media (max-width: 520px) {
      .ttt-board-panel {
        padding: 6vw 1vw;
      }
      .ttt-main-panel {
        gap: 10vw;
      }
      .ttt-outer-container {
        padding: 0vw 2vw 20vw 2vw;
      }
    }
  `}</style>
  );
}

export default App;
