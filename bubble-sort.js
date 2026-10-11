// ===== DOM ELEMENTS =====
const arraySizeInput = document.getElementById('arraySize');
const arraySizeValue = document.getElementById('arraySizeValue');
const customArrayInput = document.getElementById('customArray');
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');
const generateBtn = document.getElementById('generateBtn');
const sortBtn = document.getElementById('sortBtn');
const resetBtn = document.getElementById('resetBtn');
const ascBtn = document.getElementById('ascBtn');
const descBtn = document.getElementById('descBtn');
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
let isAscending = true;

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
    sortBtn.addEventListener('click', startBubbleSort);
    resetBtn.addEventListener('click', resetVisualization);

    ascBtn.addEventListener('click', () => {
        isAscending = true;
        ascBtn.classList.add('active');
        descBtn.classList.remove('active');
    });

    descBtn.addEventListener('click', () => {
        isAscending = false;
        descBtn.classList.add('active');
        ascBtn.classList.remove('active');
    });

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

// ===== BUBBLE SORT VISUALIZATION =====
async function startBubbleSort() {
    if (isSorting || array.length === 0) return;

    isSorting = true;
    resetStats();

    sortBtn.disabled = true;
    generateBtn.disabled = true;

    clearAllStates();
    updateStatus('🔄 Starting Bubble Sort...');

    await bubbleSort();

    // Mark all as sorted
    markAllSorted();

    updateStatus(`✅ Sorting complete! Total comparisons: ${comparisons}, Total swaps: ${swaps}`);

    isSorting = false;
    sortBtn.disabled = false;
    generateBtn.disabled = false;
}

async function bubbleSort() {
    const n = array.length;

    for (let i = 0; i < n - 1; i++) {
        currentPass = i + 1;
        currentPassDisplay.textContent = currentPass;

        let swapped = false;

        for (let j = 0; j < n - i - 1; j++) {
            // Highlight comparing elements
            highlightBars([j, j + 1], 'comparing');
            updateStatus(`Pass ${currentPass}: Comparing ${array[j]} and ${array[j + 1]}`);

            await sleep(animationSpeed);

            comparisons++;
            comparisonsDisplay.textContent = comparisons;

            const shouldSwap = isAscending
                ? array[j] > array[j + 1]
                : array[j] < array[j + 1];

            if (shouldSwap) {
                // Highlight as swapping
                highlightBars([j, j + 1], 'swapping');
                updateStatus(`Swapping ${array[j]} and ${array[j + 1]}`);

                await sleep(animationSpeed / 2);

                // Perform swap
                [array[j], array[j + 1]] = [array[j + 1], array[j]];
                updateBars();

                swaps++;
                swapsDisplay.textContent = swaps;
                swapped = true;

                await sleep(animationSpeed / 2);
            }

            // Remove highlighting
            clearHighlights([j, j + 1]);
        }

        // Mark the last element of this pass as sorted
        markAsSorted(n - i - 1);

        // Optimization: if no swaps, array is already sorted
        if (!swapped) {
            updateStatus('🚀 Array already sorted! No more swaps needed.');
            break;
        }
    }

    // Mark the first element as sorted (it's in position after all passes)
    markAsSorted(0);
}

// ===== VISUALIZATION HELPERS =====
function highlightBars(indices, state) {
    indices.forEach(index => {
        const bar = document.getElementById(`bar-${index}`);
        bar.classList.remove('comparing', 'swapping', 'sorted');
        bar.classList.add(state);
    });
}

function clearHighlights(indices) {
    indices.forEach(index => {
        const bar = document.getElementById(`bar-${index}`);
        bar.classList.remove('comparing', 'swapping');
    });
}

function markAsSorted(index) {
    const bar = document.getElementById(`bar-${index}`);
    bar.classList.remove('comparing', 'swapping');
    bar.classList.add('sorted');
}

function markAllSorted() {
    array.forEach((_, index) => {
        const bar = document.getElementById(`bar-${index}`);
        bar.classList.remove('comparing', 'swapping');
        bar.classList.add('sorted');
    });
}

function clearAllStates() {
    array.forEach((_, index) => {
        const bar = document.getElementById(`bar-${index}`);
        bar.classList.remove('comparing', 'swapping', 'sorted');
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
