const toxicityFormBtn = document.getElementById("toxicity-form-button");
const scoreTxt = document.getElementById("toxicity-form-score");

function onTextSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const inputText = formData.get("inputText");
    // FIXME: Add API call
    scoreTxt.innerHTML = "API not set up yet!";
    scoreTxt.style = "color: #ea1537";
}

function onTextChange(event) {
    if (event.target.value) {
        toxicityFormBtn.removeAttribute("disabled");
    } else {
        toxicityFormBtn.setAttribute("disabled", "false");
    }
}
