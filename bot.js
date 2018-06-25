const NosAlert = require("./nos-alert").NosAlert;

let bot = new NosAlert(process.env.TOKEN);

bot.start();