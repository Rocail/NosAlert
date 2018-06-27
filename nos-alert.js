const Discord = require("discord.js");
const request = require("request");
const parseJson = require("parse-json");

const initStatus = {
    angels: {
        progress: "0",
        eventType: "0",
    },
    demons: {
        progress: "0",
        eventType: "0",
    },
    currentDate: null,
    init: true
};

const clan = Object.freeze({
    ANGE: "Ange",
    DEMON: "Démon",
});


exports.NosAlert = class NosAlert {
    constructor(token) {
        this.status = initStatus;
        this.client = new Discord.Client();

        console.log("token recieved : " + token);

        this.client.on("ready", () => {
            console.log("Logged as " + this.client.user.tag);
        });

        this.client.on("message", (message) => {
                if (message.author.bot)
                    return;
                if (message.channel.name !== "blabla-nostale" && message.channel.name !== "act4")
                    return;
                let content = message.content.split(" ");
                console.log(content);
                if (content[0] === "!a4") {
                    message.channel.send(this.getPercents());
                }
            }
        );

        this.client.login(token)
            .then(() => {
                console.log("connected !");
                this.checkStatus();
            })
            .catch(err => console.log(err));
    }

    help(channelId) {
        let helpMessage = {
            embed: {
                color: 3447003,
                title: "Liste des commandes du bot:",
                fields: [
                    {
                        name: "!a4 percents",
                        value: "affiche l'état actuel de l'act 4"
                    },
                    {
                        name: "!a4 help",
                        value: "affiche ce message d'aide"
                    },
                ]
            }
        };
        this.client.channels.get(channelId).send(helpMessage);
    }


    getPercents() {
        console.log(this.status);
        let message = {
            embed: {
                color: 3447003,
                title: "Statut de l'act4 :",
                fields: [
                    {
                        name: "Ange",
                        value: this.status.angels.eventType === "0" ? this.status.angels.progress + "%" : "Raid !\n"
                            + "```Début: " + new Date(Math.floor(this.status.currentDate / 1000) * 1000).toLocaleString("fr", {timeZone: 'Europe/Paris'}).replace(/.+ /g, '') + "\n"
                            + "Boss : " + new Date(Math.floor(this.status.currentDate / 1000 + 60 * 30) * 1000).toLocaleString("fr", {timeZone: 'Europe/Paris'}).replace(/.+ /g, '') + "\n"
                            + "Fin  : " + new Date(Math.floor(this.status.currentDate / 1000 + 60 * 60) * 1000).toLocaleString("fr", {timeZone: 'Europe/Paris'}).replace(/.+ /g, '') + "```"
                    },
                    {
                        name: "Démon",
                        value: this.status.demons.eventType === "0" ? this.status.demons.progress + "%" : "Raid !\n"
                            + "Début : " + new Date(Math.floor(this.status.currentDate / 1000) * 1000).toLocaleString("fr", {timeZone: 'Europe/Paris'}).replace(/.+ /g, '') + "\n"
                            + "Boss  : " + new Date(Math.floor(this.status.currentDate / 1000 + 60 * 30) * 1000).toLocaleString("fr", {timeZone: 'Europe/Paris'}).replace(/.+ /g, '') + "\n"
                            + "Fin   : " + new Date(Math.floor(this.status.currentDate / 1000 + 60 * 60) * 1000).toLocaleString("fr", {timeZone: 'Europe/Paris'}).replace(/.+ /g, '')
                    },
                ]
            }
        };
        return message;
    }

    start() {
        setInterval(() => this.checkStatus(), 60 * 1000);
    }

    checkStatus() {
        this.getStatus()
            .then((newStatus) => {
                if (newStatus.angels.eventType === "3" && this.status.angels.eventType !== "3") {
                    this.status = newStatus;
                    this.alert(clan.ANGE);
                } else if (newStatus.demons.eventType === "3" && this.status.demons.eventType !== "3") {
                    this.status = newStatus;
                    this.alert(clan.DEMON);
                } else {
                    this.status = newStatus;
                }
            })
            .catch(err => console.log(err));
    }

    getStatus(serverNumber = 4) {
        return new Promise((resolve, reject) => {
            let url = "https://glaca.nostale.club/api/fr/" + serverNumber;

            request(url, (err, res, body) => {
                if (err !== null) {
                    console.log(err);
                    reject(err);
                } else {
                    if ((res && res.statusCode) === 200) {
                        resolve(parseJson(body));
                    } else {
                        reject({
                            message: "Wrong status code : " + res && res.statusCode
                        });
                    }
                }
            })
        })
    }

    alert(clan) {
        console.log("ALERT");
        for (let channel of this.client.channels) {
            if (channel[1].type === "text") {
                if (channel[1].name === "blabla-nostale" || channel[1].name === "act4") {
                    let role = channel[1].guild.roles.find("name", "Chikungunya (D-13)");
                    let id = role ? role.id : undefined;
                    channel[1].send(this.displayStatus(clan, id));
                }
            }
        }
    }

    displayStatus(clan, id) {
        return (
            {
                embed: {
                    color: 3447003,
                    title: "Raid act4 !",
                    description: id ? "<@&" + id + ">" : "Un nouveau raid act4 a commencé !",
                    fields: [
                        {
                            name: "Côté",
                            value: clan
                        },
                        {
                            name: "Début:",
                            value: new Date(Math.floor(this.status.currentDate / 1000) * 1000).toLocaleString("fr", {timeZone: 'Europe/Paris'}).replace(/.+ /g, '')
                        },
                        {
                            name: "Boss:",
                            value: new Date(Math.floor(this.status.currentDate / 1000 + 60 * 30) * 1000).toLocaleString("fr", {timeZone: 'Europe/Paris'}).replace(/.+ /g, '')
                        },

                        {
                            name: "Fin:",
                            value: new Date(Math.floor(this.status.currentDate / 1000 + 60 * 60) * 1000).toLocaleString("fr", {timeZone: 'Europe/Paris'}).replace(/.+ /g, '')
                        },
                    ]
                }
            }
        )
    }

    dateObjToStr(obj, spacing = true) {
        let str = ""
            + ("0" + obj.getDate()).slice(-2) + "/"
            + ("0" + (obj.getMonth() + 1)).slice(-2) + "/"
            + obj.getFullYear() + (spacing ? "\t" : " ")
            + ("0" + obj.getHours()).slice(-2) + ":"
            + ("0" + obj.getMinutes()).slice(-2);
        return str;
    }
};