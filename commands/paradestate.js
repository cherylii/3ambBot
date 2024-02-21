const groupsObj = require('../database/_groups.json')
const usersObj = require('../database/_users.json')
module.exports = {
    data: {
        name: "paradestate",
        description: "Shows the current Parade State of any unit you are registered in; Only Available for Unit of Current Registered Group; Returns None if used in Unregistered Group without arguments.",
        aliases: ['ps'],
        usage: {
            "<Unit ID>": "ID of unit you want to check; Non-Registered Groups Only."
        },
        args: false,
        groupOnly: false,
        adminOnly: false,
    },
    async execute(bot, message, args) {
        if (!(message.chat.id in groupsObj)) { return bot.sendMessage(message.chat.id, `❌ This group has not been initialised! Please perform /initialise`, { "parse_mode": "HTML" }) }

        if (!usersObj[message.from.id] || !usersObj[message.from.id]["inGroups"][message.chat.id]) {
            return bot.sendMessage(message.chat.id, `❌ You have not registered to <b>${groupsObj[message.chat.id].id}</b>! Perform a /register to join this unit!`, { "parse_mode": "HTML" })
        }
        const userGroups = (usersObj[message.from.id]["inGroups"][message.chat.id])
        const formatParadeOutput = require(`../database/unitconfig/${groupsObj[message.chat.id].id}.js`).unitconfig.formatParadeOutput
        const unitObj = require(`../database/units/${groupsObj[message.chat.id].id}/${groupsObj[message.chat.id].id}.json`)
        const paradeOutput = formatParadeOutput(unitObj, message)
        
        bot.sendMessage(message.chat.id, paradeOutput, { "parse_mode": "HTML" })
    },
}

/*
37th LOCC Parade State
Updated As Of: Tuesday 5 Dec 2023, 19:40 H

Plt 1: 23/33
Plt 2: 29/35

Attend C:
Platoon 1:
PTE XXXXXXX 1104
[ From 3-Dec-2023 To 5-Dec-2023]
[ From 6-Dec-2023 To 8-Dec-2023]

LCP XXXXXXX 1106
[ From 3-Dec-2023 To 5-Dec-2023]
[ From 5-Dec-2023 To 8-Dec-2023]

PTE XXXXX 1203
[ From 4-Dec-2023 To 5-Dec-2023]
[ From 5-Dec-2023 To 6-Dec-2023]

LCP XXXXXXX 1207
[ From 3-Dec-2023 To 5-Dec-2023]

ME3 XXXXXXX 1306
[ From 3-Dec-2023 To 5-Dec-2023]

ME1 XXXXXXX 1310
[ From 4-Dec-2023 To 5-Dec-2023]

Platoon 2:
LCP XXXXXX 2402
[ From 4-Dec-2023 To 5-Dec-2023]

ME2 XXXXXX 2606
[ From 5-Dec-2023 To 6-Dec-2023]

PTE XXXXXX 2610
[ From 4-Dec-2023 To 6-Dec-2023]


Upcoming Appointments:
Platoon 1:
ME3 XXXXXX 1103
[Dr Consult (Remove Suturing) on 5-Dec-2023, 14:20 H @ CCK Polyclinic]

Platoon 2:


Medical Statuses:
Platoon 1:
PTE XXXXXX 1103
[Excuse Upper Limb Activities From 27-Nov-2023 To 6-Dec-2023]

Platoon 2:
LCP XXXXXX 2407
[Rest in bunk On 5-Dec-2023]

PTE XXXXXX 2505
[Excuse RMJ, Excuse Heavy Load From 4-Dec-2023 To 5-Dec-2023]

CPL XXXXXX 2507
[Rest in bunk From 4-Dec-2023 To 5-Dec-2023]


Reporting Sick:
Platoon 1:

Platoon 2:
ME1-1 XXXXXX 2406
[Reporting Sick at PLC @ 19:14 H for fever ]

LCP XXXXXX 2509
[Accompanying PTE XXXXXX to report sick]


Attending Appointments:
Platoon 1:

Platoon 2:


Others:
Platoon 1:

Platoon 2:
*/