window.addEventListener('load', async function () {
    console.log('navbar.js loaded');
    document.getElementById('greetingText').textContent = await getGreeting();
});

function getGreeting() {
    var d = new Date();
    var n = d.getHours();
    if (n < 12) {
        return "Good morning,";
    } else if (n < 17) {
        return "Good afternoon,";
    } else {
        return "Good evening,";
    }

}