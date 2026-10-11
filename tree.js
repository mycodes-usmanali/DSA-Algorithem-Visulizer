// ===== DOM ELEMENTS =====
const treeCanvas = document.getElementById('treeCanvas');
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');
const nodeValueInput = document.getElementById('nodeValue');
const insertBtn = document.getElementById('insertBtn');
const deleteBtn = document.getElementById('deleteBtn');
const bstModeBtn = document.getElementById('bstModeBtn');
const avlModeBtn = document.getElementById('avlModeBtn');
const traverseBtn = document.getElementById('traverseBtn');
const traversalSelect = document.getElementById('traversalSelect');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const statusMessage = document.getElementById('statusMessage');
const nodeCountDisplay = document.getElementById('nodeCount');
const treeHeightDisplay = document.getElementById('treeHeight');
const balancedStatusDisplay = document.getElementById('balancedStatus');
const traversalResultText = document.getElementById('traversalResultText');

// ===== NODE DEFINITION =====
class Node {
    constructor(val) {
        this.value = val;
        this.left = null;
        this.right = null;
        this.height = 1;
        this.x = 0;
        this.y = 0;
        this.state = 'normal'; // 'normal', 'checking', 'visited', 'rotating'
    }
}

// ===== STATE VARIABLES =====
let root = null;
let treeMode = 'bst'; // 'bst' or 'avl'
let isOperating = false;
let isTraversing = false;
let animationSpeed = 800;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    resizeCanvas();
    generateRandomTree();
});

window.addEventListener('resize', () => {
    resizeCanvas();
    renderTree();
});

function resizeCanvas() {
    const container = treeCanvas.parentElement;
    treeCanvas.setAttribute('width', container.clientWidth);
    treeCanvas.setAttribute('height', 450);
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    speedControl.addEventListener('input', (e) => {
        animationSpeed = parseInt(e.target.value);
        speedValue.textContent = `${animationSpeed}ms`;
    });

    // Mode Selector
    bstModeBtn.addEventListener('click', () => {
        if (isOperating || isTraversing) return;
        bstModeBtn.classList.add('active');
        avlModeBtn.classList.remove('active');
        treeMode = 'bst';
        updateStatus('Switched to BST Mode (unbalanced).');
        updateStats();
    });

    avlModeBtn.addEventListener('click', () => {
        if (isOperating || isTraversing) return;
        avlModeBtn.classList.add('active');
        bstModeBtn.classList.remove('active');
        treeMode = 'avl';
        updateStatus('Switched to AVL Mode (self-balancing). Convert existing tree to AVL? Generating new balanced tree...');
        generateRandomTree();
    });

    // Operations
    insertBtn.addEventListener('click', handleInsert);
    deleteBtn.addEventListener('click', handleDelete);
    traverseBtn.addEventListener('click', handleTraversal);
    generateBtn.addEventListener('click', generateRandomTree);
    clearBtn.addEventListener('click', clearTree);
}

// ===== HELPER ACTIONS =====
function updateStatus(msg) {
    statusMessage.textContent = msg;
}

function disableButtons(disable) {
    insertBtn.disabled = disable;
    deleteBtn.disabled = disable;
    traverseBtn.disabled = disable;
    generateBtn.disabled = disable;
    clearBtn.disabled = disable;
    bstModeBtn.disabled = disable;
    avlModeBtn.disabled = disable;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===== HEIGHT & BALANCE UTILITIES =====
function getHeight(node) {
    return node ? node.height : 0;
}

function getBalanceFactor(node) {
    return node ? getHeight(node.left) - getHeight(node.right) : 0;
}

// ===== ROTATIONS =====
function rotateRight(y) {
    const x = y.left;
    const T2 = x.right;

    // Perform rotation
    x.right = y;
    y.left = T2;

    // Update heights
    y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
    x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;

    return x;
}

function rotateLeft(x) {
    const y = x.right;
    const T2 = y.left;

    // Perform rotation
    y.left = x;
    x.right = T2;

    // Update heights
    x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
    y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;

    return y;
}

// ===== INSERTION LOGIC =====
async function handleInsert() {
    if (isOperating || isTraversing) return;
    const value = parseInt(nodeValueInput.value);
    if (isNaN(value) || value < 1 || value > 99) {
        updateStatus('⚠️ Please enter a value between 1 and 99');
        nodeValueInput.focus();
        return;
    }

    isOperating = true;
    disableButtons(true);
    updateStatus(`Starting insertion of value ${value}...`);
    nodeValueInput.value = '';

    root = await insertNodeRecursive(root, value);
    resetNodeStates(root);
    renderTree();

    isOperating = false;
    disableButtons(false);
}

async function insertNodeRecursive(node, value) {
    if (!node) {
        updateStatus(`Empty subtree found. Node ${value} inserted here.`);
        const newNode = new Node(value);
        newNode.state = 'visited';
        return newNode;
    }

    node.state = 'checking';
    renderTree();
    updateStatus(`Comparing ${value} with node ${node.value}...`);
    await sleep(animationSpeed);
    node.state = 'normal';

    if (value < node.value) {
        updateStatus(`${value} < ${node.value}, traversing to left child...`);
        node.left = await insertNodeRecursive(node.left, value);
    } else if (value > node.value) {
        updateStatus(`${value} > ${node.value}, traversing to right child...`);
        node.right = await insertNodeRecursive(node.right, value);
    } else {
        updateStatus(`Value ${value} already exists in the tree!`);
        return node;
    }

    if (treeMode === 'avl') {
        node.height = Math.max(getHeight(node.left), getHeight(node.right)) + 1;
        return await balanceAVL(node, value);
    }

    return node;
}

async function balanceAVL(node, value) {
    const balance = getBalanceFactor(node);

    // LL Case
    if (balance > 1 && value < node.left.value) {
        updateStatus(`Imbalance detected at ${node.value} (BF: ${balance}). Left-Left imbalance: Performing Single Right Rotation.`);
        node.state = 'rotating';
        node.left.state = 'rotating';
        renderTree();
        await sleep(animationSpeed * 1.5);
        node.state = 'normal';
        node.left.state = 'normal';
        return rotateRight(node);
    }

    // RR Case
    if (balance < -1 && value > node.right.value) {
        updateStatus(`Imbalance detected at ${node.value} (BF: ${balance}). Right-Right imbalance: Performing Single Left Rotation.`);
        node.state = 'rotating';
        node.right.state = 'rotating';
        renderTree();
        await sleep(animationSpeed * 1.5);
        node.state = 'normal';
        node.right.state = 'normal';
        return rotateLeft(node);
    }

    // LR Case
    if (balance > 1 && value > node.left.value) {
        updateStatus(`Imbalance detected at ${node.value} (BF: ${balance}). Left-Right imbalance: Rotating Left on child ${node.left.value} first...`);
        node.left.state = 'rotating';
        node.left.right.state = 'rotating';
        renderTree();
        await sleep(animationSpeed);
        node.left.state = 'normal';
        node.left.right.state = 'normal';
        node.left = rotateLeft(node.left);
        renderTree();
        await sleep(animationSpeed / 2);

        updateStatus(`Then rotating Right on pivot node ${node.value}...`);
        node.state = 'rotating';
        node.left.state = 'rotating';
        renderTree();
        await sleep(animationSpeed * 1.5);
        node.state = 'normal';
        node.left.state = 'normal';
        return rotateRight(node);
    }

    // RL Case
    if (balance < -1 && value < node.right.value) {
        updateStatus(`Imbalance detected at ${node.value} (BF: ${balance}). Right-Left imbalance: Rotating Right on child ${node.right.value} first...`);
        node.right.state = 'rotating';
        node.right.left.state = 'rotating';
        renderTree();
        await sleep(animationSpeed);
        node.right.state = 'normal';
        node.right.left.state = 'normal';
        node.right = rotateRight(node.right);
        renderTree();
        await sleep(animationSpeed / 2);

        updateStatus(`Then rotating Left on pivot node ${node.value}...`);
        node.state = 'rotating';
        node.right.state = 'rotating';
        renderTree();
        await sleep(animationSpeed * 1.5);
        node.state = 'normal';
        node.right.state = 'normal';
        return rotateLeft(node);
    }

    return node;
}

// ===== DELETION LOGIC =====
async function handleDelete() {
    if (isOperating || isTraversing) return;
    const value = parseInt(nodeValueInput.value);
    if (isNaN(value)) {
        updateStatus('⚠️ Please enter a value to delete');
        nodeValueInput.focus();
        return;
    }

    isOperating = true;
    disableButtons(true);
    updateStatus(`Starting deletion of value ${value}...`);
    nodeValueInput.value = '';

    root = await deleteNodeRecursive(root, value);
    resetNodeStates(root);
    renderTree();

    isOperating = false;
    disableButtons(false);
}

async function deleteNodeRecursive(node, value) {
    if (!node) {
        updateStatus(`Node ${value} not found in the tree.`);
        return null;
    }

    node.state = 'checking';
    renderTree();
    updateStatus(`Searching for node ${value}. Current node: ${node.value}...`);
    await sleep(animationSpeed);
    node.state = 'normal';

    if (value < node.value) {
        node.left = await deleteNodeRecursive(node.left, value);
    } else if (value > node.value) {
        node.right = await deleteNodeRecursive(node.right, value);
    } else {
        // Node found
        updateStatus(`Node ${node.value} found! Removing node...`);
        await sleep(animationSpeed / 2);

        // Case 1: One or no children
        if (!node.left) {
            updateStatus(`Replacing ${node.value} with its right child.`);
            return node.right;
        } else if (!node.right) {
            updateStatus(`Replacing ${node.value} with its left child.`);
            return node.left;
        }

        // Case 2: Two children
        updateStatus(`Node ${node.value} has two children. Finding minimum node (inorder successor) in right subtree...`);
        const successor = getMinNode(node.right);
        
        successor.state = 'checking';
        renderTree();
        updateStatus(`Inorder successor found: ${successor.value}.`);
        await sleep(animationSpeed);
        successor.state = 'normal';

        updateStatus(`Replacing value of node ${node.value} with successor value ${successor.value}...`);
        node.value = successor.value;
        renderTree();
        await sleep(animationSpeed);

        updateStatus(`Now recursively deleting successor node ${successor.value} from the right subtree...`);
        node.right = await deleteNodeRecursive(node.right, successor.value);
    }

    if (treeMode === 'avl') {
        node.height = Math.max(getHeight(node.left), getHeight(node.right)) + 1;
        return await balanceAVLDelete(node);
    }

    return node;
}

function getMinNode(node) {
    let curr = node;
    while (curr.left) {
        curr = curr.left;
    }
    return curr;
}

async function balanceAVLDelete(node) {
    const balance = getBalanceFactor(node);

    // Left unbalanced
    if (balance > 1) {
        const leftBalance = getBalanceFactor(node.left);
        if (leftBalance >= 0) {
            updateStatus(`Imbalance at ${node.value} (BF: ${balance}). Left-Left case. Performing Right Rotation.`);
            node.state = 'rotating';
            node.left.state = 'rotating';
            renderTree();
            await sleep(animationSpeed);
            node.state = 'normal';
            node.left.state = 'normal';
            return rotateRight(node);
        } else {
            updateStatus(`Imbalance at ${node.value} (BF: ${balance}). Left-Right case. Rotating Left on child ${node.left.value}...`);
            node.left.state = 'rotating';
            node.left.right.state = 'rotating';
            renderTree();
            await sleep(animationSpeed);
            node.left.state = 'normal';
            node.left.right.state = 'normal';
            node.left = rotateLeft(node.left);
            renderTree();
            await sleep(animationSpeed / 2);

            updateStatus(`Then rotating Right on pivot ${node.value}...`);
            node.state = 'rotating';
            node.left.state = 'rotating';
            renderTree();
            await sleep(animationSpeed);
            node.state = 'normal';
            node.left.state = 'normal';
            return rotateRight(node);
        }
    }

    // Right unbalanced
    if (balance < -1) {
        const rightBalance = getBalanceFactor(node.right);
        if (rightBalance <= 0) {
            updateStatus(`Imbalance at ${node.value} (BF: ${balance}). Right-Right case. Performing Left Rotation.`);
            node.state = 'rotating';
            node.right.state = 'rotating';
            renderTree();
            await sleep(animationSpeed);
            node.state = 'normal';
            node.right.state = 'normal';
            return rotateLeft(node);
        } else {
            updateStatus(`Imbalance at ${node.value} (BF: ${balance}). Right-Left case. Rotating Right on child ${node.right.value}...`);
            node.right.state = 'rotating';
            node.right.left.state = 'rotating';
            renderTree();
            await sleep(animationSpeed);
            node.right.state = 'normal';
            node.right.left.state = 'normal';
            node.right = rotateRight(node.right);
            renderTree();
            await sleep(animationSpeed / 2);

            updateStatus(`Then rotating Left on pivot ${node.value}...`);
            node.state = 'rotating';
            node.right.state = 'rotating';
            renderTree();
            await sleep(animationSpeed);
            node.state = 'normal';
            node.right.state = 'normal';
            return rotateLeft(node);
        }
    }

    return node;
}

// ===== TRAVERSALS =====
async function handleTraversal() {
    if (isOperating || isTraversing || !root) {
        if (!root) updateStatus('⚠️ The tree is empty. Add nodes to traverse.');
        return;
    }

    const type = traversalSelect.value;
    let list = [];

    if (type === 'inorder') list = getInorder(root);
    else if (type === 'preorder') list = getPreorder(root);
    else if (type === 'postorder') list = getPostorder(root);
    else if (type === 'bfs') list = getBFS(root);

    await animateTraversal(list, type);
}

function getInorder(node, list = []) {
    if (!node) return list;
    getInorder(node.left, list);
    list.push(node);
    getInorder(node.right, list);
    return list;
}

function getPreorder(node, list = []) {
    if (!node) return list;
    list.push(node);
    getPreorder(node.left, list);
    getPreorder(node.right, list);
    return list;
}

function getPostorder(node, list = []) {
    if (!node) return list;
    getPostorder(node.left, list);
    getPostorder(node.right, list);
    list.push(node);
    return list;
}

function getBFS(node) {
    if (!node) return [];
    const list = [];
    const queue = [node];
    while (queue.length > 0) {
        const curr = queue.shift();
        list.push(curr);
        if (curr.left) queue.push(curr.left);
        if (curr.right) queue.push(curr.right);
    }
    return list;
}

async function animateTraversal(nodesList, name) {
    isTraversing = true;
    disableButtons(true);
    resetNodeStates(root);
    
    traversalResultText.textContent = '';
    const traversed = [];

    updateStatus(`Running ${name.toUpperCase()} traversal...`);

    for (const node of nodesList) {
        node.state = 'visited';
        renderTree();
        
        traversed.push(node.value);
        traversalResultText.textContent = traversed.join(' ➔ ');
        
        updateStatus(`Traversal visiting: ${node.value}`);
        await sleep(animationSpeed);
    }

    await sleep(500);
    resetNodeStates(root);
    renderTree();
    
    isTraversing = false;
    disableButtons(false);
    updateStatus(`${name.toUpperCase()} traversal completed!`);
}

// ===== STATE CONTROL =====
function resetNodeStates(node) {
    if (!node) return;
    node.state = 'normal';
    resetNodeStates(node.left);
    resetNodeStates(node.right);
}

function clearTree() {
    if (isOperating || isTraversing) return;
    root = null;
    traversalResultText.textContent = 'None. Run a traversal to see results.';
    renderTree();
    updateStatus('Tree cleared. Canvas empty.');
}

// ===== LAYOUT CALCULATION =====
function updateLayout() {
    const width = treeCanvas.clientWidth || 800;
    calculateLayout(root, 50, 0, 25, width - 25);
}

function calculateLayout(node, y, level, leftBound, rightBound) {
    if (!node) return;

    // Position node in the center of its partition
    node.x = (leftBound + rightBound) / 2;
    node.y = y;

    const depthGap = 70;
    calculateLayout(node.left, y + depthGap, level + 1, leftBound, node.x);
    calculateLayout(node.right, y + depthGap, level + 1, node.x, rightBound);
}

// ===== RENDERING ENGINE =====
function renderTree() {
    treeCanvas.innerHTML = '';
    if (!root) {
        updateStats();
        return;
    }

    updateLayout();

    // Render paths first
    drawPaths(root);

    // Render nodes
    drawNodes(root);

    updateStats();
}

function drawPaths(node) {
    if (!node) return;

    if (node.left) {
        const isHighlighted = (node.left.state === 'checking' || node.left.state === 'visited');
        drawLine(node.x, node.y, node.left.x, node.left.y, isHighlighted);
        drawPaths(node.left);
    }
    if (node.right) {
        const isHighlighted = (node.right.state === 'checking' || node.right.state === 'visited');
        drawLine(node.x, node.y, node.right.x, node.right.y, isHighlighted);
        drawPaths(node.right);
    }
}

function drawLine(x1, y1, x2, y2, isHighlighted) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("class", isHighlighted ? "tree-edge highlighted" : "tree-edge");
    treeCanvas.appendChild(line);
}

function drawNodes(node) {
    if (!node) return;

    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");

    // Circle
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", node.x);
    circle.setAttribute("cy", node.y);
    circle.setAttribute("r", 20);
    
    let stateClass = "tree-node";
    if (node.state === 'checking') stateClass += " checking";
    if (node.state === 'visited') stateClass += " visited";
    if (node.state === 'rotating') stateClass += " rotating";
    circle.setAttribute("class", stateClass);
    group.appendChild(circle);

    // Value Text
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", node.x);
    text.setAttribute("y", node.y + 5);
    text.setAttribute("class", "tree-node-label");
    text.textContent = node.value;
    group.appendChild(text);

    // Height Label
    const height = document.createElementNS("http://www.w3.org/2000/svg", "text");
    height.setAttribute("x", node.x);
    height.setAttribute("y", node.y - 25);
    height.setAttribute("class", "tree-node-height");
    height.textContent = `h=${node.height}`;
    group.appendChild(height);

    treeCanvas.appendChild(group);

    drawNodes(node.left);
    drawNodes(node.right);
}

// ===== STATS CALCULATORS =====
function countNodes(node) {
    return node ? 1 + countNodes(node.left) + countNodes(node.right) : 0;
}

function isBalancedTree(node) {
    if (!node) return true;
    const balance = getBalanceFactor(node);
    if (Math.abs(balance) > 1) return false;
    return isBalancedTree(node.left) && isBalancedTree(node.right);
}

function updateStats() {
    nodeCountDisplay.textContent = countNodes(root);
    treeHeightDisplay.textContent = getHeight(root);
    balancedStatusDisplay.textContent = isBalancedTree(root) ? "Balanced" : "Imbalanced";
}

// ===== RANDOM TREE GENERATION =====
async function generateRandomTree() {
    if (isOperating || isTraversing) return;
    isOperating = true;
    disableButtons(true);
    root = null;
    traversalResultText.textContent = 'None. Run a traversal to see results.';
    updateStatus(`Generating random ${treeMode.toUpperCase()}...`);

    const values = [];
    const size = 6;

    while (values.length < size) {
        const val = Math.floor(Math.random() * 89) + 10;
        if (!values.includes(val)) {
            values.push(val);
        }
    }

    for (const val of values) {
        root = await insertNodeBatch(root, val);
        renderTree();
        await sleep(100);
    }

    isOperating = false;
    disableButtons(false);
    updateStatus(`Random ${treeMode.toUpperCase()} generated! Try inserting or deleting a node.`);
}

async function insertNodeBatch(node, value) {
    if (!node) return new Node(value);

    if (value < node.value) {
        node.left = await insertNodeBatch(node.left, value);
    } else if (value > node.value) {
        node.right = await insertNodeBatch(node.right, value);
    }

    node.height = Math.max(getHeight(node.left), getHeight(node.right)) + 1;

    if (treeMode === 'avl') {
        const balance = getBalanceFactor(node);
        if (balance > 1 && value < node.left.value) {
            return rotateRight(node);
        }
        if (balance < -1 && value > node.right.value) {
            return rotateLeft(node);
        }
        if (balance > 1 && value > node.left.value) {
            node.left = rotateLeft(node.left);
            return rotateRight(node);
        }
        if (balance < -1 && value < node.right.value) {
            node.right = rotateRight(node.right);
            return rotateLeft(node);
        }
    }

    return node;
}
