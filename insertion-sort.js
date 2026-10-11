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
const shiftsDisplay = document.getElementById('shifts');
const currentKeyDisplay = document.getElementById('currentKey');

// ===== STATE VARIABLES =====
let array = [];
let originalArray = [];
let isSorting = false;
let animationSpeed = 400;
let comparisons = 0;
let shifts = 0;

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
    sortBtn.addEventListener('click', startInsertionSort);
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

// ===== INSERTION SORT VISUALIZATION =====
async function startInsertionSort() {
    if (isSorting || array.length === 0) return;

    isSorting = true;
    resetStats();

    sortBtn.disabled = true;
    generateBtn.disabled = true;

    clearAllStates();

    // Mark first element as sorted
    markAsSorted(0);
    updateStatus('🔄 Starting Insertion Sort... First element is already sorted.');
    await sleep(animationSpeed);

    await insertionSort();

    markAllSorted();

    updateStatus(`✅ Sorting complete! Total comparisons: ${comparisons}, Total shifts: ${shifts}`);

    isSorting = false;
    sortBtn.disabled = false;
    generateBtn.disabled = false;
}

async function insertionSort() {
    const n = array.length;

    for (let i = 1; i < n; i++) {
        const key = array[i];
        currentKeyDisplay.textContent = key;

        // Highlight the key element
        highlightBar(i, 'key');
        updateStatus(`Picking key element: ${key} at index ${i}`);
        await sleep(animationSpeed);

        let j = i - 1;

        // Compare and shift elements
        while (j >= 0) {
            comparisons++;
            comparisonsDisplay.textContent = comparisons;

            // Highlight element being compared
            highlightBar(j, 'comparing');
            updateStatus(`Comparing ${array[j]} with key ${key}`);
            await sleep(animationSpeed / 2);

            if (array[j] > key) {
                // Shift element to the right
                highlightBar(j, 'shifting');
                updateStatus(`${array[j]} > ${key}, shifting ${array[j]} to the right`);

                array[j + 1] = array[j];
                shifts++;
                shiftsDisplay.textContent = shifts;

                updateBars();
                await sleep(animationSpeed / 2);

                clearBarState(j);
                j--;
            } else {
                clearBarState(j);
                break;
            }
        }

        // Insert key at correct position
        array[j + 1] = key;
        updateBars();

        updateStatus(`Inserting ${key} at position ${j + 1}`);
        highlightBar(j + 1, 'inserted');
        await sleep(animationSpeed);

        // Mark all elements up to i as sorted
        for (let k = 0; k <= i; k++) {
            markAsSorted(k);
        }

        await sleep(animationSpeed / 2);
    }

    currentKeyDisplay.textContent = '-';
}

// ===== VISUALIZATION HELPERS =====
function highlightBar(index, state) {
    const bar = document.getElementById(`bar-${index}`);
    bar.classList.remove('key', 'comparing', 'shifting', 'inserted', 'sorted');
    bar.classList.add(state);
}

function clearBarState(index) {
    const bar = document.getElementById(`bar-${index}`);
    bar.classList.remove('key', 'comparing', 'shifting', 'inserted');
}

function markAsSorted(index) {
    const bar = document.getElementById(`bar-${index}`);
    bar.classList.remove('key', 'comparing', 'shifting', 'inserted');
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
        bar.classList.remove('key', 'comparing', 'shifting', 'inserted', 'sorted');
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
    shifts = 0;
    comparisonsDisplay.textContent = '0';
    shiftsDisplay.textContent = '0';
    currentKeyDisplay.textContent = '-';
}

// ===== UTILITY FUNCTIONS =====
function updateStatus(message) {
    statusMessage.textContent = message;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
