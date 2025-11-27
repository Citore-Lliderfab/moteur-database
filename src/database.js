class Database {

    constructor() {
        this.data = []
    }

    insert(record) {
        this.data.push(record)
    }

    getAll() {
        return this.data
    }

    findById(id) {
        return this.data.find((element) => element.id == id)
    }

    find(criteria) {
        return this.data.filter((element) =>
            Object.entries(criteria).reduce((accumulator, [key, value]) =>
                accumulator && (element[key] == value), true
            )
        )
    }

    update(id, changes) {
        return Object.assign(this.findById(id), changes)
    }

    delete(id) {
        const nbData = this.getAll().length;
        const newData = this.data.filter((record) => record.id !== id);
        this.data = newData;
        if (this.getAll().length !== nbData && !this.findById(id)) { return true } else return false
    }
}