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
}

console.log("=== Test 1 : Création d'une instance ===");
const db = new Database();
console.log("Database créée :", db);
console.log("data est un tableau ?", Array.isArray(db.data));
console.log("data est vide ?", db.data.length === 0);

console.log("\n=== Test 2 : Insertion d'un enregistrement ===");
db.insert({ id: 1, name: "Alice", age: 30 });
console.log("Nombre d'enregistrements :", db.data.length);
console.log("Premier enregistrement :", db.data[0]);

console.log("\n=== Test 3 : Insertion de plusieurs enregistrements ===");
db.insert({ id: 2, name: "Bob", age: 25 });
db.insert({ id: 3, name: "Charlie", age: 35 });
console.log("Nombre total :", db.data.length);

console.log("\n=== Test 4 : getAll() ===");
const allRecords = db.getAll();
console.log("Tous les enregistrements :", allRecords);
console.log("C'est bien un tableau ?", Array.isArray(allRecords));

console.log("\n=== Test 5 : Instances indépendantes ===");
const db2 = new Database();
db2.insert({ id: 10, name: "David" });
console.log("db1 a", db.getAll().length, "enregistrements");
console.log("db2 a", db2.getAll().length, "enregistrement");
console.log("Les instances sont bien indépendantes ?", db.getAll().length !== db2.getAll().length);

