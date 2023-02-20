document.querySelector('#submitButton').addEventListener("click", function() {
    var text = document.getElementById('inputText').value.replace(/\n/gi,'<br>');
	alert(text);
})