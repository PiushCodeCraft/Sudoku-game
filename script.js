const board = document.getElementById('sudoku-board');
let fullBoard = Array(81).fill(0);
let currentLevel = 'basic'; // 👈 Track selected difficulty globally
let isPaused = false;
let timerInterval;
let timeElapsed = 0;

function createBoard() {
  board.innerHTML = '';
  for (let i = 0; i < 81; i++) {
    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('maxlength', '1');
    input.classList.add('cell');

    input.addEventListener('focus', () => {
      highlightSameNumbers('');
    });

    input.addEventListener('input', () => {
      input.value = input.value.replace(/[^1-9]/g, '');
      highlightSameNumbers(input.value);
    });

    board.appendChild(input);
  }
}

function isSafe(board, row, col, num) {
  for (let x = 0; x < 9; x++) {
    if (
      board[row * 9 + x] === num ||
      board[x * 9 + col] === num ||
      board[3 * Math.floor(row / 3) * 9 +
        3 * Math.floor(col / 3) +
        (x % 3) + 9 * Math.floor(x / 3)] === num
    ) {
      return false;
    }
  }
  return true;
}

function solveSudoku(board) {
  for (let i = 0; i < 81; i++) {
    if (board[i] === 0) {
      const row = Math.floor(i / 9);
      const col = i % 9;

      const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      for (let num of nums) {
        if (isSafe(board, row, col, num)) {
          board[i] = num;
          if (solveSudoku(board)) return true;
          board[i] = 0;
        }
      }
      return false;
    }
  }
  return true;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getBlankCountFromLevel(level) {
  if (level === 'basic') return 30;
  if (level === 'medium') return 45;
  if (level === 'extreme') return 60;
  return 30;
}

function generatePuzzle(level = 'basic') {
  createBoard();
  fullBoard = Array(81).fill(0);
  solveSudoku(fullBoard);

  let puzzle = fullBoard.slice();
  let blanks = getBlankCountFromLevel(level);

  while (blanks > 0) {
    const index = Math.floor(Math.random() * 81);
    if (puzzle[index] !== 0) {
      puzzle[index] = 0;
      blanks--;
    }
  }

  for (let i = 0; i < 81; i++) {
    const cell = board.children[i];
    if (puzzle[i] !== 0) {
      cell.value = puzzle[i];
      cell.disabled = true;
      cell.classList.add('prefilled');
      cell.addEventListener('click', () => highlightSameNumbers(cell.value));
    } else {
      cell.value = "";
      cell.disabled = false;
    }
  }

  stopTimer();
  startTimer();
}

function highlightSameNumbers(value) {
  Array.from(board.children).forEach(cell => {
    cell.classList.remove('highlight');
    if (cell.value === value && value !== '') {
      cell.classList.add('highlight');
    }
  });
}

function resetBoard() {
  Array.from(board.children).forEach(cell => {
    if (!cell.disabled) {
      cell.value = '';
    }
  });
  highlightSameNumbers('');
  stopTimer();
  startTimer();
}

function goHome() {
  stopTimer();
  document.getElementById('start-container').style.display = 'block';
  document.getElementById('game-controls').style.display = 'none';
  document.getElementById('end-message').style.display = 'none';
  document.getElementById('timer').style.display = 'none';
  document.getElementById('time-value').textContent = '00:00';
  document.getElementById('level-label').style.display = 'none'; // ✅ Hide level text
  board.innerHTML = '';
}


function startGame() {
  currentLevel = document.querySelector('input[name="level"]:checked').value;

  generatePuzzle(currentLevel);

  document.getElementById('start-container').style.display = 'none';
  document.getElementById('game-controls').style.display = 'block';
  document.getElementById('end-message').style.display = 'none';

  // ✅ Show the selected level
  const levelLabel = document.getElementById('level-label');
  levelLabel.style.display = 'block';
  levelLabel.textContent = `Level: ${currentLevel.toUpperCase()}`;

  startTimer();
}




function checkSolution() {
  const cells = Array.from(board.children);
  let isCorrect = true;

  for (let i = 0; i < 81; i++) {
    const userValue = parseInt(cells[i].value);
    if (isNaN(userValue) || userValue !== fullBoard[i]) {
      isCorrect = false;
      break;
    }
  }

  if (isCorrect) {
    stopTimer();
    document.getElementById('game-controls').style.display = 'none';
    document.getElementById('end-message').style.display = 'block';
  } else {
    alert("❌ Not correct yet. Please check and try again.");
  }
}

function isValidSudoku(board) {
  for (let i = 0; i < 9; i++) {
    const rowSet = new Set();
    const colSet = new Set();
    for (let j = 0; j < 9; j++) {
      const rowVal = board[i][j];
      const colVal = board[j][i];

      if (rowVal !== 0) {
        if (rowSet.has(rowVal)) return false;
        rowSet.add(rowVal);
      }

      if (colVal !== 0) {
        if (colSet.has(colVal)) return false;
        colSet.add(colVal);
      }
    }
  }

  for (let row = 0; row < 9; row += 3) {
    for (let col = 0; col < 9; col += 3) {
      const boxSet = new Set();
      for (let r = row; r < row + 3; r++) {
        for (let c = col; c < col + 3; c++) {
          const val = board[r * 9 + c];
          if (val !== 0) {
            if (boxSet.has(val)) return false;
            boxSet.add(val);
          }
        }
      }
    }
  }

  return true;
}

function toggleDarkMode() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled');
}


function startTimer() {
  stopTimer();
  timeElapsed = 0;
  updateTimer();
  document.getElementById('timer').style.display = 'block';
  timerInterval = setInterval(() => {
    timeElapsed++;
    updateTimer();
  }, 1000);
}

function updateTimer() {
  const minutes = String(Math.floor(timeElapsed / 60)).padStart(2, '0');
  const seconds = String(timeElapsed % 60).padStart(2, '0');
  document.getElementById('time-value').textContent = `${minutes}:${seconds}`;
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  document.getElementById('timer').style.display = 'none';
}
function togglePause() {
  const pauseBtn = document.getElementById('pause-button');
  const cells = Array.from(board.children);

  isPaused = !isPaused;

  if (isPaused) {
    pauseBtn.textContent = '▶️';
    clearInterval(timerInterval);
    cells.forEach(cell => cell.disabled = true);
  } else {
    pauseBtn.textContent = '⏸️';
    timerInterval = setInterval(() => {
      timeElapsed++;
      updateTimer();
    }, 1000);
    // Re-enable only non-prefilled cells
    cells.forEach((cell, i) => {
      if (!cell.classList.contains('prefilled')) {
        cell.disabled = false;
      }
    });
  }
}
window.addEventListener('DOMContentLoaded', () => {
  const darkModeSetting = localStorage.getItem('darkMode');
  if (darkModeSetting === 'enabled') {
    document.body.classList.add('dark');
  }
});
