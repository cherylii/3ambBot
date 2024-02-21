const groupsObj = require('../database/_groups.json')
const usersObj = require('../database/_users.json')
const testDate = require('../assets/convenientFunctions').testDate
const fs = require('fs')
module.exports = {
    data: {
        name: "deleteabsence",
        description: "Update your member information",
        aliases: ["delabs"],
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

        const firstMsg = await bot.sendMessage(message.chat.id, `❓ Which absence type would you like to delete?`, {
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

            const absenceFields = []
            var absenceUnitObj = unitObj["absence"][userGroups.memberName][fieldChange]
            var output = ""
            for (i in absenceUnitObj) {
                switch (fieldChange) {
                    case "mc":
                        output += `<b>${Number(i) + 1}:</b>\t${absenceUnitObj[i]["reason"]} FROM ${absenceUnitObj[i]["startdate"]} TO ${absenceUnitObj[i]["enddate"]}\n`
                        break;
                    case "leave":
                        output += `<b>${Number(i) + 1}:</b>\t${absenceUnitObj[i]["leavetype"]} FROM ${absenceUnitObj[i]["startdate"]} TO ${absenceUnitObj[i]["enddate"]}\n`
                        break;
                    case "ma":
                        output += `<b>${Number(i) + 1}:</b>\t${absenceUnitObj[i]["reason"]} ON ${absenceUnitObj[i]["date"]} ${absenceUnitObj[i]["enddate"]}HRS AT ${absenceUnitObj[i]["location"]}\n`
                        break;
                }
                absenceFields.push((Number(i) + 1).toString())
            }
            if (!absenceFields.includes("❌ Exit")) { absenceFields.push("❌ Exit") }
            if (absenceFields.length) {
                var size = 4
                for (var i = 0; i < absenceFields.length; i += size) {
                    keyboardValues.push(absenceFields.slice(i, i + size));
                }
            }
            const secondMsg = await bot.sendMessage(message.chat.id, `❓ Which ${fieldChange} would you like to delete?\n\n${output}`, {
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
                if (msg.text == "❌ Exit") { return bot.sendMessage(message.chat.id, '❌ Operation Cancelled!', { "parse_mode": "HTML" }) }
                if (!absenceFields.includes(msg.text)) { return bot.sendMessage(message.chat.id, '❌ Invalid Input!', { "parse_mode": "HTML" }) }

                unitObj["absence"][userGroups.memberName][fieldChange].splice(Number(msg.text) - 1, 1)

                try {
                    fs.writeFileSync(`./database/units/${groupsObj[message.chat.id].id}/${groupsObj[message.chat.id].id}.json`, JSON.stringify(unitObj, null, 4))
                } catch (err) {
                    console.log(err);
                    return bot.sendMessage(message.chat.id, '❌⚠️ <b>Something went wrong. Please contact me! (ERROR: JSON_DB_WRITING)</b>\n', { "parse_mode": "HTML" })
                }
                return bot.sendMessage(message.chat.id, `✅ You have deleted your <b>${fieldChange}</b> in <b>${groupsObj[message.chat.id].id}</b>\nDo /memberinfo to check it out!`, { "parse_mode": "HTML" })
            })
        })
    },
}