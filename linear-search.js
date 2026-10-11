// ===== DOM ELEMENTS =====
const arraySizeInput = document.getElementById('arraySize');
const arraySizeValue = document.getElementById('arraySizeValue');
const customArrayInput = document.getElementById('customArray');
const targetValueInput = document.getElementById('targetValue');
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');
const generateBtn = document.getElementById('generateBtn');
const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');
const arrayContainer = document.getElementById('arrayContainer');
const indicesContainer = document.getElementById('indicesContainer');
const currentPointerContainer = document.getElementById('currentPointerContainer');
const statusMessage = document.getElementById('statusMessage');
const comparisonsDisplay = document.getElementById('comparisons');
const currentIndexDisplay = document.getElementById('currentIndex');
const arrayLengthDisplay = document.getElementById('arrayLength');

// ===== STATE VARIABLES =====
let array = [];
let isSearching = false;
let animationSpeed = 500;
let comparisons = 0;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    generateRandomArray();
    setupEventListeners();
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    arraySizeInput.addEventListener('input', (e) => {
        arraySizeValue.textContent = e.target.value;
    });

    speedControl.addEventListener('input', (e) => {
        animationSpeed = parseInt(e.target.value);
        speedValue.textContent = `${animationSpeed}ms`;
    });

    generateBtn.addEventListener('click', generateRandomArray);

    searchBtn.addEventListener('click', startLinearSearch);

    resetBtn.addEventListener('click', resetVisualization);

    customArrayInput.addEventListener('input', () => {
        const customValue = customArrayInput.value.trim();
        if (customValue) {
            parseCustomArray();
        }
    });
}

// ===== ARRAY GENERATION =====
function generateRandomArray() {
    if (isSearching) return;

    const size = parseInt(arraySizeInput.value);
    array = [];

    // Generate random unsorted array (linear search doesn't need sorted)
    const usedNumbers = new Set();
    while (array.length < size) {
        const num = Math.floor(Math.random() * 100) + 1;
        if (!usedNumbers.has(num)) {
            usedNumbers.add(num);
            array.push(num);
        }
    }

    // Update custom array input (NOT sorted for linear search)
    customArrayInput.value = array.join(', ');

    // Render the array
    renderArray();
    updateStats();
    updateStatus('Random array generated! Enter a target value and click "Start Search"');
}

function parseCustomArray() {
    const input = customArrayInput.value.trim();
    if (!input) return;

    try {
        const parsed = input.split(',')
            .map(s => parseInt(s.trim()))
            .filter(n => !isNaN(n));

        if (parsed.length > 0) {
            array = parsed; // Keep original order for linear search
            renderArray();
            updateStats();
            updateStatus('Custom array loaded! Ready to search.');
        }
    } catch (e) {
        updateStatus('Invalid array format. Please use comma-separated numbers.');
    }
}

// ===== ARRAY RENDERING =====
function renderArray() {
    arrayContainer.innerHTML = '';
    indicesContainer.innerHTML = '';
    currentPointerContainer.innerHTML = '';

    array.forEach((value, index) => {
        // Create array element
        const element = document.createElement('div');
        element.className = 'array-element';
        element.id = `element-${index}`;
        element.textContent = value;
        arrayContainer.appendChild(element);

        // Create index label
        const indexLabel = document.createElement('div');
        indexLabel.className = 'index-label';
        indexLabel.textContent = index;
        indicesContainer.appendChild(indexLabel);
    });

    arrayLengthDisplay.textContent = array.length;
}

// ===== LINEAR SEARCH VISUALIZATION =====
async function startLinearSearch() {
    if (isSearching || array.length === 0) return;

    const target = parseInt(targetValueInput.value);

    if (isNaN(target)) {
        updateStatus('⚠️ Please enter a valid target value to search for');
        targetValueInput.focus();
        return;
    }

    isSearching = true;
    comparisons = 0;

    // Disable buttons during search
    searchBtn.disabled = true;
    generateBtn.disabled = true;

    // Reset all element styles
    resetElementStyles();

    updateStatus(`🔍 Searching for ${target} in the array...`);

    const result = await linearSearch(target);

    if (result !== -1) {
        updateStatus(`✅ Found ${target} at index ${result}! Total comparisons: ${comparisons}`);
        const foundElement = document.getElementById(`element-${result}`);
        foundElement.classList.add('found');
    } else {
        updateStatus(`❌ ${target} not found in the array. Total comparisons: ${comparisons}`);
    }

    // Clear pointer after search
    currentPointerContainer.innerHTML = '';

    isSearching = false;
    searchBtn.disabled = false;
    generateBtn.disabled = false;
}

async function linearSearch(target) {
    for (let i = 0; i < array.length; i++) {
        comparisons++;
        updateStats();
        currentIndexDisplay.textContent = i;

        // Update pointer
        updatePointer(i);

        // Highlight current element being checked
        const currentElement = document.getElementById(`element-${i}`);
        currentElement.classList.add('current');

        updateStatus(`Step ${comparisons}: Checking index ${i} → Is ${array[i]} equal to ${target}?`);

        // Wait for animation
        await sleep(animationSpeed);

        if (array[i] === target) {
            // Found!
            return i;
        }

        // Mark as checked and move on
        currentElement.classList.remove('current');
        currentElement.classList.add('checked');

        updateStatus(`${array[i]} ≠ ${target}, moving to next element...`);

        await sleep(animationSpeed / 3);
    }

    return -1; // Not found
}

// ===== VISUALIZATION HELPERS =====
function updatePointer(index) {
    const elements = document.querySelectorAll('.array-element');
    if (elements.length === 0) return;

    const firstElement = elements[0];
    const elementWidth = firstElement.offsetWidth;
    const gap = 8;

    const containerWidth = arrayContainer.offsetWidth;
    const totalArrayWidth = (elementWidth + gap) * array.length - gap;
    const startOffset = (containerWidth - totalArrayWidth) / 2;

    currentPointerContainer.innerHTML = '';

    const pointerGroup = document.createElement('div');
    pointerGroup.className = 'pointer-group';
    pointerGroup.style.width = `${containerWidth}px`;

    const pointer = document.createElement('div');
    pointer.className = 'pointer current-pointer';

    const leftPos = startOffset + index * (elementWidth + gap) + elementWidth / 2;
    pointer.style.left = `${leftPos}px`;
    pointer.style.transform = 'translateX(-50%)';

    const pointerLabel = document.createElement('span');
    pointerLabel.className = 'pointer-label';
    pointerLabel.textContent = 'i';

    const arrow = document.createElement('div');
    arrow.className = 'pointer-arrow';

    pointer.appendChild(pointerLabel);
    pointer.appendChild(arrow);
    pointerGroup.appendChild(pointer);

    currentPointerContainer.appendChild(pointerGroup);
}

function resetElementStyles() {
    document.querySelectorAll('.array-element').forEach(el => {
        el.classList.remove('current', 'checked', 'found');
    });
    currentPointerContainer.innerHTML = '';
}

function resetVisualization() {
    if (isSearching) return;

    resetElementStyles();
    comparisons = 0;
    currentIndexDisplay.textContent = '-';
    updateStats();
    updateStatus('Visualization reset. Ready to search!');
}

// ===== UTILITY FUNCTIONS =====
function updateStatus(message) {
    statusMessage.textContent = message;
}

function updateStats() {
    comparisonsDisplay.textContent = comparisons;
    arrayLengthDisplay.textContent = array.length;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
