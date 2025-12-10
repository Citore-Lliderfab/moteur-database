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
        return this.data.find((record) => record.id === id)
    }

    findWithReduce(criteria) {
        return this.data.filter((record) =>
            Object.entries(criteria).reduce((accumulator, [key, value]) =>
                accumulator && (record[key] === value), true
            )
        )
    }

    find(criteria) {
        return this.data.filter((record) =>
            Object.keys(criteria).every((key) => criteria[key] === record[key]))
    }

    findWithEntries(criteria) {
        return this.data.filter((record) =>
            Object.entries(criteria).every(([key, value]) => value === record[key]))
    }

    findAny(criteria) {
        return this.data.filter((record) =>
            Object.entries(criteria).some(([key, value]) => value === record[key]))
    }

    findWithOp(criteria) {
        return this.data.filter((record) =>
            Object.entries(criteria).every(([key, value]) => {
                const operator = Object.entries(value)[0];
                switch (operator[0]) {
                    case '$eq':
                        return record[key] === operator[1]
                    case '$gt':
                        return record[key] > operator[1]
                    case '$gte':
                        return record[key] >= operator[1]
                    case '$in':
                        return operator[1].includes(record[key])
                    case '$lt':
                        return record[key] < operator[1]
                    case '$lte':
                        return record[key] <= operator[1]
                    case '$ne':
                        return record[key] !== operator[1]
                    case '$nin':
                        return !(operator[1].includes(record[key]))
                }
            })
        )
    }

    update(id, changes) {
        return Object.assign(this.findById(id), changes)
    }

    changesWithoutId(changes) { Object.fromEntries(Object.entries(changes).filter(([key, value]) => key !== 'id')) };

    updateExceptId(id, changes) {
        const changesWithoutId = this.changesWithoutId(changes);
        this.update(id, changesWithoutId)
    }

    modifierClef(objet, nomClef, nouvelleValeur) {
        for (let clef in objet) {
            if (clef === nomClef) {
                objet[clef] = nouvelleValeur;
            } else if (typeof objet[clef] === 'object' && objet[clef] !== null) {
                modifierClef(objet[clef], nomClef, nouvelleValeur);
            }
        }
    }

    updateWithDeepCopy(id, changes) {
        const record = this.findById(id);
        const changesWithoutId = this.changesWithoutId(changes);
        console.log(Object.keys(changesWithoutId));
        Object.entries(changesWithoutId).forEach(([key, value]) => {
            modifierClef(record, key, value)
        })
        return record
    }

    updateCompleteImmutability(id, changes) {
        const indexRecord = this.data.findIndex((element) => element.id == id);
        if (indexRecord === -1) return null;
        console.log(indexRecord);
        const deepCloneRecord = JSON.parse(JSON.stringify(this.findById(id)));
        const changesWithoutId = this.changesWithoutId(changes);
        console.log(Object.keys(changesWithoutId));
        Object.entries(changesWithoutId).forEach(([key, value]) => {
            modifierClef(deepCloneRecord, key, value)
        })
        const newData = [
            ...this.data.slice(0, indexRecord),
            deepCloneRecord,
            ...this.data.slice(indexRecord + 1)
        ];
        this.data = newData;
        console.log(this.data);
        return deepCloneRecord
    }

    delete(id) {
        const nbData = this.getAll().length;
        const newData = this.data.filter((record) => record.id !== id);
        this.data = newData;
        if (this.getAll().length !== nbData && !this.findById(id)) { return true } else return false
    }

    deleteWithOp(criteria) {
        const nbData = this.getAll().length;
        const recordsFromCriteria = this.findWithOp(criteria);
        recordsFromCriteria.forEach((record) => this.delete(record.id));
        if (this.getAll().length !== nbData) { return true } else return false
    }

    deletedCount(id) {
        const nbData = this.getAll().length;
        const newData = this.data.filter((record) => record.id !== id);
        this.data = newData;
        const nbDeletedRecords = nbData - this.getAll().length;
        return nbDeletedRecords
    }

    insertSoft(record) {
        record.delete = false;
        const recordIsDeletedRecord = this.getDeleted().find((deletedRecord) => deletedRecord.id === record.id);
        if (recordIsDeletedRecord) {
            Object.assign(recordIsDeletedRecord, record)
            return
        }
        this.data.push(record);
    }

    getActive() {
        return this.getAll().filter((record) => record.delete === false)
    }

    getDeleted() {
        return this.getAll().filter((record) => record.delete === true)
    }

    deleteSoft(id) {
        const nbIniData = this.getActive().length;
        this.getActive().forEach((record) => { if (record.id === id) record.delete = true });
        const nbFinData = this.getActive().length;
        const nbDeletedRecords = nbIniData - nbFinData;
        return nbDeletedRecords
    }

    deleteSoftWithOp(criteria) {
        const activeRecordsFromCriteria = this.findWithOp(criteria);
        activeRecordsFromCriteria.forEach((record) => this.deleteSoft(record.id));
        return this.getDeleted()
    }

}

console.log('**** Exemple 1 : Recherche et Suppression avec un seul critère');
let db = new Database();
db.insert({ id: 1, name: "Alice", age: 30 });
db.insert({ id: 2, name: "Bob", age: 25 });
db.insert({ id: 3, name: "Charlie", age: 30 });

let criteria = { age: { $ne: 25 } };
let resultFind = db.findWithOp(criteria);
let resultDelete = db.deleteWithOp(criteria);
console.log(criteria, "\n", resultFind, "\n", resultDelete, "\n", db.getAll());
// Résultat attendu :
// { age: { $ne: 25 } }
// [
//  { id: 1, name: "Alice", age: 30 },
//  { id: 3, name: "Charlie", age: 30 }
// ]
// true
// [ { id: 2, name: "Bob", age: 25 } ]

console.log('\n**** Exemple 2 : Recherche et Suppression avec plusieurs critères');
db = new Database();
db.insert({ id: 1, name: "Alice", age: 30, city: "Paris" });
db.insert({ id: 2, name: "Bob", age: 25, city: "Lyon" });
db.insert({ id: 3, name: "Charlie", age: 30, city: "Marseille" });
db.insert({ id: 4, name: "David", age: 25, city: "Paris" });

criteria = { age: { $gt: 20 }, city: { $eq: "Paris" } };
resultFind = db.findWithOp(criteria);
resultDelete = db.deleteWithOp(criteria);
console.log(criteria, "\n", resultFind, "\n", resultDelete, "\n", db.getAll());
// Résultat attendu :
// { age: { $gt: 20 }, city: { $eq: "Paris" } }
// [
//  { id: 1, name: "Alice", age: 30, city: "Paris" },
//  { id: 4, name: "David", age: 25, city: "Paris" }
// ]
// true
// [
//   { id: 2, name: "Bob", age: 25, city: "Lyon" },
//   { id: 3, name: "Charlie", age: 30, city: "Marseille" },
// ]

console.log('\n**** Exemple 3 : Rien de trouvé - Aucune suppression')
db = new Database();
db.insert({ id: 1, name: "Alice", age: 30 });

criteria = { age: { $lt: 28 } };
resultFind = db.findWithOp(criteria);
resultDelete = db.deleteWithOp(criteria);
console.log(criteria, "\n", resultFind, "\n", resultDelete, "\n", db.getAll());
// Résultat attendu :
// { age: { $lt: 28 } }
// []
// false
// [ { id: 1, name: "Alice", age: 30 } ]

console.log('\n**** Exemple 4 : Compter suppression par id')
db = new Database();
db.insert({ id: 1, name: "Alice", age: 30 });

console.log(db.deletedCount(1));
// Résultat attendu :
// 1

console.log('\n**** Exemple 5 : Insertion Recherche et Suppression Soft avec plusieurs critères');
db = new Database();
db.insertSoft({ id: 1, name: "Alice", age: 30, city: "Paris" });
db.insertSoft({ id: 2, name: "Bob", age: 25, city: "Lyon" });
db.insertSoft({ id: 3, name: "Charlie", age: 30, city: "Marseille" });
db.insertSoft({ id: 4, name: "David", age: 25, city: "Paris" });
console.log(db, "\n", db.getAll());

criteria = { age: { $gt: 20 }, city: { $eq: "Paris" } };
resultFind = db.findWithOp(criteria);
resultDelete = db.deleteSoftWithOp(criteria);
console.log(criteria, "\n", resultFind, "\n", resultDelete, "\n", db.getActive(), db.getDeleted());
// Résultat attendu :
// Database {
//  data: [
//    { id: 1, name: 'Alice', age: 30, city: 'Paris', delete: false },
//    { id: 2, name: 'Bob', age: 25, city: 'Lyon', delete: false },
//    { id: 3, name: 'Charlie', age: 30, city: 'Marseille', delete: false },
//    { id: 4, name: 'David', age: 25, city: 'Paris', delete: false }
//  ]
// } 
// [
//  { id: 1, name: 'Alice', age: 30, city: 'Paris', delete: false },
//  { id: 2, name: 'Bob', age: 25, city: 'Lyon', delete: false },
//  { id: 3, name: 'Charlie', age: 30, city: 'Marseille', delete: false },
//  { id: 4, name: 'David', age: 25, city: 'Paris', delete: false }
// ]
// { age: { $gt: 20 }, city: { $eq: "Paris" } }
// [
//  { id: 1, name: "Alice", age: 30, city: "Paris", delete: false },
//  { id: 4, name: "David", age: 25, city: "Paris", delete: false }
// ]
// [
//  { id: 1, name: "Alice", age: 30, city: "Paris", delete: true },
//  { id: 4, name: "David", age: 25, city: "Paris", delete: true }
// ]
// [
//   { id: 2, name: "Bob", age: 25, city: "Lyon", delete: false },
//   { id: 3, name: "Charlie", age: 30, city: "Marseille", delete: false },
// ]
// [
//  { id: 1, name: "Alice", age: 30, city: "Paris", delete: true },
//  { id: 4, name: "David", age: 25, city: "Paris", delete: true }
// ]