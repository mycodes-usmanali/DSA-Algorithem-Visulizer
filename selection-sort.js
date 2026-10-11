// ===== DOM ELEMENTS =====
const arraySizeInput = document.getElementById('arraySize');
const arraySizeValue = document.getElementById('arraySizeValue');
const customArrayInput = document.getElementById('customArray');
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');
const generateBtn = document.getElementById('generateBtn');
const sortBtn = document.getElementById('sortBtn');
const resetBtn = document.getElementById('resetBtn');
const barsContainer = document.getElementById('barsContainer');
const statusMessage = document.getElementById('statusMessage');
const comparisonsDisplay = document.getElementById('comparisons');
const swapsDisplay = document.getElementById('swaps');
const currentPassDisplay = document.getElementById('currentPass');

// ===== STATE VARIABLES =====
let array = [];
let originalArray = [];
let isSorting = false;
let animationSpeed = 400;
let comparisons = 0;
let swaps = 0;
let currentPass = 0;

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
    sortBtn.addEventListener('click', startSelectionSort);
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
    if (isSorting) return;

    const size = parseInt(arraySizeInput.value);
    array = [];

    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * 90) + 10);
    }

    originalArray = [...array];
    customArrayInput.value = array.join(', ');

    renderBars();
    resetStats();
    updateStatus('Random array generated! Click "Start Sorting" to begin');
}

function parseCustomArray() {
    const input = customArrayInput.value.trim();
    if (!input) return;

    try {
        const parsed = input.split(',')
            .map(s => parseInt(s.trim()))
            .filter(n => !isNaN(n) && n > 0 && n <= 100);

        if (parsed.length > 0 && parsed.length <= 15) {
            array = parsed;
            originalArray = [...array];
            renderBars();
            resetStats();
            updateStatus('Custom array loaded! Ready to sort.');
        } else if (parsed.length > 15) {
            updateStatus('⚠️ Please use 15 or fewer elements for better visualization.');
        }
    } catch (e) {
        updateStatus('Invalid array format. Please use comma-separated numbers.');
    }
}

// ===== BAR RENDERING =====
function renderBars() {
    barsContainer.innerHTML = '';
    const maxValue = Math.max(...array);
    const containerHeight = 250;

    array.forEach((value, index) => {
        const barWrapper = document.createElement('div');
        barWrapper.className = 'bar-wrapper';
        barWrapper.id = `bar-wrapper-${index}`;

        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.id = `bar-${index}`;
        const height = (value / maxValue) * containerHeight;
        bar.style.height = `${height}px`;

        const label = document.createElement('span');
        label.className = 'bar-label';
        label.textContent = value;

        barWrapper.appendChild(bar);
        barWrapper.appendChild(label);
        barsContainer.appendChild(barWrapper);
    });
}

function updateBars() {
    const maxValue = Math.max(...array);
    const containerHeight = 250;

    array.forEach((value, index) => {
        const bar = document.getElementById(`bar-${index}`);
        const barWrapper = document.getElementById(`bar-wrapper-${index}`);
        const label = barWrapper.querySelector('.bar-label');

        const height = (value / maxValue) * containerHeight;
        bar.style.height = `${height}px`;
        label.textContent = value;
    });
}

// ===== SELECTION SORT VISUALIZATION =====
async function startSelectionSort() {
    if (isSorting || array.length === 0) return;

    isSorting = true;
    resetStats();

    sortBtn.disabled = true;
    generateBtn.disabled = true;

    clearAllStates();
    updateStatus('🔄 Starting Selection Sort...');

    await selectionSort();

    markAllSorted();

    updateStatus(`✅ Sorting complete! Total comparisons: ${comparisons}, Total swaps: ${swaps}`);

    isSorting = false;
    sortBtn.disabled = false;
    generateBtn.disabled = false;
}

async function selectionSort() {
    const n = array.length;

    for (let i = 0; i < n - 1; i++) {
        currentPass = i + 1;
        currentPassDisplay.textContent = currentPass;

        // Highlight current position
        highlightBar(i, 'current-position');
        updateStatus(`Pass ${currentPass}: Finding minimum from index ${i} to ${n - 1}`);

        let minIdx = i;
        highlightBar(minIdx, 'minimum');

        await sleep(animationSpeed);

        // Scan for minimum
        for (let j = i + 1; j < n; j++) {
            // Highlight scanning element
            highlightBar(j, 'scanning');

            comparisons++;
            comparisonsDisplay.textContent = comparisons;

            updateStatus(`Comparing ${array[j]} with current minimum ${array[minIdx]}`);
            await sleep(animationSpeed / 2);

            if (array[j] < array[minIdx]) {
                // New minimum found
                if (minIdx !== i) {
                    clearBarState(minIdx);
                }
                minIdx = j;
                highlightBar(minIdx, 'minimum');
                updateStatus(`New minimum found: ${array[minIdx]} at index ${minIdx}`);
                await sleep(animationSpeed / 2);
            } else {
                clearBarState(j);
            }
        }

        // Swap if minimum is not at current position
        if (minIdx !== i) {
            updateStatus(`Swapping ${array[i]} at index ${i} with ${array[minIdx]} at index ${minIdx}`);
            highlightBar(i, 'swapping');
            highlightBar(minIdx, 'swapping');

            await sleep(animationSpeed);

            // Perform swap
            [array[i], array[minIdx]] = [array[minIdx], array[i]];
            updateBars();

            swaps++;
            swapsDisplay.textContent = swaps;

            await sleep(animationSpeed / 2);
        } else {
            updateStatus(`${array[i]} is already in correct position`);
            await sleep(animationSpeed / 2);
        }

        // Mark current position as sorted
        markAsSorted(i);
        if (minIdx !== i) {
            clearBarState(minIdx);
        }
    }

    // Mark last element as sorted
    markAsSorted(n - 1);
}

// ===== VISUALIZATION HELPERS =====
function highlightBar(index, state) {
    const bar = document.getElementById(`bar-${index}`);
    bar.classList.remove('current-position', 'minimum', 'scanning', 'swapping', 'sorted');
    bar.classList.add(state);
}

function clearBarState(index) {
    const bar = document.getElementById(`bar-${index}`);
    bar.classList.remove('current-position', 'minimum', 'scanning', 'swapping');
}

function markAsSorted(index) {
    const bar = document.getElementById(`bar-${index}`);
    bar.classList.remove('current-position', 'minimum', 'scanning', 'swapping');
    bar.classList.add('sorted');
}

function markAllSorted() {
    array.forEach((_, index) => {
        markAsSorted(index);
    });
}

function clearAllStates() {
    array.forEach((_, index) => {
        const bar = document.getElementById(`bar-${index}`);
        bar.classList.remove('current-position', 'minimum', 'scanning', 'swapping', 'sorted');
    });
}

function resetVisualization() {
    if (isSorting) return;

    array = [...originalArray];
    renderBars();
    resetStats();
    updateStatus('Visualization reset. Ready to sort!');
}

function resetStats() {
    comparisons = 0;
    swaps = 0;
    currentPass = 0;
    comparisonsDisplay.textContent = '0';
    swapsDisplay.textContent = '0';
    currentPassDisplay.textContent = '0';
}

// ===== UTILITY FUNCTIONS =====
function updateStatus(message) {
    statusMessage.textContent = message;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
