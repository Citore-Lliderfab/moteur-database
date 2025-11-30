class Database {

    constructor() {
        this.data = []
    }

    insert(record) {
        record.delete = false;
        if (this.getDeleted().find((recordDelete) => recordDelete.id === record.id)) {
            Object.assign(this.getDeleted().find((recordDelete) => recordDelete.id === record.id), record)
            return
        }
        this.data.push(record);
    }

    getAll() {
        return this.data
    }

    findById(id) {
        return this.data.find((record) => record.id == id)
    }

    find(criteria) {
        return this.data.filter((record) =>
            Object.entries(criteria).reduce((accumulator, [key, value]) =>
                accumulator && (record[key] == value), true
            )
        )
    }

    update(id, changes) {
        return Object.assign(this.findById(id), changes)
    }

    deleteSoft(id) {
        const nbIniData = this.getAll().filter((record) => record.delete !== true).length;
        this.data.forEach((record) => { if (record.id === id) record.delete = true });
        const nbFinData = this.getAll().filter((record) => record.delete !== true).length;
        const nbDeletedRecords = nbIniData - nbFinData;
        return nbDeletedRecords
    }

    getActive(){
        return this.getAll().filter((record) => record.delete === false)
    }

    getDeleted(){
        return this.getAll().filter((record) => record.delete === true)
    }

}

console.log('**** Exemple 1 : Suppression simple ****');
let db = new Database();
db.insert({ id: 1, name: "Alice", age: 30 });
db.insert({ id: 2, name: "Bob", age: 25 });
db.insert({ id: 3, name: "Charlie", age: 30 });

let result = db.deleteSoft(2);
console.log("Nb suppression(s) :",result);
console.log("Enregistrement(s) actif(s) :", db.getActive());
console.log("Enregistrement(s) supprimé(s) :", db.getDeleted());
// Résultat attendu :
// Nb suppression(s) : 1,
// Enregistrement(s) actif(s): [{ id: 1, name: "Alice", age: 30, delete: false },
// { id: 3, name: "Charlie", age: 30, delete: false }]
// Enregistrement(s) supprimé(s) : [{ id: 2, name: "Bob", age: 25, delete: true }]

console.log('\n**** Exemple 2 : Aucune suppression ****')
db = new Database();
db.insert({ id: 1, name: "Alice", age: 30 });
db.insert({ id: 2, name: "Bob", age: 25 });

result = db.deleteSoft(399);
console.log("Nb suppression(s) :",result);
console.log("Enregistrement(s) actif(s) :", db.getActive());
console.log("Enregistrement(s) supprimé(s) :", db.getDeleted());
// Résultat attendu :
// Nb suppression(s) : 0,
// Enregistrement(s) actif(s): [{ id: 1, name: "Alice", age: 30, delete: false },
// { id: 2, name: "Bob", age: 25, delete: false },]
// Enregistrement(s) supprimé(s) : []

console.log('\n**** Exemple 3 : Suppressions successives ****')
db = new Database();
db.insert({ id: 1, name: "Alice", age: 30 });
db.insert({ id: 2, name: "Bob", age: 25 });
db.insert({ id: 3, name: "Charlie", age: 30 });

result = db.deleteSoft(1);
console.log("Nb suppression(s) :",result);
console.log("Enregistrement(s) actif(s) :", db.getActive());
console.log("Enregistrement(s) supprimé(s) :", db.getDeleted());
// Nb suppression(s) : 1,
// Enregistrement(s) actif(s): [{ id: 2, name: "Bob", age: 25, delete: false },
// { id: 3, name: "Charlie", age: 30, delete: false }]
// Enregistrement(s) supprimé(s) : [{ id: 1, name: "Alice", age: 30, delete: true }]
result = db.deleteSoft(2);
console.log("\nNb suppression(s) :",result);
console.log("Enregistrement(s) actif(s) :", db.getActive());
console.log("Enregistrement(s) supprimé(s) :", db.getDeleted());
// Nb suppression(s) : 1,
// Enregistrement(s) actif(s): [{ id: 3, name: "Charlie", age: 30, delete: false }]
// Enregistrement(s) supprimé(s) : [{ id: 1, name: "Alice", age: 30, delete: true },
// { id: 2, name: "Bob", age: 25, delete: true }]
result = db.deleteSoft(3);
console.log("\nNb suppression(s) :",result);
console.log("Enregistrement(s) actif(s) :", db.getActive());
console.log("Enregistrement(s) supprimé(s) :", db.getDeleted());
// Nb suppression(s) : 1,
// Enregistrement(s) actif(s): []
// Enregistrement(s) supprimé(s) : [{ id: 1, name: "Alice", age: 30, delete: true },
// { id: 2, name: "Bob", age: 25, delete: true },
// { id: 3, name: "Charlie", age: 30, delete: true }]