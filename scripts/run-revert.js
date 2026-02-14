const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function runSql() {
    const sqlPath = path.join(__dirname, '22-reverter-migracao.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Split commands by semicolon to run individually if needed, or just try running as one block if supported
    // Supabase JS client doesn't have a direct "run raw sql" method for safety, 
    // but we can assume the user has access via the dashboard or we can try to use RPC if set up.
    // HOWEVER, for this specific task, since we are in a node environment with potential full access:

    // Actually, `postgres.js` or `pg` lib would be better, but we only have supabase-js.
    // We can try to use the `rpc` if there's a generic sql exec function (unlikely in prod).
    // ALTERNATIVE: We can just use the table methods to delete since the SQL is simple.

    console.log("EXECUTANDO LIMPEZA VIA SUPABASE JS (Delete)...");

    // 1. Delete prestadores
    const { error: err1, count: c1 } = await supabase
        .from('prestadores')
        .delete({ count: 'exact' })
        .in('solicitacao_id', (
            await supabase.from('solicitacoes').select('id').eq('numero', '2024-MIGRACAO').then(res => res.data.map(s => s.id))
        ));

    if (err1) console.error("Erro ao deletar prestadores:", err1);
    else console.log(`Prestadores deletados: ${c1}`);

    // 2. Delete solicitacoes
    const { error: err2, count: c2 } = await supabase
        .from('solicitacoes')
        .delete({ count: 'exact' })
        .eq('numero', '2024-MIGRACAO');

    if (err2) console.error("Erro ao deletar solicitacao:", err2);
    else console.log(`Solicitação deletada: ${c2}`);

    // 3. Delete migration user
    // Note: Can't delete from auth.users via client easily without service role key, 
    // but we can delete from public.usuarios
    const { error: err3 } = await supabase
        .from('usuarios')
        .delete()
        .like('email', 'migracao_%@sistema.com');

    if (err3) console.error("Erro ao deletar usuario publico:", err3);
    else console.log("Usuário público de migração deletado.");
}

runSql();
