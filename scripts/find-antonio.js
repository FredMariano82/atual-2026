
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase
        .from('prestadores')
        .select('*')
        .ilike('nome', '%Antonio Luiz%');

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(`Found ${data.length} records.`);
    data.forEach(p => {
        console.log(`ID: ${p.id} | Name: ${p.nome} | Doc: ${p.documento} | Doc2: ${p.documento2} | Status: ${p.status}`);
    });
}

run();
