
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    const { data } = await supabase
        .from('prestadores')
        .select('empresa')
        .order('updated_at', { ascending: false })
        .limit(1);

    if (data && data.length) {
        console.log(`EMPRESA: '${data[0].empresa}'`);
    } else {
        console.log("NO_DATA");
    }
}
run();
