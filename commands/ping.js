module.exports = {
        data: {
                name: "ping",
                description: "Test if the bot is online and its latency.",
                aliases: [],
                usage: {},
                args: false,
                groupOnly: false,
                adminOnly: false,
        },
        async execute(bot, message, args) {
                var latency = message.date - (Date.now() / 1000)
                bot.sendMessage(message.chat.id, `🏓 Pong! (${latency.toFixed(1)} ms)`)
        },
}