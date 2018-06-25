const Discord = require("discord.js");
const request = require("request");
const parseJson = require("parse-json");

const initStatus = {
    angels: {
        progress: 0,
        eventType: 0,
    },
    demons: {
        progress: 0,
        eventType: 0,
    },
    init: true
};

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
                if (message.channel.name !== "blabla-nostale")
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

    start() {
        setInterval(() => this.checkStatus(), 60 * 1000);
    }

    getStatus(serverNumber = 4) {
        return new Promise((resolve, reject) => {
            let url = "https://glaca.nostale.club/api/fr/" + serverNumber;

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

    alert(message) {
        console.log(ALERT);
        for (let channel of this.client.channels) {
            if (channel.name === "blabla-nostale" || channel.name === "act4") {
                this.client.channels.get(this.channelIds[count]).send(message);
            }
        }
    }

    checkStatus() {
        this.getStatus()
            .then((newStatus) => {
                if (newStatus.angels.eventType ==="3"  && this.status.angels.eventType !== "3") {
                    this.alert("@everyone RAID ANGE");
                } else if (newStatus.demons.eventType !== "3" && this.status.demons.eventType !== "3") {
                    this.alert("@everyone RAID DEMON");
                }
                this.status = newStatus;
            })
            .catch(err => console.log(err));
    }

    getPercents() {
        let message = "Angels percents: " + this.status.angels.progress + "%\n"
            + "Demons percents: " + this.status.demons.progress + "%";
        return message;
    }
};