function Gameboard() {
    const board = [];
    const rows = 3;
    const columns = 3; 

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for(let j = 0; j < columns; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;
    
    const markCell = (row, col, player) => {
        if(board[row][col].getValue() !== 0) return false;
        board[row][col].markPlayer(player);
        return true;
    };

    const printBoard = () => {
        const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()));
        console.log(boardWithCellValues);
    }

    return {
        getBoard,
        markCell,
        printBoard
    };

}

function Cell() {
    let value = 0;

    const markPlayer = (player) => {
        value = player;
    }

    const getValue = () => value;

    return {markPlayer, getValue};
}

function GameController(
    playerOneName = "Player One", 
    playerTwoName = "Player Two"
) {
    const board = Gameboard();

    const players = [
        {
            name: playerOneName,
            mark:'X'
        },
        {
            name: playerTwoName,
            mark: 'O'
        }
    ]

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }
    const getActivePlayer = () => activePlayer;
    
    const printNewRound = () => {
        console.log(`${getActivePlayer().name}'s turn`)
    }

    const playRound = (row, col) => {
        const validCell = board.markCell(row, col, getActivePlayer());
        if (!validCell) return;
        console.log(`${getActivePlayer().name} mark into row: ${row} and column: ${col}`)
        
        const checkWinner = () => {
            const boardMarked = board.getBoard().map(row => row.map((cell) => {
                return !cell.getValue() ? 0 : cell.getValue().mark
            }));

            for (let i = 0; i < 3; i++) {
                const row = boardMarked[i][0];
                const column = boardMarked[0][i];
                if (row && row === boardMarked[i][1] && row === boardMarked[i][2]) return row;
                if (column && column === boardMarked[1][i] && column === boardMarked[2][i]) return column;     
            }

            const center = boardMarked[1][1];
            if (center && ((center === boardMarked[0][0] && center === boardMarked[2][2]) || (center === boardMarked[2][0] && center === boardMarked[0][2]))) {
                console.log('ganhou, centro')
                return center;
            }
            
        }

        if (checkWinner()) return;
        switchPlayerTurn();
        printNewRound();
    }

    return {
        getActivePlayer,
        playRound,
        getBoard: board.getBoard
    };
}

function ScreenController() {
    const game = GameController();
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');
    
    const updateScreen = () => {
        boardDiv.textContent = '';

        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();
        
        playerTurnDiv.textContent = `${activePlayer.name}'s turn`

        board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellBtn = document.createElement('button');
                cellBtn.classList.add('cell');

                cellBtn.dataset.row = rowIndex;
                cellBtn.dataset.column = colIndex;
                
                const value = cell.getValue();
                cellBtn.textContent = value === 0 ? '' : value.mark;
                boardDiv.appendChild(cellBtn);
            });
        });            
    }

    

    function clickHandlerBoard(e) {
        if(!e.target.classList.contains('cell')) return;

        const row = e.target.dataset.row;
        const col = e.target.dataset.column;

        game.playRound(row, col);
        updateScreen();
    }

    boardDiv.addEventListener('click', clickHandlerBoard);

    updateScreen();
}

ScreenController();