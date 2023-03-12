const toxicityFormBtn = document.getElementById("toxicity-form-button");
const scoreTxt = document.getElementById("toxicity-form-score");
const debugTxt = document.getElementById("debug-output")

async function onTextSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const inputText = formData.get("inputText");
  const response = await fetch(
    `http://127.0.0.1:5000/api/v1/score/?inputText=${inputText}`
  );
  const data = await response.json();
  if (response.ok) {
    console.log(data);
    const rawScore = parseFloat(data.attributeScores.TOXICITY.summaryScore.value);
    scoreTxt.style = "";
    scoreTxt.innerText = (rawScore * 100).toFixed(2) + "%";
  } else {
    scoreTxt.style = "color: #ea1537";
    scoreTxt.innerHTML = data.errorText;
  }

  debugTxt.innerText = JSON.stringify(data, null, 2);
}

function onTextChange(event) {
  if (event.target.value) {
    toxicityFormBtn.removeAttribute("disabled");
  } else {
    toxicityFormBtn.setAttribute("disabled", "false");
  }
}

function highlight(text) {
    var inputText = document.getElementById("inputText");
    var innerHTML = inputText.innerHTML;
    console.log(innerHTML);
    var index = innerHTML.indexOf(text);
    if (index >= 0) { 
     innerHTML = innerHTML.substring(0,index) + "<span class='highlight'>" + innerHTML.substring(index,index+text.length) + "</span>" + innerHTML.substring(index + text.length);
     inputText.innerHTML = innerHTML;
    }
}