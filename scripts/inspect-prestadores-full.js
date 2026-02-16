
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspectPrestadores() {
    console.log("🔍 Inspecionando colunas de 'prestadores'...");
    const { data, error } = await supabase.from('prestadores').select('*').limit(1);

    if (data && data.length > 0) {
        console.log("✅ Colunas (JSON):");
        console.log(JSON.stringify(Object.keys(data[0]), null, 2));
    } else {
        console.log("⚠️ Tabela vazia.");
    }
}
inspectPrestadores();
