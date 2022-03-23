const data = (() => {
    
    const secretWord = 'errie'
    let attempts = 0
    let  wrongLetters = []
    
    function isWord(word) {
        // Confirms word is in the list of valid words.
        
        return true
    }

    return {
        secretWord,
        isWord,
        attempts,
        wrongLetters
    }

})();


const displayController = (() => {

    const guessArea = document.getElementById('guess-area')
    const letterBank = document.getElementById('letter-bank')
    let letters
    let currentGuess = ''
    let activeRow


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
        activeRow = guessArea.firstChild
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
                tile.id = rowLetters[i]
                rowDiv.appendChild(tile)
            }
        }

        letters = document.querySelectorAll('.letter-bank-tile')
        letters.forEach(letter => letter.addEventListener('click', letterClick))

        const lastRow = letterBank.lastChild

        const backBtn = document.createElement('button')
        backBtn.innerHTML = 'Back'
        backBtn.classList.add('letter-bank-tile')
        lastRow.append(backBtn)
        backBtn.addEventListener('click', backLogic)

        const enterBtn = document.createElement('button')
        enterBtn.innerHTML = 'Enter'
        lastRow.prepend(enterBtn)
        enterBtn.classList.add('letter-bank-tile')
        enterBtn.addEventListener('click', enterLogic)
    }
 

    function letterClick(e) {
        if (currentGuess.length < 5) {
            currentGuess = currentGuess + e.target.innerHTML
        }
        // console.log(e.target.innerHTML)        
        displayCurrentGuess()
    }
    

    function backLogic() {
        if (currentGuess.slice(-1)) {
            currentGuess = currentGuess.slice(-1)
            displayCurrentGuess()
        }
    }


    function enterLogic() {
        if (currentGuess.length === 5 && data.isWord(currentGuess)) {
            data.attempts++
            checkGuess()
            if (currentGuess.toLowerCase() === data.secretWord) {
                console.log('you win!')
            } else if (data.attempts > 5) {
                console.log('better luck tomorrow!')
            } else {
                currentGuess = ''
                activeRow = guessArea.childNodes[data.attempts]
            }    
        }
    }


    var _letterInSecretWord = function(array, letter) {
        
        

        for (j; j < array.length; j++) {
            if (array[j] == letter) {
                return j;
            }
        }
        return false;
    }

    var _letterInSecretWord = function(array, letter) {
        
        let i = 0
        for (i; i < array.length; i++) {
            if (array[i] == letter) {
                return array[i];
            }
        }
        return false;
    }



    function checkGuess() {

        let formatttedGuess = currentGuess.toLowerCase()
        let secretWord = data.secretWord.split('')
        
        for (i=0; i < formatttedGuess.length; i++) {
            let guessedLetter = formatttedGuess[i]
            let tile = activeRow.childNodes[i]
            if (guessedLetter === secretWord[i]) {
                tile.classList.add('correctly-placed')
                secretWord[i] = undefined
            } else if (_letterInSecretWord(secretWord, guessedLetter) !== false) {
                let index = _letterInSecretWord(secretWord, guessedLetter)
                tile.classList.add('incorrectly-placed')
                secretWord[index] = undefined
            } else {
                tile.classList.add('not-in')
                data.wrongLetters.push(guessedLetter)
            }
        }
    }



    function displayCurrentGuess() {
        // Displays the current guess in the appropriate row of the guess area.
        
        console.log(currentGuess)
        space = activeRow.childNodes
        for (i = 0; i < 5; i++) {
            space[i].innerHTML = currentGuess[i] || ''
        }
    }


    function updateDisplay() {
        
    }

    return {
        createGuessArea,
        createLetterBank,
        guessArea
    }
    
})();


function main() {

    // initialize display
    displayController.createGuessArea()
    displayController.createLetterBank()
    

}

main()