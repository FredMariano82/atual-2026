
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspectColumns() {
    console.log("🔍 Inspecionando colunas da tabela 'prestadores'...");

    // Tentar pegar um registro qualquer para ver as chaves
    const { data, error } = await supabase
        .from('prestadores')
        .select('*')
        .limit(1);

    if (error) {
        console.error("❌ Erro:", error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log("✅ Colunas encontradas:");
        console.log(Object.keys(data[0]).join(', '));
    } else {
        console.log("⚠️ Tabela vazia ou erro de acesso.");
    }
}

inspectColumns();
