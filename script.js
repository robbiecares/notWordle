const data = (() => {
    
    let wordBank = ['abate', 'apple', 'bread', 'depot', 'purge', 'renew', 'reeds'];
    let secretWord;
    let attempts;
    let notInWord;
    let misplacedLetters;
    let confirmedLetters;
    
    function setData() {
        // Creates the data structures for a new game.

        this.secretWord = wordBank[Math.floor(Math.random() * wordBank.length)];
        this.attempts = 0;
        this.notInWord = '';
        this.misplacedLetters = Array(5).fill(undefined);
        this.confirmedLetters = Array(5).fill(undefined);
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
      

    function searchWordList() {
        
    }


    return {
        attempts,
        // createWordBank,
        secretWord,
        wordBank,
        notInWord,
        addToNotInWord,
        misplacedLetters,
        confirmedLetters,
        setData,
        searchWordList
    }

})();


const displayController = (() => {

    const guessArea = document.getElementById('guess-area')
    const letterBank = document.getElementById('letter-bank')
    
    const resetBtn = document.getElementById('reset')
    resetBtn.addEventListener('click', resetLogic)

    const wordListBtn = document.getElementById('word-list')
    wordListBtn.addEventListener('click', wordBtnLogic)
    wordListBtn.style.display = 'none'

    const modeSelector = document.getElementById('mode-selector')
    modeSelector.addEventListener('change', modeSelectorLogic)

    const modal = document.getElementById('modal')
    document.getElementById('modal-close').addEventListener('click', () => modal.style.display = "none")

    let letters;
    let guessTiles;
    let guess;
    const activeRow = (i=data.attempts) => {return guessArea.childNodes[i]}
    const guessTile = (i) => {return activeRow().childNodes[i]}
    const wordBankTile = (l) => {return document.getElementById(l.toUpperCase())}
    
    
    function createGuessArea() {
        for (i = 0; i < 6; i++) {
            let row = document.createElement('div')
            row.classList.add('guess-area-row')
            guessArea.appendChild(row)
            for (j = 0; j < 5; j++) {
                let tile = document.createElement('div')
                tile.classList.add('guess-area-tile')
                row.appendChild(tile)
            }
        }
        guessTiles = document.querySelectorAll('.guess-area-tile')
        guess = Array(5).fill(undefined)
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
        letters.forEach(letter => letter.addEventListener('click', clickLetterBankLetter))

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
 

    function clickLetterBankLetter(e) {
        for (i=0; i < guess.length; i++) {
            if (!guessTile(i).innerHTML) {
                guess[i] = (e.target.innerHTML.toLowerCase())
                break;   
            }
        }
        displayGuess()
    }
    

    function backLogic() {
        if (main.isActiveGame()) {
            for(i=guess.length-1; i >= 0; i--) {
                if (guess[i] === data.confirmedLetters[i]) {
                    continue;
                } else {
                    guess[i] = undefined
                    if (modeSelector.value === 'solve') {
                        guessTile(i).className = ''
                        guessTile(i).classList.add('guess-area-tile')
                        guessTile(i).classList.add('not-in')
                    }
                    break;
                }                 
            }
            displayGuess()
        }
    }


    function enterLogic() {
        modeSelector.disabled = true
        // if (guess.length === 5 && data.wordBank.includes(guess)) {
        if (!guess.includes(undefined)) {
            if (modeSelector.value === 'solve') {
                solveModeRoundReview()
                main.reviewStatus(guess)
                guess = [...data.confirmedLetters]
                // prefill confirmed letters in next activeRow
                if (data.attempts < 5) {
                    displayGuess(activeRow(data.attempts+1))
                }
            } else {   
                playModeRoundReview()   
                main.reviewStatus(guess)     
                guess = Array(5).fill(undefined)
            }
        data.attempts++
        
        }
    }


    function resetLogic() {
        guessArea.innerHTML = ''
        letterBank.innerHTML = ''
        main.setupGame()
        modeSelector.disabled = false
    }


    function modeSelectorLogic() {
        
        let visibility;

        if (modeSelector.value === 'solve') {
            visibility = 'flex';
            guessTiles.forEach(tile => {
                tile.addEventListener('click', toggleLetterStatus);
                tile.classList.add('not-in')
            })
        } else {
            visibility = 'none';
            guessTiles.forEach(tile => {
                tile.removeEventListener('click', toggleLetterStatus);
                tile.className = '';
                tile.classList.add('guess-area-tile')
            })            
        }
        wordListBtn.style.display = visibility       
    }


    function wordBtnLogic() {
        showModal()
    }


    function showModal(message) {
        // Accesses the modal.

        modal.style.display = "flex"
        document.getElementById('modal-text').innerHTML = message

    }


    function _letterInSecretWord(array, letter) {
        // Returns the indx of the letter in the array or false is not present.
        for (j = 0; j < array.length; j++) {
            if (array[j] === letter) {
                return j;
            }
        }
        return false;
    }


    function playModeRoundReview() {

        // let formattedGuess = currentGuess.toLowerCase().split('');
        let secretWord = data.secretWord.split('');
        let i = 0;
        // const guessedLetter = (i) => {return guess[i]};
        // pass for correct letters in the correct location
        for (i = 0; i < guess.length; i++) {
            if (guess[i] === secretWord[i]) {
                guessTile(i).classList.add('correct')
                wordBankTile(guess[i]).classList.add('correct')
                guess[i] = undefined
                secretWord[i] = undefined
            }
        }   
        // pass for correct letters in wrong location and incorrect letters
        for (i = 0; i < guess.length; i++) {
            let index = _letterInSecretWord(secretWord, guess[i])
            if (guess[i]) {
                if (index === false) {
                    guessTile(i).classList.add('not-in')
                    wordBankTile(guess[i]).classList.add('not-in')
                } else {    
                    guessTile(i).classList.add('misplaced')
                    wordBankTile(guess[i]).classList.add('misplaced')
                    guess[i] = undefined
                    secretWord[index] = undefined
                }
            }   
        }
    }


    function solveModeRoundReview() {

        for (i = 0; i < activeRow().children.length; i++) {
            let gTile = guessTile(i)
            let classes = Array.from(gTile.classList)
            let letter = gTile.innerHTML.toLowerCase()          
            let wBTile = wordBankTile(letter)
            if (classes.includes('not-in')) {
                data.notInWord += letter
            } else if (classes.includes('misplaced')) {
                data.misplacedLetters[i] += letter
                wBTile.classList.add('misplaced')    
            } else if(classes.includes('correct')) {
                data.confirmedLetters[i] = letter
                wBTile.classList.add('correct')
            }
            gTile.removeEventListener('click', toggleLetterStatus)
        }
    }


    function toggleLetterStatus() {
        
        if (this.innerHTML) {
            classes = ['not-in', 'misplaced', 'correct'];
            let current = this.classList;
            current.forEach(c => {
                if (classes.includes(c)) {
                    let i = classes.indexOf(c)
                    this.classList.remove(c)
                    i = (i === 2) ? 0 : i + 1
                    this.classList.add(classes[i])            
                };
            });
        }

    }


    function displayGuess(row=activeRow()) {
        // Displays the current guess in the appropriate row of the guess area.
        
        let spaces = row.childNodes
        for (i = 0; i < spaces.length; i++) {
            if (data.confirmedLetters[i]) {
                spaces[i].classList.add('correct')
            }
            spaces[i].innerHTML = guess[i] ? guess[i].toUpperCase() : ''
            
        }
    }

    return {
        createGuessArea,
        createLetterBank,
        guessArea,
        showModal,
        modeSelectorLogic
    }
})();


const main = (() => {

    let activeGame;
    const modal = displayController.modal


    function setupGame() {
        // sets variables and call functions required for starting a new game.
        
        // create page
        displayController.createGuessArea()
        displayController.createLetterBank()
        data.setData()
        displayController.modeSelectorLogic()
        
        // set gameplay flag
        activeGame = true
    }
    

    function reviewStatus(guess) {
        // Checks the game for win coniditions. if present 
        if (guess.join('') === data.secretWord) {
            displayController.showModal('You win!')
            activeGame = false
        } else if (data.attempts > 5) {
            displayController.showModal('the word was ' + data.secretWord.toUpperCase())
            activeGame = false  
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


// idea: remove or hide letter of wordbank tile for any 'not-in' letters
// todo: set gameover logic for solve mode

// stopped at: ...


