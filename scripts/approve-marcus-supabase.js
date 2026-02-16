
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function approveMarcus() {
    console.log("🚀 Aprovando Marcus no Supabase...");

    // Buscar ID da solicitação do Marcus
    const { data: prestadores, error: searchError } = await supabase
        .from('prestadores')
        .select('solicitacao_id, nome')
        .ilike('nome', '%Marcus Marcus Marcus%');

    if (searchError || !prestadores.length) {
        console.error("❌ Erro ao achar Marcus:", searchError?.message || "Não encontrado");
        return;
    }

    const { solicitacao_id } = prestadores[0];
    console.log(`   Solicitação ID: ${solicitacao_id}`);

    // Atualizar status para 'aprovado'
    const { error: updateError } = await supabase
        .from('solicitacoes')
        .update({ status: 'aprovado' })
        .eq('id', solicitacao_id);

    if (updateError) {
        console.error("❌ Erro ao atualizar:", updateError.message);
    } else {
        console.log("✅ Sucesso! Marcus agora está 'aprovado' e pronto para sync.");
    }
}

approveMarcus();
