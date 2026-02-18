
const fs = require('fs');
const path = require('path');

const groups = require('../data/id_control_groups.json');
const names = Object.keys(groups).sort();

fs.writeFileSync('all_group_names.txt', names.join('\n'));
console.log(`Saved ${names.length} names to all_group_names.txt`);
