class Database {

    constructor() {
        this.data = []
    }

    insert(record) {
        if (record.id) {
            if (!this.findById(record.id)) {
                this.data.push(record)
            } else {
                throw new Error(`Cannot insert record for "${record.name}": id "${record.id}" already exists!`)
            }
        } else {
            throw new Error(`Cannot insert record for "${record.name}": id is required!`)
        }
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
        if (typeof criteria === "object" && criteria !== null && !Array.isArray(criteria))
            return this.data.filter((record) =>
                Object.keys(criteria).every((key) => criteria[key] === record[key]))
        else
            throw new Error(`Criteria is not an object: it must be one!`)
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
        if (this.findById(id))
            return Object.assign(this.findById(id), changes)
        else
            throw new Error(`Cannot update: record with id "${id}" not found!`)
    }

    changesWithoutId(changes) { Object.fromEntries(Object.entries(changes).filter(([key, value]) => key !== 'id')) };

    updateExceptId(id, changes) {
        if (Object.keys(changes).find((key) => key === 'id'))
            throw new Error(`Cannot update because id's key "${id}" is in {changes}!`)
        else {
            const changesWithoutId = this.changesWithoutId(changes);
            this.update(id, changesWithoutId)
        }
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
        if (this.findById(id)) {
            const nbData = this.getAll().length;
            const newData = this.data.filter((record) => record.id !== id);
            this.data = newData;
            if (this.getAll().length !== nbData && !this.findById(id)) { return true } else return false
        } else {
            throw new Error(`Cannot delete: record with id "${id}" not found!`)
        }
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

console.log("\n**** Exemple 1.6.1 : insert() sans ID");
db = new Database();

try {
  db.insert({ name: "Alice", age: 30 });
  console.log("Pas d'erreur - PROBLÈME !");
} catch (error) {
  console.log("Erreur :", error.message);
  // "Cannot insert record: id is required"
}

console.log("\n**** Exemple 1.6.2 : update() avec ID inexistant");
db = new Database();
db.insert({ id: 1, name: "Alice", age: 30 });

try {
  db.update(999, { age: 31 });
  console.log("Pas d'erreur - PROBLÈME !");
} catch (error) {
  console.log("Erreur :", error.message);
  // "Cannot update: record with id 999 not found"
}

console.log("\n**** Exemple 1.6.3 : delete() avec ID inexistant");
db = new Database();
db.insert({ id: 1, name: "Alice", age: 30 });

try {
  db.delete(999);
  console.log("Pas d'erreur - PROBLÈME !");
} catch (error) {
  console.log("Erreur :", error.message);
  // "Cannot delete: record with id 999 not found"
}

console.log("\n**** Exemple 1.6.4 : findById() avec ID inexistant (PAS d'erreur)");
db = new Database();
db.insert({ id: 1, name: "Alice", age: 30 });

const result = db.findById(999);
console.log(result); // undefined - pas d'erreur lancée

console.log("\n**** Exemple 1.6.5 : find() avec mauvais type");
db = new Database();

try {
  db.find("age: 30"); // Une string au lieu d'un objet
  console.log("Pas d'erreur - PROBLÈME !");
} catch (error) {
  console.log("Erreur :", error.message);
  // "Criteria must be an object"
}


console.log("\n**** Exemple 1.6.6 : Insert sans ID ou si ID existe déjà");
db = new Database();
db.insert({ id: 1, name: "Alice", age: 30, city: "Paris" });

try {
    const insertSansID = db.insert({ name: "Fred", age: 40, city: "Perpignan" })
    console.log(insertSansID, "\n", db.getAll())
} catch (err) {
    console.log(err.message)
};
try {
    const insertAvecIDExistant = db.insert({ id: 1, name: "Fred", age: 40, city: "Perpignan" });
    console.log(insertAvecIDExistant, "\n", db.getAll())
} catch (err) {
    console.log(err.message)
}

console.log("\n**** Exemple 1.6.7 : Update si ID n'existe pas");
db = new Database();
db.insert({ id: 1, name: "Alice", age: 30, city: "Paris" });

try {
    const updateWithoutID = db.update(2, { name: "Fred" });
    console.log(updateWithoutID, "\n", db.getAll())
} catch (err) {
    console.log(err.message)
}

console.log("\n**** Exemple 1.6.8 : Update si ID dans {changes}");
db = new Database();
db.insert({ id: 1, name: "Alice", age: 30, city: "Paris" });

try {
    const updateWithIDInChanges = db.updateExceptId(1, { id: 2 });
    console.log(updateWithIDInChanges, "\n", db.getAll())
} catch (err) {
    console.log(err.message)
}

console.log("\n**** Exemple 1.6.9 : Delete si ID n'existe pas");
db = new Database();
db.insert({ id: 1, name: "Alice", age: 30, city: "Paris" });

try {
    const deleteWithoutID = db.delete(2, { name: "Fred" });
    console.log(deleteWithoutID, "\n", db.getAll());
} catch (err) {
    console.log(err.message)
}

console.log("\n**** Exemple 1.6.10 : Find si criteria n'est pas un objet");
db = new Database();
db.insert({ id: 1, name: "Alice", age: 30, city: "Paris" });

try {
    const findNotObject = db.find(null);
    console.log(findNotObject, "\n", db.getAll());
} catch (err) {
    console.log(err.message)
}