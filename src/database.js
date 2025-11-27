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
        const indexRecord = this.data.findIndex((element) => element.id == id);
        if (indexRecord === -1) return null;
        console.log(indexRecord);
        const deepCloneRecord = JSON.parse(JSON.stringify(this.findById(id)));
        const changesWithoutId = Object.fromEntries(Object.entries(changes).filter(([key, value]) => key !== 'id'));
        console.log(Object.keys(changesWithoutId));
        function modifierClef(objet, nomClef, nouvelleValeur) {
            for (let clef in objet) {
                if (clef === nomClef) {
                    objet[clef] = nouvelleValeur;
                } else if (typeof objet[clef] === 'object' && objet[clef] !== null) {
                    modifierClef(objet[clef], nomClef, nouvelleValeur);
                }
            }
        }
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

}

console.log("=== Test 1 : Modifier une seule propriété ===");
let db = new Database();
db.insert({ id: 1, name: "Alice", age: 30, adresse: { lane: "Avenue des Champs-Elysés", city: "Paris" } });
db.insert({ id: 2, name: "Bob", age: 25, adresse: { lane: "Rue Victor Hugo", city: "Lille" } });


console.log("Avant :", db.findById(1));
db.update(1, { age: 31 });
console.log("Après :", db.findById(1));
console.log("Age modifié ?", db.findById(1).age === 31);
console.log("Autres propriétés intactes ?",
    db.findById(1).name === "Alice" &&
    db.findById(1).adresse.lane === "Avenue des Champs-Elysés" &&
    db.findById(1).adresse.city === "Paris"
)
console.log("=== Test 2 : Modifier plusieurs sous-propriétés ===");
db = new Database();
db.insert({ id: 1, name: "Alice", age: 30, adresse: { lane: "Avenue des Champs-Elysés", city: "Paris" } });

console.log("Avant :", db.findById(1));
db.update(1, { city: "Lyon", lane: "Rue des Cardeurs" });
console.log("Après :", db.findById(1));
console.log("Lane modifiée ?", db.findById(1).adresse.lane === "Rue des Cardeurs");
console.log("City modifiée ?", db.findById(1).adresse.city === "Lyon");
console.log("Autres propriétés intactes ?",
    db.findById(1).name === "Alice" &&
    db.findById(1).age === 30
)
console.log("=== Test 3 : Modifier une propriété et une sous-propriété ===");
db = new Database();
db.insert({ id: 1, name: "Alice", age: 30, adresse: { lane: "Avenue des Champs-Elysés", city: "Paris" } });

console.log("Avant :", db.findById(1));
db.update(1, { age: 31, lane: "Rue des Cardeurs" });
console.log("Après :", db.findById(1));
console.log("Age modifié ?", db.findById(1).age === 31);
console.log("Lane modifiée ?", db.findById(1).adresse.lane === "Rue des Cardeurs");
console.log("Autre propriété intacte ?",
    db.findById(1).name === "Alice"
)