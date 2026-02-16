
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function findLatestSimple() {
    console.log("🔍 Buscando o NOVO PROJETO (Prestador) mais recente...");

    // 1. Pega o último prestador criado
    const { data: prestadores, error: erroPrest } = await supabase
        .from('prestadores')
        .select('*') // Pega TUDO pra não ter erro de coluna
        .order('id', { ascending: false })
        .limit(1);

    if (erroPrest) {
        console.error("❌ Erro ao buscar prestador:", erroPrest.message);
        return;
    }

    if (!prestadores || prestadores.length === 0) {
        console.log("⚠️ Nenhum prestador encontrado.");
        return;
    }

    const p = prestadores[0];
    console.log(`✅ ENCONTRADO: ${p.nome} (ID: ${p.id})`);
    console.log(`   Documento: ${p.documento}`);
    console.log(`   Solicitação ID: ${p.solicitacao_id}`);

    // 2. Se tiver solicitação, busca ela separadamente
    if (p.solicitacao_id) {
        const { data: sol, error: erroSol } = await supabase
            .from('solicitacoes')
            .select('*')
            .eq('id', p.solicitacao_id)
            .single();

        if (erroSol) {
            console.error("❌ Erro ao buscar solicitação:", erroSol.message);
        } else {
            console.log(`\n📄 DADOS DA SOLICITAÇÃO:`);
            console.log(`   Status: ${sol.status}`);
            console.log(`   Início: ${sol.data_inicial}`);
            console.log(`   Fim:    ${sol.data_final}`);
        }
    } else {
        console.log("⚠️ Esse prestador não tem solicitação vinculada.");
    }
}

findLatestSimple();
