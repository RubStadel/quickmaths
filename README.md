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
* [ ] create scoreOverlay
* [ ] create resultsOverlay
* [ ] create resultsOverlay

### Server

* [ ] set up bot in Telegram
* [ ] design menu button layout
* [ ] set up google spreadsheet
* [ ] enable saving of data to spreadsheet
* [ ] write logic to find and display leaderboards (global or personal)
