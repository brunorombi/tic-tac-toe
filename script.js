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
        if(board[row][col].getValue() !== 0) return;
        board[row][col].markPlayer(player);
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
    let gameStatus = true;

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

    const getGameStatus = () => gameStatus;

    const checkWinner = () => {
            const boardMarked = board.getBoard().map(row => row.map((cell) => {
                return !cell.getValue() ? 0 : cell.getValue().mark
            }));

            for (let i = 0; i < 3; i++) {
                const row = boardMarked[i][0];
                const column = boardMarked[0][i];
                if (row && row === boardMarked[i][1] && row === boardMarked[i][2]) {
                    gameStatus = false;
                    return true;
                }
                if (column && column === boardMarked[1][i] && column === boardMarked[2][i]){
                    gameStatus = false;
                    return true;
                }      
            }

            const center = boardMarked[1][1];
            if (center && ((center === boardMarked[0][0] && center === boardMarked[2][2]) || (center === boardMarked[2][0] && center === boardMarked[0][2]))) {
                gameStatus = false;
                return true;
            }
            
    }

    const playRound = (row, col) => {
        const gameStatus = getGameStatus();
        if (gameStatus) {
            board.markCell(row, col, getActivePlayer());
        };

        if (!checkWinner()) {
            switchPlayerTurn();           
        }
        printNewRound();
    }

    // const endGame = () => {
        
    // }

    return {
        getGameStatus,
        getActivePlayer,
        playRound,
        getBoard: board.getBoard
    };
}

function ScreenController() {
    const game = GameController();
    const statusDiv = document.querySelector('.status');
    const boardDiv = document.querySelector('.board');
    
    const updateScreen = () => {
        boardDiv.textContent = '';
        const gameStatus = game.getGameStatus();

        const activePlayer = game.getActivePlayer();
        gameStatus ? statusDiv.textContent = `${activePlayer.name} turn` : statusDiv.textContent = `Winner is ${activePlayer.name}`

        const board = game.getBoard();
        
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

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.column);
        game.playRound(row, col);
        updateScreen();
    }

    boardDiv.addEventListener('click', clickHandlerBoard);

    updateScreen();
}

ScreenController();