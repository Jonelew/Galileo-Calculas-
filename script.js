let display = document.getElementById('display');
let currentInput = '';
let shouldReset = false;

function press(value) {
  if (display.textContent === 'Error') {
    clearDisplay();
  }
  if (shouldReset) {
    currentInput = '';
    shouldReset = false;
  }
  if (value === '.' && currentInput.endsWith('.')) return;
  currentInput += value;
  display.textContent = currentInput;
}

function clearDisplay() {
  currentInput = '';
  display.textContent = '0';
}

function calculate() {
  try {
    let result = eval(currentInput);
    display.textContent = result;
    currentInput = result.toString();
    shouldReset = true;
  } catch {
    display.textContent = 'Error';
    currentInput = '';
    shouldReset = true;
  }
}