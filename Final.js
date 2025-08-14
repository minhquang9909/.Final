const gridRows = 3, gridCols = 5, gridSize = gridRows * gridCols;
const box = document.getElementById('box');
const timerDisplay = document.getElementById('timer');
const playBtn = document.getElementById('startBtn');
let tiles = [], emptyIndex = gridSize - 1, timer = 0, timerInterval = null, gameActive = false, moveCount = 0;
// -------------------------------------------------------------
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
// --------------------------------------------------------------
function isSolvable(arr) {
    let inv = 0;
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] && arr[j] && arr[i] > arr[j]) inv++;
        }
    }
    const blankRowFromBottom = gridRows - Math.floor(arr.indexOf(0) / gridCols);
    return (inv + blankRowFromBottom) % 2 === 0;
}

function generateTiles() {
    let arr;
    do {
        arr = shuffle([...Array(gridSize - 1).keys()].map(x => x + 1).concat(0));
    } while (!isSolvable(arr));
    tiles = arr;
    emptyIndex = tiles.indexOf(0);
}
// ----------------------------------------------------------------
function renderGrid() {
    for (let i = 0; i < gridSize; i++) {
        const tile = document.getElementById('m' + (i + 1));
        if (!tile) continue;
        if (tiles[i] === 0) {
            tile.textContent = '';
            tile.style.background = '#333';
            tile.style.color = '#333';
        } else {
            tile.textContent = tiles[i];
            tile.style.background = '';
            tile.style.color = '';
        }
    }
}
// -----------------------------------------------------------------
function moveTile(targetIdx, direction) {
    if (!gameActive) return;
    const validMoves = [
        emptyIndex - gridCols,
        emptyIndex + gridCols,
        (emptyIndex % gridCols !== 0) ? emptyIndex - 1 : -1,
        (emptyIndex % gridCols !== gridCols - 1) ? emptyIndex + 1 : -1
    ];
    if (validMoves.includes(targetIdx)) {
        [tiles[emptyIndex], tiles[targetIdx]] = [tiles[targetIdx], tiles[emptyIndex]];
        emptyIndex = targetIdx;
        renderGrid();
        if (direction) {
            moveCount++;
            updateMoveCount();
        }
        checkWin();
    }
}
// -------------------------------------------------------------------
function saveWinHistory(steps, time) {
    let winHistory = JSON.parse(localStorage.getItem('puzzleWinHistory') || '[]');
    winHistory.push({ steps, time });
    localStorage.setItem('puzzleWinHistory', JSON.stringify(winHistory));
}
// -------------------------------------------------------------------
function renderWinHistory() {
    let winHistory = JSON.parse(localStorage.getItem('puzzleWinHistory') || '[]');
    let hisBody = document.querySelector('.his-body');
    if (!hisBody) return;
    hisBody.innerHTML = '';
    winHistory.forEach((h, i) => {
        const row = document.createElement('div');
        row.className = 'his-step';
        row.innerHTML = `<p class="step">${i+1}</p><p class="direction">${h.steps}</p><p class="time">${h.time}</p>`;
        hisBody.appendChild(row);
    });
}
// -------------------------------------------------------------------
function handleKey(e) {
    if (!gameActive) return;
    let moveTo = -1, dir = '';
    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        if (emptyIndex - gridCols >= 0) { moveTo = emptyIndex - gridCols; dir = '↓/S'; }
    }
    if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        if (emptyIndex + gridCols < gridSize) { moveTo = emptyIndex + gridCols; dir = '↑/W'; }
    }
    if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        if ((emptyIndex % gridCols) > 0) { moveTo = emptyIndex - 1; dir = '→/D'; }
    }
    if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        if ((emptyIndex % gridCols) < gridCols - 1) { moveTo = emptyIndex + 1; dir = '←/A'; }
    }
    if (moveTo >= 0 && moveTo < gridSize) moveTile(moveTo, dir);
}

// -------------------------------------------------------------------
function checkWin() {
    for (let i = 0; i < tiles.length - 1; i++) if (tiles[i] !== i + 1) return;
    if (tiles[tiles.length - 1] === 0) {
        gameActive = false;
        clearInterval(timerInterval);
        setTimeout(() => {
            alert(`Chúc mừng! Bạn đã hoàn thành trò chơi!\nSố bước: ${moveCount}\nThời gian: ${timerDisplay.textContent}`);
            saveWinHistory(moveCount, timerDisplay.textContent);
            renderWinHistory();
            playBtn.textContent = 'Bắt đầu';
        }, 100);
    }
}

// -------------------------------------------------------------------
function startTimer() {
    timer = 0;
    timerDisplay.textContent = '00:00';
    timerInterval = setInterval(() => {
        timer++;
        const min = String(Math.floor(timer / 60)).padStart(2, '0');
        const sec = String(timer % 60).padStart(2, '0');
        timerDisplay.textContent = `${min}:${sec}`;
    }, 1000);
}

// -------------------------------------------------------------------
function stopTimer() { clearInterval(timerInterval); }
function startGame() {
    generateTiles();
    renderGrid();
    startTimer();
    gameActive = true;
    moveCount = 0;
    updateMoveCount();
    playBtn.textContent = 'Kết thúc';
    playBtn.style.background = '#f00';
}
// -------------------------------------------------------------------
function endGame() {
    gameActive = false;
    stopTimer();
    playBtn.textContent = 'Bắt đầu';
    playBtn.style.background = '';
    alert('Đã kết thúc trò chơi!');
}
// -------------------------------------------------------------------
function updateMoveCount() {
    let el = document.getElementById('moveCount');
    if (!el) {
        el = document.createElement('div');
        el.id = 'moveCount';
        el.style.fontWeight = 'bold';
        el.style.margin = '10px 0';
        timerDisplay.parentNode.insertBefore(el, timerDisplay.nextSibling);
    }
    el.textContent = `Số bước: ${moveCount}`;
}
// -------------------------------------------------------------------
document.addEventListener('keydown', handleKey);
playBtn.textContent = 'Bắt đầu';
playBtn.onclick = function() {
    if (!gameActive) startGame();
    else endGame();
};
tiles = [...Array(gridSize - 1).keys()].map(x => x + 1).concat(0);
emptyIndex = gridSize - 1;
renderGrid();
updateMoveCount();
renderWinHistory();