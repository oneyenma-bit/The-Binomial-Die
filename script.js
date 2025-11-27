const boardElement = document.getElementById('board');
const die1Element = document.getElementById('die1');
const die2Element = document.getElementById('die2');
const rollBtn = document.getElementById('rollBtn');
const statusMsg = document.getElementById('statusMsg');
const problemModal = document.getElementById('problemModal');
const msgModal = document.getElementById('msgModal');
const msgTitle = document.getElementById('msgTitle');
const msgBody = document.getElementById('msgBody');
const closeMsgBtn = document.getElementById('closeMsgBtn');
const calcBtn = document.getElementById('calcBtn');
const resultOutput = document.getElementById('resultOutput');
const closeProblemBtn = document.getElementById('closeProblemBtn');
const welcomeModal = document.getElementById('welcomeModal');
const startGameBtn = document.getElementById('startGameBtn');
const colorOptions = document.querySelectorAll('.color-option');
let selectedColor = '#f472b6';

// Game State
let playerPosition = 0;
const totalTiles = 20;
const tiles = [];

// Tile Types Configuration
const tileTypes = ['reset', 'problem', 'advance', 'retreat'];

// Audio Setup
const diceAudio = new Audio('dice-roll.mp3');
diceAudio.volume = 0.5;

const backgroundMusic = new Audio('background-music.mp3');
backgroundMusic.volume = 0.5;
backgroundMusic.loop = true;

function playDiceSound() {
    diceAudio.currentTime = 0;
    diceAudio.play().catch(error => console.log('Error playing sound:', error));
}

function startBackgroundMusic() {
    backgroundMusic.play().catch(error => console.log('Error playing music:', error));
}

function initBoard() {
    for (let i = 0; i < totalTiles; i++) {
        const type = tileTypes[i % 4];
        const tile = document.createElement('div');
        tile.classList.add('tile', type);
        tile.dataset.index = i;

        const number = document.createElement('span');
        number.classList.add('tile-number');
        number.textContent = i + 1;
        tile.appendChild(number);

        const icon = document.createElement('div');
        icon.classList.add('tile-icon');

        let label = '';
        switch (type) {
            case 'problem':
                icon.textContent = '📝';
                label = 'Problema';
                break;
            case 'advance':
                icon.textContent = '🚀';
                label = '+3';
                break;
            case 'retreat':
                icon.textContent = '⚠️';
                label = '-5';
                break;
            case 'reset':
                icon.textContent = i === 0 ? '🏁' : '🔄';
                label = i === 0 ? 'Inicio' : 'Reiniciar';
                break;
        }

        tile.appendChild(icon);
        const text = document.createElement('div');
        text.textContent = label;
        tile.appendChild(text);

        boardElement.appendChild(tile);
        tiles.push({ index: i, type: type });
    }

    const token = document.createElement('div');
    token.classList.add('player-token');
    token.id = 'playerToken';
    token.style.backgroundColor = selectedColor;
    token.style.boxShadow = `0 0 15px ${selectedColor}`;
    boardElement.appendChild(token);
    updatePlayerPosition(0);
}

function updatePlayerPosition(index) {
    if (index < 0) index = totalTiles + index;
    index = index % totalTiles;
    playerPosition = index;

    const targetTile = document.querySelector(`.tile[data-index="${index}"]`);
    const token = document.getElementById('playerToken');

    const tileRect = targetTile.getBoundingClientRect();
    const boardRect = boardElement.getBoundingClientRect();

    const top = tileRect.top - boardRect.top + tileRect.height / 2;
    const left = tileRect.left - boardRect.left + tileRect.width / 2;

    token.style.top = `${top}px`;
    token.style.left = `${left}px`;
}

async function rollDice() {
    rollBtn.disabled = true;
    statusMsg.textContent = "Lanzando...";

    const isMobile = window.innerWidth <= 768;
    const animationDuration = isMobile ? 800 : 1000;

    playDiceSound();

    die1Element.classList.add('rolling');
    die2Element.classList.add('rolling');

    for (let i = 0; i < 10; i++) {
        const r1 = Math.floor(Math.random() * 6) + 1;
        const r2 = Math.floor(Math.random() * 6) + 1;
        renderDie(die1Element, r1);
        renderDie(die2Element, r2);
        await new Promise(r => setTimeout(r, 100));
    }

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    renderDie(die1Element, d1);
    renderDie(die2Element, d2);

    setTimeout(() => {
        die1Element.classList.remove('rolling');
        die2Element.classList.remove('rolling');

        die1Element.classList.add('shaking');
        die2Element.classList.add('shaking');

        setTimeout(() => {
            die1Element.classList.remove('shaking');
            die2Element.classList.remove('shaking');
        }, 400);
    }, animationDuration);

    const move = d1 + d2;
    statusMsg.textContent = `Avanzas ${move} casillas`;

    await new Promise(r => setTimeout(r, animationDuration + 600));

    let newPos = (playerPosition + move) % totalTiles;
    updatePlayerPosition(newPos);

    await new Promise(r => setTimeout(r, 500));
    handleTile(newPos);

    rollBtn.disabled = false;
}

function renderDie(dieElement, value) {
    dieElement.innerHTML = '';
    dieElement.dataset.value = value;

    for (let i = 0; i < value; i++) {
        const pip = document.createElement('div');
        pip.classList.add('pip');
        dieElement.appendChild(pip);
    }
}

function handleTile(index) {
    const type = tiles[index].type;

    if (index === 0) {
        statusMsg.textContent = "Estás en el Inicio.";
        return;
    }

    switch (type) {
        case 'problem':
            openProblemModal();
            break;
        case 'advance':
            showMsg("¡Impulso!", "Avanzas 3 casillas extra.");
            setTimeout(() => {
                let nextPos = (playerPosition + 3) % totalTiles;
                updatePlayerPosition(nextPos);
                setTimeout(() => handleTile(nextPos), 1000);
            }, 1500);
            break;
        case 'retreat':
            showMsg("¡Retroceso!", "Retrocedes 5 casillas.");
            setTimeout(() => {
                let nextPos = playerPosition - 5;
                if (nextPos < 0) nextPos = totalTiles + nextPos;
                updatePlayerPosition(nextPos);
                setTimeout(() => handleTile(nextPos), 1000);
            }, 1500);
            break;
        case 'reset':
            showMsg("¡Reinicio!", "Vuelves al inicio.");
            setTimeout(() => {
                updatePlayerPosition(0);
            }, 1500);
            break;
    }
}

function showMsg(title, body) {
    msgTitle.textContent = title;
    msgBody.textContent = body;
    msgModal.classList.add('active');
}

closeMsgBtn.addEventListener('click', () => {
    msgModal.classList.remove('active');
});

function openProblemModal() {
    problemModal.classList.add('active');
    resultOutput.textContent = '';
    closeProblemBtn.classList.add('hidden');

    document.getElementById('n-input').value = '';
    document.getElementById('p-input').value = '';
    document.getElementById('x-input').value = '';
}

const scoreCounter = document.getElementById('scoreCounter');
let problemsSolved = 0;

closeProblemBtn.addEventListener('click', () => {
    problemModal.classList.remove('active');
    statusMsg.textContent = "Problema resuelto. ¡Sigue jugando!";
    problemsSolved++;
    scoreCounter.textContent = `Problemas resueltos: ${problemsSolved}`;
});

// Binomial Logic
function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

function combination(n, k) {
    if (k < 0 || k > n) return 0;
    return factorial(n) / (factorial(k) * factorial(n - k));
}

function binomialProbability(n, p, x) {
    return combination(n, x) * Math.pow(p, x) * Math.pow(1 - p, n - x);
}

calcBtn.addEventListener('click', () => {
    const n = parseInt(document.getElementById('n-input').value);
    const p = parseFloat(document.getElementById('p-input').value);
    const x = parseInt(document.getElementById('x-input').value);
    const condition = document.getElementById('condition-select').value;

    if (isNaN(n) || isNaN(p) || isNaN(x)) {
        resultOutput.textContent = "Por favor ingresa valores válidos.";
        return;
    }

    if (p < 0 || p > 1) {
        resultOutput.textContent = "La probabilidad (p) debe estar entre 0 y 1.";
        return;
    }

    let result = 0;
    let text = "";

    switch (condition) {
        case 'exact':
            result = binomialProbability(n, p, x);
            text = `P(X = ${x})`;
            break;
        case 'more':
            for (let i = x + 1; i <= n; i++) result += binomialProbability(n, p, i);
            text = `P(X > ${x})`;
            break;
        case 'max':
            for (let i = 0; i <= x; i++) result += binomialProbability(n, p, i);
            text = `P(X <= ${x})`;
            break;
        case 'at_least':
            for (let i = x; i <= n; i++) result += binomialProbability(n, p, i);
            text = `P(X >= ${x})`;
            break;
        case 'less':
            for (let i = 0; i < x; i++) result += binomialProbability(n, p, i);
            text = `P(X < ${x})`;
            break;
    }

    resultOutput.textContent = `${text} = ${result.toFixed(4)}`;
    closeProblemBtn.classList.remove('hidden');
});

rollBtn.addEventListener('click', rollDice);

// Welcome Modal Logic
colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedColor = option.dataset.color;
    });
});

document.querySelector('.color-option[data-color="#f472b6"]').classList.add('selected');

startGameBtn.addEventListener('click', () => {
    welcomeModal.classList.remove('active');
    const token = document.getElementById('playerToken');
    if (token) {
        token.style.backgroundColor = selectedColor;
        token.style.boxShadow = `0 0 15px ${selectedColor}`;
    }

    // Iniciar música de fondo
    startBackgroundMusic();

    // Actualizar botón de música
    const musicToggle = document.getElementById('musicToggle');
    if (musicToggle) {
        musicToggle.textContent = '🔊';
        musicToggle.classList.remove('muted');
        window.isMusicPlaying = true;
    }
});

// Music toggle button
const musicToggle = document.getElementById('musicToggle');
window.isMusicPlaying = false;

if (musicToggle) {
    musicToggle.addEventListener('click', () => {
        if (window.isMusicPlaying) {
            backgroundMusic.pause();
            musicToggle.textContent = '🔇';
            musicToggle.classList.add('muted');
            window.isMusicPlaying = false;
        } else {
            backgroundMusic.play().catch(error => {
                console.log('Error playing music:', error);
            });
            musicToggle.textContent = '🔊';
            musicToggle.classList.remove('muted');
            window.isMusicPlaying = true;
        }
    });
}

// Init
initBoard();
window.addEventListener('resize', () => updatePlayerPosition(playerPosition));
setTimeout(() => updatePlayerPosition(0), 100);
