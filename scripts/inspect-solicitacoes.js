
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspectSolicitacoes() {
    console.log("🔍 Inspecionando colunas de 'solicitacoes'...");
    const { data, error } = await supabase.from('solicitacoes').select('*').limit(1);

    if (error) {
        console.error("❌ Erro:", error.message);
        return;
    }

    if (data && data.length > 0) {
        console.log("✅ Colunas (JSON):");
        console.log(JSON.stringify(Object.keys(data[0]), null, 2));
    } else {
        console.log("⚠️ Tabela vazia.");
    }
}
inspectSolicitacoes();
