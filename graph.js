// ===== DOM ELEMENTS =====
const graphCanvas = document.getElementById('graphCanvas');
const speedControl = document.getElementById('speedControl');
const speedValue = document.getElementById('speedValue');
const startNodeSelect = document.getElementById('startNode');
const edgeWeightInput = document.getElementById('edgeWeight');
const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');
const presetBtn = document.getElementById('presetBtn');
const clearBtn = document.getElementById('clearBtn');
const statusMessage = document.getElementById('statusMessage');
const nodeCountDisplay = document.getElementById('nodeCount');
const edgeCountDisplay = document.getElementById('edgeCount');
const totalCostDisplay = document.getElementById('totalCost');

// Algorithm buttons
const primsBtn = document.getElementById('primsBtn');
const dijkstraBtn = document.getElementById('dijkstraBtn');
const kruskalBtn = document.getElementById('kruskalBtn');

// ===== STATE VARIABLES =====
let nodes = [];
let edges = [];
let selectedAlgorithm = 'prims';
let animationSpeed = 800;
let isRunning = false;
let nodeIdCounter = 0;

// Dragging state for edge creation
let isDragging = false;
let dragStartNode = null;
let tempLine = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    resizeCanvas();
    loadPresetGraph();
});

window.addEventListener('resize', resizeCanvas);

function resizeCanvas() {
    const container = graphCanvas.parentElement;
    graphCanvas.setAttribute('width', container.clientWidth);
    graphCanvas.setAttribute('height', 400);
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    speedControl.addEventListener('input', (e) => {
        animationSpeed = parseInt(e.target.value);
        speedValue.textContent = `${animationSpeed}ms`;
    });

    // Algorithm selection
    document.querySelectorAll('.algo-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedAlgorithm = btn.dataset.algo;
            updateStatus(`Selected: ${getAlgorithmName(selectedAlgorithm)}`);
        });
    });

    runBtn.addEventListener('click', runAlgorithm);
    resetBtn.addEventListener('click', resetGraph);
    presetBtn.addEventListener('click', loadPresetGraph);
    clearBtn.addEventListener('click', clearGraph);

    // Canvas interactions
    graphCanvas.addEventListener('click', handleCanvasClick);
    graphCanvas.addEventListener('mousedown', handleMouseDown);
    graphCanvas.addEventListener('mousemove', handleMouseMove);
    graphCanvas.addEventListener('mouseup', handleMouseUp);
    graphCanvas.addEventListener('mouseleave', handleMouseUp);
}

// ===== CANVAS INTERACTIONS =====
function handleCanvasClick(e) {
    if (isRunning || isDragging) return;

    const rect = graphCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on existing node
    const clickedNode = getNodeAtPosition(x, y);
    if (clickedNode) return;

    // Add new node
    addNode(x, y);
}

function handleMouseDown(e) {
    if (isRunning) return;

    const rect = graphCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const node = getNodeAtPosition(x, y);
    if (node) {
        isDragging = true;
        dragStartNode = node;

        // Create temporary line
        tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tempLine.setAttribute('x1', node.x);
        tempLine.setAttribute('y1', node.y);
        tempLine.setAttribute('x2', x);
        tempLine.setAttribute('y2', y);
        tempLine.setAttribute('class', 'temp-edge');
        graphCanvas.appendChild(tempLine);

        e.preventDefault();
    }
}

function handleMouseMove(e) {
    if (!isDragging || !tempLine) return;

    const rect = graphCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    tempLine.setAttribute('x2', x);
    tempLine.setAttribute('y2', y);
}

function handleMouseUp(e) {
    if (!isDragging) return;

    const rect = graphCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const endNode = getNodeAtPosition(x, y);

    if (endNode && endNode !== dragStartNode) {
        // Check if edge already exists
        const existingEdge = edges.find(edge =>
            (edge.from === dragStartNode.id && edge.to === endNode.id) ||
            (edge.from === endNode.id && edge.to === dragStartNode.id)
        );

        if (!existingEdge) {
            const weight = parseInt(edgeWeightInput.value) || 1;
            addEdge(dragStartNode.id, endNode.id, weight);
        }
    }

    // Clean up
    if (tempLine) {
        tempLine.remove();
        tempLine = null;
    }
    isDragging = false;
    dragStartNode = null;
}

function getNodeAtPosition(x, y) {
    const radius = 25;
    return nodes.find(node => {
        const dx = node.x - x;
        const dy = node.y - y;
        return Math.sqrt(dx * dx + dy * dy) <= radius;
    });
}

// ===== GRAPH OPERATIONS =====
function addNode(x, y) {
    const id = String.fromCharCode(65 + nodeIdCounter); // A, B, C, ...
    if (nodeIdCounter >= 26) {
        updateStatus('Maximum 26 nodes allowed');
        return;
    }

    const node = { id, x, y };
    nodes.push(node);
    nodeIdCounter++;

    renderGraph();
    updateStartNodeOptions();
    updateStats();
    updateStatus(`Added node ${id}`);
}

function addEdge(fromId, toId, weight) {
    const edge = { from: fromId, to: toId, weight };
    edges.push(edge);

    renderGraph();
    updateStats();
    updateStatus(`Added edge ${fromId}-${toId} with weight ${weight}`);
}

function clearGraph() {
    nodes = [];
    edges = [];
    nodeIdCounter = 0;
    graphCanvas.innerHTML = '';
    updateStartNodeOptions();
    updateStats();
    updateStatus('Graph cleared. Click to add nodes.');
}

function resetGraph() {
    // Reset visual states without removing nodes/edges
    renderGraph();
    totalCostDisplay.textContent = '0';
    updateStatus('Graph reset. Ready to run algorithm.');
}

function loadPresetGraph() {
    clearGraph();

    // Create a sample weighted graph
    const centerX = graphCanvas.clientWidth / 2;
    const centerY = 200;
    const radius = 150;

    // Add nodes in a circle pattern
    const nodePositions = [
        { id: 'A', x: centerX, y: centerY - radius },
        { id: 'B', x: centerX + radius * 0.87, y: centerY - radius * 0.5 },
        { id: 'C', x: centerX + radius * 0.87, y: centerY + radius * 0.5 },
        { id: 'D', x: centerX, y: centerY + radius },
        { id: 'E', x: centerX - radius * 0.87, y: centerY + radius * 0.5 },
        { id: 'F', x: centerX - radius * 0.87, y: centerY - radius * 0.5 },
    ];

    nodePositions.forEach(pos => {
        nodes.push({ id: pos.id, x: pos.x, y: pos.y });
        nodeIdCounter++;
    });

    // Add weighted edges
    const presetEdges = [
        { from: 'A', to: 'B', weight: 4 },
        { from: 'A', to: 'F', weight: 2 },
        { from: 'B', to: 'C', weight: 6 },
        { from: 'B', to: 'F', weight: 5 },
        { from: 'C', to: 'D', weight: 3 },
        { from: 'C', to: 'E', weight: 8 },
        { from: 'D', to: 'E', weight: 1 },
        { from: 'E', to: 'F', weight: 7 },
        { from: 'A', to: 'C', weight: 9 },
    ];

    edges = presetEdges;

    renderGraph();
    updateStartNodeOptions();
    updateStats();
    updateStatus('Preset graph loaded! Select an algorithm and click Run.');
}

// ===== RENDERING =====
function renderGraph() {
    graphCanvas.innerHTML = '';

    // Render edges first (so they appear behind nodes)
    edges.forEach(edge => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode = nodes.find(n => n.id === edge.to);
        if (!fromNode || !toNode) return;

        // Create edge line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', fromNode.x);
        line.setAttribute('y1', fromNode.y);
        line.setAttribute('x2', toNode.x);
        line.setAttribute('y2', toNode.y);
        line.setAttribute('class', `graph-edge ${edge.state || ''}`);
        line.setAttribute('data-from', edge.from);
        line.setAttribute('data-to', edge.to);
        graphCanvas.appendChild(line);

        // Create weight label
        const midX = (fromNode.x + toNode.x) / 2;
        const midY = (fromNode.y + toNode.y) / 2;

        // Background for weight
        const weightBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        weightBg.setAttribute('x', midX - 12);
        weightBg.setAttribute('y', midY - 10);
        weightBg.setAttribute('width', 24);
        weightBg.setAttribute('height', 20);
        weightBg.setAttribute('rx', 4);
        weightBg.setAttribute('class', 'weight-bg');
        graphCanvas.appendChild(weightBg);

        const weightText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        weightText.setAttribute('x', midX);
        weightText.setAttribute('y', midY + 5);
        weightText.setAttribute('class', 'weight-label');
        weightText.textContent = edge.weight;
        graphCanvas.appendChild(weightText);
    });

    // Render nodes
    nodes.forEach(node => {
        // Node circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', 25);
        circle.setAttribute('class', `graph-node ${node.state || ''}`);
        circle.setAttribute('data-id', node.id);
        graphCanvas.appendChild(circle);

        // Node label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y + 6);
        text.setAttribute('class', 'node-label');
        text.textContent = node.id;
        graphCanvas.appendChild(text);

        // Distance label for Dijkstra
        if (node.distance !== undefined && node.distance !== Infinity) {
            const distText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            distText.setAttribute('x', node.x);
            distText.setAttribute('y', node.y + 45);
            distText.setAttribute('class', 'distance-label');
            distText.textContent = `d=${node.distance}`;
            graphCanvas.appendChild(distText);
        }
    });
}

function updateStartNodeOptions() {
    startNodeSelect.innerHTML = '';
    nodes.forEach(node => {
        const option = document.createElement('option');
        option.value = node.id;
        option.textContent = node.id;
        startNodeSelect.appendChild(option);
    });
}

function updateStats() {
    nodeCountDisplay.textContent = nodes.length;
    edgeCountDisplay.textContent = edges.length;
}

// ===== ALGORITHMS =====
async function runAlgorithm() {
    if (isRunning || nodes.length === 0) {
        updateStatus('Add nodes and edges first!');
        return;
    }

    isRunning = true;
    runBtn.disabled = true;

    // Reset states
    nodes.forEach(n => { n.state = ''; n.distance = undefined; });
    edges.forEach(e => { e.state = ''; });
    renderGraph();

    const startNode = startNodeSelect.value || nodes[0].id;

    switch (selectedAlgorithm) {
        case 'prims':
            await runPrims(startNode);
            break;
        case 'dijkstra':
            await runDijkstra(startNode);
            break;
        case 'kruskal':
            await runKruskal();
            break;
    }

    isRunning = false;
    runBtn.disabled = false;
}

// ===== PRIM'S ALGORITHM =====
async function runPrims(startId) {
    updateStatus("Running Prim's Algorithm...");

    const visited = new Set();
    const mstEdges = [];
    let totalWeight = 0;

    // Start with the first node
    visited.add(startId);
    setNodeState(startId, 'visited');
    renderGraph();
    await sleep(animationSpeed);

    while (visited.size < nodes.length) {
        // Find minimum edge connecting visited to unvisited
        let minEdge = null;
        let minWeight = Infinity;

        edges.forEach(edge => {
            const fromVisited = visited.has(edge.from);
            const toVisited = visited.has(edge.to);

            // Edge connects visited to unvisited
            if ((fromVisited && !toVisited) || (!fromVisited && toVisited)) {
                if (edge.weight < minWeight) {
                    minWeight = edge.weight;
                    minEdge = edge;
                }
            }
        });

        if (!minEdge) {
            updateStatus('Graph is not connected!');
            break;
        }

        // Highlight the edge being considered
        const newNode = visited.has(minEdge.from) ? minEdge.to : minEdge.from;
        setNodeState(newNode, 'current');
        renderGraph();
        await sleep(animationSpeed / 2);

        // Add to MST
        mstEdges.push(minEdge);
        totalWeight += minEdge.weight;
        visited.add(newNode);

        setEdgeState(minEdge.from, minEdge.to, 'mst');
        setNodeState(newNode, 'visited');
        renderGraph();

        updateStatus(`Added edge ${minEdge.from}-${minEdge.to} (weight: ${minEdge.weight}) to MST`);
        totalCostDisplay.textContent = totalWeight;

        await sleep(animationSpeed);
    }

    updateStatus(`Prim's complete! MST total weight: ${totalWeight}`);
}

// ===== DIJKSTRA'S ALGORITHM =====
async function runDijkstra(startId) {
    updateStatus("Running Dijkstra's Algorithm...");

    // Initialize distances
    const distances = {};
    const visited = new Set();
    const previous = {};

    nodes.forEach(node => {
        distances[node.id] = node.id === startId ? 0 : Infinity;
        node.distance = distances[node.id];
    });

    setNodeState(startId, 'current');
    renderGraph();
    await sleep(animationSpeed);

    while (visited.size < nodes.length) {
        // Find unvisited node with minimum distance
        let minNode = null;
        let minDist = Infinity;

        nodes.forEach(node => {
            if (!visited.has(node.id) && distances[node.id] < minDist) {
                minDist = distances[node.id];
                minNode = node;
            }
        });

        if (!minNode || minDist === Infinity) {
            break;
        }

        // Mark as current
        setNodeState(minNode.id, 'current');
        renderGraph();
        updateStatus(`Visiting node ${minNode.id} (distance: ${minDist})`);
        await sleep(animationSpeed / 2);

        visited.add(minNode.id);

        // Update distances to neighbors
        const neighbors = getNeighbors(minNode.id);
        for (const { neighborId, weight } of neighbors) {
            if (!visited.has(neighborId)) {
                const newDist = distances[minNode.id] + weight;
                if (newDist < distances[neighborId]) {
                    distances[neighborId] = newDist;
                    previous[neighborId] = minNode.id;

                    // Update node distance display
                    const neighborNode = nodes.find(n => n.id === neighborId);
                    neighborNode.distance = newDist;

                    // Highlight the edge
                    setEdgeState(minNode.id, neighborId, 'considering');
                    renderGraph();
                    await sleep(animationSpeed / 3);
                }
            }
        }

        // Mark as visited
        setNodeState(minNode.id, 'visited');

        // Highlight edges in shortest path
        if (previous[minNode.id]) {
            setEdgeState(previous[minNode.id], minNode.id, 'mst');
        }

        renderGraph();
        await sleep(animationSpeed / 2);
    }

    // Calculate total of all shortest paths
    const totalDist = Object.values(distances).filter(d => d !== Infinity).reduce((a, b) => a + b, 0);
    totalCostDisplay.textContent = totalDist;

    updateStatus(`Dijkstra's complete! All shortest paths found from ${startId}`);
}

// ===== KRUSKAL'S ALGORITHM =====
async function runKruskal() {
    updateStatus("Running Kruskal's Algorithm...");

    // Sort edges by weight
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);

    // Union-Find data structure
    const parent = {};
    nodes.forEach(node => { parent[node.id] = node.id; });

    function find(x) {
        if (parent[x] !== x) {
            parent[x] = find(parent[x]);
        }
        return parent[x];
    }

    function union(x, y) {
        const px = find(x);
        const py = find(y);
        if (px !== py) {
            parent[px] = py;
            return true;
        }
        return false;
    }

    const mstEdges = [];
    let totalWeight = 0;

    for (const edge of sortedEdges) {
        updateStatus(`Considering edge ${edge.from}-${edge.to} (weight: ${edge.weight})`);

        // Highlight edge being considered
        setEdgeState(edge.from, edge.to, 'considering');
        renderGraph();
        await sleep(animationSpeed / 2);

        // Check if adding this edge creates a cycle
        if (union(edge.from, edge.to)) {
            // Add to MST
            mstEdges.push(edge);
            totalWeight += edge.weight;

            setEdgeState(edge.from, edge.to, 'mst');
            setNodeState(edge.from, 'visited');
            setNodeState(edge.to, 'visited');
            renderGraph();

            updateStatus(`Added edge ${edge.from}-${edge.to} to MST`);
            totalCostDisplay.textContent = totalWeight;

            // Stop when we have n-1 edges
            if (mstEdges.length === nodes.length - 1) {
                break;
            }
        } else {
            // Would create cycle, skip
            setEdgeState(edge.from, edge.to, 'rejected');
            renderGraph();
            updateStatus(`Skipped edge ${edge.from}-${edge.to} (would create cycle)`);
        }

        await sleep(animationSpeed);
    }

    // Clear rejected edges
    edges.forEach(e => {
        if (e.state === 'rejected') e.state = '';
    });
    renderGraph();

    updateStatus(`Kruskal's complete! MST total weight: ${totalWeight}`);
}

// ===== HELPER FUNCTIONS =====
function setNodeState(nodeId, state) {
    const node = nodes.find(n => n.id === nodeId);
    if (node) node.state = state;
}

function setEdgeState(fromId, toId, state) {
    const edge = edges.find(e =>
        (e.from === fromId && e.to === toId) ||
        (e.from === toId && e.to === fromId)
    );
    if (edge) edge.state = state;
}

function getNeighbors(nodeId) {
    const neighbors = [];
    edges.forEach(edge => {
        if (edge.from === nodeId) {
            neighbors.push({ neighborId: edge.to, weight: edge.weight });
        } else if (edge.to === nodeId) {
            neighbors.push({ neighborId: edge.from, weight: edge.weight });
        }
    });
    return neighbors;
}

function getAlgorithmName(algo) {
    switch (algo) {
        case 'prims': return "Prim's Algorithm";
        case 'dijkstra': return "Dijkstra's Algorithm";
        case 'kruskal': return "Kruskal's Algorithm";
        default: return algo;
    }
}

function updateStatus(message) {
    statusMessage.textContent = message;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
