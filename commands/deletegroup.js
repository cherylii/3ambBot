const fs = require('fs')
const path = require('path')
const groupsObj = require('../database/_groups.json')
const usersObj = require('../database/_users.json')
module.exports = {
    data: {
        name: "deletegroup",
        description: "Testing Function to de-initialise group",
        aliases: ['delgrp'],
        usage: {},
        args: false,
        groupOnly: true,
        adminOnly: true,
    },
    async execute(bot, message, args) {
        if (message.from.id != "6476886611") return
        if (message.chat.id in groupsObj) {
            for (var member of groupsObj[message.chat.id].allMembers) {
                if (usersObj[member]["primaryGroup"] === message.chat.id) { usersObj[member]["primaryGroup"] = null }
                delete usersObj[member]["inGroups"][message.chat.id]
            }
            try {
                fs.rm(path.join(__dirname, `../database/units/${groupsObj[message.chat.id].id}`), { recursive: true }, (err) => {
                    if (err) console.log(err)
                })
                delete groupsObj[message.chat.id]
                fs.writeFileSync(path.join(__dirname, `../database/_groups.json`), JSON.stringify(groupsObj, null, 4))
                fs.writeFileSync(path.join(__dirname, `../database/_users.json`), JSON.stringify(usersObj, null, 4))
            }

            catch (err) {
                console.log(err)
            }

            return bot.sendMessage(message.chat.id, `✅ Done!`, { "parse_mode": "HTML" })
        }
        return bot.sendMessage(message.chat.id, `❌ Failed!`, { "parse_mode": "HTML" })
    },
}