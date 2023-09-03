class notificationBody {
    constructor(name = "null", message = "null") {
        this.name = name;
        this.message = message;
    };

    setData(newName = "null", newMessage = "null") {
        this.name = newName;
        this.message = newMessage;
    };

    getData() {
        return { name: this.name, message: this.message };
    };
}

class telegramKeyboard {
    constructor() {
        this.buttons = {
            "parse_mode": "Markdown",
            "reply_markup": {
                "inline_keyboard": [],
            },
        };
    };

    addButton(button = "null"){
        this.buttons.reply_markup.inline_keyboard.push([button]);
    };

    getData(){
        return this.buttons;
    };
};

module.exports = {
    notificationBody,
    telegramKeyboard,
}