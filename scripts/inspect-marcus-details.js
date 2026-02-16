
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspectMarcus() {
    console.log("🔍 Buscando 'Marcus' no Supabase...");

    // Busca aproximada por nome
    const { data, error } = await supabase
        .from('prestadores')
        .select(`
            *,
            solicitacoes:solicitacao_id (
                *
            )
        `)
        .ilike('nome', '%Marcus%');

    if (error) {
        console.error("❌ Erro:", error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log("⚠️ Nenhum 'Marcus' encontrado.");
        return;
    }

    const fs = require('fs');
    fs.writeFileSync('marcus_dump.json', JSON.stringify(data, null, 2));
    console.log("✅ Dados salvos em 'marcus_dump.json'");
}

inspectMarcus();
