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


def main() -> None:
    """
    Starts the bot and adds handlers to it.
    """

    application = Application.builder().token(
        "6339848456:AAGFHw9hL7HIZTs1GPgkfYz3Jdb9VWNaXFA").build()

    # application.add_handler(CommandHandler("start", start))
    # application.add_handler(CommandHandler("input", new_input))
    # application.add_handler(CommandHandler("list", show_list))
    # application.add_handler(CommandHandler("prognose", show_forecast))
    # application.add_handler(CallbackQueryHandler(menu_select))
    # application.add_handler(MessageHandler(
    #     filters.StatusUpdate.WEB_APP_DATA, web_app_data))
    # application.add_handler(MessageHandler(filters.TEXT, handle_message))

    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()