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

    delete(id) {
        const nbData = this.getAll().length;
        const newData = this.data.filter((record) => record.id !== id);
        this.data = newData;
        if (this.getAll().length !== nbData && !this.findById(id)) { return true } else return false
    }
}

console.log("=== Test 1 : Suppression simple ===");
const db = new Database();
db.insert({ id: 1, name: "Alice", age: 30 });
db.insert({ id: 2, name: "Bob", age: 25 });
db.insert({ id: 3, name: "Charlie", age: 35 });

console.log("Nombre avant :", db.getAll().length);
db.delete(2);
console.log("Nombre après :", db.getAll().length);
console.log("Bob supprimé ?", db.findById(2) === undefined);
console.log("Alice toujours là ?", db.findById(1) !== undefined);
console.log("Charlie toujours là ?", db.findById(3) !== undefined);

console.log("\n=== Test 2 : Supprimer le premier élément ===");
const db2 = new Database();
db2.insert({ id: 1, name: "Premier", age: 20 });
db2.insert({ id: 2, name: "Deuxième", age: 30 });
db2.insert({ id: 3, name: "Troisième", age: 40 });

db2.delete(1);
console.log("Nombre restant :", db2.getAll().length);
console.log("Premier supprimé ?", db2.findById(1) === undefined);
console.log("Les autres toujours là ?", 
  db2.getAll().length === 2 &&
  db2.findById(2) !== undefined &&
  db2.findById(3) !== undefined
);

console.log("\n=== Test 3 : Supprimer le dernier élément ===");
const db3 = new Database();
db3.insert({ id: 1, name: "Un", age: 20 });
db3.insert({ id: 2, name: "Deux", age: 30 });
db3.insert({ id: 3, name: "Trois", age: 40 });

db3.delete(3);
console.log("Nombre restant :", db3.getAll().length);
console.log("Dernier supprimé ?", db3.findById(3) === undefined);

console.log("\n=== Test 4 : Supprimer un ID inexistant ===");
const db4 = new Database();
db4.insert({ id: 1, name: "Alice", age: 30 });
db4.insert({ id: 2, name: "Bob", age: 25 });

const nombreAvant = db4.getAll().length;
db4.delete(999);
const nombreApres = db4.getAll().length;

console.log("Nombre avant :", nombreAvant);
console.log("Nombre après :", nombreApres);
console.log("Rien n'a été supprimé ?", nombreAvant === nombreApres);

console.log("\n=== Test 5 : Suppressions successives ===");
const db5 = new Database();
db5.insert({ id: 1, name: "Un", age: 20 });
db5.insert({ id: 2, name: "Deux", age: 30 });
db5.insert({ id: 3, name: "Trois", age: 40 });
db5.insert({ id: 4, name: "Quatre", age: 50 });

console.log("Nombre initial :", db5.getAll().length);
db5.delete(2);
console.log("Après suppression 1 :", db5.getAll().length);
db5.delete(4);
console.log("Après suppression 2 :", db5.getAll().length);
db5.delete(1);
console.log("Après suppression 3 :", db5.getAll().length);

console.log("Il reste seulement le 3 ?", 
  db5.getAll().length === 1 &&
  db5.findById(3) !== undefined
);

console.log("\n=== Test 6 : Supprimer tous les éléments un par un ===");
const db6 = new Database();
db6.insert({ id: 1, name: "A", age: 20 });
db6.insert({ id: 2, name: "B", age: 30 });

db6.delete(1);
db6.delete(2);

console.log("Base vide ?", db6.getAll().length === 0);

console.log("\n=== Test 7 : Supprimer puis insérer à nouveau ===");
const db7 = new Database();
db7.insert({ id: 1, name: "Alice", age: 30 });

db7.delete(1);
console.log("Supprimé ?", db7.findById(1) === undefined);

db7.insert({ id: 1, name: "Alice", age: 31 });
console.log("Réinséré ?", db7.findById(1) !== undefined);
console.log("Nouvel âge ?", db7.findById(1).age === 31);