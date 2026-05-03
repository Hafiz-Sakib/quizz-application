import React, { useState } from "react";
import "./App.css";

const decodeHtmlEntity = (str) => {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = str;
  return textarea.value;
};

const mockQuestions = [
  {
    question: "What is the capital of France?",
    correct_answer: "Paris",
    incorrect_answers: ["Berlin", "Madrid", "Rome"],
    difficulty: "easy",
    category: "Geography",
  },
  {
    question: "Which planet is known as the Red Planet?",
    correct_answer: "Mars",
    incorrect_answers: ["Earth", "Jupiter", "Venus"],
    difficulty: "easy",
    category: "Science & Nature",
  },
  {
    question: "Who wrote 'To Kill a Mockingbird'?",
    correct_answer: "Harper Lee",
    incorrect_answers: ["Mark Twain", "J.K. Rowling", "Ernest Hemingway"],
    difficulty: "medium",
    category: "Entertainment: Books",
  },
];

const categoryMapping = {
  any: "",
  "General Knowledge": "9",
  "Entertainment: Books": "10",
  "Entertainment: Film": "11",
  "Entertainment: Music": "12",
  "Entertainment: Musicals & Theatres": "13",
  "Entertainment: Television": "14",
  "Entertainment: Video Games": "15",
  "Entertainment: Board Games": "16",
  "Science & Nature": "17",
  "Science: Computers": "18",
  "Science: Mathematics": "19",
  Mythology: "20",
  Sports: "21",
  Geography: "22",
  History: "23",
  Politics: "24",
  Art: "25",
  Celebrities: "26",
  Animals: "27",
  Vehicles: "28",
  "Entertainment: Comics": "29",
  "Science: Gadgets": "30",
  "Entertainment: Japanese Anime & Manga": "31",
  "Entertainment: Cartoon & Animations": "32",
};

const LABELS = ["A", "B", "C", "D"];

const getGrade = (score, total) => {
  const pct = (score / total) * 100;
  if (pct === 100)
    return { label: "Perfect Score!", cls: "grade-perfect", emoji: "🏆" };
  if (pct >= 75)
    return { label: "Great Job!", cls: "grade-great", emoji: "🌟" };
  if (pct >= 50) return { label: "Not Bad", cls: "grade-ok", emoji: "👍" };
  return { label: "Keep Practicing", cls: "grade-poor", emoji: "💪" };
};

function App() {
  const [quizParams, setQuizParams] = useState({
    amount: 5,
    category: "any",
    difficulty: "any",
  });
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null); // { correct: bool, message: str }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError("");
    const { amount, category, difficulty } = quizParams;
    const catId = categoryMapping[category] || "";
    const diff = difficulty === "any" ? "" : difficulty;
    const url = `https://opentdb.com/api.php?amount=${amount}&category=${catId}&difficulty=${diff}&type=multiple`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network error");
      const data = await res.json();
      if (!data.results?.length) throw new Error("No questions returned");
      const formatted = data.results.map((q) => ({
        ...q,
        question: decodeHtmlEntity(q.question),
        correct_answer: decodeHtmlEntity(q.correct_answer),
        incorrect_answers: q.incorrect_answers.map(decodeHtmlEntity),
        answers: shuffleArray([
          ...q.incorrect_answers.map(decodeHtmlEntity),
          decodeHtmlEntity(q.correct_answer),
        ]),
      }));
      setQuestions(formatted);
    } catch (err) {
      console.error(err);
      setError(
        "Couldn't reach the quiz server — using sample questions instead.",
      );
      setQuestions(
        mockQuestions.map((q) => ({
          ...q,
          answers: shuffleArray([...q.incorrect_answers, q.correct_answer]),
        })),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStart = (e) => {
    e.preventDefault();
    if (quizParams.amount < 1 || quizParams.amount > 20) {
      setError("Choose between 1 and 20 questions.");
      return;
    }
    setCurrentIdx(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setShowResults(false);
    fetchQuestions();
  };

  const handleAnswer = (answer) => {
    if (selected) return;
    setSelected(answer);
    const correct = answer === questions[currentIdx].correct_answer;
    if (correct) {
      setScore((s) => s + 1);
      setFeedback({ correct: true, message: "That's correct! Well done." });
    } else {
      setFeedback({
        correct: false,
        message: `Incorrect. The right answer was "${questions[currentIdx].correct_answer}".`,
      });
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1);
      setSelected(null);
      setFeedback(null);
    } else {
      setShowResults(true);
    }
  };

  const reset = () => {
    setQuestions([]);
    setCurrentIdx(0);
    setScore(0);
    setShowResults(false);
    setSelected(null);
    setFeedback(null);
    setError("");
  };

  const currentQ = questions[currentIdx];
  const grade = showResults ? getGrade(score, questions.length) : null;

  return (
    <div className="app-wrapper">
      <div className="quiz-card">
        {/* Top bar */}
        <div className="card-topbar">
          <div className="topbar-brand">
            <div className="brand-dot" />
            QuizPro
          </div>
          <div className="topbar-badge">✦ Premium</div>
        </div>

        <div className="card-body">
          {/* ── START SCREEN ── */}
          {!questions.length && !showResults && (
            <div className="start-screen">
              <div className="screen-eyebrow">
                <div className="eyebrow-line" />
                Knowledge Challenge
                <div className="eyebrow-line" />
              </div>

              <h1 className="screen-title">
                Test your <span>limits</span>.
              </h1>
              <p className="screen-subtitle">
                Pick your settings and take on a curated quiz. Instant feedback,
                real-time scoring, and a detailed summary await.
              </p>

              <form onSubmit={handleStart} className="controls-grid">
                <div className="control-group">
                  <label htmlFor="amount">No. of Questions</label>
                  <input
                    id="amount"
                    type="number"
                    min="1"
                    max="20"
                    value={quizParams.amount}
                    onChange={(e) =>
                      setQuizParams({
                        ...quizParams,
                        amount: Number(e.target.value),
                      })
                    }
                    className="input-field"
                  />
                  <span className="hint-text">
                    {quizParams.amount} question
                    {quizParams.amount !== 1 ? "s" : ""} per session
                  </span>
                </div>

                <div className="control-group">
                  <label htmlFor="difficulty">Difficulty</label>
                  <div className="select-wrapper">
                    <select
                      id="difficulty"
                      value={quizParams.difficulty}
                      onChange={(e) =>
                        setQuizParams({
                          ...quizParams,
                          difficulty: e.target.value,
                        })
                      }
                      className="select-field"
                    >
                      <option value="any">Any Difficulty</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="control-group" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="category">Category</label>
                  <div className="select-wrapper">
                    <select
                      id="category"
                      value={quizParams.category}
                      onChange={(e) =>
                        setQuizParams({
                          ...quizParams,
                          category: e.target.value,
                        })
                      }
                      className="select-field"
                    >
                      <option value="any">Any Category</option>
                      <option value="General Knowledge">
                        General Knowledge
                      </option>
                      <option value="Entertainment: Books">
                        Entertainment: Books
                      </option>
                      <option value="Entertainment: Film">
                        Entertainment: Film
                      </option>
                      <option value="Entertainment: Music">
                        Entertainment: Music
                      </option>
                      <option value="Entertainment: Musicals & Theatres">
                        Musicals & Theatres
                      </option>
                      <option value="Entertainment: Television">
                        Entertainment: Television
                      </option>
                      <option value="Entertainment: Video Games">
                        Video Games
                      </option>
                      <option value="Entertainment: Board Games">
                        Board Games
                      </option>
                      <option value="Science & Nature">Science & Nature</option>
                      <option value="Science: Computers">
                        Science: Computers
                      </option>
                      <option value="Science: Mathematics">
                        Science: Mathematics
                      </option>
                      <option value="Mythology">Mythology</option>
                      <option value="Sports">Sports</option>
                      <option value="Geography">Geography</option>
                      <option value="History">History</option>
                      <option value="Politics">Politics</option>
                      <option value="Art">Art</option>
                      <option value="Celebrities">Celebrities</option>
                      <option value="Animals">Animals</option>
                      <option value="Vehicles">Vehicles</option>
                      <option value="Entertainment: Comics">Comics</option>
                      <option value="Science: Gadgets">Science: Gadgets</option>
                      <option value="Entertainment: Japanese Anime & Manga">
                        Anime & Manga
                      </option>
                      <option value="Entertainment: Cartoon & Animations">
                        Cartoons & Animations
                      </option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ gridColumn: "1 / -1" }}
                >
                  <svg
                    className="btn-icon"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon
                      points="5,3 19,10 5,17"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>
                  Launch Quiz
                </button>

                {error && <div className="error-message">{error}</div>}
              </form>
            </div>
          )}

          {/* ── QUESTION SCREEN ── */}
          {questions.length > 0 && !showResults && currentQ && (
            <div className="question-screen">
              <div className="q-topbar">
                <div className="q-counter">
                  Question <strong>{currentIdx + 1}</strong> /{" "}
                  {questions.length}
                </div>
                <div className="score-pill">
                  <span className="score-icon">⚡</span>
                  Score: {score}
                </div>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${((currentIdx + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>

              {currentQ.difficulty && currentQ.difficulty !== "any" && (
                <div className={`difficulty-tag ${currentQ.difficulty}`}>
                  {currentQ.difficulty === "easy" && "● "}
                  {currentQ.difficulty === "medium" && "●● "}
                  {currentQ.difficulty === "hard" && "●●● "}
                  {currentQ.difficulty}
                </div>
              )}

              <h2 className="question-text">{currentQ.question}</h2>

              <div className="answers-grid">
                {currentQ.answers.map((answer, i) => {
                  const isCorrect = answer === currentQ.correct_answer;
                  const isSelected = selected === answer;
                  let cls = "answer-btn";
                  if (selected) {
                    if (isCorrect) cls += " correct";
                    else if (isSelected) cls += " incorrect";
                    else cls += " dimmed";
                  }
                  return (
                    <button
                      key={i}
                      className={cls}
                      onClick={() => handleAnswer(answer)}
                      disabled={!!selected}
                      type="button"
                    >
                      <span className="answer-label">{LABELS[i]}</span>
                      {answer}
                    </button>
                  );
                })}
              </div>

              {feedback && (
                <div
                  className={`feedback-box ${feedback.correct ? "correct-fb" : "wrong-fb"}`}
                >
                  <span className="feedback-icon">
                    {feedback.correct ? "✓" : "✗"}
                  </span>
                  {feedback.message}
                </div>
              )}

              <div className="actions-row">
                <button type="button" onClick={reset} className="btn btn-ghost">
                  ← Start Over
                </button>
                {selected && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn btn-primary"
                    style={{ width: "auto" }}
                  >
                    {currentIdx + 1 < questions.length
                      ? "Next Question"
                      : "See Results"}
                    <svg
                      className="btn-icon"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        d="M7 4l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── RESULTS SCREEN ── */}
          {showResults && grade && (
            <div className="results-screen">
              <span className="results-trophy">{grade.emoji}</span>

              <div className={`results-grade ${grade.cls}`}>{grade.label}</div>

              <h1 className="screen-title">Quiz Complete</h1>
              <p className="screen-subtitle">
                You answered{" "}
                <strong style={{ color: "var(--white)" }}>
                  {score} out of {questions.length}
                </strong>{" "}
                questions correctly.
              </p>

              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-value accent">{questions.length}</div>
                  <div className="stat-label">Questions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value success">{score}</div>
                  <div className="stat-label">Correct</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value gold">
                    {Math.round((score / questions.length) * 100)}%
                  </div>
                  <div className="stat-label">Accuracy</div>
                </div>
              </div>

              <div className="results-actions">
                <button onClick={reset} className="btn btn-primary">
                  <svg
                    className="btn-icon"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Play Again
                </button>
                <button onClick={reset} className="btn btn-ghost">
                  Change Settings
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="loader-overlay">
            <div className="loader-ring" />
            <span className="loader-text">Fetching questions…</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
