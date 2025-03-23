// Variables to store calculator state
let currentExpression = '';
let lastResult = '';
let errorState = false;

// DOM elements
const expressionElement = document.getElementById('expression');
const resultElement = document.getElementById('result');

// Function to append character(s) to the expression
function appendToExpression(value) {
    // Reset if there was an error
    if (errorState) {
        handleClear();
        errorState = false;
    }
    
    // If starting a new calculation after getting a result
    if (lastResult && !currentExpression) {
        if (['+', '-', '*', '/', '%', '^'].includes(value)) {
            currentExpression = lastResult + value;
        } else {
            currentExpression = value;
            lastResult = '';
        }
    } else {
        currentExpression += value;
    }
    
    updateDisplay();
}

// Function to append a mathematical function
function appendFunction(func, closing) {
    // Reset if there was an error
    if (errorState) {
        handleClear();
        errorState = false;
    }
    
    if (closing === 2) {
        // Square function
        if (lastResult && !currentExpression) {
            currentExpression = `${func}${lastResult}, 2)`;
            lastResult = '';
        } else {
            // Need to handle different cases for squaring
            let lastNumber = getLastNumber();
            if (lastNumber) {
                // Remove the last number and add it inside the square function
                currentExpression = currentExpression.slice(0, currentExpression.length - lastNumber.length);
                currentExpression += `${func}${lastNumber}, 2)`;
            } else {
                currentExpression += `${func}`;
            }
        }
    } else if (closing === ')') {
        // Power function
        if (lastResult && !currentExpression) {
            currentExpression = `${func}${lastResult}, `;
            lastResult = '';
        } else {
            // Need to handle different cases for power
            let lastNumber = getLastNumber();
            if (lastNumber) {
                // Remove the last number and add it inside the power function
                currentExpression = currentExpression.slice(0, currentExpression.length - lastNumber.length);
                currentExpression += `${func}${lastNumber}, `;
            } else {
                currentExpression += `${func}`;
            }
        }
    } else {
        // Other functions
        if (lastResult && !currentExpression) {
            currentExpression = `${func}${lastResult})`;
            lastResult = '';
        } else {
            currentExpression += `${func}`;
        }
    }
    
    updateDisplay();
}

// Helper function to get the last number in the expression
function getLastNumber() {
    const match = currentExpression.match(/[\d.]+$/);
    return match ? match[0] : '';
}

// Function to calculate the result
function calculateResult() {
    if (!currentExpression) return;
    
    try {
        // Replace ^ with Math.pow for exponentiation
        let expressionToEvaluate = currentExpression.replace(/\^/g, '**');
        
        // Fix incomplete power expressions
        if (expressionToEvaluate.includes('Math.pow(') && expressionToEvaluate.split('Math.pow(').length > expressionToEvaluate.split(')').length) {
            expressionToEvaluate += ')';
        }
        
        // Ensure all parentheses are closed
        const openParenCount = (expressionToEvaluate.match(/\(/g) || []).length;
        const closeParenCount = (expressionToEvaluate.match(/\)/g) || []).length;
        
        for (let i = 0; i < openParenCount - closeParenCount; i++) {
            expressionToEvaluate += ')';
        }
        
        // Evaluate the expression
        const result = eval(expressionToEvaluate);
        
        // Format the result
        if (Number.isFinite(result)) {
            if (Number.isInteger(result)) {
                lastResult = result.toString();
            } else {
                // Limit decimal places to avoid long floating-point numbers
                lastResult = parseFloat(result.toFixed(10)).toString();
            }
            resultElement.textContent = lastResult;
        } else {
            resultElement.textContent = 'Error';
            errorState = true;
        }
    } catch (error) {
        resultElement.textContent = 'Error';
        errorState = true;
    }
}

// Function to clear the calculator
function handleClear() {
    currentExpression = '';
    lastResult = '';
    errorState = false;
    updateDisplay();
    resultElement.textContent = '0';
}

// Function to handle backspace
function handleBackspace() {
    if (errorState) {
        handleClear();
        return;
    }
    
    // Handle special functions
    if (currentExpression.endsWith('Math.PI')) {
        currentExpression = currentExpression.slice(0, -7);
    } else if (currentExpression.endsWith('Math.E')) {
        currentExpression = currentExpression.slice(0, -6);
    } else if (currentExpression.endsWith('Math.sin(')) {
        currentExpression = currentExpression.slice(0, -9);
    } else if (currentExpression.endsWith('Math.cos(')) {
        currentExpression = currentExpression.slice(0, -9);
    } else if (currentExpression.endsWith('Math.tan(')) {
        currentExpression = currentExpression.slice(0, -9);
    } else if (currentExpression.endsWith('Math.log10(')) {
        currentExpression = currentExpression.slice(0, -11);
    } else if (currentExpression.endsWith('Math.sqrt(')) {
        currentExpression = currentExpression.slice(0, -10);
    } else if (currentExpression.endsWith('Math.pow(')) {
        currentExpression = currentExpression.slice(0, -9);
    } else if (currentExpression.endsWith('Math.log(')) {
        currentExpression = currentExpression.slice(0, -9);
    } else {
        currentExpression = currentExpression.slice(0, -1);
    }
    
    updateDisplay();
    
    // Update result for immediate feedback
    if (currentExpression) {
        try {
            const result = eval(currentExpression.replace(/\^/g, '**'));
            if (Number.isFinite(result)) {
                resultElement.textContent = result;
            }
        } catch (e) {
            // Don't update the result if there's an error
        }
    } else {
        resultElement.textContent = '0';
    }
}

// Function to update the display
function updateDisplay() {
    // Format the expression for display
    let displayExpression = currentExpression
        .replace(/Math.PI/g, 'π')
        .replace(/Math.E/g, 'e')
        .replace(/Math.sin\(/g, 'sin(')
        .replace(/Math.cos\(/g, 'cos(')
        .replace(/Math.tan\(/g, 'tan(')
        .replace(/Math.log10\(/g, 'log(')
        .replace(/Math.sqrt\(/g, '√(')
        .replace(/Math.pow\(/g, 'pow(')
        .replace(/Math.log\(/g, 'ln(')
        .replace(/\*/g, '×');
    
    expressionElement.textContent = displayExpression;
}

// Initialize calculator display
updateDisplay();

// Add keyboard support
document.addEventListener('keydown', (event) => {
    const key = event.key;
    
    // Number and basic operator keys
    if (/[\d.+\-*/%^()]/.test(key)) {
        event.preventDefault();
        appendToExpression(key);
    } 
    // Enter key for equals
    else if (key === 'Enter') {
        event.preventDefault();
        calculateResult();
    } 
    // Backspace key
    else if (key === 'Backspace') {
        event.preventDefault();
        handleBackspace();
    } 
    // Escape key for clear
    else if (key === 'Escape') {
        event.preventDefault();
        handleClear();
    }
});

// Helper function for future extensions - showing different modes
function switchMode(mode) {
    // This function is a placeholder for future extensions
    // It would hide/show different sections based on the selected mode
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(`${mode}-btn`).classList.add('active');
    
    document.querySelectorAll('.calculator-section').forEach(section => {
        section.classList.add('hidden');
    });
    
    document.getElementById(`${mode}-section`).classList.remove('hidden');
}