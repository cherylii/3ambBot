#!/usr/bin/env node
const schedule = require('node-schedule')
const TelegramBot = require('node-telegram-bot-api')
const { Collection } = require('@discordjs/collection')
const path = require('path')
const fs = require('fs')

const locale = 'en-uk'
const m = require(`./locale/${locale}.json`)
const apiKey = require('./assets/apikey.json')
const prefix = require('./assets/config.json').prefix
const botUsername = require('./assets/config.json').botUsername

const groupsObj = require('./database/_groups.json')

const bot = new TelegramBot(apiKey.telegramBot, { polling: true })
bot.commands = new Collection()

const commandFolder = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandFolder).filter(file => file.endsWith('.js'));

for (var file of commandFiles) {
    var filePath = path.join(commandFolder, file)
    var command = require(filePath);

    if ('data' in command && 'execute' in command) {
        bot.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

schedule.scheduleJob('0 0 * * *', () => {
    console.log("reset")
    fs.readdir("./database/units", (err, files) => {
        if (err)
            console.log(err);
        else {
            files.forEach(file => {
                if (!file.startsWith("_")) {
                    var unitObj = require(`./database/units/${file}/${file}.json`)
                    unitObj["paradeState"] = {
                        "present": [],
                        "mc": [],
                        "leave": [],
                        "awol": [],
                        "ma": [],
                        "inCharge": []
                    }
                    fs.writeFileSync(path.join(__dirname, `./database/units/${file}/${file}.json`), JSON.stringify(unitObj, null, 4))
                }
            })
        }
    })
})

bot.on('message', async (msg) => {
    if (!msg.text) return
    if (!msg.text.startsWith(prefix) && !msg.text.startsWith(`@${botUsername}`) || msg.from.is_bot) return

    const messageChat = msg.chat, messageText = msg.text, messageAuthor = msg.from
    const args = messageText.startsWith(`@${botUsername}`) ? messageText.slice(`@${botUsername}`.length).trim().split(/ +/) : messageText.slice(prefix.length).trim().split(/ +/)
    var commandName = args.shift().toLowerCase()

    if (commandName.trim().toLowerCase().endsWith(`@${botUsername}`.toLowerCase())) { commandName = commandName.slice(0, (commandName.length - `@${botUsername}`.length)) }

    const command = bot.commands.get(commandName) || bot.commands.find(cmd => cmd.data.aliases && cmd.data.aliases.includes(commandName) && cmd.data.aliases != "")
    if (!command) return

    if (command.data.args && !args.length) {
        let argsReply = `❌ I need arguments for this command.`

        if (command.data.usage) {
            var outputUsage = Object.keys(command.data.usage).join(" ")
            argsReply += `\n\nYou should use it like this!\n\"${prefix} ${command.data.name} ${outputUsage}\"`
        }

        return bot.sendMessage(messageChat.id, argsReply, { "parse_mode": "HTML" })
    }

    if (command.data.groupOnly && messageChat.type === 'private') {
        return bot.sendMessage(messageChat.id, "❌ I can\'t execute that command in Private Chats!", { "parse_mode": "HTML" })
    }

    if (command.data.adminOnly && (messageChat.id in groupsObj) && !groupsObj[messageChat.id]?.admins.includes(messageAuthor.id)) {
        return bot.sendMessage(messageChat.id, "❌ You do not have Permission to run this command! (Admin Only)", { "parse_mode": "HTML" })
    }

    try {
        await command.execute(bot, msg, args)
    } catch (error) {
        console.error(error);
        bot.sendMessage(messageChat.id, '❌⚠️ <b>Something went wrong. Please contact me! (ERROR: GENERAL_FATAL_ERROR)</b>', { "parse_mode": "HTML" })
    }

});