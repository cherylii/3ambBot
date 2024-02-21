const groupsObj = require('../database/_groups.json')
const usersObj = require('../database/_users.json')
const fs = require('fs')
module.exports = {
        data: {
                name: "listmember",
                description: "List all members and their UID in this group!",
                aliases: ["lsmemb"],
                usage: {},
                args: false,
                groupOnly: true,
                adminOnly: false,
        },
        async execute(bot, message, args) {
                if (!(message.chat.id in groupsObj)) { return bot.sendMessage(message.chat.id, `❌ This group has not been initialised! Please perform /initialise`, { "parse_mode": "HTML" }) }

                var output = "<b>List of members</b>\n\n"
                const unitObj = require(`../database/units/${groupsObj[message.chat.id].id}/${groupsObj[message.chat.id].id}.json`)
                
                for (member in unitObj["members"]) {
                    output += `${member}: \t${unitObj["members"][member]["rank"] || "NOT-SET"} ${unitObj["members"][member]["name"]}\n`
                }
                if (!Object.keys(unitObj["members"]).length) {return bot.sendMessage(message.chat.id, `❌ This group has no members!`, { "parse_mode": "HTML" })}
                return bot.sendMessage(message.chat.id, output, { "parse_mode": "HTML" })
        },
}