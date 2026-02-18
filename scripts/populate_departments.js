
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const groupsMapping = require('../data/id_control_groups.json');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function populate() {
    console.log("Starting Department Population...");

    // 1. Filter groups with idType: 0
    const departments = [];
    for (const name in groupsMapping) {
        if (groupsMapping[name].idType === 0) {
            departments.push({ nome: name });
        }
    }

    console.log(`Found ${departments.length} departments to import.`);

    // 2. Insert into Supabase (upsert by name)
    // Note: 'nome' must be unique or primary key for upsert to work like this without ID, 
    // but standard insert with ignore might be safer if we don't know constraints.
    // Let's try inserting one by one and ignoring errors for duplicates.

    let added = 0;
    let errors = 0;

    for (const dept of departments) {
        const { error } = await supabase
            .from('departamentos')
            .insert(dept) // .upsert(dept, { onConflict: 'nome' }) if unique constraint exists
            .select();

        if (error) {
            // Assume error is duplicate if code 23505 (unique_violation)
            if (error.code === '23505') {
                // console.log(`   Skipping duplicate: ${dept.nome}`);
            } else {
                console.error(`   ❌ Error adding ${dept.nome}:`, error.message);
                errors++;
            }
        } else {
            console.log(`   ✅ Added: ${dept.nome}`);
            added++;
        }
    }

    console.log(`\nImport Complete.`);
    console.log(`Added: ${added}`);
    console.log(`Errors/Skipped: ${errors}`);
}

populate();
