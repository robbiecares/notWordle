const data = (() => {
    
    let wordBank;
    let possibleWords;
    let secretWord;
    let attempts;
    let notInWord;
    let misplaced;
    let confirmed;
    

    function resetData() {
        // Creates the data structures for a new game.

        this.attempts = 0;
        createWordBank();
        this.notInWord = '';
        this.misplaced = Array(5).fill('');
        this.confirmed = Array(5).fill('');
    }


    function createWordBank () {

        function parseText(text) {
            text = text.split('\n')
            data.wordBank = [...text]
            data.possibleWords = [...text]
            data.secretWord = data.wordBank[Math.floor(Math.random() * data.wordBank.length)];
            displayController.modeSelectorLogic()
        }

        fetch('https://gist.githubusercontent.com/cfreshman/a7b776506c73284511034e63af1017ee/raw/845966807347a7b857d53294525263408be967ce/wordle-nyt-answers-alphabetical.txt')
            .then( response => {
                if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
                }
                return response.text();
            })
            .then( text => parseText(text) )
            .catch( err => console.error(`Fetch problem: ${err.message}`) );
    }


    function createPattern() {
        // Create a regex based on the known details of an unknown word.
        
        let pattern = ''
        for (i=0; i < 5; i++) {
            space = ''
            if (data.confirmed[i]) {
                space += data.confirmed[i]
            } else {
                if (data.misplaced[i]) {
                    space += data.misplaced[i]
                }
                if (data.notInWord) {
                    space += data.notInWord
                }
                space = space ? '[^' + space + ']' : '.'
            }    
            pattern += space

        }
        return new RegExp(pattern)
    }


    function searchWordList() {
        
        console.log(data.possibleWords)
        const regex = createPattern()
        console.log(regex)
        data.possibleWords = data.wordBank.filter(possibleWord => regex.exec(possibleWord) && containsMisplacedLettters(possibleWord))
        console.log(data.possibleWords)
    }


    // function containsMisplacedLetttersXXX(word) {

    //     function exists(value) {
    //         return Boolean(value) === true
    //     }
        
    //     let containsMisplaced = true
    //     const misplaced = data.misplaced.filter(exists)
        
    //     if (misplaced) {
    //         workingWord = Array(...word)
    //         for (x of misplaced) {
    //             let i = workingWord.indexOf(x)
    //             if (i < 0) {                    
    //                 containsMisplaced = false
    //                 break;
    //             } else {
    //                 workingWord.splice(i, 1)
    //             }
    //         }
    //     }
    //      return containsMisplaced
    // }
     
    


    function containsMisplacedLettters(word) {

    // word must contain all misplaced letters
    // word cannot contain the misplaced letter at the index of a confirmed letter

    
    containsMisplaced = true

    //  remove the already confirmed letters from the working word
    const workingWord = Array(...word)
    for (i=0; i > workingWord.length; i++) {
        if (workingWord[i] === data.confirmed[i]) {
            workingWord[i] = ''
        }
    }

    //  remove every misplaced letter
    for (letter of data.misplaced.join('')) {
        let i = workingWord.indexOf(letter)
        if (i > 0) {
            workingWord[i] = ''
        } else {
            containsMisplaced = false
            break;
        }
    }
    return containsMisplaced
 }

    return {
        attempts,
        createWordBank,
        secretWord,
        wordBank,
        possibleWords,
        notInWord,
        misplaced,
        confirmed,
        resetData,
        searchWordList
    }

})();


const displayController = (() => {

    const guessArea = document.getElementById('guess-area')
    const letterBank = document.getElementById('letter-bank')
    
    const resetBtn = document.getElementById('reset')
    resetBtn.addEventListener('click', reset)

    const settingsBtn = document.getElementById('settings')
    settingsBtn.addEventListener('click', showSettings)


    const showWordsBtn = document.getElementById('show-words')
    showWordsBtn.addEventListener('click', showWords)
    showWordsBtn.style.display = 'none'

    const modeSelector = document.getElementById('mode-selector')
    modeSelector.addEventListener('change', modeSelectorLogic)

    const wordCount = document.getElementById('word-count')

    const modal = document.getElementById('myModal')
    document.getElementsByClassName('close')[0].addEventListener('click', () => modal.style.display = "none")

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

    let letters;
    let guessTiles;
    let guess;
    const activeRow = (i=data.attempts) => {return guessArea.childNodes[i]}
    const guessTile = (i) => {return activeRow().childNodes[i]}
    const lettterBankBtn = (l) => {return document.getElementById(l.toUpperCase())}
    
    
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
        guess = Array(5).fill('')
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
        enterBtn.addEventListener('click', enter)
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
            let i = guess.length - 1
            while (!guessTile(i).innerHTML) {
                i--
            }
            guess[i] = ''
            if (modeSelector.value === 'solve') {
                guessTile(i).className = ''
                guessTile(i).classList.add('guess-area-tile')
                guessTile(i).classList.add('not-in')
            }
            displayGuess()
        }
    }


    function enter() {
        // Validates the word input by the user calls other functions based on the input.

        if (!guess.includes('')) {
            if (data.wordBank.includes(guess.join(''))) {
            // if (data.wordBank.includes('apple')) {
                modeSelector.disabled = true
                if (modeSelector.value === 'solve') {
                    solveModeRoundReview()
                    data.searchWordList()
                    wordCount.innerHTML = data.possibleWords.length
                } else {   
                    playModeRoundReview()   
                }
                main.reviewStatus(guess)
                guess = Array(5).fill('')
                data.misplaced = Array(5).fill('')
            } else {
                showModal('Invalid word')
            }
        }
    }


    function reset() {
        // Resets the user input areas and saved data of the game.

        guessArea.innerHTML = ''
        letterBank.innerHTML = ''
        main.setupGame()
        modeSelector.disabled = false
    }


    function showSettings() {
        
        // playmode
        
        
        showModal('text')
    }


    function modeSelectorLogic() {
        
        let visibility;

        if (modeSelector.value === 'solve') {
            visibility = 'flex';
            guessTiles.forEach(tile => {
                tile.addEventListener('click', toggleLetterStatus);
                tile.classList.add('not-in')
            })
            wordCount.innerHTML = data.possibleWords.length
        } else {
            visibility = 'none';
            guessTiles.forEach(tile => {
                tile.removeEventListener('click', toggleLetterStatus);
                tile.className = '';
                tile.classList.add('guess-area-tile')
            })            
        }
        document.querySelectorAll('.solve-mode').forEach(elem => elem.style.display = visibility)
    }


    function showWords() {
        // Formats a list of words for display in the modal.
        
        let content = [];
        for (word of data.possibleWords) {
            wordDiv = document.createElement('div')
            wordDiv.classList.add('word-div')
            innerWordDiv = document.createElement('div')
            innerWordDiv.classList.add('word')
            innerWordDiv.innerHTML = word.toUpperCase()
            innerWordDiv.addEventListener('click', selectWord)
            wordDiv.appendChild(innerWordDiv)
            content.push(wordDiv)
            
        }
        showModal(content)
    }


    function selectWord() {
        // Allows the user to select a word from the list of possible words.

        guess = [...this.innerHTML.toLowerCase()]
        modal.style.display = "none"
        displayGuess()

    }

    function showModal(message='', header='&nbsp') {
        // Displays the modal.

        modal.getElementsByClassName('header-text').item([0]).innerHTML = header
        modal.style.display = "flex"
        const body = document.getElementsByClassName('modal-body').item(0)
        if (typeof(message) === 'string') {
            body.innerHTML = message
        } else {
            for (x of message) {
                body.appendChild(x)
            }
        }
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

        let roundGuess = [...guess]
        let secretWord = data.secretWord.split('');
        let i = 0;
        // const guessedLetter = (i) => {return guess[i]};
        // pass for correct letters in the correct location
        for (i = 0; i < roundGuess.length; i++) {
            if (roundGuess[i] === secretWord[i]) {
                guessTile(i).classList.add('correct')
                lettterBankBtn(roundGuess[i]).classList.add('correct')
                roundGuess[i] = ''
                secretWord[i] = ''
            }
        }   
        // pass for correct letters in wrong location and incorrect letters
        for (i = 0; i < roundGuess.length; i++) {
            let index = _letterInSecretWord(secretWord, roundGuess[i])
            if (roundGuess[i]) {
                if (index === false) {
                    guessTile(i).classList.add('not-in')
                    lettterBankBtn(roundGuess[i]).classList.add('not-in')
                } else {    
                    guessTile(i).classList.add('misplaced')
                    lettterBankBtn(roundGuess[i]).classList.add('misplaced')
                    roundGuess[i] = ''
                    secretWord[index] = ''
                }
            }   
        }
    }


    function solveModeRoundReview() {
        // Updates the data 

        for (i = 0; i < activeRow().children.length; i++) {
            let gTile = guessTile(i)
            let classes = Array.from(gTile.classList)
            let letter = gTile.innerHTML.toLowerCase()          
            let letterBankBtn = lettterBankBtn(letter)
            
            // add the letter to the appropriate variable for pattern building
            if (classes.includes('not-in')) {
                // data.notIncluded = data.createSet(letter, data.notIncluded)
                if (!data.notInWord.includes(letter))
                    data.notInWord += letter 
            } else if (classes.includes('misplaced')) {
                if (!data.misplaced[i].includes(letter))
                    data.misplaced[i] += letter 
                letterBankBtn.classList.add('misplaced')    
            } else if (classes.includes('correct')) {
                data.confirmed[i] = letter
                letterBankBtn.classList.add('correct')
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
        const previousRow = data.attempts > 0 ? activeRow(data.attempts - 1).childNodes : undefined
        for (i = 0; i < spaces.length; i++) {
            spaces[i].innerHTML = guess[i] ? guess[i].toUpperCase() : ''
            if (modeSelector.value === 'solve' && previousRow && spaces[i].innerHTML === previousRow[i].innerHTML) {
                spaces[i].classList = previousRow[i].classList
            }
            
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
        data.resetData()
        displayController.modeSelectorLogic()
        
        // set gameplay flag
        activeGame = true
    }
    

    function reviewStatus(guess) {
        // Checks the game for win coniditions. if present 
        if (guess.join('') === data.secretWord) {
            displayController.showModal('You win!')
            activeGame = false
        } else if (data.attempts > 4) {
            displayController.showModal(data.secretWord.toUpperCase())
            activeGame = false  
        } else {
            data.attempts++
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


// todo: show list of "most likely words" in modal

// idea: add cursor change to letter click hover

// idea: refactor 'show modal' to work based on the event trigger (i.e. of 'show word btn') rather than message data type

// idea: solve mode - color 'not in' letters of wordbank

// idea: solve mode - allow back button to return to previous row

// todo: factor 'update word bank btns' out of 'solve mode round review'


// todo: credit icon providers (see link at bottom of index)

// todo: credit wordlist provider

// thought: could misplaced be an string rather than an array?

// feature: treat win condition and word validation as fading notication




// stopped at: 


