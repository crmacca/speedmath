window.onload = () => {
    console.log('quiz.js loaded');
    var dataSpan = document.getElementById('quizData');

    var questions = []
    var incorrectlyAnswered = []
    var correctlyAnswered = []

    var dataString = JSON.parse(dataSpan.getAttribute('quizData'));
    questions = dataString.unanswered;
    incorrectlyAnswered = dataString.incorrectlyAnswered;
    correctlyAnswered = dataString.correctlyAnswered;
    var total = questions.length + incorrectlyAnswered.length + correctlyAnswered.length;

    var questionText = document.getElementById('formQuestion');
    var answerInput = document.getElementById('formInput');
    var correct = document.getElementById('correct');
    var incorrect = document.getElementById('incorrect');
    var submitButton = document.getElementById('submitQuizBtn');
    var currentQuestionNumber = document.getElementById('currentQuestionNumber');
    var progressBar = document.getElementById('progressBar');
    var currentQuestion = null

    var outOfSync = false;

    async function displayAnswers() {
        var combinedQuestions = []
        combinedQuestions.push(...incorrectlyAnswered.map((q) => ({...q, correct: false})));
        combinedQuestions.push(...correctlyAnswered.map((q) => ({...q, correct: true})));
        combinedQuestions.sort((a, b) => a.id - b.id);
        console.log(combinedQuestions)

        var questionTemplate = await document.getElementById('questionTemplate');
        var answerHolder = await document.getElementById('results');

        for(question of combinedQuestions) {
            var clone = questionTemplate.cloneNode(true);
            clone.id = `question-${question.id}`;

            var questionText = clone.querySelector('#questionText');
            var questionAnswer = clone.querySelector('#questionAnswer');
            var questionCorrect = clone.querySelector('#correct');
            var questionIncorrect = clone.querySelector('#incorrect');
            var questionNumber = clone.querySelector('#questionNumber');

            questionNumber.innerHTML = `Question ${question.id}`;
            questionText.innerHTML = question.question;
            questionAnswer.innerHTML = question.correct ? question.answer : question.userAnswer;
            
            if(question.correct) {
                questionCorrect.style.display = 'block';
            }
            else {
                questionIncorrect.style.display = 'block';
                questionIncorrect.innerHTML = `❌ ${question.answer}`;
            }

            answerHolder.appendChild(clone);
        }

        answerHolder.style.display = 'flex';

        document.getElementById('resultSummary').innerHTML = `You answered ${correctlyAnswered.length} out of ${total} questions correctly${((correctlyAnswered.length/total) * 100) > 50 ? '!' : '.'} (${(correctlyAnswered.length/total) * 100}%)`;
    }

    function updateProgress() {
        document.getElementById('quizForm').style.display = 'block';
        currentQuestionNumber.innerHTML = `Question ${total - questions.length}/${total}`;
        progressBar.style.width = `${((total - questions.length) / total) * 100}%`;
    }

    async function getNextQuestion() {
        if (questions.length === 0) {
            updateProgress();

            currentQuestionNumber.innerHTML = `Complete!`;
            progressBar.style.width = '100%';
            document.getElementById('quizForm').style.display = 'none';
            displayAnswers();

            return false;
        }
        
        var current = await questions.shift();  
        currentQuestion = current;
        
        questionText.innerHTML = current.question;
        answerInput.value = '';      
    
        updateProgress();
    
        return current;
    }    

    getNextQuestion();

    var form = document.getElementById('quizForm')
    form.onsubmit = function(e) {
        e.preventDefault();
        submitButton.disabled = true;

        fetch('/quiz/submit', {
            method: 'POST',
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quizId: dataString.id,
                answer: answerInput.value,
                questionId: currentQuestion.id
            })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success === false) {
                alert(data.message || 'An error occurred while submitting your answer, please reload the page.');
                outOfSync = true;
            } else {
                if(data.correct === true) {
                    correct.style.display = 'block';
                    correctlyAnswered.push(currentQuestion);
                } else {
                    incorrect.innerHTML = `❌ ${currentQuestion.answer}`;
                    incorrect.style.display = 'block';
                    incorrectlyAnswered.push({...currentQuestion, userAnswer: parseInt(answerInput.value)});
                }

                updateProgress();
            }
            
            setTimeout(() => {
                if(outOfSync) {
                    return window.location.reload();
                } else {
                    correct.style.display = 'none';
                    incorrect.style.display = 'none';
                    submitButton.disabled = false;
                    getNextQuestion();
                }
            }, 1000);
        });
    }

    answerInput.onkeyup = function(e) {
        answerInput.value = e.target.value.replace(/[^-\d]/g, '');
    }
}

function getCookie(cname) { // CHATGPT generated this to isolate the csrf out of the django cookie.
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
