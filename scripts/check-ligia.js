
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkLigia() {
    console.log("🔍 Buscando LIGIA...");
    const { data: ligias, error } = await supabase
        .from('prestadores')
        .select(`
            nome, documento, 
            integrado_id_control, id_control_id, data_integracao
        `)
        .ilike('nome', '%Ligia%');

    if (error) console.error("❌ Erro:", error);
    else {
        if (ligias.length === 0) console.log("⚠️ Nenhuma Ligia encontrada.");
        else console.table(ligias);
    }
}
checkLigia();
