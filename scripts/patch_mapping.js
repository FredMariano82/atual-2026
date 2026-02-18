
const fs = require('fs');
const path = require('path');

const mappingFile = path.resolve(__dirname, '../data/id_control_groups.json');
const mapping = require(mappingFile);

// Find Patrimônio Adm
let admId = null;
let admType = null;

if (mapping['Patrimônio Adm']) {
    admId = mapping['Patrimônio Adm'].id;
    admType = mapping['Patrimônio Adm'].idType;
    console.log(`Found "Patrimônio Adm": ID ${admId}, Type ${admType}`);
} else {
    // Search case-insensitive
    for (const key in mapping) {
        if (key.toLowerCase().includes('patrim')) {
            console.log(`Potential match: "${key}" -> ID ${mapping[key].id}`);
            if (key === 'Patrimônio Adm') {
                admId = mapping[key].id;
                admType = mapping[key].idType;
            }
        }
    }
}

if (admId) {
    // Add aliases
    mapping['Patrimônio'] = { id: admId, idType: admType };
    mapping['Patrimonio'] = { id: admId, idType: admType };
    console.log("Added aliases for Patrimônio.");

    fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));
    console.log("Mapping updated.");
} else {
    console.error("Could not find source group 'Patrimônio Adm'.");
}
