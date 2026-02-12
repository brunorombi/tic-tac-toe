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
    let gameStatus = true;
    let winner = '';
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

    const getWinner = () => {
        if (winner === players[0].mark) {
            winner = players[0].name;
        } else if (winner === players[1].mark) {
            winner = players[1].name;
        } 
        // else {
        //     winner = 'tie';
        // }
        return winner;
    }

    const getGameStatus = () => gameStatus;

    const checkWinner = () => {
            const boardMarked = board.getBoard().map(row => row.map((cell) => {
                return !cell.getValue() ? 0 : cell.getValue().mark;
            }));

            for (let i = 0; i < 3; i++) {
                const row = boardMarked[i][0];
                const column = boardMarked[0][i];
                if (row && row === boardMarked[i][1] && row === boardMarked[i][2]) {
                    gameStatus = false;
                    winner = row;
                    return;
                }
                if (column && column === boardMarked[1][i] && column === boardMarked[2][i]){
                    gameStatus = false;
                    winner = column;
                    return;
                }      
            }

            const center = boardMarked[1][1];
            if (center && ((center === boardMarked[0][0] && center === boardMarked[2][2]) || (center === boardMarked[2][0] && center === boardMarked[0][2]))) {
                gameStatus = false;
                winner = center;
                return;
            }

            const isFull = boardMarked.every(row =>
                row.every(cell => cell !== 0)
            );

            if(isFull) {
                gameStatus = false;
                winner = 'tie';
                return;
            }
    }

    const playRound = (row, col) => {
        if (!gameStatus) return;

        const validCell = board.markCell(row, col, getActivePlayer());
        if (!validCell) return;

        checkWinner();

        if (gameStatus) {
            switchPlayerTurn();
            printNewRound();
        }
    }

    // const endGame = () => {
        
    // }

    return {
        getWinner,
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
        const winner = game.getWinner()
    
        const activePlayer = game.getActivePlayer();
        gameStatus ? statusDiv.textContent = `${activePlayer.name} turn` : statusDiv.textContent = `Winner is ${winner}`;

        if (gameStatus) {
            statusDiv.textContent = `${activePlayer.name} turn`;
        } else {
            if (winner === 'tie') {
                statusDiv.textContent = 'Tie!';
            } else {
                statusDiv.textContent = `Winner is ${winner}`;
            }
        }

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