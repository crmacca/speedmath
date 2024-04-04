// This function is executed when the window finishes loading
window.onload = () => {
    // Log a message to indicate that the quiz.js file has been loaded
    console.log('quiz.js loaded');

    // Initialize arrays to store questions, incorrectly answered questions, and correctly answered questions
    var questions = []
    var incorrectlyAnswered = []
    var correctlyAnswered = []

    // Function to decode HTML entities in the JSON data
    function decodeHtmlEntity(encodedJson) {
        // Replace HTML entities with their corresponding characters
        const decodedJson = encodedJson.replace(/&quot;/g, '"');
        return decodedJson;
    }

    // Parse the JSON data and assign values to the respective arrays
    var dataString = JSON.parse(decodeHtmlEntity(quizData));
    questions = dataString.unanswered;
    incorrectlyAnswered = dataString.incorrectlyAnswered;
    correctlyAnswered = dataString.correctlyAnswered;
    // Calculate the total number of questions
    var total = questions.length + incorrectlyAnswered.length + correctlyAnswered.length;

    // Get references to various HTML elements
    var questionText = document.getElementById('formQuestion');
    var answerInput = document.getElementById('formInput');
    var correct = document.getElementById('correct');
    var incorrect = document.getElementById('incorrect');
    var submitButton = document.getElementById('submitQuizBtn');
    var currentQuestionNumber = document.getElementById('currentQuestionNumber');
    var progressBar = document.getElementById('progressBar');
    var currentQuestion = null

    // Variable to track if the quiz is out of sync
    var outOfSync = false;

    // Function to display answers at the end of the quiz
    async function displayAnswers() {
        // Combine incorrectly and correctly answered questions
        var combinedQuestions = []
        combinedQuestions.push(...incorrectlyAnswered.map((q) => ({
            ...q,
            correct: false
        })));
        combinedQuestions.push(...correctlyAnswered.map((q) => ({
            ...q,
            correct: true
        })));
        // Sort the combined questions by their IDs
        combinedQuestions.sort((a, b) => a.id - b.id);

        // Get references to question template and answer holder elements
        var questionTemplate = await document.getElementById('questionTemplate');
        var answerHolder = await document.getElementById('results');

        // Iterate over combined questions and display them
        for (question of combinedQuestions) {
            // Clone the question template
            var clone = questionTemplate.cloneNode(true);
            clone.id = `question-${question.id}`;

            // Get references to various elements in the cloned question template
            var questionText = clone.querySelector('#questionText');
            var questionAnswer = clone.querySelector('#questionAnswer');
            var questionCorrect = clone.querySelector('#correct');
            var questionIncorrect = clone.querySelector('#incorrect');
            var questionNumber = clone.querySelector('#questionNumber');

            // Set question number, text, and answer
            questionNumber.innerHTML = `Question ${question.id}`;
            questionText.innerHTML = question.question;
            questionAnswer.value = question.correct ? question.answer : question.userAnswer;

            // Display correct or incorrect message based on the correctness of the answer
            if (question.correct) {
                questionCorrect.style.display = 'block';
            } else {
                questionIncorrect.style.display = 'block';
                questionIncorrect.innerHTML = `❌ ${question.answer}`;
            }

            // Append the cloned question template to the answer holder
            answerHolder.appendChild(clone);
        }

        // Display the answer holder
        answerHolder.style.display = 'flex';

        // Update the progress bar to reflect the percentage of correctly answered questions
        var progressBarContainer = await document.getElementsByClassName('progressBarContainer')[0]
        var progressBar = await document.getElementsByClassName('progressBar')[0]

        progressBarContainer.classList.remove('progressBarContainer')
        progressBarContainer.classList.add('progressBarContainerCorrect')
        progressBar.className = 'progressBarCorrect'
        progressBar.style.width = ((correctlyAnswered.length / total) * 100) + '%'

        // Display the summary of results
        document.getElementById('resultSummary').innerHTML = `You answered ${correctlyAnswered.length} out of ${total} questions correctly${((correctlyAnswered.length/total) * 100) > 50 ? '!' : '.'} (${(correctlyAnswered.length/total) * 100}%)`;
    }

    // Function to update the progress of the quiz
    function updateProgress() {
        // Display the quiz form
        document.getElementById('quizForm').style.display = 'block';
        // Update the current question number and progress bar
        currentQuestionNumber.innerHTML = `Question ${total - questions.length}/${total}`;
        progressBar.style.width = `${((total - questions.length) / total) * 100}%`;
    }

    // Function to get the next question
    async function getNextQuestion() {
        if (questions.length === 0) {
            // If there are no more questions, update progress, display answers, and end the quiz
            updateProgress();

            currentQuestionNumber.innerHTML = `Complete!`;
            progressBar.style.width = '100%';
            document.getElementById('quizForm').style.display = 'none';
            displayAnswers();

            return false;
        }

        // Get the next question from the array
        var current = await questions.shift();
        currentQuestion = current;

        // Display the current question and update progress
        questionText.innerHTML = current.question;
        answerInput.value = '';

        updateProgress();

        return current;
    }

    // Start the quiz by getting the first question
    getNextQuestion();

    // Handle form submission
    var form = document.getElementById('quizForm')
    form.onsubmit = function (e) {
        e.preventDefault();
        submitButton.disabled = true;

        // Send a POST request to submit the answer
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
                // Handle the response from the server
                if (data.success === false) {
                    // If there was an error, display an alert and set outOfSync flag to true
                    alert(data.message || 'An error occurred while submitting your answer, please reload the page.');
                    outOfSync = true;
                } else {
                    // If the answer was correct, display correct message and add the question to correctlyAnswered array
                    if (data.correct === true) {
                        correct.style.display = 'block';
                        correctlyAnswered.push(currentQuestion);
                    } else {
                        // If the answer was incorrect, display incorrect message, store the user's answer, and add the question to incorrectlyAnswered array
                        incorrect.innerHTML = `❌ ${currentQuestion.answer}`;
                        incorrect.style.display = 'block';
                        incorrectlyAnswered.push({
                            ...currentQuestion,
                            userAnswer: parseInt(answerInput.value)
                        });
                    }

                    // Update the progress
                    updateProgress();
                }

                // Wait for 1 second before proceeding
                setTimeout(() => {
                    if (outOfSync) {
                        // If the quiz is out of sync, reload the page
                        return window.location.reload();
                    } else {
                        // Otherwise, hide correct/incorrect messages, enable submit button, and get the next question
                        correct.style.display = 'none';
                        incorrect.style.display = 'none';
                        submitButton.disabled = false;
                        getNextQuestion();
                    }
                }, 1000);
            });
    }

    // Restrict input to numeric characters only
    answerInput.onkeyup = function (e) {
        answerInput.value = e.target.value.replace(/[^-\d]/g, '');
    }

    // Modal functionality for deleting quiz
    var deleteModal = document.getElementById('deleteModal');
    var deleteBtn = document.getElementById('deleteQuizBtn');
    var closeSpan = deleteModal.getElementsByClassName('close')[0];
    var confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    // Open the modal when the delete button is clicked
    deleteBtn.onclick = function () {
        deleteModal.style.display = 'block';
    }

    // Close the modal when the close button is clicked
    closeSpan.onclick = function () {
        deleteModal.style.display = 'none';
    }

    // Close the modal when user clicks outside of it
    window.onclick = function (event) {
        if (event.target == deleteModal) {
            deleteModal.style.display = 'none';
        }
    }

    // Handle quiz deletion
    confirmDeleteBtn.onclick = async function () {
        // Log confirmation of quiz deletion
        console.log('Quiz deletion confirmed');

        // Send a DELETE request to delete the quiz
        const response = await fetch('/quiz/delete', {
            method: 'DELETE',
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quizId: dataString.id
            })
        });

        if (response.ok) {
            // If deletion is successful, log and redirect
            console.log('Quiz deleted successfully');
            window.location.href = '/'; // Redirect to home or another appropriate page
        } else {
            // If deletion fails, log an error message
            console.log('Failed to delete quiz');
        }
    }

}

// Function to get a cookie value by name
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
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
