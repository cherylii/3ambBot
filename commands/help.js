module.exports = {
    data: {
        name: "help",
        description: "Help command that can give more information about each command.",
        aliases: [],
        usage: {
            "<command name>": "Specific command you would like to check.",
        },
        args: false,
        groupOnly: false,
        adminOnly: false,
    },
    async execute(bot, message, args) {
        bot.sendMessage(message.chat.id, `❗ Please do /register to start using the bot! Afterwards you can do any of the following commands down below to update your statuses!\n\n<b>Initialising Commands</b>\n/initialise - Initialises the group for attendance taking. Only used when creating the group.(only one user)\n/register - Registers yourself to the group for attendance taking. (every user)\n\n<b>General Commands</b>\n/in - Mark yourself as Present\n/out - Mark yourself as Absent\n/updateabsence - Add an MC/LEAVE/MA. Put OFF/AMOFF/PMOFF in Absence Type of Leave to specify off\n/updatemember - Add information to your member profile!\n/deleteabsence - Delete an MC/LEAVE/MA\n/listmember - List all the members in the Group`, { "parse_mode": "HTML" })
    },
}