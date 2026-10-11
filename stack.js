// ===== DOM ELEMENTS =====
const pushValueInput = document.getElementById('pushValue');
const maxSizeInput = document.getElementById('maxSize');
const maxSizeValue = document.getElementById('maxSizeValue');
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');
const pushBtn = document.getElementById('pushBtn');
const popBtn = document.getElementById('popBtn');
const peekBtn = document.getElementById('peekBtn');
const clearBtn = document.getElementById('clearBtn');
const stackContainer = document.getElementById('stackContainer');
const emptyMessage = document.getElementById('emptyMessage');
const statusMessage = document.getElementById('statusMessage');
const stackSizeDisplay = document.getElementById('stackSize');
const stackCapacityDisplay = document.getElementById('stackCapacity');
const peekValueDisplay = document.getElementById('peekValue');
const peekBadge = document.getElementById('peekBadge');
const totalPushesDisplay = document.getElementById('totalPushes');
const totalPopsDisplay = document.getElementById('totalPops');
const lastOperationDisplay = document.getElementById('lastOperation');

// ===== STATE VARIABLES =====
let stack = [];
let maxSize = 8;
let animationSpeed = 300;
let isAnimating = false;
let totalPushes = 0;
let totalPops = 0;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updateDisplay();
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    maxSizeInput.addEventListener('input', (e) => {
        maxSize = parseInt(e.target.value);
        maxSizeValue.textContent = maxSize;
        stackCapacityDisplay.textContent = maxSize;
    });

    speedControl.addEventListener('input', (e) => {
        animationSpeed = parseInt(e.target.value);
        speedValue.textContent = `${animationSpeed}ms`;
    });

    pushBtn.addEventListener('click', push);
    popBtn.addEventListener('click', pop);
    peekBtn.addEventListener('click', peek);
    clearBtn.addEventListener('click', clear);

    pushValueInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            push();
        }
    });
}

// ===== STACK OPERATIONS =====
async function push() {
    if (isAnimating) return;

    const value = parseInt(pushValueInput.value);

    if (isNaN(value)) {
        updateStatus('⚠️ Please enter a valid number');
        pushValueInput.focus();
        return;
    }

    if (stack.length >= maxSize) {
        updateStatus('❌ Stack Overflow! Cannot push - stack is full');
        flashContainer('overflow');
        return;
    }

    isAnimating = true;

    // Add to stack
    stack.push(value);
    totalPushes++;

    // Create visual element
    const element = document.createElement('div');
    element.className = 'stack-element pushing';
    element.textContent = value;
    element.id = `stack-element-${stack.length - 1}`;

    // Insert at the beginning (top of visual stack)
    if (stackContainer.firstChild) {
        stackContainer.insertBefore(element, stackContainer.firstChild);
    } else {
        stackContainer.appendChild(element);
    }

    emptyMessage.style.display = 'none';

    updateStatus(`✅ Pushed ${value} onto the stack`);
    updateDisplay();
    lastOperationDisplay.textContent = `Push(${value})`;

    // Animation
    await sleep(50);
    element.classList.remove('pushing');
    element.classList.add('pushed');

    await sleep(animationSpeed);
    element.classList.remove('pushed');

    pushValueInput.value = '';
    pushValueInput.focus();

    isAnimating = false;
}

async function pop() {
    if (isAnimating) return;

    if (stack.length === 0) {
        updateStatus('❌ Stack Underflow! Cannot pop - stack is empty');
        flashContainer('underflow');
        return;
    }

    isAnimating = true;

    // Get top element
    const value = stack.pop();
    totalPops++;

    // Animate removal
    const topElement = stackContainer.firstChild;
    if (topElement && topElement.classList.contains('stack-element')) {
        topElement.classList.add('popping');

        updateStatus(`🗑️ Popping ${value} from the stack...`);

        await sleep(animationSpeed);

        topElement.remove();
    }

    if (stack.length === 0) {
        emptyMessage.style.display = 'block';
    }

    updateStatus(`✅ Popped ${value} from the stack`);
    updateDisplay();
    lastOperationDisplay.textContent = `Pop() → ${value}`;

    isAnimating = false;
}

async function peek() {
    if (stack.length === 0) {
        updateStatus('⚠️ Cannot peek - stack is empty');
        return;
    }

    const topElement = stackContainer.firstChild;
    if (topElement && topElement.classList.contains('stack-element')) {
        topElement.classList.add('peeking');

        const value = stack[stack.length - 1];
        updateStatus(`👀 Top element is: ${value}`);
        peekBadge.classList.add('highlight');

        await sleep(animationSpeed * 2);

        topElement.classList.remove('peeking');
        peekBadge.classList.remove('highlight');
    }

    lastOperationDisplay.textContent = `Peek() → ${stack[stack.length - 1]}`;
}

async function clear() {
    if (isAnimating) return;
    if (stack.length === 0) {
        updateStatus('Stack is already empty');
        return;
    }

    isAnimating = true;
    updateStatus('🗑️ Clearing stack...');

    // Animate clearing all elements
    const elements = stackContainer.querySelectorAll('.stack-element');
    for (const element of elements) {
        element.classList.add('popping');
        await sleep(100);
    }

    await sleep(animationSpeed);

    // Remove all elements
    stack = [];
    stackContainer.innerHTML = '<div class="stack-empty-message" id="emptyMessage">Stack is empty</div>';

    updateStatus('✅ Stack cleared');
    updateDisplay();
    lastOperationDisplay.textContent = 'Clear()';

    isAnimating = false;
}

// ===== DISPLAY HELPERS =====
function updateDisplay() {
    stackSizeDisplay.textContent = stack.length;
    peekValueDisplay.textContent = stack.length > 0 ? stack[stack.length - 1] : '-';
    totalPushesDisplay.textContent = totalPushes;
    totalPopsDisplay.textContent = totalPops;
}

function updateStatus(message) {
    statusMessage.textContent = message;
}

async function flashContainer(type) {
    stackContainer.classList.add(type);
    await sleep(500);
    stackContainer.classList.remove(type);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
