const NosAlert = require("./nos-alert").NosAlert;

let token = process.env.TOKEN;
if (typeof(token) === "undefined") {
    token = require("./config/development").token;
}

let bot = new NosAlert(token);

bot.start();