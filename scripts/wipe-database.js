
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Tentar Service Role Key (se existir) para bypass RLS, senão Anon Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function wipeDatabase() {
    console.log("🧹 Iniciando limpeza do banco de dados...");

    // Limpar Prestadores (Cascade deve apagar solicitacoes, mas por segurança apago também)
    // Se não tiver cascade, preciso apagar solicitacoes primeiro se tiver FK.
    // Assumindo que prestadores é a tabela "raiz" ou solicitacoes é a raiz.
    // Geralmente: Solicitacao -> Prestador (Solicitacao tem usuario_id?)
    // Ou Prestador -> Solicitacao (Prestador tem solicitacao_id?)
    // No script de sync vimos: prestadores.solicitacao_id. Então prestador aponta pra solicitacao.
    // Logo, se eu apagar solicitacao, o prestador fica órfão ou some (se cascade).
    // Se eu apagar prestador, a solicitacao fica.

    // Ordem segura: Apagar Prestadores, depois Solicitacoes.

    // 1. Apagar Prestadores (Assumindo que tem created_at)
    console.log("   - Apagando Prestadores...");
    const { error: errPrest } = await supabase
        .from('prestadores')
        .delete()
        .gt('created_at', '1970-01-01');

    if (errPrest) console.error("❌ Erro Prestadores:", errPrest.message);
    else console.log("   ✅ Prestadores limpos.");

    // 2. Apagar Solicitacoes
    console.log("   - Apagando Solicitacoes...");
    const { error: errSol } = await supabase
        .from('solicitacoes')
        .delete()
        .gt('created_at', '1970-01-01');

    if (errSol) {
        // Se created_at não existir, tenta id não nulo (se for int)
        console.error("❌ Erro Solicitacoes (Tentando filtro alternativo):", errSol.message);
        const { error: errSol2 } = await supabase
            .from('solicitacoes')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // UUID

        if (errSol2) console.error("❌ Erro Solicitacoes Final:", errSol2.message);
        else console.log("   ✅ Solicitacoes limpas (Via ID).");
    } else {
        console.log("   ✅ Solicitacoes limpas.");
    }

    console.log("✨ Limpeza concluída!");
}

wipeDatabase();
