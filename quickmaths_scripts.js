"use strict";

Telegram.WebApp.ready();

/// variable definitions

let operators = [
    ['+', '+'],
    ['-', '-'],
    ['*', '\u22C5'],
    ['/', '\u00F7']
];

let totalQuestions = 1;
let correctAnswers = 0;
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
    let answer = document.getElementById("answerField");
    answer.innerHTML = "";
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
    let operator = operators[random][1];

    document.getElementById("questionOperand1").innerHTML = `${operand1} `;
    document.getElementById("questionOperator").innerHTML = `${operator} `;
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
    } else if(escape(tmp) == '\u00F7') {
        tmpOperator = '/';
    } else {
        tmpOperator = tmp;
    }

    let currentQuestion = operand1.innerHTML + tmpOperator + operand2.innerHTML.slice(0, -1);

    if(answer.innerHTML == eval(currentQuestion) && answer.innerHTML != "") {
        correctAnswers++;
        if(correctAnswers == 20) {
            stopGame();
        }
    }
    clearAnswer();
    totalQuestions++;
    document.getElementById("questionCount").innerHTML = `${correctAnswers}/20`;
    generateNewQuestion();
}

/// functions concerning the game's (pseudo) timer

function updateTimer() {
    let secondsTimer = document.getElementById("secondsTimer");
    let minutesTimer = document.getElementById("minutesTimer");
    
    if(secondsTimer.innerHTML == '59') {
        secondsTimer.innerHTML = '00';
        minutesTimer.innerHTML = +minutesTimer.innerHTML + 1;
        minutesTimer.innerHTML.padStart(2,"0");
    } else {
        secondsTimer.innerHTML = +secondsTimer.innerHTML + 1;
        secondsTimer.innerHTML.padStart(2,"0");
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
    textField.innerHTML = "Correctly answer twenty maths questions.<br>The questions are randomized and include numbers up to 20.<br>The top of the page shows a timer and a counter of correct answers.";
    btn.onclick = hideHowToPlay;
}

function hideHowToPlay() {
    let btn = document.getElementById("howToPlayButton");
    let textField = document.getElementById("landingTextField");
    textField.innerHTML = "Inspired by the mental arithmetics game originally created by <a id='linkAIP' href='https://www.youtube.com/@answerinprogress' target='_blank' rel='noopener noreferrer' title='AIP on YouTube'>    <em>Answer in Progress</em></a> in their video about math anxiety. <a id='linkAIPVideo' href='https://youtu.be/xvOkXXprG2g?si=WWNTwtRDeu39E_JY' target='_blank' rel='noopener noreferrer' title='why do people hate math'>    <ion-icon name='logo-youtube'></ion-icon></a>";
    btn.onclick = showHowToPlay;
}

/// function to start the game

function startGame() {
    let landingNav = document.getElementById("landingNav");
    landingNav.style.height = "0%";

    startTimer();
}

/// function to stop the game                                                                      unfinished !!

function stopGame() {
    clearInterval(timer);

    let secondsTimer = document.getElementById("secondsTimer");
    let minutesTimer = document.getElementById("minutesTimer");
    let username = Telegram.WebAppUser.firstName;

    let finalTime = (+minutesTimer.innerHTML * 60) + +secondsTimer.innerHTML;
    if(Telegram.WebAppUser.username) {
        username = Telegram.WebAppUser.username;
    }

    const data = JSON.stringify({
        user: username, time: finalTime, questions: totalQuestions
    })

    Telegram.WebApp.MainButton.setText('Finish').show().onClick(function () {
        Telegram.WebApp.sendData(data);
        Telegram.WebApp.close();
    });

    // open score overlay
    // show totalQuestions (summary)
}

// add results overlay (displays all questions, answers given and correct answers; colorcoded, scrollable(?), Telegram.MainButton is visible)