const Users = require('../model/user')
module.exports = {
    data: {
        name: "users",
        description: "All CRUD (Create, Read, Update, Delete) actions to modify users other than yourself; For Admins",
        aliases: [],
        usage: {},
        args: false,
        groupOnly: true,
        adminOnly: true,
    },
    async execute(bot, message, args) {

    },
}