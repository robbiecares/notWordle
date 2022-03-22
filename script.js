const guessArea = document.getElementById('guess-area')
const letterBank = document.getElementById('letter-bank')


function createGuessArea() {
    for (i = 0; i < 6; i++) {
        let guessRow = document.createElement('div')
        guessRow.classList.add('guess-area-row')
        guessArea.appendChild(guessRow)
        for (j = 0; j < 5; j++) {
            let guessTile = document.createElement('div')
            guessTile.classList.add('guess-area-tile')
            guessRow.appendChild(guessTile)
        }
    }

}


function createLetterBank() {
    // Creates a set of tiles to represent the status of letters in the word.
    
    const row1 = 'QWERTYUIOP'
    const row2 = 'ASDFGHJKL'
    const row3 = 'ZXCVBNM'

    for (rowLetters of [row1, row2, row3]) {
        let rowDiv = document.createElement('div')
        rowDiv.classList.add('letter-bank-row')
        letterBank.append(rowDiv)
        for (i = 0; i < rowLetters.length; i++) {
            let tile = document.createElement('button')
            tile.innerHTML = rowLetters[i]
            tile.classList.add('letter-bank-tile')
            rowDiv.appendChild(tile)
        }
    }
    const lastRow = letterBank.lastChild
    const backBtn = document.createElement('button')
    backBtn.innerHTML = 'Back'
    backBtn.classList.add('letter-bank-tile')
    lastRow.append(backBtn)

    const enterBtn = document.createElement('button')
    enterBtn.innerHTML = 'Enter'
    lastRow.prepend(enterBtn)
    enterBtn.classList.add('letter-bank-tile')
    
}

function main() {
    createGuessArea()
    createLetterBank()
}

main()