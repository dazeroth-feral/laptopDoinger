const notifier = require("node-notifier");
const telegramBot = require("node-telegram-bot-api");
const { notificationBody, telegramKeyboard } = require("./js/classes");
const { spawn } = require('child_process');
const robot = require("robotjs");
const headKeyboardData = require("./json/headKeyboardData.json");

require('dotenv').config();
const TOKEN = process.env.TOKEN;

const bot = new telegramBot(TOKEN, { polling: true });

const telegramNotify = new notificationBody();
const headKeyboard = new telegramKeyboard();

for(let i = 0; i < Object.keys(headKeyboardData).length; i++){
    headKeyboard.addButton(Object.values(headKeyboardData)[i]);
};

bot.setMyCommands([
    { command: "/keyboard", description: "Відкрити клавіатуру з всіма діями над системою." }
])

bot.on("message", message => {
    telegramNotify.setData(message.chat.first_name, message.text);

    if (message.text == "/keyboard") {
        bot.sendMessage(message.chat.id, `Добрий день панечку, ось всі дії, котрі ви можете робити:`, headKeyboard.getData())
    }

    if (
        telegramNotify.getData().message[0] == ":"
        && telegramNotify.getData().message[1] == "m"
        && telegramNotify.getData().message[2] == " ") {
            notifier.notify({ title: message.chat.first_name, message: message.text.slice(3), icon: "./assets/ico.png" });
            bot.sendMessage(message.chat.id, `Ваше повідомлення відіслано:\n${message.text.slice(3)}`)
    }
});

bot.on("callback_query", query => {
    let action = null;

    for(let i = 0; i < Object.keys(headKeyboardData).length; i++){
        if(Object.values(headKeyboardData)[i].callback_data == query.data){
            action = Object.values(headKeyboardData)[i].text;
        };
    };

    robot.typeString(query.data);

    spawn(query.data);

    bot.sendMessage(query.message.chat.id, `Виконую дію:\n"${action}"`)
});