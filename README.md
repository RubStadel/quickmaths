# quickmaths

A Telegram bot through which a numbers game (credits to [Answer In Progress](https://www.youtube.com/@answerinprogress "AIP on YouTube")) can be played in a WebApp.

---

## ToDo

### General

* [x] design concept and game structure
* [x] come up with new game modes:
  * higher numbers (e.g. up to 50)
  * more questions (e.g. 50) or endless questions
  * other operators (e.g. modulo '%')
  * power tables (e.g. numbers squared; two to the power of x)
  * years (e.g. 2023 - 67)
  * (completely) different keyboard:
    * higher ('>'), lower ('<') and equal ('=') [including questions with weird fractions, sqrt(), sin(), powers and similar stuff]
    * higher ('>'), lower ('<') and equal ('=') [one value in dBm and one in W]
    * '0' and '1' [binary logic]
    * '0' and '1' [converting decimal numbers to binary]
    * comma (',', decimal separator) instead of '-' [questions with rational fractions as answers]
    * time values (four digits, ':' in answer is either permanent or instead of '-') [starting time + time delta e.g. 14:23 + 00:46]

### WebApp

* [x] design main site
* [x] implement basic maths question generation
* [x] implement basic maths question solving
* [x] implement displaying of better operator symbols (Unicode characters)
* [x] implement timer
* [x] fix timer to show leading zeros
* [x] create startOverlay
* [x] write short explanation of the game
* [x] decide on a way to display the explanation of the game
* [x] implement startGame function
* [x] **test sending data without closing the WebApp -> impossible**
* [x] create scoreOverlay
* [x] create resultsOverlay
* ~~[ ] add smooth scrolling to resultsOverlay (smaller steps)~~
* [x] change symbols for resultsOverlay to include unicode characters instead of '*' and '/'
* [x] add 'play again' button to resultsOverlay
* [x] test sending data of multiple games at once

### Server

* [x] set up bot in Telegram (name, token, description, abouttext)
* [x] update bot settings in Telegram (BotFather)
* [ ] further update bot settings in Telegram (BotFather) (commands)
* [x] design menu button layout (also include game mode selection)
* [ ] visualize button menu tree
* [ ] set up google spreadsheet
* [x] choose how to calculate a total score (including time and number of errors)
* [x] implement score calculation
* [ ] enable saving of data to spreadsheet
* [ ] write logic to find and display leaderboards
* [ ] comment and annotate code
