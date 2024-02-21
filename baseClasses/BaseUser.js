class User {
    constructor (id = 0) {
        this.id = id
        this.name = ""
        this.contact = 0
        this.description = ""
        this.primaryGroup = 0
        this.inGroups = {}
    }
    getId() {
        return this.id
    }
    getName() {
        return this.name
    }
    getContact() {
        return this.contact
    }
    getDescription() {
        return this.description
    }
    getPrimaryGroup() {
        return this.primaryGroup
    }
    getInGroups() {
        return this.inGroups
    }

    setId (uId) {
        this.id = uId
    }
    setName(uName) {
        this.name = uName
    }
    setContact(uContact) {
        this.contact = uContact
    }
    setDescription(uDescription) {
        this.description = uDescription
    }
    setPrimaryGroup(uPrimaryGroup) {
        this.primaryGroup = uPrimaryGroup
    }

    addGroup() {

    }

    deleteName() {
        this.name = ""
    }
    deleteContact() {
        this.contact = ""
    }
    deleteDescription() {
        this.description = ""
    }
    deleteGroup() {

    }

}