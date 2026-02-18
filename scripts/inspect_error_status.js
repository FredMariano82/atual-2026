
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    console.log("Searching for ANY record with status 'erro_rg'...");
    const { data, error } = await supabase
        .from('prestadores')
        .select('id, nome, documento, status, updated_at')
        .eq('status', 'erro_rg');

    if (error) {
        console.error(error);
        return;
    }

    if (data.length === 0) {
        console.log("No 'erro_rg' records found.");
    } else {
        console.log(`Found ${data.length} 'erro_rg' records.`);
        data.forEach(p => {
            console.log(`ID: ${p.id}, Nome: ${p.nome}, RG: ${p.documento}, Updated: ${p.updated_at}`);
        });
    }

    // Also check the specific ID from previous run if partial
    console.log("\nChecking ID starting with 4b36cbfe...");
    const { data: specific } = await supabase
        .from('prestadores')
        .select('id, nome, documento, status, updated_at')
        .like('id', '4b36cbfe%'); // Check valid syntax

    if (specific) {
        specific.forEach(p => {
            console.log(`ID: ${p.id}, Nome: ${p.nome}, RG: ${p.documento}, Status: '${p.status}', Updated: ${p.updated_at}`);
        });
    }
}
run();
