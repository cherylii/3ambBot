const groupsObj = require('../database/_groups.json')
const usersObj = require('../database/_users.json')
const testDate = require('../assets/convenientFunctions').testDate
const fs = require('fs')
module.exports = {
        data: {
                name: "updatemember",
                description: "Update your member information",
                aliases: ["upmemb"],
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
                var fields = require(`../database/unitconfig/${groupsObj[message.chat.id].id}.js`).unitconfig.memberUpdatableInfo
                if (!fields.includes("❌ Exit")) { fields.push("❌ Exit") }
                const keyboardValues = []
                var size = 4
                for (var i = 0; i < fields.length; i += size) {
                        keyboardValues.push(fields.slice(i, i + size));
                }

                const firstMsg = await bot.sendMessage(message.chat.id, `❓ Which detail would you like to change?`, {
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
                        var fields = require(`../database/unitconfig/${groupsObj[message.chat.id].id}.js`).unitconfig.memberUpdatableInfo
                        if (!fields.includes(fieldChange)) { return bot.sendMessage(message.chat.id, '❌ That is not a valid detail!', { "parse_mode": "HTML" }) }
                        const configFields = unitconfigObj[fieldChange]
                        if (configFields) {
                                var size = 4
                                for (var i = 0; i < unitconfigObj[fieldChange].length; i += size) {
                                        keyboardValues.push(unitconfigObj[fieldChange].slice(i, i + size));
                                }
                        }
                        const oldValue = memberUnitObj[fieldChange]
                        const secondMsg = await bot.sendMessage(message.chat.id, `What would you like to change it to?\nCurrent Value: <b>${oldValue}</b>${fieldChange == "medicalstatus" ? "\nPlease follow the following format: <b>Excuse (StartDate - EndDate)</b>\n<i>You can write \"Permanent\" in the brackets if applicable\nDates should be in DD/MM/YYYY</i>" : ""}`, {
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
                                var data = msg.text

                                switch (fieldChange) {
                                        case "nric":
                                                if (!/[tsTSX]{1}[0-9X]{4}[0-9]{3}[a-zA-z]{1}$/.test(data)) { return bot.sendMessage(message.chat.id, '❌ NRIC not in correct format!\n<i>You can mask values with "X"</i>', { "parse_mode": "HTML" }) }
                                                break;
                                        case "contact":
                                                if (!/^\+?[0-9]{7,}$/.test(data)) { return bot.sendMessage(message.chat.id, '❌ Phone number invalid!', { "parse_mode": "HTML" }) }
                                                break;
                                        case "rank":
                                                if (!configFields.includes(data.toUpperCase())) { return bot.sendMessage(message.chat.id, '❌ Rank invalid!', { "parse_mode": "HTML" }) }
                                                break;
                                        case "branch":
                                                if (!configFields.includes(data.toUpperCase())) { return bot.sendMessage(message.chat.id, '❌ Branch invalid!', { "parse_mode": "HTML" }) }
                                                break;
                                        case "medicalstatus":
                                                if (!/.+\(.+\-.+\)/.test(data)) {
                                                        if (!data.toLowerCase().includes("permanent")) { return bot.sendMessage(message.chat.id, '❌ Invalid Format!', { "parse_mode": "HTML" }) }
                                                }
                                                var permflag = false
                                                var duration = data.substring(data.indexOf("(") + 1, data.lastIndexOf(")"))
                                                if (duration.toLowerCase() == "permanent") {
                                                        permflag = true
                                                } else {
                                                        var dates = duration.trim().split(/\s*-\s*/)
                                                        for (var date of dates) {
                                                                if (!testDate(date)) { return bot.sendMessage(message.chat.id, '❌ Invalid Date(s)!', { "parse_mode": "HTML" }) }
                                                        }
                                                }
                                                for (var i in memberUnitObj["medicalstatus"]) {
                                                        if (memberUnitObj["medicalstatus"][i]["name"] == data.substring(0, data.indexOf("(")).trim()) {
                                                                memberUnitObj["medicalstatus"].splice(i, 1)
                                                        }
                                                }
                                                data = {
                                                        "name": data.substring(0, data.indexOf("(")).trim(),
                                                        "startDate": permflag ? null : dates[0],
                                                        "endDate": permflag ? null : dates[1],
                                                        "isPermanent?": permflag ? "true" : "false"
                                                }
                                                break;
                                        default:
                                                break;
                                }

                                if (Array.isArray(memberUnitObj[fieldChange])) {
                                        memberUnitObj[fieldChange].push(data)
                                } else { memberUnitObj[fieldChange] = data }

                                try {
                                        fs.writeFileSync(`./database/units/${groupsObj[message.chat.id].id}/${groupsObj[message.chat.id].id}.json`, JSON.stringify(unitObj, null, 4))
                                } catch (err) {
                                        console.log(err);
                                        return bot.sendMessage(message.chat.id, '❌⚠️ <b>Something went wrong. Please contact me! (ERROR: JSON_DB_WRITING)</b>\n', { "parse_mode": "HTML" })
                                }
                                return bot.sendMessage(message.chat.id, `✅ You have updated your <b>${fieldChange}</b> in <b>${groupsObj[message.chat.id].id}</b>`, { "parse_mode": "HTML" })
                        })
                })
        },
}