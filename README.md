# quickmaths

A Telegram bot ([@quick_maths_bot](https://t.me/quick_maths_bot "Telegram")) through which a number of mental arithmetics games (inspired by [Answer In Progress'](https://www.youtube.com/@answerinprogress "AIP on YouTube") [quick maths game](https://www.youtube.com/watch?v=xvOkXXprG2g "why do people hate math")) can be played in a mobile-optimized WebApp.
Includes additional game modes and user scoreboards.  

The bot is currently running on my Raspberry Pi Zero.
It was first written in Python for the sake of simplicity but rewritten in Rust for better performance.

---

## Menu

When opening the Bot, the user is guided through a menu of in-line buttons to their desired action.  
Leaderboards are shown as lists in the chat and are separated into two groups.
Absolute leaderboards show the best performances across all players while relative ones show only those relating to the user (average points and placement in relation to other players).  
Selecting a game mode leads to the corresponding WebApp which can be opened through the keyboard buttons that appear.
Multiple games can be played in a session and all of the statistics will be saved when exiting the WebApp and returning to Telegram.

![Run-through of the button menu in the Telegram chat](./resources/menu.gif)

---

## ToDo

### General

* [x] design concept and game structure
* [x] come up with new game modes:
  * same keyboard/principle:
    * [x] mini: numbers up to 10
    * [ ] big_numbers: higher numbers (e.g. up to 50)
    * [ ] classic_long: more questions (e.g. 50)
    * [x] endless/practice runs without scores (no results saved)
    * [x] advanced: other operators (e.g. modulo '%', numbers squared)
    * [x] expert: two to the power of x(up to 16), modulo, numbers squared (no 'easy' questions) [two numbers up to 16, for option 2: add '0' to first number, for option 3: use sum(numbers)]
    * [ ] annual: years (e.g. 2023 - 67)
  * (completely) different keyboard:
    * [x] binary: '0..F' [converting numbers between binary, decimal and hexadecimal]
    * ~~[ ] '0' and '1' [binary logic]~~
    * [ ] higher ('>'), lower ('<') and equal ('=') [including questions with weird fractions, sqrt(), sin(), powers and similar stuff]
    * [ ] higher ('>'), lower ('<') and equal ('=') [one value in dBm and one in W]
    * [ ] comma (',', decimal separator) instead of '-' [questions with rational fractions as answers]
    * [ ] time values (four digits, ':' in answer is either permanent or instead of '-') [starting time + time delta e.g. 14:23 + 00:46]
  * [ ] countdown: timer counts down and time is added for correct answers (per mode, similar to endless mode)
* [ ] **update README.md to include setup instructions**

### WebApp

* [x] design main site
* [x] implement basic maths question generation
* [x] implement basic maths question solving
* [x] implement displaying of better operator symbols (Unicode characters)
* [x] implement timer
* [x] fix timer to show leading zeros
* [x] create startOverlay
* [x] write short explanation of the game
* [x] add short explanation of the scoring system ~~formula~~
* [x] decide on a way to display the explanation of the game
* [x] implement startGame function
* [x] test sending data without closing the WebApp
* [x] create scoreOverlay
* [x] create resultsOverlay
* ~~[ ] add smooth scrolling to resultsOverlay (smaller steps)~~
* [x] change symbols for resultsOverlay to include unicode characters instead of '*' and '/'
* [x] add 'play again' button to resultsOverlay
* [x] test sending data of multiple games at once
* [x] rename files to reflect the game mode they are associated with
* [x] add buffer zone around number buttons to avoid accidental misplaced touches
* [x] reward the player for correctly answering difficult questions by pausing the timer for a few seconds  
  -> (50% of time taken for hard questions; 75% for very hard questions)
* [x] add time taken for each question to the results overlay

### Server

* [x] set up bot in Telegram (name, token, description, abouttext)
* [x] update bot settings in Telegram (BotFather)
* [x] further update bot settings in Telegram (BotFather) (commands)
* [x] design menu button layout (also include game mode selection)
* [x] change button menu to be dynamic (based on contents of game_mode_stats; avoid manually updating menu)
* [ ] visualize button menu tree? (for GitHub repo)
* [x] add headers to leaderboards (so it stays visible which game mode was selected)
* [x] set up google spreadsheet
* [x] choose how to calculate a total score (including time and number of errors)
* [x] implement score calculation
* [x] set score calculation to change for each game mode
* [x] decide on how to structure the leaderboards (two for each game mode [absolute: score, time and number of errors?; relative: average score, games played])
* [x] enable saving of data to spreadsheet
* [x] write logic to find and display leaderboards
* [ ] add 'personal' leaderboard (best score & time and avgerage score for each game mode) (?)
* [ ] comment and annotate code
