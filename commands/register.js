const groupsObj = require('../database/_groups.json')
const usersObj = require('../database/_users.json')
const fs = require('fs')
module.exports = {
    data: {
        name: "register",
        description: "Adds yourself to the Unit!",
        aliases: ['reg'],
        usage: {},
        args: false,
        groupOnly: true,
        adminOnly: false,
    },
    async execute(bot, message, args) {
        if (!(message.chat.id in groupsObj)) { return bot.sendMessage(message.chat.id, `❌ This group has not been initialised! Please perform /initialise`, { "parse_mode": "HTML" }) }
        const unitObj = require(`../database/units/${groupsObj[message.chat.id].id}/${groupsObj[message.chat.id].id}.json`)
        const unitconfig = require(`../database/unitconfig/${groupsObj[message.chat.id].id}.js`).unitconfig

        for (var member in unitObj["members"]) {
            if (unitObj["members"][member]["id"] == message.from.id) {
                return bot.sendMessage(message.chat.id, `❌ You are already registered to this group as <b>${member}</b>`, { "parse_mode": "HTML" })
            }
        }
        const firstMsg = await bot.sendMessage(message.chat.id, `❗ This will register you to <b>${groupsObj[message.chat.id].id} (${groupsObj[message.chat.id].name}).</b> Do you wish to proceed? You can enter anything else to exit`, {
            "reply_markup": {
                "keyboard": [["⭕ Yes", "❌ No"]],
                "one_time_keyboard": true,
                "selective": true,
                "force_reply": true,
                "selective": true,
            },
            "reply_to_message_id": message.message_id,
            "parse_mode": "HTML"
        })
        const firstReply = bot.onReplyToMessage(message.chat.id, firstMsg.message_id, async (msg) => {
            bot.removeReplyListener(firstReply)
            if (msg.text === '⭕ Yes') {
                var maskedData = unitconfig.maskFields(groupsObj[message.chat.id]["requiredFields"], unitconfig.fieldOrder)
                if (!(message.from.id in usersObj)) {
                    const secondMsg = await bot.sendMessage(message.chat.id, `❗ <b>Please provide us with some info about yourself!\nThis Unit has the following required fields: ${groupsObj[message.chat.id]["requiredFields"]}\nOthers are optional!</b>\n<i>Please leave an X in description if you do not wish to disclose some information.</i> \nEnter the details in the following format:\n<b>Name</b> (does not have to be official; required):\n<b>Masked IC</b> (last 4 characters; eg. 789Z):\n<b>Birthday</b> (YYYY-MM-DD):\n<b>Contact</b> (optional country code; eg. +6598761234):\n<b>Description of yourself</b> (try not to get in trouble over this one; 400 characters max):`, {
                        "reply_markup": {
                            "force_reply": true,
                            "selective": true,
                        },
                        "reply_to_message_id": msg.message_id,
                        "parse_mode": "HTML"
                    })
                    const secondReply = bot.onReplyToMessage(msg.chat.id, secondMsg.message_id, async (msg) => {
                        bot.removeReplyListener(secondReply)
                        const data = msg.text.split("\n")
                        for (i in data) {
                            if (maskedData[i] && !data[i]) { return bot.sendMessage(message.chat.id, `❌ Missing values! (missing: ${maskedData[i]})`, { "parse_mode": "HTML" }) }
                        }

                        if (!/[0-9]{3}[a-zA-z]{1}$/.test(data[1])) { return bot.sendMessage(message.chat.id, '❌ Masked IC not in correct format!', { "parse_mode": "HTML" }) }
                        if (!/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(data[2])) { return bot.sendMessage(message.chat.id, '❌ Birthday not in YYYY-MM-DD format!', { "parse_mode": "HTML" }) }
                        if (!/^\+?[0-9]{7,}$/.test(data[3])) { return bot.sendMessage(message.chat.id, '❌ Phone number invalid!', { "parse_mode": "HTML" }) }
                        if (data[4] && data[4].length > 400) { return bot.sendMessage(message.chat.id, `❌ Description too long! (current:${data[4].length} characters)`, { "parse_mode": "HTML" }) }
                        usersObj[message.from.id] = {
                            "name": data[0] ? data[0] : `${message.from.first_name}${message.from.last_name}`,
                            "maskedic": data[1] ? data[1] : "",
                            "birthday": data[2] ? data[2] : "",
                            "contact": data[3] ? data[3] : "",
                            "description": data[4] ? data[4] : "None",
                            "primaryGroup": message.chat.id,
                            "inGroups": {
                                [message.chat.id]: {
                                    "joinedDate": Date.now(),
                                    "isAdmin?": false,
                                }
                            }
                        }

                        const memberInfo = unitconfig.formatMemberData(usersObj[message.from.id], message)
                        unitObj["members"][Object.keys(memberInfo)[0]] = memberInfo[Object.keys(memberInfo)[0]]
                        if (usersObj[message.from.id]["primaryGroup"] === null) { usersObj[message.from.id]["primaryGroup"] = message.chat.id }
                        usersObj[message.from.id]['inGroups'][message.chat.id] = {
                            "memberName": Object.keys(memberInfo)[0],
                            "joinedDate": Date.now(),
                            "isAdmin?": false,
                        }

                        unitObj['absence'][Object.keys(memberInfo)[0]] = { "mc": [], "leave": [], "ma": [] }

                        try {
                            fs.writeFileSync(`./database/units/${groupsObj[message.chat.id].id}/${groupsObj[message.chat.id].id}.json`, JSON.stringify(unitObj, null, 4))
                            fs.writeFileSync(`./database/_users.json`, JSON.stringify(usersObj, null, 4))
                        } catch (err) {
                            console.log(err);
                            return bot.sendMessage(message.chat.id, '❌⚠️ <b>Something went wrong. Please contact me! (ERROR: JSON_DB_WRITING)</b>\n', { "parse_mode": "HTML" })
                        }

                        return bot.sendMessage(message.chat.id, `✅ You have been registered to ${groupsObj[message.chat.id].id}\nFill in the rest of the info with /updatemember!`)
                    })

                } else {
                    var addInfo = []
                    for (var i in maskedData) {
                        if (maskedData[i] && !usersObj[message.from.id][maskedData[i]]) { addInfo.push(maskedData[i]) }
                    }
                    if (addInfo.length) {
                        const addInfoMsg = await bot.sendMessage(message.chat.id, `❗ <b>This unit requires more data from you!\nThis Unit has the following required fields: ${groupsObj[message.chat.id]["requiredFields"]}\nOthers are optional!</b>\n<i>You may leave rows blank if you do not wish to disclose.</i> \nEnter the details in the following format:${addInfo.includes("name") ? "\n<b>Name</b> (does not have to be official; required):" : ''}${addInfo.includes("maskedic") ? "\n<b>Masked IC</b> (last 4 characters; eg. 789Z):" : ''}${addInfo.includes("birthday") ? "\n<b>Birthday</b> (YYYY-MM-DD):" : ''}${addInfo.includes("contact") ? "\n<b>Contact</b> (optional country code; eg. +6598761234):" : ''}${addInfo.includes("description") ? "\n<b>Description of yourself</b> (try not to get in trouble over this one; 400 characters max):" : ''}`, {
                            "reply_markup": {
                                "force_reply": true,
                                "selective": true,
                            },
                            "reply_to_message_id": msg.message_id,
                            "parse_mode": "HTML"
                        })
                        const secondReply = bot.onReplyToMessage(msg.chat.id, addInfoMsg.message_id, async (msg) => {
                            bot.removeReplyListener(secondReply)
                            const data = msg.text.split("\n")
                            for (i in data) {
                                if (addInfo[i] && !data[i]) { return bot.sendMessage(message.chat.id, `❌ Missing values! (missing: ${addInfo[i]})`, { "parse_mode": "HTML" }) }
                                if ((addInfo[i] == "maskedic") && !/[0-9]{3}[a-zA-z]{1}$/.test(data[i])) { return bot.sendMessage(message.chat.id, '❌ Masked IC not in correct format!', { "parse_mode": "HTML" }) }
                                else if (addInfo[i] == "maskedic") { usersObj[message.from.id][addInfo[i]] = data[i] }
                                if ((addInfo[i] == "birthday") && !/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(data[i])) { return bot.sendMessage(message.chat.id, '❌ Birthday not in YYYY-MM-DD format!', { "parse_mode": "HTML" }) }
                                else if (addInfo[i] == "birthday") { usersObj[message.from.id][addInfo[i]] = data[i] }
                                if ((addInfo[i] == "contact") && !/^\+?[0-9]{7,}$/.test(data[i])) { return bot.sendMessage(message.chat.id, '❌ Phone number invalid!', { "parse_mode": "HTML" }) }
                                else if (addInfo[i] == "contact") { usersObj[message.from.id][addInfo[i]] = data[i] }
                                console.log("data4" + data[4])
                                if ((addInfo[i] == "description") && (data[4] && data[4].length > 400)) { return bot.sendMessage(message.chat.id, `❌ Description too long! (current:${data[i].length} characters)`, { "parse_mode": "HTML" }) }
                                else if (addInfo[i] == "description") { usersObj[message.from.id][addInfo[i]] = data[i] }
                            }

                            const memberInfo = unitconfig.formatMemberData(usersObj[message.from.id], message)
                            unitObj["members"][Object.keys(memberInfo)[0]] = memberInfo[Object.keys(memberInfo)[0]]
                            if (usersObj[message.from.id]["primaryGroup"] === null) { usersObj[message.from.id]["primaryGroup"] = message.chat.id }
                            usersObj[message.from.id]['inGroups'][message.chat.id] = {
                                "memberName": Object.keys(memberInfo)[0],
                                "joinedDate": Date.now(),
                                "isAdmin?": false,
                            }

                            unitObj['absence'][Object.keys(memberInfo)[0]] = { "mc": [], "leave": [], "ma": [] }
                            const p = { "mc": [], "leave": [], "ma": [] }
                            try {
                                fs.writeFileSync(`./database/units/${groupsObj[message.chat.id].id}/${groupsObj[message.chat.id].id}.json`, JSON.stringify(unitObj, null, 4))
                                fs.writeFileSync(`./database/_users.json`, JSON.stringify(usersObj, null, 4))
                            } catch (err) {
                                console.log(err);
                                return bot.sendMessage(message.chat.id, '❌⚠️ <b>Something went wrong. Please contact me! (ERROR: JSON_DB_WRITING)</b>\n', { "parse_mode": "HTML" })
                            }
                            return bot.sendMessage(message.chat.id, `✅ You have been registered to ${groupsObj[message.chat.id].id}\nFill in the rest of the info with /updatemember!`)

                        })

                    }
                    else {
                        const memberInfo = unitconfig.formatMemberData(usersObj[message.from.id], message)
                        unitObj["members"][Object.keys(memberInfo)[0]] = memberInfo[Object.keys(memberInfo)[0]]
                        if (usersObj[message.from.id]["primaryGroup"] === null) { usersObj[message.from.id]["primaryGroup"] = message.chat.id }
                        usersObj[message.from.id]['inGroups'][message.chat.id] = {
                            "memberName": Object.keys(memberInfo)[0],
                            "joinedDate": Date.now(),
                            "isAdmin?": false,
                        }

                        unitObj['absence'][Object.keys(memberInfo)[0]] = { "mc": [], "leave": [], "ma": [] }

                        try {
                            fs.writeFileSync(`./database/units/${groupsObj[message.chat.id].id}/${groupsObj[message.chat.id].id}.json`, JSON.stringify(unitObj, null, 4))
                            fs.writeFileSync(`./database/_users.json`, JSON.stringify(usersObj, null, 4))
                        } catch (err) {
                            console.log(err);
                            return bot.sendMessage(message.chat.id, '❌⚠️ <b>Something went wrong. Please contact me! (ERROR: JSON_DB_WRITING)</b>\n', { "parse_mode": "HTML" })
                        }
                        return bot.sendMessage(message.chat.id, `✅ You have been registered to ${groupsObj[message.chat.id].id}\nFill in the rest of the info with /updatemember!`)
                    }
                }
            }
        })

    },
}