const NosAlert = require("./nos-alert").NosAlert;
const config = require("config");

let bot = new NosAlert(config.bot.token);

bot.start();