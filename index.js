// підключення бібліотек
const notifier = require("node-notifier");
const telegramBot = require("node-telegram-bot-api");
const { notificationBody, telegramKeyboard } = require("./js/classes");
const { saveScreenshot } = require("./js/functions");
const { spawn } = require('child_process');
const screenshot = require('desktop-screenshot');
const robot = require("robotjs");
const headKeyboardData = require("./json/headKeyboardData.json");

// підключення env та витагання з нього токен бота
require('dotenv').config();
const TOKEN = process.env.TOKEN;

// створення змінної з ботом
const bot = new telegramBot(TOKEN, { polling: true });

// особисті класи для більш удобного присвоєння без кучі змінних
const telegramNotify = new notificationBody();
const headKeyboard = new telegramKeyboard();

// перераховує всі кнопки для команди /keyboard(повністтю всі кнопки)
for (let i = 0; i < Object.keys(headKeyboardData).length; i++) {
    headKeyboard.addButton(Object.values(headKeyboardData)[i].button);
};

// показує список команд, котрі можна швидко виконати
bot.setMyCommands([
    { command: "/keyboard", description: "Відкрити клавіатуру з всіма діями над системою." }
])

bot.on("message", message => {
    // задання контенту повідомлення через метод в класі
    telegramNotify.setData(message.chat.first_name, message.text);

    // якщо команда /keyboard
    if (message.text == "/keyboard") {
        // то відсилається список з усіма діями(клавіатура inline)
        bot.sendMessage(message.chat.id, `Добрий день панечку, ось всі дії, котрі ви можете робити:`, headKeyboard.getData())
    }

    // якщо перший символ рядку :, другий m а третій пробіт(" ") то
    if (
        telegramNotify.getData().message[0] == ":"
        && telegramNotify.getData().message[1] == "m"
        && telegramNotify.getData().message[2] == " ") {
        // надсилання сповіщення на комп'ютер, де запущено код 
        notifier.notify({ title: message.chat.first_name, message: message.text.slice(3), icon: "./assets/ico.png" });
        // відсилання повідомлення про успішну діо та повідомлення, котре було доставлено на пк з форматацією
        bot.sendMessage(message.chat.id, `Ваше повідомлення відіслано:\n${message.text.slice(3)}`)
    }
});

bot.on("callback_query", query => {
    let fromJsonData = null;

    // перебір всіх обєктів в json файлі
    for (let i = 0; i < Object.keys(headKeyboardData).length; i++) {
        // при умові відповідності зазначеного калбеку і прийшедшого виконується
        if (Object.values(headKeyboardData)[i].button.callback_data == query.data) {
            // просто присвоюється змінній той об'єкт, котрий був вірним в умові вище
            fromJsonData = Object.values(headKeyboardData)[i];
        };
    };

    if (fromJsonData.needTo) {
        if (fromJsonData.needTo.spawn) {
            // створення нового процесу(запуск додатку) при умові що це потрібно
            spawn(query.data);
        };

        if (fromJsonData.needTo.robotActions) {
            if (fromJsonData.needTo.robotActions.enterPassword) {
                // введення паролю з .env файлу
                robot.typeString(process.env.wowPassword);
            };

            if (fromJsonData.needTo.robotActions.keyTap) {
                // банальне нажимання enter
                robot.keyTap(fromJsonData.needTo.robotActions.keyTap.key);
            };
        };
    }

    if (query.data == "screenshot") {
        // створення скріншоту викликаючи ф-цію
        saveScreenshot("./assets/screenshot.png");

        // відсилання скріншоту
        bot.sendPhoto(query.message.chat.id, "./assets/screenshot.png");

        // видалення скріншоту після відсилання
        // fs.unlink("./assets/screenshot.png");
    }

    // кінцеве повідомлення про виконану дію
    bot.sendMessage(query.message.chat.id, `Дію "${fromJsonData.button.text}" виконано. ✅`);
});