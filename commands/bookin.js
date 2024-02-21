const groupsObj = require('../database/_groups.json')
const usersObj = require('../database/_users.json')
const fs = require('fs')
module.exports = {
        data: {
                name: "bookin",
                description: "Check in your attendance when you book in!",
                aliases: ["in"],
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
                const unitconfigObj = require(`../database/unitconfig/${groupsObj[message.chat.id].id}.js`).unitconfig
                const unitObj = require(`../database/units/${groupsObj[message.chat.id].id}/${groupsObj[message.chat.id].id}.json`)
                const presentList = unitObj["paradeState"]["present"]
                const memberUnitObj = unitObj["members"][userGroups.memberName]

                if (presentList.includes(userGroups["memberName"])) {
                        return bot.sendMessage(message.chat.id, `❌ You have already booked in to <b>${groupsObj[message.chat.id].id}</b>!`, { "parse_mode": "HTML" })
                }

                if (unitconfigObj.checkAbsence(userGroups.memberName, unitObj, message)) { return bot.sendMessage(message.chat.id, `❌ You cannot book-in when you are on MC/LEAVE/MA!`, { "parse_mode": "HTML" }) }

                presentList.push(userGroups["memberName"])
                try {
                        fs.writeFileSync(`./database/units/${groupsObj[message.chat.id].id}/${groupsObj[message.chat.id].id}.json`, JSON.stringify(unitObj, null, 4))
                } catch (err) {
                        console.log(err);
                        return bot.sendMessage(message.chat.id, '❌⚠️ <b>Something went wrong. Please contact me! (ERROR: JSON_DB_WRITING)</b>\n', { "parse_mode": "HTML" })
                }

                return bot.sendMessage(message.chat.id, `✅ You have booked in to <b>${groupsObj[message.chat.id].id}</b>!`, { "parse_mode": "HTML" })

        },
}