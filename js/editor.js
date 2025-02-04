// editor.js
import Game from './game.js';

// Fonctions accessibles depuis le HTML
window.setElementType = setElementType;
window.exportLevel = exportLevel;
window.importLevel = importLevel;
window.tryLevel = tryLevel;

// Variables globales
let currentElementType = 'wall';
const grid = document.getElementById('grid');
const output = document.getElementById('output');
const importArea = document.getElementById('importArea');
let gameInstance = null;

function setElementType(type) {
    currentElementType = type;
    // Affiche l'outil sélectionné
    const buttons = document.querySelectorAll('.controls button');
    buttons.forEach(button => {
        button.classList.remove('selected');
        if (button.getAttribute('onclick').includes(`'${type}'`)) {
            button.classList.add('selected');
        }
    });
}

function createGrid() {
    // On crée la grille
    for (let i = 0; i < 20 * 20; i++) {
        const cell = document.createElement('div');
        cell.classList.add('grid-cell');
        cell.addEventListener('click', () => toggleElement(cell));
        grid.appendChild(cell);
    }
}

function toggleElement(cell) {
    if (currentElementType === 'eraser') {
        cell.className = 'grid-cell'; // On remet la case à zéro
    } else {
        cell.className = 'grid-cell'; // On remet la case à zéro
        if (currentElementType) {
            cell.classList.add(currentElementType); // On ajoute le type de case
        }
    }
    // Change le JSON final à chaque modification
    exportLevel();
}

function exportLevel() {
    const level = {
        name: "New Level",
        exit: null,
        torches: [],
        obstacles: []
    };

    const cells = document.querySelectorAll('.grid-cell');
    const wallSegments = [];

    cells.forEach((cell, index) => {
        const x = (index % 20) * 40;
        const y = Math.floor(index / 20) * 40;

        if (cell.classList.contains('wall')) {
            wallSegments.push({ x, y });
        } else if (cell.classList.contains('reset')) {
            level.obstacles.push({ type: 'reset', x, y, width: 40, height: 40 });
        } else if (cell.classList.contains('exit')) {
            level.exit = { x, y };
        } else if (cell.classList.contains('torch')) {
            level.torches.push({ x, y });
        }
    });

    // La fonction fuseWalls fusionne les murs adjacents et permet de réduire le nombre de murs dans le JSON
    const fusedWalls = fuseWalls(wallSegments);
    level.obstacles.push(...fusedWalls);

    output.value = JSON.stringify(level, null, 2);
}

function fuseWalls(wallSegments) {
    const fused = [];
    const visited = new Set();

    wallSegments.forEach(segment => {
        const key = `${segment.x},${segment.y}`;
        if (!visited.has(key)) {
            let width = 40;
            let height = 40;

            // Vérifie si les murs sont adjacents horizontalement
            while (wallSegments.some(s => s.x === segment.x + width && s.y === segment.y && !visited.has(`${s.x},${s.y}`))) {
                visited.add(`${segment.x + width},${segment.y}`);
                width += 40;
            }

            // Si les murs ne sont pas adjacents horizontalement, on vérifie verticalement
            if (width === 40) {
                while (wallSegments.some(s => s.x === segment.x && s.y === segment.y + height && !visited.has(`${s.x},${s.y}`))) {
                    visited.add(`${segment.x},${segment.y + height}`);
                    height += 40;
                }
            }

            fused.push({ type: 'wall', x: segment.x, y: segment.y, width, height });
            visited.add(key);
        }
    });

    return fused;
}

function importLevel() {
    const levelData = importArea.value.trim();
    if (!levelData) {
        alert("Please paste JSON data into the import area.");
        return;
    }

    try {
        const parsedData = JSON.parse(levelData);
        loadLevel(parsedData);
    } catch (error) {
        alert("Invalid JSON format. Please check your input.");
    }
}

function loadLevel(levelData) {
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => cell.className = 'grid-cell');

    levelData.obstacles.forEach(obstacle => {
        if (obstacle.type === 'wall') {
            const startX = obstacle.x / 40;
            const startY = obstacle.y / 40;
            const endX = startX + (obstacle.width / 40);
            const endY = startY + (obstacle.height / 40);

            for (let x = startX; x < endX; x++) {
                for (let y = startY; y < endY; y++) {
                    const index = y * 20 + x;
                    const cell = cells[index];
                    if (cell) {
                        cell.classList.add('wall');
                    }
                }
            }
        } else if (obstacle.type === 'reset') {
            const index = (obstacle.y / 40) * 20 + (obstacle.x / 40);
            const cell = cells[index];
            if (cell) {
                cell.classList.add('reset');
            }
        }
    });

    levelData.torches.forEach(torch => {
        const index = (torch.y / 40) * 20 + (torch.x / 40);
        const cell = cells[index];
        if (cell) {
            cell.classList.add('torch');
        }
    });

    if (levelData.exit) {
        const index = (levelData.exit.y / 40) * 20 + (levelData.exit.x / 40);
        const cell = cells[index];
        if (cell) {
            cell.classList.add('exit');
        }
    }
}

async function tryLevel() {
    const grid = document.getElementById('grid');
    const gameCanvas = document.getElementById('gameCanvas');
    const tryLevelBtn = document.getElementById('tryLevelBtn');

    // Retourne à l'éditeur si le jeu est en cours
    if (gameCanvas.style.display === 'block') {
        gameCanvas.style.display = 'none';
        grid.style.display = 'grid';
        tryLevelBtn.textContent = 'Try Level';
        
        // On arrête l'instance du jeu si elle existe
        if (gameInstance) {
            // On nettoie l'instance du jeu
            gameInstance = null;
        }
        return;
    }

    // Sinon, on lance le jeu
    exportLevel(); // On récupère le JSON final
    const levelData = JSON.parse(output.value || '{}');
    
    // On vérifie qu'il y a un point de sortie
    if (!levelData || !levelData.exit) {
        alert("Please add an exit point to the level.");
        return;
    }

    // Intervertir la grille et le canvas
    grid.style.display = 'none';
    gameCanvas.style.display = 'block';
    tryLevelBtn.textContent = 'Back to Editor';

    // Lance le jeu pour tester le niveau
    if (!gameInstance) {
        const colors = {
            background: '#232323',
            player: '#4ecca3',
            walls: '#344fa1',
            resetTrigger: '#e94560',
            exit: '#ffd369',
            text: '#ffffff',
            darkness: 'rgba(0, 0, 0, 0.95)'
        };
        gameInstance = new Game(gameCanvas, colors, [levelData]);
        await gameInstance.init();
    }
    gameInstance.startLevel(0);
}

// Initialise la grille
createGrid();