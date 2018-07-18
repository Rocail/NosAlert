const NosAlert = require("./nos-alert").NosAlert;


let token = process.env.TOKEN;
let db;

if (typeof(token) === "undefined") {
    let config = require("./config/development");
    token = config.token;
    db = config.db;
} else {
    db = {
        url: PROCESS.env.DB_URL,
        name: PROCESS.env.DB_NAME,
        user: PROCESS.env.DB_USERNAME,
        password: PROCESS.env.DB_USERPWD,
    }
}

let url =


let bot = new NosAlert(token);

bot.start();