
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkLatest() {
    console.log("🔍 Buscando último prestador criado...");

    // Ordenar por ID decrescente (ou created_at se tiver)
    const { data, error } = await supabase
        .from('prestadores')
        .select(`
            id, nome, documento,
            solicitacao_id,
            solicitacoes:solicitacao_id ( status, data_inicial, data_final )
        `)
        .order('id', { ascending: false })
        .limit(1);

    if (error) { console.error(error); return; }
    if (!data.length) { console.log("Nenhum registro."); return; }

    const p = data[0];
    console.log(`🆕 Último Registro: ${p.nome} (Doc: ${p.documento})`);
    console.log(`   Status: ${p.solicitacoes?.status}`);
    console.log(`   Datas: ${p.solicitacoes?.data_inicial} - ${p.solicitacoes?.data_final}`);
}

checkLatest();
