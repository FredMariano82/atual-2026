
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    console.log("Checking RG 56996...");
    const { data, error } = await supabase
        .from('prestadores')
        .select('id, nome, status, updated_at')
        .eq('documento', '56996')
        .order('updated_at', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Found ${data.length} records.`);
    data.forEach((p, i) => {
        console.log(`Record ${i}: ID=${p.id}, Status='${p.status}', Updated=${p.updated_at}`);
    });
}
run();
