import React, { useState } from "react";

// Helper function to decode HTML entities
const decodeHtmlEntity = (str) => {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = str;
  return textarea.value;
};

// Mock data for fallback in case the API fails
const mockQuestions = [
  {
    question: "What is the capital of France?",
    correct_answer: "Paris",
    incorrect_answers: ["Berlin", "Madrid", "Rome"],
  },
  {
    question: "Which planet is known as the Red Planet?",
    correct_answer: "Mars",
    incorrect_answers: ["Earth", "Jupiter", "Venus"],
  },
  {
    question: "Who wrote 'To Kill a Mockingbird'?",
    correct_answer: "Harper Lee",
    incorrect_answers: ["Mark Twain", "J.K. Rowling", "Ernest Hemingway"],
  },
];

// Map category names to OpenTDB numeric IDs
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

function App() {
  const [quizParams, setQuizParams] = useState({
    amount: 5,
    category: "any",
    difficulty: "any",
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shuffleArray = (array) => {
    const cloned = [...array];
    for (let i = cloned.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
    }
    return cloned;
  };

  const fetchQuestions = async () => {
    setLoading(true);
    setError("");
    const { amount, category, difficulty } = quizParams;
    const categoryId = categoryMapping[category] || "";
    const url = `https://opentdb.com/api.php?amount=${amount}&category=${categoryId}&difficulty=${
      difficulty === "any" ? "" : difficulty
    }&type=multiple`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }
      const data = await response.json();
      if (data.results) {
        const formattedQuestions = data.results.map((q) => ({
          ...q,
          question: decodeHtmlEntity(q.question),
          correct_answer: decodeHtmlEntity(q.correct_answer),
          incorrect_answers: q.incorrect_answers.map(decodeHtmlEntity),
          answers: shuffleArray([
            ...q.incorrect_answers.map(decodeHtmlEntity),
            decodeHtmlEntity(q.correct_answer),
          ]),
        }));
        setQuestions(formattedQuestions);
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to fetch questions. Using mock data.");
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

  const handleStartQuiz = (event) => {
    event.preventDefault();
    if (quizParams.amount < 1 || quizParams.amount > 20) {
      setError("Please select between 1 and 20 questions.");
      return;
    }
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setFeedbackMessage("");
    setShowResults(false);
    fetchQuestions();
  };

  const handleAnswer = (answer, correctAnswer) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);

    if (answer === correctAnswer) {
      setScore((prevScore) => prevScore + 1);
      setFeedbackMessage("Correct! 🎉 Great choice.");
    } else {
      setFeedbackMessage(`Wrong — the correct answer was "${correctAnswer}".`);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setFeedbackMessage("");
    } else {
      setShowResults(true);
    }
  };

  const resetQuiz = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResults(false);
    setSelectedAnswer(null);
    setFeedbackMessage("");
    setError("");
  };

  return (
    <div className="app-wrapper">
      <div className="quiz-card">
        {!questions.length && !showResults ? (
          <div className="start-screen">
            <div className="badge">Interactive Quiz</div>
            <h1 className="section-title">Ready for a quick challenge?</h1>
            <p className="subtitle">
              Pick your preferences and launch a quiz with instant feedback.
            </p>

            <form onSubmit={handleStartQuiz} className="controls-grid">
              <div className="control-group">
                <label htmlFor="amount">Number of Questions</label>
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
                <div className="hint">
                  Answer {quizParams.amount} question
                  {quizParams.amount !== 1 ? "s" : ""} in one session.
                </div>
              </div>

              <div className="control-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={quizParams.category}
                  onChange={(e) =>
                    setQuizParams({ ...quizParams, category: e.target.value })
                  }
                  className="select-field"
                >
                  <option value="any">Any Category</option>
                  <option value="General Knowledge">General Knowledge</option>
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
                    Entertainment: Musicals & Theatres
                  </option>
                  <option value="Entertainment: Television">
                    Entertainment: Television
                  </option>
                  <option value="Entertainment: Video Games">
                    Entertainment: Video Games
                  </option>
                  <option value="Entertainment: Board Games">
                    Entertainment: Board Games
                  </option>
                  <option value="Science & Nature">Science & Nature</option>
                  <option value="Science: Computers">Science: Computers</option>
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
                  <option value="Entertainment: Comics">
                    Entertainment: Comics
                  </option>
                  <option value="Science: Gadgets">Science: Gadgets</option>
                  <option value="Entertainment: Japanese Anime & Manga">
                    Entertainment: Japanese Anime & Manga
                  </option>
                  <option value="Entertainment: Cartoon & Animations">
                    Entertainment: Cartoon & Animations
                  </option>
                </select>
              </div>

              <div className="control-group">
                <label htmlFor="difficulty">Difficulty</label>
                <select
                  id="difficulty"
                  value={quizParams.difficulty}
                  onChange={(e) =>
                    setQuizParams({ ...quizParams, difficulty: e.target.value })
                  }
                  className="select-field"
                >
                  <option value="any">Any Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <button
                type="submit"
                className="button button-primary full-width"
              >
                Start Quiz
              </button>
              {error && <p className="error-message">{error}</p>}
            </form>
          </div>
        ) : showResults ? (
          <div className="results-screen">
            <div className="badge badge-success">Finished</div>
            <h1 className="section-title">Quiz Completed! 🎉</h1>
            <p className="subtitle">
              You scored {score} out of {questions.length} correct.
            </p>
            <div className="result-metrics">
              <span className="metric-card">Questions: {questions.length}</span>
              <span className="metric-card">Points: {score}</span>
            </div>
            <button onClick={resetQuiz} className="button button-primary">
              Restart Quiz
            </button>
          </div>
        ) : (
          <div className="question-screen">
            <div className="quiz-header">
              <div>
                <p className="meta-label">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </p>
                <h2 className="question-title">
                  {questions[currentQuestionIndex].question}
                </h2>
              </div>
              <div className="score-chip">Score: {score}</div>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              />
            </div>

            <div className="answers-grid">
              {questions[currentQuestionIndex].answers.map((answer, index) => {
                const isCorrect =
                  answer === questions[currentQuestionIndex].correct_answer;
                const isSelected = selectedAnswer === answer;
                const isDisabled = selectedAnswer !== null;
                let answerClass = "answer-button";

                if (isDisabled) {
                  if (isSelected && isCorrect) answerClass += " correct";
                  else if (isSelected && !isCorrect)
                    answerClass += " incorrect";
                  else if (isCorrect) answerClass += " correct";
                  else answerClass += " disabled";
                }

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      handleAnswer(
                        answer,
                        questions[currentQuestionIndex].correct_answer,
                      )
                    }
                    disabled={isDisabled}
                    className={answerClass}
                  >
                    {answer}
                  </button>
                );
              })}
            </div>

            {feedbackMessage && (
              <div className="feedback">{feedbackMessage}</div>
            )}

            <div className="actions-row">
              <button
                type="button"
                onClick={resetQuiz}
                className="button button-secondary"
              >
                Start Over
              </button>
              {selectedAnswer !== null && (
                <button
                  type="button"
                  onClick={goToNextQuestion}
                  className="button button-primary"
                >
                  {currentQuestionIndex + 1 < questions.length
                    ? "Next Question"
                    : "Finish Quiz"}
                </button>
              )}
            </div>
          </div>
        )}

        {loading && (
          <div className="loader-overlay">
            <div className="loader" />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
