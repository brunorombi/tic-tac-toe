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

    const resetBoard = () => {
        for(let i = 0; i < rows; i++) {
            for(let j = 0; j < columns; j++) {
                board[i][j] = Cell();
            }
        }
    }

    return {
        getBoard,
        markCell,
        resetBoard
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

function GameController() {

    let gameStatus = true;
    let winner = '';
    const board = Gameboard();

    const players = [
        {
            name: '',
            mark:'X',
            score: 0
        },
        {
            name: '',
            mark: 'O',
            score: 0
        }
    ]

    const getPlayersName = () => {
        return {player1: players[0].name, player2: players[1].name};
    }

    const getPlayersScore = () => {
        return {player1: players[0].score, player2: players[1].score};
    }

    const resetPlayersScore = () => {
        players[0].score = 0;
        players[1].score = 0;
    }

    let activePlayer = players[0];

    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    }
    const getActivePlayer = () => activePlayer;

    const getWinner = () => {
        if (winner === players[0].mark) return players[0];
        if (winner === players[1].mark) return players[1];
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

                    const player = players.find(p => p.mark === row);
                    player.score++;

                    return;
                }
                if (column && column === boardMarked[1][i] && column === boardMarked[2][i]){
                    gameStatus = false;
                    winner = column;

                    const player = players.find(p => p.mark === winner);
                    player.score++;

                    return;
                }      
            }

            const center = boardMarked[1][1];
            if (center && ((center === boardMarked[0][0] && center === boardMarked[2][2]) || (center === boardMarked[2][0] && center === boardMarked[0][2]))) {
                gameStatus = false;
                winner = center;

                const player = players.find(p => p.mark === winner);
                player.score++;

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
        }
    }

    const resetGame = () => {
        board.resetBoard();
        winner = '';
        gameStatus = true; 
        activePlayer = players[0];
    }

    const fillPlayers = (player1, player2) => {
        players[0].name = player1;
        players[1].name = player2;
    }

    return {
        getPlayersName,
        resetPlayersScore,
        getPlayersScore,
        fillPlayers,
        resetGame,
        getWinner,
        getGameStatus,
        getActivePlayer,
        playRound,
        getBoard: board.getBoard
    };
}

function ScreenController() {
    const form = document.querySelector('#form');
    const dialog = document.querySelector('#dialog');
    const game = GameController();
    dialog.showModal();

    
    const statusDiv = document.querySelector('.status');
    const boardDiv = document.querySelector('.board');
    const resetBtn = document.querySelector('#reset');
    
    
    
    const updateScreen = () => {
        boardDiv.textContent = '';
        const gameStatus = game.getGameStatus();
        const winner = game.getWinner()
        const score1 = document.querySelector('.player-one-score');
        score1.textContent = `score: ${game.getPlayersScore().player1}`;
        const score2 = document.querySelector('.player-two-score');
        score2.textContent = `score: ${game.getPlayersScore().player2}`;
    
        const player1Name = document.querySelector('.player-one-name');
        player1Name.textContent = game.getPlayersName().player1;
        const player2Name = document.querySelector('.player-two-name');
        player2Name.textContent = game.getPlayersName().player2;

        const activePlayer = game.getActivePlayer();
        
        if (gameStatus) {
            if(activePlayer.name) {
                statusDiv.textContent = `${activePlayer.name} turn`;
            }
        } else {
            if (winner === 'tie') {
                statusDiv.textContent = 'Tie!';
            } else {
                statusDiv.textContent = `Winner is ${winner.name}`;
            }
            
            setTimeout(function() {
                game.resetGame();
                updateScreen();
            },2000)
        }
        

        const board = game.getBoard();
        
        board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellBtn = document.createElement('button');
                cellBtn.classList.add('cell');
                
                cellBtn.dataset.row = rowIndex;
                cellBtn.dataset.column = colIndex;
                
                const value = cell.getValue();
                if(value) {
                    cellBtn.textContent = value.mark;
                    cellBtn.style.color = value.mark === 'X' ? '#3B82F6' : '#EF4444';
                }

                boardDiv.appendChild(cellBtn);
            });
        });            
    }
    
    form.addEventListener('submit', function(e) {
        e.preventDefault(); 
        const playerOneName = document.querySelector('#player1').value;
        const playerTwoName = document.querySelector('#player2').value;
        
        game.fillPlayers(playerOneName, playerTwoName);
        dialog.close();
        form.reset();
        updateScreen();
    });
    
    resetBtn.addEventListener('click', () => {
        game.resetGame();
        game.resetPlayersScore();
        dialog.showModal();
        updateScreen();
    });
    
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