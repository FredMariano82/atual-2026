
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspectLigia() {
    console.log("🔍 Inspecionando dados completos da LIGIA...");
    const { data: ligias, error } = await supabase
        .from('prestadores')
        .select(`
            id, nome, empresa, 
            status, 
            solicitacao_id, 
            created_at,
            integrado_id_control, id_control_id
        `)
        .ilike('nome', '%Ligia%');

    if (error) console.error("❌ Erro:", error);
    else {
        if (ligias.length === 0) console.log("⚠️ Nenhuma Ligia encontrada.");
        else {
            ligias.forEach(l => {
                console.log("--------------------------------------------------");
                console.log(`Nome: ${l.nome}`);
                console.log(`Empresa: ${l.empresa}`);
                console.log(`Status: ${l.status}`);
                console.log(`ID: ${l.id}`);
                console.log(`Solicitacao ID: ${l.solicitacao_id}`);
                console.log(`Criado em: ${l.created_at}`);
                console.log(`INTEGRADO: ${l.integrado_id_control}`);
                console.log(`ID Control ID: ${l.id_control_id}`);
            });
        }
    }
}
inspectLigia();
