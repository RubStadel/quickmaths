"use strict";

/// variable definitions

Telegram.WebApp.ready();
Telegram.WebApp.expand();
Telegram.WebApp.MainButton.setText('finish').onClick(function () {
    data = JSON.stringify(data);
    Telegram.WebApp.sendData(data);
});

// [questionNotation, questionBase, answerNotation, answerBase]
let notations = [
    ['dec', 10, 'bin', 2],
    ['dec', 10, 'hex', 16],
    ['bin', 2, 'dec', 10],
    ['bin', 2, 'hex', 16],
    ['hex', 16, 'dec', 10],
    ['hex', 16, 'bin', 2]
];
let random;

let results = [
    { correctAnswers: 0, questionsNeeded: 10 }
];

let data = [
    { questionsNeeded: results[0].questionsNeeded, gameMode: 'binary' }
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
    answer.textContent = answer.textContent.concat(char);
}

function removeChar() {
    let answer = document.getElementById("answerField");
    answer.textContent = answer.textContent.slice(0, -1);
}

function clearAnswer() {
    document.getElementById("answerField").textContent = "";
}

/// function for generating new maths questions

function generateNewQuestion() {
    random = Math.floor(Math.random() * 6);
    let operand, questionNotation, answerNotation;

    questionNotation = `<sub>${notations[random][0]}</sub>`;
    answerNotation = `<sub>${notations[random][2]}</sub>`;

    switch (random) {
        case 0:
        case 1:
            operand = Math.floor(Math.random() * 256);
            break;
        case 2:
        case 3:
            operand = (Math.floor(Math.random() * 256)).toString(2);
            operand = formatNonDecimal(operand);
            if (operand.length < 4) {
                operand = operand.padStart(4, "0");
            }
            break;
        case 4:
        case 5:
            operand = (Math.floor(Math.random() * 256)).toString(16);
            operand = formatNonDecimal(operand);
            break;
    }

    document.getElementById("questionOperand").textContent = operand;
    document.getElementById("questionNotation").innerHTML = questionNotation + " =";
    document.getElementById("answerNotation").innerHTML = answerNotation;
}

/// function to format numbers of bases other than decimal to look nicer

function formatNonDecimal(number) {
    // capitalize hexadecimal letter digits
    if (isNaN(Number(number))) {
        number = number.toUpperCase();
    }
    // split up binary numbers into chunks of four digits (if neccessary)
    if (number.length > 4) {
        number = number.padStart(8, "0");
        number = number.slice(0, 4) + " " + number.slice(4);
    }

    return number;
}

/// function to check answer

function checkAnswer() {
    let answer = document.getElementById("answerField");
    let operand = document.getElementById("questionOperand");

    let currentQuestion = operand.textContent + "<sub>" + notations[random][0] + "</sub>";
    let currentAnswer = parseInt(operand.textContent.replace(" ", ""), notations[random][1]);                   // currentAnswer is decimal

    let givenAnswer = parseInt(answer.textContent, notations[random][3]);                                         // givenAnswer is decimal

    let answerIsCorrect = (givenAnswer == currentAnswer);

    let secondsTimer = document.getElementById("secondsTimer");
    let minutesTimer = document.getElementById("minutesTimer");
    let currentTime = +minutesTimer.textContent * 60 + +secondsTimer.textContent + timerSkipSeconds.current - timeDelta;
    timeDelta = +minutesTimer.textContent * 60 + +secondsTimer.textContent + timerSkipSeconds.current;

    if (answerIsCorrect) {
        results[0].correctAnswers++;
        document.getElementById("questionCount").textContent = `${results[0].correctAnswers}/${results[0].questionsNeeded}`;

        let questionIsHard = ((currentAnswer > 16 && random == (1 || 4)) || (currentAnswer > 50 && random == 0) && !Number.isInteger(Math.log2(currentAnswer)));
        if (questionIsHard) {
            timerSkipSeconds.total += Math.round(currentTime * 0.75);
        }
    }

    results.push({ question: currentQuestion, actualAnswer: currentAnswer, givenAnswer: answer.textContent, notationCombi: random, answeredCorrectly: answerIsCorrect, time: currentTime });
    clearAnswer();
    generateNewQuestion();

    if (!results[0].questionsNeeded) {
        document.getElementById("questionCount").textContent = `${results[0].correctAnswers} (${results.length - 1 - results[0].correctAnswers})`;
    } else if (results[0].correctAnswers == results[0].questionsNeeded) {
        stopGame();
    }
}

/// functions concerning the game's (pseudo) timer

function updateTimer() {
    let secondsTimer = document.getElementById("secondsTimer");
    let minutesTimer = document.getElementById("minutesTimer");

    secondsTimer.style.color = "black";
    minutesTimer.style.color = "black";

    if (timerSkipSeconds.total - timerSkipSeconds.current) {
        timerSkipSeconds.current++;
        secondsTimer.style.color = "gold";
        minutesTimer.style.color = "gold";
        return
    }

    if (secondsTimer.textContent == '59') {
        secondsTimer.textContent = '00';
        minutesTimer.textContent = `${+minutesTimer.textContent + 1}`.padStart(2, "0");
    } else {
        secondsTimer.textContent = `${+secondsTimer.textContent + 1}`.padStart(2, "0");
    }
}

function startTimer() {
    let secondsTimer = document.getElementById("secondsTimer");
    let minutesTimer = document.getElementById("minutesTimer");
    minutesTimer.textContent = "00";
    secondsTimer.textContent = "00";
    clearAnswer();
    generateNewQuestion();

    timer = setInterval(updateTimer, 1000);
}

/// functions to explain how to play the game

function showHowToPlay() {
    let btn = document.getElementById("howToPlayButton");
    let textField = document.getElementById("landingTextField");
    textField.innerHTML =
        "Correctly answer ten conversion questions between binary, decimal and hexadecimal notation.<br>\
    The questions are randomized and only include unsigned numbers.<br>\
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
    document.getElementById("questionCount").textContent = `0/${results[0].questionsNeeded}`;

    startTimer();
}

function restartGame() {
    results = [
        { correctAnswers: 0, questionsNeeded: results[0].questionsNeeded },
    ];

    document.getElementById("scoreNav").style.height = "0%";
    document.getElementById("questionCount").textContent = `0/${results[0].questionsNeeded}`;

    if (!results[0].questionsNeeded) {
        document.getElementById("questionCount").textContent = `0 (0)`;
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

    secondsTimer.style.color = "black";
    minutesTimer.style.color = "black";

    let finalTime = (+minutesTimer.textContent * 60 + +secondsTimer.textContent - (timerSkipSeconds.total - timerSkipSeconds.current));
    data.push({ seconds: finalTime, questions: (results.length - 1) });

    timerSkipSeconds.total = 0;
    timerSkipSeconds.current = 0;
    timeDelta = 0;

    textField.textContent = `time: ${String(parseInt(finalTime / 60)).padStart(2, "0")}:${String(finalTime % 60).padStart(2, "0")}` + "\n\n" + `questions: ${results[0].questionsNeeded}/${(results.length - 1)}`;
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
    for (let i = 1; i < results.length; i++) {
        if (results[i].answeredCorrectly == false) {
            questionResult =
                `<span style='color: darkred;'><big><b>Question ${i}</b></big><br>\
            ${results[i].question} &ne; ${formatNonDecimal(results[i].givenAnswer)}<sub>${notations[results[i].notationCombi][2]}</sub><br>\
            correct answer: ${formatNonDecimal(results[i].actualAnswer.toString(notations[results[i].notationCombi][3]))}<sub>${notations[results[i].notationCombi][2]}</sub><br>\
            <small>${results[i].time} seconds</small></span><br>`;
        } else {
            questionResult =
                `<span><big><b>Question ${i}</b></big><br>\
            ${results[i].question} &#x003D; ${formatNonDecimal(results[i].givenAnswer)}<sub>${notations[results[i].notationCombi][2]}</sub><br>\
            <small>${results[i].time} seconds</small></span><br>`;
        }
        textField.innerHTML = textField.innerHTML.concat(questionResult);
    }
}

function hideResults() {
    let resultsNav = document.getElementById("resultsNav");
    resultsNav.style.height = "0%";
    let textField = document.getElementById("resultsTextField");
    textField.textContent = "";
    let closebtn = document.getElementById("resultsCloseButton");
    closebtn.style.display = "none";
}

// functions handling the (endless) practice mode

function startPracticeGame() {
    document.getElementById("secondsTimer").style.display = "none";
    document.getElementById("minutesTimer").style.display = "none";
    document.getElementById("stopPracticeButton").style.display = "block";
    document.getElementById("topRow").style.color = "white";
    document.getElementById("questionCount").textContent = "0 (0)"
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

    secondsTimer.style.color = "black";
    minutesTimer.style.color = "black";

    let finalTime = (+minutesTimer.textContent * 60 + +secondsTimer.textContent - (timerSkipSeconds.total - timerSkipSeconds.current));

    textField.textContent = `time: ${String(parseInt(finalTime / 60)).padStart(2, "0")}:${String(finalTime % 60).padStart(2, "0")}<br><br>questions: ${results[0].correctAnswers}/${(results.length - 1)}`;
    document.getElementById("scoreNav").style.height = "100%";

    timerSkipSeconds.total = 0;
    timerSkipSeconds.current = 0;
    timeDelta = 0;

    Telegram.WebApp.MainButton.onClick(() => { Telegram.WebApp.close() }).show();
}
