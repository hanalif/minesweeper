
function createSquareMat(SIZE) {
    var mat = []
    for (var i = 0; i < SIZE; i++) {
        var row = []
        for (var j = 0; j < SIZE; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
  }


  function getRandomPositionOnBoard(board) {
    var randiPos = getRandomIntInclusive(1, board.length - 2);
    var randjPos = getRandomIntInclusive(1, board[0].length - 2);
    var randPos = { i: randiPos, j: randjPos };
    return randPos;
}