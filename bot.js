const NosAlert = require("./nos-alert").NosAlert;


if (this.process.env.TOKEN === "undefined") {
    throw new Error("no token found");
}
let bot = new NosAlert(process.env.TOKEN);

bot.start();