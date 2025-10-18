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

}

console.log("=== Test 1 : Modifier une seule propriété ===");
const db = new Database();
db.insert({ id: 1, name: "Alice", age: 30, city: "Paris" });

console.log("Avant :", db.findById(1));
db.update(1, { age: 31 });
console.log("Après :", db.findById(1));
console.log("Age modifié ?", db.findById(1).age === 31);
console.log("Autres propriétés intactes ?", 
  db.findById(1).name === "Alice" && 
  db.findById(1).city === "Paris"
);

console.log("\n=== Test 2 : Modifier plusieurs propriétés ===");
const db2 = new Database();
db2.insert({ id: 1, name: "Bob", age: 25, city: "Lyon" });

db2.update(1, { age: 26, city: "Marseille" });
console.log("Après modification :", db2.findById(1));
console.log("Modifications appliquées ?", 
  db2.findById(1).age === 26 && 
  db2.findById(1).city === "Marseille"
);

console.log("\n=== Test 3 : Ajouter de nouvelles propriétés ===");
const db3 = new Database();
db3.insert({ id: 1, name: "Charlie", age: 35 });

db3.update(1, { active: true, role: "admin" });
console.log("Après ajout :", db3.findById(1));
console.log("Nouvelles propriétés ajoutées ?", 
  db3.findById(1).active === true && 
  db3.findById(1).role === "admin"
);

console.log("\n=== Test 4 : Mise à jour partielle ===");
const db4 = new Database();
db4.insert({ id: 1, name: "David", age: 28, city: "Paris", active: true });

db4.update(1, { age: 29 });
console.log("Après modification partielle :", db4.findById(1));
console.log("Seule la propriété modifiée a changé ?", 
  db4.findById(1).age === 29 &&
  db4.findById(1).name === "David" &&
  db4.findById(1).city === "Paris" &&
  db4.findById(1).active === true
);

console.log("\n=== Test 5 : Modifications successives ===");
const db5 = new Database();
db5.insert({ id: 1, name: "Eve", age: 30 });

db5.update(1, { age: 31 });
db5.update(1, { city: "Paris" });
db5.update(1, { active: true });

console.log("Après plusieurs modifications :", db5.findById(1));
console.log("Toutes les modifications sont présentes ?",
  db5.findById(1).age === 31 &&
  db5.findById(1).city === "Paris" &&
  db5.findById(1).active === true
);

console.log("\n=== Test 6 : Modifier différents enregistrements ===");
const db6 = new Database();
db6.insert({ id: 1, name: "Alice", age: 30 });
db6.insert({ id: 2, name: "Bob", age: 25 });
db6.insert({ id: 3, name: "Charlie", age: 35 });

db6.update(1, { age: 31 });
db6.update(2, { age: 26 });
db6.update(3, { age: 36 });

console.log("Alice :", db6.findById(1));
console.log("Bob :", db6.findById(2));
console.log("Charlie :", db6.findById(3));
console.log("Tous modifiés correctement ?",
  db6.findById(1).age === 31 &&
  db6.findById(2).age === 26 &&
  db6.findById(3).age === 36
)