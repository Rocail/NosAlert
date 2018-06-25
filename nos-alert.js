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

const initChannelIds = [];

exports.NosAlert = class NosAlert {
    constructor(token) {
        this.status = initStatus;
        this.channelIds = initChannelIds;
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
                    if (content.length === 2) {
                        if (content[1] === "on") {
                            if (this.channelIds.includes(message.channel.id)) {
                                message.channel.send("This channel is already registered !");
                            } else {
                                message.channel.send("Channel successfully registered");
                                this.channelIds.push(message.channel.id);
                                console.log(this.channelIds);
                            }
                        } else if (content[1] === "off") {
                            if (this.channelIds.includes(message.channel.id)) {
                                let position = this.channelIds.indexOf(message.channel.id);
                                this.channelIds.splice(position, 1);
                                message.channel.send("Channel successfully unregistered");
                                console.log(this.channelIds);
                            } else {
                                message.channel.send("This channel is not registered !");
                            }
                        } else if (content[1] === "percents") {
                            message.channel.send(this.getPercents());
                        } else if (content[1] === "help") {
                            this.help(message.channel.id);
                        }
                    }
                } else if (content[0] === "!help") {
                    this.help(message.channel.id)
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
        let helpMessage =
            "!a4 on -> active les alertes en cas de raid sur ce canal\n" +
            "!a4 off -> désactive les alertes en cas de raid sur ce canal\n" +
            "!a4 percents -> affiche les pourcentages actuels";
        this.client.channels.get(channelId).send(helpMessage);
    }


    getPercents() {
        let message = "Angels percents: " + this.status.angels.progress + "%\n"
            + "Demons percents: " + this.status.demons.progress + "%";
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
                }
            })
            .catch(err => console.log(err));
    }

    getStatus(serverNumber = 4) {
        return new Promise((resolve, reject) => {
            // let url = "https://glaca.nostale.club/api/fr/" + serverNumber;
            let url = "https://glaca.nostale.club/api/de/2/";

            request(url, (err, res, body) => {
                if (err !== null) {
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
                console.log(channel[1].name);
//                 if (channel[1].name === "blabla-nostale" || channel[1].name === "act4") {
                if (channel[1].name === "act4") {
                    channel[1].send(this.displayStatus(clan));
                }
            }
        }
    }

    displayStatus(clan) {
        let status;
        console.log(this.status);
        if (clan === clan.ANGE) {
            status = this.status.angels;
        } else {
            status = this.status.demons;
        }
        return (
            {
                embed: {
                    color: 3447003,
                    author: {
                        name: this.client.user.username,
                        icon_url: this.client.user.avatarURL
                    },
                    title: "Raid act4 !",
                    fields: [
                        {
                            name: "Côté",
                            value: clan
                        },
                        {
                            name: "Début:",
                            value: new Date(Math.floor(this.status.currentDate / 1000) * 1000).toLocaleString("fr", { timeZone: 'Europe/Paris' }).replace(/.+ /g, '')
                        },
                        {
                            name: "Boss:",
                            value: new Date(Math.floor(this.status.currentDate / 1000 + 60 * 30) * 1000).toLocaleString("fr", { timeZone: 'Europe/Paris' }).replace(/.+ /g, '')
                        },

                        {
                            name: "Fin:",
                            value: new Date(Math.floor(this.status.currentDate / 1000 + 60 * 60) * 1000).toLocaleString("fr", { timeZone: 'Europe/Paris' }).replace(/.+ /g, '')
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