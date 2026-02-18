
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testQuery() {
    console.log("Testing nested query...");
    const { data, error } = await supabase
        .from('prestadores')
        .select(`
            id, nome, empresa,
            solicitacoes (
                id,
                departamento_id,
                departamentos ( nome )
            )
        `)
        .limit(2);

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Data:", JSON.stringify(data, null, 2));
    }
}

testQuery();
