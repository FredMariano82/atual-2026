
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    const { data } = await supabase
        .from('prestadores')
        .select('id, nome, documento, status, observacoes, updated_at')
        .eq('documento', '56996') // RG found earlier
        .order('updated_at', { ascending: false });

    if (data && data.length) {
        console.log("DUPLICATES:" + JSON.stringify(data, null, 2));
    } else {
        console.log("NO_DATA");
    }
}
run();
