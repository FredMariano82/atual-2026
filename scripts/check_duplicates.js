
const fs = require('fs');
const path = require('path');

const dumpFile = path.resolve(__dirname, '../data/grupos_dump.json');
const content = fs.readFileSync(dumpFile, 'utf8');
const json = JSON.parse(content);
const groups = Array.isArray(json) ? json : (json.data || []);

const nameCounts = {};
const duplicates = [];

groups.forEach(g => {
    if (g.name) {
        if (!nameCounts[g.name]) {
            nameCounts[g.name] = [];
        }
        nameCounts[g.name].push({ id: g.id, idType: g.idType });
    }
});

for (const name in nameCounts) {
    if (nameCounts[name].length > 1) {
        duplicates.push({ name, variants: nameCounts[name] });
    }
}

console.log(`Found ${duplicates.length} duplicate names.`);
if (duplicates.length > 0) {
    console.log(JSON.stringify(duplicates, null, 2));
}

// Check specifically for "Patrimônio"
const patrimonio = groups.filter(g => g.name === 'Patrimônio' || g.name === 'Patrimonio');
console.log("Patrimônio entries:", patrimonio);
