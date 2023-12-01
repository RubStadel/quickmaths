use std::env;
extern crate google_sheets4 as sheets4;
use crate::hyper::client::HttpConnector;
use crate::hyper_rustls::HttpsConnector;
use serde_json::{json, Map};
use sheets4::api::ValueRange;
use sheets4::oauth2::{self, authenticator::Authenticator};
use sheets4::Sheets;
use sheets4::{hyper, hyper_rustls};
use std::error::Error;
use teloxide::types::{ChatKind, MessageKind};
use teloxide::{
    payloads::SendMessageSetters,
    prelude::*,
    types::{
        ButtonRequest, InlineKeyboardButton, InlineKeyboardMarkup, KeyboardButton, KeyboardMarkup,
        Me, ParseMode, WebAppInfo,
    },
    utils::command::BotCommands,
};
use url::Url;

struct GameMode<'a> {
    name: &'a str,
    questions_needed: f32,
    time_min: f32,
}

const CLASSIC: GameMode = GameMode {
    name: "classic",
    questions_needed: 20_f32,
    time_min: 30_f32,
};

const ADVANCED: GameMode = GameMode {
    name: "advanced",
    questions_needed: 20_f32,
    time_min: 40_f32,
};

const EXPERT: GameMode = GameMode {
    name: "expert",
    questions_needed: 20_f32,
    time_min: 40_f32,
};

const ALL_GAME_MODES: [GameMode; 3] = [CLASSIC, ADVANCED, EXPERT];

const SPREADSHEET_ID: &str = "REPLACE_WITH_SPREADSHEET_ID!!!";
const ACCOUNT_CREDENTIALS: &str = "quickmaths_secret.json";

/// These commands are supported:
#[derive(BotCommands)]
#[command(
    rename_rule = "lowercase",
    description = "These commands are supported:"
)]
enum Command {
    /// Display this text
    #[command(description = "display this text.")]
    Help,
    /// Start
    #[command(description = "display a set of inline buttons.")]
    Start,
    /// Play, shortcut to game mode selection menu
    #[command(description = "shortcut to game mode selection menu.")]
    Play,
    /// Leaderboard, shortcut to leaderboard type selection menu
    #[command(description = "shortcut to leaderboard type selection menu.")]
    Leaderboard,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    env::set_var("TELOXIDE_TOKEN", "REPLACE_WITH_BOT_TOKEN!!!");

    let bot = Bot::from_env();

    let handler = dptree::entry()
        .branch(Update::filter_message().endpoint(message_handler))
        .branch(Update::filter_callback_query().endpoint(callback_handler));

    Dispatcher::builder(bot, handler)
        .enable_ctrlc_handler()
        .build()
        .dispatch()
        .await;
    Ok(())
}

/// Builds the spreadsheet hub that will be used to send updates to the spreadsheet.
async fn make_hub() -> Sheets<HttpsConnector<HttpConnector>> {
    let client: hyper::Client<hyper_rustls::HttpsConnector<hyper::client::HttpConnector>> =
        hyper::Client::builder().build(
            hyper_rustls::HttpsConnectorBuilder::new()
                .with_native_roots()
                .https_only()
                .enable_http1()
                .enable_http2()
                .build(),
        );

    let secret: oauth2::ServiceAccountKey = oauth2::read_service_account_key(ACCOUNT_CREDENTIALS)
        .await
        .expect("secret not found");

    let auth: Authenticator<hyper_rustls::HttpsConnector<hyper::client::HttpConnector>> =
        oauth2::ServiceAccountAuthenticator::with_client(secret, client.clone())
            .build()
            .await
            .expect("could not create an authenticator");

    Sheets::new(client.clone(), auth)
}

/// Decides which menu buttons to display based on the context it is called from.
fn match_context(context: &str) -> Option<Vec<&str>> {
    match context {
        "start" => Some(["play", "leaderboard"].to_vec()),
        "leaderboard" => Some(["absolute", "relative"].to_vec()),
        "absolute" | "relative" => {
            let mut modes = vec![];
            for mode in ALL_GAME_MODES {
                modes.push(mode.name);
            }
            Some(modes)
        }
        &_ => None,
    }
}

/// Creates an inline keyboard containing two menu buttons.
/// Used to progress the menu tree following '/start' and '/leaderboard'.
fn make_inline_keyboard(context: &str) -> InlineKeyboardMarkup {
    let mut keyboard: Vec<Vec<InlineKeyboardButton>> = vec![];

    let menu_items = match_context(context).expect("Menu context not recognized!");

    match context {
        "absolute" | "relative" => {
            for item in menu_items.chunks(1) {
                let row = item
                    .iter()
                    .map(|&item| {
                        InlineKeyboardButton::callback(
                            item.to_owned(),
                            context.to_owned() + ", " + item,
                        )
                    })
                    .collect();

                keyboard.push(row);
            }
        }
        "start" | "leaderboard" => {
            for item in menu_items.chunks(1) {
                let row = item
                    .iter()
                    .map(|&item| InlineKeyboardButton::callback(item.to_owned(), item.to_owned()))
                    .collect();

                keyboard.push(row);
            }
        }
        &_ => (),
    }

    InlineKeyboardMarkup::new(keyboard)
}

/// Creates an reply keyboard made up of buttons in a big column.
/// One button for each of the game modes that are defined in ALL_GAME_MODES.
fn make_reply_keyboard() -> KeyboardMarkup {
    let mut keyboard: Vec<Vec<KeyboardButton>> = vec![];

    let url_root = String::from("https://quickmaths.w3spaces.com/");

    for mode in ALL_GAME_MODES.chunks(1) {
        let row = mode
            .iter()
            .map(|mode| {
                KeyboardButton::new(mode.name.to_owned()).request(ButtonRequest::WebApp(
                    WebAppInfo {
                        url: Url::parse(&(url_root.to_owned() + mode.name + "/"))
                            .expect("URL could not be parsed.")
                            .to_owned(),
                    },
                ))
            })
            .collect();

        keyboard.push(row);
    }

    KeyboardMarkup::new(keyboard).resize_keyboard(true)
}

/// Parse the text written by the user and check if that text is a valid command, then match the command.
async fn message_handler(
    bot: Bot,
    msg: Message,
    me: Me,
) -> Result<(), Box<dyn Error + Send + Sync>> {
    let mut username = String::new();
    if let ChatKind::Private(info) = &msg.chat.kind {
        username = info.first_name.as_ref().unwrap().to_owned();
        if let Some(name) = &info.username {
            username = name.to_owned();
        }
    }

    if let MessageKind::WebAppData(msg_web_app_data) = &msg.kind {
        web_app_data_handler(
            &bot,
            &msg,
            username.to_owned(),
            msg_web_app_data.web_app_data.data.to_owned(),
        )
        .await?;
    }

    if let Some(text) = msg.text() {
        match BotCommands::parse(text, me.username()) {
            Ok(Command::Help) => {
                // Just send the description of all commands.
                bot.send_message(msg.chat.id, Command::descriptions().to_string())
                    .await?;
            }
            Ok(Command::Start) => {
                // Create a list of buttons and send them.
                let keyboard = make_inline_keyboard("start");
                bot.send_message(msg.chat.id, "Choose an action:")
                    .reply_markup(keyboard)
                    .await?;
            }
            Ok(Command::Play) => {
                // List all possible game modes.
                let keyboard = make_reply_keyboard();
                bot.send_message(msg.chat.id, "Choose a game mode:")
                    .reply_markup(keyboard)
                    .await?;
            }
            Ok(Command::Leaderboard) => {
                // List the possible leaderboard types (absolute and relative) as two new inline buttons.
                let keyboard = make_inline_keyboard("leaderboard");
                bot.send_message(msg.chat.id, "Choose a leaderboard type:")
                    .reply_markup(keyboard)
                    .await?;
            }

            Err(_) => {
                bot.send_message(msg.chat.id, "Command not found!").await?;
            }
        }
    }

    Ok(())
}

/// When it receives a callback from a button it edits the message with all
/// those buttons, writing a text with the selected Debian version.
///
/// **IMPORTANT**: do not send privacy-sensitive data this way!!!
/// Anyone can read data stored in the callback button.
async fn callback_handler(bot: Bot, q: CallbackQuery) -> Result<(), Box<dyn Error + Send + Sync>> {
    if let Some(option) = &q.data {
        // let text = format!("You chose: {option}");

        // Tell telegram that we've seen this query, to remove 🕑 icons from the
        // clients. You could also use `answer_callback_query`'s optional
        // parameters to tweak what happens on the client side.
        bot.answer_callback_query(&q.id).await?;

        // Edit text of the message to which the buttons were attached
        if let Some(Message { id, chat, .. }) = &q.message {
            match option.as_str() {
                "play" => {
                    let keyboard = make_reply_keyboard();
                    bot.send_message(chat.id, "Choose a game mode:")
                        .reply_markup(keyboard)
                        .await?;
                    bot.delete_message(chat.id, *id).await?;
                }
                "leaderboard" => {
                    let keyboard = make_inline_keyboard("leaderboard");
                    bot.edit_message_text(chat.id, *id, "Choose a leaderboard type:")
                        .reply_markup(keyboard)
                        .await?;
                }
                "absolute" => {
                    let keyboard = make_inline_keyboard("absolute");
                    bot.edit_message_text(chat.id, *id, "Choose a game mode:")
                        .reply_markup(keyboard)
                        .await?;
                }
                "relative" => {
                    let keyboard = make_inline_keyboard("relative");
                    bot.edit_message_text(chat.id, *id, "Choose a game mode:")
                        .reply_markup(keyboard)
                        .await?;
                }
                &_ => {
                    if option.contains("absolute") {
                        if let Some(result) = show_absolute_leaderboard(&option[10..]).await {
                            bot.edit_message_text(chat.id, *id, result)
                                .parse_mode(ParseMode::Html)
                                .await?;
                        } else {
                            bot.edit_message_text(
                                chat.id,
                                *id,
                                "Couldn't find the selected leaderboard.",
                            )
                            .await?;
                        }
                    } else if option.contains("relative") {
                        if let Some(result) =
                            show_relative_leaderboard(&option[10..], q.to_owned()).await
                        {
                            bot.edit_message_text(chat.id, *id, result)
                                .parse_mode(ParseMode::Html)
                                .await?;
                        } else {
                            bot.edit_message_text(
                                chat.id,
                                *id,
                                "Couldn't find the selected leaderboard.",
                            )
                            .await?;
                        }
                    }
                }
            }
        }
    }

    Ok(())
}

/// Returns the absolute leaderboard for the given game mode, featuring the ten best performances and their respective stats.
async fn show_absolute_leaderboard(game_mode: &str) -> Option<String> {
    let mut valid_mode: Option<&str> = None;
    let mut _tmp_mode = String::new();
    for mode in ALL_GAME_MODES.iter() {
        if game_mode == mode.name {
            _tmp_mode = game_mode.to_string() + ", absolute!E2:H11";
            valid_mode = Some(_tmp_mode.as_str());
        }
    }

    let hub = make_hub().await;
    let rows = hub
        .spreadsheets()
        .values_get(SPREADSHEET_ID, valid_mode.unwrap())
        .doit()
        .await
        .unwrap()
        .1
        .values
        .unwrap();
    let mut i = 1;
    let mut text = format!(
        "<u>best performances in quickmaths <em>{}</em></u>\n",
        game_mode
    );

    for row in rows.iter() {
        text = format!("{}<b>{}. Place:</b>\n", text, &i.to_string());

        text = format!(
            "{}    {}: {:.2} points\n    {} seconds, {} questions",
            text,
            row.get(0).unwrap().as_str().unwrap(),
            row.get(1)
                .unwrap()
                .as_str()
                .unwrap()
                .parse::<f32>()
                .unwrap(),
            row.get(2).unwrap().as_str().unwrap(),
            row.get(3).unwrap().as_str().unwrap(),
        );
        text += "\n";
        i += 1;
    }

    Some(text.to_owned())
}

/// Returns the relative leaderboard for the given game mode and user, featuring their average score and their ranking overall.
async fn show_relative_leaderboard(game_mode: &str, q: CallbackQuery) -> Option<String> {
    let mut valid_mode: Option<&str> = None;
    let mut _tmp_mode = String::new();
    for mode in ALL_GAME_MODES.iter() {
        if game_mode == mode.name {
            _tmp_mode = game_mode.to_string() + ", relative!D2:F";
            valid_mode = Some(_tmp_mode.as_str());
        }
    }

    let hub = make_hub().await;
    let rows = hub
        .spreadsheets()
        .values_get(SPREADSHEET_ID, valid_mode.unwrap())
        .doit()
        .await
        .unwrap()
        .1
        .values
        .unwrap();
    let mut text = format!(
        "<u>your performance in quickmaths <em>{}</em></u>\n",
        game_mode
    );

    let mut _username = String::new();
    if let Some(user) = q.from.username {
        _username = user.to_owned();
    } else {
        _username = q.from.first_name.to_owned();
    }

    let index = rows
        .iter()
        .position(|r| r.to_owned().get(0).unwrap().as_str().unwrap() == _username)
        .unwrap();
    let tmp_percentile = (index + 1) as f32 / rows.len() as f32 * 100_f32;
    let mut _percentile = String::new();
    if tmp_percentile >= 10.0 {
        _percentile = format!("{:.0}", tmp_percentile);
    } else {
        _percentile = format!("{:.2}", tmp_percentile);
    }

    text = format!(
        "{}With an average score of {:.3} points you are in the top {}% of all {} players",
        text,
        rows.get(index)
            .unwrap()
            .get(1)
            .unwrap()
            .as_str()
            .unwrap()
            .parse::<f32>()
            .unwrap(),
        _percentile,
        rows.len()
    );

    Some(text.to_owned())
}

/// Processes the data sent back by a WebApp.
/// Updates the spreadsheets with the score(s) and sends a message to the user.
async fn web_app_data_handler(
    bot: &Bot,
    msg: &Message,
    username: String,
    data: String,
) -> Result<(), Box<dyn Error + Send + Sync>> {
    let data_json: serde_json::Value = serde_json::from_str(&data)?;
    let mut tmp_json = data_json.as_array().unwrap().iter();

    let game_info = tmp_json.next().unwrap().as_object().unwrap().to_owned();
    let game_mode = game_info["gameMode"].as_str().unwrap();
    let questions_needed = game_info["questionsNeeded"].as_number().unwrap();

    let mut highest_score: f32 = 0.0;
    let mut highest_score_stats: Map<String, serde_json::Value> = Map::new();

    for item in tmp_json {
        let game_stats = item.as_object().unwrap().to_owned();
        let seconds = game_stats["seconds"].as_f64().unwrap() as f32;
        let questions = game_stats["questions"].as_f64().unwrap() as f32;
        let mut game_score = 0_f32;

        if let Some(score) = calculate_score(game_mode, seconds, questions) {
            if score > highest_score {
                highest_score = score;
                highest_score_stats = game_stats.to_owned();
            }
            game_score = score
        }

        let hub = make_hub().await;
        hub.spreadsheets()
            .values_append(
                ValueRange {
                    major_dimension: None,
                    range: Some(game_mode.to_string() + ", absolute!A2:D"),
                    values: Some(vec![vec![
                        serde_json::from_value(json!(&username))?,
                        serde_json::from_str(&game_score.to_string())?,
                        serde_json::from_str(&seconds.to_string())?,
                        serde_json::from_str(&questions.to_string())?,
                    ]]),
                },
                SPREADSHEET_ID,
                (game_mode.to_string() + ", absolute!A2:D").as_str(),
            )
            .value_input_option("RAW")
            .doit()
            .await?;

        let results = hub
            .spreadsheets()
            .values_get(SPREADSHEET_ID, &(game_mode.to_string() + ", relative!D2:F"))
            .doit()
            .await?
            .1
            .values
            .unwrap();

        let player_row = results
            .iter()
            .position(|r| r.get(0).unwrap() == &json!(username));
        if let Some(index) = player_row {
            let avg_old = results
                .get(index)
                .unwrap()
                .get(1)
                .unwrap()
                .as_str()
                .unwrap()
                .parse::<f32>()?;
            let num_games_old = results
                .get(index)
                .unwrap()
                .get(2)
                .unwrap()
                .as_str()
                .unwrap()
                .parse::<f32>()?;

            let avg_new = ((avg_old * num_games_old) + game_score) / (num_games_old + 1_f32);

            let tmp_range =
                game_mode.to_string() + ", relative!B" + &(index + 2).to_string() + ":C";
            hub.spreadsheets()
                .values_update(
                    ValueRange {
                        major_dimension: None,
                        range: Some(tmp_range.to_owned()),
                        values: Some(vec![vec![
                            serde_json::from_str(&avg_new.to_string())?,
                            serde_json::from_str(&(num_games_old + 1_f32).to_string())?,
                        ]]),
                    },
                    SPREADSHEET_ID,
                    &(tmp_range),
                )
                .value_input_option("RAW")
                .doit()
                .await?;
        } else {
            hub.spreadsheets()
                .values_append(
                    ValueRange {
                        major_dimension: None,
                        range: Some(game_mode.to_string() + ", relative!A2:C"),
                        values: Some(vec![vec![
                            serde_json::from_value(json!(&username))?,
                            serde_json::from_str(&game_score.to_string())?,
                            serde_json::from_str(&1_f32.to_string())?,
                        ]]),
                    },
                    SPREADSHEET_ID,
                    (game_mode.to_string() + ", relative!A2:C").as_str(),
                )
                .value_input_option("RAW")
                .doit()
                .await?;
        }
    }

    let mut text = format!("Congratulations, {}!\n", username);
    text = format!(
        "{}Out of the {} game(s) of quickmaths <em>{}</em> you just played, your best result were {:.2} points for correctly answering {}/{} questions in {} seconds!\n",
        text,
        data_json.as_array().unwrap().len()-1,
        game_mode.to_owned(), highest_score,
        questions_needed,
        highest_score_stats["questions"].as_f64().unwrap(),
        highest_score_stats["seconds"].as_f64().unwrap()
    );
    bot.send_message(msg.chat.id, text)
        .parse_mode(ParseMode::Html)
        .await?;

    Ok(())
}

/// Calculate the score for the given game stats and return it.
fn calculate_score(game_mode: &str, seconds: f32, questions: f32) -> Option<f32> {
    let mut time_min: f32 = 0_f32;
    let mut questions_needed: f32 = 0_f32;
    for mode in ALL_GAME_MODES {
        if mode.name == game_mode {
            time_min = mode.time_min;
            questions_needed = mode.questions_needed;
            break;
        }
    }

    let exponent = (-(seconds - time_min) / 90_f32) * (30_f32 / time_min);
    let root = 1_f32 - (questions_needed / questions);
    let tmp_score: f32 = 100.0 * exponent.exp() * (1.0 - root.sqrt());

    Some(tmp_score)
}
