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
            questionAnswer.value = question.correct ? question.answer : question.userAnswer;
            
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

        var progressBarContainer = await document.getElementsByClassName('progressBarContainer')[0]
        var progressBar = await document.getElementsByClassName('progressBar')[0]

        progressBarContainer.classList.remove('progressBarContainer')
        progressBarContainer.classList.add('progressBarContainerCorrect')
        progressBar.className = 'progressBarCorrect'
        progressBar.style.width = ((correctlyAnswered.length/total) * 100) + '%'

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

    var deleteModal = document.getElementById('deleteModal');
    var deleteBtn = document.getElementById('deleteQuizBtn');
    var closeSpan = deleteModal.getElementsByClassName('close')[0];
    var confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    // When the user clicks the button, open the modal
    deleteBtn.onclick = function() {
        deleteModal.style.display = 'block';
    }

    // When the user clicks on <span> (x), close the modal
    closeSpan.onclick = function() {
        deleteModal.style.display = 'none';
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == deleteModal) {
            deleteModal.style.display = 'none';
        }
    }

    // Handle quiz deletion
    confirmDeleteBtn.onclick = async function() {
        // Add your logic to delete the quiz. This might involve sending a request to your server and then redirecting the user or updating the UI accordingly.
        console.log('Quiz deletion confirmed');

        // Example: Send a DELETE request to your server (You'll need to replace '/deleteQuizEndpoint' with your actual endpoint)
        const response = await fetch('/quiz/delete', {
            method: 'DELETE',
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quizId: dataString.id }) // Make sure to replace 'yourQuizId' with the actual quiz ID
        });

        if(response.ok) {
            // Handle success response
            console.log('Quiz deleted successfully');
            window.location.href = '/'; // Redirect to home or another appropriate page
        } else {
            // Handle error response
            console.log('Failed to delete quiz');
        }
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
