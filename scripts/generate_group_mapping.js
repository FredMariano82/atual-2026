
const fs = require('fs');
const path = require('path');

const dumpFile = path.resolve(__dirname, '../data/grupos_dump.json');
const mappingFile = path.resolve(__dirname, '../data/id_control_groups.json');

try {
    if (!fs.existsSync(dumpFile)) {
        console.error("Error: dump file not found:", dumpFile);
        process.exit(1);
    }

    const content = fs.readFileSync(dumpFile, 'utf8');
    const json = JSON.parse(content);

    // The structure seems to be { data: [...] } based on previous output
    let groups = [];
    if (Array.isArray(json)) {
        groups = json;
    } else if (json.data && Array.isArray(json.data)) {
        groups = json.data;
    } else {
        console.error("Error: Unexpected JSON structure. Expected array or object with 'data' array.");
        console.log("Keys found:", Object.keys(json));
        process.exit(1);
    }

    console.log(`Found ${groups.length} groups in dump.`);

    const mapping = {};
    let zugeFound = false;
    let comprasFound = false;

    groups.forEach(g => {
        if (g.name) {
            mapping[g.name] = {
                id: g.id,
                idType: g.idType
            };
            if (g.name === 'Zuge Geradores') zugeFound = true;
            if (g.name === 'Compras') comprasFound = true;
        }
    });

    console.log("Zuge Geradores found?", zugeFound);
    console.log("Compras found?", comprasFound);

    fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2));
    console.log("Mapping saved to:", mappingFile);

} catch (error) {
    console.error("Error processing dump file:", error);
}
