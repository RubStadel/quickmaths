"use strict";

/// variable definitions

Telegram.WebApp.ready();
Telegram.WebApp.expand();
Telegram.WebApp.MainButton.setText('finish').onClick(function () {
    data = JSON.stringify(data);
    Telegram.WebApp.sendData(data);
});

let operators = [
    ['+', '+'],
    ['-', '-'],
    ['*', '\u22C5'],
    ['**', '\u00B2'],
    ['%', '%'],
    ['/', '\u00F7']
];

let results = [
    {correctAnswers: 0, questionsNeeded: 20}
];

let data = [
    {questionsNeeded: results[0].questionsNeeded, gameMode: 'advanced'}
];

let timer;
let timerSkipSeconds = 0;

/// functions concerning the answer to the maths question

function addChar(char) {
    let answer = document.getElementById("answerField");
    answer.innerHTML = answer.innerHTML.concat(char);
}

function removeChar() {
    let answer = document.getElementById("answerField");
    answer.innerHTML = answer.innerHTML.slice(0, -1);
}

function clearAnswer() {
    document.getElementById("answerField").innerHTML = "";
}

/// function for generating new maths questions

function generateNewQuestion() {
    let operand1 = Math.floor((Math.random() * 21));
    let operand2 = Math.floor((Math.random() * 21));
    let random;

    if((operand1 % operand2 == 0) && (operand1 != 0)) {
        random = Math.floor((Math.random() * 6));
    } else if((operand1 >= operand2) && (operand1 != 0)){
        random = Math.floor((Math.random() * 5));
    } else {
        random = Math.floor((Math.random() * 4));
    }
    if(random == 3) {
        operand2 = "";
    }

    document.getElementById("questionOperand1").innerHTML = `${operand1} `;
    document.getElementById("questionOperator").innerHTML = `${operators[random][1]} `;
    document.getElementById("questionOperand2").innerHTML = `${operand2} =`;
}

/// function to check answer

function checkAnswer() {
    let answer = document.getElementById("answerField");
    let operand1 = document.getElementById("questionOperand1");
    let operator = document.getElementById("questionOperator");
    let operand2 = document.getElementById("questionOperand2");
    let operand2_number = operand2.innerHTML.slice(0, -1);
    let tmpOperator;

    let tmp = operator.innerHTML.slice(0, 1);
    if(escape(tmp) == '%u22C5') {
        tmpOperator = '*';
    } else if(escape(tmp) == '%F7') {
        tmpOperator = '/';
    } else if(escape(tmp) == '%B2') {
        tmpOperator = '**';
        operand2_number = 2;
    } else {
        tmpOperator = tmp;
    }
    tmpOperator = tmpOperator + " ";

    let currentQuestion = operand1.innerHTML + tmpOperator + operand2_number;
    let currentAnswer = eval(currentQuestion);

    if(currentAnswer > 100) {
        if(currentQuestion.length == 8 || tmpOperator == "**") {
            timerSkipSeconds += 4;
        }
        timerSkipSeconds += 2;
    }

    currentQuestion = operand1.innerHTML + tmp.concat(" ") + operand2.innerHTML.slice(0, -1);
    let answerIsCorrect = (answer.innerHTML == currentAnswer && answer.innerHTML != "");

    if(answerIsCorrect) {
        results[0].correctAnswers++;
        document.getElementById("questionCount").innerHTML = `${results[0].correctAnswers}/${results[0].questionsNeeded}`;
        if(results[0].correctAnswers == results[0].questionsNeeded) {
            stopGame();
        }
    }

    results.push({question: currentQuestion, actualAnswer: currentAnswer, givenAnswer: answer.innerHTML, answeredCorrectly: answerIsCorrect});
    clearAnswer();
    generateNewQuestion();

    if(!results[0].questionsNeeded) {
        document.getElementById("questionCount").innerHTML = `${results[0].correctAnswers} (${results.length - 1 - results[0].correctAnswers})`;
    }
}

/// functions concerning the game's (pseudo) timer

function updateTimer() {
    let secondsTimer = document.getElementById("secondsTimer");
    let minutesTimer = document.getElementById("minutesTimer");
    
    secondsTimer.style.color = "black";
    minutesTimer.style.color = "black";

    if(timerSkipSeconds) {
        timerSkipSeconds--;
        secondsTimer.style.color = "gold";
        minutesTimer.style.color = "gold";
        return
    }

    if(secondsTimer.innerHTML == '59') {
        secondsTimer.innerHTML = '00';
        minutesTimer.innerHTML = `${+minutesTimer.innerHTML + 1}`.padStart(2, "0");
    } else {
        secondsTimer.innerHTML = `${+secondsTimer.innerHTML + 1}`.padStart(2, "0");
    }
}

function startTimer() {
    let secondsTimer = document.getElementById("secondsTimer");
    let minutesTimer = document.getElementById("minutesTimer");
    minutesTimer.innerHTML = "00";
    secondsTimer.innerHTML = "00";
    clearAnswer();
    generateNewQuestion();

    timer = setInterval(updateTimer, 1000);
}

/// functions to explain how to play the game

function showHowToPlay() {
    let btn = document.getElementById("howToPlayButton");
    let textField = document.getElementById("landingTextField");
    textField.innerHTML = 
    "Correctly answer twenty maths questions.<br>\
    The questions are randomized and include numbers up to 20.<br>\
    The score is based on your time and the amount of questions answered incorrectly.\
    High scores of close to 100 can only be achieved without making mistakes, so don't skip hard questions!";
    btn.onclick = hideHowToPlay;

    document.getElementById("practiceButton").style.display = "none";
    document.getElementById("startButton").style.marginTop = "9.2vh";
}

function hideHowToPlay() {
    let btn = document.getElementById("howToPlayButton");
    let textField = document.getElementById("landingTextField");
    textField.innerHTML = 
    "Inspired by the mental arithmetics game originally created by \
    <a id='linkAIP' href='https://www.youtube.com/@answerinprogress' target='_blank' rel='noopener noreferrer' title='AIP on YouTube'>\
        <em>Answer in Progress</em></a> \
    in their video about math anxiety. \
    <a id='linkAIPVideo' href='https://youtu.be/xvOkXXprG2g?si=WWNTwtRDeu39E_JY' target='_blank' rel='noopener noreferrer' title='why do people hate math' style='color: #f20d0d'>\
        <ion-icon name='logo-youtube'></ion-icon></a>";
    btn.onclick = showHowToPlay;

    document.getElementById("practiceButton").style.display = "initial";
    document.getElementById("startButton").style.marginTop = "5.5vh";
}

/// functions to (re)start the game

function startGame() {
    document.getElementById("landingNav").style.height = "0%";
    document.getElementById("questionCount").innerHTML = `0/${results[0].questionsNeeded}`;

    startTimer();
}

function restartGame() {
    results = [
        {correctAnswers: 0, questionsNeeded: results[0].questionsNeeded},
    ];

    document.getElementById("scoreNav").style.height = "0%";
    document.getElementById("questionCount").innerHTML = `0/${results[0].questionsNeeded}`;
    
    if(!results[0].questionsNeeded) {
        document.getElementById("questionCount").innerHTML = `0 (0)`;
    }

    startTimer();
    Telegram.WebApp.MainButton.hide();
}

/// function to stop the game

function stopGame() {
    clearInterval(timer);

    let textField = document.getElementById("scoreTextField");
    let secondsTimer = document.getElementById("secondsTimer");
    let minutesTimer = document.getElementById("minutesTimer");

    data.push({seconds: (+minutesTimer.innerHTML * 60 + +secondsTimer.innerHTML), questions: (results.length)});

    textField.innerHTML = `score: ${minutesTimer.innerHTML}:${secondsTimer.innerHTML}<br><br>questions: ${results[0].questionsNeeded}/${(results.length)}`;
    document.getElementById("scoreNav").style.height = "100%";

    Telegram.WebApp.MainButton.show();
}

/// functions to show and hide the results of all questions with answers

function showResults() {
    let resultsNav = document.getElementById("resultsNav");
    let textField = document.getElementById("resultsTextField");
    let closebtn = document.getElementById("resultsCloseButton");

    resultsNav.style.height = "100%";
    closebtn.style.display = "block";
    
    let questionResult;
    for(let i = 1; i < results.length; i++) {
        if (results[i].answeredCorrectly == false) {
            questionResult = 
            `<span style='color: darkred;'><big><b>Question ${i}</b></big><br>\
            ${results[i].question} &ne; ${results[i].givenAnswer}<br>\
            correct answer: ${results[i].actualAnswer}</span><br>`;
        } else {
            questionResult = 
            `<span><big><b>Question ${i}</b></big><br>\
            ${results[i].question} &#x003D; ${results[i].givenAnswer}</span><br>`;
        }
        textField.innerHTML = textField.innerHTML.concat(questionResult);
    }
}

function hideResults() {
    let resultsNav = document.getElementById("resultsNav");
    resultsNav.style.height = "0%";
    let textField = document.getElementById("resultsTextField");
    textField.innerHTML = "";
    let closebtn = document.getElementById("resultsCloseButton");
    closebtn.style.display = "none";
}

// functions handling the (endless) practice mode

function startPracticeGame() {
    document.getElementById("secondsTimer").style.display = "none";
    document.getElementById("minutesTimer").style.display = "none";
    document.getElementById("stopPracticeButton").style.display = "block";
    document.getElementById("topRow").style.color = "white";
    document.getElementById("questionCount").innerHTML = "0 (0)"
    document.getElementById("questionCount").style.fontSize = "4vh";

    document.getElementById("landingNav").style.height = "0%";
    results[0].questionsNeeded = 0;
    startTimer();
}

function stopPracticeGame() {
    clearInterval(timer);

    let textField = document.getElementById("scoreTextField");
    let secondsTimer = document.getElementById("secondsTimer");
    let minutesTimer = document.getElementById("minutesTimer");

    // data.push({seconds: (+minutesTimer.innerHTML * 60 + +secondsTimer.innerHTML), questions: (results.length)});

    textField.innerHTML = `time: ${minutesTimer.innerHTML}:${secondsTimer.innerHTML}<br><br>questions: ${results[0].correctAnswers}/${(results.length)}`;
    document.getElementById("scoreNav").style.height = "100%";

    Telegram.WebApp.MainButton.onClick(() => {Telegram.WebApp.close();}).show();
}
