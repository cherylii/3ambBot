const fs = require('fs')
const path = require('path')
const makeid = require('../assets/convenientFunctions').makeid
const groupsObj = require('../database/_groups.json')
module.exports = {
    data: {
        name: "initialise",
        description: "Initialises the bot to create the database for your unit.",
        aliases: ['init'],
        usage: {},
        args: false,
        groupOnly: true,
        adminOnly: false,
    },
    async execute(bot, message, args) {
        if ((message.chat.id in groupsObj)) { return bot.sendMessage(message.chat.id, `❌ Group has already been Initialised as <b>${groupsObj[message.chat.id].id}</b>!`, { "parse_mode": "HTML" }) }
        const firstMsg = await bot.sendMessage(message.chat.id, `❗ This will initialise the bot in the group <b>${message.chat.title} (${message.chat.id}).</b> Do you wish to proceed? You can enter anything else to exit`, {
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
                const secondMsg = await bot.sendMessage(message.chat.id, '❗ <b>Please enter the details of your Unit in the following format:</b>\n<i>Please use Alphanumeric characters only\nYou need not include the headers</i>\n<b>ID of Unit</b> (something short and easily typeable. No Spaces.):\n<b>Name of Unit</b> (full name will do fine):\n<b>Required Fields</b> (refer to "/help initialise" for more info; comma separated; optional; changable):', {
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
                    var minimumLength = 2
                    if ((data.length < minimumLength)) { return bot.sendMessage(message.chat.id, `❌ Too little Inputs! (Expected: ${minimumLength}) Cancelled the Operation.`, { "parse_mode": "HTML" }) }
                    for (var i in data) {
                        if (i == 2) continue
                        d = data[i].trim()
                        if (!(/^[a-zA-Z0-9\s]+$/.test(d))) { return bot.sendMessage(message.chat.id, '❌ Inputs are not Alphanumeric! Cancelled the Operation.', { "parse_mode": "HTML" }) }
                    }
                    if (/\s/.test(data[0].trim())) { return bot.sendMessage(message.chat.id, '❌ ID has spaces! Cancelled the Operation.', { "parse_mode": "HTML" }) }
                    const fields = data[2]?.trim().split(/,/)
                    const availableFields = require(`../database/unitconfig/${data[0].trim()}.js`).unitconfig.availableFields
                    if (fields.length) {
                        for (field of fields) {
                            if (!availableFields.includes(field.trim().toLowerCase())) { return bot.sendMessage(message.chat.id, '❌ Fields are invalid. Please check "/help initialise" for more info', { "parse_mode": "HTML" }) }
                        }
                    }
                    if (Object.keys(groupsObj).length) {
                        for (var group in groupsObj) {
                            currgroup = groupsObj[group]
                            if (currgroup["id"] == data[0].trim()) {
                                return bot.sendMessage(message.chat.id, '❌ Another group with the same id exists! Choose another ID!', { "parse_mode": "HTML" })
                            }
                        }
                    }

                    groupsObj[message.chat.id] = {
                        "id": data[0].trim(),
                        "name": data[1].trim(),
                        "admins": [
                            message.from.id
                        ],
                        "allMembers": [
                            message.from.id
                        ],
                        "database": `${makeid(8)}-${data[0].trim()}`,
                        "dateCreated": Date.now(),
                        "requiredFields": []
                    }
                    const unitsObj = {
                        "members": {},
                        "paradeState": {
                            "present": [],
                            "mc": [],
                            "leave": [],
                            "awol": [],
                            "ma": [],
                            "inCharge": []
                        },
                        "absence": {},
                        "pastParadeState": {},
                        "pastAbsence": {}
                    }
                    for (var field of fields) { groupsObj[message.chat.id]["requiredFields"].push(field.trim().toLowerCase()) }

                    try {
                        if (!fs.existsSync(path.join(__dirname, `../database/units/${groupsObj[message.chat.id].id}`))) {
                            fs.mkdirSync(path.join(__dirname, `../database/units/${groupsObj[message.chat.id].id}`))
                        }
                        fs.writeFileSync(path.join(__dirname, `../database/units/${groupsObj[message.chat.id].id}/${groupsObj[message.chat.id].id}.json`), JSON.stringify(unitsObj, null, 4))
                        fs.writeFileSync(path.join(__dirname, `../database/_groups.json`), JSON.stringify(groupsObj, null, 4))
                    }
                    catch (err) {
                        console.log(err);
                        return bot.sendMessage(message.chat.id, '❌⚠️ <b>Something went wrong. Please contact me! (ERROR: JSON_DB_WRITING)</b>\n', { "parse_mode": "HTML" })
                    }

                    return bot.sendMessage(message.chat.id, '✅ Initialised the Group')

                })
            }

            else {
                return await bot.sendMessage(message.chat.id, '❌ Cancelled the Operation')
            }

        })
    }
}
