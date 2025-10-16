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

    findWithOp(criteria) {
        return this.data.filter((element) =>
            Object.entries(criteria).every(([key, value]) => {
                const operator = Object.entries(value)[0];
                switch (operator[0]) {
                    case '$eq':
                        return element[key] == operator[1]
                    case '$gt':
                        return element[key] > operator[1]
                    case '$gte':
                        return element[key] >= operator[1]
                    case '$in':
                        return operator[1].includes(element[key])
                    case '$lt':
                        return element[key] < operator[1]
                    case '$lte':
                        return element[key] <= operator[1]
                    case '$ne':
                        return element[key] !== operator[1]
                    case '$nin':
                        return !(operator[1].includes(element[key]))
                }
            }
            )
        )
    }
}

console.log('Exemple 1 : Recherche avec un seul critère');
let db = new Database();
db.insert({ id: 1, name: "Alice", age: 30 });
db.insert({ id: 2, name: "Bob", age: 25 });
db.insert({ id: 3, name: "Charlie", age: 30 });

let result = db.findWithOp({ age: { $ne: 25 } });
console.log(result);
// Résultat attendu : [
//   { id: 1, name: "Alice", age: 30 },
//   { id: 3, name: "Charlie", age: 30 }
// ]


console.log('Exemple 2 : Recherche avec plusieurs critères');
db = new Database();
db.insert({ id: 1, name: "Alice", age: 30, city: "Paris" });
db.insert({ id: 2, name: "Bob", age: 25, city: "Lyon" });
db.insert({ id: 3, name: "Charlie", age: 30, city: "Marseille" });
db.insert({ id: 4, name: "David", age: 25, city: "Paris" });

result = db.findWithOp({ age: { $gte: 30 }, city: { $ne: "Marseille" } });
console.log(result);
// Résultat attendu : [
//   { id: 1, name: "Alice", age: 30, city: "Paris" },
// ]

console.log('Exemple 3 : Aucun résultat')
db = new Database();
db.insert({ id: 1, name: "Alice", age: 30 });

result = db.findWithOp({ age: { $lt: 28 } });
console.log(result);
// Résultat attendu : []
console.log(result.length === 0); // true

console.log('Exemple 4 : Recherche sur des propriétés booléennes');
db = new Database();
db.insert({ id: 1, name: "Alice", active: true });
db.insert({ id: 2, name: "Bob", active: false });
db.insert({ id: 3, name: "Charlie", active: true });

result = db.find({ active: true });
console.log(result);
// Résultat attendu : Alice et Charlie