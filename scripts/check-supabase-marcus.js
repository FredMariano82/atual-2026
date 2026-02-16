
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkMarcusSupabase() {
    console.log("🔍 Verificando datas do Marcus no Supabase...");

    // Buscar pelo Marcus
    const { data, error } = await supabase
        .from('prestadores')
        .select(`
            id,
            nome,
            solicitacao_id,
            solicitacoes:solicitacao_id (
                *
            )
        `)
        .ilike('nome', '%Marcus Marcus Marcus%');

    if (error) {
        console.error("❌ Erro:", error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log("⚠️ Marcus não encontrado no Supabase.");
        return;
    }

    const marcus = data[0];
    console.log(`\n📋 Registro Encontrado: ${marcus.nome}`);
    console.log(`   ID Supabase: ${marcus.id}`);

    if (marcus.solicitacoes) {
        console.log(`   📅 Data Inicial: ${marcus.solicitacoes.data_inicial}`);
        console.log(`   📅 Data Final:   ${marcus.solicitacoes.data_final}`);
        console.log(`   ℹ️ Status:       ${marcus.solicitacoes.status}`);

        // Verificação extra do tipo/raw
        console.log(`\n   🛠️ RAW (JSON):`);
        console.log(JSON.stringify(marcus.solicitacoes, null, 2));
    } else {
        console.log("⚠️ Sem solicitação vinculada (datas vazias).");
    }
}

checkMarcusSupabase();
