function clearDisplay() {
    document.getElementById("equation-display").value = "";
    document.getElementById("result-display").value = "";
}

function deleteLast() {
    const equationDisplay = document.getElementById("equation-display");
    equationDisplay.value = equationDisplay.value.slice(0, -1);
}

function appendToDisplay(value) {
    const equationDisplay = document.getElementById("equation-display");

    if (value === "±") {
        if (equationDisplay.value === "") {
            equationDisplay.value = "-";
        } else if (equationDisplay.value.startsWith("-")) {
            equationDisplay.value = equationDisplay.value.substring(1);
        } else {
            equationDisplay.value = "-" + equationDisplay.value;
        }
    } else {
        equationDisplay.value += value;
    }
}

function calculate() {
    const equationDisplay = document.getElementById("equation-display");
    const resultDisplay = document.getElementById("result-display");

    let equation = equationDisplay.value;

    // Handle percentage
    equation = equation.replace(/(\d+)%/g, "($1/100)");

    // Handle square root
    equation = equation.replace(/√(\d+)/g, "Math.sqrt($1)");

    // Handle square
    equation = equation.replace(/(\d+)\^2/g, "Math.pow($1,2)");

    try {
        const result = eval(equation);
        resultDisplay.value = result;

        // Update history
        addToHistory(equationDisplay.value, result);
    } catch {
        resultDisplay.value = "Error";
    }
}

function addToHistory(equation, result) {
    const historyList = document.getElementById("history-list");
    const historyItem = document.createElement("li");
    historyItem.textContent = `${equation} = ${result}`;
    historyList.appendChild(historyItem);
}

function toggleHistory() {
    const history = document.getElementById("history");
    history.classList.toggle("hidden");
}
