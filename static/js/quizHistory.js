// Event listener for when the window finishes loading
window.addEventListener('load', async function() {
	// Log a message indicating that index.js has been loaded
	console.log('index.js loaded');

	// Function to decode HTML entities in the JSON data
	function decodeHtmlEntity(encodedJson) {
		const decodedJson = encodedJson.replace(/&quot;/g, '"');
		return decodedJson;
	}

	// Parse the JSON data and assign it to the quizData variable
	const quizData = await JSON.parse(decodeHtmlEntity(quizzes))

	// Get reference to the quiz template element
	var template = document.getElementById('quiz-template');

	// Display a message if no quizzes are found
	if (quizData.length === 0) {
		document.getElementById('noQuizFound').style.display = 'block'
	}

	// Iterate over each quiz in the quizData array
	for (const quiz of quizData) {
		console.log(quiz);
		// Clone the quiz template
		const clone = template.cloneNode(true);
		clone.id = quiz.pk;

		// Set up a set to store unique types of questions
		const typesSet = new Set();

		// Helper function to add question types to the set
		const addTypes = (questions) => {
			if (Array.isArray(questions)) {
				for (const question of questions) {
					typesSet.add(question.type);
				}
			}
		};

		// Add types of questions to the set
		addTypes(quiz.fields.unanswered);
		addTypes(quiz.fields.incorrectlyAnswered);
		addTypes(quiz.fields.correctlyAnswered);

		// Function to capitalize the first letter of each word
		const capitalizeFirstLetter = (word) => {
			return word.charAt(0).toUpperCase() + word.slice(1);
		};

		// Capitalize each type of question
		const types = [...typesSet].map(type => capitalizeFirstLetter(type));

		// Formatting types array into a string with commas and an '&' before the last type
		let formattedTypes = types.length > 1 ?
			types.slice(0, -1).join(', ') + ' & ' + types.slice(-1) :
			types.join('');

		// Calculate completion details for the quiz
		const totalQuestions = (Array.isArray(quiz.fields.unanswered) ? quiz.fields.unanswered.length : 0) +
			(Array.isArray(quiz.fields.incorrectlyAnswered) ? quiz.fields.incorrectlyAnswered.length : 0) +
			(Array.isArray(quiz.fields.correctlyAnswered) ? quiz.fields.correctlyAnswered.length : 0);
		const correctQuestions = (Array.isArray(quiz.fields.correctlyAnswered) ? quiz.fields.correctlyAnswered.length : 0);
		const answeredQuestions = (Array.isArray(quiz.fields.incorrectlyAnswered) ? quiz.fields.incorrectlyAnswered.length : 0) +
			(Array.isArray(quiz.fields.correctlyAnswered) ? quiz.fields.correctlyAnswered.length : 0);
		const completionPercentage = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0;

		// Set up the HTML elements in the cloned quiz template
		clone.querySelector('#typeText').innerHTML = formattedTypes;
		clone.querySelector('#completion').innerHTML = `${correctQuestions}/${totalQuestions}`
		clone.querySelector('#progressBar').style.width = `${completionPercentage}%`
		clone.style.display = 'block'

		// Append the cloned quiz template to the quiz container
		document.getElementById('quiz-container').appendChild(clone);

		// Redirect to quiz page when a quiz is clicked
		clone.onclick = () => {
			window.location.pathname = `/quiz/${quiz.pk}`
		}
	}

	// Get references to modal elements
	var modal = document.getElementById("createModal");
	var btn = document.getElementById("createQuizBtn");
	var span = document.getElementsByClassName("close")[0];

	// Display modal when create quiz button is clicked
	btn.onclick = function() {
		modal.style.display = "block";
	}

	// Close modal when close button is clicked
	span.onclick = function() {
		modal.style.display = "none";
	}

	// Close modal when user clicks outside of it
	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}

	// Handle form submission for creating a quiz
	var createForm = document.getElementById("createForm");
	createForm.onsubmit = async function(e) {
		e.preventDefault(); //Prevents the form from submitting an API request.

		// Check if any math type is selected
		var isAnyMathTypeSelected =
			document.getElementById('addition').checked ||
			document.getElementById('subtraction').checked ||
			document.getElementById('division').checked ||
			document.getElementById('multiplication').checked;

		// If no math type is selected, prevent form submission and alert the user
		if (!isAnyMathTypeSelected) {
			alert('Please select at least one type of math to practice.');
			return
		}

		// Extract form values
		let questions = e.target[0].value;
		let difficulty = e.target[1].value;
		let mathTypes = [];
		if (document.getElementById('addition').checked) {
			mathTypes.push('addition');
		}
		if (document.getElementById('subtraction').checked) {
			mathTypes.push('subtraction');
		}
		if (document.getElementById('division').checked) {
			mathTypes.push('division');
		}
		if (document.getElementById('multiplication').checked) {
			mathTypes.push('multiplication');
		}

		let shuffle = e.target[6].checked;

		// Create JSON payload
		const jsonPayload = {
			questions: parseInt(questions),
			difficulty: parseInt(difficulty),
			mathTypes: mathTypes,
			shuffle: shuffle
		}

		// Log the JSON payload
		console.log(jsonPayload)

		// Send a POST request to create the quiz
		const response = await fetch('/createquiz', {
				method: "POST",
				headers: {
					"X-CSRFToken": getCookie("csrftoken"),
				},
				body: JSON.stringify(jsonPayload),
			})
			.then(response => response.json())
			.then(data => {
				window.location.pathname = `/quiz/${data.quizId}`;
			});

	}

});

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
