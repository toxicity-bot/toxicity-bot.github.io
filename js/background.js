var currentInputElement;
var currentInterval;
var runningAPI = false;

for(let i = 0; i < document.querySelectorAll('input').length; i++){
    document.querySelectorAll('input')[i].addEventListener('click', () => {
        clearInterval(currentInterval);
        currentInputElement = document.querySelectorAll('input')[i];
        currentInterval = setInterval(startCheckOnInput, 1000);
    });
}
for(let i = 0; i < document.querySelectorAll('textarea').length; i++){
    document.querySelectorAll('textarea')[i].addEventListener('click', () => {
        clearInterval(currentInterval);
        currentInputElement = document.querySelectorAll('textarea')[i];
        currentInterval = setInterval(startCheckOnInput, 1000);
    });
}

document.onclick= function(event) {
    if (event===undefined) {
        event= window.event;
    }
    var target= 'target' in event? event.target : event.srcElement;
    if (target.tagName != "INPUT" && target.tagName != "TEXTAREA") {
        clearInterval(currentInterval);
    }
};

function startCheckOnInput() {
    const currTScore = getToxicityScore(currentInputElement.value);
    clearHighlights(currentInputElement);
    if (currTScore >= 75) {
        currentInputElement.classList.add("highSeverityHighlight");
    } else if (currTScore >= 50 && currTScore < 75) {
        currentInputElement.classList.add("midSeverityHighlight");
    } else if (currTScore >= 25 && currTScore < 50) {
        currentInputElement.classList.add("lowSeverityHighlight");
    }
    console.log("checking");
}

// temporary function, import API method from script.js later
function getToxicityScore(content) {
    var toxicityScore = 0;
    if (content.includes("stupid")) {
        toxicityScore = 25;
    }
    if (content.includes("fuck")) {
        toxicityScore = 50;
    }
    if (content.includes("meow meow")) {
        toxicityScore = 75;
    }
    return toxicityScore;
}

function clearHighlights(currElement) {
    if (currElement.classList.contains("lowSeverityHighlight")) {
        currElement.classList.remove("lowSeverityHighlight")
    }
    if (currElement.classList.contains("midSeverityHighlight")) {
        currElement.classList.remove("midSeverityHighlight")
    }
    if (currElement.classList.contains("highSeverityHighlight")) {
        currElement.classList.remove("highSeverityHighlight")
    }
}

console.log("initialized");