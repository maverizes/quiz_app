let currentQuestionIndex = 0;
let timeLeft = 10;
let countdown;
let correctAnswers = 0;

const timerElement = document.getElementById("time");
const quizContainer = document.getElementById("quiz");
const nextButton = document.getElementById("next-btn");

function startQuiz(questions) {
  currentQuestionIndex = 0;
  correctAnswers = 0;
  showQuestion(questions[currentQuestionIndex]);
  startTimer();
  nextButton.style.display = "block";
}

function startTimer() {
  clearInterval(countdown);
  timeLeft = 10;
  timerElement.textContent = timeLeft;
  countdown = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(countdown);
      alert("Vaqt tugadi!");
      nextQuestion();
    }
  }, 1000);
}

function showQuestion(question) {
  quizContainer.innerHTML = `
      <h3>${question.title}</h3>
      <img width="200" src="http://localhost:3000/uploads/${question.image}" />
      <ul>
          ${question.answers
            .map(
              (answer, index) => `
              <li><button class="answer" onclick="selectAnswer(this, ${answer.is_correct_answer})">${answer.answer_text}</button></li>
          `
            )
            .join("")}
      </ul>
  `;
}

function selectAnswer(button, isCorrect) {
  if (isCorrect) {
    button.classList.add("correct");
    correctAnswers++;
  } else {
    button.classList.add("incorrect");
  }

  document.querySelectorAll(".answer").forEach((btn) => {
    btn.disabled = true;
  });
  clearInterval(countdown);
}

function nextQuestion() {
  const questions = JSON.parse(localStorage.getItem("quizzes"));
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion(questions[currentQuestionIndex]);
    startTimer();
  } else {
    showResults();
    nextButton.style.display = "none";
    clearInterval(countdown);
  }
}

function showResults() {
  let resultMessage = "";
  if (correctAnswers === 5) {
    resultMessage = `Vunderkind! <br> Sizning natijangiz ${correctAnswers}ta to'g'ri javob!`;
  } else if (correctAnswers > 2 && correctAnswers < 5) {
    resultMessage = `A'lo darajada! Sizning natijangiz ${correctAnswers}ta to'g'ri javob!`;
  } else {
    resultMessage = `Keyingi safar yaxshiroq natijaga erishasiz!!!<br> Sizning natijangiz ${correctAnswers}ta to'g'ri javob`;
  }

  quizContainer.innerHTML = resultMessage;
}

fetch("http://localhost:3000/quizz")
  .then((res) => res.json())
  .then((data) => {
    localStorage.setItem("questions", JSON.stringify(data.data));
    startQuiz(data.data);
  });
