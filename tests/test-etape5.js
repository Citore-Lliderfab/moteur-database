class Database {

    constructor() {
        this.data = []
    }

    insert(record) {
        record.delete = false;
        if (this.getDeleted().find((recordDelete) => recordDelete.id === record.id)) {
            Object.assign(this.getDeleted().find((recordDelete) => recordDelete.id === record.id), record)
            return
        }
        this.data.push(record);
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

    deleteSoft(id) {
        const nbIniData = this.getAll().filter((record) => record.delete !== true).length;
        this.data.forEach((record) => { if (record.id === id) record.delete = true });
        const nbFinData = this.getAll().filter((record) => record.delete !== true).length;
        const nbDeletedRecords = nbIniData - nbFinData;
        return nbDeletedRecords
    }

    getActive() {
        return this.getAll().filter((record) => record.delete === false)
    }

    getDeleted() {
        return this.getAll().filter((record) => record.delete === true)
    }

}

console.log("=== Test 1 : Suppression simple ===");
const db = new Database();
db.insert({ id: 1, name: "Alice", age: 30 });
db.insert({ id: 2, name: "Bob", age: 25 });
db.insert({ id: 3, name: "Charlie", age: 35 });

console.log("Nombre avant :", db.getActive().length);
console.log("Enregistrement supprimé :", db.deleteSoft(2));
console.log("Nombre après :", db.getActive().length);
console.log("Bob supprimé ?", db.findById(2).delete === true);
console.log("Alice toujours là ?", db.findById(1).delete === false);
console.log("Charlie toujours là ?", db.findById(3).delete === false);

console.log("\n=== Test 2 : Supprimer le premier élément ===");
const db2 = new Database();
db2.insert({ id: 1, name: "Premier", age: 20 });
db2.insert({ id: 2, name: "Deuxième", age: 30 });
db2.insert({ id: 3, name: "Troisième", age: 40 });

console.log("Enregistrement supprimé :", db2.deleteSoft(1));
console.log("Nombre restant :", db2.getActive().length);
console.log("Premier supprimé ?", db2.findById(1).delete === true);
console.log("Les autres toujours là ?",
    db2.getActive().length === 2 &&
    db2.findById(2).delete === false &&
    db2.findById(3).delete === false
);

console.log("\n=== Test 3 : Supprimer le dernier élément ===");
const db3 = new Database();
db3.insert({ id: 1, name: "Un", age: 20 });
db3.insert({ id: 2, name: "Deux", age: 30 });
db3.insert({ id: 3, name: "Trois", age: 40 });

console.log("Enregistrement supprimé :", db3.deleteSoft(3));
console.log("Nombre restant :", db3.getActive().length);
console.log("Dernier supprimé ?", db3.findById(3).delete === true);

console.log("\n=== Test 4 : Supprimer un ID inexistant ===");
const db4 = new Database();
db4.insert({ id: 1, name: "Alice", age: 30 });
db4.insert({ id: 2, name: "Bob", age: 25 });

const nombreAvant = db4.getActive().length;
console.log("Enregistrement supprimé :", db4.deleteSoft(999));
const nombreApres = db4.getActive().length;

console.log("Nombre avant :", nombreAvant);
console.log("Nombre après :", nombreApres);
console.log("Rien n'a été supprimé ?", nombreAvant === nombreApres);

console.log("\n=== Test 5 : Suppressions successives ===");
const db5 = new Database();
db5.insert({ id: 1, name: "Un", age: 20 });
db5.insert({ id: 2, name: "Deux", age: 30 });
db5.insert({ id: 3, name: "Trois", age: 40 });
db5.insert({ id: 4, name: "Quatre", age: 50 });

console.log("Nombre initial :", db5.getActive().length, "C'est bien 4 ?", db5.getAll().length === db5.getActive().length);
console.log("Enregistrement supprimé :", db5.deleteSoft(2));
console.log("Après première suppression :")
console.log("Actifs :", db5.getActive().length);
console.log("Supprimés :", db5.getDeleted().length);
console.log("Enregistrement supprimé :", db5.deleteSoft(4));
console.log("Après deuxième suppression :");
console.log("Actifs :", db5.getActive().length);
console.log("Supprimés :", db5.getDeleted().length);
console.log("Enregistrement supprimé :", db5.deleteSoft(1));
console.log("Après troisième suppression :");
console.log("Actifs :", db5.getActive().length);
console.log("Supprimés :", db5.getDeleted().length);

console.log("Il reste seulement le 3 ?",
    db5.getActive().length === 1 &&
    db5.findById(3).delete === false
);

console.log("\n=== Test 6 : Supprimer tous les éléments un par un ===");
const db6 = new Database();
db6.insert({ id: 1, name: "A", age: 20 });
db6.insert({ id: 2, name: "B", age: 30 });

console.log("Enregistrement supprimé :", db6.deleteSoft(1));
console.log("Enregistrement supprimé :", db6.deleteSoft(2));

console.log("Base des actifs vide ?", db6.getActive().length === 0);

console.log("\n=== Test 7 : Supprimer puis insérer à nouveau ===");
const db7 = new Database();
db7.insert({ id: 1, name: "Alice", age: 30 });

console.log("Enregistrement supprimé :", db7.deleteSoft(1));
console.log("Supprimé ?", db7.findById(1).delete === true);
console.log("Base des actifs :", db7.getActive());
console.log("Base des supprimés :", db7.getDeleted());

db7.insert({ id: 1, name: "Alice", age: 31 });
console.log("Réinséré ?", db7.findById(1).delete === false);
console.log("Nouvel âge ?", db7.findById(1).age === 31);
console.log("Base des actifs :", db7.getActive());