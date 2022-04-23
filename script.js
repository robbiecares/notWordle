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
        
        const regex = createPattern()
        console.log(regex)
        possibleWords = data.wordBank.filter(possibleWord => regex.exec(possibleWord) && containsMisplacedLetters(possibleWord))
        console.log(possibleWords)
    }  


    function containsMisplacedLetters(word) {

    // word must contain all misplaced letters
    // word cannot contain the misplaced letter at the index of a confirmed letter

    containsMisplaced = true

    //  remove the already confirmed letters from the working word
    const workingWord = Array(...word)
    for (i=0; i < workingWord.length; i++) {
        if (workingWord[i] === data.confirmed[i]) {
            workingWord[i] = ''
        }
    }

    //  remove every misplaced letter
    for (letter of data.misplaced.join('')) {
        let i = workingWord.indexOf(letter)
        if (i > -1) {
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

    const message = document.getElementById('message')
    document.getElementById('message-close').addEventListener('click', () => message.style.display = "none")

    const showWordsSwitch = document.querySelector("input[name='show-word-list']")
    showWordsSwitch.addEventListener('click', toggleWordListSetting)

    const showWordsBtn = document.getElementById('show-words')
    showWordsBtn.addEventListener('click', showWordList)
    showWordsBtn.style.display = 'none'

    const wordCount = document.getElementById('word-count')

    const modal = document.getElementById('myModal')
    document.getElementById('modal-close').addEventListener('click', () => modal.style.display = "none")

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        }
    }

    // // this will prevent any zoom action by the user in ios safari and also prevent the "zoom to tabs" feature:
    //     // https://stackoverflow.com/questions/11689353/disable-pinch-zoom-on-mobile-web
    // document.addEventListener('gesturestart', function(e) {
    //     e.preventDefault();
    //     // special hack to prevent zoom-to-tabs gesture in safari
    //     document.body.style.zoom = 0.99;
    // });
    
    // document.addEventListener('gesturechange', function(e) {
    //     e.preventDefault();
    //     // special hack to prevent zoom-to-tabs gesture in safari
    //     document.body.style.zoom = 0.99;
    // });
    
    // document.addEventListener('gestureend', function(e) {
    //     e.preventDefault();
    //     // special hack to prevent zoom-to-tabs gesture in safari
    //     document.body.style.zoom = 0.99;
    // });

    let letters;
    let guessTiles;
    let guess;
    const activeRow = (i=data.attempts) => {return guessArea.childNodes[i]}
    const guessTile = (i) => {return activeRow().childNodes[i]}
    const letterBankBtn = (l) => {return document.getElementById(l.toUpperCase())}
    
    
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
                let tile = document.createElement('div')
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
        backBtn.addEventListener('click', back)

        const enterBtn = document.createElement('button')
        enterBtn.innerHTML = 'Enter'
        lastRow.prepend(enterBtn)
        enterBtn.classList.add('letter-bank-tile')
        enterBtn.addEventListener('click', enter)
    }
 

    function clickLetterBankLetter(e) {
        if (main.isActiveGame()) {
            for (i=0; i < guess.length; i++) {
                if (!guessTile(i).innerHTML) {
                    guess[i] = (e.target.innerHTML.toLowerCase())
                    break;   
                    }
            }
            displayGuess()
        }
    }
    

    function back() {
        if (main.isActiveGame()) {
            let i = guess.length - 1
            while (!guessTile(i).innerHTML) {
                i--
            }
            guess[i] = ''
            displayGuess()
        }
    }


    function enter() {
        // Validates the word input by the user calls other functions based on the input.

        if (!guess.includes('')) {
            if (data.wordBank.includes(guess.join(''))) {
            // if (data.wordBank.includes('apple')) {
                roundReview()

                main.reviewStatus(guess)
                
                data.searchWordList()
                guess = Array(5).fill('')
                // data.misplaced = Array(5).fill('')
            } else {
                showMessage('Invalid word')
            }
        }
    }


    function reset() {
        // Resets the user input areas and saved data of the game.

        guessArea.innerHTML = ''
        letterBank.innerHTML = ''
        message.style.display = 'none'
        main.setupGame()        
    }

    
    function showMessage(text, temp=true) {
        message.style.display = 'flex'
        document.getElementById('message-text').innerHTML = text
        if (temp) {
            setTimeout(() => {message.style.display = 'none'}, 3000)
        } else {
            message.children.namedItem('message-close').style.display = 'none'
        }
    }


    function showSettings() {

        const settings = document.getElementById('settings-div')
        settings.style.display = 'flex'
        
        showModal([settings], 'Settings')
    }


    function toggleWordListSetting() {
        showWordsSwitch.checked ? showWordsBtn.style.display = 'block' : showWordsBtn.style.display = 'none'
    }


    function showWordList() {
        // Formats a list of words for display in the modal.
        
        let content = [];
        for (word of data.possibleWords) {
            wordDiv = document.createElement('div')
            wordDiv.classList.add('word')
            wordDiv.innerHTML = word.toUpperCase()
            wordDiv.addEventListener('click', selectWord)
            content.push(wordDiv)            
        }
        const header = 'Wordlist (' + data.possibleWords.length + ')'
        showModal(content, header)
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
        body.innerHTML = ''
        for (x of message) {
            body.appendChild(x)
        }
    }


    function roundReview() {

        let roundGuess = [...guess]
        let secretWord = data.secretWord.split('');
        // let i = 0;
        // pass for correct letters in the correct location
        for (i = 0; i < roundGuess.length; i++) {
            if (roundGuess[i] === secretWord[i]) {
                guessTile(i).classList.add('correct')
                letterBankBtn(roundGuess[i]).classList.add('correct')
                data.confirmed[i] = roundGuess[i]
                // roundGuess[i] = ''
                secretWord[i] = ''
            }
        }   
        // pass for correct letters in wrong location and letters not in word
        for (i = 0; i < roundGuess.length; i++) {
            if (roundGuess[i]) {
                let index = secretWord.indexOf(roundGuess[i])
                if (index > -1) {
                    guessTile(i).classList.add('misplaced')
                    letterBankBtn(roundGuess[i]).classList.add('misplaced')
                    if (!data.misplaced[i].includes(roundGuess[i])) {
                        data.misplaced[i] += roundGuess[i] 
                    }
                    secretWord[index] = ''
                } else {    
                    guessTile(i).classList.add('not-in')
                    letterBankBtn(roundGuess[i]).classList.add('not-in')
                    if (!data.notInWord.includes(roundGuess[i]) && !data.secretWord.includes(roundGuess[i])) {
                        data.notInWord += roundGuess[i]
                    }
                }
            }   
        }
        
    }


    function displayGuess(row=activeRow()) {
        // Displays the current guess in the appropriate row of the guess area.
        
        let spaces = row.childNodes
        const previousRow = data.attempts > 0 ? activeRow(data.attempts - 1).childNodes : undefined
        for (i = 0; i < spaces.length; i++) {
            spaces[i].innerHTML = guess[i] ? guess[i].toUpperCase() : ''        
        }
    }

    return {
        createGuessArea,
        createLetterBank,
        guessArea,
        showModal,
        showMessage,
        toggleWordListSetting
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
        displayController.toggleWordListSetting()
        data.resetData()
        
        // set game play flag

        activeGame = true
    }
    

    function reviewStatus(guess) {
        // Checks the game for win conditions. if present 
        if (guess.join('') === data.secretWord) {
            displayController.showMessage('YOU WIN!')
            activeGame = false
        } else if (data.attempts > 4) {
            displayController.showMessage(data.secretWord.toUpperCase(), false)
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

// idea: refactor 'show modal' to work based on the event trigger (i.e. of 'show word btn') rather than message data type

// todo: credit icon providers (see link at bottom of index)

// todo: credit wordlist provider

// thought: could misplaced be an string rather than an array?

// idea: give messages a fade effect

// stopped at: // bugs in logic of wordlist and data structures for letters
    


