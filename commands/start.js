const groupsObj = require('../database/_groups.json')
module.exports = {
    data: {
        name: "start",
        description: "Standard Start Command for Telegram Bots",
        aliases: [],
        usage: {},
        args: false,
        groupOnly: false,
        adminOnly: false,
    },
    async execute(bot, message, args) {
        bot.sendMessage(message.chat.id, "Welcome to the 3AMB Parade State Bot! \nPlease use the command /help to see the commands that you may enter to utilise the bot!", { "parse_mode": "HTML" })
        if (message.chat.type === 'private') {
            bot.sendMessage(message.chat.id, "❗ If this is your first time using this bot, you will need to initialise the bot in a Group where your members are located. \n\nPlease invite me to a group and /initialise there!", { "parse_mode": "HTML" })
        }
        if (message.chat.type === 'group' && !groupsObj[message.chat.id]) {
            bot.sendMessage(message.chat.id, "❗ If this is your first time using this bot, you will need to initialise the bot in a Group where your members are located. \n\nIf this is the group you are planning on using, please execute the command /initialise and follow the bot's instructions!", { "parse_mode": "HTML" })
        } else {
            console.log(groupsObj)
            console.log(message.chat.id)
            console.log(groupsObj[message.chat.id])
            bot.sendMessage(message.chat.id, `✅ This server had been registered with an ID of <b>${groupsObj[message.chat.id].id}</b>!`, { "parse_mode": "HTML" })
        }
    },
}