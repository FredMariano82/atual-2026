
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testQuery() {
    console.log("Testing fetch all departments...");
    const { data: deps, error: errDeps } = await supabase
        .from('departamentos')
        .select('id, nome');

    if (errDeps) {
        console.error("Error fetching deps:", errDeps);
    } else {
        console.log(`Fetched ${deps.length} departments.`);
        console.log("Sample:", deps.slice(0, 3));
    }

    console.log("Testing prestadores fetch...");
    const { data: prest, error: errPrest } = await supabase
        .from('prestadores')
        .select('id, nome, empresa, departamento_id')
        .limit(5);

    if (errPrest) {
        console.error("Error fetching prestadores:", errPrest);
    } else {
        console.log("Sample prestadores:", prest);
    }
}

testQuery();
