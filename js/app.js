'use strict'

//ELEMENTS FROM DOM
var elMinesCountNum = document.querySelector('.mines-count-num');
var elStatusGameIcon = document.querySelector('.status-game-icon');
var elGameSecondsSpan = document.querySelector('.game-seconds-span');
var elLiveCount = document.querySelector('.live-count');
var elCluesContainer = document.querySelector('.clues-container');
var elSafeClicksContainer = document.querySelector('.safe-clicks-container');

//GLOBAL VARIABLS
var MINE = 'MINE';
var EMPTY = 'EMPTY';

var MINE_ICON = '💣';
var FLAG_ICON = '🚩';
var LIVE_ICON = '❤';
var CLUE_NOT_ACTIVE_ICON = '⭐';
var CLUE_ACTIVE_ICON = '🌟';
var LIVES_AMOUNT = 3;
var CLUES_AMOUNT = 3;
var SAFE_CLICKS_AMOUNT = 3;

var LEVELS = {
    easy: {
        SIZE: 4,
        MINES: 3
    },
    hard: {
        SIZE: 8,
        MINES: 8
    },
    extreme: {
        SIZE: 12,
        MINES: 15
    }
}



var gSelectedLevelKey;
var gBoard;
var gNumOfFlags;
var gNumOfFlagsOnMine;
var gMineCells;
var gGameTimeSecond;
var gGameTimeIntervalId;
var gIsBoardTouched;
var gUsedLivesCount;
var gCluesUsageMaping;
var gCurrUsedclueNumber;
var gSafeClicksUsageMaping;
var gCurrUsedSafeClickNumber;


var gGame = {
    isOn: null,
    isClueActivated: null,
    isSafeClickActivated: null,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function initGame(level = 'easy') {
    gSelectedLevelKey = level;
    gGameTimeSecond = 0;
    gUsedLivesCount = 0;
    CreatescluesUsageMapObject();
    createSafeClickUsageObject();
    

    gGame.isSafeClickActivated = false;
    gGame.isClueActivated = false;
    elGameSecondsSpan.innerText = `${gGameTimeSecond}`;
    elStatusGameIcon.innerText = '😀';
    gNumOfFlags = 0;
    gNumOfFlagsOnMine = 0;
    gIsBoardTouched = false;
    gMineCells = [];
    gGame.isOn = true;
    clearInterval(gGameTimeIntervalId);
    gBoard = createSquareMat(LEVELS[gSelectedLevelKey].SIZE);
    buildBoard(gBoard);
    renderMinesCount();
    renderBoard(gBoard);
    renderLives();
    renderClues();
    renderSafeClicks();
}

function buildBoard(board) {
    //put mines and empty cells
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {

            //put empty in regular cell
            var cell = {
                minesAroundCount: 0,
                location: { i: i, j: j },
                isShown: false,
                isMine: false,
                isFlagged: false,
            }

            board[i][j] = cell;
        }
    }

    return board
}

//place random mines
function placeRandMinesOnBoard(board, numOfMines) {
    var emptyCellPositions = [];
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            if (!cell.isShown) {
                var cellPos = { i: i, j: j };
                emptyCellPositions.push(cellPos);
            }
        }
    }

    for (var m = 0; m < numOfMines; m++) {
        var randomIndx = getRandomIntInclusive(0, emptyCellPositions.length - 1);
        var randCellPos = emptyCellPositions[randomIndx];
        var currCell = gBoard[randCellPos.i][randCellPos.j];

        gMineCells.push(currCell);

        console.log('mineCells', currCell)

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

// render lives
function renderLives() {
    var strHTML = '';
    var remainingLives = LIVES_AMOUNT - gUsedLivesCount;
    for (var i = 0; i < remainingLives; i++) {
        strHTML += LIVE_ICON;
    }
    elLiveCount.innerText = strHTML;
}

//render clues
function renderClues() {
    var strHTML = '';
    for (var i = 0; i < CLUES_AMOUNT; i++) {
        strHTML += `\n<button class="clue" data-clue-number="${i}" onclick="activateClue(this)">${CLUE_NOT_ACTIVE_ICON}</button>\n`
    }
    elCluesContainer.innerHTML = strHTML;
}

// function that activates the clue

function activateClue(elClueBtn) {
    gCurrUsedclueNumber = elClueBtn.dataset.clueNumber;
    if (gGame.isClueActivated) return;
    if(gCluesUsageMaping[gCurrUsedclueNumber])return;
    gGame.isClueActivated = true;
    elClueBtn.innerText = CLUE_ACTIVE_ICON;

}

function CreatescluesUsageMapObject(){
    gCluesUsageMaping={}; 
    for(var i = 1; i <= CLUES_AMOUNT; i++){
        gCluesUsageMaping[i] = false
    }
    return gCluesUsageMaping;
}


function createSafeClickUsageObject(){
    gSafeClicksUsageMaping={};
    for(var i = 1; i<=SAFE_CLICKS_AMOUNT; i++){
        gSafeClicksUsageMaping[i]=false;
    }
} 



//render Safe-clicks

function renderSafeClicks(){
    var strHTML = '';
    for (var i = 0; i < SAFE_CLICKS_AMOUNT; i++){
        strHTML+= `\n<button class="safe-click" data-safe-click-number="${i}" onclick="activateSafeClick(this)">Safe-click</button>\n`
    } 
    elSafeClicksContainer.innerHTML = strHTML;
    
}

//function that activates the safe-click

function activateSafeClick(elSafeClickBtn){
    gCurrUsedSafeClickNumber = elSafeClickBtn.dataset.safeClickNumber; 
    if(gGame.isSafeClickActivated) return;
    if(gSafeClicksUsageMaping[gCurrUsedSafeClickNumber])return;
    gGame.isSafeClickActivated = true;
    elSafeClickBtn.style.color = "red";
    gGame.isOn = false;
    markArandomSafeCell(gBoard);
    gGame.isOn = true;
}



// Called when a cell (td) is clicked
function cellClicked(i, j) {
    console.log('board', gBoard);
    var cellLocation = { i: i, j: j };
    var currCell = gBoard[i][j];

    //if game is over you cant click on cells
    if (!gGame.isOn) return;

    setSecondsCountToGame();

    //checks if cell is marked
    if (currCell.isFlagged) return;

    if (!currCell.isShown) {
        if (gGame.isClueActivated) {
            gGame.isOn = false;
            showForASecondNegsCells(gBoard, currCell.location);
            gGame.isOn = true;
            return;
        }


        currCell.isShown = true;
        if (!gIsBoardTouched) {
            placeRandMinesOnBoard(gBoard, LEVELS[gSelectedLevelKey].MINES);
        }

        //update DOM
        if (currCell.isMine) {
            if (gUsedLivesCount < LIVES_AMOUNT) {

                gUsedLivesCount++;
                removeLifeFromDOM();
                renderCell(cellLocation, MINE_ICON);
            }

        } else {
            expandShown(gBoard, cellLocation);
        }
        checkGameOver(currCell);
    }
    renderMinesCount();
    gIsBoardTouched = true;
}


//  When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors. 
function expandShown(board, location) {
    if (!gGame.isOn) return;
    if (gGame.isClueActivated) return;
    if(gGame.isSafeClickActivated)return;
    var cell = board[location.i][location.j];
    //if cell is a mine don't check negs
    if (cell.isMine) return;

    //update Model
    var minesAroundCount = getMinesAroundCellCount(gBoard, location);
    // update DOM
    if (minesAroundCount > 0) {
        renderCell(cell.location, minesAroundCount);
        return;
    }

    //render area aroun currCell
    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            // if (i === location.i && j === location.j) continue
            var cell = board[i][j];
            if (cell.isMine) continue;
            if (cell.isFlagged) continue;
            cell.isShown = true;
            //update Model
            var minesAroundCount = getMinesAroundCellCount(gBoard, cell.location);
            // update DOM
            if (minesAroundCount > 0) {
                renderCell(cell.location, minesAroundCount);
            } else {
                renderCell(cell.location);
            }
        }
    }
}

// function that show the content of cell area
function showForASecondNegsCells(board, location) {

    for (var i = location.i - 1; i <= location.i + 1; i++) {
        if (i < 0 || i > board.length - 1) continue;
        for (var j = location.j - 1; j <= location.j + 1; j++) {
            if (j < 0 || j > board[0].length - 1) continue;
            var cell = board[i][j];
            // if (cell.isFlagged) continue;
            // //update Model
            var minesAroundCount = getMinesAroundCellCount(gBoard, cell.location);
            // update DOM
            if (minesAroundCount > 0) {
                renderCell(cell.location, minesAroundCount);
            } else if (cell.isMine) {
                renderCell(cell.location, MINE_ICON);
            } else {
                renderCell(cell.location);
            }
        }
    }

    setTimeout(() => {
        for (var i = location.i - 1; i <= location.i + 1; i++) {
            if (i < 0 || i > board.length - 1) continue;
            for (var j = location.j - 1; j <= location.j + 1; j++) {
                if (j < 0 || j > board[0].length - 1) continue;
                var cell = board[i][j];
                if (cell.isShown) continue;
                renderCellAfterClue(cell.location);
            }
        }
        gGame.isClueActivated = false;
        gCluesUsageMaping[gCurrUsedclueNumber] = true;
        
    }, 1000);

}


// marks a random safe cell after the user clicked a safe click button

function markArandomSafeCell(board){
    var notMinesCells = [];
    for(var i = 0; i<board.length; i++){
        for(var j=0; j<board[0].length; j++){
            var cell = board[i][j];
            if(cell.isMine)continue;
            if(cell.isFlagged)continue;
            if(cell.isShown)continue;
            notMinesCells.push(cell);
        }
    }

    var indexOfRandomNoneMineCell = getRandomIntInclusive(0, notMinesCells.length - 1);
    var randNoneMineCell = notMinesCells[indexOfRandomNoneMineCell];
    var elRandNoneMineCell = getCellElement(randNoneMineCell.location.i, randNoneMineCell.location.j);
        elRandNoneMineCell.classList.remove('cell-bg-before-clicked');
        elRandNoneMineCell.classList.add('safe-click-cell');

    setTimeout(() => {

        elRandNoneMineCell.classList.remove('safe-click-cell');
        elRandNoneMineCell.classList.add('cell-bg-before-clicked');
        gGame.isSafeClickActivated = false;
        gSafeClicksUsageMaping[gCurrUsedSafeClickNumber] = true;
    }, 1000);
}



// render cell after clue
function renderCellAfterClue(location, value = '') {


    var elCell = getCellElement(location.i, location.j);
    var elCellSpan = document.querySelector(`.cell-${location.i}-${location.j} span`);


    elCell.classList.remove('cell-bg-after-clicked');
    elCell.classList.add('cell-bg-before-clicked');
    elCellSpan.innerText = value;

}



// update DOM when cell clicked. (location such as: {i: 2, j: 7}) 
function renderCell(location, value = '') {
    //selsect cell and span inside cell
    var elCell = getCellElement(location.i, location.j);
    var elCellSpan = document.querySelector(`.cell-${location.i}-${location.j} span`);

    var currCell = gBoard[location.i][location.j];

    if (!currCell.isFlagged) {

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

// Returns the class name for a specific cell
function getClassName(location) {
    var cellClass = 'cell-' + location.i + '-' + location.j;
    return cellClass;
}

function getCellElement(i, j) {
    return document.querySelector(`.cell-${i}-${j}`);
}

//removes live icons from DOM
function removeLifeFromDOM() {
    renderLives();
    if (gUsedLivesCount === LIVES_AMOUNT) {
        elLiveCount.innerText = 'All Lives Used';
    }
}

// returns num of mines neighbors for a cell
function getMinesAroundCellCount(board, location) {
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
    if (!gGame.isOn) return;

    setSecondsCountToGame();

    var currCell = gBoard[i][j];

    //checks if cell is shown
    if (currCell.isShown) return;

    if (!currCell.isFlagged) {
        gNumOfFlags++;
        if (currCell.isMine) {
            gNumOfFlagsOnMine++;
        }

        //Update Model
        currCell.isFlagged = true;
        //Update DOM 
        renderCell(currCell.location, FLAG_ICON);
        renderMinesCount();
        checkGameOver(currCell);


    } else {

        gNumOfFlags--;
        if (currCell.isMine) {
            gNumOfFlagsOnMine--;
        }

        //Update DOM 
        renderCell(currCell.location, '');
        renderMinesCount();
        // Update Model
        currCell.isFlagged = false;
    }
}

// render the mine count element 
function renderMinesCount() {
    elMinesCountNum.innerText = `${getDiffOfMines()}`;
}

function getDiffOfMines() {
    var numCount = LEVELS[gSelectedLevelKey].MINES - gNumOfFlags - gUsedLivesCount;
    return numCount
}

// Game ends when all mines are marked, and all the other cells are shown
function checkGameOver(cell) {
    if (gNumOfFlagsOnMine === LEVELS[gSelectedLevelKey].MINES - gUsedLivesCount 
        && gUsedLivesCount !== LIVES_AMOUNT
        && gNumOfFlagsOnMine === gNumOfFlags) {
        gGame.isOn = false;
        elStatusGameIcon.innerText = '😎';
        clearInterval(gGameTimeIntervalId);

    } else if (gUsedLivesCount === LIVES_AMOUNT) {
        gGame.isOn = false;
        elStatusGameIcon.innerText = '🤯';
        for (var i = 0; i < gMineCells.length; i++) {
            var currCell = gMineCells[i];
            currCell.isFlagged = false;
            renderCell(currCell.location, MINE_ICON);
        }
        clearInterval(gGameTimeIntervalId);
    }
}

// set seconds to game
function setSecondsCountToGame() {
    elGameSecondsSpan.innerText = `${gGameTimeSecond}`;
    if (!gIsBoardTouched) {
        gGameTimeIntervalId = setInterval(() => {
            gGameTimeSecond++
            //DOM
            elGameSecondsSpan.innerText = `${gGameTimeSecond}`;

            //Model
            gGame.secsPassed = gGameTimeSecond;
        }, 1000)
    }
}

//game-difficulty
function handleDifficulty(el) {
    var level = el.value;
    initGame(level);
}