class User extends BaseUser {
    constructor () {
        super()
        this.maskedic = ""
        this.birthday = ""
    }
    getMaskedIc() {
        return this.maskedic
    }
    getBirthday() {
        return this.birthday
    }

    setMaskedIc(uMaskedic) {
        this.maskedic = uMaskedic
    }
    setBirthday(uBirthday) {
        this.birthday = uBirthday
    }

    createMemberName() {
        return this.name.slice(0, 6) + this.maskedic
    }
}