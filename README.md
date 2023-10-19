# quickmaths

A Telegram bot through which a numbers game (credits to [Answer In Progress](https://www.youtube.com/@answerinprogress "AIP on YouTube")) can be played in a WebApp.

---

## ToDo

### General

* [x] design concept and game structure
* [x] come up with new game modes:
  * higher numbers (e.g. up to 50)
  * other operators (e.g. modulo '%')
  * (completely) different keyboard:
    * higher ('>'), lower ('<') and equal ('=') [including questions with weird fractions, sqrt(), sin(), powers and similar stuff]
    * higher ('>'), lower ('<') and equal ('=') [one value in dBm and one in W]
    * '0' and '1' [binary logic]
    * '0' and '1' [binary maths]
    * comma (',', decimal separator) instead of '-' [questions with rational fractions as answers]

### WebApp

* [x] design main site
* [x] implement basic maths question generation
* [x] implement basic maths question solving
* [x] implement displaying of better operator symbols (Unicode characters)
* [ ] implement timer
* [ ] create startOverlay
* [ ] write short explanation of the game
* [ ] decide on a way to display the explanation of the game
* [ ] implement startGame function
* [ ] **test sending data without closing the WebApp**
* [ ] create scoreOverlay
* [ ] create resultsOverlay

### Server

* [x] set up bot in Telegram (name, token, description, abouttext)
* [ ] update bot settings in Telegram (BotFather)
* [ ] design menu button layout (also include game mode selection)
* [ ] set up google spreadsheet
* [ ] enable saving of data to spreadsheet
* [ ] write logic to find and display leaderboards (global or personal)
