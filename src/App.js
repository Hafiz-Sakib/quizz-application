import React, { useState } from "react";

// Helper function to decode HTML entities
const decodeHtmlEntity = (str) => {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = str;
  return textarea.value;
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
  const [selectedAnswer, setSelectedAnswer] = useState(null); // Track the selected answer

  // Fetch questions from OpenTDB API
  const fetchQuestions = async () => {
    const { amount, category, difficulty } = quizParams;
    const url = `https://opentdb.com/api.php?amount=${amount}&category=${
      category === "any" ? "" : category
    }&difficulty=${difficulty === "any" ? "" : difficulty}&type=multiple`;
    try {
      const response = await fetch(url);
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
    } catch (error) {
      console.error("Error fetching questions:", error);
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
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl w-full">
        {!questions.length && !showResults ? (
          <div>
            <h1 className="text-3xl font-bold text-center mb-6">
              Quiz Settings
            </h1>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setQuizParams({
                  amount: parseInt(e.target.amount.value),
                  category: e.target.category.value,
                  difficulty: e.target.difficulty.value,
                });
                fetchQuestions();
              }}
              className="space-y-4"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="any">Any Category</option>
                  <option value="9">General Knowledge</option>
                  <option value="10">Entertainment: Books</option>
                  <option value="11">Entertainment: Film</option>
                  <option value="12">Entertainment: Music</option>
                  <option value="13">Entertainment: Musicals & Theatres</option>
                  <option value="14">Entertainment: Television</option>
                  <option value="15">Entertainment: Video Games</option>
                  <option value="16">Entertainment: Board Games</option>
                  <option value="17">Science & Nature</option>
                  <option value="18">Science: Computers</option>
                  <option value="19">Science: Mathematics</option>
                  <option value="20">Mythology</option>
                  <option value="21">Sports</option>
                  <option value="22">Geography</option>
                  <option value="23">History</option>
                  <option value="24">Politics</option>
                  <option value="25">Art</option>
                  <option value="26">Celebrities</option>
                  <option value="27">Animals</option>
                  <option value="28">Vehicles</option>
                  <option value="29">Entertainment: Comics</option>
                  <option value="30">Science: Gadgets</option>
                  <option value="31">
                    Entertainment: Japanese Anime & Manga
                  </option>
                  <option value="32">
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="any">Any Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Start Quiz
              </button>
            </form>
          </div>
        ) : showResults ? (
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Quiz Completed!</h1>
            <p className="text-xl text-gray-700 mb-6">
              You scored {score} out of {questions.length}!
            </p>
            <button
              onClick={resetQuiz}
              className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Restart Quiz
            </button>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold mb-4">
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
                  className={`w-full py-2 px-4 rounded-md focus:outline-none ${
                    selectedAnswer === answer
                      ? answer ===
                        questions[currentQuestionIndex].correct_answer
                        ? "bg-green-500 text-white" // Correct answer
                        : "bg-red-500 text-white" // Incorrect answer
                      : answer ===
                          questions[currentQuestionIndex].correct_answer &&
                        selectedAnswer !== null
                      ? "bg-green-500 text-white" // Highlight correct answer if user selects wrong one
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300" // Default state
                  }`}
                >
                  {answer}
                </button>
              ))}
            </div>
            {/* Next Button */}
            {selectedAnswer !== null && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={goToNextQuestion}
                  className="bg-indigo-600 text-white py-3 px-3 rounded-md text-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {currentQuestionIndex + 1 < questions.length
                    ? "Next Question"
                    : "Finish Quiz"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
