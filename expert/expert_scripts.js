"use strict";

/// variable definitions

Telegram.WebApp.ready();
Telegram.WebApp.expand();
Telegram.WebApp.MainButton.setText('finish').onClick(function () {
    data = JSON.stringify(data);
    Telegram.WebApp.sendData(data);
});

let operators = [
    ['**', '<sup>'],
    ['%', '%'],
    ['**', '<sup>']
];

let results = [
    {correctAnswers: 0, questionsNeeded: 20}
];

let data = [
    {questionsNeeded: results[0].questionsNeeded, gameMode: 'expert'}
];

let timer;
let timerSkipSeconds = {
    total: 0,
    current: 0
};
let timeDelta = 0;

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
    let operand1 = Math.floor((Math.random() * 17));
    let operand2 = Math.floor((Math.random() * 17));
    let random = Math.floor((Math.random() * 3));

    switch(random) {
        case 0:
            operand1 = 2;
            operand2 += "</sup>";
            break;
        case 1:
            operand1 *= Math.floor((Math.random() * 6) + 11);
            operand1 += " ";
            if(operand2 == 0) {
                operand2 += Math.floor((Math.random() * 16) + 1);
            }
            break;
        case 2:
            operand1 += operand2;
            operand2 = "2</sup>";
            break;
    }

    document.getElementById("questionOperand1").innerHTML = `${operand1}`;
    document.getElementById("questionOperator+").innerHTML = `${operators[random][1]} ${operand2} =`;
}

/// function to check answer

function checkAnswer() {
    let answer = document.getElementById("answerField");
    let operand1 = document.getElementById("questionOperand1");
    let operator = document.getElementById("questionOperator+");
    let tmpOperator, operand2_number;

    let tmp = operator.innerHTML;
    if(tmp.slice(0, 5) == '<sup>') {
        tmpOperator = '**';
        operand2_number = tmp.slice(6, -8);
    } else {
        tmpOperator = tmp.slice(0, 1);
        operand2_number = tmp.slice(2, -2);
    }

    let currentQuestion = operand1.innerHTML + tmpOperator + operand2_number;
    let currentAnswer = eval(currentQuestion);

    currentQuestion = operand1.innerHTML + tmp.slice(0, -1);
    let answerIsCorrect = (answer.innerHTML == currentAnswer && answer.innerHTML != "");

    if(answerIsCorrect) {
        results[0].correctAnswers++;
        document.getElementById("questionCount").innerHTML = `${results[0].correctAnswers}/${results[0].questionsNeeded}`;
        if(results[0].correctAnswers == results[0].questionsNeeded) {
            stopGame();
        }

        let questionIsHard = (tmpOperator == "**" && (operand1.innerHTML > 15 || operand2_number > 10));
        
        if(questionIsHard) {
            timerSkipSeconds.total += 8;
        }
    }

    let secondsTimer = document.getElementById("secondsTimer");
    let minutesTimer = document.getElementById("minutesTimer");
    let currentTime = +minutesTimer.innerHTML * 60 + +secondsTimer.innerHTML + timerSkipSeconds.current - timeDelta;
    timeDelta = +minutesTimer.innerHTML * 60 + +secondsTimer.innerHTML + timerSkipSeconds.current;

    results.push({question: currentQuestion, actualAnswer: currentAnswer, givenAnswer: answer.innerHTML, answeredCorrectly: answerIsCorrect, time: currentTime});
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

    if(timerSkipSeconds.total - timerSkipSeconds.current) {
        timerSkipSeconds.current++;
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
    timerSkipSeconds = {total: 0, current: 0};
    timeDelta = 0;

    let textField = document.getElementById("scoreTextField");
    let secondsTimer = document.getElementById("secondsTimer");
    let minutesTimer = document.getElementById("minutesTimer");

    secondsTimer.style.color = "black";
    minutesTimer.style.color = "black";

    let finalTime = (+minutesTimer.innerHTML * 60 + +secondsTimer.innerHTML - (timerSkipSeconds.total - timerSkipSeconds.current));
    data.push({seconds: finalTime, questions: (results.length)});

    textField.innerHTML = `time: ${String(parseInt(finalTime / 60)).padStart(2, "0")}:${finalTime % 60}<br><br>questions: ${results[0].questionsNeeded}/${(results.length)}`;
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
            correct answer: ${results[i].actualAnswer}<br>\
            <small>${results[i].time} second(s)</small></span><br>`;
        } else {
            questionResult = 
            `<span><big><b>Question ${i}</b></big><br>\
            ${results[i].question} &#x003D; ${results[i].givenAnswer}<br>\
            <small>${results[i].time} second(s)</small></span><br>`;
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
    timerSkipSeconds = {total: 0, current: 0};
    timeDelta = 0;

    let textField = document.getElementById("scoreTextField");
    let secondsTimer = document.getElementById("secondsTimer");
    let minutesTimer = document.getElementById("minutesTimer");

    secondsTimer.style.color = "black";
    minutesTimer.style.color = "black";

    textField.innerHTML = `time: ${minutesTimer.innerHTML}:${secondsTimer.innerHTML}<br><br>questions: ${results[0].correctAnswers}/${(results.length - 1)}`;
    document.getElementById("scoreNav").style.height = "100%";

    Telegram.WebApp.MainButton.onClick(() => {Telegram.WebApp.close();}).show();
}
