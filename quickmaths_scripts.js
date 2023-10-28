"use strict";

/// variable definitions

Telegram.WebApp.ready();
Telegram.WebApp.expand();
Telegram.WebApp.MainButton.setText('finish').onClick(sendResults);

let operators = [
    ['+', '+'],
    ['-', '-'],
    ['*', '\u22C5'],
    ['/', '\u00F7']
];

let results = [
    {correctAnswers: 0, questionsNeeded: 20},
];

let timer;

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
        random = Math.floor((Math.random() * 4));
    } else {
        random = Math.floor((Math.random() * 3));
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
    let tmpOperator;

    let tmp = operator.innerHTML.slice(0, 1);
    if(escape(tmp) == '%u22C5') {
        tmpOperator = '*';
    } else if(escape(tmp) == '%F7') {
        tmpOperator = '/';
    } else {
        tmpOperator = tmp;
    }
    tmpOperator = tmpOperator + " ";

    let currentQuestion = operand1.innerHTML + tmpOperator + operand2.innerHTML.slice(0, -1);
    let currentAnswer = eval(currentQuestion);
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
}

/// functions concerning the game's (pseudo) timer

function updateTimer() {
    let secondsTimer = document.getElementById("secondsTimer");
    let minutesTimer = document.getElementById("minutesTimer");
    
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

    timer = setInterval(updateTimer, 1000);
}

/// functions to explain how to play the game

function showHowToPlay() {
    let btn = document.getElementById("howToPlayButton");
    let textField = document.getElementById("landingTextField");
    textField.innerHTML = 
    "Correctly answer twenty maths questions.<br>\
    The questions are randomized and include numbers up to 20.<br>\
    The top of the page shows a timer and a counter of correct answers.";
    btn.onclick = hideHowToPlay;
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
}

/// function to start the game

function startGame() {
    document.getElementById("landingNav").style.height = "0%";

    document.getElementById("questionCount").innerHTML = `0/${results[0].questionsNeeded}`;

    startTimer();
}

/// function to stop the game

function stopGame() {
    clearInterval(timer);

    let textField = document.getElementById("scoreTextField");
    let secondsTimer = document.getElementById("secondsTimer");
    let minutesTimer = document.getElementById("minutesTimer");

    textField.innerHTML = `score: ${minutesTimer.innerHTML}:${secondsTimer.innerHTML}<br><br>questions: ${results[0].questionsNeeded}/${(results.length)}`;
    document.getElementById("scoreNav").style.height = "100%";

    Telegram.WebApp.MainButton.show();
}

function sendResults() {
    let secondsTimer = document.getElementById("secondsTimer");
    let minutesTimer = document.getElementById("minutesTimer");

    const data = JSON.stringify({
        minutes: +minutesTimer.innerHTML, seconds: +secondsTimer.innerHTML, questions: (results.length - 1), questionsNeeded: results[0].questionsNeeded
    });

    Telegram.WebApp.sendData(data);
}

/// functions to show and hide the results of all questions with answers

function showResults() {
    let resultsNav = document.getElementById("resultsNav");
    let textField = document.getElementById("resultsTextField");
    let closebtn = document.getElementById("resultsCloseButton");

    resultsNav.style.height = "100%";
    closebtn.style.display = "block";
    
    let questionResult;
    console.log(results);
    console.log(results.length);
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
