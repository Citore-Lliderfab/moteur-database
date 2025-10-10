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
}

console.log("=== Test 1 : Recherche d'un enregistrement existant ===");
const db = new Database();
db.insert({ id: 1, name: "Alice", age: 30 });
db.insert({ id: 2, name: "Bob", age: 25 });
db.insert({ id: 3, name: "Charlie", age: 35 });

const user1 = db.findById(1);
console.log("Recherche ID 1 :", user1);
console.log("C'est bien Alice ?", user1.name === "Alice");

const user2 = db.findById(2);
console.log("Recherche ID 2 :", user2);
console.log("C'est bien Bob ?", user2.name === "Bob");

const user3 = db.findById(3);
console.log("Recherche ID 3 :", user3);
console.log("C'est bien Charlie ?", user3.name === "Charlie");

console.log("\n=== Test 2 : Recherche d'un ID inexistant ===");
const userInexistant = db.findById(999);
console.log("Recherche ID 999 :", userInexistant);
console.log("Est undefined ?", userInexistant === undefined);

console.log("\n=== Test 3 : Base de données vide ===");
const db2 = new Database();
const userVide = db2.findById(1);
console.log("Recherche dans DB vide :", userVide);
console.log("Est undefined ?", userVide === undefined);

console.log("\n=== Test 4 : IDs de type string ===");
const db3 = new Database();
db3.insert({ id: "user-001", name: "David", age: 28 });
db3.insert({ id: "user-002", name: "Eve", age: 32 });

const userString = db3.findById("user-001");
console.log("Recherche ID string :", userString);
console.log("C'est bien David ?", userString && userString.name === "David");

console.log("\n=== Test 5 : Plusieurs recherches successives ===");
const db4 = new Database();
db4.insert({ id: 10, name: "Test1", age: 20 });
db4.insert({ id: 20, name: "Test2", age: 30 });
db4.insert({ id: 30, name: "Test3", age: 40 });

console.log("Première recherche (ID 20) :", db4.findById(20));
console.log("Deuxième recherche (ID 10) :", db4.findById(10));
console.log("Troisième recherche (ID 30) :", db4.findById(30));
console.log("Toutes les recherches fonctionnent ?", 
  db4.findById(20).name === "Test2" && 
  db4.findById(10).name === "Test1" && 
  db4.findById(30).name === "Test3"
);