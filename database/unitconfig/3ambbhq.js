const groupsObj = require('../_groups.json')
const convenientFunctions = require('../../assets/convenientFunctions')
module.exports = {
    unitconfig: {
        "availableFields": [
            "name", "maskedic", "birthday", "contact",
        ],
        "fieldOrder": [
            "name", "maskedic", "birthday", "contact",
        ],
        "branch": [
            "S1 BR", "S3 BR", "S4 BR"
        ],
        "rank": [
            "PTE", "PFC", "LCP", "CPL", "CFC", "SCT", "3SG", "2SG", "1SG", "OCT", "MID", "2LT", "LTA", "CPT", "MAJ", "LTC", "SLTC", "COL", "RADM1", "RADM2", "VADM", "ME1T", "ME1", "ME2", "ME3", "ME4T", "ME4A", "ME4", "ME5", "ME6", "ME7", "ME8", "ME9",
        ],
        "memberUpdatableInfo": [
            "name", "nric", "rank", "appointment", "branch", "contact", "medicalstatus"
        ],
        "memberAbsence": [
            "mc", "leave", "ma"
        ],
        maskFields: (requiredFields = [], fieldOrder = []) => {
            var output = []
            for (var i in fieldOrder) {
                requiredFields.includes(fieldOrder[i]) ? output.push(fieldOrder[i]) : output.push('')
            }
            return output
        },
        checkAbsence: (member, unitObj, message) => {
            var date = new Date()
            var dayOffSet = 86399999
            var absentBool = false
            var memberData = unitObj["absence"][member]
            for (absentReason in memberData) {
                var absentData = unitObj["absence"][member][absentReason]
                switch (absentReason) {
                    case "mc":
                    case "leave":
                        for (i in absentData) {
                            startDate = convenientFunctions.formatddmmyyyy(absentData[i]["startdate"])
                            endDate = convenientFunctions.formatddmmyyyy(absentData[i]["enddate"])
                            if ((date.getTime() <= (endDate.getTime() + dayOffSet) && date.getTime() >= startDate.getTime())) { absentBool = true }
                        }
                        break;
                    case "ma":
                        for (i in absentData) {
                            maDate = convenientFunctions.formatddmmyyyy(absentData[i]["date"])
                            if (date.toDateString() == maDate.toDateString()) { absentBool = true }
                        }
                        break;
                }
            }
            return absentBool
        },
        formatMemberData: (userData, message) => {
            const key = `${userData["name"].replaceAll(" ", "").slice(0, 6)}${userData["maskedic"]}`
            const output = {
                [key]: {
                    "id": message.from.id,
                    "name": userData["name"],
                    "nric": `XXXXX${userData["maskedic"]}`,
                    "rank": "",
                    "appointment": "",
                    "branch": "",
                    "contact": userData["contact"],
                    "medicalstatus": {},
                    "vacationLeaveDaysLeft": 14,
                    "compassionateLeaveDaysLeft": 3
                },
            }
            return output
        },
        formatAbsence: (absenceData, message, fieldChange) => {
            var output = {}
            switch (fieldChange) {
                case "mc":
                    output["reason"] = absenceData[0]
                    output["mcnumber"] = absenceData[1]
                    output["startdate"] = absenceData[2]
                    output["enddate"] = absenceData[3]
                    break;
                case "leave":
                    output["leavetype"] = absenceData[0]
                    output["startdate"] = absenceData[1]
                    output["enddate"] = absenceData[2]
                    output["approvedby"] = absenceData[3] || "None"
                    break;
                case "ma":
                    output["reason"] = absenceData[0]
                    output["date"] = absenceData[1]
                    output["time"] = absenceData[2]
                    output["location"] = absenceData[3]
                    break;
            }
            console.log(absenceData)
            console.log(output)
            return output
        },
        formatParadeOutput: (paradeData, message) => {
            var date = new Date()
            var dayOffSet = 86399999
            var branches = ["S1 BR", "S3 BR", "S4 BR", "OTHERS"]
            var branchStrength = []
            const attendance = {}
            const todayAttendC = {}
            const upcomingAttendC = {}
            var attendanceOutput = ""
            for (var branch of branches) {
                attendance[branch] = []
                todayAttendC[branch] = {
                    "mc": [],
                    "leave": [],
                    "ma": [],
                }
                upcomingAttendC[branch] = {
                    "mc": [],
                    "leave": [],
                    "ma": [],
                }
                branchStrength.push(0)
            }

            for (var member in paradeData["members"]) {
                paradeData["members"][member]["branch"] ? attendance[paradeData["members"][member]["branch"]].push(member) : attendance["OTHERS"].push(member)
            }
            for (var member of paradeData["paradeState"]["present"]) {
                var i = 0
                for (branch in attendance) {
                    if (attendance[branch].includes(member)) { branchStrength[i] += 1 }
                    i++
                }
            }
            var i = 0
            for (var branch in attendance) {
                attendanceOutput += `${branch}:\t ${branchStrength[i]}/${attendance[branch].length}\n`
                i++
            }

            var todayAbsenceOutput = ""
            var upcomingAbsenceOutput = ""

            for (var member in paradeData["absence"]) {
                var memberData = paradeData["absence"][member]

                for (absentReason in memberData) {
                    var absentData = paradeData["absence"][member][absentReason]
                    switch (absentReason) {
                        case "mc":
                            for (i in absentData) {
                                absentData[i]["member"] = member
                                absentData[i]["branch"] = paradeData["members"][member]["branch"]
                                startDate = convenientFunctions.formatddmmyyyy(absentData[i]["startdate"])
                                endDate = convenientFunctions.formatddmmyyyy(absentData[i]["enddate"])
                                if ((date.getTime() <= (endDate.getTime() + dayOffSet) && date.getTime() >= startDate.getTime())) {
                                    paradeData["members"][member]["branch"] ? todayAttendC[paradeData["members"][member]["branch"]]["mc"].push(absentData[i]) : todayAttendC["OTHERS"]["mc"].push(absentData[i])
                                }
                                else if (date.getTime() <= (startDate.getTime() + dayOffSet)) {
                                    paradeData["members"][member]["branch"] ? upcomingAttendC[paradeData["members"][member]["branch"]]["mc"].push(absentData[i]) : upcomingAttendC["OTHERS"]["mc"].push(absentData[i])
                                }
                            }
                            break;
                        case "leave":
                            for (i in absentData) {
                                absentData[i]["member"] = member
                                absentData[i]["branch"] = paradeData["members"][member]["branch"]
                                startDate = convenientFunctions.formatddmmyyyy(absentData[i]["startdate"])
                                endDate = convenientFunctions.formatddmmyyyy(absentData[i]["enddate"])
                                if ((date.getTime() <= (endDate.getTime() + dayOffSet) && date.getTime() >= startDate.getTime())) {
                                    paradeData["members"][member]["branch"] ? todayAttendC[paradeData["members"][member]["branch"]]["leave"].push(absentData[i]) : todayAttendC["OTHERS"]["leave"].push(absentData[i])
                                }
                                else if (date.getTime() <= (startDate.getTime() + dayOffSet)) {
                                    paradeData["members"][member]["branch"] ? upcomingAttendC[paradeData["members"][member]["branch"]]["leave"].push(absentData[i]) : upcomingAttendC["OTHERS"]["leave"].push(absentData[i])

                                }
                            }
                            break;
                        case "ma":
                            for (i in absentData) {
                                absentData[i]["member"] = member
                                absentData[i]["branch"] = paradeData["members"][member]["branch"]
                                maDate = convenientFunctions.formatddmmyyyy(absentData[i]["date"])
                                if (date.toDateString() == maDate.toDateString()) {
                                    paradeData["members"][member]["branch"] ? todayAttendC[paradeData["members"][member]["branch"]]["ma"].push(absentData[i]) : todayAttendC["OTHERS"]["ma"].push(absentData[i])
                                }
                                else if (date.getTime() <= (maDate.getTime() + dayOffSet)) {
                                    paradeData["members"][member]["branch"] ? upcomingAttendC[paradeData["members"][member]["branch"]]["ma"].push(absentData[i]) : upcomingAttendC["OTHERS"]["ma"].push(absentData[i])
                                }
                            }
                            break;
                    }
                }
            }


            for (var branch in todayAttendC) {
                todayAbsenceOutput += `\n<b>${branch}:</b>\n`
                for (var reason in todayAttendC[branch]) {
                    for (i in todayAttendC[branch][reason]) {
                        var absenceData = todayAttendC[branch][reason][i]
                        todayAbsenceOutput += `${absenceData["member"]} ON ${reason.toUpperCase()} ${(absenceData["reason"] && !(absenceData["reason"].toLowerCase() == "none")) ? `FOR ${absenceData["reason"]}` : ""}\n${reason == "ma" ? `ON ${absenceData["date"]} AT ${absenceData["location"]}` : `FROM ${absenceData["startdate"]} TO ${absenceData["enddate"]}`}\n\n`
                    }
                }
            }

            for (var branch in upcomingAttendC) {
                upcomingAbsenceOutput += `\n<b>${branch}:</b>\n`
                for (var reason in upcomingAttendC[branch]) {
                    for (i in upcomingAttendC[branch][reason]) {
                        var absenceData = upcomingAttendC[branch][reason][i]
                        upcomingAbsenceOutput += `${absenceData["member"]} ON ${reason.toUpperCase()} ${(absenceData["reason"] && !(absenceData["reason"].toLowerCase() == "none")) ? `FOR ${absenceData["reason"]}` : ""}\n${reason == "ma" ? `ON ${absenceData["date"]} AT ${absenceData["location"]}` : `FROM ${absenceData["startdate"]} TO ${absenceData["enddate"]}`}\n\n`
                    }
                }
            }

            var noAbsenceOutput = ""
            for (member in paradeData["members"]) {
                var memberData = paradeData["members"][member]
                if (paradeData["paradeState"]["present"].includes(member)) { continue }
                if (module.exports.unitconfig.checkAbsence(member, paradeData, message)) { continue }
                noAbsenceOutput += `${member}:\t${memberData["rank"] || "NONE"} ${memberData["name"]} - ${memberData["contact"]}\n\n`
            }

            var output = ""
            output += `<b>${groupsObj[message.chat.id].name} Parade State\n</b>`
            output += `<b>Updated as of: ${date.toString().slice(0, date.toString().indexOf("("))}\n\n</b>`
            output += `<b>Attendance:</b>\n${attendanceOutput}\n`
            output += `<b>Absent Today:</b>\n${todayAbsenceOutput}`
            output += `<b>Upcoming Absence:</b>\n\n${upcomingAbsenceOutput}`
            output += `<b>Not In Without Absence:</b>\n\n${noAbsenceOutput}`
            return output
        },
    },
}