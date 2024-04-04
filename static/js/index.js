window.addEventListener('load', async function() {
	console.log('index.js loaded');

	function decodeHtmlEntity(encodedJson) {
		const decodedJson = encodedJson.replace(/&quot;/g, '"');
		return decodedJson;
	}

	const quizData = await JSON.parse(decodeHtmlEntity(quizzes))

	var template = document.getElementById('quiz-template');

	if (quizData.length === 0) {
		document.getElementById('noQuizFound').style.display = 'block'
	}

	for (const quiz of quizData) {
		console.log(quiz);
		const clone = template.cloneNode(true);
		clone.id = quiz.pk;

		const typesSet = new Set();

		// Helper function to add question types to the set
		const addTypes = (questions) => {
			if (Array.isArray(questions)) {
				for (const question of questions) {
					typesSet.add(question.type);
				}
			}
		};

		addTypes(quiz.fields.unanswered);
		addTypes(quiz.fields.incorrectlyAnswered);
		addTypes(quiz.fields.correctlyAnswered);

		// Function to capitalize the first letter of each word
		const capitalizeFirstLetter = (word) => {
			return word.charAt(0).toUpperCase() + word.slice(1);
		};

		const types = [...typesSet].map(type => capitalizeFirstLetter(type)); // Capitalize each type

		// Formatting types array into a string with commas and an '&' before the last type
		let formattedTypes = types.length > 1 ?
			types.slice(0, -1).join(', ') + ' & ' + types.slice(-1) :
			types.join('');

		// Calculate completion
		const totalQuestions = (Array.isArray(quiz.fields.unanswered) ? quiz.fields.unanswered.length : 0) +
			(Array.isArray(quiz.fields.incorrectlyAnswered) ? quiz.fields.incorrectlyAnswered.length : 0) +
			(Array.isArray(quiz.fields.correctlyAnswered) ? quiz.fields.correctlyAnswered.length : 0);
		const answeredQuestions = (Array.isArray(quiz.fields.incorrectlyAnswered) ? quiz.fields.incorrectlyAnswered.length : 0) +
			(Array.isArray(quiz.fields.correctlyAnswered) ? quiz.fields.correctlyAnswered.length : 0);
		const completionPercentage = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

		clone.querySelector('#typeText').innerHTML = formattedTypes;
		clone.querySelector('#completion').innerHTML = `${answeredQuestions}/${totalQuestions}`
		clone.querySelector('#progressBar').style.width = `${completionPercentage}%`
		clone.style.display = 'block'

		if (completionPercentage === 0) {
			clone.querySelector('.notstarted').style.display = 'flex'
		} else clone.querySelector('.incomplete').style.display = 'flex'

		document.getElementById('quiz-container').appendChild(clone);

		clone.onclick = () => {
			window.location.pathname = `/quiz/${quiz.pk}`
		}
	}


	var modal = document.getElementById("createModal");
	var btn = document.getElementById("createQuizBtn");
	var span = document.getElementsByClassName("close")[0];

	btn.onclick = function() {
		modal.style.display = "block";
	}

	span.onclick = function() {
		modal.style.display = "none";
	}

	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none";
		}
	}

	var createForm = document.getElementById("createForm");
	createForm.onsubmit = async function(e) {
		e.preventDefault(); //Prevents the form from submitting an API request.

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

		const jsonPayload = {
			questions: parseInt(questions),
			difficulty: parseInt(difficulty),
			mathTypes: mathTypes,
			shuffle: shuffle
		}

		console.log(jsonPayload)

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