const groupsObj = require('../database/_groups.json')
const usersObj = require('../database/_users.json')
const testDate = require('../assets/convenientFunctions').testDate
const fs = require('fs')
module.exports = {
        data: {
                name: "updateabsence",
                description: "Update your member information",
                aliases: ["upabs"],
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
                const memberUnitObj = unitObj["members"][userGroups.memberName]
                const unitconfigObj = require(`../database/unitconfig/${groupsObj[message.chat.id].id}.js`).unitconfig
                var fields = require(`../database/unitconfig/${groupsObj[message.chat.id].id}.js`).unitconfig.memberAbsence
                if (!fields.includes("❌ Exit")) { fields.push("❌ Exit") }
                const keyboardValues = []
                var size = 4
                for (var i = 0; i < fields.length; i += size) {
                        keyboardValues.push(fields.slice(i, i + size));
                }

                const firstMsg = await bot.sendMessage(message.chat.id, `❓ Which absence would you like to change?`, {
                        "reply_markup": {
                                "keyboard": keyboardValues,
                                "one_time_keyboard": true,
                                "selective": true,
                                "force_reply": true,
                                "selective": true,
                                "resize_keyboard": true
                        },
                        "reply_to_message_id": message.message_id,
                        "parse_mode": "HTML"
                })
                keyboardValues.splice(0, keyboardValues.length)
                const firstReply = bot.onReplyToMessage(message.chat.id, firstMsg.message_id, async (msg) => {
                        bot.removeReplyListener(firstReply)
                        if (msg.text == "❌ Exit") { return bot.sendMessage(message.chat.id, '❌ Operation Cancelled!', { "parse_mode": "HTML" }) }
                        const fieldChange = msg.text.toLowerCase()
                        var fields = require(`../database/unitconfig/${groupsObj[message.chat.id].id}.js`).unitconfig.memberAbsence
                        if (!fields.includes(fieldChange)) { return bot.sendMessage(message.chat.id, '❌ That is not a valid absence!', { "parse_mode": "HTML" }) }
                        const configFields = unitconfigObj[fieldChange]
                        if (configFields) {
                                var size = 4
                                for (var i = 0; i < unitconfigObj[fieldChange].length; i += size) {
                                        keyboardValues.push(unitconfigObj[fieldChange].slice(i, i + size));
                                }
                        }
                        const secondMsg = await bot.sendMessage(message.chat.id, `Please enter your <b>${fieldChange}</b> in the following format:\n<i>Dates should be in DD/MM/YYYY</i>\n${fieldChange == "mc" ? "<i>You may write None for reason as nondisclosure</i>\n<i>You may put '0' for MC Number if you do not wish to disclose</i>\n<b>Reason:\nMC Number:\nStart Date:\nEnd Date:</b>" : fieldChange == "leave" ? "<b>Type of Leave <i>(Vacation, Off, Paternity, PmOff, etc):</i>\nStart Date:\nEnd Date:\nApproved By: (Only applicable for Off)</b>\n" : "<i>You may write None for reason as nondisclosure</i>\n<b>Reason:\nDate:\nTime:\nLocation:</b>"}`, {
                                "reply_markup": {
                                        "keyboard": keyboardValues,
                                        "one_time_keyboard": true,
                                        "force_reply": true,
                                        "selective": true,
                                        "resize_keyboard": true
                                },
                                "reply_to_message_id": msg.message_id,
                                "parse_mode": "HTML"
                        })
                        keyboardValues.splice(0, keyboardValues.length)

                        const secondReply = bot.onReplyToMessage(msg.chat.id, secondMsg.message_id, async (msg) => {
                                bot.removeReplyListener(secondReply)
                                var data = msg.text.split("\n").map(item => item.trim())

                                switch (fieldChange) {
                                        case "mc":
                                                if (!/[0-9]+/.test(data[1])) { return bot.sendMessage(message.chat.id, '❌ MC Number should only contain numbers!', { "parse_mode": "HTML" }) }
                                                if (!testDate(data[2]) || !testDate(data[3])) { return bot.sendMessage(message.chat.id, '❌ Invalid Date(s)!', { "parse_mode": "HTML" }) }
                                                break;
                                        case "leave":
                                                if (!testDate(data[1]) || !testDate(data[2])) { return bot.sendMessage(message.chat.id, '❌ Invalid Date(s)!', { "parse_mode": "HTML" }) }
                                                if ((data[0].toLowerCase() == "off" || data[0].toLowerCase() == "wfh" || data[0].toLowerCase() == "amoff" || data[0].toLowerCase() == "pmoff") && !data[3]) { return bot.sendMessage(message.chat.id, '❌ Off must be approved by someone!', { "parse_mode": "HTML" }) }
                                                break;
                                        case "ma":
                                                if (!testDate(data[1])) { return bot.sendMessage(message.chat.id, '❌ Invalid Date(s)!', { "parse_mode": "HTML" }) }
                                                if (!/[0-9]{4}/.test(data[2])) { return bot.sendMessage(message.chat.id, '❌ Time should only be 4 numbers!', { "parse_mode": "HTML" }) }
                                                if (!data[3]) { return bot.sendMessage(message.chat.id, '❌ Location should not be empty!', { "parse_mode": "HTML" }) }
                                                break;
                                        default:
                                                break;
                                }
                                const formatAbsence = unitconfigObj.formatAbsence
                                var absenceData = formatAbsence(data, message, fieldChange)
                                console.log(unitObj["absence"][userGroups.memberName])
                                unitObj["absence"][userGroups.memberName][fieldChange].push(absenceData)
                                

                                try {
                                        fs.writeFileSync(`./database/units/${groupsObj[message.chat.id].id}/${groupsObj[message.chat.id].id}.json`, JSON.stringify(unitObj, null, 4))
                                } catch (err) {
                                        console.log(err);
                                        return bot.sendMessage(message.chat.id, '❌⚠️ <b>Something went wrong. Please contact me! (ERROR: JSON_DB_WRITING)</b>\n', { "parse_mode": "HTML" })
                                }
                                return bot.sendMessage(message.chat.id, `✅ You have updated your <b>${fieldChange}</b> in <b>${groupsObj[message.chat.id].id}</b>\nDo /paradestate to check it out!`, { "parse_mode": "HTML" })
                        })
                })
        },
}