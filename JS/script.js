
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20); 

const colors = [
    null,
    '#FF0D72', // Peça T - Rosa
    '#0DC2FF', // Peça O - Azul claro
    '#0DFF72', // Peça L - Verde
    '#F538FF', // Peça J - Roxo
    '#FF8E0D', // Peça I - Laranja
    '#FFE138', // Peça S - Amarelo
    '#3877FF', // Peça Z - Azul
];

const pieces = [
    [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
    ],
    [
        [2, 2],
        [2, 2],
    ],
    [
        [0, 3, 0],
        [0, 3, 0],
        [0, 3, 3],
    ],
    [
        [0, 4, 0],
        [0, 4, 0],
        [4, 4, 0],
    ],
    [
        [0, 0, 0, 0],
        [5, 5, 5, 5],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
    ],
    [
        [0, 6, 6],
        [6, 6, 0],
        [0, 0, 0],
    ],
    [
        [7, 7, 0],
        [0, 7, 7],
        [0, 0, 0],
    ]
];

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                context.strokeStyle = 'rgba(255, 255, 255, 0.6)';
                context.lineWidth = 0.05;
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] &&
                    arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        arenaSweep();
        playerReset();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const pieces_random = pieces[Math.floor(Math.random() * pieces.length)];
    player.matrix = pieces_random;
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        showGameOver();
    }
}

function playerRotate() {
    const m = player.matrix;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
        }
    }
    m.forEach(row => row.reverse());
    if (collide(arena, player)) {
        m.forEach(row => row.reverse());
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < y; ++x) {
                [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
            }
        }
    }
}


let score = 0;
let level = 1;

function updateDifficulty() {
    const newLevel = Math.floor(score / 50) + 1;

    if (newLevel > level) {
        level = newLevel;
        dropInterval = Math.max(100, 1000 - (level - 1) * 100);

        showLevelUpEffect();
    }
}

function showLevelUpEffect() {
    const levelEffect = document.createElement('div');
    levelEffect.style.position = 'absolute';
    levelEffect.style.top = '50%';
    levelEffect.style.left = '50%';
    levelEffect.style.transform = 'translate(-50%, -50%)';
    levelEffect.style.color = '#0ff';
    levelEffect.style.fontSize = '36px';
    levelEffect.style.fontWeight = 'bold';
    levelEffect.style.textShadow = '0 0 20px #0ff';
    levelEffect.style.zIndex = '1000';
    levelEffect.style.opacity = '1';
    levelEffect.textContent = 'LEVEL ' + level + '!';
    levelEffect.style.transition = 'all 1s ease-out';

    document.body.appendChild(levelEffect);

    setTimeout(() => {
        levelEffect.style.opacity = '0';
        levelEffect.style.transform = 'translate(-50%, -50%) scale(2)';
        setTimeout(() => {
            document.body.removeChild(levelEffect);
        }, 1000);
    }, 100);
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        score += rowCount * 10;
        rowCount *= 2;

        updateDifficulty();
    }
}

function draw() {
    context.fillStyle = 'rgba(0, 0, 0, 0.1)';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);

    document.getElementById('score').innerHTML = 'Score: ' + score + '<br>Level: ' + level;
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let gameOver = false;

function showGameOver() {
    gameOver = true;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalLevel').textContent = level;
    document.getElementById('gameOverScreen').style.display = 'flex';
}

function restartGame() {
    gameOver = false;
    score = 0;
    level = 1;
    dropCounter = 0;
    dropInterval = 1000;

    arena.forEach(row => row.fill(0));

    document.getElementById('gameOverScreen').style.display = 'none';

    playerReset();

    lastTime = 0;
    update();
}

function update(time = 0) {
    if (gameOver) return;

    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

const arena = createMatrix(12, 20);
const player = {
    pos: { x: 0, y: 0 },
    matrix: null
};

document.addEventListener('keydown', event => {
    if (gameOver) return;

    if (event.key === 'ArrowLeft') {
        playerMove(-1);
    } else if (event.key === 'ArrowRight') {
        playerMove(1);
    } else if (event.key === 'ArrowDown') {
        playerDrop();
    } else if (event.key === 'ArrowUp') {
        playerRotate();
    }
});

playerReset();
update();