import pytz
import json
import math
import logging
import gspread

from telegram import __version__ as TG_VER

try:
    from telegram import __version_info__
except ImportError:
    __version_info__ = (0, 0, 0, 0, 0)  # type: ignore[assignment]

if __version_info__ < (20, 0, 0, "alpha", 1):
    raise RuntimeError(
        f"This example is not compatible with your current PTB version {TG_VER}. To view the "
        f"{TG_VER} version of this example, "
        f"visit https://docs.python-telegram-bot.org/en/v{TG_VER}/examples.html"
    )
from telegram import KeyboardButton, ReplyKeyboardMarkup, Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters, CallbackQueryHandler

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
# set higher logging level for httpx to avoid all GET and POST requests being logged
logging.getLogger("httpx").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

# open google spreadsheet
gc = gspread.service_account(filename='quickmaths-403521-d3c85ab8b3a4.json')
sh = gc.open("quickmaths")

# load specific worksheets
classic_absolute_table:list[list] = sh.worksheet('classic, absolute')
classic_relative_table:list[list] = sh.worksheet('classic, relative')

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Defines a `/start` command handler.
    Displays a menu of buttons that start their associated tasks.
    """

    # button layout to be displayed instead of the default keyboard
    keyboard = [
        [InlineKeyboardButton(
            text="play",
            callback_data="play",

        )],
        [InlineKeyboardButton(
            text="leaderboard",
            callback_data="leaderboard",
        )]
    ]

    reply_markup = InlineKeyboardMarkup(keyboard)

    # send a message to the user to explain how the bot works
    await update.message.reply_text("Choose an action:", reply_markup=reply_markup)


async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Handles all incoming messages from the user.

    Calls functions to perform relevant actions when the user asks for them.
    """

    processed_text = update.message.text.lower()

    if "menu" in processed_text:
        await start(update, context)
    elif "leaderboard" in processed_text:
        await leaderboard_type_menu(update, context)
    elif "play" in processed_text:
        await game_mode_menu(update, context)
    elif "absolute" in processed_text:
        await leaderboard_mode_menu("absolute", update, context)
    elif "relative" in processed_text:
        await leaderboard_mode_menu("relative", update, context)
    else:
        await update.message.reply_html(text=f"Command not understood.")


async def leaderboard_type_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:                                              # temp !!!
    query = update.callback_query

    keyboard = [
        [InlineKeyboardButton(
            text="absolute",
            callback_data="absolute",
        )],
        [InlineKeyboardButton(
            text="relative",
            callback_data="relative",
        )]
    ]

    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.edit_message_text("Choose a leaderboard type:", reply_markup=reply_markup)
    

async def leaderboard_mode_menu(type:str, update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:                                    # temp !!!
    query = update.callback_query
    
    keyboard = [
        [InlineKeyboardButton(
            text="Classic",
            callback_data="Classic, " + type,
        )],
    ]

    reply_markup = InlineKeyboardMarkup(keyboard)
    await query.edit_message_text("Choose a game mode:", reply_markup=reply_markup)


async def game_mode_menu(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    
    keyboard = [
        [KeyboardButton(
            text="Classic",
            web_app=WebAppInfo(
                url="https://quickmaths.w3spaces.com/classic/")
        )],
    ]

    reply_markup = ReplyKeyboardMarkup(
        keyboard, 
        resize_keyboard=True,
        one_time_keyboard=False,
        is_persistent=False
    )

    # send a message to the user to explain how the bot works
    await query.message.reply_text("Choose a game mode:", reply_markup=reply_markup)


async def menu_select(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Parses the CallbackQuery from sending the `/start` command,
    
    Updates the message text to show selected option.
    Run the function corresponding to the selection.
    """
    query = update.callback_query

    # CallbackQueries need to be answered, even if no notification to the user is needed
    # Some clients may have trouble otherwise. See https://core.telegram.org/bots/api#callbackquery
    await query.answer("")
    
    # Menü-Knöpfe entfernen und mit der Information darüber, welche Option ausgewählt wurde, ersetzen
    # await query.edit_message_text(text=f"'{query.data}' ausgewählt.")

    if query.data == "leaderboard":
        await leaderboard_type_menu(update, context)

    elif query.data == "play":
        await game_mode_menu(update, context)
    
    elif query.data == 'absolute':
        await leaderboard_mode_menu("absolute", update, context)

    elif query.data == 'relative':
        await leaderboard_mode_menu("relative", update, context)

    elif "absolute" in query.data:
        if "Classic" in query.data:
            await show_absolute_leaderboard("Classic", update, context)

    elif "relative" in query.data:
        if "Classic" in query.data:
            await show_relative_leaderboard("Classic", update, context)


async def show_absolute_leaderboard(game_mode:str, update, context):
    query = update.callback_query
    
    if game_mode == "Classic":
        top_ten:list[list] = classic_absolute_table.get_values('A2:D11')
        text = ""
        for row in range(1):                                                                                                                # changed for testing only !
            text += f"<b>{row + 1}. Place:</b>\n"
            text += f"{top_ten[row][0]}: {round(float(top_ten[row][1]), 3)} points\n"
            text += f"{top_ten[row][2]} seconds, {int(top_ten[row][3]) - 20} errors"
            if row != 10:
                text += f"\n"
                
        await query.edit_message_text(text=text, parse_mode="HTML")


async def show_relative_leaderboard(game_mode, update, context):                                                                            # temp !!
    query = update.callback_query
    
    await query.edit_message_text(text=f"This function has not been implemented yet.")


async def web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:                                                         # temp !! update message
    """
    Prints and saves the data received from the web app.
    """

    # Name bez. Telegram-Username des Senders
    # print(f'{update.effective_user.first_name}')
    # print(f'{update.effective_user.username}')

    # Daten laden, die die WebApp gesendet hat
    data:dict = json.loads(update.effective_message.web_app_data.data)
    # print(f'data: {data}')
    # print(f'len(data): {len(data)}')
    # print(f"data[0]['questionsNeeded']: {data[0]['questionsNeeded']}")
    # print(f'data[1]: {data[1]}')
    # print(f"data[1]['seconds']: {data[1]['seconds']}")

    username = update.effective_user.username if (update.effective_user.username) else update.effective_user.first_name

    scores = []
    highest_score = 0
    highest_score_index = 0
    for i in range(1,len(data)):
        score = ((100*math.exp(-(data[i]['seconds']-30)/90))*(1-math.sqrt(1-(data[0]['questionsNeeded']/data[i]['questions']))))
        scores.append(score)
        
        if score > highest_score:
            highest_score = round(score, 2)
            highest_score_index = i

        table_entry = [username, score, data[i]['seconds'], data[i]['questions']]
        classic_absolute_table.append_row(table_entry)
        classic_absolute_table.sort((2, 'des'))

        user_cell = classic_relative_table.find(username, in_column=1)
        if user_cell:
            user_data = classic_relative_table.row_values(user_cell.row)
            avg_old = user_data[1]
            number_games_old = user_data[2]

            avg_new = ((avg_old * number_games_old) + score) / (number_games_old + 1)
            classic_relative_table.update_cell(user_cell.row, 2, avg_new)
            classic_relative_table.update_cell(user_cell.row, 3, (number_games_old + 1))
            classic_relative_table.sort((2, 'des'))
        else:
            classic_relative_table.append_row([username, score, 1])

    # Daten an den Benutzer des Bots senden
    text:str = f"Congratulations, "
    text = (text + f"{username}.\n")
    text += f"Out of the {len(data) - 1} games you just played, your best result were {highest_score} points for correctly answering "
    text += f"{data[0]['questionsNeeded']}/{data[highest_score_index]['questions']} in only {data[highest_score_index]['seconds']} seconds!\n"
    
    await update.message.reply_html(
        text=text,
    )


def main() -> None:
    """
    Starts the bot and adds handlers to it.
    """

    application = Application.builder().token(
        "REPLACE_WITH_BOT_TOKEN!!!").build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("leaderboard", leaderboard_type_menu))
    application.add_handler(CommandHandler("play", game_mode_menu))
    
    application.add_handler(CallbackQueryHandler(menu_select))
    application.add_handler(MessageHandler(
        filters.StatusUpdate.WEB_APP_DATA, web_app_data))
    application.add_handler(MessageHandler(filters.TEXT, handle_message))

    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()