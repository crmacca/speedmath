window.onload = () => {
    console.log('quiz.js loaded');
    var dataSpan = document.getElementById('quizData');


    var total = 0
    var current = 0
    var questions = []
    var incorrectlyAnswered = []
    var correctlyAnswered = []

    var dataString = JSON.parse(dataSpan.getAttribute('quizData'));
    questions = dataString.unanswered
    incorrectlyAnswered = dataString.incorrectlyAnswered
    correctlyAnswered = dataString.correctlyAnswered
    total = questions.length + incorrectlyAnswered.length + correctlyAnswered.length
    current = total - questions.length

    var currentQuestion = {}
    var submitDisabled = false

    var questionText = document.getElementById('formQuestion');
    var answerInput = document.getElementById('formInput');
    var correct = document.getElementById('correct');
    var incorrect = document.getElementById('incorrect');
    var submitButton = document.getElementById('submitQuizBtn');
    var currentQuestionNumber = document.getElementById('currentQuestionNumber');
    var progressBar = document.getElementById('progressBar')

    function getNextQuestion() {
        
        if (questions.length === 0) {
            return false;
        }
        currentQuestion = questions.shift();        
        questionText.innerHTML = currentQuestion.question;
        currentQuestionNumber.innerHTML = `${current + 1}/${total}`;
        answerInput.value = '';      
        return currentQuestion;
    }

    getNextQuestion();

    var form = document.getElementById('quizForm')
    form.onsubmit = function(e) {
        e.preventDefault();
        if(submitDisabled === false) {
            submitDisabled = true;
            submitButton.disabled = true;

            if(parseInt(answerInput.value) === currentQuestion.answer) {
                correct.style.display = 'block'
                correctlyAnswered.push(currentQuestion);
            } else {
                incorrect.style.display = 'block'
                incorrectlyAnswered.push(currentQuestion);
            }

            current = current + 1; 
            progressBar.style.width = current / total * 100 + '%';

            setTimeout(() => {
                correct.style.display = 'none'
                incorrect.style.display = 'none'
                submitDisabled = false
                submitButton.disabled = false;
                getNextQuestion();
            }, 1000)

            return
        }
    }

    answerInput.onkeyup = function(e) {
        answerInput.value = e.target.value.replace(/[^-\d]/g, '');
    }
}