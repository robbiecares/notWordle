const data = (() => {
    
    const secretWord = 'kkllm'
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
            currentGuess = currentGuess.slice(0,-1)
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
                return i;
            }
        }
        return false;
    }



    function checkGuess() {

        let formattedGuess = currentGuess.toLowerCase().split('');
        let secretWord = data.secretWord.split('');
        let i = 0;
        const guesssTile = function(i) {
            return activeRow.childNodes[i]
        }
        let wordBankTile = document.getElementById(formattedGuess[i].toUpperCase())
        
        // a pass for correct letters in the correct location
        for (i = 0; i < formattedGuess.length; i++) {
            if (formattedGuess[i] === secretWord[i]) {
                guesssTile(i).classList.add('correctly-placed')
                wordBankTile.classList.add('correctly-placed')
                secretWord[i] = undefined
                formattedGuess[i] = undefined
            }
        }   
        for (i = 0; i < formattedGuess.length; i++) {
            let index = _letterInSecretWord(secretWord, formattedGuess[i])
            if (formattedGuess[i]) {
                if (index === false) {
                    guesssTile(i).classList.add('not-in')
                    wordBankTile.classList.add('not-in')
                    data.wrongLetters.push(formattedGuess[i])
                } else {    
                    guesssTile(i).classList.add('incorrectly-placed')
                    wordBankTile.classList.add('incorrectly-placed')
                    secretWord[index] = undefined
                    formattedGuess[i] = undefined
                }
            }   
        }
    }


    function displayCurrentGuess() {
        // Displays the current guess in the appropriate row of the guess area.
        
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

// stopped at: bug in highlighting correctly placed letter.
    // word = kkllm, guess = mooom. first m is highlighted yellow, last m is grey