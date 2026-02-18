
const groups = require('../data/id_control_groups.json');

console.log("Checking for 'Manutenção' groups in mapping...");

const manuten = [];
for (const key in groups) {
    if (key.includes('Manuten')) {
        manuten.push({
            name: key,
            id: groups[key].id,
            type: groups[key].idType
        });
    }
}

manuten.sort((a, b) => a.name.localeCompare(b.name));

console.log(`Found ${manuten.length} groups:`);
manuten.forEach(m => {
    console.log(`- ${m.name}: ID ${m.id} (Type ${m.type})`);
});
