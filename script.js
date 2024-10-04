const canvas = document.getElementById('chessBoard');
const ctx = canvas.getContext('2d');

const BOARD_SIZE = 8;
const SQUARE_SIZE = canvas.width / BOARD_SIZE;

const pieces = {
    'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚', 'P': '♟',
    'r': '♖', 'n': '♘', 'b': '♗', 'q': '♕', 'k': '♔', 'p': '♙'
};

let board = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

let selectedPiece = null;
let validMoves = [];
let currentPlayer = 'white';  // Player starts as white
let gameInProgress = false;

const startButton = document.getElementById('startButton');
startButton.addEventListener('click', startGame);

function startGame() {
    gameInProgress = true;
    resetBoard();
    drawBoard();
}

function resetBoard() {
    board = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
    selectedPiece = null;
    validMoves = [];
    currentPlayer = 'white';
    drawBoard();
}

function drawBoard() {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            ctx.fillStyle = (row + col) % 2 === 0 ? '#999' : '#555';
            ctx.fillRect(col * SQUARE_SIZE, row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);

            if (board[row][col] !== ' ') {
                ctx.fillStyle = board[row][col] === board[row][col].toUpperCase() ? 'white' : 'black';
                ctx.font = `${SQUARE_SIZE * 0.8}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(pieces[board[row][col]], (col + 0.5) * SQUARE_SIZE, (row + 0.5) * SQUARE_SIZE);
            }
        }
    }

    if (selectedPiece) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
        ctx.fillRect(selectedPiece.col * SQUARE_SIZE, selectedPiece.row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
    }

    for (const move of validMoves) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.fillRect(move.col * SQUARE_SIZE, move.row * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
    }
}

canvas.addEventListener('click', (event) => {
    if (!gameInProgress) return;

    const { row, col } = getClickedSquare(event);

    if (selectedPiece) {
        if (validMoves.some(move => move.row === row && move.col === col)) {
            const tempBoard = copyBoard(board);
            makeMove(tempBoard, selectedPiece, { row, col });

            
            if (!isInCheck(currentPlayer, tempBoard)) {
                makeMove(board, selectedPiece, { row, col });
                selectedPiece = null;
                validMoves = [];

                if (isInCheckmate(currentPlayer === 'white' ? 'black' : 'white', board)) {
                    alert(`${currentPlayer === 'white' ? 'Black' : 'White'} is in checkmate!`);
                    gameInProgress = false;
                } else if (isInCheck(currentPlayer === 'white' ? 'black' : 'white', board)) {
                    alert(`${currentPlayer === 'white' ? 'Black' : 'White'} is in check!`);
                }

                currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            } else {
                alert('Illegal move: cannot leave your king in check');
            }
        }
        selectedPiece = null;
        validMoves = [];
    } else if (board[row][col] !== ' ' && isCurrentPlayerPiece(board[row][col])) {
        selectedPiece = { row, col };
        validMoves = getValidMoves(selectedPiece);
    }
    drawBoard();
});

function makeMove(board, from, to) {
    const piece = board[from.row][from.col];
    board[to.row][to.col] = piece;
    board[from.row][from.col] = ' ';
}

function getClickedSquare(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return {
        row: Math.floor(y / SQUARE_SIZE),
        col: Math.floor(x / SQUARE_SIZE)
    };
}

function isCurrentPlayerPiece(piece) {
    return (currentPlayer === 'white' && piece === piece.toUpperCase()) ||
           (currentPlayer === 'black' && piece === piece.toLowerCase());
}

function isValidMove(from, to) {
    const piece = board[from.row][from.col];
    const targetPiece = board[to.row][to.col];
    const dx = to.col - from.col;
    const dy = to.row - from.row;

    if (targetPiece !== ' ' && (piece === piece.toUpperCase()) === (targetPiece === targetPiece.toUpperCase())) {
        return false;
    }

    switch (piece.toLowerCase()) {
        case 'p':
            const direction = piece === 'P' ? -1 : 1;
            const startRow = piece === 'P' ? 6 : 1;
            if (dx === 0 && dy === direction && targetPiece === ' ') return true;
            if (dx === 0 && dy === 2 * direction && from.row === startRow && board[from.row + direction][from.col] === ' ' && targetPiece === ' ') return true;
            if (Math.abs(dx) === 1 && dy === direction && targetPiece !== ' ') return true;
            return false;
        case 'r':
            return (dx === 0 || dy === 0) && isPathClear(from, to);
        case 'n':
            return (Math.abs(dx) === 2 && Math.abs(dy) === 1) || (Math.abs(dx) === 1 && Math.abs(dy) === 2);
        case 'b':
            return Math.abs(dx) === Math.abs(dy) && isPathClear(from, to);
        case 'q':
            return ((dx === 0 || dy === 0) || (Math.abs(dx) === Math.abs(dy))) && isPathClear(from, to);
        case 'k':
            return Math.abs(dx) <= 1 && Math.abs(dy) <= 1;
    }
    return false;
}

function isPathClear(from, to) {
    const dx = Math.sign(to.col - from.col);
    const dy = Math.sign(to.row - from.row);
    let x = from.col + dx;
    let y = from.row + dy;

    while (x !== to.col || y !== to.row) {
        if (board[y][x] !== ' ') return false;
        x += dx;
        y += dy;
    }
    return true;
}

function getValidMoves(piece) {
    const moves = [];
    for (let row = 0; row < BOARD_SIZE; row++) {  
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (isValidMove(piece, { row, col })) {
                const tempBoard = copyBoard(board);
                makeMove(tempBoard, piece, { row, col });
                if (!isInCheck(currentPlayer, tempBoard)) {
                    moves.push({ row, col });
                }
            }
        }
    }
    return moves;
}

function isInCheck(player, board) {
    const kingPosition = findKing(player, board);
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = board[row][col];
            if (piece !== ' ' && isEnemyPiece(player, piece)) {
                if (isValidMove({ row, col }, kingPosition)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function findKing(player, board) {
    const kingChar = player === 'white' ? 'K' : 'k';
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col] === kingChar) {
                return { row, col };
            }
        }
    }
    return null;
}

function isEnemyPiece(player, piece) {
    return (player === 'white' && piece === piece.toLowerCase()) ||
           (player === 'black' && piece === piece.toUpperCase());
}

function isInCheckmate(player, board) {
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = board[row][col];
            if (piece !== ' ' && isPlayerPiece(player, piece)) {
                const validMoves = getValidMoves({ row, col });
                if (validMoves.length > 0) return false;
            }
        }
    }
    return isInCheck(player, board);
}

function isPlayerPiece(player, piece) {
    return (player === 'white' && piece === piece.toUpperCase()) ||
           (player === 'black' && piece === piece.toLowerCase());
}

function copyBoard(board) {
    return board.map(row => [...row]);
}
