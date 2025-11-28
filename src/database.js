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

    delete(id) {
        const nbData = this.getAll().length;
        const newData = this.data.filter((record) => record.id !== id);
        this.data = newData;
        if (this.getAll().length !== nbData && !this.findById(id)) { return true } else return false
    }

    deleteWithOp(criteria) {
        const nbData = this.getAll().length;
        const newData = this.data.filter((record) =>
            Object.entries(criteria).some(([key, value]) => {
                const operator = Object.entries(value)[0];
                switch (operator[0]) {
                    case '$eq':
                        return record[key] !== operator[1]
                    case '$gt':
                        return record[key] <= operator[1]
                    case '$gte':
                        return record[key] < operator[1]
                    case '$in':
                        return !operator[1].includes(record[key])
                    case '$lt':
                        return record[key] >= operator[1]
                    case '$lte':
                        return record[key] > operator[1]
                    case '$ne':
                        return record[key] == operator[1]
                    case '$nin':
                        return (operator[1].includes(record[key]))
                }
            })
        )
        this.data = newData;
        if (this.getAll().length !== nbData) { return true } else return false
    }
}

console.log('Exemple 1 : Suppression avec un seul critère');
let db = new Database();
db.insert({ id: 1, name: "Alice", age: 30 });
db.insert({ id: 2, name: "Bob", age: 25 });
db.insert({ id: 3, name: "Charlie", age: 30 });

let result = db.deleteWithOp({ age: { $ne: 25 } });
console.log(result, db.getAll());
// Résultat attendu : true,
// [{ id: 2, name: "Bob", age: 25 }]

console.log('Exemple 2 : Suppression avec plusieurs critères');
db = new Database();
db.insert({ id: 1, name: "Alice", age: 30, city: "Paris" });
db.insert({ id: 2, name: "Bob", age: 25, city: "Lyon" });
db.insert({ id: 3, name: "Charlie", age: 30, city: "Marseille" });
db.insert({ id: 4, name: "David", age: 25, city: "Paris" });

result = db.deleteWithOp({ age: { $gt: 20 }, city: { $eq: "Paris" } });
console.log(result, db.getAll());
// Résultat attendu : true, [
//   { id: 2, name: "Bob", age: 25, city: "Lyon" },
//   { id: 3, name: "Charlie", age: 30, city: "Marseille" },
// ]

console.log('Exemple 3 : Aucune suppression')
db = new Database();
db.insert({ id: 1, name: "Alice", age: 30 });

result = db.deleteWithOp({ age: { $lt: 28 } });
console.log(result, db.getAll());
// Résultat attendu : false,
// [{ id: 1, name: "Alice", age: 30 }]