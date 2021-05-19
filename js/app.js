'use strict'

//ELEMENTS FROM DOM
var elMinesCountNum = document.querySelector('.mines-count-num');
var elStatusGameIcon = document.querySelector('.status-game-icon');


//GLOBAL VARIABLS
var MINE = 'MINE';
var EMPTY = 'EMPTY';

var MINE_ICON = '💣';
var FLAG_ICON = '🚩';


var gBoard;
var gNumOfGuessedMines = 0;
var gNumOfMines;
// var gNumCount;
var gMineCells;

var gGame = {
    isOn: null,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

var gLevel = {
    SIZE: 4,
    MINES: 2
   };
   



function initGame() {
    elStatusGameIcon.innerText = '😀';
    gMineCells=[];
    gGame.isOn = true;
    gNumOfMines = 4;
    gBoard = buildBoard();
    placeRandMinesOnBoard(gBoard, gNumOfMines);
    renderMinesCount();
    renderBoard(gBoard);
}


function buildBoard() {
    //create the matrix
    var board = createMat(4, 4);

    //put mines and empty cells
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {

            //put empty in regular cell
            var cell = {
                minesAroundCount: 0,
                location: { i: i, j: j },
                isShown: false,
                isMine: false,
                isMarked: false
            }

            board[i][j] = cell;
        }
    }

    return board
}



//place random mines


function placeRandMinesOnBoard(board, gNumOfMines) {
    var emptyCellPositions = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cellPos = {i: i, j: j};
            emptyCellPositions.push(cellPos);
        }
    }

    for (var m = 0; m < gNumOfMines; m++) {
        var randomIndx = getRandomIntInclusive(0, emptyCellPositions.length - 1);
        var randCellPos = emptyCellPositions[randomIndx];
        var currCell = gBoard[randCellPos.i][randCellPos.j];
        
        gMineCells.push(currCell);
        
        console.log('mineCells',currCell)

        currCell.isMine = true;
        emptyCellPositions.splice(randomIndx, 1);
    }

}



//Render the board to an HTML table

function renderBoard(board) {

    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            // var currCell = board[i][j];

            var cellClass = getClassName({ i: i, j: j });
            cellClass += ' cell-bg-before-clicked';

            strHTML += `\t<td class="cell ${cellClass}" 
                        onclick="cellClicked(${i},${j})" oncontextmenu="cellMarked(${i},${j},event)">\n
                        <span></span>
                        \t</td>\n`
        }

        strHTML += '</tr>\n';
    }

    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}



// Returns the class name for a specific cell
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}



// Called when a cell (td) is clicked

function cellClicked(i, j) {

    //if game is over you cant click on cells
    if(!gGame.isOn) return;

    var cellLocation = { i: i, j: j };
    var currCell = gBoard[i][j];

    //checks if cell is marked
    if (currCell.isMarked) return;

    if (!currCell.isShown) {
        //update Model
        currCell.isShown = true;
        //update DOM
        if (currCell.isMine) {
            renderCell(cellLocation, MINE_ICON);
            checkGameOver(currCell);

        } else {
            var minesAroundCount = setMinesNegsCount(gBoard, cellLocation);
            if (minesAroundCount > 0) {
                renderCell(cellLocation, minesAroundCount);
            } else {
                renderCell(cellLocation);
            }

        }

    }
}


// update DOM when cell clicked. (location such as: {i: 2, j: 7}) 
function renderCell(location, value = '') {
    //selsect cell and span inside cell
    var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
    var elCellSpan = document.querySelector(`.cell-${location.i}-${location.j} span`);

    var currCell = gBoard[location.i][location.j];

    if (!currCell.isMarked) {

        //change cell bg after clicked 
        elCell.classList.remove('cell-bg-before-clicked');
        elCell.classList.add('cell-bg-after-clicked');

        // set the span value
        elCellSpan.innerText = value;

    } else {

        // set the span value
        elCellSpan.innerText = value;
    }

}


// returns num of mines neighbors for a cell

function setMinesNegsCount(board, location) {
    var minesAroundCellCount = 0;

    //if cell is a mine don't check negs
    if (board[location.i][location.j].isMine) return;

    // check negs around a none mine cell
    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue
            if (i === location.i && j === location.j) continue
            var cell = board[i][j];

            if (cell.isMine) {
                minesAroundCellCount++;
            }

        }
    }

    //update model 
    board[location.i][location.j].minesAroundCount = minesAroundCellCount;

    return minesAroundCellCount;
}



// // right click to mark a cell

function cellMarked(i, j, ev) {
    ev.preventDefault();
    //if game is over you cant mark cells
    if(!gGame.isOn) return;

    var currCell = gBoard[i][j];

    //checks if cell is shown
    if (currCell.isShown) return;

    if (!currCell.isMarked) {
        gNumOfGuessedMines++;
        //Update Model
        currCell.isMarked = true;
        //Update DOM 
        renderCell(currCell.location, FLAG_ICON);
        renderMinesCount();
        checkGameOver(currCell);


    } else {

        gNumOfGuessedMines--;
        //Update DOM 
        renderCell(currCell.location, '');
        renderMinesCount();
        // Update Model
        currCell.isMarked = false;
    }

}

// render the mine count element 
function renderMinesCount() {
    elMinesCountNum.innerText = `${getDiffOfMines()}`;
}

function getDiffOfMines(){
    var numCount = gNumOfMines - gNumOfGuessedMines;
    return numCount
}


// Game ends when all mines are marked, and all the other cells are shown

function checkGameOver(cell) {
    
    if (gNumOfGuessedMines === gNumOfMines) {
        gGame.isOn = false;
        elStatusGameIcon.innerText = '😎';
    } else if (cell.isMine) {
        gGame.isOn = false;
        elStatusGameIcon.innerText = '🤯';
        for(var i = 0; i < gMineCells.length; i++){
            var currCell = gMineCells[i];
            renderCell(currCell.location, MINE_ICON);
        }  
    }


}


// // When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors. 
// function expandShown(board, elCell, i, j) {

// }
