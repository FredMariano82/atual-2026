const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    const { data: sol, error: solErr } = await supabase
        .from('solicitacoes')
        .select('id, numero, status_geral')
        .eq('numero', '2024-MIGRACAO');

    if (solErr) console.error("Erro solicitacao:", solErr);
    else console.log("Solicitação Migração:", sol);

    const { count, error: countErr } = await supabase
        .from('prestadores')
        .select('*', { count: 'exact', head: true });

    if (countErr) console.error("Erro count prestadores:", countErr);
    else console.log("Total Prestadores:", count);
}

check();
