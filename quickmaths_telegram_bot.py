#!/usr/bin/env python
# pylint: disable=unused-argument,wrong-import-position

import pytz
import json
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

# open google spreadsheet
# gc = gspread.service_account(filename='fsr-vii-getraenke-59c02f0093d2.json')
# sh = gc.open("FSR_VII_Getränke")

# load specific worksheet
# bestand_table:list[list] = sh.worksheet('bestand')


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Defines a `/start` command handler.
    Displays a menu of buttons that start their associated tasks.
    """

    # button layout to be displayed instead of the default keyboard
    keyboard = [
        [KeyboardButton(
            text="Play (Classic)",
            web_app=WebAppInfo(
                url="https://getraenke.w3spaces.com/quickmaths/"
            ),
        )],
        [KeyboardButton(
            text="global leaderboard"
        ),
        KeyboardButton(
            text="personal leaderboard"
        )],
    ]

    reply_markup = ReplyKeyboardMarkup(
        keyboard, 
        resize_keyboard=True,
        one_time_keyboard=False,
        is_persistent=False
    )

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
    elif "global" and "leaderboard" in processed_text:
        await show_global_leaderboard(update, context)
    elif "personal" and "leaderboard" in processed_text:
        await show_personal_leaderboard(update, context)
    else:
        await update.message.reply_html(text=f"Befehl wurde nicht verstanden.")


async def show_global_leaderboard(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:                                              # temp !!!
    await update.message.reply_html(text=f"This function has not been implemented yet.")


async def show_personal_leaderboard(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:                                            # temp !!!
    await update.message.reply_html(text=f"This function has not been implemented yet.")


def main() -> None:
    """
    Starts the bot and adds handlers to it.
    """

    application = Application.builder().token(
        "REPLACE_WITH_BOT_TOKEN!!!").build()

    application.add_handler(CommandHandler("start", start))
    # application.add_handler(CommandHandler("input", new_input))
    # application.add_handler(CommandHandler("list", show_list))
    # application.add_handler(CommandHandler("prognose", show_forecast))
    # application.add_handler(MessageHandler(
    #     filters.StatusUpdate.WEB_APP_DATA, web_app_data))
    application.add_handler(MessageHandler(filters.TEXT, handle_message))

    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()