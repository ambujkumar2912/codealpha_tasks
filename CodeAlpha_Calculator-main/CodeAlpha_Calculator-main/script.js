const expressionEl = document.querySelector("#expression");
const resultEl = document.querySelector("#result");
const keys = document.querySelector(".keys");

let current = "0";
let expression = "";
let previousValue = null;
let operator = null;
let waitingForOperand = false;
let justCalculated = false;

const operators = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => b === 0 ? null : a / b
};

function formatNumber(value) {
    if (!Number.isFinite(value)) {
        return "Error";
    }

    const rounded = Number.parseFloat(value.toPrecision(12));
    return String(rounded);
}

function updateDisplay() {
    expressionEl.textContent = expression;
    resultEl.textContent = current;
}

function clearCalculator() {
    current = "0";
    expression = "";
    previousValue = null;
    operator = null;
    waitingForOperand = false;
    justCalculated = false;
    updateDisplay();
}

function inputNumber(value) {
    if (current === "Error" || waitingForOperand || justCalculated) {
        current = value;
        expression = "";
        waitingForOperand = false;
        justCalculated = false;
        updateDisplay();
        return;
    }

    if (value === "." && current.includes(".")) {
        return;
    }

    if (current === "0" && value !== ".") {
        current = value;
    } else if (current.length < 15) {
        current += value;
    }

    updateDisplay();
}

function chooseOperator(nextOperator) {
    if (current === "Error") {
        return;
    }

    const inputValue = Number(current);

    if (operator && waitingForOperand) {
        operator = nextOperator;
        expression = `${formatNumber(previousValue)} ${symbolFor(operator)}`;
        updateDisplay();
        return;
    }

    if (previousValue === null) {
        previousValue = inputValue;
    } else if (operator) {
        const calculated = operators[operator](previousValue, inputValue);

        if (calculated === null) {
            current = "Error";
            expression = "Cannot divide by zero";
            previousValue = null;
            operator = null;
            updateDisplay();
            return;
        }

        previousValue = calculated;
        current = formatNumber(calculated);
    }

    operator = nextOperator;
    waitingForOperand = true;
    justCalculated = false;
    expression = `${formatNumber(previousValue)} ${symbolFor(operator)}`;
    updateDisplay();
}

function calculate() {
    if (!operator || previousValue === null || current === "Error") {
        return;
    }

    const firstValue = previousValue;
    const secondValue = Number(current);
    const activeOperator = operator;
    const calculated = operators[activeOperator](firstValue, secondValue);

    if (calculated === null) {
        current = "Error";
        expression = "Cannot divide by zero";
        previousValue = null;
        operator = null;
        updateDisplay();
        return;
    }

    current = formatNumber(calculated);
    expression = `${formatNumber(firstValue)} ${symbolFor(activeOperator)} ${formatNumber(secondValue)} =`;
    previousValue = null;
    operator = null;
    waitingForOperand = false;
    justCalculated = true;
    updateDisplay();
}

function backspace() {
    if (waitingForOperand || justCalculated || current === "Error") {
        return;
    }

    current = current.length > 1 ? current.slice(0, -1) : "0";

    if (current === "-") {
        current = "0";
    }

    updateDisplay();
}

function percentage() {
    if (current === "Error" || waitingForOperand) {
        return;
    }

    current = formatNumber(Number(current) / 100);
    updateDisplay();
}

function symbolFor(value) {
    return {
        "*": "×",
        "/": "÷",
        "-": "−",
        "+": "+"
    }[value];
}

function handleAction(action) {
    if (action === "clear") {
        clearCalculator();
    }

    if (action === "backspace") {
        backspace();
    }

    if (action === "percent") {
        percentage();
    }

    if (action === "calculate") {
        calculate();
    }
}

keys.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    const value = button.dataset.value;
    const action = button.dataset.action;

    if (value !== undefined) {
        if (["+", "-", "*", "/"].includes(value)) {
            chooseOperator(value);
        } else {
            inputNumber(value);
        }
        return;
    }

    handleAction(action);
});

document.addEventListener("keydown", (event) => {
    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        event.preventDefault();
        inputNumber(key);
        return;
    }

    if (["+", "-", "*", "/"].includes(key)) {
        event.preventDefault();
        chooseOperator(key);
        return;
    }

    if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
        return;
    }

    if (key === "Backspace") {
        event.preventDefault();
        backspace();
        return;
    }

    if (key === "Escape") {
        event.preventDefault();
        clearCalculator();
        return;
    }

    if (key === "%") {
        event.preventDefault();
        percentage();
    }
});

updateDisplay();
