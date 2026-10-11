// ===== DOM ELEMENTS =====
const enqueueValueInput = document.getElementById('enqueueValue');
const maxSizeInput = document.getElementById('maxSize');
const maxSizeValue = document.getElementById('maxSizeValue');
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');
const enqueueBtn = document.getElementById('enqueueBtn');
const dequeueBtn = document.getElementById('dequeueBtn');
const frontBtn = document.getElementById('frontBtn');
const clearBtn = document.getElementById('clearBtn');
const queueContainer = document.getElementById('queueContainer');
const emptyMessage = document.getElementById('emptyMessage');
const statusMessage = document.getElementById('statusMessage');
const queueSizeDisplay = document.getElementById('queueSize');
const queueCapacityDisplay = document.getElementById('queueCapacity');
const frontValueDisplay = document.getElementById('frontValue');
const rearValueDisplay = document.getElementById('rearValue');
const frontBadge = document.getElementById('frontBadge');
const rearBadge = document.getElementById('rearBadge');
const totalEnqueuesDisplay = document.getElementById('totalEnqueues');
const totalDequeuesDisplay = document.getElementById('totalDequeues');
const lastOperationDisplay = document.getElementById('lastOperation');

// ===== STATE VARIABLES =====
let queue = [];
let maxSize = 8;
let animationSpeed = 300;
let isAnimating = false;
let totalEnqueues = 0;
let totalDequeues = 0;

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
        queueCapacityDisplay.textContent = maxSize;
    });

    speedControl.addEventListener('input', (e) => {
        animationSpeed = parseInt(e.target.value);
        speedValue.textContent = `${animationSpeed}ms`;
    });

    enqueueBtn.addEventListener('click', enqueue);
    dequeueBtn.addEventListener('click', dequeue);
    frontBtn.addEventListener('click', showFront);
    clearBtn.addEventListener('click', clear);

    enqueueValueInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            enqueue();
        }
    });
}

// ===== QUEUE OPERATIONS =====
async function enqueue() {
    if (isAnimating) return;

    const value = parseInt(enqueueValueInput.value);

    if (isNaN(value)) {
        updateStatus('⚠️ Please enter a valid number');
        enqueueValueInput.focus();
        return;
    }

    if (queue.length >= maxSize) {
        updateStatus('❌ Queue Overflow! Cannot enqueue - queue is full');
        flashContainer('overflow');
        return;
    }

    isAnimating = true;

    // Add to queue (rear)
    queue.push(value);
    totalEnqueues++;

    // Create visual element
    const element = document.createElement('div');
    element.className = 'queue-element enqueuing';
    element.textContent = value;
    element.id = `queue-element-${queue.length - 1}`;

    // Add to the end (rear of queue)
    queueContainer.appendChild(element);

    emptyMessage.style.display = 'none';

    updateStatus(`✅ Enqueued ${value} at the rear of the queue`);
    updateDisplay();
    lastOperationDisplay.textContent = `Enqueue(${value})`;

    // Animation
    await sleep(50);
    element.classList.remove('enqueuing');
    element.classList.add('enqueued');

    await sleep(animationSpeed);
    element.classList.remove('enqueued');

    // Mark front and rear
    updateFrontRearMarkers();

    enqueueValueInput.value = '';
    enqueueValueInput.focus();

    isAnimating = false;
}

async function dequeue() {
    if (isAnimating) return;

    if (queue.length === 0) {
        updateStatus('❌ Queue Underflow! Cannot dequeue - queue is empty');
        flashContainer('underflow');
        return;
    }

    isAnimating = true;

    // Get front element
    const value = queue.shift();
    totalDequeues++;

    // Animate removal
    const frontElement = queueContainer.querySelector('.queue-element');
    if (frontElement) {
        frontElement.classList.add('dequeuing');

        updateStatus(`🗑️ Dequeuing ${value} from the front...`);

        await sleep(animationSpeed);

        frontElement.remove();

        // Re-index remaining elements
        reindexElements();
    }

    if (queue.length === 0) {
        emptyMessage.style.display = 'block';
    }

    updateStatus(`✅ Dequeued ${value} from the front of the queue`);
    updateDisplay();
    lastOperationDisplay.textContent = `Dequeue() → ${value}`;

    // Update markers
    updateFrontRearMarkers();

    isAnimating = false;
}

async function showFront() {
    if (queue.length === 0) {
        updateStatus('⚠️ Cannot get front - queue is empty');
        return;
    }

    const frontElement = queueContainer.querySelector('.queue-element');
    if (frontElement) {
        frontElement.classList.add('peeking');

        const value = queue[0];
        updateStatus(`👀 Front element is: ${value}`);
        frontBadge.classList.add('highlight');

        await sleep(animationSpeed * 2);

        frontElement.classList.remove('peeking');
        frontBadge.classList.remove('highlight');
    }

    lastOperationDisplay.textContent = `Front() → ${queue[0]}`;
}

async function clear() {
    if (isAnimating) return;
    if (queue.length === 0) {
        updateStatus('Queue is already empty');
        return;
    }

    isAnimating = true;
    updateStatus('🗑️ Clearing queue...');

    // Animate clearing all elements
    const elements = queueContainer.querySelectorAll('.queue-element');
    for (const element of elements) {
        element.classList.add('dequeuing');
        await sleep(100);
    }

    await sleep(animationSpeed);

    // Remove all elements
    queue = [];
    queueContainer.innerHTML = '<div class="queue-empty-message" id="emptyMessage">Queue is empty</div>';

    updateStatus('✅ Queue cleared');
    updateDisplay();
    lastOperationDisplay.textContent = 'Clear()';

    isAnimating = false;
}

// ===== DISPLAY HELPERS =====
function updateDisplay() {
    queueSizeDisplay.textContent = queue.length;
    frontValueDisplay.textContent = queue.length > 0 ? queue[0] : '-';
    rearValueDisplay.textContent = queue.length > 0 ? queue[queue.length - 1] : '-';
    totalEnqueuesDisplay.textContent = totalEnqueues;
    totalDequeuesDisplay.textContent = totalDequeues;
}

function updateFrontRearMarkers() {
    // Remove existing markers
    const elements = queueContainer.querySelectorAll('.queue-element');
    elements.forEach(el => {
        el.classList.remove('front-element', 'rear-element');
    });

    // Add new markers
    if (elements.length > 0) {
        elements[0].classList.add('front-element');
        elements[elements.length - 1].classList.add('rear-element');
    }
}

function reindexElements() {
    const elements = queueContainer.querySelectorAll('.queue-element');
    elements.forEach((el, index) => {
        el.id = `queue-element-${index}`;
    });
    updateFrontRearMarkers();
}

function updateStatus(message) {
    statusMessage.textContent = message;
}

async function flashContainer(type) {
    queueContainer.classList.add(type);
    await sleep(500);
    queueContainer.classList.remove(type);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
