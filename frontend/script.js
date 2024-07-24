let currentQuestionIndex = 0;
let timeLeft = 10;
let countdown;
let correctAnswers = 0;
let questions = [];

const timerElement = document.getElementById('time');
const quizContainer = document.getElementById('quiz');
const nextButton = document.getElementById('next-btn');

async function fetchQuestions() {
  try {
    const response = await fetch('http://localhost:5500/quizzes');
    const data = await response.json();
    questions = data.map(quiz => ({
      question: quiz.title,
      answers: quiz.answers.map(answer => ({
        text: answer.answer_title,
        correct: answer.is_correct
      }))
    }));
    startQuiz();
  } catch (error) {
    console.error('Error fetching quizzes:', error);
  }
}

function startQuiz() {
  currentQuestionIndex = 0;
  correctAnswers = 0;
  showQuestion(questions[currentQuestionIndex]);
  startTimer();
  nextButton.style.display = 'block';
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
        <h3>${question.question}</h3>
        <ul>
            ${question.answers.map((answer, index) => `
                <li><button class="answer" onclick="selectAnswer(this, ${answer.correct})">${answer.text}</button></li>
            `).join('')}
        </ul>
    `;
}

function selectAnswer(button, isCorrect) {
  if (isCorrect) {
    button.classList.add('correct');
    correctAnswers++;
  } else {
    button.classList.add('incorrect');
  }

  document.querySelectorAll('.answer').forEach(btn => {
    btn.disabled = true;
  });
  clearInterval(countdown);
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion(questions[currentQuestionIndex]);
    startTimer();
  } else {
    showResults();
    nextButton.style.display = 'none';
    clearInterval(countdown);
  }
}

function showResults() {
  let resultMessage = '';
  if (correctAnswers === questions.length) {
    resultMessage = `Vunderkind! <br> Sizning natijangiz ${correctAnswers}ta to'g'ri javob!`;
  } else if (correctAnswers > 2 && correctAnswers < questions.length) {
    resultMessage = `A'lo darajada! Sizning natijangiz ${correctAnswers}ta to'g'ri javob!`;
  } else {
    resultMessage = `Keyingi safar yaxshiroq natijaga erishasiz!!!<br> Sizning natijangiz ${correctAnswers}ta to'g'ri javob`;
  }

  quizContainer.innerHTML = resultMessage;
}

fetchQuestions();
