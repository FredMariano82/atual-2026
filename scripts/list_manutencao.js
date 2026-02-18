
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function list() {
    console.log("Searching for 'Manutenção'...");
    const { data, error } = await supabase
        .from('departamentos')
        .select('nome')
        .ilike('nome', '%Manuten%')
        .order('nome');

    if (error) {
        console.error("Error:", error);
    } else {
        console.log(`Found ${data.length} departments:`);
        data.forEach(d => console.log(`- ${d.nome}`));
    }
}

list();
