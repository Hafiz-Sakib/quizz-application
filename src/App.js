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
    category: "any", // Default to "any"
    difficulty: "any",
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null); // Track the selected answer
  const [feedbackMessage, setFeedbackMessage] = useState(""); // Feedback message for correct/wrong answers
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error message

  // Fetch questions from OpenTDB API
  const fetchQuestions = async () => {
    setLoading(true);
    setError("");
    const { amount, category, difficulty } = quizParams;

    // Map the category name to its numeric ID
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
        // Shuffle answers for each question and decode HTML entities
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
        }))
      );
    } finally {
      setLoading(false);
    }
  };

  // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Handle answer selection
  const handleAnswer = (answer, correctAnswer) => {
    setSelectedAnswer(answer); // Set the selected answer

    // Provide feedback (Correct/Wrong)
    if (answer === correctAnswer) {
      setScore(score + 1);
      setFeedbackMessage("Correct! 🎉");
    } else {
      setFeedbackMessage("Wrong! ❌");
    }

    // Check if the answer is correct and update the score
    if (answer === correctAnswer) {
      setScore(score + 1);
    }
  };

  // Move to the next question when "Next" button is clicked
  const goToNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null); // Reset selected answer
      setFeedbackMessage(""); // Clear feedback message
    } else {
      setShowResults(true); // Show results if all questions are answered
    }
  };

  // Reset quiz
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
    <div className="bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-3xl w-full animate-fade-in">
        {!questions.length && !showResults ? (
          <div>
            <h1 className="text-4xl font-bold text-center mb-6 text-blue-600">
              Quiz Settings
            </h1>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchQuestions();
              }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Number of Questions (Max 20)
                </label>
                <input
                  type="number"
                  name="amount"
                  min="1"
                  max="20"
                  defaultValue="5"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  onChange={(e) =>
                    setQuizParams({ ...quizParams, category: e.target.value })
                  }
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
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  onChange={(e) =>
                    setQuizParams({ ...quizParams, difficulty: e.target.value })
                  }
                >
                  <option value="any">Any Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out"
              >
                Start Quiz
              </button>
              {error && (
                <p className="text-red-500 text-center mt-4">{error}</p>
              )}
            </form>
          </div>
        ) : showResults ? (
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-600 mb-4">
              Quiz Completed ! 🎯
            </h1>
            <p className="text-xl text-gray-700 mb-6">
              You scored {score} out of {questions.length}!
            </p>
            <button
              onClick={resetQuiz}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out"
            >
              Restart Quiz
            </button>
          </div>
        ) : (
          <div>
            {/* Progress Bar Indicator */}
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{
                    width: `${
                      ((currentQuestionIndex + 1) / questions.length) * 100
                    }%`,
                  }}
                ></div>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-blue-600 mb-4">
              Question {currentQuestionIndex + 1}
            </h1>
            <p className="text-gray-700 mb-6">
              {questions[currentQuestionIndex].question}
            </p>
            <div className="space-y-2">
              {questions[currentQuestionIndex].answers.map((answer, index) => (
                <button
                  key={index}
                  onClick={() =>
                    handleAnswer(
                      answer,
                      questions[currentQuestionIndex].correct_answer
                    )
                  }
                  disabled={selectedAnswer !== null} // Disable buttons after an answer is selected
                  className={`w-full py-3 px-4 rounded-lg focus:outline-none transition duration-300 ease-in-out ${
                    selectedAnswer === answer
                      ? answer ===
                        questions[currentQuestionIndex].correct_answer
                        ? "bg-green-500 text-white scale-105 transform" // Correct answer
                        : "bg-red-500 text-white scale-105 transform" // Incorrect answer
                      : answer ===
                          questions[currentQuestionIndex].correct_answer &&
                        selectedAnswer !== null
                      ? "bg-green-500 text-white scale-105 transform" // Highlight correct answer if user selects wrong one
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300 hover:scale-105 transform" // Default state
                  }`}
                >
                  {answer}
                </button>
              ))}
            </div>

            {/* Feedback Message */}
            {feedbackMessage && (
              <p className="text-center mt-4 text-lg font-semibold text-blue-600">
                {feedbackMessage}
              </p>
            )}

            {/* Next Button */}
            {selectedAnswer !== null && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={goToNextQuestion}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                >
                  {currentQuestionIndex + 1 < questions.length
                    ? "Next Question"
                    : "Finish Quiz"}
                </button>
              </div>
            )}
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
