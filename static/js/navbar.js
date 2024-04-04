// Event listener for when the window finishes loading
window.addEventListener('load', async function() {
	// Log a message indicating that navbar.js has been loaded
	console.log('navbar.js loaded');
	// Set the text content of the 'greetingText' element to the result of the 'getGreeting' function
	document.getElementById('greetingText').textContent = await getGreeting();
});

// Function to get the appropriate greeting based on the time of the day
function getGreeting() {
	var d = new Date();
	var n = d.getHours();
	if (n < 12) {
		// Return "Good morning" if it's before 12 PM
		return "Good morning,";
	} else if (n < 17) {
		// Return "Good afternoon" if it's between 12 PM and 5 PM
		return "Good afternoon,";
	} else {
		// Return "Good evening" if it's after 5 PM
		return "Good evening,";
	}
}
