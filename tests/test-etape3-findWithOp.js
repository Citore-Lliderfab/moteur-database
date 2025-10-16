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
            })
        )
    }
}

console.log("=== Test 1 : Recherche avec un seul critère ===");
const db = new Database();
db.insert({ id: 1, name: "Alice", age: 30, city: "Paris" });
db.insert({ id: 2, name: "Bob", age: 25, city: "Lyon" });
db.insert({ id: 3, name: "Charlie", age: 30, city: "Paris" });
db.insert({ id: 4, name: "David", age: 25, city: "Paris" });

const result1 = db.findWithOp({ age: { $gt: 28 } });
console.log("Recherche age > 28 :", result1);
console.log("Nombre de résultats :", result1.length);
console.log("C'est bien 2 ?", result1.length === 2);

console.log("\n=== Test 2 : Recherche avec plusieurs critères ===");
const result2 = db.findWithOp({ age: { $lte: 30 }, city: { $in: ["Paris", "Toulouse"] } });
console.log("Recherche age <= 30 ET city dans ['Paris', 'Toulouse'] :", result2);
console.log("Nombre de résultats :", result2.length);
console.log("C'est bien 3 (Alice, Charlie et David) ?", result2.length === 3);

const result3 = db.findWithOp({ age: { $ne: 24 }, city: { $nin: ["Lyon", "Marseille"] } });
console.log("Recherche age !== 24 ET city pas dans ['Lyon', 'Marseille'] :", result3);
console.log("Nombre de résultats :", result3.length);
console.log("C'est bien 3 ?", result3.length === 3);

console.log("\n=== Test 3 : Aucun résultat ===");
const result4 = db.findWithOp({ age: { $gte: 50 } });
console.log("Recherche age >= 50 :", result4);
console.log("Tableau vide ?", result4.length === 0);

const result5 = db.findWithOp({ city: { $in: ["Marseille"] } });
console.log("Recherche city dans ['Marseille'] :", result5);
console.log("Tableau vide ?", result5.length === 0);

console.log("\n=== Test 4 : Recherche sur propriétés booléennes ===");
const db2 = new Database();
db2.insert({ id: 1, name: "Alice", active: true });
db2.insert({ id: 2, name: "Bob", active: false });
db2.insert({ id: 3, name: "Charlie", active: true });
db2.insert({ id: 4, name: "David", active: false });

const actifs = db2.findWithOp({ active: { $eq: true } });
console.log("Utilisateurs actifs :", actifs);
console.log("Nombre d'actifs :", actifs.length);
console.log("C'est bien 2 ?", actifs.length === 2);

const inactifs = db2.findWithOp({ active: { $eq: false } });
console.log("Utilisateurs inactifs :", inactifs);
console.log("Nombre d'inactifs :", inactifs.length);
console.log("C'est bien 2 ?", inactifs.length === 2);

console.log("\n=== Test 5 : Objet criteria vide ===");
const result6 = db.findWithOp({});
console.log("Recherche avec criteria vide :", result6);
console.log("Retourne tous les enregistrements ?", result6.length === db.getAll().length);

console.log("\n=== Test 6 : Recherche sur propriété inexistante ===");
const result7 = db.findWithOp({ country: { $eq: "France" } });
console.log("Recherche sur propriété inexistante :", result7);
console.log("Tableau vide ?", result7.length === 0);

console.log("\n=== Test 7 : Trois critères simultanés ===");
const db3 = new Database();
db3.insert({ id: 1, name: "Alice", age: 30, city: "Paris", active: true });
db3.insert({ id: 2, name: "Bob", age: 30, city: "Paris", active: false });
db3.insert({ id: 3, name: "Charlie", age: 30, city: "Paris", active: true });

const result8 = db3.findWithOp({ age: { $gt: 25 }, city: { $in: ["Paris", "Toulouse"] }, active: { $eq: true } });
console.log("Recherche avec 3 critères :", result8);
console.log("Nombre de résultats :", result8.length);
console.log("C'est bien 2 ?", result8.length === 2);