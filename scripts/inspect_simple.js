
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    const { data } = await supabase
        .from('prestadores')
        .select('nome, documento, status, observacoes, updated_at')
        .order('updated_at', { ascending: false })
        .limit(1);

    if (data && data.length) {
        console.log("FINAL_STATUS:" + JSON.stringify(data[0], null, 2));
    } else {
        console.log("NO_DATA");
    }
}
run();
