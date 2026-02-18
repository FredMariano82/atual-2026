
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspect() {
    console.log("Checking recent prestadores...");
    const { data, error } = await supabase
        .from('prestadores')
        .select(`id, nome, documento, status, empresa, updated_at`)
        .order('updated_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}

inspect();
