
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkLatestSeparate() {
    console.log("🔍 Buscando último prestador (Sepalado)...");

    // 1. Busca Prestador
    const { data: prestadores, error: errP } = await supabase
        .from('prestadores')
        .select('id, nome, documento, solicitacao_id')
        .order('id', { ascending: false })
        .limit(1);

    if (errP) { console.error("❌ Erro Prestador:", errP); return; }
    if (!prestadores.length) { console.log("Nenhum prestador."); return; }

    const p = prestadores[0];
    console.log(`🆕 Prestador: ${p.nome} (ID: ${p.id}, Solicitacao: ${p.solicitacao_id})`);

    // 2. Busca Solicitação
    if (p.solicitacao_id) {
        const { data: sol, error: errS } = await supabase
            .from('solicitacoes')
            .select('*') // Pega tudo pra ver as colunas reais
            .eq('id', p.solicitacao_id)
            .single();

        if (errS) {
            console.error("❌ Erro Solicitação:", errS);
        } else {
            console.log("✅ Solicitação encontrada:");
            console.log(`   Status: ${sol.status}`);
            console.log(`   Datas: ${sol.data_inicial} - ${sol.data_final}`);
            console.log("   Dump:", JSON.stringify(sol));
        }
    } else {
        console.log("⚠️ Sem solicitação ID.");
    }
}

checkLatestSeparate();
