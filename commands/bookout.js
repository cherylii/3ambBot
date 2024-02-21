const groupsObj = require('../database/_groups.json')
const usersObj = require('../database/_users.json')
const fs = require('fs')
module.exports = {
        data: {
                name: "bookout",
                description: "Check out your attendance when you book out!",
                aliases: ["out"],
                usage: {},
                args: false,
                groupOnly: true,
                adminOnly: false,
        },
        async execute(bot, message, args) {
                if (!(message.chat.id in groupsObj)) { return bot.sendMessage(message.chat.id, `❌ This group has not been initialised! Please perform /initialise`, { "parse_mode": "HTML" }) }

                

                if (!usersObj[message.from.id] || !usersObj[message.from.id]["inGroups"][message.chat.id]) {
                        return bot.sendMessage(message.chat.id, `❌ You have not registered to <b>${groupsObj[message.chat.id].id}</b>! Perform a /register to join this unit!`, { "parse_mode": "HTML" })

                }

                const userGroups = (usersObj[message.from.id]["inGroups"][message.chat.id])
                const unitObj = require(`../database/units/${groupsObj[message.chat.id].id}/${groupsObj[message.chat.id].id}.json`)
                const presentList = unitObj["paradeState"]["present"]

                if (!presentList.includes(userGroups["memberName"])) {
                        return bot.sendMessage(message.chat.id, `❌ You are not booked in to <b>${groupsObj[message.chat.id].id}</b>!`, { "parse_mode": "HTML" })
                }

                if (presentList.indexOf(userGroups["memberName"]) !== -1) { presentList.splice(presentList.indexOf(userGroups["memberName"]), 1); }

                try {
                        fs.writeFileSync(`./database/units/${groupsObj[message.chat.id].id}/${groupsObj[message.chat.id].id}.json`, JSON.stringify(unitObj, null, 4))
                } catch (err) {
                        console.log(err);
                        return bot.sendMessage(message.chat.id, '❌⚠️ <b>Something went wrong. Please contact me! (ERROR: JSON_DB_WRITING)</b>\n', { "parse_mode": "HTML" })
                }

                return bot.sendMessage(message.chat.id, `✅ You have booked out from <b>${groupsObj[message.chat.id].id}</b>!`, { "parse_mode": "HTML" })
        },
}