window.addEventListener('load', async function() {
  console.log('index.js loaded');

  function decodeHtmlEntity(encodedJson) {
    const decodedJson = encodedJson.replace(/&quot;/g, '"');
    return decodedJson;
}

  console.log(JSON.parse(decodeHtmlEntity(quizzes)))

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
