const data = (() => {
    
    let wordBank = ['abate', 'apple', 'bread', 'depot', 'purge', 'renew', 'reeds'];
    let secretWord;
    let attempts;
    let notInWord;
    let incorrectPosition;
    let confirmedLetters;
    
    function setData() {
        // Creates the data structures for a new game.

        this.secretWord = wordBank[Math.floor(Math.random() * wordBank.length)];
        this.attempts = 0;
        this.notInWord = '';
        this.incorrectPosition = ['', '', '', '', ''];
        this.confirmedLetters = ['', '', '', '', ''];
    }

    // function createWordBank () {

    //     const testElem = document.createElement('span')
    //     testElem.setAttribute('id', 'test-elem')
    //     console.log(testElem)
    //     document.body.appendChild(testElem)

    //     function reqListener () {            
    //         testElem.innerHTML = this.responseText;
    //         console.log(testElem)
    //       }
        
    //     const oReq = new XMLHttpRequest();
    //     oReq.onreadystatechange = function() {
    //         if (oReq.readyState == 4 && oReq.status == 200) {
    //             document.getElementById('test-elem').innerHTML = oReq.responseText
    //         }
    //     }
    //     oReq.open("GET", "fiveLetterWords.txt");
    //     oReq.send();

    //     // let wordBank = testElem.innerHTML
    //     console.log(testElem)
        
        
    
    // }

    function addToNotInWord(l) {
        // Adds a letter to 'notInWord' is it's not already there.      
        
        if (!this.notInWord.includes(l)) {
            this.notInWord += l
        }
    } 
      
    return {
        attempts,
        // createWordBank,
        secretWord,
        wordBank,
        notInWord,
        addToNotInWord,
        incorrectPosition,
        confirmedLetters,
        setData
    }

})();


const displayController = (() => {

    const guessArea = document.getElementById('guess-area')
    const letterBank = document.getElementById('letter-bank')
    const resetbtn = document.getElementById('reset')
    resetbtn.addEventListener('click', resetLogic)
    let letters;
    let currentGuess = ''
    const activeRow = function() {
        return guessArea.childNodes[data.attempts]
    }


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
        // activeRow = guessArea.firstChild
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
        displayCurrentGuess()
    }
    

    function backLogic() {
        if (main.isActiveGame() && currentGuess.slice(-1)) {
            currentGuess = currentGuess.slice(0,-1)
            displayCurrentGuess()
        }
    }

    function resetLogic() {
        guessArea.innerHTML = ''
        letterBank.innerHTML = ''
        main.setupGame()
    }

    function enterLogic() {
        let guess = currentGuess.toLowerCase()
        // if (guess.length === 5 && data.wordBank.includes(guess)) {
        if (guess.length === 5) {
            checkGuess()
            data.attempts++
            main.reviewStatus(guess)
            currentGuess = ''
        }
    }

    var _letterInSecretWord = function(array, letter) {
        // Returns the indx of the letter in the array or false is not present.
        
        for (j=0; j < array.length; j++) {
            if (array[j] === letter) {
                return j;
            }
        }
        return false;

    }


    function checkGuess() {

        let formattedGuess = currentGuess.toLowerCase().split('');
        let secretWord = data.secretWord.split('');
        let i = 0;
        const guessTile = function(i) {
            return activeRow().childNodes[i]
        }
        const wordBankTile = function(i) {
            return document.getElementById(formattedGuess[i].toUpperCase())
        }
        
        // pass for correct letters in the correct location
        for (i = 0; i < formattedGuess.length; i++) {
            if (formattedGuess[i] === secretWord[i]) {
                guessTile(i).classList.add('correctly-placed')
                wordBankTile(i).classList.add('correctly-placed')
                data.confirmedLetters[i] = formattedGuess[i]
                formattedGuess[i] = undefined
                secretWord[i] = undefined
            }
        }   
        // pass for correct letters in wrong location and incorrect letters
        for (i = 0; i < formattedGuess.length; i++) {
            let index = _letterInSecretWord(secretWord, formattedGuess[i])
            if (formattedGuess[i]) {
                if (index === false) {
                    guessTile(i).classList.add('not-in')
                    wordBankTile(i).classList.add('not-in')
                    data.addToNotInWord(formattedGuess[i])
                } else {    
                    guessTile(i).classList.add('incorrectly-placed')
                    wordBankTile(i).classList.add('incorrectly-placed')
                    data.incorrectPosition[i] += formattedGuess[i]
                    formattedGuess[i] = undefined
                    secretWord[index] = undefined
                }
            }   
        }
    }


    function displayCurrentGuess() {
        // Displays the current guess in the appropriate row of the guess area.
        
        let space = activeRow().childNodes
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


const main = (() => {

    let activeGame;

    function setupGame() {
        // sets variables and call functions required for starting a new game.
        
        // create page
        displayController.createGuessArea()
        displayController.createLetterBank()
        data.setData()
        
        // set gameplay flag
        activeGame = true
    }
    

    function reviewStatus(guess) {
        // Checks the game for win coniditions. if present 
        if (guess === data.secretWord) {
            console.log('you win!')
            activeGame = false
        } else if (data.attempts > 5) {
            console.log('better luck next time!')
            activeGame = false
        } else {
            currentGuess = ''
        }    
    }


    function isActiveGame() {
        return activeGame
    }
    
    return {
        isActiveGame,
        reviewStatus,
        setupGame
    }

})()

main.setupGame()


// bug: back button still works after a solve
// todo: rework guess tile logic so that click will set the color
    // and use the color as feedback for finding the word
// create play and solve modes for the game


// stopped at:
    // creating modal for endgame status



