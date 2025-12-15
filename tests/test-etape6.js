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

console.log("=== Test 1 : insert() sans ID ===");
const db1 = new Database();
try {
  db1.insert({ name: "Alice", age: 30 });
  console.log("❌ Erreur non lancée !");
} catch (error) {
  console.log("✅ Erreur lancée :", error.message);
  console.log("Message correct ?", error.message.includes("id") && error.message.includes("required"));
}

console.log("\n=== Test 2 : insert() avec ID fonctionne ===");
const db2 = new Database();
try {
  db2.insert({ id: 1, name: "Bob", age: 25 });
  console.log("✅ Insertion réussie sans erreur");
  console.log("Enregistrement présent ?", db2.findById(1) !== undefined);
} catch (error) {
  console.log("❌ Erreur inattendue :", error.message);
}

console.log("\n=== Test 3 : update() avec ID inexistant ===");
const db3 = new Database();
db3.insert({ id: 1, name: "Charlie", age: 35 });
try {
  db3.update(999, { age: 40 });
  console.log("❌ Erreur non lancée !");
} catch (error) {
  console.log("✅ Erreur lancée :", error.message);
  console.log("Message contient l'ID ?", error.message.includes("999"));
}

console.log("\n=== Test 4 : update() avec ID valide fonctionne ===");
const db4 = new Database();
db4.insert({ id: 1, name: "David", age: 28 });
try {
  db4.update(1, { age: 29 });
  console.log("✅ Mise à jour réussie sans erreur");
  console.log("Âge modifié ?", db4.findById(1).age === 29);
} catch (error) {
  console.log("❌ Erreur inattendue :", error.message);
}

console.log("\n=== Test 5 : delete() avec ID inexistant ===");
const db5 = new Database();
db5.insert({ id: 1, name: "Eve", age: 32 });
try {
  db5.delete(999);
  console.log("❌ Erreur non lancée !");
} catch (error) {
  console.log("✅ Erreur lancée :", error.message);
  console.log("Message contient l'ID ?", error.message.includes("999"));
}

console.log("\n=== Test 6 : delete() avec ID valide fonctionne ===");
const db6 = new Database();
db6.insert({ id: 1, name: "Frank", age: 45 });
try {
  db6.delete(1);
  console.log("✅ Suppression réussie sans erreur");
  console.log("Enregistrement supprimé ?", db6.findById(1) === undefined);
} catch (error) {
  console.log("❌ Erreur inattendue :", error.message);
}

console.log("\n=== Test 7 : findById() avec ID inexistant (pas d'erreur) ===");
const db7 = new Database();
db7.insert({ id: 1, name: "Grace", age: 27 });
try {
  const result = db7.findById(999);
  console.log("✅ Pas d'erreur lancée");
  console.log("Retourne undefined ?", result === undefined);
} catch (error) {
  console.log("❌ Erreur lancée alors qu'elle ne devrait pas :", error.message);
}

console.log("\n=== Test 8 : find() avec type invalide ===");
const db8 = new Database();
try {
  db8.find("age: 30");
  console.log("❌ Erreur non lancée !");
} catch (error) {
  console.log("✅ Erreur lancée :", error.message);
  console.log("Message parle d'objet ?", error.message.toLowerCase().includes("object"));
}

console.log("\n=== Test 9 : find() avec null ===");
const db9 = new Database();
try {
  db9.find(null);
  console.log("❌ Erreur non lancée !");
} catch (error) {
  console.log("✅ Erreur lancée :", error.message);
}

console.log("\n=== Test 10 : find() avec tableau ===");
const db10 = new Database();
try {
  db10.find([{ age: 30 }]);
  console.log("❌ Erreur non lancée !");
} catch (error) {
  console.log("✅ Erreur lancée :", error.message);
}

console.log("\n=== Test 11 : Messages d'erreur sont clairs ===");
const db11 = new Database();
db11.insert({ id: 1, name: "Test" });

try {
  db11.update(42, { name: "Updated" });
} catch (error) {
  console.log("Message d'erreur :", error.message);
  console.log("Est explicite ?", 
    error.message.length > 20 && 
    error.message.includes("42")
  );
}