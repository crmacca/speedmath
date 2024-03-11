console.log('appIndex.js loaded');

window.onload = function() {
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
    createForm.onsubmit = function(e) {
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
    }

}