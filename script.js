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
const pointersContainer = document.getElementById('pointersContainer');
const statusMessage = document.getElementById('statusMessage');
const comparisonsDisplay = document.getElementById('comparisons');
const currentStepDisplay = document.getElementById('currentStep');
const arrayLengthDisplay = document.getElementById('arrayLength');

// ===== STATE VARIABLES =====
let array = [];
let isSearching = false;
let animationSpeed = 800;
let comparisons = 0;
let currentStep = 0;

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
    
    searchBtn.addEventListener('click', startBinarySearch);
    
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
    
    // Generate random sorted array
    const usedNumbers = new Set();
    while (array.length < size) {
        const num = Math.floor(Math.random() * 100) + 1;
        if (!usedNumbers.has(num)) {
            usedNumbers.add(num);
            array.push(num);
        }
    }
    
    // Sort the array
    array.sort((a, b) => a - b);
    
    // Update custom array input
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
            // Sort the array to ensure binary search works correctly
            array = parsed.sort((a, b) => a - b);
            customArrayInput.value = array.join(', ');
            renderArray();
            updateStats();
            updateStatus('Custom array loaded! Make sure it\'s sorted for binary search to work correctly.');
        }
    } catch (e) {
        updateStatus('Invalid array format. Please use comma-separated numbers.');
    }
}

// ===== ARRAY RENDERING =====
function renderArray() {
    arrayContainer.innerHTML = '';
    indicesContainer.innerHTML = '';
    pointersContainer.innerHTML = '';
    
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

// ===== BINARY SEARCH VISUALIZATION =====
async function startBinarySearch() {
    if (isSearching || array.length === 0) return;
    
    const target = parseInt(targetValueInput.value);
    
    if (isNaN(target)) {
        updateStatus('⚠️ Please enter a valid target value to search for');
        targetValueInput.focus();
        return;
    }
    
    isSearching = true;
    comparisons = 0;
    currentStep = 0;
    
    // Disable buttons during search
    searchBtn.disabled = true;
    generateBtn.disabled = true;
    
    // Reset all element styles
    resetElementStyles();
    
    updateStatus(`🔍 Searching for ${target} in the array...`);
    
    const result = await binarySearch(target);
    
    if (result !== -1) {
        updateStatus(`✅ Found ${target} at index ${result}! Total comparisons: ${comparisons}`);
        const foundElement = document.getElementById(`element-${result}`);
        foundElement.classList.add('found');
    } else {
        updateStatus(`❌ ${target} not found in the array. Total comparisons: ${comparisons}`);
    }
    
    isSearching = false;
    searchBtn.disabled = false;
    generateBtn.disabled = false;
}

async function binarySearch(target) {
    let low = 0;
    let high = array.length - 1;
    
    while (low <= high) {
        currentStep++;
        updateStats();
        
        const mid = Math.floor((low + high) / 2);
        
        // Update pointers visualization
        updatePointers(low, mid, high);
        
        // Highlight current search range
        highlightRange(low, mid, high);
        
        // Wait for animation
        await sleep(animationSpeed);
        
        comparisons++;
        updateStats();
        
        updateStatus(`Step ${currentStep}: Checking index ${mid} (value: ${array[mid]}). Target: ${target}`);
        
        if (array[mid] === target) {
            // Found the target
            return mid;
        } else if (array[mid] < target) {
            // Eliminate left half
            updateStatus(`${array[mid]} < ${target}, searching in the right half...`);
            
            // Mark eliminated elements
            for (let i = low; i <= mid; i++) {
                const elem = document.getElementById(`element-${i}`);
                elem.classList.remove('low', 'mid');
                elem.classList.add('eliminated');
            }
            
            await sleep(animationSpeed / 2);
            low = mid + 1;
        } else {
            // Eliminate right half
            updateStatus(`${array[mid]} > ${target}, searching in the left half...`);
            
            // Mark eliminated elements
            for (let i = mid; i <= high; i++) {
                const elem = document.getElementById(`element-${i}`);
                elem.classList.remove('high', 'mid');
                elem.classList.add('eliminated');
            }
            
            await sleep(animationSpeed / 2);
            high = mid - 1;
        }
    }
    
    return -1; // Not found
}

// ===== VISUALIZATION HELPERS =====
function highlightRange(low, mid, high) {
    // Remove previous highlights
    document.querySelectorAll('.array-element').forEach(el => {
        el.classList.remove('low', 'mid', 'high');
    });
    
    // Add new highlights
    if (low >= 0 && low < array.length) {
        document.getElementById(`element-${low}`).classList.add('low');
    }
    if (high >= 0 && high < array.length) {
        document.getElementById(`element-${high}`).classList.add('high');
    }
    if (mid >= 0 && mid < array.length) {
        const midElem = document.getElementById(`element-${mid}`);
        midElem.classList.remove('low', 'high');
        midElem.classList.add('mid');
    }
}

function updatePointers(low, mid, high) {
    const elements = document.querySelectorAll('.array-element');
    if (elements.length === 0) return;
    
    const firstElement = elements[0];
    const elementWidth = firstElement.offsetWidth;
    const gap = 8; // Gap between elements
    
    // Calculate the starting position of the array
    const containerWidth = arrayContainer.offsetWidth;
    const totalArrayWidth = (elementWidth + gap) * array.length - gap;
    const startOffset = (containerWidth - totalArrayWidth) / 2;
    
    pointersContainer.innerHTML = '';
    
    const pointerGroup = document.createElement('div');
    pointerGroup.className = 'pointer-group';
    pointerGroup.style.width = `${containerWidth}px`;
    
    // Create Low pointer
    if (low >= 0 && low < array.length) {
        const lowPointer = createPointer('LOW', 'low', low, elementWidth, gap, startOffset);
        pointerGroup.appendChild(lowPointer);
    }
    
    // Create Mid pointer
    if (mid >= 0 && mid < array.length) {
        const midPointer = createPointer('MID', 'mid', mid, elementWidth, gap, startOffset);
        pointerGroup.appendChild(midPointer);
    }
    
    // Create High pointer
    if (high >= 0 && high < array.length) {
        const highPointer = createPointer('HIGH', 'high', high, elementWidth, gap, startOffset);
        pointerGroup.appendChild(highPointer);
    }
    
    pointersContainer.appendChild(pointerGroup);
}

function createPointer(label, type, index, elementWidth, gap, startOffset) {
    const pointer = document.createElement('div');
    pointer.className = `pointer ${type}`;
    
    const leftPos = startOffset + index * (elementWidth + gap) + elementWidth / 2;
    pointer.style.left = `${leftPos}px`;
    pointer.style.transform = 'translateX(-50%)';
    
    const pointerLabel = document.createElement('span');
    pointerLabel.className = 'pointer-label';
    pointerLabel.textContent = label;
    
    const arrow = document.createElement('div');
    arrow.className = 'pointer-arrow';
    
    pointer.appendChild(pointerLabel);
    pointer.appendChild(arrow);
    
    return pointer;
}

function resetElementStyles() {
    document.querySelectorAll('.array-element').forEach(el => {
        el.classList.remove('low', 'mid', 'high', 'found', 'eliminated');
    });
    pointersContainer.innerHTML = '';
}

function resetVisualization() {
    if (isSearching) return;
    
    resetElementStyles();
    comparisons = 0;
    currentStep = 0;
    updateStats();
    updateStatus('Visualization reset. Ready to search!');
}

// ===== UTILITY FUNCTIONS =====
function updateStatus(message) {
    statusMessage.textContent = message;
}

function updateStats() {
    comparisonsDisplay.textContent = comparisons;
    currentStepDisplay.textContent = currentStep;
    arrayLengthDisplay.textContent = array.length;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
